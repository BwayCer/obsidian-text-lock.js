import { cacheData } from "../data.ts";
import { hashSha256 } from "../plugin.ts";

export interface CryptoMethodResult {
  ok: boolean;
  text: string;
}

export abstract class CryptoKit {
  abstract createKey(password: string): Promise<CryptoMethodResult>;

  abstract isCorrect(password: string, key: string): Promise<boolean>;

  abstract reencryptKey(
    password: string,
    key: string,
    newPassword: string,
  ): Promise<CryptoMethodResult>;

  abstract encrypt(
    password: string,
    key: string,
    plainText: string,
  ): Promise<CryptoMethodResult>;

  abstract decrypt(
    password: string,
    key: string,
    cipherText: string,
  ): Promise<CryptoMethodResult>;

  protected async _getCacheKey(password: string): Promise<CryptoKey | null> {
    const hashTxt = await hashSha256(password);
    return hashTxt === cacheData.sss.pp ? cacheData.sss.kk : null;
  }

  protected async _setCacheData(password: string, subKey: CryptoKey) {
    const hashTxt = await hashSha256(password);
    cacheData.sss.pp = hashTxt;
    cacheData.sss.kk = subKey;
  }
}
