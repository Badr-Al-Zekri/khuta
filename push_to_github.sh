#!/usr/bin/env bash
# ==============================================================================
# Khuta - Automated GitHub Push Script
# Author: Badr B. Al-Zekri (https://github.com/Badr-Al-Zekri)
# ==============================================================================

set -e

REPO_NAME="${1:-khuta}"
GITHUB_USERNAME="Badr-Al-Zekri"

echo "========================================================"
echo " 🚀 Khuta - Pushing to GitHub (Badr-Al-Zekri/$REPO_NAME)"
echo "========================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
fi

# Configure author details
git config user.name "Badr B. Al-Zekri"
git config user.email "ba.alzekri@gmail.com"

# Stage and commit any recent changes
git add .
if git diff-index --quiet HEAD --; then
    echo "Repository is up to date."
else
    git commit -m "feat: complete professional Khuta habit tracker & consistency engine"
fi

# Check if remote exists
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

if git remote | grep -q "origin"; then
    git remote set-url origin "$REMOTE_URL"
else
    git remote add origin "$REMOTE_URL"
fi

echo ""
echo "Pushing branch 'main' to ${REMOTE_URL}..."
echo "If prompted for password, enter your GitHub Personal Access Token (PAT)."
echo ""

git push -u origin main

echo ""
echo "✅ Successfully pushed to https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
