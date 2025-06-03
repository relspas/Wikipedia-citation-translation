const fs = require('fs');
const path = require('path');

const TEMPLATE_FILE = path.join(__dirname, '../templates.json');
const templates = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8'));

const BATCH_SIZE = 50; // Max titles per API request

async function getRevisionsBatch(names) {
  const titlesParam = names.map(name => `Template:${name}`).join('|');
  const url = `https://he.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(titlesParam)}&prop=revisions&rvprop=ids`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const revisionsMap = {};

    for (const pageId in pages) {
      const page = pages[pageId];
      const title = page.title.replace('Template:', '');
      const revId = page.revisions?.[0]?.revid || null;
      revisionsMap[title] = revId;
    }

    return revisionsMap;
  } catch (err) {
    console.error(`Failed to fetch batch`, err);
    return {};
  }
}

(async () => {
  const updated = [];
  for (let i = 0; i < templates.length; i += BATCH_SIZE) {
    const batch = templates.slice(i, i + BATCH_SIZE);
    const names = batch.map(t => t.name);
    const revisionMap = await getRevisionsBatch(names);
    console.log(`Fetched revisions for batch ${Math.ceil((i + 1) / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, templates.length)}/${templates.length})`);
    console.log(revisionMap);
    for (const template of batch) {
      const currentId = revisionMap["תבנית:"+template.name] || null;
      updated.push({
        ...template,
        current_id: currentId,
      });
    }

    // Optional delay to be polite to the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  fs.writeFileSync(TEMPLATE_FILE, JSON.stringify(updated, null, 2));
  console.log(`✅ Updated ${updated.length} templates`);
})();
