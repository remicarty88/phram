#!/usr/bin/env python3
"""
Telegram Bot Handler для OPTRA Pharm
Обрабатывает заказы и позволяет общаться с клиентами прямо в боте
"""

import asyncio
import logging
import os
import time
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
import firebase_admin
from firebase_admin import credentials, db
import json

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Firebase конфигурация
if not firebase_admin._apps:
    firebase_admin.initialize_app(options={
        'databaseURL': 'https://neonapp-a05b0-default-rtdb.firebaseio.com/'
    })

# Глобальные переменные для хранения активных чатов
active_chats = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start"""
    admin_id = context.bot_data.get('admin_id', 6201234513)
    is_admin = update.effective_user.id == admin_id
    
    if is_admin:
        # Админ видит панель управления
        keyboard = [
            [InlineKeyboardButton("� Управление заказами", callback_data="admin_orders")],
            [InlineKeyboardButton("� Открыть магазин", web_app={'url': 'https://your-app-url.com'})]
        ]
        await update.message.reply_text(
            "👋 Панель администратора OPTRA Pharm!\n\n"
            "📋 Управление заказами - просмотр и обработка\n"
            "🛒 Магазин - добавление товаров\n\n"
            "Выберите действие:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    else:
        # Клиент видит магазин
        keyboard = [
            [InlineKeyboardButton("🛒 Открыть магазин", web_app={'url': 'https://your-app-url.com'})]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "👋 Добро пожаловать в OPTRA Pharm!\n\n"
            "🛍️ Выбирайте товары в нашем каталоге\n"
            "💬 Общайтесь с менеджером прямо здесь\n"
            "📦 Отслеживайте статус заказов\n\n"
            "Нажмите кнопку ниже чтобы начать:",
            reply_markup=reply_markup
        )

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка inline кнопок"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == 'admin_orders':
        # Показать админскую панель заказов
        await show_admin_orders(query, context)
    
    elif data.startswith('accept_'):
        # Принять заказ
        order_id = data.replace('accept_', '')
        await accept_order(query, order_id, context)
    
    elif data.startswith('reject_'):
        # Отклонить заказ
        order_id = data.replace('reject_', '')
        await reject_order(query, order_id, context)
    
    elif data.startswith('chat_'):
        # Начать чат с клиентом
        parts = data.replace('chat_', '').split('_')
        user_id = parts[0]
        order_id = parts[1] if len(parts) > 1 else None
        await start_chat_with_client(query, user_id, order_id, context)
    
    elif data.startswith('client_profile_'):
        # Показать профиль клиента
        user_id = data.replace('client_profile_', '')
        await show_client_profile(query, user_id, context)

async def show_admin_orders(query, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показать админскую панель заказов"""
    try:
        orders_snapshot = db.reference('orders').get()
        if not orders_snapshot:
            await query.edit_message_text("📋 Заказов пока нет")
            return
        
        keyboard = []
        pending_count = 0
        
        for order_id, order in orders_snapshot.items():
            status = order.get('status', 'pending')
            client_name = order.get('userName', 'Клиент')
            total = order.get('total', 0)
            timestamp = order.get('timestamp', 0)
            
            status_emoji = "🕐" if status == 'pending' else "✅" if status == 'accepted' else "❌"
            
            if status == 'pending':
                pending_count += 1
                keyboard.append([InlineKeyboardButton(
                    f"{status_emoji} #{order_id} - {client_name} - ${total}",
                    callback_data=f"chat_{order.get('userId')}_{order_id}"
                )])
        
        if keyboard:
            keyboard.append([InlineKeyboardButton("🔄 Обновить", callback_data="admin_orders")])
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                f"📋 Управление заказами\n\n"
                f"🕐 Новых: {pending_count}\n"
                f"📦 Всего: {len(orders_snapshot)}\n\n"
                f"Выберите заказ для начала общения:",
                reply_markup=reply_markup
            )
        else:
            await query.edit_message_text("📋 Нет активных заказов")
            
    except Exception as e:
        logger.error(f"Error showing admin orders: {e}")
        await query.edit_message_text("❌ Ошибка загрузки заказов")

