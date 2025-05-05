document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли на странице атрибут data-page
    if (document.body.hasAttribute('data-page')) {
        // Добавляем админ-компоненты в DOM
        injectAdminComponents();
        loadAndApplySeoMetadata();

        // Инициализируем админ-функциональность
        initAdminFunctionality();
    }
});

function loadAndApplySeoMetadata() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://127.0.0.1:8001';
    }
    else {
        apiUrl = window.location.origin;
    }
    const currentPage = document.body.getAttribute('data-page') || 'Home';

    // Загружаем SEO-данные для текущей страницы
    fetch(`${apiUrl}/api/seo/${encodeURIComponent(currentPage)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            // Если данных нет, просто игнорируем
            console.log('No SEO data found for this page');
            return null;
        }
    })
    .then(data => {
        // Если есть данные, обновляем метатеги
        if (data) {
            updateDocumentMetadata(data);
        }
    })
    .catch(error => {
        console.error('Error loading SEO metadata:', error);
    });
}

// Функция для добавления HTML-элементов админ-панели в DOM
function injectAdminComponents() {
    // Создаем элемент админ-панели
    const adminToolbar = document.createElement('div');
    adminToolbar.id = 'admin-toolbar';
    adminToolbar.className = 'admin-toolbar d-none';
    adminToolbar.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="admin-welcome">Welcome, <span id="admin-name">Admin</span></span>
                </div>
                <div class="admin-actions">
                    <button id="seo-button" class="toolbar-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0z"/>
                        </svg>
                        SEO Settings
                    </button>
                    <button id="logout-button" class="toolbar-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                            <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    `;

    // Создаем модальное окно SEO
    const seoModal = document.createElement('div');
    seoModal.id = 'seo-modal';
    seoModal.className = 'modal-overlay d-none';
    seoModal.innerHTML = `
        <div class="seo-modal-content">
            <div class="modal-header">
                <h2>SEO Settings - <span id="seo-page-title">Home</span></h2>
                <button id="close-seo-modal" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="seo-form">
                    <div class="row">
                        <div class="col-12 mb-4">
                            <h3>Basic SEO</h3>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="meta_title">Meta Title</label>
                            <input type="text" id="meta_title" name="meta_title" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="canonical_url">Canonical URL</label>
                            <input type="text" id="canonical_url" name="canonical_url" class="form-control">
                        </div>
                        <div class="col-12 mb-3">
                            <label for="meta_description">Meta Description</label>
                            <textarea id="meta_description" name="meta_description" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="meta_keywords">Meta Keywords</label>
                            <input type="text" id="meta_keywords" name="meta_keywords" class="form-control">
                            <small class="text-muted">Separate keywords with commas</small>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="robots_tag">Robots Tag</label>
                            <input type="text" id="robots_tag" name="robots_tag" class="form-control" value="index, follow">
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="form-check mt-4">
                                <input class="form-check-input" type="checkbox" id="is_indexed" name="is_indexed" checked>
                                <label class="form-check-label" for="is_indexed">
                                    Allow indexing
                                </label>
                            </div>
                        </div>
                        
                        <div class="col-12 mt-4 mb-4">
                            <h3>Open Graph</h3>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="og_title">OG Title</label>
                            <input type="text" id="og_title" name="og_title" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="og_type">OG Type</label>
                            <input type="text" id="og_type" name="og_type" class="form-control" value="website">
                        </div>
                        <div class="col-12 mb-3">
                            <label for="og_description">OG Description</label>
                            <textarea id="og_description" name="og_description" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="og_image">OG Image URL</label>
                            <input type="text" id="og_image" name="og_image" class="form-control">
                        </div>
                        
                        <div class="col-12 mt-4 mb-4">
                            <h3>Twitter Card</h3>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="twitter_card">Twitter Card Type</label>
                            <select id="twitter_card" name="twitter_card" class="form-select">
                                <option value="summary">Summary</option>
                                <option value="summary_large_image">Summary with Large Image</option>
                                <option value="app">App</option>
                                <option value="player">Player</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="twitter_title">Twitter Title</label>
                            <input type="text" id="twitter_title" name="twitter_title" class="form-control">
                        </div>
                        <div class="col-12 mb-3">
                            <label for="twitter_description">Twitter Description</label>
                            <textarea id="twitter_description" name="twitter_description" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="twitter_image">Twitter Image URL</label>
                            <input type="text" id="twitter_image" name="twitter_image" class="form-control">
                        </div>
                        
                        <div class="col-12 mt-4 mb-4">
                            <h3>Schema Markup</h3>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="schema_markup">JSON-LD Schema</label>
                            <textarea id="schema_markup" name="schema_markup" class="form-control" rows="5"></textarea>
                            <small class="text-muted">Enter valid JSON-LD schema markup</small>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button id="save-seo" class="btn btn-primary">Save Changes</button>
                <button id="cancel-seo" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    `;

    // Добавляем элементы в DOM
    document.body.insertBefore(adminToolbar, document.body.firstChild);
    document.body.appendChild(seoModal);

    // Добавляем CSS стили
    addAdminStyles();
}

