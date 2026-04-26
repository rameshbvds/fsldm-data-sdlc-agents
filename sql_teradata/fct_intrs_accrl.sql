-- ============================================================
-- Target  : FCT_INTRS_ACCRL
-- Grain   : DPOS_AGMT_ID + ACCRL_DT (daily accrual per account)
-- Covers  : All deposit types incl. Islamic profit
-- Dialect : Teradata
-- ============================================================

WITH

-- ── MTD cumulative accrual per account ────────────────────────────────────
MTD_CUMUL AS (
    SELECT
        DPOS_AGMT_ID,
        ACCRL_DT,
        SUM(CASE WHEN REVRS_IND <> 'Y' THEN ACCRL_AMT ELSE 0 END)
            OVER (
                PARTITION BY DPOS_AGMT_ID,
                             EXTRACT(YEAR  FROM ACCRL_DT),
                             EXTRACT(MONTH FROM ACCRL_DT)
                ORDER BY ACCRL_DT
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            )                                                     AS CUMUL_ACCRL_AMT_MTD
    FROM   CORE_BANKING_ODS.DPOS_INTRS_ACCRL
),

-- ── YTD cumulative accrual per account ────────────────────────────────────
YTD_CUMUL AS (
    SELECT
        DPOS_AGMT_ID,
        ACCRL_DT,
        SUM(CASE WHEN REVRS_IND <> 'Y' THEN ACCRL_AMT ELSE 0 END)
            OVER (
                PARTITION BY DPOS_AGMT_ID,
                             EXTRACT(YEAR FROM ACCRL_DT)
                ORDER BY ACCRL_DT
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            )                                                     AS CUMUL_ACCRL_AMT_YTD
    FROM   CORE_BANKING_ODS.DPOS_INTRS_ACCRL
)

-- ── FINAL INSERT ──────────────────────────────────────────────────────────
INSERT INTO EDW_FSLDM.FCT_INTRS_ACCRL
SELECT
    -- ── Keys ──────────────────────────────────────────────────────────────
    AC.DPOS_AGMT_ID,
    AC.ACCRL_DT,

    -- ── Dimension keys ────────────────────────────────────────────────────
    A.PRTY_ID,
    A.PROD_ID,
    A.DPOS_TYP_CD,

    -- ── Accrual measures ──────────────────────────────────────────────────
    AC.ACCRL_AMT,
    AC.EFFCTV_INTRST_RT,
    AC.ACCRL_MTHD_CD,
    AC.DAYS_ACCRD_CNT,

    -- Gross = accrual before withholding tax
    AC.ACCRL_AMT                                                 AS GROSS_ACCRL_AMT,

    ZEROIFNULL(AC.TAX_WTHHD_AMT)                                AS TAX_WTHHD_AMT,

    -- Net accrual after tax
    AC.ACCRL_AMT - ZEROIFNULL(AC.TAX_WTHHD_AMT)                AS NET_ACCRL_AMT,

    -- Islamic profit component (NULL for conventional products)
    AC.ISLM_PRFT_AMT,

    AC.CRNCY_CD,
    AC.REVRS_IND,

    -- ── Cumulative measures (window functions via CTEs) ───────────────────
    ZEROIFNULL(MC.CUMUL_ACCRL_AMT_MTD)                         AS CUMUL_ACCRL_AMT_MTD,
    ZEROIFNULL(YC.CUMUL_ACCRL_AMT_YTD)                         AS CUMUL_ACCRL_AMT_YTD,

    -- ── Audit ─────────────────────────────────────────────────────────────
    AC.SRC_SYS_CD,
    CURRENT_TIMESTAMP(6)                                         AS ETL_CRET_TS

FROM   CORE_BANKING_ODS.DPOS_INTRS_ACCRL AC

-- Agreement for dimension keys
INNER JOIN CORE_BANKING_ODS.DPOS_AGMT A
    ON  AC.DPOS_AGMT_ID = A.DPOS_AGMT_ID

-- MTD cumulative
LEFT JOIN MTD_CUMUL MC
    ON  AC.DPOS_AGMT_ID = MC.DPOS_AGMT_ID
    AND AC.ACCRL_DT     = MC.ACCRL_DT

-- YTD cumulative
LEFT JOIN YTD_CUMUL YC
    ON  AC.DPOS_AGMT_ID = YC.DPOS_AGMT_ID
    AND AC.ACCRL_DT     = YC.ACCRL_DT

WHERE  AC.REVRS_IND <> 'Y'   -- exclude reversed accruals
;
