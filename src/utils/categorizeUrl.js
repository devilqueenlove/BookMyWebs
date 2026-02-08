/**
 * Categorizes a URL based on its content, title, and description
 * Uses comprehensive heuristic rules and keyword matching
 * 
 * @param {string} url - The URL to categorize
 * @param {string} title - The title of the bookmark
 * @param {string} description - The description of the bookmark
 * @param {object} metadata - Additional metadata (siteName, type, keywords)
 * @returns {string} - The suggested category
 */
export function categorizeUrl(url = '', title = '', description = '', metadata = {}) {
  // Convert inputs to lowercase for case-insensitive matching
  const urlLower = url.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const siteNameLower = (metadata.siteName || '').toLowerCase();
  const typeLower = (metadata.type || '').toLowerCase();
  const keywordsLower = (metadata.keywords || []).map(k => k.toLowerCase());

  // Combined text for keyword matching
  const combinedText = `${urlLower} ${titleLower} ${descLower} ${siteNameLower} ${typeLower} ${keywordsLower.join(' ')}`;

  // Domain extraction (for better matching)
  let domain = '';
  try {
    // Extract domain from URL
    if (urlLower.includes('://')) {
      domain = urlLower.split('://')[1].split('/')[0];
    } else {
      domain = urlLower.split('/')[0];
    }
    // Remove www. prefix if present
    domain = domain.replace(/^www\./, '');
  } catch (error) {
    console.log('Error extracting domain:', error);
  }

  // Define category matchers with keywords and domains
  const categories = [
    {
      name: 'AI',
      domains: [
        'openai.com', 'chat.openai.com', 'ai.google', 'anthropic.com', 'claude.ai',
        'midjourney.com', 'stability.ai', 'huggingface.co', 'jasper.ai', 'copy.ai',
        'runwayml.com', 'synthesia.io', 'descript.com', 'notion.ai', 'bard.google.com',
        'gemini.google.com', 'perplexity.ai', 'poe.com', 'character.ai', 'leonardo.ai'
      ],
      keywords: [
        'ai', 'artificial intelligence', 'gpt', 'llm', 'machine learning', 'neural network',
        'chatbot', 'generative', 'diffusion', 'transformer', 'deep learning', 'automation',
        'robot', 'bot', 'copilot', 'assistant', 'text-to-image', 'speech-to-text', 'nlp'
      ]
    },
    {
      name: 'Video',
      domains: [
        'youtube.com', 'vimeo.com', 'twitch.tv', 'netflix.com', 'hulu.com', 'dailymotion.com',
        'tiktok.com', 'vimeo.com', 'youtu.be', 'plex.tv', 'primevideo.com', 'hotstar.com',
        'hbomax.com', 'disney.com', 'disneyplus.com', 'ted.com', 'vevo.com', 'crunchyroll.com',
        'rumble.com', 'dailymotion.com', 'voot.com', 'sonyliv.com', 'zee5.com', 'mxplayer.in'
      ],
      keywords: [
        'video', 'watch', 'movie', 'stream', 'film', 'tv', 'episode', 'series',
        'show', 'cinema', 'trailer', 'documentary', 'animation', 'anime', 'webcam',
        'broadcast', 'streaming', 'livestream', 'live stream', 'youtube', 'youtu'
      ]
    },
    {
      name: 'Social',
      domains: [
        'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'pinterest.com',
        'reddit.com', 'tumblr.com', 'whatsapp.com', 'telegram.org', 'discord.com', 'snapchat.com',
        'tiktok.com', 'threads.net', 'mastodon.social', 'quora.com', 'nextdoor.com', 'meetup.com',
        'fb.com', 'messenger.com', 't.me', 'flickr.com', 'weibo.com', 'vk.com', 'line.me',
        'slack.com', 'teams.microsoft.com', 'skype.com', 'zoom.us', 'omegle.com', 'clubhouse.com'
      ],
      keywords: [
        'social', 'network', 'connect', 'friend', 'follow', 'share', 'post', 'profile',
        'timeline', 'feed', 'message', 'chat', 'comment', 'like', 'tweet', 'status',
        'community', 'group', 'forum', 'discussion', 'social media', 'networking'
      ]
    },
    {
      name: 'Code',
      domains: [
        'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'codepen.io',
        'replit.com', 'codesandbox.io', 'jsfiddle.net', 'npmjs.com', 'pypi.org', 'dev.to',
        'hashnode.com', 'digitalocean.com', 'heroku.com', 'vercel.com', 'netlify.com',
        'aws.amazon.com', 'azure.microsoft.com', 'cloud.google.com', 'firebase.google.com',
        'developer.mozilla.org', 'w3schools.com', 'freecodecamp.org', 'leetcode.com', 'hackerrank.com',
        'roadmap.sh', 'react.dev', 'angular.io', 'vuejs.org', 'tailwindcss.com', 'getbootstrap.com'
      ],
      keywords: [
        'code', 'programming', 'developer', 'development', 'software', 'web dev', 'coding',
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'typescript',
        'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'rust', 'go', 'c++', 'c#',
        'algorithm', 'data structure', 'api', 'repository', 'git', 'devops', 'frontend',
        'backend', 'fullstack', 'stack', 'framework', 'library', 'function', 'method', 'class'
      ]
    },
    {
      name: 'News',
      domains: [
        'cnn.com', 'bbc.com', 'nytimes.com', 'wsj.com', 'reuters.com', 'bloomberg.com',
        'apnews.com', 'washingtonpost.com', 'theguardian.com', 'economist.com', 'time.com',
        'forbes.com', 'aljazeera.com', 'foxnews.com', 'nbcnews.com', 'abcnews.go.com',
        'cnbc.com', 'news.google.com', 'news.yahoo.com', 'huffpost.com', 'medium.com',
        'thehindu.com', 'timesofindia.indiatimes.com', 'ndtv.com', 'hindustantimes.com',
        'indianexpress.com', 'zee.com', 'newyorker.com', 'wired.com', 'techcrunch.com',
        'engadget.com', 'theverge.com', 'arstechnica.com', 'gizmodo.com', 'slashdot.org'
      ],
      keywords: [
        'news', 'article', 'blog', 'breaking', 'latest', 'report', 'headline', 'journal',
        'press', 'media', 'newspaper', 'magazine', 'editorial', 'opinion', 'analysis',
        'politics', 'business', 'finance', 'economy', 'market', 'stock', 'world', 'international',
        'national', 'local', 'tech', 'science', 'health', 'sports', 'entertainment', 'culture'
      ]
    },
    {
      name: 'Shopping',
      domains: [
        'amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'etsy.com',
        'aliexpress.com', 'shopify.com', 'wayfair.com', 'newegg.com', 'homedepot.com',
        'ikea.com', 'macys.com', 'nordstrom.com', 'costco.com', 'samsclub.com', 'wish.com',
        'flipkart.com', 'myntra.com', 'ajio.com', 'meesho.com', 'nykaa.com', 'snapdeal.com',
        'olx.com', 'craigslist.org', 'paypal.com', 'affirm.com', 'klarna.com', 'stripe.com'
      ],
      keywords: [
        'shop', 'store', 'buy', 'price', 'deal', 'discount', 'sale', 'offer', 'product',
        'item', 'order', 'purchase', 'shopping', 'cart', 'checkout', 'delivery', 'shipping',
        'ecommerce', 'marketplace', 'retail', 'wholesale', 'merchant', 'vendor', 'supplier',
        'brand', 'customer', 'consumer', 'review', 'rating', 'compare', 'payment', 'transaction'
      ]
    },
    {
      name: 'Learning',
      domains: [
        'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'skillshare.com',
        'pluralsight.com', 'brilliant.org', 'duolingo.com', 'wikipedia.org', 'wikihow.com',
        'britannica.com', 'quizlet.com', 'chegg.com', 'scholar.google.com', 'jstor.org',
        'researchgate.net', 'academia.edu', 'gutenberg.org', 'ted.com', 'masterclass.com',
        'udacity.com', 'codecademy.com', 'lynda.com', 'linkedin.com/learning', 'futurelearn.com',
        'canvas.net', 'open.edu', 'mitopencourseware.org', 'class-central.com', 'memrise.com'
      ],
      keywords: [
        'learn', 'course', 'tutorial', 'education', 'reference', 'documentation', 'guide',
        'wiki', 'knowledge', 'encyclopedia', 'dictionary', 'study', 'teach', 'lecture',
        'lesson', 'academy', 'university', 'college', 'school', 'certificate', 'degree',
        'scholarship', 'research', 'paper', 'thesis', 'quiz', 'test', 'exam', 'assignment',
        'homework', 'project', 'exercise', 'practice', 'example', 'solution', 'answer'
      ]
    },
    {
      name: 'Finance',
      domains: [
        'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citi.com', 'capitalone.com',
        'usbank.com', 'discover.com', 'amex.com', 'paypal.com', 'venmo.com', 'robinhood.com',
        'fidelity.com', 'vanguard.com', 'schwab.com', 'tdameritrade.com', 'etrade.com',
        'coinbase.com', 'binance.com', 'kraken.com', 'blockchain.com', 'mint.com', 'ynab.com',
        'creditkarma.com', 'experian.com', 'equifax.com', 'transunion.com', 'irs.gov',
        'quickbooks.com', 'xero.com', 'wave.com', 'stripe.com', 'square.com', 'icicibank.com',
        'hdfcbank.com', 'sbi.co.in', 'axisbank.com', 'kotak.com'
      ],
      keywords: [
        'bank', 'finance', 'money', 'invest', 'investment', 'stock', 'market', 'trade',
        'trading', 'fund', 'crypto', 'bitcoin', 'cryptocurrency', 'wallet', 'payment',
        'transaction', 'loan', 'mortgage', 'credit', 'debit', 'card', 'insurance', 'tax',
        'budget', 'saving', 'retirement', 'financial', 'banking', 'account', 'statement',
        'invoice', 'billing', 'expense', 'income', 'revenue', 'profit', 'loss', 'dividend'
      ]
    },
    {
      name: 'Travel',
      domains: [
        'booking.com', 'expedia.com', 'tripadvisor.com', 'airbnb.com', 'hotels.com',
        'kayak.com', 'priceline.com', 'orbitz.com', 'travelocity.com', 'hotwire.com',
        'vrbo.com', 'hostelworld.com', 'southwest.com', 'delta.com', 'united.com',
        'aa.com', 'spirit.com', 'britishairways.com', 'emirates.com', 'lufthansa.com',
        'airfrance.com', 'makemytrip.com', 'goibibo.com', 'yatra.com', 'irctc.co.in',
        'redbus.in', 'ixigo.com', 'trainline.com', 'amtrak.com', 'greyhound.com',
        'maps.google.com', 'waze.com', 'flightradar24.com', 'seatguru.com', 'rome2rio.com'
      ],
      keywords: [
        'travel', 'trip', 'vacation', 'holiday', 'tour', 'flight', 'hotel', 'hostel',
        'accommodation', 'booking', 'reservation', 'resort', 'motel', 'destination',
        'itinerary', 'journey', 'tourism', 'tourist', 'guide', 'attraction', 'sightseeing',
        'adventure', 'cruise', 'beach', 'mountain', 'backpacking', 'camping', 'hiking',
        'trekking', 'passport', 'visa', 'airport', 'airline', 'train', 'bus', 'rental',
        'ticket', 'map', 'direction', 'navigation', 'landmark', 'excursion', 'activity'
      ]
    },
    {
      name: 'Health',
      domains: [
        'webmd.com', 'mayoclinic.org', 'nih.gov', 'cdc.gov', 'who.int', 'healthline.com',
        'verywellhealth.com', 'everydayhealth.com', 'medlineplus.gov', 'zocdoc.com',
        'practo.com', 'doximity.com', 'drugs.com', 'goodrx.com', 'fitbit.com', 'garmin.com',
        'myfitnesspal.com', 'strava.com', 'fitocracy.com', 'nike.com/training', 'headspace.com',
        'calm.com', 'sleepfoundation.org', 'healthgrades.com', 'fda.gov', 'weightwatchers.com',
        'noom.com', 'doctoroz.com', 'clevelandclinic.org', 'medicinenet.com', '1mg.com', 'pharmeasy.in'
      ],
      keywords: [
        'health', 'medical', 'doctor', 'hospital', 'clinic', 'physician', 'nurse', 'patient',
        'symptom', 'disease', 'condition', 'treatment', 'therapy', 'medicine', 'drug',
        'prescription', 'diagnosis', 'wellness', 'fitness', 'exercise', 'workout', 'diet',
        'nutrition', 'vitamin', 'supplement', 'weight', 'calories', 'mental health', 'anxiety',
        'depression', 'sleep', 'meditation', 'yoga', 'mindfulness', 'healthcare', 'insurance',
        'appointment', 'checkup', 'vaccine', 'immunization', 'surgery', 'emergency', 'first aid'
      ]
    },
    {
      name: 'Entertainment',
      domains: [
        'imdb.com', 'rottentomatoes.com', 'metacritic.com', 'spotify.com', 'apple.com/music',
        'pandora.com', 'tidal.com', 'soundcloud.com', 'bandcamp.com', 'last.fm', 'genius.com',
        'ticketmaster.com', 'livenation.com', 'stubhub.com', 'ign.com', 'gamespot.com',
        'kotaku.com', 'polygon.com', 'steam.com', 'epicgames.com', 'ea.com', 'ubisoft.com',
        'playstation.com', 'xbox.com', 'nintendo.com', 'wizards.com', 'boardgamegeek.com',
        'comicbookmovie.com', 'marvel.com', 'dc.com', 'fandom.com', 'tvguide.com', 'tvtropes.org'
      ],
      keywords: [
        'entertainment', 'amusement', 'fun', 'leisure', 'recreation', 'hobby', 'pastime',
        'movie', 'film', 'cinema', 'show', 'series', 'tv', 'television', 'stream', 'watch',
        'music', 'song', 'album', 'artist', 'band', 'concert', 'festival', 'performance',
        'game', 'gaming', 'play', 'player', 'console', 'esports', 'tournament', 'competition',
        'comic', 'book', 'novel', 'fiction', 'fantasy', 'scifi', 'superhero', 'character',
        'actor', 'actress', 'celebrity', 'star', 'director', 'producer', 'theater', 'theatre',
        'ticket', 'event', 'live', 'stream', 'podcast', 'radio', 'channel', 'network', 'review'
      ]
    },
    {
      name: 'Productivity',
      domains: [
        'office.com', 'microsoft.com', 'google.com/docs', 'docs.google.com', 'sheets.google.com',
        'slides.google.com', 'drive.google.com', 'calendar.google.com', 'onedrive.live.com',
        'dropbox.com', 'box.com', 'icloud.com', 'evernote.com', 'notion.so', 'onenote.com',
        'trello.com', 'asana.com', 'monday.com', 'clickup.com', 'todoist.com', 'any.do',
        'ticktick.com', 'pomofocus.io', 'toggl.com', 'clockify.me', 'lastpass.com',
        '1password.com', 'bitwarden.com', 'canva.com', 'adobe.com', 'photoshop.com',
        'illustrator.com', 'figma.com', 'sketch.com', 'grammarly.com', 'hellosign.com'
      ],
      keywords: [
        'productivity', 'efficiency', 'organization', 'management', 'planner', 'schedule',
        'task', 'todo', 'to-do', 'workflow', 'project', 'document', 'spreadsheet', 'presentation',
        'note', 'notetaking', 'memo', 'reminder', 'meeting', 'conference', 'calendar', 'agenda',
        'email', 'mail', 'message', 'communication', 'collaboration', 'team', 'work', 'office',
        'business', 'corporate', 'professional', 'manager', 'employee', 'time', 'tracking',
        'password', 'security', 'storage', 'cloud', 'backup', 'sync', 'template', 'form', 'survey'
      ]
    }
  ];

  // Score each category based on domain and keyword matches
  const scores = {};

  // Initialize scores
  categories.forEach(category => {
    scores[category.name] = 0;
  });

  // Check domain matches (highest priority)
  categories.forEach(category => {
    if (category.domains.some(d => domain.includes(d))) {
      scores[category.name] += 10; // Domain matches are strong indicators
    }
  });

  // Check keyword matches in URL, title, and description
  categories.forEach(category => {
    category.keywords.forEach(keyword => {
      // Check URL (medium priority)
      if (urlLower.includes(keyword)) {
        scores[category.name] += 3;
      }

      // Check title (high priority)
      if (titleLower.includes(keyword)) {
        scores[category.name] += 5;
      }

      // Check description (low priority)
      if (descLower.includes(keyword)) {
        scores[category.name] += 2;
      }

      // Check site name (high priority)
      if (siteNameLower.includes(keyword)) {
        scores[category.name] += 5;
      }

      // Check keywords from meta tags (high priority)
      if (keywordsLower.some(k => k.includes(keyword))) {
        scores[category.name] += 4;
      }
    });

    // Bonus for specific types
    if (metadata.type) {
      if (category.name === 'Video' && (metadata.type.includes('video') || metadata.type === 'movie' || metadata.type === 'tv_show')) {
        scores[category.name] += 15;
      }
      if (category.name === 'News' && (metadata.type === 'article')) {
        scores[category.name] += 5;
      }
      if (category.name === 'Social' && (metadata.type === 'profile')) {
        scores[category.name] += 10;
      }
    }
  });

  // Find the highest scoring category
  let highestScore = 0;
  let bestCategory = 'Uncategorized';

  Object.entries(scores).forEach(([category, score]) => {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  });

  return highestScore >= 2 ? bestCategory : 'Uncategorized';
}
