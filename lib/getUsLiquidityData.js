import {
  vFetchBTCData,
  vFetchBTFPCreditFacilitiesData,
  vFetchBankReservesData,
  vFetchFedAssetsData,
  vFetchODLData,
  vFetchReposData,
  vFetchSP500Data,
  vFetchTGAData,
} from "@/lib/api";

import {
  vProcessBTCData,
  vProcessBTFPCreditFacilitiesData,
  vProcessBankReservesData,
  vProcessFedAssetsData,
  vProcessNetLiquidityData,
  vProcessNetLiquiditySP500DivergenceData,
  vProcessODLData,
  vProcessReposData,
  vProcessSP500Data,
  vProcessTGAData,
  vTrimData,
} from "@/lib/process-data";

export const getData = async () => {
  const yoyDataFetchStartDate = "2013-12-01";
  const momDataFetchStartDate = "2014-11-01";
  const displayStartDate = "2015-01-01";

  const [
    rawODLData,
    rawBTCData,
    rawFedAssetsData,
    rawReposData,
    rawTGAData,
    rawBTFPCreditFacilitiesData,
    rawSP500Data,
    rawBankReservesData,
  ] = await Promise.all([
    vFetchODLData(yoyDataFetchStartDate),
    vFetchBTCData(yoyDataFetchStartDate),
    vFetchFedAssetsData(momDataFetchStartDate),
    vFetchReposData(momDataFetchStartDate),
    vFetchTGAData(momDataFetchStartDate),
    vFetchBTFPCreditFacilitiesData(momDataFetchStartDate),
    vFetchSP500Data(momDataFetchStartDate),
    vFetchBankReservesData(momDataFetchStartDate),
  ]).catch((error) => {
    throw error;
  });

  let odlData = vProcessODLData(rawODLData, yoyDataFetchStartDate);
  let btcData = vProcessBTCData(rawBTCData, yoyDataFetchStartDate);

  let fedAssetsData = vProcessFedAssetsData(
    rawFedAssetsData,
    momDataFetchStartDate
  );

  let reposData = vProcessReposData(rawReposData, momDataFetchStartDate);
  let tgaData = vProcessTGAData(rawTGAData, momDataFetchStartDate);
  let btfpCreditFacilitiesData = vProcessBTFPCreditFacilitiesData(
    rawBTFPCreditFacilitiesData,
    momDataFetchStartDate
  );

  let sp500Data = vProcessSP500Data(rawSP500Data, momDataFetchStartDate);
  let bankReservesData = vProcessBankReservesData(
    rawBankReservesData,
    momDataFetchStartDate
  );

  [odlData, btcData, sp500Data] = vTrimData(
    [odlData, btcData, sp500Data],
    displayStartDate
  );

  [fedAssetsData, reposData, tgaData, btfpCreditFacilitiesData] = vTrimData(
    [fedAssetsData, reposData, tgaData, btfpCreditFacilitiesData],
    momDataFetchStartDate
  );

  let netLiquidityData = vProcessNetLiquidityData(
    { fedAssetsData, reposData, tgaData, btfpCreditFacilitiesData },
    momDataFetchStartDate
  );

  let netLiquidityNoBTFPData = vProcessNetLiquidityData(
    { fedAssetsData, reposData, tgaData },
    momDataFetchStartDate
  );

  [
    fedAssetsData,
    reposData,
    tgaData,
    btfpCreditFacilitiesData,
    sp500Data,
    netLiquidityData,
    netLiquidityNoBTFPData,
    bankReservesData,
  ] = vTrimData(
    [
      fedAssetsData,
      reposData,
      tgaData,
      btfpCreditFacilitiesData,
      sp500Data,
      netLiquidityData,
      netLiquidityNoBTFPData,
      bankReservesData,
    ],
    displayStartDate
  );

  const netLiquiditySP500DivergenceData =
    vProcessNetLiquiditySP500DivergenceData({
      netLiquidityData,
      sp500Data,
    });

  const netLiquidityNoBTFPSP500DivergenceData =
    vProcessNetLiquiditySP500DivergenceData({
      netLiquidityData: netLiquidityNoBTFPData,
      sp500Data,
    });

  return {
    odlData,
    btcData,
    fedAssetsData,
    reposData,
    tgaData,
    btfpCreditFacilitiesData,
    sp500Data,
    netLiquidityData,
    netLiquiditySP500DivergenceData,
    netLiquidityNoBTFPSP500DivergenceData,
    bankReservesData,
  };
};
