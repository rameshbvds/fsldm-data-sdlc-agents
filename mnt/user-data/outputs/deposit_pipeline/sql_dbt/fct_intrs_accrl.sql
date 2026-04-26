{{ config(materialized='incremental', unique_key=['dpos_agmt_id','accrl_dt'], on_schema_change='sync_all_columns') }}

WITH accrl AS (
    SELECT * FROM {{ source('core_banking_ods', 'dpos_intrs_accrl') }}
    WHERE  revrs_ind <> 'Y'
),
cumul AS (
    SELECT
        dpos_agmt_id, accrl_dt, accrl_amt,
        SUM(accrl_amt) OVER (
            PARTITION BY dpos_agmt_id, DATE_TRUNC('month', accrl_dt)
            ORDER BY accrl_dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumul_accrl_amt_mtd,
        SUM(accrl_amt) OVER (
            PARTITION BY dpos_agmt_id, DATE_TRUNC('year', accrl_dt)
            ORDER BY accrl_dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumul_accrl_amt_ytd
    FROM   accrl
)
SELECT
    ac.dpos_agmt_id, ac.accrl_dt,
    a.prty_id, a.prod_id, a.dpos_typ_cd,
    ac.accrl_amt, ac.effctv_intrst_rt,
    ac.accrl_mthd_cd, ac.days_accrd_cnt,
    ac.accrl_amt                                     AS gross_accrl_amt,
    COALESCE(ac.tax_wthhd_amt, 0)                    AS tax_wthhd_amt,
    ac.accrl_amt - COALESCE(ac.tax_wthhd_amt, 0)    AS net_accrl_amt,
    ac.islm_prft_amt, ac.crncy_cd, ac.revrs_ind,
    COALESCE(c.cumul_accrl_amt_mtd, 0)              AS cumul_accrl_amt_mtd,
    COALESCE(c.cumul_accrl_amt_ytd, 0)              AS cumul_accrl_amt_ytd,
    ac.src_sys_cd,
    CURRENT_TIMESTAMP()                              AS etl_cret_ts
FROM   accrl ac
JOIN   {{ source('core_banking_ods', 'dpos_agmt') }} a  ON ac.dpos_agmt_id = a.dpos_agmt_id
LEFT JOIN cumul c ON ac.dpos_agmt_id = c.dpos_agmt_id AND ac.accrl_dt = c.accrl_dt
