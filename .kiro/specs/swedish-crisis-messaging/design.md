# Design Document

## Overview

This design implements a Swedish-language website with crisis-specific messaging that leverages Sweden's missed 2025 food waste targets while maintaining the existing English business-focused messaging. The solution includes proper international SEO architecture, dual-domain strategy, and localized content that creates maximum market penetration in Sweden while preserving international credibility.

## Architecture

### Dual-Domain Strategy
- **Swedish Version**: `https://verkflode.se` with crisis-specific messaging
- **English Version**: `https://verkflode.com` with business-focused messaging
- **Shared Infrastructure**: Common CSS, JavaScript, and asset management
- **Independent SEO**: Separate canonical URLs, sitemaps, and language targeting

### International SEO Architecture
```html
<!-- Swedish Version (verkflode.se) -->
<link rel="canonical" href="https://verkflode.se">
<link rel="alternate" hreflang="sv" href="https://verkflode.se">
<link rel="alternate" hreflang="en" href="https://verkflode.com">
<link rel="alternate" hreflang="x-default" href="https://verkflode.com">

<!-- English Version (verkflode.com) -->
<link rel="canonical" href="https://verkflode.com">
<link rel="alternate" hreflang="en" href="https://verkflode.com">
<link rel="alternate" hreflang="sv" href="https://verkflode.se">
<link rel="alternate" hreflang="x-default" href="https://verkflode.com">
```

### Content Localization Strategy
- **Crisis Messaging**: Swedish failure + European mandate urgency
- **Cultural Adaptation**: Swedish business terminology and references
- **Data Localization**: Swedish statistics, kronor, local authorities
- **Regulatory Context**: Swedish law + CSRD connection

## Components and Interfaces

### Swedish Hero Section
```html
<!-- Swedish Crisis Hero -->
<section class="hero-section">
  <h1>Sverige missade 2025-målet. Nu kommer Europas nya krav.</h1>
  <p>Siffrorna är här: matsvinnet från svenska restauranger har nästan fördubblats sedan 2020. De gamla metoderna har misslyckats. Verkflöde är den svenskutvecklade lösningen som omvandlar denna kris till lönsamhet – och förbereder er för EU:s tvingande hållbarhetsrapportering (CSRD).</p>
  <div class="hero-stats-swedish">
    <span>7:1 Avkastning</span>
    <span>30-50% Minskning</span>
    <span>CSRD-Redo</span>
  </div>
</section>
```

### Swedish Problem Section
```html
<!-- Swedish Crisis Problem Section -->
<section id="problem-swedish">
  <h2>Ett Missat Mål. En Ny Verklighet.</h2>
  <p>Sveriges etappmål var tydligt: en 20-procentig minskning av matsvinnet till 2025. Den deadline har passerat, och statistiken visar att utvecklingen gått åt fel håll. Svinn från restauranger och hotell har ökat från 6 kg till 11 kg per person och år. För en bransch med marginaler på 3-5% är detta en ohållbar ekonomisk belastning.</p>
  
  <p>Detta är inte bara ett svenskt problem. I hela Europa ställer nu CSRD-direktivet nya, tvingande krav på transparens. Företag måste nu granska, mäta och offentligt rapportera sin påverkan – inklusive matsvinn – med samma noggrannhet som finansiella siffror. Att förlita sig på uppskattningar är inte längre ett alternativ.</p>
</section>
```

### Swedish Mission Section
```html
<!-- Swedish Localized Mission -->
<div class="mission-goals-swedish">
  <div class="goal">
    <h3>Vänd ett Missat Mål till Mätbar Framgång</h3>
    <p>Medan den nationella trenden är negativ, kan er verksamhet bli ledande. Vår plattform ger er den precision som krävs för att inte bara uppfylla lagkravet på sortering, utan för att bygga ett system som redan idag möter de kommande kraven från EU:s CSRD och ESRS E5.</p>
  </div>
  
  <div class="goal">
    <h3>Säkra Lönsamheten i en Tuff Marknad</h3>
    <p>För varje krona investerad i minskat matsvinn, sparar restauranger i snitt sju kronor. Detta är inte bara en besparing; det är en strategisk investering som stärker er mot framtida kostnadsökningar och möter investerares och kunders krav på hållbarhet i hela Europa.</p>
  </div>
  
  <div class="goal">
    <h3>Led Omställningen, från Stockholm till Europa</h3>
    <p>Myndigheterna efterlyser nya lösningar efter 2025-målets misslyckande. Genom att bli en föregångare i Sverige med stöd av initiativ som SAMS, positionerar ni er som en ledare för hela den europeiska besöksnäringens oundvikliga omställning.</p>
  </div>
</div>
```

### Language Switching Interface
```html
<!-- Language Switcher Component -->
<div class="language-switcher">
  <a href="https://verkflode.se" class="lang-link active" hreflang="sv">🇸🇪 Svenska</a>
  <a href="https://verkflode.com" class="lang-link" hreflang="en">🇬🇧 English</a>
</div>
```

## Data Models

