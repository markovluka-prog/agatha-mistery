#!/usr/bin/env bash
set -euo pipefail

# Deploy helper from any location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

git status --short

COMMIT_MESSAGE="${1:-chore: deploy site updates}"

# Add tracked changes first to avoid accidental commits of unrelated files.
git add -u

# Optionally add new files only from known source directories.
if [[ -d assets || -d pages || -d supabase || -d tools ]]; then
  git add assets pages supabase tools index.html robots.txt sitemap.xml package.json package-lock.json .gitignore 2>/dev/null || true
fi

if git diff --cached --quiet; then
  echo "No staged changes to deploy."
  exit 0
fi

git commit -m "${COMMIT_MESSAGE}"
git push

echo "Site updates deployed."
