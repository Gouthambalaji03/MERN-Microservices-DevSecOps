#!/bin/bash

# Prerequisites Verification Script for Linux/Mac
# This script checks all required tools for the DevSecOps project

echo "========================================"
echo "DevSecOps Project - Prerequisites Check"
echo "========================================"
echo ""

all_tools_installed=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Function to check tool version
check_tool() {
    local name=$1
    local command=$2
    local min_version=$3

    echo -n "Checking $name... "

    if output=$(eval $command 2>&1); then
        echo -e "${GREEN}✓ INSTALLED${NC}"
        echo -e "  ${GRAY}Version: $output${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        echo -e "  ${YELLOW}Required: $min_version+${NC}"
        return 1
    fi
}

# Check Node.js
check_tool "Node.js" "node --version" "v18.x" || all_tools_installed=false

# Check npm
check_tool "npm" "npm --version" "9.x" || all_tools_installed=false

# Check Git
check_tool "Git" "git --version" "2.30" || all_tools_installed=false

# Check Docker
check_tool "Docker" "docker --version" "24.x" || all_tools_installed=false

# Check Docker Compose
check_tool "Docker Compose" "docker compose version" "2.x" || all_tools_installed=false

# Check kubectl
check_tool "kubectl" "kubectl version --client --short 2>/dev/null" "1.28" || all_tools_installed=false

# Check Minikube
if ! check_tool "Minikube" "minikube version --short 2>/dev/null" "1.32"; then
    echo -e "  ${YELLOW}Note: Minikube is optional if using cloud K8s (EKS/GKE/AKS)${NC}"
fi

# Check Helm
check_tool "Helm" "helm version --short" "3.12" || all_tools_installed=false

# Check Trivy
if ! check_tool "Trivy" "trivy --version" "latest"; then
    echo -e "  ${YELLOW}Install: https://aquasecurity.github.io/trivy/${NC}"
    all_tools_installed=false
fi

# Check Snyk
if ! check_tool "Snyk" "snyk --version" "latest"; then
    echo -e "  ${YELLOW}Install: npm install -g snyk${NC}"
    all_tools_installed=false
fi

echo ""
echo "========================================"

if [ "$all_tools_installed" = true ]; then
    echo -e "${GREEN}✓ All required tools are installed!${NC}"
    echo -e "${GREEN}You are ready to proceed with the project.${NC}"
else
    echo -e "${RED}✗ Some tools are missing.${NC}"
    echo -e "${YELLOW}Please install the missing tools before proceeding.${NC}"
    echo ""
    echo -e "${CYAN}Installation Guide:${NC}"
    echo -e "  ${GRAY}Node.js: https://nodejs.org/${NC}"
    echo -e "  ${GRAY}Docker Desktop: https://www.docker.com/products/docker-desktop${NC}"
    echo -e "  ${GRAY}kubectl: https://kubernetes.io/docs/tasks/tools/${NC}"
    echo -e "  ${GRAY}Minikube: https://minikube.sigs.k8s.io/docs/start/${NC}"
    echo -e "  ${GRAY}Helm: https://helm.sh/docs/intro/install/${NC}"
    echo -e "  ${GRAY}Trivy: https://aquasecurity.github.io/trivy/${NC}"
    echo -e "  ${GRAY}Snyk: npm install -g snyk${NC}"
fi

echo "========================================"
echo ""
