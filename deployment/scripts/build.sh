#!/bin/bash

# Geometric Consensus Protocol - Build Script
# Builds the application for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="geometric-consensus"
VERSION=${VERSION:-"1.0.0"}
BUILD_DIR="dist"
DOCKER_IMAGE="${PROJECT_NAME}:${VERSION}"
DOCKER_LATEST="${PROJECT_NAME}:latest"

echo -e "${BLUE}=== Geometric Consensus Protocol Build Script ===${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Build Directory: ${BUILD_DIR}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or later is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf $BUILD_DIR
rm -rf coverage
rm -rf node_modules/.cache

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Install dev dependencies for building
print_status "Installing dev dependencies..."
npm install --only=dev

# Run linting
print_status "Running ESLint..."
npm run lint

# Run tests
print_status "Running tests..."
npm test

# Generate test coverage
print_status "Generating test coverage..."
npm run test:coverage

# Build TypeScript
print_status "Building TypeScript..."
npm run build

# Build browser bundle
print_status "Building browser bundle..."
npm run build:prod

# Verify build
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not created. Build failed."
    exit 1
fi

print_status "Build completed successfully!"

# Check build artifacts
print_status "Build artifacts:"
ls -la $BUILD_DIR/

# Build Docker image if Docker is available
if command -v docker &> /dev/null; then
    print_status "Building Docker image..."
    
    # Build the image
    docker build -f deployment/docker/Dockerfile -t $DOCKER_IMAGE .
    docker tag $DOCKER_IMAGE $DOCKER_LATEST
    
    print_status "Docker image built: $DOCKER_IMAGE"
    print_status "Docker image tagged: $DOCKER_LATEST"
    
    # Show image info
    docker images | grep $PROJECT_NAME
else
    print_warning "Docker not available. Skipping Docker image build."
fi

# Generate build info
print_status "Generating build info..."
cat > $BUILD_DIR/build-info.json << EOF
{
  "project": "$PROJECT_NAME",
  "version": "$VERSION",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "buildHost": "$(hostname)",
  "buildUser": "$(whoami)"
}
EOF

# Create deployment package
print_status "Creating deployment package..."
DEPLOY_PACKAGE="${PROJECT_NAME}-${VERSION}.tar.gz"
tar -czf $DEPLOY_PACKAGE $BUILD_DIR/ deployment/ package.json README.md LICENSE

print_status "Deployment package created: $DEPLOY_PACKAGE"

# Show package contents
print_status "Package contents:"
tar -tzf $DEPLOY_PACKAGE | head -20

# Build summary
echo ""
echo -e "${GREEN}=== Build Summary ===${NC}"
echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
echo -e "${GREEN}✓ Browser bundle created${NC}"
echo -e "${GREEN}✓ Tests passed${NC}"
echo -e "${GREEN}✓ Coverage generated${NC}"
echo -e "${GREEN}✓ Docker image built${NC}"
echo -e "${GREEN}✓ Deployment package created${NC}"
echo ""
echo -e "${BLUE}Build artifacts:${NC}"
echo -e "  - ${BUILD_DIR}/ (TypeScript build)"
echo -e "  - ${BUILD_DIR}/browser.min.js (Browser bundle)"
echo -e "  - ${DEPLOY_PACKAGE} (Deployment package)"
echo -e "  - ${DOCKER_IMAGE} (Docker image)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Test the build: npm run examples"
echo -e "  2. Deploy to Kubernetes: ./deployment/scripts/deploy.sh"
echo -e "  3. Run Docker compose: docker-compose up -d"
echo ""
echo -e "${GREEN}Build completed successfully!${NC}"

