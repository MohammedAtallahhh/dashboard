import { vFetchTokensOutperformingBTCData } from "./api";

import { processTokensOutperformingBTCData } from "./process-data";

export const getData = async () => {
  const [rawTokensOutperformingBTCData] = await Promise.all([
    vFetchTokensOutperformingBTCData(),
  ]);

  console.log({
    rawTokensOutperformingBTCData,
  });

  const tokensOutperformingBTCData = processTokensOutperformingBTCData(
    rawTokensOutperformingBTCData
  );

  return { tokensOutperformingBTCData };
};
