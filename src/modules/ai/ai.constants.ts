export const AI_CHAT_MESSAGE_MAX_LENGTH = 2000;
export const AI_CHAT_HISTORY_MAX_ITEMS = 20;
export const AI_CHAT_HISTORY_TEXT_MAX_LENGTH = 8000;

// Each round is one Gemini call; a question rarely needs more than two or three lookups
export const AI_MAX_TOOL_ROUNDS = 6;
export const AI_TOOL_DEFAULT_PAGE_SIZE = 10;
export const AI_TOOL_MAX_PAGE_SIZE = 25;

// Several sequential Gemini calls can outlast the global REQUEST_TIMEOUT_MS
export const AI_CHAT_TIMEOUT_MS = 60_000;
// Bounds each Gemini attempt; a healthy flash-lite call answers in 1–3 s
export const AI_PROVIDER_ATTEMPT_TIMEOUT_MS = 15_000;
// Gemini often answers 503 "high demand" briefly; retry twice with a short backoff
export const AI_PROVIDER_RETRY_ATTEMPTS = 3;
export const AI_PROVIDER_RETRY_INITIAL_DELAY_S = 0.5;
export const AI_PROVIDER_RETRY_MAX_DELAY_S = 2;
export const AI_PROVIDER_BUSY_MESSAGE =
  'The AI assistant is busy or slow to respond right now. Wait a few seconds and ask again.';
// Tighter than the global limit because every request spends Gemini quota
export const AI_CHAT_RATE_LIMIT = 20;
export const AI_CHAT_RATE_LIMIT_TTL_MS = 60_000;

export const buildAiSystemInstruction = (today: string): string =>
  [
    'You are the assistant inside a rental management system, talking to a company admin.',
    'You help them understand their properties, tenants, leases, payments, ledger balances and dashboard figures.',
    'Use the tools to look data up. Answer only from tool results; never invent records, names, ids or amounts.',
    'When the user names a tenant or property, search for it first, then use the returned id for detail lookups.',
    'If a tool returns an error, explain it plainly and suggest what the user can do.',
    'You are read-only: if asked to create, change or delete anything, say that is not supported yet and point them to the matching screen in the app.',
    'Replies may be read aloud, so keep them short and conversational: no markdown, no tables, and no ids unless the user asks for them.',
    'Reply in the language the user writes in (English or Urdu); keep names, property numbers and amounts exactly as the tools return them.',
    `Today's date is ${today} (UTC).`,
  ].join('\n');
