// Telegram Bot API Client

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      first_name?: string;
    };
    text?: string;
    photo?: Array<{ file_id: string; file_size: number }>;
    video?: { file_id: string; file_size: number };
    document?: { file_id: string; file_name?: string };
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
    };
    message?: {
      message_id: number;
      chat: { id: number };
      text?: string;
    };
    data?: string;
  };
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
}

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '';

export class TelegramBot {
  private baseUrl: string;
  private adminChatId: string;

  constructor(token?: string, adminChatId?: string) {
    this.baseUrl = `https://api.telegram.org/bot${token || BOT_TOKEN}`;
    this.adminChatId = adminChatId || ADMIN_CHAT_ID;
  }

  async request<T>(method: string, payload?: Record<string, unknown>): Promise<TelegramResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      return await response.json();
    } catch (error) {
      console.error('Telegram API error:', error);
      return { ok: false, description: String(error) };
    }
  }

  async sendMessage(
    chatId: string | number,
    text: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      reply_markup?: InlineKeyboardMarkup;
      disable_notification?: boolean;
    }
  ): Promise<TelegramResponse<TelegramMessage>> {
    return this.request<TelegramMessage>('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'HTML',
      reply_markup: options?.reply_markup,
      disable_notification: options?.disable_notification,
    });
  }

  async sendAdmin(
    text: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      reply_markup?: InlineKeyboardMarkup;
      disable_notification?: boolean;
    }
  ): Promise<TelegramResponse<TelegramMessage>> {
    return this.sendMessage(this.adminChatId, text, options);
  }

  async editMessageText(
    chatId: string | number,
    messageId: number,
    text: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      reply_markup?: InlineKeyboardMarkup;
    }
  ): Promise<TelegramResponse<TelegramMessage>> {
    return this.request<TelegramMessage>('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: options?.parse_mode || 'HTML',
      reply_markup: options?.reply_markup,
    });
  }

  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert?: boolean
  ): Promise<TelegramResponse<boolean>> {
    return this.request<boolean>('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    });
  }

  async getUpdates(offset?: number, timeout = 30): Promise<TelegramResponse<TelegramUpdate[]>> {
    return this.request<TelegramUpdate[]>('getUpdates', {
      offset,
      timeout,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  async setWebhook(url: string): Promise<TelegramResponse<boolean>> {
    return this.request<boolean>('setWebhook', { url });
  }

  async deleteWebhook(): Promise<TelegramResponse<boolean>> {
    return this.request<boolean>('deleteWebhook');
  }

  async getMe(): Promise<TelegramResponse<{ id: number; is_bot: boolean; first_name: string; username?: string }>> {
    return this.request('getMe');
  }

  async sendPhoto(
    chatId: string | number,
    photo: string | Buffer,
    caption?: string
  ): Promise<TelegramResponse<TelegramMessage>> {
    if (typeof photo === 'string') {
      return this.request<TelegramMessage>('sendPhoto', {
        chat_id: chatId,
        photo,
        caption,
        parse_mode: 'HTML',
      });
    }
    // For buffer, we need multipart/form-data which is more complex
    // For now, return error
    return { ok: false, description: 'Buffer photos not supported in this implementation' };
  }
}

// Helper functions to build keyboards
export function buildInlineKeyboard(buttons: InlineKeyboardButton[][]): InlineKeyboardMarkup {
  return { inline_keyboard: buttons };
}

export function inlineButton(text: string, callbackData: string): InlineKeyboardButton {
  return { text, callback_data: callbackData };
}

// Singleton instance
let botInstance: TelegramBot | null = null;

export function getTelegramBot(): TelegramBot {
  if (!botInstance) {
    botInstance = new TelegramBot();
  }
  return botInstance;
}
