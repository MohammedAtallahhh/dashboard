import * as d3 from "d3";

export function vProcessBankReservesData(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.observations,
    ({ value }) => +value,
    cutoffDate
  );
  vComputeChange(data, "month");
  vComputeChange(data, "3month");
  vComputeChange(data, "6month");
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessODLData(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.observations,
    ({ value }) => +value,
    cutoffDate
  );
  vComputeChange(data, "year");
  vComputeChange(data, "3month");
  vComputeChange(data, "6month");
  vComputeChange(data, "month");
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessBTCData(rawData, cutoffDate) {
  const parseDate = d3.utcParse("%Q");
  const formatDate = d3.utcFormat("%Y-%m-%d");
  const data = vFillDataUpToDay(
    rawData.prices.map(([timestamp, value]) => ({
      date: formatDate(parseDate(timestamp)),
      value,
    })),
    ({ value }) => value,
    cutoffDate
  );
  vComputeChange(data, "year");
  vComputeChange(data, "6month");
  vComputeChange(data, "3month");
  vComputeChange(data, "month");
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessFedAssetsData(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.observations,
    ({ value }) => +value / 1e3, // Convert millions to billions,
    cutoffDate
  );
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessReposData(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.observations,
    ({ value }) => +value, // In billions
    cutoffDate
  );
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessTGAData(rawData, cutoffDate) {
  const combinedData = [
    ...rawData[0].data.map(({ record_date, close_today_bal }) => ({
      date: record_date,
      value: +close_today_bal,
    })),
    ...rawData[1].data.map(({ record_date, close_today_bal }) => ({
      date: record_date,
      value: +close_today_bal,
    })),
    ...rawData[2].data.map(({ record_date, open_today_bal }) => ({
      date: record_date,
      value: +open_today_bal,
    })),
  ];
  const data = vFillDataUpToDay(
    combinedData,
    ({ value }) => +value / 1e3, // Convert millions to billions
    cutoffDate
  );
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessBTFPCreditFacilitiesData(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.observations,
    ({ value }) => +value / 1e3, // Convert millions to billions
    cutoffDate
  );
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessNetLiquidityData(
  { fedAssetsData, reposData, tgaData, btfpCreditFacilitiesData },
  cutoffDate
) {
  const data = [];
  for (let i = 0; i < fedAssetsData.length; i++) {
    const fedAssets = fedAssetsData[i];
    const repos = reposData[i];
    const tga = tgaData[i];
    const btfpCreditFacilities = btfpCreditFacilitiesData
      ? btfpCreditFacilitiesData[i]
      : undefined;
    data.push({
      date: fedAssets.date,
      value:
        fedAssets.value -
        repos.value -
        tga.value -
        (btfpCreditFacilities === undefined ? 0 : btfpCreditFacilities.value),
    });
  }
  vComputeChange(data, "month");
  vComputeChange(data, "2week");
  vComputeChange(data, "week");
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessSP500Data(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.map(({ date, close }) => ({
      date: date.slice(0, 10),
      value: close * 10, // SP500 is 10 times of SPY
    })),
    ({ value }) => value,
    cutoffDate
  );
  vComputeChange(data, "year");
  vComputeChange(data, "6month");
  vComputeChange(data, "3month");
  vComputeChange(data, "month");
  vComputeChange(data, "2week");
  vComputeChange(data, "week");
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessNetLiquiditySP500DivergenceData({
  netLiquidityData,
  sp500Data,
}) {
  const data = [];
  for (let i = 0; i < netLiquidityData.length; i++) {
    const netLiquidity = netLiquidityData[i];
    const sp500 = sp500Data[i];
    data.push({
      date: netLiquidity.date,
      mom: sp500.mom - netLiquidity.mom,
      "2wow": sp500["2wow"] - netLiquidity["2wow"],
      wow: sp500.wow - netLiquidity.wow,
    });
  }
  return data;
}

export function vProcessSP500PERatioData(rawData, cutoffDate) {
  const data = vFillDataUpToDay(
    rawData.dataset.data.map(([date, value]) => ({
      date,
      value,
    })),
    ({ value }) => value,
    cutoffDate,
    "month"
  );
  vComputeChange(data, "6month", "month");
  vComputeChange(data, "3month", "month");
  return vKeepAfterData(data, cutoffDate);
}

export function vProcessExcessLiquidityData(
  rawM2Data,
  rawIPData,
  rawPPIData,
  cutoffDate
) {
  const M2Data = vFillDataUpToDay(
    rawM2Data.observations,
    ({ value }) => +value,
    cutoffDate,
    "month"
  );
  const IPData = vFillDataUpToDay(
    rawIPData.observations,
    ({ value }) => +value,
    cutoffDate,
    "month"
  );
  const PPIData = vFillDataUpToDay(
    rawPPIData.observations,
    ({ value }) => +value,
    cutoffDate,
    "month"
  );
  const IPPPIData = d3.zip(IPData, PPIData).map(([i, p]) => ({
    date: i.date,
    value: i.value * p.value,
  }));
  vComputeChange(M2Data, "6month", "month");
  vComputeChange(M2Data, "3month", "month");
  vComputeChange(IPPPIData, "6month", "month");
  vComputeChange(IPPPIData, "3month", "month");
  const excessLiquidityData = d3.zip(M2Data, IPPPIData).map(([m, i]) => ({
    date: m.date,
    "3mom": m["3mom"] - i["3mom"],
    "6mom": m["6mom"] - i["6mom"],
  }));
  return vKeepAfterData(excessLiquidityData, cutoffDate);
}

export function vProcessECDData(
  rawChinaExchangeRate,
  rawEUExchangeRate,
  rawJapanExchangeRate,
  rawFEDBalanceSheet,
  rawEUBalanceSheet,
  rawJapanBalanceSheet,
  rawECDData,
  cutoffDate
) {
  // Exchange rates
  const chinaExchangeRate = vFillDataUpToDay(
    rawChinaExchangeRate.observations,
    ({ value }) => +value,
    cutoffDate
  );

  const euExchangeRate = vFillDataUpToDay(
    rawEUExchangeRate.observations,
    ({ value }) => +value,
    cutoffDate
  );

  const japanExchangeRate = vFillDataUpToDay(
    rawJapanExchangeRate.observations,
    ({ value }) => +value,
    cutoffDate
  );

  // ECD
  const countryIndex = rawECDData.datatable.columns.findIndex(
    (d) => d.name === "country_code"
  );
  const indicatorIndex = rawECDData.datatable.columns.findIndex(
    (d) => d.name === "indicator_code"
  );
  const dateIndex = rawECDData.datatable.columns.findIndex(
    (d) => d.name === "date"
  );
  const valueIndex = rawECDData.datatable.columns.findIndex(
    (d) => d.name === "value"
  );

  const transformed = d3.rollup(
    rawECDData.datatable.data,
    (v) =>
      v.map((d) => ({
        date: d[dateIndex],
        value: d[valueIndex],
      })),
    (d) => d[indicatorIndex],
    (d) => d[countryIndex]
  );

  // Balance sheets
  const balanceSheet = transformed.get("017");
  const fedBalanceSheet = vFillDataUpToDay(
    rawFEDBalanceSheet.observations,
    ({ value }) => +value / 1e3, // Convert millions to billions,
    cutoffDate
  );
  let pbocBalanceSheet = vFillDataUpToDay(
    balanceSheet.get("CN"),
    ({ value }) => value, // bln CNY
    cutoffDate
  );
  let ecbBalanceSheet = vFillDataUpToDay(
    rawEUBalanceSheet.observations,
    ({ value }) => +value / 1e3, // Convert millions Euros to billions Euros,
    cutoffDate
  );
  let bojBalanceSheet = vFillDataUpToDay(
    rawJapanBalanceSheet.observations,
    ({ value }) => +value / 1e1, // Convert 100 million Yen to billions Yen
    cutoffDate
  );
  pbocBalanceSheet = vConvertCurrency(
    pbocBalanceSheet,
    chinaExchangeRate,
    (currency, exchangeRate) => currency / exchangeRate
  );
  ecbBalanceSheet = vConvertCurrency(
    ecbBalanceSheet,
    euExchangeRate,
    (currency, exchangeRate) => currency * exchangeRate
  );
  bojBalanceSheet = vConvertCurrency(
    bojBalanceSheet,
    japanExchangeRate,
    (currency, exchangeRate) => currency / exchangeRate
  );
  vComputeChange(fedBalanceSheet, "year", "day", "value");
  vComputeChange(fedBalanceSheet, "6month", "day", "value");
  vComputeChange(fedBalanceSheet, "3month", "day", "value");
  vComputeChange(fedBalanceSheet, "month", "day", "value");
  vComputeChange(pbocBalanceSheet, "year", "day", "value");
  vComputeChange(pbocBalanceSheet, "6month", "day", "value");
  vComputeChange(pbocBalanceSheet, "3month", "day", "value");
  vComputeChange(pbocBalanceSheet, "month", "day", "value");
  vComputeChange(ecbBalanceSheet, "year", "day", "value");
  vComputeChange(ecbBalanceSheet, "6month", "day", "value");
  vComputeChange(ecbBalanceSheet, "3month", "day", "value");
  vComputeChange(ecbBalanceSheet, "month", "day", "value");
  vComputeChange(bojBalanceSheet, "year", "day", "value");
  vComputeChange(bojBalanceSheet, "6month", "day", "value");
  vComputeChange(bojBalanceSheet, "3month", "day", "value");
  vComputeChange(bojBalanceSheet, "month", "day", "value");
  const sumMajor4 = (i, key) =>
    d3.sum([
      fedBalanceSheet[i][key],
      pbocBalanceSheet[i][key],
      ecbBalanceSheet[i][key],
      bojBalanceSheet[i][key],
    ]);

  const major4TotalData = fedBalanceSheet.map(({ date }, i) => {
    return {
      date,
      value: sumMajor4(i, "value"),
    };
  });

  const major4FlowData = fedBalanceSheet.map(({ date }, i) => {
    return {
      date,
      mom: sumMajor4(i, "mom"),
      "3mom": sumMajor4(i, "3mom"),
      "6mom": sumMajor4(i, "6mom"),
      year: sumMajor4(i, "year"),
    };
  });

  vComputeChange(major4TotalData, "year", "day");
  vComputeChange(major4TotalData, "6month", "day");
  vComputeChange(major4TotalData, "3month", "day");
  vComputeChange(major4TotalData, "month", "day");

  // M2s
  const m2 = transformed.get("148");
  const fedM2 = vFillDataUpToDay(
    m2.get("US"),
    ({ value }) => value, // bln USD
    cutoffDate
  );
  let pbocM2 = vFillDataUpToDay(
    m2.get("CN"),
    ({ value }) => value, // bln CNY
    cutoffDate
  );
  let ecbM2 = vFillDataUpToDay(
    m2.get("EA"),
    ({ value }) => value, // bln EUR
    cutoffDate
  );
  let bojM2 = vFillDataUpToDay(
    m2.get("JP"),
    ({ value }) => value, // bln JPY
    cutoffDate
  );
  pbocM2 = vConvertCurrency(
    pbocM2,
    chinaExchangeRate,
    (currency, exchangeRate) => currency / exchangeRate
  );
  ecbM2 = vConvertCurrency(
    ecbM2,
    euExchangeRate,
    (currency, exchangeRate) => currency * exchangeRate
  );
  bojM2 = vConvertCurrency(
    bojM2,
    japanExchangeRate,
    (currency, exchangeRate) => currency / exchangeRate
  );
  const globalM2 = fedM2.map(({ date }, i) => {
    return {
      date,
      value: d3.sum([
        fedM2[i].value,
        pbocM2[i].value,
        ecbM2[i].value,
        bojM2[i].value,
      ]),
    };
  });
  vComputeChange(globalM2, "year", "day");
  vComputeChange(globalM2, "6month", "day");
  vComputeChange(globalM2, "3month", "day");
  vComputeChange(globalM2, "month", "day");

  return [
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
    major4TotalData,
    major4FlowData,
    globalM2,
  ];
}

export function vConvertCurrency(currency, exchangeRate, valueAccessor) {
  return currency.map(({ date, value }, i) => {
    const er = exchangeRate[i].value;
    let converted = undefined;
    if (er !== undefined && value !== undefined) {
      converted = valueAccessor(value, er);
    }
    return {
      date,
      value: converted,
    };
  });
}

export function vFillDataUpToDay(
  rawData,
  valueAccessor,
  startDate,
  dataFrequency = "day"
) {
  const parseDate = d3.utcParse("%Y-%m-%d");
  const formatDate = d3.utcFormat("%Y-%m-%d");
  const valueMap = new Map(rawData.map((d) => [d.date, valueAccessor(d)]));
  const fs = {
    day: d3.utcDay,
    month: d3.utcMonth,
  };
  const f = fs[dataFrequency];
  let value;
  const data = f.range(parseDate(startDate), new Date()).map((date) => {
    const formattedDate = formatDate(date);
    const currentValue = valueMap.get(formattedDate);
    if (currentValue !== undefined && !isNaN(currentValue))
      value = currentValue;
    return {
      date,
      value,
    };
  });
  return data;
}

export function vComputeChange(
  data,
  changeFrequency,
  dataFrequency = "day",
  changeType = "percentage"
) {
  const keys = {
    year: "yoy",
    month: "mom",
    "2week": "2wow",
    week: "wow",
    "3month": "3mom",
    "6month": "6mom",
  };
  const key = keys[changeFrequency];

  const ns = {
    day: {
      year: 360,
      "6month": 180,
      "3month": 90,
      month: 30,
      "2week": 14,
      week: 7,
    },
    month: {
      year: 12,
      month: 1,
      "3month": 3,
      "6month": 6,
    },
  };
  const n = ns[dataFrequency][changeFrequency];

  data.forEach((d, i) => {
    if (i < n) {
      d[key] = null;
    } else {
      if (d.value === undefined || data[i - n].value === undefined) {
        d[key] = null;
      } else if (changeType === "percentage") {
        d[key] = d.value / data[i - n].value - 1;
      } else if (changeType === "value") {
        d[key] = d.value - data[i - n].value;
      }
    }
  });
}

export function vKeepAfterData(data, cutoffDate) {
  const i = d3
    .bisector((d) => d.date)
    .left(data, d3.utcParse("%Y-%m-%d")(cutoffDate));
  return data.slice(i);
}

export function vTrimData(data, cutoffDate) {
  data = data.map((d) => vKeepAfterData(d, cutoffDate));
  const n = d3.min(data, (d) => d.length);
  return data.map((d) => d.slice(0, n));
}

export function processTokensOutperformingBTCData(
  rawTokensOutperformingBTCData
) {
  const parseDate = d3.utcParse("%Y-%m-%d");
  return rawTokensOutperformingBTCData.data.beatings.map(
    ({ date, percentage }) => ({
      date: parseDate(date),
      value: percentage,
    })
  );
}
