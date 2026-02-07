/**
 * Admin Panel for Agatha Mystery Fan Site
 * Complete implementation with auth, CRUD, and moderation
 */

const Admin = (() => {
    // ===========================================
    // Configuration
    // ===========================================
    const CONFIG = {
        PASSWORD_HASH: '129f3b174ec668580fbb4463d69078a11cc598190223825cb578ed3999f39991',
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_TIME: 30000, // 30 seconds
        AUTOSAVE_DELAY: 1000, // 1 second debounce
        STORAGE_BUCKET: 'assets'
    };

    // ===========================================
    // State
    // ===========================================
    let state = {
        isAuthenticated: false,
        currentSection: 'quizzes',
        loginAttempts: 0,
        lockedUntil: null,
        quizzes: [],
        places: [],
        placeImages: [],
        characters: [],
        aboutSections: [],
        pendingReviews: [],
        pendingFanfics: [],
        pendingIllustrations: [],
        map: null,
        placeEditorMap: null,
        markers: {},
        editingPlace: null,
        tempMarker: null
    };

    // Supabase client
    let supabase = null;

    // ===========================================
    // Utilities
    // ===========================================

    // SHA-256 hash function - pure JavaScript implementation for Kindle compatibility
    async function sha256(message) {
        // Try Web Crypto API first (modern browsers)
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const msgBuffer = new TextEncoder().encode(message);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                // Fall through to pure JS implementation
            }
        }

        // Pure JavaScript SHA-256 fallback for Kindle and older browsers
        function sha256Pure(str) {
            function rightRotate(value, amount) {
                return (value >>> amount) | (value << (32 - amount));
            }

            const mathPow = Math.pow;
            const maxWord = mathPow(2, 32);
            let result = '';
            const words = [];
            const asciiBitLength = str.length * 8;

            // Initial hash values (first 32 bits of fractional parts of square roots of first 8 primes)
            let hash0 = 0x6a09e667, hash1 = 0xbb67ae85, hash2 = 0x3c6ef372, hash3 = 0xa54ff53a;
            let hash4 = 0x510e527f, hash5 = 0x9b05688c, hash6 = 0x1f83d9ab, hash7 = 0x5be0cd19;

            // Round constants (first 32 bits of fractional parts of cube roots of first 64 primes)
            const k = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            ];

            // Pre-processing: convert string to words array
            let i, j;
            str += '\x80'; // Append bit '1' to message
            while (str.length % 64 - 56) str += '\x00'; // Append zeros

            for (i = 0; i < str.length; i++) {
                j = str.charCodeAt(i);
                if (j >> 8) return; // ASCII check
                words[i >> 2] |= j << ((3 - i) % 4) * 8;
            }
            words[words.length] = ((asciiBitLength / maxWord) | 0);
            words[words.length] = (asciiBitLength);

            // Process each 512-bit chunk
            for (j = 0; j < words.length;) {
                const w = words.slice(j, j += 16);
                let a = hash0, b = hash1, c = hash2, d = hash3;
                let e = hash4, f = hash5, g = hash6, h = hash7;

                for (i = 0; i < 64; i++) {
                    if (i < 16) {
                        // Use existing word
                    } else {
                        const gamma0x = w[i - 15];
                        const gamma0 = rightRotate(gamma0x, 7) ^ rightRotate(gamma0x, 18) ^ (gamma0x >>> 3);
                        const gamma1x = w[i - 2];
                        const gamma1 = rightRotate(gamma1x, 17) ^ rightRotate(gamma1x, 19) ^ (gamma1x >>> 10);
                        w[i] = (w[i - 16] + gamma0 + w[i - 7] + gamma1) | 0;
                    }

                    const ch = (e & f) ^ (~e & g);
                    const maj = (a & b) ^ (a & c) ^ (b & c);
                    const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
                    const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);

                    const t1 = (h + sigma1 + ch + k[i] + w[i]) | 0;
                    const t2 = (sigma0 + maj) | 0;

                    h = g; g = f; f = e;
                    e = (d + t1) | 0;
                    d = c; c = b; b = a;
                    a = (t1 + t2) | 0;
                }

                hash0 = (hash0 + a) | 0;
                hash1 = (hash1 + b) | 0;
                hash2 = (hash2 + c) | 0;
                hash3 = (hash3 + d) | 0;
                hash4 = (hash4 + e) | 0;
                hash5 = (hash5 + f) | 0;
                hash6 = (hash6 + g) | 0;
                hash7 = (hash7 + h) | 0;
            }

            // Convert to hex string
            for (i = 0; i < 8; i++) {
                const hash = [hash0, hash1, hash2, hash3, hash4, hash5, hash6, hash7][i];
                for (j = 28; j >= 0; j -= 4) {
                    result += ((hash >> j) & 0xf).toString(16);
                }
            }
            return result;
        }

        return sha256Pure(message);
    }

    // Debounce function for autosave
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Show save indicator
    function showSaveIndicator() {
        const indicator = document.getElementById('save-indicator');
        indicator.hidden = false;
        indicator.style.animation = 'none';
        indicator.offsetHeight; // Trigger reflow
        indicator.style.animation = 'fadeInOut 2s ease-in-out';
        setTimeout(() => {
            indicator.hidden = true;
        }, 2000);
    }

    // Show toast notification (replacement for alert)
    function showToast(message, type = 'error') {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 24px;
                z-index: 2000;
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#D32F2F' : type === 'success' ? '#388E3C' : '#F57C00';
        toast.style.cssText = `
            padding: 12px 20px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            max-width: 350px;
            animation: slideInUp 0.3s ease;
        `;
        toast.textContent = message;
        container.appendChild(toast);

        // Add animation keyframes if not present
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideOutDown {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Promise-based confirm dialog (replacement for confirm)
    let confirmResolve = null;

    function showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            confirmResolve = resolve;
            const dialog = document.getElementById('confirm-dialog');
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            dialog.hidden = false;
        });
    }

    function setupConfirmDialog() {
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            document.getElementById('confirm-dialog').hidden = true;
            if (confirmResolve) {
                confirmResolve(false);
                confirmResolve = null;
            }
        });

        document.getElementById('confirm-ok').addEventListener('click', () => {
            document.getElementById('confirm-dialog').hidden = true;
            if (confirmResolve) {
                confirmResolve(true);
                confirmResolve = null;
            }
        });
    }

    // Format date
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate unique ID
    function generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // ===========================================
    // Supabase Connection
    // ===========================================

    function initSupabase() {
        const config = window.SUPABASE_CONFIG || {};
        if (config.url && config.anonKey && window.supabase) {
            supabase = window.supabase.createClient(config.url, config.anonKey);
            return true;
        }
        console.error('Supabase not configured');
        return false;
    }

    // ===========================================
    // Authentication
    // ===========================================

    async function handleLogin(e) {
        e.preventDefault();

        const passwordInput = document.getElementById('password');
        const errorDiv = document.getElementById('login-error');
        const errorText = errorDiv.querySelector('.error-text');
        const loginBtn = document.getElementById('login-btn');

        // Check lockout
        if (state.lockedUntil && Date.now() < state.lockedUntil) {
            const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000);
            errorText.textContent = `Слишком много попыток. Подождите ${remaining} сек.`;
            errorDiv.hidden = false;
            return;
        }

        const password = passwordInput.value;
        if (!password) {
            errorText.textContent = 'Введите пароль';
            errorDiv.hidden = false;
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Проверка...';

        try {
            const hash = await sha256(password);

            if (hash === CONFIG.PASSWORD_HASH) {
                state.isAuthenticated = true;
                state.loginAttempts = 0;
                sessionStorage.setItem('admin_auth', 'true');
                showAdminPanel();
            } else {
                state.loginAttempts++;

                if (state.loginAttempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
                    state.lockedUntil = Date.now() + CONFIG.LOCKOUT_TIME;
                    errorText.textContent = `Слишком много попыток. Подождите 30 секунд.`;
                } else {
                    const remaining = CONFIG.MAX_LOGIN_ATTEMPTS - state.loginAttempts;
                    errorText.textContent = `Неверный пароль. Осталось попыток: ${remaining}`;
                }
                errorDiv.hidden = false;
                passwordInput.value = '';
            }
        } catch (error) {
            errorText.textContent = 'Ошибка проверки пароля';
            errorDiv.hidden = false;
        }

        loginBtn.disabled = false;
        loginBtn.textContent = 'Войти';
    }

    function handleLogout() {
        state.isAuthenticated = false;
        sessionStorage.removeItem('admin_auth');
        document.getElementById('admin-panel').hidden = true;
        document.getElementById('login-screen').hidden = false;
        document.getElementById('password').value = '';
    }

    function checkAuth() {
        if (sessionStorage.getItem('admin_auth') === 'true') {
            state.isAuthenticated = true;
            showAdminPanel();
        } else {
            document.getElementById('login-screen').hidden = false;
        }
    }

    function togglePasswordVisibility() {
        const input = document.getElementById('password');
        const btn = document.getElementById('toggle-password');
        if (input.type === 'password') {
            input.type = 'text';
            btn.querySelector('.eye-icon').textContent = '🙈';
        } else {
            input.type = 'password';
            btn.querySelector('.eye-icon').textContent = '👁';
        }
    }

    // ===========================================
    // Navigation
    // ===========================================

    function showAdminPanel() {
        document.getElementById('login-screen').hidden = true;
        document.getElementById('admin-panel').hidden = false;
        loadAllData();
    }

    function switchSection(section) {
        state.currentSection = section;

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `section-${section}`);
        });

        // Initialize map if switching to places
        if (section === 'places' && !state.map) {
            setTimeout(initMainMap, 100);
        }
    }

    // ===========================================
    // Data Loading
    // ===========================================

    async function loadAllData() {
        try {
            await Promise.all([
                loadQuizzes(),
                loadPlaces(),
                loadCharacters(),
                loadAboutSections(),
                loadModerationData()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async function loadQuizzes() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            state.quizzes = data || [];
            renderQuizzes();
        } catch (error) {
            console.error('Error loading quizzes:', error);
        }
    }

    async function loadPlaces() {
        if (!supabase) return;

        try {
            const [placesRes, imagesRes] = await Promise.all([
                supabase.from('places').select('*').order('id', { ascending: true }),
                supabase.from('place_images').select('*').order('sort_order', { ascending: true })
            ]);

            if (placesRes.error) throw placesRes.error;
            if (imagesRes.error) throw imagesRes.error;

            state.places = placesRes.data || [];
            state.placeImages = imagesRes.data || [];
            renderPlaces();
            updateMapMarkers();
        } catch (error) {
            console.error('Error loading places:', error);
        }
    }

    async function loadCharacters() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            state.characters = data || [];
            renderCharacters();
        } catch (error) {
            console.error('Error loading characters:', error);
        }
    }

    async function loadModerationData() {
        if (!supabase) return;

        try {
            const [reviewsRes, fanficsRes, illustrationsRes] = await Promise.all([
                supabase.from('reviews').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
                supabase.from('fanfics').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
                supabase.from('illustrations').select('*').eq('status', 'pending').order('created_at', { ascending: false })
            ]);

            state.pendingReviews = reviewsRes.data || [];
            state.pendingFanfics = fanficsRes.data || [];
            state.pendingIllustrations = illustrationsRes.data || [];

            updateModerationBadge();
            renderModeration();
        } catch (error) {
            console.error('Error loading moderation data:', error);
        }
    }

    // ===========================================
    // Quizzes
    // ===========================================

    function renderQuizzes() {
        const container = document.getElementById('quizzes-list');

        if (state.quizzes.length === 0) {
            container.innerHTML = '<div class="empty-state">Архив пуст. Напишите новое дело!</div>';
            return;
        }

        container.innerHTML = state.quizzes.map(quiz => `
            <div class="item-card" data-id="${quiz.id}">
                <div class="item-card-image">
                    <span style="font-size: 40px;">📂</span>
                </div>
                <div class="item-card-body">
                    <h3 class="item-card-title">${escapeHtml(quiz.title)}</h3>
                    <p class="item-card-meta">
                        ${quiz.questions_count || (quiz.questions ? quiz.questions.length : 0)} улик/вопросов
                    </p>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', () => openQuizEditor(parseInt(card.dataset.id)));
        });
    }

    function openQuizEditor(quizId = null) {
        const modal = document.getElementById('quiz-editor-modal');
        const form = document.getElementById('quiz-form');

        form.reset();
        document.getElementById('quiz-id').value = '';
        document.getElementById('questions-container').innerHTML = '';

        if (quizId) {
            const quiz = state.quizzes.find(q => q.id === quizId);
            if (quiz) {
                document.getElementById('quiz-id').value = quiz.id;
                document.getElementById('quiz-title').value = quiz.title || '';
                document.getElementById('quiz-title-en').value = quiz.title_en || '';
                document.getElementById('quiz-description').value = quiz.description || '';
                document.getElementById('quiz-description-en').value = quiz.description_en || '';
                document.getElementById('delete-quiz-btn').hidden = false;

                if (quiz.questions && quiz.questions.length) {
                    quiz.questions.forEach((q, idx) => addQuestion(q, idx + 1));
                }
            }
        } else {
            document.getElementById('delete-quiz-btn').hidden = true;
        }

        modal.hidden = false;
    }

    function addQuestion(questionData = null, number = null) {
        const container = document.getElementById('questions-container');
        const qNum = number || container.children.length + 1;
        const qId = questionData?.id || generateId();
        const qType = questionData?.type || 'text';

        const questionHtml = `
            <div class="question-card" data-question-id="${qId}">
                <div class="question-header">
                    <span class="question-number">${qNum}</span>
                    <select class="question-type-select" data-field="type">
                        <option value="text" ${(!questionData || questionData.type === 'text') ? 'selected' : ''}>Один ответ</option>
                        <option value="checkbox" ${questionData?.type === 'checkbox' ? 'selected' : ''}>Несколько ответов</option>
                        <option value="input" ${questionData?.type === 'input' ? 'selected' : ''}>Текстовый ввод</option>
                        <option value="image" ${questionData?.type === 'image' ? 'selected' : ''}>С изображениями</option>
                    </select>
                    <button type="button" class="question-remove" title="Удалить вопрос">&times;</button>
                </div>
                <div class="question-text-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 10px; opacity: 0.7;">Вопрос (RU)</label>
                        <input type="text" placeholder="Текст вопроса" data-field="text"
                               value="${escapeHtml(questionData?.text || '')}">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 10px; opacity: 0.7;">Question (EN)</label>
                        <input type="text" placeholder="Question text" data-field="text_en"
                               value="${escapeHtml(questionData?.text_en || '')}">
                    </div>
                </div>
                <div class="options-list">
                    ${renderOptions(questionData)}
                </div>
                <button type="button" class="btn btn-secondary btn-small add-option-btn" ${qType === 'input' ? 'hidden' : ''}>+ Добавить вариант</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', questionHtml);

        const card = container.lastElementChild;

        card.querySelector('.question-remove').addEventListener('click', () => {
            card.remove();
            renumberQuestions();
        });

        card.querySelector('.add-option-btn').addEventListener('click', () => {
            addOption(card);
        });

        card.querySelector('.question-type-select').addEventListener('change', (e) => {
            updateOptionsForType(card, e.target.value);
        });

        card.querySelectorAll('.option-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.option-item').remove();
            });
        });

        // Add image upload handlers
        card.querySelectorAll('.option-image-input').forEach(input => {
            input.addEventListener('change', async (e) => {
                await handleOptionImageUpload(e, input.closest('.option-item'));
            });
        });
    }

    function renderOptions(questionData) {
        const type = questionData?.type || 'text';

        // For text input type, show correct answer field
        if (type === 'input') {
            const correctAnswer = questionData?.correctAnswer || '';
            const correctAnswerEn = questionData?.correctAnswer_en || '';
            return `
                <div class="input-answer-field" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 10px; opacity: 0.7;">Ответ (RU)</label>
                        <input type="text" class="correct-answer-input" placeholder="Правильный ответ" 
                               value="${escapeHtml(correctAnswer)}" data-field="correctAnswer">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 10px; opacity: 0.7;">Answer (EN)</label>
                        <input type="text" class="correct-answer-input-en" placeholder="Correct answer" 
                               value="${escapeHtml(correctAnswerEn)}" data-field="correctAnswer_en">
                    </div>
                </div>
            `;
        }

        // For other types, show options
        const options = questionData?.options || [
            { id: 'a', text: '', text_en: '', isCorrect: false },
            { id: 'b', text: '', text_en: '', isCorrect: false }
        ];
        const inputType = type === 'checkbox' ? 'checkbox' : 'radio';

        return options.map(opt => `
            <div class="option-item" data-option-id="${opt.id}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <input type="${inputType}" name="correct-${questionData?.id || 'new'}"
                       ${opt.isCorrect ? 'checked' : ''} title="Правильный ответ" style="width: auto; margin: 0;">
                ${type === 'image' && opt.image ? `<img src="${opt.image}" class="option-image-preview" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : ''}
                <div class="option-texts" style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <input type="text" placeholder="Вариант (RU)" value="${escapeHtml(opt.text || '')}" data-field="text">
                    <input type="text" placeholder="Option (EN)" value="${escapeHtml(opt.text_en || '')}" data-field="text_en">
                </div>
                ${type === 'image' ? `<input type="file" accept="image/*" class="option-image-input" hidden>
                    <button type="button" class="btn btn-outline btn-small" onclick="this.previousElementSibling.click()">📷</button>` : ''}
                <button type="button" class="option-remove" style="background: none; border: none; font-size: 20px; color: var(--danger); cursor: pointer; padding: 0 5px;">&times;</button>
            </div>
        `).join('');
    }

    function addOption(questionCard) {
        const optionsList = questionCard.querySelector('.options-list');
        const type = questionCard.querySelector('.question-type-select').value;
        const inputType = type === 'checkbox' ? 'checkbox' : 'radio';
        const optId = String.fromCharCode(97 + optionsList.children.length); // a, b, c, d...

        const optionHtml = `
            <div class="option-item" data-option-id="${optId}">
                <input type="${inputType}" name="correct-${questionCard.dataset.questionId}">
                <div class="option-texts">
                    <input type="text" placeholder="Вариант (RU)" data-field="text">
                    <input type="text" placeholder="Option (EN)" data-field="text_en">
                </div>
                ${type === 'image' ? `<input type="file" accept="image/*" class="option-image-input" hidden>
                    <button type="button" class="btn btn-small" onclick="this.previousElementSibling.click()">📷</button>` : ''}
                <button type="button" class="option-remove">&times;</button>
            </div>
        `;

        optionsList.insertAdjacentHTML('beforeend', optionHtml);

        const newOption = optionsList.lastElementChild;
        newOption.querySelector('.option-remove').addEventListener('click', () => {
            newOption.remove();
        });

        // Add image upload handler if type is image
        if (type === 'image') {
            const imageInput = newOption.querySelector('.option-image-input');
            if (imageInput) {
                imageInput.addEventListener('change', async (e) => {
                    await handleOptionImageUpload(e, newOption);
                });
            }
        }
    }

    function updateOptionsForType(questionCard, type) {
        const optionsList = questionCard.querySelector('.options-list');
        const addOptionBtn = questionCard.querySelector('.add-option-btn');
        const inputType = type === 'checkbox' ? 'checkbox' : 'radio';

        // For text input type, show correct answer field instead of options
        if (type === 'input') {
            // Get existing correct answer if any
            const existingAnswer = optionsList.querySelector('.correct-answer-input');
            const existingAnswerEn = optionsList.querySelector('.correct-answer-input-en');
            const currentAnswer = existingAnswer ? existingAnswer.value : '';
            const currentAnswerEn = existingAnswerEn ? existingAnswerEn.value : '';

            optionsList.innerHTML = `
                <div class="input-answer-field">
                    <label>Правильный ответ:</label>
                    <input type="text" class="correct-answer-input" placeholder="Правильный ответ (RU)" 
                           value="${escapeHtml(currentAnswer)}" data-field="correctAnswer">
                    <input type="text" class="correct-answer-input-en" placeholder="Correct answer (EN)" 
                           value="${escapeHtml(currentAnswerEn)}" data-field="correctAnswer_en" style="margin-top: 8px;">
                </div>
            `;
            addOptionBtn.hidden = true;
            return;
        }

        // Show add option button for other types
        addOptionBtn.hidden = false;

        // Collect current options data
        const currentOptions = [];
        optionsList.querySelectorAll('.option-item').forEach(optItem => {
            const textInput = optItem.querySelector('input[data-field="text"]');
            const textEnInput = optItem.querySelector('input[data-field="text_en"]');
            const correctInput = optItem.querySelector('input[type="radio"], input[type="checkbox"]');
            currentOptions.push({
                id: optItem.dataset.optionId,
                text: textInput ? textInput.value : '',
                text_en: textEnInput ? textEnInput.value : '',
                isCorrect: correctInput ? correctInput.checked : false
            });
        });

        // If no options exist, create default ones
        if (currentOptions.length === 0) {
            currentOptions.push(
                { id: 'a', text: '', text_en: '', isCorrect: false },
                { id: 'b', text: '', text_en: '', isCorrect: false }
            );
        }

        // Clear and rebuild options
        optionsList.innerHTML = '';

        currentOptions.forEach(opt => {
            const optionHtml = `
                <div class="option-item" data-option-id="${opt.id}">
                    <input type="${inputType}" name="correct-${questionCard.dataset.questionId}" 
                           ${opt.isCorrect ? 'checked' : ''} title="Правильный ответ">
                    <div class="option-texts">
                        <input type="text" placeholder="Вариант (RU)" value="${escapeHtml(opt.text)}" data-field="text">
                        <input type="text" placeholder="Option (EN)" value="${escapeHtml(opt.text_en)}" data-field="text_en">
                    </div>
                    ${type === 'image' ? `<input type="file" accept="image/*" class="option-image-input" hidden>
                        <button type="button" class="btn btn-small" onclick="this.previousElementSibling.click()">📷</button>` : ''}
                    <button type="button" class="option-remove">&times;</button>
                </div>
            `;
            optionsList.insertAdjacentHTML('beforeend', optionHtml);
        });

        // Re-attach event listeners
        optionsList.querySelectorAll('.option-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.option-item').remove();
            });
        });

        // Re-attach image upload handlers
        optionsList.querySelectorAll('.option-image-input').forEach(input => {
            input.addEventListener('change', async (e) => {
                await handleOptionImageUpload(e, input.closest('.option-item'));
            });
        });
    }

    async function handleOptionImageUpload(e, optionItem) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB for base64)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Изображение слишком большое. Максимум 5MB');
            return;
        }

        try {
            // Convert to base64 instead of uploading to Supabase
            const imageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Check if preview already exists
            let preview = optionItem.querySelector('.option-image-preview');
            if (preview) {
                preview.src = imageUrl;
            } else {
                // Create preview element
                const textInput = optionItem.querySelector('input[data-field="text"]');
                preview = document.createElement('img');
                preview.className = 'option-image-preview';
                preview.src = imageUrl;
                textInput.insertAdjacentElement('afterend', preview);
            }

            showToast('Изображение загружено', 'success');
        } catch (error) {
            console.error('Error loading image:', error);
            showToast('Ошибка загрузки изображения: ' + error.message);
        }

        e.target.value = '';
    }

    function renumberQuestions() {
        document.querySelectorAll('.question-card').forEach((card, idx) => {
            card.querySelector('.question-number').textContent = idx + 1;
        });
    }

    async function saveQuiz() {
        const quizId = document.getElementById('quiz-id').value;
        const title = document.getElementById('quiz-title').value.trim();
        const titleEn = document.getElementById('quiz-title-en').value.trim();
        const description = document.getElementById('quiz-description').value.trim();
        const descriptionEn = document.getElementById('quiz-description-en').value.trim();

        if (!title) {
            showToast('Введите название квиза');
            return;
        }

        // Collect questions
        const questions = [];
        document.querySelectorAll('.question-card').forEach((card, idx) => {
            const type = card.querySelector('.question-type-select').value;
            const text = card.querySelector('[data-field="text"]').value.trim();
            const textEn = card.querySelector('[data-field="text_en"]')?.value.trim() || '';

            const questionData = {
                id: idx + 1,
                text: text,
                text_en: textEn,
                type: type
            };

            // For input type, get the correct answer
            if (type === 'input') {
                const correctAnswerInput = card.querySelector('.correct-answer-input');
                const correctAnswerEnInput = card.querySelector('.correct-answer-input-en');
                questionData.correctAnswer = correctAnswerInput ? correctAnswerInput.value.trim() : '';
                questionData.correctAnswer_en = correctAnswerEnInput ? correctAnswerEnInput.value.trim() : '';
            } else {
                // For other types, collect options
                const options = [];
                card.querySelectorAll('.option-item').forEach(optItem => {
                    const optText = optItem.querySelector('input[data-field="text"]').value.trim();
                    const optTextEn = optItem.querySelector('input[data-field="text_en"]')?.value.trim() || '';
                    const isCorrect = optItem.querySelector('input[type="radio"], input[type="checkbox"]').checked;
                    const imgPreview = optItem.querySelector('.option-image-preview');

                    options.push({
                        id: optItem.dataset.optionId,
                        text: optText,
                        text_en: optTextEn,
                        isCorrect: isCorrect,
                        image: imgPreview ? imgPreview.src : undefined
                    });
                });
                questionData.options = options;
            }

            questions.push(questionData);
        });

        const quizData = {
            title: title,
            title_en: titleEn,
            description: description,
            description_en: descriptionEn,
            questions_count: questions.length,
            questions: questions
        };

        try {
            if (quizId) {
                // Update existing
                const { error } = await supabase
                    .from('quizzes')
                    .update(quizData)
                    .eq('id', parseInt(quizId));
                if (error) throw error;
            } else {
                // Create new
                const newId = state.quizzes.length > 0
                    ? Math.max(...state.quizzes.map(q => q.id)) + 1
                    : 1;
                quizData.id = newId;

                const { error } = await supabase
                    .from('quizzes')
                    .insert(quizData);
                if (error) throw error;
            }

            closeModal('quiz-editor-modal');
            await loadQuizzes();
            showSaveIndicator();
        } catch (error) {
            console.error('Error saving quiz:', error);
            showToast('Ошибка сохранения: ' + error.message);
        }
    }

    async function deleteQuiz() {
        const quizId = document.getElementById('quiz-id').value;
        if (!quizId) return;

        const confirmed = await showConfirmDialog('Подтверждение', 'Удалить этот квиз?');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('quizzes')
                .delete()
                .eq('id', parseInt(quizId));

            if (error) throw error;

            closeModal('quiz-editor-modal');
            await loadQuizzes();
            showSaveIndicator();
        } catch (error) {
            console.error('Error deleting quiz:', error);
            showToast('Ошибка удаления: ' + error.message);
        }
    }

    // ===========================================
    // Places (Map Markers)
    // ===========================================

    function initMainMap() {
        if (state.map) return;

        const mapContainer = document.getElementById('admin-map');
        if (!mapContainer) return;

        state.map = L.map('admin-map').setView([45, 10], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(state.map);

        // Main map click - editing happens in modal, not here

        updateMapMarkers();
    }

    function updateMapMarkers() {
        if (!state.map) return;

        // Clear existing markers
        Object.values(state.markers).forEach(marker => marker.remove());
        state.markers = {};

        // Add markers for all places
        state.places.forEach(place => {
            if (place.lat && place.lng) {
                const marker = L.marker([place.lat, place.lng])
                    .addTo(state.map)
                    .bindPopup(`<b>${escapeHtml(place.name)}</b>`);

                marker.on('click', () => {
                    selectPlace(place.id);
                });

                state.markers[place.id] = marker;
            }
        });
    }

    function renderPlaces() {
        const container = document.getElementById('places-list');

        if (state.places.length === 0) {
            container.innerHTML = '<div class="empty-state">Карта чиста. Куда отправимся дальше?</div>';
            return;
        }

        container.innerHTML = state.places.map(place => `
            <div class="place-item" data-id="${place.id}">
                <span class="place-item-icon">📍</span>
                <div class="place-item-info">
                    <div class="place-item-name">${escapeHtml(place.name)}</div>
                    <div class="place-item-coords">${place.lat?.toFixed(4) || '?'}, ${place.lng?.toFixed(4) || '?'}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.place-item').forEach(item => {
            item.addEventListener('click', () => selectPlace(parseInt(item.dataset.id)));
            item.addEventListener('dblclick', () => openPlaceEditor(parseInt(item.dataset.id)));
        });
    }

    function selectPlace(placeId) {
        const place = state.places.find(p => p.id === placeId);
        if (!place) return;

        // Highlight in list
        document.querySelectorAll('.place-item').forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.id) === placeId);
        });

        // Pan map to marker
        if (state.map && place.lat && place.lng) {
            state.map.setView([place.lat, place.lng], 8);
            state.markers[placeId]?.openPopup();
        }
    }

    function openPlaceEditor(placeId = null) {
        const modal = document.getElementById('place-editor-modal');
        const form = document.getElementById('place-form');
        const deleteBtn = document.getElementById('delete-place-btn');

        form.reset();
        document.getElementById('place-id').value = '';
        document.getElementById('place-images-gallery').innerHTML = '';
        state.editingPlace = placeId;
        deleteBtn.hidden = !placeId;

        // Initialize editor map
        setTimeout(() => {
            if (!state.placeEditorMap) {
                state.placeEditorMap = L.map('place-editor-map').setView([45, 10], 2);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap'
                }).addTo(state.placeEditorMap);

                state.placeEditorMap.on('click', (e) => {
                    document.getElementById('place-lat').value = e.latlng.lat.toFixed(6);
                    document.getElementById('place-lng').value = e.latlng.lng.toFixed(6);
                    updateTempMarker(e.latlng.lat, e.latlng.lng);
                });
            }
            state.placeEditorMap.invalidateSize();

            if (placeId) {
                const place = state.places.find(p => p.id === placeId);
                if (place) {
                    document.getElementById('place-id').value = place.id;
                    document.getElementById('place-name').value = place.name || '';
                    document.getElementById('place-name-en').value = place.name_en || '';
                    document.getElementById('place-description').value = place.description || '';
                    document.getElementById('place-description-en').value = place.description_en || '';
                    document.getElementById('place-lat').value = place.lat || '';
                    document.getElementById('place-lng').value = place.lng || '';

                    if (place.lat && place.lng) {
                        state.placeEditorMap.setView([place.lat, place.lng], 6);
                        updateTempMarker(place.lat, place.lng);
                    }

                    // Load images
                    const images = state.placeImages.filter(img => img.place_id === place.id);
                    renderPlaceImages(images);
                }
            } else {
                state.placeEditorMap.setView([45, 10], 2);
                if (state.tempMarker) {
                    state.tempMarker.remove();
                    state.tempMarker = null;
                }
            }
        }, 100);

        modal.hidden = false;
    }

    function updateTempMarker(lat, lng) {
        if (!state.placeEditorMap) return;

        if (state.tempMarker) {
            state.tempMarker.setLatLng([lat, lng]);
        } else {
            state.tempMarker = L.marker([lat, lng]).addTo(state.placeEditorMap);
        }
    }

    function renderPlaceImages(images) {
        const container = document.getElementById('place-images-gallery');

        container.innerHTML = images.map(img => `
            <div class="gallery-image" data-image-id="${img.id}">
                <img src="${img.image_url}" alt="${escapeHtml(img.caption || '')}">
                <button type="button" class="gallery-image-remove" data-id="${img.id}">&times;</button>
            </div>
        `).join('');

        container.querySelectorAll('.gallery-image-remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const imageId = parseInt(btn.dataset.id);
                await deletePlaceImage(imageId);
            });
        });
    }

    async function deletePlaceImage(imageId) {
        try {
            const { error } = await supabase
                .from('place_images')
                .delete()
                .eq('id', imageId);

            if (error) throw error;

            state.placeImages = state.placeImages.filter(img => img.id !== imageId);
            const placeId = parseInt(document.getElementById('place-id').value);
            const images = state.placeImages.filter(img => img.place_id === placeId);
            renderPlaceImages(images);
            showSaveIndicator();
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast('Ошибка удаления изображения');
        }
    }

    async function savePlace(isAutosave = false) {
        const placeId = document.getElementById('place-id').value;
        const name = document.getElementById('place-name').value.trim();
        const nameEn = document.getElementById('place-name-en').value.trim();
        const description = document.getElementById('place-description').value.trim();
        const descriptionEn = document.getElementById('place-description-en').value.trim();
        const lat = parseFloat(document.getElementById('place-lat').value);
        const lng = parseFloat(document.getElementById('place-lng').value);

        if (!name) {
            if (!isAutosave) showToast('Введите название локации');
            return;
        }

        if (isNaN(lat) || isNaN(lng)) {
            if (!isAutosave) showToast('Введите координаты или кликните на карту');
            return;
        }

        const placeData = {
            name: name,
            name_en: nameEn,
            description: description,
            description_en: descriptionEn,
            lat: lat,
            lng: lng
        };

        try {
            if (placeId) {
                const { error } = await supabase
                    .from('places')
                    .update(placeData)
                    .eq('id', parseInt(placeId));
                if (error) throw error;
            } else {
                const newId = state.places.length > 0
                    ? Math.max(...state.places.map(p => p.id)) + 1
                    : 1;
                placeData.id = newId;

                const { error } = await supabase
                    .from('places')
                    .insert(placeData);
                if (error) throw error;
            }

            if (!isAutosave) {
                closeModal('place-editor-modal');
                state.editingPlace = null;
            }
            await loadPlaces();
            showSaveIndicator();
        } catch (error) {
            console.error('Error saving place:', error);
            showToast('Ошибка сохранения: ' + error.message);
        }
    }

    async function deletePlace() {
        const placeId = document.getElementById('place-id').value;
        if (!placeId) return;

        const confirmed = await showConfirmDialog('Подтверждение', 'Удалить эту локацию?');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('places')
                .delete()
                .eq('id', parseInt(placeId));

            if (error) throw error;

            closeModal('place-editor-modal');
            state.editingPlace = null;
            await loadPlaces();
            showSaveIndicator();
        } catch (error) {
            console.error('Error deleting place:', error);
            showToast('Ошибка удаления: ' + error.message);
        }
    }

    // ===========================================
    // Characters
    // ===========================================

    function renderCharacters() {
        const container = document.getElementById('characters-list');

        if (state.characters.length === 0) {
            container.innerHTML = '<div class="empty-state">Архив пуст. Кто эти люди?</div>';
            return;
        }

        container.innerHTML = state.characters.map(char => `
            <div class="item-card character-card" data-id="${char.id}">
                <div class="item-card-image">
                    ${char.image_url
                ? `<img src="${char.image_url}" alt="${escapeHtml(char.name)}">`
                : '<span style="font-size: 64px;">👤</span>'
            }
                </div>
                <div class="item-card-body">
                    <h3 class="item-card-title">${escapeHtml(char.name)}</h3>
                    <p class="item-card-meta">${escapeHtml(char.short_description || '')}</p>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', () => openCharacterEditor(parseInt(card.dataset.id)));
        });
    }

    function openCharacterEditor(characterId = null) {
        const modal = document.getElementById('character-editor-modal');
        const form = document.getElementById('character-form');
        const preview = document.getElementById('character-image-preview');

        form.reset();
        document.getElementById('character-id').value = '';
        preview.innerHTML = '<span class="placeholder">Досье без портрета</span>';

        if (characterId) {
            const char = state.characters.find(c => c.id === characterId);
            if (char) {
                document.getElementById('character-id').value = char.id;
                document.getElementById('character-name').value = char.name || '';
                document.getElementById('character-name-en').value = char.name_en || '';
                document.getElementById('character-short').value = char.short_description || '';
                document.getElementById('character-short-en').value = char.short_description_en || '';
                document.getElementById('character-bio').value = char.full_bio || '';
                document.getElementById('character-bio-en').value = char.full_bio_en || '';

                if (char.image_url) {
                    preview.innerHTML = `<img src="${char.image_url}" alt="${escapeHtml(char.name)}">`;
                }
            }
        }

        modal.hidden = false;
    }

    async function saveCharacter() {
        const charId = document.getElementById('character-id').value;
        const name = document.getElementById('character-name').value.trim();
        const shortDesc = document.getElementById('character-short').value.trim();
        const bio = document.getElementById('character-bio').value.trim();

        if (!name) {
            showToast('Введите имя персонажа');
            return;
        }

        // Check for new image upload
        const fileInput = document.getElementById('character-image-upload');
        let imageUrl = null;

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];

            // Check file size (max 5MB for base64)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Изображение слишком большое. Максимум 5MB');
                return;
            }

            try {
                // Convert to base64 instead of uploading to Supabase
                imageUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                showToast('Ошибка загрузки изображения');
                return;
            }
        }

        const charData = {
            name: name,
            name_en: document.getElementById('character-name-en').value.trim(),
            short_description: shortDesc,
            short_description_en: document.getElementById('character-short-en').value.trim(),
            full_bio: bio,
            full_bio_en: document.getElementById('character-bio-en').value.trim()
        };

        if (imageUrl) {
            charData.image_url = imageUrl;
        }

        try {
            if (charId) {
                const { error } = await supabase
                    .from('characters')
                    .update(charData)
                    .eq('id', parseInt(charId));
                if (error) throw error;
            } else {
                const newId = state.characters.length > 0
                    ? Math.max(...state.characters.map(c => c.id)) + 1
                    : 1;
                charData.id = newId;

                const { error } = await supabase
                    .from('characters')
                    .insert(charData);
                if (error) throw error;
            }

            closeModal('character-editor-modal');
            await loadCharacters();
            showSaveIndicator();
        } catch (error) {
            console.error('Error saving character:', error);
            showToast('Ошибка сохранения: ' + error.message);
        }
    }

    async function deleteCharacter() {
        const charId = document.getElementById('character-id').value;
        if (!charId) return;

        const confirmed = await showConfirmDialog('Подтверждение', 'Удалить этого персонажа?');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('characters')
                .delete()
                .eq('id', parseInt(charId));

            if (error) throw error;

            closeModal('character-editor-modal');
            await loadCharacters();
            showSaveIndicator();
        } catch (error) {
            console.error('Error deleting character:', error);
            showToast('Ошибка удаления: ' + error.message);
        }
    }

    // ===========================================
    // About Us
    // ===========================================

    async function loadAboutSections() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('about_sections')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            state.aboutSections = data || [];
            renderAboutSections();
        } catch (error) {
            console.error('Error loading about sections:', error);
        }
    }

    function renderAboutSections() {
        const container = document.getElementById('about-list');
        if (!container) return;
        if (state.aboutSections.length === 0) {
            container.innerHTML = '<div class="empty-state">История еще не написана. Расскажите о себе!</div>';
            return;
        }
        container.innerHTML = state.aboutSections.map(section => `
            <div class="item-card about-card" data-id="${section.id}">
                <div class="item-card-image">
                    <span style="font-size: 32px;">ℹ️</span>
                </div>
                <div class="item-card-body">
                    <h3 class="item-card-title">${escapeHtml(section.title)}</h3>
                    <p class="item-card-meta">Порядок: ${section.sort_order}</p>
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', () => openAboutEditor(parseInt(card.dataset.id)));
        });
    }

    function addAboutBlock(data = { subtitle: '', subtitle_en: '', content: '', content_en: '' }) {
        const container = document.getElementById('about-blocks-container');
        const blockId = 'block-' + Date.now() + Math.random().toString(16).slice(2);

        const blockHtml = `
            <div class="about-block-item" id="${blockId}">
                <span class="remove-block" onclick="document.getElementById('${blockId}').remove()">&times;</span>
                <div class="field-pair">
                    <div class="form-group">
                        <label>Подзаголовок (RU)</label>
                        <input type="text" class="block-subtitle" value="${escapeHtml(data.subtitle)}">
                    </div>
                    <div class="form-group">
                        <label>Subtitle (EN)</label>
                        <input type="text" class="block-subtitle-en" value="${escapeHtml(data.subtitle_en)}">
                    </div>
                </div>
                <div class="field-pair">
                    <div class="form-group">
                        <label>Текст блока (RU)</label>
                        <textarea class="block-content" rows="4">${escapeHtml(data.content)}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Block Text (EN)</label>
                        <textarea class="block-content-en" rows="4">${escapeHtml(data.content_en)}</textarea>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', blockHtml);
    }

    function openAboutEditor(aboutId = null) {
        const modal = document.getElementById('about-editor-modal');
        const form = document.getElementById('about-form');
        const blocksContainer = document.getElementById('about-blocks-container');

        form.reset();
        blocksContainer.innerHTML = '';
        document.getElementById('about-id').value = '';

        if (aboutId) {
            const section = state.aboutSections.find(s => s.id === aboutId);
            if (section) {
                document.getElementById('about-id').value = section.id;
                document.getElementById('about-title').value = section.title || '';
                document.getElementById('about-title-en').value = section.title_en || '';
                document.getElementById('about-sort').value = section.sort_order || 0;

                const blocks = section.blocks || [];
                if (blocks.length > 0) {
                    blocks.forEach(block => addAboutBlock(block));
                } else {
                    addAboutBlock(); // Add one empty block if none
                }

                document.getElementById('delete-about-btn').hidden = false;
            }
        } else {
            addAboutBlock(); // Start with one empty block
            document.getElementById('delete-about-btn').hidden = true;
            document.getElementById('about-sort').value = state.aboutSections.length > 0
                ? Math.max(...state.aboutSections.map(s => s.sort_order)) + 1
                : 1;
        }
        modal.hidden = false;
    }

    async function saveAboutSection() {
        const aboutId = document.getElementById('about-id').value;
        const title = document.getElementById('about-title').value.trim();
        const titleEn = document.getElementById('about-title-en').value.trim();
        const sortOrder = parseInt(document.getElementById('about-sort').value) || 0;

        const blocksContainer = document.getElementById('about-blocks-container');
        const blockItems = blocksContainer.querySelectorAll('.about-block-item');
        const blocks = [];

        blockItems.forEach(item => {
            blocks.push({
                subtitle: item.querySelector('.block-subtitle').value.trim(),
                subtitle_en: item.querySelector('.block-subtitle-en').value.trim(),
                content: item.querySelector('.block-content').value.trim(),
                content_en: item.querySelector('.block-content-en').value.trim()
            });
        });

        if (!title) {
            showToast('Заполните заголовок раздела');
            return;
        }

        const sectionData = {
            title,
            title_en: titleEn,
            blocks,
            sort_order: sortOrder
        };

        try {
            if (aboutId) {
                const { error } = await supabase
                    .from('about_sections')
                    .update(sectionData)
                    .eq('id', parseInt(aboutId));
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('about_sections')
                    .insert(sectionData);
                if (error) throw error;
            }
            closeModal('about-editor-modal');
            await loadAboutSections();
            showSaveIndicator();
        } catch (error) {
            console.error('Error saving about section:', error);
            showToast('Ошибка сохранения: ' + error.message);
        }
    }

    async function deleteAboutSection() {
        const aboutId = document.getElementById('about-id').value;
        if (!aboutId) return;
        if (!confirm('Удалить этот блок?')) return;
        try {
            const { error } = await supabase
                .from('about_sections')
                .delete()
                .eq('id', parseInt(aboutId));
            if (error) throw error;
            closeModal('about-editor-modal');
            await loadAboutSections();
            showSaveIndicator();
        } catch (error) {
            console.error('Error deleting about section:', error);
            showToast('Ошибка удаления: ' + error.message);
        }
    }

    // ===========================================
    // Moderation
    // ===========================================

    function updateModerationBadge() {
        const total = state.pendingReviews.length + state.pendingFanfics.length + state.pendingIllustrations.length;
        const badge = document.getElementById('moderation-badge');

        if (total > 0) {
            badge.textContent = total;
            badge.hidden = false;
        } else {
            badge.hidden = true;
        }

        document.getElementById('reviews-count').textContent = state.pendingReviews.length;
        document.getElementById('fanfics-count').textContent = state.pendingFanfics.length;
        document.getElementById('illustrations-count').textContent = state.pendingIllustrations.length;
    }

    function renderModeration(tab = 'reviews') {
        const container = document.getElementById('moderation-content');
        let items = [];

        switch (tab) {
            case 'reviews':
                items = state.pendingReviews;
                break;
            case 'fanfics':
                items = state.pendingFanfics;
                break;
            case 'illustrations':
                items = state.pendingIllustrations;
                break;
        }

        if (items.length === 0) {
            container.innerHTML = '<div class="empty-state">Все дела закрыты. Новых улик нет.</div>';
            return;
        }

        container.innerHTML = items.map(item => renderModerationItem(item, tab)).join('');

        // Add event listeners
        container.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', () => moderateItem(btn.dataset.id, btn.dataset.type, 'approved'));
        });

        container.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', () => moderateItem(btn.dataset.id, btn.dataset.type, 'rejected'));
        });
    }

    function renderModerationItem(item, type) {
        let content = '';

        switch (type) {
            case 'reviews':
                content = `
                    <div class="moderation-preview-header">
                        <span class="moderation-author">${escapeHtml(item.name)}</span>
                        <span class="moderation-date">${formatDate(item.created_at)}</span>
                    </div>
                    <div class="moderation-preview-content">
                        <p>${escapeHtml(item.text)}</p>
                    </div>
                `;
                break;
            case 'fanfics':
                content = `
                    <div class="moderation-preview-header">
                        <span class="moderation-author">${escapeHtml(item.name)}</span>
                        <span class="moderation-date">${formatDate(item.created_at)}</span>
                    </div>
                    <div class="moderation-preview-content">
                        <h4>${escapeHtml(item.title)}</h4>
                        <p><em>Персонаж: ${escapeHtml(item.character || 'Не указан')}</em></p>
                        <p>${escapeHtml(item.story).substring(0, 500)}${item.story.length > 500 ? '...' : ''}</p>
                    </div>
                `;
                break;
            case 'illustrations':
                content = `
                    <div class="moderation-preview-header">
                        <span class="moderation-author">${escapeHtml(item.name)}</span>
                        <span class="moderation-date">${formatDate(item.created_at)}</span>
                    </div>
                    <div class="moderation-preview-content">
                        <h4>${escapeHtml(item.title)}</h4>
                        <p>${escapeHtml(item.description || '')}</p>
                        ${item.file_url ? `<img src="${item.file_url}" alt="${escapeHtml(item.title)}" class="moderation-preview-image">` : ''}
                    </div>
                `;
                break;
        }

        return `
            <div class="moderation-item" data-id="${item.id}">
                <div class="moderation-preview">
                    ${content}
                </div>
                <div class="moderation-actions">
                    <button class="btn btn-approve" data-id="${item.id}" data-type="${type}">
                        ДА
                    </button>
                    <button class="btn btn-reject" data-id="${item.id}" data-type="${type}">
                        НЕТ
                    </button>
                </div>
            </div>
        `;
    }

    async function moderateItem(id, type, status) {
        const table = type === 'reviews' ? 'reviews' : type;

        try {
            const { error } = await supabase
                .from(table)
                .update({ status: status })
                .eq('id', parseInt(id));

            if (error) throw error;

            // Update local state
            switch (type) {
                case 'reviews':
                    state.pendingReviews = state.pendingReviews.filter(r => r.id !== parseInt(id));
                    break;
                case 'fanfics':
                    state.pendingFanfics = state.pendingFanfics.filter(f => f.id !== parseInt(id));
                    break;
                case 'illustrations':
                    state.pendingIllustrations = state.pendingIllustrations.filter(i => i.id !== parseInt(id));
                    break;
            }

            updateModerationBadge();
            renderModeration(type);
            showSaveIndicator();
        } catch (error) {
            console.error('Error moderating item:', error);
            showToast('Ошибка: ' + error.message);
        }
    }

    // ===========================================
    // Image Upload
    // ===========================================

    async function uploadImage(file, folder = 'admin') {
        if (!supabase) throw new Error('Supabase not configured');

        const ext = file.name.split('.').pop().toLowerCase();
        const path = `images/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .upload(path, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    async function handlePlaceImageUpload(e) {
        const files = e.target.files;
        if (!files.length) return;

        const placeId = document.getElementById('place-id').value;

        // If place not saved yet, show preview but don't upload
        if (!placeId) {
            const container = document.getElementById('place-images-gallery');
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewHtml = `
                        <div class="gallery-image" data-is-preview="true">
                            <img src="${e.target.result}" alt="Preview">
                            <span class="gallery-image-badge">Не сохранено</span>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', previewHtml);
                };
                reader.readAsDataURL(file);
            });
            showToast('Сначала сохраните место, затем загружайте изображения', 'warning');
            e.target.value = '';
            return;
        }

        try {
            let uploadedCount = 0;
            for (const file of files) {
                // Check file size (max 5MB for base64)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Изображение слишком большое. Максимум 5MB');
                    continue;
                }

                // Convert to base64 instead of uploading to Supabase
                const imageUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const { data, error } = await supabase
                    .from('place_images')
                    .insert({
                        place_id: parseInt(placeId),
                        image_url: imageUrl,
                        sort_order: state.placeImages.filter(img => img.place_id === parseInt(placeId)).length + uploadedCount
                    })
                    .select();

                if (error) throw error;

                if (data && data[0]) {
                    state.placeImages.push(data[0]);
                    uploadedCount++;
                }
            }

            const images = state.placeImages.filter(img => img.place_id === parseInt(placeId));
            renderPlaceImages(images);
            showToast(`Загружено изображений: ${uploadedCount}`, 'success');
        } catch (error) {
            console.error('Error uploading images:', error);
            showToast('Ошибка загрузки изображений: ' + error.message);
        }

        e.target.value = '';
    }

    function handleCharacterImagePreview(e) {
        const file = e.target.files[0];
        if (!file) return;

        const preview = document.getElementById('character-image-preview');
        const reader = new FileReader();

        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };

        reader.readAsDataURL(file);
    }

    // ===========================================
    // Modal Management
    // ===========================================

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.hidden = true;
        }
    }

    function setupModalCloseButtons() {
        // Close buttons with data-close attribute
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(btn.dataset.close);
            });
        });

        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.hidden = true;
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay:not([hidden])').forEach(modal => {
                    modal.hidden = true;
                });
            }
        });
    }

    // ===========================================
    // Event Listeners Setup
    // ===========================================

    function setupEventListeners() {
        // Login
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('toggle-password').addEventListener('click', togglePasswordVisibility);
        document.getElementById('logout-btn').addEventListener('click', handleLogout);

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => switchSection(item.dataset.section));
        });

        // Quizzes
        document.getElementById('add-quiz-btn').addEventListener('click', () => openQuizEditor());
        document.getElementById('add-question-btn').addEventListener('click', () => addQuestion());
        document.getElementById('save-quiz-btn').addEventListener('click', saveQuiz);
        document.getElementById('delete-quiz-btn').addEventListener('click', deleteQuiz);

        // Places
        document.getElementById('add-place-btn').addEventListener('click', () => openPlaceEditor());
        document.getElementById('save-place-btn').addEventListener('click', () => savePlace());
        document.getElementById('delete-place-btn').addEventListener('click', deletePlace);
        document.getElementById('place-image-upload').addEventListener('change', handlePlaceImageUpload);

        // Autosave for places
        const debouncedPlaceSave = debounce(() => savePlace(true), CONFIG.AUTOSAVE_DELAY);
        document.getElementById('place-form').addEventListener('input', debouncedPlaceSave);

        // Characters
        document.getElementById('add-character-btn').addEventListener('click', () => openCharacterEditor());
        document.getElementById('save-character-btn').addEventListener('click', saveCharacter);
        document.getElementById('delete-character-btn').addEventListener('click', deleteCharacter);
        document.getElementById('character-image-upload').addEventListener('change', handleCharacterImagePreview);

        // About
        document.getElementById('add-about-btn').addEventListener('click', () => openAboutEditor());
        document.getElementById('save-about-btn').addEventListener('click', saveAboutSection);
        document.getElementById('delete-about-btn').addEventListener('click', deleteAboutSection);

        // Moderation tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderModeration(btn.dataset.tab);
            });
        });

        // Modals
        setupModalCloseButtons();
    }

    // ===========================================
    // API Requests
    // ===========================================

    // API Request section removed for redesign.

    document.getElementById("add-about-block-btn").addEventListener("click", () => addAboutBlock());

    // ===========================================
    // Initialization
    // ===========================================

    function init() {
        setupConfirmDialog();
        setupEventListeners();

        if (!initSupabase()) {
            showToast('Ошибка подключения к базе данных');
        }

        checkAuth();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API (for debugging)
    return {
        getState: () => state,
        reload: loadAllData
    };
})();
