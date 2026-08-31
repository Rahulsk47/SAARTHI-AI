export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  ttsCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', ttsCode: 'hi-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', ttsCode: 'kn-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', ttsCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', ttsCode: 'te-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', ttsCode: 'ml-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', ttsCode: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', ttsCode: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', ttsCode: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', ttsCode: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', ttsCode: 'or-IN' },
  { code: 'en', name: 'English', nativeName: 'English', ttsCode: 'en-IN' },
];

export const DICTIONARY_PHRASES: Record<string, Record<string, string>> = {
  ration: {
    hi: 'मैं अपने परिवार के लिए नए राशन कार्ड हेतु आवेदन करना चाहता हूँ। कृपया मेरे आवेदन को स्वीकृत करें और सरकारी योजना के तहत खाद्य सामग्री व लाभ प्रदान करें।',
    kn: 'ನಾನು ನನ್ನ ಕುಟುಂಬಕ್ಕಾಗಿ ಹೊಸ ಪಡಿತರ ಚೀಟಿಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೇನೆ. ದಯವಿಟ್ಟು ನನ್ನ ಅರ್ಜಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿ ಸರ್ಕಾರಿ ಯೋಜನೆಯಡಿ ಪಡಿತರ ಸೌಲಭ್ಯಗಳನ್ನು ಒದಗಿಸಿ.',
    ta: 'எனது குடும்பத்திற்கு புதிய ரேஷன் கார்டுக்கு விண்ணப்பிக்க விரும்புகிறேன். தயவுசெய்து எனது விண்ணப்பத்தை செயல்படுத்தி உணவுப் பொருட்களை வழங்கவும்.',
    te: 'నేను నా కుటుంబం కోసం కొత్త రేషన్ కార్డు కోసం దరఖాస్తు చేసుకోవాలనుకుంటున్నాను. దయచేసి నా దరఖాస్తును పరిశీలించి ప్రభుత్వ పథకం ద్వారా సబ్సిడీ సరుకులను అందించండి.',
    ml: 'എന്റെ കുടുംബത്തിനായി പുതിയ റേഷൻ കാർഡിനായി അപേക്ഷിക്കാൻ ഞാൻ ആഗ്രഹിക്കുന്നു. ദയവായി എന്റെ അപേക്ഷ പരിശോധിച്ച് ആനുകൂല്യങ്ങൾ നൽകുക.',
    mr: 'मी माझ्या कुटुंबासाठी नवीन शिधापत्रिका (रेशन कार्ड) मिळवण्यासाठी अर्ज करू इच्छितो. कृपया माझ्या अर्जावर प्रक्रिया करून अन्नधान्य आणि योजनांचे लाभ द्यावेत.',
    bn: 'আমি আমার পরিবারের জন্য নতুন রেশন কার্ডের জন্য আবেদন করতে চাই। অনুগ্রহ করে আবেদনটি প্রক্রিয়া করুন এবং খাদ্যশস্যের সুবিধা প্রদান করুন।',
    gu: 'હું મારા પરિવાર માટે નવા રેશન કાર્ડ માટે અરજી કરવા માંગુ છું. કૃપા કરીને મારી અરજી પર પ્રક્રિયા કરો અને સરકારી યોજનાના લાભો આપો.',
    pa: 'ਮੈਂ ਆਪਣੇ ਪਰਿਵਾਰ ਲਈ ਨਵਾਂ ਰਾਸ਼ਨ ਕਾਰਡ ਬਣਵਾਉਣ ਲਈ ਅਰਜ਼ੀ ਦੇਣਾ ਚਾਹੁੰਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਅਰਜ਼ੀ ਦੀ ਪੜਤਾਲ ਕਰਕੇ ਰਾਸ਼ਨ ਦੇ ਲਾਭ ਪ੍ਰਦਾਨ ਕਰੋ।',
    or: 'ମୁଁ ମୋ ପରିବାର ପାଇଁ ନୂତନ ରାସନ କାର୍ଡ ପାଇଁ ଆବେଦନ କରିବାକୁ ଚାହୁଁଛି। ଦୟାକରି ମୋର ଆବେଦନ ଯାଞ୍ଚ କରି ଖାଦ୍ୟ ସାମଗ୍ରୀ ଯୋଗାଇ ଦିଅନ୍ତୁ।',
    en: 'I would like to apply for a new ration card for my family. Please process my application and provide subsidized food grains and scheme benefits.',
  },
  disability: {
    hi: 'आवेदक परिवहन छूट, छात्रवृत्ति और सरकारी आरक्षण का लाभ लेने के लिए विशिष्ट दिव्यांगता पहचान पत्र (UDID कार्ड) जारी करने हेतु मेडिकल बोर्ड मूल्यांकन का अनुरोध करता है।',
    kn: 'ಸಾರಿಗೆ ರಿಯಾಯಿತಿಗಳು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಸೌಲಭ್ಯಗಳನ್ನು ಪಡೆಯಲು ಯುನಿಕ್ ಡಿಸಾಬಿಲಿಟಿ ಐಡಿ (UDID) ಕಾರ್ಡ್ ನೀಡಲು ಅರ್ಜಿದಾರರು ವೈದ್ಯಕೀಯ ಮಂಡಳಿಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಕೋರುತ್ತಾರೆ.',
    ta: 'போக்குவரத்து சலுகைகள் மற்றும் கல்வி இடஒதுக்கீட்டைப் பெற தனித்துவமான மாற்றுத்திறனாளி அடையாள அட்டை (UDID) பெறுவதற்கான மருத்துவ பரிசோதனை கோரிக்கை.',
    te: 'రవాణా రాయితీలు మరియు విద్య పరమైన రిజర్వేషన్ల ప్రయోజనం పొందడానికి యుడీఐడీ (UDID) కార్డు జారీ కోసం వైద్య పరీక్ష అభ్యర్థన.',
    ml: 'യാത്രാ ഇളവുകൾക്കും ആനുകൂല്യങ്ങൾക്കുമായി യുഡിഐഡി (UDID) കാർഡ് ലഭിക്കുന്നതിന് മെഡിക്കൽ ബോർഡ് പരിശോധനയ്ക്കുള്ള അപേക്ഷ.',
    mr: 'वाहतूक सवलती आणि शैक्षणिक आरक्षणाचा लाभ मिळवण्यासाठी युनिक डिसेबिलिटी आयडी (UDID) कार्ड मिळवण्यासाठी वैद्यकीय तपासणीची विनंती.',
    bn: 'যাতায়াত ছাড় ও সংরক্ষণের সুবিধার জন্য অনন্য প্রতিবন্ধী পরিচয়পত্র (UDID) কার্ড পাওয়ার জন্য মেডিকেল বোর্ড মূল্যায়নের অনুরোধ।',
    gu: 'મુસાફરી કન્સેશન અને યોજનાકીય લાભો માટે યુનિક દિવ્યાંગતા ઓળખપત્ર (UDID) કાર્ડ મેળવવા મેડિકલ બોર્ડ ચકાસણીની વિનંતી.',
    pa: 'ਸਫਰ ਛੋਟ ਅਤੇ ਸਰਕਾਰੀ ਲਾਭ ਲੈਣ ਲਈ ਦਿਵਿਆਂਗਤਾ ਸ਼ਨਾਖਤੀ ਕਾਰਡ (UDID) ਜਾਰੀ ਕਰਵਾਉਣ ਲਈ ਮੈਡੀਕਲ ਬੋਰਡ ਮੁਲਾਂਕਣ ਦੀ ਬੇਨਤੀ।',
    or: 'ଯାତାୟାତ ରିହାତି ଏବଂ ସରକାରୀ ସୁବିଧା ପାଇବା ପାଇଁ ଭିନ୍ନକ୍ଷମ ପରିଚୟ ପତ୍ର (UDID) ପାଇଁ ଡାକ୍ତରୀ ଯାଞ୍ଚ ଆବେଦନ।',
    en: 'Applicant requests a medical board assessment for issuing a Unique Disability ID (UDID) card for transport concessions and education benefits.',
  },
  dbt: {
    hi: 'कृपया मेरे बचत बैंक खाते को आधार नंबर से लिंक करें ताकि प्रत्यक्ष लाभ अंतरण (DBT) कल्याणकारी सब्सिडी बिना किसी रुकावट के सीधे खाते में प्राप्त हो सके।',
    kn: 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಸಬ್ಸಿಡಿಗಳನ್ನು ನಿರಂತರವಾಗಿ ಪಡೆಯಲು ದಯವಿಟ್ಟು ನನ್ನ ಉಳಿತಾಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ಜೋಡಿಸಿ.',
    ta: 'நேரடி மானிய பரிமாற்றம் (DBT) பெறுவதற்காக எனது வங்கிக் கணக்குடன் ஆதார் எண்ணை உடனடியாக இணைக்க வேண்டுகிறேன்.',
    te: 'ప్రత్యక్ష లబ్ధి బదిలీ (DBT) సబ్సిడీలను నేరుగా పొందడానికి నా బ్యాంక్ ఖాతాకు ఆధార్ నంబర్‌ను అనుసంధానించండి.',
    ml: 'ഡിബിടി (DBT) ക്ഷേമ ആനുകൂല്യങ്ങൾ തടസ്സമില്ലാതെ ലഭിക്കുന്നതിന് എന്റെ ബാങ്ക് അക്കൗണ്ടുമായി ആധಾರ್ ബന്ധിപ്പിക്കുക.',
    mr: 'थेट लाभ हस्तांतरण (DBT) अनुदान विनाअडथळा मिळण्यासाठी कृपया माझे बँक खाते आधार क्रमांकाशी संलग्न (Link) करा.',
    bn: 'সরাসরি অনুদান (DBT) পাওয়ার জন্য অনুগ্রহ করে আমার ব্যাংক একাউন্টের সাথে আধার নম্বর যুক্ত করুন।',
    gu: 'સરકારી સબસિડી સીધી ખાતામાં મેળવવા માટે કૃપા કરીને મારા બેંક એકાઉન્ટ સાથે આધાર કાર્ડ લિંક કરો.',
    pa: 'ਸਰਕਾਰੀ ਸਬਸਿਡੀ ਬਿਨਾਂ ਰੁਕਾਵਟ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੇ ਬੈਂਕ ਖਾਤੇ ਨਾਲ ਆਧਾਰ ਨੰਬਰ ਲਿੰਕ ਕਰੋ।',
    or: 'ସରକାରୀ ଡିବିଟି (DBT) ସହାୟତା ପାଇବା ପାଇଁ ଦୟାକରି ମୋର ବ୍ୟାଙ୍କ ଖାତା ସହିତ ଆଧାର ନମ୍ବର ଯୋଡ଼ନ୍ତୁ।',
    en: 'Please link my Aadhaar number with my savings bank account to receive Direct Benefit Transfer (DBT) subsidies without interruption.',
  },
};

export function getFallbackTranslation(text: string, targetLang: string, simplify = false): string {
  const lower = (text || '').toLowerCase();

  // Match common welfare presets
  if (lower.includes('ration') || lower.includes('food supplies')) {
    const res = DICTIONARY_PHRASES.ration[targetLang] || DICTIONARY_PHRASES.ration.hi;
    return simplify ? `${res} (सरल भाषा: राशन कार्ड फॉर्म जमा हो गया है)` : res;
  }
  if (lower.includes('disability') || lower.includes('udid') || lower.includes('medical board')) {
    const res = DICTIONARY_PHRASES.disability[targetLang] || DICTIONARY_PHRASES.disability.hi;
    return simplify ? `${res} (सरल भाषा: दिव्यांगता प्रमाण पत्र जांच आवेदन)` : res;
  }
  if (lower.includes('dbt') || lower.includes('aadhaar') || lower.includes('bank account')) {
    const res = DICTIONARY_PHRASES.dbt[targetLang] || DICTIONARY_PHRASES.dbt.hi;
    return simplify ? `${res} (सरल भाषा: बैंक खाते से आधार जोड़ें)` : res;
  }

  const langNames: Record<string, string> = {
    hi: 'हिंदी',
    kn: 'ಕನ್ನಡ',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    ml: 'മലയാളം',
    mr: 'मराठी',
    bn: 'বাংলা',
    gu: 'ગુજરાતી',
    pa: 'ਪੰਜਾਬੀ',
    or: 'ଓଡ଼ିଆ',
    en: 'English',
  };

  const name = langNames[targetLang] || targetLang;

  // Clean formatting for fallback
  return `[${name}]: ${text}`;
}

export function simplifyTextFallback(text: string): string {
  // Plain language rules: shorter sentences, active voice, removal of jargon
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const simplified = sentences.map((s) => {
    const clean = s
      .replace(/herein|aforementioned|pursuant to|in accordance with/gi, 'as per')
      .replace(/utilize|commence|terminate/gi, 'use/start')
      .replace(/subsequent to/gi, 'after')
      .replace(/prior to/gi, 'before')
      .replace(/shall be required to/gi, 'must')
      .replace(/it is imperative that/gi, 'please ensure');
    return `• ${clean}`;
  });

  return `Plain Language Summary:\n${simplified.join('\n')}\n\nKey Takeaway: Read all requirements carefully and keep your original ID cards ready for verification.`;
}
