const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Fetches OpenGraph metadata from a given URL.
 * Responds with JSON containing title, description, image, site_name, type, and keywords.
 */
exports.getMetadata = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        // 1. Validate Input
        const targetUrl = req.query.url || req.body.url;
        if (!targetUrl) {
            return res.status(400).json({ error: 'Missing URL parameter' });
        }

        try {
            // 2. Fetch HTML
            // User-Agent spoofing to avoid being blocked by some sites
            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                timeout: 10000 // 10s timeout
            });

            const html = response.data;
            const $ = cheerio.load(html);

            // 3. Extract Metadata
            const getMeta = (prop, name) => {
                return $(`meta[property="${prop}"]`).attr('content') ||
                    $(`meta[name="${name}"]`).attr('content') ||
                    $(`meta[name="${prop}"]`).attr('content') ||
                    null;
            };

            const title = getMeta('og:title', 'twitter:title') || $('title').text() || '';
            const description = getMeta('og:description', 'twitter:description') || $('meta[name="description"]').attr('content') || '';
            const image = getMeta('og:image', 'twitter:image') || $('link[rel="image_src"]').attr('href') || '';
            const siteName = getMeta('og:site_name', 'application-name') || '';
            const type = getMeta('og:type', 'og:type') || '';
            const keywords = $('meta[name="keywords"]').attr('content') || '';

            // Favicon attempt
            let favicon = $('link[rel="icon"]').attr('href') ||
                $('link[rel="shortcut icon"]').attr('href') ||
                '/favicon.ico';

            // Resolve relative URLs for image/favicon
            const resolveUrl = (baseUrl, relativeUrl) => {
                if (!relativeUrl) return '';
                try {
                    return new URL(relativeUrl, baseUrl).href;
                } catch (e) {
                    return relativeUrl;
                }
            };

            // 4. Construct Response
            const metadata = {
                title: title.trim(),
                description: description.trim(),
                image: resolveUrl(targetUrl, image),
                siteName: siteName.trim(),
                type: type.trim(),
                keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
                url: targetUrl,
                favicon: resolveUrl(targetUrl, favicon)
            };

            // 5. Send Response
            return res.status(200).json(metadata);

        } catch (error) {
            console.error('Error fetching metadata:', error.message);
            return res.status(500).json({
                error: 'Failed to fetch metadata',
                details: error.message
            });
        }
    });
});
