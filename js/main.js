document.addEventListener('DOMContentLoaded', () => {
    // === Variables & Elements ===
    const loader = document.querySelector('.loader');
    const loaderBar = document.querySelector('.loader-bar');
    const navbar = document.querySelector('.navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const langBtn = document.querySelector('.lang-btn');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    const currentLangText = document.querySelector('.current-lang');
    
    // === Loading Screen ===
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress > 100) progress = 100;
        
        if (loaderBar) loaderBar.style.width = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (loader) {
                    const loaderContent = loader.querySelector('.loader-content');
                    if (loaderContent) {
                        loaderContent.style.transform = 'scale(2.5)';
                        loaderContent.style.opacity = '0';
                    }
                    
                    setTimeout(() => {
                        loader.style.opacity = '0';
                        loader.style.pointerEvents = 'none';
                        initScrollReveals();
                    }, 500); // Wait for content animation
                }
            }, 500);
        }
    }, 200);

    // === Navbar Scroll ===
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // === Smooth Scroll for Anchors ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Don't prevent default for top-level links if needed, or handle specifically
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offset = 80; // Navbar height
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu
                if (navLinks) navLinks.classList.remove('active');
                const icon = mobileBtn ? mobileBtn.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // === Mobile Menu ===
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // === Language Switcher ===
    if (langBtn) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            langDropdown.classList.remove('active');
        });

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                const langName = e.currentTarget.textContent;
                
                // Update UI
                langOptions.forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                if (currentLangText) {
                    currentLangText.textContent = lang === 'ar' ? 'AR' : lang.toUpperCase();
                }
                
                // Load language
                loadLanguage(lang);
            });
        });
    }

    // === i18n Engine (Using global translations object) ===
    const availableLangs = ['en', 'ar', 'fr', 'de', 'es', 'it', 'zh', 'ja', 'ru', 'tr'];
    let currentLang = localStorage.getItem('museum_lang') || 'ar'; // Default to Arabic for this theme

    // Verify stored language is valid
    if (!availableLangs.includes(currentLang)) {
        currentLang = 'ar';
    }

    function loadLanguage(lang) {
        try {
            // Get translations from window.translations (defined in translations.js)
            const translations = window.translations[lang];
            if (!translations) {
                console.error('Translations missing for:', lang);
                return;
            }
            
            // Set direction and font
            document.documentElement.setAttribute('lang', lang);
            document.body.setAttribute('dir', translations.lang_dir);
            
            // Save preference
            localStorage.setItem('museum_lang', lang);
            currentLang = lang;
            
            // Update active state in dropdown
            langOptions.forEach(opt => {
                if (opt.getAttribute('data-lang') === lang) {
                    opt.classList.add('active');
                    if (currentLangText) {
                        currentLangText.textContent = lang === 'ar' ? 'AR' : lang.toUpperCase();
                    }
                } else {
                    opt.classList.remove('active');
                }
            });

            // Translate elements
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const keys = element.getAttribute('data-i18n').split('.');
                let value = translations;
                
                // Nested keys support
                for (const key of keys) {
                    if (value && value[key] !== undefined) {
                        value = value[key];
                    } else {
                        value = null;
                        break;
                    }
                }

                if (value) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = value;
                    } else if (element.tagName === 'SELECT') {
                        // Support translating select options
                        const options = element.querySelectorAll('option');
                        options.forEach(opt => {
                            const optKey = opt.getAttribute('data-i18n');
                            if (optKey) {
                                const optKeys = optKey.split('.');
                                let optValue = translations;
                                for (const k of optKeys) {
                                    if (optValue && optValue[k] !== undefined) {
                                        optValue = optValue[k];
                                    } else {
                                        optValue = null;
                                        break;
                                    }
                                }
                                if (optValue) opt.textContent = optValue;
                            }
                        });
                    } else {
                        element.innerHTML = value;
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading language:', error);
        }
    }

    // Initial load
    loadLanguage(currentLang);

    // === Scroll Reveals ===
    function initScrollReveals() {
        const reveals = document.querySelectorAll('.reveal');
        
        const revealOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);
        
        reveals.forEach(reveal => {
            revealObserver.observe(reveal);
        });
    }

    // === Gallery Modal Functionality ===
    const roomModal = document.getElementById('room-modal');
    const roomCards = document.querySelectorAll('.gallery-card');
    const closeRoomBtn = document.getElementById('close-room-modal');

    if (roomCards && roomModal) {
        roomCards.forEach(card => {
            card.addEventListener('click', () => {
                const roomId = card.getAttribute('data-room');
                const img = card.querySelector('.gallery-img').src;
                
                // Get content from current language
                const translations = window.translations[currentLang];
                const title = translations.gallery[`room${roomId}_title`];
                const details = translations.gallery[`room${roomId}_details`];

                // Populate modal
                document.getElementById('room-modal-img').src = img;
                document.getElementById('room-modal-title').textContent = title;
                document.getElementById('room-modal-desc').innerHTML = details || translations.gallery[`room${roomId}_desc`];

                // Show modal
                roomModal.style.display = 'block';
                setTimeout(() => roomModal.classList.add('active'), 10);
            });
        });

        if (closeRoomBtn) {
            closeRoomBtn.addEventListener('click', () => {
                roomModal.classList.remove('active');
                setTimeout(() => roomModal.style.display = 'none', 300);
            });
        }

        roomModal.addEventListener('click', (e) => {
            if (e.target === roomModal) {
                roomModal.classList.remove('active');
                setTimeout(() => roomModal.style.display = 'none', 300);
            }
        });
    }
});
