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
        ctx.fillStyle = 'rgba(10, 15, 20, 0.1)'; // Use a new background color with low alpha
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Match the new --primary-color: #00ff9c
        ctx.fillStyle = '#00ff9c'; // Cor primária (verde menta vibrante)
        ctx.font = `${FONT_SIZE}px monospace`;

        columns.forEach((column, index) => {
            const charIndex = Math.floor(Math.random() * charCount);
            const text = characters.charAt(charIndex);
            const x = index * FONT_SIZE;
            const y = column.y * FONT_SIZE;

            ctx.fillText(text, x, y);

            // Move a coluna para baixo
            column.y += column.speed / 20; // Ajusta a velocidade

            // Se a coluna sair da tela, reseta para o topo com nova posição Y aleatória
            if (column.y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                 column.y = 0;
            }

            // Reset gradual para evitar que todas caiam ao mesmo tempo no início
            if (column.y < 0) column.y = Math.random() * MATRIX_HEIGHT;
        });

        texture.needsUpdate = true; // Informa ao Three.js que a textura foi atualizada
    }


    function animate() {
        requestAnimationFrame(animate);
        drawMatrix();
        renderer.render(scene, camera);
    }

    // Responsividade
    window.addEventListener('resize', () => {
        // Recalculate dimensions for canvas and renderer
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Update renderer and camera
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        // Update plane geometry to match new screen size
        plane.geometry.dispose(); // Dispose old geometry
        plane.geometry = new THREE.PlaneGeometry(newWidth, newHeight);

        // Recalculate matrix properties based on new dimensions
        // Note: Simple resize might stretch existing canvas texture.
        // For perfect pixel mapping on resize, might need to regenerate columns/texture content.
        // Let's keep it simple for now - texture will stretch/compress.
    });


    animate();

} else {
    console.error("Elemento #matrix-bg não encontrado.");
}


// --- Efeito de Digitação ---
const typingElement = document.getElementById('typing-effect');
if (typingElement) {
    const textToType = "Analista de Segurança Ofensiva | Pentester | Bug Hunter"; // Slightly different text
    let index = 0;
    let isDeleting = false;
    let currentText = '';
    const typingSpeed = 100; // Velocidade de digitação
    const deletingSpeed = 50; // Velocidade ao apagar
    const delayBetween = 1500; // Pausa antes de apagar/digitar próximo

    function type() {
        const fullText = textToType;

        if (isDeleting) {
            // Remove caractere
            currentText = fullText.substring(0, currentText.length - 1);
        } else {
            // Adiciona caractere
            currentText = fullText.substring(0, currentText.length + 1);
        }

        // Check if element still exists before updating
        if (typingElement) {
            typingElement.textContent = currentText;
        } else {
            return; // Stop if element is gone
        }


        let typeSpeed = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && currentText === fullText) {
            // Pause at end
            typeSpeed = delayBetween;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            // Pause before start typing again
            isDeleting = false;
            // Optionally: move to next text in an array here
            typeSpeed = 500; // Pause before re-typing
        }

        setTimeout(type, typeSpeed);
    }

    // Initial call
    setTimeout(type, 500); // Start after a short delay

} else {
    console.error("Elemento #typing-effect não encontrado.");
}

// --- Hero Section Scroll Effect ---
const heroContent = document.querySelector('.hero-content');
const heroSection = document.getElementById('hero-section'); // Get the parent hero section

if (heroContent && heroSection) {
    const effectDistance = window.innerHeight * 0.6; // Distance over which the effect happens
    const initialPaddingTop = 4; // Initial padding top in rem (from CSS .hero-content)
    const initialPaddingBottom = 3; // Initial padding bottom in rem (from CSS .hero-content)
    // Get initial background alpha from CSS variable (or default)
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
        // Ensure effectDistance is not zero to avoid division by zero
        const scrollRatio = effectDistance > 0 ? Math.min(scrollY / effectDistance, 1) : 0; // 0 to 1

        // Calculate styles for hero-content
        const contentOpacity = 1 - scrollRatio;
        const scale = 1 - scrollRatio * 0.1; // Scale down to 90%
        const blur = scrollRatio * 8; // Blur up to 8px

        // Calculate styles for hero section background
        const backgroundAlpha = initialBgAlpha * (1 - scrollRatio); // Fade out alpha

        // Calculate dynamic padding (reduce slightly faster than fade)
        const paddingTop = initialPaddingTop * (1 - Math.min(scrollRatio * 1.2, 1)); // Reduce padding
        const paddingBottom = initialPaddingBottom * (1 - Math.min(scrollRatio * 1.2, 1));


        // Apply styles directly
        heroContent.style.opacity = contentOpacity;
        heroContent.style.transform = `scale(${scale})`;
        heroContent.style.filter = `blur(${blur}px)`;
        // Adjust padding on heroContent to shrink the vertical space
        heroContent.style.paddingTop = `${paddingTop}rem`;
        heroContent.style.paddingBottom = `${paddingBottom}rem`;

        // Make content unclickable when faded
        heroContent.style.pointerEvents = contentOpacity < 0.1 ? 'none' : 'auto';

        // Apply background fade to the hero section itself
        // Assuming --cover-overlay-rgb is '10, 15, 20'
        heroSection.style.backgroundColor = `rgba(10, 15, 20, ${backgroundAlpha})`;

         // Optional: Add pointer-events: none to heroSection when fully faded
         heroSection.style.pointerEvents = backgroundAlpha < 0.05 ? 'none' : 'auto';

    // **Nova lógica: Oculta completamente o conteúdo quando o efeito estiver completo**
    if (scrollRatio >= 1) {
        heroContent.style.display = 'none';
   } else {
        heroContent.style.display = 'block'; // ou 'flex', conforme o layout original
   }
             
}

    // Initial state check in case page loads scrolled
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener

} else {
    if (!heroContent) console.error("Elemento .hero-content não encontrado.");
    if (!heroSection) console.error("Elemento #hero-section não encontrado.");
}


// Optional: Add subtle animation on scroll reveal
const sections = document.querySelectorAll('section');

const observerOptions = {
    root: null, // relative to document viewport
    rootMargin: '0px',
    threshold: 0.1 // trigger when 10% of the element is visible
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            // Optional: unobserve after animation to save resources
            // observer.unobserve(entry.target);
        } else {
             // Optional: Reset animation if element scrolls out of view
             // entry.target.style.opacity = '0';
             // entry.target.style.transform = 'translateY(20px)';
        }
    });
};

const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

sections.forEach(section => {
    // Initial state for animation
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    scrollObserver.observe(section);
});
