import dynamic from "next/dynamic";

const WorldM2Growth = dynamic(() =>
  import("@/components/GlobalLiquidity/WorldM2Growth")
);

import { getData } from "@/lib/getGlobalLiquidityData";
import { colors } from "@/lib/colors";

const GlobalLiquidityPage = async () => {
  const data = await getData();
  return (
    <main className="flex flex-col gap-20 w-[90%] max-w-[1200px] mx-auto pt-24 pb-5">
      <section>
        <h2 className="section-title">Money Supply M2</h2>
        <WorldM2Growth data={data} color={colors} />
      </section>
    </main>
  );
};

export default GlobalLiquidityPage;
