/**
 * Swedish Market Error Tracking and Alerting System
 * Tracks JavaScript errors, network failures, and site issues specific to Swedish users
 */

class SwedishErrorTracker {
    constructor() {
        this.errors = [];
        this.networkErrors = [];
        this.userAgent = this.getUserAgent();
        this.sessionId = this.generateSessionId();
        this.errorThresholds = {
            criticalErrorsPerMinute: 5,
            networkFailureRate: 0.1, // 10%
            jsErrorRate: 0.05 // 5%
        };
        
        this.initializeErrorTracking();
        this.initializeNetworkMonitoring();
        this.setupPeriodicReporting();
    }

    generateSessionId() {
        return 'se_err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserAgent() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        };
    }

    initializeErrorTracking() {
        // Global JavaScript error handler
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleJavaScriptError({
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                stack: event.reason?.stack
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError({
                    type: 'resource_error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);

        // Console error override
        this.overrideConsoleError();
    }

    overrideConsoleError() {
        const originalError = console.error;
        console.error = (...args) => {
            this.handleConsoleError(args);
            originalError.apply(console, args);
        };
    }

    handleJavaScriptError(errorData) {
        const error = {
            ...errorData,
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            severity: this.calculateSeverity(errorData),
            context: this.getErrorContext()
        };

        this.errors.push(error);
        this.evaluateErrorThresholds();
        
        // Store error immediately for critical errors
        if (error.severity === 'critical') {
            this.sendCriticalAlert(error);
        }
        
        this.storeError(error);
        
        console.warn('🇸🇪 Swedish Error Tracked:', error);
    }

    handleResourceError(errorData) {
        const error = {
            ...errorData,
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            severity: 'medium',
            context: this.getErrorContext()
        };

        this.errors.push(error);
        this.storeError(error);
        
        console.warn('🇸🇪 Swedish Resource Error:', error);
    }

    handleConsoleError(args) {
        const error = {
            type: 'console_error',
            message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '),
            args: args,
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            severity: 'low',
            context: this.getErrorContext()
        };

        this.errors.push(error);
        this.storeError(error);
    }

    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    calculateSeverity(errorData) {
        // Critical errors that break core functionality
        const criticalPatterns = [
            /cannot read property/i,
            /undefined is not a function/i,
            /network error/i,
            /failed to fetch/i,
            /script error/i
        ];

        // Medium severity errors
        const mediumPatterns = [
            /warning/i,
            /deprecated/i,
            /validation/i
        ];

        const message = errorData.message || '';
        
        if (criticalPatterns.some(pattern => pattern.test(message))) {
            return 'critical';
        }
        
        if (mediumPatterns.some(pattern => pattern.test(message))) {
            return 'medium';
        }
        
        return 'low';
    }

    getErrorContext() {
        return {
            url: window.location.href,
            timestamp: Date.now(),
            scrollPosition: {
                x: window.pageXOffset,
                y: window.pageYOffset
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            documentReady: document.readyState,
            activeElement: document.activeElement?.tagName || null,
            localStorage: this.getLocalStorageInfo(),
            sessionStorage: this.getSessionStorageInfo()
        };
    }

    getLocalStorageInfo() {
        try {
            return {
                available: typeof Storage !== 'undefined',
                itemCount: localStorage.length,
                approximateSize: JSON.stringify(localStorage).length
            };
        } catch {
            return { available: false, error: 'Access denied' };
        }
    }

    getSessionStorageInfo() {
        try {
            return {
                available: typeof Storage !== 'undefined',
                itemCount: sessionStorage.length,
                approximateSize: JSON.stringify(sessionStorage).length
            };
        } catch {
            return { available: false, error: 'Access denied' };
        }
    }

    initializeNetworkMonitoring() {
        // Monitor fetch requests
        this.monitorFetchRequests();
        
        // Monitor XMLHttpRequest
        this.monitorXHRRequests();
        
        // Monitor connection status
        this.monitorConnectionStatus();
    }

    monitorFetchRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = Date.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                
                const networkEvent = {
                    type: 'fetch_request',
                    url: url,
                    method: args[1]?.method || 'GET',
                    status: response.status,
                    ok: response.ok,
                    duration: Date.now() - startTime,
                    timestamp: new Date().toISOString(),
                    sessionId: this.sessionId
                };
                
                if (!response.ok) {
                    this.handleNetworkError(networkEvent);
                } else {
                    this.recordNetworkSuccess(networkEvent);
                }
                
                return response;
            } catch (error) {
                const networkEvent = {
                    type: 'fetch_error',
                    url: url,
                    method: args[1]?.method || 'GET',
                    error: error.message,
                    duration: Date.now() - startTime,
                    timestamp: new Date().toISOString(),
                    sessionId: this.sessionId
                };
                
                this.handleNetworkError(networkEvent);
                throw error;
            }
        };
    }

    monitorXHRRequests() {
        const originalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const startTime = Date.now();
            
            xhr.addEventListener('loadend', () => {
                const networkEvent = {
                    type: 'xhr_request',
                    url: xhr.responseURL,
                    method: xhr.method || 'GET',
                    status: xhr.status,
                    ok: xhr.status >= 200 && xhr.status < 300,
                    duration: Date.now() - startTime,
                    timestamp: new Date().toISOString(),
                    sessionId: this.sessionId
                };
                
                if (!networkEvent.ok) {
                    this.handleNetworkError(networkEvent);
                } else {
                    this.recordNetworkSuccess(networkEvent);
                }
            });
            
            return xhr;
        };
    }

    monitorConnectionStatus() {
        window.addEventListener('online', () => {
            this.recordNetworkEvent({
                type: 'connection_restored',
                message: 'Internet connection restored',
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('offline', () => {
            this.handleNetworkError({
                type: 'connection_lost',
                message: 'Internet connection lost',
                timestamp: new Date().toISOString()
            });
        });
    }

    handleNetworkError(networkEvent) {
        this.networkErrors.push(networkEvent);
        
        // Check if this is a critical network failure
        if (this.isCriticalNetworkError(networkEvent)) {
            this.sendNetworkAlert(networkEvent);
        }
        
        this.storeNetworkError(networkEvent);
        console.warn('🇸🇪 Swedish Network Error:', networkEvent);
    }

    recordNetworkSuccess(networkEvent) {
        // Store successful requests for rate calculation
        this.storeNetworkEvent(networkEvent);
    }

    recordNetworkEvent(event) {
        console.log('🇸🇪 Swedish Network Event:', event);
        this.storeNetworkEvent(event);
    }

    isCriticalNetworkError(networkEvent) {
        // Critical network errors
        const criticalStatuses = [500, 502, 503, 504];
        const criticalTypes = ['connection_lost', 'fetch_error'];
        
        return criticalStatuses.includes(networkEvent.status) || 
               criticalTypes.includes(networkEvent.type);
    }

    evaluateErrorThresholds() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Count critical errors in the last minute
        const recentCriticalErrors = this.errors.filter(error => 
            error.severity === 'critical' && 
            new Date(error.timestamp).getTime() > oneMinuteAgo
        );
        
        if (recentCriticalErrors.length >= this.errorThresholds.criticalErrorsPerMinute) {
            this.sendThresholdAlert('critical_error_threshold', {
                count: recentCriticalErrors.length,
                threshold: this.errorThresholds.criticalErrorsPerMinute,
                timeWindow: '1 minute',
                errors: recentCriticalErrors
            });
        }
    }

    async sendCriticalAlert(error) {
        const alert = {
            type: 'critical_error',
            error: error,
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            timestamp: new Date().toISOString(),
            severity: 'critical'
        };
        
        console.error('🚨 CRITICAL SWEDISH ERROR ALERT:', alert);
        this.storeAlert(alert);
    }

    async sendNetworkAlert(networkEvent) {
        const alert = {
            type: 'network_failure',
            networkEvent: networkEvent,
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            timestamp: new Date().toISOString(),
            severity: 'high'
        };
        
        console.error('🚨 SWEDISH NETWORK ALERT:', alert);
        this.storeAlert(alert);
    }

    async sendThresholdAlert(type, data) {
        const alert = {
            type: type,
            data: data,
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            timestamp: new Date().toISOString(),
            severity: 'high'
        };
        
        console.error('🚨 SWEDISH THRESHOLD ALERT:', alert);
        this.storeAlert(alert);
    }

    storeError(error) {
        const errors = this.getStoredErrors();
        errors.unshift(error);
        
        if (errors.length > 200) {
            errors.splice(200);
        }
        
        localStorage.setItem('swedish_errors', JSON.stringify(errors));
    }

    storeNetworkError(networkEvent) {
        const networkErrors = this.getStoredNetworkErrors();
        networkErrors.unshift(networkEvent);
        
        if (networkErrors.length > 100) {
            networkErrors.splice(100);
        }
        
        localStorage.setItem('swedish_network_errors', JSON.stringify(networkErrors));
    }

    storeNetworkEvent(networkEvent) {
        const networkEvents = this.getStoredNetworkEvents();
        networkEvents.unshift(networkEvent);
        
        if (networkEvents.length > 500) {
            networkEvents.splice(500);
        }
        
        localStorage.setItem('swedish_network_events', JSON.stringify(networkEvents));
    }

    storeAlert(alert) {
        const alerts = this.getStoredAlerts();
        alerts.unshift(alert);
        
        if (alerts.length > 50) {
            alerts.splice(50);
        }
        
        localStorage.setItem('swedish_error_alerts', JSON.stringify(alerts));
    }

    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('swedish_errors') || '[]');
        } catch {
            return [];
        }
    }

    getStoredNetworkErrors() {
        try {
            return JSON.parse(localStorage.getItem('swedish_network_errors') || '[]');
        } catch {
            return [];
        }
    }

    getStoredNetworkEvents() {
        try {
            return JSON.parse(localStorage.getItem('swedish_network_events') || '[]');
        } catch {
            return [];
        }
    }

    getStoredAlerts() {
        try {
            return JSON.parse(localStorage.getItem('swedish_error_alerts') || '[]');
        } catch {
            return [];
        }
    }

    setupPeriodicReporting() {
        // Send error report every 5 minutes
        setInterval(() => {
            this.generateErrorReport();
        }, 300000);
        
        // Send report on page unload
        window.addEventListener('beforeunload', () => {
            this.generateErrorReport();
        });
    }

    generateErrorReport() {
        const report = {
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            timestamp: new Date().toISOString(),
            summary: {
                totalErrors: this.errors.length,
                criticalErrors: this.errors.filter(e => e.severity === 'critical').length,
                networkErrors: this.networkErrors.length,
                errorRate: this.calculateErrorRate(),
                networkFailureRate: this.calculateNetworkFailureRate()
            },
            recentErrors: this.errors.slice(0, 10),
            recentNetworkErrors: this.networkErrors.slice(0, 10),
            alerts: this.getStoredAlerts().slice(0, 5)
        };
        
        console.log('🇸🇪 Swedish Error Report Generated:', report);
        this.storeErrorReport(report);
        
        return report;
    }

    calculateErrorRate() {
        const totalPageViews = 1; // Simplified - in production, track actual page views
        return this.errors.length / totalPageViews;
    }

    calculateNetworkFailureRate() {
        const totalNetworkEvents = this.getStoredNetworkEvents().length;
        const failedNetworkEvents = this.networkErrors.length;
        
        if (totalNetworkEvents === 0) return 0;
        return failedNetworkEvents / totalNetworkEvents;
    }

    storeErrorReport(report) {
        const reports = this.getStoredErrorReports();
        reports.unshift(report);
        
        if (reports.length > 20) {
            reports.splice(20);
        }
        
        localStorage.setItem('swedish_error_reports', JSON.stringify(reports));
    }

    getStoredErrorReports() {
        try {
            return JSON.parse(localStorage.getItem('swedish_error_reports') || '[]');
        } catch {
            return [];
        }
    }

    getErrorSummary() {
        return {
            sessionId: this.sessionId,
            totalErrors: this.errors.length,
            errorsBySeverity: {
                critical: this.errors.filter(e => e.severity === 'critical').length,
                medium: this.errors.filter(e => e.severity === 'medium').length,
                low: this.errors.filter(e => e.severity === 'low').length
            },
            errorsByType: this.groupErrorsByType(),
            networkErrors: this.networkErrors.length,
            alerts: this.getStoredAlerts().length,
            lastReport: new Date().toISOString()
        };
    }

    groupErrorsByType() {
        const grouped = {};
        this.errors.forEach(error => {
            grouped[error.type] = (grouped[error.type] || 0) + 1;
        });
        return grouped;
    }
}

// Auto-initialize for Swedish domain
if (typeof window !== 'undefined' && window.location.hostname === 'verkflode.se') {
    window.swedishErrorTracker = new SwedishErrorTracker();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishErrorTracker;
} else if (typeof window !== 'undefined') {
    window.SwedishErrorTracker = SwedishErrorTracker;
}