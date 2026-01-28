// Complete Odia IME Transliteration Engine
// Supports all consonants, vowels, conjuncts, and special characters

// Odia vowels (স্বরবর্ণ)
const vowels: Record<string, string> = {
  'a': 'ଅ',
  'aa': 'ଆ',
  'A': 'ଆ',
  'i': 'ଇ',
  'ii': 'ଈ',
  'I': 'ଈ',
  'u': 'ଉ',
  'uu': 'ଊ',
  'U': 'ଊ',
  'ru': 'ଋ',
  'ruu': 'ୠ',
  'e': 'ଏ',
  'ai': 'ଐ',
  'o': 'ଓ',
  'au': 'ଔ',
};

// Odia vowel signs (মাত্রা) - used after consonants
const vowelSigns: Record<string, string> = {
  'a': '',  // inherent vowel
  'aa': 'ା',
  'A': 'ା',
  'i': 'ି',
  'ii': 'ୀ',
  'I': 'ୀ',
  'u': 'ୁ',
  'uu': 'ୂ',
  'U': 'ୂ',
  'ru': 'ୃ',
  'ruu': 'ୄ',
  'e': 'େ',
  'ai': 'ୈ',
  'o': 'ୋ',
  'au': 'ୌ',
};

// Odia consonants (ব্যঞ্জনবর্ণ)
const consonants: Record<string, string> = {
  'k': 'କ',
  'kh': 'ଖ',
  'g': 'ଗ',
  'gh': 'ଘ',
  'ng': 'ଙ',
  'nG': 'ଙ',
  
  'ch': 'ଚ',
  'chh': 'ଛ',
  'j': 'ଜ',
  'jh': 'ଝ',
  'ny': 'ଞ',
  'JN': 'ଞ',
  
  't': 'ଟ',
  'T': 'ଟ',
  'th': 'ଠ',
  'Th': 'ଠ',
  'd': 'ଡ',
  'D': 'ଡ',
  'dh': 'ଢ',
  'Dh': 'ଢ',
  'N': 'ଣ',
  
  'ta': 'ତ',
  'tha': 'ଥ',
  'da': 'ଦ',
  'dha': 'ଧ',
  'n': 'ନ',
  'na': 'ନ',
  
  'p': 'ପ',
  'ph': 'ଫ',
  'f': 'ଫ',
  'b': 'ବ',
  'bh': 'ଭ',
  'm': 'ମ',
  
  'y': 'ଯ',
  'Y': 'ୟ',
  'r': 'ର',
  'l': 'ଲ',
  'L': 'ଳ',
  'w': 'ୱ',
  'v': 'ଵ',
  
  'sh': 'ଶ',
  'Sh': 'ଷ',
  'shh': 'ଷ',
  's': 'ସ',
  'h': 'ହ',
  
  'x': 'କ୍ଷ',
  'ksh': 'କ୍ଷ',
  'gy': 'ଜ୍ଞ',
  'gn': 'ଜ୍ଞ',
  'jn': 'ଜ୍ଞ',
};

// Special characters and punctuation
const special: Record<string, string> = {
  '.': '।',
  '..': '॥',
  'om': 'ଓଁ',
  'OM': 'ଓଁ',
  '0': '୦',
  '1': '୧',
  '2': '୨',
  '3': '୩',
  '4': '୪',
  '5': '୫',
  '6': '୬',
  '7': '୭',
  '8': '୮',
  '9': '୯',
};

// Halant (virama) for conjuncts
const HALANT = '୍';

// Anusvara and Chandrabindu
const nasals: Record<string, string> = {
  'M': 'ଂ',  // Anusvara
  'H': 'ଃ',  // Visarga
  '~': 'ଁ',  // Chandrabindu
};

