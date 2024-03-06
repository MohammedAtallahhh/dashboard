import dynamic from "next/dynamic";

const FedLiquidityVsSP500 = dynamic(() =>
  import("@/components/UsLiquidity/FedLiquidityVsSP500")
);
const FedLiquidityOscillatorVsSP500 = dynamic(() =>
  import("@/components/UsLiquidity/FedLiquidityOscillatorVsSP500")
);
const OneMonthChange = dynamic(() =>
  import("@/components/UsLiquidity/OneMonthChange")
);
const ThreeMonthChange = dynamic(() =>
  import("@/components/UsLiquidity/ThreeMonthChange")
);
const SixMonthChange = dynamic(() =>
  import("@/components/UsLiquidity/SixMonthChange")
);
const OtherDeposit = dynamic(() =>
  import("@/components/UsLiquidity/OtherDeposit")
);

import { getData } from "@/lib/getUsLiquidityData";
import { colors } from "@/lib/colors";

export default async function Home() {
  const data = await getData();

  return (
    <main className="flex flex-col gap-20 w-[90%] max-w-[1200px] mx-auto pt-24 pb-5">
      <section>
        <h2 className="section-title">Net liquidity</h2>
        <FedLiquidityVsSP500 data={data} color={colors} />

        {/* <FedLiquidityOscillatorVsSP500 data={data} color={colors} /> */}
      </section>

      <section>
        <h2 className="section-title">Bank Reserves</h2>
        {/* <OneMonthChange data={data} color={colors} />
        <ThreeMonthChange data={data} color={colors} />
        <SixMonthChange data={data} color={colors} />
        <OtherDeposit data={data} color={colors} /> */}
      </section>
    </main>
  );
}
