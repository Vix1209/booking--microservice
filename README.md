# Booking Microservice

A comprehensive booking management system built with NestJS, featuring real-time notifications, background job processing, and a robust microservices architecture.

## 1. Assumptions & Decisions

### Architecture Decisions
- **Microservices Pattern**: Separated booking logic and job processing into distinct services for better scalability and maintainability
- **NestJS Framework**: Chosen for its TypeScript support, decorator-based architecture, and built-in dependency injection
- **PostgreSQL Database**: Selected for ACID compliance and complex query support needed for booking relationships
- **Redis**: Used for both caching and job queue management to improve performance and handle background tasks
- **JWT Authentication**: Implemented stateless authentication with refresh tokens for security and scalability
- **WebSocket Integration**: Real-time notifications for immediate booking updates and reminders

### Technical Assumptions
- Users need real-time updates for booking changes
- System should handle concurrent booking requests gracefully
- Background job processing is essential for reminder notifications
- API should be RESTful and well-documented
- System should be containerized for easy deployment
- Both development and production environments need different configurations

### Design Decisions
- **Role-based Access Control**: Implemented to support different user types (admin, user)
- **Pagination**: Added for efficient handling of large datasets
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Validation**: Input validation using class-validator for data integrity
- **Docker Profiles**: Separate development and production configurations
- **Nginx Proxy**: Used for routing and load balancing in containerized environment



## 2. Setup Instructions

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 2GB+ available disk space
- Node.js 18+ (for local development)
- Git

### Environment Configuration

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd booking-microservice
   ```

2. **Environment Variables Setup**
   ```bash
   cp .env.example .env
   ```
   
   **Required Environment Variables:**
   
   | Variable | Description | Default/Example |
   |----------|-------------|----------------|
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@postgres:5432/booking_db` |
   | `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
   | `JWT_SECRET_KEY` | JWT signing secret (64+ chars) | `your-jwt-secret-key` |
   | `REFRESH_JWT_SECRET_KEY` | Refresh token secret | `your-refresh-jwt-secret-key` |
   | `NODE_ENV` | Environment mode | `development` or `production` |
   | `PORT` | Main API service port | `5000` |
   | `JOB_PORT` | Job service port | `5001` |

### Docker Setup Options

#### Option 1: Development Mode (Recommended for local development)
- Includes local PostgreSQL and Redis containers
- Hot reload enabled
- Debug logging
- Swagger UI accessible

```bash
# Start development environment
docker compose up

# Access points:
# - API: http://localhost/api/
# - Jobs: http://localhost/jobs/
# - WebSocket: http://localhost/ws/
# - Health: http://localhost/health
```

#### Option 2: Production Mode (For production deployment)
- Uses external cloud databases
- Optimized builds
- Enhanced security
- Production nginx configuration

```bash
# Configure production environment
# Edit .env with production database URLs

# Start production environment
docker compose --profile prod up -d

# Monitor deployment
docker compose --profile prod logs -f
```

### Security Configuration (Production)

**⚠️ Important: Update these before production deployment:**

- [ ] Set strong `JWT_SECRET_KEY` (64+ characters)
- [ ] Set strong `REFRESH_JWT_SECRET_KEY`
- [ ] Configure production database URLs
- [ ] Set `NODE_ENV=production`
- [ ] Review and configure CORS origins
- [ ] Set up SSL/TLS certificates



## 3. How to Run Locally & Test

### Option A: Docker Development (Recommended)

1. **Quick Start**
   ```bash
   # Clone and start
   git clone <repository-url>
   cd booking-microservice
   docker compose up -d
   
   # Verify services are running
   curl http://localhost/health
   ```

2. **Access Points**
   - **API Documentation**: http://localhost/api/ (Swagger UI)
   - **Main API**: http://localhost/api/booking
   - **Job Management**: http://localhost/jobs/
   - **WebSocket**: http://localhost/ws/
   - **Health Check**: http://localhost/health

3. **Database Setup**
   ```bash
   # Run migrations (if needed)
   docker compose exec booking-service npm run migration:run
   
   # Access database
   docker compose exec postgres psql -U postgres -d booking_db
   ```

### Option B: Native Development

1. **Prerequisites Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Start databases only
   docker compose up postgres redis -d
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env for local development
   ```

3. **Database Migration**
   ```bash
   npm run migration:run
   ```

4. **Start Services**
   ```bash
   # Terminal 1 - Booking Service
   npm run start:dev booking-microservice
   
   # Terminal 2 - Job Service  
   npm run start:dev job
   ```

### Testing

#### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

#### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- --testNamePattern="booking"
```

#### API Testing

1. **Using Swagger UI** (Recommended)
   - Navigate to http://localhost/api/
   - Use interactive API documentation
   - Test authentication and booking endpoints

2. **Using cURL**
   ```bash
   # Health check
   curl http://localhost/health
   
   # Register user
   curl -X POST http://localhost/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   
   # Login
   curl -X POST http://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   
   # Create booking (replace TOKEN with JWT from login)
   curl -X POST http://localhost/api/booking \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"title":"Test Booking","startTime":"2024-12-25T10:00:00Z","endTime":"2024-12-25T11:00:00Z"}'
   ```

#### WebSocket Testing
```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost/ws/

