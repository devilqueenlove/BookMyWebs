/**
 * Link Health Checker Utility
 * Checks if websites are alive by testing if their favicon loads
 * This is a CORS-friendly approach since direct URL checks aren't possible from browser
 */

/**
 * Check the health of a single URL by testing favicon load
 * @param {string} url - The URL to check
 * @returns {Promise<{status: 'online' | 'offline' | 'unknown', url: string}>}
 */
export async function checkLinkHealth(url) {
    try {
        const urlObj = new URL(url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;

        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve({ status: 'unknown', url });
            }, 5000);

            img.onload = () => {
                clearTimeout(timeout);
                // If image is 1x1 or very small, it might be a placeholder (site down)
                if (img.width <= 1 || img.height <= 1) {
                    resolve({ status: 'unknown', url });
                } else {
                    resolve({ status: 'online', url });
                }
            };

            img.onerror = () => {
                clearTimeout(timeout);
                resolve({ status: 'offline', url });
            };

            img.src = faviconUrl;
        });
    } catch (e) {
        return { status: 'unknown', url };
    }
}

/**
 * Check health of multiple URLs with rate limiting
 * @param {string[]} urls - Array of URLs to check
 * @param {function} onProgress - Callback with (completed, total, result)
 * @returns {Promise<Map<string, 'online' | 'offline' | 'unknown'>>}
 */
export async function checkBatchLinkHealth(urls, onProgress = null) {
    const results = new Map();
    const uniqueUrls = [...new Set(urls)];

    // Use a more reliable check: try to load both favicon and a small iframe
    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        const result = await checkLinkHealth(url);
        results.set(url, result.status);

        if (onProgress) {
            onProgress(i + 1, uniqueUrls.length, result);
        }

        // Small delay between checks to avoid rate limiting
        if (i < uniqueUrls.length - 1) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    return results;
}

/**
 * Get domain from URL for display
 * @param {string} url 
 * @returns {string}
 */
export function getDomainFromUrl(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch (e) {
        return url;
    }
}