### Swedish Content Structure
```javascript
const swedishContent = {
  hero: {
    headline: "Sverige missade 2025-målet. Nu kommer Europas nya krav.",
    subheadline: "Siffrorna är här: matsvinnet från svenska restauranger har nästan fördubblats sedan 2020. De gamla metoderna har misslyckats. Verkflöde är den svenskutvecklade lösningen som omvandlar denna kris till lönsamhet – och förbereder er för EU:s tvingande hållbarhetsrapportering (CSRD).",
    stats: ["7:1 Avkastning", "30-50% Minskning", "CSRD-Redo"]
  },
  problem: {
    title: "Ett Missat Mål. En Ny Verklighet.",
    swedishContext: "Sveriges etappmål var tydligt: en 20-procentig minskning av matsvinnet till 2025...",
    europeanContext: "I hela Europa ställer nu CSRD-direktivet nya, tvingande krav på transparens..."
  },
  mission: {
    goals: [
      {
        title: "Vänd ett Missat Mål till Mätbar Framgång",
        focus: "Swedish failure to European readiness"
      },
      {
        title: "Säkra Lönsamheten i en Tuff Marknad", 
        focus: "ROI in Swedish kronor context"
      },
      {
        title: "Led Omställningen, från Stockholm till Europa",
        focus: "Swedish leadership in European transition"
      }
    ]
  }
}
```

### SEO Configuration Model
```javascript
const seoConfig = {
  swedish: {
    domain: "verkflode.se",
    canonical: "https://verkflode.se",
    hreflang: "sv",
    title: "Verkflöde | Sveriges Lösning på Matsvinnet och CSRD-Kraven",
    description: "Sverige missade 2025-målet för matsvinn. Verkflöde omvandlar krisen till lönsamhet och förbereder för EU:s CSRD-krav. 7:1 avkastning garanterad.",
    keywords: "matsvinn Sverige, CSRD efterlevnad, restaurang lönsamhet, hållbarhetsrapportering"
  },
  english: {
    domain: "verkflode.com", 
    canonical: "https://verkflode.com",
    hreflang: "en",
    title: "Verkflöde | Turn Food Waste Into Profit and CSRD Compliance",
    description: "Achieve 7:1 ROI eliminating food waste. Automate EU sustainability reporting with Verkflöde's Collective Intelligence platform.",
    keywords: "food waste ROI, CSRD compliance, ESRS E5 reporting, restaurant profit"
  }
}
```

### Data Source Verification Model
```javascript
const swedishDataSources = {
  foodWasteIncrease: {
    claim: "6kg till 11kg per person och år",
    source: "https://www.sverigesradio.se/artikel/matsvinn-pa-restauranger-okar-de-har-losningen",
    authority: "Sveriges Radio / Naturvårdsverket"
  },
  missed2025Target: {
    claim: "20-procentig minskning av matsvinnet till 2025",
    source: "Swedish government sustainability targets",
    authority: "Regeringen / Naturvårdsverket"
  },
  industryMargins: {
    claim: "marginaler på 3-5%",
    source: "Restaurant industry reports Sweden",
    authority: "Visita / SCB"
  }
}
```

## Error Handling

### Domain and SEO Management
- **Canonical Conflicts**: Ensure each domain has unique canonical URLs
- **Hreflang Errors**: Implement bidirectional hreflang linking validation
- **Duplicate Content**: Monitor for SEO penalties from similar content
- **Language Detection**: Handle automatic redirects based on browser language

### Content Consistency
- **Translation Quality**: Ensure Swedish content maintains technical accuracy
- **Cultural Sensitivity**: Validate Swedish business terminology and cultural references
- **Data Accuracy**: Verify all Swedish statistics and regulatory claims
- **Brand Consistency**: Maintain Verkflöde brand identity across languages

### Technical Fallbacks
- **Domain Availability**: Handle verkflode.se domain setup and DNS configuration
- **SSL Certificates**: Ensure both domains have proper HTTPS setup
- **CDN Configuration**: Optimize content delivery for Swedish and international users
- **Analytics Separation**: Track Swedish and English site performance independently

## Testing Strategy

### International SEO Testing
1. **Hreflang Validation**: Use Google Search Console to verify proper language targeting
2. **Canonical Testing**: Ensure search engines index both versions correctly
3. **Geotargeting Verification**: Test search results from Swedish and international locations
4. **Language Detection**: Verify automatic language switching works properly

### Content Localization Testing
1. **Cultural Relevance**: Test Swedish messaging with native Swedish speakers
2. **Business Terminology**: Validate Swedish business language accuracy
3. **Data Verification**: Confirm all Swedish statistics are current and accurate
4. **Regulatory Claims**: Verify CSRD and Swedish law references are correct

### Conversion Testing
1. **A/B Testing**: Compare conversion rates between crisis messaging and business messaging
2. **Market Response**: Monitor Swedish market engagement vs international engagement
3. **Lead Quality**: Track demo requests and their conversion to customers by language
4. **User Journey**: Analyze how Swedish users navigate vs international users

### Technical Performance Testing
1. **Cross-Domain Functionality**: Test language switching and navigation
2. **Mobile Responsiveness**: Verify Swedish content works on all devices
3. **Page Speed**: Ensure Swedish version maintains performance standards
4. **Analytics Integration**: Confirm tracking works properly for both domains

## Implementation Phases

### Phase 1: Technical Infrastructure
- Set up verkflode.se domain with proper DNS and SSL
- Implement correct canonical URLs and hreflang tags
- Configure separate analytics and search console properties
- Set up CDN and performance optimization for Swedish market

### Phase 2: Swedish Content Creation
- Translate and adapt hero section with crisis messaging
- Create Swedish problem section with local data and European context
- Develop Swedish mission section with localized goals
- Implement Swedish navigation and UI elements

### Phase 3: SEO and Localization
- Submit Swedish sitemap to search engines
- Configure geotargeting for Swedish market
- Implement proper language switching functionality
- Set up conversion tracking for Swedish market

### Phase 4: Testing and Optimization
- Conduct comprehensive SEO testing and validation
- Test content with Swedish market focus groups
- Monitor search rankings and traffic patterns
- Optimize based on Swedish market response and feedback