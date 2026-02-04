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
        if (path.startsWith('assets/')) return `${state.basePath}${path}`;
        return path;
    };

    const t = (key, fallback) => {
        return (typeof I18n !== 'undefined' && I18n.t) ? I18n.t(key) : fallback;
    };

    const showLoading = (container, text) => {
        const loadingText = text || t('loading', 'Загрузка...');
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">${loadingText}</p>
            </div>
        `;
    };

    const showError = (container, message, retryFn) => {
        const retryText = t('error.retry', 'Попробовать снова');
        container.innerHTML = `
            <div class="error-container">
                <p>${message}</p>
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
            throw new Error('Не удалось загрузить данные');
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

    const loadPlaces = async () => {
        if (state.places) return state.places;
        if (typeof Supa !== 'undefined' && Supa.isReady()) {
            const places = await Supa.getPlaces();
            state.places = places;
            return places;
        }
        throw new Error('Supabase не настроен');
    };

    const loadCharacters = async () => {
        if (state.characters) return state.characters;
        if (typeof Supa !== 'undefined' && Supa.isReady()) {
            try {
                const characters = await Supa.getCharacters();
                if (characters.length) {
                    state.characters = characters;
                    return characters;
                }
            } catch (_error) {
                // Fallback to local JSON
            }
        }
        try {
            const characters = await fetchJson(`${state.basePath}assets/data/characters.json`);
            state.characters = characters;
            return characters;
        } catch (error) {
            const inline = readInlineCharacters();
            if (inline) {
                state.characters = inline;
                return inline;
            }
            throw error;
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

    const renderImageGallery = (images, placeName) => {
        if (!images || images.length === 0) {
            return '<div class="gallery-empty">Нет изображений</div>';
        }

        const mainImage = resolveAsset(images[0].url);
        const caption = images[0].caption || '';

        if (images.length === 1) {
            return `
                <div class="image-gallery">
                    <div class="gallery-main">
                        <img src="${mainImage}" alt="${placeName}" class="gallery-main-img">
                        ${caption ? `<div class="gallery-caption">${caption}</div>` : ''}
                    </div>
                </div>
            `;
        }

        const thumbnails = images.map((img, index) => {
            const thumbUrl = resolveAsset(img.url);
            return `
                <button class="gallery-thumb ${index === 0 ? 'active' : ''}" 
                        data-index="${index}" 
                        data-url="${thumbUrl}" 
                        data-caption="${img.caption || ''}">
                    <img src="${thumbUrl}" alt="${img.caption || placeName}">
                </button>
            `;
        }).join('');

        return `
            <div class="image-gallery" data-gallery>
                <div class="gallery-main">
                    <img src="${mainImage}" alt="${placeName}" class="gallery-main-img">
                    ${caption ? `<div class="gallery-caption">${caption}</div>` : ''}
                </div>
                <div class="gallery-thumbnails">
                    ${thumbnails}
                </div>
                <div class="gallery-nav">
                    <button class="gallery-prev" aria-label="Предыдущее">‹</button>
                    <span class="gallery-counter">1 / ${images.length}</span>
                    <button class="gallery-next" aria-label="Следующее">›</button>
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

        showLoading(container, t('map.loading', 'Загрузка локаций...'));

        const doRender = async () => {
            try {
                const places = await loadPlaces();
                const coordsText = t('map.coords', 'Координаты');
                container.innerHTML = places.map((place) => {
                    const galleryHtml = renderImageGallery(place.images, place.name);
                    return `
                        <article class="card place-card" data-place-id="${place.id}">
                            <div class="card-image">
                                ${galleryHtml}
                            </div>
                            <div class="card-body">
                                <h3 class="card-title">${place.name}</h3>
                                <p class="card-text">${place.description}</p>
                                <div class="card-meta">${coordsText}: ${place.lat}, ${place.lng}</div>
                            </div>
                        </article>
                    `;
                }).join('');

                initGalleryInteractions(container);
                return places;
            } catch (error) {
                showError(container, t('map.error', 'Не удалось загрузить локации'), () => {
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
        if (!window.L) {
            mapContainer.innerHTML = '<div class="empty-state">Карта не загрузилась. Проверьте подключение к интернету.</div>';
            return;
        }

        let places = [];
        try {
            places = await loadPlaces();
        } catch (_error) {
            return;
        }

        const map = window.L.map(mapContainer, { scrollWheelZoom: false });
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const markers = new Map();
        places.forEach((place) => {
            const marker = window.L.marker([place.lat, place.lng]).addTo(map);

            // Создаём галерею для попапа
            let popupGallery = '';
            if (place.images && place.images.length > 0) {
                const firstImg = resolveAsset(place.images[0].url);
                if (place.images.length === 1) {
                    popupGallery = `<img src="${firstImg}" alt="${place.name}" class="popup-image">`;
                } else {
                    const popupThumbs = place.images.slice(0, 4).map((img, i) => {
                        const url = resolveAsset(img.url);
                        return `<img src="${url}" alt="${img.caption || ''}" class="popup-thumb ${i === 0 ? 'active' : ''}" data-url="${url}">`;
                    }).join('');
                    popupGallery = `
                        <div class="popup-gallery">
                            <img src="${firstImg}" alt="${place.name}" class="popup-main-image">
                            <div class="popup-thumbs">${popupThumbs}</div>
                        </div>
                    `;
                }
            }

            marker.bindPopup(`
                <div class="popup-content">
                    ${popupGallery}
                    <strong>${place.name}</strong><br>${place.description}
                </div>
            `, { maxWidth: 280 });

            // Инициализируем галерею в попапе при открытии
            marker.on('popupopen', () => {
                const popup = marker.getPopup().getElement();
                if (!popup) return;
                const thumbs = popup.querySelectorAll('.popup-thumb');
                const mainImg = popup.querySelector('.popup-main-image');
                if (!mainImg || thumbs.length === 0) return;

                thumbs.forEach((thumb) => {
                    thumb.addEventListener('click', () => {
                        mainImg.src = thumb.dataset.url;
                        thumbs.forEach((t) => t.classList.remove('active'));
                        thumb.classList.add('active');
                    });
                });
            });

            markers.set(place.id, marker);
        });

        if (places.length > 1) {
            const bounds = window.L.latLngBounds(places.map((place) => [place.lat, place.lng]));
            map.fitBounds(bounds, { padding: [40, 40] });
        } else if (places.length === 1) {
            map.setView([places[0].lat, places[0].lng], 5);
        } else {
            map.setView([20, 0], 2);
        }

        const cards = document.querySelectorAll('.place-card');
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                const id = Number(card.dataset.placeId);
                const marker = markers.get(id);
                const place = places.find((item) => item.id === id);
                if (marker && place) {
                    map.flyTo([place.lat, place.lng], 6, { duration: 0.6 });
                    marker.openPopup();
                }
            });
        });
    };

    const renderCharacters = async () => {
        const container = document.getElementById('characters-grid');
        if (!container) return;

        showLoading(container, t('characters.loading', 'Загрузка персонажей...'));

        try {
            const characters = await loadCharacters();
            const noImageText = t('noimage', 'Нет изображения');
            const detailsText = t('characters.btn.details', 'Подробнее');
            container.innerHTML = characters.map((character) => {
                const image = resolveAsset(character.image);
                return `
                    <article class="card">
                        <div class="card-image">
                            ${image ? `<img src="${image}" alt="${character.name}">` : noImageText}
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${character.name}</h3>
                            <p class="card-text">${character.shortDescription}</p>
                            <a class="btn btn-primary" href="${state.basePath}pages/character-detail.html?id=${character.id}">${detailsText}</a>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (error) {
            showError(container, t('characters.error', 'Не удалось загрузить персонажей'), () => {
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
            container.innerHTML = '<div class="empty-state">Персонаж не найден.</div>';
            return;
        }

        try {
            const characters = await loadCharacters();
            const character = characters.find((item) => item.id === id);
            if (!character) {
                container.innerHTML = '<div class="empty-state">Персонаж не найден.</div>';
                return;
            }
            const image = resolveAsset(character.image);
            container.innerHTML = `
                <article class="card">
                    <div class="card-image">
                        ${image ? `<img src="${image}" alt="${character.name}">` : 'Нет изображения'}
                    </div>
                    <div class="card-body">
                        <h2 class="card-title">${character.name}</h2>
                        <p class="card-text">${character.fullBio}</p>
                        <a class="btn btn-secondary" href="${state.basePath}pages/characters.html">Назад к персонажам</a>
                    </div>
                </article>
            `;
        } catch (error) {
            container.innerHTML = '<div class="empty-state">Не удалось загрузить данные персонажа.</div>';
        }
    };

    const renderQuizzes = async () => {
        const container = document.getElementById('quizzes-grid');
        if (!container) return;

        showLoading(container, t('quizzes.loading', 'Загрузка викторин...'));

        try {
            const quizzes = await loadQuizzes();
            const questionsText = t('quizzes.questions', 'Вопросов');
            const startText = t('quizzes.btn.start', 'Начать');
            container.innerHTML = quizzes.map((quiz) => {
                return `
                    <article class="card">
                        <div class="card-body">
                            <h3 class="card-title">${quiz.title}</h3>
                            <p class="card-text">${quiz.description}</p>
                            <div class="card-meta">${questionsText}: ${quiz.questionsCount}</div>
                            <a class="btn btn-primary" href="${state.basePath}pages/quiz-detail.html?quiz=${quiz.id}">${startText}</a>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (error) {
            showError(container, t('quizzes.error', 'Не удалось загрузить викторины'), () => {
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
            container.innerHTML = '<div class="empty-state">Викторина не найдена.</div>';
            return;
        }

        try {
            const quizzes = await loadQuizzes();
            const quiz = quizzes.find((item) => item.id === id);
            if (!quiz) {
                container.innerHTML = '<div class="empty-state">Викторина не найдена.</div>';
                return;
            }

            container.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title">${quiz.title}</h2>
                        <p class="card-text">${quiz.description}</p>
                    </div>
                </div>
                <form id="quiz-form" class="grid" data-quiz-form>
                    ${quiz.questions.map((question, index) => {
                const options = question.options.map((option) => {
                    const image = resolveAsset(option.image);
                    return `
                                <label class="quiz-option">
                                    <input type="radio" name="q${question.id}" value="${option.id}">
                                    ${image ? `<img src="${image}" alt="${option.text}">` : ''}
                                    <span>${option.text}</span>
                                </label>
                            `;
                }).join('');
                return `
                            <div class="quiz-question">
                                <h3>Вопрос ${index + 1}</h3>
                                <p>${question.text}</p>
                                <div class="quiz-options">${options}</div>
                            </div>
                        `;
            }).join('')}
                    <button type="button" class="btn btn-primary" id="quiz-submit">Проверить ответы</button>
                    <div id="quiz-result" class="result-box" style="display: none;"></div>
                </form>
            `;

            const submit = document.getElementById('quiz-submit');
            const resultBox = document.getElementById('quiz-result');
            const form = document.getElementById('quiz-form');

            submit.addEventListener('click', () => {
                let correct = 0;
                let answered = 0;
                quiz.questions.forEach((question) => {
                    const selected = form.querySelector(`input[name="q${question.id}"]:checked`);
                    if (selected) {
                        answered += 1;
                        const option = question.options.find((item) => item.id === selected.value);
                        if (option && option.isCorrect) {
                            correct += 1;
                        }
                    }
                });

                if (answered < quiz.questions.length) {
                    resultBox.style.display = 'block';
                    resultBox.textContent = 'Ответьте на все вопросы, чтобы узнать результат.';
                    return;
                }

                const percent = Math.round((correct / quiz.questions.length) * 100);
                resultBox.style.display = 'block';
                resultBox.textContent = `Ваш результат: ${correct} из ${quiz.questions.length} (${percent}%).`;
            });
        } catch (error) {
            container.innerHTML = '<div class="empty-state">Не удалось загрузить викторину.</div>';
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
                    await Supa.addIllustration({
                        name: data.name,
                        title: data.title,
                        description: data.description
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
                        setMessage('Спасибо! Ваша работа отправлена в архив фанатов.', 'success');
                        form.reset();
                        if (submitButton) submitButton.disabled = false;
                        return;
                    } catch (error) {
                        setMessage('Не удалось отправить данные в Supabase.', 'error');
                        if (submitButton) submitButton.disabled = false;
                        return;
                    }
                }

                data.createdAt = new Date().toISOString();
                Storage.push(storageKey, data);
                setMessage('Сохранено локально. Подключите Supabase, чтобы хранить в интернете.', 'error');
                form.reset();
                if (submitButton) submitButton.disabled = false;
            });
        });
    };

    const renderFanfics = async () => {
        const container = document.getElementById('fanfics-list');
        if (!container) return;

        if (!Supa.isReady()) {
            container.innerHTML = '<div class="empty-state">Подключите Supabase для просмотра фанфиков.</div>';
            return;
        }

        showLoading(container, 'Загрузка фанфиков...');

        try {
            const fanfics = await Supa.getFanfics();
            if (fanfics.length === 0) {
                container.innerHTML = `<div class="empty-state">${t('fanfics.empty', 'Пока нет фанфиков. Будь первым!')}</div>`;
                return;
            }
            const authorText = t('fanfics.author', 'Автор');
            const characterText = t('fanfics.character', 'Персонаж');
            container.innerHTML = fanfics.map((fanfic) => `
                <article class="card fanfic-card">
                    <div class="card-body">
                        <h4 class="card-title">${fanfic.title}</h4>
                        <div class="card-meta">
                            <span>${authorText}: ${fanfic.name}</span>
                            ${fanfic.character ? `<span>${characterText}: ${fanfic.character}</span>` : ''}
                        </div>
                        <p class="card-text fanfic-story">${fanfic.story}</p>
                    </div>
                </article>
            `).join('');
        } catch (error) {
            container.innerHTML = `<div class="empty-state">${t('fanfics.error', 'Не удалось загрузить фанфики.')}</div>`;
        }
    };

    const renderIllustrations = async () => {
        const container = document.getElementById('illustrations-list');
        if (!container) return;

        if (!Supa.isReady()) {
            container.innerHTML = `<div class="empty-state">${t('supabase.connect', 'Подключите Supabase для просмотра иллюстраций.')}</div>`;
            return;
        }

        showLoading(container, t('illustrations.loading', 'Загрузка иллюстраций...'));

        try {
            const illustrations = await Supa.getIllustrations();
            if (illustrations.length === 0) {
                container.innerHTML = `<div class="empty-state">${t('illustrations.empty', 'Пока нет иллюстраций. Будь первым!')}</div>`;
                return;
            }
            const authorText = t('fanfics.author', 'Автор');
            container.innerHTML = `<div class="grid grid-3">${illustrations.map((ill) => `
                <article class="card illustration-card">
                    ${ill.file_url ? `<div class="card-image"><img src="${ill.file_url}" alt="${ill.title}"></div>` : ''}
                    <div class="card-body">
                        <h4 class="card-title">${ill.title}</h4>
                        <div class="card-meta">${authorText}: ${ill.name}</div>
                        ${ill.description ? `<p class="card-text">${ill.description}</p>` : ''}
                    </div>
                </article>
            `).join('')}</div>`;
        } catch (error) {
            container.innerHTML = `<div class="empty-state">${t('illustrations.error', 'Не удалось загрузить иллюстрации.')}</div>`;
        }
    };

    const reloadContent = async () => {
        // Сбрасываем кэш
        state.places = null;
        state.characters = null;
        state.quizzes = null;

        // Перезагружаем контент
        await renderPlaces();
        await initPlacesMap();
        await renderCharacters();
        await renderCharacterDetail();
        await renderQuizzes();
        await renderQuizDetail();
        await renderFanfics();
        await renderIllustrations();
    };

    const init = async () => {
        initBasePath();
        setupNav();

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
        setupForms();

        // Слушаем смену языка
        window.addEventListener('langchange', async () => {
            if (typeof I18n !== 'undefined') {
                I18n.translatePage();
            }
            await reloadContent();
        });
    };

    return { init, reloadContent };
})();

document.addEventListener('DOMContentLoaded', App.init);
