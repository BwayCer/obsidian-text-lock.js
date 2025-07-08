export interface CryptoMethodResult {
  ok: boolean;
  text: string;
}

export interface CryptoKit {
  createKey(password: string): CryptoMethodResult;
  isCorrect(password: string, key: string): boolean;
  reencryptKey(password: string, key: string, newPassword: string): CryptoMethodResult;
  encrypt(password: string, key: string, plainText: string): CryptoMethodResult;
  decrypt(
    password: string,
    key: string,
    cipherText: string,
  ): CryptoMethodResult;
}
