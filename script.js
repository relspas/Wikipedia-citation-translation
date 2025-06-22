import templates from './templates.json';
import patterns from './patterns.json';

const templateMap = Object.fromEntries(templates.map(t => [t.name, t]));
const patternMap = Object.fromEntries(patterns.map(p => [p.name, p]));

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
    { regex: /^{{הערה\|(?:1=)?{{([^|]+)\|([\s\S]+?)}}}}$/, hasRefTags: true },
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

// Replaces variables in template strings like `https://example.com/${articleId}`
function applyTemplateString(template, context) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => context[key] ?? '');
}

function buildCitation(templateType, values) {
  const { named, unnamed } = values;

  const templateConfig = templateMap[templateType];
  if (!templateConfig) return null;

  const patternName = templateConfig.pattern || 'general';
  const patternConfig = patternMap[patternName];
  if (!patternConfig) return null;

  const fields = [];
  const destination = patternConfig.destination;

  if (patternConfig['field-map']) {
    // Named fields
    for (const [srcKey, dstKey] of Object.entries(patternConfig['field-map'])) {
      const value = named[srcKey];
      if (value != null) {
        fields.push(`${dstKey}=${value}`);
      }
    }
  }

  if (patternConfig['ordered-field-map']) {
    // Unnamed fields
    patternConfig['ordered-field-map'].forEach((fieldName, idx) => {
      let value = unnamed[idx];
      if (fieldName === 'date' && value) {
        value = translateHebrewMonth(value);
      }
      if (value != null) {
        fields.push(`${fieldName}=${value}`);
      }
    });
  }

  // Handle overrides from templateConfig
  if (templateConfig.override) {
    for (const [key, overrideVal] of Object.entries(templateConfig.override)) {
      const evaluated = overrideVal.includes('${')
        ? applyTemplateString(overrideVal, Object.fromEntries(patternConfig['ordered-field-map']?.map((f, i) => [f, unnamed[i]]) || []))
        : overrideVal;

      fields.push(`${key}=${evaluated}`);
    }
  }

  return `{{${destination} ${fields.map(f => `|${f}`).join('')}}}`;
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

window.convertCitation = function () {
  const input = document.getElementById("input").value;
  const citation = translate(input);
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
