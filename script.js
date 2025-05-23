function translate(hebrewCitation) {
  const match = hebrewCitation.match(/<ref>{{קישור כללי\|([\s\S]+?)}}<\/ref>/);
  if (!match) return 'Invalid citation format.';

  const content = match[1];

  // Split by | outside of {{...}}
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

  // Convert to hash table
  const values = {};
  parts.forEach(part => {
    const [key, ...valParts] = part.split('=');
    if (key && valParts.length) {
      values[key.trim()] = valParts.join('=').trim();
    }
  });

  // Map Hebrew keys to English citation fields
  const citation = `<ref>{{Cite web` +
    (values['כותרת'] ? ` |title=${values['כותרת']}` : '') +
    (values['כתובת'] ? ` |url=${values['כתובת']}` : '') +
    (values['תאריך_וידוא'] ? ` |access-date=${values['תאריך_וידוא']}` : '') +
    (values['אתר'] ? ` |website=${values['אתר']}` : '') +
    (values['שפה'] ? ` |language=${values['שפה']}` : '') +
    `}}</ref>`;

  return citation;
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