// Функция для добавления CSS-стилей админ-компонентов
function addAdminStyles() {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        /* Admin Toolbar Styles */
        .admin-toolbar {
            background-color: #23282d;
            color: #fff;
            padding: 8px 0;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
        }

        .admin-welcome {
            font-size: 14px;
        }

        .admin-actions {
            display: flex;
            gap: 10px;
        }

        .toolbar-btn {
            background-color: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background-color 0.2s;
        }

        .toolbar-btn:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }

        /* SEO Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .seo-modal-content {
            background-color: #fff;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #009dc9;
            color: white;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 500;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: white;
        }

        .modal-body {
            padding: 20px;
            overflow-y: auto;
        }

        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #e5e5e5;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        /* Adjust the main content when admin toolbar is visible */
        body.admin-mode {
            padding-top: 40px; /* Height of the admin toolbar */
        }

        /* Make the body fixed when modal is open to prevent scrolling */
        body.modal-open {
            overflow: hidden;
        }
    `;

    document.head.appendChild(styleElement);
}

// Функция для инициализации логики админ-функциональности
function initAdminFunctionality() {
    const token = localStorage.getItem('token');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://127.0.0.1:8001';
    }
    else {
        apiUrl = window.location.origin;
    }
    const currentPage = document.body.getAttribute('data-page') || 'Home';

    if (token) {
        // Проверяем валидность токена
        fetch(`${apiUrl}/api/admin/me`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.ok ? response.json() : Promise.reject('Invalid token'))
        .then(data => {
            // Показываем админ-панель
            const adminToolbar = document.getElementById('admin-toolbar');
            adminToolbar.classList.remove('d-none');
            document.body.classList.add('admin-mode');

            // Устанавливаем имя админа
            document.getElementById('admin-name').textContent = data.username;

            // Настраиваем обработчики событий для админ-панели
            setupAdminEventHandlers(token, apiUrl, currentPage);
        })
        .catch(error => {
            console.error('Error verifying token:', error);
            localStorage.removeItem('token');
        });
    }
}

// Настройка обработчиков событий для админ-панели
function setupAdminEventHandlers(token, apiUrl, currentPage) {
    const seoButton = document.getElementById('seo-button');
    const logoutButton = document.getElementById('logout-button');
    const seoModal = document.getElementById('seo-modal');
    const closeSeoModal = document.getElementById('close-seo-modal');
    const cancelSeo = document.getElementById('cancel-seo');
    const saveSeo = document.getElementById('save-seo');

    // Устанавливаем название текущей страницы в модальном окне
    document.getElementById('seo-page-title').textContent = currentPage;

    // Обработчик кнопки SEO
    seoButton.addEventListener('click', function() {
        // Загружаем текущие SEO-данные
        loadSeoData(token, apiUrl, currentPage);

        // Показываем модальное окно
        seoModal.classList.remove('d-none');
        document.body.classList.add('modal-open');
    });

    // Обработчики закрытия модального окна
    closeSeoModal.addEventListener('click', closeSeoModalFunc);
    cancelSeo.addEventListener('click', closeSeoModalFunc);

    function closeSeoModalFunc() {
        seoModal.classList.add('d-none');
        document.body.classList.remove('modal-open');
    }

    // Обработчик сохранения SEO-данных
    saveSeo.addEventListener('click', function() {
        saveSeoData(token, apiUrl, currentPage);
    });

    // Обработчик кнопки выхода
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.reload();
    });
}

// Загрузка SEO-данных с сервера
function loadSeoData(token, apiUrl, pageTitle) {
    fetch(`${apiUrl}/api/seo/${encodeURIComponent(pageTitle)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            // Если данных еще нет, возвращаем пустой объект
            console.log('No SEO data found for this page');
            return {};
        }
    })
    .then(data => {
        // Заполняем форму данными
        const form = document.getElementById('seo-form');

        // Обрабатываем каждое поле
        for (const field in data) {
            const element = document.getElementById(field);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[field];
                } else {
                    element.value = data[field] || '';
                }
            }
        }
    })
    .catch(error => {
        console.error('Error loading SEO data:', error);
    });
}

