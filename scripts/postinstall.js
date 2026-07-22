// Creates @whiskeysockets/baileys alias pointing to megan-baileys
// This is needed for packages like gifted-btns that import from @whiskeysockets/baileys
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', '@whiskeysockets');
const alias = path.join(target, 'baileys');

fs.mkdirSync(target, { recursive: true });
try { fs.rmSync(alias, { recursive: true, force: true }); } catch(e) {}
fs.mkdirSync(alias, { recursive: true });

fs.writeFileSync(path.join(alias, 'package.json'), JSON.stringify({
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

console.log('✅ megan-baileys: @whiskeysockets/baileys alias ready');
