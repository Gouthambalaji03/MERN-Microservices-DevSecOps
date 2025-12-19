#!/bin/bash

# Script to create complete project directory structure
# Run this after verifying prerequisites

echo "Creating project directory structure..."

# Create main directories
directories=(
    "frontend"
    "frontend/src"
    "frontend/src/components"
    "frontend/src/pages"
    "frontend/src/services"
    "frontend/src/utils"
    "frontend/public"

    # Microservices
    "services/api-gateway"
    "services/api-gateway/src"
    "services/api-gateway/tests"

    "services/auth-service"
    "services/auth-service/src"
    "services/auth-service/tests"

    "services/user-service"
    "services/user-service/src"
    "services/user-service/tests"

    "services/product-service"
    "services/product-service/src"
    "services/product-service/tests"

    "services/order-service"
    "services/order-service/src"
    "services/order-service/tests"

    "services/payment-service"
    "services/payment-service/src"
    "services/payment-service/tests"

    "services/notification-service"
    "services/notification-service/src"
    "services/notification-service/tests"

    "services/search-service"
    "services/search-service/src"
    "services/search-service/tests"

    "services/review-service"
    "services/review-service/src"
    "services/review-service/tests"

    "services/analytics-service"
    "services/analytics-service/src"
    "services/analytics-service/tests"

    # Docker
    "docker"

    # Kubernetes
    "k8s/base"
    "k8s/overlays/dev"
    "k8s/overlays/prod"
    "k8s/secrets"
    "k8s/configmaps"

    # Helm
    "helm/api-gateway"
    "helm/auth-service"
    "helm/user-service"
    "helm/product-service"
    "helm/order-service"
    "helm/payment-service"
    "helm/notification-service"
    "helm/search-service"
    "helm/review-service"
    "helm/analytics-service"
    "helm/mongodb"

    # Terraform
    "terraform/modules"
    "terraform/environments/dev"
    "terraform/environments/prod"

    # Monitoring
    "monitoring/prometheus"
    "monitoring/grafana"
    "monitoring/grafana/dashboards"
    "monitoring/alertmanager"

    # Logging
    "logging/loki"
    "logging/promtail"

    # CI/CD
    ".github/workflows"

    # Scripts
    "scripts"

    # Docs
    "docs"
    "docs/architecture"
    "docs/api"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "  ✓ Created: $dir"
    else
        echo "  → Exists: $dir"
    fi
done

echo ""
echo "✓ Directory structure created successfully!"
echo "Next step: Run Phase 1 to design the architecture"
