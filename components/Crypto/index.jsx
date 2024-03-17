"use client";

import dynamic from "next/dynamic";

const TokensOutperforming = dynamic(() =>
  import("@/components/Crypto/TokensOutperforming")
);
import { colors } from "@/helpers/constants";

const Crypto = ({ data }) => {
  return (
    <main className="flex flex-col gap-20 w-[90%] max-w-[1200px] mx-auto pt-32 pb-10">
      <section>
        <h2 className="section-title">Tokens Outperforming BTC</h2>
        <TokensOutperforming data={data} color={colors} />
      </section>
    </main>
  );
};

export default Crypto;
