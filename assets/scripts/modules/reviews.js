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
        return date.toLocaleDateString(I18n.getLang() === 'ru' ? 'ru-RU' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderReviews = (reviews) => {
        if (!reviews.length) {
            reviewsList.innerHTML = `
                <div class="reviews-empty">
                    <p>${escapeHtml(t('reviews.empty', 'No reviews yet. Be the first!'))}</p>
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

    const showSentSuccess = (text) => {
        // 2-second «ОТПРАВЛЕНО» banner
        const banner = document.createElement('div');
        banner.className = 'form-sent-banner';
        banner.textContent = 'ОТПРАВЛЕНО';
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 2000);

        // Message + 5-second progress bar in form
        const existing = form.querySelector('.message');
        if (existing) existing.remove();

        const message = document.createElement('div');
        message.classList.add('message', 'message-success');
        message.innerHTML = `
            <span class="form-success-text">${escapeHtml(text)}</span>
            <div class="form-progress-bar"><div class="form-progress-fill"></div></div>
        `;
        form.prepend(message);

        const fill = message.querySelector('.form-progress-fill');
        if (fill) {
            fill.style.transition = 'width 5s linear';
            void fill.offsetWidth;
            fill.style.width = '100%';
        }

        setTimeout(() => {
            form.reset();
            updateCounter();
            message.remove();
        }, 5000);
    };

    const showLoading = () => {
        reviewsList.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">${escapeHtml(t('reviews.loading', 'Loading reviews...'))}</p>
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
                        <p>${escapeHtml(t('reviews.error', 'Failed to load reviews'))}</p>
                        <button class="btn btn-retry" id="retry-reviews">${escapeHtml(t('error.retry', 'Try Again'))}</button>
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
            addMessage('error', t('error.review_fields', 'Fill in your name and review text.'));
            return;
        }

        if (Supa.isReady()) {
            try {
                await Supa.submitReview({ name, text });
                showSentSuccess(t('reviews.success.pending', 'Спасибо за отзыв! Он появится после проверки.'));
                return;
            } catch (error) {
                addMessage('error', t('error.review_generic', 'Failed to submit review. Try later.'));
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
        addMessage('success', `${t('reviews.success', 'Thank you for your review!')} ${t('review.local', '(Saved locally)')}`);
        form.reset();
        updateCounter();
    };

    textInput.addEventListener('input', updateCounter);
    form.addEventListener('submit', handleSubmit);

    loadReviews();
    updateCounter();
})();
