#!/bin/bash

# QA Agent Setup Script
# This script helps you get QA Agent up and running

set -e

echo "🚀 QA Agent Setup"
echo "================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build the project
echo ""
echo -e "${BLUE}Building project...${NC}"
npm run build
echo -e "${GREEN}✓ Project built${NC}"

# Link globally (optional)
echo ""
read -p "Do you want to link qa-agent globally? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm link
    echo -e "${GREEN}✓ QA Agent linked globally${NC}"
fi

# Copy example files
echo ""
echo -e "${BLUE}Setting up configuration...${NC}"

if [ ! -f "qa-agent.config.json" ]; then
    cp qa-agent.config.example.json qa-agent.config.json
    echo -e "${YELLOW}✓ Created qa-agent.config.json (from example)${NC}"
    echo "  Please edit this file with your Azure DevOps details"
else
    echo -e "${GREEN}✓ qa-agent.config.json already exists${NC}"
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}✓ Created .env (from example)${NC}"
    echo "  Please edit this file with your credentials"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

# Create output directories
mkdir -p scenarios
mkdir -p tests
mkdir -p screenshots
echo -e "${GREEN}✓ Created output directories${NC}"

# Final instructions
echo ""
echo "================="
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit your configuration:"
echo "   ${BLUE}qa-agent config${NC}"
echo ""
echo "2. Or manually edit:"
echo "   ${BLUE}qa-agent.config.json${NC}"
echo "   or"
echo "   ${BLUE}.env${NC}"
echo ""
echo "3. Run your first sync:"
echo "   ${BLUE}qa-agent sync${NC}"
echo ""
echo "For more information, see:"
echo "  - GETTING_STARTED.md (5-minute guide)"
echo "  - INSTALLATION.md (detailed setup)"
echo "  - README.md (complete documentation)"
echo ""
echo -e "${YELLOW}Happy testing! 🎭${NC}"
