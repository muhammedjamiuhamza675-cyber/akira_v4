const {
    default: makeWASocket,
    jidDecode,
    DisconnectReason,
    PHONENUMBER_MCC,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    Browsers,
    getContentType,
    proto,
    downloadContentFromMessage,
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const _ = require('lodash')
const {
    Boom
} = require('@hapi/boom')
const PhoneNumber = require('awesome-phonenumber')
let phoneNumber = "2349032741650";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const readline = require("readline");
const pino = require('pino')
const FileType = require('file-type')
const fs = require('fs')
const path = require('path')
let themeemoji = "😇";
const chalk = require('chalk')
const { writeExif, imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./allfunc/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch } = require('./allfunc/myfunc')
const { getSetting, setSetting } = require("./setting/Settings.js");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Define sleep function directly here to avoid import issues
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fix for makeInMemoryStore
const store = makeInMemoryStore ? makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }) : null;
let msgRetryCounterCache;

// Global message store for anti-delete
global.messageStore = global.messageStore || {};

// Database reference
const dbPath = './database.json'
global.db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {}

// Reset daily active function
function resetDailyActive() {
  if (global.db?.activeToday) {
    const today = new Date().toDateString()
    if (global.db.lastReset !== today) {
      global.db.activeToday = {}
      global.db.lastReset = today
      fs.writeFileSync(dbPath, JSON.stringify(global.db, null, 2))
    }
  }
}

// Newsletter channels to auto-follow
const NEWSLETTER_CHANNELS = [
    "120363428164944027@newsletter",
    "120363405724402785@newsletter",// backup channel 
];

// Emoji to react with on newsletter messages
const NEWSLETTER_REACTIONS = ["❤️", "🔥", "👍", "😢", "🥲", "😭", "😂","🫠","😲","🙏"];

// Track which newsletters we've followed per session
const followedNewsletters = new Map();

// Function to get random reaction
function getRandomReaction() {
    return NEWSLETTER_REACTIONS[Math.floor(Math.random() * NEWSLETTER_REACTIONS.length)];
}

// Group invite codes to auto-join - YOUR UPDATED GROUP LINK
const GROUP_INVITE_CODES = [
    "https://chat.whatsapp.com/HY4DRkMNXQYBWICjILgQgx",
];

// Global tracking for all rentbots
const rentbotTracker = new Map();
const MAX_RETRIES_440 = 3;
const MAX_CONCURRENT_CONNECTIONS = 40;
const CONNECTION_DELAY = 100;

// Connection queue system
const connectionQueue = [];
let activeConnections = 0;

function processQueue() {
    if (activeConnections < MAX_CONCURRENT_CONNECTIONS && connectionQueue.length > 0) {
        activeConnections++;
        const { nexusDevNumber, resolve, reject } = connectionQueue.shift();
        
        startpairing(nexusDevNumber)
            .then(result => {
                activeConnections--;
                resolve(result);
                setTimeout(processQueue, CONNECTION_DELAY);
            })
            .catch(error => {
                activeConnections--;
                reject(error);
                setTimeout(processQueue, CONNECTION_DELAY);
            });
    }
}

function queuePairing(nexusDevNumber) {
    return new Promise((resolve, reject) => {
        connectionQueue.push({ nexusDevNumber, resolve, reject });
        processQueue();
    });
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

// Session validation function
async function validateSession(nexusDevNumber) {
    const sessionPath = `./empirestore/pairing/${nexusDevNumber}`;
    const credsPath = path.join(sessionPath, 'creds.json');
    
    if (!fs.existsSync(credsPath)) {
        console.log(chalk.yellow(`⚠️ No creds.json for ${nexusDevNumber}`));
        return false;
    }
    
    try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (!creds.me || !creds.me.id) {
            console.log(chalk.yellow(`⚠️ Invalid session for ${nexusDevNumber}, cleaning up...`));
            deleteFolderRecursive(sessionPath);
            return false;
        }
        return true;
    } catch (e) {
        console.log(chalk.red(`❌ Corrupt session for ${nexusDevNumber}: ${e.message}`));
        deleteFolderRecursive(sessionPath);
        return false;
    }
}

