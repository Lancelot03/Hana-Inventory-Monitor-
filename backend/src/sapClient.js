import axios from 'axios';
import { config } from './config.js';

function normalizeODataStock(record) {
  const material = record.Material || record.MATERIAL || record.material || 'UNKNOWN';
  const category =
    record.MaterialGroup ||
    record.MaterialType ||
    record.MaterialBaseUnit ||
    record.Category ||
    'Uncategorized';

  return {
    material,
    description:
      record.MaterialName ||
      record.ProductDescription ||
      record.MaterialDescription ||
      material,
    category,
    plant: record.Plant || record.WERKS || 'N/A',
    quantity: Number(record.MatlWrhsStkQtyInMatlBaseUnit || record.Quantity || record.LABST || 0),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchSapStock() {
  const plantsFilter =
    config.sapPlants.length > 0
      ? config.sapPlants.map((plant) => `Plant eq '${plant}'`).join(' or ')
      : '';

  const params = {
    $format: 'json',
    $top: 5000,
  };

  if (config.sapClient) {
    params['sap-client'] = config.sapClient;
  }

  if (plantsFilter) {
    params.$filter = plantsFilter;
  }

  const url = `${config.sapUrl.replace(/\/$/, '')}/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod`;

  const response = await axios.get(url, {
    params,
    auth: {
      username: config.sapUsername,
      password: config.sapPassword,
    },
    headers: {
      Accept: 'application/json',
    },
    timeout: 10000,
  });

  const rows = response.data?.d?.results || response.data?.value || [];
  return rows.map(normalizeODataStock);
}

export function aggregateGlobal(records) {
  const materialMap = new Map();
  const categoryMap = new Map();

  for (const item of records) {
    const mKey = `${item.material}::${item.category}`;
    if (!materialMap.has(mKey)) {
      materialMap.set(mKey, {
        material: item.material,
        description: item.description,
        category: item.category,
        totalQuantity: 0,
        updatedAt: item.updatedAt,
      });
    }

    const mat = materialMap.get(mKey);
    mat.totalQuantity += item.quantity;
    mat.updatedAt = item.updatedAt;

    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, {
        category: item.category,
        totalUnits: 0,
        skuSet: new Set(),
      });
    }

    const cat = categoryMap.get(item.category);
    cat.totalUnits += item.quantity;
    cat.skuSet.add(item.material);
  }

  const materials = [...materialMap.values()]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .map((m, idx) => ({
      ...m,
      lowStock: m.totalQuantity < 500,
      stockRank: idx + 1,
    }));

  const categories = [...categoryMap.values()]
    .map((c) => ({
      category: c.category,
      totalUnits: c.totalUnits,
      skuCount: c.skuSet.size,
    }))
    .sort((a, b) => b.totalUnits - a.totalUnits);

  return { materials, categories };
}
