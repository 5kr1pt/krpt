import * as THREE from 'three';

// --- Efeito Matrix Background ---
const matrixContainer = document.getElementById('matrix-bg');
if (matrixContainer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // alpha: true para fundo transparente
    renderer.setSize(window.innerWidth, window.innerHeight);
    matrixContainer.appendChild(renderer.domElement);

    const FONT_SIZE = 10; // Tamanho da fonte para os caracteres
    const MATRIX_WIDTH = Math.floor(window.innerWidth / FONT_SIZE);
    const MATRIX_HEIGHT = Math.floor(window.innerHeight / FONT_SIZE);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ';
    const charCount = characters.length;

    // Usaremos um CanvasTexture para desenhar os caracteres
    const canvas = document.createElement('canvas');
    canvas.width = MATRIX_WIDTH * FONT_SIZE;
    canvas.height = MATRIX_HEIGHT * FONT_SIZE;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Melhora a qualidade da textura
    const planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    camera.position.z = 1; // A câmera está olhando diretamente para o plano

    const columns = [];
    for (let i = 0; i < MATRIX_WIDTH; i++) {
        columns[i] = {
            y: Math.random() * MATRIX_HEIGHT, // Posição inicial aleatória
            speed: 1 + Math.random() * 3,   // Velocidade aleatória
            switchInterval: Math.round(2 + Math.random() * 10) // Intervalo para trocar caractere
        };
    }

    function drawMatrix() {
        // Fundo semi-transparente para criar o efeito de rastro
        ctx.fillStyle = 'rgba(10, 15, 20, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff9c'; // Cor primária (verde menta vibrante)
        ctx.font = `${FONT_SIZE}px monospace`;

        columns.forEach((column, index) => {
            const charIndex = Math.floor(Math.random() * charCount);
            const text = characters.charAt(charIndex);
            const x = index * FONT_SIZE;
            const y = column.y * FONT_SIZE;

            ctx.fillText(text, x, y);

            // Move a coluna para baixo
            column.y += column.speed / 20;

            // Se a coluna sair da tela, reseta para o topo com nova posição Y aleatória
            if (column.y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                 column.y = 0;
            }

            if (column.y < 0) column.y = Math.random() * MATRIX_HEIGHT;
        });

        texture.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);
        drawMatrix();
        renderer.render(scene, camera);
    }

    // Responsividade
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        canvas.width = newWidth;
        canvas.height = newHeight;

        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(newWidth, newHeight);
    });

    animate();

} else {
    console.error("Elemento #matrix-bg não encontrado.");
}

