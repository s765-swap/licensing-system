git init

git branch -M main

git remote add origin https://github.com/s765-swap/licensing-system.git

echo .env >> .gitignore
echo /node_modules >> .gitignore
echo /.idea >> .gitignore
echo /.vscode >> .gitignore

git add .

git commit -m "Initial commit"

git push -u origin main
