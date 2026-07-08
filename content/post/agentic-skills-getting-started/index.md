---
title: "From Prompts to Pipelines: How I Use Agentic Coding as an Engineering Workflow"
description: "A practical look at how I moved from prompt-driven coding to a staged, artifact-driven workflow. How agentic-skills structures tasks into requirements, architecture, implementation, and review - and what that looks like on a real change."
date: 2026-07-08T22:00:00+02:00
image: cover-image.png
categories:
  - tutorials
tags:
  - ai
  - automation
  - workflows
---

I am interested in agentic coding for the same reason I care about good engineering process in general: I want work to move forward in a way that is inspectable, repeatable, and resilient once the task gets messy.

A lot of AI-assisted coding still feels like improvisation. You ask for something, get a result, adjust the prompt, try again, and hope the useful reasoning is still somewhere in the scrollback. That can work for tiny edits. It gets much less convincing when the task starts touching architecture, tests, review, or pull requests.

What I want instead is a workflow where the model helps me think and execute, but inside a structure I can inspect afterwards. I want artifacts, gates, and something I can resume tomorrow without reconstructing the entire mental state from memory.

That is why I use [po8rewq/agentic-skills](https://github.com/po8rewq/agentic-skills).

It gives me a practical way to do agentic coding as an engineering workflow rather than as a long sequence of chat turns. A task moves through requirements, architecture, implementation, checks, review, and pull request creation. Each stage leaves something I can read, verify, and challenge.

## What makes this interesting to me

The interesting part is not just that there is a CLI. Plenty of tools have a CLI.

What matters to me is that it turns AI-assisted coding into a staged system:

* requirements force the task to become explicit
* architecture makes risks visible before code is written
* implementation happens against a plan instead of against a vague prompt
* checks and review happen as part of the flow, not as an afterthought
* runs are resumable, so interruptions do not destroy context

That changes the feel of the work quite a bit. Instead of asking "what should I prompt next?", I am usually asking "what stage is this task in, and what should exist before I move on?"

Where this really clicked for me was when I noticed I was spending less energy trying to preserve context in my head and more energy evaluating actual outputs.

## What the repository actually provides

The repository itself is fairly small and opinionated in a good way:

* `agentic/` contains the Python package and CLI entry points
* `pipelines/` contains definitions such as `default.yaml`, `cheap.yaml`, and `production.yaml`
* `skills/` contains the Markdown instructions used by each stage
* `templates/` and `scripts/` contain setup helpers

I like that the shared repository stays centralized while each project keeps only the parts that should be project-specific.

In the target repository, I usually only need:

* `agentic.yaml`
* `.ai/skills/`
* optionally `.ai/context/`
* optionally `.ai/memory/`

That separation is one of the reasons the workflow feels sustainable. The orchestration logic lives in one place, while each repository keeps its own commands, context, and operating rules.

What surprised me is how much this small separation changes the feel of the system. It stops feeling like a clever demo and starts feeling like something I can keep around.

## How the pipeline is driven

The config is not just setup. It is the part that tells the pipeline how to behave: which provider to use, which commands to run, when to ask for approval, what context to load, and how the task should progress from one stage to the next.

A very small `agentic.yaml` can already show the idea:

```yaml
project:
  name: my-api
  default_branch: main
providers:
  default: claude-code
  available:
    claude-code: {command: claude}
forge:
  provider: github
  create_pr: true
commands:
  install: pnpm install
  lint: pnpm lint
  typecheck: pnpm typecheck
  test: pnpm test
  build: pnpm build
```

That is obviously not a full production config, but it already makes the model operate inside a real engineering boundary. It knows which provider to call, which repo commands count as checks, what the main branch is, and whether it should prepare a PR at the end.

From there I usually add the pieces that make the workflow more serious:

* model aliases by stage
* gating and risk-routing rules
* context and memory paths
* project-specific command overrides

Once that file exists, I stop thinking in terms of isolated prompts and start thinking in terms of pipeline behavior.

The part I did not expect is that a boring config file would do so much work. It quietly turns "use an AI assistant here" into an operating model with boundaries.

## How I set it up

The setup is intentionally boring, which is part of the appeal.

I install the shared package from [po8rewq/agentic-skills](https://github.com/po8rewq/agentic-skills):

```bash
cd /path/to/agentic-skills
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip setuptools
python3 -m pip install -e .
```

That gives me three commands:

```text
run-pipeline
validate-agentic-config
install-agentic-skills
```

In the target project, I copy the example config:

```bash
cp /path/to/agentic-skills/agentic.example.yaml /path/to/project/agentic.yaml
```

Then I install the shared skills:

```bash
install-agentic-skills --source /path/to/agentic-skills/skills .ai/skills
```

For starter repo context and memory files:

```bash
install-agentic-skills --with-context --with-memory .ai/skills
```

At that point, the workflow is ready to try on a real task.

## What it looks like on a small task

The easiest way to understand the workflow is to run a tiny change through it.

Take a small but real task like: "Add audit logging to endpoint X."

Before I worked this way, that kind of task usually turned into a loose sequence of prompts and manual checks. I would explain the endpoint, ask for a plan, ask for an implementation, remember to think about logging format, wonder whether I had missed a migration or config update, run tests manually, and then do a separate cleanup pass before opening a PR.

With the pipeline, the same task becomes much more structured:

| Before | With the pipeline |
| --- | --- |
| I describe the task in chat and keep refining the prompt. | I start with a task and let the pipeline create explicit requirements. |
| Architecture concerns stay in my head unless I stop and write them down. | Architecture is a stage, so affected modules, risks, and planned files get written down early. |
| Implementation can drift because the prompt keeps changing. | Implementation happens against the requirements and design artifacts. |
| Checks are easy to postpone or do inconsistently. | Lint, typecheck, test, and build are part of the flow. |
| Review often happens informally after the code already feels "done." | Review is a first-class stage with artifacts and follow-up fixes. |
| If I get interrupted, I have to reconstruct context from chat history and git diff. | I can resume from the saved run artifacts under `.ai/runs/`. |

That is the practical difference I care about most. The pipeline does not just help me write code faster. It keeps the task legible while it moves.

On a task like "Add audit logging to endpoint X", that usually means I get something concrete from each stage:

* the requirements stage produces a short spec that clarifies which endpoint is in scope, what event should be logged, what fields need to be captured, and what does not need to change
* the architecture stage identifies the affected modules, calls out risks such as logging sensitive data or introducing duplicate events, and proposes where the logging should live
* the implementation stage works against those artifacts instead of inventing the shape of the change on the fly
* the review stage can flag things that are easy to miss in a chat-only flow, like missing test coverage, noisy log payloads, or logging at the wrong boundary

That is the part I find reassuring. Even on a small task, the workflow leaves behind enough structure that I can inspect the reasoning instead of just trusting the final diff.

I usually start with a dry run:

```bash
run-pipeline --dry-run --skip-approval --task "Preview the workflow"
```

That gives me a quick read on the configuration, the stage order, and the prompts without committing to actual work.

Then I try something intentionally small:

```bash
run-pipeline --pipeline cheap --task "Fix a typo in the README"
```

I like using a trivial task first because it teaches the workflow without forcing me to debug a complex change and a new process at the same time.

Every run is stored under `.ai/runs/<timestamp>-<task>/`. That directory is one of the biggest reasons I like this approach. It keeps the merged config snapshot, prompts, provider outputs, command results, state, and pull request context.

If a run stops halfway through, I can resume it:

```bash
run-pipeline --resume .ai/runs/2026-07-07-add-audit-logging
```

That sounds like a small detail, but it changes the experience a lot. Interruptions stop being destructive.

That was another moment where it clicked for me. Resumability sounds like a convenience until you use it on a real week with meetings, interruptions, and half-finished thoughts.

## Why the staged flow matters

The default pipeline is intentionally linear:

1. Requirements
2. Architecture
3. Implementation
4. Checks
5. Review
6. Fix review findings
7. Final checks
8. Pull request

That linearity is not a limitation. It is what gives the workflow its shape.

More importantly, each stage leaves behind a different kind of output:

* requirements produce a task spec: what needs to change, what constraints matter, and what is explicitly out of scope
* architecture produces design decisions: how the change should be approached, which modules are affected, and what risks need attention
* implementation produces the actual code changes guided by those earlier artifacts
* checks produce concrete command output from lint, typecheck, test, and build
* review produces issues, findings, and suggested fixes instead of a vague sense that the diff "looks fine"

Later stages only happen if earlier stages are in a good enough state. That is what makes the pipeline feel real to me. It is not just a sequence of labels. It is a sequence of concrete outputs.

That is the part I find compelling. I do not need to invent a new ritual every time I want to use AI on a real software task.

## When I reach for it

I reach for this style of agentic coding when I want a task to be:

* repeatable
* inspectable
* auditable
* resumable
* safe enough to route through staged checks

It is especially useful when a change benefits from a requirements pass before implementation, or when I want review and PR creation to happen inside the same flow instead of as separate manual cleanup steps.

In practice, I think this works best for solo developers or small teams doing backend, infrastructure, platform, or full-stack work where a task touches multiple concerns at once: code, tests, configuration, and review. It is much less compelling for quick edits or highly visual exploratory work where the overhead is larger than the payoff.

## Where this can break down

This workflow is not free.

For trivial tasks, the overhead can be higher than the value. It also requires discipline: if the config, skills, or repo context drift away from reality, the pipeline becomes less useful very quickly.

Debugging pipeline behavior can also be its own kind of work. When a stage produces something weak, the problem might be the prompt, the config, the context files, the model choice, or the task itself. That is more structured than random prompt iteration, but it is still a system you have to maintain.

It is also not the best fit for highly exploratory work. If I am still figuring out what I even want to build, a staged pipeline can feel premature. I find it most useful once a task is real enough to benefit from explicit requirements, checks, and review.

## The main lesson

The main thing I have learned is that agentic coding gets more useful when it stops feeling like magic.

I do not want an opaque assistant that sometimes writes code and sometimes loses the plot. I want a system that helps with execution while leaving behind enough structure that I can understand what happened, challenge it, and keep moving.

That is the shift that matters most to me. I no longer think in prompts. I think in stages, artifacts, and decisions.
