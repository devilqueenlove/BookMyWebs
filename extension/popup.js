// BookMyWebs Chrome Extension - Popup Script
// Fetches auth from the BookMyWebs website using chrome.scripting

const FIREBASE_PROJECT_ID = 'bookmark-manager-285ab';
const FIREBASE_API_KEY = 'AIzaSyDG-K4qCzPKde3BG__x0sqy0Xs6UfYWg4w';

// DOM Elements
const loading = document.getElementById('loading');
const loginPrompt = document.getElementById('login-prompt');
const mainForm = document.getElementById('main-form');
const userEmail = document.getElementById('user-email');
const titleInput = document.getElementById('title');
const urlInput = document.getElementById('url');
const categorySelect = document.getElementById('category');
const saveBtn = document.getElementById('save-btn');
const saveText = document.getElementById('save-text');
const saveSpinner = document.getElementById('save-spinner');
const statusMessage = document.getElementById('status-message');

let currentUser = null;
let idToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // First check chrome.storage.local for cached auth
    const stored = await chrome.storage.local.get(['user', 'idToken', 'authTimestamp']);

    // If we have cached auth that's less than 55 minutes old (tokens expire after 1 hour)
    const tokenAge = Date.now() - (stored.authTimestamp || 0);
    if (stored.user && stored.idToken && tokenAge < 55 * 60 * 1000) {
        currentUser = stored.user;
        idToken = stored.idToken;
        await showMainForm();
        return;
    }

    // Try to fetch fresh auth from BookMyWebs website
    await tryFetchAuth();
});

// Try to fetch auth from any open BookMyWebs tab
async function tryFetchAuth() {
    try {
        // Find a BookMyWebs tab
        const tabs = await chrome.tabs.query({ url: ['http://localhost:*/*', 'http://127.0.0.1:*/*'] });

        if (tabs.length === 0) {
            // No BookMyWebs tab open
            showLoginPrompt();
            return;
        }

        // Execute script to get auth from localStorage
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                return localStorage.getItem('bmw_ext_auth');
            }
        });

        if (results && results[0] && results[0].result) {
            const authData = JSON.parse(results[0].result);

            if (authData && authData.user && authData.idToken) {
                // Cache the auth
                await chrome.storage.local.set({
                    user: authData.user,
                    idToken: authData.idToken,
                    authTimestamp: Date.now()
                });

                currentUser = authData.user;
                idToken = authData.idToken;
                await showMainForm();
                return;
            }
        }

        showLoginPrompt();
    } catch (error) {
        console.error('Error fetching auth:', error);
        showLoginPrompt();
    }
}

// Show Login Prompt
function showLoginPrompt() {
    loading.classList.add('hidden');
    loginPrompt.classList.remove('hidden');
    mainForm.classList.add('hidden');
}

// Show Main Form
async function showMainForm() {
    loading.classList.add('hidden');
    loginPrompt.classList.add('hidden');
    mainForm.classList.remove('hidden');

    userEmail.textContent = currentUser.email || 'User';

    // Get current tab info
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            titleInput.value = tab.title || '';
            urlInput.value = tab.url || '';
        }
    } catch (error) {
        console.error('Error getting tab info:', error);
    }

    // Load categories
    await loadCategories();
}

// Load Categories from Firestore REST API
async function loadCategories() {
    if (!currentUser || !idToken) return;

    try {
        // Use structured query to filter by userId
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

        const queryBody = {
            structuredQuery: {
                from: [{ collectionId: 'categories' }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: 'userId' },
                        op: 'EQUAL',
                        value: { stringValue: currentUser.uid }
                    }
                },
                limit: 1
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryBody)
        });

        if (!response.ok) {
            console.error('Failed to fetch categories:', response.status);
            return;
        }

        const data = await response.json();
        console.log('Categories response:', data);

        // Parse the query response
        if (data && data.length > 0 && data[0].document) {
            const fields = data[0].document.fields;
            const categories = fields.categories?.arrayValue?.values || [];

            categorySelect.innerHTML = '<option value="Uncategorized">Uncategorized</option>';

            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.stringValue;
                option.textContent = cat.stringValue;
                categorySelect.appendChild(option);
            });

            console.log('Loaded', categories.length, 'categories');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Save Bookmark
saveBtn.addEventListener('click', async () => {
    if (!currentUser || !idToken) {
        showStatus('Not authenticated', 'error');
        return;
    }

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const category = categorySelect.value;

    if (!title || !url) {
        showStatus('Title and URL are required.', 'error');
        return;
    }

    saveText.classList.add('hidden');
    saveSpinner.classList.remove('hidden');
    saveBtn.disabled = true;

    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/bookmarks?key=${FIREBASE_API_KEY}`;

        const bookmark = {
            fields: {
                title: { stringValue: title },
                url: { stringValue: url },
                category: { stringValue: category },
                userId: { stringValue: currentUser.uid },
                dateAdded: { stringValue: new Date().toISOString() },
                order: { integerValue: Date.now().toString() }
            }
        };

        const response = await fetch(firestoreUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookmark)
        });

        if (!response.ok) {
            throw new Error('Failed to save bookmark');
        }

        showStatus('Bookmark saved!', 'success');
        setTimeout(() => window.close(), 1500);

    } catch (error) {
        console.error('Error saving bookmark:', error);
        showStatus('Failed to save. Try again.', 'error');
    } finally {
        saveText.classList.remove('hidden');
        saveSpinner.classList.add('hidden');
        saveBtn.disabled = false;
    }
});

// Show Status Message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.classList.remove('hidden');

    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}
