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
    # Инъекции
    { 
        "category": "inject", "name": "Test Undecanoate", "brand": "Magnus Pharmaceuticals", "price": 55, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet", 
        "desc": "Инъекционный тестостерон пролонгированного действия. Способствует набору сухой мышечной массы, увеличивает силовые показатели и поддерживает высокую работоспособность. Фармацевтическое качество (GMP).", 
        "protocol": "Концентрация: 250mg/ml. Раствор для инъекций 10ml VIAL. Производитель: Magnus Pharmaceuticals (EU)." 
    },
    { 
        "category": "inject", "name": "DHB Cypionate", "brand": "ZPHC", "price": 80, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet", 
        "desc": "Дигидроболденон ципионат 100 мг/мл в ампулах. Мощный анаболик.", 
        "protocol": "100-200мг в неделю." 
    },
    { 
        "category": "inject", "name": "Test Enanthate", "brand": "ZPHC", "price": 48, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet", 
        "desc": "Тестостерон энантат 10мл 250мг/мл. Классика для массонабора.", 
        "protocol": "250-500мг в неделю." 
    },
    { 
        "category": "inject", "name": "TriTren", "brand": "ZPHC", "price": 70, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "activity", 
        "desc": "Смесь трех эфиров тренболона 10мл 150 мг/мл.", 
        "protocol": "150-300мг в неделю." 
    },
    # Оральные
    { 
        "category": "oral", "name": "Oxy", "brand": "ZPHC", "price": 82, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill", 
        "desc": "Оксиметолон 50 мг / 100 таб. Самый мощный оральный препарат.", 
        "protocol": "50-100мг в день." 
    },
    { 
        "category": "oral", "name": "Metan", "brand": "SciPharmaTech", "price": 25, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill", 
        "desc": "Метандиенон 10мг / 100 таб. Классика массы.", 
        "protocol": "30-50мг в день." 
    },
    # Пептиды
    { 
        "category": "peptide", "name": "GH SOMATROPIX", "brand": "Somatropix", "price": 95, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna", 
        "desc": "Гормон роста Somatropix 100 ед. Качество люкс.", 
        "protocol": "2-5 ЕД в сутки." 
    },
    { 
        "category": "peptide", "name": "BPC-157", "brand": "Peptide", "price": 45, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna", 
        "desc": "Пептид для восстановления связок 10 мг.", 
        "protocol": "250-500мкг 2 раза в день." 
    },
    { 
        "category": "peptide", "name": "Семаглутид", "brand": "Peptide", "price": 130, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna", 
        "desc": "Семаглутид 7 мг. Инновация для похудения.", 
        "protocol": "По схеме от 0.25мг в неделю." 
    },
    { 
        "category": "peptide", "name": "Retatrutide + KPV", "brand": "Peptide", "price": 80, 
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna", 
        "desc": "Retatrutide 5mg + KPV. Жиросжигание 3.0.", 
        "protocol": "По рекомендации специалиста." 
    }
]

def seed():
    ref = db.reference('products')
    ref.delete()
    
    print("Начинаю загрузку товаров...")
    for p in products_to_add:
        new_ref = ref.push()
        new_ref.set(p)
        print(f"Добавлен: {p['name']}")
    print("Готово! Перезапустите Web App.")

if __name__ == "__main__":
    seed()
