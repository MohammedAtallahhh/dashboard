import { getData } from "@/lib/getCryptoData";

import Crypto from "../../components/Crypto";

const CryptoPage = async () => {
  const data = await getData();
  return <Crypto data={data} />;
};

export default CryptoPage;
