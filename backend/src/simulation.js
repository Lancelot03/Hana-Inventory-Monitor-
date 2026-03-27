import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db;

const CATEGORIES = ['Chemicals', 'Packaging', 'Spare Parts', 'Raw Material', 'Finished Good'];

function categoryForMaterial(materialId) {
  return CATEGORIES[Number(materialId.slice(-1)) % CATEGORIES.length];
}

export async function initSimulationDb() {
  db = await open({
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE inventory (
      material TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      plant TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const plants = ['1000', '1100', '1200', '1300', '1400'];
  const now = new Date().toISOString();

  const stmt = await db.prepare(
    'INSERT INTO inventory (material, description, category, plant, quantity, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  );

  for (let i = 1; i <= 25; i += 1) {
    const material = `MAT-${String(i).padStart(4, '0')}`;
    const description = `Global Material ${i}`;
    const category = categoryForMaterial(material);

    for (const plant of plants) {
      const quantity = Math.floor(250 + Math.random() * 5000);
      await stmt.run(material, description, category, plant, quantity, now);
    }
  }

  await stmt.finalize();
}

export async function tickSimulation() {
  const entries = await db.all('SELECT rowid, quantity FROM inventory');
  const now = new Date().toISOString();

  const updateStmt = await db.prepare('UPDATE inventory SET quantity = ?, updated_at = ? WHERE rowid = ?');
  for (const row of entries) {
    const delta = Math.floor(Math.random() * 120) - 60;
    const nextQty = Math.max(0, row.quantity + delta);
    await updateStmt.run(nextQty, now, row.rowid);
  }
  await updateStmt.finalize();
}

export async function getSimulationAggregates() {
  const materials = await db.all(`
    WITH material_rollup AS (
      SELECT
        material,
        description,
        category,
        SUM(quantity) AS total_quantity,
        MAX(updated_at) AS updated_at
      FROM inventory
      GROUP BY material, description, category
    ), ranked AS (
      SELECT
        material,
        description,
        category,
        total_quantity,
        updated_at,
        DENSE_RANK() OVER (ORDER BY total_quantity DESC) AS stock_rank
      FROM material_rollup
    )
    SELECT material, description, category, total_quantity, updated_at, stock_rank
    FROM ranked
    ORDER BY total_quantity DESC;
  `);

  const categories = await db.all(`
    SELECT
      category,
      SUM(quantity) AS total_units,
      COUNT(DISTINCT material) AS sku_count
    FROM inventory
    GROUP BY category
    ORDER BY total_units DESC;
  `);

  return {
    materials: materials.map((m) => ({
      material: m.material,
      description: m.description,
      category: m.category,
      totalQuantity: m.total_quantity,
      updatedAt: m.updated_at,
      lowStock: m.total_quantity < 500,
      stockRank: m.stock_rank,
    })),
    categories: categories.map((c) => ({
      category: c.category,
      totalUnits: c.total_units,
      skuCount: c.sku_count,
    })),
  };
}
