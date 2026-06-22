const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");

// ════════════════════════════════════════════════════════════════════════════
//  KONFIGURASI
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  botPhone    : "6285165639635",
  ownerNumber : "6283171413750",
  ownerLID    : "155418206691577",
  botName     : "One Piece RPG Bot",
  prefix      : ".",
  groupOnly   : true,
  allowedGroups: [],
};

// ════════════════════════════════════════════════════════════════════════════
//  LOGGER
// ════════════════════════════════════════════════════════════════════════════
const C = {
  reset:"\x1b[0m", bright:"\x1b[1m", dim:"\x1b[2m",
  red:"\x1b[31m", green:"\x1b[32m", yellow:"\x1b[33m",
  blue:"\x1b[34m", magenta:"\x1b[35m", cyan:"\x1b[36m", white:"\x1b[37m",
};
function ts() {
  return new Date().toLocaleString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
const log = {
  info   :(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.cyan}[INFO]${C.reset}   ${m}`),
  success:(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.green}[OK]${C.reset}     ${m}`),
  warn   :(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.yellow}[WARN]${C.reset}   ${m}`),
  error  :(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.red}[ERR]${C.reset}    ${m}`),
  chat   :(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.blue}[CHAT]${C.reset}   ${m}`),
  group  :(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.cyan}[GROUP]${C.reset}  ${m}`),
  cmd    :(m)=>console.log(`${C.dim}[${ts()}]${C.reset} ${C.yellow}[CMD]${C.reset}    ${m}`),
  div    :()=>console.log(`${C.dim}${"─".repeat(72)}${C.reset}`),
};

// ════════════════════════════════════════════════════════════════════════════
//  OWNER DETECTION
// ════════════════════════════════════════════════════════════════════════════
function resolveOwnerInfo(msg) {
  const jidRaw=msg.key.remoteJid||"";
  const participantRaw=msg.key.participant||"";
  const senderJid=participantRaw||jidRaw;
  const extractNum=(j)=>j.replace(/@.*/,"").trim();
  const jidNum=extractNum(jidRaw);
  const senderNum=extractNum(senderJid);
  const isLidJid=senderJid.endsWith("@lid");
  const senderPn=isLidJid?`${senderNum}@s.whatsapp.net`:senderJid.endsWith("@s.whatsapp.net")?senderJid:`${senderNum}@s.whatsapp.net`;
  const isOwner=senderNum===CONFIG.ownerNumber||senderNum===CONFIG.ownerLID||jidNum===CONFIG.ownerNumber||jidNum===CONFIG.ownerLID;
  const isGroup=jidRaw.endsWith("@g.us");
  return{jidRaw,senderJid,jidNum,senderNum,senderPn,isLidJid,isOwner,isGroup};
}

// ════════════════════════════════════════════════════════════════════════════
//  DATABASE
// ════════════════════════════════════════════════════════════════════════════
const DB_PATH=path.join(__dirname,"db.json");
function loadDB(){
  if(!fs.existsSync(DB_PATH))fs.writeFileSync(DB_PATH,JSON.stringify({players:{}}));
  return JSON.parse(fs.readFileSync(DB_PATH,"utf-8"));
}
function saveDB(db){fs.writeFileSync(DB_PATH,JSON.stringify(db,null,2));}

