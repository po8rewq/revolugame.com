---
title: Tmx format with Flixel Haxe
date: 2012-04-26
tags:
- Flixel
- Haxe
aliases: ["/tmx-format-with-flixel-haxe/"]
---

During the past few days, I've been working with the [HaxePunk](https://github.com/MattTuttle/HaxePunk) framework to develop a game. But because of a lack of performance on **Android** (and no time to try to fix it), I've tried the [Flixel port](https://github.com/Beeblerox/HaxeFlixel) to see if I could build a game quickly.

First of all, I've tried the example based on **Demo** on my Android device and... surprise, the game turns at **50-60 FPS**. So against my heart, I decided to start building my game on Flixel (actually, I really prefer the HaxePunk structure).

First of all, I tried to remember how Flixel works (I've already used it on [My Hero Factory](/work/my-hero-factory.html)...).

So I started to initialise a project, and tried to import a level I've made with [Tiled Map Editor](http://www.mapeditor.org/)... only to discover the **tmx format** is not supported in Flixel o_O.

Thanks to [Matt Tuttle](http://matttuttle.com), the library is already ported to HaxePunk (the original one was from [Thomas Jahn](http://pixelpracht.wordpress.com/2010/03/31/flash-tmx-parser/)) so it was not difficult to make it work with Flixel.

So here is how you used it (make sure to [download the sources](https://github.com/po8rewq/HaxeFlixelTiled)) :

{{< highlight Haxe >}}
// Create a TmxMap with a tmx file
var tmx : TmxMap = new TmxMap( nme.Assets.getText('levels/map01.tmx') );

// Basic level structure
var t:FlxTilemap = new FlxTilemap();

// Generate a CSV from the layer 'map' with all the tiles from the TileSet 'tiles'
var mapCsv:String = tmx.getLayer('map').toCsv( tmx.getTileSet('tiles') );

t.loadMap(mapCsv, "gfx/tiles.png", 8, 8, FlxTilemap.OFF);
add(t);
{{< /highlight >}}

And that's it! Of course if you want to have **collisions detections**, just add:

{{< highlight Haxe >}}
override public function update()
{
    super.update();
    FlxG.collide(_player, _tilemap);
}
{{< /highlight >}}
