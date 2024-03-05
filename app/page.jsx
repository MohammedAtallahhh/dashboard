import FedLiquidityVsSP500 from "@/components/FedLiquidityVsSP500";
import FedLiquidityOscillatorVsSP500 from "@/components/FedLiquidityOscillatorVsSP500";

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
    <main>
      <section className="m-10">
        <h2 className="section-title">Net liquidity</h2>
        <FedLiquidityVsSP500 data={data} color={color} />
        <FedLiquidityOscillatorVsSP500 data={data} color={color} />
      </section>
    </main>
  );
}
