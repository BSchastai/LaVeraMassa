// =========================================
// 0. VARIÁVEIS GLOBAIS E UTILITÁRIOS
// =========================================
let idEdicaoIngrediente = null;
let listaEstoqueGlobal = [];
let ordemAtual = { coluna: 'id', direcao: 'asc' };
let idParaDeletar = null;
let tipoParaDeletar = '';
let listaPratosGlobal = [];
let idEdicaoPrato = null;
let itensMesaAtual = [];
let idMesaAberta = null;

// Formatadores
function formatarTelefone(telefone) {
    if (!telefone) return "-";
    const limpo = telefone.replace(/\D/g, '');
    if (limpo.length === 11) return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 7)}-${limpo.substring(7)}`;
    else if (limpo.length === 10) return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 6)}-${limpo.substring(6)}`;
    return telefone;
}

function limparMoedaParaFloat(valorString) {
    if(!valorString) return 0;
    let limpo = valorString.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
    return parseFloat(limpo);
}

function mascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, "");
    valor = (Number(valor) / 100).toFixed(2) + "";
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = "R$ " + valor;
}

// Recalculo de custo do prato
function recalcularCusto() {
    const checkboxes = document.querySelectorAll('.chk-ingrediente:checked');
    let custoTotal = 0;
    checkboxes.forEach(chk => {
        const preco = parseFloat(chk.getAttribute('data-preco'));
        if (!isNaN(preco)) custoTotal += preco;
    });
    const displayCusto = document.getElementById('display-custo-total');
    if(displayCusto) displayCusto.innerText = custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const inputVenda = document.getElementById('prato-preco');
    if(inputVenda) {
        const precoSugerido = custoTotal + 15.00;
        let valorFormatado = precoSugerido.toFixed(2).replace('.', ',');
        valorFormatado = valorFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        inputVenda.value = "R$ " + valorFormatado;
    }
}

// =========================================
// 1. INICIALIZAÇÃO E LOGIN
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se está no dashboard
    const areaUsuario = document.querySelector('.user-info');
    if(areaUsuario) {
        const nomeSalvo = localStorage.getItem('usuarioLogado');
        if(nomeSalvo) {
            areaUsuario.querySelector('b').innerText = nomeSalvo;
            const avatar = document.querySelector('.avatar-circle');
            if(avatar) avatar.innerText = nomeSalvo.charAt(0).toUpperCase();
        }
        // Tenta carregar a primeira tela padrão
        if(typeof carregarFuncionarios === 'function') carregarFuncionarios();
    }
    
    // Verifica se está no login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const btnOlho = document.getElementById('btn-ver-senha');
        const inputSenha = document.getElementById('login-pass');
        if(btnOlho && inputSenha) {
            btnOlho.addEventListener('click', function() {
                const tipo = inputSenha.getAttribute('type') === 'password' ? 'text' : 'password';
                inputSenha.setAttribute('type', tipo);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.querySelector('.btn-login');
            const usuario = document.getElementById('login-user').value;
            const senha = document.getElementById('login-pass').value;
            btn.innerText = "VERIFICANDO...";
            btn.disabled = true;
            try {
                const response = await fetch('http://localhost:5225/api/web/Funcionario/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: usuario, senha: senha })
                });
                if (response.ok) {
                    const dados = await response.json();
                    localStorage.setItem('usuarioLogado', dados.nome);
                    window.location.href = 'dashboard.html';
                } else {
                    // AVISO BONITO DE ERRO DE SENHA
                    mostrarAviso('erro', 'Acesso Negado', 'Usuário ou senha incorretos.');
                    
                    btn.innerText = "ACESSAR";
                    btn.disabled = false;
                }
            } catch (e) {
                // AVISO BONITO DE ERRO DE CONEXÃO
                mostrarAviso('erro', 'Erro de Conexão', 'Não foi possível conectar ao servidor.');
                
                btn.innerText = "ACESSAR";
                btn.disabled = false;
            }
        });
    }
});

