/**
 * Swedish Market SEO Monitoring System
 * Monitors search rankings, visibility, and SEO performance for Swedish market
 */

class SwedishSEOMonitor {
    constructor() {
        this.domain = 'verkflode.se';
        this.targetKeywords = [
            'matsvinn Sverige',
            'CSRD efterlevnad',
            'restaurang lönsamhet',
            'hållbarhetsrapportering',
            'matsvinn minskning',
            'verkflöde matsvinn',
            'ESRS E5 rapportering',
            'restaurang matsvinn',
            'svensk matsvinn',
            'CSRD Sverige'
        ];
        
        this.competitors = [
            'winnow.com',
            'leanpath.com',
            'orbisk.com'
        ];
        
        this.seoMetrics = {
            rankings: {},
            visibility: {},
            technicalSEO: {},
            contentPerformance: {},
            backlinks: {},
            localSEO: {}
        };
        
        this.initializeSEOMonitoring();
    }

    initializeSEOMonitoring() {
        this.checkTechnicalSEO();
        this.monitorContentPerformance();
        this.trackLocalSEOSignals();
        this.setupPeriodicSEOChecks();
    }

    async checkTechnicalSEO() {
        const technicalChecks = {
            metaTags: this.checkMetaTags(),
            hreflang: this.checkHreflangTags(),
            canonicals: this.checkCanonicalTags(),
            structuredData: this.checkStructuredData(),
            sitemaps: await this.checkSitemaps(),
            robotsTxt: await this.checkRobotsTxt(),
            pageSpeed: await this.checkPageSpeed(),
            mobileOptimization: this.checkMobileOptimization(),
            ssl: this.checkSSL(),
            internalLinking: this.checkInternalLinking()
        };
        
        this.seoMetrics.technicalSEO = {
            ...technicalChecks,
            score: this.calculateTechnicalSEOScore(technicalChecks),
            lastChecked: new Date().toISOString()
        };
        
        this.evaluateTechnicalSEOIssues(technicalChecks);
        this.storeSEOMetrics();
        
        return technicalChecks;
    }

    checkMetaTags() {
        const checks = {
            title: {
                exists: !!document.title,
                length: document.title.length,
                optimal: document.title.length >= 30 && document.title.length <= 60,
                content: document.title,
                containsKeywords: this.containsSwedishKeywords(document.title)
            },
            description: {
                exists: false,
                length: 0,
                optimal: false,
                content: '',
                containsKeywords: false
            },
            keywords: {
                exists: false,
                content: ''
            },
            ogTags: {
                title: false,
                description: false,
                image: false,
                url: false
            },
            twitterTags: {
                card: false,
                title: false,
                description: false,
                image: false
            }
        };
        
        // Check meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            checks.description.exists = true;
            checks.description.content = metaDescription.content;
            checks.description.length = metaDescription.content.length;
            checks.description.optimal = checks.description.length >= 120 && checks.description.length <= 160;
            checks.description.containsKeywords = this.containsSwedishKeywords(metaDescription.content);
        }
        
