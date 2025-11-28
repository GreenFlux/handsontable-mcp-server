# Handsontable MCP Server

Model Context Protocol server providing access to Handsontable documentation for AI-powered code generation.

## Features

- **Three MCP Tools**
  - `get_doc` - Fetch specific documentation pages as Markdown
  - `search_docs` - Search 563 pages by keyword
  - `list_categories` - Browse all documentation categories

- **Multi-Framework Support**
  - JavaScript (vanilla)
  - React
  - Angular
  - Vue 2/3 (via integration guides)

- **Smart Features**
  - Input validation and sanitization
  - Rate limiting (100ms between requests)
  - LRU cache with 1-hour TTL (max 100 items)
  - Structured JSON logging
  - HTML to Markdown conversion

- **Coverage**
  - 61 API endpoints
  - 128 guide topics
  - 20 documentation categories
  - 563 total pages

## Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/GreenFlux/handsontable-mcp-server.git
cd handsontable-mcp-server
npm install
```

### 2. Add to Claude Desktop

**macOS:** Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** Edit `%APPDATA%\Claude\claude_desktop_config.json`

Replace `/absolute/path/to` with your actual path:

```json
{
  "mcpServers": {
    "handsontable": {
      "command": "node",
      "args": ["/absolute/path/to/handsontable-mcp-server/index.js"]
    }
  }
}
```

### 3. Restart Claude Desktop

The server starts automatically when Claude Desktop launches.

## Using the Server

Once connected, ask Claude about Handsontable:

## Available Tools

### 1. `get_doc`

Fetch specific documentation and return as Markdown.

**Parameters:**
- `topic` (required): Documentation topic (e.g., "column-sorting", "filters")
- `framework` (optional): "javascript", "react", or "angular" (default: "javascript")
- `type` (optional): "guide" or "api" (default: "guide")

**Example:**
```
Get the React column sorting documentation
```

### 2. `search_docs`

Search for topics by keyword.

**Parameters:**
- `keyword` (required): Search term

**Example:**
```
Search Handsontable docs for "filter"
```

### 3. `list_categories`

List all documentation categories and topics.

**Example:**
```
Show me all Handsontable documentation categories
```

See [DOCUMENTATION.md](DOCUMENTATION.md) for a complete reference of all 61 API endpoints, 128 guide topics, and 20 categories.

## Development

**Run with auto-reload:**
```bash
npm run dev
```

**Run tests:**
```bash
npm test
```

**Lint code:**
```bash
npx eslint .
```

**Format code:**
```bash
npx prettier --write .
```

## Architecture

The server:
1. Receives MCP tool requests via stdio
2. Validates and sanitizes all inputs
3. Applies rate limiting (100ms between requests)
4. Fetches HTML from handsontable.com
5. Parses with JSDOM, removes navigation/footer
6. Converts to Markdown with Turndown
7. Caches result with LRU eviction
8. Returns formatted documentation

## Project Structure

```
handsontable-mcp-server/
├── index.js                 # Main MCP server
├── test.js                  # Test suite
├── docs-structure.json      # Pre-analyzed docs
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions
└── README.md
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

## License

MIT - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Documentation source: [Handsontable](https://handsontable.com)
- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
