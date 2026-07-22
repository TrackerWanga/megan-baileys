// ESM wrapper for megan-baileys
// Provides ESM-compatible exports for packages that expect @whiskeysockets/baileys

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load the CJS module
const cjsModule = require('./index.js');

// Re-export everything the ESM way
export const {
    makeWASocket,
    proto,
    generateWAMessageFromContent,
    generateWAMessage,
    generateWAMessageContent,
    prepareWAMessageMedia,
    normalizeMessageContent,
    getContentType,
    extractMessageContent,
    getDevice,
    generateMessageID,
    generateMessageIDV2,
    isJidGroup,
    isJidUser,
    jidNormalizedUser,
    jidDecode,
    jidEncode,
    Browsers,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    delay,
    DisconnectReason,
    default: makeWASocketDefault
} = cjsModule;

// Re-export sub-modules using require
export const WAProto = require('../WAProto/index.js');
export const Utils = require('./Utils/index.js');
export const Types = require('./Types/index.js');
export const Defaults = require('./Defaults/index.js');
export const WABinary = require('./WABinary/index.js');
export const WAM = require('./WAM/index.js');
export const WAUSync = require('./WAUSync/index.js');

export default makeWASocketDefault || makeWASocket;
