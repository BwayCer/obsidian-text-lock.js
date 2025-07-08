import AES_GCM_256_v1 from "./cryptoCan/aes-gcm-256-v1.ts";

export type { CryptoMethodResult, CryptoKit } from "./cryptoCan/cryptoCan.d.ts";

export const cryptoCan = {
  "AES-GCM-256-v1": new AES_GCM_256_v1(),
};
