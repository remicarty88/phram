import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import os
from dotenv import load_dotenv

load_dotenv()

# Инициализация
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv("FIREBASE_DB_URL")
})

products_to_add = [
    {
        "category": "inject", 
        "name": "Test Undecanoate", 
        "price": 55, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", 
        "desc": "Инъекционный тестостерон пролонгированного действия. Способствует набору сухой мышечной массы, увеличивает силовые показатели и поддерживает высокую работоспособность.", 
        "protocol": "Концентрация: 250mg/ml. Раствор для инъекций 10ml VIAL. Производитель: Magnus Pharmaceuticals (EU)."
    },
    {
        "category": "peptide", 
        "name": "GH SOMATROPIX", 
        "price": 95, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", 
        "desc": "Гормон роста Somatropix 100 ед. Качество люкс для максимального восстановления и роста.", 
        "protocol": "Дозировка: 2-5 ЕД в сутки. Инъекции подкожно."
    },
    {
        "category": "peptide", 
        "name": "BPC-157", 
        "price": 45, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", 
        "desc": "Пептид для ускоренного восстановления связок, суставов и заживления тканей.", 
        "protocol": "250-500мкг 2 раза в день локально или подкожно."
    }
]

def seed():
    ref = db.reference('products')
    # Очищаем текущие товары (опционально)
    ref.delete()
    
    print("Начинаю загрузку товаров...")
    for p in products_to_add:
        new_ref = ref.push()
        new_ref.set(p)
        print(f"Добавлен: {p['name']}")
    print("Готово!")

if __name__ == "__main__":
    seed()
