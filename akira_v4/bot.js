require('dotenv').config();
require('./setting/config');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const os = require('os');
const { sleep } = require('./empirestore/utils');
const { BOT_TOKEN } = require('./empirestore/token');
const { autoLoadPairs } = require('./autoload');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const adminFilePath = path.join(__dirname, 'empirestore', 'admin.json');
let adminIDs = [];

// Store for user tracking
const userFilePath = path.join(__dirname, 'empirestore', 'users.json');
let userIDs = new Set();

// ========== YOUR CUSTOM SETTINGS ==========
// Owner ID - YOUR TELEGRAM ID
const OWNER_ID = '7443685686';

// Your WhatsApp Number
const YOUR_NUMBER = '09032741650';

// Required group and channels - YOUR SETUP
const REQUIRED_GROUP = '';
const REQUIRED_CHANNELS = [];

// Social media links - YOUR LINKS
const SOCIAL_LINKS = {
    whatsapp: `https://wa.me/${YOUR_NUMBER}`,
    telegram_channels: [
        'https://t.me/hamzzylogs'
    ],
    telegram_group: 'https://t.me/+Lt8WVN0W9bcxYjNl',
    channel1: 'https://t.me/hamzzylogs',
    channel2: 'https://t.me/hamzzylogs_channel',
    channel3: 'https://t.me/hamzzylogs_group',
    group1: 'https://t.me/+Lt8WVN0W9bcxYjNl',
    developer: 'https://t.me/hamzzylogs'
};

// Bot image URL (keep or change)
const BOT_IMAGE_URL = 'https://i.ibb.co/RkJRkkcH/1e9a539b48ea.jpg';

// Bot Title - YOUR BOT NAME
const BOT_TITLE = `Hamzzy MD | Developed by @hamzzyhacket`;

// ========== END YOUR CUSTOM SETTINGS ==========

// Utility functions
const exists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const loadAdminIDs = async () => {
    const defaultAdmins = [OWNER_ID];

    if (!(await exists(adminFilePath))) {
        await fs.writeFile(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
        adminIDs = defaultAdmins;
        console.log('✅ Created admin.json with owner id');
    } else {
        try {
            const raw = await fs.readFile(adminFilePath, 'utf8');
            adminIDs = JSON.parse(raw);
        } catch (err) {
            console.error('❌ Error loading admin.json:', err);
            adminIDs = defaultAdmins;
        }
    }
    console.log('📥 Loaded admin ids:', adminIDs);
};

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

// Load user IDs
const loadUserIDs = async () => {
    if (await exists(userFilePath)) {
        try {
            const raw = await fs.readFile(userFilePath, 'utf8');
            const users = JSON.parse(raw);
            userIDs = new Set(users);
            console.log(`📥 Loaded ${userIDs.size} users`);
        } catch (err) {
            console.error('❌ Error loading users.json:', err);
            userIDs = new Set();
        }
    }
};

// Save user IDs
const saveUserIDs = async () => {
    try {
        await fs.writeFile(userFilePath, JSON.stringify([...userIDs], null, 2));
    } catch (err) {
        console.error('❌ Error saving users.json:', err);
    }
};

// Track user
const trackUser = async (userId) => {
    const userIdStr = userId.toString();
    if (!userIDs.has(userIdStr)) {
        userIDs.add(userIdStr);
        await saveUserIDs();
        console.log(`➕ New user tracked: ${userIdStr}`);
    }
};

// Check if user has joined required group and channels
const checkMembership = async (userId) => {
    try {
        // Skip membership check for owner
        if (userId.toString() === OWNER_ID) {
            return {
                hasJoinedGroup: true,
                hasJoinedAllChannels: true,
                hasJoinedAll: true
            };
        }

        let hasJoinedGroup = true;
        let hasJoinedAllChannels = true;

        if (REQUIRED_GROUP && REQUIRED_GROUP !== '') {
            const groupMember = await bot.getChatMember(REQUIRED_GROUP, userId).catch(() => null);
            const validStatuses = ['member', 'administrator', 'creator'];
            hasJoinedGroup = groupMember && validStatuses.includes(groupMember.status);
        }
        
        if (REQUIRED_CHANNELS && REQUIRED_CHANNELS.length > 0 && REQUIRED_CHANNELS[0] !== '') {
            const channelChecks = await Promise.all(
                REQUIRED_CHANNELS.map(channel => 
                    bot.getChatMember(channel, userId).catch(() => null)
                )
            );
            const validStatuses = ['member', 'administrator', 'creator'];
            hasJoinedAllChannels = channelChecks.every(member => member && validStatuses.includes(member.status));
        }

        return {
            hasJoinedGroup,
            hasJoinedAllChannels,
            hasJoinedAll: hasJoinedGroup && hasJoinedAllChannels
        };
    } catch (error) {
        console.error('Error checking membership:', error);
        return {
            hasJoinedGroup: true,
            hasJoinedAllChannels: true,
            hasJoinedAll: true
        };
    }
};

// Send join requirement message
const sendJoinRequirement = (chatId) => {
    return bot.sendPhoto(chatId, BOT_IMAGE_URL, {
        caption: `🔐 ${BOT_TITLE} 🔐\n\n⚠️ Access Denied! ⚠️\n\nPlease join our channel to proceed:\n\n➤ @hamzzylogs\n\n✅ After joining, click the VERIFY button.`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '📢 JOIN CHANNEL', url: 'https://t.me/hamzzylogs' }],
                [{ text: '👥 JOIN GROUP', url: 'https://t.me/+Lt8WVN0W9bcxYjNl' }],
                [{ text: '✅ VERIFY MEMBERSHIP', callback_data: 'check_membership' }]
            ]
        }
    });
};

