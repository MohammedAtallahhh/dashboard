import { getData } from "@/lib/getGlobalLiquidityData";

import GlobalLiquidity from "@/components/GlobalLiquidity";

export default async function GlobalLiquidityPage() {
  const data = await getData();

  return <GlobalLiquidity data={data} />;
}
