#!/bin/bash
# ========================================
# Docker Entrypoint for Espaço Terapêutico
# Inicia Nginx e configura SSL automaticamente
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Espaço Terapêutico Online${NC}"
echo -e "${GREEN}  Iniciando servidor...${NC}"
echo -e "${GREEN}========================================${NC}"

# Domínio (pode ser sobrescrito via variável de ambiente)
DOMAIN=${DOMAIN:-"espacoterapeuticoonline.com.br"}
EMAIL=${SSL_EMAIL:-"admin@$DOMAIN"}

# Função para verificar se o certificado SSL existe
check_ssl() {
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        return 0
    else
        return 1
    fi
}

# Função para gerar certificado SSL
generate_ssl() {
    echo -e "${YELLOW}Gerando certificado SSL para $DOMAIN...${NC}"
    
    # Inicia nginx temporariamente para o desafio ACME
    nginx &
    NGINX_PID=$!
    sleep 2
    
    # Gera o certificado
    certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --non-interactive
    
    # Para o nginx temporário
    kill $NGINX_PID 2>/dev/null || true
    wait $NGINX_PID 2>/dev/null || true
    
    if check_ssl; then
        echo -e "${GREEN}✓ Certificado SSL gerado com sucesso!${NC}"
        
        # Ativa a configuração HTTPS no nginx
        # O Certbot já modifica o arquivo automaticamente
        certbot --nginx \
            -d "$DOMAIN" \
            -d "www.$DOMAIN" \
            --non-interactive \
            --redirect
    else
        echo -e "${RED}✗ Falha ao gerar certificado SSL${NC}"
        echo -e "${YELLOW}O servidor continuará rodando em HTTP...${NC}"
    fi
}

# Verifica se deve tentar gerar SSL
if [ "$SKIP_SSL" != "true" ]; then
    if check_ssl; then
        echo -e "${GREEN}✓ Certificado SSL encontrado${NC}"
    else
        echo -e "${YELLOW}Certificado SSL não encontrado${NC}"
        
        # Só tenta gerar SSL se não for localhost
        if [ "$DOMAIN" != "localhost" ]; then
            generate_ssl
        else
            echo -e "${YELLOW}Domínio é localhost, pulando SSL...${NC}"
        fi
    fi
else
    echo -e "${YELLOW}SSL desabilitado (SKIP_SSL=true)${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Servidor iniciado!${NC}"
echo -e "${GREEN}  HTTP:  http://$DOMAIN${NC}"
if check_ssl; then
    echo -e "${GREEN}  HTTPS: https://$DOMAIN${NC}"
fi
echo -e "${GREEN}========================================${NC}"

# Inicia o nginx em foreground
exec nginx -g 'daemon off;'
