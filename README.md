# megan-baileys

> A lightweight, modern WhatsApp Web API with native multi-session support. Built on the latest WhatsApp protocol with a clean, intuitive API.

[![npm version](https://img.shields.io/npm/v/megan-baileys.svg)](https://www.npmjs.com/package/megan-baileys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Total Downloads](https://img.shields.io/npm/dt/megan-baileys.svg)](https://www.npmjs.com/package/megan-baileys)

**Created by [TrackerWanga](https://github.com/TrackerWanga)**

---

## 🌐 Megan Ecosystem

Explore the complete Megan toolkit for building powerful WhatsApp automations:

| Tool | Purpose | Link |
|------|---------|------|
| **megan-baileys** | WhatsApp Web API library | [baileys.megan.qzz.io](https://baileys.megan.qzz.io) |
| **megan-apis** | REST API toolkit for bots | [apis.megan.qzz.io](https://apis.megan.qzz.io) |
| **MEGAN AI** | AI chatbot integration | [ai.megan.qzz.io](https://ai.megan.qzz.io) |
| **MEGAN MD** | Session generator & QR tool | Built with megan-baileys |

---

## ✨ Key Features

- **Pair Code & QR Login** — Link devices with or without scanning QR codes
- **Complete Message Support** — Text, images, videos, stickers, polls, reactions, and more
- **Interactive Buttons** — Quick replies, call-to-action links, copy buttons, and dropdown lists
- **Smart Group Control** — Add/remove members, manage roles, update metadata
- **Newsletter Support** — Follow channels, react to posts, and manage subscriptions
- **Message Recovery** — Catch deleted messages and view-once media before they disappear
- **Multi-Device Resolution** — Automatic LID to JID conversion for proper participant detection
- **Session Management** — Encode/decode `Megan~` session strings for easy portability
- **Standalone Pair Generator** — Create pair codes without managing a full socket connection
- **Lightweight Design** — 99 files instead of 300+
- **Latest Protocol** — v2.3000.1035194821+ with continuous updates
- **API Compatible** — Drop-in replacement for Gifted Baileys

---

## 📦 Installation

```bash
npm install megan-baileys
```

---

## 🚀 Quick Start

### Basic Bot

Get up and running in minutes with a simple message handler:

```js
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('megan-baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4'],
        printQRInTerminal: true,
        markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!');
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            } else {
                console.log('❌ Logged out. Please re-scan QR.');
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        if (text === '!ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
        }
    });

    return sock;
}

startBot().catch(console.error);
```

### Pair Code Login (No QR Scan)

Link your device with a simple code instead of scanning QR:

```js
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('megan-baileys');

async function pairWithCode(phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    // Request pair code for a phone number (no + sign)
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`📱 Your pair code: ${code}`);
    console.log('Enter this in WhatsApp → Linked Devices → Link a Device');

    sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') {
            console.log('✅ Paired successfully!');
            saveCreds();
        }
    });

    return sock;
}

pairWithCode('254712345678');
```

### Standalone Pair Code Generation

Generate a pair code without managing a socket:

```js
const { generatePairingCode } = require('megan-baileys');

const { code, creds } = await generatePairingCode('254712345678');
console.log(`Pair code: ${code}`);
// Share the code with your user, then save the credentials
```

---

## 💾 Session Management

### File-Based Authentication

The simplest way to manage sessions:

```js
const { useMultiFileAuthState } = require('megan-baileys');

const { state, saveCreds } = await useMultiFileAuthState('./my-session');
// Credentials are automatically saved to ./my-session/creds.json
```

### Using Megan~ Session Strings

Export and import sessions as portable strings:

```js
const { decodeSession, encodeSession, isValidSession } = require('megan-baileys');

// Decode a Megan~ session string
const creds = decodeSession('Megan~H4sIAAAAAAAAA5VU...');
console.log('Phone:', creds.me.id);
console.log('Registered:', creds.registered);

// Encode credentials back to a Megan~ string
const sessionString = encodeSession(creds);
console.log(sessionString); // Megan~H4sIAAAAAAAAA5VU...

// Validate format before use
console.log(isValidSession('Megan~...')); // true
console.log(isValidSession('invalid'));   // false
```

---

## 📨 Messaging Features

### Interactive Buttons

Create engaging messages with interactive button responses:

```js
const { sendButtons } = require('megan-baileys');

await sendButtons(sock, jid, {
    title: 'Main Menu',
    text: 'Choose an option:',
    footer: '> Powered by megan-baileys',
    image: { url: 'https://example.com/icon.jpg' }, // optional
    aimode: false,
    buttons: [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '📋 Menu',
                id: 'menu'
            })
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: '🌐 Website',
                url: 'https://baileys.megan.qzz.io'
            })
        },
        {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: '📋 Copy Code',
                copy_code: 'Megan~abc123'
            })
        }
    ]
});
```

### Advanced Interactive Messages

Combine multiple button types in a single message:

```js
const { sendInteractiveMessage } = require('megan-baileys');

await sendInteractiveMessage(sock, jid, {
    text: 'Advanced options available',
    footer: 'Pick one or explore more',
    interactiveButtons: [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Hello', id: 'hi' }) },
        { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Docs', url: 'https://example.com' }) },
        { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: 'Copy', copy_code: 'ABC' }) },
        { name: 'cta_call', buttonParamsJson: JSON.stringify({ display_text: 'Call', phone_number: '+254712345678' }) },
        {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Choose One',
                sections: [{
                    title: 'Options',
                    rows: [
                        { id: 'a', title: 'Alpha', description: 'First option' },
                        { id: 'b', title: 'Beta', description: 'Second option' }
                    ]
                }]
            })
        }
    ]
});
```

### Media Downloads

Capture images, videos, and other media from messages:

```js
const { downloadMediaMessage } = require('megan-baileys');
const fs = require('fs');

sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message?.imageMessage) return;

    const buffer = await downloadMediaMessage(msg, 'buffer', {});
    fs.writeFileSync(`image_${Date.now()}.jpg`, buffer);
    console.log('✅ Image saved!');
});
```

### Message Reactions

React to messages with emojis:

```js
await sock.sendMessage(jid, {
    react: {
        key: msg.key,
        text: '👍'
    }
});
```

---

## 👥 Group Management

Control group membership and settings:

```js
// Get group information
const metadata = await sock.groupMetadata('123456789@g.us');
console.log(`Group: ${metadata.subject}`);
console.log(`Members: ${metadata.participants.length}`);

// Manage members
await sock.groupParticipantsUpdate('123456789@g.us', ['254712345678@s.whatsapp.net'], 'add');
await sock.groupParticipantsUpdate('123456789@g.us', ['254712345678@s.whatsapp.net'], 'remove');

// Manage roles
await sock.groupParticipantsUpdate('123456789@g.us', ['254712345678@s.whatsapp.net'], 'promote');
await sock.groupParticipantsUpdate('123456789@g.us', ['254712345678@s.whatsapp.net'], 'demote');

// Update group information
await sock.groupUpdateSubject('123456789@g.us', 'New Group Name');
await sock.groupUpdateDescription('123456789@g.us', 'Updated description');

// Leave the group
await sock.groupLeave('123456789@g.us');
```

---

## 📡 Newsletters & Channels

Subscribe to and interact with newsletters:

```js
const { isJidNewsletter } = require('megan-baileys');

// Follow a newsletter
await sock.newsletterFollow('120363xxx@newsletter');

// React to a newsletter message
await sock.newsletterReactMessage('120363xxx@newsletter', 'message_server_id', '❤️');

// Check if a JID is a newsletter
console.log(isJidNewsletter('120363xxx@newsletter')); // true
```

---

## 🎯 Presence & Status

### Typing & Recording Indicators

Show users what you're doing:

```js
// Show typing indicator
await sock.sendPresenceUpdate('composing', jid);

// Show recording indicator
await sock.sendPresenceUpdate('recording', jid);
```

### Update Profile Status

Set your bot's online status or bio:

```js
await sock.updateProfileStatus('Online • Powered by megan-baileys');
```

---

## 🔌 Connection Events

Handle all connection state changes and incoming data:

```js
sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    // connection: 'open' | 'close' | 'connecting'
    // qr: QR code string when available
});

sock.ev.on('creds.update', (creds) => {
    // Credentials were updated — persist them immediately
});

sock.ev.on('messages.upsert', ({ messages, type }) => {
    // type: 'notify' (new messages) | 'append' (historical)
});

sock.ev.on('messages.update', (updates) => {
    // Status changes, reactions, edits, and deletions
});

sock.ev.on('messages.delete', (deleteData) => {
    // Messages were deleted
});

sock.ev.on('group-participants.update', ({ id, participants, action }) => {
    // action: 'add' | 'remove' | 'promote' | 'demote'
});

sock.ev.on('call', (calls) => {
    // Incoming voice or video calls
});
```

---

## 🖥️ Browser Configurations

Customize how your bot appears to WhatsApp:

```js
const { Browsers } = require('megan-baileys');

browser: Browsers.macOS('Chrome')    // Appear as Safari on macOS
browser: Browsers.ubuntu('Chrome')   // Appear as Chrome on Ubuntu
browser: Browsers.windows('Chrome')  // Appear as Edge on Windows
browser: ['MyBot', 'Chrome', '1.0']  // Custom browser name
```

---

## 📚 Complete API Reference

### Core Functions

| Function | Purpose |
|----------|---------|
| `makeWASocket()` | Create a WhatsApp socket connection |
| `useMultiFileAuthState()` | Manage file-based session state |
| `fetchLatestBaileysVersion()` | Get the latest WhatsApp protocol version |
| `generatePairingCode()` | Generate a pair code without a socket |

### Session Utilities

| Function | Purpose |
|----------|---------|
| `decodeSession()` | Parse a Megan~ session string |
| `encodeSession()` | Convert credentials to Megan~ format |
| `isValidSession()` | Validate session string format |

### Messaging

| Function | Purpose |
|----------|---------|
| `sendButtons()` | Send interactive button messages |
| `sendInteractiveMessage()` | Advanced multi-button messages |
| `downloadMediaMessage()` | Extract media from received messages |

### Utilities

| Function | Purpose |
|----------|---------|
| `isJidGroup()` | Check if a JID is a group |
| `isJidNewsletter()` | Check if a JID is a newsletter |
| `isJidBroadcast()` | Check if a JID is a broadcast |
| `jidEncode()` / `jidDecode()` | Convert between JID formats |

### Enums

- `DisconnectReason` — Connection failure codes
- `Browsers` — Pre-configured browser profiles

See the full documentation at [baileys.megan.qzz.io](https://baileys.megan.qzz.io)

---

## 🤖 Integration with Megan APIs

Extend your bot with external services:

```js
const axios = require('axios');

// AI Chat API
async function aiChat(prompt) {
    const { data } = await axios.get(
        `https://ai.megan.qzz.io/chat?q=${encodeURIComponent(prompt)}`
    );
    return data.response;
}

// Weather API
async function getWeather(city) {
    const { data } = await axios.get(
        `https://apis.megan.qzz.io/weather?city=${encodeURIComponent(city)}`
    );
    return data;
}
```

---

## 📄 License

MIT — Use freely, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## 🙏 Support & Contribution

Have questions or found a bug? Open an issue on [GitHub](https://github.com/TrackerWanga/megan-baileys).

⭐ If this project helped you build something amazing, consider starring the repo!

---

**Built with ❤️ by [TrackerWanga](https://github.com/TrackerWanga)**
