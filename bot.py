import asyncio
import logging
import sys
import os
import threading
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from http.server import SimpleHTTPRequestHandler
import socketserver

# ТОКЕН
TOKEN = "8769551455:AAE6FEHT4CJ6WnxlMcYivm3vaJEv6JVi5Ok"

# Railway автоматически определяет домен
DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "your-app.up.railway.app")
WEB_APP_URL = f"https://{DOMAIN}"

# Функция для запуска веб-сервера
def run_server():
    PORT = int(os.environ.get("PORT", 8000))
    handler = SimpleHTTPRequestHandler
    # Позволяем серверу переиспользовать порт
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Сайт запущен на порту {PORT}")
        httpd.serve_forever()

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    kb = [[InlineKeyboardButton(text="🚀 Открыть магазин", web_app=WebAppInfo(url=WEB_APP_URL))]]
    keyboard = InlineKeyboardMarkup(inline_keyboard=kb)
    
    await message.answer(
        f"Привет, {message.from_user.full_name}! 👋\n\n"
        "Добро пожаловать в **OPTRA Pharmacology**.\n"
        "Нажми на кнопку ниже, чтобы открыть наш магазин.",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

async def main() -> None:
    # Запускаем веб-сервер в отдельном потоке, чтобы он не мешал боту
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Запускаем бота
    bot = Bot(token=TOKEN)
    print(f"Бот запущен. Web App URL: {WEB_APP_URL}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass

