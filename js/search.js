/**
 * Local Search Functionality
 * Features:
 * - Full-text search in posts
 * - Highlight matching keywords
 * - Display search statistics
 * - Debounced input for performance
 * - AI interface placeholder for future integration
 */

let searchData = [];
let searchIndex = null;
const defaultCategoryDisplayMap = {
  CV: 'Computer Vision',
  NLP: 'Natural Language Processing',
  Life: '人间漫游'
};
const categoryDisplayMap = Object.assign(
  {},
  defaultCategoryDisplayMap,
  (typeof window !== 'undefined' && window.__XW_CATEGORY_DISPLAY_MAP) || {}
);

function displayCategoryName(name) {
  const raw = String(name || '').trim();
  if (!raw) return '未分类';
  return (
    categoryDisplayMap[raw] ||
    categoryDisplayMap[raw.toUpperCase()] ||
    categoryDisplayMap[raw.toLowerCase()] ||
    raw
  );
}

// Load search data
async function loadSearchData() {
  try {
    const searchDataPath = (typeof window !== 'undefined' && window.__XW_SEARCH_PATH)
      ? window.__XW_SEARCH_PATH
      : '/search.json';
    const response = await fetch(searchDataPath);
    if (!response.ok) {
      throw new Error('Search data not found');
    }
    searchData = await response.json();
    buildSearchIndex();
  } catch (error) {
    console.error('Failed to load search data:', error);
  }
}

// Build simple search index
function buildSearchIndex() {
  searchIndex = searchData.map(post => {
    return {
      title: post.title.toLowerCase(),
      content: (post.content || '').toLowerCase(),
      url: post.url,
      date: post.date,
      categories: post.categories || [],
      tags: post.tags || [],
      original: post
    };
  });
}

// Perform search
function performSearch(query) {
  if (!query || !searchIndex) {
    return [];
  }

  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const results = [];

  searchIndex.forEach(post => {
    let score = 0;
    let matchedContent = '';

    keywords.forEach(keyword => {
      // Title match (higher weight)
      if (post.title.includes(keyword)) {
        score += 10;
      }

      // Content match
      const contentIndex = post.content.indexOf(keyword);
      if (contentIndex !== -1) {
        score += 1;

        // Extract context around match
        if (!matchedContent) {
          const start = Math.max(0, contentIndex - 80);
          const end = Math.min(post.content.length, contentIndex + 120);
          matchedContent = post.content.substring(start, end);

          // Clean up
          matchedContent = matchedContent.replace(/\s+/g, ' ').trim();
          if (start > 0) matchedContent = '...' + matchedContent;
          if (end < post.content.length) matchedContent = matchedContent + '...';
        }
      }

      // Category/Tag match
      post.categories.forEach(cat => {
        if (cat.toLowerCase().includes(keyword)) {
          score += 5;
        }
      });

      post.tags.forEach(tag => {
        if (tag.toLowerCase().includes(keyword)) {
          score += 3;
        }
      });
    });

    if (score > 0) {
      results.push({
        post: post.original,
        score: score,
        matchedContent: matchedContent || post.content.substring(0, 150) + '...'
      });
    }
  });

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  return results;
}

// Append highlighted text nodes to avoid XSS from innerHTML interpolation
function appendHighlightedText(container, text, keywords) {
  const plainText = String(text || '');
  if (!keywords || !keywords.length) {
    container.appendChild(document.createTextNode(plainText));
    return;
  }

  const escapedKeywords = keywords
    .map(escapeRegExp)
    .filter(Boolean);

  if (!escapedKeywords.length) {
    container.appendChild(document.createTextNode(plainText));
    return;
  }

  const matcher = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  let lastIndex = 0;
  let match = null;

  while ((match = matcher.exec(plainText)) !== null) {
    if (match.index > lastIndex) {
      container.appendChild(document.createTextNode(plainText.slice(lastIndex, match.index)));
    }
    const em = document.createElement('em');
    em.textContent = match[0];
    container.appendChild(em);
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) break;
  }

  if (lastIndex < plainText.length) {
    container.appendChild(document.createTextNode(plainText.slice(lastIndex)));
  }
}

