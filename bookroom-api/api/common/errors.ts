// bookroom-api/api/common/errors.ts
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class UnsupportedEngineError extends Error {
    constructor(engine: string) {
        super(`Search engine "${engine}" is not supported or configured.`);
        this.name = 'UnsupportedEngineError';
    }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed with search API") {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Search API rate limit exceeded") {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class UsageLimitError extends Error {
    constructor(message: string = "Search API usage limit exceeded") {
        super(message);
        this.name = 'UsageLimitError';
    }
}

export class ApiServerError extends Error {
  constructor(message: string = "Search API returned a server error") {
    super(message);
    this.name = 'ApiServerError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network error during search API call") {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiResponseParseError extends Error {
    constructor(message: string = "Failed to parse search API response") {
        super(message);
        this.name = 'ApiResponseParseError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
} 