// Middleware to check membership before executing commands
const requireMembership = (handler) => {
    return async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        await trackUser(userId);

        if (adminIDs.includes(userId.toString())) {
            return handler(msg, match);
        }

        const membership = await checkMembership(userId);
        
        if (!membership.hasJoinedAll) {
            return sendJoinRequirement(chatId);
        }

        return handler(msg, match);
    };
};

// State management
let isShuttingDown = false;
let isAutoLoadRunning = false;

const runAutoLoad = async () => {
    if (isAutoLoadRunning || isShuttingDown) return;
    isAutoLoadRunning = true;

    try {
        console.log('🔄 Initializing auto-load');
        await autoLoadPairs();
        console.log('✅ Auto-load completed');
    } catch (e) {
        console.error('❌ Auto-load failed:', e);
    } finally {
        isAutoLoadRunning = false;
    }
};

const gracefulShutdown = (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
    bot.stopPolling();
    console.log('✅ Bot stopped successfully');
    process.exit(0);
};

// ======================== COMMANDS ========================

// Start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'User';
    
    await trackUser(userId);
    
    if (!adminIDs.includes(userId.toString())) {
        const membership = await checkMembership(userId);
        if (!membership.hasJoinedAll) {
            return sendJoinRequirement(chatId);
        }
    }
    
    const caption = `
👽 WELCOME ${firstName.toUpperCase()}! 👽

✨ ${BOT_TITLE} ✨

⚡ Trust System Activated...

🔧 COMMANDS:

➤ /pair <number> - Connect WhatsApp device
➤ /delpair <number> - Remove paired device  
➤ /listpair - Show paired devices
➤ /stats - Bot statistics
➤ /ping - Check response time
➤ /info - Bot information
➤ /report <message> - Report an issue
➤ /feedback <message> - Send feedback
➤ /runtime - Check bot uptime
➤ /help - Show all commands

────────────────────────────
👑 Developed by @hamzzyhacket 👑
⚡ Stay Legendary! ⚡`;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📢 CHANNEL', url: SOCIAL_LINKS.channel1 }],
                [{ text: '👥 GROUP', url: SOCIAL_LINKS.group1 }],
                [{ text: '👑 DEVELOPER', url: SOCIAL_LINKS.developer }],
                [{ text: '❓ HELP', callback_data: 'help_msg' }]
            ]
        }
    };
    
    await bot.sendPhoto(chatId, BOT_IMAGE_URL, { 
        caption: caption, 
        parse_mode: 'HTML',
        ...keyboard 
    });
});

