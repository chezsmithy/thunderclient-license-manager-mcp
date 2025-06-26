#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { ThunderClientLicenseAPI } from './api-client.js';
import { 
  AddLicenseRequest, 
  GetLicensesRequest, 
  RemoveLicenseRequest, 
  ServerConfig 
} from './types.js';

class ThunderClientLicenseMCPServer {
  private server: Server;
  private apiClient: ThunderClientLicenseAPI;

  constructor() {
    // Validate environment variables
    const config = this.validateConfig();
    
    // Initialize API client
    this.apiClient = new ThunderClientLicenseAPI(config);

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'thunderclient-license-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private validateConfig(): ServerConfig {
    const apiKey = process.env.TC_API_KEY;
    const accountNumber = process.env.TC_ACCOUNT_NUMBER;
    const baseUrl = process.env.TC_BASE_URL || 'https://www.thunderclient.com';

    if (!apiKey) {
      throw new Error('TC_API_KEY environment variable is required');
    }

    if (!accountNumber) {
      throw new Error('TC_ACCOUNT_NUMBER environment variable is required');
    }

    return {
      apiKey,
      accountNumber,
      baseUrl,
    };
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'thunderclient_add_license',
            description: 'Add Thunder Client licenses for specified email addresses',
            inputSchema: {
              type: 'object',
              properties: {
                emails: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'email',
                  },
                  description: 'Array of email addresses to add licenses for',
                  minItems: 1,
                },
              },
              required: ['emails'],
            },
          },
          {
            name: 'thunderclient_get_licenses',
            description: 'Get Thunder Client licenses. If pageNumber is not provided, fetches all pages automatically.',
            inputSchema: {
              type: 'object',
              properties: {
                pageNumber: {
                  type: 'number',
                  description: 'Specific page number to fetch (optional, fetches all pages if omitted)',
                  minimum: 1,
                },
              },
              required: [],
            },
          },
          {
            name: 'thunderclient_remove_license',
            description: 'Remove Thunder Client licenses for specified email addresses',
            inputSchema: {
              type: 'object',
              properties: {
                emails: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'email',
                  },
                  description: 'Array of email addresses to remove licenses for',
                  minItems: 1,
                },
              },
              required: ['emails'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'thunderclient_add_license': {
            const addRequest = (args || {}) as unknown as AddLicenseRequest;
            if (!addRequest.emails || !Array.isArray(addRequest.emails) || addRequest.emails.length === 0) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'emails array is required and must contain at least one email address'
              );
            }

            const result = await this.apiClient.addLicense(addRequest);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'thunderclient_get_licenses': {
            const getRequest = (args || {}) as unknown as GetLicensesRequest;
            const result = await this.apiClient.getLicenses(getRequest);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'thunderclient_remove_license': {
            const removeRequest = (args || {}) as unknown as RemoveLicenseRequest;
            if (!removeRequest.emails || !Array.isArray(removeRequest.emails) || removeRequest.emails.length === 0) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'emails array is required and must contain at least one email address'
              );
            }

            const result = await this.apiClient.removeLicense(removeRequest);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: unknown) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Thunder Client License Manager MCP Server running on stdio');
  }
}

// Start the server
const server = new ThunderClientLicenseMCPServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
