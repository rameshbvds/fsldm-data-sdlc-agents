-- ============================================================
-- Target  : FCT_DPOS_EVNT
-- Grain   : EVNT_ID (one row per deposit transaction event)
-- Source  : DPOS_EVNT UNION ALL DPOS_EVNT_ARCV (full history)
-- Filter  : REVRS_IND <> 'Y' (exclude reversed transactions)
-- Dialect : Teradata
-- ============================================================

WITH

-- ── UNION ALL: current events + archived events ───────────────────────────
ALL_EVNTS AS (
    SELECT
        EVNT_ID, DPOS_AGMT_ID, EVNT_TYP_CD, EVNT_DT, EVNT_TS,
        DR_CR_IND, EVNT_AMT, CRNCY_CD, CHNL_CD, STAT_CD,
        REVRS_IND, ORIG_EVNT_ID, BAL_AFT_EVNT_AMT, SRC_SYS_CD,
        'CURRENT'  AS DATA_SRC
    FROM   CORE_BANKING_ODS.DPOS_EVNT
    WHERE  REVRS_IND <> 'Y'

    UNION ALL

    SELECT
        EVNT_ID, DPOS_AGMT_ID, EVNT_TYP_CD, EVNT_DT, EVNT_TS,
        DR_CR_IND, EVNT_AMT, CRNCY_CD, CHNL_CD, STAT_CD,
        REVRS_IND, ORIG_EVNT_ID, BAL_AFT_EVNT_AMT, SRC_SYS_CD,
        'ARCHIVE'  AS DATA_SRC
    FROM   CORE_BANKING_ODS.DPOS_EVNT_ARCV
    WHERE  REVRS_IND <> 'Y'
)

-- ── FINAL INSERT ──────────────────────────────────────────────────────────
INSERT INTO EDW_FSLDM.FCT_DPOS_EVNT
SELECT
    -- ── Keys ──────────────────────────────────────────────────────────────
    E.EVNT_ID,
    E.DPOS_AGMT_ID,

    -- ── Dimension keys via LEFT JOIN to DPOS_AGMT ─────────────────────────
    A.PRTY_ID,
    A.PROD_ID,
    A.BRCH_ID,

    -- ── Event attributes ──────────────────────────────────────────────────
    E.EVNT_DT,
    E.EVNT_TYP_CD,

    -- Event type description
    CASE E.EVNT_TYP_CD
        WHEN 'DEPOS'  THEN 'Deposit / Credit'
        WHEN 'WTHDR'  THEN 'Withdrawal / Debit'
        WHEN 'INTRC'  THEN 'Interest Credit'
        WHEN 'FEECD'  THEN 'Fee Charge'
        WHEN 'CHGCD'  THEN 'Service Charge'
        WHEN 'TAXWH'  THEN 'Withholding Tax'
        WHEN 'CLSPR'  THEN 'Closure Proceeds'
        WHEN 'RNWPR'  THEN 'Renewal Proceeds'
        WHEN 'PENLT'  THEN 'Premature Withdrawal Penalty'
        WHEN 'ISLMP'  THEN 'Islamic Profit Distribution'
        ELSE           'Other'
    END                                                          AS EVNT_TYP_DESC,

    -- Event category grouping
    CASE
        WHEN E.EVNT_TYP_CD IN ('DEPOS','RNWPR')         THEN 'FUNDING'
        WHEN E.EVNT_TYP_CD IN ('WTHDR','CLSPR','PENLT') THEN 'WITHDRAWAL'
        WHEN E.EVNT_TYP_CD IN ('INTRC','ISLMP')         THEN 'INTEREST'
        WHEN E.EVNT_TYP_CD IN ('FEECD','CHGCD','TAXWH') THEN 'FEE_TAX'
        ELSE                                              'OTHER'
    END                                                          AS EVNT_CATG_CD,

    -- Deposit type from parent agreement
    A.DPOS_TYP_CD,

    -- ── Amount measures ───────────────────────────────────────────────────
    E.DR_CR_IND,
    E.EVNT_AMT,

    -- Signed amount: Credit = positive, Debit = negative
    CASE WHEN E.DR_CR_IND = 'C'
         THEN  E.EVNT_AMT
         ELSE -1 * E.EVNT_AMT
    END                                                          AS SIGNED_AMT,

    E.CRNCY_CD,

    -- ── Channel ───────────────────────────────────────────────────────────
    E.CHNL_CD,

    CASE
        WHEN E.CHNL_CD IN ('MOB','WEB','API') THEN 'DIGITAL'
        WHEN E.CHNL_CD IN ('ATM')             THEN 'SELF_SERV'
        WHEN E.CHNL_CD IN ('BRCH','TLER')     THEN 'BRANCH'
        ELSE                                   'OTHER'
    END                                                          AS CHNL_GRP_CD,

    -- ── Running balance after event ───────────────────────────────────────
    E.BAL_AFT_EVNT_AMT,

    -- ── Status flags ──────────────────────────────────────────────────────
    E.REVRS_IND,
    E.STAT_CD,

    -- ── Lineage ───────────────────────────────────────────────────────────
    E.DATA_SRC,
    E.SRC_SYS_CD,
    CURRENT_TIMESTAMP(6)                                         AS ETL_CRET_TS

FROM   ALL_EVNTS E

-- LEFT JOIN to DPOS_AGMT to get PRTY_ID, PROD_ID, BRCH_ID, DPOS_TYP_CD
LEFT JOIN CORE_BANKING_ODS.DPOS_AGMT A
    ON  E.DPOS_AGMT_ID = A.DPOS_AGMT_ID
;
