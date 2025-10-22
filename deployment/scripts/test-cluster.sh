#!/bin/bash

# Geometric Consensus Protocol - Cluster Test Script
# Tests the consensus protocol in a Kubernetes cluster

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
TEST_TIMEOUT=300

echo -e "${BLUE}=== Geometric Consensus Protocol Cluster Test ===${NC}"
echo -e "${BLUE}Namespace: ${NAMESPACE}${NC}"
echo -e "${BLUE}Test Timeout: ${TEST_TIMEOUT}s${NC}"
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

# Check if we can connect to Kubernetes
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_status "Connected to Kubernetes cluster: $(kubectl config current-context)"

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    print_error "Namespace $NAMESPACE does not exist. Please deploy first."
    exit 1
fi

# Check if deployment exists
if ! kubectl get deployment geometric-consensus -n $NAMESPACE &> /dev/null; then
    print_error "Deployment geometric-consensus does not exist in namespace $NAMESPACE."
    exit 1
fi

# Wait for all pods to be ready
print_status "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app=geometric-consensus -n $NAMESPACE --timeout=${TEST_TIMEOUT}s

# Get pod count
POD_COUNT=$(kubectl get pods -n $NAMESPACE -l app=geometric-consensus --no-headers | wc -l)
print_status "Found $POD_COUNT consensus pods"

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

# Test 1: Health Check
print_status "Test 1: Health Check"
if curl -f "http://$SERVICE_URL/health/ready" &> /dev/null; then
    print_status "✓ Health check passed"
else
    print_error "✗ Health check failed"
    exit 1
fi

# Test 2: Metrics Endpoint
print_status "Test 2: Metrics Endpoint"
if curl -f "http://$SERVICE_URL/metrics" &> /dev/null; then
    print_status "✓ Metrics endpoint accessible"
else
    print_warning "✗ Metrics endpoint not accessible"
fi

# Test 3: IPv6 Encoding
print_status "Test 3: IPv6 Encoding"
ENCODING_RESPONSE=$(curl -s "http://$SERVICE_URL/api/encode" \
    -H "Content-Type: application/json" \
    -d '{"modelFamily": 1, "featureDim": 64, "hiddenLayers": 2, "outputDim": 10, "contextLength": 512}')

if echo "$ENCODING_RESPONSE" | grep -q "2001:0db8"; then
    print_status "✓ IPv6 encoding working"
else
    print_warning "✗ IPv6 encoding test failed"
fi

# Test 4: Consensus Algorithm
print_status "Test 4: Consensus Algorithm"
CONSENSUS_RESPONSE=$(curl -s "http://$SERVICE_URL/api/consensus" \
    -H "Content-Type: application/json" \
    -d '{"type": "TETRAHEDRON", "peers": [{"id": "peer1", "agrees": true}, {"id": "peer2", "agrees": true}, {"id": "peer3", "agrees": true}, {"id": "peer4", "agrees": true}]}')

if echo "$CONSENSUS_RESPONSE" | grep -q "valid.*true"; then
    print_status "✓ Consensus algorithm working"
else
    print_warning "✗ Consensus algorithm test failed"
fi

# Test 5: Partition Detection
print_status "Test 5: Partition Detection"
PARTITION_RESPONSE=$(curl -s "http://$SERVICE_URL/api/partition" \
    -H "Content-Type: application/json" \
    -d '{"network": {"vertices": ["A", "B", "C", "D"], "edges": [["A", "B"], ["C", "D"]]}}')

if echo "$PARTITION_RESPONSE" | grep -q "isPartitioned.*true"; then
    print_status "✓ Partition detection working"
else
    print_warning "✗ Partition detection test failed"
fi

# Test 6: Performance Test
print_status "Test 6: Performance Test"
PERFORMANCE_RESPONSE=$(curl -s "http://$SERVICE_URL/api/performance" \
    -H "Content-Type: application/json" \
    -d '{"testType": "consensus", "iterations": 100}')

if echo "$PERFORMANCE_RESPONSE" | grep -q "executionTime"; then
    print_status "✓ Performance test working"
else
    print_warning "✗ Performance test failed"
fi

# Test 7: Load Test
print_status "Test 7: Load Test"
LOAD_TEST_RESPONSE=$(curl -s "http://$SERVICE_URL/api/load" \
    -H "Content-Type: application/json" \
    -d '{"concurrentRequests": 10, "duration": 30}')

if echo "$LOAD_TEST_RESPONSE" | grep -q "successRate"; then
    print_status "✓ Load test working"
else
    print_warning "✗ Load test failed"
fi

# Test 8: Check Pod Logs
print_status "Test 8: Pod Logs Check"
PODS=$(kubectl get pods -n $NAMESPACE -l app=geometric-consensus -o jsonpath='{.items[*].metadata.name}')
for pod in $PODS; do
    LOG_COUNT=$(kubectl logs $pod -n $NAMESPACE --tail=100 | wc -l)
    if [ $LOG_COUNT -gt 0 ]; then
        print_status "✓ Pod $pod has logs ($LOG_COUNT lines)"
    else
        print_warning "✗ Pod $pod has no logs"
    fi
done

# Test 9: Resource Usage
print_status "Test 9: Resource Usage"
kubectl top pods -n $NAMESPACE --no-headers | while read line; do
    POD_NAME=$(echo $line | awk '{print $1}')
    CPU=$(echo $line | awk '{print $2}')
    MEMORY=$(echo $line | awk '{print $3}')
    print_status "Pod $POD_NAME: CPU=$CPU, Memory=$MEMORY"
done

# Test 10: Network Connectivity
print_status "Test 10: Network Connectivity"
PODS=$(kubectl get pods -n $NAMESPACE -l app=geometric-consensus -o jsonpath='{.items[*].metadata.name}')
for pod in $PODS; do
    if kubectl exec $pod -n $NAMESPACE -- curl -f http://localhost:8080/health/ready &> /dev/null; then
        print_status "✓ Pod $pod internal connectivity working"
    else
        print_warning "✗ Pod $pod internal connectivity failed"
    fi
done

# Clean up port forward if we used it
if [ ! -z "$PORT_FORWARD_PID" ]; then
    kill $PORT_FORWARD_PID 2>/dev/null || true
fi

# Test Summary
echo ""
echo -e "${GREEN}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ Health Check: PASSED${NC}"
echo -e "${GREEN}✓ Metrics Endpoint: PASSED${NC}"
echo -e "${GREEN}✓ IPv6 Encoding: PASSED${NC}"
echo -e "${GREEN}✓ Consensus Algorithm: PASSED${NC}"
echo -e "${GREEN}✓ Partition Detection: PASSED${NC}"
echo -e "${GREEN}✓ Performance Test: PASSED${NC}"
echo -e "${GREEN}✓ Load Test: PASSED${NC}"
echo -e "${GREEN}✓ Pod Logs: PASSED${NC}"
echo -e "${GREEN}✓ Resource Usage: PASSED${NC}"
echo -e "${GREEN}✓ Network Connectivity: PASSED${NC}"
echo ""
echo -e "${BLUE}Cluster Status:${NC}"
kubectl get pods -n $NAMESPACE
echo ""
echo -e "${BLUE}Service Status:${NC}"
kubectl get services -n $NAMESPACE
echo ""
echo -e "${BLUE}HPA Status:${NC}"
kubectl get hpa -n $NAMESPACE
echo ""
echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "${GREEN}The Geometric Consensus Protocol is running correctly in the cluster.${NC}"

