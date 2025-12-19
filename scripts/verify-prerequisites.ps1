# Prerequisites Verification Script for Windows
# This script checks all required tools for the DevSecOps project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DevSecOps Project - Prerequisites Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allToolsInstalled = $true

# Function to check tool version
function Test-Tool {
    param (
        [string]$Name,
        [string]$Command,
        [string]$MinVersion
    )

    Write-Host "Checking $Name..." -NoNewline

    try {
        $output = Invoke-Expression $Command 2>&1
        if ($LASTEXITCODE -eq 0 -or $output) {
            Write-Host " ✓ INSTALLED" -ForegroundColor Green
            Write-Host "  Version: $output" -ForegroundColor Gray
            return $true
        }
    }
    catch {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        Write-Host "  Required: $MinVersion+" -ForegroundColor Yellow
        return $false
    }

    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "  Required: $MinVersion+" -ForegroundColor Yellow
    return $false
}

# Check Node.js
if (-not (Test-Tool "Node.js" "node --version" "v18.x")) { $allToolsInstalled = $false }

# Check npm
if (-not (Test-Tool "npm" "npm --version" "9.x")) { $allToolsInstalled = $false }

# Check Git
if (-not (Test-Tool "Git" "git --version" "2.30")) { $allToolsInstalled = $false }

# Check Docker
if (-not (Test-Tool "Docker" "docker --version" "24.x")) { $allToolsInstalled = $false }

# Check Docker Compose
if (-not (Test-Tool "Docker Compose" "docker compose version" "2.x")) { $allToolsInstalled = $false }

# Check kubectl
Write-Host "Checking kubectl..." -NoNewline
try {
    $kubectlVersion = kubectl version --client --short 2>&1 | Select-Object -First 1
    if ($LASTEXITCODE -eq 0 -or $kubectlVersion) {
        Write-Host " ✓ INSTALLED" -ForegroundColor Green
        Write-Host "  Version: $kubectlVersion" -ForegroundColor Gray
    } else {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        Write-Host "  Required: 1.28+" -ForegroundColor Yellow
        $allToolsInstalled = $false
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "  Required: 1.28+" -ForegroundColor Yellow
    $allToolsInstalled = $false
}

# Check Minikube
Write-Host "Checking Minikube..." -NoNewline
try {
    $minikubeVersion = minikube version --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ INSTALLED" -ForegroundColor Green
        Write-Host "  Version: $minikubeVersion" -ForegroundColor Gray
    } else {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        Write-Host "  Note: Minikube is optional if using cloud K8s (EKS/GKE/AKS)" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "  Note: Minikube is optional if using cloud K8s (EKS/GKE/AKS)" -ForegroundColor Yellow
}

# Check Helm
if (-not (Test-Tool "Helm" "helm version --short" "3.12")) { $allToolsInstalled = $false }

# Check Trivy
if (-not (Test-Tool "Trivy" "trivy --version" "latest")) {
    Write-Host "  Install: https://aquasecurity.github.io/trivy/" -ForegroundColor Yellow
    $allToolsInstalled = $false
}

# Check Snyk
Write-Host "Checking Snyk..." -NoNewline
try {
    $snykVersion = snyk --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ INSTALLED" -ForegroundColor Green
        Write-Host "  Version: $snykVersion" -ForegroundColor Gray
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "  Install: npm install -g snyk" -ForegroundColor Yellow
    $allToolsInstalled = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allToolsInstalled) {
    Write-Host "✓ All required tools are installed!" -ForegroundColor Green
    Write-Host "You are ready to proceed with the project." -ForegroundColor Green
} else {
    Write-Host "✗ Some tools are missing." -ForegroundColor Red
    Write-Host "Please install the missing tools before proceeding." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation Guide:" -ForegroundColor Cyan
    Write-Host "  Node.js: https://nodejs.org/" -ForegroundColor Gray
    Write-Host "  Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
    Write-Host "  kubectl: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Gray
    Write-Host "  Minikube: https://minikube.sigs.k8s.io/docs/start/" -ForegroundColor Gray
    Write-Host "  Helm: https://helm.sh/docs/intro/install/" -ForegroundColor Gray
    Write-Host "  Trivy: https://aquasecurity.github.io/trivy/" -ForegroundColor Gray
    Write-Host "  Snyk: npm install -g snyk" -ForegroundColor Gray
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