// ════════════════════════════════════════════════════════════════════════════
//  DATA GAME
// ════════════════════════════════════════════════════════════════════════════
const CHARACTERS={
  luffy  :{name:"Monkey D. Luffy",   title:"Kapten Topi Jerami 🎩",        devil_fruit:"Gomu Gomu no Mi (Nika)",     hp:1500,attack:280,defense:120,special:"Gear Fifth - Bajrang Gun",             special_multiplier:4.5,emoji:"🌀",bounty:"3.000.000.000 Berry",description:"Kapten yang akan menjadi Raja Bajak Laut! Tubuhnya seperti karet!"},
  zoro   :{name:"Roronoa Zoro",       title:"Wakil Kapten / Ahli Pedang 🗡️", devil_fruit:"Tidak ada (Haki pengguna)",  hp:1400,attack:300,defense:150,special:"Santoryu - Asura: Makyusen",           special_multiplier:4.2,emoji:"⚔️",bounty:"1.111.000.000 Berry",description:"Pendekar pedang tiga pedang terkuat di dunia!"},
  nami   :{name:"Nami",               title:"Navigator 🌊",                  devil_fruit:"Tidak ada (Clima-Tact)",      hp:900, attack:180,defense:80, special:"Zeus Breeze Tempo - Raitei",          special_multiplier:3.8,emoji:"⚡",bounty:"366.000.000 Berry",  description:"Navigator jenius pengendali petir dengan Clima-Tact!"},
  usopp  :{name:"Usopp",             title:"Sniper Terbaik 🎯",             devil_fruit:"Tidak ada (Marksmanship)",    hp:950, attack:200,defense:90, special:"Kabuto - Firebird Star",              special_multiplier:3.5,emoji:"🏹",bounty:"500.000.000 Berry",  description:"Sniper handal yang selalu menepati janji kepada teman!"},
  sanji  :{name:"Vinsmoke Sanji",    title:"Koki / Black Leg 🦵",           devil_fruit:"Tidak ada (Ifrit Jambe)",     hp:1200,attack:260,defense:130,special:"Ifrit Jambe - Diable Mouton Shot",    special_multiplier:4.0,emoji:"🔥",bounty:"1.032.000.000 Berry",description:"Koki berbintang tiga bertarung hanya dengan kaki api Ifrit!"},
  chopper:{name:"Tony Tony Chopper", title:"Dokter Bajak Laut 🍬",          devil_fruit:"Hito Hito no Mi",            hp:1000,attack:210,defense:100,special:"Monster Point - Wakame de Violence",  special_multiplier:3.9,emoji:"🦌",bounty:"1.000 Berry 😅",    description:"Rusa berbulu biru yang bisa berubah menjadi monster raksasa!"},
  robin  :{name:"Nico Robin",        title:"Arkeolog / Devil Child 🌸",     devil_fruit:"Hana Hana no Mi",            hp:1100,attack:220,defense:110,special:"Mil Fleur: Gigantesco Mano - Spank",  special_multiplier:3.7,emoji:"🌺",bounty:"930.000.000 Berry",  description:"Arkeolog misterius yang bisa menumbuhkan anggota tubuh di mana saja!"},
  franky :{name:"Franky",            title:"Insinyur / Cyborg 🤖",          devil_fruit:"Tidak ada (Cyborg Besi)",    hp:1300,attack:240,defense:200,special:"Franky Radical Beam Burst",           special_multiplier:3.6,emoji:"⚙️",bounty:"394.000.000 Berry",  description:"Cyborg super pembangun Thousand Sunny dengan senjata futuristik!"},
  brook  :{name:"Brook",             title:"Musisi / Soul King 🎸",         devil_fruit:"Yomi Yomi no Mi",            hp:1050,attack:230,defense:95, special:"Soul Solid - Phrase d'armes Orchestra",special_multiplier:3.8,emoji:"💀",bounty:"383.000.000 Berry",  description:"Kerangka hidup! Yohohoho~ Bisa melihat celana dalammu?"},
  jinbe  :{name:"Jinbe",             title:"Juru Mudi / Manusia Ikan 🐋",   devil_fruit:"Tidak ada (Fishman Karate)", hp:1350,attack:250,defense:180,special:"Fishman Karate - Buraikan",           special_multiplier:4.1,emoji:"🌊",bounty:"1.100.000.000 Berry",description:"Manusia ikan pengguna Fishman Karate pengendali air!"},
};

