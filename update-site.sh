#!/bin/bash
# Скрипт для быстрого обновления сайта на GitHub

cd "/Users/lukamarkov/Desktop/Сайт Фанатов агаты мистери"

# Добавляем только нужные файлы
git add index.html css/ js/ pages/

# Коммит с текущей датой
git commit -m "Update $(date '+%Y-%m-%d %H:%M')"

# Отправляем на GitHub
git push

echo "✅ Сайт обновлён на GitHub!"
