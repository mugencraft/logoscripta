#!/bin/bash
CONFIG_DIR="scripts/configs"

function run_repomix() {
  local config=$1
  echo "Running Repomix with config: $config"
  pnpm dlx repomix -c "$CONFIG_DIR/repomix-$config.jsonc"
}

case "$1" in
  "all")
    run_repomix "all"
    ;;
  "repositories")
    run_repomix "repositories"
    ;;
  "tagging")
    run_repomix "tagging"
    ;;
  "actions")
    run_repomix "actions"
    ;;
  "config")
    run_repomix "config"
    ;;
  "feature")
    run_repomix "feature"
    ;;
  *)
    echo "Usage: $0 {all|repositories|tagging|actions|config|feature}"
    exit 1
    ;;
esac
