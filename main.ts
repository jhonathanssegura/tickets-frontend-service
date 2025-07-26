type Ticket = {
  id: number;
  title: string;
  priority: 'Baja' | 'Media' | 'Alta';
  department: string;
  author: string;
  date: string;
};

type User = {
  name: string;
  avatarUrl?: string;
};

type Department = {
  id: number;
  name: string;
};

async function loadUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return;
  const user: User = await res.json();
  document.querySelector('.navbar')!.innerHTML = `Bienvenido, <span>${user.name}</span>`;
  if (user.avatarUrl) {
    (document.querySelector('.avatar') as HTMLElement).style.backgroundImage = `url('${user.avatarUrl}')`;
    (document.querySelector('.avatar') as HTMLElement).style.backgroundSize = 'cover';
  }
  document.querySelector('.user-info')!.innerHTML = `
    ${user.name} <br>
    <a href="#" id="my-account-link">Mi Cuenta</a> | <a href="#" id="logout-link">Cerrar sesión</a>
  `;
  document.getElementById('logout-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  });
}

async function loadDepartments() {
  const res = await fetch('/api/departments');
  if (!res.ok) return [];
  const departments: Department[] = await res.json();
  return departments;
}

async function loadTickets(department: string = '') {
  let url = '/api/tickets';
  if (department) url += `?department=${encodeURIComponent(department)}`;
  const res = await fetch(url);
  if (!res.ok) return;
  const tickets: Ticket[] = await res.json();
  const tbody = document.querySelector('.ticket-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  tickets.forEach(ticket => {
    tbody.innerHTML += `
      <tr>
        <td>#${ticket.id}</td>
        <td>${ticket.title}</td>
        <td><span class="priority-low">${ticket.priority}</span></td>
        <td>${ticket.department}</td>
        <td>${ticket.author}</td>
        <td>${ticket.date}</td>
      </tr>
    `;
  });
}

function setupMenuNavigation() {
  const menuLinks = document.querySelectorAll('.menu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      menuLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const section = link.textContent?.trim();
      renderSection(section || '');
    });
  });
}

function renderSection(section: string) {
  const content = document.querySelector('.content');
  if (!content) return;
  if (section === 'Tickets') {
    content.innerHTML = `
      <h2>Mis Tickets</h2>
      <p>Aquí puedes ver los tickets que tienes asignado.</p>
      <button id="departments-btn">Todos los Departamentos</button>
      <table class="ticket-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Título</th>
            <th>Prioridad</th>
            <th>Departamento</th>
            <th>Autor</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
    loadTickets();
    setupDepartmentsButton();
  } else if (section === 'Panel') {
    content.innerHTML = `<h2>Panel</h2><p>Bienvenido al panel principal.</p>`;
  } else if (section === 'Usuarios') {
    content.innerHTML = `<h2>Usuarios</h2><p>Gestión de usuarios próximamente...</p>`;
  } else if (section === 'Artículo') {
    content.innerHTML = `<h2>Artículo</h2><p>Gestión de artículos próximamente...</p>`;
  } else if (section === 'Staff') {
    content.innerHTML = `<h2>Staff</h2><p>Gestión de staff próximamente...</p>`;
  } else if (section === 'Configuración') {
    content.innerHTML = `<h2>Configuración</h2><p>Configuración del sistema próximamente...</p>`;
  }
}

function setupDepartmentsButton() {
  const btn = document.getElementById('departments-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const departments = await loadDepartments();
    if (!departments.length) return;
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.padding = '0.5rem';
    menu.style.zIndex = '1000';
    menu.style.top = btn.getBoundingClientRect().bottom + window.scrollY + 'px';
    menu.style.left = btn.getBoundingClientRect().left + 'px';
    menu.innerHTML = departments.map(dep => `<div class="dep-item" style="padding:0.3rem 1rem;cursor:pointer;">${dep.name}</div>`).join('');
    document.body.appendChild(menu);
    menu.querySelectorAll('.dep-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        loadTickets(departments[idx].name);
        document.body.removeChild(menu);
      });
    });
    document.addEventListener('click', function handler(e) {
      if (!menu.contains(e.target as Node) && e.target !== btn) {
        document.body.removeChild(menu);
        document.removeEventListener('click', handler);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  setupMenuNavigation();
  renderSection('Tickets'); // Por defecto
}); 