#!/bin/bash

# Deploy Monitoring Alert Lambda Function (Quick Update)
# This script updates only the monitoring alert Lambda function code

set -e

echo "🚀 Updating Verkflöde Monitoring Alert Lambda..."

# Check if the CloudFormation stack exists
STACK_NAME=${STACK_NAME:-verkflode-infrastructure}
AWS_REGION=${AWS_REGION:-eu-north-1}

if ! aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION >/dev/null 2>&1; then
    echo "❌ CloudFormation stack '$STACK_NAME' not found."
    echo ""
    echo "   Please deploy the main infrastructure first using:"
    echo "   cd aws-backend && ./deploy.sh"
    echo ""
    echo "   This will set up both contact forms and monitoring alerts with Mailgun."
    exit 1
fi

echo "✅ Found existing CloudFormation stack with Mailgun configuration"

# Create deployment package for monitoring alert Lambda
echo "📦 Creating monitoring alert Lambda deployment package..."
cd lambda/monitoring-alert
zip -r ../monitoring-alert.zip . -x "*.git*" "*.DS_Store*"
cd ../..

# Update the monitoring alert Lambda function
echo "🔄 Updating monitoring alert Lambda function..."
aws lambda update-function-code \
    --function-name verkflode-monitoring-alert \
    --zip-file fileb://lambda/monitoring-alert.zip \
    --region $AWS_REGION

# Clean up
rm lambda/monitoring-alert.zip

echo ""
echo "✅ Monitoring alert Lambda function updated successfully!"

# Get the API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`MonitoringAlertApiEndpoint`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -n "$API_ENDPOINT" ]; then
    echo ""
    echo "📡 Monitoring Alert API Endpoint:"
    echo "   $API_ENDPOINT"
    echo ""
    echo "🔧 Update your monitoring configuration with this endpoint:"
    echo "   Edit: dot-se/admin/monitoring/monitoring-config.js"
    echo "   Set: alerts.email.apiEndpoint = '$API_ENDPOINT'"
else
    echo ""
    echo "⚠️  Could not retrieve API endpoint."
fi

echo ""
echo "📧 To test email alerts:"
echo "   1. Access: /admin/swedish-monitoring-dashboard.html"
echo "   2. Click: 'Test Email Alert' button"
echo "   3. Check your email inbox"