// Help command
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    await trackUser(userId);
    
    if (!adminIDs.includes(userId.toString())) {
        const membership = await checkMembership(userId);
        if (!membership.hasJoinedAll) {
            return sendJoinRequirement(chatId);
        }
    }
    
    const caption = `
❓ COMMAND LIST ❓

🔹 /pair <number> - Connect WhatsApp device
🔹 /delpair <number> - Remove paired device  
🔹 /listpair - Show paired devices
🔹 /stats - View bot statistics
🔹 /ping - Check bot response time
🔹 /info - Bot information
🔹 /report <message> - Report an issue
🔹 /feedback <message> - Send feedback
🔹 /runtime - Check bot uptime
🔹 /help - Show this menu

Admin Commands:
🔸 /broadcast <message> - Send to all users
🔸 /userlist - List all users
🔸 /deleteuser <id> - Remove a user
🔸 /clean - Clean invalid sessions
🔸 /restart - Restart the bot

────────────────────────────
👑 Developed by @hamzzyhacket 👑
⚡ Powered by Hamzzy MD ⚡`;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📢 CHANNEL', url: SOCIAL_LINKS.channel1 }],
                [{ text: '👥 GROUP', url: SOCIAL_LINKS.group1 }],
                [{ text: '👑 DEVELOPER', url: SOCIAL_LINKS.developer }]
            ]
        }
    };
    
    await bot.sendPhoto(chatId, BOT_IMAGE_URL, { 
        caption: caption, 
        parse_mode: 'HTML',
        ...keyboard 
    });
});

// Runtime command
bot.onText(/\/runtime/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const caption = `⏰ ${BOT_TITLE} ⏰\n\n🕐 Uptime: ${runtime(process.uptime())}\n\n⚡ Status: Online & Ready!`;
        await bot.sendMessage(chatId, caption, { parse_mode: 'HTML' });
    } catch (err) {
        console.error('RUNTIME CMD ERROR:', err);
        await bot.sendMessage(msg.chat.id, '⚠️ Failed to get runtime info.');
    }
});

// Ping command
bot.onText(/\/ping/, requireMembership(async (msg) => {
    const start = Date.now();
    const chatId = msg.chat.id;
    const sent = await bot.sendMessage(chatId, '🏓 Pinging...');
    const end = Date.now();
    await bot.editMessageText(`🏓 Pong!\n⏱️ Latency: ${end - start}ms\n⚡ Status: Online`, {
        chat_id: chatId,
        message_id: sent.message_id,
        parse_mode: 'HTML'
    });
}));

// Stats command
bot.onText(/\/stats/, requireMembership(async (msg) => {
    const chatId = msg.chat.id;
    const pairingPath = path.join(__dirname, 'empirestore', 'pairing');
    let pairedCount = 0;
    
    try {
        if (await exists(pairingPath)) {
            const devices = await fs.readdir(pairingPath);
            pairedCount = devices.filter(d => d.endsWith('@s.whatsapp.net')).length;
        }
    } catch (e) {
        console.error(e);
    }
    
    const stats = `
📊 HAMZZY MD STATISTICS 📊

👥 Total Users: ${userIDs.size}
📱 Paired Devices: ${pairedCount}
🔢 Max Pairs Limit: 30
⏱️ Uptime: ${runtime(process.uptime())}
👑 Owner: @hamzzyhacket
⚡ Status: Online✅
  `;
  bot.sendMessage(chatId, stats, { parse_mode: 'HTML' });
}));

// Info command
bot.onText(/\/info/, requireMembership(async (msg) => {
    const info = `
ℹ️ ABOUT HAMZZY MD ℹ️

🤖 Bot: Hamzzy MD
👑 Developer: @hamzzyhacket ⚡
💬 Language: Node.js
🔧 Purpose: WhatsApp Pairing Bot

📢 Channel: @hamzzylogs
👥 Group: @hamzzylogs_group

⚡ Rule sharp. Move bold. Stay legendary.
  `;
  bot.sendMessage(msg.chat.id, info, { parse_mode: 'HTML' });
}));

// Pair command (empty)
bot.onText(/^\/pair\s*$/, requireMembership(async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
        chatId,
        `⚠️ ${BOT_TITLE} ⚠️\n\n❌ Input Needed!\n\nPlease enter a valid number.\n\n📝 Format: /pair 234xxxxxxxxxx`,
        { parse_mode: 'HTML' }
    );
}));

// Pair command with number
bot.onText(/\/pair (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1].trim();

    try {
        if (!text || /[a-z]/i.test(text)) {
            return bot.sendMessage(chatId, '⚠️ Invalid number! Use: /pair 234xxxxxxxxxx', { parse_mode: 'HTML' });
        }

        if (!/^\d{7,15}(\|\d{1,10})?$/.test(text)) {
            return bot.sendMessage(chatId, '❌ Invalid format! Use: /pair 234xxxxxxxxxx', { parse_mode: 'HTML' });
        }

        if (text.startsWith('0')) {
            return bot.sendMessage(chatId, '❌ Numbers starting with 0 are not allowed!', { parse_mode: 'HTML' });
        }

        const countryCode = text.slice(0, 3);
        if (["252", "4567877"].includes(countryCode)) {
            return bot.sendMessage(chatId, "❌ This country code is not supported!", { parse_mode: 'HTML' });
        }

        const pairingFolder = path.join(__dirname, 'empirestore', 'pairing');
        if (!(await exists(pairingFolder))) {
            await fs.mkdir(pairingFolder, { recursive: true });
        }

        const files = await fs.readdir(pairingFolder);
        const pairedCount = files.filter(file => file.endsWith('@s.whatsapp.net')).length;
        
        if (pairedCount >= 30) {
            return bot.sendMessage(chatId, `❌ Pairing limit reached (30)! Contact @hamzzylogs`, { parse_mode: 'HTML' });
        }

        const startpairing = require('./pair.js');
        const Xreturn = text.split("|")[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        
        await startpairing(Xreturn);
        await sleep(4000);

        const pairingFile = path.join(pairingFolder, 'pairing.json');
        const cu = await fs.readFile(pairingFile, 'utf-8');
        const cuObj = JSON.parse(cu);
        delete require.cache[require.resolve('./pair.js')];

        const senderNumber = text.split("|")[0].replace(/[^0-9]/g, '');
        const whatsappFormat = senderNumber + "@s.whatsapp.net";
        const lidFormat = senderNumber + "@lid";

        const ownerPath = path.join(__dirname, 'allfunc', 'owner.json');
        let ownerData = [];

        try {
            const ownerFile = await fs.readFile(ownerPath, 'utf-8');
            ownerData = JSON.parse(ownerFile);
        } catch (err) {
            ownerData = [];
        }

        let isNew = false;
        if (!ownerData.includes(whatsappFormat)) {
            ownerData.push(whatsappFormat);
            isNew = true;
        }
        if (!ownerData.includes(lidFormat)) {
            ownerData.push(lidFormat);
            isNew = true;
        }

        if (isNew) {
            await fs.writeFile(ownerPath, JSON.stringify(ownerData, null, 2));
            
            bot.sendMessage(chatId, 
                `✅ ${BOT_TITLE} ✅\n\n🔐 Pairing Code Generated!\n\n📱 Number: ${senderNumber}\n🔑 Code: ${cuObj.code}\n\n⚡ Use this code to connect your WhatsApp!`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.sendMessage(chatId, 
                `✅ ${BOT_TITLE} ✅\n\n📱 Number: ${senderNumber}\n🔑 Code: ${cuObj.code}\n\n⚡ Already registered!`,
                { parse_mode: 'HTML' }
            );
        }

    } catch (error) {
        console.error('❌ Connection error:', error);
        bot.sendMessage(chatId, '❌ Failed to generate pairing code! Please try again.', { parse_mode: 'HTML' });
    }
}));

// Delpair command (empty)
bot.onText(/^\/delpair\s*$/, requireMembership(async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, '⚠️ Format: /delpair 234xxxxxxxxxx', { parse_mode: 'HTML' });
}));

// Delpair command with number
bot.onText(/\/delpair (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match[1].trim();

    try {
        if (!input || /[a-z]/i.test(input) || !/^\d{7,15}$/.test(input) || input.startsWith('0')) {
            return bot.sendMessage(chatId, '❌ Invalid number! Use: /delpair 234xxxxxxxxxx', { parse_mode: 'HTML' });
        }

        const jidSuffix = `${input}@s.whatsapp.net`;
        const pairingPath = path.join(__dirname, 'empirestore', 'pairing');

        if (!(await exists(pairingPath))) {
            return bot.sendMessage(chatId, '❌ No sessions found in database!', { parse_mode: 'HTML' });
        }

        const entries = await fs.readdir(pairingPath, { withFileTypes: true });
        const matched = entries.find(entry => entry.isDirectory() && entry.name.endsWith(jidSuffix));

        if (!matched) {
            return bot.sendMessage(chatId, `❌ ${input} not found in database!`, { parse_mode: 'HTML' });
        }

        const targetPath = path.join(pairingPath, matched.name);
        await fs.rm(targetPath, { recursive: true, force: true });

        bot.sendMessage(chatId, `✅ ${input} has been successfully deleted!`, { parse_mode: 'HTML' });
    } catch (err) {
        console.error('delpair error:', err);
        bot.sendMessage(chatId, '❌ Failed to delete session!', { parse_mode: 'HTML' });
    }
}));

// Listpair command (admin only)
bot.onText(/\/listpair$/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ This command is restricted to bot owner only!', { parse_mode: 'HTML' });
    }
    
    bot.sendMessage(chatId, '⚠️ Use: /listpair confirm', { parse_mode: 'HTML' });
});

bot.onText(/\/listpair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const confirmation = match[1].trim().toLowerCase();

    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }

    if (confirmation !== 'confirm') {
        return bot.sendMessage(chatId, '⚠️ Use: /listpair confirm', { parse_mode: 'HTML' });
    }

    try {
        const pairingPath = path.join(__dirname, 'empirestore', 'pairing');
        
        if (!(await exists(pairingPath))) {
            return bot.sendMessage(chatId, '📊 No paired devices found!', { parse_mode: 'HTML' });
        }

        const entries = await fs.readdir(pairingPath, { withFileTypes: true });
        const pairedDevices = entries.filter(entry => entry.isDirectory() && entry.name !== 'pairing.json').map(entry => entry.name);

        if (pairedDevices.length === 0) {
            return bot.sendMessage(chatId, '📊 No paired devices found!', { parse_mode: 'HTML' });
        }

        const deviceList = pairedDevices.map((device, index) => {
            const phoneNumber = device.split('@')[0];
            return `${index + 1}. ${phoneNumber}`;
        }).join('\n');

        bot.sendMessage(chatId, `📊 ${BOT_TITLE} 📊\n\n📱 Total Devices: ${pairedDevices.length}\n\n${deviceList}`, { parse_mode: 'HTML' });
    } catch (err) {
        console.error('listpair error:', err);
        bot.sendMessage(chatId, '❌ Failed to retrieve device list!', { parse_mode: 'HTML' });
    }
});

// Report command (empty)
bot.onText(/^\/report$/, requireMembership((msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `📝 ${BOT_TITLE} - Report System 📝\n\nUse: /report <your message>\n\nExample: /report Bot not working\n\n✅ Keep it clear and brief!`,
        { parse_mode: 'HTML' }
    );
}));

// Report command with message
bot.onText(/^\/report (.+)$/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : 'No username';
    const firstName = msg.from.first_name || 'User';
    const reportMessage = match[1].trim();

    if (!reportMessage) {
        return bot.sendMessage(chatId, '❌ Please provide a message!', { parse_mode: 'HTML' });
    }

    try {
        const reportText = `📢 NEW REPORT 📢\n\n👤 User: ${firstName}\n📝 Username: ${username}\n🆔 ID: ${userId}\n\n💬 Message:\n${reportMessage}`;

        let sentCount = 0;
        for (const adminId of adminIDs) {
            try {
                await bot.sendMessage(adminId, reportText, { parse_mode: 'HTML' });
                sentCount++;
            } catch (e) {
                console.error(`Failed to send to admin ${adminId}:`, e.message);
            }
        }

        if (sentCount > 0) {
            bot.sendMessage(chatId, `✅ Report Sent! ✅\n\nThank you for your feedback. Our team will review it shortly.`, { parse_mode: 'HTML' });
            console.log(chalk.green(`📨 Report from ${userId} sent to ${sentCount} admins`));
        } else {
            bot.sendMessage(chatId, '❌ Failed to send report. Please try again later.', { parse_mode: 'HTML' });
        }
    } catch (error) {
        console.error('report command error:', error);
        bot.sendMessage(chatId, '❌ Failed to send report!', { parse_mode: 'HTML' });
    }
}));

// Feedback command (empty)
bot.onText(/^\/feedback$/, requireMembership((msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `💬 ${BOT_TITLE} - Feedback System 💬\n\nUse: /feedback <your message>\n\nExample: /feedback Great bot!\n\n✅ Your feedback helps us improve!`,
        { parse_mode: 'HTML' }
    );
}));

