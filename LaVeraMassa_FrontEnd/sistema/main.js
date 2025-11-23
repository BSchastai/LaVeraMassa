function recalcularCusto() {
    const checkboxes = document.querySelectorAll('.chk-ingrediente:checked');
    let custoTotal = 0;

    checkboxes.forEach(chk => {
        const preco = parseFloat(chk.getAttribute('data-preco'));
        if (!isNaN(preco)) {
            custoTotal += preco;
        }
    });

    // Atualiza o texto visual do Custo (Isso já estava funcionando)
    const displayCusto = document.getElementById('display-custo-total');
    if(displayCusto) {
        displayCusto.innerText = custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Sugere o preço de venda (Custo + R$ 15,00 de margem)
    const inputVenda = document.getElementById('prato-preco');
    
    if(inputVenda) {
        // REMOVIDO O IF QUE BLOQUEAVA A ATUALIZAÇÃO
        // Agora ele sempre recalcula quando você mexe nos ingredientes.
        // Se você quiser travar edição manual, podemos criar uma lógica diferente depois.
        
        const precoSugerido = custoTotal + 15.00;
        
        let valorFormatado = precoSugerido.toFixed(2).replace('.', ',');
        valorFormatado = valorFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        inputVenda.value = "R$ " + valorFormatado;
    }
}

// =========================================
// 0. FUNÇÕES UTILITÁRIAS E VARIÁVEIS GLOBAIS
// =========================================
let idEdicaoIngrediente = null;
let listaEstoqueGlobal = []; 
let ordemAtual = { coluna: 'id', direcao: 'asc' }; 
let idParaDeletar = null;
let tipoParaDeletar = ''; 
let listaPratosGlobal = [];
let idEdicaoPrato = null;

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

// =========================================
// 1. INICIALIZAÇÃO (DOM LOAD)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se é a página de Login ou Dashboard
    const areaUsuario = document.querySelector('.user-info');
    
    if(areaUsuario) {
        // Estamos no Dashboard
        const nomeSalvo = localStorage.getItem('usuarioLogado');
        if(nomeSalvo) {
            areaUsuario.querySelector('b').innerText = nomeSalvo;
            document.querySelector('.avatar-circle').innerText = nomeSalvo.charAt(0).toUpperCase();
        }
        
        // Carrega a aba inicial (Funcionários)
        carregarFuncionarios(); 
    }
    
    // Lógica de Login (se estiver na tela de login)
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
                    alert("❌ Usuário ou senha incorretos.");
                    btn.innerText = "ACESSAR";
                    btn.disabled = false;
                }
            } catch (e) {
                alert("⚠️ Erro de conexão.");
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
    // Esconde todas
    const secoes = document.querySelectorAll('.panel-section');
    secoes.forEach(sec => sec.style.display = 'none');

    // Mostra a escolhida
    const secaoAlvo = document.getElementById('sec-' + idSecao);
    if(secaoAlvo) secaoAlvo.style.display = 'block';

    // Atualiza Título
    const titulos = {
        'usuarios': 'Gerenciamento de Funcionários',
        'estoque': 'Controle de Estoque',
        'reservas': 'Gestão de Reservas',
        'pedidos': 'Pedidos em Tempo Real',
        'cardapio': 'Editar Cardápio'
    };
    const tituloEl = document.getElementById('titulo-secao');
    if(tituloEl) tituloEl.innerText = titulos[idSecao] || 'Painel';

    // Atualiza Menu Ativo
    const links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(link => link.classList.remove('active'));
    if(elementoLink) elementoLink.classList.add('active');

    // Carrega dados específicos
    if(idSecao === 'usuarios') carregarFuncionarios();
    if(idSecao === 'estoque') carregarEstoque();
    if(idSecao === 'reservas') carregarReservas();
    if(idSecao === 'cardapio') carregarPratos();
    if(idSecao === 'mesas') carregarMesas();
    if(idSecao === 'pedidos') carregarPedidosCozinha();
    if(idSecao === 'faturamento') carregarFaturamento();
}

