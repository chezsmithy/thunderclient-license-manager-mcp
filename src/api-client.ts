import {
  AddLicenseRequest,
  GetLicensesRequest,
  RemoveLicenseRequest,
  ApiResponse,
  GetLicensesResponse,
  PaginatedLicensesResponse,
  ServerConfig,
  LicenseInfo
} from './types.js';

export class ThunderClientLicenseAPI {
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  private getHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'api-key': this.config.apiKey,
    };
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    return headers;
  }

  private getAccountNumber(): string {
    return this.config.accountNumber;
  }

  /**
   * Add licenses for specified emails
   */
  async addLicense(request: AddLicenseRequest): Promise<ApiResponse> {
    const url = `${this.config.baseUrl}/api/license/add`;
    const body = {
      accountNumber: this.getAccountNumber(),
      emails: request.emails
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders('application/json'),
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data
        };
      }

      return {
        success: true,
        data,
        message: `Successfully added licenses for ${request.emails.length} email(s)`
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get licenses - single page
   */
  private async getLicensesPage(accountNumber: string, pageNumber: number): Promise<GetLicensesResponse | null> {
    const url = new URL(`${this.config.baseUrl}/api/license/query`);
    url.searchParams.set('accountNumber', accountNumber);
    url.searchParams.set('pageNumber', pageNumber.toString());

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Thunder Client API uses 'teamMembers' for license data
      const licenseArray = data.teamMembers || [];
      
      // Transform the response to match our expected structure
      return {
        licenses: licenseArray,
        currentPage: pageNumber,
        totalPages: data.totalPages || 1,
        totalCount: data.usedSeats || licenseArray.length,
        hasMore: data.hasMore !== undefined ? data.hasMore : (pageNumber < (data.totalPages || 1))
      };
    } catch (error) {
      console.error(`Failed to fetch page ${pageNumber}:`, error);
      return null;
    }
  }

  /**
   * Get licenses - with optional pagination
   */
  async getLicenses(request: GetLicensesRequest): Promise<ApiResponse<GetLicensesResponse | PaginatedLicensesResponse>> {
    const accountNumber = this.getAccountNumber();

    try {
      // If pageNumber is specified, fetch only that page
      if (request.pageNumber !== undefined) {
        const result = await this.getLicensesPage(accountNumber, request.pageNumber);
        
        if (!result) {
          return {
            success: false,
            error: `Failed to fetch page ${request.pageNumber}`
          };
        }

        return {
          success: true,
          data: result,
          message: `Retrieved page ${request.pageNumber} of licenses`
        };
      }

      // If no pageNumber specified, fetch all pages
      const allLicenses: LicenseInfo[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let totalCount = 0;
      const maxPages = 100; // Safety limit to prevent infinite loops

      while (currentPage <= totalPages && currentPage <= maxPages) {
        const result = await this.getLicensesPage(accountNumber, currentPage);
        
        if (!result) {
          break;
        }

        allLicenses.push(...result.licenses);
        totalPages = result.totalPages;
        totalCount = result.totalCount;

        if (!result.hasMore || currentPage >= totalPages) {
          break;
        }

        currentPage++;
      }

      const paginatedResponse: PaginatedLicensesResponse = {
        licenses: allLicenses,
        totalPages: totalPages,
        totalCount: totalCount,
        pagesFetched: currentPage
      };

      return {
        success: true,
        data: paginatedResponse,
        message: `Retrieved ${allLicenses.length} licenses across ${currentPage} page(s)`
      };

    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Remove licenses for specified emails
   */
  async removeLicense(request: RemoveLicenseRequest): Promise<ApiResponse> {
    const url = `${this.config.baseUrl}/api/license/remove`;
    const body = {
      accountNumber: this.getAccountNumber(),
      emails: request.emails
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders('application/json'),
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data
        };
      }

      return {
        success: true,
        data,
        message: `Successfully removed licenses for ${request.emails.length} email(s)`
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
