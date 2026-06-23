---
title: "How I Use Obsidian for Work, Personal Life, and AI"
description: "How I use Obsidian as the central hub for projects, daily work, personal knowledge, and AI-assisted documentation workflows."
date: 2026-06-22T00:00:00+02:00
image: cover-image.png
tags:
  - obsidian
  - productivity
  - knowledge-management
---

Over the years, I've tried countless productivity tools, note-taking systems, and documentation platforms.

In short: I use Obsidian as the central place where notes, project documentation, meeting summaries, infrastructure knowledge, and AI-ready context come together. The goal is not just to store information, but to make it reusable by both me and the AI assistants I work with.

Most of them failed for the same reason: information ended up scattered across multiple locations.

Meeting notes lived in one tool. Documentation lived somewhere else. Tasks were tracked separately. Project knowledge slowly disappeared into chat conversations and ticket systems. I would often remember that a useful decision had been made, but not whether it was buried in Slack, a meeting doc, a ticket comment, or a notebook page.

Today, almost everything I write, document, plan, or archive ends up in Obsidian.

Obsidian has become the central hub for both my professional and personal life. It stores my notes, project documentation, infrastructure knowledge, diagrams, meeting summaries, and increasingly serves as the foundation for my AI workflows.

That last part is what makes it more than a personal knowledge base. It is not just where I keep information. It is where I build usable context for both myself and the tools I rely on.

> Obsidian is not just where I store notes. It is where scattered information turns into usable context.

## My Vault Structure

I keep things intentionally simple by following a structure inspired by the PARA methodology:

* Inbox
* Projects
* Areas
* Resources
* Archive

This structure has remained largely unchanged for years because it scales well without becoming complicated.

What I like about PARA in practice is that it gives me enough structure to find things later without forcing me to over-design the system upfront.

### Inbox

The Inbox is where everything starts.

Ideas, meeting notes, technical thoughts, project requests, architecture discussions, blog post ideas, and random observations all land here first.

I don't spend time deciding where information belongs during capture.

The objective is simple: capture first, organize later.

### Projects

Projects contain anything with a defined goal and an end date.

Examples include:

* New product features
* Infrastructure migrations
* Customer implementations
* Internal tooling
* Blog articles
* Side projects

Each project contains all relevant information:

* Meeting notes
* Documentation
* Research
* Architecture diagrams
* Decisions
* Action items

The goal is to keep everything related to a project in a single place.

### Areas

Areas represent ongoing responsibilities.

Unlike projects, they never truly end.

For work, these include:

* Infrastructure
* Security
* Monitoring
* Development practices

For personal life:

* Finance
* Health
* Learning
* Home

Most long-term operational knowledge eventually ends up here.

### Resources

Resources are reference materials I may need in the future.

Examples include:

* Technical documentation
* Research notes
* Configuration examples
* Learning material
* AI experiments
* Troubleshooting guides

Whenever I solve a problem that I know I'll encounter again someday, I document it here.

### Archive

Completed projects and outdated information are moved to the Archive.

I rarely delete anything.

Storage is cheap.

Losing institutional knowledge is expensive.

## How Information Enters Obsidian

Obsidian is my source of truth, but it isn't always where information originates.

A large portion of my notes start on my [Supernote](/p/how-the-supernote-became-the-starting-point-for-almost-everything-i-write/).

During meetings, brainstorming sessions, architecture discussions, or debugging sessions, I prefer writing by hand.

The process is straightforward:

* Take notes on the Supernote
* Export the document
* Run OCR
* Import into Obsidian

```text
Capture -> OCR -> Obsidian -> organize -> reuse
```

This gives me the benefits of handwriting while still keeping everything searchable and connected.

I've found that writing by hand helps me think more clearly, while Obsidian excels at organizing and maintaining information over time.

## Daily Notes and Tasks

My Daily Note acts as the operational dashboard for the day.

It contains:

* Tasks
* Meeting summaries
* Follow-ups
* Personal reminders
* Work items

I rely heavily on the Tasks plugin to manage action items across projects and areas.

Instead of manually maintaining task lists, tasks are collected from the notes where the work actually happens.

This keeps context attached to the task itself.

When I revisit a task weeks later, I can immediately see the meeting, project, or discussion that generated it.

## Excalidraw for Architecture and Thinking

Not all knowledge is textual.

For architecture discussions, infrastructure planning, system design, and brainstorming, I use the Excalidraw plugin directly inside Obsidian.

Almost every significant technical project generates diagrams:

* Infrastructure layouts
* Application architecture
* Data flows
* Deployment pipelines
* System interactions

Keeping diagrams alongside documentation is incredibly valuable.

Months later, I can revisit a project and immediately recover both the visual and written reasoning behind a decision.

Excalidraw has effectively become my digital whiteboard.

## Where AI Fits Into the Workflow

AI has become an important part of my workflow, but not in the way many people expect.

I don't use AI as a replacement for documentation.

I use it to help process, organize, and leverage documentation.

### Processing Meeting Notes

One of the biggest time sinks after meetings is turning conversations into actionable information.

To solve this, I built a workflow around Gemini, Claude, and Obsidian.

After a meeting:

1. Gemini generates a transcript.
2. The transcript is processed by Claude using Claude Cowork.
3. Claude produces:

   * A concise summary
   * Key decisions
   * Open questions
   * Action items
4. Action items are formatted for the Obsidian Tasks plugin.
5. The tasks are inserted directly into my Daily Note.
6. I review and approve the result.
7. The meeting note is stored in the appropriate project or area.

The important part is the review step.

> AI speeds up the transformation from conversation to structured knowledge, but I still validate the output before it becomes part of the system.

AI accelerates the process, but I remain responsible for validating the output.

The result is that meetings become structured knowledge instead of forgotten conversations.

### Building an AI-Ready Knowledge Base

One lesson I've learned is that AI is only as good as the context it receives.

For this reason, I maintain a separate Obsidian vault specifically designed for AI consumption.

This vault contains:

* Infrastructure documentation
* Project documentation
* Runbooks
* Deployment procedures
* Architecture decisions
* Operational knowledge

The documentation is actively maintained because it serves two audiences:

* Humans
* AI assistants

When Claude needs to help troubleshoot an issue, understand a project, or generate documentation, it already has access to the context it needs.

Instead of repeatedly explaining how systems work, I can point the AI at the relevant documentation.

The quality of the answers improves dramatically.

### AI as a Team Member

The best way I can describe this setup is that AI starts behaving less like a search engine and more like a knowledgeable team member.

It understands:

* Current projects
* Infrastructure architecture
* Existing procedures
* Historical decisions

Not because the model is smarter, but because the documentation exists.

A good example is troubleshooting. If I ask Claude to help investigate a deployment issue in a project that already has architecture notes, runbooks, and past decisions documented in the vault, the conversation starts much further along. Instead of spending time reconstructing the system from memory, I can focus on the actual problem.

The value doesn't come from AI alone.

It comes from combining AI with a well-maintained knowledge base.

## One System, Many Uses

Obsidian has become much more than a note-taking application for me.

It's where projects begin, documentation evolves, knowledge accumulates, and AI gains the context needed to be genuinely useful.

The core workflow remains surprisingly simple:

* Capture information.
* Organize it.
* Document continuously.
* Maintain context.
* Let AI help process and leverage that knowledge.

Everything else is just tooling.

The real value comes from building a system where information is captured once, maintained properly, and remains accessible for both humans and machines.

That is why Obsidian has become so central to both my work and personal life. It is not merely a note-taking app. It is the layer where scattered information becomes durable knowledge, and where that knowledge becomes useful not just to me, but to the AI systems that help me work with it.
