# Docker Setup Guide

This guide explains how to run the Booking Microservice using Docker and Docker Compose with separate development and production configurations.

## 🚀 Quick Start

### Development Mode (with local databases)

```bash
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

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 2GB+ available disk space

## 🏗️ Architecture

### Development Environment

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

### Production Environment

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

## 🔧 Configuration

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

### Environment Files

**Development**

- Environment variables defined in `docker-compose.yml`
- Overrides `.env` values for local development
- Uses local database connections

**Production (`.env`)**

```env
# Production Environment Configuration
NODE_ENV=production
PORT=5000
JOB_PORT=5001

# Cloud Database URLs
DATABASE_URL=postgres://avnadmin:...@pg-xxx.aivencloud.com:22987/defaultdb
REDIS_URL=rediss://red-xxx:...@oregon-keyvalue.render.com:6379

# Security Configuration
JWT_SECRET_KEY=your-secure-jwt-secret
CORS_ENABLED=false
SWAGGER_ENABLED=false
LOG_LEVEL=warn
```

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

## 📝 Detailed Commands

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

### Health Checks

| Environment | Service     | Endpoint                           | Expected Response  |
| ----------- | ----------- | ---------------------------------- | ------------------ |
| Dev         | Nginx       | `http://localhost/health`          | `healthy`          |
| Dev         | Booking API | `http://localhost/api/`            | Swagger UI         |
| Dev         | Job Service | `http://localhost/jobs/health`     | JSON health status |
| Prod        | Nginx       | `http://localhost/health`          | `healthy`          |
| Prod        | Booking API | `http://localhost:5002/api/`       | API response       |
| Prod        | Job Service | `http://localhost:5003/job/health` | JSON health status |

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

## 📊 Monitoring

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

## 🚀 Performance Tips

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

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://nestjs.com/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review service logs**: `docker compose logs [service-name]`
3. **Verify environment configuration**: Compare dev vs prod settings
4. **Ensure all prerequisites are met**: Docker versions, ports availability
5. **Check Docker and Docker Compose versions**: `docker --version && docker compose version`
6. **Verify profile usage**: Development (no flag) vs Production (`--profile prod`)

### Getting Help

```bash
# View configuration
docker compose config                    # Development
docker compose --profile prod config     # Production

# Debug service startup
docker compose up --no-deps [service-name]

# Check service dependencies
docker compose ps
docker compose top
```
