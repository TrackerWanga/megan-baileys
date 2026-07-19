// Megan-Baileys Standalone Pairing Helper
// Generate a pair code without needing a full socket connection
const { default: makeWASocket, fetchLatestBaileysVersion, useMultiFileAuthState } = require('../Socket');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Generate a pairing code for a phone number (standalone — no socket needed by caller)
 * @param {string} phoneNumber - Phone number with country code, no + sign (e.g., "254712345678")
 * @param {object} options - Optional config
 * @param {string} options.customCode - Custom 8-char pairing code
 * @param {number} options.timeoutMs - Timeout in ms (default 60000)
 * @returns {Promise<{ code: string, creds: object }>} Pair code and credentials
 */
async function generatePairingCode(phoneNumber, options = {}) {
    const { customCode, timeoutMs = 60000 } = options;

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'megan-pair-'));
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            browser: ['Ubuntu', 'Chrome', '22.04.4'],
            connectTimeoutMs: timeoutMs,
            logger: require('pino')({ level: 'silent' }),
            printQRInTerminal: false
        });

        const code = await sock.requestPairingCode(phoneNumber, customCode);

        // Wait for pairing to complete
        const creds = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error('Pairing timed out. User did not enter the code.'));
            }, timeoutMs);

            sock.ev.on('creds.update', (updatedCreds) => {
                if (updatedCreds.me && updatedCreds.registered) {
                    clearTimeout(timer);
                    cleanup();
                    resolve(updatedCreds);
                }
            });

            sock.ev.on('connection.update', ({ connection }) => {
                if (connection === 'close') {
                    clearTimeout(timer);
                    cleanup();
                    reject(new Error('Connection closed before pairing completed'));
                }
            });

            async function cleanup() {
                try { await sock.end(); } catch (e) {}
                try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
            }
        });

        return { code, creds };

    } catch (error) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
        throw error;
    }
}

module.exports = { generatePairingCode };
