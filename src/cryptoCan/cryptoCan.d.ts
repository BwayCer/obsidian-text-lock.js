export interface CryptoMethodResult {
  ok: boolean;
  text: string;
}

export interface CryptoKit {
  createKey(password: string): Promise<CryptoMethodResult>;
  isCorrect(password: string, key: string): Promise<boolean>;
  reencryptKey(password: string, key: string, newPassword: string): Promise<CryptoMethodResult>;
  encrypt(password: string, key: string, plainText: string): Promise<CryptoMethodResult>;
  decrypt(
    password: string,
    key: string,
    cipherText: string,
  ): Promise<CryptoMethodResult>;
}
