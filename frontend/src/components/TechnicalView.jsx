const amdp = `CLASS zcl_inventory_amdp DEFINITION
  PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS get_global_stock
      IMPORTING iv_client TYPE mandt
      EXPORTING et_data   TYPE ztt_stock.
ENDCLASS.

METHOD get_global_stock BY DATABASE PROCEDURE
  FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.
  et_data =
    SELECT material,
           category,
           SUM(quantity) AS total_qty,
           DENSE_RANK() OVER (ORDER BY SUM(quantity) DESC) AS rank
      FROM zstock_fact
     WHERE mandt = :iv_client
     GROUP BY material, category;
ENDMETHOD.`;

const cds = `@AbapCatalog.sqlViewName: 'ZV_GSTOCK'
@Analytics.dataCategory: #CUBE
define view ZC_GlobalStock as
  select from I_MaterialStock
{
  key Material,
  key MaterialGroup as Category,
      sum(MatlWrhsStkQtyInMatlBaseUnit) as TotalQty,
      count(distinct Plant) as PlantCount
}
where IsMarkedForDeletion = ''
group by Material, MaterialGroup`;

export default function TechnicalView() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded border border-ink/30 bg-panel p-4 shadow-grid">
        <h3 className="mb-2 text-sm font-semibold uppercase">ABAP AMDP (Simulated)</h3>
        <pre className="overflow-auto text-[11px] leading-relaxed">{amdp}</pre>
      </article>
      <article className="rounded border border-ink/30 bg-panel p-4 shadow-grid">
        <h3 className="mb-2 text-sm font-semibold uppercase">CDS View (Simulated)</h3>
        <pre className="overflow-auto text-[11px] leading-relaxed">{cds}</pre>
      </article>
    </section>
  );
}
