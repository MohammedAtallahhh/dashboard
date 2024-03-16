import FedLiquidityVsSP500 from "@/components/UsLiquidity/FedLiquidityVsSP500";
import FedLiquidityOscillatorVsSP500 from "@/components/UsLiquidity/FedLiquidityOscillatorVsSP500";
import OneMonthChange from "@/components/UsLiquidity/OneMonthChange";
import ThreeMonthChange from "@/components/UsLiquidity/ThreeMonthChange";
import SixMonthChange from "@/components/UsLiquidity/SixMonthChange";
import OtherDeposit from "@/components/UsLiquidity/OtherDeposit";

import { getData } from "@/lib/getUsLiquidityData";
import { colors } from "@/lib/colors";

export default async function Home() {
  const data = await getData();

  return (
    <main className="flex flex-col gap-20 w-[92%] max-w-[1200px] mx-auto pt-32 pb-10">
      <section>
        <h2 className="section-title">Net liquidity</h2>
        <FedLiquidityVsSP500 data={data} color={colors} />

        <FedLiquidityOscillatorVsSP500 data={data} color={colors} />
      </section>

      <section>
        <h2 className="section-title">Bank Reserves</h2>
        <OneMonthChange data={data} color={colors} />
        <ThreeMonthChange data={data} color={colors} />
        <SixMonthChange data={data} color={colors} />
        <OtherDeposit data={data} color={colors} />
      </section>
    </main>
  );
}
