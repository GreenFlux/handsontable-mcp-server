# Handsontable MCP Server

Model Context Protocol server providing access to Handsontable documentation for AI-powered code generation.

## Overview

This MCP server enables Claude and other AI assistants to access comprehensive Handsontable documentation, including guides, API references, and examples across multiple frameworks. Perfect for generating data grid implementations, troubleshooting issues, and learning Handsontable features.

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

## Requirements

- Node.js 18.0.0 or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/handsontable-mcp-server.git
cd handsontable-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Run tests to verify installation:
```bash
npm test
```

## Usage with Claude Desktop

Add this server to your Claude Desktop configuration:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "handsontable": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\handsontable-mcp-server\\index.js"]
    }
  }
}
```

After updating the config, restart Claude Desktop.

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

## Example Prompts

**Basic Usage:**
- "Show me how to implement column filtering in React using Handsontable"
- "Get the Handsontable API reference for the Core class"
- "Search for documentation about cell validation"

**Advanced Usage:**
- "Show me the Angular integration guide for Handsontable"
- "Generate a code example using the Handsontable formula plugin"
- "How do I customize the Handsontable theme?"

See [examples/](examples/) for more detailed usage examples.

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
├── examples/                # Usage examples
│   ├── basic-usage.md
│   └── advanced-usage.md
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
