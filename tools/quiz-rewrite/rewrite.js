#!/usr/bin/env node
/**
 * Quiz Question Rewriter — Agatha Mystery
 * Rewrites all 940 quiz questions via OpenRouter, making them:
 * - More interesting and varied
 * - Mix of single / input / multiple types
 * Then patches Supabase with updated questions.
 *
 * Run:
 *   OPENROUTER_API_KEY=sk-... node rewrite.js
 */

const SUPABASE_URL = 'https://eetgsrcitolkvdifltns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldGdzcmNpdG9sa3ZkaWZsdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NTMxNzYsImV4cCI6MjA4NTUyOTE3Nn0.Ry5C_nlp27IZYRWLrnTvnBZH5yqKvHavLMM7uBXZI2I';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const BATCH_SIZE = 10;
const DELAY_MS = 1200;

if (!OPENROUTER_API_KEY) {
    console.error('Set OPENROUTER_API_KEY env variable');
    process.exit(1);
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchQuizzes() {
    const url = `${SUPABASE_URL}/rest/v1/quizzes?select=id,title,questions`;
    const res = await fetch(url, {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });
    if (!res.ok) throw new Error(`Supabase fetch quizzes: ${res.status} ${await res.text()}`);
    return res.json();
}

async function patchQuiz(id, questions) {
    const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
    const url = `${SUPABASE_URL}/rest/v1/quizzes?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
        },
        body: JSON.stringify({ questions }),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Supabase patch quiz ${id}: ${res.status} ${msg}`);
    }
}

// ── OpenRouter rewrite ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты редактор детских викторин на русском языке.
Получаешь JSON-массив вопросов викторины по книгам «Агата Мистери» (серия детективов для детей 8–14 лет).
Твоя задача — полностью переписать каждый вопрос. Сложность — средняя (не очевидные факты, нужно было читать книги).

ТРЕБОВАНИЯ К ВОПРОСАМ:
- Каждый вопрос уникален — НЕ повторять формулировки типа "Что связано с...", "Выбери деталь о...", "Отметь всё верное"
- Вопросы должны проверять знание сюжета, характеров, деталей книг — не базовых фактов (не "Сколько лет Агате?")
- Используй разные начала: "В какой стране...", "Почему...", "Как зовут...", "Что произошло когда...", "Кто помог...", "Какой секрет..."
- Вопросы интересные — как в хорошей викторине, а не скучный опрос

ПРАВИЛА ДЛЯ ТИПОВ:
1. "single" — один правильный вариант из 4. Неправильные варианты должны быть правдоподобными.
2. "input" — пользователь вводит ответ текстом. Убери options, добавь correctAnswer (одно слово или короткая фраза).
   Примеры: имя персонажа, название города, кличка животного, конкретный предмет.
3. "multiple" — 2–3 правильных варианта из 4–5. ОБЯЗАТЕЛЬНО 2+ isCorrect:true.
   Формулировка: "Что из перечисленного верно про X?" или "Выбери верные утверждения о Y".

РАСПРЕДЕЛЕНИЕ в батче:
- ~55% single
- ~25% input
- ~20% multiple

СТРОГО:
- Не меняй id вопросов и id вариантов
- questionMode: "single" / "input" / "multiple"
- type: "input" для input, "text" для остальных
- Для input: убери options, добавь correctAnswer
- Отвечай ТОЛЬКО JSON-массивом. Без пояснений, без markdown.`;

async function rewriteBatch(questions) {
    const body = {
        model: 'openai/gpt-4o-mini',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
                role: 'user',
                content:
                    'Перепиши эти вопросы викторины согласно правилам. Верни JSON-массив:\n' +
                    JSON.stringify(questions, null, 2),
            },
        ],
        temperature: 0.7,
        max_tokens: 2000,
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://agatha-mistery.com',
            'X-Title': 'Agatha Quiz Rewriter',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`JSON parse failed. Got:\n${text.slice(0, 200)}`);
    }

    if (!Array.isArray(parsed)) throw new Error('Response is not an array');
    return parsed;
}

// ── Process one quiz ──────────────────────────────────────────────────────────

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function processQuiz(quiz) {
    const questions = quiz.questions || [];
    console.log(`\n=== Quiz ${quiz.id}: "${quiz.title}" — ${questions.length} вопросов ===`);

    const updated = [];
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = questions.slice(i, i + BATCH_SIZE);
        const from = i + 1;
        const to = Math.min(i + BATCH_SIZE, questions.length);
        process.stdout.write(`  Вопросы ${from}–${to}... `);

        let rewritten;
        let attempts = 0;
        while (attempts < 3) {
            try {
                rewritten = await rewriteBatch(batch);
                break;
            } catch (err) {
                attempts++;
                console.warn(`\n  Ошибка (попытка ${attempts}/3): ${err.message}`);
                if (attempts < 3) await sleep(3000 * attempts);
            }
        }

        if (!rewritten) {
            console.warn('  Оставляем оригинал для этого батча.');
            updated.push(...batch);
        } else {
            // Merge: keep original id if AI dropped it
            const merged = batch.map((orig, idx) => {
                const rw = rewritten[idx];
                if (!rw) return orig;
                return { ...orig, ...rw, id: orig.id };
            });
            updated.push(...merged);
            console.log(`OK (${rewritten.length} вопросов)`);
        }

        if (i + BATCH_SIZE < questions.length) await sleep(DELAY_MS);
    }

    return updated;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('Загружаю квизы из Supabase...');
    const quizzes = await fetchQuizzes();
    console.log(`Найдено квизов: ${quizzes.length}`);

    for (const quiz of quizzes) {
        const updatedQuestions = await processQuiz(quiz);

        console.log(`  Обновляю квиз ${quiz.id} в Supabase...`);
        await patchQuiz(quiz.id, updatedQuestions);
        console.log(`  Квиз ${quiz.id} обновлён.`);
    }

    console.log('\nГотово! Все вопросы переписаны.');
}

main().catch((err) => {
    console.error('Фатальная ошибка:', err);
    process.exit(1);
});