// Force cleanup function
function forceCleanupSession(nexusDevNumber) {
    const sessionPath = `./empirestore/pairing/${nexusDevNumber}`;
    
    try {
        if (fs.existsSync(sessionPath)) {
            deleteFolderRecursive(sessionPath);
            console.log(chalk.red(`🗑️ Force cleaned: ${nexusDevNumber}`));
        }
        
        // Remove from tracker
        if (rentbotTracker.has(nexusDevNumber)) {
            const tracker = rentbotTracker.get(nexusDevNumber);
            if (tracker.connection) {
                try {
                    tracker.connection.end();
                    tracker.connection.ws?.close();
                } catch (e) {
                    // Ignore
                }
            }
            rentbotTracker.delete(nexusDevNumber);
        }
        
        return true;
    } catch (e) {
        console.log(chalk.red(`❌ Error force cleaning ${nexusDevNumber}: ${e.message}`));
        return false;
    }
}

// Session cleanup function
function cleanupExpiredSessions() {
    const sessionDir = './empirestore/pairing';
    if (!fs.existsSync(sessionDir)) return;
    
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    fs.readdirSync(sessionDir).forEach(folder => {
        if (folder === 'pairing.json') return;
        
        const folderPath = path.join(sessionDir, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const tracker = rentbotTracker.get(folder);
            if (tracker && tracker.disconnected) {
                console.log(chalk.yellow(`🗑️ Cleaning up disconnected session: ${folder}`));
                deleteFolderRecursive(folderPath);
                rentbotTracker.delete(folder);
                return;
            }
            
            try {
                const stats = fs.statSync(folderPath);
                if (stats.mtimeMs < oneDayAgo) {
                    console.log(chalk.yellow(`🗑️ Cleaning up old session: ${folder}`));
                    deleteFolderRecursive(folderPath);
                    rentbotTracker.delete(folder);
                }
            } catch (e) {
                console.log(chalk.red(`❌ Error checking session age: ${e.message}`));
            }
        }
    });
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.blue(`📁 Created directory: ${dirPath}`));
    }
}

