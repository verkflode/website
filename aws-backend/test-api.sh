#!/bin/bash

# Test script for the contact form API
# Usage: ./test-api.sh <API_ENDPOINT>

if [ -z "$1" ]; then
    echo "Usage: ./test-api.sh <API_ENDPOINT>"
    echo "Example: ./test-api.sh https://abc123.execute-api.eu-north-1.amazonaws.com/prod/submit"
    exit 1
fi

API_ENDPOINT="$1"

echo "🧪 Testing Verkflöde Contact Form API..."
echo "Endpoint: $API_ENDPOINT"
echo ""

# Test data
TEST_DATA='{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "This is a test message from the API test script.",
    "cf-turnstile-response": "test-token"
}'

echo "📤 Sending test request..."
echo ""

# Make the request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Origin: https://verkflode.com" \
    -d "$TEST_DATA" \
    "$API_ENDPOINT")

# Parse response
HTTP_BODY=$(echo "$RESPONSE" | sed -E '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1 | sed -E 's/.*:([0-9]+)$/\1/')

echo "📥 Response:"
echo "Status: $HTTP_STATUS"
echo "Body: $HTTP_BODY"
echo ""

# Check result
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ API is working correctly!"
else
    echo "❌ API test failed with status $HTTP_STATUS"
    echo "💡 Check Lambda function logs in CloudWatch for details"
fi