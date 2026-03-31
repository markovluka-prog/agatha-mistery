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
- Добавить `client_secret.json`, `token.json`, `analytics.html` в `.gitignore`
- Бот для перевода нового контента (квизы, карты) — обсуждалось, не реализовано
