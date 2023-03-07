---
title: Create a blog with supabase and nextjs - part 1
description:
date: 2023-02-28
categories:
  - tutorials
tags:
  - supabase
draft: true
---

## init project with our stack

Create a new project with nextjs and typescript:

```bash
npx create-next-app@latest --typescript
```

Install supabase and bootstrap:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react react-bootstrap bootstrap
```

```bash
npx supabase init
```

We are good to go!

## create a post table

```sql

```

## folder structure (video only?)

## hook for getting all posts

```typescript
useGetPosts();
```
