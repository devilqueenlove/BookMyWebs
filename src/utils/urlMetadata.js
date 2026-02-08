/**
 * Fetches metadata (title, description, image, siteName, type, keywords) from a URL using a CORS proxy
 * @param {string} url - The URL to fetch metadata from
 * @returns {Promise<{title: string, description: string, image: string, siteName: string, type: string, keywords: string[]}>} - The metadata
 */
export async function fetchUrlMetadata(url) {
  // Ensure URL has a protocol
  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    normalizedUrl = 'https://' + url;
  }

  // Try Cloud Function first (requires local emulator or deployed function)
  // Default emulator project ID is usually 'demo-project' or the actual project ID
  const CLOUD_FUNCTION_URL = 'http://127.0.0.1:5001/bookmywebs/us-central1/getMetadata';

  try {
    // Set a short timeout for the cloud function to avoid long waits if not running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${CLOUD_FUNCTION_URL}?url=${encodeURIComponent(normalizedUrl)}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('Fetched metadata via Cloud Function');
      return {
        title: data.title || extractTitleFromUrl(normalizedUrl),
        description: data.description || '',
        image: data.image || '',
        siteName: data.siteName || '',
        type: data.type || '',
        keywords: data.keywords || []
      };
    }
  } catch (err) {
    // Silently fail to fallback
    // console.log('Cloud function unavailable, using fallback:', err.message);
  }

  try {
    // Fallback: Use allorigins.win as a CORS proxy to fetch the page content
    const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;
    const response = await fetch(corsProxyUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const data = await response.json();
    const html = data.contents;

    // Create a DOM parser to extract metadata
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Try to get title from various sources
    let title = doc.querySelector('title')?.textContent || '';

    // If no title found, try Open Graph title
    if (!title) {
      title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    }

    // If still no title, try Twitter title
    if (!title) {
      title = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
    }

    // Try to get description from various sources
    let description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // If no description found, try Open Graph description
    if (!description) {
      description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    }

    // If still no description, try Twitter description
    if (!description) {
      description = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
    }

    // Get Open Graph Image
    let image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    if (!image) {
      image = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';
    }

    // Get Site Name
    const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';

    // Get Type
    const type = doc.querySelector('meta[property="og:type"]')?.getAttribute('content') || '';

    // Get Keywords
    let keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    // Parse keywords into array
    const keywordsArray = keywords ? keywords.split(',').map(k => k.trim()) : [];

    return {
      title,
      description,
      image,
      siteName,
      type,
      keywords: keywordsArray
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // Fallback to extracting title from URL
    return {
      title: extractTitleFromUrl(normalizedUrl),
      description: '',
      image: '',
      siteName: '',
      type: '',
      keywords: []
    };
  }
}

/**
 * Extracts a title from a URL by cleaning and formatting the domain and path
 * @param {string} url - The URL to extract a title from
 * @returns {string} - The extracted title
 */
export function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);

    // Remove 'www.' from hostname if present
    let hostname = urlObj.hostname.replace(/^www\./, '');

    // Get the pathname without trailing slash
    let pathname = urlObj.pathname.replace(/\/$/, '');

    // If pathname has segments, use the last segment
    let lastSegment = '';
    if (pathname && pathname !== '/') {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        lastSegment = segments[segments.length - 1];

        // Clean up the last segment
        lastSegment = lastSegment
          .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
          .replace(/\.[^/.]+$/, '') // Remove file extension
          .replace(/\d+$/, ''); // Remove trailing numbers

        // Capitalize words
        lastSegment = lastSegment
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    // If we have a meaningful last segment, use it with the domain
    if (lastSegment && lastSegment.length > 3) {
      return `${lastSegment} | ${hostname}`;
    }

    // Otherwise just use the domain name, with first letter capitalized
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch (error) {
    console.error('Error extracting title from URL:', error);
    // If all else fails, return the raw URL
    return url;
  }
}
