// Megan-Baileys Session Utilities
const zlib = require('zlib');

/**
 * Decode a Megan~ session string to creds object
 * @param {string} sessionString - The Megan~H4sI... session
 * @returns {object} Decoded credentials
 */
function decodeSession(sessionString) {
    const base64Data = sessionString.replace('Megan~', '');
    const buffer = Buffer.from(base64Data, 'base64');
    const decompressed = zlib.gunzipSync(buffer);
    return JSON.parse(decompressed.toString('utf8'));
}

/**
 * Encode creds object to Megan~ session string
 * @param {object} creds - The credentials object
 * @returns {string} Megan~ session string
 */
function encodeSession(creds) {
    const json = JSON.stringify(creds);
    const compressed = zlib.gzipSync(Buffer.from(json, 'utf8'));
    return 'Megan~' + compressed.toString('base64');
}

/**
 * Validate a session string format
 * @param {string} sessionString 
 * @returns {boolean}
 */
function isValidSession(sessionString) {
    if (!sessionString || typeof sessionString !== 'string') return false;
    if (!sessionString.startsWith('Megan~')) return false;
    try {
        const base64Part = sessionString.replace('Megan~', '');
        Buffer.from(base64Part, 'base64');
        return true;
    } catch {
        return false;
    }
}

module.exports = { decodeSession, encodeSession, isValidSession };
