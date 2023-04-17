---
title: NextJS api validators
description: Learn how to build secure and robust APIs with Next API Validator in this tutorial. Discover how to leverage TypeScript's type checking capabilities to validate and sanitize incoming API requests, prevent common security vulnerabilities, and ensure data integrity.
image: pexels-dominika-roseclay-3839649.jpg
date: 2023-04-17
tags:
  - typescript
  - nextjs
---

## NextJS background

NextJS is a popular React framework for building server-rendered React applications. It provides a feature called "API Routes" that allows you to create serverless functions within your NextJS application to handle API requests.

API Routes in NextJS provide a convenient way to create server-side logic for handling HTTP requests, such as fetching data from a database, processing form submissions, or integrating with third-party APIs. These API Routes are automatically deployed as serverless functions and can be accessed via API endpoints.

To create an API Route in NextJS, you can create a file with the .js or .ts extension in the pages/api directory of your NextJS project. This file represents the API endpoint that you want to create. For example, you can create a file called myApi.ts in the pages/api directory to create an API endpoint with the URL path `/api/myApi`.

Inside the API Route file, you can define your server-side logic using JavaScript or TypeScript. You can use popular Node.js libraries for handling HTTP requests and responses, such as http, express, or axios. For example, you can define an API Route that handles a POST request and returns a JSON response like this:

```typescript
// pages/api/myApi.ts

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle POST request logic here
    const { email, address } = req.body;
    // Process the data and send response
    res.status(200).json({ message: 'Data received', email, address });
  } else {
    res.status(400).json({ message: 'Invalid request method' });
  }
}
```

This is quite easy to setup and great to use. 
Except when the application grows and you need to validate the data coming from the client.

For instance, if you want to have the same endpoint and handle the GET and the POST request, you can do something like this:

```typescript
// pages/api/myApi.ts

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // your logic
        res.status(200).json({ message: 'Post method' });
    } else if (req.method === 'GET') {
        // your get logic
        res.status(200).json({ item: {name: 'my item', price: 0} });
    } else {
        res.status(400).json({ message: 'Invalid request method' });
    }
}
```

And if you need to validate the data coming from the client, you will need to add some logic to check if the data is valid or not.

That's when [`next-api-decorators`](https://next-api-decorators.vercel.app/docs/) comes in handy.

> Main caveat: you handler needs to be a **class** rather than a **function**.

## What you need to install

```bash
npm install next-api-decorators class-validator
```

So now, you can create a class that will handles our previous requests like so:

```typescript
// pages/api/myApi.ts

class MyApiRouteHandler {
    @Post()
    @HttpCode(200) // will return a 200 if everything is ok
    createItem() {
        return { message: 'Post method' };
    }

    @Get()
    @HttpCode(200) // will return a 200 if everything is ok
    getItem() {
        return ({ item: {name: 'my item', price: 0} });
    }
}
export default createHandler(MyApiRouteHandler);
```

Way cleaner and easier to read.

## Validation

Now lets add some validation to our request:

```typescript
// pages/api/myApi.ts

export default class MyApiRouteHandler {
    @Post()
    @HttpCode(201) // will return a 201 if everything is ok
    createItem(
        @Body(ValidationPipe) body: ItemCreationDto,
        @Req() req: NextApiRequest,
        @Res() res: NextApiResponse
    ) {
        const { name, price } = body;
        return { message: 'Post method', name, price };
    }
}
```

We are using the `ValidationPipe` from `class-validator` to validate our request body.

```typescript
class ItemCreationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}
```

Now when you call your endpoint, you will get a 400 error if your body is not valid. So quite easy to use.
Now you can just insert your data in the database for instance without having to write extra code for validation.

## Conclusion

In conclusion, [NextJS API validator](https://next-api-decorators.vercel.app/docs/) is a valuable tool for building secure and robust APIs in a TypeScript context. By leveraging its features for type checking, data validation, and sanitization, you can create APIs that are more resilient to common security risks, provide better error handling, and deliver a more reliable and secure user experience. Incorporating NextJS API validator in your NextJS TypeScript projects can greatly enhance the overall quality and security of your APIs.