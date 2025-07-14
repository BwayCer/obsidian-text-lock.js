import { createEnumValidator } from "./utils.ts";
import {
  LangPkg,
  langPkgMap,
  LangReadableCode,
  langText as langText_,
} from "./i18n/lang.ts";
import { cryptoCan } from "./cryptoCan.ts";

export const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const cryptoSchemes = Reflect.ownKeys(cryptoCan) as (keyof typeof cryptoCan)[];

export { LangReadableCode };

export interface KeyInfo {
  name: string;
  cryptoScheme: keyof typeof cryptoCan;
  key: string;
}

export interface TextLockData {
  langCode: keyof typeof langPkgMap;
  keys: KeyInfo[];
}

export const configPlaceholder = `{
  "langCode": "en_US",
  "keys": [
    {
      "name": "...",
      "cryptoScheme": "...",
      "key": "..."
    }
  ]
}`;

export let config: TextLockData = {
  langCode: "en_US",
  keys: [],
};

export interface CacheData {}

export const cacheData: CacheData = {};

export function langText(
  LangPkgKey: keyof LangPkg,
  replaceInfo?: Record<string, string>,
): string {
  return langText_(config.langCode, LangPkgKey, replaceInfo);
}

const isValidLangReadableCode = createEnumValidator(LangReadableCode);

export function setLang(langCode: string): boolean {
  if (!isValidLangReadableCode(langCode)) {
    return false;
  }
  config.langCode = langCode;
  return true;
}

const isValidCryptoScheme = (cryptoScheme: any): boolean => {
  return cryptoSchemes.includes(cryptoScheme);
};

export function setNewConfig(newConfig: any): boolean {
  const originLangCode = config.langCode;
  let langCode;
  if (typeof newConfig?.langCode === "string" && setLang(newConfig.langCode)) {
    langCode = newConfig.langCode;
    config.langCode = originLangCode;
  } else {
    return false;
  }

  const keys = [];
  if (newConfig?.keys && Array.isArray(newConfig.keys)) {
    for (const keyInfo of newConfig.keys) {
      if (
        typeof keyInfo.name === "string" &&
        isValidCryptoScheme(keyInfo.cryptoScheme) &&
        typeof keyInfo.key === "string"
      ) {
        keys.push({
          name: keyInfo.name,
          cryptoScheme: keyInfo.cryptoScheme,
          key: keyInfo.key,
        });
      } else {
        return false;
      }
    }
  } else {
    return false;
  }

  config = {
    langCode,
    keys,
  };
  return true;
}