const LOCATIONS=[
  {name:"Reverse Mountain",    desc:"Pintu masuk Grand Line yang misterius",       emoji:"🏔️",danger:1},
  {name:"Whiskey Peak",        desc:"Pulau para pemburu bajak laut Baroque Works", emoji:"🍺",danger:2},
  {name:"Little Garden",       desc:"Pulau raksasa di zaman dinosaurus",           emoji:"🦕",danger:3},
  {name:"Drum Island",         desc:"Pulau bersalju tempat Chopper bertemu Luffy", emoji:"❄️",danger:3},
  {name:"Alabasta",            desc:"Kerajaan gurun yang diserang Baroque Works",  emoji:"🏜️",danger:4},
  {name:"Skypiea",             desc:"Pulau di langit tersembunyi di atas awan",    emoji:"☁️",danger:5},
  {name:"Water 7",             desc:"Kota air tempat Thousand Sunny dibangun",     emoji:"🚢",danger:5},
  {name:"Enies Lobby",         desc:"Markas keadilan World Government",            emoji:"⚖️",danger:7},
  {name:"Thriller Bark",       desc:"Kapal setan milik Gecko Moria",               emoji:"🎃",danger:6},
  {name:"Sabaody Archipelago", desc:"Kepulauan mangrove gerbang New World",        emoji:"🫧",danger:7},
  {name:"Fishman Island",      desc:"Kerajaan bawah laut kaum manusia ikan",       emoji:"🐟",danger:6},
  {name:"Punk Hazard",         desc:"Pulau terlarang dengan gas beracun dan api",  emoji:"☣️",danger:8},
  {name:"Dressrosa",           desc:"Kerajaan yang dikuasai Doflamingo",           emoji:"🌹",danger:8},
  {name:"Zou",                 desc:"Pulau di punggung gajah raksasa Zunisha",     emoji:"🐘",danger:7},
  {name:"Whole Cake Island",   desc:"Wilayah Big Mom, salah satu Yonko",           emoji:"🎂",danger:9},
  {name:"Wano Kuni",           desc:"Negeri Samurai di bawah tirani Kaido",        emoji:"🗾",danger:10},
  {name:"Laugh Tale",          desc:"🏴‍☠️ PULAU TERAKHIR! Tempat ONE PIECE tersimpan!", emoji:"⭐",danger:10},
];

const ENEMIES={
  easy:[
    {name:"Bajak Laut East Blue",hp:300, attack:80, defense:30, reward:{berry:5000,  exp:100  },emoji:"🏴‍☠️"},
    {name:"Prajurit Marine",     hp:280, attack:90, defense:40, reward:{berry:6000,  exp:120  },emoji:"⚓"},
    {name:"Agen Baroque Works",  hp:350, attack:100,defense:50, reward:{berry:8000,  exp:150  },emoji:"🕵️"},
  ],
  medium:[
    {name:"Kapten Baroque Works",hp:600, attack:180,defense:80, reward:{berry:20000, exp:400  },emoji:"💣"},
    {name:"CP9 Agen Rahasia",    hp:800, attack:220,defense:100,reward:{berry:35000, exp:600  },emoji:"🕶️"},
    {name:"Shichibukai Muda",    hp:1000,attack:260,defense:130,reward:{berry:50000, exp:800  },emoji:"⚔️"},
  ],
  hard:[
    {name:"Admiral Marine",      hp:1500,attack:350,defense:200,reward:{berry:100000, exp:1500 },emoji:"🔱"},
    {name:"Yonko Commander",     hp:2000,attack:400,defense:250,reward:{berry:200000, exp:2500 },emoji:"👑"},
    {name:"Yonko (Big Boss)",    hp:3000,attack:500,defense:300,reward:{berry:500000, exp:5000 },emoji:"🌊"},
    {name:"Gorosei Anggota",     hp:4000,attack:600,defense:400,reward:{berry:1000000,exp:10000},emoji:"🌑"},
  ],
};

// ════════════════════════════════════════════════════════════════════════════
//  UTILITY
// ════════════════════════════════════════════════════════════════════════════
const rand =(arr)=>arr[Math.floor(Math.random()*arr.length)];
const fmt  =(n)=>n.toLocaleString("id-ID");
const hpBar=(cur,max,len=12)=>{const fill=Math.max(0,Math.round((cur/max)*len));return"█".repeat(fill)+"░".repeat(len-fill);};
function getAvailableChar(db){const taken=Object.values(db.players).map(p=>p.character);const avail=Object.keys(CHARACTERS).filter(c=>!taken.includes(c));return avail.length?rand(avail):null;}
function getEnemy(danger){if(danger<=3)return rand(ENEMIES.easy);if(danger<=7)return rand(ENEMIES.medium);return rand(ENEMIES.hard);}
function calcLevel(exp){const level=Math.floor(exp/500)+1;const titles=["Bajak Laut Pemula","Kru Biasa","Perwira Bajak Laut","Kapten Berburu","Bajak Laut Terkenal","Shichibukai","Yonko Commander","Yonko","Raja Bajak Laut"];return{level,rank:titles[Math.min(Math.floor(level/10),titles.length-1)]};}
function mention(num){return`@${num}`;}

