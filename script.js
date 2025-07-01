import templates from './templates.json';
import patterns from './patterns.json';

const templateMap = Object.fromEntries(templates.map(t => [t.name, t]));
const patternMap = Object.fromEntries(patterns.map(p => [p.name, p]));

export function translate(hebrewCitation) {
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
    { regex: /^{{\s*הערה\s*\|(?:1=)?{{([^|]+)\|([\s\S]+?)}}}}$/, hasRefTags: true },
    { regex: /^{{([^|]+)\|([\s\S]+?)}}$/, hasRefTags: false }
  ];

  for (const { regex, hasRefTags } of patterns) {
    const match = text.match(regex);
    if (match) {
      return { templateType: match[1].trim(), content: match[2], hasRefTags };
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
function applyTemplateString(template, namedFields, orderedFields) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    if (key in namedFields) {
      return namedFields[key];
    }
    if (Number(key)-1 < orderedFields.length) {
      return orderedFields[Number(key)-1];
    }
    return match;
  });
}

function buildCitation(templateType, values) {
  const { named, unnamed } = values;

  //capitalize the first letter of templateType
  if (templateType && templateType.length > 0) {
    templateType = templateType[0].toUpperCase() + templateType.slice(1);
  }

  const templateConfig = templateMap[templateType];
  if (!templateConfig) return null;

  const patternName = templateConfig.pattern || 'general';
  const patternConfig = patternMap[patternName];
  if (!patternConfig) return null;

  const fields = [];
  const destination = patternConfig.destination;

  if (patternConfig['field-map']) {
    // Named fields
    for (const [dstKey, srcKey] of Object.entries(patternConfig['field-map'])) {
      const value = named[srcKey];
      if (value != null) {
        fields.push(`${dstKey}=${value}`);
      }
    }
  }

  if (patternConfig['ordered-field-map']) {
    // Unnamed fields
    for (const [dstKey, srcKey] of Object.entries(patternConfig['ordered-field-map'])) {
      let value = applyTemplateString(srcKey, named, unnamed)
      if ((dstKey === 'date' || dstKey === 'access-date') && value) {
        value = translateHebrewMonth(value);
      }
      if (value != null) {
        fields.push(`${dstKey}=${value}`);
      }
    }
  }

  // Handle overrides from templateConfig
  if (templateConfig.override) {
    // const orderedFields = new Set(patternConfig['ordered-field-map'] || []);
    for (const [key, overrideVal] of Object.entries(templateConfig.override)) {
      // if (orderedFields.has(key)) continue; // Skip if key is in ordered-field-map --NOTE not how this should work.
      let evaluated;
      if (typeof overrideVal === 'string'){
        evaluated = applyTemplateString(overrideVal, named, unnamed);
      } else if (typeof overrideVal === 'object' && overrideVal.op === 'ternary') {
        const regex = new RegExp(overrideVal.params.condition);
        if (regex.test(applyTemplateString(overrideVal.params.testString, named, unnamed))) {
          evaluated = applyTemplateString(overrideVal.params.conditionTrue, named, unnamed);
        } else {
          evaluated = applyTemplateString(overrideVal.params.conditionFalse, named, unnamed);
        }
      }
      fields.push(`${key}=${evaluated}`);
    }
  }

  // Handle fixed-fields from templateConfig
  if (patternConfig['fixed-fields']) {
    for (const [key, value] of Object.entries(patternConfig['fixed-fields'])) {
      fields.push(`${key}=${value}`);
    }
  }

return `{{${destination}${fields.sort().map(f => `|${f}`).join('')}}}`;
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