// =========================================
// 2. NAVEGAÇÃO (SIDEBAR)
// =========================================
function mostrarSecao(idSecao, elementoLink) {
    const secoes = document.querySelectorAll('.panel-section');
    secoes.forEach(sec => sec.style.display = 'none');
    
    const secaoAlvo = document.getElementById('sec-' + idSecao);
    if(secaoAlvo) secaoAlvo.style.display = 'block';

    const titulos = {
        'usuarios': 'Gerenciamento de Funcionários',
        'estoque': 'Controle de Estoque',
        'reservas': 'Gestão de Reservas',
        'pedidos': 'Pedidos em Tempo Real',
        'cardapio': 'Editar Cardápio',
        'mesas': 'Controle de Mesas',
        'faturamento': 'Relatório Financeiro'
    };
    const tituloEl = document.getElementById('titulo-secao');
    if(tituloEl) tituloEl.innerText = titulos[idSecao] || 'Painel';

    const links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(link => link.classList.remove('active'));
    if(elementoLink) elementoLink.classList.add('active');

    // Chama as funções de carregamento SE elas existirem
    if(idSecao === 'usuarios') carregarFuncionarios();
    if(idSecao === 'estoque') carregarEstoque();
    if(idSecao === 'reservas') carregarReservas();
    if(idSecao === 'cardapio') carregarPratos();
    if(idSecao === 'mesas') carregarMesas();
    if(idSecao === 'pedidos') carregarPedidosCozinha();
    if(idSecao === 'faturamento') carregarFaturamento();
}

// =========================================
// 3. MODAIS E AVISOS
// =========================================
function mostrarAviso(tipo, titulo, mensagem) {
    const modal = document.getElementById('modal-aviso');
    const icon = document.getElementById('aviso-icon');
    const title = document.getElementById('aviso-titulo');
    const msg = document.getElementById('aviso-msg');
    if(!modal) return;

    modal.style.display = 'flex';
    title.innerText = titulo;
    msg.innerHTML = mensagem;
    if(tipo === 'sucesso') icon.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
    else icon.innerHTML = '<i class="fas fa-times-circle" style="color: #dc3545;"></i>';
}

function fecharConfirmacao() {
    const modal = document.getElementById('modal-confirm');
    if(modal) modal.style.display = 'none';
    idParaDeletar = null;
}

function confirmarExclusao(id, tipo) {
    idParaDeletar = id;
    tipoParaDeletar = tipo;
    const modal = document.getElementById('modal-confirm');
    if(modal) modal.style.display = 'flex';
}

const btnConfirmDelete = document.getElementById('btn-confirm-delete');
if(btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
        if(!idParaDeletar) return;
        const id = idParaDeletar;
        const tipo = tipoParaDeletar;
        
        if(tipo === 'reserva') await executarDelecaoReserva(id);
        if(tipo === 'estoque') await executarDelecaoEstoque(id);
        if(tipo === 'funcionario') await executarDelecaoFuncionario(id);
        if(tipo === 'prato') await deletarPratoReal(id);
        
        fecharConfirmacao(); 
    });
}

// =========================================
// 4. FUNCIONALIDADES: FUNCIONÁRIOS
// =========================================
function abrirModalUsuario() { 
    const m = document.getElementById('modal-usuario'); 
    if(m) m.style.display = 'flex'; 
}
function fecharModalUsuario() { 
    const m = document.getElementById('modal-usuario'); 
    if(m) m.style.display = 'none'; 
}

async function carregarFuncionarios() {
    const tabela = document.getElementById('tabela-funcionarios');
    if(!tabela) return;
    const msgVazio = document.getElementById('msg-vazio');
    tabela.innerHTML = '';
    if(msgVazio) msgVazio.style.display = 'block';
    try {
        const response = await fetch('http://localhost:5225/api/web/Funcionario/lista');
        if (response.ok) {
            const lista = await response.json();
            if (lista.length > 0) {
                if(msgVazio) msgVazio.style.display = 'none';
                lista.forEach(func => {
                    let cargo = func.funcao === 2 ? "Gerente" : (func.funcao === 1 ? "Cozinheiro" : "Atendente");
                    let badge = func.funcao === 2 ? "admin" : "waiter";
                    tabela.innerHTML += `
                        <tr>
                            <td>${func.id}</td>
                            <td><strong>${func.nome}</strong></td>
                            <td>-</td>
                            <td><span class="badge-role ${badge}">${cargo}</span></td>
                            <td><button class="action-btn delete" onclick="confirmarExclusao(${func.id}, 'funcionario')"><i class="fas fa-trash"></i></button></td>
                        </tr>`;
                });
            }
        }
    } catch (error) { console.error(error); }
}

