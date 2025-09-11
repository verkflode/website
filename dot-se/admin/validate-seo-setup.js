#!/usr/bin/env node

/**
 * Swedish Site SEO Validation Script
 * Validates sitemap.xml and robots.txt for verkflode.se
 */

const fs = require('fs');
const path = require('path');

class SwedishSEOValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }

    validateSitemap() {
        console.log('🔍 Validating Swedish sitemap...');
        
        const sitemapPath = path.join(__dirname, 'sitemap.xml');
        
        if (!fs.existsSync(sitemapPath)) {
            this.errors.push('❌ sitemap.xml not found');
            return;
        }

        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        
        // Check XML structure
        if (!sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
            this.errors.push('❌ Missing XML declaration in sitemap');
        } else {
            this.success.push('✅ Valid XML declaration');
        }

        // Check required URLs
        const requiredUrls = [
            'https://verkflode.se/',
            'https://verkflode.se/om-oss.html',
            'https://verkflode.se/integritetspolicy.html'
        ];

        requiredUrls.forEach(url => {
            if (sitemapContent.includes(url)) {
                this.success.push(`✅ Found required URL: ${url}`);
            } else {
                this.errors.push(`❌ Missing required URL: ${url}`);
            }
        });

        // Check hreflang tags
        if (sitemapContent.includes('hreflang="sv"') && sitemapContent.includes('hreflang="en"')) {
            this.success.push('✅ Hreflang tags present');
        } else {
            this.errors.push('❌ Missing or incomplete hreflang tags');
        }

        // Check lastmod dates
        const today = new Date().toISOString().split('T')[0];
        if (sitemapContent.includes(today)) {
            this.success.push('✅ Recent lastmod dates found');
        } else {
            this.warnings.push('⚠️  Consider updating lastmod dates to current date');
        }

        // Check priorities
        if (sitemapContent.includes('<priority>1.0</priority>')) {
            this.success.push('✅ Homepage has priority 1.0');
        } else {
            this.warnings.push('⚠️  Homepage should have priority 1.0');
        }
    }

    validateRobotsTxt() {
        console.log('🔍 Validating robots.txt...');
        
        const robotsPath = path.join(__dirname, 'robots.txt');
        
        if (!fs.existsSync(robotsPath)) {
            this.errors.push('❌ robots.txt not found');
            return;
        }

        const robotsContent = fs.readFileSync(robotsPath, 'utf8');
        
        // Check sitemap reference
        if (robotsContent.includes('Sitemap: https://verkflode.se/sitemap.xml')) {
            this.success.push('✅ Sitemap URL correctly referenced in robots.txt');
        } else {
            this.errors.push('❌ Missing or incorrect sitemap URL in robots.txt');
        }

        // Check basic directives
        if (robotsContent.includes('User-agent: *')) {
            this.success.push('✅ Universal user-agent directive present');
        } else {
            this.errors.push('❌ Missing universal user-agent directive');
        }

        // Check admin directory blocking
        if (robotsContent.includes('Disallow: /admin/')) {
            this.success.push('✅ Admin directory properly blocked');
        } else {
            this.warnings.push('⚠️  Consider blocking admin directory');
        }

        // Check for Swedish-specific optimizations
        if (robotsContent.includes('Googlebot') && robotsContent.includes('Bingbot')) {
            this.success.push('✅ Major search engines explicitly allowed');
        } else {
            this.warnings.push('⚠️  Consider explicit rules for major search engines');
        }
    }

    validateURLStructure() {
        console.log('🔍 Validating Swedish URL structure...');
        
        // Check for Swedish pages
        const swedishPages = [
            'index.html',
            'om-oss.html', 
            'integritetspolicy.html'
        ];

        swedishPages.forEach(page => {
            const pagePath = path.join(__dirname, page);
            if (fs.existsSync(pagePath)) {
                this.success.push(`✅ Swedish page exists: ${page}`);
                
                // Check for Swedish lang attribute
                const content = fs.readFileSync(pagePath, 'utf8');
                if (content.includes('lang="sv"')) {
                    this.success.push(`✅ ${page} has Swedish lang attribute`);
                } else {
                    this.errors.push(`❌ ${page} missing Swedish lang attribute`);
                }

                // Check for canonical URLs
                if (content.includes('rel="canonical"') && content.includes('verkflode.se')) {
                    this.success.push(`✅ ${page} has proper canonical URL`);
                } else {
                    this.errors.push(`❌ ${page} missing or incorrect canonical URL`);
                }

                // Check for hreflang tags
                if (content.includes('hreflang="sv"') && content.includes('hreflang="en"')) {
                    this.success.push(`✅ ${page} has proper hreflang tags`);
                } else {
                    this.errors.push(`❌ ${page} missing or incomplete hreflang tags`);
                }
            } else {
                this.errors.push(`❌ Missing Swedish page: ${page}`);
            }
        });
    }

    generateReport() {
        console.log('\n📊 Swedish SEO Validation Report');
        console.log('================================');
        
        if (this.success.length > 0) {
            console.log('\n✅ Successes:');
            this.success.forEach(item => console.log(`  ${item}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach(item => console.log(`  ${item}`));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(item => console.log(`  ${item}`));
        }

        console.log('\n📈 Summary:');
        console.log(`  ✅ ${this.success.length} items passed`);
        console.log(`  ⚠️  ${this.warnings.length} warnings`);
        console.log(`  ❌ ${this.errors.length} errors`);

        if (this.errors.length === 0) {
            console.log('\n🎉 Swedish SEO setup is ready for search engine submission!');
            console.log('📋 Next steps:');
            console.log('  1. Submit sitemap to Google Search Console');
            console.log('  2. Submit sitemap to Bing Webmaster Tools');
            console.log('  3. Monitor indexing progress');
            console.log('  4. Track Swedish market keyword rankings');
        } else {
            console.log('\n🔧 Please fix the errors above before submitting to search engines.');
        }

        return this.errors.length === 0;
    }

    run() {
        console.log('🇸🇪 Swedish Site SEO Validation');
        console.log('===============================\n');
        
        this.validateSitemap();
        this.validateRobotsTxt();
        this.validateURLStructure();
        
        return this.generateReport();
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new SwedishSEOValidator();
    const isValid = validator.run();
    process.exit(isValid ? 0 : 1);
}

module.exports = SwedishSEOValidator;