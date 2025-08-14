# Booking Microservice

A comprehensive booking management system built with NestJS, featuring real-time notifications, background job processing, and a robust microservices architecture.

## Features

- **Booking Management**: Create, read, update, and delete bookings
- **Real-time Notifications**: WebSocket-based notifications for booking events
- **Background Jobs**: Automated reminder system using Bull queues
- **Authentication**: JWT-based authentication with role-based access
- **Microservices Architecture**: Separate services for booking and job processing
- **Database**: PostgreSQL with TypeORM for data persistence
- **Caching**: Redis for caching and job queue management
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Unit tests and E2E tests
- **Containerization**: Docker and Docker Compose support

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Booking API    │    │   Job Service   │    │   WebSocket     │
│   (Port 5000)   │    │   (Port 5001)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────┬───────────┴───────────┬───────────┘
                     │                       │
         ┌─────────────────┐    ┌─────────────────────────┐
         │  Redis (Cloud)  │    │   PostgreSQL (Cloud)   │
         │  Job Queues &   │    │     Main Database       │
         │    Caching      │    │                         │
         └─────────────────┘    └─────────────────────────┘
```

### Docker Architecture

#### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Nginx     │    │  Booking    │    │    Job      │      │
│  │   :80       │────│  Service    │    │  Service    │      │
│  │             │    │   :5000     │    │   :5001     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│  ┌─────────────┐    ┌─────────────┐                         │
│  │ PostgreSQL  │    │    Redis    │                         │
│  │   :5432     │    │   :6379     │                         │
│  │             │    │             │                         │
│  └─────────────┘    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

#### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Nginx Prod  │    │  Booking    │    │    Job      │      │
│  │   :80       │────│ Service Prod│    │Service Prod │      │
│  │             │    │   :5002     │    │   :5003     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│                    ┌─────────────────┐                      │
│                    │ External Cloud  │                      │
│                    │   Databases     │                      │
│                    │ (PostgreSQL +   │                      │
│                    │     Redis)      │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 2GB+ available disk space
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

## 🚀 Quick Start with Docker

### Development Mode (with local databases)

```bash
# Clone the repository
git clone <repository-url>
cd booking-microservice

# Start all services in development mode
docker compose up

# Access the application
# - API Endpoints: http://localhost/api/
# - Job Service: http://localhost/jobs/
# - WebSocket: http://localhost/ws/
# - Health Check: http://localhost/health
```

### Production Mode (with cloud databases)

```bash
# Environment Setup
cp .env.example .env
# Edit .env file with your cloud database URLs and configuration

# Start all services in production mode
docker compose --profile prod up -d

# Access the application (different ports)
# - API Endpoints: http://localhost/api/ (via nginx)
# - Job Service: http://localhost/jobs/ (via nginx)
# - Direct API Access: http://localhost:5002/api/
# - Direct Job Access: http://localhost:5003/job/health

# View logs
docker compose --profile prod logs -f

