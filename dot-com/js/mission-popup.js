/**
 * Mission Signup Popup
 * Handles "Join Our Mission" popup form with Mailgun integration
 */

class MissionPopup {
    constructor() {
        this.isOpen = false;
        this.apiEndpoint = 'https://YOUR_API_ID.execute-api.eu-north-1.amazonaws.com/prod/submit'; // Update with actual endpoint
        this.init();
    }

    init() {
        this.createPopupHTML();
        this.bindEvents();
    }

    createPopupHTML() {
        const popupHTML = `
            <div id="missionPopup" class="mission-popup-overlay" role="dialog" aria-labelledby="mission-popup-title" aria-hidden="true">
                <div class="mission-popup-container">
                    <div class="mission-popup-header">
                        <h2 id="mission-popup-title">Join Our Mission</h2>
                        <button class="mission-popup-close" aria-label="Close popup">&times;</button>
                    </div>
                    
                    <div class="mission-popup-content">
                        <p class="mission-popup-description">
                            Ready to be part of the solution? Help us build the future of food waste elimination and join our mission to create a sustainable food industry.
                        </p>
                        
                        <form id="missionForm" class="mission-form">
                            <div class="form-group">
                                <label for="missionName">Name *</label>
                                <input type="text" id="missionName" name="name" required aria-describedby="name-error">
                                <span id="name-error" class="error-message" role="alert"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="missionEmail">Email *</label>
                                <input type="email" id="missionEmail" name="email" required aria-describedby="email-error">
                                <span id="email-error" class="error-message" role="alert"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="missionCompany">Company</label>
                                <input type="text" id="missionCompany" name="company" placeholder="Optional">
                            </div>
                            
                            <div class="form-group">
                                <label for="missionMessage">How would you like to contribute? *</label>
                                <textarea id="missionMessage" name="message" required rows="4" 
                                    placeholder="Tell us about your background and how you'd like to contribute when we launch..."
                                    aria-describedby="message-error"></textarea>
                                <span id="message-error" class="error-message" role="alert"></span>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="mission-submit-btn" id="missionSubmitBtn">
                                    <span class="btn-text">Join the Mission</span>
                                    <span class="btn-loading" style="display: none;">Sending...</span>
                                </button>
                            </div>
                        </form>
                        
                        <div id="missionFormSuccess" class="success-message" style="display: none;">
                            <h3>Welcome to the Mission! 🌱</h3>
                            <p>Thank you for your interest in joining our mission. We'll keep you updated on our progress and reach out when we're ready for early contributors.</p>
                        </div>
                        
                        <div id="missionFormError" class="error-message-container" style="display: none;">
                            <h3>Oops! Something went wrong</h3>
                            <p>We couldn't process your request right now. Please try again or contact us directly at <a href="mailto:hej@verkflode.com">hej@verkflode.com</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    bindEvents() {
        // Open popup buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.join-mission-btn, [href="#mission-signup"]')) {
                e.preventDefault();
                this.openPopup();
            }
        });

        // Close popup events
        const popup = document.getElementById('missionPopup');
        const closeBtn = popup.querySelector('.mission-popup-close');
        
        closeBtn.addEventListener('click', () => this.closePopup());
        
        // Close on overlay click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closePopup();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePopup();
            }
        });

        // Form submission
        const form = document.getElementById('missionForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openPopup() {
        const popup = document.getElementById('missionPopup');
        popup.style.display = 'flex';
        popup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('missionName').focus();
        }, 100);
        
        // Track popup open event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mission_popup_opened', {
                event_category: 'engagement',
                event_label: 'mission_signup'
            });
        }
    }

    closePopup() {
        const popup = document.getElementById('missionPopup');
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.isOpen = false;
        
        // Reset form
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('missionForm');
        const successMsg = document.getElementById('missionFormSuccess');
        const errorMsg = document.getElementById('missionFormError');
        
        form.reset();
        form.style.display = 'block';
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        
        // Clear error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Reset button state
        const submitBtn = document.getElementById('missionSubmitBtn');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = document.getElementById('missionSubmitBtn');
        const formData = new FormData(form);
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline';
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company') || '',
                    message: `MISSION SIGNUP: ${formData.get('message')}`,
                    type: 'mission_signup'
                })
            });
            
            if (response.ok) {
                this.showSuccess();
                
                // Track successful submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'mission_signup_success', {
                        event_category: 'conversion',
                        event_label: 'mission_signup'
                    });
                }
            } else {
                throw new Error('Network response was not ok');
            }
            
        } catch (error) {
            console.error('Mission signup error:', error);
            this.showError();
            
            // Track error
            if (typeof gtag !== 'undefined') {
                gtag('event', 'mission_signup_error', {
                    event_category: 'error',
                    event_label: 'mission_signup'
                });
            }
        }
    }

    validateForm(formData) {
        let isValid = true;
        
        // Name validation
        const name = formData.get('name').trim();
        if (!name) {
            document.getElementById('name-error').textContent = 'Name is required';
            isValid = false;
        }
        
        // Email validation
        const email = formData.get('email').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            document.getElementById('email-error').textContent = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Message validation
        const message = formData.get('message').trim();
        if (!message) {
            document.getElementById('message-error').textContent = 'Please tell us how you\'d like to contribute';
            isValid = false;
        } else if (message.length < 10) {
            document.getElementById('message-error').textContent = 'Please provide more details (at least 10 characters)';
            isValid = false;
        }
        
        return isValid;
    }

    showSuccess() {
        const form = document.getElementById('missionForm');
        const successMsg = document.getElementById('missionFormSuccess');
        
        form.style.display = 'none';
        successMsg.style.display = 'block';
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            this.closePopup();
        }, 3000);
    }

    showError() {
        const form = document.getElementById('missionForm');
        const errorMsg = document.getElementById('missionFormError');
        const submitBtn = document.getElementById('missionSubmitBtn');
        
        form.style.display = 'none';
        errorMsg.style.display = 'block';
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MissionPopup();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionPopup;
}