async function executarDelecaoFuncionario(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Funcionario/deleta?id=${id}`, { method: 'DELETE' });
        if(response.ok) { mostrarAviso('sucesso', 'Removido', 'Funcionário excluído.'); carregarFuncionarios(); }
        else mostrarAviso('erro', 'Erro', 'Falha ao excluir.');
    } catch (e) { mostrarAviso('erro', 'Erro', 'Erro de conexão.'); }
}

const formCriarUsuario = document.getElementById('form-criar-usuario');
if(formCriarUsuario) {
    formCriarUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('novo-nome').value;
        const senha = document.getElementById('novo-senha').value;
        const funcao = parseInt(document.getElementById('novo-funcao').value);
        try {
            const response = await fetch('http://localhost:5225/api/web/Funcionario/cria-funcionario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, senha, funcao })
            });
            if (response.ok) {
                mostrarAviso('sucesso', 'Sucesso', 'Funcionário cadastrado.');
                fecharModalUsuario();
                formCriarUsuario.reset();
                carregarFuncionarios();
            } else alert("Erro no servidor.");
        } catch (error) { alert("Erro de conexão."); }
    });
}

// =========================================
// 5. GESTÃO DE ESTOQUE
// =========================================
function abrirModalIngrediente(id = null, nome = '', qtd = '', preco = 0, unidade = 'Un') {
    const modal = document.getElementById('modal-ingrediente');
    if(!modal) return;
    const titulo = modal.querySelector('h3');
    const btn = modal.querySelector('.btn-save');
    if (id) {
        idEdicaoIngrediente = id;
        titulo.innerText = "Editar Ingrediente";
        document.getElementById('ing-nome').value = nome;
        document.getElementById('ing-qtd').value = qtd;
        document.getElementById('ing-preco').value = preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('ing-unidade').value = unidade;
        btn.innerText = "Atualizar";
    } else {
        idEdicaoIngrediente = null;
        titulo.innerText = "Novo Ingrediente";
        document.getElementById('form-criar-ingrediente').reset();
        document.getElementById('ing-preco').value = "";
        btn.innerText = "Salvar";
    }
    modal.style.display = 'flex';
}
function fecharModalIngrediente() { 
    const m = document.getElementById('modal-ingrediente');
    if(m) m.style.display = 'none'; 
    idEdicaoIngrediente = null; 
}

async function carregarEstoque() {
    const tabela = document.getElementById('tabela-estoque');
    const msgVazio = document.getElementById('msg-vazio-estoque');
    if(!tabela) return;
    tabela.innerHTML = '';
    if(msgVazio) { msgVazio.style.display = 'block'; msgVazio.innerText = "Carregando..."; }
    try {
        const response = await fetch('http://localhost:5225/api/web/Ingrediente/lista');
        if (response.ok) {
            listaEstoqueGlobal = await response.json();
            renderizarTabelaEstoque();
        }
    } catch (error) { if(msgVazio) msgVazio.innerText = "Erro de conexão."; }
}

function renderizarTabelaEstoque() {
    const tabela = document.getElementById('tabela-estoque');
    const msgVazio = document.getElementById('msg-vazio-estoque');
    tabela.innerHTML = '';
    if (listaEstoqueGlobal.length === 0) {
        if(msgVazio) { msgVazio.style.display = 'block'; msgVazio.innerText = "Nenhum ingrediente cadastrado."; }
        return;
    }
    if(msgVazio) msgVazio.style.display = 'none';
    listaEstoqueGlobal.forEach(ing => {
        const tr = document.createElement('tr');
        const precoVisual = ing.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let nomeExibicao = ing.nome;
        let unidadeExibicao = "";
        if(ing.nome.includes(" (")) {
            const partes = ing.nome.split(" (");
            nomeExibicao = partes[0];
            unidadeExibicao = partes[1].replace(")", "");
        }
        tr.innerHTML = `
            <td>${ing.id}</td>
            <td><strong>${nomeExibicao}</strong></td>
            <td>${ing.quantidade} <span style="color:#888; font-size:0.9em;">${unidadeExibicao}</span></td>
            <td>${precoVisual}</td>
            <td>
                <button class="action-btn edit" onclick="prepararEdicaoIngrediente(${ing.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="confirmarExclusao(${ing.id}, 'estoque')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

function prepararEdicaoIngrediente(id) {
    const item = listaEstoqueGlobal.find(i => i.id === id);
    if(item) {
        let nomePuro = item.nome;
        let unidade = "Un";
        if(item.nome.includes(" (")) {
            const partes = item.nome.split(" (");
            nomePuro = partes[0];
            unidade = partes[1].replace(")", "");
        }
        abrirModalIngrediente(id, nomePuro, item.quantidade, item.preco, unidade);
    }
}

function ordenarEstoque(coluna) {
    if (ordemAtual.coluna === coluna) ordemAtual.direcao = ordemAtual.direcao === 'asc' ? 'desc' : 'asc';
    else { ordemAtual.coluna = coluna; ordemAtual.direcao = 'asc'; }
    listaEstoqueGlobal.sort((a, b) => {
        let valorA = a[coluna];
        let valorB = b[coluna];
        if (typeof valorA === 'string') return ordemAtual.direcao === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        return ordemAtual.direcao === 'asc' ? valorA - valorB : valorB - valorA;
    });
    renderizarTabelaEstoque();
}

function filtrarEstoque() {
    const termo = document.getElementById('busca-estoque').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-estoque tr');
    linhas.forEach(linha => linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none');
}

const formIngrediente = document.getElementById('form-criar-ingrediente');
if(formIngrediente) {
    formIngrediente.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formIngrediente.querySelector('.btn-save');
        const textoOriginal = btn.innerText;
        btn.innerText = "Processando...";
        btn.disabled = true;
        const nomeInput = document.getElementById('ing-nome').value;
        const unidadeInput = document.getElementById('ing-unidade').value;
        const nomeFinal = `${nomeInput} (${unidadeInput})`;
        const qtd = parseInt(document.getElementById('ing-qtd').value);
        const preco = limparMoedaParaFloat(document.getElementById('ing-preco').value);
        const ingredienteDTO = { nome: nomeFinal, quantidade: qtd, preco: preco };
        try {
            let url = 'http://localhost:5225/api/web/Ingrediente/cria-ingrediente';
            let metodo = 'POST';
            if (idEdicaoIngrediente) {
                url = 'http://localhost:5225/api/web/Ingrediente/atualiza-ingrediente'; 
                metodo = 'PUT';
                ingredienteDTO.id = idEdicaoIngrediente; 
            }
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ingredienteDTO)
            });
            if (response.ok) {
                mostrarAviso('sucesso', 'Sucesso!', `Ingrediente <b>${nomeInput}</b> salvo.`);
                fecharModalIngrediente();
                carregarEstoque(); 
            } else alert("Erro: " + await response.text());
        } catch (error) { mostrarAviso('erro', 'Erro', "Falha na conexão."); }
        btn.innerText = textoOriginal;
        btn.disabled = false;
    });
}

