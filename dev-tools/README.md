# Development Tools

This directory contains development and testing utilities for the Verkflöde project.

## Contents

- `debug-turnstile-401.html` - Turnstile debugging tool for 401 errors
- `local-analytics.html` - Local analytics testing interface
- `test-server.py` - Python development server for local testing
- `test-turnstile-keys.html` - Turnstile key testing utility

## Usage

### Local Development Server
```bash
python dev-tools/test-server.py
```

### Testing Turnstile Integration
1. Open `test-turnstile-keys.html` in browser
2. Test key functionality
3. Use `debug-turnstile-401.html` for troubleshooting

### Analytics Testing
- Use `local-analytics.html` for testing analytics implementation locally
- Respects privacy-first approach with local storage only

## Security Note
These tools are for development only and should not be deployed to production servers.