// =========================================
// 3. MODAIS E AVISOS (Global)
// =========================================
function mostrarAviso(tipo, titulo, mensagem) {
    const modal = document.getElementById('modal-aviso');
    const icon = document.getElementById('aviso-icon');
    const title = document.getElementById('aviso-titulo');
    const msg = document.getElementById('aviso-msg');

    modal.style.display = 'flex';
    title.innerText = titulo;
    msg.innerHTML = mensagem;

    if(tipo === 'sucesso') icon.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
    else icon.innerHTML = '<i class="fas fa-times-circle" style="color: #dc3545;"></i>';
}

function fecharConfirmacao() {
    document.getElementById('modal-confirm').style.display = 'none';
    idParaDeletar = null;
}

function confirmarExclusao(id, tipo) {
    idParaDeletar = id;
    tipoParaDeletar = tipo;
    document.getElementById('modal-confirm').style.display = 'flex';
}

// Botão Confirmar Exclusão
const btnConfirmDelete = document.getElementById('btn-confirm-delete');
if(btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
        if(!idParaDeletar) return;
        
        // 1. Guardamos os valores temporariamente antes de limpar
        const id = idParaDeletar;
        const tipo = tipoParaDeletar;

        // 2. Executamos a ação
        if(tipo === 'reserva') await executarDelecaoReserva(id);
        if(tipo === 'estoque') await executarDelecaoEstoque(id);
        if(tipo === 'funcionario') await executarDelecaoFuncionario(id);
        if(tipo === 'prato') await deletarPratoReal(id);

        // 3. SÓ AGORA fechamos e limpamos as variáveis globais
        fecharConfirmacao(); 
    });
}

// =========================================
// 4. GESTÃO DE FUNCIONÁRIOS
// =========================================
function abrirModalUsuario() { document.getElementById('modal-usuario').style.display = 'flex'; }
function fecharModalUsuario() { document.getElementById('modal-usuario').style.display = 'none'; }

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
                            <td>
                                <button class="action-btn delete" onclick="confirmarExclusao(${func.id}, 'funcionario')"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`;
                });
            }
        }
    } catch (error) { console.error(error); }
}

async function executarDelecaoFuncionario(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Funcionario/deleta?id=${id}`, { method: 'DELETE' });
        if(response.ok) {
            mostrarAviso('sucesso', 'Removido', 'Funcionário excluído.');
            carregarFuncionarios();
        } else mostrarAviso('erro', 'Erro', 'Falha ao excluir.');
    } catch (e) { mostrarAviso('erro', 'Erro', 'Erro de conexão.'); }
}

// Cadastro Funcionário
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
    document.getElementById('modal-ingrediente').style.display = 'none';
    idEdicaoIngrediente = null;
}

async function carregarEstoque() {
    const tabela = document.getElementById('tabela-estoque');
    const msgVazio = document.getElementById('msg-vazio-estoque');
    if(!tabela) return;

    tabela.innerHTML = '';
    if(msgVazio) {
        msgVazio.style.display = 'block';
        msgVazio.innerText = "Carregando...";
    }

    try {
        const response = await fetch('http://localhost:5225/api/web/Ingrediente/lista');
        if (response.ok) {
            listaEstoqueGlobal = await response.json();
            renderizarTabelaEstoque();
        }
    } catch (error) {
        if(msgVazio) msgVazio.innerText = "Erro de conexão.";
    }
}

function renderizarTabelaEstoque() {
    const tabela = document.getElementById('tabela-estoque');
    const msgVazio = document.getElementById('msg-vazio-estoque');
    tabela.innerHTML = '';

    if (listaEstoqueGlobal.length === 0) {
        if(msgVazio) {
            msgVazio.style.display = 'block';
            msgVazio.innerText = "Nenhum ingrediente cadastrado.";
        }
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
    linhas.forEach(linha => {
        linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
    });
}

// Salvar Ingrediente
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
            } else {
                alert("Erro: " + await response.text());
            }
        } catch (error) {
            mostrarAviso('erro', 'Erro', "Falha na conexão.");
        }
        btn.innerText = textoOriginal;
        btn.disabled = false;
    });
}

