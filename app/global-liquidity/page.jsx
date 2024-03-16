import WorldM2Growth from "@/components/GlobalLiquidity/WorldM2Growth";
import GlobalCentralBankAssets from "@/components/GlobalLiquidity/GlobalCentralBankAssets";
import SP500VSCentralBank from "@/components/GlobalLiquidity/SP500VSCentralBank";
import GCBAVSSP500MoM from "@/components/GlobalLiquidity/GCBAVSSP500MoM";
import GCBAVSSP500QoQ from "@/components/GlobalLiquidity/GCBAVSSP500QoQ";
import GCBAVSSP5006MChange from "@/components/GlobalLiquidity/GCBAVSSP5006MChange";
import GCBAVSSP500VSBitcoin from "@/components/GlobalLiquidity/GCBAVSSP500VSBitcoin";
import BitcoinVSSP500OneMonthChange from "@/components/GlobalLiquidity/BitcoinVSSP500OneMonthChange";
import BitcoinVSSP500ThreeMonthChange from "@/components/GlobalLiquidity/BitcoinVSSP500ThreeMonthChange";
import BitcoinVSSP500SixMonthChange from "@/components/GlobalLiquidity/BitcoinVSSP500SixMonthChange";
import BitcoinVSSP500TwelveMonthChange from "@/components/GlobalLiquidity/BitcoinVSSP500TwelveMonthChange";

import { getData } from "@/lib/getGlobalLiquidityData";
import { colors } from "@/lib/colors";

const GlobalLiquidityPage = async () => {
  const data = await getData();
  return (
    <main className="flex flex-col gap-20 w-[92%] max-w-[1200px] mx-auto pt-32 pb-10">
      <section>
        <h2 className="section-title">Money Supply M2</h2>
        <WorldM2Growth data={data} color={colors} />
      </section>

      <section>
        <h2 className="section-title">Central Bank Assets</h2>
        <GlobalCentralBankAssets data={data} color={colors} />
        <SP500VSCentralBank data={data} color={colors} />
        <GCBAVSSP500MoM data={data} color={colors} />
        <GCBAVSSP500QoQ data={data} color={colors} />
        <GCBAVSSP5006MChange data={data} color={colors} />
        <GCBAVSSP500VSBitcoin data={data} color={colors} />
        <BitcoinVSSP500OneMonthChange data={data} color={colors} />
        <BitcoinVSSP500ThreeMonthChange data={data} color={colors} />
        <BitcoinVSSP500SixMonthChange data={data} color={colors} />
        <BitcoinVSSP500TwelveMonthChange data={data} color={colors} />
      </section>
    </main>
  );
};

export default GlobalLiquidityPage;