// --- Efeito de Digitação ---
const typingElement = document.getElementById('typing-effect');
if (typingElement) {
    const textToType = "Analista de Segurança Ofensiva | Pentester | Bug Hunter";
    let index = 0;
    let isDeleting = false;
    let currentText = '';
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetween = 1500;

    function type() {
        const fullText = textToType;

        if (isDeleting) {
            currentText = fullText.substring(0, currentText.length - 1);
        } else {
            currentText = fullText.substring(0, currentText.length + 1);
        }

        if (typingElement) {
            typingElement.textContent = currentText;
        } else {
            return;
        }

        let typeSpeed = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && currentText === fullText) {
            typeSpeed = delayBetween;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    setTimeout(type, 500);
} else {
    console.error("Elemento #typing-effect não encontrado.");
}

// --- Hero Section Scroll Effect ---
const heroContent = document.querySelector('.hero-content');
const heroSection = document.getElementById('hero-section');

if (heroContent && heroSection) {
    const effectDistance = window.innerHeight * 0.6;
    const initialPaddingTop = 4;
    const initialPaddingBottom = 3;
    let initialBgAlpha = 0.8;
    try {
        const rootStyle = getComputedStyle(document.documentElement);
        const alphaVar = rootStyle.getPropertyValue('--cover-overlay-alpha').trim();
        if (alphaVar) {
            initialBgAlpha = parseFloat(alphaVar);
        }
    } catch (e) {
        console.warn("Could not read --cover-overlay-alpha CSS variable.", e);
    }

    function handleScroll() {
        const scrollY = window.scrollY;
        const scrollRatio = effectDistance > 0 ? Math.min(scrollY / effectDistance, 1) : 0;
    
        const contentOpacity = 1 - scrollRatio;
        const scale = 1 - scrollRatio * 0.1;
        const blur = scrollRatio * 8;
        const backgroundAlpha = initialBgAlpha * (1 - scrollRatio);
        const paddingTop = initialPaddingTop * (1 - Math.min(scrollRatio * 1.2, 1));
        const paddingBottom = initialPaddingBottom * (1 - Math.min(scrollRatio * 1.2, 1));
    
        heroContent.style.opacity = contentOpacity;
        heroContent.style.transform = `scale(${scale})`;
        heroContent.style.filter = `blur(${blur}px)`;
        heroContent.style.paddingTop = `${paddingTop}rem`;
        heroContent.style.paddingBottom = `${paddingBottom}rem`;
        heroContent.style.pointerEvents = contentOpacity < 0.1 ? 'none' : 'auto';
    
        heroSection.style.backgroundColor = `rgba(10, 15, 20, ${backgroundAlpha})`;
        heroSection.style.pointerEvents = backgroundAlpha < 0.05 ? 'none' : 'auto';
    
        // Se o scroll estiver praticamente completo, espera um pouco antes de setar o display none
        if (scrollRatio >= 0.98) {
            setTimeout(() => {
                // Confirma que o usuário não rolou para cima durante o delay
                if (window.scrollY / effectDistance >= 0.98) {
                    heroContent.style.display = 'none';
                }
            }, 200);
        } else {
            heroContent.style.display = 'block';
        }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

} else {
    if (!heroContent) console.error("Elemento .hero-content não encontrado.");
    if (!heroSection) console.error("Elemento #hero-section não encontrado.");
}

// --- Animação de Scroll Reveal para Sections ---
const sections = document.querySelectorAll('section');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
};

const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    scrollObserver.observe(section);
});

// --- Lógica para Remover e Reaparecer o Menu via Botão ---

// Seleciona os elementos de navegação e do botão de toggle
const nav = document.querySelector('nav');
const menuToggle = document.getElementById('menu-toggle');

// Flag para indicar que o usuário forçou a exibição do menu
let menuForceOpen = false;

// Função para esconder o menu (removendo-o do fluxo)
function hideNav() {
    nav.style.display = 'none';
    // Mantém o botão sempre visível quando o usuário está com scroll > 50
    menuToggle.style.display = 'block';
}

// Função para mostrar o menu
function showNav() {
    // Restaura o menu utilizando "flex" (ou outro valor que corresponda ao seu layout)
    nav.style.display = 'flex';
    // Se a página estiver com scroll > 50, o botão permanece visível para permitir fechar o menu
    // Se estiver no topo, podemos ocultar o botão (opcional)
    if (window.scrollY > 50) {
        menuToggle.style.display = 'block';
    } else {
        menuToggle.style.display = 'none';
    }
}

// Estado inicial: Se estiver no topo, mostra o menu e oculta o botão; senão, oculta o menu e mostra o botão.
if (window.scrollY <= 50) {
    showNav();
} else {
    hideNav();
}

// Evento de scroll – somente oculta o menu se o usuário NÃO tiver forçado sua exibição
window.addEventListener('scroll', () => {
    if (window.scrollY <= 50) {
        showNav();
        menuForceOpen = false;
    } else {
        if (!menuForceOpen) {
            hideNav();
        }
    }
});

// Evento de clique no botão de toggle: alterna a exibição do menu e ativa/desativa a flag
menuToggle.addEventListener('click', () => {
    const navDisplay = getComputedStyle(nav).display;
    if (navDisplay === 'none') {
        showNav();
        menuForceOpen = true;
    } else {
        hideNav();
        menuForceOpen = false;
    }
});
