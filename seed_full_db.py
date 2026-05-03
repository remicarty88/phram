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
    # 💉 Инъекции
    {
        "category": "inject", "name": "Test undecanoate 250 mg/ml", "brand": "Magnus Pharmaceuticals", "price": 55,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Тестостерон ундеканоат — это эфир тестостерона длительного действия. Используется для поддержания стабильного уровня тестостерона, набора массы и силы.",
        "protocol": "Дозировка: 250-500 мг раз в 10-14 дней. Инъекция глубоко внутримышечно."
    },
    {
        "category": "inject", "name": "DHB cypionate 100/1 mg/ml (ampoules)", "brand": "ZPHC", "price": 80,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Дигидроболденон (DHB) — мощный анаболик, производное болденона. Обеспечивает качественный рост мышц без задержки воды.",
        "protocol": "Дозировка: 100-200 мг в неделю. Частота инъекций: раз в 3-4 дня."
    },
    {
        "category": "inject", "name": "Test Enanthate 10ml 250mg/ml", "brand": "ZPHC", "price": 48,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Классический тестостерон энантат. Основной препарат для массонаборных курсов. Увеличивает силу и объем мышц.",
        "protocol": "Дозировка: 250-500 мг в неделю. Курс: 8-12 недель."
    },
    {
        "category": "inject", "name": "Test Cypionate 10ml 250mg/ml", "brand": "ZPHC", "price": 45,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Тестостерон ципионат — один из самых популярных эфиров. Идеален для набора массы и силовых показателей.",
        "protocol": "Дозировка: 250-500 мг в неделю. Инъекция раз в неделю."
    },
    {
        "category": "inject", "name": "Test Propionate 10ml 100mg/ml", "brand": "ZPHC", "price": 32,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Короткий эфир тестостерона. Используется на курсах сушки и для быстрого старта. Минимальная задержка воды.",
        "protocol": "Дозировка: 100 мг через день. Частота: каждый второй день."
    },
    {
        "category": "inject", "name": "TriTren 10ml 150 mg/ml", "brand": "ZPHC", "price": 70,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "activity",
        "desc": "Смесь трех эфиров тренболона (ацетат, энантат, гекса). Мощнейший препарат для силы и жесткости мышц.",
        "protocol": "Дозировка: 150-300 мг в неделю. Только для опытных атлетов."
    },
    {
        "category": "inject", "name": "Tren Enanthate 10ml 200mg/ml", "brand": "ZPHC", "price": 73,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "activity",
        "desc": "Тренболон энантат — длинный эфир тренболона. Дает взрывную силу и экстремальный рост сухой массы.",
        "protocol": "Дозировка: 200-400 мг в неделю. Курс: 8-10 недель."
    },
    {
        "category": "inject", "name": "Tren Hexa 10ml 100mg/ml", "brand": "ZPHC", "price": 70,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "activity",
        "desc": "Тренболон гексагидробензилкарбонат (Параболан). Очень стабильный эфир для качественной формы.",
        "protocol": "Дозировка: 200-300 мг в неделю. Разделять на 2 инъекции."
    },
    {
        "category": "inject", "name": "Tren Acetate 10ml 100mg/ml", "brand": "ZPHC", "price": 48,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "activity",
        "desc": "Короткий тренболон. Быстро включается в работу, идеально сжигает жир и растит сухие мышцы.",
        "protocol": "Дозировка: 75-100 мг через день. Требует частого администрирования."
    },
    {
        "category": "inject", "name": "Primobolan 100mg/ml 1ml*10ampoules", "brand": "Balkan Pharmaceuticals", "price": 100,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "shield",
        "desc": "Метенолон энантат — самый безопасный анаболик. Дает очень качественный и стабильный результат.",
        "protocol": "Дозировка: 300-600 мг в неделю. Минимальные побочные эффекты."
    },
    {
        "category": "inject", "name": "Mast Enanthate 10ml 200mg", "brand": "ZPHC", "price": 100,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Дростанолон энантат. Делает мышцы невероятно жесткими и плотными. Отлично работает на сушке.",
        "protocol": "Дозировка: 400-600 мг в неделю. Комбинировать с тестостероном."
    },
    {
        "category": "inject", "name": "Mast Propionate 10ml 100mg/ml", "brand": "ZPHC", "price": 70,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Мастерон пропионат — короткий эфир. Используется перед соревнованиями для идеального рельефа.",
        "protocol": "Дозировка: 100 мг через день."
    },
    {
        "category": "inject", "name": "Nand Phenylpropionate 10ml 100mg/ml", "brand": "ZPHC", "price": 50,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Нандролон фенилпропионат. Меньшая задержка воды по сравнению с Декой. Быстрое восстановление суставов.",
        "protocol": "Дозировка: 100-200 мг через день или раз в 3 дня."
    },
    {
        "category": "inject", "name": "Nand Deca 10ml 250mg/ml", "brand": "ZPHC", "price": 60,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Классическая Дека. Мощный массонабор и смазка суставов. Требует ПКТ с Каберголином.",
        "protocol": "Дозировка: 250-500 мг в неделю. Курс от 10 недель."
    },
    {
        "category": "inject", "name": "Sustanon ZPHC 10ML 250mg/ml", "brand": "ZPHC", "price": 55,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "layers",
        "desc": "Микс четырех эфиров тестостерона. Обеспечивает ровный гормональный фон и мощный анаболический эффект.",
        "protocol": "Дозировка: 250-500 мг в неделю. Частота: раз в неделю."
    },
    {
        "category": "inject", "name": "Sustanon медоз 10 ml 250 mg", "brand": "Medoz", "price": 55,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "layers",
        "desc": "Сустанон от производителя Medoz. Смесь эфиров для качественного набора массы.",
        "protocol": "Дозировка: 250-500 мг в неделю."
    },
    {
        "category": "inject", "name": "Boldenone 10ml 250mg/ml", "brand": "ZPHC", "price": 50,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Болденон (Эквипойз). Увеличивает аппетит, венозность и выносливость. Дает качественный прирост.",
        "protocol": "Дозировка: 600-800 мг в неделю. Курс от 12 недель."
    },
    {
        "category": "inject", "name": "Winstr S 10ml 50mg/ml", "brand": "ZPHC", "price": 40,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "droplet",
        "desc": "Инъекционный станозолол. Максимальная прорисовка мышц, выведение лишней воды и сила.",
        "protocol": "Дозировка: 50 мг каждый день или через день."
    },

    # 💊 Оральные
    {
        "category": "oral", "name": "Oxy 50 мг /100tab", "brand": "ZPHC", "price": 82,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Оксиметолон (Анадрол) — самый сильный оральный препарат. Огромная сила и пампинг.",
        "protocol": "Дозировка: 50-100 мг в день. Курс не более 6 недель."
    },
    {
        "category": "oral", "name": "Metan 10mg/100tab", "brand": "SciPharmaTech", "price": 25,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Метандиенон. Классический препарат для быстрого набора веса и силы. Проверен десятилетиями.",
        "protocol": "Дозировка: 30-50 мг в день. Разделять на 3 приема."
    },
    {
        "category": "oral", "name": "Provi 25mg/ 30 tab", "brand": "SciPharmaTech", "price": 37,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Провирон. Используется на курсе для снижения ГСПГ и повышения либидо. Повышает жесткость мышц.",
        "protocol": "Дозировка: 25-50 мг в день."
    },
    {
        "category": "oral", "name": "Stan 10mg/100tab", "brand": "Medil/Kubera", "price": 25,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Станозолол в таблетках. Лучший выбор для сушки, увеличения выносливости и силы без лишнего веса.",
        "protocol": "Дозировка: 30-40 мг в день."
    },
    {
        "category": "oral", "name": "Oxand 10mg/100tab", "brand": "Medil/Kubera", "price": 70,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Оксандролон (Анавар). Самый мягкий препарат. Дает чистую силу и рельеф без побочек.",
        "protocol": "Дозировка: 40-60 мг в день."
    },
    {
        "category": "oral", "name": "Turik 10mg/100tab", "brand": "Medil/Kubera", "price": 63,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Туринабол. Качественный рост мышц, повышение выносливости и силы без задержки воды.",
        "protocol": "Дозировка: 40-50 мг в день."
    },
    {
        "category": "oral", "name": "Клен 40mg/100tab", "brand": "Medil/Kubera", "price": 30,
        "image": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Кленбутерол. Жиросжигатель, повышающий метаболизм и сохраняющий мышцы на диете.",
        "protocol": "Прием по схеме 'лесенка': от 20 до 120 мкг в сутки. Пить утром."
    },
    {
        "category": "oral", "name": "Кломид 50mg/100tab", "brand": "Medil/Kubera", "price": 67,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Кломифен цитрат. Основной препарат для ПКТ. Восстанавливает выработку собственного тестостерона.",
        "protocol": "Дозировка: 50-100 мг в день после завершения курса."
    },
    {
        "category": "oral", "name": "Летрозол 2,5 mg/100tab", "brand": "Medil/Kubera", "price": 30,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "pill",
        "desc": "Ингибитор ароматазы. Мощное средство против гинекомастии и задержки воды.",
        "protocol": "Дозировка: 2.5 мг раз в 2-3 дня при необходимости."
    },

    # 🧬 Гормоны и пептиды
    {
        "category": "peptide", "name": "Гр SOMATROPIX 100 ед", "brand": "Somatropix", "price": 95,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Гормон роста высшего качества. Омоложение, жиросжигание и рост сухих мышц.",
        "protocol": "Дозировка: 3-5 ЕД в сутки. Инъекция подкожно в живот утром или перед сном."
    },
    {
        "category": "peptide", "name": "Семаглутид - 7 mg", "brand": "Peptide", "price": 130,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Революционный препарат для похудения. Снижает аппетит и замедляет опорожнение желудка.",
        "protocol": "Дозировка: от 0.25 мг до 1 мг в неделю. Инъекция раз в неделю."
    },
    {
        "category": "peptide", "name": "Retatrutide 5mg + KPV", "brand": "Peptide", "price": 80,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Тройной агонист рецепторов для экстремального жиросжигания. Новое поколение препаратов.",
        "protocol": "По схеме специалиста. Обычно раз в неделю."
    },
    {
        "category": "peptide", "name": "Tirzepatide - 10 mg", "brand": "Peptide", "price": 150,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Тирзепатид — мощнейшее средство для контроля веса и лечения диабета. Эффективнее семаглутида.",
        "protocol": "Дозировка: 2.5-10 мг в неделю. Раз в 7 дней."
    },
    {
        "category": "peptide", "name": "Ганадотропин - 5.000 ME", "brand": "HCG", "price": 45,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "ХГЧ. Используется на курсе для предотвращения атрофии яичек и поддержания фертильности.",
        "protocol": "Дозировка: 500-1000 МЕ 2 раза в неделю."
    },
    {
        "category": "peptide", "name": "Kisspeptin-10 - 5 mg", "brand": "Peptide", "price": 50,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Стимулятор выработки гонадотропинов. Помогает восстановить гормональную дугу.",
        "protocol": "Инъекции по схеме ПКТ или поддержки."
    },
    {
        "category": "peptide", "name": "MGF PEG - 2 mg", "brand": "Peptide", "price": 40,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Механический фактор роста. Стимулирует рост новых мышечных волокон за счет гиперплазии.",
        "protocol": "Дозировка: 200-400 мкг после тренировки."
    },
    {
        "category": "peptide", "name": "CJC1295 DAC - 2 mg", "brand": "Peptide", "price": 25,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Пептид длительного действия, стимулирующий выброс собственного гормона роста.",
        "protocol": "Дозировка: 1000-2000 мкг раз в неделю."
    },
    {
        "category": "peptide", "name": "Melanotan2 - 10 mg", "brand": "Peptide", "price": 40,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Пептид для загара. Дает глубокий и ровный загар даже при минимальном солнце. Повышает либидо.",
        "protocol": "Дозировка: 100-500 мкг в день перед солярием."
    },
    {
        "category": "peptide", "name": "BPC-157 - 10 mg", "brand": "Peptide", "price": 45,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Пептид для заживления связок, сухожилий и органов ЖКТ. Уникальные регенеративные свойства.",
        "protocol": "Дозировка: 250-500 мкг 2 раза в день подкожно."
    },
    {
        "category": "peptide", "name": "TB-500 - 5 mg", "brand": "Peptide", "price": 55,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Тимозин бета-4. Ускоряет заживление травм, улучшает эластичность связок и снижает воспаление.",
        "protocol": "Дозировка: 2-5 мг в неделю."
    },
    {
        "category": "peptide", "name": "Selank - 10 mg", "brand": "Peptide", "price": 40,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Ноотропный пептид с анксиолитическим эффектом. Снимает тревогу, улучшает память и сон.",
        "protocol": "Прием: интраназально или подкожно."
    },
    {
        "category": "peptide", "name": "Ипаморелин 2 mg", "brand": "Peptide", "price": 30,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Самый безопасный стимулятор ГР. Не вызывает чувства голода и не повышает пролактин/кортизол.",
        "protocol": "Дозировка: 100-200 мкг 3 раза в день."
    },
    {
        "category": "peptide", "name": "GHRP 2 - 5 mg", "brand": "Peptide", "price": 30,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Мощный стимулятор гормона роста. Повышает аппетит и ускоряет восстановление.",
        "protocol": "Дозировка: 100-150 мкг 3 раза в день."
    },
    {
        "category": "peptide", "name": "GHRP 6 - 5 mg", "brand": "Peptide", "price": 40,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Стимулятор ГР с сильным эффектом повышения аппетита. Идеален для 'тяжелых' на подъем в массе.",
        "protocol": "Дозировка: 100-150 мкг 3 раза в день."
    },
    {
        "category": "peptide", "name": "ghk 50 мг", "brand": "Peptide", "price": 30,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Пептид меди GHK-Cu. Омоложение кожи, заживление ран и стимуляция синтеза коллагена.",
        "protocol": "Наружное применение или инъекции по схеме."
    },
    {
        "category": "peptide", "name": "ghk спрей 80 мг", "brand": "Peptide", "price": 40,
        "image_url": "assets/img/photo_2026-05-03_13-46-28.jpg", "icon": "dna",
        "desc": "Спрей с пептидом меди для удобного нанесения. Восстановление кожи и волос.",
        "protocol": "Распылять на проблемные зоны 1-2 раза в день."
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
    print("Готово! Теперь база полная.")

if __name__ == "__main__":
    seed()
