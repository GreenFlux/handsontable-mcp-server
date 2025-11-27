#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import docsStructure from './docs-structure.json' with { type: 'json' };

// Configuration
const CONFIG = {
  BASE_URL: 'https://handsontable.com/docs',
  CACHE_TTL: 1000 * 60 * 60, // 1 hour
  MAX_CACHE_SIZE: 100, // Maximum number of cached items
  RATE_LIMIT_DELAY: 100, // Milliseconds between requests
  VALID_FRAMEWORKS: ['javascript', 'react', 'angular'],
  VALID_TYPES: ['guide', 'api'],
};

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Cache with LRU-like behavior
const cache = new Map();
let lastRequestTime = 0;

// Logging utility
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Simple structured logger
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
  };
  console.error(JSON.stringify(logEntry));
}

/**
 * Validate and sanitize topic input
 * @param {string} topic - Topic to validate
 * @returns {string} Sanitized topic
 * @throws {Error} If topic is invalid
 */
function validateTopic(topic) {
  if (!topic || typeof topic !== 'string') {
    throw new Error('Topic must be a non-empty string');
  }

  // Remove potentially dangerous characters
  const sanitized = topic.trim().replace(/[^a-z0-9\-_/]/gi, '');

  if (sanitized.length === 0) {
    throw new Error('Topic contains no valid characters');
  }

  if (sanitized.length > 200) {
    throw new Error('Topic is too long (max 200 characters)');
  }

  // Prevent path traversal
  if (sanitized.includes('..') || sanitized.startsWith('/')) {
    throw new Error('Invalid topic format');
  }

  return sanitized;
}

/**
 * Validate framework parameter
 * @param {string} framework - Framework to validate
 * @returns {string} Validated framework
 * @throws {Error} If framework is invalid
 */
function validateFramework(framework) {
  if (!framework) {
    return 'javascript'; // Default
  }

  if (!CONFIG.VALID_FRAMEWORKS.includes(framework)) {
    throw new Error(
      `Invalid framework. Must be one of: ${CONFIG.VALID_FRAMEWORKS.join(', ')}`
    );
  }

  return framework;
}

/**
 * Validate type parameter
 * @param {string} type - Type to validate
 * @returns {string} Validated type
 * @throws {Error} If type is invalid
 */
function validateType(type) {
  if (!type) {
    return 'guide'; // Default
  }

  if (!CONFIG.VALID_TYPES.includes(type)) {
    throw new Error(
      `Invalid type. Must be one of: ${CONFIG.VALID_TYPES.join(', ')}`
    );
  }

  return type;
}

