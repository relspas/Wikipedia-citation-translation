function translate(hebrewCitation) {
  const match = extractCitationContent(hebrewCitation);
  if (!match) return 'Invalid citation format.';

  const templateType = match.templateType;
  const content = match.content;
  const hasRefTags = match.hasRefTags;

  const values = splitTemplateParams(content);
  const citationBody = buildCitation(templateType, values);
  if (!citationBody) return `Unsupported citation type: {{${templateType}}}`;

  if (hasRefTags || templateType == 'הערה')
    return `<ref>${citationBody}</ref>`;
  else
    return citationBody;
}

function extractCitationContent(text) {
  const patterns = [
    { regex: /^<ref>{{([^|]+)\|([\s\S]+?)}}<\/ref>$/, hasRefTags: true },
    { regex: /^{{הערה\|{{([^|]+)\|([\s\S]+?)}}}}$/, hasRefTags: true },
    { regex: /^{{([^|]+)\|([\s\S]+?)}}$/, hasRefTags: false }
  ];

  for (const { regex, hasRefTags } of patterns) {
    const match = text.match(regex);
    if (match) {
      return { templateType: match[1], content: match[2], hasRefTags };
    }
  }

  return null;
}

function splitTemplateParams(content) {
  const parts = [];
  let current = '';
  let braceDepth = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '{' && nextChar === '{') {
      braceDepth++;
      current += '{{';
      i++;
    } else if (char === '}' && nextChar === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      current += '}}';
      i++;
    } else if (char === '|' && braceDepth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push(current.trim());
  const named = {};
  const unnamed = [];

  parts.forEach((part) => {
    const eqIndex = part.indexOf('=');
    if (eqIndex !== -1) {
      const key = part.slice(0, eqIndex).trim();
      const value = part.slice(eqIndex + 1).trim();
      named[key] = value;
    } else {
      unnamed.push(part);
    }
  });
  return { named, unnamed };
}


function buildCitation(templateType, values) {
  const { named, unnamed } = values;

  switch (templateType) {
    case 'קישור כללי':
      return `{{Cite web` +
        (named['כותרת'] ? ` |title=${named['כותרת']}` : '') +
        (named['כתובת'] ? ` |url=${named['כתובת']}` : '') +
        (named['הכותב'] ? ` |author=${named['הכותב']}` : '') +
        (named['תאריך_וידוא'] ? ` |access-date=${named['תאריך_וידוא']}` : '') +
        (named['אתר'] ? ` |website=${named['אתר']}` : '') +
        (named['שפה'] ? ` |language=${named['שפה']}` : '') +
        `}}`;

    case 'כלכליסט':{
      const [author, title, articleId, date] = unnamed;
      const url = `https://www.calcalist.co.il/local/articles/0,7340,L-${articleId},00.html`;
      return `{{Cite web |title=${title} |url=${url} |author=${author} |date=${translateHebrewMonth(date)} |website=Calcalist |language=he}}`;
    }
    case 'ערוץ7':{
      const [author, title, articleId, date] = unnamed;
      const url = `https://www.inn.co.il/news/${articleId}`;
      return `{{Cite web |title=${title} |url=${url} |author=${author} |date=${translateHebrewMonth(date)} |website=ערוץ 7 |language=he}}`;
    }
    default:
      return null;
  }
}

function translateHebrewMonth(dateString) {
  // Lookup table for Hebrew month names to English
  const monthLookup = {
    'ינואר': 'January',
    'פברואר': 'February',
    'מרץ': 'March',
    'אפריל': 'April',
    'מאי': 'May',
    'יוני': 'June',
    'יולי': 'July',
    'אוגוסט': 'August',
    'ספטמבר': 'September',
    'אוקטובר': 'October',
    'נובמבר': 'November',
    'דצמבר': 'December'
  };

  // Regular expression to match an optional 'ב' followed by a Hebrew month name
  return dateString.replace(/ב?(ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)/g, (match, month) => {
    // Replace with the English month name
    return monthLookup[month];
  });
}


function convertCitation() {
  const input = document.getElementById("input").value;
  citation = translate(input);
  document.getElementById("output").innerText = citation;
  document.getElementById("copy-status").innerText = ""; // Clear copy status
}

function copyOutput() {
  const outputText = document.getElementById("output").innerText;
  const status = document.getElementById("copy-status");

  navigator.clipboard.writeText(outputText).then(() => {
    status.innerText = "Copied!";
  }).catch(() => {
    const textarea = document.createElement("textarea");
    textarea.value = outputText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      status.innerText = "Copied using fallback!";
    } catch (err) {
      status.innerText = "Copy failed.";
    }
    document.body.removeChild(textarea);
  });
}