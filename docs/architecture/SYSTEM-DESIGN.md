# System Design Document

## Executive Summary

This document provides a comprehensive system design for a production-grade e-commerce platform built using microservices architecture, deployed on Kubernetes, with complete DevSecOps practices.

## System Overview

**Type**: E-commerce Platform
**Architecture**: Microservices
**Deployment**: Kubernetes (Cloud or On-premise)
**Development Stack**: MERN (MongoDB, Express, React, Node.js)
**Infrastructure**: Docker containers orchestrated by Kubernetes

## System Goals

1. **Scalability**: Handle 10,000+ concurrent users
2. **Reliability**: 99.9% uptime SLA
3. **Security**: Enterprise-grade security with automated scanning
4. **Observability**: Complete visibility into system behavior
5. **Maintainability**: Easy to update and extend

## Key Design Decisions

### 1. Microservices vs Monolith

**Decision**: Microservices Architecture

**Rationale**:
- **Independent Deployment**: Update one service without affecting others
- **Technology Flexibility**: Use best tool for each job
- **Team Autonomy**: Different teams can own different services
- **Fault Isolation**: One service failure doesn't crash entire system
- **Scalability**: Scale only the services that need it

**Trade-offs**:
- ✅ Better scalability and resilience
- ✅ Faster deployment cycles
- ❌ More complex operations (mitigated by Kubernetes)
- ❌ Network overhead (mitigated by service mesh in future)

### 2. API Gateway Pattern

**Decision**: Central API Gateway

**Rationale**:
- Single entry point for clients
- Centralized authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- Reduced client complexity

**Alternatives Considered**:
- Backend for Frontend (BFF): More complex, unnecessary for our scale
- Direct service access: Security concerns, too many endpoints for clients

### 3. Database Strategy

**Decision**: Database per Service

**Rationale**:
- Loose coupling between services
- Independent schema evolution
- Technology flexibility (can use different databases if needed)
- Better isolation and security

**Alternatives Considered**:
- Shared Database: Tight coupling, schema lock-in
- Event Sourcing: Too complex for current requirements

### 4. Communication Patterns

**Decision**: Hybrid (REST + Events)

**Rationale**:
- REST for synchronous request-response
- Events for asynchronous operations
- Clear separation of concerns

**Implementation**:
- Synchronous: HTTP/REST with JSON
- Asynchronous: Event-driven with message queue

### 5. Authentication Strategy

**Decision**: JWT-based Authentication

**Rationale**:
- Stateless (no server-side session storage)
- Scalable (no session affinity required)
- Self-contained (includes user claims)
- Industry standard

**Security Measures**:
- Short-lived access tokens (15 minutes)
- Longer-lived refresh tokens (7 days)
- Signature verification
- Role-based access control (RBAC)

## System Capabilities

### Functional Requirements

1. **User Management**
   - User registration and authentication
   - Profile management
   - Address management
   - Preference settings

2. **Product Catalog**
   - Product browsing and search
   - Category navigation
   - Inventory management
   - Product reviews and ratings

3. **Order Processing**
   - Shopping cart
   - Order placement
   - Order tracking
   - Order history

4. **Payment Processing**
   - Multiple payment methods
   - Secure payment processing
   - Transaction history
   - Refund management

5. **Notifications**
   - Order confirmations
   - Shipping updates
   - Marketing communications
   - System alerts

### Non-Functional Requirements

1. **Performance**
   - API response time: <500ms (p95)
   - Page load time: <2s
   - Support 10,000 concurrent users
   - 1000 requests per second

2. **Scalability**
   - Horizontal scaling for all services
   - Auto-scaling based on load
   - Database replication and sharding capability

3. **Reliability**
   - 99.9% uptime (8.76 hours downtime/year)
   - Automatic failover
   - Data backup and recovery
   - Zero-downtime deployments

4. **Security**
   - Encrypted data in transit (TLS)
   - Encrypted data at rest
   - Regular security scans
   - OWASP Top 10 compliance
   - RBAC for all operations

5. **Observability**
   - Request tracing
   - Centralized logging
   - Metrics collection
   - Real-time alerting

## Component Details

### API Gateway (Port 3000)

**Technology**: Node.js + Express + http-proxy-middleware

**Responsibilities**:
- Request routing
- Authentication verification
- Rate limiting
- Load balancing
- Request logging

**Scaling Strategy**: 3-10 replicas based on traffic

**Dependencies**: All microservices

### Auth Service (Port 3001)

**Technology**: Node.js + Express + bcrypt + jsonwebtoken

**Responsibilities**:
- User authentication
- JWT token management
- Password hashing
- Role management

**Database**: auth_db
- Collections: users, tokens, sessions

**Scaling Strategy**: 2-5 replicas

**Security**:
- Password hashing with bcrypt (10 rounds)
- JWT signing with RS256
- Token rotation
- Rate limiting on login attempts

### User Service (Port 3002)

**Technology**: Node.js + Express + Mongoose

**Responsibilities**:
- User profile CRUD
- User preferences
- Address management

**Database**: users_db
- Collections: profiles, addresses, preferences

**Scaling Strategy**: 2-4 replicas

### Product Service (Port 3003)

**Technology**: Node.js + Express + Mongoose

**Responsibilities**:
- Product catalog management
- Inventory tracking
- Category management

**Database**: products_db
- Collections: products, categories, inventory

**Caching**: Redis for product catalog (future)

**Scaling Strategy**: 3-10 replicas (highest load)

**Indexes**:
- name, description (text index for search)
- category (for filtering)
- price (for sorting)

### Order Service (Port 3004)

**Technology**: Node.js + Express + Mongoose

**Responsibilities**:
- Order management
- Order status tracking
- Order history

**Database**: orders_db
- Collections: orders, order_items

**Scaling Strategy**: 2-8 replicas

**State Machine**: Order status flow
```
PENDING → PAYMENT_PROCESSING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
            ↓
        CANCELLED
```

### Payment Service (Port 3005)

**Technology**: Node.js + Express + Stripe SDK

**Responsibilities**:
- Payment processing
- Transaction management
- Refund handling

**Database**: payments_db
- Collections: transactions, payment_methods

**External Integration**: Stripe API (sandbox)

**Scaling Strategy**: 2-6 replicas

**Security**:
- PCI DSS compliance considerations
- No credit card storage (use Stripe tokens)
- Idempotency keys for transactions

### Notification Service (Port 3006)

**Technology**: Node.js + Express + Nodemailer

**Responsibilities**:
- Email notifications
- Template management
- Delivery tracking

**Database**: notifications_db
- Collections: templates, notifications, delivery_status

**Message Queue**: RabbitMQ (future) for async processing

**Scaling Strategy**: 2-4 replicas

**Providers**:
- Email: SendGrid / AWS SES
- SMS: Twilio (future)

### Search Service (Port 3007)

**Technology**: Node.js + Express + MongoDB text search

**Responsibilities**:
- Full-text search
- Autocomplete
- Search filters
- Search analytics

**Database**: products_db (read replica)

**Future Enhancement**: Elasticsearch integration

**Scaling Strategy**: 2-6 replicas

**Features**:
- Fuzzy matching
- Typo tolerance
- Faceted search
- Search suggestions

### Review Service (Port 3008)

**Technology**: Node.js + Express + Mongoose

**Responsibilities**:
- Review CRUD
- Rating aggregation
- Review moderation

**Database**: reviews_db
- Collections: reviews, ratings

**Scaling Strategy**: 1-3 replicas

**Features**:
- Verified purchase reviews
- Helpful votes
- Image uploads
- Profanity filter

### Analytics Service (Port 3009)

**Technology**: Node.js + Express + Mongoose

**Responsibilities**:
- Event tracking
- Metrics aggregation
- Report generation

**Database**: analytics_db
- Collections: events, metrics, reports

**Scaling Strategy**: 1-3 replicas

**Future Enhancement**: Integration with Google Analytics, Mixpanel

