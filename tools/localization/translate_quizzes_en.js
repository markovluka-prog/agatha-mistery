const fs = require('fs');

const envRaw = fs.readFileSync('tools/moderation/.env', 'utf8');
const env = Object.fromEntries(
  envRaw
    .split(/\n/)
    .filter((line) => line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY;
const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const containsCyrillic = (text) => /[\u0400-\u04FF]/.test(String(text || ''));

const stripQuotesAndQuestions = (text) =>
  String(text || '')
    .replace(/[«»"“”„]/g, '')
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim();

async function supaGet(pathname) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase GET failed ${res.status}: ${text}`);
  }

  return res.json();
}

async function supaPatch(pathname, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase PATCH failed ${res.status}: ${text}`);
  }

  return res.json();
}

async function openrouterTranslate(payload) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a precise translator from Russian to English. Translate only, do not add content. Do not use question marks in questions. Do not use quotes around book titles. Keep proper names. Return valid JSON only.'
        },
        {
          role: 'user',
          content: JSON.stringify(payload)
        }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse OpenRouter JSON: ${content.slice(0, 300)}`);
  }
}

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const translateQuizMeta = async (quiz) => {
  const needsTitle = !quiz.title_en || containsCyrillic(quiz.title_en);
  const needsDescription =
    !quiz.description_en || containsCyrillic(quiz.description_en);

  let title_en = quiz.title_en;
  let description_en = quiz.description_en;

  if (needsTitle || needsDescription) {
    console.log(`Translating quiz meta: ${quiz.id}`);
    const result = await openrouterTranslate({
      type: 'quiz_meta',
      title: quiz.title || '',
      description: quiz.description || ''
    });

    title_en = stripQuotesAndQuestions(
      result.title_en || result.title || result.titleEn || ''
    );
    description_en = stripQuotesAndQuestions(
      result.description_en || result.description || result.descriptionEn || ''
    );
  }

  return { title_en, description_en };
};

const translateQuizQuestions = async (rawQuestions, quizId) => {
  const prepared = rawQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    questionMode: q.questionMode,
    correctAnswer: q.correctAnswer,
    options: (q.options || []).map((opt) => ({
      id: opt.id,
      text: opt.text
    }))
  }));

  const batches = chunk(prepared, 15);
  const translated = new Map();

  let batchIndex = 0;
  for (const batch of batches) {
    batchIndex += 1;
    console.log(`Translating quiz ${quizId} batch ${batchIndex}/${batches.length}...`);
    const result = await openrouterTranslate({
      type: 'quiz_questions',
      questions: batch
    });
    const list = result.questions || result.items || [];

    list.forEach((item) => {
      if (!item || item.id == null) return;
      const text_en = stripQuotesAndQuestions(
        item.text_en || item.textEn || item.text || ''
      );
      const correctAnswer_en =
        item.correctAnswer_en || item.correctAnswerEn || item.correctAnswer || '';
      const optionMap = new Map();

      (item.options || []).forEach((opt) => {
        if (!opt || opt.id == null) return;
        const optionText = stripQuotesAndQuestions(
          opt.text_en || opt.textEn || opt.text || ''
        );
        optionMap.set(String(opt.id), optionText);
      });

      translated.set(String(item.id), {
        text_en,
        correctAnswer_en,
        optionMap
      });
    });

    await sleep(250);
  }

  return rawQuestions.map((q) => {
    const entry = translated.get(String(q.id));
    if (!entry) return q;

    const updated = { ...q };
    if (entry.text_en) updated.text_en = entry.text_en;
    if (entry.correctAnswer_en && q.type === 'input') {
      updated.correctAnswer_en = stripQuotesAndQuestions(entry.correctAnswer_en);
    }

    if (Array.isArray(q.options)) {
      updated.options = q.options.map((opt) => {
        const translatedOption = entry.optionMap.get(String(opt.id));
        return translatedOption
          ? { ...opt, text_en: translatedOption }
          : opt;
      });
    }

    return updated;
  });
};

const main = async () => {
  const quizzes = await supaGet('quizzes?select=*');
  const updates = [];

  for (const quiz of quizzes) {
    console.log(`Processing quiz ${quiz.id} (${quiz.title})`);
    const rawQuestions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const meta = await translateQuizMeta(quiz);
    const translatedQuestions = await translateQuizQuestions(rawQuestions, quiz.id);

    updates.push({
      id: quiz.id,
      title_en: meta.title_en,
      description_en: meta.description_en,
      questions: translatedQuestions
    });
  }

  fs.writeFileSync(
    'supabase/drafts/quizzes-translated-en.json',
    JSON.stringify(updates, null, 2)
  );
  console.log('Saved draft: supabase/drafts/quizzes-translated-en.json');

  for (const item of updates) {
    await supaPatch(`quizzes?id=eq.${item.id}`, {
      title_en: item.title_en,
      description_en: item.description_en,
      questions: item.questions
    });
    console.log(`Updated quiz ${item.id}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
