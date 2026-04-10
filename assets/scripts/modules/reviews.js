(() => {
    const reviewsList = document.getElementById('reviews-list');
    const form = document.getElementById('review-form');
    const nameInput = document.getElementById('review-name');
    const textInput = document.getElementById('review-text');
    const counter = document.getElementById('char-count');

    if (!reviewsList || !form || !nameInput || !textInput) return;

    const t = (key, fallback) => (typeof I18n !== 'undefined' && I18n.t) ? I18n.t(key) : fallback;

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

    const isSpamSubmission = () => {
        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && String(honeypot.value || '').trim()) {
            return true;
        }

        const startedAtField = form.querySelector('input[name="form_started_at"]');
        const startedAt = Number(startedAtField?.value || form.dataset.formStartedAt || 0);
        return Boolean(startedAt && Date.now() - startedAt < 2500);
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
        const successText = document.createElement('span');
        successText.className = 'form-success-text';
        successText.textContent = text;
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'form-progress-fill';
        progressBar.appendChild(progressFill);
        message.appendChild(successText);
        message.appendChild(progressBar);
        form.prepend(message);

        const fill = message.querySelector('.form-progress-fill');
        if (fill) {
            fill.style.transition = 'width 5s linear';
            void fill.offsetWidth;
            fill.style.width = '100%';
        }

        setTimeout(() => {
            form.reset();
            form.dataset.formStartedAt = String(Date.now());
            const startedAtField = form.querySelector('input[name="form_started_at"]');
            if (startedAtField) {
                startedAtField.value = form.dataset.formStartedAt;
            }
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
        if (isSpamSubmission()) {
            addMessage('error', t('error.review_generic', 'Failed to submit review. Try later.'));
            return;
        }
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!name || !text) {
            addMessage('error', t('error.review_fields', 'Fill in your name and review text.'));
            return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.origText = submitBtn.textContent; submitBtn.textContent = t('form.loading', 'Загрузка...'); }

        if (Supa.isReady()) {
            try {
                await Supa.submitReview({
                    name,
                    text,
                    website: form.querySelector('input[name="website"]')?.value || '',
                    formStartedAt: form.querySelector('input[name="form_started_at"]')?.value || ''
                });
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.origText; }
                showSentSuccess(t('reviews.success.pending', 'Спасибо за отзыв! Он появится после проверки.'));
                return;
            } catch (error) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.origText; }
                addMessage('error', t('error.review_generic', 'Failed to submit review. Try later.'));
                return;
            }
        }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.origText; }

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
    form.dataset.formStartedAt = String(Date.now());
    const startedAtField = form.querySelector('input[name="form_started_at"]');
    if (startedAtField) {
        startedAtField.value = form.dataset.formStartedAt;
    }

    loadReviews();
    updateCounter();
})();