## Data Flow Examples

### User Registration Flow

```
1. Client → POST /api/auth/register
   {email, password, name}

2. API Gateway → Forward to Auth Service

3. Auth Service:
   - Validate input
   - Hash password (bcrypt)
   - Create user record
   - Generate JWT tokens
   - Emit USER_REGISTERED event

4. Notification Service (event listener):
   - Send welcome email

5. Analytics Service (event listener):
   - Track registration event

6. Response to Client:
   {accessToken, refreshToken, user}
```

### Product Search Flow

```
1. Client → GET /api/search?q=laptop&category=electronics

2. API Gateway → Verify auth → Forward to Search Service

3. Search Service:
   - Parse query
   - Execute text search on MongoDB
   - Apply filters (category, price range)
   - Sort results
   - Paginate

4. Response to Client:
   {results: [...], totalCount, page, hasMore}

5. Analytics Service (async):
   - Track search query
   - Update popular searches
```

### Order Placement Flow (Saga Pattern)

```
1. Client → POST /api/orders
   {items, shippingAddress, paymentMethod}

2. API Gateway → Verify auth → Forward to Order Service

3. Order Service:
   - Create order (status: PENDING)
   - Emit ORDER_CREATED event
   - Response: {orderId, status: PENDING}

4. Payment Service (event listener):
   - Process payment
   - If SUCCESS:
     * Emit PAYMENT_COMPLETED event
   - If FAILED:
     * Emit PAYMENT_FAILED event

5a. ORDER_CONFIRMED Path:
   - Order Service: Update status to CONFIRMED
   - Notification Service: Send confirmation email
   - Analytics Service: Track conversion

5b. PAYMENT_FAILED Path (Compensating Transaction):
   - Order Service: Update status to CANCELLED
   - Notification Service: Send failure notification
   - Product Service: Restore inventory
```

## Infrastructure Architecture

### Kubernetes Resources

#### Deployments
- One Deployment per microservice
- Rolling update strategy
- Resource requests and limits defined
- Health checks configured

#### Services
- ClusterIP for internal services
- LoadBalancer for API Gateway
- Headless service for MongoDB StatefulSet

#### ConfigMaps
- Environment-specific configuration
- Service URLs
- Feature flags

#### Secrets
- Database credentials
- JWT signing keys
- API keys (Stripe, SendGrid)
- TLS certificates

#### StatefulSet
- MongoDB replica set
- Persistent volumes for data
- Ordered deployment
- Stable network identity

#### Ingress
- NGINX Ingress Controller
- TLS termination
- Path-based routing
- Rate limiting

## Networking

### Service Communication

**Internal** (within cluster):
```
service-name.namespace.svc.cluster.local:port

Example:
auth-service.default.svc.cluster.local:3001
```

**External** (from internet):
```
https://yourdomain.com/api/* → Ingress → API Gateway → Services
```

### Network Policies

```yaml
# Example: Product Service can only be accessed by API Gateway
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: product-service-policy
spec:
  podSelector:
    matchLabels:
      app: product-service
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
```

## Observability Strategy

### Metrics (Prometheus)

**System Metrics**:
- CPU, Memory, Disk, Network

**Application Metrics**:
- Request rate
- Request duration
- Error rate
- Active connections

**Business Metrics**:
- Orders per minute
- Revenue per hour
- User signups
- Product views

### Logging (Loki/ELK)

**Log Levels**:
- ERROR: Application errors
- WARN: Potentially harmful situations
- INFO: Informational messages
- DEBUG: Detailed debugging (dev only)

