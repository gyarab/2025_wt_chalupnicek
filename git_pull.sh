#!/bin/bash

export GIT_SSH_COMMAND='ssh -i /home/vasek/.ssh/id_rsa_gyarab'

for d in */ ; do
  if [ -d "$d/.git" ]; then
    echo "🔄 Pulling $d"
    git -C "$d" pull
  else
    echo "⏭️  Skipping $d (not a git repo)"
  fi
done