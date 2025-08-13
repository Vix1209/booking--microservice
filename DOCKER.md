# Docker Setup for Booking Microservice

This document provides instructions for running the Booking Microservice application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- `.env` file configured with your cloud database URLs

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:
   ```env
   # Database Configuration (Cloud URLs)
   POSTGRES_CLOUD_DB_URL=postgresql://username:password@your-cloud-db-host:5432/your_db
   POSTGRES_SYNC=false
   
   # Redis Configuration (Cloud URL)
   REDIS_URL=redis://username:password@your-cloud-redis-host:6379
   
   # JWT Configuration
   JWT_SECRET_KEY=your-secure-jwt-secret-key
   JWT_EXPIRATION_TIME=15m
   REFRESH_JWT_SECRET_KEY=your-secure-refresh-jwt-secret-key
   REFRESH_JWT_EXPIRATION_TIME=7d
   
   # Server Configuration
   PORT=5000
   JOB_PORT=5001
   NODE_ENV=production
   
   # WebSocket Configuration
   WS_PORT=3001
   WS_CORS_ORIGIN=http://localhost:3000
   ```

## Docker Commands

### Production Build and Run

1. **Build the Docker image:**
   ```bash
   docker build -t booking-microservice .
   ```

2. **Run with Docker Compose (Recommended):**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f booking-app
   ```

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development Mode

For development with hot reload:

```bash
# Start development environment
docker-compose --profile dev up -d booking-dev

# View development logs
docker-compose logs -f booking-dev

# Stop development environment
docker-compose --profile dev down
```

### Individual Docker Commands

If you prefer to run without Docker Compose:

```bash
# Build the image
docker build -t booking-microservice .

# Run the container
docker run -d \
  --name booking-microservice \
  -p 5000:5000 \
  -p 5001:5001 \
  -p 3001:3001 \
  --env-file .env \
  booking-microservice

# View logs
docker logs -f booking-microservice

# Stop and remove container
docker stop booking-microservice
docker rm booking-microservice
```

## Application Endpoints

Once running, the application will be available at:

- **Main API**: http://localhost:5000/api/
- **Swagger Documentation**: http://localhost:5000/api
- **Job Service**: http://localhost:5001
- **WebSocket**: ws://localhost:3001

## Health Check

The application includes a health check endpoint:
- **Health Check**: http://localhost:5000/api/health

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 5000, 5001, and 3001 are not in use by other applications.

2. **Environment variables**: Ensure your `.env` file is properly configured with valid cloud database URLs.

3. **Database connection**: Verify that your cloud PostgreSQL and Redis instances are accessible and credentials are correct.

4. **Build failures**: Clear Docker cache if you encounter build issues:
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

### Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View Docker images
docker images

# Remove unused Docker resources
docker system prune

# View container resource usage
docker stats

# Execute commands inside running container
docker exec -it booking-microservice /bin/sh

# View container logs
docker logs booking-microservice
```

## Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **deps**: Installs production dependencies
2. **builder**: Installs all dependencies and builds the application
3. **runner**: Creates the final production image with only necessary files

This approach results in a smaller, more secure production image.

## Security Considerations

- The application runs as a non-root user (`nestjs`) inside the container
- Only necessary files are copied to the final image
- Environment variables are used for sensitive configuration
- The `.dockerignore` file excludes unnecessary files from the build context

## Scaling

To run multiple instances of the application:

```bash
# Scale to 3 instances
docker-compose up -d --scale booking-app=3

# Use a load balancer (nginx, traefik, etc.) to distribute traffic
```

## Production Deployment

For production deployment:

1. Use a container orchestration platform (Kubernetes, Docker Swarm, etc.)
2. Set up proper logging and monitoring
3. Configure resource limits and health checks
4. Use secrets management for sensitive environment variables
5. Set up automated backups for your cloud databases