async function executarDelecaoEstoque(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Ingrediente/deleta?id=${id}`, { method: 'DELETE' });
        if(response.ok) {
            mostrarAviso('sucesso', 'Excluído', 'Ingrediente removido.');
            carregarEstoque();
        } else mostrarAviso('erro', 'Erro', 'Falha ao excluir.');
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

            const filtradas = lista.filter(r => {
                const d = new Date(r.date || r.data);
                return d >= hoje;
            }).sort((a,b) => new Date(a.date) - new Date(b.date));

            if(filtradas.length === 0) {
                if(msgVazio) msgVazio.innerText = "Nenhuma reserva futura.";
            } else {
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
                        <td>
                            <button class="action-btn delete" onclick="confirmarExclusao(${res.id}, 'reserva')"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    tabela.appendChild(tr);
                });
            }
        } else { if(msgVazio) msgVazio.innerText = "Erro ao carregar."; }
    } catch (e) { if(msgVazio) msgVazio.innerText = "Erro de conexão."; }
}

async function executarDelecaoReserva(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Reserva/deleta?id=${id}`, { method: 'DELETE' });
        if(response.ok) {
            mostrarAviso('sucesso', 'Cancelada', 'Reserva removida.');
            carregarReservas();
        } else mostrarAviso('erro', 'Erro', 'Falha ao cancelar.');
    } catch (e) { mostrarAviso('erro', 'Erro', 'Erro de conexão.'); }
}

function filtrarReservas() {
    const termo = document.getElementById('busca-reserva').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-reservas tr');
    linhas.forEach(linha => {
        linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
    });
}

// =================================================
// 8. GESTÃO DE PRATOS (CARDÁPIO)
// =================================================

function fecharModalPrato() { document.getElementById('modal-prato').style.display = 'none'; }

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
            
            if(lista.length === 0) {
                divIngredientes.innerHTML = '<p style="padding:15px">Estoque vazio.</p>';
                return;
            }

            lista.forEach(ing => {
                const div = document.createElement('div');
                div.className = 'item-selecao';
                // AQUI ESTÁ O EVENTO onchange QUE FALTAVA FUNCIONAR
                div.innerHTML = `
                    <label>
                        <input type="checkbox" value="${ing.id}" data-preco="${ing.preco}" class="chk-ingrediente" onchange="recalcularCusto()">
                        <span class="nome-ing">${ing.nome}</span>
                        <span class="preco-ing">R$ ${ing.preco.toFixed(2)}</span>
                    </label>
                `;
                divIngredientes.appendChild(div);
            });

            // Se for edição, marca os checkboxes
            if(idEdicao && listaPratosGlobal.length > 0) {
                const prato = listaPratosGlobal.find(p => p.id === idEdicao);
                if(prato) {
                    document.getElementById('prato-nome').value = prato.nome;
                    document.getElementById('prato-preco').value = prato.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    const listaIng = prato.ingredientes || prato.ingredienteId || [];
                    document.querySelectorAll('.chk-ingrediente').forEach(chk => {
                        const idChk = parseInt(chk.value);
                        if(listaIng.some(i => (i.id === idChk) || (i === idChk))) {
                            chk.checked = true;
                        }
                    });
                    recalcularCusto();
                }
            }
        }
    } catch (e) { divIngredientes.innerHTML = '<p style="color:red">Erro ao carregar.</p>'; }
}


// =========================================
// 9. FUNÇÕES QUE FALTARAM (DELETAR E LISTAR)
// =========================================

