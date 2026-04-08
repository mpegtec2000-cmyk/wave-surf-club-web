document.addEventListener('DOMContentLoaded', () => {

    // --- Dropdowns ---
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    
    // Toggle dropdowns
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parent = btn.parentElement;
            
            // Close other open dropdowns
            document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                if(dropdown !== parent) {
                    dropdown.classList.remove('open');
                    dropdown.querySelector('.dropdown-btn').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            parent.classList.toggle('open');
            const isOpen = parent.classList.contains('open');
            btn.setAttribute('aria-expanded', isOpen);
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
            dropdown.querySelector('.dropdown-btn').setAttribute('aria-expanded', 'false');
        });
    });

    // Prevent closing when clicking inside dropdown menu
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });


    // --- Language Selector ---
    const langSelectors = document.querySelectorAll('.lang-selector');
    const currentLangEl = document.getElementById('currentLang');

    langSelectors.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            currentLangEl.textContent = lang;
            
            // Close dropdown
            e.target.closest('.dropdown').classList.remove('open');
            
            // Here you would implement actual i18n logic
            console.log(`Language changed to ${lang}`);
        });
    });


    // --- Mobile Menu ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navCenter = document.querySelector('.nav-center');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navCenter.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            navCenter.classList.remove('active');
        });
    });


    // --- Modal Logic ---
    const openModalBtn = document.getElementById('openClientModal');
    const modalOverlay = document.getElementById('clienteModal');
    const closeModalBtn = document.querySelector('.close-btn');

    const openModal = () => {
        modalOverlay.classList.add('active');
        // Close dropdown
        openModalBtn.closest('.dropdown').classList.remove('open');
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside content
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });


    // --- Form Validation ---
    const form = document.getElementById('clienteForm');
    const submitBtn = form.querySelector('.submit-btn');
    const inputs = form.querySelectorAll('input[required]');

    const checkFormValidity = () => {
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
            }
        });
        submitBtn.disabled = !isValid;
    };

    inputs.forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Prepare data for POST
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Sending data to database:', data);
        
        // Simulate API call
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('¡Registro exitoso! Bienvenido a Wave Surf Club.');
            form.reset();
            checkFormValidity();
            submitBtn.textContent = 'Regístrate Ahora';
            closeModal();
        }, 1500);
    });


    // --- Intersection Observer for Scroll Animations ---
    const sections = document.querySelectorAll('.section-inner');
    
    const observerOptions = {
        root: document.querySelector('.scroll-container'),
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Update active nav link
                const id = entry.target.parentElement.getAttribute('id');
                updateActiveLink(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Also observe the hero section separately
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActiveLink('biografia');
            }
        });
    }, observerOptions);
    heroObserver.observe(document.querySelector('.section-hero'));

    function updateActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    }
});
