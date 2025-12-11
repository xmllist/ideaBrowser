#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🕷️  ideaBrowser Web Crawler Setup${NC}\n"

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js is not installed${NC}"
    echo "Visit https://nodejs.org/ to install Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}\n"

# Check npm
echo -e "${BLUE}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm ${NPM_VERSION} found${NC}\n"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
echo "This may take a few minutes (includes Chromium download)"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}\n"
else
    echo -e "${YELLOW}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Create output directory
echo -e "${BLUE}Creating output directory...${NC}"
mkdir -p crawler_output/images
echo -e "${GREEN}✅ Output directory created${NC}\n"

echo -e "${GREEN}Setup complete! 🎉${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review and customize crawler.js if needed"
echo "2. Run the crawler:"
echo -e "   ${YELLOW}npm start${NC}"
echo ""
echo "For more info, see README.md"
