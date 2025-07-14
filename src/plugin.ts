import * as crypto_ from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto.ts";
import {
  CryptoConfigOptional,
  derivePbkdf2Sha256e6,
  encryptAesGcm256,
  transformBase64,
} from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/MySimple.ts";

const {
  utils: { bufferToText },
  hashSha256: hashSha256_,
} = crypto_;

export type { Result } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/types/strongLang.ts";

export async function hashSha256(text: string) {
  return bufferToText(await hashSha256_(text));
}

export { MySimple } from "https://raw.githubusercontent.com/BwayCer/tendon.js/refs/tags/v1/src/browser/crypto/MySimple.ts";

export const simpleMaterial: Record<string, CryptoConfigOptional> = {
  derivePbkdf2Sha256e6,
  encryptAesGcm256,
  transformBase64,
};
