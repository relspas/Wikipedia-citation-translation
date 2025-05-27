const templates = [
    { name: "הערה", id: 36114760, link: "https://he.wikipedia.org/wiki/Template:הערה" },
    { name: "כלכליסט", id: 40088577, link: "https://he.wikipedia.org/wiki/Template:כלכליסט" },
    { name: "ערוץ7", id: 40461656, link: "https://he.wikipedia.org/wiki/Template:ערוץ7" },
    { name: "קישור כללי", id: 40441678, link: "https://he.wikipedia.org/wiki/Template:קישור_כללי" },
    { name: "ynet", id: 39904597, link: "https://he.wikipedia.org/wiki/Template:ynet" }
  ];

async function checkTemplateVersion(template) {
    const url = `https://he.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=Template:${encodeURIComponent(template.name)}&prop=revisions&rvprop=ids`;

    try {
    const response = await fetch(url);
    const data = await response.json();
    const page = Object.values(data.query.pages)[0];
    const latestId = page.revisions[0].revid;

    return {
        name: template.name,
        storedId: template.id,
        isUpToDate: latestId === template.id,
        link: template.link
    };
    } catch (error) {
    console.error('Failed to fetch version for template:', template.name);
    return {
        name: template.name,
        storedId: template.id,
        isUpToDate: false
    };
    }
}

async function buildDashboard() {
    const tbody = document.getElementById('dashboard-body');

  templates.forEach(template => {
    checkTemplateVersion(template).then(t => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameLinkCell = document.createElement('a');
    nameLinkCell.textContent = t.name;
    nameLinkCell.href = t.link;
    nameCell.appendChild(nameLinkCell);

    const idCell = document.createElement('td');
    idCell.textContent = t.storedId;

    const statusCell = document.createElement('td');
    const icon = document.createElement('i');
    icon.classList.add('fas', 'status-icon');

    const statusText = document.createElement('span');
    statusText.style.marginLeft = '0.5rem';

    if (t.isUpToDate) {
    icon.classList.add('fa-check-circle', 'up-to-date');
    icon.title = "Up to date";
    statusText.textContent = "Up to Date";
    } else {
    icon.classList.add('fa-exclamation-circle', 'outdated');
    icon.title = "Outdated";
    statusText.textContent = "Outdated";
    }

    statusCell.appendChild(icon);
    statusCell.appendChild(statusText);


    row.appendChild(nameCell);
    row.appendChild(idCell);
    row.appendChild(statusCell);

    tbody.appendChild(row);
    }).catch(err => {
      console.error(`Error rendering template "${template.name}":`, err);
    });
  });
}

buildDashboard();