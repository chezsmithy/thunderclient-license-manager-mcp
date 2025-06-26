# Thunder Client License Manager MCP Server

An MCP (Model Context Protocol) server that provides tools for managing Thunder Client licenses through their API.

<a href="https://glama.ai/mcp/servers/@chezsmithy/thunderclient-license-manager-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@chezsmithy/thunderclient-license-manager-mcp/badge" alt="Thunder Client License Manager Server MCP server" />
</a>

## Features

- **Add licenses**: Add Thunder Client licenses for specified email addresses
- **Get licenses**: Retrieve license information with automatic pagination
- **Remove licenses**: Remove Thunder Client licenses for specified email addresses

## Requirements

- Node.js 20+ (LTS)
- TypeScript
- Thunder Client API access

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Environment Variables

Before using the MCP server, you need to set the following environment variables:

- `TC_API_KEY`: Your Thunder Client API key (sent as 'api-key' header)
- `TC_ACCOUNT_NUMBER`: Your Thunder Client account number
- `TC_BASE_URL`: (Optional) Base URL for Thunder Client API (defaults to 'https://www.thunderclient.com')

### Example Environment Setup

```bash
export TC_API_KEY="your-api-key-here"
export TC_ACCOUNT_NUMBER="your-account-number"
export TC_BASE_URL="https://www.thunderclient.com"  # optional
```

## MCP Configuration

Add the server to your MCP settings configuration:

### For Cline/Claude Desktop

Add to your `cline_mcp_settings.json` or Claude Desktop configuration:

```json
{
  "mcpServers": {
    "thunderclient-license-manager": {
      "command": "npx",
      "args": ["-y", "/path/to/thunderclient-license-manager-mcp"],
      "env": {
        "TC_API_KEY": "your-api-key-here",
        "TC_ACCOUNT_NUMBER": "your-account-number-here"
      }
    }
  }
}
```

### For other MCP clients

Use the stdio transport with npx:

```bash
npx -y .
```

## Available Tools

### 1. `thunderclient_add_license`

Add Thunder Client licenses for specified email addresses.

**Parameters:**
- `emails` (required): Array of email addresses to add licenses for

**Example:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"]
}
```

### 2. `thunderclient_get_licenses`

Get Thunder Client licenses with smart pagination.

**Parameters:**
- `pageNumber` (optional): Specific page to fetch. If omitted, fetches ALL pages automatically

**Example - Get all licenses:**
```json
{}
```

**Example - Get specific page:**
```json
{
  "pageNumber": 2
}
```

### 3. `thunderclient_remove_license`

Remove Thunder Client licenses for specified email addresses.

**Parameters:**
- `emails` (required): Array of email addresses to remove licenses for

**Example:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"]
}
```

## API Response Format

All tools return responses in the following format:

```json
{
  "success": true/false,
  "data": { /* API response data */ },
  "message": "Success/error message",
  "error": "Error details (if success is false)"
}
```

### Special Response for `thunderclient_get_licenses` without pageNumber

When fetching all pages, the response includes:

```json
{
  "success": true,
  "data": {
    "licenses": [ /* Combined licenses from all pages */ ],
    "totalPages": 5,
    "totalCount": 150,
    "pagesFetched": 5
  },
  "message": "Retrieved 150 licenses across 5 page(s)"
}
```

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm start`: Run the compiled server

### Project Structure

```
src/
├── index.ts          # Main MCP server implementation
├── api-client.ts     # Thunder Client API wrapper
└── types.ts          # TypeScript type definitions
```

## Error Handling

The server includes comprehensive error handling:

- Environment variable validation
- API request/response error handling
- Input validation for required parameters
- Proper MCP error codes and messages

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues related to the Thunder Client API, refer to their documentation.
For MCP server issues, please create an issue in this repository.