**Log Structure**:
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "level": "INFO",
  "service": "order-service",
  "traceId": "abc123",
  "userId": "user123",
  "message": "Order created",
  "metadata": {
    "orderId": "order123",
    "amount": 99.99
  }
}
```

### Tracing (Future: Jaeger)

- Distributed tracing across services
- Request correlation with trace IDs
- Performance bottleneck identification

### Alerting

**Critical Alerts** (PagerDuty):
- Service down
- Error rate > 5%
- Response time > 2s
- Database connection failures

**Warning Alerts** (Slack):
- Memory usage > 80%
- Disk usage > 80%
- Slow queries

## Security Architecture

### Defense in Depth

**Layer 1: Network**
- Firewall rules
- Network policies
- TLS/SSL encryption

**Layer 2: Platform (Kubernetes)**
- RBAC
- Pod Security Standards
- Secrets management
- Resource quotas

**Layer 3: Container**
- Non-root user
- Read-only filesystem
- Minimal base images
- No secrets in images

**Layer 4: Application**
- Input validation
- Output encoding
- Authentication/Authorization
- Rate limiting

**Layer 5: Data**
- Encryption at rest
- Encryption in transit
- Data masking in logs
- Regular backups

### Security Scanning

**Pipeline Stage 1: Development**
- Git hooks with Snyk pre-commit

**Pipeline Stage 2: Build**
- Dependency scanning (Snyk)
- SAST (SonarQube)

**Pipeline Stage 3: Image**
- Container image scanning (Trivy)
- Base image vulnerabilities

**Pipeline Stage 4: Deployment**
- Kubernetes manifest scanning
- RBAC validation

**Pipeline Stage 5: Runtime**
- Runtime security (Falco)
- Network policy enforcement

## Disaster Recovery

### Backup Strategy

**MongoDB**:
- Daily full backups
- Point-in-time recovery (PITR)
- Backup retention: 30 days
- Offsite backup storage

**Kubernetes State**:
- etcd snapshots daily
- GitOps for configuration (ArgoCD)

### Recovery Time Objective (RTO)

- Database: 1 hour
- Services: 15 minutes (automated rollback)

### Recovery Point Objective (RPO)

- Database: 5 minutes (replica lag)
- Configuration: 0 (GitOps)

## Capacity Planning

### Current Capacity (MVP)

| Service | Replicas | CPU | Memory | RPS |
|---------|----------|-----|--------|-----|
| API Gateway | 3 | 500m | 512Mi | 1000 |
| Auth Service | 2 | 250m | 256Mi | 200 |
| User Service | 2 | 250m | 256Mi | 300 |
| Product Service | 3 | 500m | 512Mi | 800 |
| Order Service | 2 | 500m | 512Mi | 200 |
| Payment Service | 2 | 500m | 512Mi | 100 |
| Others | 1-2 | 250m | 256Mi | 100-300 |

**Total**: ~4 vCPU, 8GB RAM (excluding database)

### Scaling Thresholds

- CPU > 70%: Scale out
- CPU < 30%: Scale in
- Min replicas: 1
- Max replicas: 10

## Cost Optimization

1. **Right-sizing**: Resource requests match actual usage
2. **Auto-scaling**: Scale down during low traffic
3. **Spot Instances**: For non-critical workloads
4. **Reserved Instances**: For baseline capacity
5. **Caching**: Reduce database load

## Future Enhancements

### Phase 1 (3-6 months)
- Service mesh (Istio) for advanced traffic management
- Redis caching layer
- Elasticsearch for search
- RabbitMQ/Kafka for events

### Phase 2 (6-12 months)
- GraphQL API (in addition to REST)
- Microservices split (if services get too large)
- Multi-region deployment
- CDN integration

### Phase 3 (12+ months)
- Machine learning recommendations
- Real-time analytics
- Advanced fraud detection
- Mobile apps (React Native)

## Appendix

### Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| API Gateway | Node.js + Express |
| Microservices | Node.js + Express |
| Database | MongoDB |
| Container | Docker |
| Orchestration | Kubernetes |
| Package Manager | Helm |
| CI/CD | GitHub Actions + ArgoCD |
| Monitoring | Prometheus + Grafana |
| Logging | Loki + Promtail |
| Security | Trivy + Snyk |
| Ingress | NGINX |
| Cert Management | cert-manager |

### Reference Links

- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [12-Factor App](https://12factor.net/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Status**: Architecture Phase Complete