        // Check meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            checks.keywords.exists = true;
            checks.keywords.content = metaKeywords.content;
        }
        
        // Check Open Graph tags
        checks.ogTags.title = !!document.querySelector('meta[property="og:title"]');
        checks.ogTags.description = !!document.querySelector('meta[property="og:description"]');
        checks.ogTags.image = !!document.querySelector('meta[property="og:image"]');
        checks.ogTags.url = !!document.querySelector('meta[property="og:url"]');
        
        // Check Twitter tags
        checks.twitterTags.card = !!document.querySelector('meta[name="twitter:card"]');
        checks.twitterTags.title = !!document.querySelector('meta[name="twitter:title"]');
        checks.twitterTags.description = !!document.querySelector('meta[name="twitter:description"]');
        checks.twitterTags.image = !!document.querySelector('meta[name="twitter:image"]');
        
        return checks;
    }

    checkHreflangTags() {
        const hreflangTags = document.querySelectorAll('link[hreflang]');
        const checks = {
            exists: hreflangTags.length > 0,
            count: hreflangTags.length,
            tags: [],
            hasSwedish: false,
            hasEnglish: false,
            hasXDefault: false,
            bidirectional: false
        };
        
        hreflangTags.forEach(tag => {
            const hreflang = tag.getAttribute('hreflang');
            const href = tag.getAttribute('href');
            
            checks.tags.push({ hreflang, href });
            
            if (hreflang === 'sv') checks.hasSwedish = true;
            if (hreflang === 'en') checks.hasEnglish = true;
            if (hreflang === 'x-default') checks.hasXDefault = true;
        });
        
        // Check if bidirectional linking is properly implemented
        checks.bidirectional = checks.hasSwedish && checks.hasEnglish;
        
        return checks;
    }

    checkCanonicalTags() {
        const canonical = document.querySelector('link[rel="canonical"]');
        const checks = {
            exists: !!canonical,
            url: canonical?.href || '',
            isCorrectDomain: false,
            isHTTPS: false,
            isAbsolute: false
        };
        
        if (canonical) {
            checks.isCorrectDomain = canonical.href.includes('verkflode.se');
            checks.isHTTPS = canonical.href.startsWith('https://');
            checks.isAbsolute = canonical.href.startsWith('http');
        }
        
        return checks;
    }

    checkStructuredData() {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        const checks = {
            exists: jsonLdScripts.length > 0,
            count: jsonLdScripts.length,
            types: [],
            hasOrganization: false,
            hasWebsite: false,
            hasBreadcrumbs: false,
            errors: []
        };
        
        jsonLdScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                const type = data['@type'] || (Array.isArray(data) ? data.map(d => d['@type']) : 'Unknown');
                checks.types.push(type);
                
                if (type === 'Organization') checks.hasOrganization = true;
                if (type === 'WebSite') checks.hasWebsite = true;
                if (type === 'BreadcrumbList') checks.hasBreadcrumbs = true;
            } catch (error) {
                checks.errors.push({
                    script: script.textContent.substring(0, 100),
                    error: error.message
                });
            }
        });
        
        return checks;
    }

    async checkSitemaps() {
        const sitemapUrls = [
            '/sitemap.xml',
            '/sitemap_index.xml'
        ];
        
        const checks = {
            found: [],
            errors: [],
            lastModified: null,
            urlCount: 0
        };
        
        for (const url of sitemapUrls) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    checks.found.push({
                        url,
                        status: response.status,
                        lastModified: response.headers.get('last-modified')
                    });
                }
            } catch (error) {
                checks.errors.push({
                    url,
                    error: error.message
                });
            }
        }
        
        return checks;
    }

    async checkRobotsTxt() {
        try {
            const response = await fetch('/robots.txt');
            const content = await response.text();
            
            return {
                exists: response.ok,
                status: response.status,
                content: content,
                hasSitemap: content.includes('Sitemap:'),
                allowsGooglebot: !content.includes('Disallow: /') || content.includes('Allow:'),
                size: content.length
            };
        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }

    async checkPageSpeed() {
        const startTime = performance.now();
        
        // Use Navigation Timing API
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            timeToInteractive: performance.now() - startTime
        };
        
        // Evaluate performance scores
        const scores = {
            domContentLoaded: metrics.domContentLoaded < 1500 ? 'good' : metrics.domContentLoaded < 3000 ? 'needs-improvement' : 'poor',
            loadComplete: metrics.loadComplete < 3000 ? 'good' : metrics.loadComplete < 5000 ? 'needs-improvement' : 'poor',
            firstContentfulPaint: metrics.firstContentfulPaint < 1800 ? 'good' : metrics.firstContentfulPaint < 3000 ? 'needs-improvement' : 'poor'
        };
        
        return { metrics, scores };
    }

    checkMobileOptimization() {
        const viewport = document.querySelector('meta[name="viewport"]');
        const checks = {
            hasViewportMeta: !!viewport,
            viewportContent: viewport?.content || '',
            isResponsive: false,
            touchFriendly: false,
            fontSizeOptimal: false
        };
        
        // Check if viewport is properly configured
        if (viewport) {
            const content = viewport.content.toLowerCase();
            checks.isResponsive = content.includes('width=device-width') && content.includes('initial-scale=1');
        }
        
        // Check for touch-friendly elements
        const buttons = document.querySelectorAll('button, a, input[type="submit"]');
        checks.touchFriendly = Array.from(buttons).some(btn => {
            const rect = btn.getBoundingClientRect();
            return rect.width >= 44 && rect.height >= 44; // Apple's recommended minimum touch target
        });
        
        // Check font sizes
        const bodyStyle = window.getComputedStyle(document.body);
        const fontSize = parseInt(bodyStyle.fontSize);
        checks.fontSizeOptimal = fontSize >= 16;
        
        return checks;
    }

    checkSSL() {
        return {
            isHTTPS: window.location.protocol === 'https:',
            hasSecureContext: window.isSecureContext,
            protocol: window.location.protocol
        };
    }

    checkInternalLinking() {
        const links = document.querySelectorAll('a[href]');
        const checks = {
            totalLinks: links.length,
            internalLinks: 0,
            externalLinks: 0,
            brokenLinks: [],
            noFollowLinks: 0,
            anchorTexts: []
        };
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const isInternal = href.startsWith('/') || href.includes('verkflode.se');
            
            if (isInternal) {
                checks.internalLinks++;
            } else {
                checks.externalLinks++;
            }
            
            if (link.getAttribute('rel')?.includes('nofollow')) {
                checks.noFollowLinks++;
            }
            
            const anchorText = link.textContent.trim();
            if (anchorText && anchorText.length > 0) {
                checks.anchorTexts.push({
                    text: anchorText,
                    href: href,
                    isInternal: isInternal
                });
            }
        });
        
        return checks;
    }

    containsSwedishKeywords(text) {
        const swedishKeywords = [
            'matsvinn', 'sverige', 'csrd', 'restaurang', 'lönsamhet',
            'hållbarhet', 'verkflöde', 'minskning', 'rapportering'
        ];
        
        const lowerText = text.toLowerCase();
        return swedishKeywords.some(keyword => lowerText.includes(keyword));
    }

    calculateTechnicalSEOScore(checks) {
        let score = 0;
        let maxScore = 0;
        
        // Title tag (10 points)
        maxScore += 10;
        if (checks.metaTags.title.exists) score += 5;
        if (checks.metaTags.title.optimal) score += 3;
        if (checks.metaTags.title.containsKeywords) score += 2;
        
        // Meta description (10 points)
        maxScore += 10;
        if (checks.metaTags.description.exists) score += 5;
        if (checks.metaTags.description.optimal) score += 3;
        if (checks.metaTags.description.containsKeywords) score += 2;
        
        // Hreflang (15 points)
        maxScore += 15;
        if (checks.hreflang.exists) score += 5;
        if (checks.hreflang.hasSwedish) score += 3;
        if (checks.hreflang.hasEnglish) score += 3;
        if (checks.hreflang.bidirectional) score += 4;
        
        // Canonical (10 points)
        maxScore += 10;
        if (checks.canonicals.exists) score += 5;
        if (checks.canonicals.isCorrectDomain) score += 3;
        if (checks.canonicals.isHTTPS) score += 2;
        
        // Structured data (10 points)
        maxScore += 10;
        if (checks.structuredData.exists) score += 5;
        if (checks.structuredData.hasOrganization) score += 3;
        if (checks.structuredData.hasWebsite) score += 2;
        
        // Mobile optimization (15 points)
        maxScore += 15;
        if (checks.mobileOptimization.hasViewportMeta) score += 5;
        if (checks.mobileOptimization.isResponsive) score += 5;
        if (checks.mobileOptimization.touchFriendly) score += 3;
        if (checks.mobileOptimization.fontSizeOptimal) score += 2;
        
        // SSL (10 points)
        maxScore += 10;
        if (checks.ssl.isHTTPS) score += 10;
        
        // Page speed (20 points)
        maxScore += 20;
        if (checks.pageSpeed.scores.domContentLoaded === 'good') score += 7;
        else if (checks.pageSpeed.scores.domContentLoaded === 'needs-improvement') score += 4;
        
        if (checks.pageSpeed.scores.loadComplete === 'good') score += 7;
        else if (checks.pageSpeed.scores.loadComplete === 'needs-improvement') score += 4;
        
        if (checks.pageSpeed.scores.firstContentfulPaint === 'good') score += 6;
        else if (checks.pageSpeed.scores.firstContentfulPaint === 'needs-improvement') score += 3;
        
        return Math.round((score / maxScore) * 100);
    }

    evaluateTechnicalSEOIssues(checks) {
        const issues = [];
        
        if (!checks.metaTags.title.exists) {
            issues.push({ type: 'critical', message: 'Missing title tag' });
        } else if (!checks.metaTags.title.optimal) {
            issues.push({ type: 'warning', message: 'Title tag length not optimal (30-60 characters)' });
        }
        
        if (!checks.metaTags.description.exists) {
            issues.push({ type: 'critical', message: 'Missing meta description' });
        } else if (!checks.metaTags.description.optimal) {
            issues.push({ type: 'warning', message: 'Meta description length not optimal (120-160 characters)' });
        }
        
        if (!checks.hreflang.exists) {
            issues.push({ type: 'critical', message: 'Missing hreflang tags for international SEO' });
        } else if (!checks.hreflang.bidirectional) {
            issues.push({ type: 'warning', message: 'Hreflang tags not properly bidirectional' });
        }
        
        if (!checks.canonicals.exists) {
            issues.push({ type: 'critical', message: 'Missing canonical tag' });
        }
        
        if (!checks.ssl.isHTTPS) {
            issues.push({ type: 'critical', message: 'Site not using HTTPS' });
        }
        
        if (!checks.mobileOptimization.isResponsive) {
            issues.push({ type: 'critical', message: 'Site not mobile responsive' });
        }
        
        if (checks.pageSpeed.scores.loadComplete === 'poor') {
            issues.push({ type: 'warning', message: 'Page load speed is poor (>5 seconds)' });
        }
        
        if (issues.length > 0) {
            this.sendSEOAlert('technical_seo_issues', issues);
        }
        
        return issues;
    }

    monitorContentPerformance() {
        const content = {
            headings: this.analyzeHeadings(),
            keywords: this.analyzeKeywordDensity(),
            readability: this.analyzeReadability(),
            images: this.analyzeImages(),
            links: this.analyzeLinks()
        };
        
        this.seoMetrics.contentPerformance = {
            ...content,
            score: this.calculateContentScore(content),
            lastAnalyzed: new Date().toISOString()
        };
        
        return content;
    }

    analyzeHeadings() {
        const headings = {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length,
            h4: document.querySelectorAll('h4').length,
            h5: document.querySelectorAll('h5').length,
            h6: document.querySelectorAll('h6').length,
            structure: [],
            keywordOptimized: 0
        };
        
        // Analyze heading structure
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        allHeadings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            const containsKeywords = this.containsSwedishKeywords(text);
            
            headings.structure.push({
                level,
                text,
                containsKeywords
            });
            
            if (containsKeywords) {
                headings.keywordOptimized++;
            }
        });
        
        return headings;
    }

    analyzeKeywordDensity() {
        const text = document.body.textContent.toLowerCase();
        const words = text.split(/\s+/).filter(word => word.length > 2);
        const totalWords = words.length;
        
        const keywordDensity = {};
        
        this.targetKeywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            const matches = (text.match(new RegExp(keywordLower, 'g')) || []).length;
            keywordDensity[keyword] = {
                count: matches,
                density: totalWords > 0 ? (matches / totalWords) * 100 : 0
            };
        });
        
        return {
            totalWords,
            keywordDensity,
            optimalDensity: Object.values(keywordDensity).some(kw => kw.density >= 0.5 && kw.density <= 3)
        };
    }

    analyzeReadability() {
        const text = document.body.textContent;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const syllables = this.countSyllables(text);
        
        // Flesch Reading Ease (adapted for Swedish)
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        return {
            sentences: sentences.length,
            words: words.length,
            syllables,
            avgSentenceLength,
            avgSyllablesPerWord,
            fleschScore,
            readabilityLevel: this.getReadabilityLevel(fleschScore)
        };
    }

    countSyllables(text) {
        // Simplified syllable counting for Swedish
        const words = text.toLowerCase().split(/\s+/);
        let syllableCount = 0;
        
        words.forEach(word => {
            // Swedish vowels
            const vowels = word.match(/[aeiouyåäö]/g);
            syllableCount += vowels ? vowels.length : 1;
        });
        
        return syllableCount;
    }

    getReadabilityLevel(score) {
        if (score >= 90) return 'Very Easy';
        if (score >= 80) return 'Easy';
        if (score >= 70) return 'Fairly Easy';
        if (score >= 60) return 'Standard';
        if (score >= 50) return 'Fairly Difficult';
        if (score >= 30) return 'Difficult';
        return 'Very Difficult';
    }

    analyzeImages() {
        const images = document.querySelectorAll('img');
        const analysis = {
            total: images.length,
            withAlt: 0,
            withTitle: 0,
            withLazyLoading: 0,
            optimizedAlt: 0,
            missingAlt: []
        };
        
        images.forEach((img, index) => {
            const alt = img.getAttribute('alt');
            const title = img.getAttribute('title');
            const loading = img.getAttribute('loading');
            
            if (alt) {
                analysis.withAlt++;
                if (this.containsSwedishKeywords(alt)) {
                    analysis.optimizedAlt++;
                }
            } else {
                analysis.missingAlt.push({
                    src: img.src,
                    index
                });
            }
            
            if (title) analysis.withTitle++;
            if (loading === 'lazy') analysis.withLazyLoading++;
        });
        
        return analysis;
    }

    analyzeLinks() {
        const links = document.querySelectorAll('a[href]');
        const analysis = {
            total: links.length,
            internal: 0,
            external: 0,
            nofollow: 0,
            optimizedAnchor: 0,
            emptyAnchor: 0
        };
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const rel = link.getAttribute('rel');
            const anchorText = link.textContent.trim();
            
            if (href.startsWith('/') || href.includes('verkflode.se')) {
                analysis.internal++;
            } else {
                analysis.external++;
            }
            
            if (rel && rel.includes('nofollow')) {
                analysis.nofollow++;
            }
            
            if (anchorText.length === 0) {
                analysis.emptyAnchor++;
            } else if (this.containsSwedishKeywords(anchorText)) {
                analysis.optimizedAnchor++;
            }
        });
        
        return analysis;
    }

    calculateContentScore(content) {
        let score = 0;
        let maxScore = 100;
        
        // Heading structure (20 points)
        if (content.headings.h1 === 1) score += 10;
        if (content.headings.h2 > 0) score += 5;
        if (content.headings.keywordOptimized > 0) score += 5;
        
        // Keyword optimization (30 points)
        if (content.keywords.optimalDensity) score += 20;
        const keywordCount = Object.values(content.keywords.keywordDensity).filter(kw => kw.count > 0).length;
        score += Math.min(keywordCount * 2, 10);
        
        // Readability (20 points)
        const readabilityScore = content.readability.fleschScore;
        if (readabilityScore >= 60) score += 20;
        else if (readabilityScore >= 30) score += 10;
        
        // Images (15 points)
        if (content.images.total > 0) {
            const altPercentage = (content.images.withAlt / content.images.total) * 100;
            score += Math.round((altPercentage / 100) * 10);
            if (content.images.optimizedAlt > 0) score += 5;
        }
        
        // Links (15 points)
        if (content.links.total > 0) {
            const internalLinkRatio = content.links.internal / content.links.total;
            if (internalLinkRatio >= 0.7) score += 10;
            else if (internalLinkRatio >= 0.5) score += 5;
            
            if (content.links.optimizedAnchor > 0) score += 5;
        }
        
        return Math.min(score, maxScore);
    }

    trackLocalSEOSignals() {
        const localSignals = {
            swedishContent: this.detectSwedishContent(),
            localReferences: this.detectLocalReferences(),
            contactInfo: this.detectContactInfo(),
            businessSchema: this.detectBusinessSchema()
        };
        
        this.seoMetrics.localSEO = {
            ...localSignals,
            score: this.calculateLocalSEOScore(localSignals),
            lastChecked: new Date().toISOString()
        };
        
        return localSignals;
    }

    detectSwedishContent() {
        const text = document.body.textContent.toLowerCase();
        const swedishIndicators = [
            'sverige', 'svensk', 'svenska', 'stockholm', 'göteborg', 'malmö',
            'kronor', 'sek', 'naturvårdsverket', 'regeringen', 'eu-direktiv'
        ];
        
        const foundIndicators = swedishIndicators.filter(indicator => 
            text.includes(indicator)
        );
        
        return {
            indicators: foundIndicators,
            count: foundIndicators.length,
            percentage: (foundIndicators.length / swedishIndicators.length) * 100
        };
    }

    detectLocalReferences() {
        const text = document.body.textContent.toLowerCase();
        const localReferences = [
            'csrd sverige', 'sams initiativ', 'svensk lagstiftning',
            'svenska restauranger', 'svensk marknad', 'europeiska unionen'
        ];
        
        const foundReferences = localReferences.filter(ref => 
            text.includes(ref)
        );
        
        return {
            references: foundReferences,
            count: foundReferences.length
        };
    }

    detectContactInfo() {
        const text = document.body.textContent;
        
        return {
            hasEmail: /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
            hasPhone: /(\+46|0[0-9]{1,3}[\s-]?[0-9]{6,8})/.test(text),
            hasAddress: text.toLowerCase().includes('sverige') || text.toLowerCase().includes('stockholm')
        };
    }

    detectBusinessSchema() {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        let hasBusinessSchema = false;
        
        jsonLdScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                if (data['@type'] === 'Organization' || data['@type'] === 'LocalBusiness') {
                    hasBusinessSchema = true;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
        
        return { exists: hasBusinessSchema };
    }

    calculateLocalSEOScore(signals) {
        let score = 0;
        
        // Swedish content indicators (40 points)
        score += Math.min(signals.swedishContent.percentage * 0.4, 40);
        
        // Local references (30 points)
        score += Math.min(signals.localReferences.count * 5, 30);
        
        // Contact information (20 points)
        if (signals.contactInfo.hasEmail) score += 7;
        if (signals.contactInfo.hasPhone) score += 7;
        if (signals.contactInfo.hasAddress) score += 6;
        
        // Business schema (10 points)
        if (signals.businessSchema.exists) score += 10;
        
        return Math.min(score, 100);
    }

    setupPeriodicSEOChecks() {
        // Run comprehensive SEO check every hour
        setInterval(() => {
            this.runComprehensiveSEOCheck();
        }, 3600000);
        
        // Run quick technical check every 15 minutes
        setInterval(() => {
            this.runQuickSEOCheck();
        }, 900000);
    }

    async runComprehensiveSEOCheck() {
        console.log('🇸🇪 Running comprehensive Swedish SEO check...');
        
        try {
            await this.checkTechnicalSEO();
            this.monitorContentPerformance();
            this.trackLocalSEOSignals();
            
            const report = this.generateSEOReport();
            this.storeSEOReport(report);
            
            console.log('🇸🇪 Swedish SEO check completed:', report.summary);
        } catch (error) {
            console.error('🇸🇪 SEO check error:', error);
            this.sendSEOAlert('seo_check_error', { error: error.message });
        }
    }

    async runQuickSEOCheck() {
        const quickChecks = {
            pageSpeed: await this.checkPageSpeed(),
            ssl: this.checkSSL(),
            metaTags: this.checkMetaTags()
        };
        
        // Check for critical issues
        if (!quickChecks.ssl.isHTTPS) {
            this.sendSEOAlert('ssl_issue', quickChecks.ssl);
        }
        
        if (quickChecks.pageSpeed.scores.loadComplete === 'poor') {
            this.sendSEOAlert('performance_issue', quickChecks.pageSpeed);
        }
        
        return quickChecks;
    }

    async sendSEOAlert(type, data) {
        const alert = {
            type: `seo_${type}`,
            data: data,
            domain: this.domain,
            timestamp: new Date().toISOString(),
            severity: this.getSEOAlertSeverity(type)
        };
        
        console.warn(`🚨 SWEDISH SEO ALERT [${alert.severity.toUpperCase()}]:`, alert);
        this.storeSEOAlert(alert);
        
        return alert;
    }

    getSEOAlertSeverity(type) {
        const criticalTypes = ['ssl_issue', 'technical_seo_issues'];
        const warningTypes = ['performance_issue', 'content_issue'];
        
        if (criticalTypes.includes(type)) return 'critical';
        if (warningTypes.includes(type)) return 'warning';
        return 'info';
    }

    generateSEOReport() {
        return {
            domain: this.domain,
            timestamp: new Date().toISOString(),
            summary: {
                technicalSEOScore: this.seoMetrics.technicalSEO.score || 0,
                contentScore: this.seoMetrics.contentPerformance.score || 0,
                localSEOScore: this.seoMetrics.localSEO.score || 0,
                overallScore: this.calculateOverallSEOScore()
            },
            metrics: this.seoMetrics,
            recommendations: this.generateSEORecommendations()
        };
    }

    calculateOverallSEOScore() {
        const technicalScore = this.seoMetrics.technicalSEO.score || 0;
        const contentScore = this.seoMetrics.contentPerformance.score || 0;
        const localScore = this.seoMetrics.localSEO.score || 0;
        
        // Weighted average: Technical 40%, Content 40%, Local 20%
        return Math.round((technicalScore * 0.4) + (contentScore * 0.4) + (localScore * 0.2));
    }

    generateSEORecommendations() {
        const recommendations = [];
        
        if (this.seoMetrics.technicalSEO.score < 80) {
            recommendations.push({
                type: 'technical',
                priority: 'high',
                message: 'Improve technical SEO fundamentals (meta tags, hreflang, page speed)'
            });
        }
        
        if (this.seoMetrics.contentPerformance.score < 70) {
            recommendations.push({
                type: 'content',
                priority: 'medium',
                message: 'Optimize content for Swedish keywords and improve readability'
            });
        }
        
        if (this.seoMetrics.localSEO.score < 60) {
            recommendations.push({
                type: 'local',
                priority: 'medium',
                message: 'Strengthen local Swedish SEO signals and references'
            });
        }
        
        return recommendations;
    }

    storeSEOMetrics() {
        localStorage.setItem('swedish_seo_metrics', JSON.stringify(this.seoMetrics));
    }

    storeSEOReport(report) {
        const reports = this.getStoredSEOReports();
        reports.unshift(report);
        
        if (reports.length > 24) { // Keep 24 hours of hourly reports
            reports.splice(24);
        }
        
        localStorage.setItem('swedish_seo_reports', JSON.stringify(reports));
    }

    storeSEOAlert(alert) {
        const alerts = this.getStoredSEOAlerts();
        alerts.unshift(alert);
        
        if (alerts.length > 50) {
            alerts.splice(50);
        }
        
        localStorage.setItem('swedish_seo_alerts', JSON.stringify(alerts));
    }

    getStoredSEOReports() {
        try {
            return JSON.parse(localStorage.getItem('swedish_seo_reports') || '[]');
        } catch {
            return [];
        }
    }

    getStoredSEOAlerts() {
        try {
            return JSON.parse(localStorage.getItem('swedish_seo_alerts') || '[]');
        } catch {
            return [];
        }
    }

    getSEOStatus() {
        return {
            domain: this.domain,
            lastCheck: new Date().toISOString(),
            metrics: this.seoMetrics,
            overallScore: this.calculateOverallSEOScore(),
            alerts: this.getStoredSEOAlerts().slice(0, 5),
            recommendations: this.generateSEORecommendations()
        };
    }
}

// Auto-initialize for Swedish domain
if (typeof window !== 'undefined' && window.location.hostname === 'verkflode.se') {
    window.swedishSEOMonitor = new SwedishSEOMonitor();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishSEOMonitor;
} else if (typeof window !== 'undefined') {
    window.SwedishSEOMonitor = SwedishSEOMonitor;
}