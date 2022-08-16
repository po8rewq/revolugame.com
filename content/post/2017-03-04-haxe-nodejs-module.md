---
title: Create a node module with Haxe
date: 2017-03-04
tags:
- Haxe
- NodeJS
aliases: ["/2017/03/04/haxe-nodejs-module.html"]
---

In this post, I'm not going to talk about npm (except for the initialisation part), but about how **to code** your module **with Haxe**.

### Project setup

First thing to do is to create our npm project.

```
npm init --yes
```

`--yes` because I'm lazy and I don't want to enter the default value for each prompt.

My default **package.json** file looks like:

{{< highlight json >}}
{
  "name": "test-node-package",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "build": "haxe build.hxml",
    "dev": "npm run build -- -debug"
  },
  "keywords": [],
  "author": "RevoluGame",
  "license": "ISC",
  "files": ["dist"]
}
{{< /highlight >}}

The `files` parameter will tell npm which file/directory to import while installing the module. I only specify the **dist** directory, because for a production usage, the Haxe sources are not needed. But still, if you want to publish everything, just forget about the `files` parameter.

My project looks like:

```
- test-node-package
  - dist
    - index.js
  - src
    - Main.hx
  - package.json
  - build.hxml
```

### The Haxe part

Now that we have our project setup, we can start working on our module.

Let's say we want to do the following in another project:

{{< highlight js >}}
var test = require('test-node-package');
test.foo("world");
{{< /highlight >}}

In Haxe you will have to:

{{< highlight haxe >}}
class Main
{
    @:expose("foo")
    public static function foo(bar: String)
    {
        trace('Hello $bar');
    }

    public static function main() {}
}
{{< /highlight >}}

The `@expose` metadata will make your method **available in Javascript** with the name you specified (in our case: *foo*).

You will probably need to use the [nodejs lib](https://github.com/HaxeFoundation/hxnodejs), so don't forget to add it in your **build.hxml**:
```
-lib hxnodejs
```
