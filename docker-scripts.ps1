# PowerShell script for Docker operations on Windows
# Usage: .\docker-scripts.ps1 [command]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "start", "stop", "restart", "logs", "dev", "clean", "status", "shell")]
    [string]$Command
)

function Show-Help {
    Write-Host "Docker Scripts for Booking Microservice" -ForegroundColor Green
    Write-Host "Usage: .\docker-scripts.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  build    - Build the Docker image"
    Write-Host "  start    - Start the application in production mode"
    Write-Host "  stop     - Stop the application"
    Write-Host "  restart  - Restart the application"
    Write-Host "  logs     - View application logs"
    Write-Host "  dev      - Start in development mode with hot reload"
    Write-Host "  clean    - Clean up Docker resources"
    Write-Host "  status   - Show container status"
    Write-Host "  shell    - Open shell in running container"
}

switch ($Command) {
    "build" {
        Write-Host "Building Docker image..." -ForegroundColor Green
        docker-compose build
    }
    
    "start" {
        Write-Host "Starting application in production mode..." -ForegroundColor Green
        docker-compose up -d booking-app
        Write-Host "Application started! Available at:" -ForegroundColor Yellow
        Write-Host "  Main API: http://localhost:5000/api/" -ForegroundColor Cyan
        Write-Host "  Swagger: http://localhost:5000/api" -ForegroundColor Cyan
        Write-Host "  Job Service: http://localhost:5001" -ForegroundColor Cyan
    }
    
    "stop" {
        Write-Host "Stopping application..." -ForegroundColor Yellow
        docker-compose down
    }
    
    "restart" {
        Write-Host "Restarting application..." -ForegroundColor Yellow
        docker-compose restart booking-app
    }
    
    "logs" {
        Write-Host "Showing application logs (Ctrl+C to exit)..." -ForegroundColor Green
        docker-compose logs -f booking-app
    }
    
    "dev" {
        Write-Host "Starting application in development mode..." -ForegroundColor Green
        docker-compose --profile dev up -d booking-dev
        Write-Host "Development server started with hot reload!" -ForegroundColor Yellow
        Write-Host "  Main API: http://localhost:5000/api/" -ForegroundColor Cyan
        Write-Host "  Swagger: http://localhost:5000/api" -ForegroundColor Cyan
        Write-Host "  Job Service: http://localhost:5001" -ForegroundColor Cyan
    }
    
    "clean" {
        Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
        docker-compose down -v
        docker system prune -f
        Write-Host "Cleanup completed!" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "Container status:" -ForegroundColor Green
        docker-compose ps
        Write-Host ""
        Write-Host "Docker images:" -ForegroundColor Green
        docker images | Select-String "booking"
    }
    
    "shell" {
        Write-Host "Opening shell in running container..." -ForegroundColor Green
        $containerId = docker-compose ps -q booking-app
        if ($containerId) {
            docker exec -it $containerId /bin/sh
        } else {
            Write-Host "No running container found. Start the application first." -ForegroundColor Red
        }
    }
    
    default {
        Show-Help
    }
}