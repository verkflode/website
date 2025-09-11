/**
 * Swedish Market Monitoring Integration
 * Simple integration script to add Swedish monitoring to verkflode.se
 * Add this script to the Swedish website to enable comprehensive monitoring
 */

(function() {
    'use strict';
    
    // Only run on Swedish domain
    if (window.location.hostname !== 'verkflode.se') {
        return;
    }
    
    console.log('🇸🇪 Loading Swedish market monitoring...');
    
    // Configuration for monitoring integration
    const MONITORING_CONFIG = {
        baseUrl: '/admin/monitoring/',
        autoStart: true,
        enableDashboard: false, // Set to true to enable dashboard access
        debugMode: false
    };
    
    /**
     * Load monitoring initialization script
     */
    function loadMonitoringSystem() {
        const script = document.createElement('script');
        script.src = MONITORING_CONFIG.baseUrl + 'init-monitoring.js';
        script.async = true;
        
        script.onload = function() {
            console.log('✅ Swedish monitoring system loaded successfully');
            
            // Listen for monitoring ready event
            window.addEventListener('swedishMonitoringReady', function(event) {
                console.log('🎉 Swedish monitoring is now active');
                
                if (MONITORING_CONFIG.debugMode) {
                    console.log('Monitoring systems:', event.detail.systems);
                }
                
                // Optional: Add monitoring status indicator to page
                addMonitoringStatusIndicator();
            });
        };
        
        script.onerror = function() {
            console.warn('⚠️ Failed to load Swedish monitoring system');
            
            // Fallback: Basic error tracking
            initializeFallbackErrorTracking();
        };
        
        document.head.appendChild(script);
    }
    
    /**
     * Add visual monitoring status indicator (optional)
     */
    function addMonitoringStatusIndicator() {
        if (!MONITORING_CONFIG.enableDashboard) {
            return;
        }
        
        const indicator = document.createElement('div');
        indicator.id = 'swedish-monitoring-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 12px;
            height: 12px;
            background: #48bb78;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.3);
            z-index: 10000;
            cursor: pointer;
            title: 'Swedish Monitoring Active';
        `;
        
        indicator.addEventListener('click', function() {
            openMonitoringDashboard();
        });
        
        document.body.appendChild(indicator);
        
        // Animate the indicator
        let pulse = true;
        setInterval(() => {
            indicator.style.opacity = pulse ? '0.5' : '1';
            pulse = !pulse;
        }, 1000);
    }
    
    /**
     * Open monitoring dashboard in new window
     */
    function openMonitoringDashboard() {
        const dashboardUrl = '/admin/swedish-monitoring-dashboard.html';
        window.open(dashboardUrl, 'SwedishMonitoringDashboard', 
            'width=1200,height=800,scrollbars=yes,resizable=yes');
    }
    
    /**
     * Fallback error tracking if main system fails
     */
    function initializeFallbackErrorTracking() {
        console.log('🆘 Initializing fallback error tracking...');
        
        // Basic error handler
        window.addEventListener('error', function(event) {
            const errorData = {
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Store in localStorage as fallback
            try {
                const errors = JSON.parse(localStorage.getItem('swedish_fallback_errors') || '[]');
                errors.unshift(errorData);
                
                if (errors.length > 50) {
                    errors.splice(50);
                }
                
                localStorage.setItem('swedish_fallback_errors', JSON.stringify(errors));
                console.warn('🇸🇪 Fallback error logged:', errorData);
            } catch (e) {
                console.error('Failed to store fallback error:', e);
            }
        });
        
        // Basic unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
            const errorData = {
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            try {
                const errors = JSON.parse(localStorage.getItem('swedish_fallback_errors') || '[]');
                errors.unshift(errorData);
                
                if (errors.length > 50) {
                    errors.splice(50);
                }
                
                localStorage.setItem('swedish_fallback_errors', JSON.stringify(errors));
                console.warn('🇸🇪 Fallback promise rejection logged:', errorData);
            } catch (e) {
                console.error('Failed to store fallback error:', e);
            }
        });
    }
    
    /**
     * Check if monitoring should be enabled
     */
    function shouldEnableMonitoring() {
        // Don't enable in development mode unless explicitly requested
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return MONITORING_CONFIG.debugMode;
        }
        
        // Don't enable if user has opted out
        if (localStorage.getItem('swedish_monitoring_disabled') === 'true') {
            return false;
        }
        
        // Enable for production Swedish site
        return true;
    }
    
    /**
     * Initialize monitoring integration
     */
    function initialize() {
        if (!shouldEnableMonitoring()) {
            console.log('🇸🇪 Swedish monitoring disabled');
            return;
        }
        
        if (MONITORING_CONFIG.autoStart) {
            loadMonitoringSystem();
        }
        
        // Expose manual control functions
        window.SwedishMonitoringIntegration = {
            start: loadMonitoringSystem,
            openDashboard: openMonitoringDashboard,
            disable: function() {
                localStorage.setItem('swedish_monitoring_disabled', 'true');
                console.log('🇸🇪 Swedish monitoring disabled');
            },
            enable: function() {
                localStorage.removeItem('swedish_monitoring_disabled');
                loadMonitoringSystem();
                console.log('🇸🇪 Swedish monitoring enabled');
            },
            getStatus: function() {
                return {
                    enabled: shouldEnableMonitoring(),
                    loaded: !!window.SwedishMonitoring,
                    initialized: window.SwedishMonitoring?.initialized || false
                };
            }
        };
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Add CSS for monitoring elements
    const style = document.createElement('style');
    style.textContent = `
        #swedish-monitoring-indicator {
            transition: opacity 0.3s ease;
        }
        
        #swedish-monitoring-indicator:hover {
            transform: scale(1.2);
            box-shadow: 0 0 0 5px rgba(72, 187, 120, 0.5);
        }
    `;
    document.head.appendChild(style);
    
})();