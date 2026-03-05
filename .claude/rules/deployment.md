---
description: Deployment workflow via git, not direct Vercel CLI
globs: "**"
---

# Deployment

NEVER use `vercel --prod` or `vercel deploy` directly. Always deploy through git:

1. Commit changes
2. `git push origin main`
3. Vercel auto-builds and deploys from the push

This ensures every deployment is traceable to a commit and can be reverted.

To check deployment status: `vercel ls` (look for "Ready" status on latest).
