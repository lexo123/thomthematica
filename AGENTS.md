# Project Instructions & User Workflow Rules

## User Workflow & Environment
1. **OS**: Ubuntu (Linux). Never provide Windows, PowerShell, or macOS instructions.
2. **Primary Workflow**:
   - User downloads the ZIP archive directly from AI Studio (Export / Download ZIP).
   - User extracts/copies the new project files into their local Git repository folder on Ubuntu.
3. **gh-pages / GitHub Deployment Rules**:
   - Before deploying or committing, ALWAYS remove `node_modules/.cache/gh-pages` so Git doesn't treat the cache as a submodule: `rm -rf node_modules/.cache/gh-pages`.
   - Provide direct, explicit, complete step-by-step Ubuntu terminal commands without skipping any step.