async def accept_order(query, order_id: str, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Принять заказ"""
    try:
        # Обновляем статус в Firebase
        db.reference(f'orders/{order_id}').update({'status': 'accepted'})
        
        # Получаем информацию о заказе
        order_snapshot = db.reference(f'orders/{order_id}').get()
        if order_snapshot:
            order = order_snapshot
            client_name = order.get('userName', 'Клиент')
            client_id = order.get('userId')
            
            # Отправляем уведомление клиенту
            await send_order_notification_to_client(client_id, order_id, 'accepted')
            
            await query.edit_message_text(
                f"✅ Заказ #{order_id} ПРИНЯТ!\n\n"
                f"👤 Клиент: {client_name}\n"
                f"💰 Сумма: ${order.get('total', 0)}\n\n"
                f"📢 Клиенту отправлено уведомление о принятии заказа\n"
                f"💬 Нажмите чтобы начать общение с клиентом:",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("💬 Написать клиенту", 
                                       callback_data=f"chat_{client_id}_{order_id}")
                ]])
            )
            
            logger.info(f"Order {order_id} accepted by admin")
            
    except Exception as e:
        logger.error(f"Error accepting order: {e}")
        await query.edit_message_text("❌ Ошибка при принятии заказа")

async def reject_order(query, order_id: str, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Отклонить заказ"""
    try:
        # Обновляем статус в Firebase
        db.reference(f'orders/{order_id}').update({'status': 'rejected'})
        
        # Получаем информацию о заказе
        order_snapshot = db.reference(f'orders/{order_id}').get()
        if order_snapshot:
            order = order_snapshot
            client_id = order.get('userId')
            
            # Отправляем уведомление клиенту
            await send_order_notification_to_client(client_id, order_id, 'rejected')
        
        await query.edit_message_text(
            f"❌ Заказ #{order_id} ОТКЛОНЕН\n\n"
            f"📢 Клиенту отправлено уведомление об отклонении заказа"
        )
        
        logger.info(f"Order {order_id} rejected by admin")
        
    except Exception as e:
        logger.error(f"Error rejecting order: {e}")
        await query.edit_message_text("❌ Ошибка при отклонении заказа")

async def send_order_notification_to_client(client_id: str, order_id: str, status: str) -> None:
    """Отправить уведомление клиенту о статусе заказа"""
    try:
        status_emoji = "✅" if status == 'accepted' else "❌"
        status_text = "ПРИНЯТ" if status == 'accepted' else "ОТКЛОНЕН"
        
        message = (
            f"{status_emoji} Ваш заказ #{order_id} {status_text}!\n\n"
            f"📦 Статус заказа обновлен\n"
            f"👨‍💻 Менеджер скоро свяжется с вами\n\n"
            f"Спасибо за заказ!"
        )
        
        # Сохраняем уведомление в Firebase для клиента
        notification = {
            'type': 'order_status',
            'order_id': order_id,
            'status': status,
            'message': message,
            'timestamp': int(time.time())
        }
        
        db.reference(f'client_notifications/{client_id}').push(notification)
        logger.info(f"Notification sent to client {client_id} for order {order_id}")
        
    except Exception as e:
        logger.error(f"Error sending client notification: {e}")

async def start_chat_with_client(query, user_id: str, order_id: str, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Начать чат с клиентом"""
    try:
        # Получаем информацию о клиенте
        order_snapshot = db.reference(f'orders/{order_id}').get() if order_id else None
        client_name = "Клиент"
        client_username = "unknown"
        
        if order_snapshot:
            client_name = order_snapshot.get('userName', 'Клиент')
            client_username = order_snapshot.get('userUsername', 'unknown')
        
        # Сохраняем активный чат
        active_chats[user_id] = {
            'admin_id': query.from_user.id,
            'order_id': order_id,
            'client_name': client_name,
            'client_username': client_username
        }
        
        # Формируем сообщение с информацией о клиенте
        client_info = f"@{client_username}" if client_username != 'unknown' else f"ID: {user_id}"
        
        await query.edit_message_text(
            f"💬 Чат с {client_name} ({client_info})\n\n"
            f"📦 Заказ: #{order_id}\n\n"
            f"� Отправьте сообщение для клиента:\n"
            f"• Текст будет доставлен клиенту\n"
            f"• Клиент увидит в приложении\n\n"
            f"🔙 /back - к списку заказов",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🔙 К списку заказов", callback_data="back_to_orders")],
                [InlineKeyboardButton("📱 Профиль клиента", callback_data=f"client_profile_{user_id}")]
            ])
        )
        
        logger.info(f"Started chat with client {user_id} ({client_name})")
        
    except Exception as e:
        logger.error(f"Error starting chat: {e}")
        await query.edit_message_text("❌ Ошибка при начале чата")

async def show_client_profile(query, user_id: str, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показать профиль клиента"""
    try:
        # Ищем заказы клиента
        orders_snapshot = db.reference('orders').get()
        client_orders = []
        
        if orders_snapshot:
            for order_id, order in orders_snapshot.items():
                if order.get('userId') == user_id:
                    client_orders.append((order_id, order))
        
        if not client_orders:
            await query.edit_message_text("📱 У клиента нет заказов")
            return
        
        # Формируем информацию о клиенте
        latest_order = client_orders[0][1]  # Берем последний заказ
        client_name = latest_order.get('userName', 'Клиент')
        client_username = latest_order.get('userUsername', 'unknown')
        
        profile_text = (
            f"👤 Профиль клиента\n\n"
            f"📝 Имя: {client_name}\n"
            f"🔸 Username: @{client_username}\n"
            f"🆔 ID: {user_id}\n\n"
            f"📦 Заказы ({len(client_orders)}):\n"
        )
        
        for order_id, order in client_orders[:5]:  # Показываем последние 5 заказов
            status = order.get('status', 'pending')
            status_emoji = "🕐" if status == 'pending' else "✅" if status == 'accepted' else "❌"
            total = order.get('total', 0)
            profile_text += f"{status_emoji} #{order_id} - ${total}\n"
        
        await query.edit_message_text(
            profile_text,
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад", callback_data="back_to_orders")
            ]])
        )
        
    except Exception as e:
        logger.error(f"Error showing client profile: {e}")
        await query.edit_message_text("❌ Ошибка загрузки профиля")

