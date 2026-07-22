// Creates @whiskeysockets/baileys alias in the CONSUMER's node_modules
// This runs from node_modules/megan-baileys/scripts/
// We need to go up 3 levels to reach the consumer's project root
const fs = require('fs');
const path = require('path');

// From: node_modules/megan-baileys/scripts/postinstall.js
// To:   node_modules/@whiskeysockets/baileys
const consumerRoot = path.join(__dirname, '..', '..', '..');
const targetDir = path.join(consumerRoot, 'node_modules', '@whiskeysockets');
const baileysDir = path.join(targetDir, 'baileys');

fs.mkdirSync(targetDir, { recursive: true });

// Remove old if exists
try { fs.rmSync(baileysDir, { recursive: true, force: true }); } catch(e) {}

fs.mkdirSync(baileysDir, { recursive: true });

// Write package.json that points back to megan-baileys
fs.writeFileSync(path.join(baileysDir, 'package.json'), JSON.stringify({
    name: "@whiskeysockets/baileys",
    version: "1.0.0",
    type: "module",
    main: "../../megan-baileys/lib/index.mjs",
    exports: {
        ".": {
            import: "../../megan-baileys/lib/index.mjs",
            require: "../../megan-baileys/lib/index.js"
        }
    }
}, null, 2));

console.log('✅ megan-baileys: @whiskeysockets/baileys alias ready at ' + baileysDir);
