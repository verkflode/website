const https = require('https');
const querystring = require('querystring');

// Environment variables (set these in Lambda console or CloudFormation)
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

exports.handler = async (event) => {
    console.log('Monitoring alert request received:', JSON.stringify(event, null, 2));
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('Invalid JSON in request body:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }
        
        // Validate required fields
        if (!requestData.type || requestData.type !== 'monitoring_alert') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request type' })
            };
        }
        
        if (!requestData.subject || !requestData.html || !requestData.text) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required email fields' })
            };
        }
        
        // Validate origin (basic security)
        const origin = event.headers.origin || event.headers.Origin;
        const allowedOrigins = [
            'https://verkflode.se',
            'https://www.verkflode.se',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        if (origin && !allowedOrigins.includes(origin)) {
            console.warn('Request from unauthorized origin:', origin);
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Unauthorized origin' })
            };
        }
        
        // Send monitoring alert email
        const emailSent = await sendMonitoringAlert(requestData);
        
        if (emailSent) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Monitoring alert sent successfully' 
                })
            };
        } else {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to send monitoring alert' 
                })
            };
        }
        
    } catch (error) {
        console.error('Error processing monitoring alert:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};

async function sendMonitoringAlert(alertData) {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
        console.error('Mailgun credentials not configured');
        return false;
    }
    
    // Prepare email recipients
    const toEmails = Array.isArray(alertData.to) ? alertData.to : [alertData.to];
    const toEmailString = toEmails.join(', ');
    
    // Prepare email data
    const postData = querystring.stringify({
        from: alertData.from || `Verkflöde Monitoring <monitoring@${MAILGUN_DOMAIN}>`,
        to: toEmailString,
        subject: alertData.subject,
        html: alertData.html,
        text: alertData.text,
        'o:tag': ['monitoring', 'alert', 'swedish-site'],
        'o:tracking': 'yes'
    });
    
    console.log('Sending monitoring alert email to:', toEmailString);
    console.log('Subject:', alertData.subject);
    
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.eu.mailgun.net',
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
                console.log(`Mailgun response status: ${res.statusCode}`);
                console.log(`Mailgun response body: ${data}`);
                
                resolve(res.statusCode === 200);
            });
        });
        
        req.on('error', (error) => {
            console.error('Mailgun request error:', error);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}