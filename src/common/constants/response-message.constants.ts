// Fallbacks for handlers that do not declare @ResponseMessage
export const DEFAULT_RESPONSE_MESSAGES: Record<string, string> = {
  GET: 'Request completed successfully',
  POST: 'Record created successfully',
  PUT: 'Record updated successfully',
  PATCH: 'Record updated successfully',
  DELETE: 'Record deleted successfully',
};

export const FALLBACK_RESPONSE_MESSAGE = 'Request completed successfully';
