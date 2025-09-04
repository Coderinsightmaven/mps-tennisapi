# 🚀 Tennis Scoreboard API Deployment Guide

## 🔐 Security Best Practices

### 1. Generate Secure API Keys

```bash
# Generate new API keys
node scripts/generate-api-key.js

# Example output:
# Development: sk_dev_a1b2c3d4e5f6...
# Production:  sk_prod_x1y2z3a4b5c6...
```

### 2. Environment Variables

Create a `.env` file (never commit this to Git):

```bash
# Copy the example file
cp env.example .env

# Edit with your values
nano .env
```

**Required Environment Variables:**
```bash
NODE_ENV=production
PORT=3000
API_KEYS=sk_dev_your_dev_key,sk_prod_your_prod_key
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
```

## 🐳 Docker Deployment (Recommended)

### Quick Start

```bash
# 1. Generate API keys
node scripts/generate-api-key.js

# 2. Set environment variables
export API_KEYS="sk_dev_xxx,sk_prod_xxx"
export CORS_ORIGIN="https://your-domain.com"

# 3. Deploy with one command
./scripts/deploy.sh
```

### Manual Docker Steps

```bash
# Build the image
docker build -t tennis-scoreboard-api .

# Run the container
docker run -d \
  --name tennis-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e API_KEYS="your_api_keys_here" \
  -e CORS_ORIGIN="https://your-domain.com" \
  tennis-scoreboard-api

# Check logs
docker logs tennis-api

# Stop the container
docker stop tennis-api
```

### Docker Compose (Production)

```bash
# Start all services including nginx
docker-compose --profile production up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment Options

### 1. Railway (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add

# Set environment variables in Railway dashboard
# Deploy
railway up
```

### 2. Heroku

```bash
# Install Heroku CLI and login
heroku create your-tennis-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set API_KEYS="sk_prod_your_secure_key"
heroku config:set CORS_ORIGIN="https://your-frontend-domain.com"

# Deploy
git push heroku main
```

### 3. DigitalOcean App Platform

1. Fork this repository
2. Connect to DigitalOcean App Platform
3. Set environment variables in the dashboard
4. Deploy automatically

### 4. AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker build -t tennis-scoreboard-api .
docker tag tennis-scoreboard-api:latest your-account.dkr.ecr.us-east-1.amazonaws.com/tennis-scoreboard-api:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/tennis-scoreboard-api:latest

# Deploy using ECS task definition
```

## 🔒 Production Security Checklist

### ✅ API Keys
- [ ] Generate unique, secure API keys
- [ ] Store keys in environment variables (never in code)
- [ ] Use different keys for dev/staging/production
- [ ] Rotate keys regularly

### ✅ HTTPS/SSL
- [ ] Use HTTPS in production (never HTTP)
- [ ] Configure SSL certificates
- [ ] Enable HSTS headers
- [ ] Use secure cipher suites

### ✅ CORS Configuration
- [ ] Set specific CORS_ORIGIN (not `*` in production)
- [ ] Configure allowed methods and headers
- [ ] Enable credentials only if needed

### ✅ Rate Limiting
- [ ] Configure nginx rate limiting (included in nginx.conf)
- [ ] Monitor API usage
- [ ] Set up alerts for unusual traffic

### ✅ Monitoring
- [ ] Set up health checks
- [ ] Configure logging
- [ ] Monitor API performance
- [ ] Set up error alerting

## 🌐 Domain & SSL Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install certbot
sudo apt-get install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare (Recommended)

1. Point your domain to Cloudflare
2. Enable SSL/TLS encryption
3. Configure firewall rules
4. Enable DDoS protection
5. Set up analytics

## 📊 Monitoring & Maintenance

### Health Checks

The API includes built-in health checks:

```bash
# Check API health
curl https://your-domain.com/api

# Check specific endpoints
curl -H "X-API-Key: your_key" https://your-domain.com/courts
```

### Logging

View application logs:

```bash
# Docker logs
docker logs tennis-scoreboard-api

# Docker Compose logs
docker-compose logs -f tennis-scoreboard-api

# Production logs (if using systemd)
sudo journalctl -u tennis-scoreboard-api -f
```

### Performance Monitoring

Consider adding:
- **New Relic** or **DataDog** for APM
- **Prometheus + Grafana** for metrics
- **Sentry** for error tracking
- **Uptime Robot** for availability monitoring

## 🔄 Updates & Maintenance

### Zero-Downtime Deployment

```bash
# Build new image
docker build -t tennis-scoreboard-api:v2 .

# Rolling update
docker-compose up -d --no-deps tennis-scoreboard-api

# Verify deployment
curl https://your-domain.com/api
```

### Backup Strategy

Since the API is stateless (no database), ensure you have:
- [ ] Environment variables backed up securely
- [ ] SSL certificates backed up
- [ ] Configuration files in version control
- [ ] Deployment scripts tested

## 🆘 Troubleshooting

### Common Issues

**API not responding:**
```bash
# Check if container is running
docker ps

# Check logs
docker logs tennis-scoreboard-api

# Check port binding
netstat -tulpn | grep :3000
```

**SSL certificate issues:**
```bash
# Test SSL
curl -I https://your-domain.com

# Check certificate
openssl s_client -connect your-domain.com:443
```

**CORS errors:**
```bash
# Check CORS headers
curl -H "Origin: https://your-frontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-domain.com/scoring/update
```

### Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test endpoints manually
4. Check firewall/security group settings

---

## 📞 Quick Reference

**Generate API Keys:** `node scripts/generate-api-key.js`
**Deploy:** `./scripts/deploy.sh`
**Health Check:** `curl https://your-domain.com/api`
**View Logs:** `docker-compose logs -f`
**Update:** `docker-compose up -d --no-deps tennis-scoreboard-api`
