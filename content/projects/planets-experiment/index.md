---
title: 1GAM May 2013 - Planets Experiment
aliases: ["/work/planets-experiment.html", "/work/planets-experiment"]
---

<style type="text/css">
  @font-face {
      font-family: pixelade;
      src: url("PIXELADE.TTF");
  }

  p#game {
      background: url('/assets/img/portfolio/PlanetsExperiment/images/background.png') no-repeat; 
      background-size: 800px 600px; 
      background-position: center;
      text-align: center;
      width: 800px;
      height: 600px;
  }

  div#loader {
      color: #FFF;
      font-size: 29px;
      font-family: pixelade;
      margin: 0 auto;
  }
</style>

For this month, here is a prototype of a conquest game. No levels and no IA (I did not have enough time to finish it before the end of the month).

Two factions: <strong>greens</strong> vs <strong>reds</strong>, you are the green ones. The goal is to <strong>conquer all the planets</strong>.

Click on a planet to select it, click again (or outside) to unselect. If a planet is selected, click on another planet to send 50% of your ships to it.

To conquer a neutral one, send <strong>as much ships as indicated</strong>. When enough ships are in place, an hourglass will appear during the conquest. When it's done, the planet is yours. 

Planets with a heart icon can regenerate ships, only if there is at least one ship remaining.

Game made with <a href="http://haxe.org">Haxe</a> and my <a href="https://github.com/po8rewq/AGE">game engine AGE</a>.<br />
Assets are from <a href="http://blackmoondev.com/big-space-gun-free-pixel-art-graphics-for-your-game/">blackmoondev.com</a> (thanks to them).

> Update 22/07: basic AI - end game screen (F5 to restart)

<p id="game">
	<div id="loader">LOADING, please wait ...</div>
</p>

<script type="text/javascript" src="experiment.js"></script>

> <em>Works on the latest versions of <strong>Chrome</strong> - <strong>Firefox</strong> - <strong>Opera</strong> and <strong>Safari</strong>.</em>