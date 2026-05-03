import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

# Вставьте ваш токен от @BotFather здесь
TOKEN = "8769551455:AAE6FEHT4CJ6WnxlMcYivm3vaJEv6JVi5Ok"

# URL вашего развернутого Web App (замените на реальный после деплоя)
# Для локального теста через Ngrok или аналоги можно использовать их URL
WEB_APP_URL = "https://your-domain.com/index.html"

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    Обработка команды /start
    """
    kb = [
        [
            InlineKeyboardButton(
                text="🚀 Открыть магазин", 
                web_app=WebAppInfo(url=WEB_APP_URL)
            )
        ]
    ]
    keyboard = InlineKeyboardMarkup(inline_keyboard=kb)
    
    await message.answer(
        f"Привет, {message.from_user.full_name}! 👋\n\n"
        "Добро пожаловать в **OPTRA Pharmacology**.\n"
        "Нажми на кнопку ниже, чтобы открыть наш магазин внутри Telegram.",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен")
