#!/usr/bin/env python3
"""Push prepared commits in sequence to an existing empty/matching repository."""
from pathlib import Path
import argparse
import subprocess

root = Path(__file__).resolve().parents[1]
repo = 'yunjinzh/yunjin-tools'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--publish', action='store_true', help='Actually push; otherwise show pending local commits')
args = parser.parse_args()

def git(*argv):
    return subprocess.check_output(['git', *argv], cwd=root, text=True).strip()

assert git('remote', 'get-url', 'origin') in [f'https://github.com/{repo}.git', f'git@github.com:{repo}.git'], 'Unexpected destination'
assert git('branch', '--show-current') == 'main', 'Expected main branch'
assert not git('status', '--porcelain'), 'Commit the prepared files before publishing'
if not args.publish:
    print(git('log', '--oneline', '--reverse', 'main'))
    print('Dry run only. Create the destination repository before using --publish.')
    raise SystemExit(0)
subprocess.run(['gh', 'api', f'repos/{repo}', '--silent'], check=True)
remote = git('ls-remote', 'origin', 'refs/heads/main')
if remote:
    subprocess.run(['git', 'fetch', 'origin', 'main'], cwd=root, check=True)
    subprocess.run(['git', 'merge-base', '--is-ancestor', 'origin/main', 'main'], cwd=root, check=True)
    revision = 'origin/main..main'
else:
    assert not git('ls-remote', '--heads', 'origin'), 'Destination has another branch; inspect it before importing'
    revision = 'main'
commits = git('rev-list', '--reverse', revision).splitlines()
for number, commit in enumerate(commits, 1):
    print(f'Uploading commit {number}/{len(commits)}: {commit[:12]}', flush=True)
    subprocess.run(['git', '-c', 'credential.helper=!gh auth git-credential', 'push', 'origin', f'{commit}:refs/heads/main'], cwd=root, check=True)
print('All prepared commits are on GitHub. Verify Pages settings and workflow results next.')
