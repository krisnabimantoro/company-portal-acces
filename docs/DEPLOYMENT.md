# 🚀 Deployment Guide

Panduan deployment untuk Company Portal Access API.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Setup](#cicd-setup)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Minimum Server Requirements

- **OS**: Ubuntu 20.04 LTS / 22.04 LTS
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **Network**: Public IP address

### Required Software

- Docker 24.x
- Docker Compose 2.x
- Git
- PostgreSQL 14.x (jika tidak menggunakan Docker)

---

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Setup Directories

```bash
# Create application directories
sudo mkdir -p /root/dot
sudo mkdir -p /root/dot/uploads

# Set permissions
sudo chmod 755 /root/dot
sudo chmod 777 /root/dot/uploads
```

### 5. Setup Environment File

```bash
# Create environment file
sudo nano /root/dot/.env
```

Paste konfigurasi berikut:

```env
# Database Configuration
DATABASE_URL="postgresql://company_user:secure_password@postgres:5432/company_portal"

# JWT Secrets (Generate dengan: openssl rand -base64 32)
JWT_SECRET_KEY="your-generated-jwt-secret-key-here"
JWT_REFRESH_SECRET_KEY="your-generated-refresh-secret-key-here"

# App Configuration
APP_KEY="your-generated-app-key-here"
NODE_ENV="production"
PORT=3040

# CSRF Secret
CSRF_SECRET="your-generated-csrf-secret-here"

# PostgreSQL Configuration
POSTGRES_USER=company_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=company_portal
```

**Generate Secrets**:

```bash
# Generate random secrets
openssl rand -base64 32
```

---

## Docker Deployment

### Option 1: Manual Deployment

#### 1. Clone Repository

```bash
cd /opt
git clone https://github.com/krisnabimantoro/company-portal-acces.git
cd company-portal-acces
git checkout main
```

#### 2. Build Docker Image

```bash
docker build -f mist/docker/Dockerfile -t company-portal-api:latest .
```

#### 3. Run with Docker Compose

```bash
cd mist/docker
docker-compose up -d
```

#### 4. Check Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f app

# Check health
curl http://localhost:3040/health
```

#### 5. Run Database Migrations

```bash
# Access container
docker exec -it company-portal-api sh

# Run migrations
pnpm prisma migrate deploy

# Exit container
exit
```

### Option 2: Using Pre-built Image (Docker Hub)

```bash
cd /opt/company-portal-acces/mist/docker

# Pull latest image
docker pull krisnabimantoro/company-portal-api:latest

# Update docker-compose.yml to use pulled image
# Then run
docker-compose up -d
```

---

## CI/CD Setup

### GitHub Actions Workflow

Project ini sudah dilengkapi dengan GitHub Actions workflow di `.github/workflows/docker-build-push.yml`.

### 1. Setup GitHub Secrets

Tambahkan secrets berikut di repository settings:

```
Settings > Secrets and variables > Actions > New repository secret
```

**Required Secrets**:

| Secret Name       | Description               | Example                     |
| ----------------- | ------------------------- | --------------------------- |
| `DOCKER_USERNAME` | Docker Hub username       | `krisnabimantoro`           |
| `DOCKER_PASSWORD` | Docker Hub password/token | `dckr_pat_xxx...`           |
| `SSH_HOST`        | Server IP atau hostname   | `123.45.67.89`              |
| `SSH_USERNAME`    | SSH username              | `root`                      |
| `SSH_PRIVATE_KEY` | SSH private key           | Contents of `~/.ssh/id_rsa` |

### 2. Generate SSH Key Pair (jika belum ada)

**Di local machine**:

```bash
ssh-keygen -t rsa -b 4096 -C "deploy@company-portal"
cat ~/.ssh/id_rsa  # Copy private key untuk GitHub Secret
cat ~/.ssh/id_rsa.pub  # Copy public key untuk server
```

**Di server**:

```bash
# Add public key to authorized_keys
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Test SSH Connection

```bash
ssh -i ~/.ssh/id_rsa user@server-ip
```

### 4. Trigger Deployment

Workflow akan otomatis berjalan saat:

- Push ke branch `staging` atau `main`
- Push tag dengan format `v*.*.*`

**Manual trigger**:

```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0
```

### 5. Workflow Steps

1. **Build Job**:
   - Checkout code
   - Setup Docker Buildx
   - Login to Docker Hub
   - Build and push Docker image

2. **Deploy Job**:
   - SSH to server
   - Pull latest code
   - Login to Docker Hub
   - Pull latest image
   - Stop existing containers
   - Run database migrations
   - Start new containers
   - Cleanup old images
   - Show logs

---

## SSL/TLS Configuration

### Option 1: Using Nginx Reverse Proxy

#### 1. Install Nginx

```bash
sudo apt install nginx -y
```

#### 2. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/company-portal
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3040;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Upload size limit
    client_max_body_size 10M;
}

