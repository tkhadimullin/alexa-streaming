/**
 * Content Library
 * 
 * URLs are loaded from environment variables (set in Alexa Developer Console).
 * Content keys and titles are defined here for slot matching.
 * 
 * To configure URLs in Alexa Developer Console:
 * 1. Go to Code tab
 * 2. Click on "Environment Variables" (or set them in ask-resources.json)
 * 3. Add variables like:
 *    - STREAM_URL_OCEAN_SOUNDS=https://your-url.com/ocean.mp3
 *    - STREAM_URL_AIR_PLAY=https://your-url.com/airplay.mp3
 */

// Content definitions - add your content types here
// The key is used for slot matching, title for speech
const CONTENT_DEFINITIONS = {
    'ocean sounds': {
        title: 'Ocean Sounds',
        envVar: 'STREAM_URL_OCEAN_SOUNDS'
    },
    'air play': {
        title: 'Air Play Stream',
        envVar: 'STREAM_URL_AIR_PLAY'
    }
};

// Default content key
const DEFAULT_CONTENT = 'ocean sounds';

// Build content library with URLs from environment
function buildContentLibrary() {
    const library = {};
    for (const [key, def] of Object.entries(CONTENT_DEFINITIONS)) {
        const url = process.env[def.envVar];
        if (url) {
            library[key] = {
                url: url,
                title: def.title
            };
        } else {
            console.warn(`Missing environment variable: ${def.envVar} for content: ${key}`);
        }
    }
    return library;
}

const CONTENT_LIBRARY = buildContentLibrary();

// Helper to get content names for speech (only configured content)
function getContentListForSpeech() {
    const types = Object.keys(CONTENT_LIBRARY);
    if (types.length === 0) return 'nothing configured';
    if (types.length === 1) return types[0];
    const typesCopy = [...types];
    const last = typesCopy.pop();
    return typesCopy.join(', ') + ', or ' + last;
}

// Get content by key, returns null if not found or not configured
function getContent(key) {
    return CONTENT_LIBRARY[key] || null;
}

// Get all configured content keys
function getContentKeys() {
    return Object.keys(CONTENT_LIBRARY);
}

// Check if any content is configured
function hasContent() {
    return Object.keys(CONTENT_LIBRARY).length > 0;
}

// Get default content (may be null if not configured)
function getDefaultContent() {
    return CONTENT_LIBRARY[DEFAULT_CONTENT] || null;
}

module.exports = {
    CONTENT_LIBRARY,
    CONTENT_DEFINITIONS,
    DEFAULT_CONTENT,
    getContentListForSpeech,
    getContent,
    getContentKeys,
    hasContent,
    getDefaultContent,
};
