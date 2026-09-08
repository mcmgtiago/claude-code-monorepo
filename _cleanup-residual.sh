#!/bin/bash
# Execute este script após fechar VS Code e outros programas
# para remover as pastas residuais da raiz
cd "D:/Claude Code"
rm -rf LP-Eixo dental-landing pilar-rh
echo "Pastas residuais removidas!"
rm -f _cleanup-residual.sh
