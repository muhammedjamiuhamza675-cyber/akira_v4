const fs = require('fs')

global.owner = "2349032741650" //owner number
global.footer = "Hamzzy MD" //footer section
global.status = true //"self/public" section of the bot (true = public)
global.prefa = ['','!','.',',','🐤','🗿','/']
global.owner = ['2349032741650']
global.xprefix = '.'
global.gambar = "https://i.ibb.co/hRxLvCWb/RD32333335343832373039383440732e77686174736170702e6e6574-499562.jpg"
global.OWNER_NAME = "Hamzzy" //
global.DEVELOPER = ["2349032741650"] //
global.BOT_NAME = "Hamzzy MD"
global.bankowner = "Hamzzy MD"
global.creatorName = "Hamzzy MD"
global.ownernumber = '2349032741650'  //creator number
global.location = "Nigeria"
global.prefa = ['','!','.','#','&','/']
//================DO NOT CHANGE OR YOU'LL GET AN ERROR=============\
global.footer = "Hamzzy MD" //footer section
global.link = "https://chat.whatsapp.com/HY4DRkMNXQYBWICjILgQgx"
global.autobio = true //auto update bio
global.botName = "Hamzzy MD"
global.version = "1.0.1"
global.botname = "Hamzzy MD"
global.author = "@hamzzyhacket"
global.themeemoji = "🔥"
global.wagc = 'https://chat.whatsapp.com/HY4DRkMNXQYBWICjILgQgx'
global.thumbnail = 'https://i.ibb.co/hRxLvCWb/RD32333335343832373039383440732e77686174736170702e6e6574-499562.jpg'
global.richpp = ' '
global.packname = "Sticker By Hamzzy"
global.author = "@hamzzyhacket"
global.creator = "2349032741650@s.whatsapp.net"
global.ownername = 'Hamzzy' 
global.onlyowner = `Only @hamzzyhacket can use this Command 🔥`
  // reply 
global.database = `*To Exist In The Database Contact @hamzzyhacket*`
  global.mess = {
wait: "*Configurating.......*",
   success: "*Successfully acknowledged ☑️*",
   on: "*Activated ✅*", 
   prem: "*Feature For Premium Users only*", 
   off: "*Deactivated 📛*",
   query: {
       text: "*Please, Provide A Text Query 📑*",
       link: "Please, provide a valid link 🔗*",
   },
   error: {
       fitur: "*Status 🌐: Feature Or Command error ❌*",
   },
   only: {
       group: "*Group only feature ❌*",
private: "*Private chat feature only ❌*",
       owner: "*Owner feature only ❌*",
       admin: "*bot owner feature only ❌*",
       badmin: "*Seek admin privilege's to use this command ❌*",
       premium: "*Availabe for premium users only ❌*",
   }
}

global.hituet = 0
//false=disable and true=enable
global.autoviewstatus = true
global.autoread = true //auto read messages
global.autobio = true //auto update bio
global.anti92 = true //auto block +92 
global.autoswview = true //auto view status/story

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})

//Property of Hamzzy Hacket  
//owner number: +2349032741650
//telegram : @hamzzyhacket