/**
 * Rate limiting - ensures minimum delay between requests
 * @returns {Promise<void>}
 */
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY) {
    const delay = CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

/**
 * Evict oldest cache entry if cache is full
 */
function evictCacheIfNeeded() {
  if (cache.size >= CONFIG.MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
    log(LOG_LEVELS.DEBUG, 'Cache eviction', { evictedKey: firstKey });
  }
}

/**
 * Fetch documentation page and convert to markdown
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} Markdown content
 * @throws {Error} If fetch fails or URL is invalid
 */
async function fetchAndConvertDoc(url) {
  // Validate URL
  if (!url.startsWith(CONFIG.BASE_URL)) {
    throw new Error('Invalid URL: Must be from handsontable.com');
  }

  // Check cache first
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
    log(LOG_LEVELS.DEBUG, 'Cache hit', { url });
    return cached.content;
  }

  // Apply rate limiting
  await rateLimit();

  try {
    log(LOG_LEVELS.INFO, 'Fetching documentation', { url });

    const response = await fetch(url);
    if (!response.ok) {
      log(LOG_LEVELS.ERROR, 'HTTP error', {
        url,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Try to find the main content area
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('.content') ||
      document.querySelector('article') ||
      document.body;

    // Remove navigation, footer, and other non-content elements
    const selectorsToRemove = [
      'nav',
      'header',
      'footer',
      '.sidebar',
      '.navigation',
      '.breadcrumb',
      'script',
      'style',
      'iframe',
    ];

    selectorsToRemove.forEach((selector) => {
      mainContent.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Convert to markdown
    const markdown = turndownService.turndown(mainContent.innerHTML);

    // Evict old cache entries if needed
    evictCacheIfNeeded();

    // Cache the result
    cache.set(url, {
      content: markdown,
      timestamp: Date.now(),
    });

    log(LOG_LEVELS.INFO, 'Successfully fetched and cached', {
      url,
      contentLength: markdown.length,
    });

    return markdown;
  } catch (error) {
    log(LOG_LEVELS.ERROR, 'Failed to fetch documentation', {
      url,
      error: error.message,
    });
    throw new Error(`Failed to fetch documentation: ${error.message}`);
  }
}

/**
 * Build full URL from framework and path
 * @param {string} framework - Framework name
 * @param {string} path - Documentation path
 * @param {boolean} isApi - Whether this is an API reference
 * @returns {string} Full documentation URL
 */
function buildDocUrl(framework, path, isApi = false) {
  const frameworkPath = `${framework}-data-grid`;

  if (isApi) {
    return `${CONFIG.BASE_URL}/${frameworkPath}/api/${path}/`;
  }

  // For guides, path might already include full structure
  if (path.startsWith('guides/') || path.startsWith('api/')) {
    return `${CONFIG.BASE_URL}/${frameworkPath}/${path.replace('guides/', '')}`;
  }

  return `${CONFIG.BASE_URL}/${frameworkPath}/${path}/`;
}

/**
 * Search for topics matching a keyword
 * @param {string} keyword - Search keyword
 * @returns {Object} Search results with apiEndpoints, guideTopics, and categories
 * @throws {Error} If keyword is invalid
 */
function searchTopics(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    throw new Error('Keyword must be a non-empty string');
  }

  if (keyword.length > 100) {
    throw new Error('Keyword is too long (max 100 characters)');
  }

  const lowerKeyword = keyword.toLowerCase().trim();
  const results = {
    apiEndpoints: [],
    guideTopics: [],
    categories: [],
  };

  // Search API endpoints
  results.apiEndpoints = docsStructure.apiEndpoints.filter((endpoint) =>
    endpoint.toLowerCase().includes(lowerKeyword)
  );

  // Search guide topics
  results.guideTopics = docsStructure.guideTopics.filter((topic) =>
    topic.toLowerCase().includes(lowerKeyword)
  );

  // Search categories
  results.categories = docsStructure.categories
    .filter((cat) => cat.title.toLowerCase().includes(lowerKeyword))
    .map((cat) => cat.title);

  return results;
}

// Create MCP server
const server = new Server(
  {
    name: 'handsontable-docs',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_doc',
        description:
          'Fetch Handsontable documentation for a specific topic and framework. Returns the documentation as markdown.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "column-sorting", "filters", "installation"). Use search_docs to find available topics.',
            },
            framework: {
              type: 'string',
              enum: ['javascript', 'react', 'angular'],
              description: 'The framework version of the docs (default: javascript)',
              default: 'javascript',
            },
            type: {
              type: 'string',
              enum: ['guide', 'api'],
              description: 'Whether this is a guide or API reference (default: guide)',
              default: 'guide',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'search_docs',
        description:
          'Search for Handsontable documentation topics by keyword. Returns matching API endpoints, guide topics, and categories.',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Keyword to search for (e.g., "column", "filter", "sort")',
            },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'list_categories',
        description:
          'List all available documentation categories with their topics. Useful for browsing the documentation structure.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_doc': {
        // Validate and sanitize inputs
        const topic = validateTopic(args.topic);
        const framework = validateFramework(args.framework);
        const type = validateType(args.type);

        log(LOG_LEVELS.INFO, 'get_doc request', { topic, framework, type });

        const url = buildDocUrl(framework, topic, type === 'api');
        const markdown = await fetchAndConvertDoc(url);

        return {
          content: [
            {
              type: 'text',
              text: `# Handsontable Documentation: ${topic} (${framework})\n\nSource: ${url}\n\n${markdown}`,
            },
          ],
        };
      }

      case 'search_docs': {
        // Validate keyword
        const keyword = args.keyword;
        if (!keyword) {
          throw new Error('keyword parameter is required');
        }

        log(LOG_LEVELS.INFO, 'search_docs request', { keyword });

        const results = searchTopics(keyword);
        const totalResults =
          results.apiEndpoints.length +
          results.guideTopics.length +
          results.categories.length;

        let response = `# Search Results for "${keyword}"\n\nFound ${totalResults} matches:\n\n`;

        if (results.apiEndpoints.length > 0) {
          response += `## API Endpoints (${results.apiEndpoints.length})\n`;
          results.apiEndpoints.forEach((endpoint) => {
            response += `- ${endpoint}\n`;
          });
          response += '\n';
        }

        if (results.guideTopics.length > 0) {
          response += `## Guide Topics (${results.guideTopics.length})\n`;
          results.guideTopics.forEach((topic) => {
            response += `- ${topic}\n`;
          });
          response += '\n';
        }

        if (results.categories.length > 0) {
          response += `## Categories (${results.categories.length})\n`;
          results.categories.forEach((category) => {
            response += `- ${category}\n`;
          });
          response += '\n';
        }

        if (totalResults === 0) {
          response += 'No matches found. Try different keywords or use list_categories to browse all topics.\n';
        }

        return {
          content: [{ type: 'text', text: response }],
        };
      }

      case 'list_categories': {
        let response = '# Handsontable Documentation Categories\n\n';
        response += `Total: ${docsStructure.categories.length} categories, ${docsStructure.totalUrls} pages\n\n`;

        docsStructure.categories.forEach((category) => {
          response += `## ${category.title} (${category.pageCount} pages)\n`;
          if (category.pages && category.pages.length > 0) {
            category.pages.slice(0, 5).forEach((page) => {
              const topicName = page.split('/').pop();
              response += `- ${topicName}\n`;
            });
            if (category.pages.length > 5) {
              response += `- ... and ${category.pages.length - 5} more\n`;
            }
          }
          response += '\n';
        });

        response += '\n## Frameworks Available\n';
        docsStructure.frameworks.forEach((fw) => {
          response += `- ${fw}\n`;
        });

        return {
          content: [{ type: 'text', text: response }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Handsontable MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
