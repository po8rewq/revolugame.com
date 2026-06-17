---
title: "Running a Personal SOC: Bringing Production Security Practices Home"
description: "Why I built a daily security audit and a cross-domain SOC digest for my homelab, and what running it taught me about deterministic-first, AI-assisted monitoring."
date: 2026-06-12T10:00:00+01:00
image: pexels-dan-nelson-1667453-4973899.jpg
tags:
  - homelab
  - security
  - selfhosted
---

At work, nobody questions why we have logging, alerting, and a daily look at what changed overnight. At home, the same network runs a NAS, a media stack, Home Assistant, and a handful of containers. And for years my only "security monitoring" was noticing something was broken.

So I built myself a small, read-only security operations setup for the homelab: a daily audit script and a cross-domain digest agent that correlates it with everything else running on the network. Nothing here is novel security research. The interesting part is which production habits turned out to be worth carrying home, and which ones I deliberately left at the office.

## Two layers, not one

The setup is split into two pieces with different jobs.

**The daily audit** is the boring, deterministic layer. Once a day it collects, locally and read-only:

- listening sockets, flagging anything bound to a wildcard interface
- Docker/container posture - privileged containers, dangerous bind mounts, host network mode, dangerous capabilities
- systemd service drift against an expected allowlist
- a local secrets/config hygiene scan (path, line, and pattern only - never the matched value)
- cached `apt list --upgradable`, optionally enriched with a `trivy fs` scan
- whether the monitoring artifacts and timers it depends on are actually present

It writes a deterministic Markdown digest and a JSON report to a local outbox. That's it. No remediation, no service restarts, no firewall changes. The rule I gave it was "assume breach, trust no single signal, change nothing during observation."

**The SOC agent** is the correlation layer on top. It runs once a day and pulls together SSH auth logs (brute-force detection, unexpected successful logins, elevated sudo activity), Docker security posture, UniFi network signals (unknown MAC addresses, active IPS/DPI/flood/scan/rogue alarms), and re-surfaces anything security-relevant the daily audit already found. Everything gets a severity from `ok` up through `critical`, and the result is written as an Obsidian note with YAML frontmatter. So a year of these becomes a searchable, taggable incident timeline instead of a folder of text files nobody opens.

## Where the LLM fits - and where it doesn't

Both agents can optionally hand their findings to a local Ollama model to write a short narrative summary on top of the facts. This is the part I was most careful about, because it's the part most people get backwards.

The model never sees raw logs, full inventories, or matched secrets. It only compact finding titles, IDs, severities, and evidence keys. It doesn't decide what's a finding; the deterministic analyzers do that. And if Ollama is unreachable or returns something unusable, the deterministic digest ships as-is. The LLM is a narrator, never the source of truth.

That's the same boundary I'd want on a production alerting pipeline: detection logic stays deterministic and testable, and generative summarization sits strictly downstream of it, never upstream.

## The part that's just operational discipline

A few choices here have nothing to do with security theory and everything to do with habits from running things in production:

- **Output paths are permissioned, not just "private by convention."** Reports get `0600`, runtime directories `0700`.
- **Stale data is treated as a finding, not silently trusted.** Upstream reports older than a configured threshold are flagged rather than quietly re-surfaced as current.
- **Notifications are a tap-through, not the whole story.** A push notification carries the headline and a link into the actual note - useful at a glance, but the record of truth lives in the note, not in a chat history that scrolls away.
- **Everything is replayable offline.** Both agents accept a fixture file in place of live collection, so I can test a new analyzer rule against a known input before it ever touches my real network.

## What it actually buys me

Mostly, it buys me the same thing it buys at work: I notice drift before it becomes an incident, instead of after. A container that quietly picked up a privileged flag, a port that got published wider than intended, an unfamiliar MAC address on the network. These are exactly the kind of small, boring facts that are easy to miss and easy to detect deterministically.

It's not a real SOC. There's no 24/7 coverage, no incident response retainer, and the threat model is "don't get owned by something dumb," not "defend against a motivated attacker." But the muscle is the same one I use at work: write the check once, make it boring and deterministic, let a model help you read the output, and keep a record you can actually search six months later.

If you're already doing this professionally, the homelab version costs you an evening and pays you back the first time you catch something you would have otherwise missed entirely.
