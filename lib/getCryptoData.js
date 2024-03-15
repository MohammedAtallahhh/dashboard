"use server";

import { vFetchTokensOutperformingBTCData } from "./api";

import { processTokensOutperformingBTCData } from "./process-data";

export const getData = async () => {
  const [rawTokensOutperformingBTCData] = await Promise.all([
    vFetchTokensOutperformingBTCData(),
  ]);

  const tokensOutperformingBTCData = processTokensOutperformingBTCData(
    rawTokensOutperformingBTCData
  );

  return { tokensOutperformingBTCData };
};
