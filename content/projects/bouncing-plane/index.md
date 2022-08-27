---
title: "Bouncing plane"
---

## Description

**Bouncing Plane** is a **Flappy Bird** like.
It's a **pico-8** cartridge build with **Haxe** (of course).

## Controls

* **[UP]** to jump

<style type="text/css">
  <!--
  
  canvas#canvas { width: 580px; height: 540px; }
  
  -->
  </style>
  
  <center><div style="width:580px;">
  
  <canvas class="emscripten" id="canvas" oncontextmenu="event.preventDefault()"></canvas>
  
  <script type="text/javascript">
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    // show Emscripten environment where the canvas is
    // arguments are passed to PICO-8
  
    var Module = {
      arguments: ["-width","580","-height","540"],
    };
    Module.canvas = canvas;
  
    /*
      // When pico8_buttons is defined, PICO-8 takes each int to be a live bitfield
      // representing the state of each player's buttons
  
      var pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0]; // max 8 players
      pico8_buttons[0] = 2 | 16; // example: player 0, RIGHT and Z held down
    */
  </script>
  
  <script async type="text/javascript" src="bouncing-plane.js"></script>
  
  <script>
    // key blocker. prevent cursor keys from scrolling page while playing cart.
  
    function onKeyDown_blocker(event) {
      event = event || window.event;
      var o = document.activeElement;
      if (!o || o == document.body || o.tagName == "canvas")
      {
        if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1)
        {
          if (event.preventDefault) event.preventDefault();
        }
      }
    }
  
    document.addEventListener('keydown', onKeyDown_blocker, false);
  
  </script>
  
  
<iframe frameborder="0" src="https://itch.io/embed/64388" width="552" height="167"><a href="https://revolugame.itch.io/bouncing-plane">Bouncing Plane by RevoluGame</a></iframe>