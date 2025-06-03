const fs = require('fs');
const TEMPLATE_FILE = '../templates.json';
const templates = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8'));

async function getCurrentRevisionId(name) {
  const url = `https://he.wikipedia.org/w/api.php?action=query&format=json&titles=Template:${encodeURIComponent(name)}&prop=revisions&rvprop=ids`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    return page.revisions?.[0]?.revid || null;
  } catch (err) {
    console.error(`Failed to fetch revision for ${name}`, err);
    return null;
  }
}

(async () => {
  const updated = [];

  for (const template of templates) {
    const currentId = await getCurrentRevisionId(template.name);
    updated.push({
      ...template,
      current_id: currentId
    });
  }

  fs.writeFileSync(TEMPLATE_FILE, JSON.stringify(updated, null, 2));
})();