// Feedback command with message
bot.onText(/^\/feedback (.+)$/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'User';
    const feedback = match[1].trim();

    if (!feedback) {
        return bot.sendMessage(chatId, '❌ Please provide feedback!', { parse_mode: 'HTML' });
    }

    const feedbackMsg = `💬 NEW FEEDBACK 💬\n\n👤 User: @${username}\n🆔 ID: ${userId}\n\n📝 Feedback: ${feedback}`;

    let sentCount = 0;
    for (const adminId of adminIDs) {
        try {
            await bot.sendMessage(adminId, feedbackMsg, { parse_mode: 'HTML' });
            sentCount++;
        } catch (e) {}
    }

    bot.sendMessage(chatId, `✅ Thank you for your feedback! ✅\n\nWe appreciate your input.`, { parse_mode: 'HTML' });
}));

// Clean command
bot.onText(/\/clean$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    try {
        const pairingPath = path.join(__dirname, 'empirestore', 'pairing');
        
        if (!(await exists(pairingPath))) {
            return bot.sendMessage(chatId, '📊 No sessions to clean!', { parse_mode: 'HTML' });
        }

        const entries = await fs.readdir(pairingPath, { withFileTypes: true });
        let cleaned = 0;
        let kept = 0;

        for (const entry of entries) {
            if (!entry.isDirectory() || entry.name === 'pairing.json') continue;
            
            const sessionPath = path.join(pairingPath, entry.name);
            const credsPath = path.join(sessionPath, 'creds.json');
            
            let isValid = false;
            if (await exists(credsPath)) {
                try {
                    const creds = JSON.parse(await fs.readFile(credsPath, 'utf8'));
                    isValid = !!(creds.me && creds.me.id && creds.registered);
                } catch (e) {
                    isValid = false;
                }
            }
            
            if (!isValid) {
                await fs.rm(sessionPath, { recursive: true, force: true });
                cleaned++;
            } else {
                kept++;
            }
        }

        bot.sendMessage(chatId, `🧹 Cleanup Complete! 🧹\n\n✅ Cleaned: ${cleaned}\n📱 Kept: ${kept}`, { parse_mode: 'HTML' });
    } catch (err) {
        console.error('clean error:', err);
        bot.sendMessage(chatId, '❌ Cleanup failed!', { parse_mode: 'HTML' });
    }
});

// Broadcast command
bot.onText(/\/broadcast$/, (msg) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    bot.sendMessage(chatId, '📢 Broadcast System\n\nUse: /broadcast <your message>\n\nExample: /broadcast Hello everyone!', { parse_mode: 'HTML' });
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    const message = match[1].trim();
    
    if (!message) {
        return bot.sendMessage(chatId, '❌ Please provide a message to broadcast!', { parse_mode: 'HTML' });
    }
    
    const totalUsers = userIDs.size;
    
    if (totalUsers === 0) {
        return bot.sendMessage(chatId, '❌ No users to broadcast to!', { parse_mode: 'HTML' });
    }
    
    const statusMsg = await bot.sendMessage(chatId, `📢 Broadcasting to ${totalUsers} users...`);
    
    let sent = 0;
    let failed = 0;
    const users = [...userIDs];
    
    for (let i = 0; i < users.length; i++) {
        try {
            await bot.sendMessage(users[i], `📢 HAMZZY MD BROADCAST 📢\n\n${message}\n\n⚡ Stay Legendary!`, { parse_mode: 'HTML' });
            sent++;
            
            if (i % 10 === 0 || i === users.length - 1) {
                try {
                    await bot.editMessageText(`📢 Broadcasting...\n\n📨 Sent: ${sent}/${totalUsers}\n❌ Failed: ${failed}\n📊 Progress: ${Math.round((i + 1) / users.length * 100)}%`, {
                        chat_id: chatId,
                        message_id: statusMsg.message_id,
                        parse_mode: 'HTML'
                    });
                } catch (e) {}
            }
            
            await sleep(50);
        } catch (error) {
            failed++;
            if (error.response && error.response.body && error.response.body.error_code === 403) {
                userIDs.delete(users[i]);
                await saveUserIDs();
            }
        }
    }
    
    await bot.editMessageText(`✅ Broadcast Complete!\n\n📨 Sent: ${sent}/${totalUsers}\n❌ Failed: ${failed}\n📊 Success Rate: ${Math.round(sent / totalUsers * 100)}%`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
        parse_mode: 'HTML'
    });
});

