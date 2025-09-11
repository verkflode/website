/**
 * Swedish Data Sources Verification System
 * Handles verification and display of data sources for CSRD compliance
 */

class SwedishDataSources {
    constructor() {
        this.sources = null;
        this.loadSources();
    }

    async loadSources() {
        try {
            const response = await fetch('/admin/data-sources.json');
            this.sources = await response.json();
            this.initializeSourceVerification();
        } catch (error) {
            console.warn('Could not load data sources:', error);
            // Fallback to embedded sources if JSON fails
            this.initializeFallbackSources();
        }
    }

    initializeFallbackSources() {
        this.sources = {
            swedishDataSources: {
                foodWasteIncrease: {
                    claim: "Matsvinnet från svenska restauranger har ökat från 6 kg till 11 kg per person och år sedan 2020",
                    source: "https://www.sverigesradio.se/artikel/matsvinn-pa-restauranger-okar-de-har-losningen",
                    authority: "Sveriges Radio / Naturvårdsverket",
                    verified: true
                },
                missed2025Target: {
                    claim: "Sveriges etappmål var tydligt: en 20-procentig minskning av matsvinnet till 2025",
                    source: "https://www.regeringen.se/regeringens-politik/miljo-och-klimat/matsvinn/",
                    authority: "Regeringen / Naturvårdsverket",
                    verified: true
                },
                industryMargins: {
                    claim: "För en bransch med marginaler på 3-5%",
                    source: "https://www.visita.se/branschstatistik/",
                    authority: "Visita",
                    verified: true
                }
            }
        };
        this.initializeSourceVerification();
    }

    initializeSourceVerification() {
        // Add verification badges to claims
        this.addVerificationBadges();
        
        // Add source tooltips
        this.addSourceTooltips();
        
        // Track source link clicks for analytics
        this.trackSourceClicks();
    }

    addVerificationBadges() {
        // Add small verification indicators next to verified claims
        const verifiedClaims = [
            { selector: '.hero-text', key: 'foodWasteIncrease' },
            { selector: '#problem-heading + .section-text-wide', key: 'missed2025Target' },
            { selector: '.stat-label:contains("Branschmarginaler")', key: 'industryMargins' }
        ];

        verifiedClaims.forEach(claim => {
            const elements = document.querySelectorAll(claim.selector);
            elements.forEach(element => {
                if (this.sources?.swedishDataSources?.[claim.key]?.verified) {
                    this.addVerificationBadge(element);
                }
            });
        });
    }

    addVerificationBadge(element) {
        const badge = document.createElement('span');
        badge.className = 'verification-badge';
        badge.innerHTML = '✓';
        badge.title = 'Verifierad med officiella källor';
        badge.style.cssText = `
            display: inline-block;
            margin-left: 0.25rem;
            color: var(--leaf-green);
            font-weight: bold;
            font-size: 0.875rem;
            cursor: help;
        `;
        
        // Insert after the element's text content
        if (element.lastChild && element.lastChild.nodeType === Node.TEXT_NODE) {
            element.appendChild(badge);
        }
    }

    addSourceTooltips() {
        // Add hover tooltips showing source information
        const sourceLinks = document.querySelectorAll('.source-link');
        sourceLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                this.showSourceTooltip(e.target);
            });
            
            link.addEventListener('mouseleave', (e) => {
                this.hideSourceTooltip();
            });
        });
    }

    showSourceTooltip(element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'source-tooltip';
        tooltip.innerHTML = `
            <strong>Verifierad källa</strong><br>
            Klicka för att öppna i ny flik
        `;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-primary);
            border: 1px solid var(--light-gray);
            border-radius: 4px;
            padding: 0.5rem;
            font-size: 0.75rem;
            box-shadow: var(--shadow-md);
            z-index: 1000;
            max-width: 200px;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
        
        this.currentTooltip = tooltip;
    }

    hideSourceTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    trackSourceClicks() {
        const sourceLinks = document.querySelectorAll('.source-link');
        sourceLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Track source verification clicks for analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'source_verification_click', {
                        'source_url': e.target.href,
                        'source_text': e.target.textContent.trim()
                    });
                }
                
                // Log for debugging
                console.log('Source verification clicked:', {
                    url: e.target.href,
                    text: e.target.textContent.trim()
                });
            });
        });
    }

    // Method to validate all sources (for testing/debugging)
    validateAllSources() {
        if (!this.sources) {
            console.warn('Sources not loaded yet');
            return false;
        }

        const sources = this.sources.swedishDataSources;
        let allValid = true;

        Object.keys(sources).forEach(key => {
            const source = sources[key];
            if (!source.verified || !source.source || !source.authority) {
                console.error(`Invalid source: ${key}`, source);
                allValid = false;
            }
        });

        console.log('Source validation complete:', allValid ? 'All sources valid' : 'Some sources invalid');
        return allValid;
    }

    // Method to get source information for a specific claim
    getSourceInfo(claimKey) {
        return this.sources?.swedishDataSources?.[claimKey] || null;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.swedishDataSources = new SwedishDataSources();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishDataSources;
}