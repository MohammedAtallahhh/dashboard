import dynamic from "next/dynamic";

const WorldM2Growth = dynamic(() =>
  import("@/components/GlobalLiquidity/WorldM2Growth")
);
const GlobalCentralBankAssets = dynamic(() =>
  import("@/components/GlobalLiquidity/GlobalCentralBankAssets")
);
const SP500VSCentralBank = dynamic(() =>
  import("@/components/GlobalLiquidity/SP500VSCentralBank")
);
const GCBAVSSP500 = dynamic(() =>
  import("@/components/GlobalLiquidity/GCBAVSSP500")
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

      <section>
        <h2 className="section-title">Central Bank Assets</h2>
        <GlobalCentralBankAssets data={data} color={colors} />
        {/* <SP500VSCentralBank data={data} color={colors} /> */}
        <GCBAVSSP500 data={data} color={colors} />
      </section>
    </main>
  );
};

export default GlobalLiquidityPage;
