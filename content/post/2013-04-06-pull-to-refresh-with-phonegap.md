---
title: "Pull-to-refresh with Phonegap"
date: 2013-04-06
tags:
- Haxe
- JQuery
- Phonegap
aliases: ["/pull-to-refresh-with-phonegap/"]
---

It's been a while since my last post. I've been working on some projects that are quite **time-consuming**; that's why I can't (despite having 3 prototypes) work much longer on games for the <a href="http://www.onegameamonth.com/">one game a month challenge</a>.

For one of my apps using **Phonegap** and **JQuery Mobile**, I needed a list with the "**pull to refresh**" fonctionnality. After somes searchs and tests, I ended up using the <a href="https://github.com/watusi/jquery-mobile-iscrollview">Jquery Mobile iscrollview</a> widget, that works pretty well.

So here is a quick start for this feature.

## First of all, what is this widget for ? ##

This widget is a <a href="http://jquerymobile.com">JQueryMobile</a> version of the <a href="https://github.com/cubiq/iscroll">iScroll</a> widget.

According to the autor website :

> The script development began because mobile webkit (on iPhone, iPad, Android) does not provide a native way to scroll content inside a fixed width/height element.

By the way, this plugin allows you to use a lot of features like : 

* Pinch / Zoom
* Pull up/down to refresh
* Improved speed and momentum
* Snap to element
* Customizable scrollbars

## The code ##

Assuming that you have a <a href="http://cordova.apache.org/">Phonegap</a> project already initialized, you need to add to your main html file :

{{< highlight Xml >}}
<link rel="stylesheet" href="css/jquery.mobile.iscrollview.css" />
<link rel="stylesheet" href="css/jquery.mobile.iscrollview-pull.css" />

<script src="js/iscroll.js" type="text/javascript"></script>
<script src="js/jquery.mobile.iscrollview.js" type="text/javascript"></script>
{{< /highlight >}}

And a page like this :

{{< highlight Xml >}}
<div data-role="page" id="main" data-position="fixed">
    <div data-role="header">
        <h1>Test iScroll</h1>
    </div>
    <div data-iscroll="" data-role="content" class="iscroll-wrapper">
        <div class="iscroll-pulldown">
            <span class="iscroll-pull-icon"></span>
            <span class="iscroll-pull-label"></span>
        </div>
        <ul data-role="listview">
            <li>Item 1 culpa aut nam qui</li>
            <li>Item 2 minima quam temporibus quidem</li>
            <li>Item 3 commodi sint facilis numquam</li>
        </ul>
        <div class="iscroll-pullup">
            <span class="iscroll-pull-icon"></span>
            <span class="iscroll-pull-label"></span>
        </div>
    </div>
</div>
{{< /highlight >}}

The "**list-view**" inside the "**data-iscroll**" tag will now have the "**pull to refresh**" feature.
If you need to do some actions (like refresh the content, ...) you have to listen for some events :

{{< highlight Haxe >}}
var document = untyped __js__("document");
document.addEventListener("deviceready", function(e) {
  new JQuery(function() {
    new JQuery(".iscroll-wrapper").bind({
      iscroll_onpulldown: onPullDown,
      iscroll_onpullup: onPullUp
    });
  });
});
{{< /highlight >}}

Here is the complete list of events for the pull-to-refresh feature :

* iscroll_onpulldown
* iscroll_onpullup
* iscroll_onpulldownreset
* iscroll_onpulldownpulled
* iscroll_onpulldownloading
* iscroll_onpullupreset
* iscroll_onpulluppulled
* iscroll_onpulluploading

The event callbacks takes two arguments : 

{{< highlight Haxe >}}
onPullDown(event: Event, data: Dynamic):Void
{{< /highlight >}}

The **event** argument is a basic JQuery Event.
The **data** argument has only one member : **iscrollview**, that is the reference to the **iscrollview** object that made the callback.

And after that, if you want to hide the top or bottom part, just refresh the componant :

{{< highlight Haxe >}}
data.iscrollview.refresh();
{{< /highlight >}}

## Customization ##

You can also custom the pull label text. All these options has default values, but you can custom them all :

* **pullDownResetText** (default: "Pull down to refresh...")
* **pullDownPulledText** (default: "Release to refresh...")
* **pullDownLoadingText** (default: "Loading...")
* **pullUpResetText** (default: "Pull up to refresh...")
* **pullUpPulledText** (default: "Release to refresh...")
* **pullUpLoadingText** (default: "Loading...")

If you want to change those values from the html, just set the correct attribute :

{{< highlight xml >}}
<span class="iscroll-pull-label" data-iscroll-loading-text="Custom loading text" data-iscroll-pulled-text="Custom pulled text">Custom reset text</span>
{{< /highlight >}}

For more informations, here is <a href="https://github.com/watusi/jquery-mobile-iscrollview#pull-to-refresh">the place you want to go</a>.