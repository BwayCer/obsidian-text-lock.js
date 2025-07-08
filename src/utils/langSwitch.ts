/**
 * 建立多語系查詢函數，可用於根據語言代碼與 key 查詢詞條。
 * 支援 `{{key}}` 替換樣板。
 *
 * @param langPkgMap 語言對應的詞條物件集合
 * @returns 回傳一個函數，可根據語言代碼、key 和替換變數取得字串
 *
 * @example
 * const langPkgMap = {
 *   en_US: { greeting: "Hello {{name}}!" },
 *   zh_TW: { greeting: "你好，{{name}}！" },
 * };
 * const langText = createLangSwitch(langPkgMap);
 * langText("en", "greeting", { name: "Alice" }); // => "Hello Alice!"
 */
export function createLangSwitch<
  R extends { [K in keyof R]: string },
  T extends Record<string, R> = Record<string, R>
>(langPkgMap: T) {
  return function langText<
    L extends keyof T,
    K extends keyof T[L],
    J extends Record<string, string>,
  >(langCode: L, langPkgKey: K, replaceInfo?: J): string {
    const text = langPkgMap[langCode][langPkgKey];
    return replaceInfo
      ? Object.entries(replaceInfo).reduce<string>(
        (accu, [key, value]) => accu.replaceAll("{{" + key + "}}", value),
        text,
      )
      : text;
  };
}
