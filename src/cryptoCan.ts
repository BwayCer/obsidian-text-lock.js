import AES_GCM_256_v1 from "./cryptoCan/aes-gcm-256-v1.ts";
import type { CryptoKit } from "./cryptoCan/cryptoCan.d.ts";

export type { CryptoKit, CryptoMethodResult } from "./cryptoCan/cryptoCan.d.ts";

export const cryptoCan: Record<string, CryptoKit> = {
  [AES_GCM_256_v1.name]: new AES_GCM_256_v1(),
};
