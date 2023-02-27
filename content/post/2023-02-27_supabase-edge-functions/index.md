---
title: Supabase edge functions - a quick start
description:
date: 2023-02-27
categories:
  - tutorials
tags:
  - supabase
---

Supabase edge functions are quite powerful, but you need to setup a lot of things to get started. So here is a quick start guide to get you started.

> Disclaimer: this is how I use them in real projects, with my prefered stack, and this post is a way for me to remember how to setup everything.

Usually, I use Next.js, and I want to use the same stack for my edge functions. So I will use the following stack:

```bash
npx create-next-app@latest --typescript
```

```bash
npx install supabase --save-dev
npm install @supabase/supabase-js --save
```

First lets init the supabase project, and start the local server:

```bash
npx supabase init
npx supabase start
```

Now to create an edge functions:

```bash
npx supabase functions new my-function
```

To test it, your need to run the Functions watcher

```bash
npx supabase functions serve
```

So for our test, the edge function will be called by an endpoint. So we need to create a new endpoint in `/pages/api/`

```typescript
// pages/api/simple-edge-function.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const simpleEdgeFunction = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // 'my-function' is the name of the function you created from the cli above
  const { data, error } = await supabase.functions.invoke('my-function', {
    body: { name: 'Functions' },
  });

  console.log(data);

  res.status(200).json({ data, error });
};

export default simpleEdgeFunction;
```

Now go to `supabase/functions/my-function/index.ts`, and simply return a string:

```typescript
// this is the example from the supabase documentation
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

console.log('Hello from Functions!');

serve(async (req: Request) => {
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`,
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Now if you call the endpoint:

```bash
curl http://localhost:3000/api/simple-edge-function
```

it will return:

```json
{
  "data": {
    "message": "Hello Functions!"
  },
  "error": null
}
```

And print in the functions watcher console:

```txt
Hello from Functions!
```

and in the supabase console:

```txt
{ message: 'Hello Functions!' }
```

If you need to use an env file, you need to run the watcher with the `--env-file` parameter:

```bash
npx supabase functions serve --env-file .env.local
```
