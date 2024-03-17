const CORS_PROXY = "https://corsproxy.io/?";
const CRYPTO_BASE_URL = "/wp-json/fr-financial-charts/v1/proxy_get?url=";
// const CRYPTO_BASE_URL = "http://18.233.170.245/";

export async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 60000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export async function vFetchOrThrow(url) {
  return fetchWithTimeout(url)
    .then((res) => res.json())
    .catch((error) => {
      console.error({ error });
      throw Error(`Failed to retrieve data from ${url}`);
    });
}

export function vFetchSP500Data(startDate) {
  let url = `${CORS_PROXY}${encodeURIComponent(
    `https://api.tiingo.com/tiingo/daily/spy/prices?token=f610a523b3590b174a1710ae75c30a9d23707ef6&startDate=${startDate}`
  )}`;
  return vFetchOrThrow(url);
}

export function vFetchFromStlouisfed(seriesId, startDate) {
  let url = `${CORS_PROXY}${encodeURIComponent(
    `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=5d659137dd9d0d29448c0eecf245f45b&file_type=json&observation_start=${startDate}`
  )}`;
  return vFetchOrThrow(url);
}

export function vFetchBankReservesData(startDate) {
  return vFetchFromStlouisfed("WRESBAL", startDate);
}

export function vFetchODLData(startDate) {
  return vFetchFromStlouisfed("ODSACBW027SBOG", startDate);
}

export function vFetchReposData(startDate) {
  return vFetchFromStlouisfed("RRPONTSYD", startDate);
}

export function vFetchBTFPCreditFacilitiesData(startDate) {
  return vFetchFromStlouisfed("WLCFLL", startDate);
}

export function vFetchFedAssetsData(startDate) {
  return vFetchFromStlouisfed("RESPPANWW", startDate); // https://fred.stlouisfed.org/series/RESPPANWW Millions of U.S. Dollars
}

export function vFetchEUAssetsData(startDate) {
  return vFetchFromStlouisfed("ECBASSETSW", startDate); // https://fred.stlouisfed.org/series/ECBASSETSW Millions of Euros
}

export function vFetchJapanAssetsData(startDate) {
  return vFetchFromStlouisfed("JPNASSETS", startDate); // https://fred.stlouisfed.org/series/JPNASSETS 100 Million Yen
}

export function vFetchChinaExchangeRate(startDate) {
  return vFetchFromStlouisfed("DEXCHUS", startDate); // https://fred.stlouisfed.org/series/DEXCHUS Chinese Yuan Renminbi to One U.S. Dollar
}

export function vFetchEUExchangeRate(startDate) {
  return vFetchFromStlouisfed("DEXUSEU", startDate); // https://fred.stlouisfed.org/series/DEXUSEU U.S. Dollars to One Euro
}

export function vFetchJapanExchangeRate(startDate) {
  return vFetchFromStlouisfed("DEXJPUS", startDate); // https://fred.stlouisfed.org/series/DEXJPUS Japanese Yen to One U.S. Dollar
}

export function vFetchTGAData(startDate) {
  let urls = [
    `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?filter=record_date:gte:${startDate},account_type:eq:Federal%20Reserve%20Account&fields=record_date,close_today_bal&page[size]=10000`,
    `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?filter=record_date:gte:2021-10-01,account_type:eq:Treasury%20General%20Account%20(TGA)&fields=record_date,close_today_bal&page[size]=10000`,
    `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?filter=record_date:gte:2022-04-18,account_type:eq:Treasury%20General%20Account%20(TGA)%20Closing%20Balance&fields=record_date,open_today_bal&page[size]=10000`,
  ];
  return Promise.all(urls.map((url) => vFetchOrThrow(url)));
}

export function vFetchBTCData(startDate) {
  const from = Math.round(new Date(startDate) / 1000);
  const to = Math.round(Date.now() / 1000);
  let url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
  return vFetchOrThrow(url);
}

// country_code	indicator_code	identifier	series_id	description
// CN	017	CN.017.M.01	8081	China: Central Bank Balance Sheet [CN: Monetary Authority (MA): Assets]
// US	148	US.148.M.01	43897	United States: Money Supply M2 [US: Money Supply M2 (M2)]
// CN	148	CN.148.M.01	8296	China: Money Supply M2 [CN: Money Supply M2]
// EA	148	EA.148.M.01	13691	Euro Area: Money Supply M2 [EA: M2]
// JP	148	JP.148.M.01	20983	Japan: Money Supply M2 [JP: M2: MA]
export function vFetchNasdaqData(startDate) {
  let url = `${CORS_PROXY}${encodeURIComponent(
    `https://data.nasdaq.com/api/v3/datatables/EDIA/ECD?date.gte=${startDate}&series_id=8081,43897,8296,13691,20983&qopts.columns=country_code,indicator_code,date,value&api_key=UK6aURXvEgsG6bMThvw5`
  )}`;

  return vFetchOrThrow(url);
}

export function vFetchTokensOutperformingBTCData() {
  // const url = `${CRYPTO_BASE_URL}beating_btc`;
  const url = `http://164.92.124.44/beating_btc`;
  return vFetchOrThrow(url);
}
