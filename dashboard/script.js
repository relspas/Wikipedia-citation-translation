async function renderDashboard() {
  const response = await fetch('templates.json');
  const templates = await response.json();

  const tbody = document.getElementById('dashboard-body');
  
  // Sort: UpToDate (0), Outdated (1), Unsupported (2)
  templates.sort((a, b) => {
    const getStatusRank = t => {
      if (t.id == null) return 2; // Unsupported
      if (t.id === t.current_id) return 0; // UpToDate
      return 1; // Outdated
    };
    return getStatusRank(a) - getStatusRank(b);
  });

  templates.forEach(template => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameLinkCell = document.createElement('a');
    nameLinkCell.textContent = template.name;
    nameLinkCell.href = template.link;
    nameCell.appendChild(nameLinkCell);

    const idCell = document.createElement('td');
    idCell.textContent = template.id;

    const statusCell = document.createElement('td');
    const isUpToDate = template.id === template.current_id;
    const unsupported = template.id == null;

    const icon = document.createElement('i');
    icon.classList.add('fas', 'status-icon');
    const statusText = document.createElement('span');
    statusText.style.marginLeft = '0.5rem';

    if (isUpToDate) {
      icon.classList.add('fa-check-circle', 'up-to-date');
      icon.title = "Up to date";
      statusText.textContent = "Up to Date";
    } else if (unsupported) {
      icon.classList.add('fa-exclamation-circle', 'unsupported');
      icon.title = "Unsupported";
      statusText.textContent = "Unsupported";
    } else {
      icon.classList.add('fa-exclamation-triangle', 'outdated');
      icon.title = "Outdated";
      statusText.textContent = "Outdated";
    }

    statusCell.appendChild(icon);
    statusCell.appendChild(statusText);

    row.appendChild(nameCell);
    row.appendChild(idCell);
    row.appendChild(statusCell);

    tbody.appendChild(row);
  });
}

renderDashboard();
