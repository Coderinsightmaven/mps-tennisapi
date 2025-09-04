# 🎾 Tennis Scoreboard API - Traefik Integration Guide

## 🚀 Quick Integration Steps

### Step 1: Add to Your Existing Docker Compose Stack

Add this service to your existing `docker-compose.yml` file:

```yaml
  tennis-scoreboard-api:
    build: 
      context: ./tennis-scoreboard-api  # Path to your API directory
      dockerfile: Dockerfile
    container_name: tennis-scoreboard-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEYS=${TENNIS_API_KEYS}
      - CORS_ORIGIN=${TENNIS_CORS_ORIGIN:-*}
      - CORS_CREDENTIALS=true
      - TZ=${TZ}
    volumes:
      # Optional: If you want to persist any data
      - /mnt/storage/config/tennis-api:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tennis-api.rule=Host(`${TENNIS_API_DOMAIN}`)"
      - "traefik.http.routers.tennis-api.entrypoints=websecure"
      - "traefik.http.routers.tennis-api.tls.certresolver=myresolver"
      - "traefik.http.services.tennis-api.loadbalancer.server.port=3000"
      # Security headers
      - "traefik.http.routers.tennis-api.middlewares=tennis-api-headers"
      - "traefik.http.middlewares.tennis-api-headers.headers.customrequestheaders.X-Forwarded-Proto=https"
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - arr_network
```

### Step 2: Update Your Environment Variables

Add these to your existing `.env` file:

```bash
# Tennis Scoreboard API Configuration
TENNIS_API_DOMAIN=tennis-api.yourdomain.com
TENNIS_API_KEYS=mps_dev_your_dev_key,mps_prod_your_prod_key
TENNIS_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Step 3: Generate Secure API Keys

```bash
# Navigate to your tennis API directory
cd /path/to/tennis-scoreboard-api

# Generate secure API keys
node scripts/generate-api-key.js

# Copy the generated keys to your .env file
```

### Step 4: Set Up DNS

In your Cloudflare dashboard:
1. Add an A record: `tennis-api.yourdomain.com` → Your server IP
2. Enable proxy (orange cloud) for SSL/security

### Step 5: Deploy

```bash
# From your main stack directory
docker-compose up -d tennis-scoreboard-api

# Check logs
docker-compose logs -f tennis-scoreboard-api
```

## 🔧 Directory Structure

Your server should look like this:

```
/your-stack-directory/
├── docker-compose.yml          # Your main stack file
├── .env                        # Environment variables
├── tennis-scoreboard-api/      # Tennis API directory
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── scripts/
└── /mnt/storage/config/
    ├── traefik/
    ├── plex/
    ├── sonarr/
    └── tennis-api/             # API data (optional)
```

## 🌐 Access Your API

Once deployed, your API will be available at:

- **Swagger Documentation:** `https://tennis-api.yourdomain.com/api`
- **Courts Endpoint:** `https://tennis-api.yourdomain.com/courts`
- **Main Scoring:** `https://tennis-api.yourdomain.com/scoring/update`
- **Health Check:** `https://tennis-api.yourdomain.com/api-json`

## 🔐 Security Features with Traefik

✅ **Automatic HTTPS** - Let's Encrypt certificates via Cloudflare DNS  
✅ **Domain-based routing** - Only accessible via your subdomain  
✅ **Security headers** - X-Forwarded-Proto and other security headers  
✅ **Rate limiting** - Can be added via Traefik middleware  
✅ **DDoS protection** - Via Cloudflare proxy  

## 🔧 Optional: Advanced Traefik Configuration

### Add Rate Limiting

Add this middleware to your tennis-api service labels:

```yaml
labels:
  # ... existing labels ...
  - "traefik.http.routers.tennis-api.middlewares=tennis-api-ratelimit,tennis-api-headers"
  - "traefik.http.middlewares.tennis-api-ratelimit.ratelimit.burst=100"
  - "traefik.http.middlewares.tennis-api-ratelimit.ratelimit.period=1m"
```

### Add IP Whitelist (Optional)

If you want to restrict access to specific IPs:

```yaml
labels:
  # ... existing labels ...
  - "traefik.http.routers.tennis-api.middlewares=tennis-api-whitelist,tennis-api-headers"
  - "traefik.http.middlewares.tennis-api-whitelist.ipwhitelist.sourcerange=192.168.1.0/24,10.0.0.0/8"
```

### Add Basic Auth (Optional)

For additional security layer:

```bash
# Generate password hash
echo $(htpasswd -nb user password) | sed -e s/\\$/\\$\\$/g

# Add to labels
- "traefik.http.routers.tennis-api.middlewares=tennis-api-auth,tennis-api-headers"
- "traefik.http.middlewares.tennis-api-auth.basicauth.users=user:$$2y$$10$$..."
```

## 🔍 Monitoring & Logs

### View API Logs
```bash
docker-compose logs -f tennis-scoreboard-api
```

### Check API Health
```bash
curl https://tennis-api.yourdomain.com/api-json
```

### Monitor with Traefik Dashboard
Your Traefik dashboard should show the new service at your configured domain.

## 🆘 Troubleshooting

### API Not Accessible
1. Check if container is running: `docker ps | grep tennis`
2. Check Traefik logs: `docker-compose logs traefik`
3. Verify DNS: `nslookup tennis-api.yourdomain.com`
4. Check SSL: `curl -I https://tennis-api.yourdomain.com`

### SSL Certificate Issues
1. Check Cloudflare DNS settings
2. Verify CF_DNS_API_TOKEN has correct permissions
3. Check acme.json permissions: `chmod 600 /mnt/storage/config/traefik/acme.json`

### CORS Issues
1. Update TENNIS_CORS_ORIGIN in .env
2. Restart the service: `docker-compose restart tennis-scoreboard-api`

## 📱 Testing Your Integration

### Test API Key Authentication
```bash
# This should fail (no API key)
curl https://tennis-api.yourdomain.com/courts

# This should work (with API key)
curl -H "X-API-Key: mps_prod_your_key" https://tennis-api.yourdomain.com/courts
```

### Test WebSocket Connection
```javascript
// From your frontend
const socket = io('wss://tennis-api.yourdomain.com');
socket.emit('join_match', { matchId: 'test-match' });
```

### Test Scoring Endpoint
```bash
curl -X POST https://tennis-api.yourdomain.com/scoring/update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mps_prod_your_key" \
  -d '{"data":{"matchId":"test-123","matchStatus":"IN_PROGRESS"}}'
```

## 🎯 Next Steps

1. **Deploy the API** using the steps above
2. **Test all endpoints** with your API keys
3. **Configure your tennis scoring app** to send data to your new endpoint
4. **Set up monitoring** (optional) with your existing stack tools
5. **Configure backups** for your API keys and configuration

Your Tennis Scoreboard API is now fully integrated with your Traefik stack! 🎾🚀
