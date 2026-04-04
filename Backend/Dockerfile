# Use Python 3.12 slim base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        gettext \
        curl \
        && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# # Copy environment file
# COPY ../.env /app/.env

# Create necessary directories
RUN mkdir -p /app/logs /app/media /app/static

# Set permissions
RUN chmod +x /app/Python/manage.py

# Collect static files (will be done at runtime)
# RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD cd /app/Python && python manage.py check --deploy || exit 1

# Run application with production settings
CMD ["sh", "-c", "cd /app/Python && python manage.py runserver 0.0.0.0:8000"]