async def back_to_orders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Вернуться к списку заказов"""
    query = update.callback_query
    await query.answer()
    
    # Показываем список активных заказов
    await show_orders_list(query, context)

async def show_orders_list(query, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показать список заказов"""
    try:
        orders_snapshot = db.reference('orders').get()
        if not orders_snapshot:
            await query.edit_message_text("📋 Заказов пока нет")
            return
        
        keyboard = []
        for order_id, order in orders_snapshot.items():
            if order.get('status') == 'pending':
                client_name = order.get('userName', 'Клиент')
                total = order.get('total', 0)
                keyboard.append([InlineKeyboardButton(
                    f"📦 #{order_id} - {client_name} - ${total}",
                    callback_data=f"chat_{order.get('userId')}_{order_id}"
                )])
        
        if keyboard:
            reply_markup = InlineKeyboardMarkup(keyboard)
            await query.edit_message_text(
                "📋 Активные заказы:\n\n"
                "Выберите заказ для начала общения:",
                reply_markup=reply_markup
            )
        else:
            await query.edit_message_text("📋 Нет активных заказов")
            
    except Exception as e:
        logger.error(f"Error showing orders: {e}")
        await query.edit_message_text("❌ Ошибка загрузки заказов")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка сообщений от админа"""
    user_id = str(update.effective_user.id)
    
    # Проверяем, есть ли активный чат
    active_chat = None
    for client_id, chat_info in active_chats.items():
        if chat_info['admin_id'] == user_id:
            active_chat = chat_info
            break
    
    if active_chat:
        # Отправляем сообщение клиенту (здесь нужна логика для доставки клиенту)
        client_id = active_chat['client_id']
        message_text = update.message.text
        
        # Сохраняем сообщение в Firebase для доставки клиенту
        message_data = {
            'from': 'admin',
            'text': message_text,
            'timestamp': int(update.message.date.timestamp()),
            'order_id': active_chat['order_id']
        }
        
        db.reference(f'chats/{client_id}').push(message_data)
        
        await update.message.reply_text(
            f"✅ Сообщение отправлено клиенту {active_chat['client_name']}\n\n"
            f"📝: {message_text}"
        )
        
        logger.info(f"Message sent to client {client_id}: {message_text}")
    else:
        await update.message.reply_text(
            "❌ Нет активного чата.\n\n"
            "Используйте /start чтобы увидеть список заказов."
        )

def main() -> None:
    """Главная функция"""
    # Ваш токен бота
    BOT_TOKEN = '8771687545:AAHheZqYf_myfyGUgutE3nYXrmfhmj0TLV4'  # Ваш токен
    ADMIN_ID = 6201234513  # Ваш ID администратора
    
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Сохраняем ADMIN_ID в контексте для использования в обработчиках
    application.bot_data['admin_id'] = ADMIN_ID
    
    # Добавляем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(handle_callback))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Запускаем бота
    print("🤖 Бот OPTRA Pharm запущен!")
    application.run_polling()

if __name__ == '__main__':
    main()

