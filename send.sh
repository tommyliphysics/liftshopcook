#!/bin/bash
cd dist
git init
git branch -M main
touch .nojekyll
git remote add origin https://github.com/tommyliphysics/liftshopcook.git
git add .
git commit -am "local changes"
git push -f origin main
git branch gh-pages
git push -f origin gh-pages