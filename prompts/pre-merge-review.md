# Pre-Merge Review Prompt

Before declaring a PR merge-ready:

1. confirm the change is inside `/scope-mvp` or has explicit approval;
2. confirm applicable acceptance criteria have evidence;
3. verify relevant ADRs;
4. run architecture, security, reliability, QA, and adversarial checks as applicable;
5. verify documentation and implementation agree;
6. verify no sensitive values or client data entered the repository;
7. verify no unnecessary scale infrastructure was added;
8. list unresolved risks honestly.

Return **MERGE-READY** only if no Critical/High findings remain and required checks pass. Otherwise return **NOT MERGE-READY** with blockers.
