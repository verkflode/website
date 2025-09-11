// Swedish Content Performance Optimization
// Optimizes loading and rendering of Swedish text content

(function() {
    'use strict';

    // Swedish content performance metrics
    const SwedishPerformance = {
        init: function() {
            this.optimizeSwedishFonts();
            this.preloadCriticalContent();
            this.optimizeTextRendering();
            this.handleSwedishCharacterEncoding();
            this.setupResponsiveImageLoading();
        },

        // Optimize font loading for Swedish characters
        optimizeSwedishFonts: function() {
            // Preload Inter font with Swedish character subset
            const fontLink = document.createElement('link');
            fontLink.rel = 'preload';
            fontLink.as = 'font';
            fontLink.type = 'font/woff2';
            fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
            fontLink.crossOrigin = 'anonymous';
            document.head.appendChild(fontLink);

            // Add font-display: swap for better performance
            const style = document.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: 'Inter';
                    font-display: swap;
                    src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
                    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+00C5, U+00E5, U+00C4, U+00E4, U+00D6, U+00F6;
                }
            `;
            document.head.appendChild(style);
        },

        // Preload critical Swedish content
        preloadCriticalContent: function() {
            const criticalImages = [
                'images/verkflode-Lt.png',
                'images/verkflode-Dt.png',
                'images/favicon.png'
            ];

            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        },

        // Optimize text rendering for Swedish characters
        optimizeTextRendering: function() {
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label');
            
            textElements.forEach(element => {
                // Enable optimized rendering for Swedish text
                element.style.textRendering = 'optimizeLegibility';
                element.style.fontKerning = 'normal';
                
                // Handle Swedish character-specific optimizations
                if (element.textContent && /[åäöÅÄÖ]/.test(element.textContent)) {
                    element.setAttribute('lang', 'sv');
                    element.style.fontVariantLigatures = 'common-ligatures';
                }
            });
        },

        // Handle Swedish character encoding
        handleSwedishCharacterEncoding: function() {
            // Verify UTF-8 encoding
            if (document.characterSet !== 'UTF-8') {
                console.warn('Document encoding is not UTF-8. Swedish characters may not display correctly.');
            }

            // Test Swedish character rendering
            const testElement = document.createElement('span');
            testElement.textContent = 'åäöÅÄÖ';
            testElement.style.position = 'absolute';
            testElement.style.visibility = 'hidden';
            document.body.appendChild(testElement);

            // Check if Swedish characters render correctly
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(testElement);
                if (computedStyle.fontFamily.includes('Inter') || computedStyle.fontFamily.includes('system')) {
                    console.log('Swedish characters rendering correctly');
                } else {
                    console.warn('Swedish characters may not be rendering with optimal font');
                }
                document.body.removeChild(testElement);
            }, 100);
        },

        // Setup responsive image loading
        setupResponsiveImageLoading: function() {
            // Use Intersection Observer for lazy loading
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                });

                // Observe all images with data-src
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },

        // Monitor performance metrics
        monitorPerformance: function() {
            if ('PerformanceObserver' in window) {
                // Monitor Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    if (lastEntry.startTime > 2500) {
                        console.warn('LCP is slower than recommended for Swedish content');
                    }
                });

                try {
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                    // Fallback for browsers that don't support LCP
                    console.log('LCP monitoring not supported');
                }

                // Monitor Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    
                    if (clsValue > 0.1) {
                        console.warn('CLS is higher than recommended for Swedish content');
                    }
                });

                try {
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                } catch (e) {
                    console.log('CLS monitoring not supported');
                }
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            SwedishPerformance.init();
            SwedishPerformance.monitorPerformance();
        });
    } else {
        SwedishPerformance.init();
        SwedishPerformance.monitorPerformance();
    }

    // Export for external use
    window.SwedishPerformance = SwedishPerformance;

})();