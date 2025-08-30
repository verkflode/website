# Verkflöde Website

Official website for Verkflöde - Collective Intelligence for Zero Food Waste.

## 🌐 Live Sites

- **English**: [verkflode.com](https://verkflode.com)
- **Swedish**: [verkflode.se](https://verkflode.se)

## 🏗️ Architecture

This repository contains both websites and AWS backend infrastructure:

```
verkflode-website/
├── dot-com/          # English website (verkflode.com)
├── dot-se/           # Swedish website (verkflode.se)
├── aws-backend/      # Lambda functions and infrastructure
└── AWS-SETUP.md      # Deployment guide
```

## 🚀 Hosting

- **Frontend**: AWS Amplify (static hosting with CDN)
- **Backend**: AWS Lambda + API Gateway
- **Email**: Mailgun
- **Security**: Cloudflare Turnstile

## 🛠️ Development

Both sites are static HTML/CSS/JavaScript with:
- Responsive design
- Dark/light theme toggle
- Mobile-first approach
- Accessibility features (WCAG AA)
- Multi-language support

## 📧 Contact Forms

Contact forms use:
- AWS Lambda for processing
- Mailgun for email delivery
- Cloudflare Turnstile for bot protection
- Proper CORS and validation

## 🔧 Deployment

See [AWS-SETUP.md](AWS-SETUP.md) for complete deployment instructions.

Quick start:
```bash
# Deploy backend
cd aws-backend
./deploy.sh

# Set up Amplify hosting via AWS Console
# Connect this GitHub repo
# Configure custom domains
```

## 📱 Features

- ✅ Mobile responsive
- ✅ Fast loading (optimized assets)
- ✅ SEO optimized
- ✅ Accessibility compliant
- ✅ Multi-language (EN/SV)
- ✅ Dark/light themes
- ✅ Contact forms with validation
- ✅ Bot protection

## 🌍 Sustainability

As a company focused on eliminating food waste, our website is designed with sustainability in mind:
- Optimized images and assets
- Efficient code and minimal JavaScript
- CDN delivery for reduced server load
- Green hosting on AWS (renewable energy)

---

**Verkflöde** - Transforming imagination into action for a Europe without food waste.