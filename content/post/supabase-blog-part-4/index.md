---
title: Create a blog with supabase and nextjs - part 4
description: Lets do some server side rendering
image: pexels-nubia-navarro-(nubikini)-1110355.jpg
date: 2023-03-21
categories:
  - tutorials
tags:
  - nextjs
  - react
---

> If you want to jump straight to the source code, here's the link to the [github repository](https://github.com/po8rewq/tuto-blog-nextjs-supabase).

One thing we haven't done yet is server side rendering. We are currently fetching the posts using the `useEffect` hook. This means that the posts won't be available until the component is mounted. We can do better by using the `getStaticProps` function from nextjs to fetch the posts on the server.

Lets use the `/posts/[id]` page to do just that.

```tsx
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx); // from '@supabase/auth-helpers-nextjs';
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('id', ctx.params?.id)
    .single();

  if (!data) {
    // if the post doesn't exist, return 404
    return {
      notFound: true,
    };
  }

  // return the post a prop
  return {
    props: {
      post: data,
    },
  };
};
```

By using `getServerSideProps`, we can now fetch the post on the server and pass it to the component as a prop. Our `PostPage` component already have the `post` prop so we can just use it (see [part 2](/p/create-a-blog-with-supabase-and-nextjs-part-2/#the-post-page-and-the-edit-page-)).

<!-- > Next step [we are going to deploy our blog](/p/create-a-blog-with-supabase-and-nextjs-part-5/) -->
