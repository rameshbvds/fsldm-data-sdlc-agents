{{ config(
    materialized   = 'incremental',
    unique_key     = ['dpos_agmt_id', 'bal_dt'],
    on_schema_change = 'sync_all_columns'
) }}

WITH all_evnts AS (
    SELECT dpos_agmt_id, dr_cr_ind, evnt_amt, evnt_dt, stat_cd, revrs_ind
    FROM   {{ source('core_banking_ods', 'dpos_evnt') }}
    WHERE  revrs_ind <> 'Y' AND stat_cd = 'PST'
    UNION ALL
    SELECT dpos_agmt_id, dr_cr_ind, evnt_amt, evnt_dt, stat_cd, revrs_ind
    FROM   {{ source('core_banking_ods', 'dpos_evnt_arcv') }}
    WHERE  revrs_ind <> 'Y' AND stat_cd = 'PST'
),

mtd_agg AS (
    SELECT
        dpos_agmt_id,
        SUM(CASE WHEN dr_cr_ind = 'D' THEN evnt_amt ELSE 0 END) AS tot_dr_amt_mtd,
        SUM(CASE WHEN dr_cr_ind = 'C' THEN evnt_amt ELSE 0 END) AS tot_cr_amt_mtd,
        COUNT_IF(dr_cr_ind = 'D')                                AS dr_evnt_cnt_mtd,
        COUNT_IF(dr_cr_ind = 'C')                                AS cr_evnt_cnt_mtd
    FROM   all_evnts
    WHERE  DATE_TRUNC('month', evnt_dt) = DATE_TRUNC('month', CURRENT_DATE())
    GROUP BY dpos_agmt_id
),

mtd_accrl AS (
    SELECT
        dpos_agmt_id,
        SUM(CASE WHEN revrs_ind <> 'Y' THEN accrl_amt ELSE 0 END) AS tot_intrs_accrd_mtd
    FROM   {{ source('core_banking_ods', 'dpos_intrs_accrl') }}
    WHERE  DATE_TRUNC('month', accrl_dt) = DATE_TRUNC('month', CURRENT_DATE())
    GROUP BY dpos_agmt_id
),

td_rnwl AS (
    SELECT dpos_agmt_id, COUNT(*) - 1 AS rnwl_cnt
    FROM   {{ source('core_banking_ods', 'td_schd') }}
    WHERE  schd_typ_cd IN ('ORIG', 'RNWL')
    GROUP BY dpos_agmt_id
),

rd_instl AS (
    SELECT
        dpos_agmt_id,
        COUNT_IF(stat_cd = 'PAID') AS instl_paid_cnt,
        COUNT_IF(stat_cd = 'MISS') AS instl_miss_cnt
    FROM   {{ source('core_banking_ods', 'rd_instl_schd') }}
    GROUP BY dpos_agmt_id
),

islm_prft AS (
    SELECT dpos_agmt_id, expc_prft_rt, actual_prft_rt,
           ROW_NUMBER() OVER (PARTITION BY dpos_agmt_id ORDER BY rec_cret_ts DESC) AS rn
    FROM   {{ source('core_banking_ods', 'islm_agmt') }}
    QUALIFY rn = 1
)

