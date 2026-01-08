#!/bin/bash
# Script to setup frontend as separate repo using Git subtree
# This allows pushing frontend to a separate GitHub repo while keeping full code locally

echo -e "\033[0;32mSetting up frontend repository...\033[0m"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "\033[0;31mError: Not in a git repository!\033[0m"
    exit 1
fi

# Add remote for frontend repo
echo -e "\n\033[0;33mAdding frontend remote...\033[0m"
git remote add frontend https://github.com/MLuc24/lms-frontend-app.git 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "\033[0;32mFrontend remote added successfully\033[0m"
else
    echo -e "\033[0;33mFrontend remote already exists or error occurred\033[0m"
fi

# Commit any pending changes first
echo -e "\n\033[0;33mChecking for uncommitted changes...\033[0m"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "\033[0;31mYou have uncommitted changes. Please commit them first.\033[0m"
    echo -e "\033[0;33mRun: git add . && git commit -m 'Your commit message'\033[0m"
    exit 1
fi

# Push frontend subtree to the frontend repo
echo -e "\n\033[0;33mPushing frontend to separate repo...\033[0m"
echo -e "\033[0;36mThis will push apps/mobile-app to the root of lms-frontend-app repo\033[0m"

git subtree push --prefix=apps/mobile-app frontend main

if [ $? -eq 0 ]; then
    echo -e "\n\033[0;32mSuccess! Frontend pushed to https://github.com/MLuc24/lms-frontend-app\033[0m"
    echo -e "\n\033[0;32mLocal structure remains unchanged - you still have full code\033[0m"
    echo -e "\n\033[0;33mTo update frontend repo in the future, run:\033[0m"
    echo -e "\033[0;36m  git subtree push --prefix=apps/mobile-app frontend main\033[0m"
else
    echo -e "\n\033[0;31mError pushing to frontend repo. Make sure:\033[0m"
    echo -e "\033[0;33m  1. The repo exists: https://github.com/MLuc24/lms-frontend-app\033[0m"
    echo -e "\033[0;33m  2. You have push access\033[0m"
    echo -e "\033[0;33m  3. All changes are committed\033[0m"
fi
