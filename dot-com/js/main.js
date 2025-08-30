// Verkflöde Main JavaScript

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

document.addEventListener('DOMContentLoaded', function() {
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

    // Form Validation for Contact Form
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default browser submission

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());
            
            // Add development bypass if Turnstile token is missing
            if (!formObject['cf-turnstile-response']) {
                formObject['cf-turnstile-response'] = 'dev-bypass';
            }
            
            // Hide previous messages
            document.getElementById('formSuccess').style.display = 'none';
            document.getElementById('formErrors').style.display = 'none';

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';

            // Use fetch to send data to your AWS API
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
                    // On success, call your helper function
                    showFormSuccess(data.message || "Message was sent!");
                } else {
                    // On failure, call your helper function
                    // The API returns an errors array, so use that or fallback to a single error
                    showFormErrors(data.errors || [data.message || "An error occurred. Please try again."]);
                }
            })
            .catch(() => {
                // On network error, call your helper function
                showFormErrors(["A network error occurred. Please check your connection."]);
            })
            .finally(() => {
                // Re-enable button and reset text
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                
                if (typeof turnstile !== 'undefined') {
                    turnstile.reset();
                }
            });
        });
    }
});