# Phase 1: Application Architecture

## Overview
This phase defines the high-level architecture, communication patterns, data flow, and design decisions for the microservices ecosystem.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Internet / Users                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Ingress Controller (NGINX)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  - TLS Termination                                           │   │
│  │  - Rate Limiting                                             │   │
│  │  - WAF Rules                                                 │   │
│  │  - Path-based Routing                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────────────┬────────────────────┘
               │                                 │
               │ /                              │ /api/*
               ▼                                 ▼
    ┌──────────────────┐              ┌──────────────────┐
    │    Frontend      │              │   API Gateway    │
    │     (React)      │              │    (Node.js)     │
    │                  │◄─────────────┤                  │
    │  - SPA           │   REST API   │  - Routing       │
    │  - JWT Storage   │              │  - Auth Middleware│
    │  - State Mgmt    │              │  - Rate Limiting │
    └──────────────────┘              │  - Load Balancing│
                                      └────────┬─────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
         ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
         │  Auth Service    │      │  User Service    │      │ Product Service  │
         │  Port: 3001      │      │  Port: 3002      │      │  Port: 3003      │
         │                  │      │                  │      │                  │
         │  - Login/Signup  │      │  - User Profile  │      │  - Catalog       │
         │  - JWT Issue     │      │  - User CRUD     │      │  - Inventory     │
         │  - Token Refresh │      │  - Preferences   │      │  - Categories    │
         └────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
                  │                         │                         │
                  └─────────────────────────┴──────────┬──────────────┘
                                                       │
                    ┌──────────────────────────────────┼──────────────────────────┐
                    │                                  │                          │
                    ▼                                  ▼                          ▼
         ┌──────────────────┐           ┌──────────────────┐      ┌──────────────────┐
         │  Order Service   │           │ Payment Service  │      │  Search Service  │
         │  Port: 3004      │           │  Port: 3005      │      │  Port: 3007      │
         │                  │           │                  │      │                  │
         │  - Order CRUD    │◄─────────►│  - Stripe API    │      │  - Full-text     │
         │  - Order Status  │   Payment │  - Transactions  │      │  - Filters       │
         │  - History       │   Events  │  - Refunds       │      │  - Suggestions   │
         └────────┬─────────┘           └────────┬─────────┘      └────────┬─────────┘
                  │                              │                         │
                  │ Events                       │ Events                  │
                  ▼                              ▼                         │
         ┌──────────────────┐           ┌──────────────────┐              │
         │   Notification   │           │  Analytics       │              │
         │     Service      │           │    Service       │              │
         │  Port: 3006      │           │  Port: 3009      │              │
         │                  │           │                  │              │
         │  - Email/SMS     │           │  - Metrics       │              │
         │  - Templates     │           │  - Reports       │              │
         │  - Queue         │           │  - Aggregation   │              │
         └──────────────────┘           └──────────────────┘              │
                                                                           │
         ┌──────────────────┐                                             │
         │  Review Service  │◄────────────────────────────────────────────┘
         │  Port: 3008      │
         │                  │
         │  - Reviews CRUD  │
         │  - Ratings       │
         │  - Moderation    │
         └──────────────────┘

═══════════════════════════════════════════════════════════════════════
                         Data Layer
═══════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────────────────────────────┐
    │            MongoDB Cluster (StatefulSet)                      │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
    │  │   Primary    │  │  Secondary   │  │  Secondary   │      │
    │  │              │──┤              │──│              │      │
    │  │ Replica Set  │  │ Replica Set  │  │ Replica Set  │      │
    │  └──────────────┘  └──────────────┘  └──────────────┘      │
    │                                                               │
    │  Databases:                                                   │
    │  - auth_db, users_db, products_db, orders_db                │
    │  - payments_db, reviews_db, analytics_db                    │
    └──────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                      Observability Stack
═══════════════════════════════════════════════════════════════════════

    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Prometheus  │  │   Grafana    │  │  Loki/ELK    │
    │              │──┤              │──│              │
    │  Metrics     │  │ Dashboards   │  │   Logs       │
    └──────────────┘  └──────────────┘  └──────────────┘
           │                  │                  │
           └──────────────────┴──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Alertmanager     │
                    │  (Notifications)   │
                    └────────────────────┘
```

## Communication Patterns

### 1. Synchronous Communication (REST APIs)

**Used for**: Request-response operations requiring immediate feedback

**Flow**:
```
Client → API Gateway → Microservice → Response
```

**Example**: User login, product search, order placement

**Implementation**:
- HTTP/REST with JSON payloads
- JWT authentication in headers
- Standard HTTP status codes
- Retry logic with exponential backoff

### 2. Asynchronous Communication (Events)

**Used for**: Non-blocking operations, notifications, data synchronization

**Flow**:
```
Service A → Event → Message Queue → Service B (subscriber)
```

**Example**: Order created → Send notification, Update analytics

**Implementation**:
- Event-driven with message queues (RabbitMQ or Kafka - optional for advanced version)
- Pub/Sub pattern
- Event types: ORDER_CREATED, PAYMENT_COMPLETED, USER_REGISTERED

### 3. API Gateway Pattern

**Purpose**: Single entry point for all client requests

**Responsibilities**:
1. **Routing**: Forward requests to appropriate services
2. **Authentication**: Verify JWT tokens
3. **Rate Limiting**: Prevent abuse
4. **Load Balancing**: Distribute traffic
5. **Request/Response Transformation**: Adapt protocols
6. **Monitoring**: Log all requests

**Routes**:
```
POST   /api/auth/login          → Auth Service
POST   /api/auth/register       → Auth Service
GET    /api/users/:id           → User Service
GET    /api/products            → Product Service
POST   /api/orders              → Order Service
POST   /api/payments            → Payment Service
GET    /api/search              → Search Service
POST   /api/reviews             → Review Service
GET    /api/analytics           → Analytics Service
```

## Data Management Strategy

### Database per Service Pattern

**Why?**: Loose coupling, independent scaling, technology flexibility

**Implementation**:
- Each service has its own MongoDB database
- No direct database access between services
- Data consistency through eventual consistency model

### Service-Specific Databases

| Service | Database | Collections |
|---------|----------|-------------|
| Auth Service | `auth_db` | tokens, sessions |
| User Service | `users_db` | users, profiles, preferences |
| Product Service | `products_db` | products, categories, inventory |
| Order Service | `orders_db` | orders, order_items |
| Payment Service | `payments_db` | transactions, payment_methods |
| Review Service | `reviews_db` | reviews, ratings |
| Analytics Service | `analytics_db` | events, metrics, reports |
| Notification Service | `notifications_db` | templates, delivery_status |

### Data Consistency

**Strategy**: Eventual Consistency

**Approach**:
1. **Saga Pattern** for distributed transactions (e.g., order placement)
2. **Event Sourcing** for audit trails
3. **CQRS (optional)** for read/write separation in analytics

**Example: Order Creation Flow**
```
1. Client → POST /api/orders
2. Order Service: Create order (status: PENDING)
3. Order Service → Emit ORDER_CREATED event
4. Payment Service: Process payment
5. Payment Service → Emit PAYMENT_COMPLETED event
6. Order Service: Update order (status: CONFIRMED)
7. Notification Service: Send confirmation email
8. Analytics Service: Record metrics
```

## Microservices Deep Dive

### 1. API Gateway (Port 3000)

**Responsibilities**:
- Request routing and forwarding
- Authentication middleware
- Rate limiting (100 req/min per IP)
- Request logging and metrics
- Error handling and response formatting

**Tech Stack**:
- Express.js with express-http-proxy
- express-rate-limit for throttling
- helmet for security headers
- cors for cross-origin requests

**Key Routes**:
```javascript
/api/auth/*        → http://auth-service:3001
/api/users/*       → http://user-service:3002
/api/products/*    → http://product-service:3003
/api/orders/*      → http://order-service:3004
/api/payments/*    → http://payment-service:3005
/api/notifications/* → http://notification-service:3006
/api/search/*      → http://search-service:3007
/api/reviews/*     → http://review-service:3008
/api/analytics/*   → http://analytics-service:3009
```

### 2. Auth Service (Port 3001)

**Responsibilities**:
- User authentication (login/signup)
- JWT token generation and validation
- Token refresh mechanism
- Role-Based Access Control (RBAC)
- Password hashing (bcrypt)

**Endpoints**:
```
POST   /auth/register          # Create new user
POST   /auth/login             # Authenticate and get JWT
POST   /auth/refresh           # Refresh access token
POST   /auth/logout            # Invalidate tokens
GET    /auth/verify            # Verify JWT token
```

**JWT Payload**:
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "user|admin|manager",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Roles**:
- `user`: Basic user permissions
- `manager`: Can manage products, view orders
- `admin`: Full system access

### 3. User Service (Port 3002)

**Responsibilities**:
- User profile management
- User preferences
- Address book
- Profile picture upload

**Endpoints**:
```
GET    /users/:id              # Get user profile
PUT    /users/:id              # Update user profile
DELETE /users/:id              # Delete user (soft delete)
GET    /users/:id/preferences  # Get user preferences
PUT    /users/:id/preferences  # Update preferences
GET    /users/:id/addresses    # Get user addresses
POST   /users/:id/addresses    # Add new address
```

### 4. Product Service (Port 3003)

**Responsibilities**:
- Product catalog management
- Inventory tracking
- Category management
- Product images

**Endpoints**:
```
GET    /products               # List all products (paginated)
GET    /products/:id           # Get product details
POST   /products               # Create product (admin)
PUT    /products/:id           # Update product (admin)
DELETE /products/:id           # Delete product (admin)
GET    /categories             # List categories
POST   /categories             # Create category (admin)
PUT    /products/:id/inventory # Update inventory
```

**Product Schema**:
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "category_id",
  "inventory": 100,
  "images": ["url1", "url2"],
  "attributes": {"color": "red", "size": "L"},
  "status": "active|draft|archived"
}
```

### 5. Order Service (Port 3004)

**Responsibilities**:
- Order creation and management
- Order status tracking
- Order history
- Integration with payment service

**Endpoints**:
```
POST   /orders                 # Create new order
GET    /orders/:id             # Get order details
GET    /orders/user/:userId    # Get user's orders
PUT    /orders/:id/status      # Update order status
DELETE /orders/:id             # Cancel order
GET    /orders/:id/tracking    # Get order tracking info
```

**Order Status Flow**:
```
PENDING → PAYMENT_PROCESSING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                    ↓
                                CANCELLED
```

### 6. Payment Service (Port 3005)

**Responsibilities**:
- Payment processing (Stripe sandbox)
- Transaction management
- Refund processing
- Payment method management

**Endpoints**:
```
POST   /payments               # Process payment
GET    /payments/:id           # Get payment details
POST   /payments/:id/refund    # Refund payment
GET    /payments/user/:userId  # Get user's payments
POST   /payments/methods       # Add payment method
```

**Integration**: Stripe API (sandbox mode)

### 7. Notification Service (Port 3006)

**Responsibilities**:
- Email notifications
- SMS notifications (optional)
- Push notifications (optional)
- Template management
- Delivery status tracking

**Endpoints**:
```
POST   /notifications          # Send notification
GET    /notifications/:id      # Get notification status
GET    /notifications/user/:userId  # Get user's notifications
POST   /notifications/templates     # Create template (admin)
```

**Event Listeners**:
- `ORDER_CREATED` → Send order confirmation
- `PAYMENT_COMPLETED` → Send payment receipt
- `ORDER_SHIPPED` → Send shipping notification
- `USER_REGISTERED` → Send welcome email

### 8. Search Service (Port 3007)

**Responsibilities**:
- Full-text product search
- Search suggestions/autocomplete
- Filter and sort capabilities
- Search analytics

**Endpoints**:
```
GET    /search                 # Search products
GET    /search/suggest         # Autocomplete suggestions
GET    /search/filters         # Get available filters
POST   /search/index           # Reindex products (admin)
```

**Search Features**:
- Full-text search on name, description
- Filters: category, price range, rating
- Sort: price, popularity, newest
- Pagination

### 9. Review Service (Port 3008)

**Responsibilities**:
- Product review management
- Rating aggregation
- Review moderation
- Helpful votes tracking

**Endpoints**:
```
POST   /reviews                # Create review
GET    /reviews/product/:id    # Get product reviews
PUT    /reviews/:id            # Update review
DELETE /reviews/:id            # Delete review
POST   /reviews/:id/helpful    # Mark review helpful
GET    /reviews/:id/moderate   # Moderate review (admin)
```

**Review Schema**:
```json
{
  "productId": "product_id",
  "userId": "user_id",
  "rating": 5,
  "title": "Great product!",
  "content": "Review content...",
  "helpful": 10,
  "verified": true,
  "status": "approved|pending|rejected"
}
```

### 10. Analytics Service (Port 3009)

**Responsibilities**:
- Event tracking
- Metrics aggregation
- Report generation
- Dashboard data

**Endpoints**:
```
POST   /analytics/event        # Track event
GET    /analytics/dashboard    # Get dashboard metrics
GET    /analytics/reports      # Generate reports
GET    /analytics/users        # User analytics
GET    /analytics/products     # Product analytics
```

**Tracked Events**:
- Page views
- Product views
- Add to cart
- Checkout initiation
- Purchase completion
- User registration

## Security Architecture

### Authentication Flow

```
1. User → POST /api/auth/login {email, password}
2. Auth Service → Validate credentials
3. Auth Service → Generate JWT (15min) + Refresh Token (7d)
4. Client → Store tokens (httpOnly cookies or localStorage)
5. Client → Subsequent requests with JWT in Authorization header
6. API Gateway → Verify JWT signature and expiry
7. API Gateway → Extract userId from token → Forward to service
8. Service → Process request with authenticated user context
```

### Authorization (RBAC)

**Roles & Permissions**:

| Role | Products | Orders | Users | Analytics | System |
|------|----------|--------|-------|-----------|--------|
| user | Read | Own Orders | Own Profile | - | - |
| manager | All | All Orders | Read All | Read | - |
| admin | All | All | All | All | All |

**Implementation**:
```javascript
// Middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/products',
  authenticate,
  authorize(['admin', 'manager']),
  createProduct
);
```

### Network Security

**Kubernetes Network Policies**:
- API Gateway can communicate with all services
- Services can communicate with MongoDB
- Frontend can only access API Gateway
- Services cannot access each other directly (except through events)

## Scalability Considerations

### Horizontal Scaling

Each microservice can scale independently based on demand:

```yaml
# Example: Product Service under high load (Black Friday)
replicas: 10

# While other services remain at baseline
auth-service: 2
user-service: 2
order-service: 5
payment-service: 5
```

### Caching Strategy

**Redis Cache** (optional enhancement):
- Product catalog (TTL: 1 hour)
- User sessions (TTL: session lifetime)
- Search results (TTL: 15 minutes)
- API responses (TTL: varies)

### Database Scaling

**MongoDB Horizontal Scaling**:
- Replica Sets for read scaling
- Sharding for write scaling (if needed)
- Indexes on frequently queried fields

## Resilience Patterns

### 1. Health Checks

Every service exposes:
```
GET /health          # Readiness probe
GET /health/live     # Liveness probe
```

### 2. Circuit Breaker

Prevent cascading failures when downstream service fails.

### 3. Retry with Exponential Backoff

Transient failure recovery:
```javascript
const retries = 3;
const backoff = [1000, 2000, 4000]; // ms
```

### 4. Timeout

Every external call has a timeout:
```javascript
axios.get(url, { timeout: 5000 })
```

### 5. Graceful Degradation

- Product Service down → Show cached products
- Payment Service down → Queue payments for later processing
- Search Service down → Fall back to basic database query

## Performance Considerations

### 1. API Response Time Targets

| Operation | Target | Max |
|-----------|--------|-----|
| Product List | <200ms | 500ms |
| Product Details | <100ms | 300ms |
| User Login | <300ms | 1s |
| Order Creation | <500ms | 2s |
| Payment Processing | <2s | 5s |
| Search | <300ms | 1s |

### 2. Database Indexing

```javascript
// Example indexes
products: [
  { name: 'text', description: 'text' },  // Full-text search
  { category: 1 },                         // Category filter
  { price: 1 },                            // Price sorting
  { createdAt: -1 }                        // Newest first
]

orders: [
  { userId: 1, createdAt: -1 },            // User order history
  { status: 1 }                            // Status queries
]
```

### 3. Pagination

All list endpoints support pagination:
```
GET /products?page=1&limit=20
```

## Technology Decisions Rationale

### Why Node.js for all services?

**Pros**:
- Consistent technology stack (easier maintenance)
- Excellent async I/O performance
- Large ecosystem (npm)
- Same language as frontend (code sharing potential)
- Fast development

**Cons**: Not ideal for CPU-intensive tasks (mitigated by microservices - can use other languages for specific services if needed)

### Why MongoDB?

**Pros**:
- Flexible schema (evolving requirements)
- Horizontal scaling with sharding
- Rich query language
- Native JSON (matches Node.js)
- Good performance for read-heavy workloads

**Cons**: Not ACID across documents (mitigated by Saga pattern)

### Why REST over gRPC?

**Pros**:
- Simpler to implement and debug
- Browser-friendly (no special tooling)
- Human-readable (JSON)
- Better for learning and demonstration

**Future**: Could add gRPC for internal service-to-service communication

## Interview Talking Points

### Why did you choose this architecture?

"I chose microservices architecture to demonstrate production-grade patterns like service isolation, independent scaling, and fault tolerance. The API Gateway provides a unified entry point while shielding internal services. Each service is independently deployable, which in a real-world scenario enables different teams to work autonomously and reduces deployment risk."

### How do you handle data consistency?

"I use the database-per-service pattern to ensure loose coupling. For distributed transactions, like order placement, I implement the Saga pattern with compensating transactions. This provides eventual consistency while maintaining service independence. For example, if payment fails, we compensate by canceling the order."

### How does authentication work across services?

"I use JWT-based authentication at the API Gateway level. The gateway validates the token and forwards the user context to downstream services. This centralizes authentication logic and reduces duplication. Services trust the gateway-provided user context, simplifying their implementation while maintaining security."

### How would you scale this system?

"Each microservice can scale horizontally based on its specific load. For example, during high traffic on the Product Service, we can increase its replicas without touching other services. The API Gateway handles load balancing. We'd also add caching (Redis) for frequently accessed data and implement read replicas for MongoDB."

### What happens if a service fails?

"I've implemented circuit breakers and health checks. If a service fails, the circuit breaker prevents cascading failures. Kubernetes automatically restarts failed pods (self-healing). For critical flows, I implement graceful degradation - for example, if search fails, we fall back to basic database queries."

## Next Steps

Phase 1 Complete! You now have a comprehensive architecture design.

**Phase 2** will implement:
1. Express.js boilerplate for each service
2. MongoDB models and schemas
3. API endpoints with proper error handling
4. Authentication and authorization middleware
5. Health check endpoints
6. Logging and metrics collection

Ready to start implementation?

---

**Phase Status**: ✅ Complete

**Next**: [Phase 2 - Backend Microservices Implementation](./PHASE-2-BACKEND.md)
