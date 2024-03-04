import * as d3 from "d3";

import Chart from "@/components/chart";
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
    <section className="m-10">
      <Chart data={data} color={color} />
    </section>
  );
}
