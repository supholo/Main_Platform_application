// src/services/mockDb/errorConstants.ts
export const MOCK_DB_ERROR_CODES = {
    COLLECTION_NOT_FOUND: 'COLLECTION_NOT_FOUND',
    RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
    DUPLICATE_KEY: 'DUPLICATE_KEY',
    INVALID_ID: 'INVALID_ID',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNIQUE_CONSTRAINT: 'UNIQUE_CONSTRAINT'
  } as const;
  
  export const MOCK_DB_ERROR_MESSAGES = {
    [MOCK_DB_ERROR_CODES.COLLECTION_NOT_FOUND]: 'Collection not found',
    [MOCK_DB_ERROR_CODES.RECORD_NOT_FOUND]: 'Record not found',
    [MOCK_DB_ERROR_CODES.DUPLICATE_KEY]: 'Duplicate key error',
    [MOCK_DB_ERROR_CODES.INVALID_ID]: 'Invalid ID provided',
    [MOCK_DB_ERROR_CODES.VALIDATION_ERROR]: 'Validation error',
    [MOCK_DB_ERROR_CODES.UNIQUE_CONSTRAINT]: 'Unique constraint violation'
  } as const;
  
  export type MockDbErrorCode = keyof typeof MOCK_DB_ERROR_CODES;