// Restart command
bot.onText(/\/restart$/, async (msg) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    await bot.sendMessage(chatId, '🔄 Restarting bot...', { parse_mode: 'HTML' });
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

// Userlist command
bot.onText(/\/userlist$/, async (msg) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    const users = [...userIDs];
    let response = `👥 Total Users: ${users.length}\n\n`;
    
    const displayUsers = users.slice(0, 50);
    displayUsers.forEach((uid, i) => {
        response += `${i+1}. ${uid}\n`;
    });
    
    if (users.length > 50) {
        response += `\n... and ${users.length - 50} more`;
    }
    
    response += `\n\n📝 Use /deleteuser <id> to remove a user`;
    
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
});

// Deleteuser command
bot.onText(/\/deleteuser (\d+)$/, async (msg, match) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    const targetUser = match[1];
    if (userIDs.has(targetUser)) {
        userIDs.delete(targetUser);
        await saveUserIDs();
        bot.sendMessage(chatId, `✅ User ${targetUser} removed from database!`, { parse_mode: 'HTML' });
    } else {
        bot.sendMessage(chatId, `❌ User ${targetUser} not found!`, { parse_mode: 'HTML' });
    }
});

// Setpairlimit command
bot.onText(/\/setpairlimit (\d+)$/, async (msg, match) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    
    if (!adminIDs.includes(userId)) {
        return bot.sendMessage(chatId, '❌ Owner only command!', { parse_mode: 'HTML' });
    }
    
    const newLimit = parseInt(match[1]);
    if (newLimit < 1 || newLimit > 100) {
        return bot.sendMessage(chatId, '❌ Limit must be between 1-100', { parse_mode: 'HTML' });
    }
    
    global.MAX_PAIRS = newLimit;
    bot.sendMessage(chatId, `✅ Pairing limit set to ${newLimit}`, { parse_mode: 'HTML' });
});

// ======================== CALLBACK QUERY HANDLER ========================

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const userId = callbackQuery.from.id;
    const chatId = msg.chat.id;
    
    await trackUser(userId);
    
    await bot.answerCallbackQuery(callbackQuery.id);

    if (data === 'check_membership') {
        try {
            const membership = await checkMembership(userId);

            if (membership.hasJoinedAll) {
                await bot.editMessageMedia(
                    {
                        type: 'photo',
                        media: BOT_IMAGE_URL,
                        caption: `✅ ${BOT_TITLE} ✅\n\n🎉 Verification Successful!\n\nYou have joined our channel.\n\n⚡ You can now use all bot commands!`,
                        parse_mode: 'HTML'
                    },
                    {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🚀 START BOT', callback_data: 'start_bot' }],
                                [{ text: '❓ HELP', callback_data: 'help_msg' }]
                            ]
                        }
                    }
                );
            } else {
                await bot.editMessageMedia(
                    {
                        type: 'photo',
                        media: BOT_IMAGE_URL,
                        caption: `❌ ${BOT_TITLE} ❌\n\n⚠️ Verification Failed!\n\nPlease join our channel first:\n\n➤ @hamzzylogs`,
                        parse_mode: 'HTML'
                    },
                    {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '📢 JOIN CHANNEL', url: 'https://t.me/hamzzylogs' }],
                                [{ text: '👥 JOIN GROUP', url: 'https://t.me/+Lt8WVN0W9bcxYjNl' }],
                                [{ text: '🔄 VERIFY AGAIN', callback_data: 'check_membership' }]
                            ]
                        }
                    }
                );
            }
        } catch (error) {
            console.error('error in membership check callback:', error);
            await bot.sendMessage(chatId, '⚠️ Error checking membership! Please try again.');
        }
    } else if (data === 'start_bot') {
        const caption = `
👽 WELCOME TO HAMZZY MD! 👽

⚡ Initializing...

🔧 AVAILABLE COMMANDS:

➤ /pair <number> - Connect WhatsApp
➤ /delpair <number> - Remove device  
➤ /listpair - Show devices
➤ /stats - Bot statistics
➤ /ping - Check response time
➤ /info - Bot information
➤ /report <message> - Report issue
➤ /feedback <message> - Send feedback
➤ /runtime - Check uptime
➤ /help - Show commands

────────────────────────────
👑 Developed by @hamzzyhacket 👑
⚡ Stay Legendary! ⚡`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📢 CHANNEL', url: SOCIAL_LINKS.channel1 }],
                    [{ text: '👥 GROUP', url: SOCIAL_LINKS.group1 }],
                    [{ text: '❓ HELP', callback_data: 'help_msg' }]
                ]
            }
        };
        
        await bot.sendPhoto(chatId, BOT_IMAGE_URL, { 
            caption: caption, 
            parse_mode: 'HTML',
            ...keyboard 
        });
        
        try {
            await bot.deleteMessage(chatId, msg.message_id);
        } catch(e) {}
        
    } else if (data === 'help_msg') {
        const caption = `
❓ COMMAND LIST ❓

🔹 /pair <number> - Connect WhatsApp device
🔹 /delpair <number> - Remove paired device  
🔹 /listpair - Show paired devices
🔹 /stats - View bot statistics
🔹 /ping - Check bot response time
🔹 /info - Bot information
🔹 /report <message> - Report an issue
🔹 /feedback <message> - Send feedback
🔹 /runtime - Check bot uptime
🔹 /help - Show this menu

Admin Commands:
🔸 /broadcast <message> - Send to all users
🔸 /userlist - List all users
🔸 /deleteuser <id> - Remove a user
🔸 /clean - Clean invalid sessions
🔸 /restart - Restart the bot

────────────────────────────
👑 Developed by @hamzzyhacket 👑`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 START', callback_data: 'start_bot' }],
                    [{ text: '📢 CHANNEL', url: SOCIAL_LINKS.channel1 }]
                ]
            }
        };
        await bot.sendPhoto(chatId, BOT_IMAGE_URL, { 
            caption: caption, 
            parse_mode: 'HTML',
            ...keyboard 
        });
        
        try {
            await bot.deleteMessage(chatId, msg.message_id);
        } catch(e) {}
    }
});

