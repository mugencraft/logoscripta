#!/bin/bash
CONFIG_DIR="scripts/configs"
CONFIG_NAME=${1:-"all"}

if [[ -f "$CONFIG_DIR/repomix-$CONFIG_NAME.jsonc" ]]; then
  echo "Running Repomix with config: $CONFIG_NAME"
  pnpm dlx repomix -c "$CONFIG_DIR/repomix-$CONFIG_NAME.jsonc"
else
  echo "Config file not found: $CONFIG_DIR/repomix-$CONFIG_NAME.jsonc"
  echo "Available configs:"
  ls "$CONFIG_DIR"/repomix-*.jsonc 2>/dev/null | sed 's|.*/repomix-||; s|\.jsonc||' || echo "No config files found"
  exit 1
fi
