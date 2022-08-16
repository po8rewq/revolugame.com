---
title: "HxSpriter released"
date: 2012-05-08
tags:
- Flixel
- Haxe
- HaxePunk
- NME
aliases: ["/hxspriter-spriter/"]
---

**HxSpriter** is the **Haxe** implementation of the <a href="http://www.brashmonkey.com/spriter.htm">Spriter application</a> and file format.
It's a port a the <a href="http://abeltoy.com/projects/spriterAS3/index.html">SpriterAS3</a> lib, but working with **NME**. It basically lets you use Spriter with your games or applications.

## First of all, what's Spriter? ##

> Spriter is a powerful animation tool for creating highly detailed 2d real-time game characters and effects in an intuitive, visual editor. The characters are saved to a format that allows game engines to produce higher quality visuals, while also using less video ram, and requiring less disk space per frame than traditional 2d sprite animation.
>
> Spriter also provides several game specific features like collision boxes, and sound effect triggering, and saves to an open format that will be useable across many different game engines and platforms.

Spriter is currently in an **usable beta state**, but it's really subject to changes, so the various implementations might stop working from a version to another, and they will need constant updating. The file format may also get incompatible across future versions, and the application may cause some crashes. For these reasons, Spriter is not production ready, but you can test it and play with it if you want.

## How to use it ? ##

To use it, just install it from <a href="http://lib.haxe.org/p/HxSpriter">haxelib</a> :

{{< highlight Bash shell scripts >}}
haxelib install HxSpriter
{{< /highlight >}}

In your NME file, you have to define a sprites directory (just rename the directory where you have all your Spriter's animations).

{{< highlight Xml >}}
<assets path="path/to/the/sprites/directory" rename="sprites" />
{{< /highlight >}}

Now, if you want to use the library :

{{< highlight Haxe >}}
var spriter : BitmapSpriter = new BitmapSpriter('BetaFormatHero.SCML', 100, 300);
spriter.playAnimation('idle_healthy');
addChild(spriter);
{{< /highlight >}}

Or with the <a href="https://github.com/Beeblerox/HaxeFlixel">Flixel</a> port :

{{< highlight Haxe >}}
var spriter : FlxSpriter = new FlxSpriter('BetaFormatHero.SCML', 100, 300);
spriter.playAnimation('idle_healthy');
add(spriter);
{{< /highlight >}}

Or with <a href="http://haxepunk.com/">HaxePunk</a> :

{{< highlight Haxe >}}
var spriter : HxpSpriter = new HxpSpriter('BetaFormatHero.SCML', 100, 300);
spriter.playAnimation('idle_healthy');
addGraphic( spriter );
{{< /highlight >}}

You can also checkout the repository : <a href="https://github.com/po8rewq/hxSpriter">https://github.com/po8rewq/hxSpriter</a>.