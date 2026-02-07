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
            'nav.about': 'О нас',
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
            'quizzes.of': 'из',
            'quizzes.input.placeholder': 'Введите ваш ответ...',

            // Forms
            'form.fanfic.title': 'Написать фанфик',
            'form.fanfic.subtitle': 'Поделись своей историей о приключениях Агаты!',
            'form.fanfic.name': 'Ваше имя:',
            'form.fanfic.story.title': 'Название истории:',
            'form.fanfic.character': 'Главный персонаж:',
            'form.fanfic.story': 'Ваша история:',
            'form.fanfic.select_character': 'Выберите персонажа',
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
            'form.error.supabase': 'Не удалось отправить данные в Supabase.',
            'form.error.local': 'Сохранено локально. Подключите Supabase, чтобы хранить в интернете.',
            'form.validation': 'Заполните обязательные поля.',

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

            // About Us
            'about.title': 'О нас',
            'about.subtitle': 'Узнайте больше о нашем сообществе и миссии.',
            'about.loading': 'Загрузка истории...',
            'about.error': 'Не удалось загрузить информацию.',
            'about.empty': 'История еще не написана. Расскажите о себе!',

            // Workshop
            'workshop.title': 'Творческая мастерская',
            'workshop.subtitle': 'Создай иллюстрацию или напиши фанфик, чтобы поделиться своим видением мира Агаты Мистери.',

            // Common
            'loading': 'Загрузка...',
            'error.retry': 'Попробовать снова',
            'error.no_supabase': 'Supabase не настроен',
            'error.load_data': 'Не удалось загрузить данные',
            'error.map_load': 'Карта не загрузилась. Проверьте подключение к интернету.',
            'error.char_not_found': 'Персонаж не найден.',
            'error.quiz_not_found': 'Викторина не найдена.',
            'error.review_check': 'Отзыв не прошёл проверку.',
            'error.review_fields': 'Заполните имя и текст отзыва.',
            'error.review_generic': 'Не удалось отправить отзыв. Попробуйте позже.',
            'noimage': 'Нет изображения',
            'footer': '© 2024 Фанаты Агаты Мистери. Фан-сайт по книгам Стива Стивенсона.',
            'site.title': 'Агата Мистери',
            'supabase.connect': 'Подключите Supabase для просмотра.',
            'gallery.prev': 'Предыдущее',
            'gallery.next': 'Следующее',
            'review.local': '(Сохранено локально)',
            'review.score': 'Оценка: {score}/10.',

            // Character Names
            'char.agatha': 'Агата Мистери',
            'char.larry': 'Ларри Мистери',
            'char.watson': 'Ватсон (кот)',
            'char.kent': 'Мистер Кент',
            'char.chandler': 'Чандлер Мистери',

            // Placeholders
            'form.placeholder.art_title': 'Например: Тайна в Лондоне',
            'form.placeholder.description': 'Что вдохновило тебя?',
            'form.placeholder.fanfic_title': 'Название истории',
            'form.placeholder.fanfic_text': 'Напишите короткий сюжет или начало истории',

            // Meta & Aria
            'meta.description.home': 'Добро пожаловать на фан-сайт Агаты Мистери. Здесь вы найдете карту приключений, викторины и информацию о персонажах.',
            'meta.description.map': 'Карта приключений Агаты Мистери по всему миру.',
            'meta.description.quiz': 'Викторины по книгам Агаты Мистери.',
            'meta.description.quiz-detail': 'Детали викторины по книгам Агаты Мистери.',
            'meta.description.characters': 'Персонажи серии книг про Агату Мистери.',
            'meta.description.character-detail': 'Подробности о персонажах Агаты Мистери.',
            'meta.description.fanfiction-form': 'Форма отправки фанфиков по Агате Мистери.',
            'meta.description.illustration-form': 'Форма отправки иллюстраций по книгам Агаты Мистери.',
            'meta.description.about': 'О фанатском сообществе Агаты Мистери и нашей миссии.',
            'nav.menu.label': 'Меню'
        },

        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.map': 'World Map',
            'nav.quizzes': 'Quizzes',
            'nav.characters': 'Characters',
            'nav.about': 'About Us',
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
            'quizzes.of': 'of',
            'quizzes.input.placeholder': 'Enter your answer...',

            // Forms
            'form.fanfic.title': 'Write a Fanfic',
            'form.fanfic.subtitle': 'Share your story about Agatha\'s adventures!',
            'form.fanfic.name': 'Your name:',
            'form.fanfic.story.title': 'Story title:',
            'form.fanfic.character': 'Main character:',
            'form.fanfic.story': 'Your story:',
            'form.fanfic.select_character': 'Select a character',
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
            'form.error.supabase': 'Failed to submit data to Supabase.',
            'form.error.local': 'Saved locally. Connect Supabase to store on the internet.',
            'form.validation': 'Please fill in required fields.',

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

            // About Us
            'about.title': 'About Us',
            'about.subtitle': 'Learn more about our community and mission.',
            'about.loading': 'Loading history...',
            'about.error': 'Failed to load information.',
            'about.empty': 'History hasn\'t been written yet. Tell us about yourself!',

            // Workshop
            'workshop.title': 'Creative Workshop',
            'workshop.subtitle': 'Create an illustration or write a fanfic to share your vision of Agatha Mistery\'s world.',

            // Common
            'loading': 'Loading...',
            'error.retry': 'Try Again',
            'error.no_supabase': 'Supabase not configured',
            'error.load_data': 'Failed to load data',
            'error.map_load': 'Map failed to load. Check your internet connection.',
            'error.char_not_found': 'Character not found.',
            'error.quiz_not_found': 'Quiz not found.',
            'error.review_check': 'Review did not pass moderation.',
            'error.review_fields': 'Fill in your name and review text.',
            'error.review_generic': 'Failed to submit review. Try later.',
            'noimage': 'No image',
            'footer': '© 2024 Agatha Mystery Fans. Fan site for Steve Stevenson\'s books.',
            'site.title': 'Agatha Mystery',
            'supabase.connect': 'Connect Supabase to view.',
            'gallery.prev': 'Previous',
            'gallery.next': 'Next',
            'review.local': '(Saved locally)',
            'review.score': 'Score: {score}/10.',

            // Character Names
            'char.agatha': 'Agatha Mystery',
            'char.larry': 'Larry Mystery',
            'char.watson': 'Watson (cat)',
            'char.kent': 'Mr. Kent',
            'char.chandler': 'Chandler Mystery',

            // Placeholders
            'form.placeholder.art_title': 'Example: Mystery in London',
            'form.placeholder.description': 'What inspired you?',
            'form.placeholder.fanfic_title': 'Story title',
            'form.placeholder.fanfic_text': 'Write a short plot or the beginning of the story',

            // Meta & Aria
            'meta.description.home': 'Welcome to the Agatha Mystery fan site. Here you will find an adventure map, quizzes, and character information.',
            'meta.description.map': 'Map of Agatha Mystery adventures around the world.',
            'meta.description.quiz': 'Quizzes based on the Agatha Mystery books.',
            'meta.description.quiz-detail': 'Quiz details for Agatha Mystery books.',
            'meta.description.characters': 'Characters from the Agatha Mystery book series.',
            'meta.description.character-detail': 'Details about Agatha Mystery characters.',
            'meta.description.fanfiction-form': 'Fanfic submission form for Agatha Mystery.',
            'meta.description.illustration-form': 'Illustration submission form for Agatha Mystery books.',
            'meta.description.about': 'About the Agatha Mystery fan community and our mission.',
            'nav.menu.label': 'Menu'
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

        // Переводим страницу сразу тем, что есть в локальных переводах
        translatePage();

        // Пробуем загрузить переводы из Supabase
        await loadFromSupabase();

        // Переводим ещё раз, если приехали удалённые переводы
        translatePage();

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

        // Translate meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
            const descKey = `meta.description.${pageName}`;
            const translatedDesc = t(descKey);
            if (translatedDesc !== descKey) {
                metaDesc.setAttribute('content', translatedDesc);
            }
        }

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const key = el.dataset.i18nAriaLabel;
            el.setAttribute('aria-label', t(key));
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