// Unknown commands handler
bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) {
        const command = msg.text.split(' ')[0];
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        const validCommands = [
            '/start', '/pair', '/delpair', '/listpair', '/runtime', 
            '/broadcast', '/clean', '/help', '/report', '/stats', 
            '/ping', '/info', '/feedback', '/userlist', '/deleteuser',
            '/setpairlimit', '/restart', '/helpgroup', '/settings'
        ];
        
        if (!validCommands.includes(command)) {
            await trackUser(userId);
            
            if (!adminIDs.includes(userId.toString())) {
                const membership = await checkMembership(userId);
                if (!membership.hasJoinedAll) {
                    return sendJoinRequirement(chatId);
                }
            }
            
            bot.sendMessage(chatId, `❌ Unknown Command!\n\nType /help to see available commands.`, { parse_mode: 'HTML' });
        }
    }
});

// Helpgroup command
bot.onText(/\/helpgroup/, requireMembership(async (msg) => {
    const helpText = `
🛠️ GROUP MANAGEMENT COMMANDS

📝 SETTINGS:
/settings - View group settings
/togglewelcome - Toggle welcome messages
/togglegoodbye - Toggle goodbye messages
/toggleantilink - Toggle anti-link protection
/toggleantispam - Toggle anti-spam protection

👮 MODERATION:
/warn <user> - Warn a user
/mute <user> - Mute a user
/kick <user> - Kick a user
/ban <user> - Ban a user
/purge [count] - Delete recent messages

👑 Owner Commands:
/broadcast <message> - Send broadcast
/userlist - List all users
/restart - Restart the bot
    `;
    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'HTML' });
}));

// ======================== INITIALIZE AND START ========================

(async () => {
    await loadAdminIDs();
    await loadUserIDs();
    
    console.log(chalk.cyan(`🤖 ${BOT_TITLE}`));
    console.log(chalk.green('✅ Bot is running...'));
    console.log(chalk.blue(`📢 Required group: ${REQUIRED_GROUP || 'None (disabled)'}`));
    console.log(chalk.blue(`📢 Required channels: ${REQUIRED_CHANNELS.length || 'None (disabled)'}`));
    console.log(chalk.green(`🔢 Max pairs limit: 30`));
    console.log(chalk.green(`✅ Membership checking: ${REQUIRED_CHANNELS.length > 0 ? 'ENABLED' : 'DISABLED'}`));
    console.log(chalk.green('✅ Report system: ENABLED'));
    console.log(chalk.green('✅ Feedback system: ENABLED'));
    console.log(chalk.green('✅ Group management: DISABLED'));
})();

// Shutdown handlers
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));