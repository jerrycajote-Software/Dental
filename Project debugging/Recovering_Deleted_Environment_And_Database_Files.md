# Recovering Deleted Environment and Database Files

## Problem Description
During development, the contents of the `server/.env` and `server/db_users.json` files were accidentally deleted. As a result, starting the server caused the application to crash immediately with the following error:

```
OpenAIError: Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.
```

This occurred because the `.env` file no longer contained the required `OPENAI_API_KEY` and other necessary environment variables. Additionally, the `db_users.json` file which acts as the local database for user credentials was empty, breaking authentication functionality.

## Troubleshooting Steps

1. **Verify Git History:**
   The first step was to check if the repository was being tracked by Git, and if the deleted files were part of previous commits. Running `git log --oneline` confirmed the files had been tracked and updated previously in the project's history.
   
2. **Find the Last Known Good Commits:**
   Using `git log` and `git ls-tree`, we searched for the last commits where these files had their expected contents:
   - For `server/.env`, the correct environment variables configurations were found in a recent commit (`646dc65`).
   - For `server/db_users.json`, the full list of database users was intact in another previous commit (`25781b4`).

3. **Extract Content from Git History:**
   We extracted the previous states of these files directly from the Git history without having to revert the entire repository, by utilizing the `git show` command:
   ```bash
   git show 646dc65:server/.env
   git show 25781b4:server/db_users.json
   ```

4. **Restore the Files:**
   The recovered contents were then written back into the original `server/.env` and `server/db_users.json` files, fully restoring their states.

5. **Cleanup:**
   Any temporary files created during the extraction process were deleted to keep the workspace clean.

## Important Commands Used

- `git log --oneline -- <file_path>`: To view the commit history for a specific file.
- `git show <commit_hash>:<file_path>`: To view or extract the contents of a file at a specific point in time without altering the current Git working tree.

## Conclusion
By leveraging Git's version control capabilities, we were able to fully recover the accidentally deleted environment variables and user database quickly and without any data loss.
