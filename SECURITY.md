# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Email the maintainers at [create private security advisory on GitHub]
3. Include detailed information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix timeline: Depends on severity

## Security Considerations

This MCP server:
- Fetches content from handsontable.com only
- Runs locally via stdio transport
- Does not expose network services
- Does not store sensitive data
- Uses in-memory caching only

## Best Practices

When using this server:
- Run with least privilege necessary
- Keep dependencies updated
- Review fetched content before use
- Monitor for unusual behavior
- Use official releases only

## Vulnerability Disclosure

After a fix is released:
- Security advisory will be published
- CVE may be requested for serious issues
- Credits given to reporter (if desired)

## Dependencies

Monitor dependencies for vulnerabilities:

```bash
npm audit
```

Update dependencies regularly:

```bash
npm update
```