function createMetaIcon(type) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');

  if (type === 'category') {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z');
    svg.appendChild(path);
  } else {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '3');
    rect.setAttribute('y', '4');
    rect.setAttribute('width', '18');
    rect.setAttribute('height', '18');
    rect.setAttribute('rx', '2');
    rect.setAttribute('ry', '2');
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '16');
    line1.setAttribute('y1', '2');
    line1.setAttribute('x2', '16');
    line1.setAttribute('y2', '6');
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '8');
    line2.setAttribute('y1', '2');
    line2.setAttribute('x2', '8');
    line2.setAttribute('y2', '6');
    const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line3.setAttribute('x1', '3');
    line3.setAttribute('y1', '10');
    line3.setAttribute('x2', '21');
    line3.setAttribute('y2', '10');
    svg.appendChild(rect);
    svg.appendChild(line1);
    svg.appendChild(line2);
    svg.appendChild(line3);
  }

  return svg;
}

// Escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Display search results
function displayResults(results, query) {
  const resultsContainer = document.getElementById('search-results');
  const emptyContainer = document.getElementById('search-empty');
  const statsContainer = document.getElementById('search-stats');
  const countElement = document.getElementById('search-count');

  // Clear previous results
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.style.display = 'none';
    statsContainer.classList.remove('show');
    emptyContainer.classList.add('show');
    return;
  }

  // Show results
  resultsContainer.style.display = 'block';
  statsContainer.classList.add('show');
  emptyContainer.classList.remove('show');
  countElement.textContent = results.length;

  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);

  results.forEach(result => {
    const post = result.post;
    const li = document.createElement('li');
    li.className = 'search-result-item';

    const title = document.createElement('h3');
    title.className = 'search-result-title';
    const link = document.createElement('a');
    link.setAttribute('href', post.url || '#');
    appendHighlightedText(link, post.title || '未命名文章', keywords);
    title.appendChild(link);

    const meta = document.createElement('div');
    meta.className = 'search-result-meta';

    if (post.categories && post.categories.length > 0) {
      const category = document.createElement('span');
      category.className = 'search-result-category';
      category.appendChild(createMetaIcon('category'));
      category.appendChild(document.createTextNode(displayCategoryName(post.categories[0])));
      meta.appendChild(category);
    }

    const date = document.createElement('span');
    date.className = 'search-result-date';
    date.appendChild(createMetaIcon('date'));
    date.appendChild(document.createTextNode(formatDate(post.date)));
    meta.appendChild(date);

    const content = document.createElement('div');
    content.className = 'search-result-content';
    appendHighlightedText(content, result.matchedContent, keywords);

    li.appendChild(title);
    li.appendChild(meta);
    li.appendChild(content);
    resultsContainer.appendChild(li);
  });
}

// Debounce function
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

// Handle search input
function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();

  if (!query) {
    // Clear results if empty
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-stats').classList.remove('show');
    document.getElementById('search-empty').classList.remove('show');
    return;
  }

  const startTime = performance.now();
  const results = performSearch(query);
  const endTime = performance.now();

  // Update search time
  document.getElementById('search-time').textContent = Math.round(endTime - startTime);

  displayResults(results, query);
}

// Initialize search
document.addEventListener('DOMContentLoaded', async () => {
  // Load search data
  await loadSearchData();

  // Setup search input listener with debouncing
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Focus on search input
    searchInput.focus();

    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });

    // Check for URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      searchInput.value = queryParam;
      handleSearch();
    }
  }
});

/**
 * AI Search Integration Placeholder
 *
 * Future implementation will include:
 * 1. API endpoint for AI-powered search
 * 2. Natural language query understanding
 * 3. Semantic search capabilities
 * 4. Conversational Q&A interface
 *
 * Example API structure:
 *
 * async function aiSearch(query) {
 *   const response = await fetch('/api/ai-search', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ query })
 *   });
 *   return await response.json();
 * }
 *
 * UI elements:
 * - Toggle between local search and AI search
 * - Streaming response display
 * - Follow-up question suggestions
 * - Source citation with links
 */
