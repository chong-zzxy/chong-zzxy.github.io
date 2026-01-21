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

// Load search data
async function loadSearchData() {
  try {
    const response = await fetch('/search.json');
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

// Highlight keywords in text
function highlightKeywords(text, keywords) {
  let highlightedText = text;

  keywords.forEach(keyword => {
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<em>$1</em>');
  });

  return highlightedText;
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

    // Build category display
    let categoryHTML = '';
    if (post.categories && post.categories.length > 0) {
      categoryHTML = `
        <span class="search-result-category">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          ${post.categories[0]}
        </span>
      `;
    }

    // Build date display
    const dateHTML = `
      <span class="search-result-date">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        ${formatDate(post.date)}
      </span>
    `;

    li.innerHTML = `
      <h3 class="search-result-title">
        <a href="${post.url}">${highlightKeywords(post.title, keywords)}</a>
      </h3>
      <div class="search-result-meta">
        ${categoryHTML}
        ${dateHTML}
      </div>
      <div class="search-result-content">
        ${highlightKeywords(result.matchedContent, keywords)}
      </div>
    `;

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
