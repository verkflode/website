// Verkflöde Main JavaScript
// Enhanced for Swedish character encoding and responsive design

document.addEventListener('DOMContentLoaded', function() {
    // Ensure proper Swedish character encoding
    if (document.characterSet !== 'UTF-8') {
        console.warn('Character encoding is not UTF-8. Swedish characters may not display correctly.');
    }
    // Mobile Menu Functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');

    const mobileLinks = document.querySelectorAll('.mobile-nav-item');

    function openMenu() {
        mobileMenu.classList.add('active');
        document.body.classList.add('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMenu);
    }

    if (closeMobileMenu) {
        closeMobileMenu.addEventListener('click', closeMenu);
    }

    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Escape key closes mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header Scroll Effect
    const header = document.querySelector('header');


    function handleScroll() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    const animateElements = document.querySelectorAll('section, .card, .stat-card, .goal-card, .feature-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });

// Form Validation for Contact Form with Invisible Turnstile
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default browser submission

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const formData = new FormData(contactForm);
        const formObject = Object.fromEntries(formData.entries());
        
        // Hide previous messages
        document.getElementById('formSuccess').style.display = 'none';
        document.getElementById('formErrors').style.display = 'none';

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifierar...';

        // Submit with Turnstile token (if available) or dev-bypass
        if (!formObject['cf-turnstile-response']) {
            formObject['cf-turnstile-response'] = 'dev-bypass';
        }
        
        submitBtn.textContent = 'Skickar Förfrågan...';
        submitFormData(formObject, submitBtn);
    });
}

// Helper function to submit form data
function submitFormData(formObject, submitBtn) {
    fetch('https://kigxkob9q8.execute-api.eu-north-1.amazonaws.com/prod/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFormSuccess(data.message || "Tack för din förfrågan! Vi återkommer inom 24 timmar med din ROI-analys.");
        } else {
            showFormErrors(data.errors || [data.message || "Ett fel inträffade. Vänligen försök igen eller kontakta oss direkt på hej@verkflode.se"]);
        }
    })
    .catch(() => {
        showFormErrors(["Ett nätverksfel inträffade. Vänligen kontrollera din internetanslutning och försök igen."]);
    })
    .finally(() => {
        // Re-enable button and reset text
        submitBtn.disabled = false;
        submitBtn.textContent = 'Få Min ROI-Analys';
    });
}

function showFormErrors(errors) {
  const errorContainer = document.getElementById('formErrors');
  if (errorContainer) {
      errorContainer.innerHTML = errors.map(err => `<p>${err}</p>`).join('');
      errorContainer.style.display = 'block';
  }
}

function showFormSuccess(message) {
  const successContainer = document.getElementById('formSuccess');
  if (successContainer) {
      successContainer.textContent = message;
      successContainer.style.display = 'block';
      // Note: We need to find the form to reset it.
      document.getElementById('contactForm').reset();
      setTimeout(() => {
          successContainer.style.display = 'none';
      }, 5000);
  }
}



    // Lazy Loading for Images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // Performance: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Replace scroll listener with debounced version
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', debounce(handleScroll, 10), { passive: true });

    // Mobile Theme Toggle
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    if (mobileThemeToggle && window.VerkflodeTheme) {
        mobileThemeToggle.addEventListener('click', () => {
            window.VerkflodeTheme.toggle();
        });
    }

    // Language Switching Enhancement
    const languageSwitcher = document.querySelector('.language-switcher');
    if (languageSwitcher) {
        const langLinks = languageSwitcher.querySelectorAll('.lang-link:not(.active)');
        
        langLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Add loading state for better UX
                const originalText = this.textContent;
                this.style.opacity = '0.7';
                this.style.pointerEvents = 'none';
                
                // Add a small delay to show the loading state
                setTimeout(() => {
                    // The browser will navigate to the new URL
                    window.location.href = this.href;
                }, 100);
            });
            
            // Add keyboard navigation
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // Add language preference detection and storage
    function detectAndStoreLanguagePreference() {
        const currentLang = document.documentElement.lang;
        const preferredLang = localStorage.getItem('verkflode-preferred-language');
        
        // Store current language preference
        if (currentLang) {
            localStorage.setItem('verkflode-preferred-language', currentLang);
        }
        
        // Add language switching analytics (if tracking is available)
        if (window.gtag && preferredLang && preferredLang !== currentLang) {
            window.gtag('event', 'language_switch', {
                'previous_language': preferredLang,
                'new_language': currentLang,
                'event_category': 'user_interaction'
            });
        }
    }
    
    detectAndStoreLanguagePreference();

    // Swedish content responsive design enhancements
    function enhanceSwedishContentDisplay() {
        // Add Swedish text class to all text elements
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, label');
        textElements.forEach(element => {
            if (element.textContent && /[åäöÅÄÖ]/.test(element.textContent)) {
                element.classList.add('swedish-text');
            }
        });

        // Optimize Swedish text rendering on mobile
        if (window.innerWidth <= 767) {
            const longTextElements = document.querySelectorAll('.hero-text, .section-text-wide, .card-text');
            longTextElements.forEach(element => {
                element.style.wordBreak = 'break-word';
                element.style.hyphens = 'auto';
            });
        }

        // Handle Swedish character input in forms
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // Ensure proper Swedish character handling
                if (this.value && /[åäöÅÄÖ]/.test(this.value)) {
                    this.setAttribute('lang', 'sv');
                }
            });
        });
    }

    enhanceSwedishContentDisplay();

    // Responsive design adjustments for Swedish content
    function handleResponsiveSwedishContent() {
        const viewport = window.innerWidth;
        const heroHeading = document.querySelector('.hero-heading, .hero-heading-narrow');
        const heroText = document.querySelector('.hero-text');
        
        if (viewport <= 480 && heroHeading) {
            // Ensure Swedish text doesn't overflow on very small screens
            heroHeading.style.fontSize = 'clamp(1.5rem, 6vw, 2rem)';
            heroHeading.style.lineHeight = '1.3';
        }
        
        if (viewport <= 480 && heroText) {
            heroText.style.fontSize = 'clamp(0.9rem, 3vw, 1.1rem)';
            heroText.style.lineHeight = '1.5';
        }

        // Adjust stat cards for Swedish text length
        const statLabels = document.querySelectorAll('.stat-label');
        statLabels.forEach(label => {
            if (viewport <= 767 && label.textContent.length > 10) {
                label.style.fontSize = '0.7rem';
                label.style.lineHeight = '1.2';
            }
        });
    }

    handleResponsiveSwedishContent();
    window.addEventListener('resize', debounce(handleResponsiveSwedishContent, 250));

    // Add keyboard navigation for accessibility
    const focusableElements = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector('.mobile-menu-panel');
    
    if (modal) {
        const focusableContent = modal.querySelectorAll(focusableElements);
        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        document.addEventListener('keydown', function(e) {
            if (!mobileMenu.classList.contains('active')) return;

            let isTabPressed = e.key === 'Tab';

            if (!isTabPressed) return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        });
    }
});