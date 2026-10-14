@echo off
REM ==============================================================================
REM Khuta - Automated GitHub Push Script for Windows
REM Author: Badr B. Al-Zekri (https://github.com/Badr-Al-Zekri)
REM ==============================================================================

set REPO_NAME=khuta
set GITHUB_USERNAME=Badr-Al-Zekri

echo ========================================================
echo  Khuta - Pushing to GitHub (Badr-Al-Zekri/%REPO_NAME%)
echo ========================================================

git config user.name "Badr B. Al-Zekri"
git config user.email "ba.alzekri@gmail.com"

git add .
git commit -m "feat: complete professional Khuta habit tracker & consistency engine"

git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo Pushing branch 'main' to GitHub...
git push -u origin main

echo.
echo Done! Visit: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
pause
