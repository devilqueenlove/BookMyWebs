/**
 * Converts bookmarks to HTML format (Netscape Bookmark File Format)
 * This is the standard format used by most browsers
 */
export function convertToHTML(bookmarks, categories) {
    const date = new Date().getTime();
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
  <!-- This is an automatically generated file.
       It will be read and overwritten.
       DO NOT EDIT! -->
  <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
  <TITLE>Bookmarks</TITLE>
  <H1>Bookmarks</H1>
  <DL><p>
      <DT><H3 ADD_DATE="${date}" LAST_MODIFIED="${date}">SaveMyWebs Bookmarks</H3>
      <DL><p>`;
  
    // Group bookmarks by category
    const bookmarksByCategory = {};
    bookmarks.forEach(bookmark => {
      if (!bookmarksByCategory[bookmark.category]) {
        bookmarksByCategory[bookmark.category] = [];
      }
      bookmarksByCategory[bookmark.category].push(bookmark);
    });
  
    // Add each category and its bookmarks
    Object.keys(bookmarksByCategory).forEach(category => {
      html += `\n        <DT><H3 ADD_DATE="${date}" LAST_MODIFIED="${date}">${category}</H3>\n        <DL><p>`;
      
      bookmarksByCategory[category].forEach(bookmark => {
        const addDate = new Date(bookmark.dateAdded).getTime();
        html += `\n            <DT><A HREF="${bookmark.url}" ADD_DATE="${addDate}" LAST_MODIFIED="${addDate}">${bookmark.title}</A>`;
        if (bookmark.description) {
          html += `\n            <DD>${bookmark.description}`;
        }
      });
      
      html += `\n        </DL><p>`;
    });
  
    html += `\n    </DL><p>\n</DL><p>`;
    return html;
  }
  
  /**
   * Converts bookmarks to JSON format
   */
  export function convertToJSON(bookmarks) {
    return JSON.stringify(bookmarks, null, 2);
  }
  
  /**
   * Converts bookmarks to CSV format
   */
  export function convertToCSV(bookmarks) {
    const header = 'Title,URL,Category,Description,Date Added\n';
    const rows = bookmarks.map(bookmark => {
      return `"${escapeCSV(bookmark.title)}","${escapeCSV(bookmark.url)}","${escapeCSV(bookmark.category)}","${escapeCSV(bookmark.description || '')}","${new Date(bookmark.dateAdded).toISOString()}"`;
    });
    
    return header + rows.join('\n');
  }
  
  // Helper function to escape quotes in CSV fields
  function escapeCSV(str) {
    if (!str) return '';
    return str.replace(/"/g, '""');
  }
  
  /**
   * Parse HTML bookmarks (Netscape Bookmark File Format)
   */
  export function parseHTMLBookmarks(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bookmarks = [];
    
    // Find all bookmark links
    const links = doc.querySelectorAll('a');
    
    links.forEach(link => {
      // Get category by looking at parent H3 elements
      let category = 'Uncategorized';
      let parent = link.parentElement;
      while (parent) {
        if (parent.tagName === 'H3') {
          category = parent.textContent;
          break;
        }
        parent = parent.parentElement;
      }
      
      // Create bookmark object
      const bookmark = {
        title: link.textContent,
        url: link.getAttribute('href'),
        category: category,
        description: link.nextElementSibling && link.nextElementSibling.tagName === 'DD' ? 
                    link.nextElementSibling.textContent : '',
        dateAdded: new Date().toISOString()
      };
      
      // Try to get date added if available
      const addDate = link.getAttribute('add_date') || link.getAttribute('ADD_DATE');
      if (addDate) {
        try {
          bookmark.dateAdded = new Date(parseInt(addDate)).toISOString();
        } catch (e) {
          // Use current date if parsing fails
        }
      }
      
      bookmarks.push(bookmark);
    });
    
    return bookmarks;
  }
  
  /**
   * Parse JSON bookmarks
   */
  export function parseJSONBookmarks(json) {
    try {
      const parsed = JSON.parse(json);
      // Validate the structure
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must contain an array of bookmarks');
      }
      
      return parsed.map(item => {
        // Ensure required fields
        if (!item.url || !item.title) {
          throw new Error('Each bookmark must have at least a URL and title');
        }
        
        return {
          title: item.title,
          url: item.url,
          category: item.category || 'Uncategorized',
          description: item.description || '',
          dateAdded: item.dateAdded || new Date().toISOString()
        };
      });
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
  
  /**
   * Parse CSV bookmarks
   */
  export function parseCSVBookmarks(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Check required headers
    const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
    const urlIndex = headers.findIndex(h => h.toLowerCase() === 'url');
    
    if (titleIndex === -1 || urlIndex === -1) {
      throw new Error('CSV must have at least Title and URL columns');
    }
    
    const categoryIndex = headers.findIndex(h => h.toLowerCase() === 'category');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    const dateIndex = headers.findIndex(h => 
      h.toLowerCase() === 'date added' || 
      h.toLowerCase() === 'dateadded' || 
      h.toLowerCase() === 'date'
    );
    
    const bookmarks = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle CSV parsing with respect to quoted fields
      const values = parseCSVLine(lines[i]);
      
      if (values.length >= 2) {
        bookmarks.push({
          title: values[titleIndex] || 'Untitled',
          url: values[urlIndex],
          category: categoryIndex !== -1 && values[categoryIndex] ? values[categoryIndex] : 'Uncategorized',
          description: descriptionIndex !== -1 && values[descriptionIndex] ? values[descriptionIndex] : '',
          dateAdded: dateIndex !== -1 && values[dateIndex] ? new Date(values[dateIndex]).toISOString() : new Date().toISOString()
        });
      }
    }
    
    return bookmarks;
  }
  
  // Helper function to properly parse CSV lines with quoted fields
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Check if it's an escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    return result;
  }