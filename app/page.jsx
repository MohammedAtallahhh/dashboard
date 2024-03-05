import dynamic from "next/dynamic";

// import FedLiquidityVsSP500 from "@/components/FedLiquidityVsSP500";
// import FedLiquidityOscillatorVsSP500 from "@/components/FedLiquidityOscillatorVsSP500";
// import OneMonthChange from "@/components/OneMonthChange";
// import ThreeMonthChange from "@/components/ThreeMonthChange";

const FedLiquidityVsSP500 = dynamic(() =>
  import("@/components/FedLiquidityVsSP500")
);
const FedLiquidityOscillatorVsSP500 = dynamic(() =>
  import("@/components/FedLiquidityOscillatorVsSP500")
);
const OneMonthChange = dynamic(() => import("@/components/OneMonthChange"));
const ThreeMonthChange = dynamic(() => import("@/components/ThreeMonthChange"));
const SixMonthChange = dynamic(() => import("@/components/SixMonthChange"));
const OtherDeposit = dynamic(() => import("@/components/OtherDeposit"));

import { fetchAndProcessUsLiquidityData } from "@/lib/fetchUsLiquidityData";

export default async function Home() {
  const data = await fetchAndProcessUsLiquidityData();

  const color = {
    scatter: {
      default: "#169d7d",
      highlight: "#ffffff",
    },
    lineArea: {
      neutral: "#b7b7b9",
      highlight: "#2c2c31",
      areas: ["#169d7d", "#7469c2", "#e96b42", "#b4579a", "#b6744b"],
      lines: ["#6bdbc0", "#b0a3ff", "#ffaf97", "#eaa7d6", "#e3bc75", "#b6744b"],
    },
  };

  return (
    <main className="flex flex-col gap-20 w-[90%] max-w-[1200px] mx-auto pt-24 pb-5">
      <section>
        <h2 className="section-title">Net liquidity</h2>
        <FedLiquidityVsSP500 data={data} color={color} />

        <FedLiquidityOscillatorVsSP500 data={data} color={color} />
      </section>

      <section>
        <h2 className="section-title">Bank Reserves</h2>
        <OneMonthChange data={data} color={color} />
        <ThreeMonthChange data={data} color={color} />
        <SixMonthChange data={data} color={color} />
        <OtherDeposit data={data} color={color} />
      </section>
    </main>
  );
}
