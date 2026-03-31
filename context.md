---
название: Контекст для Claude
---

# Контекст

## Статус
Md-документация написана по реальному коду. Основные страницы сайта готовы.

## Что сделано
- Подключили репо `agatha-mistery` как git submodule в `My-Projects`
- Написали info.md, description.md, roadmap.md, context.md по реальному коду

## Важные детали
- **Репо**: https://github.com/markovluka-prog/agatha-mistery
- **GitHub Pages**: markovluka-prog.github.io/agatha-mistery → домен agatha-mistery.com
- **Stек**: HTML + CSS + JS, без фреймворков. Supabase для UGC. OpenLayers для карты.
- **i18n**: своя система через `data-i18n` атрибуты, файл `assets/scripts/core/i18n.js`
- **Данные персонажей и викторин**: JSON прямо в HTML (`<script type="application/json">`)
- **Отзывы**: форма на главной, хранятся в LocalStorage (комментарий в коде)
- **Supabase**: используется для фанфиков и иллюстраций (UGC от пользователей)
- **Игра**: game.html — «Рыцари и Замки», полноэкранная, ассеты Tiny Swords

## Что нужно сделать
- Разобраться с `about.html` — почему контент не загружается
- Проверить работу переключателя языков
- Проверить Supabase-таблицы

## Структура git
- `My-Projects/` → репо `markovluka-prog/My-Projects`
  - `agatha-mistery/` → submodule `markovluka-prog/agatha-mistery`
- Чтобы пушить изменения в сайт: зайти в папку `agatha-mistery/` и делать обычный git push
