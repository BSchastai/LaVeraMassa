document.addEventListener('DOMContentLoaded', function() {
    
    // === 1. MENU MOBILE ===
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

    // === 2. NAVBAR SCROLL ===
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // === 3. HERO SLIDER (Somente se existir na página) ===
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

    // === 4. CARROSSEL DE AVALIAÇÕES ===
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

    // === 5. MODAL ===
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
        window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = 'none'; });
    }

    // === 6. GERADOR DE CARDÁPIO (DADOS.JS) ===
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
});