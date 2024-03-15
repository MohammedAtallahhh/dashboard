"use server";

import {
  vFetchBTCData,
  vFetchSP500Data,
  vFetchFedAssetsData,
  vFetchEUAssetsData,
  vFetchJapanAssetsData,
  vFetchChinaExchangeRate,
  vFetchEUExchangeRate,
  vFetchJapanExchangeRate,
  vFetchNasdaqData,
} from "./api";

import {
  vProcessECDData,
  vTrimData,
  vProcessBTCData,
  vProcessSP500Data,
} from "./process-data";

export const getData = async () => {
  const globalLiquidityStartDate = "2006-12-31";
  const globalLiquidityDisplayStartDate = "2008-01-01";

  const [
    rawBTCData,
    rawSP500Data,
    rawFEDBalanceSheet,
    rawEUBalanceSheet,
    rawJapanBalanceSheet,
    rawChinaExchangeRate,
    rawEUExchangeRate,
    rawJapanExchangeRate,
    rawECDData,
  ] = await Promise.all([
    vFetchBTCData(globalLiquidityStartDate),
    vFetchSP500Data(globalLiquidityStartDate),
    vFetchFedAssetsData(globalLiquidityStartDate),
    vFetchEUAssetsData(globalLiquidityStartDate),
    vFetchJapanAssetsData(globalLiquidityStartDate),
    vFetchChinaExchangeRate(globalLiquidityStartDate),
    vFetchEUExchangeRate(globalLiquidityStartDate),
    vFetchJapanExchangeRate(globalLiquidityStartDate),
    vFetchNasdaqData(globalLiquidityStartDate),
  ]).catch((error) => {
    throw error;
  });

  let btcGlobalLiquidityData = vProcessBTCData(
    rawBTCData,
    globalLiquidityStartDate
  );

  let sp500GlobalLiquidityData = vProcessSP500Data(
    rawSP500Data,
    globalLiquidityStartDate
  );

  let [
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
    major4TotalData,
    major4FlowData,
    globalM2,
  ] = vProcessECDData(
    rawChinaExchangeRate,
    rawEUExchangeRate,
    rawJapanExchangeRate,
    rawFEDBalanceSheet,
    rawEUBalanceSheet,
    rawJapanBalanceSheet,
    rawECDData,
    globalLiquidityStartDate
  );

  [
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
    major4TotalData,
    major4FlowData,
    sp500GlobalLiquidityData,
    btcGlobalLiquidityData,
    globalM2,
  ] = vTrimData(
    [
      fedBalanceSheet,
      pbocBalanceSheet,
      ecbBalanceSheet,
      bojBalanceSheet,
      major4TotalData,
      major4FlowData,
      sp500GlobalLiquidityData,
      btcGlobalLiquidityData,
      globalM2,
    ],
    globalLiquidityDisplayStartDate
  );

  return {
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
    major4TotalData,
    major4FlowData,
    sp500GlobalLiquidityData,
    btcGlobalLiquidityData,
    globalM2,
  };
};
