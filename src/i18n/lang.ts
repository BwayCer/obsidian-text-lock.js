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
  setting_tab__keys__title: string;
  setting_tab__keys__create_btn_text: string;
  setting_tab__keys__rename_btn_text: string;
  setting_tab__keys__update_btn_text: string;
  setting_tab__keys__delete_btn_text: string;
  import_modal__title: string;
  import_modal__btn_text: string;
  key_modal__create_title: string;
  key_modal__rename_title: string;
  key_modal__update_title: string;
  key_modal__name_input_text: string;
  key_modal__old_password_input_text: string;
  key_modal__crypto_scheme_select_text: string;
  key_modal__password_input_text: string;
  key_modal__new_password_input_text: string;
  key_modal__confirm_password_input_text: string;
  key_modal__empty_name: string;
  key_modal__empty_password: string;
  key_modal__password_not_match: string;
  key_modal__password_incorrect: string;
  base__parse_data_content_error: string;
  command__encrypt_selection__name: string;
  general__copied_to_clipboard: string;
  general__submit: string;
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
