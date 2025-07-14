export { createLangSwitch } from "./utils/langSwitch.ts";

// ---

export const createEnumValidator = function <
  E extends Record<string, string | number>,
>(enumObj: E) {
  const enumKeys = new Set(Object.keys(enumObj));
  return (key: unknown): key is keyof E =>
    typeof key === "string" && enumKeys.has(key);
};

// 相當於得到
// function isValidLang(value: unknown): value is <Enum> {
//   return Object.values(<Enum>).includes(value as <Enum>);
// }
export const createEnumValueValidator = function <
  E extends Record<string, string | number>,
>(enumObj: E) {
  const enumValues = new Set(Object.values(enumObj));
  return (value: unknown): value is E[keyof E] =>
    enumValues.has(value as E[keyof E]);
};
