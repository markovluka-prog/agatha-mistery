#!/bin/bash
# Скрипт для быстрого обновления сайта на GitHub

cd "/Users/lukamarkov/Desktop/Сайт Фанатов агаты мистери"

# Добавляем все изменения
git add .

# Коммит с описанием
git commit -m "Admin panel: added pure JS SHA-256 for Kindle compatibility"

# Отправляем на GitHub
git push

echo "✅ Сайт обновлён на GitHub!"
