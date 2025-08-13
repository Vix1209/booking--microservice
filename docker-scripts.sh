#!/bin/bash

# Docker scripts for Booking Microservice
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${GREEN}Docker Scripts for Booking Microservice${NC}"
    echo -e "${YELLOW}Usage: ./docker-scripts.sh [command]${NC}"
    echo ""
    echo -e "${CYAN}Available commands:${NC}"
    echo "  build    - Build the Docker image"
    echo "  start    - Start the application in production mode"
    echo "  stop     - Stop the application"
    echo "  restart  - Restart the application"
    echo "  logs     - View application logs"
    echo "  dev      - Start in development mode with hot reload"
    echo "  clean    - Clean up Docker resources"
    echo "  status   - Show container status"
    echo "  shell    - Open shell in running container"
    echo "  help     - Show this help message"
}

case "$1" in
    build)
        echo -e "${GREEN}Building Docker image...${NC}"
        docker-compose build
        ;;
    
    start)
        echo -e "${GREEN}Starting application in production mode...${NC}"
        docker-compose up -d booking-app
        echo -e "${YELLOW}Application started! Available at:${NC}"
        echo -e "${CYAN}  Main API: http://localhost:5000/api/${NC}"
        echo -e "${CYAN}  Swagger: http://localhost:5000/api${NC}"
        echo -e "${CYAN}  Job Service: http://localhost:5001${NC}"
        ;;
    
    stop)
        echo -e "${YELLOW}Stopping application...${NC}"
        docker-compose down
        ;;
    
    restart)
        echo -e "${YELLOW}Restarting application...${NC}"
        docker-compose restart booking-app
        ;;
    
    logs)
        echo -e "${GREEN}Showing application logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f booking-app
        ;;
    
    dev)
        echo -e "${GREEN}Starting application in development mode...${NC}"
        docker-compose --profile dev up -d booking-dev
        echo -e "${YELLOW}Development server started with hot reload!${NC}"
        echo -e "${CYAN}  Main API: http://localhost:5000/api/${NC}"
        echo -e "${CYAN}  Swagger: http://localhost:5000/api${NC}"
        echo -e "${CYAN}  Job Service: http://localhost:5001${NC}"
        ;;
    
    clean)
        echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
        docker-compose down -v
        docker system prune -f
        echo -e "${GREEN}Cleanup completed!${NC}"
        ;;
    
    status)
        echo -e "${GREEN}Container status:${NC}"
        docker-compose ps
        echo ""
        echo -e "${GREEN}Docker images:${NC}"
        docker images | grep booking || echo "No booking images found"
        ;;
    
    shell)
        echo -e "${GREEN}Opening shell in running container...${NC}"
        CONTAINER_ID=$(docker-compose ps -q booking-app)
        if [ -n "$CONTAINER_ID" ]; then
            docker exec -it "$CONTAINER_ID" /bin/sh
        else
            echo -e "${RED}No running container found. Start the application first.${NC}"
            exit 1
        fi
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    "")
        echo -e "${RED}Error: No command specified${NC}"
        echo ""
        show_help
        exit 1
        ;;
    
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac