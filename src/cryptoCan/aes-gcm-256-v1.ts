import type { CryptoKit, CryptoMethodResult } from "./cryptoCan.d.ts";

/**
 * Encodes a string to a Base64 string, safely handling Unicode characters.
 *
 * @param str The input string to encode.
 * @returns The Base64 encoded string.
 */
function stringToBase64(str: string): string {
  // 1. Encode the string to a Uint8Array (UTF-8 bytes)
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(str);

  // 2. Convert the Uint8Array to a "binary string"
  //    (where each character's code point represents a byte value)
  let binaryString = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }

  // 3. Base64 encode the "binary string"
  return btoa(binaryString);
}

/**
 * Decodes a Base64 string back to its original string, safely handling Unicode characters.
 *
 * @param base64 The Base64 string to decode.
 * @returns The decoded original string.
 */
function base64ToString(base64: string): string {
  // 1. Base64 decode the string into a "binary string"
  const binaryString = atob(base64);

  // 2. Convert the "binary string" to a Uint8Array
  const utf8Bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    utf8Bytes[i] = binaryString.charCodeAt(i);
  }

  // 3. Decode the Uint8Array back to a JavaScript string (UTF-8)
  const decoder = new TextDecoder();
  return decoder.decode(utf8Bytes);
}

export interface KeyData {
  subKey: string;
  password: string;
}

export default class AES_GCM_256 implements CryptoKit {
  createKey(password: string): CryptoMethodResult {
    const keyData: KeyData = {
      subKey: "👋🌍✨",
      password: password,
    };
    const key = stringToBase64(JSON.stringify(keyData));
    return { ok: true, text: key };
  }

  private decryptKey(
    password: string,
    key: string,
  ): { ok: boolean; data: KeyData | null } {
    try {
      const keyData = JSON.parse(base64ToString(key));
      const ok = keyData.password === password;
      return { ok: ok, data: ok ? keyData : null };
    } catch (_) {
      return { ok: false, data: null };
    }
  }

  isCorrect(password: string, key: string): boolean {
    try {
      const { ok } = this.decryptKey(password, key);
      return ok;
    } catch (_) {
      return false;
    }
  }

  reencryptKey(
    password: string,
    key: string,
    newPassword: string,
  ): CryptoMethodResult {
    const rtnResult = { ok: false, text: "" };
    try {
      const { ok, data: keyData } = this.decryptKey(password, key);
      if (ok) {
        keyData!.password = newPassword;
        const newKey = stringToBase64(JSON.stringify(keyData));
        rtnResult.ok = true;
        rtnResult.text = newKey;
      }
    } catch (_) {
      // do nothing
    }
    return rtnResult;
  }

  encrypt(
    password: string,
    key: string,
    plainText: string,
  ): CryptoMethodResult {
    const rtnResult = { ok: false, text: "" };
    try {
      const decryptKeyResult = this.decryptKey(password, key);
      if (!decryptKeyResult.ok) {
        return rtnResult;
      }

      // const subKey = decryptKeyResult.text;
      const cipherText = stringToBase64(JSON.stringify(plainText));
      return { ok: true, text: cipherText };
    } catch (_) {
      return rtnResult;
    }
  }

  decrypt(
    password: string,
    key: string,
    cipherText: string,
  ): CryptoMethodResult {
    const rtnResult = { ok: false, text: "" };
    try {
      const decryptKeyResult = this.decryptKey(password, key);
      if (!decryptKeyResult.ok) {
        return rtnResult;
      }

      // const subKey = decryptKeyResult.text;
      const plainText = JSON.parse(base64ToString(cipherText));
      return { ok: true, text: plainText };
    } catch (_) {
      return rtnResult;
    }
  }
}
