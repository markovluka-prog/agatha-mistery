#!/usr/bin/env node
/**
 * Агент модерации Agatha Mystery
 * Следит за таблицами fanfics, illustrations, reviews.
 * Каждые POLL_INTERVAL секунд проверяет новые pending-записи,
 * оценивает контент через OpenRouter и ставит status: approved | disabled.
 *
 * Запуск:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... OPENROUTER_API_KEY=... node agent.js
 *
 * Или через .env (см. .env.example)
 */

const { createClient } = require('@supabase/supabase-js');

// ── Конфиг ──────────────────────────────────────────────────────────────────
const SUPABASE_URL        = process.env.SUPABASE_URL        || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const OPENROUTER_API_KEY  = process.env.OPENROUTER_API_KEY  || '';
const POLL_INTERVAL_MS    = parseInt(process.env.POLL_INTERVAL_MS || '30000', 10);
const OPENROUTER_MODEL    = process.env.OPENROUTER_MODEL    || 'openai/gpt-4o-mini';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENROUTER_API_KEY) {
    console.error('[agent] Не заданы переменные окружения: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENROUTER_API_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Таблицы и поля для проверки ──────────────────────────────────────────────
const TABLES = [
    {
        name: 'reviews',
        label: (row) => `Имя: ${row.name}\nОтзыв: ${row.text}`
    },
    {
        name: 'fanfics',
        label: (row) => `Автор: ${row.name}\nНазвание: ${row.title}\nИстория: ${row.story}`
    },
    {
        name: 'illustrations',
        label: (row) => `Автор: ${row.name}\nНазвание: ${row.title}\nОписание: ${row.description || '—'}`
    },
    {
        name: 'places',
        label: (row) => `Название: ${row.name}\nОписание: ${row.description || '—'}`
    }
];

// ── OpenRouter: проверка контента ─────────────────────────────────────────────
async function moderateContent(text) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://agatha-mistery.com',
            'X-Title': 'Agatha Mystery Moderator'
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `Ты — модератор детского фан-сайта по книжной серии «Агата Мистери» (возраст 8–14 лет).
Твоя задача: оценить пользовательский контент на приличность, безопасность для детей и связь с книгами или творчеством.

Контент ДОПУСТИМ (APPROVED) если:
- Не содержит мата, жестокости, сексуального контента
- Не содержит политики, пропаганды, дискриминации
- Написан на любом языке, уважительно
- Тематика: книги, персонажи, приключения, фантазия, творчество

Контент НЕ ДОПУСТИМ (DISABLED) если:
- Содержит неприличные слова, оскорбления
- Угрозы, агрессия, буллинг
- Спам, бессмыслица, случайные символы
- Ссылки на внешние ресурсы

Отвечай ТОЛЬКО одним словом: APPROVED или DISABLED`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            max_tokens: 5,
            temperature: 0
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const answer = (data.choices?.[0]?.message?.content || '').trim().toUpperCase();
    return answer === 'APPROVED' ? 'approved' : 'disabled';
}

// ── Обработка одной таблицы ───────────────────────────────────────────────────
async function processTable(table) {
    const { data: rows, error } = await supabase
        .from(table.name)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(20);

    if (error) {
        console.error(`[${table.name}] Ошибка при чтении:`, error.message);
        return;
    }

    if (!rows || rows.length === 0) return;

    console.log(`[${table.name}] Найдено ${rows.length} pending-записей`);

    for (const row of rows) {
        const content = table.label(row);
        let newStatus;

        try {
            newStatus = await moderateContent(content);
        } catch (err) {
            console.error(`[${table.name}] id=${row.id} — ошибка модерации:`, err.message);
            continue;
        }

        const { error: updateError } = await supabase
            .from(table.name)
            .update({ status: newStatus })
            .eq('id', row.id);

        if (updateError) {
            console.error(`[${table.name}] id=${row.id} — ошибка обновления:`, updateError.message);
        } else {
            const icon = newStatus === 'approved' ? '✓' : '✗';
            console.log(`[${table.name}] id=${row.id} — ${icon} ${newStatus}`);
        }
    }
}

// ── Главный цикл ──────────────────────────────────────────────────────────────
async function poll() {
    console.log(`[agent] Проверка таблиц...`);
    for (const table of TABLES) {
        await processTable(table);
    }
}

async function main() {
    console.log(`[agent] Запущен. Модель: ${OPENROUTER_MODEL}. Интервал: ${POLL_INTERVAL_MS / 1000}с`);
    await poll();
    setInterval(poll, POLL_INTERVAL_MS);
}

main().catch((err) => {
    console.error('[agent] Фатальная ошибка:', err);
    process.exit(1);
});
