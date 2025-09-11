// Verkflöde Demo Request Tracking
// Simple, privacy-focused tracking for business-critical conversion events only

class VerkflodeTracker {
    constructor() {
        this.events = [];
        
        // Initialize essential tracking only
        this.init();
    }

    init() {
        // Only track business-critical demo requests - no behavioral tracking
        this.setupDemoRequestTracking();
        
        // Track basic page views for conversion rate calculation
        this.trackEvent('page_view', {
            timestamp: Date.now()
        });
    }

    // Track demo requests and their sources
    setupDemoRequestTracking() {
        // Track all demo request buttons
        const demoButtons = document.querySelectorAll('a[href="#contact"], .cta-demo-button, button[type="submit"]');
        
        demoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.textContent.trim();
                const buttonLocation = this.getButtonLocation(button);
                
                this.trackEvent('demo_request_click', {
                    button_text: buttonText,
                    button_location: buttonLocation,
                    timestamp: Date.now()
                });
            });
        });

        // Track form submissions specifically
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.trackEvent('demo_form_submit', {
                    timestamp: Date.now()
                });
            });
        }
    }

    // Helper methods
    getButtonLocation(button) {
        // Determine which section the button is in
        const section = button.closest('section');
        if (section) {
            const heading = section.querySelector('h1, h2, h3');
            if (heading) {
                return heading.textContent.trim();
            }
        }
        return 'unknown';
    }

    // Core tracking method - simplified for demo requests only
    trackEvent(eventType, data) {
        const event = {
            type: eventType,
            data: data,
            url: window.location.href,
            timestamp: Date.now()
        };
        
        this.events.push(event);
        this.sendEvent(event);
        
        // Log for development/debugging
        console.log('Verkflöde Demo Tracking:', eventType, data);
    }

    // Send individual event
    sendEvent(event) {
        // Store in localStorage for analysis
        const storageKey = 'verkflode_tracking_events';
        const existingEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingEvents.push(event);
        
        // Keep only last 100 events to prevent storage overflow
        if (existingEvents.length > 100) {
            existingEvents.splice(0, existingEvents.length - 100);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingEvents));
    }

    // Public method to get current metrics - simplified
    getMetrics() {
        const demoRequests = this.events.filter(e => 
            e.type === 'demo_request_click' || e.type === 'demo_form_submit'
        ).length;
        
        const pageViews = this.events.filter(e => e.type === 'page_view').length;
        
        return {
            totalEvents: this.events.length,
            demoRequests: demoRequests,
            pageViews: pageViews,
            conversionRate: pageViews > 0 ? Math.round((demoRequests / pageViews) * 100) : 0
        };
    }

    // Public method to export all tracking data
    exportData() {
        return {
            events: this.events,
            metrics: this.getMetrics(),
            timestamp: Date.now()
        };
    }
}

// Initialize tracking when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not already done
    if (!window.verkflodeTracker) {
        window.verkflodeTracker = new VerkflodeTracker();
        
        // Expose metrics to console for debugging
        window.getTrackingMetrics = () => window.verkflodeTracker.getMetrics();
        window.exportTrackingData = () => window.verkflodeTracker.exportData();
        
        console.log('Verkflöde demo tracking initialized. Use getTrackingMetrics() to view conversion data.');
    }
});