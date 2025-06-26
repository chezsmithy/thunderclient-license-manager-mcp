# Setting up Thunder Client License Manager in Cline

This guide shows how to configure the Thunder Client License Manager MCP server in Cline.

## Prerequisites

1. Make sure the project is built:
   ```bash
   npm run build
   ```

2. Have your Thunder Client API credentials ready:
   - `TC_API_KEY`: Your Thunder Client API key
   - `TC_ACCOUNT_NUMBER`: Your Thunder Client account number

## Configuration Steps

### Option 1: Use the provided configuration file

1. **Copy the configuration**: The `cline_mcp_settings.json` file in this directory contains the MCP server configuration.

2. **Update credentials**: Edit the `cline_mcp_settings.json` file and replace the placeholder values:
   ```json
   {
     "mcpServers": {
       "thunderclient-license-manager": {
         "command": "npx",
         "args": [
           "-y",
           "/Users/r614638@regence.com/workspaces/chezsmithy/thunderclient-license-manager-mcp"
         ],
         "env": {
           "TC_API_KEY": "your-actual-api-key",
           "TC_ACCOUNT_NUMBER": "your-actual-account-number",
           "TC_BASE_URL": "https://www.thunderclient.com"
         }
       }
     }
   }
   ```

3. **Apply to Cline**: 
   - Copy the contents of `cline_mcp_settings.json`
   - In Cline, go to MCP settings
   - Paste the configuration or merge it with your existing settings

### Option 2: Manual configuration in Cline

1. **Open Cline MCP Settings**
2. **Add a new server** with these details:
   - **Server Name**: `thunderclient-license-manager`
   - **Command**: `npx`
   - **Args**: `["-y", "/Users/r614638@regence.com/workspaces/chezsmithy/thunderclient-license-manager-mcp"]`
   - **Environment Variables**:
     - `TC_API_KEY`: Your Thunder Client API key
     - `TC_ACCOUNT_NUMBER`: Your Thunder Client account number
     - `TC_BASE_URL`: `https://www.thunderclient.com` (optional)

## Verification

After configuration, restart Cline and you should see these tools available:

- `thunderclient_add_license`
- `thunderclient_get_licenses` 
- `thunderclient_remove_license`

## Usage Examples

Once configured, you can use the tools in Cline like this:

### Add licenses
```
Please use the thunderclient_add_license tool to add licenses for these emails:
- user1@example.com
- user2@example.com
```

### Get all licenses
```
Use thunderclient_get_licenses to fetch all our Thunder Client licenses
```

### Get specific page
```
Use thunderclient_get_licenses to get page 2 of our licenses
```

### Remove licenses
```
Use thunderclient_remove_license to remove licenses for user1@example.com
```

**Note:** All tools automatically use the `TC_ACCOUNT_NUMBER` environment variable - no need to specify account numbers in the tool parameters.

## Troubleshooting

1. **Server not starting**: Check that the path in the configuration is correct and the project is built
2. **Authentication errors**: Verify your `TC_API_KEY` and `TC_ACCOUNT_NUMBER` are correct
3. **Tool not found**: Make sure Cline has restarted after adding the MCP configuration

## Security Note

Keep your API credentials secure. Consider using environment variables on your system instead of hardcoding them in the configuration file.