# Stop services
docker compose --profile prod down
```

## 🔧 Docker Configuration

### Service Profiles

**Development Profile (default)**

- Local PostgreSQL and Redis containers
- Hot reload enabled with volume mounts
- Development nginx configuration (`nginx.conf`)
- Services run on standard ports (5000, 5001)
- Debug logging enabled
- CORS enabled for development

**Production Profile (`--profile prod`)**

- External cloud databases (PostgreSQL + Redis)
- Optimized production builds
- Production nginx configuration (`nginx.prod.conf`)
- Services run on different external ports (5002, 5003)
- Enhanced security headers
- Stricter rate limiting
- Production logging

### Service Routing

#### Development (nginx.conf)

| Route     | Service         | Internal Port | Description               |
| --------- | --------------- | ------------- | ------------------------- |
| `/api/*`  | booking-service | 5000          | Main API endpoints        |
| `/jobs/*` | job-service     | 5001          | Background job management |
| `/ws/*`   | booking-service | 5000          | WebSocket connections     |
| `/health` | nginx           | -             | Health check endpoint     |

#### Production (nginx.prod.conf)

| Route     | Service              | Internal Port | External Port | Description               |
| --------- | -------------------- | ------------- | ------------- | ------------------------- |
| `/api/*`  | booking-service-prod | 5000          | 5002          | Main API endpoints        |
| `/jobs/*` | job-service-prod     | 5001          | 5003          | Background job management |
| `/ws/*`   | booking-service-prod | 5000          | 5002          | WebSocket connections     |
| `/health` | nginx                | -             | 80            | Health check endpoint     |

## 📝 Docker Commands

### Development Workflow

```bash
# Start development environment (default profile)
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f booking-service
docker compose logs -f job-service
docker compose logs -f postgres
docker compose logs -f redis

# Stop services
docker compose down

# Rebuild and start
docker compose up --build

# Remove volumes (reset databases)
docker compose down -v
```

### Production Workflow

```bash
# Build production images
docker compose --profile prod build

# Start production environment
docker compose --profile prod up -d

# Check service status
docker compose --profile prod ps

# View production logs
docker compose --profile prod logs -f

# Update production deployment
docker compose --profile prod pull
docker compose --profile prod up -d --build

# Stop production services
docker compose --profile prod down
```

### Database Management (Development Only)

```bash
# Run database migrations
docker compose exec booking-service npm run migration:run

# Access PostgreSQL CLI
docker compose exec postgres psql -U booking_user -d booking_db

# Access Redis CLI
docker compose exec redis redis-cli

# Backup database
docker compose exec postgres pg_dump -U booking_user booking_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U booking_user booking_db < backup.sql
```

### Debugging

```bash
# Access service shell
docker compose exec booking-service sh
docker compose exec job-service sh

# Check service health endpoints
curl http://localhost/health                    # Nginx health
curl http://localhost/api/                      # Booking API
curl http://localhost/jobs/health               # Job service health

# Direct service access (production)
curl http://localhost:5002/api/                 # Direct booking API
curl http://localhost:5003/job/health           # Direct job service

# Monitor resource usage
docker stats

# View container details
docker compose ps
docker inspect booking-service
```

## Local Development Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start PostgreSQL and Redis**

   ```bash
   docker-compose up postgres redis -d
   ```

3. **Environment configuration**

   ```bash
   cp .env.example .env
   # Configure your local environment variables
   ```

4. **Run database migrations**

   ```bash
   npm run migration:run
   ```

5. **Start the applications**

   ```bash
   # Terminal 1 - Booking Service
   npm run start:dev booking-microservice

   # Terminal 2 - Job Service
   npm run start:dev job
   ```

## Environment Variables

| Variable                      | Description                    | Default                                                |
| ----------------------------- | ------------------------------ | ------------------------------------------------------ |
| `DATABASE_URL`                | PostgreSQL cloud database URL  | postgresql://username:password@localhost:5432/quivy_db |
| `POSTGRES_SYNC`               | Enable TypeORM synchronization | true (dev), false (prod)                               |
| `REDIS_URL`                   | Redis cloud URL                | redis://localhost:6379                                 |
| `JWT_SECRET_KEY`              | JWT signing secret             | your-jwt-secret-key                                    |
| `JWT_EXPIRATION_TIME`         | JWT expiration time            | 15m                                                    |
| `REFRESH_JWT_SECRET_KEY`      | Refresh JWT signing secret     | your-refresh-jwt-secret-key                            |
| `REFRESH_JWT_EXPIRATION_TIME` | Refresh JWT expiration time    | 7d                                                     |
| `PORT`                        | Main API service port          | 5000                                                   |
| `JOB_PORT`                    | Job service port               | 5001                                                   |
| `NODE_ENV`                    | Node environment               | development                                            |
| `WS_PORT`                     | WebSocket port                 | 3001                                                   |
| `WS_CORS_ORIGIN`              | WebSocket CORS origin          | http://localhost:3000                                  |

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token

### Bookings

- `GET /booking` - Get all bookings (paginated)
- `POST /booking` - Create a new booking
- `GET /booking/:id` - Get booking by ID
- `PATCH /booking/:id` - Update booking
- `DELETE /booking/:id` - Delete booking
- `GET /booking/upcoming` - Get upcoming bookings
- `GET /booking/past` - Get past bookings
- `PATCH /booking/:id/status` - Update booking status

### Job Management

- `GET /jobs/health` - Job service health check
- `GET /jobs/metrics` - Job queue metrics
- `GET /jobs/stats` - Queue statistics
- `POST /jobs/cleanup` - Clean up completed jobs

## WebSocket Events

The application supports real-time notifications via WebSocket:

### Client Events

- `join-user-room` - Join user-specific notification room
- `leave-user-room` - Leave user-specific notification room

### Server Events

- `booking-created` - New booking created
- `booking-updated` - Booking updated
- `booking-deleted` - Booking deleted
- `booking-reminder` - Booking reminder (10 minutes before)
- `system-broadcast` - System-wide notifications

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## Database Migrations

### Generate Migration

```bash
npm run migration:generate -- -n MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Migration

```bash
npm run migration:revert
```

## 📊 Monitoring and Health Checks

### Built-in Health Checks

```bash
# Service health (both environments)
curl http://localhost/health

# Development specific
curl http://localhost/api/                      # Swagger UI
curl http://localhost/jobs/health               # Job metrics

# Production specific
curl http://localhost:5002/api/                 # Direct API
curl http://localhost:5003/job/health           # Direct job service
```

### Docker Health Status

```bash
# Check container health
docker compose ps
docker compose --profile prod ps

# View health check logs
docker inspect --format='{{json .State.Health}}' booking-service
docker inspect --format='{{json .State.Health}}' booking-service-prod
```

### Production Monitoring

```bash
# Container resource usage
docker stats

# Service logs
docker compose --profile prod logs --tail=100 -f

# Nginx access logs
docker compose --profile prod exec nginx-prod tail -f /var/log/nginx/access.log

# Application logs
docker compose --profile prod logs -f booking-service-prod
docker compose --profile prod logs -f job-service-prod
```

### Health Check Endpoints

- Booking Service: `GET /health`
- Job Service: `GET /jobs/health`

### Metrics

- Job Queue Metrics: `GET /jobs/metrics`
- Queue Statistics: `GET /jobs/stats`

## 🔄 Deployment Workflow

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd booking-microservice

# Start development environment
docker compose up -d

# Run initial setup (if needed)
docker compose exec booking-service npm run migration:run

# Development ready!
echo "Development environment ready at http://localhost"
```

### Production Deployment

```bash
# Prepare environment file
cp .env.example .env
# Edit .env with production values

# Build and deploy
docker compose --profile prod build
docker compose --profile prod up -d

# Verify deployment
curl http://localhost/health
docker compose --profile prod ps

# Production ready!
echo "Production environment ready at http://localhost"
```

### Docker Production Build

```bash
# Build production images
docker compose --profile prod build

# Deploy to production
docker compose --profile prod up -d
```

### Environment Considerations

- Use strong JWT secrets
- Configure proper database credentials
- Set up SSL/TLS certificates
- Configure proper CORS origins
- Set up monitoring and logging
- Configure backup strategies

## 🔒 Security Considerations

### Development

- Uses standard passwords (for convenience)
- CORS enabled for all origins
- Debug logging enabled
- Swagger UI accessible
- No SSL/TLS required

### Production

- **MUST** update `.env` with secure credentials
- **MUST** use strong JWT secrets (64+ characters)
- **MUST** configure proper CORS origins
- Enhanced security headers in nginx
- Stricter rate limiting
- Hidden server information
- **SHOULD** add SSL/TLS termination
- **SHOULD** implement proper monitoring

### Production Security Checklist

- [ ] Update all default passwords in `.env`
- [ ] Set strong JWT_SECRET_KEY
- [ ] Configure CORS_ENABLED=false
- [ ] Set SWAGGER_ENABLED=false
- [ ] Review rate limiting settings
- [ ] Test security headers
- [ ] Implement SSL/TLS certificates
- [ ] Set up monitoring and alerting

### Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with class-validator
- SQL injection prevention with TypeORM
- Rate limiting via Nginx
- CORS configuration
- Security headers

## 🚀 Performance Optimizations

### Development

- Use `.dockerignore` to exclude unnecessary files
- Mount only necessary directories for hot reload
- Use development Docker target for faster builds
- Keep development databases small

### Production

- Use production-optimized images
- Enable gzip compression (handled by nginx)
- Configure proper resource limits
- Use external databases for scalability
- Implement connection pooling
- Use Redis for caching and sessions

### General Optimizations

- Database indexing for optimal query performance
- Redis caching for frequently accessed data
- Connection pooling for database connections
- Gzip compression via Nginx
- Efficient pagination for large datasets
- Background job processing for non-blocking operations

## 🔍 Troubleshooting

### Common Issues

**Services won't start**

```bash
# Check logs for errors
docker compose logs

# Check specific profile
docker compose --profile prod logs

# Rebuild containers
docker compose down
docker compose up --build
```

**Database connection errors (Development)**

```bash
# Ensure databases are healthy
docker compose ps

# Check database logs
docker compose logs postgres
docker compose logs redis

# Verify credentials match
# PostgreSQL: booking_user:booking_password
# Connection string should match POSTGRES_USER/POSTGRES_PASSWORD

# Reset database volumes
docker compose down -v
docker compose up
```

**Port conflicts**

```bash
# Check what's using ports
netstat -tulpn | grep :80
netstat -tulpn | grep :5000

# Development uses: 80, 5000, 5001
# Production uses: 80, 5002, 5003
```

**Hot reload not working (Development)**

```bash
# Ensure volume mounts are correct
docker compose config

# Check file permissions
ls -la

# Restart development services
docker compose restart booking-service job-service
```

**Production services not starting**

```bash
# Verify .env file exists and has correct values
cat .env

# Check if external databases are accessible
# Test PostgreSQL connection
# Test Redis connection

# Check production profile
docker compose --profile prod config
```

**Legacy Issues**

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

2. **Redis Connection Issues**
   - Verify Redis is running
   - Check Redis configuration
   - Verify network connectivity

3. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify WebSocket port is accessible
   - Check firewall settings

4. **Crypto Module Issues ("crypto is not defined")**
   - This error occurs when argon2 (used for password hashing) cannot access Node.js crypto module
   - The Dockerfile includes necessary build dependencies (python3, make, g++, linux-headers)
   - If running locally without Docker, ensure Node.js has crypto support enabled
   - For Alpine Linux containers, the required build tools are automatically installed

### Health Checks

| Environment | Service     | Endpoint                           | Expected Response  |
| ----------- | ----------- | ---------------------------------- | ------------------ |
| Dev         | Nginx       | `http://localhost/health`          | `healthy`          |
| Dev         | Booking API | `http://localhost/api/`            | Swagger UI         |
| Dev         | Job Service | `http://localhost/jobs/health`     | JSON health status |
| Prod        | Nginx       | `http://localhost/health`          | `healthy`          |
| Prod        | Booking API | `http://localhost:5002/api/`       | API response       |
| Prod        | Job Service | `http://localhost:5003/job/health` | JSON health status |

### Logs

```bash
# View application logs
docker compose logs booking-service
docker compose logs job-service

# Follow logs in real-time
docker compose logs -f booking-service

# Production logs
docker compose --profile prod logs --tail=100 -f

# Nginx access logs
docker compose --profile prod exec nginx-prod tail -f /var/log/nginx/access.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
