# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-27

### Added
- Initial release of Handsontable MCP Server
- Three MCP tools: get_doc, search_docs, list_categories
- Support for JavaScript, React, and Angular documentation
- HTML to Markdown conversion using Turndown
- In-memory caching with 1-hour TTL
- Input validation and sanitization for all parameters
- Rate limiting for external requests (100ms delay)
- Structured JSON logging
- JSDoc comments for all public functions
- Cache size limit with LRU-like eviction (max 100 items)
- Comprehensive test suite with 10 test cases
- MIT License
- Contributing guidelines
- Code of Conduct
- Security policy

### Security
- Input validation prevents path traversal attacks
- URL validation ensures only handsontable.com is accessed
- Keyword length limits prevent abuse
- Topic sanitization removes dangerous characters

### Documentation
- README with installation and usage instructions
- CLAUDE.md for developer context
- TESTING.md with test results
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md with community standards
- SECURITY.md with vulnerability reporting process

## [Unreleased]

### Planned
- Persistent cache option (file-based or Redis)
- Configuration via environment variables
- Enhanced error handling with retry logic
- Request batching for multiple documents
- Vue framework support in tools
- Performance monitoring
- Integration tests