// Сохранение SEO-данных на сервере
function saveSeoData(token, apiUrl, pageTitle) {
    const form = document.getElementById('seo-form');
    const formData = {};

    // Получаем данные из полей формы
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.name) {
            if (element.type === 'checkbox') {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    }

    // Отправляем данные на сервер
    fetch(`${apiUrl}/api/seo/${encodeURIComponent(pageTitle)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to save SEO data');
        }
    })
    .then(data => {
        alert('SEO data saved successfully');

        // Закрываем модальное окно
        document.getElementById('seo-modal').classList.add('d-none');
        document.body.classList.remove('modal-open');

        // Обновляем метатеги на странице
        updateDocumentMetadata(data);
    })
    .catch(error => {
        console.error('Error saving SEO data:', error);
        alert('Error saving SEO data. Please try again.');
    });
}

// Обновление метатегов на странице
function updateDocumentMetadata(seoData) {
    // Обновляем заголовок
    if (seoData.meta_title) {
        document.title = seoData.meta_title;
    }

    // Обновляем мета-описание
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seoData.meta_description || '');

    // Обновляем ключевые слова
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seoData.meta_keywords || '');

    // Обновляем robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', seoData.is_indexed ? seoData.robots_tag : 'noindex, nofollow');

    // Обновляем canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }

    if (seoData.canonical_url) {
        linkCanonical.setAttribute('href', seoData.canonical_url);
    }

    // Обновляем Open Graph метатеги
    updateOpenGraphTags(seoData);

    // Обновляем Twitter Card метатеги
    updateTwitterCardTags(seoData);

    // Обновляем Schema разметку
    updateSchemaMarkup(seoData);
}

// Обновление Open Graph метатегов
function updateOpenGraphTags(seoData) {
    // OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', seoData.og_title || seoData.meta_title || '');

    // OG Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', seoData.og_description || seoData.meta_description || '');

    // OG Image
    if (seoData.og_image) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.setAttribute('property', 'og:image');
            document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', seoData.og_image);
    }

    // OG Type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
        ogType = document.createElement('meta');
        ogType.setAttribute('property', 'og:type');
        document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', seoData.og_type || 'website');
}

// Обновление Twitter Card метатегов
function updateTwitterCardTags(seoData) {
    // Twitter Card
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
        twitterCard = document.createElement('meta');
        twitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', seoData.twitter_card || 'summary');

    // Twitter Title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute('content', seoData.twitter_title || seoData.og_title || seoData.meta_title || '');

    // Twitter Description
    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
    }
    twitterDescription.setAttribute('content', seoData.twitter_description || seoData.og_description || seoData.meta_description || '');

    // Twitter Image
    if (seoData.twitter_image || seoData.og_image) {
        let twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (!twitterImage) {
            twitterImage = document.createElement('meta');
            twitterImage.setAttribute('name', 'twitter:image');
            document.head.appendChild(twitterImage);
        }
        twitterImage.setAttribute('content', seoData.twitter_image || seoData.og_image);
    }
}

// Обновление Schema разметки
function updateSchemaMarkup(seoData) {
    if (seoData.schema_markup) {
        // Удаляем существующую schema разметку
        const existingSchema = document.querySelector('script[type="application/ld+json"]');
        if (existingSchema) {
            existingSchema.remove();
        }

        // Добавляем новую schema разметку
        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.textContent = seoData.schema_markup;
        document.head.appendChild(schemaScript);
    }
}