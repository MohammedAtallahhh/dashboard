import dynamic from "next/dynamic";

const TokensOutperforming = dynamic(() =>
  import("@/components/Crypto/TokensOutperforming")
);

import { getData } from "@/lib/getCryptoData";
import { colors } from "@/lib/colors";

const CryptoPage = async () => {
  const data = await getData();
  return (
    <main className="flex flex-col gap-20 w-[90%] max-w-[1200px] mx-auto pt-24 pb-5">
      <section>
        <h2 className="section-title">Tokens Outperforming BTC</h2>
        <TokensOutperforming data={data} color={colors} />
      </section>
    </main>
  );
};

export default CryptoPage;