// Função para deletar PRATO (Conecta com o botão da lixeira)
async function deletarPratoReal(id) {
    try {
        const response = await fetch(`http://localhost:5225/api/web/Prato/deleta?id=${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarAviso('sucesso', 'Excluído', 'Prato removido com sucesso.');
            carregarPratos(); // Recarrega a lista para sumir da tela
        } else {
            mostrarAviso('erro', 'Erro', 'Falha ao excluir no servidor.');
        }
    } catch (e) {
        mostrarAviso('erro', 'Erro', 'Erro de conexão.');
    }
}

// Função para carregar a lista de PRATOS na tabela
async function carregarPratos() {
    const tabela = document.getElementById('tabela-pratos');
    const msgVazio = document.getElementById('msg-vazio-pratos');
    
    if(!tabela) return;
    
    tabela.innerHTML = '';
    if(msgVazio) msgVazio.style.display = 'block';

    try {
        const response = await fetch('http://localhost:5225/api/web/Prato/lista');
        if (response.ok) {
            const lista = await response.json(); // Aqui a variável é 'lista' local
            listaPratosGlobal = lista; // Atualiza a global para usar na edição
            
            if (lista.length > 0) {
                if(msgVazio) msgVazio.style.display = 'none';
                
                lista.forEach(prato => {
                    const precoVisual = prato.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    tabela.innerHTML += `
                        <tr>
                            <td>${prato.id}</td>
                            <td><strong>${prato.nome}</strong></td>
                            <td>${precoVisual}</td>
                            <td>
                                <button class="action-btn delete" onclick="confirmarExclusao(${prato.id}, 'prato')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>`;
                });
            }
        }
    } catch (e) { console.error(e); }
}

// =========================================
// GESTÃO DE MESAS
// =========================================
let itensMesaAtual = [];
let idMesaAberta = null;

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

async function criarNovaMesa() {
    const num = prompt("Número da Mesa:");
    if(!num) return;
    try {
        await fetch('http://localhost:5225/api/web/Mesa/cria-mesa', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ numero: parseInt(num) })
        });
        carregarMesas();
    } catch(e) { alert("Erro ao criar."); }
}

async function abrirMesa(id, numero) {
    idMesaAberta = id;
    document.getElementById('modal-mesa').style.display = 'flex';
    document.getElementById('titulo-mesa').innerText = `Mesa ${numero}`;
    
    itensMesaAtual = []; // Limpa lista visual
    atualizarComandaVisual();
    
    // Carrega pratos no select
    const select = document.getElementById('mesa-select-prato');
    select.innerHTML = '<option>Carregando...</option>';
    
    // Se a lista global estiver vazia, busca agora
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
                <div>R$ ${item.total.toFixed(2)} <i class="fas fa-times" style="color:red;cursor:pointer;margin-left:5px" onclick="itensMesaAtual.splice(${idx},1);atualizarComandaVisual()"></i></div>
            </div>`;
    });
    document.getElementById('mesa-total-valor').innerText = total.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
}

async function enviarParaCozinha() {
    if(itensMesaAtual.length === 0) return alert("Nada para enviar.");
    const btn = document.querySelector('#modal-mesa .btn-save');
    btn.innerText = "Enviando..."; btn.disabled = true;
    
    for(const item of itensMesaAtual) {
        // Criei um objeto DTO mais robusto aqui
        const pedidoDTO = { 
            mesaId: idMesaAberta, 
            
            // Envia com letra minúscula (padrão JS)
            pratoId: item.id, 
            quantidade: item.qtd, 
            observacao: item.obs,

            // HACK DE SEGURANÇA: Envia também com letra Maiúscula 
            // caso o C# esteja esperando PascalCase e não convertendo
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
    alert("Pedido enviado!");
    fecharModalMesa();
    carregarMesas(); // Atualiza o status da mesa
    btn.innerText = "Enviar Pedido"; btn.disabled = false;
}

async function fecharContaMesa() {
    if(confirm("Fechar conta e liberar mesa?")) {
        await fetch(`http://localhost:5225/api/web/Mesa/fechar-mesa?id=${idMesaAberta}`, {method:'PUT'});
        fecharModalMesa();
        carregarMesas();
    }
}

// EXPOR FUNÇÕES PRO HTML
window.criarNovaMesa = criarNovaMesa;
window.abrirMesa = abrirMesa;
window.fecharModalMesa = fecharModalMesa;
window.adicionarItemNaMesa = adicionarItemNaMesa;
window.enviarParaCozinha = enviarParaCozinha;
window.fecharContaMesa = fecharContaMesa;
window.removerItemMesa = function(i) { itensMesaAtual.splice(i,1); atualizarComandaVisual(); };

// =========================================
// 11. COZINHA (KANBAN) - CORRIGIDO
// =========================================

// =========================================
// CARREGAR PEDIDOS (SEM PISCAR / DISCRETO)
// =========================================
window.carregarPedidosCozinha = async function() {
    const colFila = document.getElementById('lista-fila');
    const colPrep = document.getElementById('lista-preparo');
    const colPronto = document.getElementById('lista-pronto');
    
    if(!colFila) return; 

    try {
        // 1. Busca os dados no servidor PRIMEIRO (sem limpar a tela)
        const response = await fetch('http://localhost:5225/api/web/Pedido/lista-cozinha');
        
        if(response.ok) {
            const pedidos = await response.json();
            
            // 2. Prepara o HTML na memória (Variáveis temporárias)
            let htmlFila = '';
            let htmlPrep = '';
            let htmlPronto = '';

            if(pedidos.length === 0) {
                htmlFila = '<p style="text-align:center; color:#999; padding:10px">Sem pedidos na fila.</p>';
            } else {
                pedidos.forEach(p => {
                    let btnTexto = "Iniciar Preparo ➤";
                    let btnClass = "btn-avancar";
                    
                    // Lógica para decidir em qual variável (coluna) o card vai entrar
                    let conteudoCard = `
                        <div class="pedido-card">
                            <div class="pedido-mesa">Mesa ${p.mesaNumero || '?'}</div>
                            <div class="pedido-item">${p.quantidade}x ${p.nomePrato}</div>
                            ${p.observacao ? `<span class="pedido-obs">Obs: ${p.observacao}</span>` : ''}
                            <button class="${btnClass}" onclick="avancarStatusPedido(${p.id})">
                                ${p.status === 1 ? "Finalizar ➤" : (p.status === 2 ? "✔ Entregar" : "Iniciar Preparo ➤")}
                            </button>
                        </div>`;

                    // Distribui nas colunas certas
                    if(p.status === 0) {
                        htmlFila += conteudoCard;
                    } else if(p.status === 1) { 
                        // Ajusta o botão para a coluna do meio
                        conteudoCard = conteudoCard.replace('Iniciar Preparo ➤', 'Finalizar ➤');
                        htmlPrep += conteudoCard;
                    } else if(p.status === 2) { 
                        // Ajusta o botão e a cor para a coluna final
                        conteudoCard = conteudoCard.replace('btn-avancar', 'btn-avancar btn-concluir');
                        conteudoCard = conteudoCard.replace('Iniciar Preparo ➤', '✔ Entregar');
                        htmlPronto += conteudoCard;
                    }
                });
            }

            // 3. O TRUQUE: Só atualiza o HTML se ele for DIFERENTE do atual
            // Isso impede que a tela pisque se nada mudou
            if(colFila.innerHTML.trim() !== htmlFila.trim()) colFila.innerHTML = htmlFila;
            if(colPrep.innerHTML.trim() !== htmlPrep.trim()) colPrep.innerHTML = htmlPrep;
            if(colPronto.innerHTML.trim() !== htmlPronto.trim()) colPronto.innerHTML = htmlPronto;

        }
    } catch(e) { 
        // Em caso de erro, só loga no console, não estraga a tela do usuário
        console.error("Erro silencioso ao atualizar:", e); 
    }
}

// =========================================
// LOGICA PARA SALVAR O PRATO
// =========================================
const formPrato = document.getElementById('form-criar-prato');

if(formPrato) {
    formPrato.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede a página de recarregar

        const btn = formPrato.querySelector('.btn-save');
        const textoOriginal = btn.innerText;
        btn.innerText = "Salvando...";
        btn.disabled = true;

        // 1. Pega os dados do formulário
        const nome = document.getElementById('prato-nome').value;
        const precoString = document.getElementById('prato-preco').value;
        
        // Usa a função que já criamos para limpar o "R$"
        const preco = limparMoedaParaFloat(precoString); 

        // 2. Pega os IDs dos ingredientes que estão marcados (CHECKED)
        const checkboxes = document.querySelectorAll('.chk-ingrediente:checked');
        const ingredienteIds = Array.from(checkboxes).map(chk => parseInt(chk.value));

        // 3. Monta o objeto DTO para enviar ao C#
        const pratoDTO = {
            nome: nome,
            preco: preco,
            // O erro diz que o campo obrigatório é "IngredienteId", então usamos esse nome exato:
            IngredienteId: ingredienteIds 
        };

        try {
            let url = 'http://localhost:5225/api/web/Prato/cria-prato';
            let metodo = 'POST';

            // Se tiver ID, é edição
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
                carregarPratos(); // Atualiza a tabela na hora
            } else {
                const erroTexto = await response.text();
                alert("Erro ao salvar: " + erroTexto);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        }

        // Restaura o botão
        btn.innerText = textoOriginal;
        btn.disabled = false;
    });
}
// =========================================
// FUNÇÃO PARA AVANÇAR O STATUS DO PEDIDO
// =========================================
window.avancarStatusPedido = async function(id) {
    // Muda o texto do botão para dar feedback visual (opcional, mas bom)
    const card = document.querySelector(`button[onclick="avancarStatusPedido(${id})"]`);
    if(card) {
        card.innerText = "...";
        card.disabled = true;
    }

    try {
        const response = await fetch(`http://localhost:5225/api/web/Pedido/avancar-status?id=${id}`, {
            method: 'PUT'
        });
        
        if(response.ok) {
            // Se deu certo, recarrega a tela para mover o card de lugar
            carregarPedidosCozinha(); 
        } else {
            const msg = await response.text();
            alert("Erro ao mudar status: " + msg);
            if(card) { card.innerText = "Tentar Novamente"; card.disabled = false; }
        }
    } catch(e) { 
        console.error(e);
        alert("Erro de conexão.");
        if(card) { card.innerText = "Erro"; card.disabled = false; }
    }
}

// =========================================
// GESTÃO DE FATURAMENTO
// =========================================

async function carregarFaturamento() {
    // 1. Carrega os totais de hoje
    try {
        const res = await fetch('http://localhost:5225/api/web/Faturamento/diario');
        if(res.ok) {
            const dados = await res.json();
            document.getElementById('fat-valor-hoje').innerText = 
                dados.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('fat-qtd-hoje').innerText = dados.quantidade;
        }
    } catch(e) { console.error("Erro ao carregar totais", e); }

    // 2. Carrega o histórico recente
    const tabela = document.getElementById('tabela-historico-vendas');
    tabela.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
    
    try {
        const res = await fetch('http://localhost:5225/api/web/Faturamento/historico');
        if(res.ok) {
            const lista = await res.json();
            tabela.innerHTML = '';
            
            if(lista.length === 0) {
                tabela.innerHTML = '<tr><td colspan="3">Nenhuma venda registrada ainda.</td></tr>';
                return;
            }

            lista.forEach(v => {
                const dataObj = new Date(v.dataVenda);
                const dataFmt = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR');
                
                tabela.innerHTML += `
                    <tr>
                        <td>#${v.id}</td>
                        <td>${dataFmt}</td>
                        <td style="color: #28a745; font-weight: bold;">
                            ${v.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                    </tr>
                `;
            });
        }
    } catch(e) { console.error("Erro lista vendas", e); }
}

// =========================================
// ATUALIZAÇÃO AUTOMÁTICA DA COZINHA (TEMPO REAL)
// =========================================
setInterval(() => {
    // 1. Verifica se estamos na tela de Pedidos
    const secaoPedidos = document.getElementById('sec-pedidos');
    
    // Se a seção existir e estiver visível (display block)
    if (secaoPedidos && secaoPedidos.style.display !== 'none') {
        console.log("Buscando novos pedidos..."); // Opcional: só pra vc ver no console
        carregarPedidosCozinha();
    }
}, 5000); // 5000 milissegundos = 5 segundos