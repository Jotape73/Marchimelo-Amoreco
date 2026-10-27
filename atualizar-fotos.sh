#!/bin/zsh
# Coloque as fotos em docs/img e rode:  ./atualizar-fotos.sh
# - converte HEIC/HEIF (iPhone) para JPG
# - reduz fotos grandes para no máximo 1600px (site rápido no celular)
# - gera docs/img/fotos.js com a lista de fotos que o site usa
set -e
cd "$(dirname "$0")/docs/img"
setopt null_glob nocaseglob

for f in *.heic *.heif; do
  sips -s format jpeg "$f" --out "${f%.*}.jpg" >/dev/null && rm "$f"
  echo "convertida: $f"
done

for f in *.jpg *.jpeg *.png *.webp; do
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')
  if (( w > 1600 || h > 1600 )); then
    sips -Z 1600 "$f" >/dev/null
    echo "reduzida: $f"
  fi
done

{
  echo "// gerado por atualizar-fotos.sh — não precisa editar na mão"
  echo "window.FOTOS = ["
  for f in *.jpg *.jpeg *.png *.webp *.gif; do
    echo "  \"$f\","
  done
  echo "];"
} > fotos.js

echo "pronto: $(grep -c '",' fotos.js) fotos em docs/img/fotos.js"
