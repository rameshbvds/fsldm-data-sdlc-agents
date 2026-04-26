-- ============================================================
-- Target  : FCT_DPOS_BAL
-- Grain   : DPOS_AGMT_ID + BAL_DT (daily snapshot)
-- Products: CASA(Current/Savings), FD, RD, Notice, Call,
--           Structured, Islamic (Murabaha/Wakala)
-- Dialect : Teradata
-- ============================================================

WITH

-- ── STEP 1: Full event history (UNION ALL current + archive) ──────────────
ALL_EVNTS AS (
    SELECT
        DPOS_AGMT_ID, DR_CR_IND, EVNT_AMT, EVNT_DT,
        EVNT_TYP_CD, STAT_CD, REVRS_IND
    FROM   CORE_BANKING_ODS.DPOS_EVNT
    WHERE  REVRS_IND <> 'Y'
    AND    STAT_CD    = 'PST'

    UNION ALL

    SELECT
        DPOS_AGMT_ID, DR_CR_IND, EVNT_AMT, EVNT_DT,
        EVNT_TYP_CD, STAT_CD, REVRS_IND
    FROM   CORE_BANKING_ODS.DPOS_EVNT_ARCV
    WHERE  REVRS_IND <> 'Y'
    AND    STAT_CD    = 'PST'
),

-- ── STEP 2: MTD event aggregation per account ─────────────────────────────
MTD_AGG AS (
    SELECT
        DPOS_AGMT_ID,
        SUM(CASE WHEN DR_CR_IND = 'D' THEN EVNT_AMT ELSE 0 END)   AS TOT_DR_AMT_MTD,
        SUM(CASE WHEN DR_CR_IND = 'C' THEN EVNT_AMT ELSE 0 END)   AS TOT_CR_AMT_MTD,
        COUNT(CASE WHEN DR_CR_IND = 'D' THEN 1 END)                AS DR_EVNT_CNT_MTD,
        COUNT(CASE WHEN DR_CR_IND = 'C' THEN 1 END)                AS CR_EVNT_CNT_MTD
    FROM   ALL_EVNTS
    WHERE  EXTRACT(YEAR  FROM EVNT_DT) = EXTRACT(YEAR  FROM CURRENT_DATE)
    AND    EXTRACT(MONTH FROM EVNT_DT) = EXTRACT(MONTH FROM CURRENT_DATE)
    GROUP BY DPOS_AGMT_ID
),

-- ── STEP 3: MTD interest accrual per account ──────────────────────────────
MTD_ACCRL AS (
    SELECT
        DPOS_AGMT_ID,
        SUM(CASE WHEN REVRS_IND <> 'Y' THEN ACCRL_AMT ELSE 0 END) AS TOT_INTRS_ACCRD_MTD
    FROM   CORE_BANKING_ODS.DPOS_INTRS_ACCRL
    WHERE  EXTRACT(YEAR  FROM ACCRL_DT) = EXTRACT(YEAR  FROM CURRENT_DATE)
    AND    EXTRACT(MONTH FROM ACCRL_DT) = EXTRACT(MONTH FROM CURRENT_DATE)
    GROUP BY DPOS_AGMT_ID
),

-- ── STEP 4: Term Deposit renewal count ────────────────────────────────────
TD_RNWL AS (
    SELECT
        DPOS_AGMT_ID,
        COUNT(*) - 1 AS RNWL_CNT  -- subtract 1 for original placement
    FROM   CORE_BANKING_ODS.TD_SCHD
    WHERE  SCHD_TYP_CD IN ('ORIG', 'RNWL')
    GROUP BY DPOS_AGMT_ID
),

-- ── STEP 5: Recurring Deposit instalment counts ───────────────────────────
RD_INSTL AS (
    SELECT
        DPOS_AGMT_ID,
        COUNT(CASE WHEN STAT_CD = 'PAID' THEN 1 END) AS INSTL_PAID_CNT,
        COUNT(CASE WHEN STAT_CD = 'MISS' THEN 1 END) AS INSTL_MISS_CNT
    FROM   CORE_BANKING_ODS.RD_INSTL_SCHD
    GROUP BY DPOS_AGMT_ID
),

-- ── STEP 6: Islamic profit rates (latest per account) ─────────────────────
ISLM_PRFT AS (
    SELECT
        IA.DPOS_AGMT_ID,
        IA.EXPC_PRFT_RT,
        IA.ACTUAL_PRFT_RT
    FROM   CORE_BANKING_ODS.ISLM_AGMT IA
    QUALIFY ROW_NUMBER() OVER (
        PARTITION BY IA.DPOS_AGMT_ID
        ORDER BY IA.REC_CRET_TS DESC
    ) = 1
)

-- ── FINAL INSERT ──────────────────────────────────────────────────────────
INSERT INTO EDW_FSLDM.FCT_DPOS_BAL
SELECT
    -- ── Keys ──────────────────────────────────────────────────────────────
    A.DPOS_AGMT_ID,
    CAST(CURRENT_DATE AS DATE FORMAT 'YYYY-MM-DD')               AS BAL_DT,

    -- ── Dimensions ────────────────────────────────────────────────────────
    A.PRTY_ID,
    A.PROD_ID,
    A.BRCH_ID,
    P.PROD_CATG_CD,
    A.DPOS_TYP_CD,

    -- Event type description via CASE
    CASE A.DPOS_TYP_CD
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
    END                                                           AS DPOS_TYP_DESC,

    A.DPOS_STAT_CD,
    PR.SEGMT_CD                                                   AS PRTY_SEGMT_CD,
    A.CRNCY_CD,
    B.RGN_CD,

    -- ── Balance measures ──────────────────────────────────────────────────
    ZEROIFNULL(DB.CURR_BAL_AMT)                                  AS CURR_BAL_AMT,
    ZEROIFNULL(DB.AVAIL_BAL_AMT)                                 AS AVAIL_BAL_AMT,
    DB.BLKD_AMT,
    DB.ACCRD_INTRS_AMT,
    DB.INTRST_RT,
    A.ORIG_DEPOS_AMT,

    -- ── Term/Maturity fields (NULL for CASA) ──────────────────────────────
    A.MTRTY_DT,
    CASE WHEN A.MTRTY_DT IS NOT NULL
         THEN CAST((A.MTRTY_DT - CURRENT_DATE) AS SMALLINT)
         ELSE NULL
    END                                                           AS TNOR_DAYS_CNT,
    CASE WHEN A.MTRTY_DT IS NOT NULL AND A.MTRTY_DT >= CURRENT_DATE
         THEN CAST((A.MTRTY_DT - CURRENT_DATE) AS SMALLINT)
         ELSE NULL
    END                                                           AS DAYS_TO_MTRTY_CNT,
    A.RNWL_IND,
    ZEROIFNULL(TD.RNWL_CNT)                                      AS RNWL_CNT,

    -- ── Product type indicators ───────────────────────────────────────────
    CASE WHEN A.DPOS_TYP_CD IN ('CASA_C','CASA_S') THEN 'Y' ELSE 'N' END   AS CASA_IND,
    CASE WHEN A.DPOS_TYP_CD IN ('TERM_F','RECR_D','NTIC_D','CALL_D','STRC_D') THEN 'Y' ELSE 'N' END AS TERM_DEPOS_IND,
    CASE WHEN A.DPOS_TYP_CD IN ('ISLM_M','ISLM_W') THEN 'Y' ELSE 'N' END  AS ISLM_IND,
    CASE WHEN A.DORMANT_DT IS NOT NULL THEN 'Y' ELSE 'N' END               AS DORMANT_IND,
    A.TAX_WTHHD_IND,

    -- ── MTD event aggregates (from UNION ALL CTE) ─────────────────────────
    ZEROIFNULL(MA.TOT_DR_AMT_MTD)                                AS TOT_DR_AMT_MTD,
    ZEROIFNULL(MA.TOT_CR_AMT_MTD)                                AS TOT_CR_AMT_MTD,
    ZEROIFNULL(MA.DR_EVNT_CNT_MTD)                               AS DR_EVNT_CNT_MTD,
    ZEROIFNULL(MA.CR_EVNT_CNT_MTD)                               AS CR_EVNT_CNT_MTD,
    ZEROIFNULL(MAC.TOT_INTRS_ACCRD_MTD)                          AS TOT_INTRS_ACCRD_MTD,

    -- ── Islamic profit rates (NULL for non-Islamic) ───────────────────────
    IP.EXPC_PRFT_RT,
    IP.ACTUAL_PRFT_RT,

    -- ── Recurring Deposit instalment counters (NULL for non-RD) ──────────
    RD.INSTL_PAID_CNT,
    RD.INSTL_MISS_CNT,

    -- ── Audit ─────────────────────────────────────────────────────────────
    A.SRC_SYS_CD,
    CURRENT_TIMESTAMP(6)                                          AS ETL_CRET_TS

FROM   CORE_BANKING_ODS.DPOS_AGMT A

-- Current party row (SCD2)
INNER JOIN CORE_BANKING_ODS.PRTY PR
    ON  A.PRTY_ID = PR.PRTY_ID
    AND PR.CURR_ROW_IND = 'Y'

-- Product catalogue
INNER JOIN CORE_BANKING_ODS.PROD P
    ON  A.PROD_ID = P.PROD_ID

-- Branch
INNER JOIN CORE_BANKING_ODS.BRCH B
    ON  A.BRCH_ID = B.BRCH_ID

-- Daily balance (for the load date)
LEFT JOIN CORE_BANKING_ODS.DPOS_BAL DB
    ON  A.DPOS_AGMT_ID = DB.DPOS_AGMT_ID
    AND DB.BAL_DT = CURRENT_DATE

-- MTD event aggregates
LEFT JOIN MTD_AGG MA
    ON  A.DPOS_AGMT_ID = MA.DPOS_AGMT_ID

-- MTD interest accrual
LEFT JOIN MTD_ACCRL MAC
    ON  A.DPOS_AGMT_ID = MAC.DPOS_AGMT_ID

-- Term deposit renewals
LEFT JOIN TD_RNWL TD
    ON  A.DPOS_AGMT_ID = TD.DPOS_AGMT_ID

-- RD instalment counts
LEFT JOIN RD_INSTL RD
    ON  A.DPOS_AGMT_ID = RD.DPOS_AGMT_ID

-- Islamic profit rates
LEFT JOIN ISLM_PRFT IP
    ON  A.DPOS_AGMT_ID = IP.DPOS_AGMT_ID

WHERE  A.DPOS_STAT_CD <> 'CLO'   -- exclude closed accounts
;
