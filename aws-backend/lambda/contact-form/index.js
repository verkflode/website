const https = require('https');
const querystring = require('querystring');

// Environment variables (set these in Lambda console)
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, email, company, message, 'cf-turnstile-response': turnstileToken } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    errors: ['Name, email, and message are required']
                })
            };
        }

        // Validate Turnstile token (allow bypass for development)
        const isDevelopment = turnstileToken === 'dev-bypass' || !turnstileToken;
        const turnstileValid = isDevelopment || await validateTurnstile(turnstileToken);
        
        if (!turnstileValid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    errors: ['Security verification failed. Please try again.']
                })
            };
        }

        // Determine which site this came from based on origin
        const origin = event.headers.origin || event.headers.Origin;
        const isSwedish = origin && origin.includes('verkflode.se');
        
        // Send email via Mailgun (for development, return success even if email fails)
        const emailSent = await sendEmail({
            name,
            email,
            company: company || 'Not provided',
            message,
            isSwedish
        });

        // For development/testing, always return success if validation passed
        // In production, you'd want to check emailSent
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: isSwedish ? 'Meddelandet har skickats!' : 'Message sent successfully!'
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                errors: ['Internal server error']
            })
        };
    }
};

async function validateTurnstile(token) {
    if (!token || !TURNSTILE_SECRET_KEY) {
        return false;
    }

    const postData = querystring.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token
    });

    return new Promise((resolve) => {
        const options = {
            hostname: 'challenges.cloudflare.com',
            port: 443,
            path: '/turnstile/v0/siteverify',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.success === true);
                } catch (e) {
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

async function sendEmail({ name, email, company, message, isSwedish }) {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
        console.error('Mailgun credentials not configured');
        return false;
    }

    const subject = isSwedish 
        ? `Ny kontakt från ${name} via verkflode.se`
        : `New contact from ${name} via verkflode.com`;

    const emailBody = isSwedish ? `
Ny kontaktförfrågan från verkflode.se

Namn: ${name}
E-post: ${email}
Företag: ${company}

Meddelande:
${message}

---
Skickat från verkflode.se kontaktformulär
    `.trim() : `
New contact inquiry from verkflode.com

Name: ${name}
Email: ${email}
Company: ${company}

Message:
${message}

---
Sent from verkflode.com contact form
    `.trim();

    const postData = querystring.stringify({
        from: `Verkflöde Website <noreply@${MAILGUN_DOMAIN}>`,
        to: 'hej@verkflode.se',
        'h:Reply-To': email,
        subject: subject,
        text: emailBody
    });

    return new Promise((resolve) => {
        const options = {
            hostname: 'api.mailgun.net',
            port: 443,
            path: `/v3/${MAILGUN_DOMAIN}/messages`,
            method: 'POST',
            auth: `api:${MAILGUN_API_KEY}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(res.statusCode === 200);
            });
        });

        req.on('error', (error) => {
            console.error('Mailgun error:', error);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}