#!/bin/bash
CONFIG_DIR="scripts/configs"

function run_repomix() {
  local config=$1
  echo "Running Repomix with config: $config"
  npx repomix -c "$CONFIG_DIR/repomix-$config.json"
}

case "$1" in
  "b")
      run_repomix "all"
    ;;
  "a")
     run_repomix "application"
    ;;
  "c")
    run_repomix "core"
    ;;
  "d")
    run_repomix "domain"
    ;;
  "is")
    run_repomix "infrastructure"
    ;;
  "if")
    run_repomix "interfaces"
    ;;
  *)
    echo "Usage: $0 {b|a|c|d|is|if}"
    exit 1
    ;;
esac
