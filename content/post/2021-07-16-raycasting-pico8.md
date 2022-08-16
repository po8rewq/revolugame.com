+++
title = "Raycasting with Pico-8"
date = "2021-07-16"
tags = [
    "Pico-8",
]
draft = true
+++

Back to dev games after a long break - just wanted to mess up and understand how ray casting works. So lets use PICO-8 for this.

## What is that all about?

The aim is to draw a "3D view" of a 2D map from the PICO-8 map editor.

## How does that work?

In order to simplify it, I've decided to do it in 2 steps:

- draw the 2d map and player
- draw the 3d map

In order for it to work in 3D, we need free movement from the player, meaning the player as a direction and you change it by going left/right:
