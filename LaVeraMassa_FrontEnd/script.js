document.addEventListener('DOMContentLoaded', function() {
    
    // 1. MENU MOBILE
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            const icon = menuToggle.querySelector('i');
            if(navLinks.classList.contains('nav-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 2. NAVBAR SCROLL
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // 3. HERO SLIDER
    const sliderContainer = document.querySelector('.slider-container');
    if(sliderContainer) {
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let currentSlide = 0;
        const totalSlides = slides.length;

        function showSlide(index) {
            if (index >= totalSlides) currentSlide = 0;
            else if (index < 0) currentSlide = totalSlides - 1;
            else currentSlide = index;
            sliderContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
        }
        if(nextBtn) nextBtn.addEventListener('click', () => { showSlide(currentSlide + 1); resetAutoPlay(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { showSlide(currentSlide - 1); resetAutoPlay(); });
        let slideInterval = setInterval(() => { showSlide(currentSlide + 1); }, 5000);
        function resetAutoPlay() { clearInterval(slideInterval); slideInterval = setInterval(() => { showSlide(currentSlide + 1); }, 5000); }
    }

    // 4. CARROSSEL DE AVALIAÇÕES
    const track = document.querySelector('.reviews-track');
    if(track) {
        const cards = document.querySelectorAll('.review-card');
        let reviewIndex = 0;
        function getCardsPerView() { return window.innerWidth > 900 ? 3 : 1; }
        function moveCarousel() {
            const cardsPerView = getCardsPerView();
            const totalCards = cards.length;
            const maxIndex = totalCards - cardsPerView;
            reviewIndex++;
            if (reviewIndex > maxIndex) reviewIndex = 0;
            const moveAmount = (100 / cardsPerView) * reviewIndex;
            track.style.transform = `translateX(-${moveAmount}%)`;
        }
        setInterval(moveCarousel, 4000);
    }

    // 5. MODAIS
    const modal = document.getElementById('review-modal');
    if(modal) {
        const modalContent = document.getElementById('modal-content-box');
        const closeBtn = document.querySelector('.close-btn');
        const modalName = document.getElementById('modal-name');
        const modalText = document.getElementById('modal-text');
        const modalStars = document.getElementById('modal-stars');
        const modalSelo = document.getElementById('modal-selo-container');

        window.abrirReview = function(nome, texto, estrelas, isCritico) {
            modalName.innerText = nome;
            modalText.innerText = texto;
            modalStars.innerHTML = '';
            for(let i=0; i<5; i++) {
                if(i < estrelas) modalStars.innerHTML += '<i class="fas fa-star"></i>';
                else modalStars.innerHTML += '<i class="far fa-star"></i>';
            }
            if(isCritico) {
                modalContent.classList.add('critico-style');
                modalSelo.innerHTML = '<span class="selo-critico" style="font-size: 0.9rem; margin-bottom: 15px; display:inline-block;">Crítico Gastronômico</span>';
            } else {
                modalContent.classList.remove('critico-style');
                modalSelo.innerHTML = ''; 
            }
            modal.style.display = 'flex';
        }
        if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => { if(e.target == modal) modal.style.display = 'none'; });
    }

    // MODAL DE MENSAGEM
    const msgModal = document.getElementById('msg-modal');
    const msgContent = document.querySelector('.modal-msg-content');
    const msgIcon = document.getElementById('msg-icon');
    const msgTitle = document.getElementById('msg-title');
    const msgText = document.getElementById('msg-text');
    const msgClose = document.getElementById('msg-close-btn');

    function mostrarMensagem(tipo, titulo, texto) {
        msgContent.classList.remove('msg-success', 'msg-error');
        if(tipo === 'success') {
            msgContent.classList.add('msg-success');
            msgIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        } else {
            msgContent.classList.add('msg-error');
            msgIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        }
        msgTitle.innerText = titulo;
        msgText.innerHTML = texto;
        msgModal.style.display = 'flex';
    }
    if(msgClose) msgClose.addEventListener('click', () => msgModal.style.display = 'none');
    window.addEventListener('click', (e) => { if(e.target == msgModal) msgModal.style.display = 'none'; });

    // 6. CARDÁPIO (DADOS.JS)
    const menuContainer = document.getElementById('full-menu-list');
    if (menuContainer && typeof cardapioData !== 'undefined') {
        menuContainer.innerHTML = ''; 
        cardapioData.forEach(categoria => {
            const catDiv = document.createElement('div');
            catDiv.className = 'menu-category';
            const title = document.createElement('h3');
            title.innerText = categoria.categoria;
            catDiv.appendChild(title);
            categoria.itens.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'menu-item';
                const precoFormatado = item.preco.toFixed(2).replace('.', ',');
                itemDiv.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${item.nome}</span>
                        <span class="item-price">R$ ${precoFormatado}</span>
                    </div>
                    <div class="item-desc">${item.desc}</div>
                `;
                catDiv.appendChild(itemDiv);
            });
            menuContainer.appendChild(catDiv);
        });
    }

    // 7. RESERVAS (CALENDÁRIO + API + MÁSCARA)
    // Só entra aqui se existir o campo de data E se a biblioteca flatpickr estiver carregada
    const inputData = document.getElementById('dataReserva');
    
    if(inputData && typeof flatpickr !== 'undefined') {
        
        const formReserva = inputData.closest('form'); // Pega o formulário pai da data

        // Máscara de Telefone
        const inputTelefone = formReserva.querySelector('input[type="tel"]');
        if(inputTelefone) {
            inputTelefone.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, ""); 
                if (value.length > 11) value = value.slice(0, 11);
                if (value.length > 2) value = `(${value.substring(0,2)}) ${value.substring(2)}`;
                if (value.length > 10) value = `${value.substring(0,10)}-${value.substring(10)}`;
                else if (value.length > 6) value = `${value.substring(0,9)}-${value.substring(9)}`;
                e.target.value = value;
            });
        }

        // Calendário Flatpickr
        const selectHorario = document.getElementById('horarioReserva');
        const inputData = document.getElementById('dataReserva');
        
        flatpickr(inputData, {
            locale: "pt",
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                atualizarHorarios(selectedDates[0]);
            }
        });

        function atualizarHorarios(data) {
            selectHorario.innerHTML = ''; 
            if(!data) return;
            const diaSemana = data.getDay(); 
            let opcoes = [];
            if (diaSemana !== 1) { // Almoço
                opcoes.push("12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00");
            }
            if (diaSemana !== 0) { // Jantar
                if(opcoes.length > 0) opcoes.push("--- Jantar ---");
                opcoes.push("19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00");
            }
            if(opcoes.length === 0) {
                const opt = document.createElement('option');
                opt.text = "Fechado neste dia";
                selectHorario.appendChild(opt);
            } else {
                opcoes.forEach(hora => {
                    const opt = document.createElement('option');
                    opt.value = hora.includes("-") ? "" : hora; 
                    opt.text = hora;
                    if(hora.includes("-")) opt.disabled = true; 
                    selectHorario.appendChild(opt);
                });
            }
        }

        // Envio do Form
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formReserva.querySelector('button');
            const textoOriginal = btn.innerText;
            btn.innerText = "Enviando...";
            btn.disabled = true;

            const inputs = formReserva.querySelectorAll('input, select');
            const nomeCliente = inputs[3].value; 

            const dadosReserva = {
                data: inputs[0].value, 
                pessoa: parseInt(inputs[1].value),
                horario: inputs[2].value + ":00", 
                nome: nomeCliente,
                telefone: inputs[4].value,
                email: inputs[5].value
            };

            try {
                // URL DO BACK-END
                const response = await fetch('http://localhost:5225/api/web/Reserva/cria', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosReserva)
                });

                if (response.ok) {
                    mostrarMensagem('success', 'Reserva Confirmada!', `Grazie, <b>${nomeCliente}</b>!<br>Sua mesa para o dia ${dadosReserva.data} às ${inputs[2].value} está reservada.`);
                    formReserva.reset();
                } else {
                    const erroTexto = await response.text();
                    console.error("Erro Back:", erroTexto);
                    mostrarMensagem('error', 'Ops, algo deu errado', 'Não foi possível concluir sua reserva.<br><br>Erro: ' + erroTexto);
                }
            } catch (erro) {
                console.error(erro);
                mostrarMensagem('error', 'Erro de Conexão', 'Não conseguimos conectar ao servidor.<br>Verifique se o Back-end está rodando.');
            }
            btn.innerText = textoOriginal;
            btn.disabled = false;
        });
    }

    // ===============================================
    // 9. PÁGINA DELIVERY (Separada do Cardápio)
    // ===============================================
    const deliveryContainer = document.getElementById('delivery-menu-list');
    
    // Variável global do carrinho
    let carrinho = [];

    // Função para adicionar (Global)
    window.adicionarAoCarrinho = function(nome, preco) {
        carrinho.push({ nome, preco });
        atualizarCarrinhoUI();
        // Feedback visual rápido
        const btnFloat = document.getElementById('cart-float-btn');
        btnFloat.style.transform = 'scale(1.2)';
        setTimeout(() => btnFloat.style.transform = 'scale(1)', 200);
    };

    // Renderiza a lista de produtos COM botão de compra
    if (deliveryContainer && typeof cardapioData !== 'undefined') {
        deliveryContainer.innerHTML = ''; 
        cardapioData.forEach(categoria => {
            const catDiv = document.createElement('div');
            catDiv.className = 'menu-category';
            
            const title = document.createElement('h3');
            title.innerText = categoria.categoria;
            catDiv.appendChild(title);
            
            categoria.itens.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'menu-item';
                const precoFormatado = item.preco.toFixed(2).replace('.', ',');
                
                itemDiv.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${item.nome}</span>
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <span class="item-price">R$ ${precoFormatado}</span>
                            <button class="btn-add-cart" onclick="adicionarAoCarrinho('${item.nome}', ${item.preco})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-desc">${item.desc}</div>
                `;
                catDiv.appendChild(itemDiv);
            });
            deliveryContainer.appendChild(catDiv);
        });
    }

    // ===============================================
    // 10. LÓGICA DO CARRINHO E CHECKOUT
    // ===============================================
    const modalCart = document.getElementById('cart-modal');
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSpan = document.getElementById('cart-total-value');
    const formDelivery = document.getElementById('form-delivery');

    window.abrirCarrinho = function() {
        if(modalCart) {
            modalCart.style.display = 'flex';
            renderizarItensCarrinho();
        }
    }
    
    window.fecharCarrinho = function() {
        if(modalCart) modalCart.style.display = 'none';
    }

    // Fecha ao clicar fora
    window.addEventListener('click', (e) => { 
        if(e.target == modalCart) fecharCarrinho(); 
    });

    window.removerDoCarrinho = function(index) {
        carrinho.splice(index, 1);
        atualizarCarrinhoUI();
        renderizarItensCarrinho();
    }

    function atualizarCarrinhoUI() {
        if(cartCountSpan) cartCountSpan.innerText = carrinho.length;
    }

    function renderizarItensCarrinho() {
        if(!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if(carrinho.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg" style="text-align:center; padding:20px; color:#999;">Seu carrinho está vazio.</p>';
            cartTotalSpan.innerText = "R$ 0,00";
            return;
        }

        carrinho.forEach((item, index) => {
            total += item.preco;
            const div = document.createElement('div');
            div.className = 'cart-item-row';
            div.innerHTML = `
                <div>
                    <strong>${item.nome}</strong><br>
                    <small>R$ ${item.preco.toFixed(2).replace('.', ',')}</small>
                </div>
                <i class="fas fa-trash cart-remove-btn" onclick="removerDoCarrinho(${index})" title="Remover"></i>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalSpan.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // ENVIO REAL PARA O BACK-END
    if(formDelivery) {
        formDelivery.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if(carrinho.length === 0) {
                mostrarMensagem('error', 'Carrinho Vazio', 'Adicione itens antes de finalizar.');
                return;
            }

            const btn = formDelivery.querySelector('button');
            const textoOriginal = btn.innerText;
            btn.innerText = "Enviando...";
            btn.disabled = true;

            // DTO igual ao do C# DeliveryInput
            const pedidoDelivery = {
                nomeCliente: document.getElementById('del-nome').value,
                telefone: document.getElementById('del-tel').value,
                endereco: document.getElementById('del-endereco').value,
                formaPagamento: document.getElementById('del-pagamento').value,
                itens: carrinho.map(i => i.nome), // Lista de strings
                valorTotal: carrinho.reduce((sum, i) => sum + i.preco, 0)
            };

            try {
                const response = await fetch('http://localhost:5225/api/web/Delivery/criar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pedidoDelivery)
                });

                if (response.ok) {
                    const dados = await response.json();
                    
                    mostrarMensagem('success', 'Pedido Realizado!', 
                        `Obrigado, <b>${pedidoDelivery.nomeCliente}</b>!<br>` +
                        `Seu pedido <b>#${dados.id}</b> foi recebido e já vai para a cozinha.`);
                    
                    carrinho = [];
                    atualizarCarrinhoUI();
                    fecharCarrinho();
                    formDelivery.reset();
                } else {
                    const erroTxt = await response.text();
                    mostrarMensagem('error', 'Erro', 'O restaurante não pôde receber o pedido: ' + erroTxt);
                }
            } catch (erro) {
                console.error(erro);
                mostrarMensagem('error', 'Sem Conexão', 'Verifique se o sistema do restaurante está online.');
            }

            btn.innerText = textoOriginal;
            btn.disabled = false;
        });
    }
});

