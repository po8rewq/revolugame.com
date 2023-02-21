---
title: Setup supabase locally with docker
description: How to setup supabase locally with docker, more specifically how to use the supabase cli to init your project and create migrations.
date: 2023-02-14
image: pexels-panumas-nikhomkhai-1148820.jpg
categories:
  - tutorials
tags:
  - supabase
  - docker
keywords:
  - supabase
  - docker
---

Recently I've started using [supabase](https://supabase.com), so I wanted to share the best way (in my opinion) to work locally using docker.

After playing around with a test project, I've found that the best way to work locally with supabase is using docker.

The doc is quite limited, so here's how I've done it (and how I'm still using it).

<div style="text-align: center">
<img src="supabase-logo-wordmark--dark.png" alt="Supabase logo" width="400" />
</div>

## Prerequisites

I'm assuming you already have docker installed on your machine, and you have a test project.
It doesn't need to be much, just a simple project with a few tables.

You project also needs `supabase` as a dev dependency (or globally installed).

```bash {linenos=false}
npm install supabase@latest --save-dev
```

## The docker side of things

In order to initialize the configurations for your project, you need to run:

```bash {linenos=false}
supabase init
```

It will create a `supabase` folder with a `config.toml` file inside. You should not have to change it, but in case you need to, you can change a couple of things:

- ports for each service
- auth related config (allow signup, ...)
- external auth providers (github, google, ...)

Now that everything is setup, you can start your project with:

```bash {linenos=false}
supabase start
```

Once everything is ready, you'll get access to:

- API URL: `http://localhost:54321`
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio URL: `http://localhost:54323`
- Inbucket URL: `http://localhost:54324`

Assuming you haven't changed the default ports in the `config.toml` file.

## The database side of things

What you probably want to do if you're not starting from scratch, is to use your existing database.
So in order to dump your existing database, you need to run:

```bash
supabase login
supabase db dump -f init-file.sql
```

This will create the first migration file in `supabase/migrations` and it will be used to init your database when you start or reset it.

You can create a `seed.sql` file in the `supabase` folder, if you want to setup the project with existing data (default testing user for instance).

Now when you do some changes on your local db, create a migration file:

```bash {linenos=false}
supabase db diff -f "migration-name"
```

Or directly create a migration file, and add the changes you want to apply:

```bash {linenos=false}
supabase db migrate create -n "migration-name"
```

If you want to double check everything works (which you probably should), reset your DB:

```bash {linenos=false}
supabase db reset
```

The first migration will be run first, then all your migrations will be applied. Once that's done, it will do the seeding.

Supabase recently updated their doc, so you can find additional info here: [Supabase CLI documentation](https://supabase.com/docs/guides/cli/local-development)
