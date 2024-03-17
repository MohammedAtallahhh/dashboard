"use client";

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

import { colors } from "@/helpers/constants";

export default function UsLiquidity({ data }) {
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
