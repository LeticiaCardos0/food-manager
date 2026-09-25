// ======================================================================
// FoodManager - Gestão de Restaurante
// Conectado à API REST do backend Spring Boot (mesma origem, localhost:8080,
// já que o front-end é servido de dentro de src/main/resources/static/).
//
// Os valores de status/forma_pagamento/tipo_pedido são gravados como
// os enums que o backend (Java) usa (ex: "EM_PREPARACAO"), e traduzidos
// pra texto amigável só na hora de exibir na tela (ver *_LABELS abaixo).
// Como o backend está com spring.jackson.property-naming-strategy=SNAKE_CASE,
// o JSON já chega/sai em snake_case (nome_cliente, valor_total, tempo_preparo,
// data_cadastro etc.) — os mesmos nomes que este arquivo já usava.
// ======================================================================

const STATUS_PEDIDO = ['PENDENTE', 'CONFIRMADO', 'EM_PREPARACAO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];
const STATUS_LABELS = {
    PENDENTE: 'Pendente',
    CONFIRMADO: 'Confirmado',
    EM_PREPARACAO: 'Em preparação',
    SAIU_PARA_ENTREGA: 'Saiu para entrega',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado'
};

const FORMAS_PAGAMENTO = ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'];
const FORMA_PAGAMENTO_LABELS = {
    PIX: 'PIX',
    CARTAO_CREDITO: 'Cartão de Crédito',
    CARTAO_DEBITO: 'Cartão de Débito',
    DINHEIRO: 'Dinheiro'
};

const TIPOS_PEDIDO = ['RETIRADA', 'COMER_NO_LOCAL'];
const TIPO_PEDIDO_LABELS = {
    RETIRADA: 'Retirada',
    COMER_NO_LOCAL: 'Comer no local'
};

// ======================================================================
// Camada de dados ("repositório") — chamadas reais à API REST.
// Endpoints do backend: /categorias, /produtos, /clientes, /pedidos
// (GET lista, GET/{id}, POST cria, PUT/{id} atualiza, DELETE/{id} remove).
// ======================================================================

const db = { categorias: [], produtos: [], clientes: [], pedidos: [] };

async function apiGet(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Erro ao buscar ${path} (HTTP ${res.status})`);
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Erro ao criar em ${path} (HTTP ${res.status})`);
    return res.json();
}

async function apiPut(path, body) {
    const res = await fetch(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Erro ao atualizar ${path} (HTTP ${res.status})`);
    return res.json();
}

async function apiDelete(path) {
    const res = await fetch(path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Erro ao excluir ${path} (HTTP ${res.status})`);
}

async function loadAll() {
    const [categorias, produtos, clientes, pedidos] = await Promise.all([
        apiGet('/categorias'),
        apiGet('/produtos'),
        apiGet('/clientes'),
        apiGet('/pedidos')
    ]);
    db.categorias = categorias;
    db.produtos = produtos;
    db.clientes = clientes;
    db.pedidos = pedidos;
}

// ======================================================================
// Utilitários
// ======================================================================

function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function formatCurrency(v) { return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ','); }

function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

function formatMinutos(min) {
    if (min === undefined || min === null || min === '') return '—';
    return `${min} min`;
}

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function slug(status) {
    return String(status).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_\s]+/g, '-');
}

// ======================================================================
// Toast (mensagens de sucesso/erro)
// ======================================================================

