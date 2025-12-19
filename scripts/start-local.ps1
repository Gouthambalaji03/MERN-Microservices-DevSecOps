Write-Host "Starting MERN Microservices DevSecOps Stack..." -ForegroundColor Cyan

$rootDir = Split-Path $PSScriptRoot -Parent

Write-Host "1. Checking Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if (-not $dockerVersion) {
    Write-Host "Docker is not installed or not running!" -ForegroundColor Red
    exit 1
}
Write-Host "  Docker found: $dockerVersion" -ForegroundColor Green

Write-Host "2. Building and starting containers..." -ForegroundColor Yellow
Set-Location $rootDir

docker-compose down 2>$null
docker-compose up --build -d

Write-Host "3. Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "4. Checking service health..." -ForegroundColor Yellow
$services = @(
    @{Name="API Gateway"; Port=3000},
    @{Name="Auth Service"; Port=3001},
    @{Name="User Service"; Port=3002},
    @{Name="Product Service"; Port=3003},
    @{Name="Order Service"; Port=3004},
    @{Name="Payment Service"; Port=3005},
    @{Name="Notification Service"; Port=3006},
    @{Name="Search Service"; Port=3007},
    @{Name="Review Service"; Port=3008},
    @{Name="Analytics Service"; Port=3009}
)

foreach ($svc in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  $($svc.Name): OK" -ForegroundColor Green
    } catch {
        Write-Host "  $($svc.Name): FAILED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Services are running!" -ForegroundColor Green
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  API Gateway:    http://localhost:3000" -ForegroundColor White
Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor White
Write-Host "  Grafana:        http://localhost:3030 (admin/admin123)" -ForegroundColor White
Write-Host "  MailHog:        http://localhost:8025" -ForegroundColor White
Write-Host ""
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow

