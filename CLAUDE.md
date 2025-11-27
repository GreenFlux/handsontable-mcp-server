# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Model Context Protocol (MCP) server that provides access to Handsontable documentation for code generation. The server fetches documentation from handsontable.com, converts HTML to Markdown, and exposes it via MCP tools.

## Architecture

### Core Components

**MCP Server (`index.js`)**
- Built on `@modelcontextprotocol/sdk`
- Communicates via stdio transport
- Implements 3 tools: `get_doc`, `search_docs`, `list_categories`
- Uses JSDOM for HTML parsing and Turndown for Markdown conversion
- Simple in-memory cache with 1-hour TTL

**Documentation Data**
- `docs-structure.json` - Pre-analyzed structure of 563 documentation pages
- `sidebar.js` - Original navigation structure from Handsontable docs
- `sitemap.xml` - Complete site map with all URLs
- `analyze-docs.js` - One-time script to extract documentation structure

### Documentation Coverage

- **61 API endpoints** (Core, Plugins, Hooks, etc.)
- **128 guide topics** (Features, Integration, Migration)
- **20 categories** organized by functionality
- **3 frameworks** (JavaScript, React, Angular)
- **Vue 2 & 3** integration guides

## Development Commands

```bash
npm install          # Install dependencies
npm start           # Run MCP server
npm run dev         # Run with auto-reload
node analyze-docs.js # Re-analyze documentation structure
```

## Key Functions

**`fetchAndConvertDoc(url)`** - Fetches HTML, extracts main content, converts to Markdown
**`buildDocUrl(framework, path, isApi)`** - Constructs full URL from framework and topic
**`searchTopics(keyword)`** - Searches across API endpoints, guides, and categories

## MCP Tools

1. **get_doc** - Fetch specific documentation page as Markdown
   - Parameters: topic (required), framework (optional), type (optional)

2. **search_docs** - Search for topics by keyword
   - Parameters: keyword (required)

3. **list_categories** - List all documentation categories
   - Parameters: none

## Testing

The server runs on stdio, so it's designed to be used with MCP clients like Claude Desktop. To test manually, you'll need an MCP client or inspector.

## Notes

- Cache is in-memory only (clears on restart)
- Removes navigation, headers, footers from scraped content
- Handles both API reference and guide pages
- URL structure: `https://handsontable.com/docs/{framework}-data-grid/{api|guide}/{topic}/`
