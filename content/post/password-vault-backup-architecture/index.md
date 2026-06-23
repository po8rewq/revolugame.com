---
title: "Backing Up the One Credential That Can't Be Wrong"
description: "A threat-modeled backup architecture for a password vault: why one copy is never enough, and why more copies aren't automatically better."
date: 2026-06-15T10:00:00+01:00
image: pexels-padrinan-2882630.jpg
tags:
  - homelab
  - security
  - backup
---

Most things in my homelab can fail and I shrug. A container restarts, a dashboard is stale for an hour, a media file gets deleted by mistake: annoying, recoverable, fine. The password vault is not in that category. If it's wrong, or gone, or merely unreachable at the wrong moment, I lose access to everything else at once. It's the one piece of infrastructure that earns the extra paranoia.

In short: my password vault backup strategy keeps three copies that survive different failure modes: the primary vault, a live self-hosted Vaultwarden mirror, and an offline KeePass archive. The important part is not the number of backups, but making sure they do not all fail for the same reason.

So instead of "back it up somewhere," I sat down and asked the question I'd ask at work for any single point of failure: *which specific failure does each copy need to survive?* That question is what actually shaped the design. Not "more backups."

## Three copies, three different failure modes

The vault lives day-to-day in Dashlane. Around it, a script keeps two more copies current:

1. **A dated, offline KeePass `.kdbx` archive.** The script exports the vault, converts it to KeePass format, and syncs the file to NAS over rsync. This file needs nothing else to be true. No Dashlane account, no Vaultwarden instance, no network to be opened. KeePassXC plus a master passphrase is the entire recovery path.
2. **A live Vaultwarden mirror.** The script wipes and re-imports a self-hosted Vaultwarden instance on every run, so it never drifts and never accumulates stale duplicates. Unlike the `.kdbx`, this one behaves like a normal vault app day-to-day. Useful if Dashlane itself is the thing that's unavailable.
3. **The original, in Dashlane.** Still the primary, still the one I actually use day to day.

Each of these answers a different question. If Dashlane has an outage or I get locked out of the account, Vaultwarden keeps working normally. If my entire home network and every service on it is down, or I'm on a borrowed machine with nothing installed, the `.kdbx` file plus a passphrase I've memorized is the whole recovery procedure. No SSH keys, no app, no account, no network. If the NAS itself dies, the live Vaultwarden mirror (running elsewhere) and Dashlane are both still fine.

That's the test I'd apply to any redundancy claim: two backups that die from the same root cause aren't two backups, they're one backup with extra steps. These three don't share a single point of failure with each other.

## The part that matters more than the architecture

Diagrams of "three copies in three places" are easy to draw and easy to get wrong in the implementation details, and the details are where a vault backup script can quietly turn into a liability instead of a safety net.

The script exports the raw vault to CSV in plaintext before converting it. There's no way around that, the conversion tool needs plaintext input. So the entire design constraint became: *that plaintext must never outlive the script's own execution.* It's written to a private temp directory, and a shell `trap` deletes it on every exit path. Success, failure, or interruption, not just the happy path. The master passphrase that protects the `.kdbx` is treated as its own tier-zero secret: it lives outside the repo, outside the backup, memorized or written down somewhere physically safe, because it's the one credential that unlocks the credential store.

It's a small thing, a `trap ... EXIT` instead of cleanup code only at the bottom of the script. But it's exactly the kind of detail that's invisible when it works and catastrophic when it doesn't. I'd rather the script crash and still clean up after itself than ship a feature and leave a plaintext export sitting in a temp folder because someone hit Ctrl-C at the wrong moment.

## Threat-model your one credential that can't be wrong

Every system has at least one of these. The credential, the key, the record that everything else assumes is correct and available. For most of us it's a password vault; for some it might be a signing key or a recovery seed.

The exercise worth doing isn't "add more backups." It's listing the ways that one thing could become unavailable or wrong, and checking that your copies don't all fail for the same reason. If they do, you've built redundancy theater, not redundancy.
