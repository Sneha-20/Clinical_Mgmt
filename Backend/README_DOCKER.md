# Clinical Management Backend - Docker Setup

## Quick Start

### Prerequisites
- Docker Desktop installed
- Python 3.12 (for local development)

### Running the Application

1. **Start all services:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f backend
```

3. **Stop services:**
```bash
docker-compose down
```

4. **Rebuild and start:**
```bash
docker-compose up --build -d
```

## Services

### Backend (Django)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/clinical/
- **Health Check**: http://localhost:8000/api/clinical/

### PostgreSQL Database
- **Host**: localhost:5432
- **Database**: clinical_management
- **Username**: postgres
- **Password**: postgres123

### Redis (Optional)
- **URL**: localhost:6379
- **Purpose**: Caching and session storage

## Environment Variables

### Backend Environment
- `DEBUG=True` - Development mode
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Allowed hosts for Django

### Database Environment
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password

## Volumes

### Persistent Data
- `postgres_data` - PostgreSQL data
- `media_files` - Django media files
- `static_files` - Django static files
- `log_files` - Application logs
- `redis_data` - Redis data

## Development Workflow

### 1. Make changes to code
Edit files in the `Python/` directory

### 2. Restart backend service
```bash
docker-compose restart backend
```

### 3. View logs
```bash
docker-compose logs -f backend
```

### 4. Access database
```bash
docker-compose exec db psql -U postgres -d clinical_management
```

## Database Management

### Create migrations
```bash
docker-compose exec backend python manage.py makemigrations
```

### Apply migrations
```bash
docker-compose exec backend python manage.py migrate
```

### Create superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Collect static files
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec backend python manage.py dbshell
```

### Database issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
```

### Permission issues
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

## Production Considerations

### Security
- Change default passwords
- Use environment variables for secrets
- Enable HTTPS
- Set `DEBUG=False`

### Performance
- Use production database settings
- Configure Redis for caching
- Use Gunicorn instead of runserver
- Configure nginx for static files

### Monitoring
- Set up logging
- Monitor resource usage
- Set up alerts

## Useful Commands

### Docker Compose
```bash
# List all services
docker-compose ps

# View resource usage
docker-compose top

# Execute commands in container
docker-compose exec backend bash

# Clean up
docker-compose down -v --remove-orphans
```

### Database
```bash
# Backup database
docker-compose exec db pg_dump -U postgres clinical_management > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres clinical_management < backup.sql
```

## API Testing

### Test endpoints
```bash
# Health check
curl http://localhost:8000/api/clinical/

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/clinical/inventory/items/
```

## File Structure

```
Backend/
├── Dockerfile                 # Backend container definition
├── docker-compose.yml         # All services configuration
├── .dockerignore             # Files to ignore in Docker build
├── requirements.txt          # Python dependencies
├── Python/                   # Django application code
├── init.sql                  # Database initialization
└── README_DOCKER.md          # This file
```