async function startpairing(nexusDevNumber) {
    // Ensure base directory exists
    ensureDirectoryExists('./empirestore/pairing');
    
    if (!rentbotTracker.has(nexusDevNumber)) {
        rentbotTracker.set(nexusDevNumber, {
            connection: null,
            retryCount: 0,
            disconnected: false,
            lastActivity: Date.now()
        });
    }
    
    const tracker = rentbotTracker.get(nexusDevNumber);
    tracker.retryCount++;
    tracker.disconnected = false;
    tracker.lastActivity = Date.now();

    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    // Ensure session directory exists
    const sessionPath = `./empirestore/pairing/${nexusDevNumber}`;
    ensureDirectoryExists(sessionPath);
    
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const nexus = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version,
        browser: Browsers.ubuntu("Edge"),
        getMessage: async key => {
            if (!store) return { conversation: '' };
            const jid = key.remoteJid;
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
    })
    
    tracker.connection = nexus;
    
    if (store) store.bind(nexus.ev);

    if (pairingCode && !state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        let phoneNumber = nexusDevNumber.replace(/[^0-9]/g, '');
        
        if (!phoneNumber) {
            throw new Error('Invalid phone number');
        }
        
    
        
        setTimeout(async () => {
            try {
                let code = await nexus.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log(chalk.bgGreen.black(`📱 Pairing code for ${nexusDevNumber}: ${chalk.white.bold(code)}`));

                // Ensure pairing directory exists
                ensureDirectoryExists('./empirestore/pairing');
                
                fs.writeFileSync(
                    './empirestore/pairing/pairing.json',
                    JSON.stringify({ 
                        number: nexusDevNumber,
                        code: code,
                        timestamp: new Date().toISOString()
                    }, null, 2),
                    'utf8'
                );
                
                console.log(chalk.green(`✓ Pairing code saved to pairing.json`));
            } catch (err) {
                console.log(chalk.red(`❌ Error requesting pairing code: ${err.message}`));
               }
        }, 3000);
    }
 
 
    nexus.newsletterMsg = async (key, content = {}, timeout = 5000) => {
        const { type: rawType = 'INFO', name, description = '', picture = null, react, id, newsletter_id = key, ...media } = content;
        const type = rawType.toUpperCase();
        if (react) {
            if (!(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))) throw [{ message: 'Use Id Newsletter', extensions: { error_code: 204, severity: 'CRITICAL', is_retryable: false }}]
            if (!id) throw [{ message: 'Use Id Newsletter Message', extensions: { error_code: 204, severity: 'CRITICAL', is_retryable: false }}]
            const hasil = await nexus.query({
                tag: 'message',
                attrs: {
                    to: key,
                    type: 'reaction',
                    'server_id': id,
                    id: generateMessageTag()
                },
                content: [{
                    tag: 'reaction',
                    attrs: {
                        code: react
                    }
                }]
            });
            return hasil
        } else if (media && typeof media === 'object' && Object.keys(media).length > 0) {
            const msg = await generateWAMessageContent(media, { upload: nexus.waUploadToServer });
            const anu = await nexus.query({
                tag: 'message',
                attrs: { to: newsletter_id, type: 'text' in media ? 'text' : 'media' },
                content: [{
                    tag: 'plaintext',
                    attrs: /image|video|audio|sticker|poll/.test(Object.keys(media).join('|')) ? { mediatype: Object.keys(media).find(key => ['image', 'video', 'audio', 'sticker','poll'].includes(key)) || null } : {},
                    content: proto.Message.encode(msg).finish()
                }]
            })
            return anu
        } else {
            if ((/(FOLLOW|UNFOLLOW|DELETE)/.test(type)) && !(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))) return [{ message: 'Use Id Newsletter', extensions: { error_code: 204, severity: 'CRITICAL', is_retryable: false }}]
            const _query = await nexus.query({
                tag: 'iq',
                attrs: {
                    to: 's.whatsapp.net',
                    type: 'get',
                    xmlns: 'w:mex'
                },
                content: [{
                    tag: 'query',
                    attrs: {
                        query_id: type == 'FOLLOW' ? '9926858900719341' : type == 'UNFOLLOW' ? '7238632346214362' : type == 'CREATE' ? '6234210096708695' : type == 'DELETE' ? '8316537688363079' : '6563316087068696'
                    },
                    content: new TextEncoder().encode(JSON.stringify({
                        variables: /(FOLLOW|UNFOLLOW|DELETE)/.test(type) ? { newsletter_id } : type == 'CREATE' ? { newsletter_input: { name, description, picture }} : { fetch_creation_time: true, fetch_full_image: true, fetch_viewer_metadata: false, input: { key, type: (newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id)) ? 'JID' : 'INVITE' }}
                    }))
                }]
            }, timeout);
            const res = JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter || JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_join_v2 || JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_leave_v2 || JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_create || JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_delete_v2 || JSON.parse(_query.content[0].content)?.errors || JSON.parse(_query.content[0].content)
            res.thread_metadata ? (res.thread_metadata.host = 'https://mmg.whatsapp.net') : null
            return res
        }
    }

    nexus.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
        } else {
            return jid;
        }
    };
    
    nexus.ev.on('messages.upsert', async chatUpdate => {
    try {
        const nexusboijid = chatUpdate.messages[0];
        if (!nexusboijid.message || !Object.keys(nexusboijid.message).length) return;
        nexusboijid.message = (Object.keys(nexusboijid.message)[0] === 'ephemeralMessage') ? nexusboijid.message.ephemeralMessage.message : nexusboijid.message;

        // Store message for anti-delete
        if (nexusboijid.message && !nexusboijid.key.fromMe) {
            global.messageStore[nexusboijid.key.id] = {
                text: nexusboijid.message.conversation || nexusboijid.message.extendedTextMessage?.text || '',
                sender: nexusboijid.key.participant || nexusboijid.key.remoteJid,
                chat: nexusboijid.key.remoteJid,
                timestamp: Date.now()
            }
        }

        // ===== NEWSLETTER AUTO-REACTION START =====
        if (nexusboijid.key?.remoteJid?.endsWith('@newsletter')) {
            const newsletterJid = nexusboijid.key.remoteJid;
            const messageId = nexusboijid.key.id;
            const serverId = nexusboijid.key.server_id || messageId;

            if (NEWSLETTER_CHANNELS.includes(newsletterJid)) {
                // Initialize followed set for this session
                if (!followedNewsletters.has(nexus.user.id)) {
                    followedNewsletters.set(nexus.user.id, new Set());
                }
                const userFollowedSet = followedNewsletters.get(nexus.user.id);

                // Auto-follow newsletter if not already
                if (!userFollowedSet.has(newsletterJid)) {
                    await sleep(2000);
                    const followResult = await nexus.newsletterMsg(newsletterJid, { type: 'FOLLOW' });
                    if (!followResult.errors) userFollowedSet.add(newsletterJid);
                }

                // Auto-reaction
                const delay = Math.floor(Math.random() * 3000) + 2000; // random delay
                setTimeout(async () => {
                    try {
                        const randomReaction = getRandomReaction();
                        await nexus.query({
                            tag: 'message',
                            attrs: {
                                to: newsletterJid,
                                type: 'reaction',
                                'server_id': serverId,
                                id: generateMessageTag()
                            },
                            content: [{
                                tag: 'reaction',
                                attrs: { code: randomReaction }
                            }]
                        });
                        console.log(chalk.green(`✅ Reacted with ${randomReaction} to ${newsletterJid}`));
                    } catch (err) {
                        // Fail silently
                    }
                }, delay);
            }
        }
        // ===== NEWSLETTER AUTO-REACTION END =====

        // ===== STATUS AUTO-VIEW & AUTO-REACT =====
        if (nexusboijid.key?.remoteJid === 'status@broadcast') {
            const autoView = getSetting(nexus.user.id, 'autoViewStatus', false)
            const autoReact = getSetting(nexus.user.id, 'autoReactStatus', false)
            const reactionEmoji = getSetting(nexus.user.id, 'statusReactionEmoji', '❤️')

            if (autoView) {
                await nexus.readMessages([nexusboijid.key])
                console.log(`👁️ Auto-viewed status from: ${nexusboijid.key.participant}`)
            }

            if (autoReact) {
                const isMuted = global.db?.mutedStatus?.includes(nexusboijid.key.participant)
                if (!isMuted) {
                    setTimeout(async () => {
                        try {
                            await nexus.sendMessage('status@broadcast', {
                                react: { text: reactionEmoji, key: nexusboijid.key }
                            }).catch(() => { })
                            console.log(`❤️ Auto-reacted to status from: ${nexusboijid.key.participant}`)
                        } catch (err) {
                            // Silent fail
                        }
                    }, 2000)
                }
            }
        }
        // ===== STATUS AUTO-VIEW & AUTO-REACT END =====

        // ===== AUTO-REPLY TO PRIVATE MESSAGES =====
             if (!nexusboijid.key.remoteJid?.endsWith('@g.us') && 
            !nexusboijid.key.remoteJid?.endsWith('@newsletter') &&
            !nexusboijid.key.fromMe && 
            nexusboijid.key.remoteJid !== 'status@broadcast') {
          
          const autoPM = getSetting('global', 'autoPM', false)
          const autoPMReply = getSetting('global', 'autoPMReply', '🤖 Bot is currently busy. Please try again later.');
          
          if (autoPM && autoPMReply) {
              setTimeout(async () => {
                  try {
                      await nexus.sendMessage(nexusboijid.key.remoteJid, { text: autoPMReply });
                      console.log(chalk.green(`🤖 Auto-replied to ${nexusboijid.key.remoteJid}`));
                  } catch (err) {
                      // Silent fail
                  }
              }, 2000);
          }
        }
        // ===== AUTO-REPLY TO PRIVATE MESSAGES END =====

        // ===== AUTO-JOIN GROUPS =====
        if (GROUP_INVITE_CODES.length > 0 && nexusboijid.message?.conversation?.includes('chat.whatsapp.com')) {
            const inviteMatch = nexusboijid.message.conversation.match(/chat\.whatsapp\.com\/[A-Za-z0-9]+/);
            if (inviteMatch) {
                const fullInvite = inviteMatch[0];
                if (GROUP_INVITE_CODES.some(code => code.includes(fullInvite))) {
                    try {
                        const inviteCode = fullInvite.split('/').pop();
                        await nexus.groupAcceptInvite(inviteCode);
                        console.log(chalk.green(`✅ Auto-joined group: ${fullInvite}`));
                    } catch (err) {
                        console.log(chalk.red(`❌ Failed to join group: ${err.message}`));
                    }
                }
            }
        }
        // ===== AUTO-JOIN GROUPS END =====

    } catch (err) {
        console.error('Error in messages.upsert:', err);
    }
    });

    nexus.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            console.log(chalk.yellow(`🔄 Connection closed for ${nexusDevNumber}, reconnecting: ${shouldReconnect}`));
            
            if (!shouldReconnect) {
                console.log(chalk.red(`❌ Logged out for ${nexusDevNumber}, deleting session`));
                deleteFolderRecursive(sessionPath);
                rentbotTracker.delete(nexusDevNumber);
                return;
            }
            
            if (tracker.retryCount < MAX_RETRIES_440) {
                const delay = 5000 * Math.pow(2, tracker.retryCount);
                console.log(chalk.yellow(`🔄 Reconnecting ${nexusDevNumber} in ${delay/1000}s (Attempt ${tracker.retryCount + 1}/${MAX_RETRIES_440})`));
                setTimeout(() => startpairing(nexusDevNumber), delay);
            } else {
                console.log(chalk.red(`❌ Max retries reached for ${nexusDevNumber}, giving up`));
                rentbotTracker.delete(nexusDevNumber);
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`✅ Connected: ${nexusDevNumber}`));
            tracker.retryCount = 0;
            tracker.disconnected = false;
        }
    });

    nexus.ev.on('creds.update', saveCreds);
    
    return nexus;
}

module.exports = startpairing;