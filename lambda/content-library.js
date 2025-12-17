/**
 * Content Library - DynamoDB backed
 * 
 * Content is stored in DynamoDB table.
 * Table structure:
 *   - Partition Key: "id" (String) = "content-library"
 *   - Attribute: "content" (String) = JSON encoded content object
 *   - Attribute: "defaultContent" (String) = default content key
 * 
 * Example DynamoDB item:
 * {
 *   "id": "content-library",
 *   "content": "{\"ocean sounds\":{\"url\":\"https://example.com/ocean.mp3\",\"title\":\"Ocean Sounds\"}}",
 *   "defaultContent": "ocean sounds"
 * }
 */

const AWS = require('aws-sdk');

// DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Table name - Alexa-hosted skills use this format
// You may need to check your actual table name in AWS Console
const TABLE_NAME = process.env.DYNAMODB_PERSISTENCE_TABLE_NAME;

// Cache for content library (loaded once per Lambda cold start)
let cachedLibrary = null;
let cachedDefault = null;

/**
 * Load content library from DynamoDB
 */
async function loadContentLibrary() {
    if (cachedLibrary !== null) {
        return { library: cachedLibrary, defaultKey: cachedDefault };
    }

    try {
        const result = await dynamoDb.get({
            TableName: TABLE_NAME,
            Key: { id: 'content-library' }
        }).promise();

        if (result.Item) {
            // Parse JSON-encoded content string
            const contentStr = result.Item.content;
            try {
                cachedLibrary = JSON.parse(contentStr);
            } catch (e) {
                console.error('Failed to parse content JSON:', e);
                cachedLibrary = {};
            }
            cachedDefault = result.Item.defaultContent || Object.keys(cachedLibrary)[0] || null;
        } else {
            console.log('No content-library item found in DynamoDB');
            cachedLibrary = {};
            cachedDefault = null;
        }
    } catch (error) {
        console.error('Error loading content library from DynamoDB:', error);
        cachedLibrary = {};
        cachedDefault = null;
    }

    return { library: cachedLibrary, defaultKey: cachedDefault };
}

/**
 * Save content library to DynamoDB (for initial setup)
 */
async function saveContentLibrary(content, defaultContent) {
    try {
        await dynamoDb.put({
            TableName: TABLE_NAME,
            Item: {
                id: 'content-library',
                content: content,
                defaultContent: defaultContent
            }
        }).promise();
        // Clear cache so next read gets fresh data
        cachedLibrary = null;
        cachedDefault = null;
        return true;
    } catch (error) {
        console.error('Error saving content library to DynamoDB:', error);
        return false;
    }
}

// Helper to get content names for speech
async function getContentListForSpeech() {
    const { library } = await loadContentLibrary();
    const types = Object.keys(library);
    if (types.length === 0) return 'nothing configured';
    if (types.length === 1) return types[0];
    const typesCopy = [...types];
    const last = typesCopy.pop();
    return typesCopy.join(', ') + ', or ' + last;
}

// Get content by key
async function getContent(key) {
    const { library } = await loadContentLibrary();
    return library[key] || null;
}

// Get all configured content keys
async function getContentKeys() {
    const { library } = await loadContentLibrary();
    return Object.keys(library);
}

// Check if any content is configured
async function hasContent() {
    const { library } = await loadContentLibrary();
    return Object.keys(library).length > 0;
}

// Get default content
async function getDefaultContent() {
    const { library, defaultKey } = await loadContentLibrary();
    return defaultKey ? library[defaultKey] : null;
}

// Get default content key
async function getDefaultContentKey() {
    const { defaultKey } = await loadContentLibrary();
    return defaultKey;
}

module.exports = {
    loadContentLibrary,
    saveContentLibrary,
    getContentListForSpeech,
    getContent,
    getContentKeys,
    hasContent,
    getDefaultContent,
    getDefaultContentKey,
    TABLE_NAME,
};
