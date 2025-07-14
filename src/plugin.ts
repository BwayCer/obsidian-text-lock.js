import {
  CryptoConfigOptional,
  derivePbkdf2Sha256e6,
  encryptAesGcm256,
  transformBase64,
} from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/MySimple.ts";

export type { Result } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/types/strongLang.ts";

export { MySimple } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/MySimple.ts";

export const simpleMaterial: Record<string, CryptoConfigOptional> = {
  derivePbkdf2Sha256e6,
  encryptAesGcm256,
  transformBase64,
};
