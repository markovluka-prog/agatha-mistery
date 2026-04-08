---
название: Контекст для Claude
---

# Контекст

## Статус
Сайт работает на GitHub Pages. Supabase подключён и является основным источником данных. Все переводы (RU/EN) заполнены в базе.

## Что сделано
- Подключили репо `agatha-mistery` как git submodule в `My-Projects`
- Написали info.md, description.md, roadmap.md, context.md по реальному коду
- Исправлен баг кнопки языка: теперь показывает целевой язык (EN/RU), а не текущий
- Supabase JS перенесён из `node_modules` в `assets/scripts/vendor/supabase.js` — теперь деплоится на GitHub Pages
- Все HTML файлы обновлены на новый путь к supabase.js
- Заполнены переводы `about_sections` (title_en, subtitle_en, content_en) через REST API
- Создан скрипт `search_console.py` — аналитика из Google Search Console
- Создан файл `analytics.html` — дашборд в стиле Search Console (клики, показы, страны, график)
- Добавлены локации из `Книга 10: Опасный круиз` в `places`: `Тронхейм`, `Берген`, `Тронхеймс-фьорд`
- Подготовлены черновики по книге `Опасный круиз`: `supabase/drafts/opasnyy-kruiz-places-draft.json` и `supabase/drafts/opasnyy-kruiz-places-notes.md`

## Важные детали
- **Репо**: https://github.com/markovluka-prog/agatha-mistery
- **GitHub Pages**: markovluka-prog.github.io/agatha-mistery → домен agatha-mistery.com
- **Stек**: HTML + CSS + JS, без фреймворков. Supabase для всех данных. OpenLayers для карты.
- **i18n**: своя система через `data-i18n` атрибуты, файл `assets/scripts/core/i18n.js`
- **Supabase**: основной источник данных — персонажи, квизы, локации, about, отзывы, фанфики, иллюстрации
- **Картинки персонажей**: хранятся как base64 в колонке `image_url` таблицы `characters`
- **Переводы в БД**: все таблицы имеют `_en` поля (name_en, title_en, description_en и т.д.)
- **Игра**: game.html — «Рыцари и Замки», полноэкранная, ассеты Tiny Swords

## Структура данных (Supabase)
- `characters` — id, name, name_en, short_description, short_description_en, full_bio, full_bio_en, image_url
- `quizzes` — id, title, title_en, description, description_en, questions (JSON с text_en и options[].text_en)
- `places` — id, name, name_en, description, description_en, image_url, lat, lng
- `about_sections` — id, title, title_en, blocks (JSON с subtitle_en, content_en), sort_order
- `reviews` — отзывы с модерацией (status=approved)
- `fanfics` — фанфики пользователей
- `illustrations` — иллюстрации, файлы в Supabase Storage bucket `illustrations`

## Аналитика (Search Console, период 2026-01-01 — 2026-03-31)
- Клики: 3 | Показы: 41 | CTR: 7.3% | Позиция: 1.6
- Топ страны по показам: 🇷🇺 Россия (18), 🇺🇦 Украина (7), 🇧🇷 Бразилия (3)
- 64% аудитории — русскоязычные страны
- Сайт молодой, трафик минимальный

## Файлы аналитики (не пушить в репо)
- `client_secret.json` — OAuth credentials Google Cloud (проект manage-491914)
- `token.json` — OAuth токен (генерируется автоматически)
- `search_console.py` — скрипт для получения данных из Search Console
- `analytics.html` — сгенерированный дашборд

## Структура git
- `My-Projects/` → репо `markovluka-prog/My-Projects`
  - `agatha-mistery/` → submodule `markovluka-prog/agatha-mistery`
- Чтобы пушить изменения в сайт: зайти в папку `agatha-mistery/` и делать обычный git push
- SSH ключ ed25519 добавлен на GitHub

## Что нужно сделать
- Проверить работу картинок после деплоя (hard refresh Cmd+Shift+R)
- Разобраться с `about.html` — почему контент не загружается (возможно RLS в Supabase)
- **GitHub Actions secrets** — добавить вручную в настройках репо:
  - `SUPABASE_URL` = https://eetgsrcitolkvdifltns.supabase.co
  - `SUPABASE_SERVICE_KEY` = (из .env файла)
  - `OPENROUTER_API_KEY` = (из .env файла)
  Путь: github.com/markovluka-prog/agatha-mistery → Settings → Secrets → Actions

## Как добавлять локации из книги
1. Достать книгу
- Скачать PDF с Флибусты
- Загрузить файл в `/workspaces/My-Projects/`

2. Распознать текст (OCR)
- Установить инструменты:
```bash
sudo apt-get install -y tesseract-ocr tesseract-ocr-rus poppler-utils
```
- Конвертировать PDF в PNG (300 DPI):
```bash
pdftoppm -r 300 -png /path/to/book.pdf /tmp/book
```
- Распознать все страницы в один текстовый файл:
```bash
for f in /tmp/book*.png; do
  tesseract "$f" stdout -l rus 2>/dev/null
done > /tmp/fullbook.txt
```

3. Найти локации в тексте
- Базовый поиск:
```bash
grep -n -i -E "(локация|город|улица|площадь|район|замок)" /tmp/fullbook.txt
```
- Дальше читать контекст вокруг совпадений и вручную выписывать все места с описаниями из книги

