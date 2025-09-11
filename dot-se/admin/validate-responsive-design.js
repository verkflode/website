// Responsive Design Validation Script for Swedish Content
// Run this in browser console to validate responsive design implementation

(function() {
    'use strict';

    const ResponsiveValidator = {
        results: [],
        
        init: function() {
            console.log('🇸🇪 Starting Swedish Responsive Design Validation...\n');
            
            this.validateCharacterEncoding();
            this.validateViewportMeta();
            this.validateSwedishTextHandling();
            this.validateResponsiveBreakpoints();
            this.validateTouchTargets();
            this.validatePerformance();
            this.validateAccessibility();
            
            this.displayResults();
        },

        log: function(test, passed, message) {
            const status = passed ? '✅' : '❌';
            const result = `${status} ${test}: ${message}`;
            console.log(result);
            this.results.push({ test, passed, message });
        },

        validateCharacterEncoding: function() {
            console.log('\n📝 Character Encoding Tests:');
            
            // Check document encoding
            const isUTF8 = document.characterSet === 'UTF-8';
            this.log('UTF-8 Encoding', isUTF8, `Document charset: ${document.characterSet}`);
            
            // Check Swedish characters in content
            const hasSwedishChars = /[åäöÅÄÖ]/.test(document.body.textContent);
            this.log('Swedish Characters Present', hasSwedishChars, hasSwedishChars ? 'Swedish characters found in content' : 'No Swedish characters detected');
            
            // Check lang attribute
            const hasSwedishLang = document.documentElement.lang === 'sv';
            this.log('Swedish Language Attribute', hasSwedishLang, `Document lang: ${document.documentElement.lang}`);
        },

        validateViewportMeta: function() {
            console.log('\n📱 Viewport Meta Tests:');
            
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            const hasViewport = !!viewportMeta;
            this.log('Viewport Meta Tag', hasViewport, hasViewport ? `Content: ${viewportMeta.content}` : 'Missing viewport meta tag');
            
            if (hasViewport) {
                const hasDeviceWidth = viewportMeta.content.includes('width=device-width');
                const hasInitialScale = viewportMeta.content.includes('initial-scale=1');
                this.log('Device Width', hasDeviceWidth, hasDeviceWidth ? 'width=device-width present' : 'Missing width=device-width');
                this.log('Initial Scale', hasInitialScale, hasInitialScale ? 'initial-scale=1 present' : 'Missing initial-scale=1');
            }
        },

        validateSwedishTextHandling: function() {
            console.log('\n🔤 Swedish Text Handling Tests:');
            
            // Check for word-break and hyphens CSS
            const heroHeading = document.querySelector('.hero-heading, .hero-heading-narrow');
            if (heroHeading) {
                const styles = window.getComputedStyle(heroHeading);
                const hasWordBreak = styles.wordBreak === 'break-word';
                const hasHyphens = styles.hyphens === 'auto' || styles.webkitHyphens === 'auto';
                
                this.log('Hero Heading Word Break', hasWordBreak, `word-break: ${styles.wordBreak}`);
                this.log('Hero Heading Hyphens', hasHyphens, `hyphens: ${styles.hyphens || styles.webkitHyphens || 'none'}`);
            }
            
            // Check font rendering
            const testElement = document.createElement('span');
            testElement.textContent = 'åäöÅÄÖ';
            testElement.style.fontFamily = 'Inter, sans-serif';
            document.body.appendChild(testElement);
            
            const computedFont = window.getComputedStyle(testElement).fontFamily;
            const hasInterFont = computedFont.includes('Inter');
            this.log('Inter Font Loading', hasInterFont, `Font family: ${computedFont}`);
            
            document.body.removeChild(testElement);
        },

        validateResponsiveBreakpoints: function() {
            console.log('\n📐 Responsive Breakpoint Tests:');
            
            const viewport = window.innerWidth;
            let breakpoint = '';
            
            if (viewport <= 480) breakpoint = 'XS (≤480px)';
            else if (viewport <= 767) breakpoint = 'SM (≤767px)';
            else if (viewport <= 1023) breakpoint = 'MD (≤1023px)';
            else if (viewport <= 1279) breakpoint = 'LG (≤1279px)';
            else breakpoint = 'XL (>1279px)';
            
            this.log('Current Breakpoint', true, `${viewport}px - ${breakpoint}`);
            
            // Test CSS Grid support
            const supportsGrid = CSS.supports('display', 'grid');
            this.log('CSS Grid Support', supportsGrid, supportsGrid ? 'CSS Grid supported' : 'CSS Grid not supported');
            
            // Test CSS Clamp support
            const supportsClamp = CSS.supports('font-size', 'clamp(1rem, 2vw, 2rem)');
            this.log('CSS Clamp Support', supportsClamp, supportsClamp ? 'CSS Clamp supported' : 'CSS Clamp not supported');
            
            // Test hero stats layout on mobile
            if (viewport <= 767) {
                const heroStats = document.querySelector('.hero-stats');
                if (heroStats) {
                    const styles = window.getComputedStyle(heroStats);
                    const isFlexRow = styles.flexDirection === 'row';
                    this.log('Mobile Hero Stats Layout', isFlexRow, `flex-direction: ${styles.flexDirection}`);
                }
            }
        },

        validateTouchTargets: function() {
            console.log('\n👆 Touch Target Tests:');
            
            if (window.innerWidth <= 767) {
                const buttons = document.querySelectorAll('.btn, .nav-link, .lang-link');
                let minTouchTarget = true;
                let smallTargets = [];
                
                buttons.forEach(button => {
                    const rect = button.getBoundingClientRect();
                    const minSize = Math.min(rect.width, rect.height);
                    if (minSize < 44) {
                        minTouchTarget = false;
                        smallTargets.push(`${button.tagName}${button.className ? '.' + button.className.split(' ')[0] : ''}: ${Math.round(minSize)}px`);
                    }
                });
                
                this.log('Minimum Touch Targets', minTouchTarget, 
                    minTouchTarget ? 'All touch targets ≥44px' : `Small targets: ${smallTargets.join(', ')}`);
            } else {
                this.log('Touch Target Test', true, 'Skipped (desktop viewport)');
            }
        },

        validatePerformance: function() {
            console.log('\n⚡ Performance Tests:');
            
            // Check if performance optimization script loaded
            const hasSwedishPerf = typeof window.SwedishPerformance !== 'undefined';
            this.log('Swedish Performance Script', hasSwedishPerf, hasSwedishPerf ? 'SwedishPerformance loaded' : 'SwedishPerformance not found');
            
            // Check font-display: swap
            const fontFaces = Array.from(document.styleSheets).flatMap(sheet => {
                try {
                    return Array.from(sheet.cssRules || []);
                } catch (e) {
                    return [];
                }
            }).filter(rule => rule.type === CSSRule.FONT_FACE_RULE);
            
            const hasSwapFont = fontFaces.some(rule => rule.style.fontDisplay === 'swap');
            this.log('Font Display Swap', hasSwapFont, hasSwapFont ? 'font-display: swap found' : 'No font-display: swap detected');
            
            // Check image lazy loading
            const lazyImages = document.querySelectorAll('img[data-src]');
            this.log('Lazy Loading Images', lazyImages.length > 0, `${lazyImages.length} lazy-loaded images found`);
        },

        validateAccessibility: function() {
            console.log('\n♿ Accessibility Tests:');
            
            // Check skip link
            const skipLink = document.querySelector('.skip-to-content');
            this.log('Skip to Content Link', !!skipLink, skipLink ? 'Skip link present' : 'Skip link missing');
            
            // Check aria labels
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const hasAriaExpanded = mobileMenuBtn && mobileMenuBtn.hasAttribute('aria-expanded');
            this.log('Mobile Menu ARIA', hasAriaExpanded, hasAriaExpanded ? 'aria-expanded present' : 'aria-expanded missing');
            
            // Check form labels
            const inputs = document.querySelectorAll('input, textarea');
            let allLabeled = true;
            inputs.forEach(input => {
                const hasLabel = document.querySelector(`label[for="${input.id}"]`) || input.hasAttribute('aria-label');
                if (!hasLabel) allLabeled = false;
            });
            this.log('Form Labels', allLabeled, allLabeled ? 'All inputs have labels' : 'Some inputs missing labels');
            
            // Check heading hierarchy
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            const levels = headings.map(h => parseInt(h.tagName.charAt(1)));
            let properHierarchy = true;
            
            for (let i = 1; i < levels.length; i++) {
                if (levels[i] > levels[i-1] + 1) {
                    properHierarchy = false;
                    break;
                }
            }
            
            this.log('Heading Hierarchy', properHierarchy, properHierarchy ? 'Proper heading hierarchy' : 'Heading hierarchy issues detected');
        },

        displayResults: function() {
            console.log('\n📊 Validation Summary:');
            console.log('='.repeat(50));
            
            const passed = this.results.filter(r => r.passed).length;
            const total = this.results.length;
            const percentage = Math.round((passed / total) * 100);
            
            console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
            console.log(`❌ Failed: ${total - passed}/${total}`);
            
            if (percentage >= 90) {
                console.log('🎉 Excellent! Swedish responsive design is well implemented.');
            } else if (percentage >= 75) {
                console.log('👍 Good! Minor improvements needed for Swedish responsive design.');
            } else {
                console.log('⚠️  Needs attention! Several issues found with Swedish responsive design.');
            }
            
            // Show failed tests
            const failed = this.results.filter(r => !r.passed);
            if (failed.length > 0) {
                console.log('\n❌ Failed Tests:');
                failed.forEach(test => {
                    console.log(`   • ${test.test}: ${test.message}`);
                });
            }
            
            console.log('\n💡 Run this validation on different screen sizes for complete testing.');
            console.log('📱 Recommended test viewports: 320px, 768px, 1024px, 1440px');
        }
    };

    // Auto-run validation
    ResponsiveValidator.init();
    
    // Export for manual use
    window.ResponsiveValidator = ResponsiveValidator;
    
})();