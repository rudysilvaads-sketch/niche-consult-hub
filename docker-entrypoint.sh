#!/bin/bash
# ========================================
# Docker Entrypoint for Espaço Terapêutico
# Inicia Nginx (SSL configurado externamente)
# ========================================

echo "========================================"
echo "  Espaço Terapêutico Online"
echo "  Iniciando servidor..."
echo "========================================"

# Inicia o nginx em foreground
exec nginx -g 'daemon off;'
