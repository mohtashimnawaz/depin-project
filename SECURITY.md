# Security Policy & Secrets Handling

Thank you for helping keep this repository secure. This document explains how we handle secrets and what to do if a secret is accidentally committed.

## Preventing Secrets in Repo
- Add secrets to environment variables (e.g., `.env.local`) and **never** commit them. The repository already contains a `.gitignore` that excludes `.env*` and common keypair files.
- We use these automated checks:
  - **Gitleaks** GitHub Action (scans for secrets on PRs and pushes)
  - **Detect-secrets** GitHub Action (scans repository on PRs and pushes) and a local pre-commit hook config

## Local developer setup
1. Install pre-commit and detect-secrets:
   - pip install pre-commit detect-secrets
2. Generate a baseline (one-time, run by a maintainer):
   - detect-secrets scan > .secrets.baseline
3. Install git hooks:
   - pre-commit install
   - pre-commit run --all-files

## If a secret is committed
1. Remove the secret from the repository history using `git filter-repo` or BFG:
   - Example (git-filter-repo):
     - pip install git-filter-repo
     - git filter-repo --path path/to/secret --replace-text replacements.txt
2. Rotate the exposed secret (API keys, SSH keys, wallets) immediately.
3. Open a private security issue and notify the team.

## Reporting security issues
Please report sensitive problems privately to the repo owner (email listed in repo) rather than opening a public issue that contains the secret.

---
If you'd like, I can:
- generate a real `.secrets.baseline` for this repo and commit it (requires running detect-secrets locally or in CI with a maintainer account), and
- add a `pre-commit` installation guide in `README.md`.
