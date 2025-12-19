Write-Host "Installing dependencies for all services..." -ForegroundColor Cyan

$rootDir = Split-Path $PSScriptRoot -Parent
$servicesDir = Join-Path $rootDir "services"

$services = @(
    "api-gateway",
    "auth-service",
    "user-service",
    "product-service",
    "order-service",
    "payment-service",
    "notification-service",
    "search-service",
    "review-service",
    "analytics-service"
)

foreach ($service in $services) {
    $servicePath = Join-Path $servicesDir $service
    if (Test-Path (Join-Path $servicePath "package.json")) {
        Write-Host "Installing dependencies for $service..." -ForegroundColor Yellow
        Set-Location $servicePath
        npm install
        Write-Host "  Done!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "All dependencies installed!" -ForegroundColor Green

