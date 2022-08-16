---
title: Haxe React - tic tac toe example
date: 2017-02-06
tags:
- Haxe
aliases: ["/2017/02/06/haxe-react-tictactoe-example.html"]
---

I've ported the tic-tac-toe example from the [react-js documentation](https://facebook.github.io/react/tutorial/tutorial.html#getting-started) to haxe.
You can find it [here](https://github.com/po8rewq/haxe-react-tictactoe).

### What is different:

I've changed the event handling in order to use [msignal](https://github.com/massiveinteractive/msignal) instead of passing a function down to the right component.

I've created an *History*/*HistoryItem* component to get a cleaner code.

To test it, just checkout the repo, install the dependancies:

 * haxelib install [react](https://github.com/massiveinteractive/haxe-react)
 * haxelib install [msignal](https://github.com/massiveinteractive/msignal)

And build the app.