4. Найти координаты и фото
- Координаты: Google Maps или вручную
- Фото: Wikimedia Commons / Wikipedia API
```bash
curl "https://en.wikipedia.org/w/api.php?action=query&titles=Place+Name&prop=pageimages&format=json&pithumbsize=900"
```

5. Добавить в Supabase
- Вставлять записи в `places` через REST API
- Поле `book` обязательно заполнять: фильтры на карте строятся автоматически из него
- `id` указывать вручную: брать `max(id) + 1`
- Пример:
```bash
curl -X POST "https://.../rest/v1/places" \
  -d '[{"id":..., "name":"...", "name_en":"...", "description":"...", "description_en":"...", "lat":..., "lng":..., "image_url":"...", "book":"Книга N: Название", "status":"approved"}]'
```

6. Обновить `context.md`
- После каждой книги записывать, что именно уже добавлено, чтобы не потерять прогресс между сессиями

## Ключевые детали по локациям
- Колонка `book` в Supabase нужна для автоматических фильтров на карте
- `id` не автоинкрементный: его нужно проставлять вручную
- Фото берём с Wikimedia, потому что их можно свободно использовать на сайте

## 2026-04-05
- В `Supabase` добавлен пакет локаций по книгам `6, 7, 8, 11, 12, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25, 26, 27, 29, 30` из файла `supabase/drafts/batch-places-payload.json`.
- Вставлено `46` записей в `places` с `id` от `15` до `60`.
- Для книги `13` оставлен blocker: надёжные внешние сюжетные локации по OCR не подтверждены, в базу ничего не отправлялось.

## 2026-04-08
- **Карта (мобильная версия)**: попап центрирован на телефоне, маркеры увеличены до 13px, кнопка закрытия имеет касаемую зону 44px, высота боковой панели уменьшена до 420px на мобиле.
- **Формы**: fanfics и illustrations теперь вставляются со `status='pending'`, агент их подбирает и модерирует. Исправлен баг: колонка в БД называется `genre`, не `character`.
- **Баннер «ОТПРАВЛЕНО»**: после успешной отправки формы — 2с баннер сверху + 5с прогресс-бар + автосброс формы. Работает для отзывов, фанфиков и иллюстраций.
- **Агент модерации** обновлён: три критерия — СМЫСЛ (контент про Агату Мистери), ВОЗРАСТ (нет неприличного), ПОЛЯ (корректно заполнены). Иллюстрации проверяются vision-моделью если есть image_url.
- **GitHub Actions**: `.github/workflows/moderation-agent.yml` — cron каждые 10 минут, запускает `agent-runner.js` (однократный poll).
- **ВАЖНО**: GitHub Actions secrets нужно добавить вручную (см. «Что нужно сделать»).
- **Вопросы квизов**: все 940 вопросов переписаны через OpenRouter. Результат: Quiz1 (238 single+82 multiple+40 input), Quiz2 (395+50+55), Quiz3 (60+20). Вопросы стали живыми и разнообразными.
- **Карта мобиле**: map.updateSize() + двойной requestAnimationFrame перед fit() чтобы OL корректно рассчитывал viewport после CSS 50vw.

## 2026-04-07
- Сгенерированы и загружены как base64 в `image_url` placeholder-карточки для персонажей: Ватсон (id=6), Джек (id=7), Мистер Кент (id=5), Билл (id=12), Улисс (id=14). Стиль: 800×1000, коричневый фон, инициалы в круге, роль-тег автоширины.
- Переписаны `short_description` и `full_bio` для всех персонажей id=5–18 в живом фан-стиле. Источники: PDF книг 9, 11, 13, 14, 17, 22, 26 + сканы страниц.
- Ключевые детали по персонажам из книг:
  - Мистер Кент (id=5): в прошлом профессиональный боксёр, огромные руки, извлекает ёлочные шары с деликатностью
  - Ватсон (id=6): белый сибирский кот, влюблялся в кошку Мэри (серенады, ящерица), на Бали похищен на сардины
  - Джек (id=7): кожаное пальто, высветленный чуб, видеокамера, опоздал на час, считает ИнтерОко инопланетным
  - Ким (id=8): 30 лет, выходец из Азии, мастер городского альпинизма
  - Алджернон (id=9): опытный палеограф, расшифрует любой текст
  - Сэмюэль (id=10): живёт в Норвегии с женой Рикке (олимпийская чемпионка по кёрлингу), присылает шлем викинга
  - Уолтер (id=11): химик, живёт в Рио, встречает на пляже Ипанема, похож на шамана
  - Билл (id=12): 42 года, орнитолог, ферма у Оксфорда, сокол Марло (назван в честь Кристофера Марло)
  - Бад (id=13): Голливуд, Chevrolet Impala 1959, знает охранников студий лично
  - Улисс (id=14): катамаран «Принцесса Мистери», не сходит на берег 7 лет (предсказание шамана), попугай Чандлер-клептоман, брат Лестер ездит на велосипеде «Розочки»
  - Мелания (id=15): живёт в Египте, разводит верблюдов, присылает «розу пустыни»
  - ЮМ60 (id=17): экзамены по видеосвязи, шлёт задания в отпуск, награждает 3 ночами в люксе
  - ДР44 (id=18): инструктор выживания, совет о мхе на деревьях для ориентации по северу

