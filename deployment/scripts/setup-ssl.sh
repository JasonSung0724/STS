#!/bin/bash
# ===========================================
# STS - SSL Certificate Setup Script
# ===========================================
# 使用 Let's Encrypt 取得 SSL 憑證
#
# 使用方式:
#   ./deployment/scripts/setup-ssl.sh sts.yourdomain.com
#   ./deployment/scripts/setup-ssl.sh sts.yourdomain.com dev.sts.yourdomain.com

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$DEPLOYMENT_DIR/docker"
CERTBOT_DIR="$DOCKER_DIR/certbot"

print_banner() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "   STS - SSL Certificate Setup"
    echo "=================================================="
    echo -e "${NC}"
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}[✗] Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}[✓] Docker is running${NC}"
}

# Check if domains are provided
if [ $# -eq 0 ]; then
    echo -e "${RED}[✗] No domains specified${NC}"
    echo ""
    echo "Usage: $0 DOMAIN [DOMAIN2] [DOMAIN3] ..."
    echo ""
    echo "Examples:"
    echo "  $0 sts.example.com"
    echo "  $0 sts.example.com dev.sts.example.com"
    echo "  $0 sts.example.com api.sts.example.com dev.sts.example.com"
    exit 1
fi

DOMAINS=("$@")
EMAIL="${SSL_EMAIL:-admin@${DOMAINS[0]}}"

print_banner
check_docker

echo -e "${YELLOW}[*] Setting up SSL certificates for:${NC}"
for domain in "${DOMAINS[@]}"; do
    echo "    - $domain"
done
echo ""

# Create certbot directories
echo -e "${YELLOW}[*] Creating certbot directories...${NC}"
mkdir -p "$CERTBOT_DIR/www"
mkdir -p "$CERTBOT_DIR/conf"

# Build domain args for certbot
DOMAIN_ARGS=""
for domain in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
done

# Check if certificates already exist
FIRST_DOMAIN="${DOMAINS[0]}"
if [ -d "$CERTBOT_DIR/conf/live/$FIRST_DOMAIN" ]; then
    echo -e "${YELLOW}[!] Certificates already exist for $FIRST_DOMAIN${NC}"
    read -p "Do you want to renew them? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${GREEN}[✓] Using existing certificates${NC}"
        exit 0
    fi
fi

# Make sure nginx is running for ACME challenge
echo -e "${YELLOW}[*] Starting nginx for ACME challenge...${NC}"
docker compose -f "$DOCKER_DIR/docker-compose.vm.yml" up -d nginx

sleep 5

# Run certbot
echo -e "${YELLOW}[*] Requesting SSL certificates from Let's Encrypt...${NC}"
docker run --rm \
    -v "$CERTBOT_DIR/www:/var/www/certbot" \
    -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $DOMAIN_ARGS

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[✓] SSL certificates obtained successfully!${NC}"
    echo ""
    echo -e "${YELLOW}[*] Certificate locations:${NC}"
    echo "    Fullchain: $CERTBOT_DIR/conf/live/$FIRST_DOMAIN/fullchain.pem"
    echo "    Private key: $CERTBOT_DIR/conf/live/$FIRST_DOMAIN/privkey.pem"
    echo ""
    echo -e "${YELLOW}[*] Next steps:${NC}"
    echo "    1. Update nginx config to enable HTTPS (uncomment SSL server blocks)"
    echo "    2. Restart nginx: docker compose -f $DOCKER_DIR/docker-compose.vm.yml restart nginx"
else
    echo -e "${RED}[✗] Failed to obtain SSL certificates${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Domain DNS not pointing to this server"
    echo "  - Port 80 not accessible from internet"
    echo "  - Rate limit exceeded (wait and try again)"
    exit 1
fi

echo ""
echo -e "${GREEN}=================================================="
echo "   SSL Setup Complete!"
echo "==================================================${NC}"
