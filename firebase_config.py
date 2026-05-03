import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import os
from dotenv import load_dotenv

load_dotenv()

def init_firebase():
    # Проверяем, инициализировано ли уже приложение
    if not firebase_admin._apps:
        # Для безопасности на сервере лучше использовать путь к файлу из переменной окружения
        # или загружать JSON ключа напрямую
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "serviceAccountKey.json")
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                'databaseURL': os.getenv("FIREBASE_DB_URL")
            })
            return True
        else:
            print(f"Ошибка: Файл {cred_path} не найден.")
            return False
    return True

def get_products():
    ref = db.reference('products')
    return ref.get()

def add_product(name, price, image_url, category="General"):
    ref = db.reference('products')
    new_product_ref = ref.push()
    new_product_ref.set({
        'name': name,
        'price': price,
        'image_url': image_url,
        'category': category
    })
    return new_product_ref.key

def update_product(product_id, data):
    ref = db.reference(f'products/{product_id}')
    ref.update(data)

def delete_product(product_id):
    ref = db.reference(f'products/{product_id}')
    ref.delete()
