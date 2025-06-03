async function renderDashboard() {
  const response = await fetch('templates.json');
  const templates = await response.json();

  const tbody = document.getElementById('dashboard-body');
  const rowMap = new Map();

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

    const icon = document.createElement('i');
    icon.classList.add('fas', 'status-icon');
    const statusText = document.createElement('span');
    statusText.style.marginLeft = '0.5rem';

    if (isUpToDate) {
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
  });
}

renderDashboard();
