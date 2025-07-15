import {
  CryptoConfigOptional,
} from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/MySimple.ts";
import { transformBase64 } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/simple/transformConfig.ts";
import {
  derivePbkdf2Sha256e6,
  encryptAesGcm256,
} from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/simple/v202507.ts";

export type { Result } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/types/strongLang.ts";

export { MySimple } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/MySimple.ts";

export const simpleMaterial: Record<string, CryptoConfigOptional> = {
  derivePbkdf2Sha256e6,
  encryptAesGcm256,
  transformBase64,
};
