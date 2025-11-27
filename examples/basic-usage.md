# Basic Usage Examples

## Example 1: Search for Documentation

Ask Claude to search for topics:

```
Search Handsontable docs for "column sorting"
```

This will use the `search_docs` tool to find relevant documentation pages.

## Example 2: Get Specific Documentation

Request specific documentation pages:

```
Get the Handsontable column filtering guide for React
```

This will use the `get_doc` tool with:
- topic: "column-filter"
- framework: "react"
- type: "guide"

## Example 3: Browse Available Topics

List all documentation categories:

```
Show me all Handsontable documentation categories
```

This will use the `list_categories` tool.

## Example 4: Code Generation

Generate code based on documentation:

```
Show me how to implement column sorting in a React Handsontable with custom comparators
```

Claude will:
1. Search for "column sorting" documentation
2. Get the React column sorting guide
3. Generate code examples based on the documentation

## Example 5: API Reference Lookup

Get API documentation:

```
Get the Core API reference for Handsontable
```

This will use the `get_doc` tool with:
- topic: "core"
- framework: "javascript"
- type: "api"

## Example 6: Framework-Specific Examples

Request documentation for specific frameworks:

```
Show me the Angular installation guide for Handsontable
```

```
Get the React integration examples for Handsontable
```

## Example 7: Feature Implementation

Ask for help implementing features:

```
Help me add cell validation to my Handsontable grid using the API
```

Claude will fetch the relevant validation documentation and provide implementation guidance.

## Tips

- Be specific about which framework you're using (JavaScript, React, or Angular)
- Specify whether you need a guide or API reference
- Use keywords from the documentation structure for better results
- Ask follow-up questions to refine the documentation or code examples
