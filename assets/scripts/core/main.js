const App = (() => {
    const state = {
        basePath: ''
    };

    const initBasePath = () => {
        state.basePath = window.location.pathname.includes('/pages/') ? '../' : '';
    };

    const resolveAsset = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('data:image')) return path;
        if (path.startsWith('assets/')) return `${state.basePath}${path}`;
        return path;
    };

    const t = (key, fallback) => {
        return (typeof I18n !== 'undefined' && I18n.t) ? I18n.t(key) : fallback;
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const safeText = (value) => escapeHtml(value);

    const safeAttr = (value) => escapeHtml(value);

    const safeUrl = (value) => {
        if (!value) return '';
        const url = String(value).trim();
        if (!url) return '';
        if (url.startsWith('data:image/')) return url;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
        if (!url.includes(':')) return url;
        return '';
    };

    const safeMultilineHtml = (value) => safeText(value).replace(/\r?\n/g, '<br>');

    const showLoading = (container, text) => {
        const loadingText = safeText(text || t('loading', 'Loading...'));
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">${loadingText}</p>
            </div>
        `;
    };

    const showError = (container, message, retryFn) => {
        const retryText = safeText(t('error.retry', 'Try Again'));
        const safeMessage = safeText(message);
        container.innerHTML = `
            <div class="error-container">
                <p>${safeMessage}</p>
                <button class="btn btn-retry" data-retry>${retryText}</button>
            </div>
        `;
        const btn = container.querySelector('[data-retry]');
        if (btn && retryFn) {
            btn.addEventListener('click', retryFn);
        }
    };

    const setupNav = () => {
        const burger = document.querySelector('.burger-menu');
        const menu = document.querySelector('.nav-menu');

        // Breadcrumbs
        const renderBreadcrumbs = () => {
            const header = document.querySelector('.page-header .container');
            if (!header) return;

            // Remove existing breadcrumbs if any to re-render on language change
            const existingNav = header.querySelector('.breadcrumbs');
            if (existingNav) existingNav.remove();

            const path = window.location.pathname.split('/').pop() || 'index.html';
            const routes = {
                'index.html': { name: t('nav.home', 'Главная'), url: state.basePath + 'index.html' },
                'map.html': { name: t('nav.map', 'Карта мира'), url: state.basePath + 'pages/map.html' },
                'quiz.html': { name: t('nav.quizzes', 'Викторины'), url: state.basePath + 'pages/quiz.html' },
                'quiz-detail.html': { name: t('nav.quizzes', 'Викторины'), parent: 'quiz.html', url: state.basePath + 'pages/quiz.html' },
                'characters.html': { name: t('nav.characters', 'Персонажи'), url: state.basePath + 'pages/characters.html' },
                'character-detail.html': { name: t('nav.characters', 'Персонажи'), parent: 'characters.html', url: state.basePath + 'pages/characters.html' },
                'about.html': { name: t('nav.about', 'О нас'), url: state.basePath + 'pages/about.html' },
                'illustration-form.html': { name: t('form.illustration.title', 'Отправить иллюстрацию'), parent: 'map.html', url: state.basePath + 'pages/map.html' },
                'fanfiction-form.html': { name: t('form.fanfic.title', 'Отправить фанфик'), parent: 'characters.html', url: state.basePath + 'pages/characters.html' }
            };

            const currentRoute = routes[path];
            if (!currentRoute || path === 'index.html') return;

            const nav = document.createElement('nav');
            nav.className = 'breadcrumbs';
            nav.setAttribute('aria-label', 'Breadcrumb');

            let html = `<a href="${safeAttr(state.basePath)}index.html">${safeText(t('nav.home', 'Главная'))}</a>`;

            if (currentRoute.parent && routes[currentRoute.parent]) {
                const parent = routes[currentRoute.parent];
                html += ` <span class="separator">/</span> <a href="${safeAttr(parent.url)}">${safeText(parent.name)}</a>`;
            }

            // Current page (if it has a specific name override or just use page title)
            // For detail pages, we might want to just show the parent active
            if (!currentRoute.parent) {
                html += ` <span class="separator">/</span> <span aria-current="page">${safeText(currentRoute.name)}</span>`;
            } else {
                // For sub-pages like forms
                html += ` <span class="separator">/</span> <span aria-current="page">${safeText(currentRoute.name)}</span>`;
            }

            nav.innerHTML = html;
            header.insertBefore(nav, header.firstChild);
        };

        renderBreadcrumbs();

        // Update breadcrumbs on language change
        window.addEventListener('langchange', () => {
            renderBreadcrumbs();
        });

        // Random Quote in Footer
        const renderRandomQuote = () => {
            const footer = document.querySelector('.main-footer .container');
            if (!footer) return;

            // Check if quote already exists
            if (footer.querySelector('.footer-quote')) return;

            const quotes = [
                { text: "Настоящий детектив никогда не игнорирует улики.", author: "Агата Мистери" },
                { text: "Интуиция — это то, что отличает хорошего сыщика от великого.", author: "Агата Мистери" },
                { text: "Ларри, хватит думать о еде! У нас дело!", author: "Агата Мистери" },
                { text: "Даже у самого запутанного преступления есть простая разгадка.", author: "Агата Мистери" },
                { text: "Путешествия развивают ум и наблюдательность.", author: "Мистер Кент" }
            ];

            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

            const quoteDiv = document.createElement('div');
            quoteDiv.className = 'footer-quote';
            quoteDiv.style.marginTop = '20px';
            quoteDiv.style.fontStyle = 'italic';
            quoteDiv.style.opacity = '0.8';
            quoteDiv.style.borderTop = '1px solid rgba(0,0,0,0.1)';
            quoteDiv.style.paddingTop = '10px';
            quoteDiv.innerHTML = `"${randomQuote.text}" — <strong>${randomQuote.author}</strong>`;

            footer.appendChild(quoteDiv);
        };
        renderRandomQuote();

        if (!burger || !menu) return;

        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            menu.classList.toggle('active');
        });

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                menu.classList.remove('active');
            });
        });

        const current = window.location.pathname.split('/').pop() || 'index.html';
        const aliasMap = {
            'quiz-detail.html': 'quiz.html',
            'character-detail.html': 'characters.html',
            'illustration-form.html': 'characters.html',
            'fanfiction-form.html': 'characters.html'
        };
        const activeTarget = aliasMap[current] || current;
        menu.querySelectorAll('a').forEach((link) => {
            const href = link.getAttribute('href');
            if (href && href.endsWith(activeTarget)) {
                link.classList.add('active');
            }
        });
    };

    const fetchJson = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(t('error.load_data', 'Failed to load data'));
        }
        return response.json();
    };

    const readInlineCharacters = () => {
        const inline = document.getElementById('characters-data');
        if (!inline) return null;
        try {
            const parsed = JSON.parse(inline.textContent || '[]');
            return Array.isArray(parsed) ? parsed : null;
        } catch (_error) {
            return null;
        }
    };

    const readInlineQuizzes = () => {
        const inline = document.getElementById('quizzes-data');
        if (!inline) return null;
        try {
            const parsed = JSON.parse(inline.textContent || '[]');
            return Array.isArray(parsed) ? parsed : null;
        } catch (_error) {
            return null;
        }
    };

    const DEFAULT_ABOUT = [
        {
            id: 1,
            title: 'О нас',
            title_en: 'About Us',
            blocks: [
                {
                    subtitle: 'Кто мы',
                    subtitle_en: 'Who We Are',
                    content: 'Мы — фанаты книжной серии про Агату Мистери. Этот сайт создан с любовью к приключениям Агаты и Ларри по всему миру.',
                    content_en: 'We are fans of the Agatha Mystery book series. This site was created with love for Agatha and Larry\'s adventures around the world.'
                }
            ]
        },
        {
            id: 2,
            title: 'Наша миссия',
            title_en: 'Our Mission',
            blocks: [
                {
                    subtitle: 'Что мы делаем',
                    subtitle_en: 'What We Do',
                    content: 'Мы собираем карты приключений, викторины и истории о персонажах. Поддерживаем фанатское творчество — иллюстрации и фанфики.',
                    content_en: 'We collect adventure maps, quizzes, and character stories. We support fan creativity — illustrations and fanfiction.'
                }
            ]
        },
        {
            id: 3,
            title: 'Присоединяйся',
            title_en: 'Join Us',
            blocks: [
                {
                    subtitle: 'Как участвовать',
                    subtitle_en: 'How to Participate',
                    content: 'Пройди викторину, исследуй карту мира, оставь отзыв или отправь свою иллюстрацию и фанфик в творческую мастерскую.',
                    content_en: 'Take a quiz, explore the world map, leave a review, or submit your illustration and fanfic to the creative workshop.'
                }
            ]
        }
    ];

    const DEFAULT_CHARACTERS = [
        { name: "Агата Мистери" },
        { name: "Ларри Мистери" },
        { name: "Ватсон (кот)" },
        { name: "Мистер Кент" },
        { name: "Чандлер Мистери" }
    ];

    const DEFAULT_PLACES = [
        {
            id: 1,
            name: "Лондон, Англия",
            description: "Родной город Агаты Мистери. Здесь находится дом семьи Мистери и начинаются многие приключения.",
            lat: 51.5074,
            lng: -0.1278,
            images: [{ url: 'assets/images/places/london.svg', caption: 'Биг-Бен' }]
        },
        {
            id: 2,
            name: "Париж, Франция",
            description: "Город любви и загадок, где Агата и Ларри раскрывали тайну исчезнувшей картины в Лувре.",
            lat: 48.8566,
            lng: 2.3522,
            images: [{ url: 'assets/images/places/paris.svg', caption: 'Эйфелева башня' }]
        },
        {
            id: 3,
            name: "Египет, Каир",
            description: "Земля пирамид и фараонов. Агата исследовала древние гробницы и разгадала загадку проклятия.",
            lat: 30.0444,
            lng: 31.2357,
            images: [{ url: 'assets/images/places/cairo.svg', caption: 'Пирамиды Гизы' }]
        },
        {
            id: 4,
            name: "Венеция, Италия",
            description: "Романтический город на воде, где происходила история с похищенной маской на карнавале.",
            lat: 45.4408,
            lng: 12.3155,
            images: [{ url: 'assets/images/places/venice.svg', caption: 'Гранд-канал' }]
        },
        {
            id: 5,
            name: "Токио, Япония",
            description: "Современный мегаполис, где Агата расследовала пропажу древнего самурайского меча.",
            lat: 35.6762,
            lng: 139.6503,
            images: [{ url: 'assets/images/places/tokyo.svg', caption: 'Токийская башня' }]
        }
    ];

    const loadPlaces = async () => {
        if (state.places) return state.places;
        if (typeof Supa !== 'undefined' && Supa.isReady()) {
            try {
                const places = await Supa.getPlaces();
                if (places && places.length > 0) {
                    state.places = places;
                    return places;
                }
            } catch (e) { console.warn('Supabase places load failed', e); }
        }

        // Fallback to defaults if Supabase fails or is empty
        state.places = DEFAULT_PLACES;
        return DEFAULT_PLACES;
    };

    const loadCharacters = async () => {
        if (state.characters) return state.characters;

        // Try Supabase
        if (typeof Supa !== 'undefined' && Supa.isReady()) {
            try {
                const characters = await Supa.getCharacters();
                if (characters && characters.length) {
                    state.characters = characters;
                    return characters;
                }
            } catch (_error) {
                // Fallback to local JSON/Inline
            }
        }

        // Try JSON
        try {
            const characters = await fetchJson(`${state.basePath}assets/data/characters.json`);
            state.characters = characters;
            return characters;
        } catch (error) {
            // Try Inline
            const inline = readInlineCharacters();
            if (inline) {
                state.characters = inline;
                return inline;
            }

            // Final Fallback
            state.characters = DEFAULT_CHARACTERS;
            return DEFAULT_CHARACTERS;
        }
    };

    const loadQuizzes = async () => {
        if (state.quizzes) return state.quizzes;
        if (typeof Supa !== 'undefined' && Supa.isReady()) {
            try {
                const quizzes = await Supa.getQuizzes();
                if (quizzes.length) {
                    state.quizzes = quizzes;
                    return quizzes;
                }
            } catch (_error) {
                // Fallback to local JSON
            }
        }
        try {
            const quizzes = await fetchJson(`${state.basePath}assets/data/quizzes.json`);
            state.quizzes = quizzes;
            return quizzes;
        } catch (error) {
            const inline = readInlineQuizzes();
            if (inline) {
                state.quizzes = inline;
                return inline;
            }
            throw error;
        }
    };

    const shuffleArray = (items) => {
        const copy = Array.isArray(items) ? items.slice() : [];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const getQuestionMode = (question) => {
        const options = Array.isArray(question.options) ? question.options : [];
        if (question.type === 'input' || options.length === 0) return 'input';
        if (options.some((option) => option.image)) return 'image';
        if (options.filter((option) => option.isCorrect).length > 1) return 'multiple';
        return 'single';
    };

    const normalizeDifficultyValue = (value) => {
        if (!value) return null;
        const cleaned = String(value).trim().toLowerCase().replace(/ё/g, 'е');
        if (['easy', 'легкая', 'лёгкая', 'простая', 'low'].includes(cleaned)) return 'easy';
        if (['medium', 'средняя', 'средне', 'normal', 'mid'].includes(cleaned)) return 'medium';
        if (['hard', 'сложная', 'высокая', 'high'].includes(cleaned)) return 'hard';
        return null;
    };

    const inferQuestionDifficulty = (question) => {
        const normalized = normalizeDifficultyValue(question.difficulty || question.level);
        if (normalized) return normalized;
        return 'medium';
    };

    const polishQuestionText = (value) => {
        if (!value) return value;
        let text = String(value).trim();

        text = text.replace(/Как называется точка входа в (.+?)\?/i, 'С чего начинается $1?');
        text = text.replace(/Какая точка действия выделяется в (.+?)\?/i, 'Какая локация особенно выделяется в $1?');
        text = text.replace(/Какое место ключевое для (.+?)\?/i, 'Какое место становится ключевым для $1?');
        text = text.replace(/Какое место является главным в (.+?)\?/i, 'Какое место становится главным в $1?');
        text = text.replace(/Какую локацию стоит связать с (.+?)\?/i, 'Какую локацию мы вспоминаем, когда речь о $1?');
        text = text.replace(/С какой страной или регионом прежде всего связана (.+?)\?/i, 'С какой страной или регионом прежде всего связывают $1?');
        text = text.replace(/Что верно о книге «(.+?)»\?/i, 'Какой факт верно относится к книге «$1»?');
        text = text.replace(/Что верно о герое «(.+?)»\?/i, 'Какой факт лучше всего характеризует героя «$1»?');

        return text;
    };

    const normalizeQuizQuestion = (question, index) => ({
        ...question,
        id: Number(question.id) || index + 1,
        text: polishQuestionText(question.text),
        questionMode: getQuestionMode(question),
        difficulty: inferQuestionDifficulty(question)
    });

    const normalizeQuizBank = (quiz) => {
        const questions = Array.isArray(quiz.questions)
            ? quiz.questions.map((question, index) => normalizeQuizQuestion(question, index))
            : [];
        return {
            ...quiz,
            questions,
            questionsCount: Number(quiz.questionsCount) || Number(quiz.questions_count) || questions.length
        };
    };

    const filterQuizQuestions = (questions, difficulty) => questions.filter((question) => (
        question.difficulty === difficulty && question.questionMode !== 'image'
    ));

    const pickRandomQuestions = (pool, count, previousIds) => {
        const shuffled = shuffleArray(pool);
        const picked = shuffled.slice(0, count);

        if (!previousIds || pool.length <= count) {
            return picked;
        }

        const pickedIds = picked.map((question) => question.id).join(',');
        if (pickedIds !== previousIds.join(',')) {
            return picked;
        }

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const retry = shuffleArray(pool).slice(0, count);
            const retryIds = retry.map((question) => question.id).join(',');
            if (retryIds !== previousIds.join(',')) {
                return retry;
            }
        }

        return picked;
    };

    const getModeLabel = (mode) => {
        switch (mode) {
            case 'single':
                return t('quizzes.mode.single', 'Один ответ');
            case 'multiple':
                return t('quizzes.mode.multiple', 'Несколько ответов');
            case 'image':
                return t('quizzes.mode.image', 'С картинками');
            case 'input':
                return t('quizzes.mode.input', 'Текстовый ответ');
            default:
                return t('quizzes.mode.mixed', 'Смешанные');
        }
    };

    const getDifficultyLabel = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return t('quizzes.difficulty.easy', 'Лёгкая');
            case 'medium':
                return t('quizzes.difficulty.medium', 'Средняя');
            case 'hard':
                return t('quizzes.difficulty.hard', 'Сложная');
            default:
                return difficulty;
        }
    };

    const normalizeAnswer = (value) => String(value || '')
        .trim()
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[«»"'`.,!?]/g, '')
        .replace(/\s+/g, ' ');

    const applyTemplate = (template, data) => String(template || '').replace(/\{(\w+)\}/g, (match, key) => (
        Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match
    ));

    const renderQuizForm = (container, quiz, questions, config) => {
        const difficultyLabel = getDifficultyLabel(config?.difficulty || questions[0]?.difficulty || 'easy');

        container.innerHTML = `
            <div class="quiz-meta-line">${safeText(difficultyLabel)} • 10 ${safeText(t('quizzes.questions.lower', 'вопросов'))}</div>
            <form id="quiz-form" class="grid" data-quiz-form>
                ${questions.map((question, index) => {
            const questionKey = index + 1;
            const isInputType = question.questionMode === 'input';
            const isMultiple = question.questionMode === 'multiple';

            let questionContent = '';

            if (isInputType) {
                const placeholder = safeText(t('quizzes.input.placeholder', 'Enter your answer...'));
                questionContent = `
                    <div class="quiz-input-wrapper">
                        <input type="text"
                               name="q${questionKey}"
                               class="quiz-text-input"
                               placeholder="${placeholder}"
                               autocomplete="off">
                    </div>
                `;
            } else {
                const inputType = isMultiple ? 'checkbox' : 'radio';
                questionContent = (question.options || []).map((option) => {
                    const image = safeUrl(resolveAsset(option.image));
                    const optionText = safeText(option.text);
                    return `
                        <label class="quiz-option">
                            <input type="${inputType}" name="q${questionKey}" value="${Number(option.id) || 0}">
                            ${image ? `<img src="${safeAttr(image)}" alt="${optionText}">` : ''}
                            <span>${optionText}</span>
                        </label>
                    `;
                }).join('');
            }

            return `
                <div class="quiz-question" data-question-type="${isInputType ? 'input' : (isMultiple ? 'multiple' : 'options')}">
                    <h3>${safeText(t('quizzes.question', 'Question'))} ${index + 1}</h3>
                    <p>${safeText(question.text)}</p>
                    <div class="quiz-options">${questionContent}</div>
                </div>
            `;
        }).join('')}
                <button type="button" class="btn btn-primary" id="quiz-submit">${safeText(t('quizzes.btn.check', 'Check Answers'))}</button>
                <div id="quiz-result" class="result-box" style="display: none;"></div>
            </form>
        `;

        const submit = document.getElementById('quiz-submit');
        const resultBox = document.getElementById('quiz-result');
        const form = document.getElementById('quiz-form');

        submit.addEventListener('click', () => {
            let correct = 0;
            let answered = 0;

            questions.forEach((question, qIndex) => {
                const questionKey = qIndex + 1;

                if (question.questionMode === 'input') {
                    const input = form.querySelector(`input[name="q${questionKey}"]`);
                    if (input && input.value.trim()) {
                        answered += 1;
                        const userAnswer = normalizeAnswer(input.value);
                        const correctAnswer = normalizeAnswer(question.correctAnswer);
                        if (userAnswer === correctAnswer) {
                            correct += 1;
                            input.classList.add('correct');
                            input.classList.remove('incorrect');
                        } else {
                            input.classList.add('incorrect');
                            input.classList.remove('correct');
                        }
                    }
                    return;
                }

                const selectedInputs = Array.from(form.querySelectorAll(`input[name="q${questionKey}"]:checked`));
                if (selectedInputs.length > 0) {
                    answered += 1;
                    const selectedIds = selectedInputs.map((input) => String(input.value));
                    const correctIds = (question.options || []).filter((opt) => opt.isCorrect).map((opt) => String(opt.id));
                    const isCorrect = correctIds.length === selectedIds.length
                        && correctIds.every((id) => selectedIds.includes(id));
                    if (isCorrect) {
                        correct += 1;
                    }
                }
            });

            if (answered < questions.length) {
                resultBox.style.display = 'block';
                resultBox.textContent = t('quizzes.answer.all', 'Answer all questions to see your result.');
                return;
            }

            const percent = Math.round((correct / questions.length) * 100);
            const resultTemplate = t('quizzes.result', 'Ваш результат: {correct} из {total} ({percent}%).');
            resultBox.style.display = 'block';
            resultBox.textContent = applyTemplate(resultTemplate, {
                correct,
                total: questions.length,
                percent
            });
        });
    };

    const renderImageGallery = (images, placeName) => {
        if (!images || images.length === 0) {
            return `<div class="gallery-empty">${safeText(t('noimage', 'No image'))}</div>`;
        }

        const mainImage = safeUrl(resolveAsset(images[0].url));
        const caption = safeText(images[0].caption || '');
        const safePlaceName = safeText(placeName);

        if (images.length === 1) {
            return `
                <div class="image-gallery">
                    <div class="gallery-main" data-lightbox-url="${safeAttr(mainImage)}" data-lightbox-caption="${safeAttr(placeName)}">
                        <img src="${safeAttr(mainImage)}" alt="${safePlaceName}" class="gallery-main-img">
                        ${caption ? `<div class="gallery-caption">${caption}</div>` : ''}
                    </div>
                </div>
            `;
        }

        const thumbnails = images.map((img, index) => {
            const thumbUrl = safeUrl(resolveAsset(img.url));
            const thumbCaption = safeText(img.caption || '');
            return `
                <button class="gallery-thumb ${index === 0 ? 'active' : ''}" 
                        data-index="${index}"
                        data-url="${safeAttr(thumbUrl)}"
                        data-caption="${safeAttr(img.caption || '')}">
                    <img src="${safeAttr(thumbUrl)}" alt="${thumbCaption || safePlaceName}">
                </button>
            `;
        }).join('');

        return `
            <div class="image-gallery" data-gallery>
                <div class="gallery-main" data-gallery-open data-gallery-name="${safeAttr(placeName)}">
                    <img src="${safeAttr(mainImage)}" alt="${safePlaceName}" class="gallery-main-img">
                    ${caption ? `<div class="gallery-caption">${caption}</div>` : ''}
                </div>
                <div class="gallery-thumbnails">
                    ${thumbnails}
                </div>
                <div class="gallery-nav">
                    <button class="gallery-prev" aria-label="${safeAttr(t('gallery.prev', 'Previous'))}">‹</button>
                    <span class="gallery-counter">1 / ${images.length}</span>
                    <button class="gallery-next" aria-label="${safeAttr(t('gallery.next', 'Next'))}">›</button>
                </div>
            </div>
        `;
    };

    const initGalleryInteractions = (container) => {
        container.querySelectorAll('[data-gallery]').forEach((gallery) => {
            const mainImg = gallery.querySelector('.gallery-main-img');
            const caption = gallery.querySelector('.gallery-caption');
            const counter = gallery.querySelector('.gallery-counter');
            const thumbs = gallery.querySelectorAll('.gallery-thumb');
            const prevBtn = gallery.querySelector('.gallery-prev');
            const nextBtn = gallery.querySelector('.gallery-next');
            let currentIndex = 0;

            const updateGallery = (index) => {
                const thumb = thumbs[index];
                if (!thumb) return;

                currentIndex = index;
                mainImg.src = thumb.dataset.url;
                mainImg.alt = thumb.dataset.caption || '';

                if (caption) {
                    caption.textContent = thumb.dataset.caption || '';
                    caption.style.display = thumb.dataset.caption ? 'block' : 'none';
                }

                thumbs.forEach((t, i) => {
                    t.classList.toggle('active', i === index);
                });

                if (counter) {
                    counter.textContent = `${index + 1} / ${thumbs.length}`;
                }
            };

            thumbs.forEach((thumb) => {
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateGallery(Number(thumb.dataset.index));
                });
            });

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : thumbs.length - 1;
                    updateGallery(newIndex);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newIndex = currentIndex < thumbs.length - 1 ? currentIndex + 1 : 0;
                    updateGallery(newIndex);
                });
            }
        });
    };

    const renderPlaces = async () => {
        const container = document.getElementById('places-grid');
        if (!container) return;

        showLoading(container, t('map.loading', 'Loading locations...'));

        const doRender = async () => {
            try {
                const places = await loadPlaces();
                const coordsText = safeText(t('map.coords', 'Coordinates'));

                // Render all cards (hidden by default)
                container.innerHTML = places.map((place) => {
                    const imgHtml = place.image_url
                        ? `<img src="${safeAttr(safeUrl(place.image_url))}" alt="${safeText(place.name)}" style="width:100%;height:100%;object-fit:cover;">`
                        : renderImageGallery(place.images, place.name);
                    const placeName = safeText(place.name);
                    const placeDescription = safeText(place.description);
                    const lat = Number(place.lat);
                    const lng = Number(place.lng);
                    const placeBook = safeAttr(place.book || '');
                    return `
                        <article class="card place-card" data-place-id="${Number(place.id) || 0}" data-book="${placeBook}">
                            <div class="card-image">${imgHtml}</div>
                            <div class="card-body">
                                <h3 class="card-title">${placeName}</h3>
                                <p class="card-text">${placeDescription}</p>
                                <div class="card-meta">${coordsText}: ${Number.isFinite(lat) ? lat : '-'}, ${Number.isFinite(lng) ? lng : '-'}</div>
                            </div>
                        </article>
                    `;
                }).join('');

                initGalleryInteractions(container);

                // Build filters by book
                const filtersEl = document.getElementById('places-filters');
                if (filtersEl) {
                    const books = ['Все', ...new Set(places.map(p => p.book).filter(Boolean))];
                    filtersEl.innerHTML = books.map(book =>
                        `<button class="filter-btn${book === 'Все' ? ' active' : ''}" data-filter="${safeAttr(book)}">${safeText(book)}</button>`
                    ).join('');
                }

                // Carousel state
                let currentFilter = 'Все';
                let currentIndex = 0;

                const getVisible = () => Array.from(container.querySelectorAll('.place-card')).filter(card => {
                    if (currentFilter === 'Все') return true;
                    return card.dataset.book === currentFilter;
                });

                const updateCarousel = () => {
                    const visible = getVisible();
                    const prevBtn = document.getElementById('carousel-prev');
                    const nextBtn = document.getElementById('carousel-next');
                    const counter = document.getElementById('carousel-counter');

                    // Hide all, show current
                    container.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
                    if (visible.length > 0) {
                        if (currentIndex >= visible.length) currentIndex = 0;
                        visible[currentIndex].classList.add('active');
                    }

                    if (prevBtn) prevBtn.disabled = currentIndex === 0;
                    if (nextBtn) nextBtn.disabled = currentIndex >= visible.length - 1;
                    if (counter) counter.textContent = visible.length > 0 ? `${currentIndex + 1} / ${visible.length}` : '0 / 0';
                };

                updateCarousel();

                // Arrow buttons
                const prevBtn = document.getElementById('carousel-prev');
                const nextBtn = document.getElementById('carousel-next');
                if (prevBtn) prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; updateCarousel(); } };
                if (nextBtn) nextBtn.onclick = () => { if (currentIndex < getVisible().length - 1) { currentIndex++; updateCarousel(); } };

                // Filter buttons
                if (filtersEl) {
                    filtersEl.addEventListener('click', (e) => {
                        const btn = e.target.closest('.filter-btn');
                        if (!btn) return;
                        filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        currentFilter = btn.dataset.filter;
                        currentIndex = 0;
                        updateCarousel();
                    });
                }

                return places;
            } catch (error) {
                showError(container, t('map.error', 'Failed to load locations'), () => {
                    state.places = null;
                    renderPlaces();
                });
                return [];
            }
        };

        return doRender();
    };

    const initPlacesMap = async () => {
        const mapContainer = document.getElementById('places-map');
        if (!mapContainer) return;

        // Check for OpenLayers
        if (!window.ol) {
            mapContainer.innerHTML = `<div class="empty-state">${safeText(t('error.map_load', 'Map failed to load. Check your internet connection.'))}</div>`;
            return;
        }

        let places = [];
        try {
            places = await loadPlaces();
        } catch (_error) {
            return;
        }

        // Popup elements
        const container = document.getElementById('popup');
        const content = document.getElementById('popup-content');
        const closer = document.getElementById('popup-closer');

        if (!container || !content || !closer) return;

        // Create Overlay for Popup
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const overlay = new window.ol.Overlay({
            element: container,
            autoPan: {
                animation: { duration: 250 },
                margin: isMobile ? 20 : 50,
            },
            positioning: isMobile ? 'bottom-center' : 'bottom-left',
        });

        // Close popup handler
        closer.onclick = function () {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };

        // Create vector source to hold markers
        const vectorSource = new window.ol.source.Vector();

        const markers = new Map();

        places.forEach((place) => {
            // Create Feature (Marker)
            const feature = new window.ol.Feature({
                geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([place.lng, place.lat])),
                name: place.name,
                place: place
            });

            // Style for the marker — larger on mobile for better touch targets
            const markerRadius = window.matchMedia('(max-width: 768px)').matches ? 13 : 8;
            feature.setStyle(new window.ol.style.Style({
                image: new window.ol.style.Circle({
                    radius: markerRadius,
                    fill: new window.ol.style.Fill({ color: '#e74c3c' }),
                    stroke: new window.ol.style.Stroke({ color: '#fff', width: 2 })
                })
            }));

            vectorSource.addFeature(feature);
            markers.set(place.id, feature);
        });

        // Initialize Map
        const map = new window.ol.Map({
            target: mapContainer,
            layers: [
                new window.ol.layer.Tile({
                    source: new window.ol.source.OSM()
                }),
                new window.ol.layer.Vector({
                    source: vectorSource
                })
            ],
            overlays: [overlay],
            controls: window.ol.control.defaults.defaults().extend([
                new window.ol.control.FullScreen()
            ]),
            view: new window.ol.View({
                center: window.ol.proj.fromLonLat([0, 20]),
                zoom: 2
            })
        });

        // Handle clicks on map features (markers)
        map.on('singleclick', function (evt) {
            const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });

            if (feature) {
                const place = feature.get('place');
                const coordinates = feature.getGeometry().getCoordinates();

                // Zoom to the marker
                map.getView().animate({
                    center: coordinates,
                    zoom: 15,
                    duration: 1000
                });

                // Prepare popup content
                let popupGallery = '';
                if (place.images && place.images.length > 0) {
                    const firstImg = resolveAsset(place.images[0].url);
                    if (place.images.length === 1) {
                        popupGallery = `<img src="${safeAttr(safeUrl(firstImg))}" alt="${safeText(place.name)}" class="popup-image">`;
                    } else {
                        const popupThumbs = place.images.slice(0, 4).map((img, i) => {
                            const url = safeUrl(resolveAsset(img.url));
                            const caption = safeText(img.caption || '');
                            return `<img src="${safeAttr(url)}" alt="${caption}" class="popup-thumb ${i === 0 ? 'active' : ''}" data-url="${safeAttr(url)}">`;
                        }).join('');
                        popupGallery = `
                            <div class="popup-gallery">
                                <img src="${safeAttr(safeUrl(firstImg))}" alt="${safeText(place.name)}" class="popup-main-image">
                                <div class="popup-thumbs">${popupThumbs}</div>
                            </div>
                        `;
                    }
                }

                content.innerHTML = `
                    <div class="popup-content">
                        ${popupGallery}
                        <strong>${safeText(place.name)}</strong><br>${safeText(place.description)}
                    </div>
                `;

                // Re-attach gallery listeners for popup
                const thumbs = content.querySelectorAll('.popup-thumb');
                const mainImg = content.querySelector('.popup-main-image');
                if (mainImg && thumbs.length > 0) {
                    thumbs.forEach((thumb) => {
                        thumb.addEventListener('click', (e) => {
                            e.stopPropagation(); // prevent map click
                            mainImg.src = thumb.dataset.url;
                            thumbs.forEach((t) => t.classList.remove('active'));
                            thumb.classList.add('active');
                        });
                    });
                }

                overlay.setPosition(coordinates);
            } else {
                overlay.setPosition(undefined); // Hide popup if clicked on map background
            }
        });

        // Fit bounds if multiple places
        if (places.length > 0) {
            const extent = vectorSource.getExtent();
            // Adding padding is a bit more complex in OL, direct fit is easier
            if (!window.ol.extent.isEmpty(extent)) {
                map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 5 });
            }
        }

        // Link external cards to map (event delegation — works after async render)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.place-card');
            if (!card) return;
            const id = Number(card.dataset.placeId);
                const feature = markers.get(id);

                if (feature) {
                    const coordinates = feature.getGeometry().getCoordinates();
                    const view = map.getView();

                    // FlyTo animation
                    view.animate({
                        center: coordinates,
                        zoom: 15,
                        duration: 1000
                    });

                    // Simulate click to show popup after animation
                    setTimeout(() => {
                        const place = feature.get('place');

                        let popupGallery = '';
                        if (place.images && place.images.length > 0) {
                            const firstImg = resolveAsset(place.images[0].url);
                            if (place.images.length === 1) {
                                popupGallery = `<img src="${safeAttr(safeUrl(firstImg))}" alt="${safeText(place.name)}" class="popup-image">`;
                            } else {
                                const popupThumbs = place.images.slice(0, 4).map((img, i) => {
                                    const url = safeUrl(resolveAsset(img.url));
                                    const caption = safeText(img.caption || '');
                                    return `<img src="${safeAttr(url)}" alt="${caption}" class="popup-thumb ${i === 0 ? 'active' : ''}" data-url="${safeAttr(url)}">`;
                                }).join('');
                                popupGallery = `
                                    <div class="popup-gallery">
                                        <img src="${safeAttr(safeUrl(firstImg))}" alt="${safeText(place.name)}" class="popup-main-image">
                                        <div class="popup-thumbs">${popupThumbs}</div>
                                    </div>
                                `;
                            }
                        }

                        content.innerHTML = `
                            <div class="popup-content">
                                ${popupGallery}
                                <strong>${safeText(place.name)}</strong><br>${safeText(place.description)}
                            </div>
                        `;

                        const thumbs = content.querySelectorAll('.popup-thumb');
                        const mainImg = content.querySelector('.popup-main-image');
                        if (mainImg && thumbs.length > 0) {
                            thumbs.forEach((thumb) => {
                                thumb.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    mainImg.src = thumb.dataset.url;
                                    thumbs.forEach((t) => t.classList.remove('active'));
                                    thumb.classList.add('active');
                                });
                            });
                        }

                        overlay.setPosition(coordinates);

                    }, 1000);
                }
        });
    };

    const renderCharacters = async () => {
        const container = document.getElementById('characters-grid');
        if (!container) return;

        showLoading(container, t('characters.loading', 'Loading characters...'));

        try {
            const characters = await loadCharacters();
            const noImageText = safeText(t('noimage', 'No image'));
            const detailsText = safeText(t('characters.btn.details', 'Learn More'));
            container.innerHTML = characters.map((character) => {
                const image = safeUrl(resolveAsset(character.image));
                const charName = safeText(character.name);
                const shortDescription = safeText(character.shortDescription);
                return `
                    <article class="card">
                        <div class="card-image" data-lightbox-url="${safeAttr(image)}" data-lightbox-caption="${safeAttr(character.name)}">
                            ${image ? `<img src="${safeAttr(image)}" alt="${charName}">` : noImageText}
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${charName}</h3>
                            <p class="card-text">${shortDescription}</p>
                            <a class="btn btn-primary" href="${safeAttr(state.basePath)}pages/character-detail.html?id=${Number(character.id) || 0}">${detailsText}</a>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (error) {
            showError(container, t('characters.error', 'Failed to load characters'), () => {
                state.characters = null;
                renderCharacters();
            });
        }
    };

    const renderCharacterDetail = async () => {
        const container = document.getElementById('character-detail');
        if (!container) return;

        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('id'));
        if (!id) {
            container.innerHTML = `<div class="empty-state">${safeText(t('error.char_not_found', 'Character not found.'))}</div>`;
            return;
        }

        try {
            const characters = await loadCharacters();
            const character = characters.find((item) => item.id === id);
            if (!character) {
                container.innerHTML = `<div class="empty-state">${safeText(t('error.char_not_found', 'Character not found.'))}</div>`;
                return;
            }
            const image = safeUrl(resolveAsset(character.image));
            const charName = safeText(character.name);
            const fullBio = safeText(character.fullBio);
            container.innerHTML = `
                <article class="card">
                    <div class="card-image" style="height: 400px;" data-lightbox-url="${safeAttr(image)}" data-lightbox-caption="${safeAttr(character.name)}">
                        ${image ? `<img src="${safeAttr(image)}" alt="${charName}">` : `<div class="no-image">${safeText(t('noimage', 'No image'))}</div>`}
                    </div>
                    <div class="card-body">
                        <h2 class="card-title">${charName}</h2>
                        <p class="card-text">${fullBio}</p>
                        <a class="btn btn-secondary" href="${safeAttr(state.basePath)}pages/characters.html" data-i18n="characters.btn.back">${safeText(t('characters.btn.back', 'Back to Characters'))}</a>
                    </div>
                </article>
            `;
        } catch (error) {
            container.innerHTML = `<div class="empty-state">${safeText(t('error.load_data', 'Failed to load data'))}</div>`;
        }
    };

    const renderQuizzes = async () => {
        const container = document.getElementById('quizzes-grid');
        if (!container) return;

        showLoading(container, t('quizzes.loading', 'Loading quizzes...'));

        try {
            const quizzes = (await loadQuizzes()).map(normalizeQuizBank);
            if (!quizzes.length) {
                container.innerHTML = `<div class="empty-state">${safeText(t('quizzes.empty', 'Пока викторин нет.'))}</div>`;
                return;
            }
            const startText = t('quizzes.btn.start', 'Start');
            const randomText = t('quizzes.random10', '10 случайных вопросов');
            container.innerHTML = quizzes.map((quiz) => {
                const quizId = Number(quiz.id) || 0;
                const title = safeText(quiz.title);
                const description = safeText(quiz.description);
                return `
                    <article class="card">
                        <div class="card-body">
                            <h3 class="card-title">${title}</h3>
                            <p class="card-text">${description}</p>
                            <div class="card-meta">${safeText(randomText)}</div>
                            <a class="btn btn-primary" href="${safeAttr(state.basePath)}pages/quiz-detail.html?quiz=${quizId}">${startText}</a>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (error) {
            showError(container, t('quizzes.error', 'Failed to load quizzes'), () => {
                state.quizzes = null;
                renderQuizzes();
            });
        }
    };

    const renderQuizDetail = async () => {
        const container = document.getElementById('quiz-detail');
        if (!container) return;

        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('quiz'));
        if (!id) {
            container.innerHTML = `<div class="empty-state">${safeText(t('error.quiz_not_found', 'Quiz not found.'))}</div>`;
            return;
        }

        try {
            const quizzes = (await loadQuizzes()).map(normalizeQuizBank);
            const quiz = quizzes.find((item) => item.id === id);
            if (!quiz) {
                container.innerHTML = `<div class="empty-state">${safeText(t('error.quiz_not_found', 'Quiz not found.'))}</div>`;
                return;
            }

            container.innerHTML = `
                <div class="card">
                    <div class="card-body quiz-session-body">
                        <div>
                            <h2 class="card-title">${safeText(quiz.title)}</h2>
                            <p class="card-text">${safeText(quiz.description)}</p>
                        </div>
                        <a class="btn btn-secondary" href="${safeAttr(state.basePath)}pages/quiz.html">${safeText(t('quizzes.btn.back', 'Назад к темам'))}</a>
                    </div>
                </div>
                <div class="card quiz-builder-card">
                    <div class="card-body">
                        <h3 class="card-title">${safeText(t('quizzes.builder.title', 'Выбери сложность'))}</h3>
                        <p class="card-text">${safeText(t('quizzes.builder.subtitle', 'Тема уже выбрана. Теперь выбери сложность и начни викторину.'))}</p>
                        <div class="quiz-builder-grid">
                            <label class="quiz-builder-field">
                                <span>${safeText(t('quizzes.builder.difficulty', 'Сложность'))}</span>
                                <select id="quiz-difficulty">
                                    <option value="easy">${safeText(t('quizzes.difficulty.easy', 'Лёгкая'))}</option>
                                    <option value="medium">${safeText(t('quizzes.difficulty.medium', 'Средняя'))}</option>
                                    <option value="hard">${safeText(t('quizzes.difficulty.hard', 'Сложная'))}</option>
                                </select>
                            </label>
                        </div>
                        <p id="quiz-builder-summary" class="quiz-builder-summary"></p>
                        <button type="button" class="btn btn-primary" id="quiz-generate">${safeText(t('quizzes.builder.generate', 'Начать викторину'))}</button>
                        <div id="quiz-generated" class="quiz-generated"></div>
                    </div>
                </div>
            `;
            const difficultySelect = document.getElementById('quiz-difficulty');
            const generateButton = document.getElementById('quiz-generate');
            const summary = document.getElementById('quiz-builder-summary');
            const generatedContainer = document.getElementById('quiz-generated');
            let lastGeneratedIds = null;

            const updateSummary = () => {
                const available = filterQuizQuestions(quiz.questions, difficultySelect.value);
                summary.textContent = available.length
                    ? `${safeText(t('quizzes.builder.available', 'Вопросов на этой сложности'))}: ${available.length}`
                    : safeText(t('quizzes.builder.empty', 'Для таких фильтров пока нет вопросов.'));
                generateButton.disabled = available.length === 0;
            };

            const generateQuiz = () => {
                const pool = filterQuizQuestions(quiz.questions, difficultySelect.value);
                if (!pool.length) {
                    generatedContainer.innerHTML = `<div class="empty-state">${safeText(t('quizzes.builder.empty', 'Для таких фильтров пока нет вопросов.'))}</div>`;
                    return;
                }
                const selectedQuestions = pickRandomQuestions(pool, 10, lastGeneratedIds);
                lastGeneratedIds = selectedQuestions.map((question) => question.id);
                renderQuizForm(generatedContainer, quiz, selectedQuestions, {
                    difficulty: difficultySelect.value
                });
            };

            difficultySelect.addEventListener('change', () => {
                lastGeneratedIds = null;
                updateSummary();
            });
            generateButton.addEventListener('click', generateQuiz);

            updateSummary();
            generatedContainer.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <p class="card-text">${safeText(t('quizzes.builder.ready', 'Нажми «Начать викторину», и мы соберём для тебя 10 случайных вопросов по этой теме.'))}</p>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="empty-state">${safeText(t('error.quiz_not_found', 'Quiz not found.'))}</div>`;
        }
    };

    const setupForms = () => {
        document.querySelectorAll('[data-storage-key]').forEach((form) => {
            const message = form.querySelector('.form-message');
            const submitButton = form.querySelector('button[type="submit"]');

            const setMessage = (text, type) => {
                if (!message) return;
                message.textContent = text;
                message.classList.remove('message-success', 'message-error');
                message.classList.add('message', type === 'success' ? 'message-success' : 'message-error');
            };

            // showFormSuccess: 2s «ОТПРАВЛЕНО» banner + 5s progress bar + form reset
            const showFormSuccess = (targetForm, msg) => {
                // Banner
                const banner = document.createElement('div');
                banner.className = 'form-sent-banner';
                banner.textContent = t('form.sent.banner', 'ОТПРАВЛЕНО');
                document.body.appendChild(banner);
                setTimeout(() => banner.remove(), 2000);

                // Progress bar + message in form
                if (message) {
                    message.innerHTML = `
                        <span class="form-success-text">${safeText(msg)}</span>
                        <div class="form-progress-bar"><div class="form-progress-fill"></div></div>
                    `;
                    message.classList.remove('message-error');
                    message.classList.add('message', 'message-success');
                    const fill = message.querySelector('.form-progress-fill');
                    if (fill) {
                        fill.style.transition = 'width 5s linear';
                        // Force reflow before animation
                        void fill.offsetWidth;
                        fill.style.width = '100%';
                    }
                    setTimeout(() => {
                        targetForm.reset();
                        message.innerHTML = '';
                        message.classList.remove('message', 'message-success');
                    }, 5000);
                } else {
                    targetForm.reset();
                }
            };

            // Init Autosave
            const initAutosave = () => {
                const formId = form.id; // Ensure forms have IDs
                if (!formId) return;

                const storageKey = `autosave_${formId}`;

                // Load saved data
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        Object.keys(data).forEach(key => {
                            const input = form.elements[key];
                            if (input && input.type !== 'file' && input.type !== 'submit') {
                                input.value = data[key];
                            }
                        });
                    } catch (e) {
                        console.error('Error loading autosave', e);
                    }
                }

                // Save on input
                form.addEventListener('input', () => {
                    const data = {};
                    const formData = new FormData(form);
                    for (const [key, value] of formData.entries()) {
                        if (!(value instanceof File)) {
                            data[key] = value;
                        }
                    }
                    localStorage.setItem(storageKey, JSON.stringify(data));
                });

                // Clear on submit handled in submit listener
            };

            initAutosave();

            const buildPayload = () => {
                const data = {};
                let file = null;
                for (const [key, value] of new FormData(form).entries()) {
                    if (value instanceof File) {
                        if (value.size > 0) file = value;
                        data[key] = value.name || '';
                    } else {
                        data[key] = value.trim ? value.trim() : value;
                    }
                }
                return { data, file };
            };

            const submitToSupabase = async (storageKey, data, file) => {
                if (storageKey === 'agatha_fanfics') {
                    await Supa.addFanfic({
                        name: data.name,
                        title: data.title,
                        character: data.character,
                        story: data.story
                    });
                    return;
                }
                if (storageKey === 'agatha_illustrations') {
                    // Append subject to description if present
                    let description = data.description || '';
                    if (data.subject) {
                        const subjectText = t('form.illustration.subject_label', 'Тема:');
                        description = `${subjectText} ${data.subject}\n\n${description}`;
                    }

                    await Supa.addIllustration({
                        name: data.name,
                        title: data.title,
                        description: description
                    }, file);
                }
            };

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const { data, file } = buildPayload();
                const storageKey = form.dataset.storageKey;

                if (submitButton) submitButton.disabled = true;

                if (Supa.isReady()) {
                    try {
                        await submitToSupabase(storageKey, data, file);
                        const isFanficOrIllustration = storageKey === 'agatha_fanfics' || storageKey === 'agatha_illustrations';
                        const successMsg = isFanficOrIllustration
                            ? t('form.success.pending', 'Спасибо! Работа отправлена на проверку — скоро появится на сайте.')
                            : t('form.success', 'Спасибо! Ваша работа принята.');
                        showFormSuccess(form, successMsg);
                        localStorage.removeItem(`autosave_${form.id}`);
                        if (submitButton) submitButton.disabled = false;
                        return;
                    } catch (error) {
                        setMessage(error.message && error.message.includes('Invalid')
                            ? error.message
                            : t('form.error.supabase', 'Не удалось отправить. Попробуй ещё раз.'), 'error');
                        if (submitButton) submitButton.disabled = false;
                        return;
                    }
                }

                data.createdAt = new Date().toISOString();
                Storage.push(storageKey, data);
                setMessage(t('form.error.local', 'Saved locally. Connect Supabase to store on the internet.'), 'error');
                form.reset();
                if (submitButton) submitButton.disabled = false;
            });
        });


        // Dynamic Options Population
        const populateFormOptions = async () => {
            const charSelect = document.getElementById('fanfic-character');
            const subjectSelect = document.getElementById('illustration-subject');

            if (!charSelect && !subjectSelect) return;

            try {
                let characters = await loadCharacters();
                let places = [];
                try { places = await loadPlaces(); } catch (e) { }

                // Populate Fanfic Character Select
                if (charSelect) {
                    // Keep default option
                    const defaultOpt = charSelect.firstElementChild;
                    charSelect.innerHTML = '';
                    charSelect.appendChild(defaultOpt);

                    characters.forEach(char => {
                        const opt = document.createElement('option');
                        opt.value = char.name;
                        opt.textContent = char.name;
                        charSelect.appendChild(opt);
                    });

                    // Restore autosaved value if any
                    const saved = localStorage.getItem('autosave_' + charSelect.form.id);
                    if (saved) {
                        try {
                            const data = JSON.parse(saved);
                            if (data.character) charSelect.value = data.character;
                        } catch (e) { }
                    }
                }

                // Populate Illustration Subject Select
                if (subjectSelect) {
                    const defaultOpt = subjectSelect.firstElementChild;
                    subjectSelect.innerHTML = '';
                    subjectSelect.appendChild(defaultOpt);

                    // Group Characters
                    const charGroup = document.createElement('optgroup');
                    charGroup.label = t('nav.characters', 'Персонажи');
                    characters.forEach(char => {
                        const opt = document.createElement('option');
                        opt.value = char.name;
                        opt.textContent = char.name;
                        charGroup.appendChild(opt);
                    });
                    subjectSelect.appendChild(charGroup);

                    // Group Places
                    if (places.length > 0) {
                        const placeGroup = document.createElement('optgroup');
                        placeGroup.label = t('nav.map', 'Локации');
                        places.forEach(place => {
                            const opt = document.createElement('option');
                            opt.value = place.name;
                            opt.textContent = place.name;
                            placeGroup.appendChild(opt);
                        });
                        subjectSelect.appendChild(placeGroup);
                    }

                    // Restore autosaved value
                    const saved = localStorage.getItem('autosave_' + subjectSelect.form.id);
                    if (saved) {
                        try {
                            const data = JSON.parse(saved);
                            if (data.subject) subjectSelect.value = data.subject;
                        } catch (e) { }
                    }
                }

            } catch (error) {
                console.warn('Failed to populate form options', error);
            }
        };

        populateFormOptions();
    };

    const renderFanfics = async () => {
        const container = document.getElementById('fanfics-list');
        const searchInput = document.getElementById('fanfics-search');
        if (!container) return;

        if (!Supa.isReady()) {
            container.innerHTML = `<div class="empty-state">${safeText(t('supabase.connect', 'Connect Supabase to view.'))}</div>`;
            return;
        }

        showLoading(container, t('fanfics.loading', 'Loading fanfics...'));

        try {
            const fanfics = await Supa.getFanfics();
            if (fanfics.length === 0) {
                container.innerHTML = `<div class="empty-state">${safeText(t('fanfics.empty', 'No fanfics yet. Be the first!'))}</div>`;
                return;
            }
            const authorText = t('fanfics.author', 'Author');
            const characterText = t('fanfics.character', 'Character');

            const renderList = (items) => {
                if (items.length === 0) {
                    container.innerHTML = `<div class="empty-state">${safeText(t('search.no_results', 'Ничего не найдено'))}</div>`;
                    return;
                }
                container.innerHTML = items.map((fanfic) => `
                    <article class="card fanfic-card">
                        <div class="card-body">
                            <h4 class="card-title">${safeText(fanfic.title)}</h4>
                            <div class="card-meta">
                                <span>${safeText(authorText)}: ${safeText(fanfic.name)}</span>
                                ${fanfic.genre ? `<span>${safeText(characterText)}: ${safeText(fanfic.genre)}</span>` : ''}
                            </div>
                            <p class="card-text fanfic-story">${safeText(fanfic.story)}</p>
                        </div>
                    </article>
                `).join('');
            };

            renderList(fanfics);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    const filtered = fanfics.filter(item =>
                        item.title.toLowerCase().includes(query) ||
                        item.name.toLowerCase().includes(query) ||
                        (item.character && item.character.toLowerCase().includes(query))
                    );
                    renderList(filtered);
                });
            }
        } catch (error) {
            container.innerHTML = `<div class="empty-state">${safeText(t('fanfics.error', 'Не удалось загрузить фанфики.'))}</div>`;
        }
    };

    const renderIllustrations = async () => {
        const container = document.getElementById('illustrations-list');
        const searchInput = document.getElementById('illustrations-search');
        if (!container) return;

        if (!Supa.isReady()) {
            container.innerHTML = `<div class="empty-state">${safeText(t('supabase.connect', 'Connect Supabase to view.'))}</div>`;
            return;
        }

        showLoading(container, t('illustrations.loading', 'Loading illustrations...'));

        try {
            const illustrations = await Supa.getIllustrations();
            if (illustrations.length === 0) {
                container.innerHTML = `<div class="empty-state">${safeText(t('illustrations.empty', 'No illustrations yet. Be the first!'))}</div>`;
                return;
            }
            const authorText = t('fanfics.author', 'Author');

            const renderList = (items) => {
                if (items.length === 0) {
                    container.innerHTML = `<div class="empty-state">${safeText(t('search.no_results', 'Ничего не найдено'))}</div>`;
                    return;
                }
                container.innerHTML = `<div class="grid grid-3">${items.map((ill) => `
                    <article class="card illustration-card">
                        ${ill.file_url ? `<div class="card-image" style="height: 300px;" data-lightbox-url="${safeAttr(safeUrl(ill.file_url))}" data-lightbox-caption="${safeAttr(ill.title)}"><img src="${safeAttr(safeUrl(ill.file_url))}" alt="${safeText(ill.title)}"></div>` : ''}
                        <div class="card-body">
                            <h4 class="card-title">${safeText(ill.title)}</h4>
                            <div class="card-meta">${safeText(authorText)}: ${safeText(ill.name)}</div>
                            ${ill.description ? `<p class="card-text">${safeText(ill.description)}</p>` : ''}
                        </div>
                    </article>
                `).join('')}</div>`;
            };

            renderList(illustrations);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    const filtered = illustrations.filter(item =>
                        item.title.toLowerCase().includes(query) ||
                        item.name.toLowerCase().includes(query) ||
                        (item.description && item.description.toLowerCase().includes(query))
                    );
                    renderList(filtered);
                });
            }
        } catch (error) {
            container.innerHTML = `<div class="empty-state">${safeText(t('illustrations.error', 'Failed to load illustrations.'))}</div>`;
        }
    };

    const renderAbout = async () => {
        const container = document.getElementById('about-content-container');
        if (!container) return;

        const lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'ru';

        let sections = null;

        if (Supa.isReady()) {
            showLoading(container, t('about.loading', 'Loading history...'));
            try {
                sections = await Supa.getAbout();
            } catch (error) {
                sections = null;
            }
        }

        if (!sections || sections.length === 0) {
            sections = DEFAULT_ABOUT.map(section => ({
                id: section.id,
                title: lang === 'en' && section.title_en ? section.title_en : section.title,
                blocks: (section.blocks || []).map(block => ({
                    subtitle: lang === 'en' && block.subtitle_en ? block.subtitle_en : block.subtitle,
                    content: lang === 'en' && block.content_en ? block.content_en : block.content
                }))
            }));
        }

        container.innerHTML = sections.map(section => `
            <div class="accordion-item">
                <div class="accordion-header">
                    <div class="accordion-header-text">
                        <h3 class="accordion-title">${safeText(section.title)}</h3>
                    </div>
                    <span class="accordion-icon">▼</span>
                </div>
                <div class="accordion-content">
                    ${(section.blocks || []).map(block => `
                        <div class="about-content-block">
                            ${block.subtitle ? `<h4 class="about-block-subtitle">${safeText(block.subtitle)}</h4>` : ''}
                            <p class="about-block-content">${safeMultilineHtml(block.content)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    };

    const reloadContent = async () => {
        // Сбрасываем кэш
        state.places = null;
        state.characters = null;
        state.quizzes = null;
        state.about = null;

        // Перезагружаем контент
        await renderPlaces();
        await initPlacesMap();
        await renderCharacters();
        await renderCharacterDetail();
        await renderQuizzes();
        await renderQuizDetail();
        await renderFanfics();
        await renderIllustrations();
        await renderAbout();
    };

    const init = async () => {
        initBasePath();
        setupNav();
        setupSafeInteractions();

        // Инициализируем i18n
        if (typeof I18n !== 'undefined') {
            await I18n.init();
            I18n.translatePage();
        }

        await renderPlaces();
        await initPlacesMap();
        renderCharacters();
        renderCharacterDetail();
        renderQuizzes();
        renderQuizDetail();
        renderFanfics();
        renderIllustrations();
        renderAbout();
        setupForms();

        // Слушаем смену языка
        window.addEventListener('langchange', async () => {
            if (typeof I18n !== 'undefined') {
                I18n.translatePage();
            }
            await reloadContent();
        });
    };

    const openLightbox = (url, caption) => {
        const sanitizedUrl = safeUrl(url);
        if (!sanitizedUrl) return;
        let lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <span class="lightbox-close">&times;</span>
                <img class="lightbox-content">
                <div class="lightbox-caption"></div>
                <div class="lightbox-nav" style="display:none">
                    <button class="lightbox-btn lb-prev">‹</button>
                    <button class="lightbox-btn lb-next">›</button>
                </div>
            `;
            document.body.appendChild(lightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target.classList.contains('lightbox') || e.target.classList.contains('lightbox-close')) {
                    lightbox.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }

        const img = lightbox.querySelector('.lightbox-content');
        const cap = lightbox.querySelector('.lightbox-caption');
        lightbox.querySelector('.lightbox-nav').style.display = 'none';

        img.src = sanitizedUrl;
        cap.textContent = caption || '';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const openLightboxWithGallery = (galleryMain, placeName) => {
        const gallery = galleryMain.closest('.image-gallery');
        const thumbs = Array.from(gallery.querySelectorAll('.gallery-thumb'));
        const images = thumbs.map(t => ({ url: t.dataset.url, caption: t.dataset.caption }));
        const activeIndex = thumbs.findIndex(t => t.classList.contains('active'));

        showLightboxGallery(images, activeIndex || 0, placeName);
    };

    const openLightboxFromPopup = (popupContent, placeName) => {
        const mainImg = popupContent.querySelector('.popup-main-image') || popupContent.querySelector('.popup-image');
        if (!mainImg) return;

        const thumbs = Array.from(popupContent.querySelectorAll('.popup-thumb'));
        if (thumbs.length > 0) {
            const images = thumbs.map(t => ({ url: t.dataset.url, caption: t.alt }));
            const currentUrl = mainImg.src;
            const activeIndex = thumbs.findIndex(t => t.dataset.url === currentUrl);
            showLightboxGallery(images, activeIndex >= 0 ? activeIndex : 0, placeName);
        } else {
            openLightbox(mainImg.src, placeName);
        }
    };

    const showLightboxGallery = (images, startIndex, placeName) => {
        openLightbox(images[startIndex].url, images[startIndex].caption || placeName);
        const lightbox = document.querySelector('.lightbox');
        const nav = lightbox.querySelector('.lightbox-nav');
        const img = lightbox.querySelector('.lightbox-content');
        const cap = lightbox.querySelector('.lightbox-caption');

        if (images.length > 1) {
            nav.style.display = 'flex';
            let currentIndex = startIndex;

            const update = (idx) => {
                currentIndex = (idx + images.length) % images.length;
                img.src = safeUrl(images[currentIndex].url);
                cap.textContent = images[currentIndex].caption || placeName;
            };

            lightbox.querySelector('.lb-prev').onclick = (e) => { e.stopPropagation(); update(currentIndex - 1); };
            lightbox.querySelector('.lb-next').onclick = (e) => { e.stopPropagation(); update(currentIndex + 1); };
        }
    };

    const setupSafeInteractions = () => {
        document.addEventListener('click', (event) => {
            const lightboxTarget = event.target.closest('[data-lightbox-url]');
            if (lightboxTarget) {
                event.preventDefault();
                openLightbox(lightboxTarget.dataset.lightboxUrl || '', lightboxTarget.dataset.lightboxCaption || '');
                return;
            }

            const galleryTarget = event.target.closest('[data-gallery-open]');
            if (galleryTarget) {
                event.preventDefault();
                openLightboxWithGallery(galleryTarget, galleryTarget.dataset.galleryName || '');
                return;
            }

            const accordionHeader = event.target.closest('.accordion-header');
            if (accordionHeader) {
                const item = accordionHeader.closest('.accordion-item');
                if (item) {
                    item.classList.toggle('active');
                }
            }
        });
    };

    return { init, reloadContent, openLightbox, openLightboxWithGallery, openLightboxFromPopup };
})();

document.addEventListener('DOMContentLoaded', App.init);
