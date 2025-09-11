/**
 * Swedish Market Performance Monitoring System
 * Monitors performance metrics specifically for Swedish market users
 */

class SwedishPerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTimes: [],
            coreWebVitals: {
                lcp: [], // Largest Contentful Paint
                fid: [], // First Input Delay
                cls: []  // Cumulative Layout Shift
            },
            userEngagement: {
                bounceRate: 0,
                timeOnPage: [],
                scrollDepth: [],
                conversionEvents: []
            },
            technicalMetrics: {
                domContentLoaded: [],
                firstPaint: [],
                firstContentfulPaint: [],
                resourceLoadTimes: {}
            }
        };
        
        this.swedishUserAgent = this.detectSwedishUser();
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.initializePerformanceObservers();
        this.trackUserEngagement();
    }

    detectSwedishUser() {
        // Detect Swedish users based on various factors
        const factors = {
            language: navigator.language?.startsWith('sv'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone?.includes('Stockholm'),
            domain: window.location.hostname === 'verkflode.se',
            referrer: document.referrer?.includes('.se')
        };
        
        return factors;
    }

    generateSessionId() {
        return 'se_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initializePerformanceObservers() {
        // Core Web Vitals monitoring
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        
        // Navigation timing
        this.observeNavigationTiming();
        
        // Resource timing
        this.observeResourceTiming();
    }

    observeLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.coreWebVitals.lcp.push({
                    value: lastEntry.startTime,
                    timestamp: Date.now(),
                    element: lastEntry.element?.tagName || 'unknown'
                });
                
                this.evaluateWebVital('lcp', lastEntry.startTime);
            });
            
            try {
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observation not supported');
            }
        }
    }

    observeFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.coreWebVitals.fid.push({
                        value: entry.processingStart - entry.startTime,
                        timestamp: Date.now(),
                        eventType: entry.name
                    });
                    
                    this.evaluateWebVital('fid', entry.processingStart - entry.startTime);
                });
            });
            
            try {
                observer.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observation not supported');
            }
        }
    }

    observeCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.coreWebVitals.cls.push({
                    value: clsValue,
                    timestamp: Date.now()
                });
                
                this.evaluateWebVital('cls', clsValue);
            });
            
            try {
                observer.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observation not supported');
            }
        }
    }

    observeNavigationTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.metrics.technicalMetrics.domContentLoaded.push({
                        value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        timestamp: Date.now()
                    });
                    
                    this.metrics.pageLoadTimes.push({
                        value: navigation.loadEventEnd - navigation.fetchStart,
                        timestamp: Date.now(),
                        type: 'full_load'
                    });
                }
                
                // Paint timing
                const paintEntries = performance.getEntriesByType('paint');
                paintEntries.forEach(entry => {
                    if (entry.name === 'first-paint') {
                        this.metrics.technicalMetrics.firstPaint.push({
                            value: entry.startTime,
                            timestamp: Date.now()
                        });
                    } else if (entry.name === 'first-contentful-paint') {
                        this.metrics.technicalMetrics.firstContentfulPaint.push({
                            value: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                });
            }, 0);
        });
    }

    observeResourceTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const resourceType = this.getResourceType(entry.name);
                    
                    if (!this.metrics.technicalMetrics.resourceLoadTimes[resourceType]) {
                        this.metrics.technicalMetrics.resourceLoadTimes[resourceType] = [];
                    }
                    
                    this.metrics.technicalMetrics.resourceLoadTimes[resourceType].push({
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize || 0,
                        timestamp: Date.now()
                    });
                });
            });
            
            try {
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Resource timing observation not supported');
            }
        }
    }

    getResourceType(url) {
        if (url.includes('.css')) return 'css';
        if (url.includes('.js')) return 'javascript';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
        if (url.includes('.woff') || url.includes('.ttf')) return 'font';
        return 'other';
    }

    evaluateWebVital(metric, value) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 }
        };
        
        const threshold = thresholds[metric];
        let rating = 'good';
        
        if (value > threshold.poor) {
            rating = 'poor';
        } else if (value > threshold.good) {
            rating = 'needs-improvement';
        }
        
        if (rating === 'poor') {
            this.sendPerformanceAlert(metric, value, rating);
        }
        
        return rating;
    }

    trackUserEngagement() {
        // Track time on page
        this.trackTimeOnPage();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track conversion events
        this.trackConversionEvents();
        
        // Track bounce rate
        this.trackBounceRate();
    }

    trackTimeOnPage() {
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.startTime;
            this.metrics.userEngagement.timeOnPage.push({
                value: timeOnPage,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
            
            this.sendMetricsToStorage();
        });
    }

    trackScrollDepth() {
        let maxScrollDepth = 0;
        
        const trackScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
            }
        };
        
        window.addEventListener('scroll', trackScroll, { passive: true });
        
        window.addEventListener('beforeunload', () => {
            this.metrics.userEngagement.scrollDepth.push({
                value: maxScrollDepth,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        });
    }

    trackConversionEvents() {
        // Track demo requests
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="demo-request"]') || 
                e.target.closest('[data-action="demo-request"]')) {
                this.recordConversionEvent('demo_request');
            }
            
            if (e.target.matches('[data-action="contact-form"]') || 
                e.target.closest('[data-action="contact-form"]')) {
                this.recordConversionEvent('contact_form');
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                this.recordConversionEvent('form_submission', {
                    formId: e.target.id || 'unknown',
                    formAction: e.target.action || 'unknown'
                });
            }
        });
    }

    recordConversionEvent(eventType, data = {}) {
        this.metrics.userEngagement.conversionEvents.push({
            type: eventType,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            data
        });
        
        // Send conversion event immediately for real-time tracking
        this.sendConversionEvent(eventType, data);
    }

    trackBounceRate() {
        let hasEngaged = false;
        
        const engagementEvents = ['click', 'scroll', 'keydown', 'mousemove'];
        
        const markEngagement = () => {
            if (!hasEngaged) {
                hasEngaged = true;
                engagementEvents.forEach(event => {
                    document.removeEventListener(event, markEngagement);
                });
            }
        };
        
        engagementEvents.forEach(event => {
            document.addEventListener(event, markEngagement, { once: true, passive: true });
        });
        
        window.addEventListener('beforeunload', () => {
            this.metrics.userEngagement.bounceRate = hasEngaged ? 0 : 1;
        });
    }

    async sendPerformanceAlert(metric, value, rating) {
        const alert = {
            type: 'performance_degradation',
            metric,
            value,
            rating,
            threshold: this.getThreshold(metric),
            userAgent: this.swedishUserAgent,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        console.warn(`🇸🇪 Swedish Performance Alert: ${metric} = ${value} (${rating})`);
        
        // Store alert
        this.storePerformanceAlert(alert);
    }

    getThreshold(metric) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 }
        };
        return thresholds[metric];
    }

    storePerformanceAlert(alert) {
        const alerts = this.getStoredPerformanceAlerts();
        alerts.unshift(alert);
        
        if (alerts.length > 50) {
            alerts.splice(50);
        }
        
        localStorage.setItem('swedish_performance_alerts', JSON.stringify(alerts));
    }

    getStoredPerformanceAlerts() {
        try {
            return JSON.parse(localStorage.getItem('swedish_performance_alerts') || '[]');
        } catch {
            return [];
        }
    }

    async sendConversionEvent(eventType, data) {
        const event = {
            type: eventType,
            data,
            userAgent: this.swedishUserAgent,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        console.log(`🇸🇪 Swedish Conversion Event: ${eventType}`, event);
        
        // In production, this would send to analytics service
        this.storeConversionEvent(event);
    }

    storeConversionEvent(event) {
        const events = this.getStoredConversionEvents();
        events.unshift(event);
        
        if (events.length > 100) {
            events.splice(100);
        }
        
        localStorage.setItem('swedish_conversion_events', JSON.stringify(events));
    }

    getStoredConversionEvents() {
        try {
            return JSON.parse(localStorage.getItem('swedish_conversion_events') || '[]');
        } catch {
            return [];
        }
    }

    sendMetricsToStorage() {
        const metricsSnapshot = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: this.swedishUserAgent,
            metrics: JSON.parse(JSON.stringify(this.metrics)),
            url: window.location.href
        };
        
        const history = this.getMetricsHistory();
        history.unshift(metricsSnapshot);
        
        if (history.length > 100) {
            history.splice(100);
        }
        
        localStorage.setItem('swedish_performance_metrics', JSON.stringify(history));
    }

    getMetricsHistory() {
        try {
            return JSON.parse(localStorage.getItem('swedish_performance_metrics') || '[]');
        } catch {
            return [];
        }
    }

    getPerformanceReport() {
        return {
            sessionId: this.sessionId,
            userAgent: this.swedishUserAgent,
            metrics: this.metrics,
            alerts: this.getStoredPerformanceAlerts(),
            conversionEvents: this.getStoredConversionEvents(),
            generatedAt: new Date().toISOString()
        };
    }
}

// Auto-initialize for Swedish domain
if (typeof window !== 'undefined' && window.location.hostname === 'verkflode.se') {
    window.swedishPerformanceMonitor = new SwedishPerformanceMonitor();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishPerformanceMonitor;
} else if (typeof window !== 'undefined') {
    window.SwedishPerformanceMonitor = SwedishPerformanceMonitor;
}