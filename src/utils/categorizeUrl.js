/**
 * Categorizes a URL based on its content, title, and description
 * Uses simple heuristic rules and keyword matching
 * 
 * @param {string} url - The URL to categorize
 * @param {string} title - The title of the bookmark
 * @param {string} description - The description of the bookmark
 * @returns {string} - The suggested category
 */
export function categorizeUrl(url = '', title = '', description = '') {
  // Convert inputs to lowercase for case-insensitive matching
  const urlLower = url.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  
  // Combined text for keyword matching
  const combinedText = `${urlLower} ${titleLower} ${descLower}`;
  
  // Video platforms
  if (
    combinedText.includes('youtube.com') ||
    combinedText.includes('vimeo.com') ||
    combinedText.includes('twitch.tv') ||
    combinedText.includes('netflix.com') ||
    combinedText.includes('watch') ||
    combinedText.includes('video') ||
    combinedText.includes('stream')
  ) {
    return 'Video';
  }
  
  // Social media
  if (
    combinedText.includes('twitter.com') ||
    combinedText.includes('facebook.com') ||
    combinedText.includes('instagram.com') ||
    combinedText.includes('linkedin.com') ||
    combinedText.includes('reddit.com') ||
    combinedText.includes('social')
  ) {
    return 'Social';
  }
  
  // Programming and development
  if (
    combinedText.includes('github.com') ||
    combinedText.includes('stackoverflow.com') ||
    combinedText.includes('code') ||
    combinedText.includes('programming') ||
    combinedText.includes('developer') ||
    combinedText.includes('javascript') ||
    combinedText.includes('python') ||
    combinedText.includes('java') ||
    combinedText.includes('react')
  ) {
    return 'Code';
  }
  
  // News and articles
  if (
    combinedText.includes('news') ||
    combinedText.includes('article') ||
    combinedText.includes('blog') ||
    combinedText.includes('medium.com') ||
    combinedText.includes('nytimes.com') ||
    combinedText.includes('bbc.com') ||
    combinedText.includes('cnn.com')
  ) {
    return 'News';
  }
  
  // Shopping
  if (
    combinedText.includes('amazon.com') ||
    combinedText.includes('ebay.com') ||
    combinedText.includes('etsy.com') ||
    combinedText.includes('shop') ||
    combinedText.includes('store') ||
    combinedText.includes('buy') ||
    combinedText.includes('price')
  ) {
    return 'Shopping';
  }
  
  // Reference and learning
  if (
    combinedText.includes('wiki') ||
    combinedText.includes('learn') ||
    combinedText.includes('course') ||
    combinedText.includes('tutorial') ||
    combinedText.includes('education') ||
    combinedText.includes('reference') ||
    combinedText.includes('documentation')
  ) {
    return 'Learning';
  }
  
  // Return uncategorized if no match found
  return 'Uncategorized';
}
