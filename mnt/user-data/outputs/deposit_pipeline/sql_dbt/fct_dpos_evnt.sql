-- ============================================================
-- FILE: fct_dpos_evnt.sql (dbt / Snowflake)
-- ============================================================
{{ config(materialized='incremental', unique_key='evnt_id', on_schema_change='sync_all_columns') }}

WITH all_evnts AS (
    SELECT evnt_id, dpos_agmt_id, evnt_typ_cd, evnt_dt, dr_cr_ind,
           evnt_amt, crncy_cd, chnl_cd, stat_cd, revrs_ind,
           bal_aft_evnt_amt, src_sys_cd, 'CURRENT' AS data_src
    FROM   {{ source('core_banking_ods', 'dpos_evnt') }}
    WHERE  revrs_ind <> 'Y'
    UNION ALL
    SELECT evnt_id, dpos_agmt_id, evnt_typ_cd, evnt_dt, dr_cr_ind,
           evnt_amt, crncy_cd, chnl_cd, stat_cd, revrs_ind,
           bal_aft_evnt_amt, src_sys_cd, 'ARCHIVE' AS data_src
    FROM   {{ source('core_banking_ods', 'dpos_evnt_arcv') }}
    WHERE  revrs_ind <> 'Y'
)

SELECT
    e.evnt_id, e.dpos_agmt_id,
    a.prty_id, a.prod_id, a.brch_id,
    e.evnt_dt, e.evnt_typ_cd,
    CASE e.evnt_typ_cd
        WHEN 'DEPOS' THEN 'Deposit / Credit'   WHEN 'WTHDR' THEN 'Withdrawal / Debit'
        WHEN 'INTRC' THEN 'Interest Credit'     WHEN 'FEECD' THEN 'Fee Charge'
        WHEN 'CHGCD' THEN 'Service Charge'      WHEN 'TAXWH' THEN 'Withholding Tax'
        WHEN 'CLSPR' THEN 'Closure Proceeds'    WHEN 'RNWPR' THEN 'Renewal Proceeds'
        WHEN 'PENLT' THEN 'Premature Withdrawal Penalty'
        WHEN 'ISLMP' THEN 'Islamic Profit Distribution'
        ELSE 'Other'
    END                                                      AS evnt_typ_desc,
    CASE WHEN e.evnt_typ_cd IN ('DEPOS','RNWPR')         THEN 'FUNDING'
         WHEN e.evnt_typ_cd IN ('WTHDR','CLSPR','PENLT') THEN 'WITHDRAWAL'
         WHEN e.evnt_typ_cd IN ('INTRC','ISLMP')         THEN 'INTEREST'
         WHEN e.evnt_typ_cd IN ('FEECD','CHGCD','TAXWH') THEN 'FEE_TAX'
         ELSE 'OTHER'
    END                                                      AS evnt_catg_cd,
    a.dpos_typ_cd,
    e.dr_cr_ind, e.evnt_amt,
    IFF(e.dr_cr_ind = 'C', e.evnt_amt, -1 * e.evnt_amt)    AS signed_amt,
    e.crncy_cd, e.chnl_cd,
    CASE WHEN e.chnl_cd IN ('MOB','WEB','API') THEN 'DIGITAL'
         WHEN e.chnl_cd IN ('ATM')             THEN 'SELF_SERV'
         WHEN e.chnl_cd IN ('BRCH','TLER')     THEN 'BRANCH'
         ELSE 'OTHER'
    END                                                      AS chnl_grp_cd,
    e.bal_aft_evnt_amt, e.revrs_ind, e.stat_cd,
    e.data_src, e.src_sys_cd,
    CURRENT_TIMESTAMP()                                      AS etl_cret_ts
FROM   all_evnts e
LEFT JOIN {{ source('core_banking_ods', 'dpos_agmt') }} a ON e.dpos_agmt_id = a.dpos_agmt_id
