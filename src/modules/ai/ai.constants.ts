import { AiTranscriptScript } from '../../common/enums/ai-transcript-script.enum.js';

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
    'Match the language and script of the user\'s latest message: English gets English, Urdu script gets Urdu script, and Roman Urdu (Urdu written in Latin letters, e.g. "kis ka kiraya baqi hai") gets Roman Urdu. Mixed Urdu-English is normal; reply in the same mix.',
    'Keep names, property numbers and amounts exactly as the tools return them.',
    `Today's date is ${today} (UTC).`,
  ].join('\n');

// 30 s of 16 kHz 16-bit mono WAV is ~1.28 M base64 characters; the margin covers headers and rounding
export const AI_AUDIO_BASE64_MAX_LENGTH = 1_400_000;
export const AI_AUDIO_MIME_TYPE_PATTERN = /^audio\/(wav|x-wav|mpeg|mp3|aac|ogg|flac|aiff|webm)(;.*)?$/i;
// ~35 s of 24 kHz WAV (~2.2 MB as base64), well under Vercel's 4.5 MB response cap
export const AI_SPEECH_TEXT_MAX_LENGTH = 600;
// A mic's noise floor peaks around 0.005–0.01; quiet speech still peaks above 0.05
export const AI_SILENCE_PEAK_LEVEL = 0.02;
// Gemini is told to answer this sentinel instead of inventing words for a silent clip
export const AI_NO_SPEECH_SENTINEL = 'NO_SPEECH';
// A spoken reply is generated in one pass and can take longer than a chat call
export const AI_SPEECH_ATTEMPT_TIMEOUT_MS = 45_000;
export const AI_SPEECH_ROUTE_TIMEOUT_MS = 100_000;

const TRANSCRIPT_SCRIPT_RULES: Record<AiTranscriptScript, string> = {
  [AiTranscriptScript.URDU]:
    'Write every Urdu word in Urdu (Perso-Arabic) script, never in Latin letters. Example: "اس مہینے کس کا کرایہ باقی ہے؟"',
  [AiTranscriptScript.ROMAN]:
    'Write every Urdu word in Roman Urdu: Latin letters, the way Pakistanis type in chat. Example: "is mahine kis ka kiraya baqi hai?"',
};

export const buildAiTranscriptionPrompt = (script: AiTranscriptScript): string =>
  [
    TRANSCRIPT_SCRIPT_RULES[script],
    'Transcribe the speech in this recording exactly as spoken.',
    'The speaker is in Pakistan and may use Urdu, English or a mix of both in one sentence.',
    'Keep English words in English, and keep names, amounts and property numbers such as P-0001 as spoken.',
    'Do not answer, translate, summarise or add anything.',
    `If there is no intelligible speech, output exactly ${AI_NO_SPEECH_SENTINEL}.`,
    'Output only the transcript.',
  ].join('\n');

// Gemini TTS speaks only the TRANSCRIPT section; inline instructions were sometimes read aloud with the reply
export const buildAiSpeechPrompt = (text: string): string =>
  [
    "### DIRECTOR'S NOTES (never spoken)",
    'Voice: warm and clear, with a natural Pakistani Urdu accent.',
    'Pronunciation: Urdu in Urdu script or Roman Urdu as a native Urdu speaker says it; English words as a Pakistani speaker says them.',
    'Speak only the transcript below, word for word. Do not read these notes, answer, translate or add anything.',
    '',
    '#### TRANSCRIPT',
    text,
  ].join('\n');
