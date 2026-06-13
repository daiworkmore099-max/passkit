/* PassKit — generator.js — CRYPTO-SECURE ONLY */
const Generator = (() => {
  const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'iIlL1oO0',
    ambiguous: '{}[]()/\\\'"`~,;:.<>',
    hex: '0123456789ABCDEF'
  };

  const EFF_WORDS = [
    'correct','horse','battery','staple','ocean','forest','mountain','river',
    'garden','purple','happy','strong','brave','cloud','thunder','silver',
    'golden','crystal','bright','flying','jumping','running','dancing',
    'singing','building','anchor','arctic','arrow','atlas','autumn',
    'bacon','badge','balance','bamboo','basket','beacon','blanket',
    'blizzard','blossom','boulder','branch','bridge','bronze','bubble',
    'cabin','candle','canyon','carbon','carpet','castle','cedar',
    'cherry','chisel','chrome','circle','citrus','clover','cobalt',
    'coffee','compass','copper','coral','cosmic','cotton','crater',
    'crimson','crown','cruise','crystal','current','dagger','delta',
    'desert','diamond','digital','dolphin','dragon','dream','drifter',
    'eagle','earth','eclipse','elder','emerald','empire','engine',
    'enigma','epoch','escape','estate','falcon','famine','fender',
    'ferret','fever','fiber','finery','fjord','flame','flare',
    'flash','flicker','flint','flower','foam','focus','fossil',
    'fractal','frenzy','frost','frozen','fusion','future','galaxy',
    'garnet','geyser','giant','glacier','gleam','glider','glitter',
    'glory','glowing','goblin','gothic','grace','gravel','green',
    'griffin','grotto','grove','growth','guide','harbor','harvest',
    'haven','hazard','herald','herbal','hidden','hiking','hollow',
    'hunter','ignite','impact','indigo','island','jasper','jungle',
    'karma','keeper','kernel','knight','kobalt','lagoon','lantern',
    'lapis','laser','lava','layer','legend','lemon','leopard',
    'lightning','liquid','lotus','lunar','magnet','mango','mantle',
    'maple','marble','marina','matrix','meadow','meteor','mirror',
    'mister','mobius','mortar','mosaic','motion','mystic','native',
    'nebula','needle','nether','nexus','nimble','nitrogen','noble',
    'nomad','nordic','north','oasis','obsidian','onyx','orbit',
    'origin','patrol','pebble','pepper','phoenix','pillar','pioneer',
    'planet','plasma','plume','polar','prism','probe','proton',
    'puzzle','quartz','quest','quiet','rafter','rapids','raven',
    'realm','resin','ridge','ritual','rocket','rocky','rogue',
    'rustic','safari','saffron','sage','sailor','sand','sapphire',
    'scarlet','scout','shadow','shard','shield','shimmer','sierra',
    'signal','silent','sketch','sleet','slate','sleek','sliver',
    'smoke','solar','solstice','sonic','spark','spiral','spirit',
    'splash','spring','sprint','square','static','stellar','stone',
    'storm','stream','stripe','summit','sunray','swift','symbol',
    'synth','teal','temple','thorn','timber','titan','topaz',
    'torch','totem','tower','tracer','trail','tremor','trident',
    'turbo','turtle','twilight','ultra','unity','urban','vapor',
    'vector','velvet','venture','vertex','violet','vision','vista',
    'vivid','volt','vortex','warden','waterfall','whisper','winter',
    'wizard','wonder','xenon','zephyr','zenith','zone','zoom'
  ];

  function random(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = random(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generatePassword(options = {}) {
    const opts = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      customExclude: '',
      easyToSay: false,
      easyToRead: false,
      mustIncludeEachType: true,
      hexMode: false,
      ...options
    };

    if (opts.hexMode) {
      let hex = '';
      for (let i = 0; i < opts.length; i++) hex += CHARSETS.hex[random(16)];
      return hex;
    }

    if (opts.easyToSay) {
      opts.symbols = false;
      opts.numbers = false;
    }
    if (opts.easyToRead) {
      opts.excludeSimilar = true;
    }

    let charset = '';
    const types = [];
    if (opts.uppercase) { types.push(CHARSETS.uppercase); charset += CHARSETS.uppercase; }
    if (opts.lowercase) { types.push(CHARSETS.lowercase); charset += CHARSETS.lowercase; }
    if (opts.numbers) { types.push(CHARSETS.numbers); charset += CHARSETS.numbers; }
    if (opts.symbols) { types.push(CHARSETS.symbols); charset += CHARSETS.symbols; }

    if (!charset) charset = CHARSETS.lowercase + CHARSETS.uppercase;

    if (opts.excludeSimilar) {
      for (const c of CHARSETS.similar) charset = charset.split(c).join('');
    }
    if (opts.excludeAmbiguous) {
      for (const c of CHARSETS.ambiguous) charset = charset.split(c).join('');
    }
    if (opts.customExclude) {
      for (const c of opts.customExclude) charset = charset.split(c).join('');
    }

    if (!charset.length) charset = CHARSETS.lowercase;

    const arr = [];

    if (opts.mustIncludeEachType && types.length > 1) {
      const activeSets = types.map(t => {
        let s = t;
        if (opts.excludeSimilar) for (const c of CHARSETS.similar) s = s.split(c).join('');
        if (opts.excludeAmbiguous) for (const c of CHARSETS.ambiguous) s = s.split(c).join('');
        if (opts.customExclude) for (const c of opts.customExclude) s = s.split(c).join('');
        return s;
      }).filter(s => s.length > 0);

      for (const set of activeSets) {
        if (arr.length < opts.length) arr.push(set[random(set.length)]);
      }
    }

    while (arr.length < opts.length) {
      arr.push(charset[random(charset.length)]);
    }

    return shuffle(arr).join('');
  }

  function generatePassphrase(options = {}) {
    const opts = {
      wordCount: 4,
      separator: '-',
      capitalize: true,
      addNumber: false,
      addSymbol: false,
      ...options
    };

    const words = [];
    for (let i = 0; i < opts.wordCount; i++) {
      let word = EFF_WORDS[random(EFF_WORDS.length)];
      if (opts.capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
      words.push(word);
    }

    let sep = opts.separator;
    if (sep === 'number') {
      sep = String(random(9) + 1);
    }

    let phrase = words.join(sep);
    if (opts.addNumber) phrase += String(10 + random(90));
    if (opts.addSymbol) phrase += CHARSETS.symbols[random(CHARSETS.symbols.length)];

    return phrase;
  }

  function generatePIN(length = 6, options = {}) {
    const opts = {
      excludeSequential: true,
      excludeRepeating: true,
      excludeCommon: true,
      ...options
    };

    const COMMON_PINS = ['0000','1111','2222','3333','4444','5555','6666','7777','8888','9999',
      '1234','4321','0123','9876','1212','0101','2580','1357','2468','7531',
      '123456','111111','000000','123123','654321','121212','000000','112233'];

    for (let attempt = 0; attempt < 200; attempt++) {
      let pin = '';
      for (let i = 0; i < length; i++) {
        pin += String(random(10));
      }

      if (opts.excludeCommon) {
        if (COMMON_PINS.includes(pin)) continue;
      }

      if (opts.excludeSequential) {
        let skip = false;
        for (let i = 0; i < pin.length - 2; i++) {
          const a = parseInt(pin[i]), b = parseInt(pin[i+1]), c = parseInt(pin[i+2]);
          if ((b === a+1 && c === a+2) || (b === a-1 && c === a-2)) { skip = true; break; }
        }
        if (skip) continue;
      }

      if (opts.excludeRepeating) {
        let skip = false;
        for (let i = 0; i < pin.length - 2; i++) {
          if (pin[i] === pin[i+1] && pin[i+1] === pin[i+2]) { skip = true; break; }
        }
        if (skip) continue;
      }

      return pin;
    }

    let pin = '';
    for (let i = 0; i < length; i++) pin += String(random(10));
    return pin;
  }

  function generateUsername(style = 'gaming', format = 'camel', addNumber = true) {
    const banks = {
      gaming: {
        adj: ['Silent','Shadow','Neon','Cyber','Dark','Ghost','Steel','Iron','Void','Crimson',
              'Frost','Thunder','Blaze','Storm','Phantom','Rogue','Savage','Wild','Jade','Titan'],
        noun: ['Warrior','Hunter','Dragon','Wolf','Phoenix','Blade','Sniper','Raider','Striker',
               'Falcon','Viper','Knight','Ranger','Ghost','Legend','Reaper','Nexus','Wraith','Specter']
      },
      professional: {
        adj: ['Dynamic','Creative','Strategic','Innovative','Digital','Global','Expert','Elite',
              'Senior','Lead','Principal','Chief','Core','Prime','Agile','Lean','Smart','Swift'],
        noun: ['Developer','Designer','Manager','Expert','Analyst','Engineer','Architect','Consultant',
               'Director','Officer','Advisor','Builder','Creator','Maker','Solver','Thinker']
      },
      fun: {
        adj: ['Happy','Lucky','Fuzzy','Bouncy','Sparkly','Goofy','Wobbly','Snazzy','Jazzy',
              'Wacky','Zany','Chirpy','Perky','Zippy','Bubbly','Giggly','Doofy','Groovy'],
        noun: ['Panda','Penguin','Tiger','Fox','Bunny','Koala','Otter','Llama','Hamster',
               'Narwhal','Walrus','Platypus','Axolotl','Capybara','Wombat','Quokka']
      },
      anonymous: {
        adj: ['Anonymous','Private','Hidden','Secure','Unknown','Phantom','Silent','Stealth',
              'Covert','Shadow','Masked','Veiled','Nameless','Unseen','Cloaked'],
        noun: ['User','Agent','Person','Entity','Member','Visitor','Guest','Citizen',
               'Subject','Observer','Watcher','Node','Client','Proxy','Instance']
      }
    };

    const bank = banks[style] || banks.gaming;
    const results = [];

    for (let i = 0; i < 5; i++) {
      const adj = bank.adj[random(bank.adj.length)];
      const noun = bank.noun[random(bank.noun.length)];
      const num = addNumber ? String(10 + random(9990)) : '';

      let username;
      if (format === 'camel') username = adj + noun + num;
      else if (format === 'underscore') username = adj.toLowerCase() + '_' + noun.toLowerCase() + (num ? '_' + num : '');
      else username = adj.toLowerCase() + '.' + noun.toLowerCase() + (num ? '.' + num : '');

      results.push(username);
    }

    return results;
  }

  function generateWifiPassword(options = {}) {
    const opts = { length: 20, type: 'wpa2', ...options };
    if (opts.type === 'memorable') {
      return generatePassphrase({ wordCount: 3, separator: '-', capitalize: true, addNumber: true });
    }
    if (opts.type === 'tv') {
      return generatePassword({ length: opts.length, uppercase: true, lowercase: true, numbers: true, symbols: false });
    }
    return generatePassword({ length: Math.max(opts.length, 16), uppercase: true, lowercase: true, numbers: true, symbols: true });
  }

  function generateAPIKey(format = 'hex32', customLen = 64) {
    const bytes = new Uint8Array(Math.ceil(customLen / 2) + 4);
    crypto.getRandomValues(bytes);

    if (format === 'uuid') {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const hex = Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }

    if (format === 'hex32') {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      return Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
    }

    if (format === 'hex64') {
      const b = new Uint8Array(32);
      crypto.getRandomValues(b);
      return Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
    }

    if (format === 'base64') {
      const b = new Uint8Array(32);
      crypto.getRandomValues(b);
      return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
    }

    if (format === 'custom') {
      const b = new Uint8Array(Math.ceil(customLen / 2));
      crypto.getRandomValues(b);
      return Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('').slice(0, customLen);
    }

    return generateAPIKey('hex32');
  }

  function generateBulk(count, options) {
    const results = [];
    for (let i = 0; i < count; i++) results.push(generatePassword(options));
    return results;
  }

  function saveToHistory(password, type = 'password') {
    try {
      const history = getHistory();
      history.unshift({
        password,
        type,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
      });
      localStorage.setItem('pk-history', JSON.stringify(history.slice(0, 50)));
    } catch(e) {}
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('pk-history') || '[]');
    } catch(e) { return []; }
  }

  function clearHistory() {
    localStorage.removeItem('pk-history');
  }

  function getCharsetSize(options) {
    let size = 0;
    if (options.uppercase) size += 26;
    if (options.lowercase) size += 26;
    if (options.numbers) size += 10;
    if (options.symbols) size += 32;
    if (options.excludeSimilar) size = Math.max(size - 8, 1);
    return size || 26;
  }

  return {
    random, shuffle, generatePassword, generatePassphrase, generatePIN,
    generateUsername, generateWifiPassword, generateAPIKey,
    generateBulk, saveToHistory, getHistory, clearHistory, getCharsetSize,
    EFF_WORDS, CHARSETS
  };
})();
