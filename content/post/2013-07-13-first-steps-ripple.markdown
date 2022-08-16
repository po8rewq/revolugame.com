---
title: "First steps with Ripple"
date: 2013-07-13
aliases: ["/first-steps-ripple/"]
tags:
- Haxe
- Phonegap
---

A few months ago, I discovered a really cool plugin for **chrome**. It's <a href="http://ripple.incubator.apache.org">Ripple</a>, an **open source project** hosted by <a href="http://apache.org/">Apache</a> to emulate mobile devices into you browser (Chrome actually ...). But I've never really had the time (or the project) to test it.

So here it is !

<div class="alert alert-info" role="alert">Just as a reminder, I'm using Haxe for the javascript part. And the last Phonegap version (2.9.0).</div>

## Installation ##

First, you have to install the <a href="https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en">chrome plugin</a>.

Now, create a new phonegap project :

{{< highlight Bash shell scripts >}}
create /path/to/dir/MyProject com.you.myproject MyProject
{{< /highlight >}}

Create your application (or just test with the default Phonegap app) :

{{< highlight Haxe >}}
class Main {
    static function main() {
         js.Browser.document.addEventListener( "deviceready", function(e) {
              new JQuery(function() {
                  trace("hello world");
              });
         });
    }
}
{{< /highlight >}}

Go to your working directory and start the server :

{{< highlight Bash shell scripts >}}
cd /path/to/dir/MyProject
nekotools server
{{< /highlight >}}

Go to <a href="http://emulate.phonegap.com?url=localhost:2000&platform=phonegap">http://emulate.phonegap.com?url=localhost:2000&platform=phonegap</a> and enable the plugin if it isn't.

<img src="/assets/img/posts/browserRipple.png" alt="browserRipple" class="img-responsive" />

<div class="alert alert-danger" role="alert">Be sure to have the 2.0.0 version in the platform panel (on the left) otherwise, it will not work.</div>

It can really **save you time**, because deploy to a real device is much longer, and more difficult to debug. So if you use the chrome developer tools... you will not let go this plugin!
But it sure doesn't replace a **real device** for testing ;)