// ════════════════════════════════════════════════════════════════════════════
//  HANDLER PESAN
// ════════════════════════════════════════════════════════════════════════════
async function handleMessage(sock,msg){
  const info=resolveOwnerInfo(msg);
  const{jidRaw,senderNum,isGroup,isOwner}=info;
  const pushName=msg.pushName||senderNum;
  const text=(msg.message?.conversation||msg.message?.extendedTextMessage?.text||"").trim().toLowerCase();

  log.chat(`${C.bright}${pushName}${C.reset} [${senderNum}]`+(isOwner?` ${C.magenta}👑OWNER${C.reset}`:"")+( isGroup?` ${C.cyan}[GRP]${C.reset}`:`${C.dim}[PM]${C.reset}`)+` → ${C.white}"${text}"${C.reset}`);

  if(CONFIG.groupOnly&&!isGroup)return;
  if(isGroup&&CONFIG.allowedGroups.length>0&&!CONFIG.allowedGroups.includes(jidRaw))return;
  if(!text.startsWith(CONFIG.prefix))return;

  const db=loadDB();

  if(text===".regist"){
    log.cmd(`${pushName} [${senderNum}] → .regist`);
    if(db.players[senderNum]){
      const ch=CHARACTERS[db.players[senderNum].character];
      await sock.sendMessage(jidRaw,{text:`╔══════════════════════╗\n║   🏴‍☠️ ONE PIECE RPG   ║\n╚══════════════════════╝\n\n${mention(senderNum)} kamu sudah terdaftar!\nKarakter: *${ch.name}* ${ch.emoji}\n\nGunakan *.start* untuk memulai petualangan!`,mentions:[`${senderNum}@s.whatsapp.net`]});
      return;
    }
    const charKey=getAvailableChar(db);
    if(!charKey){await sock.sendMessage(jidRaw,{text:`${mention(senderNum)} Maaf, semua slot karakter penuh!`,mentions:[`${senderNum}@s.whatsapp.net`]});return;}
    const ch=CHARACTERS[charKey];
    db.players[senderNum]={character:charKey,hp:ch.hp,maxHp:ch.hp,exp:0,berry:10000,locationIndex:0,adventure:false,currentEnemy:null,wins:0,defeats:0,specialUsed:0,registeredAt:new Date().toISOString()};
    saveDB(db);
    log.success(`${pushName} terdaftar → ${ch.name} ${ch.emoji}`);
    await sock.sendMessage(jidRaw,{
      text:`╔══════════════════════╗\n║   🏴‍☠️ ONE PIECE RPG   ║\n╠══════════════════════╣\n║  PENDAFTARAN BERHASIL ║\n╚══════════════════════╝\n\n🎉 Selamat bergabung, ${mention(senderNum)}!\n`+(isOwner?`👑 *(Kamu adalah Owner Bot!)*\n`:"")+`\n${ch.emoji} Karakter kamu: *${ch.name}*\n📛 Gelar   : ${ch.title}\n🍎 D.Fruit : ${ch.devil_fruit}\n📖 ${ch.description}\n\n┌─── STATISTIK ──────────┐\n│ ❤️  HP    : ${ch.hp}\n│ ⚔️  ATK   : ${ch.attack}\n│ 🛡️  DEF   : ${ch.defense}\n│ 💰 Bounty : ${ch.bounty}\n│ 💎 Berry  : 10.000\n└────────────────────────┘\n\n✨ Serangan Spesial:\n   *${ch.special}*\n\nKetik *.start* untuk mulai berlayar! 🗺️`,
      mentions:[`${senderNum}@s.whatsapp.net`],
    });
    return;
  }

  if(text===".start"){
    log.cmd(`${pushName} [${senderNum}] → .start`);
    if(!db.players[senderNum]){await sock.sendMessage(jidRaw,{text:`🏴‍☠️ ${mention(senderNum)} kamu belum terdaftar!\nKetik *.regist* dulu ya.`,mentions:[`${senderNum}@s.whatsapp.net`]});return;}
    const p=db.players[senderNum];
    const ch=CHARACTERS[p.character];
    p.hp=p.maxHp;
    const loc=LOCATIONS[p.locationIndex];
    const enemy=getEnemy(loc.danger);
    p.adventure=true;p.currentEnemy={...enemy,currentHp:enemy.hp};
    saveDB(db);
    const{level,rank}=calcLevel(p.exp);
    await sock.sendMessage(jidRaw,{
      text:`╔══════════════════════╗\n║   🗺️  GRAND LINE RPG  ║\n╚══════════════════════╝\n\n${mention(senderNum)} ${ch.emoji} *${ch.name}* berlayar menuju...\n\n📍 *${loc.emoji} ${loc.name}*\n   ${loc.desc}\n   ⚠️ Bahaya: ${"🔴".repeat(Math.min(loc.danger,5))}\n\n💥 *MUSUH MUNCUL!*\n\n${enemy.emoji} *${enemy.name}*\n┌─── STATUS PERTEMPURAN ──┐\n│ 🧑 Lv.${level} ${rank}\n│ ❤️  HP : ${p.hp} / ${p.maxHp}\n│ ⚔️  ATK: ${ch.attack}\n│\n│ 👾 ${enemy.name}\n│ ❤️  HP : ${enemy.hp}\n│ ⚔️  ATK: ${enemy.attack}\n└─────────────────────────┘\n\n*.attack* → serang normal\n*.attack spesial* → serangan spesial ✨`,
      mentions:[`${senderNum}@s.whatsapp.net`],
    });
    return;
  }

  if(text===".attack"||text===".attack spesial"){
    const isSpecial=text===".attack spesial";
    if(!db.players[senderNum]){await sock.sendMessage(jidRaw,{text:`🏴‍☠️ ${mention(senderNum)} kamu belum terdaftar!\nKetik *.regist* dulu ya.`,mentions:[`${senderNum}@s.whatsapp.net`]});return;}
    const p=db.players[senderNum];
    const ch=CHARACTERS[p.character];
    if(!p.adventure||!p.currentEnemy){await sock.sendMessage(jidRaw,{text:`⚓ ${mention(senderNum)} kamu belum dalam petualangan!\nKetik *.start* untuk mulai.`,mentions:[`${senderNum}@s.whatsapp.net`]});return;}
    const enemy=p.currentEnemy;
    let pdmg,atkDesc;
    if(isSpecial){pdmg=Math.floor(ch.attack*ch.special_multiplier*(0.9+Math.random()*0.2)-enemy.defense*0.5);pdmg=Math.max(pdmg,50);atkDesc=`✨ *${ch.special}!*`;p.specialUsed=(p.specialUsed||0)+1;}
    else{pdmg=Math.floor(ch.attack*(0.8+Math.random()*0.4)-enemy.defense*0.3);pdmg=Math.max(pdmg,20);atkDesc=`⚔️ *${rand(["Serangan telak menghantam keras!","Pukulan cepat mengenai musuh!","Tendangan kuat menghantam target!","Serangan beruntun melukai musuh!"])}*`;}
    const crit=Math.random()<0.15;
    if(crit){pdmg=Math.floor(pdmg*1.8);atkDesc+="\n   💥 *CRITICAL HIT!* (×1.8)";}
    enemy.currentHp-=pdmg;

    let out=`╔══════════════════════╗\n║   ⚔️  PERTEMPURAN!   ║\n╚══════════════════════╝\n\n${mention(senderNum)} ${ch.emoji} *${ch.name}* menyerang!\n${atkDesc}\n📉 Damage ke musuh: *-${fmt(pdmg)} HP*\n\n`;

    if(enemy.currentHp<=0){
      const{berry,exp}=enemy.reward;
      p.berry+=berry;p.exp+=exp;p.wins=(p.wins||0)+1;
      const heal=Math.floor(p.maxHp*0.3);
      p.hp=Math.min(p.hp+heal,p.maxHp);
      const prevLoc=LOCATIONS[p.locationIndex];
      if(p.locationIndex<LOCATIONS.length-1)p.locationIndex++;
      const nextLoc=LOCATIONS[p.locationIndex];
      const{level,rank}=calcLevel(p.exp);
      const won1piece=prevLoc.name==="Laugh Tale";
      p.adventure=false;p.currentEnemy=null;
      saveDB(db);
      if(won1piece){out+=`${enemy.emoji} *${enemy.name}* DIKALAHKAN! 🎉\n\n⭐⭐⭐ *SELAMAT! KAMU MENEMUKAN ONE PIECE!* ⭐⭐⭐\n\n🏆 ${mention(senderNum)} *${ch.name}* adalah Raja Bajak Laut!\n\nKetik *.start* untuk petualangan baru! 🗺️`;}
      else{out+=`${enemy.emoji} *${enemy.name}* DIKALAHKAN! 🎉\n\n┌─── REWARD ─────────────┐\n│ 💰 +${fmt(berry)} Berry\n│ ⭐ +${fmt(exp)} EXP\n│ ❤️  Pulih +${heal} HP\n└────────────────────────┘\n\n📍 Lokasi berikutnya: ${nextLoc.emoji} *${nextLoc.name}*\n\n┌─── STATUS ─────────────┐\n│ 🏅 Lv.${level} (${rank})\n│ ❤️  HP    : ${p.hp} / ${p.maxHp}\n│ 💰 Berry : ${fmt(p.berry)}\n│ ⭐ EXP   : ${fmt(p.exp)}\n└────────────────────────┘\n\nKetik *.start* untuk berlayar! ⛵`;}
      await sock.sendMessage(jidRaw,{text:out,mentions:[`${senderNum}@s.whatsapp.net`]});
      return;
    }

    let edgm=Math.floor(enemy.attack*(0.7+Math.random()*0.6)-ch.defense*0.3);
    edgm=Math.max(edgm,10);p.hp-=edgm;
    out+=`${enemy.emoji} *${enemy.name}* menyerang balik!\n📉 Damage ke kamu: *-${fmt(edgm)} HP*\n\n`;

    if(p.hp<=0){
      p.hp=Math.floor(p.maxHp*0.5);p.berry=Math.floor(p.berry*0.8);p.defeats=(p.defeats||0)+1;
      p.adventure=false;p.currentEnemy=null;
      if(p.locationIndex>0)p.locationIndex--;
      saveDB(db);
      const{level,rank}=calcLevel(p.exp);
      out+=`💔 *${mention(senderNum)} DIKALAHKAN!*\n\n┌─── AKIBAT KEKALAHAN ───┐\n│ ❤️  HP pulih 50%: ${p.hp}\n│ 💰 Berry -20%\n│ 📍 Mundur 1 lokasi\n└────────────────────────┘\n\nKetik *.start* untuk bangkit! 💪`;
      await sock.sendMessage(jidRaw,{text:out,mentions:[`${senderNum}@s.whatsapp.net`]});
      return;
    }

    p.currentEnemy=enemy;saveDB(db);
    out+=`┌─── STATUS PERTEMPURAN ──┐\n│ ${ch.emoji} ${ch.name}\n│ [${hpBar(p.hp,p.maxHp)}] ${p.hp}/${p.maxHp}\n│\n│ ${enemy.emoji} ${enemy.name}\n│ [${hpBar(enemy.currentHp,enemy.hp)}] ${enemy.currentHp}/${enemy.hp}\n└─────────────────────────┘\n\n*.attack* → serang normal\n*.attack spesial* → serangan spesial ✨`;
    await sock.sendMessage(jidRaw,{text:out,mentions:[`${senderNum}@s.whatsapp.net`]});
    return;
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  KONEKSI WHATSAPP
// ════════════════════════════════════════════════════════════════════════════
async function connectToWhatsApp(){
  const{state,saveCreds}=await useMultiFileAuthState("auth_info");

  const sock=makeWASocket({
    printQRInTerminal:false,
    auth:{
      creds:state.creds,
      keys:makeCacheableSignalKeyStore(state.keys,console),
    },
    // ✅ FIX UTAMA: browser string diupdate ke versi terbaru
    browser:["One Piece Bot","Chrome","124.0.0"],
    connectTimeoutMs:60000,
    keepAliveIntervalMs:15000,
    retryRequestDelayMs:2000,
    logger:{
      level:"silent",
      trace:()=>{},debug:()=>{},info:()=>{},warn:()=>{},error:()=>{},fatal:()=>{},
      child:()=>({trace:()=>{},debug:()=>{},info:()=>{},warn:()=>{},error:()=>{},fatal:()=>{}}),
    },
  });

  // ✅ FIX UTAMA: pairing code hanya diminta SETELAH koneksi sukses (open)
  let pairingRequested=false;

  sock.ev.on("connection.update",async({connection,lastDisconnect,qr})=>{
    if(connection==="open"){
      log.div();
      log.success(`${C.bright}✅ Bot One Piece RPG TERHUBUNG!${C.reset}`);
      log.info(`Bot     : ${CONFIG.botPhone}`);
      log.info(`Owner   : ${CONFIG.ownerNumber}`);
      log.info(`Mode    : ${CONFIG.groupOnly?"👥 GROUP ONLY":"💬 GROUP + PRIVATE"}`);
      log.info(`Prefix  : "${CONFIG.prefix}"`);
      log.div();

      // Request pairing code setelah koneksi open & belum terdaftar
      if(!sock.authState.creds.registered&&!pairingRequested){
        pairingRequested=true;
        try{
          await new Promise(r=>setTimeout(r,1000));
          const code=await sock.requestPairingCode(CONFIG.botPhone);
          log.div();
          console.log(`${C.bright}${C.green}`);
          console.log(`  ╔══════════════════════════════╗`);
          console.log(`  ║   🔑  PAIRING CODE KAMU:     ║`);
          console.log(`  ║                              ║`);
          console.log(`  ║      >>> ${code} <<<      ║`);
          console.log(`  ║                              ║`);
          console.log(`  ╚══════════════════════════════╝`);
          console.log(`${C.reset}`);
          console.log(`${C.dim}  Buka WA → Perangkat Tertaut → Tautkan dgn nomor telepon → masukkan kode${C.reset}\n`);
          log.div();
        }catch(e){
          log.error("Gagal dapat pairing code: "+e.message);
        }
      }
    }else if(connection==="connecting"){
      log.info("Menghubungkan ke WhatsApp...");
    }else if(connection==="close"){
      const code=new Boom(lastDisconnect?.error)?.output?.statusCode;
      const retry=code!==DisconnectReason.loggedOut;
      log.error(`Koneksi terputus (${code}) | Retry: ${retry}`);
      if(retry){setTimeout(()=>connectToWhatsApp(),5000);}
      else{log.warn("Logged out! Hapus folder auth_info lalu jalankan ulang.");}
    }
  });

  sock.ev.on("creds.update",saveCreds);

  sock.ev.on("messages.upsert",async({messages,type})=>{
    if(type!=="notify")return;
    for(const msg of messages){
      if(!msg.message||msg.key.fromMe)continue;
      try{await handleMessage(sock,msg);}
      catch(e){log.error(`Handle msg error: ${e.message}`);}
    }
  });

  sock.ev.on("group-participants.update",({id,participants,action})=>{
    if(action==="add")   log.group(`Masuk ke ${id}: ${participants.join(", ")}`);
    if(action==="remove")log.group(`Keluar dari ${id}: ${participants.join(", ")}`);
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  STARTUP
// ════════════════════════════════════════════════════════════════════════════
console.clear();
console.log(`${C.bright}${C.yellow}`);
console.log(`  ██████╗ ███╗   ██╗███████╗    ██████╗ ██╗███████╗ ██████╗███████╗`);
console.log(`  ██╔═══██╗████╗  ██║██╔════╝    ██╔══██╗██║██╔════╝██╔════╝██╔════╝`);
console.log(`  ██║   ██║██╔██╗ ██║█████╗      ██████╔╝██║█████╗  ██║     █████╗  `);
console.log(`  ██║   ██║██║╚██╗██║██╔══╝      ██╔═══╝ ██║██╔══╝  ██║     ██╔══╝  `);
console.log(`  ╚██████╔╝██║ ╚████║███████╗    ██║     ██║███████╗╚██████╗███████╗`);
console.log(`   ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚═╝     ╚═╝╚══════╝ ╚═════╝╚══════╝`);
console.log(`${C.reset}`);
console.log(`${C.cyan}  🏴‍☠️  RPG WhatsApp Bot — Grand Line Adventure${C.reset}`);
console.log(`${C.cyan}  Bot Number: ${CONFIG.botPhone}${C.reset}`);
console.log(`${C.dim}  Cari harta karun ONE PIECE di Grand Line!${C.reset}`);
console.log();

connectToWhatsApp();
