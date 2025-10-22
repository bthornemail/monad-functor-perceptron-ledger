#!/bin/bash

# Geometric Consensus Protocol - Deployment Script
# Deploys the application to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="geometric-consensus"
NAMESPACE="geometric-consensus"
VERSION=${VERSION:-"1.0.0"}
DOCKER_IMAGE="${PROJECT_NAME}:${VERSION}"
KUBECONFIG=${KUBECONFIG:-"~/.kube/config"}

echo -e "${BLUE}=== Geometric Consensus Protocol Deployment Script ===${NC}"
echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Namespace: ${NAMESPACE}${NC}"
echo -e "${BLUE}Docker Image: ${DOCKER_IMAGE}${NC}"
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

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl."
    exit 1
fi

print_status "kubectl version: $(kubectl version --client --short)"

# Check if we can connect to Kubernetes
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_status "Connected to Kubernetes cluster: $(kubectl config current-context)"

# Check if we're in the right directory
if [ ! -d "deployment/k8s" ]; then
    print_error "deployment/k8s directory not found. Please run this script from the project root."
    exit 1
fi

# Create namespace if it doesn't exist
print_status "Creating namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
print_status "Applying Kubernetes manifests..."

# Apply in order
kubectl apply -f deployment/k8s/namespace.yaml
kubectl apply -f deployment/k8s/configmap.yaml
kubectl apply -f deployment/k8s/service.yaml
kubectl apply -f deployment/k8s/deployment.yaml
kubectl apply -f deployment/k8s/ingress.yaml
kubectl apply -f deployment/k8s/hpa.yaml

# Wait for deployment to be ready
print_status "Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/geometric-consensus -n $NAMESPACE

# Check deployment status
print_status "Deployment status:"
kubectl get deployments -n $NAMESPACE

# Check pod status
print_status "Pod status:"
kubectl get pods -n $NAMESPACE

# Check service status
print_status "Service status:"
kubectl get services -n $NAMESPACE

# Check ingress status
print_status "Ingress status:"
kubectl get ingress -n $NAMESPACE

# Check HPA status
print_status "HPA status:"
kubectl get hpa -n $NAMESPACE

# Get service endpoints
print_status "Service endpoints:"
kubectl get endpoints -n $NAMESPACE

# Show logs from one pod
print_status "Showing logs from first pod:"
FIRST_POD=$(kubectl get pods -n $NAMESPACE -l app=geometric-consensus -o jsonpath='{.items[0].metadata.name}')
if [ ! -z "$FIRST_POD" ]; then
    kubectl logs $FIRST_POD -n $NAMESPACE --tail=20
else
    print_warning "No pods found to show logs from"
fi

# Test the deployment
print_status "Testing deployment..."

# Get service URL
SERVICE_URL=$(kubectl get service geometric-consensus-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z "$SERVICE_URL" ]; then
    SERVICE_URL=$(kubectl get service geometric-consensus-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
fi

if [ -z "$SERVICE_URL" ]; then
    print_warning "LoadBalancer IP not available. Using port-forward for testing."
    # Port forward for testing
    kubectl port-forward service/geometric-consensus-service 8080:80 -n $NAMESPACE &
    PORT_FORWARD_PID=$!
    sleep 5
    SERVICE_URL="localhost:8080"
fi

# Test health endpoint
print_status "Testing health endpoint..."
if curl -f "http://$SERVICE_URL/health/ready" &> /dev/null; then
    print_status "✓ Health check passed"
else
    print_warning "✗ Health check failed"
fi

# Test metrics endpoint
print_status "Testing metrics endpoint..."
if curl -f "http://$SERVICE_URL/metrics" &> /dev/null; then
    print_status "✓ Metrics endpoint accessible"
else
    print_warning "✗ Metrics endpoint not accessible"
fi

# Clean up port forward if we used it
if [ ! -z "$PORT_FORWARD_PID" ]; then
    kill $PORT_FORWARD_PID 2>/dev/null || true
fi

# Show deployment summary
echo ""
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo -e "${GREEN}✓ Namespace created: $NAMESPACE${NC}"
echo -e "${GREEN}✓ ConfigMap applied${NC}"
echo -e "${GREEN}✓ Service deployed${NC}"
echo -e "${GREEN}✓ Deployment ready${NC}"
echo -e "${GREEN}✓ Ingress configured${NC}"
echo -e "${GREEN}✓ HPA enabled${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  - Service: http://$SERVICE_URL"
echo -e "  - Health: http://$SERVICE_URL/health/ready"
echo -e "  - Metrics: http://$SERVICE_URL/metrics"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  - View pods: kubectl get pods -n $NAMESPACE"
echo -e "  - View logs: kubectl logs -f deployment/geometric-consensus -n $NAMESPACE"
echo -e "  - Scale deployment: kubectl scale deployment geometric-consensus --replicas=10 -n $NAMESPACE"
echo -e "  - Delete deployment: kubectl delete namespace $NAMESPACE"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"

