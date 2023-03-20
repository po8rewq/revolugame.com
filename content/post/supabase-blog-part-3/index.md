---
title: Create a blog with supabase and nextjs - part 3
description: Lets build and use hooks to fetch the data
image: pexels-anete-lusina-4792079.jpg
date: 2023-03-20 00:00:00 +0000 UTC
categories:
  - tutorials
tags:
  - supabase
  - react
---

> If you want to jump straight to the source code, here's the link to the [github repository](https://github.com/po8rewq/tuto-blog-nextjs-supabase).

## The `useSignIn` hook

We are going to create a hook to handle the signin process. We will use the `useAuth` hook from `@supabase/auth-helpers-nextjs` to handle the authentication. It returns an object with two methods: `signInWithEmail` and `signOut`.

```ts
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const useSignIn = () => {
  const supabase = useSupabaseClient();

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { signInWithEmail, signOut };
};

export default useSignIn;
```

Here's a breakdown of the hook's functionality:

### `signInWithEmail` method

The `signInWithEmail` method is an asynchronous function that takes an email address as an argument. It uses the Supabase client obtained from the `useSupabaseClient` hook to call the `signInWithOtp` method and attempt to sign the user in with a magic link.

The user will only need to check his/her email and click on the link to sign in.

### `signOut` method

The `signOut` method is an asynchronous function that calls the `signOut` method of the Supabase client obtained from the `useSupabaseClient` hook to sign the user out of their account. If the sign-out attempt fails, the function throws the error.

## The `usePosts` hook

```ts
import { useState } from 'react';
import { Database } from '@/types/database.types';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Post } from '@/types/Post';

const useGetPosts = () => {
  // Retrieve Supabase client and user from context
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  // Initialize posts state
  const [posts, setPosts] = useState<Post[]>([]);

  // Retrieve posts from the database
  const getPosts = async (limit?: number) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(limit || 50);
    if (error) throw error;
    setPosts(data || []);
  };

  // Create a new post in the database
  const createPost = async (title: string, body: string) => {
    if (!user) throw new Error('User not found');
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        body,
        author: user.id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  // Update an existing post in the database
  const updatePost = async (id: string, title: string, body: string) => {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        body,
      })
      .match({ id })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  return {
    getPosts,
    updatePost,
    createPost,
    posts,
  };
};

export default useGetPosts;
```

This custom hook provides functionality for retrieving and manipulating posts from a Supabase database.

Nothing too fancy about it, it's just a wrapper around the Supabase client. In terms of security, the RLS are already taking care of everything so we don't need to worry about that.

## Lets integrate the hooks in the app

First lets do the signin page.

```tsx
// --- src/components/SignupModal.tsx ---
const { signInWithEmail } = useSignIn();

const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
  evt.preventDefault();
  try {
    await signInWithEmail(email);
  } catch (error: any) {
    console.log(error.message);
  }
};
```

Previously the `posts` array was just an empty array we were saving in the state. Now we are going to fetch the posts from the database. The `useGetPosts` hook provides a `getPosts` method that we can use to fetch the posts and a `posts` state that we can use to display the posts. So no changes to the UI.

```tsx
// --- src/components/PostList
const { getPosts, posts } = useGetPosts();
useEffect(() => {
  getPosts();
}, []); // only on mount
```

Creating a post is pretty straightforward.

```tsx
// --- src/pages/new.tsx ---
const router = useRouter();
const { createPost } = usePosts();

const handleSubmit = async (title: string, body: string) => {
  try {
    const { id } = await createPost(title, body);
    router.push(`/posts/${id}`);
  } catch (error: any) {
    console.log(error.message);
  }
};
```

We call the hook that will create a new post in the database and redirect the user to the newly created post if it succeeds.

And finally lets update the detail page the same way.

```tsx
// --- src/pages/posts/[id].tsx ---
const router = useRouter();
const { updatePost } = usePosts();

const handleSubmit = async (title: string, body: string) => {
  try {
    await updatePost(post.id, title, body);
    router.reload();
  } catch (error: any) {
    console.log(error.message);
  }
};
```

The last step is to fetch the post and display them in the post page (`/posts/[id]`), based on the `id` in the url. To do that, we are going to do it differently and use the `getServerSideProps` function from Next.js.

<!-- > Next step [lets do some SSR](/p/create-a-blog-with-supabase-and-nextjs-part-4/) -->

> Next step: coming soon
