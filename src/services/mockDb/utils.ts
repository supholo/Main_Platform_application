// src/services/mockDb/utils.ts
import { MockDbRecord, MockDbError, CollectionName } from './types';
import { MOCK_DB_ERROR_CODES, MOCK_DB_ERROR_MESSAGES } from './errorConstants';

export function validateId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

export function validateRecord(record: MockDbRecord): void {
  if (!validateId(record.id)) {
    throw new MockDbError(
      MOCK_DB_ERROR_MESSAGES[MOCK_DB_ERROR_CODES.INVALID_ID],
      MOCK_DB_ERROR_CODES.INVALID_ID
    );
  }
}

export function createMockDbError(
  code: keyof typeof MOCK_DB_ERROR_CODES,
  collection?: CollectionName,
  additionalMessage?: string
): MockDbError {
  const baseMessage = MOCK_DB_ERROR_MESSAGES[code];
  const message = additionalMessage ? `${baseMessage}: ${additionalMessage}` : baseMessage;
  return new MockDbError(message, code, collection);
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}