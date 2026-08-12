#!/usr/bin/env bash
# Run from the baroness-app repo root AFTER unzipping baroness-rebuild-changes.zip over it.
# Removes files deleted in the rebuild (dead assets, NFT ledger, scratch files). Archive raw-art/ first if you want to keep it!
set -e
while IFS= read -r f; do rm -rf -- "$f"; done < delete-list.txt
echo "Done. Review with: git status"
