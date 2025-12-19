# Prerequisites Verification Script for Windows
# This script checks all required tools for the DevSecOps project

Write-Host "========================================"
Write-Host "DevSecOps Project - Prerequisites Check"
Write-Host "========================================"
Write-Host ""

$global:allToolsInstalled = $true

function CheckTool {
    param (
        [string]$ToolName,
        [scriptblock]$VersionCommand,
        [string]$MinVersion,
        [bool]$Optional = $false
    )

    Write-Host "Checking $ToolName..." -NoNewline

    try {
        $output = & $VersionCommand 2>&1
        if ($LASTEXITCODE -eq 0 -and $output) {
            Write-Host " [OK]" -ForegroundColor Green
            Write-Host "  Version: $output" -ForegroundColor Gray
            return $true
        }
    }
    catch {
        Write-Host " [NOT FOUND]" -ForegroundColor Red
        if ($Optional) {
            Write-Host "  Note: Optional tool" -ForegroundColor Yellow
        } else {
            Write-Host "  Required: $MinVersion+" -ForegroundColor Yellow
            $global:allToolsInstalled = $false
        }
        return $false
    }

    Write-Host " [NOT FOUND]" -ForegroundColor Red
    if (!$Optional) {
        Write-Host "  Required: $MinVersion+" -ForegroundColor Yellow
        $global:allToolsInstalled = $false
    }
    return $false
}

# Check Node.js
CheckTool "Node.js" { node --version } "v18.x"

# Check npm
CheckTool "npm" { npm --version } "9.x"

# Check Git
CheckTool "Git" { git --version } "2.30"

# Check Docker
CheckTool "Docker" { docker --version } "24.x"

# Check Docker Compose
CheckTool "Docker Compose" { docker compose version } "2.x"

# Check kubectl
CheckTool "kubectl" { kubectl version --client --short } "1.28"

# Check Minikube (optional)
CheckTool "Minikube" { minikube version --short } "1.32" $true

# Check Helm
CheckTool "Helm" { helm version --short } "3.12"

# Check Trivy
if (!(CheckTool "Trivy" { trivy --version } "latest")) {
    Write-Host "  Install: https://aquasecurity.github.io/trivy/" -ForegroundColor Yellow
}

# Check Snyk
if (!(CheckTool "Snyk" { snyk --version } "latest")) {
    Write-Host "  Install: npm install -g snyk" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================"

if ($global:allToolsInstalled) {
    Write-Host "[SUCCESS] All required tools are installed!" -ForegroundColor Green
    Write-Host "You are ready to proceed with the project." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Some tools are missing." -ForegroundColor Red
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

Write-Host "========================================"
Write-Host ""
