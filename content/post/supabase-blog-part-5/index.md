---
title: Create a blog with supabase and nextjs - part 5
description: Lets deploy our blog to vercel and supabase using github actions
image: pexels-manuel-geissinger-325229.jpg
date: 2023-03-22
categories:
  - tutorials
tags:
  - nextjs
  - vercel
draft: true
---

## Create a supabase account

Until now we've been using supabase locally with docker. Now we are going to create a supabase account and use it to deploy our blog.

Don't forget to create the table and auth.

## Create a repository

Create a new repository on github and clone it locally. Easiest way it to clone the [final repository](<(https://github.com/po8rewq/tuto-blog-nextjs-supabase)>) (if you haven't done everything on your side already).

## Deploying the blog

First we need to create a vercel account and link it to our github account.

### Setup the env vars

Now we need to setup the environment variables for our project. Go to the project settings and add the following variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

You can find the values in the supabase dashboard.