SELECT
    a.dpos_agmt_id,
    CURRENT_DATE()                                                AS bal_dt,
    a.prty_id, a.prod_id, a.brch_id,
    p.prod_catg_cd, a.dpos_typ_cd,
    CASE a.dpos_typ_cd
        WHEN 'CASA_C' THEN 'Current Account'
        WHEN 'CASA_S' THEN 'Savings Account'
        WHEN 'TERM_F' THEN 'Fixed/Term Deposit'
        WHEN 'RECR_D' THEN 'Recurring Deposit'
        WHEN 'NTIC_D' THEN 'Notice Deposit'
        WHEN 'CALL_D' THEN 'Call Deposit'
        WHEN 'STRC_D' THEN 'Structured Deposit'
        WHEN 'ISLM_M' THEN 'Islamic Murabaha'
        WHEN 'ISLM_W' THEN 'Islamic Wakala'
        ELSE            'Other'
    END                                                           AS dpos_typ_desc,
    a.dpos_stat_cd,
    pr.segmt_cd                                                   AS prty_segmt_cd,
    a.crncy_cd,
    b.rgn_cd,
    COALESCE(db.curr_bal_amt,  0)                                 AS curr_bal_amt,
    COALESCE(db.avail_bal_amt, 0)                                 AS avail_bal_amt,
    db.blkd_amt, db.accrd_intrs_amt, db.intrst_rt,
    a.orig_depos_amt, a.mtrty_dt,
    CASE WHEN a.mtrty_dt IS NOT NULL
         THEN DATEDIFF('day', CURRENT_DATE(), a.mtrty_dt) END     AS tnor_days_cnt,
    CASE WHEN a.mtrty_dt >= CURRENT_DATE()
         THEN DATEDIFF('day', CURRENT_DATE(), a.mtrty_dt) END     AS days_to_mtrty_cnt,
    a.rnwl_ind,
    COALESCE(td.rnwl_cnt, 0)                                      AS rnwl_cnt,
    IFF(a.dpos_typ_cd IN ('CASA_C','CASA_S'),            'Y','N') AS casa_ind,
    IFF(a.dpos_typ_cd IN ('TERM_F','RECR_D','NTIC_D','CALL_D','STRC_D'), 'Y','N') AS term_depos_ind,
    IFF(a.dpos_typ_cd IN ('ISLM_M','ISLM_W'),            'Y','N') AS islm_ind,
    IFF(a.dormant_dt IS NOT NULL,                        'Y','N') AS dormant_ind,
    a.tax_wthhd_ind,
    COALESCE(ma.tot_dr_amt_mtd,       0)                          AS tot_dr_amt_mtd,
    COALESCE(ma.tot_cr_amt_mtd,       0)                          AS tot_cr_amt_mtd,
    COALESCE(ma.dr_evnt_cnt_mtd,      0)                          AS dr_evnt_cnt_mtd,
    COALESCE(ma.cr_evnt_cnt_mtd,      0)                          AS cr_evnt_cnt_mtd,
    COALESCE(mac.tot_intrs_accrd_mtd, 0)                          AS tot_intrs_accrd_mtd,
    ip.expc_prft_rt, ip.actual_prft_rt,
    rd.instl_paid_cnt, rd.instl_miss_cnt,
    a.src_sys_cd,
    CURRENT_TIMESTAMP()                                           AS etl_cret_ts

FROM   {{ source('core_banking_ods', 'dpos_agmt') }}         a
JOIN   {{ source('core_banking_ods', 'prty') }}              pr ON a.prty_id = pr.prty_id AND pr.curr_row_ind = 'Y'
JOIN   {{ source('core_banking_ods', 'prod') }}              p  ON a.prod_id = p.prod_id
JOIN   {{ source('core_banking_ods', 'brch') }}              b  ON a.brch_id = b.brch_id
LEFT JOIN {{ source('core_banking_ods', 'dpos_bal') }}       db ON a.dpos_agmt_id = db.dpos_agmt_id AND db.bal_dt = CURRENT_DATE()
LEFT JOIN mtd_agg    ma  ON a.dpos_agmt_id = ma.dpos_agmt_id
LEFT JOIN mtd_accrl  mac ON a.dpos_agmt_id = mac.dpos_agmt_id
LEFT JOIN td_rnwl    td  ON a.dpos_agmt_id = td.dpos_agmt_id
LEFT JOIN rd_instl   rd  ON a.dpos_agmt_id = rd.dpos_agmt_id
LEFT JOIN islm_prft  ip  ON a.dpos_agmt_id = ip.dpos_agmt_id
WHERE  a.dpos_stat_cd <> 'CLO'
