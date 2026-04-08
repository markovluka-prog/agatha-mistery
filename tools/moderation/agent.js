#!/usr/bin/env node
/**
 * Агент модерации Agatha Mystery
 * Проверяет три таблицы: fanfics, illustrations, reviews.
 * Критерии:
 *   1. СМЫСЛ: контент должен быть по книгам «Агата Мистери»
 *   2. ВОЗРАСТ: ничего неприличного (текст и картинки), сайт для 8-14 лет
 *   3. ПОЛЯ: все обязательные поля заполнены правильно
 *
 * Запуск:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... OPENROUTER_API_KEY=... node agent.js
 * Или через .env:
 *   node -r dotenv/config agent.js
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// ── Конфиг ──────────────────────────────────────────────────────────────────
const SUPABASE_URL         = process.env.SUPABASE_URL         || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const OPENROUTER_API_KEY   = process.env.OPENROUTER_API_KEY   || '';
const POLL_INTERVAL_MS     = parseInt(process.env.POLL_INTERVAL_MS || '30000', 10);
const OPENROUTER_MODEL     = process.env.OPENROUTER_MODEL     || 'openai/gpt-4o-mini';
const VISION_MODEL         = process.env.VISION_MODEL         || 'openai/gpt-4o-mini';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENROUTER_API_KEY) {
    console.error('[agent] Не заданы переменные окружения: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENROUTER_API_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Системный промпт для текстовой модерации ─────────────────────────────────

const SYSTEM_PROMPT_REVIEW = `Ты — модератор детского фан-сайта по книгам «Агата Мистери» (аудитория 8–14 лет).

Проверяй по трём критериям:

1. СМЫСЛ: Это должен быть настоящий отзыв о сайте или книгах «Агата Мистери». Не реклама, не спам, не бессмыслица.
2. ВОЗРАСТ: Нет матов, оскорблений, жестокости, взрослых тем, ссылок, личных данных.
3. ПОЛЯ: Имя (2–60 символов, реальное имя). Текст (10–500 символов, настоящий отзыв).

Если ВСЕ три критерия соблюдены — ответь APPROVED.
Если хотя бы один нарушен — ответь DISABLED.
Отвечай ТОЛЬКО одним словом: APPROVED или DISABLED.`;

const SYSTEM_PROMPT_FANFIC = `Ты — модератор детского фан-сайта по книгам «Агата Мистери» (аудитория 8–14 лет).

Проверяй по трём критериям:

1. СМЫСЛ: Это должна быть фанатская история именно по «Агата Мистери». Главный персонаж должен быть из книг. История должна быть хоть немного похожа на детектив или приключение в стиле серии. Это НЕ должна быть история про других персонажей (Harry Potter, Minecraft и т.д.) или случайный текст.
2. ВОЗРАСТ: Нет матов, насилия, взрослых тем, оскорблений, ссылок. Всё как для ребёнка 8–14 лет.
3. ПОЛЯ: Имя автора (2–60 символов). Название фанфика (2–100 символов). Персонаж выбран (не пустой). Текст истории (50–2000 символов, настоящий связный текст).

Если ВСЕ три критерия соблюдены — ответь APPROVED.
Если хотя бы один нарушен — ответь DISABLED.
Отвечай ТОЛЬКО одним словом: APPROVED или DISABLED.`;

const SYSTEM_PROMPT_ILLUSTRATION_TEXT = `Ты — модератор детского фан-сайта по книгам «Агата Мистери» (аудитория 8–14 лет).

Проверяй описание иллюстрации по трём критериям:

1. СМЫСЛ: Иллюстрация должна быть по книгам «Агата Мистери» (персонажи, места, сцены из книг). Нет иллюстраций по другим произведениям или случайных картинок.
2. ВОЗРАСТ: Нет матов, взрослых тем, оскорблений в описании.
3. ПОЛЯ: Имя автора (2–60 символов). Название работы (2–80 символов). Описание — если заполнено, должно быть связным текстом (до 500 символов).

Если ВСЕ критерии соблюдены — ответь APPROVED.
Если нарушен хотя бы один — ответь DISABLED.
Отвечай ТОЛЬКО одним словом: APPROVED или DISABLED.`;

const SYSTEM_PROMPT_ILLUSTRATION_IMAGE = `Ты — модератор детского фан-сайта по книгам «Агата Мистери» (аудитория 8–14 лет).

Посмотри на изображение и ответь на вопрос: подходит ли оно для детского сайта?

Изображение НЕДОПУСТИМО (DISABLED) если:
- Содержит откровенные, взрослые или сексуальные элементы
- Содержит кровь, жестокость, оружие в руках
- Содержит неприличные слова, жесты или символы
- Содержит реальных людей в неприличном контексте
- Изображение явно не про «Агату Мистери» (реклама, скриншоты других игр, порнография, мемы с насилием)

Изображение ДОПУСТИМО (APPROVED) если:
- Это рисунок, иллюстрация, коллаж по мотивам книг
- Персонажи, пейзажи, сцены из приключений
- Нейтральный контент (фото места, скетч, цветная иллюстрация)

Отвечай ТОЛЬКО одним словом: APPROVED или DISABLED.`;

// ── OpenRouter: проверка текста ───────────────────────────────────────────────
async function moderateText(systemPrompt, userText) {
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
                { role: 'system', content: systemPrompt },
                { role: 'user',   content: userText }
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

// ── OpenRouter: проверка изображения (vision) ─────────────────────────────────
async function moderateImage(imageUrl) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://agatha-mistery.com',
            'X-Title': 'Agatha Mystery Moderator'
        },
        body: JSON.stringify({
            model: VISION_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT_ILLUSTRATION_IMAGE },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: imageUrl, detail: 'low' }
                        },
                        {
                            type: 'text',
                            text: 'Посмотри на это изображение. Оно допустимо для детского сайта?'
                        }
                    ]
                }
            ],
            max_tokens: 5,
            temperature: 0
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter vision error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const answer = (data.choices?.[0]?.message?.content || '').trim().toUpperCase();
    return answer === 'APPROVED' ? 'approved' : 'disabled';
}

// ── Модерация конкретной записи ────────────────────────────────────────────────
async function moderateRecord(tableName, row) {
    if (tableName === 'reviews') {
        const text = `Имя: ${row.name}\nОтзыв: ${row.text}`;
        return moderateText(SYSTEM_PROMPT_REVIEW, text);
    }

    if (tableName === 'fanfics') {
        const text = `Автор: ${row.name}\nНазвание: ${row.title}\nПерсонаж: ${row.character || '(не указан)'}\nИстория: ${row.story}`;
        return moderateText(SYSTEM_PROMPT_FANFIC, text);
    }

    if (tableName === 'illustrations') {
        const text = `Автор: ${row.name}\nНазвание: ${row.title}\nОписание: ${row.description || '—'}`;
        const textResult = await moderateText(SYSTEM_PROMPT_ILLUSTRATION_TEXT, text);

        // Если текст прошёл и есть изображение — проверяем и картинку
        if (textResult === 'approved' && row.file_url) {
            try {
                const imageResult = await moderateImage(row.file_url);
                return imageResult;
            } catch (err) {
                console.warn(`[illustrations] id=${row.id} — ошибка проверки картинки: ${err.message}. Одобряем по тексту.`);
                return 'approved';
            }
        }

        return textResult;
    }

    return 'disabled';
}

// ── Обработка таблицы ─────────────────────────────────────────────────────────
async function processTable(tableName) {
    const { data: rows, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(20);

    if (error) {
        console.error(`[${tableName}] Ошибка чтения: ${error.message}`);
        return;
    }

    if (!rows || rows.length === 0) return;

    console.log(`[${tableName}] Найдено ${rows.length} pending-записей`);

    for (const row of rows) {
        let newStatus;
        try {
            newStatus = await moderateRecord(tableName, row);
        } catch (err) {
            console.error(`[${tableName}] id=${row.id} — ошибка модерации: ${err.message}`);
            continue;
        }

        const { error: updateError } = await supabase
            .from(tableName)
            .update({ status: newStatus })
            .eq('id', row.id);

        if (updateError) {
            console.error(`[${tableName}] id=${row.id} — ошибка обновления: ${updateError.message}`);
        } else {
            const icon = newStatus === 'approved' ? '✓' : '✗';
            console.log(`[${tableName}] id=${row.id} — ${icon} ${newStatus}`);
        }
    }
}

// ── Главный цикл ──────────────────────────────────────────────────────────────
async function poll() {
    console.log(`[agent] Проверка таблиц...`);
    for (const table of ['reviews', 'fanfics', 'illustrations']) {
        await processTable(table);
    }
}

async function main() {
    const singleRun = process.env.SINGLE_RUN === 'true';
    console.log(`[agent] Запущен. Модель: ${OPENROUTER_MODEL}. Режим: ${singleRun ? 'однократный' : `интервал ${POLL_INTERVAL_MS / 1000}с`}`);
    await poll();
    if (!singleRun) {
        setInterval(poll, POLL_INTERVAL_MS);
    } else {
        console.log('[agent] Однократный запуск завершён.');
    }
}

main().catch((err) => {
    console.error('[agent] Фатальная ошибка:', err);
    process.exit(1);
});
