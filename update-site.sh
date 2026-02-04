#!/bin/bash
# Скрипт для быстрого обновления сайта на GitHub

cd "/Users/lukamarkov/Desktop/Сайт Фанатов агаты мистери"

# Добавляем все изменения
git add .

# Коммит с описанием
git commit -m "Admin panel fixes: removed alerts, added base64 image upload, fixed question types"

# Отправляем на GitHub
git push

echo "✅ Сайт обновлён на GitHub!"