# Rate limit zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

#### 4. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/company-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

#### 6. Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will auto-renew via cron
```

### Option 2: Using Caddy

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddyfile
sudo nano /etc/caddy/Caddyfile
```

```caddy
api.yourdomain.com {
    reverse_proxy localhost:3040

    encode gzip

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
    }
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy
```

---

## Monitoring & Logging

### 1. Docker Logs

```bash
# View real-time logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app

# Save logs to file
docker-compose logs app > /var/log/company-portal.log
```

### 2. Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/company-portal
```

```
/var/log/company-portal.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

### 3. Health Check Monitoring

```bash
# Create health check script
nano /opt/scripts/health-check.sh
```

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3040/health)

if [ $response != "200" ]; then
    echo "Health check failed: $response"
    # Send alert (email, Slack, etc.)
    # Restart service
    cd /opt/company-portal-acces/mist/docker
    docker-compose restart app
fi
```

```bash
chmod +x /opt/scripts/health-check.sh

# Add to crontab (every 5 minutes)
crontab -e
```

```cron
*/5 * * * * /opt/scripts/health-check.sh
```

### 4. Application Performance Monitoring (APM)

Tambahkan PM2 untuk production monitoring:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2 (alternative to docker-compose)
pm2 start npm --name "company-portal" -- run start:prod
pm2 save
pm2 startup
```

---

## Backup & Recovery

### 1. Database Backup

```bash
# Create backup script
nano /opt/scripts/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/postgres"
CONTAINER_NAME="company-portal-postgres"

mkdir -p $BACKUP_DIR

# Backup database
docker exec $CONTAINER_NAME pg_dump -U company_user company_portal > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

```bash
chmod +x /opt/scripts/backup-db.sh

# Schedule daily backup at 2 AM
crontab -e
```

```cron
0 2 * * * /opt/scripts/backup-db.sh
```

### 2. Restore Database

```bash
# List backups
ls -lh /backup/postgres/

# Restore from backup
gunzip /backup/postgres/backup_20240101_020000.sql.gz
docker exec -i company-portal-postgres psql -U company_user company_portal < /backup/postgres/backup_20240101_020000.sql
```

### 3. Full System Backup

```bash
# Backup uploads
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /root/dot/uploads/

# Backup environment
cp /root/dot/.env /backup/env_$(date +%Y%m%d).backup

# Backup docker-compose
cp /opt/company-portal-acces/mist/docker/docker-compose.yml /backup/
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
sudo netstat -tulpn | grep 3040

# Restart all services
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL container
docker-compose ps postgres

# Test database connection
docker exec -it company-portal-postgres psql -U company_user company_portal

# Reset database (DANGER!)
docker-compose down -v
docker-compose up -d
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Restart container
docker-compose restart app

# Increase memory limit in docker-compose.yml
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate
sudo certbot certificates

# Restart Nginx
sudo systemctl restart nginx
```

### Disk Space Full

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean logs
sudo truncate -s 0 /var/log/company-portal.log

# Remove old backups
find /backup -mtime +30 -delete
```

---

## Performance Optimization

### 1. Enable Gzip Compression (Nginx)

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. Database Connection Pooling

Update `.env`:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

### 3. Enable HTTP/2 (Nginx)

```nginx
listen 443 ssl http2;
```

### 4. CDN for Static Assets

Gunakan CloudFlare atau AWS CloudFront untuk caching.

---

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (UFW)
- [ ] Setup SSH key-based authentication
- [ ] Disable SSH password authentication
- [ ] Enable fail2ban
- [ ] Setup SSL/TLS certificates
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Rate limiting configured
- [ ] Environment variables secured
- [ ] Docker socket not exposed
- [ ] Regular vulnerability scans

---

## Support

Untuk bantuan deployment, hubungi tim DevOps atau buat issue di GitHub repository.
