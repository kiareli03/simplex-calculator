// Sanitiza texto para uso seguro em innerHTML.
function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getProfileName() {
  return localStorage.getItem('simplex_name') || null;
}

function saveProfileName(name) {
  localStorage.setItem('simplex_name', name.trim());
}

function getCalcCount() {
  try {
    return JSON.parse(localStorage.getItem('simplex_history') || '[]').length;
  } catch {
    return 0;
  }
}

// Renderiza a página de perfil dinamicamente com base no estado do localStorage.
function renderProfile() {
  const name = getProfileName();
  const view = document.getElementById('profileView');

  if (!name) {
    // Primeiro acesso: exibe formulário de configuração de nome
    view.innerHTML = `
      <div class="profile-setup">
        <div class="modal-icon">∑</div>
        <p class="profile-setup-text">Configure seu nome para começar.</p>
        <div class="profile-setup-form">
          <input type="text" id="setupInput" placeholder="Seu nome" maxlength="40" autofocus />
          <button class="primary" id="setupSave">Salvar</button>
        </div>
      </div>`;

    document.getElementById('setupSave').addEventListener('click', () => {
      const n = document.getElementById('setupInput').value.trim();
      if (!n) return;
      saveProfileName(n);
      renderProfile();
    });
    document.getElementById('setupInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('setupSave').click();
    });
    return;
  }

  // Perfil configurado: exibe nome, avatar e stats
  const count = getCalcCount();
  const statsText = `${count} cálculo${count !== 1 ? 's' : ''} realizado${count !== 1 ? 's' : ''}`;

  view.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar-large">${esc(name.charAt(0).toUpperCase())}</div>
      <div class="profile-username">${esc(name)}</div>
      <div class="profile-stats-text">${statsText}</div>
      <button class="profile-edit-btn" id="editNameBtn">Alterar nome</button>
    </div>
    <div class="profile-edit-form" id="editNameForm">
      <input type="text" id="profileNameInput" value="${esc(name)}" maxlength="40" />
      <div class="profile-edit-actions">
        <button class="primary" id="profileSave">Salvar</button>
        <button id="profileCancel">Cancelar</button>
      </div>
    </div>`;

  const editForm = document.getElementById('editNameForm');
  const editBtn  = document.getElementById('editNameBtn');

  // Abre o formulário de edição ao clicar em "Alterar nome"
  editBtn.addEventListener('click', () => {
    editForm.classList.add('visible');
    editBtn.style.display = 'none';
    const input = document.getElementById('profileNameInput');
    input.focus();
    input.select();
  });

  // Salva o novo nome e volta para a visualização normal
  document.getElementById('profileSave').addEventListener('click', () => {
    const newName = document.getElementById('profileNameInput').value.trim();
    if (!newName) return;
    saveProfileName(newName);
    renderProfile();
  });

  // Cancela a edição sem salvar
  document.getElementById('profileCancel').addEventListener('click', () => {
    editForm.classList.remove('visible');
    editBtn.style.display = '';
  });

  document.getElementById('profileNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter')  document.getElementById('profileSave').click();
    if (e.key === 'Escape') document.getElementById('profileCancel').click();
  });
}

renderProfile();
