(() => {
    const reviewsList = document.getElementById('reviews-list');
    const form = document.getElementById('review-form');
    const nameInput = document.getElementById('review-name');
    const textInput = document.getElementById('review-text');
    const counter = document.getElementById('char-count');

    if (!reviewsList || !form || !nameInput || !textInput) return;

    const STORAGE_KEY = 'agatha_reviews';

    const escapeHtml = (value) => {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderReviews = (reviews) => {
        if (!reviews.length) {
            reviewsList.innerHTML = `
                <div class="reviews-empty">
                    <p>Пока нет отзывов. Станьте первым!</p>
                </div>
            `;
            return;
        }

        reviewsList.innerHTML = reviews.map((review) => {
            const safeName = escapeHtml(review.name);
            const safeText = escapeHtml(review.text);
            const dateValue = review.created_at || review.date;
            return `
                <article class="review-card">
                    <div class="review-header">
                        <div class="review-author">${safeName}</div>
                        <div class="review-date">${dateValue ? formatDate(dateValue) : ''}</div>
                    </div>
                    <p class="review-text">${safeText}</p>
                </article>
            `;
        }).join('');
    };

    const updateCounter = () => {
        if (!counter) return;
        counter.textContent = textInput.value.length.toString();
    };

    const addMessage = (type, text) => {
        const existing = form.querySelector('.message');
        if (existing) existing.remove();

        const message = document.createElement('div');
        message.classList.add('message', type === 'success' ? 'message-success' : 'message-error');
        message.textContent = text;
        form.prepend(message);
    };

    const showLoading = () => {
        reviewsList.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Загрузка отзывов...</p>
            </div>
        `;
    };

    const loadReviews = async () => {
        showLoading();

        if (Supa.isReady()) {
            try {
                const reviews = await Supa.getReviews();
                renderReviews(reviews);
                return;
            } catch (error) {
                reviewsList.innerHTML = `
                    <div class="error-container">
                        <p>Не удалось загрузить отзывы</p>
                        <button class="btn btn-retry" id="retry-reviews">Попробовать снова</button>
                    </div>
                `;
                document.getElementById('retry-reviews')?.addEventListener('click', loadReviews);
                return;
            }
        }
        const reviews = Storage.get(STORAGE_KEY, []);
        renderReviews(reviews);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const text = textInput.value.trim();

        if (!name || !text) {
            addMessage('error', 'Заполните имя и текст отзыва.');
            return;
        }

        if (Supa.isReady()) {
            try {
                const result = await Supa.submitReview({ name, text });
                if (result && result.approved) {
                    await loadReviews();
                    addMessage('success', 'Спасибо за отзыв!');
                    form.reset();
                    updateCounter();
                    return;
                }
                const scoreLabel = result && typeof result.score === 'number' ? `Оценка: ${result.score}/10. ` : '';
                addMessage('error', `${scoreLabel}Отзыв не прошёл проверку.`);
                return;
            } catch (error) {
                addMessage('error', 'Не удалось отправить отзыв. Попробуйте позже.');
                return;
            }
        }

        const review = {
            id: Date.now(),
            name,
            text,
            date: new Date().toISOString()
        };

        const reviews = Storage.push(STORAGE_KEY, review);
        renderReviews(reviews);
        addMessage('success', 'Спасибо за отзыв! (Сохранено локально)');
        form.reset();
        updateCounter();
    };

    textInput.addEventListener('input', updateCounter);
    form.addEventListener('submit', handleSubmit);

    loadReviews();
    updateCounter();
})();