function showToast(msg, type) {
    const container = qs('#toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ======================================================================
// Modal genérico (usado para formulários, visualização e confirmação)
// ======================================================================

function openModal(html) {
    const overlay = qs('#modalOverlay');
    const body = qs('#modalBody');
    if (!overlay || !body) return;
    body.innerHTML = html;
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal() {
    const overlay = qs('#modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    qs('#modalBody').innerHTML = '';
}

function confirmAction(message, onConfirm) {
    openModal(`
    <div class="confirm-box">
      <h3>Confirmar ação</h3>
      <p>${escapeHtml(message)}</p>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="confirmCancel">Cancelar</button>
        <button type="button" class="btn btn-danger" id="confirmOk">Confirmar</button>
      </div>
    </div>
  `);
    qs('#confirmCancel').addEventListener('click', closeModal);
    qs('#confirmOk').addEventListener('click', () => { onConfirm(); closeModal(); });
}

// ======================================================================
// Navegação entre telas (SPA simples baseada em hash)
// ======================================================================

function goToPage(page) {
    qsa('.page-section').forEach(sec => sec.classList.remove('active'));
    const target = qs('#page-' + page);
    if (target) target.classList.add('active');
    qsa('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === page));
    window.location.hash = page;
    renderPage(page);
    const layout = qs('.app-layout');
    if (layout) layout.classList.remove('sidebar-open');
}

function renderPage(page) {
    if (page === 'dashboard') renderDashboard();
    if (page === 'categorias') renderCategorias();
    if (page === 'produtos') renderProdutos();
    if (page === 'clientes') renderClientes();
    if (page === 'pedidos') renderPedidos();
}

// ======================================================================
// DASHBOARD
// ======================================================================

function renderDashboard() {
    const setText = (id, val) => { const el = qs('#' + id); if (el) el.textContent = val; };
    setText('totalCategorias', db.categorias.length);
    setText('totalProdutos', db.produtos.length);
    setText('totalClientes', db.clientes.length);
    setText('totalPedidos', db.pedidos.length);
    const valorTotal = db.pedidos.reduce((sum, p) => sum + Number(p.valor_total), 0);
    setText('valorTotalPedidos', formatCurrency(valorTotal));

    const recentPedidosBody = qs('#recentPedidosBody');
    if (recentPedidosBody) {
        const recentes = [...db.pedidos].sort((a, b) => b.id - a.id).slice(0, 5);
        recentPedidosBody.innerHTML = recentes.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td>${escapeHtml(p.nome_cliente)}</td>
        <td>${formatDate(p.data)}</td>
        <td>${formatCurrency(p.valor_total)}</td>
        <td><span class="status-badge status-${slug(p.status)}">${STATUS_LABELS[p.status] || p.status}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="empty-row">Nenhum pedido</td></tr>';
    }

    const recentProdutosBody = qs('#recentProdutosBody');
    if (recentProdutosBody) {
        const recentes = [...db.produtos].sort((a, b) => b.id - a.id).slice(0, 5);
        recentProdutosBody.innerHTML = recentes.map(p => `
      <tr>
        <td>${escapeHtml(p.nome)}</td>
        <td>${formatCurrency(p.preco)}</td>
        <td>${formatMinutos(p.tempo_preparo)}</td>
      </tr>
    `).join('') || '<tr><td colspan="3" class="empty-row">Nenhum produto</td></tr>';
    }

    if (qs('#kanbanBoard')) renderKanban();
}

function renderKanban() {
    const kanban = qs('#kanbanBoard');
    if (!kanban) return;
    kanban.innerHTML = STATUS_PEDIDO.map(status => {
        const pedidosStatus = db.pedidos.filter(p => p.status === status);
        return `
      <div class="kanban-column">
        <div class="kanban-column-header status-${slug(status)}">
          <span>${STATUS_LABELS[status]}</span>
          <span class="kanban-count">${pedidosStatus.length}</span>
        </div>
        <div class="kanban-cards">
          ${pedidosStatus.map(p => `
            <div class="kanban-card">
              <strong>#${p.id} — ${escapeHtml(p.nome_cliente)}</strong>
              <span>${formatCurrency(p.valor_total)} · ${FORMA_PAGAMENTO_LABELS[p.forma_pagamento] || p.forma_pagamento}</span>
              <span>${TIPO_PEDIDO_LABELS[p.tipo_pedido] || p.tipo_pedido}</span>
              <button type="button" class="btn-link kanban-view" data-id="${p.id}">Ver detalhes</button>
            </div>
          `).join('') || '<p class="empty-row">Sem pedidos</p>'}
        </div>
      </div>
    `;
    }).join('');
    qsa('.kanban-view', kanban).forEach(btn => {
        btn.addEventListener('click', () => viewPedido(Number(btn.dataset.id)));
    });
}

// ======================================================================
// CATEGORIAS
// ======================================================================

function renderCategorias() {
    const body = qs('#categoriasTableBody');
    if (!body) return;
    const term = (qs('#categoriaSearch')?.value || '').toLowerCase();
    const items = db.categorias.filter(c => c.nome.toLowerCase().includes(term));
    body.innerHTML = items.map(c => `
    <tr>
      <td>${escapeHtml(c.nome)}</td>
      <td>${escapeHtml(c.descricao)}</td>
      <td class="actions-cell">
        <button type="button" class="btn-icon" title="Visualizar" data-action="view" data-id="${c.id}">👁️</button>
        <button type="button" class="btn-icon" title="Editar" data-action="edit" data-id="${c.id}">✏️</button>
        <button type="button" class="btn-icon btn-icon-danger" title="Excluir" data-action="delete" data-id="${c.id}">🗑️</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3" class="empty-row">Nenhuma categoria encontrada</td></tr>';

    qsa('[data-action]', body).forEach(btn => {
        const id = Number(btn.dataset.id);
        btn.addEventListener('click', () => {
            if (btn.dataset.action === 'view') viewCategoria(id);
            if (btn.dataset.action === 'edit') openCategoriaForm(id);
            if (btn.dataset.action === 'delete') deleteCategoria(id);
        });
    });
}

function openCategoriaForm(id) {
    const item = id ? db.categorias.find(c => c.id === id) : null;
    openModal(`
    <h3>${item ? 'Editar categoria' : 'Nova categoria'}</h3>
    <form id="categoriaForm">
      <div class="form-group">
        <label>Nome</label>
        <input type="text" name="nome" required value="${escapeHtml(item?.nome || '')}">
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea name="descricao" rows="3">${escapeHtml(item?.descricao || '')}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelForm">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar</button>
      </div>
    </form>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
    qs('#categoriaForm').addEventListener('submit', async e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const nome = fd.get('nome').trim();
        const descricao = fd.get('descricao').trim();
        if (!nome) { showToast('Informe o nome da categoria', 'error'); return; }
        try {
            if (item) {
                await apiPut(`/categorias/${item.id}`, { nome, descricao });
                showToast('Categoria atualizada com sucesso!');
            } else {
                await apiPost('/categorias', { nome, descricao });
                showToast('Categoria cadastrada com sucesso!');
            }
            db.categorias = await apiGet('/categorias');
            closeModal();
            renderCategorias();
        } catch (err) {
            showToast('Não foi possível salvar a categoria', 'error');
        }
    });
}

function viewCategoria(id) {
    const item = db.categorias.find(c => c.id === id);
    if (!item) return;
    openModal(`
    <h3>Categoria: ${escapeHtml(item.nome)}</h3>
    <p><strong>Descrição:</strong> ${escapeHtml(item.descricao) || '—'}</p>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="cancelForm">Fechar</button>
    </div>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
}

function deleteCategoria(id) {
    const item = db.categorias.find(c => c.id === id);
    if (!item) return;
    confirmAction(`Deseja excluir a categoria "${item.nome}"?`, async () => {
        try {
            await apiDelete(`/categorias/${id}`);
            db.categorias = await apiGet('/categorias');
            showToast('Categoria excluída com sucesso!');
            renderCategorias();
        } catch (err) {
            showToast('Não foi possível excluir a categoria', 'error');
        }
    });
}

// ======================================================================
// PRODUTOS
// ======================================================================

function renderProdutos() {
    const body = qs('#produtosTableBody');
    if (!body) return;
    const term = (qs('#produtoSearch')?.value || '').toLowerCase();
    const items = db.produtos.filter(p => p.nome.toLowerCase().includes(term));
    body.innerHTML = items.map(p => `
    <tr>
      <td>${escapeHtml(p.nome)}</td>
      <td>${formatCurrency(p.preco)}</td>
      <td>${formatMinutos(p.tempo_preparo)}</td>
      <td>${escapeHtml(p.descricao)}</td>
      <td class="actions-cell">
        <button type="button" class="btn-icon" title="Visualizar" data-action="view" data-id="${p.id}">👁️</button>
        <button type="button" class="btn-icon" title="Editar" data-action="edit" data-id="${p.id}">✏️</button>
        <button type="button" class="btn-icon btn-icon-danger" title="Excluir" data-action="delete" data-id="${p.id}">🗑️</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="empty-row">Nenhum produto encontrado</td></tr>';

    qsa('[data-action]', body).forEach(btn => {
        const id = Number(btn.dataset.id);
        btn.addEventListener('click', () => {
            if (btn.dataset.action === 'view') viewProduto(id);
            if (btn.dataset.action === 'edit') openProdutoForm(id);
            if (btn.dataset.action === 'delete') deleteProduto(id);
        });
    });
}

function openProdutoForm(id) {
    const item = id ? db.produtos.find(p => p.id === id) : null;
    openModal(`
    <h3>${item ? 'Editar produto' : 'Novo produto'}</h3>
    <form id="produtoForm">
      <div class="form-group">
        <label>Nome</label>
        <input type="text" name="nome" required value="${escapeHtml(item?.nome || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Preço (R$)</label>
          <input type="number" step="0.01" min="0" name="preco" required value="${item?.preco ?? ''}">
        </div>
        <div class="form-group">
          <label>Tempo de preparo (min)</label>
          <input type="number" step="1" min="0" name="tempo_preparo" required value="${item?.tempo_preparo ?? ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea name="descricao" rows="3">${escapeHtml(item?.descricao || '')}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelForm">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar</button>
      </div>
    </form>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
    qs('#produtoForm').addEventListener('submit', async e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const nome = fd.get('nome').trim();
        const preco = parseFloat(fd.get('preco'));
        const tempo_preparo = parseInt(fd.get('tempo_preparo'), 10);
        const descricao = fd.get('descricao').trim();
        if (!nome || isNaN(preco) || isNaN(tempo_preparo)) { showToast('Preencha todos os campos obrigatórios', 'error'); return; }
        try {
            if (item) {
                await apiPut(`/produtos/${item.id}`, { nome, preco, tempo_preparo, descricao });
                showToast('Produto atualizado com sucesso!');
            } else {
                await apiPost('/produtos', { nome, preco, tempo_preparo, descricao });
                showToast('Produto cadastrado com sucesso!');
            }
            db.produtos = await apiGet('/produtos');
            closeModal();
            renderProdutos();
        } catch (err) {
            showToast('Não foi possível salvar o produto', 'error');
        }
    });
}

function viewProduto(id) {
    const item = db.produtos.find(p => p.id === id);
    if (!item) return;
    openModal(`
    <h3>Produto: ${escapeHtml(item.nome)}</h3>
    <p><strong>Preço:</strong> ${formatCurrency(item.preco)}</p>
    <p><strong>Tempo de preparo:</strong> ${formatMinutos(item.tempo_preparo)}</p>
    <p><strong>Descrição:</strong> ${escapeHtml(item.descricao) || '—'}</p>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="cancelForm">Fechar</button>
    </div>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
}

function deleteProduto(id) {
    const item = db.produtos.find(p => p.id === id);
    if (!item) return;
    confirmAction(`Deseja excluir o produto "${item.nome}"?`, async () => {
        try {
            await apiDelete(`/produtos/${id}`);
            db.produtos = await apiGet('/produtos');
            showToast('Produto excluído com sucesso!');
            renderProdutos();
        } catch (err) {
            showToast('Não foi possível excluir o produto', 'error');
        }
    });
}

// ======================================================================
// CLIENTES
// ======================================================================

function renderClientes() {
    const body = qs('#clientesTableBody');
    if (!body) return;
    const term = (qs('#clienteSearch')?.value || '').toLowerCase();
    const statusFiltro = qs('#clienteFiltroStatus')?.value || '';
    const items = db.clientes.filter(c =>
        c.nome.toLowerCase().includes(term) &&
        (!statusFiltro || String(c.ativo) === statusFiltro)
    );
    body.innerHTML = items.map(c => `
    <tr>
      <td>${escapeHtml(c.nome)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.telefone)}</td>
      <td>${escapeHtml(c.cpf)}</td>
      <td>${escapeHtml(c.endereco)}</td>
      <td>${formatDate(c.data_cadastro)}</td>
      <td><span class="status-badge ${c.ativo ? 'status-ativo' : 'status-inativo'}">${c.ativo ? 'Ativo' : 'Inativo'}</span></td>
      <td class="actions-cell">
        <button type="button" class="btn-icon" title="Visualizar" data-action="view" data-id="${c.id}">👁️</button>
        <button type="button" class="btn-icon" title="Editar" data-action="edit" data-id="${c.id}">✏️</button>
        <button type="button" class="btn-icon btn-icon-danger" title="Excluir" data-action="delete" data-id="${c.id}">🗑️</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="empty-row">Nenhum cliente encontrado</td></tr>';

    qsa('[data-action]', body).forEach(btn => {
        const id = Number(btn.dataset.id);
        btn.addEventListener('click', () => {
            if (btn.dataset.action === 'view') viewCliente(id);
            if (btn.dataset.action === 'edit') openClienteForm(id);
            if (btn.dataset.action === 'delete') deleteCliente(id);
        });
    });
}

function openClienteForm(id) {
    const item = id ? db.clientes.find(c => c.id === id) : null;
    openModal(`
    <h3>${item ? 'Editar cliente' : 'Novo cliente'}</h3>
    <form id="clienteForm">
      <div class="form-group">
        <label>Nome</label>
        <input type="text" name="nome" required value="${escapeHtml(item?.nome || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>E-mail</label>
          <input type="email" name="email" required value="${escapeHtml(item?.email || '')}">
        </div>
        <div class="form-group">
          <label>Telefone</label>
          <input type="text" name="telefone" required value="${escapeHtml(item?.telefone || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>CPF</label>
          <input type="text" name="cpf" required value="${escapeHtml(item?.cpf || '')}" placeholder="000.000.000-00">
        </div>
        <div class="form-group">
          <label>Data de cadastro</label>
          <input type="date" name="data_cadastro" required value="${item?.data_cadastro || new Date().toISOString().slice(0, 10)}">
        </div>
      </div>
      <div class="form-group">
        <label>Endereço</label>
        <input type="text" name="endereco" required value="${escapeHtml(item?.endereco || '')}" placeholder="Rua, número, bairro">
      </div>
      <div class="form-group">
        <label class="checkbox-label"><input type="checkbox" name="ativo" ${item ? (item.ativo ? 'checked' : '') : 'checked'}> Cliente ativo</label>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelForm">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar</button>
      </div>
    </form>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
    qs('#clienteForm').addEventListener('submit', async e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const nome = fd.get('nome').trim();
        const email = fd.get('email').trim();
        const telefone = fd.get('telefone').trim();
        const cpf = fd.get('cpf').trim();
        const data_cadastro = fd.get('data_cadastro');
        const endereco = fd.get('endereco').trim();
        const ativo = fd.get('ativo') === 'on';
        if (!nome || !email || !telefone || !cpf || !endereco || !data_cadastro) { showToast('Preencha todos os campos obrigatórios', 'error'); return; }
        try {
            if (item) {
                await apiPut(`/clientes/${item.id}`, { nome, email, telefone, cpf, endereco, data_cadastro, ativo });
                showToast('Cliente atualizado com sucesso!');
            } else {
                await apiPost('/clientes', { nome, email, telefone, cpf, endereco, data_cadastro, ativo });
                showToast('Cliente cadastrado com sucesso!');
            }
            db.clientes = await apiGet('/clientes');
            closeModal();
            renderClientes();
        } catch (err) {
            showToast('Não foi possível salvar o cliente', 'error');
        }
    });
}

function viewCliente(id) {
    const item = db.clientes.find(c => c.id === id);
    if (!item) return;
    openModal(`
    <h3>Cliente: ${escapeHtml(item.nome)}</h3>
    <p><strong>E-mail:</strong> ${escapeHtml(item.email)}</p>
    <p><strong>Telefone:</strong> ${escapeHtml(item.telefone)}</p>
    <p><strong>CPF:</strong> ${escapeHtml(item.cpf)}</p>
    <p><strong>Endereço:</strong> ${escapeHtml(item.endereco)}</p>
    <p><strong>Data de cadastro:</strong> ${formatDate(item.data_cadastro)}</p>
    <p><strong>Status:</strong> ${item.ativo ? 'Ativo' : 'Inativo'}</p>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="cancelForm">Fechar</button>
    </div>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
}

function deleteCliente(id) {
    const item = db.clientes.find(c => c.id === id);
    if (!item) return;
    // Observação: o backend faz "soft delete" em Cliente (marca ativo=false
    // em vez de apagar a linha) — por isso o registro continua aparecendo
    // na lista depois, só que como "Inativo".
    confirmAction(`Deseja excluir o cliente "${item.nome}"?`, async () => {
        try {
            await apiDelete(`/clientes/${id}`);
            db.clientes = await apiGet('/clientes');
            showToast('Cliente excluído com sucesso!');
            renderClientes();
        } catch (err) {
            showToast('Não foi possível excluir o cliente', 'error');
        }
    });
}

// ======================================================================
// PEDIDOS
// ======================================================================

function renderPedidos() {
    const body = qs('#pedidosTableBody');
    if (!body) return;
    const term = (qs('#pedidoSearch')?.value || '').toLowerCase();
    const statusFiltro = qs('#pedidoFiltroStatus')?.value || '';
    const items = db.pedidos.filter(p =>
        (p.nome_cliente.toLowerCase().includes(term) || String(p.id).includes(term)) &&
        (!statusFiltro || p.status === statusFiltro)
    );
    body.innerHTML = items.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>${escapeHtml(p.nome_cliente)}</td>
      <td>${formatDate(p.data)}</td>
      <td>${formatCurrency(p.valor_total)}</td>
      <td><span class="status-badge status-${slug(p.status)}">${STATUS_LABELS[p.status] || p.status}</span></td>
      <td>${FORMA_PAGAMENTO_LABELS[p.forma_pagamento] || p.forma_pagamento}</td>
      <td>${TIPO_PEDIDO_LABELS[p.tipo_pedido] || p.tipo_pedido}</td>
      <td class="actions-cell">
        <button type="button" class="btn-icon" title="Visualizar" data-action="view" data-id="${p.id}">👁️</button>
        <button type="button" class="btn-icon" title="Editar" data-action="edit" data-id="${p.id}">✏️</button>
        <button type="button" class="btn-icon btn-icon-danger" title="Excluir" data-action="delete" data-id="${p.id}">🗑️</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="empty-row">Nenhum pedido encontrado</td></tr>';

    qsa('[data-action]', body).forEach(btn => {
        const id = Number(btn.dataset.id);
        btn.addEventListener('click', () => {
            if (btn.dataset.action === 'view') viewPedido(id);
            if (btn.dataset.action === 'edit') openPedidoForm(id);
            if (btn.dataset.action === 'delete') deletePedido(id);
        });
    });
}

function openPedidoForm(id) {
    const item = id ? db.pedidos.find(p => p.id === id) : null;
    openModal(`
    <h3>${item ? 'Editar pedido' : 'Novo pedido'}</h3>
    <form id="pedidoForm">
      <div class="form-row">
        <div class="form-group">
          <label>Nome do cliente</label>
          <input type="text" name="nome_cliente" required value="${escapeHtml(item?.nome_cliente || '')}">
        </div>
        <div class="form-group">
          <label>Data</label>
          <input type="date" name="data" required value="${item?.data || new Date().toISOString().slice(0, 10)}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Valor total (R$)</label>
          <input type="number" step="0.01" min="0" name="valor_total" required value="${item?.valor_total ?? ''}">
        </div>
        <div class="form-group">
          <label>Tempo estimado (min)</label>
          <input type="number" step="1" min="0" name="tempo_estimado" required value="${item?.tempo_estimado ?? ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Status</label>
          <select name="status" id="pedidoFormStatus" required></select>
        </div>
        <div class="form-group">
          <label>Forma de pagamento</label>
          <select name="forma_pagamento" id="pedidoFormPagamento" required></select>
        </div>
      </div>
      <div class="form-group">
        <label>Tipo de pedido</label>
        <select name="tipo_pedido" id="pedidoFormTipo" required></select>
      </div>
      <div class="form-group">
        <label>Observação</label>
        <textarea name="observacao" rows="2">${escapeHtml(item?.observacao || '')}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelForm">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar</button>
      </div>
    </form>
  `);
    qs('#pedidoFormStatus').innerHTML = STATUS_PEDIDO.map(s => `<option value="${s}" ${item?.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`).join('');
    qs('#pedidoFormPagamento').innerHTML = FORMAS_PAGAMENTO.map(f => `<option value="${f}" ${item?.forma_pagamento === f ? 'selected' : ''}>${FORMA_PAGAMENTO_LABELS[f]}</option>`).join('');
    qs('#pedidoFormTipo').innerHTML = TIPOS_PEDIDO.map(t => `<option value="${t}" ${item?.tipo_pedido === t ? 'selected' : ''}>${TIPO_PEDIDO_LABELS[t]}</option>`).join('');
    qs('#cancelForm').addEventListener('click', closeModal);
    qs('#pedidoForm').addEventListener('submit', async e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const nome_cliente = fd.get('nome_cliente').trim();
        const data = fd.get('data');
        const valor_total = parseFloat(fd.get('valor_total'));
        const tempo_estimado = parseInt(fd.get('tempo_estimado'), 10);
        const status = fd.get('status');
        const forma_pagamento = fd.get('forma_pagamento');
        const tipo_pedido = fd.get('tipo_pedido');
        const observacao = fd.get('observacao').trim();
        if (!nome_cliente || !data || isNaN(valor_total) || isNaN(tempo_estimado)) { showToast('Preencha todos os campos obrigatórios', 'error'); return; }
        const payload = { nome_cliente, data, valor_total, tempo_estimado, status, forma_pagamento, tipo_pedido, observacao };
        try {
            if (item) {
                await apiPut(`/pedidos/${item.id}`, payload);
                showToast('Pedido atualizado com sucesso!');
            } else {
                await apiPost('/pedidos', payload);
                showToast('Pedido cadastrado com sucesso!');
            }
            db.pedidos = await apiGet('/pedidos');
            closeModal();
            renderPedidos();
            renderDashboard();
        } catch (err) {
            showToast('Não foi possível salvar o pedido', 'error');
        }
    });
}

function viewPedido(id) {
    const item = db.pedidos.find(p => p.id === id);
    if (!item) return;
    openModal(`
    <h3>Pedido #${item.id}</h3>
    <p><strong>Cliente:</strong> ${escapeHtml(item.nome_cliente)}</p>
    <p><strong>Data:</strong> ${formatDate(item.data)}</p>
    <p><strong>Status:</strong> <span class="status-badge status-${slug(item.status)}">${STATUS_LABELS[item.status] || item.status}</span></p>
    <p><strong>Forma de pagamento:</strong> ${FORMA_PAGAMENTO_LABELS[item.forma_pagamento] || item.forma_pagamento}</p>
    <p><strong>Tipo de pedido:</strong> ${TIPO_PEDIDO_LABELS[item.tipo_pedido] || item.tipo_pedido}</p>
    <p><strong>Tempo estimado:</strong> ${formatMinutos(item.tempo_estimado)}</p>
    <p><strong>Valor total:</strong> ${formatCurrency(item.valor_total)}</p>
    <p><strong>Observação:</strong> ${escapeHtml(item.observacao) || '—'}</p>
    <div class="form-group">
      <label>Alterar status</label>
      <select id="quickStatusChange">
        ${STATUS_PEDIDO.map(s => `<option value="${s}" ${item.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="cancelForm">Fechar</button>
      <button type="button" class="btn btn-primary" id="applyStatus">Atualizar status</button>
    </div>
  `);
    qs('#cancelForm').addEventListener('click', closeModal);
    qs('#applyStatus').addEventListener('click', async () => {
        const novoStatus = qs('#quickStatusChange').value;
        const payload = {
            nome_cliente: item.nome_cliente, data: item.data, valor_total: item.valor_total,
            tempo_estimado: item.tempo_estimado, status: novoStatus,
            forma_pagamento: item.forma_pagamento, tipo_pedido: item.tipo_pedido, observacao: item.observacao
        };
        try {
            await apiPut(`/pedidos/${item.id}`, payload);
            db.pedidos = await apiGet('/pedidos');
            showToast('Status do pedido atualizado!');
            closeModal();
            renderPedidos();
            renderDashboard();
        } catch (err) {
            showToast('Não foi possível atualizar o status', 'error');
        }
    });
}

function deletePedido(id) {
    const item = db.pedidos.find(p => p.id === id);
    if (!item) return;
    confirmAction(`Deseja excluir o pedido #${item.id}?`, async () => {
        try {
            await apiDelete(`/pedidos/${id}`);
            db.pedidos = await apiGet('/pedidos');
            showToast('Pedido excluído com sucesso!');
            renderPedidos();
            renderDashboard();
        } catch (err) {
            showToast('Não foi possível excluir o pedido', 'error');
        }
    });
}

// ======================================================================
// Inicialização
// ======================================================================

function bindStaticEvents() {
    qsa('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            goToPage(link.dataset.page);
        });
    });
    qs('#modalOverlay')?.addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
    qs('#modalClose')?.addEventListener('click', closeModal);

    qs('#categoriaSearch')?.addEventListener('input', renderCategorias);
    qs('#btnNovaCategoria')?.addEventListener('click', () => openCategoriaForm(null));

    qs('#produtoSearch')?.addEventListener('input', renderProdutos);
    qs('#btnNovoProduto')?.addEventListener('click', () => openProdutoForm(null));

    qs('#clienteSearch')?.addEventListener('input', renderClientes);
    qs('#clienteFiltroStatus')?.addEventListener('change', renderClientes);
    qs('#btnNovoCliente')?.addEventListener('click', () => openClienteForm(null));

    qs('#pedidoSearch')?.addEventListener('input', renderPedidos);
    qs('#pedidoFiltroStatus')?.addEventListener('change', renderPedidos);
    qs('#btnNovoPedido')?.addEventListener('click', () => openPedidoForm(null));

    qs('#menuToggle')?.addEventListener('click', () => {
        qs('.app-layout')?.classList.toggle('sidebar-open');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    bindStaticEvents();
    try {
        await loadAll();
    } catch (err) {
        showToast('Não foi possível conectar à API. Verifique se o backend está rodando.', 'error');
    }
    const initialPage = (window.location.hash || '#dashboard').replace('#', '');
    goToPage(['dashboard', 'categorias', 'produtos', 'clientes', 'pedidos'].includes(initialPage) ? initialPage : 'dashboard');
});