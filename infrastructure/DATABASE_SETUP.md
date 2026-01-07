# Database Setup Guide

Hướng dẫn triển khai và quản lý database cho hệ thống LMS.

## 📦 Tổng quan

Hệ thống sử dụng 3 database containers:

| Database | Version | Port | Purpose |
|----------|---------|------|---------|
| PostgreSQL | 15 | 5432 | Main relational database (users, courses, learning data, gamification) |
| Redis | 7 | 6379 | Cache & real-time data (SRS, leaderboard, sessions) |
| MongoDB | 7 | 27017 | AI Assistant data (chat logs, prompts, analytics) |

## 🚀 Quick Start

### Windows (PowerShell)

```powershell
# Start databases
.\scripts\db-manage.ps1 start

# Stop databases
.\scripts\db-manage.ps1 stop

# View status
.\scripts\db-manage.ps1 status

# View logs
.\scripts\db-manage.ps1 logs
```

### Linux/Mac (Bash)

```bash
# Make script executable
chmod +x scripts/db-manage.sh

# Start databases
./scripts/db-manage.sh start

# Stop databases
./scripts/db-manage.sh stop

# View status
./scripts/db-manage.sh status
```

### Using Docker Compose directly

```bash
# Start only databases
docker-compose up -d postgres redis mongodb

# Stop databases
docker-compose stop postgres redis mongodb

# View logs
docker-compose logs -f postgres redis mongodb

# Remove everything
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and update values:

```env
# PostgreSQL
DATABASE_URL=postgresql://lms_user:lms_pass@localhost:5432/lms

# Redis
REDIS_URL=redis://localhost:6379

# MongoDB
MONGODB_URL=mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin
```

### Default Credentials

**⚠️ CHANGE THESE IN PRODUCTION!**

```
PostgreSQL:
  - Database: lms
  - User: lms_user
  - Password: lms_pass
  - Port: 5432

Redis:
  - Port: 6379
  - No password (local only)

MongoDB:
  - Database: lms_ai
  - User: lms_user
  - Password: lms_pass
  - Port: 27017
```

## 🔌 Connecting to Databases

### PostgreSQL

```bash
# Using psql
docker exec -it lms_postgres psql -U lms_user -d lms

# Using script
.\scripts\db-manage.ps1 shell postgres

# Connection string
postgresql://lms_user:lms_pass@localhost:5432/lms
```

### Redis

```bash
# Using redis-cli
docker exec -it lms_redis redis-cli

# Using script
.\scripts\db-manage.ps1 shell redis

# Test connection
redis-cli ping
```

### MongoDB

```bash
# Using mongosh
docker exec -it lms_mongodb mongosh -u lms_user -p lms_pass --authenticationDatabase admin lms_ai

# Using script
.\scripts\db-manage.ps1 shell mongodb

# Connection string
mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin
```

## 📊 Database Schema

### PostgreSQL (53 tables)

Schema được tổ chức theo:
- **auth schema** - Authentication & authorization
- **content schema** - Courses, lessons, exercises
- **learning schema** - Progress, mastery, SRS
- **gamification schema** - XP, streaks, achievements

Chi tiết: [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)

### MongoDB (6 collections)

- `ai_prompt_templates` - AI prompt templates
- `ai_sessions` - Chat sessions
- `ai_messages` - Chat messages
- `ai_invocation_logs` - API call logs
- `ai_feedback` - User feedback
- `moderation_flags` - Content moderation

### Redis (Key patterns)

```
user:{user_id}:review_queue          # Sorted Set - SRS review queue
user:{user_id}:srs_schedules          # Hash - SRS schedules
league:{league_id}:week:{week_id}     # Sorted Set - Leaderboard
session:{session_id}                  # String - Auth session cache
```

## 💾 Backup & Restore

### Backup

```bash
# Backup all databases
.\scripts\db-manage.ps1 backup

# Manual backup
docker exec lms_postgres pg_dump -U lms_user lms > backup.sql
docker exec lms_mongodb mongodump --uri="mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin"
```

### Restore

```bash
# PostgreSQL
docker exec -i lms_postgres psql -U lms_user lms < backup.sql

# MongoDB
docker exec -i lms_mongodb mongorestore --uri="mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin" /backup/path
```

## 🔍 Monitoring

### Health Checks

```bash
# PostgreSQL
docker exec lms_postgres pg_isready -U lms_user

# Redis
docker exec lms_redis redis-cli ping

# MongoDB
docker exec lms_mongodb mongosh --eval "db.adminCommand('ping')"
```

### View Logs

```bash
# All databases
.\scripts\db-manage.ps1 logs

# Specific database
.\scripts\db-manage.ps1 logs postgres
.\scripts\db-manage.ps1 logs redis
.\scripts\db-manage.ps1 logs mongodb
```

### Resource Usage

```bash
# Container stats
docker stats lms_postgres lms_redis lms_mongodb

# Disk usage
docker exec lms_postgres du -sh /var/lib/postgresql/data
```

## 🛠️ Maintenance

### Clean up unused data

```bash
# PostgreSQL - vacuum
docker exec lms_postgres psql -U lms_user -d lms -c "VACUUM ANALYZE;"

# Redis - flush cache
docker exec lms_redis redis-cli FLUSHDB

# MongoDB - compact
docker exec lms_mongodb mongosh -u lms_user -p lms_pass --authenticationDatabase admin --eval "db.runCommand({compact: 'collection_name'})"
```

### Reset everything

```bash
# Stop and remove all containers and volumes
.\scripts\db-manage.ps1 remove

# Or manually
docker-compose down -v
```

## 🐛 Troubleshooting

### Database won't start

```bash
# Check Docker is running
docker info

# Check logs
.\scripts\db-manage.ps1 logs postgres

# Remove and restart
docker-compose down
docker-compose up -d postgres redis mongodb
```

### Connection refused

```bash
# Check container is running
docker ps | grep lms_

# Check port is not already in use
netstat -ano | findstr :5432
netstat -ano | findstr :6379
netstat -ano | findstr :27017
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk usage
docker system df
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [Redis Documentation](https://redis.io/docs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/v7.0/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🔒 Security Notes

1. **Change default passwords** in production
2. **Use secrets management** (e.g., Docker secrets, Vault)
3. **Enable SSL/TLS** for external connections
4. **Restrict network access** (use Docker networks)
5. **Regular backups** to separate storage
6. **Monitor access logs** for suspicious activity

## 🚀 Production Deployment

For production, consider:

1. **Managed Database Services**
   - AWS RDS (PostgreSQL)
   - AWS ElastiCache (Redis)
   - MongoDB Atlas

2. **High Availability**
   - PostgreSQL replication
   - Redis Sentinel/Cluster
   - MongoDB Replica Sets

3. **Monitoring & Alerts**
   - Prometheus + Grafana
   - CloudWatch
   - DataDog

4. **Backup Strategy**
   - Automated daily backups
   - Point-in-time recovery
   - Cross-region replication
