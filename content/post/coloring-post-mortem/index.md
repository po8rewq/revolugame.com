---
title: "Coloring - post mortem"
date: "2015-03-29"
image: "promo-screen-2.png"
tags:
- Haxe
aliases: ["/2015/03/29/coloring-post-mortem.html"]
---

It took me a while but I finally did it.

I released a new version of my LD31 entry, [coloring](/work/ld31.html).

I had to rewrite it completely, because I used my **HTML5 framework** ([AGE](https://github.com/po8rewq/AGE)) and I wanted to deploy it on **mobile**. So thanks to **haxe and OpenFl** I did it without trashing all my old code.

So what's new ?

 * Animations
 * Better score handling with combos
 * A preview of the colors order and which one can pop
 * A tutorial, to help the beginners understand the game mechanism
 * Google play integration for the Android version (leaderboard and trophies)
 * Lots of bug fixes :)

<div class="grid">
  <img src="promo-screen-1.png" />
  <img src="promo-screen-2.png" />
  <img src="promo-screen-3.png" />
  <img src="promo-screen-4.png" />
</div>

For the first time, I did integrate **unit tests** in order to test all (or at least the most) game possibilities. For that I used [munit](https://github.com/massiveinteractive/MassiveUnit) which is really great.

For the leaderboard integration, I've used [linden-google-play library](https://github.com/sergey-miryanov/linden-google-play) which is a native extension for OpenFl.

So here you can play the [old version](/work/ld31.html), and the new one on [itch.io](http://revolugame.itch.io/coloring) or directly on Google Play:

<a href="https://play.google.com/store/apps/details?id=com.revolugame.coloring&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
<img alt="Get it on Google Play" width="180" src="https://play.google.com/intl/en_us/badges/images/generic/en-play-badge-border.png" /></a>

Enjoy, and let me know what you think.
