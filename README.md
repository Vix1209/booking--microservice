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

```
┌────────────────────────────────────────────────────────────┐
│                    Docker Container                        │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Booking API    │    │   Job Service   │                │
│  │   (Port 5000)   │    │   (Port 5001)   │                │
│  └─────────────────┘    └─────────────────┘                │
│                    │                    │                  │
│                    └───────────┬────────┘                  │
│                                │                           │
└────────────────────────────────┼───────────────────────────┘
                                 │
    ┌─────────────────┐          │          ┌─────────────────┐
    │  Redis (Cloud)  │──────────┼──────────│ PostgreSQL      │
    │  Job Queues &   │          │          │   (Cloud)       │
    │    Caching      │          │          │                 │
    └─────────────────┘          │          └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Host System   │
                        │  Port Mapping   │
                        │ 5000 -> 5000    │
                        │ 5001 -> 5001    │
                        │ 3001 -> 3001    │
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
   # Edit .env file with your cloud database URLs and configuration
   ```

3. **Start the application**

   ```bash
   # Production mode
   docker-compose up -d

   # Or use the helper script (Windows)
   .\docker-scripts.ps1 start

   # Or use the helper script (Linux/macOS/WSL)
   ./docker-scripts.sh start
   ```

4. **Access the application**
   - Main API: http://localhost:5000/api/
   - Swagger Documentation: http://localhost:5000/api
   - Job Service: http://localhost:5001
   - WebSocket: ws://localhost:3001

## Docker Development Mode

For development with hot reload:

```bash
# Start development environment
docker-compose --profile dev up -d booking-dev

# Or use the helper script
.\docker-scripts.ps1 dev  # Windows
./docker-scripts.sh dev   # Linux/macOS/WSL
```

## Docker Helper Scripts

Use the provided scripts for common Docker operations:

**Windows (PowerShell):**

```powershell
.\docker-scripts.ps1 [command]
```

**Linux/macOS/WSL (Bash):**

```bash
./docker-scripts.sh [command]
```

Available commands:

- `build` - Build the Docker image
- `start` - Start in production mode
- `dev` - Start in development mode
- `stop` - Stop the application
- `restart` - Restart the application
- `logs` - View application logs
- `status` - Show container status
- `shell` - Open shell in running container
- `clean` - Clean up Docker resources

For detailed Docker setup instructions, see [DOCKER.md](DOCKER.md).

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

4. **Crypto Module Issues ("crypto is not defined")**
   - This error occurs when argon2 (used for password hashing) cannot access Node.js crypto module
   - The Dockerfile includes necessary build dependencies (python3, make, g++, linux-headers)
   - If running locally without Docker, ensure Node.js has crypto support enabled
   - For Alpine Linux containers, the required build tools are automatically installed

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
