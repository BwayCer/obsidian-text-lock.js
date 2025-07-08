import { createLangSwitch } from "../utils.ts";
import en_US_pkg from "./en_US.ts";
import zh_TW_pkg from "./zh_TW.ts";

export interface LangPkg {
  setting_tab__config__title: string;
  setting_tab__config__import_btn_text: string;
  setting_tab__config__export_btn_text: string;
  setting_tab__config__parse_data_format_error: string;
  setting_tab__config__parse_data_content_error: string;
  setting_tab__lang__language: string;
  setting_tab__lang__not_found_lang: string;
  import_modal__title: string;
  import_modal__btn_text: string;
  base__parse_data_content_error: string;
  command__encrypt_selection__name: string;
  general__copied_to_clipboard: string;
}

export enum LangReadableCode {
  en_US = "English",
  zh_TW = "中文",
}

export const langPkgMap = {
  en_US: en_US_pkg,
  zh_TW: zh_TW_pkg,
};

export const langText = createLangSwitch<LangPkg>(langPkgMap);
