/**
 * Sends a Telegram message via the Bot API. Best-effort — never throws, so a
 * failed notification can't break the webhook / payment flow.
 *
 * Requires:
 *   TELEGRAM_BOT_TOKEN  (e.g. 8676364037:AAF...)
 *   TELEGRAM_CHAT_ID    (the chat/channel/user id to send to)
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID"
    );
    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      console.error("[telegram] send failed:", await res.text());
    }
  } catch (err) {
    console.error("[telegram] error:", (err as Error).message);
  }
}
