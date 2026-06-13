/* PassKit — strength.js */
const PasswordStrength = (() => {
  const COMMON_PASSWORDS = [
    'password','123456','password123','admin','letmein','welcome','monkey',
    'dragon','master','hello','shadow','pass','test','qwerty','abc123',
    '111111','password1','iloveyou','sunshine','princess','football','charlie',
    'aa123456','donald','password2','qwerty123','123456789','1234567890',
    '12345678','12345','1234','123','1234567','baseball','solo','michael',
    'superman','batman','access','login','trustno1','696969','mustang',
    'whatever','enable','ninja','startrek','cheese','jessica','thomas',
    'hunter','ranger','jennifer','joshua','pepper','harley','andrew',
    'hottie','purple','daniel','maggie','george','jordan','asdfgh',
    'soccer','tigger','batman','hockey','harley','yankees','freedom',
    'nintendo','computer','internet','service','passw0rd','corvette',
    'matrix','secret','test123','abc','111222','password!','pa$$word'
  ];

  const DICT_WORDS = ['password','login','admin','user','welcome','letmein',
    'test','guest','demo','root','system','security','access','master'];

  function analyze(password) {
    if (!password) return null;

    const length = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const uniqueChars = new Set(password).size;
    const charVariety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    const isCommonPassword = COMMON_PASSWORDS.includes(password.toLowerCase());
    const hasDictionaryWord = DICT_WORDS.some(w => password.toLowerCase().includes(w) && w.length > 4);

    let hasSequential = false;
    for (let i = 0; i < password.length - 2; i++) {
      const a = password.charCodeAt(i), b = password.charCodeAt(i+1), c = password.charCodeAt(i+2);
      if ((b === a+1 && c === a+2) || (b === a-1 && c === a-2)) { hasSequential = true; break; }
    }

    let hasRepeating = false;
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i+1] && password[i+1] === password[i+2]) { hasRepeating = true; break; }
    }

    const KEYBOARD_WALKS = ['qwerty','asdfgh','zxcvbn','qwertyuiop','asdfghjkl',
      'zxcvbnm','1234567','abcdef','password','123456'];
    const hasKeyboardWalk = KEYBOARD_WALKS.some(w => password.toLowerCase().includes(w));

    const hasPersonalPattern = /\b(19|20)\d{2}\b/.test(password) ||
      /\b\d{2}[\/\-]\d{2}[\/\-]\d{2,4}\b/.test(password);

    // Score
    let score = 0;
    if (length >= 4) score += 10;
    if (length >= 8) score += 10;
    if (length >= 12) score += 15;
    if (length >= 16) score += 15;
    if (length >= 20) score += 15;

    if (hasUpper) score += 8;
    if (hasLower) score += 8;
    if (hasNumber) score += 8;
    if (hasSymbol) score += 8;

    if (uniqueChars > 10) score += 5;
    if (uniqueChars > 15) score += 5;

    if (hasSequential) score -= 15;
    if (hasRepeating) score -= 15;
    if (hasKeyboardWalk) score -= 20;
    if (isCommonPassword) score = Math.min(score, 10);
    if (length < 8) score = Math.min(score, 25);

    score = Math.max(0, Math.min(100, score));

    let grade, label, icon, colorClass;
    if (score <= 25) { grade = 'weak'; label = 'Very Weak'; icon = '❌'; colorClass = 'weak'; }
    else if (score <= 50) { grade = 'fair'; label = 'Fair'; icon = '⚠️'; colorClass = 'fair'; }
    else if (score <= 75) { grade = 'good'; label = 'Good'; icon = '✅'; colorClass = 'good'; }
    else { grade = 'strong'; label = 'Strong'; icon = '🛡️'; colorClass = 'strong'; }

    // Entropy
    let charsetSize = 0;
    if (hasLower) charsetSize += 26;
    if (hasUpper) charsetSize += 26;
    if (hasNumber) charsetSize += 10;
    if (hasSymbol) charsetSize += 32;
    if (!charsetSize) charsetSize = 26;
    const entropy = length * Math.log2(charsetSize);

    // Crack time
    const crackTime = estimateCrackTime(charsetSize, length);

    // Tips
    const tips = [];
    if (length < 12) tips.push('Add more characters — aim for 16+');
    if (!hasUpper) tips.push('Add uppercase letters (A-Z)');
    if (!hasLower) tips.push('Add lowercase letters (a-z)');
    if (!hasNumber) tips.push('Include at least one number (0-9)');
    if (!hasSymbol) tips.push('Add symbols like !@#$ for extra security');
    if (hasSequential) tips.push('Avoid sequential characters (abc, 123)');
    if (hasRepeating) tips.push('Avoid repeated characters (aaa, 111)');
    if (hasKeyboardWalk) tips.push('Avoid keyboard patterns (qwerty, asdf)');
    if (isCommonPassword) tips.push('This is a very commonly used password — change it immediately');
    if (hasDictionaryWord) tips.push('Contains a common word — add more random characters');
    if (hasPersonalPattern) tips.push('Avoid dates or personal number patterns');
    if (length >= 12 && !hasSymbol && !isCommonPassword) tips.push('Adding symbols would significantly increase strength');

    // Meter width
    let meterWidth;
    if (score <= 25) meterWidth = 20;
    else if (score <= 50) meterWidth = 45;
    else if (score <= 75) meterWidth = 70;
    else meterWidth = 100;

    return {
      length, hasUpper, hasLower, hasNumber, hasSymbol,
      uniqueChars, charVariety, isCommonPassword, hasDictionaryWord,
      hasSequential, hasRepeating, hasKeyboardWalk, hasPersonalPattern,
      score, grade, label, icon, colorClass, entropy, crackTime, tips,
      meterWidth, charsetSize
    };
  }

  function estimateCrackTime(charsetSize, length) {
    const GUESSES_PER_SEC = 1e10;

    try {
      if (length > 30) return 'Longer than the age of the universe';

      let combinations;
      if (length <= 20) {
        combinations = Math.pow(charsetSize, length);
      } else {
        return 'Longer than the age of the universe';
      }

      const seconds = combinations / GUESSES_PER_SEC;

      if (seconds < 1) return 'Less than 1 second';
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
      if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
      if (seconds < 3.156e9) return `${Math.round(seconds / 31536000).toLocaleString()} years`;
      if (seconds < 3.156e12) return `${Math.round(seconds / 3.156e9).toLocaleString()} thousand years`;
      if (seconds < 3.156e15) return 'Millions of years';
      if (seconds < 3.156e18) return 'Billions of years';
      return 'Longer than the age of the universe';
    } catch (e) {
      return 'Practically uncrackable';
    }
  }

  async function checkBreach(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }
    });

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix && hashSuffix.trim() === suffix) {
        return { found: true, count: parseInt(count.trim()) };
      }
    }

    return { found: false, count: 0 };
  }

  return { analyze, estimateCrackTime, checkBreach, COMMON_PASSWORDS };
})();
