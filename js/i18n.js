const I18n = (() => {
    const STORAGE_KEY = 'agatha_lang';
    const DEFAULT_LANG = 'ru';

    const translations = {
        ru: {
            // Navigation
            'nav.home': 'Главная',
            'nav.map': 'Карта мира',
            'nav.quizzes': 'Викторины',
            'nav.characters': 'Персонажи',
            'nav.lang': 'EN',

            // Hero
            'hero.title': 'Добро пожаловать в мир Агаты Мистери!',
            'hero.text': 'Погрузись в захватывающий мир тайн и приключений вместе с Агатой Мистери. У нас ты найдёшь уникальные карты с местами действия историй, интересные викторины, а также подробные биографии персонажей. Проверь свою память и знания о книгах, участвуй в увлекательных играх и делись своими впечатлениями. Создавай иллюстрации и пиши фанфики — у нас есть всё для настоящих фанатов.',
            'hero.btn.map': 'Исследовать карту',
            'hero.btn.quiz': 'Пройти викторину',

            // Reviews
            'reviews.title': 'Отзывы фанатов',
            'reviews.form.title': 'Оставить отзыв',
            'reviews.form.name': 'Ваше имя:',
            'reviews.form.name.placeholder': 'Введите ваше имя',
            'reviews.form.text': 'Ваш отзыв:',
            'reviews.form.text.placeholder': 'Поделитесь своими впечатлениями о книгах...',
            'reviews.form.submit': 'Отправить',
            'reviews.empty': 'Пока нет отзывов. Станьте первым!',
            'reviews.loading': 'Загрузка отзывов...',
            'reviews.error': 'Не удалось загрузить отзывы',
            'reviews.success': 'Спасибо за отзыв!',
            'reviews.rejected': 'Отзыв не прошёл проверку.',

            // Map page
            'map.title': 'Карта приключений',
            'map.subtitle': 'От Лондона до Токио — здесь собраны главные места, где Агата раскрывала загадки.',
            'map.sidebar.title': 'Локации',
            'map.note': 'Нажми на карточку локации, чтобы приблизить карту.',
            'map.loading': 'Загрузка локаций...',
            'map.error': 'Не удалось загрузить локации',
            'map.coords': 'Координаты',

            // Characters page
            'characters.title': 'Персонажи',
            'characters.subtitle': 'Познакомься с главными героями серии книг про Агату Мистери.',
            'characters.loading': 'Загрузка персонажей...',
            'characters.error': 'Не удалось загрузить персонажей',
            'characters.btn.details': 'Подробнее',
            'characters.btn.back': 'Назад к персонажам',
            'characters.notfound': 'Персонаж не найден.',

            // Quizzes page
            'quizzes.title': 'Викторины',
            'quizzes.subtitle': 'Проверь свои знания о мире Агаты Мистери!',
            'quizzes.loading': 'Загрузка викторин...',
            'quizzes.error': 'Не удалось загрузить викторины',
            'quizzes.questions': 'Вопросов',
            'quizzes.btn.start': 'Начать',
            'quizzes.btn.check': 'Проверить ответы',
            'quizzes.question': 'Вопрос',
            'quizzes.answer.all': 'Ответьте на все вопросы, чтобы узнать результат.',
            'quizzes.result': 'Ваш результат: {correct} из {total} ({percent}%).',
            'quizzes.notfound': 'Викторина не найдена.',

            // Forms
            'form.fanfic.title': 'Написать фанфик',
            'form.fanfic.subtitle': 'Поделись своей историей о приключениях Агаты!',
            'form.fanfic.name': 'Ваше имя:',
            'form.fanfic.story.title': 'Название истории:',
            'form.fanfic.character': 'Главный персонаж:',
            'form.fanfic.story': 'Ваша история:',
            'form.fanfic.submit': 'Отправить историю',

            'form.illustration.title': 'Загрузить иллюстрацию',
            'form.illustration.subtitle': 'Покажи свой талант художника!',
            'form.illustration.name': 'Ваше имя:',
            'form.illustration.art.title': 'Название работы:',
            'form.illustration.description': 'Описание:',
            'form.illustration.file': 'Файл изображения:',
            'form.illustration.submit': 'Загрузить',

            'form.success': 'Спасибо! Ваша работа отправлена в архив фанатов.',
            'form.error': 'Не удалось отправить данные.',

            // Illustrations
            'illustrations.title': 'Иллюстрации фанатов',
            'illustrations.subtitle': 'Делитесь своими иллюстрациями локаций из приключений Агаты!',
            'illustrations.btn.submit': 'Отправить иллюстрацию',
            'illustrations.empty': 'Пока нет иллюстраций. Будь первым!',
            'illustrations.loading': 'Загрузка иллюстраций...',
            'illustrations.error': 'Не удалось загрузить иллюстрации',

            // Fanfics
            'fanfics.title': 'Фанфики',
            'fanfics.btn.submit': 'Отправить фанфик',
            'fanfics.empty': 'Пока нет фанфиков. Будь первым!',
            'fanfics.loading': 'Загрузка фанфиков...',
            'fanfics.error': 'Не удалось загрузить фанфики',
            'fanfics.author': 'Автор',
            'fanfics.character': 'Персонаж',

            // Workshop
            'workshop.title': 'Творческая мастерская',
            'workshop.subtitle': 'Создай иллюстрацию или напиши фанфик, чтобы поделиться своим видением мира Агаты Мистери.',

            // Common
            'loading': 'Загрузка...',
            'error.retry': 'Попробовать снова',
            'noimage': 'Нет изображения',
            'footer': '© 2024 Фанаты Агаты Мистери. Фан-сайт по книгам Стива Стивенсона.',
            'site.title': 'Агата Мистери'
        },

        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.map': 'World Map',
            'nav.quizzes': 'Quizzes',
            'nav.characters': 'Characters',
            'nav.lang': 'RU',

            // Hero
            'hero.title': 'Welcome to the World of Agatha Mystery!',
            'hero.text': 'Dive into the thrilling world of mysteries and adventures with Agatha Mystery. Here you\'ll find unique maps of story locations, exciting quizzes, and detailed character biographies. Test your memory and knowledge of the books, participate in engaging games, and share your impressions. Create illustrations and write fanfiction — we have everything for true fans.',
            'hero.btn.map': 'Explore Map',
            'hero.btn.quiz': 'Take a Quiz',

            // Reviews
            'reviews.title': 'Fan Reviews',
            'reviews.form.title': 'Leave a Review',
            'reviews.form.name': 'Your name:',
            'reviews.form.name.placeholder': 'Enter your name',
            'reviews.form.text': 'Your review:',
            'reviews.form.text.placeholder': 'Share your impressions about the books...',
            'reviews.form.submit': 'Submit',
            'reviews.empty': 'No reviews yet. Be the first!',
            'reviews.loading': 'Loading reviews...',
            'reviews.error': 'Failed to load reviews',
            'reviews.success': 'Thank you for your review!',
            'reviews.rejected': 'Review did not pass moderation.',

            // Map page
            'map.title': 'Adventure Map',
            'map.subtitle': 'From London to Tokyo — all the places where Agatha solved mysteries.',
            'map.sidebar.title': 'Locations',
            'map.note': 'Click on a location card to zoom the map.',
            'map.loading': 'Loading locations...',
            'map.error': 'Failed to load locations',
            'map.coords': 'Coordinates',

            // Characters page
            'characters.title': 'Characters',
            'characters.subtitle': 'Meet the main heroes of the Agatha Mystery book series.',
            'characters.loading': 'Loading characters...',
            'characters.error': 'Failed to load characters',
            'characters.btn.details': 'Learn More',
            'characters.btn.back': 'Back to Characters',
            'characters.notfound': 'Character not found.',

            // Quizzes page
            'quizzes.title': 'Quizzes',
            'quizzes.subtitle': 'Test your knowledge of the Agatha Mystery world!',
            'quizzes.loading': 'Loading quizzes...',
            'quizzes.error': 'Failed to load quizzes',
            'quizzes.questions': 'Questions',
            'quizzes.btn.start': 'Start',
            'quizzes.btn.check': 'Check Answers',
            'quizzes.question': 'Question',
            'quizzes.answer.all': 'Answer all questions to see your result.',
            'quizzes.result': 'Your result: {correct} out of {total} ({percent}%).',
            'quizzes.notfound': 'Quiz not found.',

            // Forms
            'form.fanfic.title': 'Write a Fanfic',
            'form.fanfic.subtitle': 'Share your story about Agatha\'s adventures!',
            'form.fanfic.name': 'Your name:',
            'form.fanfic.story.title': 'Story title:',
            'form.fanfic.character': 'Main character:',
            'form.fanfic.story': 'Your story:',
            'form.fanfic.submit': 'Submit Story',

            'form.illustration.title': 'Upload Illustration',
            'form.illustration.subtitle': 'Show your artistic talent!',
            'form.illustration.name': 'Your name:',
            'form.illustration.art.title': 'Artwork title:',
            'form.illustration.description': 'Description:',
            'form.illustration.file': 'Image file:',
            'form.illustration.submit': 'Upload',

            'form.success': 'Thank you! Your work has been submitted to the fan archive.',
            'form.error': 'Failed to submit data.',

            // Illustrations
            'illustrations.title': 'Fan Illustrations',
            'illustrations.subtitle': 'Share your illustrations of locations from Agatha\'s adventures!',
            'illustrations.btn.submit': 'Submit Illustration',
            'illustrations.empty': 'No illustrations yet. Be the first!',
            'illustrations.loading': 'Loading illustrations...',
            'illustrations.error': 'Failed to load illustrations',

            // Fanfics
            'fanfics.title': 'Fanfics',
            'fanfics.btn.submit': 'Submit Fanfic',
            'fanfics.empty': 'No fanfics yet. Be the first!',
            'fanfics.loading': 'Loading fanfics...',
            'fanfics.error': 'Failed to load fanfics',
            'fanfics.author': 'Author',
            'fanfics.character': 'Character',

            // Workshop
            'workshop.title': 'Creative Workshop',
            'workshop.subtitle': 'Create an illustration or write a fanfic to share your vision of Agatha Mistery\'s world.',

            // Common
            'loading': 'Loading...',
            'error.retry': 'Try Again',
            'noimage': 'No image',
            'footer': '© 2024 Agatha Mystery Fans. Fan site for Steve Stevenson\'s books.',
            'site.title': 'Agatha Mystery'
        }
    };

    let currentLang = DEFAULT_LANG;
    let remoteTranslations = null;

    /**
     * Загрузить переводы из Supabase
     */
    const loadFromSupabase = async () => {
        try {
            const config = window.SUPABASE_CONFIG || {};
            if (!config.url || !config.anonKey) return false;

            const response = await fetch(`${config.url}/rest/v1/translations?select=key,ru,en`, {
                headers: {
                    'apikey': config.anonKey,
                    'Authorization': `Bearer ${config.anonKey}`
                }
            });

            if (!response.ok) return false;

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return false;

            remoteTranslations = { ru: {}, en: {} };
            data.forEach(row => {
                if (row.key) {
                    remoteTranslations.ru[row.key] = row.ru;
                    remoteTranslations.en[row.key] = row.en;
                }
            });

            console.log('I18n: Загружено', data.length, 'переводов из Supabase');
            return true;
        } catch (error) {
            console.warn('I18n: Не удалось загрузить переводы из Supabase:', error.message);
            return false;
        }
    };

    const init = async () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && translations[saved]) {
            currentLang = saved;
        }
        document.documentElement.lang = currentLang;

        // Пробуем загрузить переводы из Supabase
        await loadFromSupabase();

        return currentLang;
    };

    const getLang = () => currentLang;

    const setLang = (lang) => {
        if (!translations[lang]) return false;
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        return true;
    };

    const t = (key, params = {}) => {
        // Сначала ищем в remote переводах (из Supabase)
        let text = remoteTranslations?.[currentLang]?.[key]
            || remoteTranslations?.[DEFAULT_LANG]?.[key]
            || translations[currentLang]?.[key]
            || translations[DEFAULT_LANG]?.[key]
            || key;

        Object.keys(params).forEach((param) => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    };

    const translatePage = () => {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.dataset.i18n;
            el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.dataset.i18nTitle;
            document.title = t(key) + ' | ' + t('site.title');
        });

        const langBtn = document.querySelector('[data-lang-toggle]');
        if (langBtn) {
            langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
        }
    };

    const toggle = () => {
        const newLang = currentLang === 'ru' ? 'en' : 'ru';
        setLang(newLang);
        translatePage();
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: newLang } }));
    };

    return {
        init,
        getLang,
        setLang,
        t,
        translatePage,
        toggle
    };
})();
