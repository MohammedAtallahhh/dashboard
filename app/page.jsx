import { getData } from "@/lib/getUsLiquidityData";

import UsLiquidity from "@/components/UsLiquidity";

export default async function UsLiquidityPage() {
  const data = await getData();

  return <UsLiquidity data={data} />;
}
