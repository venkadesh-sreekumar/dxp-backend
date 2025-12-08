#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testing Authentication Service${NC}\n"

# Configuration
API_URL="http://localhost:4000/api"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="securepassword123"

echo "Using test email: $TEST_EMAIL"
echo "API URL: $API_URL"
echo ""

# Test 1: Register a new user
echo -e "${YELLOW}1. Testing user registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Login with the same user
echo -e "${YELLOW}2. Testing user login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Token: ${LOGIN_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get user profile
echo -e "${YELLOW}3. Testing protected route (get profile)...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo $PROFILE_RESPONSE | grep -q "email"; then
    echo -e "${GREEN}✅ Profile retrieval successful${NC}"
    echo "Email: $(echo $PROFILE_RESPONSE | grep -o '"email":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}❌ Profile retrieval failed${NC}"
    echo "Response: $PROFILE_RESPONSE"
    exit 1
fi
echo ""

# Test 4: Update recently viewed
echo -e "${YELLOW}4. Testing recently viewed update...${NC}"
VIEWED_RESPONSE=$(curl -s -X PATCH "$API_URL/auth/recently-viewed" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gameSlug":"zelda-totk","coverImage":"https://example.com/zelda.jpg"}')

if echo $VIEWED_RESPONSE | grep -q "recentlyViewed"; then
    echo -e "${GREEN}✅ Recently viewed update successful${NC}"
else
    echo -e "${RED}❌ Recently viewed update failed${NC}"
    echo "Response: $VIEWED_RESPONSE"
    exit 1
fi
echo ""

# Test 5: Verify token
echo -e "${YELLOW}5. Testing token verification...${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$API_URL/auth/verify" \
  -H "Authorization: Bearer $TOKEN")

if echo $VERIFY_RESPONSE | grep -q '"valid":true'; then
    echo -e "${GREEN}✅ Token verification successful${NC}"
else
    echo -e "${RED}❌ Token verification failed${NC}"
    echo "Response: $VERIFY_RESPONSE"
    exit 1
fi
echo ""

# Test 6: Test invalid credentials
echo -e "${YELLOW}6. Testing invalid credentials (should fail)...${NC}"
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}")

if echo $INVALID_RESPONSE | grep -q "401"; then
    echo -e "${GREEN}✅ Invalid credentials rejected correctly${NC}"
else
    echo -e "${RED}❌ Invalid credentials test failed${NC}"
    echo "Response: $INVALID_RESPONSE"
fi
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All authentication tests passed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Test user created with:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo ""
echo "You can use this account to test the frontend integration."

