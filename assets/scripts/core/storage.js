const Storage = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    },
    push(key, item) {
        const items = this.get(key, []);
        items.push(item);
        this.set(key, items);
        return items;
    }
};

const Supa = (() => {
    const config = window.SUPABASE_CONFIG || {};
    const url = (config.url || '').trim();
    const anonKey = (config.anonKey || '').trim();
    const hasPlaceholders = url.includes('YOUR_') || anonKey.includes('YOUR_');
    const isConfigured = Boolean(url && anonKey && !hasPlaceholders && window.supabase);
    const client = isConfigured ? window.supabase.createClient(url, anonKey) : null;
    const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
    const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

    const isReady = () => Boolean(client);

    const validateTextField = (value, min, max, fieldName) => {
        const normalized = String(value ?? '').trim();
        if (normalized.length < min || normalized.length > max) {
            throw new Error(`Invalid ${fieldName} length`);
        }
        return normalized;
    };

    const validateIllustrationFile = (file) => {
        if (!file || file.size <= 0) return null;
        if (file.size > MAX_UPLOAD_BYTES) {
            throw new Error('File is too large');
        }
        const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            throw new Error('Unsupported file extension');
        }
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            throw new Error('Unsupported file type');
        }
        return { ext };
    };

    const enforceClientRateLimit = (actionKey, intervalMs = 8000) => {
        const now = Date.now();
        const key = `rate_limit_${actionKey}`;
        const last = Number(localStorage.getItem(key) || '0');
        if (now - last < intervalMs) {
            throw new Error('Too many requests');
        }
        localStorage.setItem(key, String(now));
    };

    const retry = async (fn, maxAttempts = 3, delay = 1000) => {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                }
            }
        }
        throw lastError;
    };

    const getReviews = async () => {
        if (!client) throw new Error('Supabase не настроен');
        return retry(async () => {
            const { data, error } = await client
                .from('reviews')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        });
    };

    const submitReview = async ({ name, text }) => {
        if (!client) throw new Error('Supabase не настроен');
        const { data, error } = await client.functions.invoke('moderate-review', {
            body: { name, text }
        });
        if (error) throw error;
        return data;
    };

    const addFanfic = async ({ name, title, character, story }) => {
        if (!client) throw new Error('Supabase не настроен');
        enforceClientRateLimit('fanfic_submit');
        const safeName = validateTextField(name, 2, 60, 'name');
        const safeTitle = validateTextField(title, 2, 100, 'title');
        const safeCharacter = String(character ?? '').trim().slice(0, 80);
        const safeStory = validateTextField(story, 20, 2000, 'story');
        const { error } = await client
            .from('fanfics')
            .insert({ name: safeName, title: safeTitle, character: safeCharacter, story: safeStory });
        if (error) throw error;
        return true;
    };

    const addIllustration = async ({ name, title, description }, file) => {
        if (!client) throw new Error('Supabase не настроен');
        enforceClientRateLimit('illustration_submit');
        const safeName = validateTextField(name, 2, 60, 'name');
        const safeTitle = validateTextField(title, 2, 80, 'title');
        const safeDescription = String(description ?? '').trim().slice(0, 500);
        let filePath = null;
        let fileUrl = null;
        let fileName = null;

        if (file && file.size > 0) {
            const validation = validateIllustrationFile(file);
            const safeExt = validation.ext;
            fileName = file.name;
            const randomId = (window.crypto && window.crypto.randomUUID)
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            filePath = `${randomId}.${safeExt}`;

            const { error: uploadError } = await client
                .storage
                .from('illustrations')
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                });
            if (uploadError) throw uploadError;

            const { data } = client.storage.from('illustrations').getPublicUrl(filePath);
            fileUrl = data ? data.publicUrl : null;
        }

        const { error } = await client
            .from('illustrations')
            .insert({
                name: safeName,
                title: safeTitle,
                description: safeDescription,
                file_path: filePath,
                file_url: fileUrl,
                file_name: fileName
            });
        if (error) throw error;
        return true;
    };

    const getPlaceImages = async () => {
        if (!client) throw new Error('Supabase не настроен');
        const { data, error } = await client
            .from('place_images')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
    };

    const getPlaces = async () => {
        if (!client) throw new Error('Supabase не настроен');
        return retry(async () => {
            const { data, error } = await client
                .from('places')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;

            let placeImages = [];
            try {
                placeImages = await getPlaceImages();
            } catch (_e) {
                // Table may not exist yet
            }

            const imagesByPlace = {};
            placeImages.forEach((img) => {
                if (!imagesByPlace[img.place_id]) {
                    imagesByPlace[img.place_id] = [];
                }
                imagesByPlace[img.place_id].push({
                    url: img.image_url,
                    caption: img.caption
                });
            });

            // Определяем текущий язык
            const lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'ru';

            return (data || []).map((place) => ({
                ...place,
                // Возвращаем переведённый контент
                name: lang === 'en' && place.name_en ? place.name_en : place.name,
                description: lang === 'en' && place.description_en ? place.description_en : place.description,
                image: place.image_url ?? place.image,
                images: imagesByPlace[place.id] || (place.image_url ? [{ url: place.image_url, caption: '' }] : []),
                lat: Number(place.lat),
                lng: Number(place.lng)
            }));
        });
    };

    const getCharacters = async () => {
        if (!client) throw new Error('Supabase не настроен');
        return retry(async () => {
            const { data, error } = await client
                .from('characters')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;

            const lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'ru';

            return (data || []).map((character) => ({
                ...character,
                name: lang === 'en' && character.name_en ? character.name_en : character.name,
                shortDescription: lang === 'en' && character.short_description_en ? character.short_description_en : (character.short_description ?? character.shortDescription),
                fullBio: lang === 'en' && character.full_bio_en ? character.full_bio_en : (character.full_bio ?? character.fullBio),
                image: character.image_url ?? character.image
            }));
        });
    };

    const getQuizzes = async () => {
        if (!client) throw new Error('Supabase не настроен');
        return retry(async () => {
            const { data, error } = await client
                .from('quizzes')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;

            const lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'ru';

            return (data || []).map((quiz) => {
                // Translate questions based on language
                const rawQuestions = quiz.questions || [];
                const questions = rawQuestions.map((q) => ({
                    ...q,
                    text: lang === 'en' && q.text_en ? q.text_en : q.text,
                    options: (q.options || []).map((opt) => ({
                        ...opt,
                        text: lang === 'en' && opt.text_en ? opt.text_en : opt.text
                    })),
                    correctAnswer: lang === 'en' && q.correctAnswer_en ? q.correctAnswer_en : q.correctAnswer
                }));

                return {
                    ...quiz,
                    title: lang === 'en' && quiz.title_en ? quiz.title_en : quiz.title,
                    description: lang === 'en' && quiz.description_en ? quiz.description_en : quiz.description,
                    questions: questions,
                    questionsCount: quiz.questions_count ?? quiz.questionsCount ?? (questions ? questions.length : 0)
                };
            });
        });
    };

    const getFanfics = async () => {
        if (!client) throw new Error('Supabase не настроен');
        const { data, error } = await client
            .from('fanfics')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    };

    const getIllustrations = async () => {
        if (!client) throw new Error('Supabase не настроен');
        const { data, error } = await client
            .from('illustrations')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    };

    const getAbout = async () => {
        if (!client) throw new Error('Supabase не настроен');
        try {
            const { data, error } = await client
                .from('about_sections')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;

            const lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'ru';

            return (data || []).map(section => ({
                id: section.id,
                title: lang === 'en' && section.title_en ? section.title_en : section.title,
                blocks: (section.blocks || []).map(block => ({
                    subtitle: lang === 'en' && block.subtitle_en ? block.subtitle_en : block.subtitle,
                    content: lang === 'en' && block.content_en ? block.content_en : block.content
                }))
            }));
        } catch (error) {
            console.error('Error fetching about data:', error);
            return [];
        }
    };

    return {
        isReady,
        getReviews,
        submitReview,
        addFanfic,
        addIllustration,
        getPlaces,
        getCharacters,
        getQuizzes,
        getFanfics,
        getIllustrations,
        getAbout
    };
})();
