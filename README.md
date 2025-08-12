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
┌─────────────────┐    ┌─────────────────┐
│  Booking API    │    │   Job Service   │
│   (Port 3000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────┐
         │     Redis       │
         │   (Port 6379)   │
         └─────────────────┘
                     │
         ┌─────────────────┐
         │   PostgreSQL    │
         │   (Port 5432)   │
         └─────────────────┘
```

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd booking-microservice
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec booking-service npm run migration:run
   ```

5. **Access the application**
   - Booking API: http://localhost:3000
   - Job Service: http://localhost:3001
   - API Documentation: http://localhost:3000/api
   - Nginx Proxy: http://localhost:80

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

| Variable | Description | Default |
|----------|-------------|----------|
| `DATABASE_HOST` | PostgreSQL host | localhost |
| `DATABASE_PORT` | PostgreSQL port | 5432 |
| `DATABASE_USERNAME` | Database username | booking_user |
| `DATABASE_PASSWORD` | Database password | booking_password |
| `DATABASE_NAME` | Database name | booking_db |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | (empty) |
| `REDIS_DB` | Redis database number | 0 |
| `JWT_SECRET` | JWT signing secret | your-secret-key |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `JOB_PORT` | Job service port | 3001 |
| `WEBSOCKET_PORT` | WebSocket port | 3002 |
| `WEBSOCKET_CORS_ORIGIN` | WebSocket CORS origin | http://localhost:3000 |

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

## Monitoring and Health Checks

### Health Check Endpoints
- Booking Service: `GET /health`
- Job Service: `GET /jobs/health`

### Metrics
- Job Queue Metrics: `GET /jobs/metrics`
- Queue Statistics: `GET /jobs/stats`

## Production Deployment

### Docker Production Build
```bash
# Build production images
docker-compose build

# Deploy to production
docker-compose up -d
```

### Environment Considerations
- Use strong JWT secrets
- Configure proper database credentials
- Set up SSL/TLS certificates
- Configure proper CORS origins
- Set up monitoring and logging
- Configure backup strategies

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with class-validator
- SQL injection prevention with TypeORM
- Rate limiting via Nginx
- CORS configuration
- Security headers

## Performance Optimizations

- Database indexing for optimal query performance
- Redis caching for frequently accessed data
- Connection pooling for database connections
- Gzip compression via Nginx
- Efficient pagination for large datasets
- Background job processing for non-blocking operations

## Troubleshooting

### Common Issues

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

### Logs
```bash
# View application logs
docker-compose logs booking-service
docker-compose logs job-service

# Follow logs in real-time
docker-compose logs -f booking-service
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
