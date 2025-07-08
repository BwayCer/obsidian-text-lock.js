import type { LangPkg } from "./lang.ts";

const langPkg: LangPkg = {
  setting_tab__config__title: "Data Settings",
  setting_tab__config__import_btn_text: "Import",
  setting_tab__config__export_btn_text: "Export",
  setting_tab__config__parse_data_format_error:
    "Error parsing data format from settings.",
  setting_tab__config__parse_data_content_error:
    "Error parsing data content from settings.",
  setting_tab__lang__language: "Language",
  setting_tab__lang__not_found_lang: 'Not found "{{lang}}" language',
  setting_tab__keys__title: "Key List",
  setting_tab__keys__create_btn_text: "Add Key",
  setting_tab__keys__rename_btn_text: "Rename",
  setting_tab__keys__update_btn_text: "Update",
  setting_tab__keys__delete_btn_text: "Delete",
  setting_tab__keys__name_updated_notice: "Name updated.",
  setting_tab__keys__password_created_notice: "Password created.",
  setting_tab__keys__password_create_failed_notice: "Password create failed.",
  setting_tab__keys__password_updated_notice: "Password updated.",
  setting_tab__keys__password_update_failed_notice: "Password update failed.",
  setting_tab__keys__password_deleted_notice: "Password deleted.",
  import_modal__title: "Import Data",
  import_modal__btn_text: "Import",
  key_modal__create_title: "Create Key",
  key_modal__rename_title: "Rename: {{name}}",
  key_modal__update_title: "Update Password: {{name}}",
  key_modal__name_input_text: "Name",
  key_modal__old_password_input_text: "Old Password",
  key_modal__crypto_scheme_select_text: "Crypto Scheme",
  key_modal__password_input_text: "Password",
  key_modal__new_password_input_text: "New Password",
  key_modal__confirm_password_input_text: "Confirm {{title}}",
  key_modal__empty_name: "Name is empty.",
  key_modal__empty_password: "Password is empty.",
  key_modal__password_not_match: "Password do not match.",
  key_modal__password_incorrect: "Old password is incorrect.",
  base__parse_data_content_error:
    "Text Lock: Error parsing data content from cache.",
  command__encrypt_selection__name: "Encrypt selection",
  general__copied_to_clipboard: "Copied to clipboard.",
  general__submit: "Submit",
};

export default langPkg;
