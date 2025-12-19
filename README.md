# Production-Grade DevSecOps Project
## MERN Stack + 10 Microservices on Kubernetes

[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A comprehensive, production-ready microservices architecture built with the MERN stack, demonstrating enterprise-level DevSecOps practices, containerization, orchestration, and observability.

## 📋 Project Overview

This project showcases a complete end-to-end implementation of a modern microservices architecture with:

- **10 Independent Microservices** with clear separation of concerns
- **API Gateway Pattern** for unified entry point and routing
- **Event-Driven Architecture** for async communication
- **Complete DevSecOps Pipeline** with security at every stage
- **Production-Grade Kubernetes Deployment** with Helm charts
- **Comprehensive Monitoring & Logging** with Prometheus, Grafana, and Loki
- **Automated CI/CD** with GitHub Actions and ArgoCD
- **Security Scanning** with Trivy and Snyk at build and runtime

## 🏗️ Architecture

```
                                    ┌─────────────┐
                                    │   Ingress   │
                                    │  (NGINX)    │
                                    └──────┬──────┘
                                           │
                                           ├──────────────────────┐
                                           │                      │
                                    ┌──────▼──────┐       ┌──────▼──────┐
                                    │  Frontend   │       │ API Gateway │
                                    │   (React)   │       │  (Node.js)  │
                                    └─────────────┘       └──────┬──────┘
                                                                  │
                    ┌─────────────┬──────────────┬───────────────┼───────────────┬─────────────┐
                    │             │              │               │               │             │
            ┌───────▼───────┐ ┌──▼──────┐ ┌─────▼──────┐ ┌──────▼───────┐ ┌────▼─────┐ ┌────▼──────┐
            │ Auth Service  │ │  User   │ │  Product   │ │    Order     │ │ Payment  │ │  Search   │
            │  (JWT/RBAC)   │ │ Service │ │  Service   │ │   Service    │ │ Service  │ │  Service  │
            └───────┬───────┘ └──┬──────┘ └─────┬──────┘ └──────┬───────┘ └────┬─────┘ └────┬──────┘
                    │            │              │               │               │             │
                    └────────────┴──────────────┴───────────────┴───────────────┴─────────────┘
                                                    │
                                            ┌───────▼────────┐
                                            │    MongoDB     │
                                            │  (StatefulSet) │
                                            └────────────────┘

            Additional Services:
            ┌───────────────────┐  ┌─────────────────┐  ┌──────────────────┐
            │    Notification   │  │     Review      │  │    Analytics     │
            │      Service      │  │     Service     │  │      Service     │
            └───────────────────┘  └─────────────────┘  └──────────────────┘
```

## 🔧 Tech Stack

### Frontend
- **React 18** with Vite for fast builds
- **Axios** for API communication
- **React Router** for SPA navigation
- **JWT** for authentication

### Backend (Each Microservice)
- **Node.js 20 LTS** for runtime
- **Express.js** for REST APIs
- **MongoDB** with Mongoose for data persistence
- **JWT** for authentication & authorization
- **Winston** for structured logging
- **Prometheus client** for metrics

### Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Helm** for package management
- **NGINX Ingress** for routing
- **cert-manager** for TLS certificates

### DevSecOps
- **GitHub Actions** for CI
- **ArgoCD** for GitOps CD
- **Trivy** for container security scanning
- **Snyk** for dependency vulnerability scanning
- **SonarQube** for code quality (optional)
- **OWASP ZAP** for dynamic security testing

### Observability
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Loki** for log aggregation
- **Promtail** for log shipping
- **Alertmanager** for alert routing

## 📦 Microservices

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 3000 | Entry point, routing, rate limiting, authentication middleware |
| **Auth Service** | 3001 | JWT-based authentication, RBAC, token refresh |
| **User Service** | 3002 | User CRUD, profile management, user preferences |
| **Product Service** | 3003 | Product catalog, inventory management, categories |
| **Order Service** | 3004 | Order processing, order history, order status |
| **Payment Service** | 3005 | Payment processing (Stripe sandbox), transaction history |
| **Notification Service** | 3006 | Email/SMS notifications, event-driven with queues |
| **Search Service** | 3007 | Elasticsearch integration, full-text search, filters |
| **Review Service** | 3008 | Product reviews, ratings, moderation |
| **Analytics Service** | 3009 | User analytics, metrics aggregation, reporting |

## 🚀 Quick Start

### Prerequisites

Verify your environment:
```bash
.\scripts\check-tools.ps1    # Windows
# or
./scripts/check-tools.sh     # Linux/Mac
```

Required tools:
- Node.js v18+ ✅
- Docker & Docker Compose ✅
- kubectl ❌ (need to install)
- Helm v3+ ❌ (need to install)
- Minikube OR Docker Desktop K8s ⚠️ (optional)

See [INSTALL-TOOLS.md](./INSTALL-TOOLS.md) for installation instructions.

### Local Development

1. **Clone and Setup**
```bash
git clone <your-repo>
cd MERN-Microservices-DevSecOps
.\scripts\create-structure.ps1  # Windows
# or
./scripts/create-structure.sh   # Linux/Mac
```

2. **Install Dependencies**
```bash
# Install all service dependencies
npm run install:all
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Access Services**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:3000/api
- MongoDB: localhost:27017

### Kubernetes Deployment

1. **Start Kubernetes**
```bash
# Using Docker Desktop: Enable in Settings
# OR Minikube:
minikube start --cpus=4 --memory=8192
```

2. **Deploy with Helm**
```bash
# Add Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Deploy MongoDB
helm install mongodb bitnami/mongodb -f helm/mongodb/values.yaml

# Deploy microservices
helm install api-gateway ./helm/api-gateway
helm install auth-service ./helm/auth-service
# ... repeat for all services
```

3. **Verify Deployment**
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

## 📊 Monitoring & Observability

### Prometheus Metrics
```bash
# Port-forward Prometheus
kubectl port-forward svc/prometheus 9090:9090

# Access at http://localhost:9090
```

### Grafana Dashboards
```bash
# Port-forward Grafana
kubectl port-forward svc/grafana 3000:80

# Access at http://localhost:3000
# Default login: admin/admin
```

### Loki Logs
```bash
# Port-forward Loki
kubectl port-forward svc/loki 3100:3100

# Query logs via Grafana Explore
```

## 🔐 Security Features

### Implemented Security Measures

1. **Container Security**
   - Non-root containers
   - Read-only root filesystems
   - Dropped capabilities
   - Security context constraints

2. **Image Scanning**
   - Trivy scans in CI pipeline
   - Snyk dependency scanning
   - Automated vulnerability reporting

3. **Kubernetes Security**
   - RBAC with least privilege
   - Network policies for pod communication
   - Pod Security Standards (restricted)
   - Secrets encryption at rest

4. **Application Security**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Input validation and sanitization
   - Rate limiting and throttling
   - CORS configuration

5. **Network Security**
   - TLS/SSL certificates with cert-manager
   - mTLS between services (optional)
   - Ingress with WAF rules

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Load testing with k6
k6 run tests/load/api-gateway.js

# Security testing
npm run test:security
```

## 📈 CI/CD Pipeline

### Continuous Integration (GitHub Actions)
- Linting and code quality checks
- Unit and integration tests
- Security vulnerability scanning (Snyk)
- Docker image build and scan (Trivy)
- Push to container registry

### Continuous Deployment (ArgoCD)
- GitOps-based deployment
- Automatic sync from Git repository
- Health checks and rollback capability
- Multi-environment support (dev/staging/prod)

## 🎯 Production Readiness Checklist

- [x] Microservices architecture with proper separation
- [x] API Gateway for unified access
- [x] Authentication & Authorization (JWT + RBAC)
- [x] Database with StatefulSets
- [ ] Health checks (readiness & liveness probes) - Phase 5
- [ ] Resource limits and requests - Phase 5
- [ ] Horizontal Pod Autoscaling (HPA) - Phase 10
- [ ] Persistent storage with PVCs - Phase 5
- [ ] ConfigMaps and Secrets management - Phase 5
- [ ] Ingress with TLS - Phase 10
- [ ] Monitoring with Prometheus & Grafana - Phase 9
- [ ] Centralized logging with Loki - Phase 9
- [ ] Alerting with Alertmanager - Phase 9
- [ ] CI/CD pipelines - Phase 7
- [ ] Security scanning automated - Phase 8
- [ ] Load testing - Phase 11
- [ ] Documentation - Phase 12

## 📚 Documentation

- [Phase 0: Prerequisites](./docs/PHASE-0-PREREQUISITES.md) ✅
- [Phase 1: Architecture Design](./docs/PHASE-1-ARCHITECTURE.md) ⏳
- [Phase 2: Backend Microservices](./docs/PHASE-2-BACKEND.md)
- [Phase 3: Frontend Application](./docs/PHASE-3-FRONTEND.md)
- [Phase 4: Dockerization](./docs/PHASE-4-DOCKER.md)
- [Phase 5: Kubernetes Deployment](./docs/PHASE-5-KUBERNETES.md)
- [Phase 6: Helm Charts](./docs/PHASE-6-HELM.md)
- [Phase 7: CI/CD Pipeline](./docs/PHASE-7-CICD.md)
- [Phase 8: Security Implementation](./docs/PHASE-8-SECURITY.md)
- [Phase 9: Monitoring & Logging](./docs/PHASE-9-MONITORING.md)
- [Phase 10: Ingress & Autoscaling](./docs/PHASE-10-INGRESS.md)
- [Phase 11: Testing Strategy](./docs/PHASE-11-TESTING.md)
- [Phase 12: Final Documentation](./docs/PHASE-12-DOCUMENTATION.md)

## 🎤 Interview Talking Points

### Why Microservices?
"We chose microservices to enable independent scaling, deployment, and technology choices for each service. Each service can be developed, tested, and deployed independently, reducing blast radius of failures and enabling faster iteration."

### Why Kubernetes?
"Kubernetes provides container orchestration with self-healing, auto-scaling, and declarative configuration. It's production-proven and cloud-agnostic, allowing us to run on any cloud provider or on-premises."

### Why API Gateway?
"The API Gateway provides a single entry point, handling cross-cutting concerns like authentication, rate limiting, and routing. It shields internal services from direct exposure and enables centralized monitoring."

### DevSecOps Approach
"We implement security at every stage: dependency scanning before build, image scanning before deployment, runtime monitoring, and RBAC for access control. This 'shift-left' approach catches vulnerabilities early."

### Observability Strategy
"We use Prometheus for metrics, Loki for logs, and Grafana for visualization. This provides full observability with the ability to correlate metrics, logs, and traces. Alertmanager ensures we're notified of issues proactively."

## 🤝 Contributing

This is a portfolio/learning project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

Built as a comprehensive DevSecOps learning project demonstrating production-grade practices for microservices architecture on Kubernetes.

---

**Status**: 🚧 In Development - Phase 1/12 Complete

**Next**: Phase 1 - Architecture Design
