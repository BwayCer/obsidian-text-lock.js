export interface KeyInfo {
  name: string;
  cryptoScheme: string;
  key: string;
}

export interface TextLockData {
  keys: KeyInfo[];
}

export const configPlaceholder = `{
  "keys": [
    {
      "name": "...",
      "cryptoScheme": "...",
      "key": "..."
    }
  ]
}`;

export let config: TextLockData = {
  keys: [],
};

export function setNewConfig(newConfig: any): boolean {
  const keys = [];
  if (newConfig?.keys && Array.isArray(newConfig.keys)) {
    for (const keyInfo of newConfig.keys) {
      if (
        typeof keyInfo.name === "string" &&
        typeof keyInfo.cryptoScheme === "string" &&
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
    keys,
  };
  return true;
}
