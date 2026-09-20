CMA STUDY COMMAND CENTER - DEPLOYMENT READY

This folder is the project ROOT. package.json must stay in this folder.

GitHub Pages:
1. Upload these files to the ROOT of the cma-study-command-center repository.
2. GitHub Settings > Pages > Source = GitHub Actions.
3. The included .github/workflows/deploy.yml builds the Vite app and deploys dist.
4. The Vite base is already set to /cma-study-command-center/.

Vercel:
1. Import the GitHub repository.
2. Root Directory = project root (the folder containing package.json).
3. The included vercel.json sets build = npm run build and output = dist.

DO NOT upload node_modules or dist. They are generated during deployment.
