# Project Instructions & User Workflow Rules

## User Workflow & Environment
1. **OS**: Ubuntu (Linux). Never provide Windows, PowerShell, or macOS instructions.
2. **Primary Workflow**:
   - User downloads the ZIP archive directly from AI Studio (Export / Download ZIP).
   - User extracts/copies the new project files into their local Git repository folder on Ubuntu.
3. **gh-pages / GitHub Deployment Rules**:
   - Clean local git submodule cache on Ubuntu: `git rm -r --cached node_modules 2>/dev/null; rm -rf node_modules/.cache/gh-pages .git/modules/node_modules`.
   - Preferred deployment method: GitHub Actions workflow `.github/workflows/deploy.yml` (push to `main` auto-deploys to GitHub Pages).
   - Provide direct, explicit, complete step-by-step Ubuntu terminal commands without skipping any step.
