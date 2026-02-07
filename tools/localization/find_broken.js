const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://eetgsrcitolkvdifltns.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function hasBroken(str) {
    if (typeof str !== 'string') return false;
    return /[\uFFFD]/.test(str);
}

async function run() {
    const brokenItems = [];

    const tables = ['places', 'characters', 'quizzes'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) continue;

        data.forEach(row => {
            Object.entries(row).forEach(([key, val]) => {
                if (hasBroken(val)) {
                    brokenItems.push({ table, id: row.id, field: key, value: val });
                }
                if (key === 'questions' && Array.isArray(val)) {
                    val.forEach((q, qIdx) => {
                        if (hasBroken(q.text)) brokenItems.push({ table, id: row.id, field: `questions[${qIdx}].text`, value: q.text });
                        if (Array.isArray(q.options)) {
                            q.options.forEach((opt, oIdx) => {
                                if (hasBroken(opt.text)) brokenItems.push({ table, id: row.id, field: `questions[${qIdx}].options[${oIdx}].text`, value: opt.text });
                            });
                        }
                    });
                }
            });
        });
    }

    console.log(JSON.stringify(brokenItems, null, 2));
}

run();
