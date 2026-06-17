---
title: "Designing Single-Purpose Agents Instead of One Big Automation Script"
description: "What a flock of small, narrowly-scoped homelab agents taught me about service boundaries - written before 'agent' became the word of the year."
date: 2026-06-17T10:00:00+01:00
image: pexels-introspectivedsgn-22043568.jpg
tags:
  - homelab
  - architecture
  - automation
---

"Agent" has become one of those words that means everything and nothing this year. Before it was a hype term, I'd already ended up with a small flock of them in my homelab. Not because I was chasing a trend, but because I kept hitting the same wall every time I tried to write One Big Script: it grew a dozen unrelated responsibilities, and a bug in one of them risked taking down all of them.

So instead, every recurring chore in my homelab is its own small, independently-scheduled program. There turned out to be more of them than I expected once I actually sat down and counted.

> **A note for muggles:** the repo behind all this is named `hogwarts`, and every agent gets sorted to match. Once you start naming services after wizards, it turns out you owe each one an in-character job description, whether it asked for one or not.

**The standing watch.** Four observers poll continuously and report into one correlator every five minutes — this is the layer that exists so I find out about a problem before it becomes a 3am page instead of after:

- **Argus Filch** watches running Docker containers for restart loops, failed healthchecks, and containers that just quietly vanish.
- **Astronomy Tower** polls Prometheus for firing alerts, down scrape targets, and recording rules that stopped working without telling anyone.
- **Marauder's Map** scans the UniFi network for offline devices, WAN failover events, and firewall rules that drifted open.
- **Mad-Eye's Watch** tracks TLS certificate expiry across configured endpoints. Constant vigilance: a warning at 30 days, a critical at 7.
- **The Headmaster** is the one role on this list that isn't single-purpose by design — its entire job is reading what the other three decided was worth reporting and correlating that into one status, surfaced as an incident only when it's actually worth one.

**The daily and weekly chores.** These run on their own cron schedules and never talk to each other directly:

- **Molly's Cupboard** reviews the Home Assistant entity list weekly: unavailable entities, missing or duplicate names, disabled automations. (Molly Weasley: keeps the household running, judges your clutter lovingly.)
- **Peeves' Stash** cross-references Sonarr's on-disk episode files against Trakt watch history daily, and stays silent unless something *new* shows up. (The poltergeist: haunts the media server, won't let a finished episode rest in peace.)
- **Rita's Desk** is the RSS morning digest — feeds in, previous day's articles out, ranked against persistent tag scores I vote on. Deterministic by design, no LLM in the loop. (Never met a headline she wouldn't print, but at least she always sources it.)
- **Kreacher's Kitchen** plans the week's meals from my recipe library and a couple of trusted cooking sites. (Grumbles the entire time, still gets dinner on the table.)
- **The Library** picks a tech topic every night, gathers sources, and writes a 5-minute digest plus a 15-20 minute deep dive. (Lives in the package manifest as `research-digest`, but it spends every night in the Restricted Section, so the Library it is.)
- **Sybill's Crystal Ball** divines upcoming movies and episodes from Trakt weekly and syncs them to a watchlist. (Make of that prophecy what you will.)
- **Madam Pince's Catalogue** lists every running container and cross-checks it against the service directories in the infra repo, flagging any container that has no matching documentation. (A very particular librarian: every book gets catalogued, or it gets confiscated.)
- **Dobby's Rounds** is the homelab's free elf: weekly housekeeping that prunes old snapshots, reports, and state files before they pile up.
- **O.W.L.s** is the daily infrastructure audit — config drift, open ports, compliance — read-only and deliberately paranoid about it.
- **Auror Office** is the daily cross-domain security digest, correlating O.W.L.s' findings with auth logs, Docker posture, and the network observers above into one report. (I've written about [how this one and O.W.L.s work together](/p/homelab-personal-soc/) in more detail elsewhere.)

Fifteen names, fifteen jobs. Outside of the two correlators built specifically to know about everyone else — the Headmaster and the Auror Office — not one of them needs to care that the rest exist.

## The three conventions that make this work

None of these agents are individually clever. What makes the *flock* manageable is that they all obey the same three small contracts:

**1. One artifact format.** Every agent writes its result as JSON (and often a companion Markdown note) to its own `outbox/latest/` path. A "latest" pointer plus a timestamped archive, every time. No agent reads another agent's outbox directly. If something needs cross-referencing, that's a different, explicitly-correlating agent's job, not an implicit dependency.

**2. One notification channel.** Every agent that needs to tell me something pushes through the same ntfy topic convention, with a deep link back into wherever the full detail lives. I don't maintain five different alerting integrations; I maintain one, and every agent is a thin client of it.

**3. One aggregation point.** A single dashboard reads everyone's `outbox/latest/` and renders it. It doesn't collect anything itself. It has no Docker access, no Home Assistant credentials, no API keys. It's a pure read layer over JSON files other things produced. That's the only place in the whole system that's allowed to know all the agents exist.

That's the entire integration surface. Three conventions, and I can add a sixth agent tomorrow without touching the other five.

## Why decompose instead of consolidate

The obvious objection: isn't five small things more to maintain than one big thing? In my experience, no. For the same reason a set of small services usually beats a monolith at work.

A bug in Peeves' Trakt pagination cannot break Molly's Home Assistant checks, because they don't share a process, a deploy, or a schedule. I can test each one in complete isolation with a fixture file instead of live credentials. I can hand any single agent's directory to a contributor - human or an AI coding agent - and they have everything they need to understand and change it, without first having to load the other four into their head. And when I retire one (Peeves only matters because I still have a media server; that won't be true forever), deleting it is deleting a directory, not untangling a shared module.

This is the same lesson as service boundaries and team topologies at any reasonably-sized engineering org: the interface between components should be small, explicit, and boring, and almost all of the design effort should go into keeping it that way. Not into making any individual component clever. The cleverness, if there is any, belongs inside one agent's narrow walls, where it can't leak.

## The boring plumbing is the point

None of the five agents above is doing anything technically hard. RSS parsing, a REST API client, a cron job - this is all stuff any of us could write in an afternoon. The actual design work was deciding, up front, that "outbox JSON + one notification channel + one dashboard" would be the *entire* contract between them, and then refusing to let any agent reach around it.

That discipline is cheap when you only have one agent. It's the only thing that keeps five (or fifteen) from turning back into the One Big Script I was trying to avoid in the first place.
