import { GraphQLClient, ClientError } from "graphql-request";

// Use full URL for graphql-request compatibility
const endpoint = `${window.location.origin}/query`;

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
  },
});

// Custom error class for API errors
export class ApiError extends Error {
  public readonly code: string;
  public readonly isNetworkError: boolean;
  public readonly isNotFound: boolean;
  public readonly isUnauthorized: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      isNetworkError?: boolean;
      isNotFound?: boolean;
      isUnauthorized?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code || "UNKNOWN";
    this.isNetworkError = options.isNetworkError || false;
    this.isNotFound = options.isNotFound || false;
    this.isUnauthorized = options.isUnauthorized || false;
  }
}

// Parse GraphQL errors into a user-friendly message
function parseGraphQLError(error: unknown): ApiError {
  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new ApiError(
      "Unable to connect to the server. Please check your internet connection.",
      {
        code: "NETWORK_ERROR",
        isNetworkError: true,
      },
    );
  }

  // GraphQL client errors
  if (error instanceof ClientError) {
    const graphqlErrors = error.response?.errors;

    if (graphqlErrors && graphqlErrors.length > 0) {
      const firstError = graphqlErrors[0];
      const message = firstError.message || "An error occurred";

      // Check for specific error types
      if (message.includes("not found") || message.includes("no rows")) {
        return new ApiError("The requested resource was not found.", {
          code: "NOT_FOUND",
          isNotFound: true,
        });
      }

      if (
        message.includes("unauthorized") ||
        message.includes("admin access required")
      ) {
        return new ApiError(
          "You do not have permission to perform this action.",
          {
            code: "UNAUTHORIZED",
            isUnauthorized: true,
          },
        );
      }

      return new ApiError(message, { code: "GRAPHQL_ERROR" });
    }

    // HTTP errors
    if (error.response?.status) {
      const status = error.response.status;
      if (status === 404) {
        return new ApiError("The requested resource was not found.", {
          code: "NOT_FOUND",
          isNotFound: true,
        });
      }
      if (status === 401 || status === 403) {
        return new ApiError(
          "You do not have permission to perform this action.",
          {
            code: "UNAUTHORIZED",
            isUnauthorized: true,
          },
        );
      }
      if (status >= 500) {
        return new ApiError(
          "The server encountered an error. Please try again later.",
          {
            code: "SERVER_ERROR",
          },
        );
      }
    }
  }

  // Generic error
  if (error instanceof Error) {
    return new ApiError(error.message, { code: "UNKNOWN" });
  }

  return new ApiError("An unexpected error occurred.", { code: "UNKNOWN" });
}

export async function requestWithError<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    const result = await graphqlClient.request<T>(query, variables);
    return result;
  } catch (error) {
    console.error("GraphQL request failed:", error);
    throw parseGraphQLError(error);
  }
}

// Helper to extract error message for display
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

// Helper to check if error is retryable
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isNetworkError || error.code === "SERVER_ERROR";
  }
  return false;
}

export default graphqlClient;
