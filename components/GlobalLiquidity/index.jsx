"use client";

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
const GCBAVSSP500MoM = dynamic(() =>
  import("@/components/GlobalLiquidity/GCBAVSSP500MoM")
);
const GCBAVSSP500QoQ = dynamic(() =>
  import("@/components/GlobalLiquidity/GCBAVSSP500QoQ")
);
const GCBAVSSP5006MChange = dynamic(() =>
  import("@/components/GlobalLiquidity/GCBAVSSP5006MChange")
);
const GCBAVSSP500VSBitcoin = dynamic(() =>
  import("@/components/GlobalLiquidity/GCBAVSSP500VSBitcoin")
);
const BitcoinVSSP500OneMonthChange = dynamic(() =>
  import("@/components/GlobalLiquidity/BitcoinVSSP500OneMonthChange")
);
const BitcoinVSSP500ThreeMonthChange = dynamic(() =>
  import("@/components/GlobalLiquidity/BitcoinVSSP500ThreeMonthChange")
);
const BitcoinVSSP500SixMonthChange = dynamic(() =>
  import("@/components/GlobalLiquidity/BitcoinVSSP500SixMonthChange")
);
const BitcoinVSSP500TwelveMonthChange = dynamic(() =>
  import("@/components/GlobalLiquidity/BitcoinVSSP500TwelveMonthChange")
);

import { colors } from "@/helpers/constants";

export default function GlobalLiquidity({ data }) {
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
}