# Send join room event
{"event":"join-user-room","data":{"userId":"your-user-id"}}
```

### Development Workflow

1. **Making Changes**
   - Code changes auto-reload in development mode
   - Database changes require migration generation
   - New dependencies require container rebuild

2. **Database Changes**
   ```bash
   # Generate migration
   npm run migration:generate -- -n MigrationName
   
   # Run migration
   npm run migration:run
   
   # Revert migration
   npm run migration:revert
   ```

3. **Debugging**
   ```bash
   # View logs
   docker compose logs -f booking-service
   docker compose logs -f job-service
   
   # Access container shell
   docker compose exec booking-service sh
   
   # Monitor job queues
   curl http://localhost/jobs/metrics
   ```

## 4. What You'd Improve with +4 Hours

### High Priority Improvements

#### 1. Enhanced Monitoring & Observability (1.5 hours)
- **Metrics Collection**: Implement Prometheus metrics for API response times, database query performance, and job queue statistics
- **Distributed Tracing**: Add OpenTelemetry for request tracing across microservices
- **Health Checks**: Enhance health endpoints with dependency checks (database connectivity, Redis availability)
- **Alerting**: Set up basic alerting rules for service failures and performance degradation

#### 2. Advanced Security Features (1 hour)
- **Rate Limiting**: Implement more granular rate limiting per user/IP with Redis-backed counters
- **API Key Management**: Add API key authentication for service-to-service communication
- **Input Sanitization**: Enhanced XSS and injection attack prevention
- **Audit Logging**: Comprehensive audit trail for all booking operations

#### 3. Performance Optimizations (1 hour)
- **Database Optimization**: Add database indexes for common query patterns, implement query optimization
- **Caching Strategy**: Implement Redis caching for frequently accessed booking data
- **Connection Pooling**: Optimize database connection pool settings
- **Response Compression**: Implement response compression for large payloads

#### 4. Testing & Quality Assurance (30 minutes)
- **Integration Tests**: Add comprehensive integration tests for microservice communication
- **Load Testing**: Implement basic load testing with k6 or Artillery
- **Contract Testing**: Add API contract testing between services
- **Test Data Management**: Automated test data seeding and cleanup

### Medium Priority Improvements

#### 5. Developer Experience Enhancements
- **Hot Reload**: Improve development hot reload performance
- **Debug Configuration**: Add VS Code debug configurations
- **API Documentation**: Enhanced Swagger documentation with examples
- **Development Scripts**: Additional npm scripts for common development tasks

#### 6. Operational Improvements
- **Graceful Shutdown**: Implement proper graceful shutdown handling
- **Configuration Management**: Environment-specific configuration validation
- **Backup Strategy**: Automated database backup procedures
- **Log Aggregation**: Structured logging with correlation IDs

### Future Considerations (Beyond 4 hours)

#### Scalability
- **Horizontal Scaling**: Kubernetes deployment configurations
- **Database Sharding**: Strategy for handling large-scale booking data
- **Event Sourcing**: Consider event sourcing for booking state management
- **CQRS Pattern**: Separate read/write models for better performance

#### Advanced Features
- **Multi-tenancy**: Support for multiple organizations
- **Advanced Notifications**: Email/SMS notifications integration
- **Booking Conflicts**: Advanced conflict resolution algorithms
- **Analytics**: Booking analytics and reporting features

#### Infrastructure
- **CI/CD Pipeline**: Automated testing and deployment
- **Infrastructure as Code**: Terraform or CloudFormation templates
- **Service Mesh**: Istio for advanced traffic management
- **Disaster Recovery**: Multi-region deployment strategy

### Implementation Priority Matrix

| Improvement | Impact | Effort | Priority |
|-------------|--------|--------|---------|
| Monitoring & Observability | High | Medium | 1 |
| Security Enhancements | High | Low | 2 |
| Performance Optimization | Medium | Medium | 3 |
| Testing Improvements | Medium | Low | 4 |
| Developer Experience | Low | Low | 5 |

---

## Additional Resources

### API Documentation
Once running, visit http://localhost/api/ for interactive Swagger documentation.

### Architecture Overview
The system uses a microservices architecture with the following components:
- **Booking Service**: Main API for booking management
- **Job Service**: Background job processing for reminders
- **PostgreSQL**: Primary data store
- **Redis**: Caching and job queue management
- **Nginx**: Reverse proxy and load balancer

### Key Features
- JWT-based authentication with refresh tokens
- Real-time WebSocket notifications
- Background job processing for reminders
- Role-based access control
- Comprehensive API documentation
- Docker containerization with development/production profiles
