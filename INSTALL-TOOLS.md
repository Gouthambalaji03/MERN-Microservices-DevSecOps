# Tool Installation Guide

Your system status:
- ✅ Node.js v22.17.0 (Excellent!)
- ✅ npm 11.6.0 (Excellent!)
- ✅ Git 2.40.1 (Good!)
- ✅ Docker 28.3.0 (Excellent!)
- ✅ Docker Compose v2.38.1 (Excellent!)
- ❌ kubectl (Required for K8s)
- ❌ Minikube (Optional - for local K8s)
- ❌ Helm (Required for deployments)
- ❌ Trivy (Required for security scanning)
- ❌ Snyk (Required for dependency scanning)

## Missing Tools Installation (Windows)

### 1. Install kubectl

**Method 1: Using Chocolatey (Recommended)**
```powershell
choco install kubernetes-cli -y
```

**Method 2: Manual Installation**
```powershell
# Download kubectl
curl.exe -LO "https://dl.k8s.io/release/v1.29.0/bin/windows/amd64/kubectl.exe"

# Create kubectl directory
New-Item -Path "$env:USERPROFILE\kubectl" -ItemType Directory -Force

# Move kubectl.exe to the directory
Move-Item kubectl.exe "$env:USERPROFILE\kubectl\"

# Add to PATH
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\kubectl", [EnvironmentVariableTarget]::User)

# Verify (restart PowerShell first)
kubectl version --client
```

### 2. Install Helm

**Method 1: Using Chocolatey (Recommended)**
```powershell
choco install kubernetes-helm -y
```

**Method 2: Using Scoop**
```powershell
scoop install helm
```

**Method 3: Manual Installation**
```powershell
# Download Helm installer
$helmVersion = "v3.15.0"
Invoke-WebRequest -Uri "https://get.helm.sh/helm-$helmVersion-windows-amd64.zip" -OutFile helm.zip

# Extract
Expand-Archive helm.zip -DestinationPath C:\helm -Force

# Add to PATH
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\helm\windows-amd64", [EnvironmentVariableTarget]::User)

# Verify (restart PowerShell first)
helm version
```

### 3. Install Minikube (Optional - for local development)

**Note**: You already have Docker Desktop, which includes Kubernetes. You can enable it in Docker Desktop settings instead of installing Minikube.

**Option A: Enable Kubernetes in Docker Desktop (Easier)**
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait 2-3 minutes for K8s to start
6. Verify: `kubectl cluster-info`

**Option B: Install Minikube**
```powershell
# Using Chocolatey
choco install minikube -y

# Or download installer
# https://github.com/kubernetes/minikube/releases/latest

# Start Minikube (requires restart of PowerShell)
minikube start --driver=docker --cpus=4 --memory=8192
```

### 4. Install Trivy

**Method 1: Using Chocolatey**
```powershell
choco install trivy -y
```

**Method 2: Using Scoop**
```powershell
scoop bucket add aquasecurity https://github.com/aquasecurity/scoop-bucket
scoop install trivy
```

**Method 3: Manual Installation**
```powershell
# Download latest release from GitHub
$trivyVersion = "0.54.1"
Invoke-WebRequest -Uri "https://github.com/aquasecurity/trivy/releases/download/v$trivyVersion/trivy_$($trivyVersion)_Windows-64bit.zip" -OutFile trivy.zip

# Extract
Expand-Archive trivy.zip -DestinationPath C:\trivy -Force

# Add to PATH
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\trivy", [EnvironmentVariableTarget]::User)

# Verify (restart PowerShell first)
trivy --version
```

### 5. Install Snyk

**Simple: Using npm (You already have Node.js)**
```powershell
npm install -g snyk

# Authenticate (creates free account)
snyk auth
```

This will open a browser window. Sign up for a free Snyk account to get your API token.

## Verification After Installation

After installing missing tools, close and reopen PowerShell, then run:

```powershell
cd c:\Users\26gou\MERN-Microservices-DevSecOps
.\scripts\check-tools.ps1
```

## Recommended: Install Additional Tools

These are optional but make development easier:

### k9s (Kubernetes CLI UI)
```powershell
choco install k9s -y
```

### VS Code Extensions
- Docker (ms-azuretools.vscode-docker)
- Kubernetes (ms-kubernetes-tools.vscode-kubernetes-tools)
- YAML (redhat.vscode-yaml)
- Remote - Containers (ms-vscode-remote.remote-containers)
- GitLens (eamodio.gitlens)

## Quick Install All (Chocolatey)

If you have Chocolatey, run this single command:

```powershell
# Run PowerShell as Administrator
choco install kubernetes-cli kubernetes-helm trivy k9s -y

# Then as regular user
npm install -g snyk
snyk auth
```

## Next Steps After Installation

1. **Verify all tools**: Run `.\scripts\check-tools.ps1`
2. **Start Kubernetes**:
   - Docker Desktop K8s: Enable in settings
   - OR Minikube: `minikube start`
3. **Verify K8s**: `kubectl cluster-info`
4. **Create project structure**: `.\scripts\create-structure.ps1`
5. **Proceed to Phase 1**: Architecture design

## Troubleshooting

### kubectl not found after install
- Close and reopen PowerShell
- Check PATH: `$env:Path -split ';' | Select-String kubectl`
- If not in PATH, add manually

### Docker Desktop Kubernetes not starting
- Ensure WSL2 is installed: `wsl --install`
- Allocate more resources in Docker Desktop settings
- Reset Kubernetes cluster in Docker Desktop

### Trivy certificate errors
```powershell
# Set environment variable
[Environment]::SetEnvironmentVariable("TRIVY_INSECURE", "true", [EnvironmentVariableTarget]::User)
```

### Snyk auth not working
```powershell
# Use token directly
snyk config set api=YOUR_TOKEN_HERE
```

Get your token from: https://app.snyk.io/account

## Estimated Time

- kubectl: 2-3 minutes
- Helm: 2-3 minutes
- Trivy: 3-5 minutes
- Snyk: 1-2 minutes
- Minikube (optional): 5-10 minutes

Total: **15-25 minutes** for all tools
