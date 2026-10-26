// src/lib/notify.ts
import "server-only";
import { after } from "next/server";

type Notice = { title: string; detail?: string; path?: string };

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* un aviso fallido nunca debe romper la acción del invitado */
  }
}

export function notifyAdmin({ title, detail, path }: Notice) {
  const site = process.env.SITE_URL?.replace(/\/$/, "");
  const lines = [title, detail, site && path ? `${site}${path}` : undefined].filter(Boolean);
  after(() => sendTelegram(lines.join("\n")));
}