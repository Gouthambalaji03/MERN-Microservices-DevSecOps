param(
    [string]$DockerHubUsername = "",
    [string]$Tag = "latest"
)

if (-not $DockerHubUsername) {
    Write-Host "Usage: .\deploy.ps1 -DockerHubUsername <your-dockerhub-username>" -ForegroundColor Red
    exit 1
}

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

Write-Host "`n=== Login to Docker Hub ===" -ForegroundColor Cyan
docker login

Write-Host "`n=== Tagging and Pushing Images ===" -ForegroundColor Cyan
foreach ($service in $services) {
    $localImage = "mern-microservices-devsecops-$service"
    $remoteImage = "$DockerHubUsername/ecommerce-$service`:$Tag"
    
    Write-Host "`nTagging $service..." -ForegroundColor Yellow
    docker tag $localImage $remoteImage
    
    Write-Host "Pushing $remoteImage..." -ForegroundColor Yellow
    docker push $remoteImage
}

Write-Host "`n=== All images pushed successfully! ===" -ForegroundColor Green
Write-Host "`nYour images are available at:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  docker.io/$DockerHubUsername/ecommerce-$service`:$Tag"
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Update k8s/base/*.yaml files with your Docker Hub username"
Write-Host "2. Deploy to Kubernetes: kubectl apply -k k8s/base/"
Write-Host "3. Or use ArgoCD: kubectl apply -f argocd/"