// Common word mappings for quick typing
const commonWords: Record<string, string> = {
  'namaste': 'ନମସ୍ତେ',
  'namaskar': 'ନମସ୍କାର',
  'dhanyabad': 'ଧନ୍ୟବାଦ',
  'odisha': 'ଓଡ଼ିଶା',
  'odia': 'ଓଡ଼ିଆ',
  'bhubaneswar': 'ଭୁବନେଶ୍ୱର',
  'cuttack': 'କଟକ',
  'puri': 'ପୁରୀ',
  'jagannath': 'ଜଗନ୍ନାଥ',
  'konark': 'କୋଣାର୍କ',
  'sambalpur': 'ସମ୍ବଲପୁର',
  'berhampur': 'ବ୍ରହ୍ମପୁର',
  'rourkela': 'ରାଉରକେଲା',
  'balasore': 'ବାଲେଶ୍ୱର',
  'kendrapara': 'କେନ୍ଦ୍ରାପଡ଼ା',
  'mayurbhanj': 'ମୟୂରଭଞ୍ଜ',
  'ganjam': 'ଗଞ୍ଜାମ',
  'khordha': 'ଖୋର୍ଦ୍ଧା',
  'nayagarh': 'ନୟାଗଡ଼',
  'panchayat': 'ପଞ୍ଚାୟତ',
  'sarpanch': 'ସରପଞ୍ଚ',
  'vidhayak': 'ବିଧାୟକ',
  'mantri': 'ମନ୍ତ୍ରୀ',
  'mukhyamantri': 'ମୁଖ୍ୟମନ୍ତ୍ରୀ',
  'sarkar': 'ସରକାର',
  'prashan': 'ପ୍ରଶ୍ନ',
  'prashna': 'ପ୍ରଶ୍ନ',
  'uttar': 'ଉତ୍ତର',
  'pariksha': 'ପରୀକ୍ଷା',
  'vidyarthi': 'ବିଦ୍ୟାର୍ଥୀ',
  'shikhyak': 'ଶିକ୍ଷକ',
  'vidyalaya': 'ବିଦ୍ୟାଳୟ',
  'mahavidyalaya': 'ମହାବିଦ୍ୟାଳୟ',
  'vishwavidyalaya': 'ବିଶ୍ୱବିଦ୍ୟାଳୟ',
  'sambad': 'ସମ୍ବାଦ',
  'samachar': 'ସମାଚାର',
  'khabar': 'ଖବର',
  'rajniti': 'ରାଜନୀତି',
  'krida': 'କ୍ରୀଡ଼ା',
  'khela': 'ଖେଳ',
  'cinema': 'ସିନେମା',
  'sangeet': 'ସଂଗୀତ',
  'nrutya': 'ନୃତ୍ୟ',
  'sahitya': 'ସାହିତ୍ୟ',
  'kabi': 'କବି',
  'lekhak': 'ଲେଖକ',
  'pustaka': 'ପୁସ୍ତକ',
  'pathak': 'ପାଠକ',
  'anek': 'ଅନେକ',
  'sabhu': 'ସବୁ',
  'ebe': 'ଏବେ',
  'aaji': 'ଆଜି',
  'kaali': 'କାଲି',
  'gote': 'ଗୋଟେ',
  'dui': 'ଦୁଇ',
  'tini': 'ତିନି',
  'chaari': 'ଚାରି',
  'pancha': 'ପାଞ୍ଚ',
  'chha': 'ଛଅ',
  'saata': 'ସାତ',
  'aaTha': 'ଆଠ',
  'naa': 'ନଅ',
  'dasha': 'ଦଶ',
  'sata': 'ଶତ',
  'sahasa': 'ସହସ୍ର',
  'laksha': 'ଲକ୍ଷ',
  'koti': 'କୋଟି',
  'anka': 'ଅଙ୍କ',
  'marks': 'ମାର୍କ',
  'section': 'ବିଭାଗ',
  'bibhag': 'ବିଭାଗ',
  'mcq': 'ବହୁ ବିକଳ୍ପ',
  'short': 'ସଂକ୍ଷିପ୍ତ',
  'long': 'ବିସ୍ତୃତ',
  'headline': 'ଶିରୋନାମା',
  'body': 'ମୂଳ ବିଷୟ',
  'politics': 'ରାଜନୀତି',
  'sports': 'କ୍ରୀଡ଼ା',
  'local': 'ସ୍ଥାନୀୟ',
  'national': 'ଜାତୀୟ',
  'entertainment': 'ମନୋରଞ୍ଜନ',
};

export interface TransliterationResult {
  text: string;
  suggestions: string[];
  isComplete: boolean;
}

// Check if a string ends with a consonant pattern
function endsWithConsonant(input: string): boolean {
  const consonantPatterns = Object.keys(consonants).sort((a, b) => b.length - a.length);
  for (const pattern of consonantPatterns) {
    if (input.endsWith(pattern)) {
      return true;
    }
  }
  return false;
}

// Parse input and generate transliteration
export function transliterate(input: string): string {
  if (!input) return '';
  
  // Check for common words first
  const lowerInput = input.toLowerCase();
  if (commonWords[lowerInput]) {
    return commonWords[lowerInput];
  }
  
  let result = '';
  let i = 0;
  let lastWasConsonant = false;
  
  while (i < input.length) {
    let matched = false;
    
    // Try to match longest patterns first
    for (let len = 4; len >= 1 && !matched; len--) {
      const chunk = input.substring(i, i + len);
      const lowerChunk = chunk.toLowerCase();
      
      // Check special characters
      if (special[chunk]) {
        result += special[chunk];
        i += len;
        matched = true;
        lastWasConsonant = false;
        break;
      }
      
      // Check nasals
      if (nasals[chunk]) {
        result += nasals[chunk];
        i += len;
        matched = true;
        lastWasConsonant = false;
        break;
      }
      
      // Check consonants
      if (consonants[chunk] || consonants[lowerChunk]) {
        const consonant = consonants[chunk] || consonants[lowerChunk];
        
        // Check if next character is a vowel
        const remaining = input.substring(i + len);
        let vowelMatch = '';
        let vowelLen = 0;
        
        for (let vlen = 2; vlen >= 1; vlen--) {
          const vchunk = remaining.substring(0, vlen);
          if (vowelSigns[vchunk] !== undefined) {
            vowelMatch = vowelSigns[vchunk];
            vowelLen = vlen;
            break;
          }
        }
        
        // Check for halant (conjunct)
        if (remaining.startsWith('_') || remaining.startsWith('^')) {
          result += consonant + HALANT;
          i += len + 1;
          matched = true;
          lastWasConsonant = true;
          break;
        }
        
        if (vowelLen > 0) {
          result += consonant + vowelMatch;
          i += len + vowelLen;
        } else {
          // Default inherent 'a' vowel - but suppress at word end
          const nextChar = input[i + len];
          if (nextChar && /[a-zA-Z]/.test(nextChar)) {
            result += consonant;
          } else {
            result += consonant;
          }
          i += len;
        }
        
        matched = true;
        lastWasConsonant = !vowelLen;
        break;
      }
      
      // Check vowels (standalone)
      if (vowels[chunk] || vowels[lowerChunk]) {
        if (lastWasConsonant && vowelSigns[chunk]) {
          // Add vowel sign to previous consonant
          result += vowelSigns[chunk];
        } else {
          result += vowels[chunk] || vowels[lowerChunk];
        }
        i += len;
        matched = true;
        lastWasConsonant = false;
        break;
      }
    }
    
    // If no match, keep the character as-is
    if (!matched) {
      result += input[i];
      i++;
      lastWasConsonant = false;
    }
  }
  
  return result;
}

// Generate suggestions for partial input
export function getSuggestions(input: string, maxSuggestions: number = 5): string[] {
  if (!input || input.length < 1) return [];
  
  const lowerInput = input.toLowerCase();
  const suggestions: string[] = [];
  
  // Direct transliteration
  const directTranslit = transliterate(input);
  if (directTranslit && directTranslit !== input) {
    suggestions.push(directTranslit);
  }
  
  // Common word matches
  for (const [key, value] of Object.entries(commonWords)) {
    if (key.startsWith(lowerInput) && !suggestions.includes(value)) {
      suggestions.push(value);
    }
    if (suggestions.length >= maxSuggestions) break;
  }
  
  // Partial matches
  if (suggestions.length < maxSuggestions) {
    for (const [key, value] of Object.entries(commonWords)) {
      if (key.includes(lowerInput) && !key.startsWith(lowerInput) && !suggestions.includes(value)) {
        suggestions.push(value);
      }
      if (suggestions.length >= maxSuggestions) break;
    }
  }
  
  return suggestions.slice(0, maxSuggestions);
}

// Get Odia numeral
export function toOdiaNumeral(num: number): string {
  const numerals = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
  return num.toString().split('').map(d => numerals[parseInt(d)] || d).join('');
}

// Convert Odia numeral back to number
export function fromOdiaNumeral(odiaNum: string): number {
  const numerals: Record<string, string> = {
    '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4',
    '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
  };
  return parseInt(odiaNum.split('').map(d => numerals[d] || d).join(''));
}

// Check if text contains Odia script
export function containsOdia(text: string): boolean {
  return /[\u0B00-\u0B7F]/.test(text);
}

// Get typing hint for current input
export function getTypingHint(input: string): string {
  if (!input) return '';
  
  const lastChar = input.slice(-1);
  const hints: Record<string, string> = {
    'k': 'ka=କ, kh=ଖ, ksh=କ୍ଷ',
    'g': 'ga=ଗ, gh=ଘ, gy=ଜ୍ଞ',
    'c': 'ch=ଚ, chh=ଛ',
    'j': 'ja=ଜ, jh=ଝ, jn=ଜ୍ଞ',
    't': 'ta=ତ/ଟ, th=ଥ/ଠ',
    'd': 'da=ଦ/ଡ, dh=ଧ/ଢ',
    'n': 'na=ନ, N=ଣ, ng=ଙ, ny=ଞ',
    'p': 'pa=ପ, ph=ଫ',
    'b': 'ba=ବ, bh=ଭ',
    's': 'sa=ସ, sh=ଶ, Sh=ଷ',
  };
  
  return hints[lastChar.toLowerCase()] || '';
}