async function executarDelecaoEstoque(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Ingrediente/deleta?id=${id}`, { method: 'DELETE' });
        if(response.ok) { mostrarAviso('sucesso', 'Excluído', 'Ingrediente removido.'); carregarEstoque(); }
        else mostrarAviso('erro', 'Erro', 'Falha ao excluir.');
    } catch (e) { mostrarAviso('erro', 'Erro', 'Erro de conexão.'); }
}

// =========================================
// 6. GESTÃO DE RESERVAS
// =========================================
async function carregarReservas() {
    const tabela = document.getElementById('tabela-reservas');
    const msgVazio = document.getElementById('msg-vazio-reservas');
    if(!tabela) return;
    tabela.innerHTML = '';
    if(msgVazio) { msgVazio.style.display = 'block'; msgVazio.innerText = "Buscando dados..."; }
    try {
        const response = await fetch('http://localhost:5225/api/web/Reserva/lista');
        if(response.ok) {
            const lista = await response.json();
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            const filtradas = lista.filter(r => { const d = new Date(r.date || r.data); return d >= hoje; }).sort((a,b) => new Date(a.date) - new Date(b.date));
            if(filtradas.length === 0) { if(msgVazio) msgVazio.innerText = "Nenhuma reserva futura."; }
            else {
                if(msgVazio) msgVazio.style.display = 'none';
                filtradas.forEach(res => {
                    const dataObj = new Date(res.date || res.data);
                    const dataFmt = dataObj.toLocaleDateString('pt-BR');
                    const horaFmt = dataObj.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
                    const telFmt = formatarTelefone(res.telefone);
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${dataFmt}</td>
                        <td>${horaFmt}</td>
                        <td><strong>${res.nome}</strong></td>
                        <td>${res.pessoa}</td>
                        <td>${telFmt}</td>
                        <td><button class="action-btn delete" onclick="confirmarExclusao(${res.id}, 'reserva')"><i class="fas fa-trash"></i></button></td>`;
                    tabela.appendChild(tr);
                });
            }
        } else { if(msgVazio) msgVazio.innerText = "Erro ao carregar."; }
    } catch (e) { if(msgVazio) msgVazio.innerText = "Erro de conexão."; }
}

async function executarDelecaoReserva(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Reserva/deleta?id=${id}`, { method: 'DELETE' });
        if(response.ok) { mostrarAviso('sucesso', 'Cancelada', 'Reserva removida.'); carregarReservas(); }
        else mostrarAviso('erro', 'Erro', 'Falha ao cancelar.');
    } catch (e) { mostrarAviso('erro', 'Erro', 'Erro de conexão.'); }
}

function filtrarReservas() {
    const termo = document.getElementById('busca-reserva').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-reservas tr');
    linhas.forEach(linha => linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none');
}

// =================================================
// 8. GESTÃO DE PRATOS
// =================================================
function fecharModalPrato() { 
    const m = document.getElementById('modal-prato');
    if(m) m.style.display = 'none'; 
}

async function abrirModalPrato(idEdicao = null) {
    const modal = document.getElementById('modal-prato');
    const divIngredientes = document.getElementById('lista-selecao-ingredientes');
    document.getElementById('form-criar-prato').reset();
    document.getElementById('display-custo-total').innerText = "R$ 0,00";
    idEdicaoPrato = idEdicao; 
    if(idEdicao) {
        document.querySelector('#modal-prato h3').innerText = "Editar Prato";
        document.querySelector('#modal-prato .btn-save').innerText = "Atualizar";
    } else {
        document.querySelector('#modal-prato h3').innerText = "Novo Prato";
        document.querySelector('#modal-prato .btn-save').innerText = "Salvar Prato";
    }
    modal.style.display = 'flex';
    divIngredientes.innerHTML = '<p style="padding:15px; text-align:center">Carregando estoque...</p>';
    try {
        const response = await fetch('http://localhost:5225/api/web/Ingrediente/lista');
        if(response.ok) {
            const lista = await response.json();
            divIngredientes.innerHTML = ''; 
            if(lista.length === 0) { divIngredientes.innerHTML = '<p style="padding:15px">Estoque vazio.</p>'; return; }
            lista.forEach(ing => {
                const div = document.createElement('div');
                div.className = 'item-selecao';
                div.innerHTML = `
                    <label>
                        <input type="checkbox" value="${ing.id}" data-preco="${ing.preco}" class="chk-ingrediente" onchange="recalcularCusto()">
                        <span class="nome-ing">${ing.nome}</span>
                        <span class="preco-ing">R$ ${ing.preco.toFixed(2)}</span>
                    </label>`;
                divIngredientes.appendChild(div);
            });
            if(idEdicao && listaPratosGlobal.length > 0) {
                const prato = listaPratosGlobal.find(p => p.id === idEdicao);
                if(prato) {
                    document.getElementById('prato-nome').value = prato.nome;
                    document.getElementById('prato-preco').value = prato.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    const listaIng = prato.ingredientes || prato.ingredienteId || [];
                    document.querySelectorAll('.chk-ingrediente').forEach(chk => {
                        const idChk = parseInt(chk.value);
                        if(listaIng.some(i => (i.id === idChk) || (i === idChk))) chk.checked = true;
                    });
                    recalcularCusto();
                }
            }
        }
    } catch (e) { divIngredientes.innerHTML = '<p style="color:red">Erro ao carregar.</p>'; }
}

async function deletarPratoReal(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Prato/deleta?id=${id}`, { method: 'DELETE' });
        if (response.ok) { mostrarAviso('sucesso', 'Excluído', 'Prato removido com sucesso.'); carregarPratos(); }
        else mostrarAviso('erro', 'Erro', 'Falha ao excluir no servidor.');
    } catch (e) { mostrarAviso('erro', 'Erro', 'Erro de conexão.'); }
}

async function carregarPratos() {
    const tabela = document.getElementById('tabela-pratos');
    const msgVazio = document.getElementById('msg-vazio-pratos');
    if(!tabela) return;
    tabela.innerHTML = '';
    if(msgVazio) msgVazio.style.display = 'block';
    try {
        const response = await fetch('http://localhost:5225/api/web/Prato/lista');
        if (response.ok) {
            const lista = await response.json();
            listaPratosGlobal = lista; 
            if (lista.length > 0) {
                if(msgVazio) msgVazio.style.display = 'none';
                lista.forEach(prato => {
                    const precoVisual = prato.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    tabela.innerHTML += `
                        <tr>
                            <td>${prato.id}</td>
                            <td><strong>${prato.nome}</strong></td>
                            <td>${precoVisual}</td>
                            <td><button class="action-btn delete" onclick="confirmarExclusao(${prato.id}, 'prato')"><i class="fas fa-trash"></i></button></td>
                        </tr>`;
                });
            }
        }
    } catch (e) { console.error(e); }
}

const formPratoSave = document.getElementById('form-criar-prato');
if(formPratoSave) {
    formPratoSave.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const btn = formPratoSave.querySelector('.btn-save');
        const textoOriginal = btn.innerText;
        btn.innerText = "Salvando..."; btn.disabled = true;
        const nome = document.getElementById('prato-nome').value;
        const precoString = document.getElementById('prato-preco').value;
        const preco = limparMoedaParaFloat(precoString); 
        const checkboxes = document.querySelectorAll('.chk-ingrediente:checked');
        const ingredienteIds = Array.from(checkboxes).map(chk => parseInt(chk.value));
        const pratoDTO = { nome: nome, preco: preco, IngredienteId: ingredienteIds };
        try {
            let url = 'http://localhost:5225/api/web/Prato/cria-prato';
            let metodo = 'POST';
            if (idEdicaoPrato) { 
                url = 'http://localhost:5225/api/web/Prato/atualiza-prato'; 
                metodo = 'PUT';
                pratoDTO.id = idEdicaoPrato;
            }
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pratoDTO)
            });
            if (response.ok) {
                mostrarAviso('sucesso', 'Prato Salvo', `O prato <b>${nome}</b> foi salvo com sucesso!`);
                fecharModalPrato();
                carregarPratos(); 
            } else {
                const erroTexto = await response.text();
                alert("Erro ao salvar: " + erroTexto);
            }
        } catch (error) { alert("Erro de conexão com o servidor."); }
        btn.innerText = textoOriginal; btn.disabled = false;
    });
}

// =========================================
// GESTÃO DE MESAS E PEDIDOS (CORRIGIDO)
// =========================================
async function carregarMesas() {
    const grid = document.getElementById('grid-mesas');
    if(!grid) return;
    grid.innerHTML = 'Carregando...';
    try {
        const res = await fetch('http://localhost:5225/api/web/Mesa/lista');
        if(res.ok) {
            const mesas = await res.json();
            grid.innerHTML = '';
            if(mesas.length === 0) grid.innerHTML = '<p style="padding:20px">Nenhuma mesa criada.</p>';
            mesas.forEach(m => {
                const statusClass = m.status === 0 ? 'status-livre' : 'status-ocupada';
                const statusTexto = m.status === 0 ? 'Livre' : `R$ ${m.custoTotal.toFixed(2)}`;
                grid.innerHTML += `
                    <div class="mesa-card ${statusClass}" onclick="abrirMesa(${m.id}, ${m.numero})">
                        <div class="mesa-num">${m.numero}</div>
                        <div class="mesa-status">${statusTexto}</div>
                    </div>`;
            });
        }
    } catch(e) { grid.innerHTML = 'Erro de conexão.'; }
}

// Função de abrir o Modal de Criar Mesa
function abrirModalCriarMesa() {
    const modal = document.getElementById('modal-criar-mesa');
    const input = document.getElementById('nova-mesa-numero');
    if (!modal) { console.error("Modal não encontrado HTML"); return; }
    input.value = '';
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
}

function fecharModalCriarMesa() { 
    const m = document.getElementById('modal-criar-mesa');
    if(m) m.style.display = 'none'; 
}

async function confirmarCriacaoMesa(event) {
    event.preventDefault(); 
    const inputNumero = document.getElementById('nova-mesa-numero').value;
    if (!inputNumero) { alert("Digite um número."); return; }
    try {
        const response = await fetch('http://localhost:5225/api/web/Mesa/cria-mesa', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ numero: parseInt(inputNumero) })
        });
        if (response.ok) { fecharModalCriarMesa(); carregarMesas(); } 
        else alert("Erro ao criar mesa.");
    } catch (e) { alert("Erro ao conectar."); }
}

// Função de Abrir Mesa (Detalhes/Pedido)
async function abrirMesa(id, numero) {
    idMesaAberta = id;
    document.getElementById('modal-mesa').style.display = 'flex';
    document.getElementById('titulo-mesa').innerText = `Mesa ${numero}`;
    itensMesaAtual = []; 
    atualizarComandaVisual();
    
    const select = document.getElementById('mesa-select-prato');
    select.innerHTML = '<option>Carregando...</option>';
    if(!listaPratosGlobal || listaPratosGlobal.length === 0) {
        const res = await fetch('http://localhost:5225/api/web/Prato/lista');
        if(res.ok) listaPratosGlobal = await res.json();
    }
    select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
    listaPratosGlobal.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.text = `${p.nome} - R$ ${p.preco.toFixed(2)}`;
        opt.setAttribute('data-preco', p.preco);
        opt.setAttribute('data-nome', p.nome);
        select.appendChild(opt);
    });
}

function fecharModalMesa() { document.getElementById('modal-mesa').style.display = 'none'; }

function adicionarItemNaMesa() {
    const sel = document.getElementById('mesa-select-prato');
    const qtd = parseInt(document.getElementById('mesa-qtd').value);
    const obs = document.getElementById('mesa-obs').value;
    if(!sel.value) return alert("Selecione um prato!");
    const nome = sel.options[sel.selectedIndex].getAttribute('data-nome');
    const preco = parseFloat(sel.options[sel.selectedIndex].getAttribute('data-preco'));
    itensMesaAtual.push({ id: parseInt(sel.value), nome, qtd, obs, total: preco * qtd });
    atualizarComandaVisual();
}

function atualizarComandaVisual() {
    const div = document.getElementById('lista-pedidos-mesa');
    let total = 0;
    div.innerHTML = '';
    itensMesaAtual.forEach((item, idx) => {
        total += item.total;
        div.innerHTML += `
            <div class="item-comanda">
                <div><b>${item.qtd}x ${item.nome}</b> <br><small>${item.obs}</small></div>
                <div>R$ ${item.total.toFixed(2)} <i class="fas fa-times" style="color:red;cursor:pointer;margin-left:5px" onclick="removerItemMesa(${idx})"></i></div>
            </div>`;
    });
    document.getElementById('mesa-total-valor').innerText = total.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
}

function removerItemMesa(i) { itensMesaAtual.splice(i,1); atualizarComandaVisual(); }

async function enviarParaCozinha() {
    // 1. VALIDAÇÃO COM AVISO BONITO (Substituindo o alert)
    if(itensMesaAtual.length === 0) {
        mostrarAviso('erro', 'Vazio', 'Adicione pratos na comanda antes de enviar!');
        return; // Importante: O return para a função aqui para não tentar enviar nada.
    }

    const btn = document.querySelector('#modal-mesa .btn-save');
    btn.innerText = "Enviando..."; 
    btn.disabled = true;
    
    try {
        // Envia item por item para o backend
        for(const item of itensMesaAtual) {
            const pedidoDTO = { 
                mesaId: idMesaAberta, 
                pratoId: item.id, 
                quantidade: item.qtd, 
                observacao: item.obs,
                // Campos duplicados para garantir compatibilidade com C# (Case Sensitive)
                PratoId: item.id, 
                Quantidade: item.qtd, 
                Observacao: item.obs
            };

            await fetch('http://localhost:5225/api/web/Mesa/adicionar-pedido', {
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify(pedidoDTO)
            });
        }
        
        // 2. SUCESSO COM AVISO BONITO
        mostrarAviso('sucesso', 'Pedido Enviado', 'A cozinha já recebeu a comanda!');
        
        fecharModalMesa();
        carregarMesas(); 

    } catch (error) {
        console.error(error);
        mostrarAviso('erro', 'Erro', 'Falha ao enviar pedido para a cozinha.');
    } finally {
        // Restaura o botão mesmo se der erro ou sucesso
        btn.innerText = "Enviar Pedido"; 
        btn.disabled = false;
    }
}

function fecharContaMesa() {
    // Usa o novo modal se existir
    const modal = document.getElementById('modal-fechar-conta');
    if(modal) modal.style.display = 'flex';
    else if(confirm("Fechar conta?")) confirmarFechamentoContaReal();
}

async function confirmarFechamentoContaReal() {
    try {
        const m = document.getElementById('modal-fechar-conta');
        if(m) m.style.display = 'none';
        const response = await fetch(`http://localhost:5225/api/web/Mesa/fechar-mesa?id=${idMesaAberta}`, {method:'PUT'});
        if(response.ok) {
            fecharModalMesa();
            carregarMesas();
            mostrarAviso('sucesso', 'Sucesso', 'Conta fechada!');
        } else alert("Erro ao fechar.");
    } catch(e) { alert("Erro de conexão."); }
}

// =========================================
// 11. COZINHA (KANBAN)
// =========================================
async function carregarPedidosCozinha() {
    const colFila = document.getElementById('lista-fila');
    const colPrep = document.getElementById('lista-preparo');
    const colPronto = document.getElementById('lista-pronto');
    if(!colFila) return; 
    try {
        const response = await fetch('http://localhost:5225/api/web/Pedido/lista-cozinha');
        if(response.ok) {
            const pedidos = await response.json();
            let htmlFila = '', htmlPrep = '', htmlPronto = '';
            if(pedidos.length === 0) htmlFila = '<p style="text-align:center; color:#999; padding:10px">Sem pedidos na fila.</p>';
            else {
                pedidos.forEach(p => {
                    let btnClass = "btn-avancar";
                    const estiloMesa = p.tipo === 'delivery' ? 'background:#ff9800; color:white;' : '';
                    const tituloCard = p.mesaNumero === 'DELIVERY' ? '<i class="fas fa-motorcycle"></i> DELIVERY' : 'Mesa ' + p.mesaNumero;
                    
                    let conteudoCard = `
                        <div class="pedido-card">
                            <div class="pedido-mesa" style="${estiloMesa}">${tituloCard}</div>
                            <div class="pedido-item">${p.tipo==='delivery'?'':p.quantidade+'x'} ${p.nomePrato}</div>
                            ${p.observacao ? `<span class="pedido-obs">Obs: ${p.observacao}</span>` : ''}
                            <button class="${btnClass}" onclick="avancarStatusPedido(${p.id}, '${p.tipo}')">
                                ${p.status === 1 ? "Finalizar ➤" : (p.status === 2 ? "✔ Entregar" : "Iniciar Preparo ➤")}
                            </button>
                        </div>`;
                    if(p.status === 0) htmlFila += conteudoCard;
                    else if(p.status === 1) { 
                        conteudoCard = conteudoCard.replace('Iniciar Preparo ➤', 'Finalizar ➤');
                        htmlPrep += conteudoCard;
                    } else if(p.status === 2) { 
                        conteudoCard = conteudoCard.replace('btn-avancar', 'btn-avancar btn-concluir');
                        conteudoCard = conteudoCard.replace('Iniciar Preparo ➤', '✔ Entregar');
                        htmlPronto += conteudoCard;
                    }
                });
            }
            if(colFila.innerHTML.trim() !== htmlFila.trim()) colFila.innerHTML = htmlFila;
            if(colPrep.innerHTML.trim() !== htmlPrep.trim()) colPrep.innerHTML = htmlPrep;
            if(colPronto.innerHTML.trim() !== htmlPronto.trim()) colPronto.innerHTML = htmlPronto;
        }
    } catch(e) { console.error("Erro silencioso ao atualizar:", e); }
}

async function avancarStatusPedido(id, tipo) {
    const sel = `button[onclick="avancarStatusPedido(${id}, '${tipo}')"]`;
    const btn = document.querySelector(sel);
    if(btn) { btn.innerText = "..."; btn.disabled = true; }
    try {
        const response = await fetch(`http://localhost:5225/api/web/Pedido/avancar-status?id=${id}&tipo=${tipo}`, { method: 'PUT' });
        if(response.ok) carregarPedidosCozinha(); 
        else {
            alert("Erro ao mudar status.");
            if(btn) { btn.innerText = "Tentar Novamente"; btn.disabled = false; }
        }
    } catch(e) { if(btn) { btn.innerText = "Erro"; btn.disabled = false; } }
}

// =========================================
// FATURAMENTO
// =========================================
async function carregarFaturamento() {
    try {
        const res = await fetch('http://localhost:5225/api/web/Faturamento/diario');
        if(res.ok) {
            const dados = await res.json();
            const elV = document.getElementById('fat-valor-hoje');
            const elQ = document.getElementById('fat-qtd-hoje');
            if(elV) elV.innerText = dados.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            if(elQ) elQ.innerText = dados.quantidade;
        }
    } catch(e) {}
    const tb = document.getElementById('tabela-historico-vendas');
    if(tb) {
        tb.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
        try {
            const res = await fetch('http://localhost:5225/api/web/Faturamento/historico');
            if(res.ok) {
                const lista = await res.json();
                tb.innerHTML = '';
                if(lista.length===0) { tb.innerHTML = '<tr><td colspan="3">Vazio.</td></tr>'; return; }
                lista.forEach(v => {
                    const d = new Date(v.dataVenda);
                    const s = d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR');
                    tb.innerHTML += `<tr><td>#${v.id}</td><td>${s}</td><td style="color:green;font-weight:bold">${v.valorTotal.toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</td></tr>`;
                });
            }
        } catch(e) {}
    }
}

setInterval(() => {
    const sec = document.getElementById('sec-pedidos');
    if (sec && sec.style.display !== 'none') carregarPedidosCozinha();
}, 5000);

// EXPORTS GLOBAIS
window.abrirModalCriarMesa = abrirModalCriarMesa; // Nome novo
window.criarNovaMesa = abrirModalCriarMesa; // Alias p/ compatibilidade
window.fecharModalCriarMesa = fecharModalCriarMesa;
window.confirmarCriacaoMesa = confirmarCriacaoMesa;
window.abrirMesa = abrirMesa;
window.fecharModalMesa = fecharModalMesa;
window.adicionarItemNaMesa = adicionarItemNaMesa;
window.enviarParaCozinha = enviarParaCozinha;
window.fecharContaMesa = fecharContaMesa;
window.confirmarFechamentoContaReal = confirmarFechamentoContaReal;
window.carregarPedidosCozinha = carregarPedidosCozinha;
window.avancarStatusPedido = avancarStatusPedido;