import { MySimple, Result, simpleMaterial } from "../plugin.ts";
import type { CryptoKit, CryptoMethodResult } from "./cryptoCan.d.ts";

export interface KeyData {
  subKey: string;
}

let cryptoSimple!: MySimple;

export default class AES_GCM_256 implements CryptoKit {
  // static name = cryptoSimple.name("encrypt") + "+v1";
  static name = "AES-GCM-256+PBKDF2-SHA-256-IterE6+Base64+v1";

  constructor() {
    if (!cryptoSimple) {
      cryptoSimple = new MySimple(
        simpleMaterial.derivePbkdf2Sha256e6,
        simpleMaterial.encryptAesGcm256,
        simpleMaterial.transformBase64,
      );
    }
  }

  async createKey(password: string): Promise<CryptoMethodResult> {
    const keyTxt = await cryptoSimple.exportKey(
      await cryptoSimple.generateEncryptKey(),
    );
    const keyData: KeyData = {
      subKey: keyTxt,
    };
    const encryptKeyResult = await this.encryptKey(password, keyData);
    if (encryptKeyResult.ok) {
      return { ok: true, text: encryptKeyResult.value };
    } else {
      return { ok: false, text: "" };
    }
  }

  private encryptKey(
    password: string,
    keyData: KeyData,
  ): Promise<Result<string>> {
    const keyDataTxt = JSON.stringify(keyData);
    return cryptoSimple.encrypt(password, keyDataTxt);
  }

  private async decryptKey(
    password: string,
    key: string,
  ): Promise<{ ok: boolean; data: KeyData | null }> {
    const result = await cryptoSimple.decrypt(password, key);
    if (result.ok) {
      const keyData = JSON.parse(result.value) as KeyData;
      return { ok: true, data: keyData };
    } else {
      return { ok: false, data: null };
    }
  }

  async isCorrect(password: string, key: string): Promise<boolean> {
    const { ok } = await this.decryptKey(password, key);
    return ok;
  }

  async reencryptKey(
    password: string,
    key: string,
    newPassword: string,
  ): Promise<CryptoMethodResult> {
    const { ok, data: keyData } = await this.decryptKey(password, key);
    if (ok) {
      const encryptKeyResult = await this.encryptKey(newPassword, keyData!);
      if (encryptKeyResult.ok) {
        return { ok: true, text: encryptKeyResult.value };
      }
    }
    return { ok: false, text: "" };
  }

  async encrypt(
    password: string,
    key: string,
    plainText: string,
  ): Promise<CryptoMethodResult> {
    const { ok, data: keyData } = await this.decryptKey(password, key);
    if (ok) {
      const importEncryptKeyResult = await cryptoSimple.importEncryptKey(
        keyData!.subKey,
      );
      if (importEncryptKeyResult.ok) {
        const subKey = importEncryptKeyResult.value;
        const encryptResult = await cryptoSimple.encrypt(subKey, plainText);
        if (encryptResult.ok) {
          const cipherText = encryptResult.value;
          return { ok: true, text: cipherText };
        }
      }
    }
    return { ok: false, text: "" };
  }

  async decrypt(
    password: string,
    key: string,
    cipherText: string,
  ): Promise<CryptoMethodResult> {
    const { ok, data: keyData } = await this.decryptKey(password, key);
    if (ok) {
      const importEncryptKeyResult = await cryptoSimple.importEncryptKey(
        keyData!.subKey,
      );
      if (importEncryptKeyResult.ok) {
        const subKey = importEncryptKeyResult.value;
        const decryptResult = await cryptoSimple.decrypt(subKey, cipherText);
        if (decryptResult.ok) {
          return { ok: true, text: decryptResult.value };
        }
      }
    }
    return { ok: false, text: "" };
  }
}
