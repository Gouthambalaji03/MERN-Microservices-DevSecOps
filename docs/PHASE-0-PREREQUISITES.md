# Phase 0: Prerequisites Setup

## Overview
This phase ensures your development environment is properly configured with all required tools for building a production-grade DevSecOps project.

## Why These Tools Matter

### Development Tools
- **Node.js v18/v20**: LTS versions provide stability and long-term support
- **npm/yarn**: Package management and dependency resolution
- **Git**: Version control and CI/CD integration

### Container & Orchestration
- **Docker**: Application containerization for consistency across environments
- **Docker Compose**: Multi-container orchestration for local development
- **kubectl**: Kubernetes cluster management CLI
- **Minikube/Cloud K8s**: Local or cloud-based Kubernetes cluster
- **Helm**: Kubernetes package manager for templated deployments

### Security Tools
- **Trivy**: Vulnerability scanning for container images and filesystems
- **Snyk**: Dependency vulnerability scanning and monitoring

### Why Production-Grade Tools?
In real-world scenarios:
- **Trivy** catches vulnerabilities before they reach production (shifting security left)
- **Helm** enables consistent deployments across environments with value overrides
- **kubectl** provides direct cluster access for debugging production issues
- **Docker multi-stage builds** reduce image size and attack surface

## Installation Instructions

### Windows (using Chocolatey or manual installation)

```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install tools
choco install nodejs-lts -y
choco install git -y
choco install docker-desktop -y
choco install kubernetes-cli -y
choco install minikube -y
choco install kubernetes-helm -y

# Install security tools
choco install trivy -y
npm install -g snyk
```

### macOS (using Homebrew)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install node@20
brew install git
brew install docker
brew install kubectl
brew install minikube
brew install helm
brew install trivy
npm install -g snyk
```

### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install -y git

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Trivy
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Snyk
npm install -g snyk
```

## Verification Steps

### Step 1: Run the verification script

**Windows:**
```powershell
cd c:\Users\26gou\MERN-Microservices-DevSecOps
.\scripts\verify-prerequisites.ps1
```

**Linux/Mac:**
```bash
cd MERN-Microservices-DevSecOps
chmod +x scripts/verify-prerequisites.sh
./scripts/verify-prerequisites.sh
```

### Step 2: Verify Docker

```bash
docker run hello-world
```

Expected: "Hello from Docker!" message

### Step 3: Start Minikube (Local Development)

```bash
# Start with sufficient resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

Expected: Cluster running with 1 node in Ready state

### Step 4: Verify Helm

```bash
helm version
helm repo add stable https://charts.helm.sh/stable
helm repo update
```

### Step 5: Authenticate Security Tools

```bash
# Snyk authentication (requires free account)
snyk auth

# Trivy doesn't require authentication but verify it works
trivy image --severity HIGH,CRITICAL nginx:latest
```

## Create Project Structure

After all tools are verified, create the directory structure:

**Windows:**
```powershell
.\scripts\create-structure.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/create-structure.sh
./scripts/create-structure.sh
```

## Expected Directory Structure

```
MERN-Microservices-DevSecOps/
├── frontend/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── search-service/
│   ├── review-service/
│   └── analytics-service/
├── docker/
├── k8s/
├── helm/
├── terraform/
├── monitoring/
├── logging/
├── .github/workflows/
├── scripts/
└── docs/
```

## Troubleshooting

### Docker Desktop not starting (Windows)
- Enable WSL2: `wsl --install`
- Enable Hyper-V in Windows Features
- Restart computer

### kubectl: connection refused
```bash
# Check if Minikube is running
minikube status

# If not running
minikube start
```

### Helm: repository not found
```bash
helm repo list
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### Trivy: permission denied
```bash
# Linux
sudo chmod +x /usr/local/bin/trivy

# Or reinstall
sudo apt-get install --reinstall trivy
```

## Interview Talking Points

When discussing prerequisites setup:

1. **Tool Selection Rationale**
   - "We use Trivy because it's lightweight, has an extensive CVE database, and integrates easily into CI/CD pipelines"
   - "Helm provides templating and versioning, making it easier to manage multiple environments"

2. **Production Considerations**
   - "In production, we'd use managed Kubernetes (EKS/GKE/AKS) instead of Minikube"
   - "Security tools are integrated into pre-commit hooks and CI pipelines to catch issues early"

3. **DevSecOps Philosophy**
   - "We shift security left by scanning dependencies and images before they reach the registry"
   - "Infrastructure as Code (Terraform) ensures reproducible environments"

## Next Steps

Once all prerequisites are verified:
1. ✅ All tools installed and verified
2. ✅ Docker and Minikube running
3. ✅ Project structure created
4. ➡️ **Proceed to Phase 1: Application Architecture**

## Checklist

- [ ] Node.js v18+ installed
- [ ] Docker and Docker Compose working
- [ ] kubectl configured
- [ ] Minikube cluster running
- [ ] Helm v3+ installed
- [ ] Trivy installed
- [ ] Snyk authenticated
- [ ] Project structure created
- [ ] Git repository initialized

---

**Estimated Time**: 30-60 minutes (depending on download speeds and system configuration)

**Next**: [Phase 1 - Application Architecture](./PHASE-1-ARCHITECTURE.md)
