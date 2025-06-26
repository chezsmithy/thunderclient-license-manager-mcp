/**
 * TypeScript interfaces for Thunder Client License API
 */

// Request types
export interface AddLicenseRequest {
  emails: string[];
}

export interface GetLicensesRequest {
  pageNumber?: number;
}

export interface RemoveLicenseRequest {
  emails: string[];
}

// Response types (based on typical API responses)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LicenseInfo {
  email: string;
  accountNumber: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetLicensesResponse {
  licenses: LicenseInfo[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

export interface PaginatedLicensesResponse {
  licenses: LicenseInfo[];
  totalPages: number;
  totalCount: number;
  pagesFetched: number;
}

// Environment configuration
export interface ServerConfig {
  apiKey: string;
  accountNumber: string;
  baseUrl: string;
}
