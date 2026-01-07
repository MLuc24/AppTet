#!/bin/bash
# Database Management Script for LMS

set -e

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="lms"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    print_info "Docker is running ✓"
}

# Function to start only databases
start_databases() {
    print_info "Starting database containers..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d postgres redis mongodb
    
    print_info "Waiting for databases to be ready..."
    
    # Wait for PostgreSQL
    print_info "Waiting for PostgreSQL..."
    until docker exec lms_postgres pg_isready -U lms_user > /dev/null 2>&1; do
        sleep 1
    done
    print_info "PostgreSQL is ready ✓"
    
    # Wait for Redis
    print_info "Waiting for Redis..."
    until docker exec lms_redis redis-cli ping > /dev/null 2>&1; do
        sleep 1
    done
    print_info "Redis is ready ✓"
    
    # Wait for MongoDB
    print_info "Waiting for MongoDB..."
    until docker exec lms_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 1
    done
    print_info "MongoDB is ready ✓"
    
    echo ""
    print_info "All databases are running!"
    print_info "PostgreSQL: localhost:5432"
    print_info "Redis: localhost:6379"
    print_info "MongoDB: localhost:27017"
}

# Function to stop databases
stop_databases() {
    print_info "Stopping database containers..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME stop postgres redis mongodb
    print_info "Databases stopped ✓"
}

# Function to restart databases
restart_databases() {
    print_info "Restarting database containers..."
    stop_databases
    sleep 2
    start_databases
}

# Function to show database status
status_databases() {
    print_info "Database container status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps postgres redis mongodb
}

# Function to show database logs
logs_databases() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f postgres redis mongodb
    else
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $SERVICE
    fi
}

# Function to remove databases (with confirmation)
remove_databases() {
    print_warn "This will remove all database containers and volumes!"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        print_info "Removing database containers and volumes..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v
        print_info "Databases removed ✓"
    else
        print_info "Operation cancelled"
    fi
}

# Function to access database shells
shell_db() {
    DB=${1:-postgres}
    case $DB in
        postgres|pg)
            print_info "Connecting to PostgreSQL..."
            docker exec -it lms_postgres psql -U lms_user -d lms
            ;;
        redis)
            print_info "Connecting to Redis..."
            docker exec -it lms_redis redis-cli
            ;;
        mongo|mongodb)
            print_info "Connecting to MongoDB..."
            docker exec -it lms_mongodb mongosh -u lms_user -p lms_pass --authenticationDatabase admin lms_ai
            ;;
        *)
            print_error "Unknown database: $DB"
            print_info "Available options: postgres, redis, mongodb"
            exit 1
            ;;
    esac
}

# Function to backup databases
backup_databases() {
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    print_info "Creating backups in $BACKUP_DIR..."
    
    # Backup PostgreSQL
    print_info "Backing up PostgreSQL..."
    docker exec lms_postgres pg_dump -U lms_user lms > "$BACKUP_DIR/postgres_lms.sql"
    
    # Backup MongoDB
    print_info "Backing up MongoDB..."
    docker exec lms_mongodb mongodump --uri="mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin" --out=/tmp/mongo_backup
    docker cp lms_mongodb:/tmp/mongo_backup "$BACKUP_DIR/mongodb"
    
    print_info "Backups created successfully in $BACKUP_DIR ✓"
}

# Main script
case "${1:-}" in
    start|up)
        check_docker
        start_databases
        ;;
    stop|down)
        stop_databases
        ;;
    restart)
        check_docker
        restart_databases
        ;;
    status|ps)
        status_databases
        ;;
    logs)
        logs_databases "${2:-}"
        ;;
    remove|clean)
        remove_databases
        ;;
    shell)
        shell_db "${2:-postgres}"
        ;;
    backup)
        backup_databases
        ;;
    *)
        echo "LMS Database Management"
        echo ""
        echo "Usage: $0 {command} [options]"
        echo ""
        echo "Commands:"
        echo "  start|up         Start database containers"
        echo "  stop|down        Stop database containers"
        echo "  restart          Restart database containers"
        echo "  status|ps        Show database status"
        echo "  logs [service]   Show logs (postgres|redis|mongodb)"
        echo "  shell [db]       Access database shell (postgres|redis|mongodb)"
        echo "  backup           Backup all databases"
        echo "  remove|clean     Remove containers and volumes (with confirmation)"
        echo ""
        exit 1
        ;;
esac
