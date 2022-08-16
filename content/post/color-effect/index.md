---
title: "How to change colors with a smoothly effect"
tags:
- Haxe
- tutorial
date: 2014-12-13
aliases: ["/2014/12/13/color-effect.html"]
---

For the last Ludum Dare, I wanted to have a nice effect on the background of my puzzle game in order to change the color based on the action on the board.

My game is in JavaScript, but except the background property, it should work on other platform too.

## So, what do we need ?

First we have to get the initial color (<strong>color1</strong>) and the new one (<strong>color2</strong>).
In order to change the color smoothly, we will do it with a <strong>Timer</strong> object.

{{< highlight haxe >}}
// définition de la classe	
function changeColor(
  pElem: js.html.Element, 
  pInitialColor: RGB, 
  pEndColor: RGB
){}
{{< /highlight >}}

Here is the RGB typedef:

{{< highlight haxe >}}
typedef RGB = {
  var r : Int;
  var g : Int;
  var b : Int;
}
{{< /highlight >}}

The first step is the calculate the <i>distance</i> between those two colors (all methods are based on the RGB type):

{{< highlight haxe >}}
var distance = {
  r: Math.round(Math.abs(color1.r - color2.r)),
  g: Math.round(Math.abs(color1.g - color2.g)),
  b: Math.round(Math.abs(color1.b - color2.b))
}
{{< /highlight >}}

Now that we have the difference, we have to calculate the value that will determine how the color will change between each step:

{{< highlight haxe >}}
var incR = Std.int( Math.abs( Math.floor(distance.r / INCREMENT_VALUE) ) );
var incG = Std.int( Math.abs( Math.floor(distance.g / INCREMENT_VALUE) ) );
var incB = Std.int( Math.abs( Math.floor(distance.b / INCREMENT_VALUE) ) );

var increment = {
  r: incR == 0 ? 1 : incR,
  g: incG == 0 ? 1 : incG,
  b: incB == 0 ? 1 : incB
};
{{< /highlight >}}

The <strong>INCREMENT_VALUE</strong> value allows use to determine how we want the effect to change. The higher the value is, the quicker the effect will be.

I've set it to 100.

Now we have to calculate the new color :

{{< highlight haxe >}}
if (color1.r > color2.r) 
{
  color1.r -= increment.r;
  if (color1.r <= color2.r) // if we've reach the right color
    increment.r = 0;		
} 
else 
{
  color1.r += increment.r;
  if (color1.r >= color2.r) // if we've reach the right color
    increment.r = 0;
}
{{< /highlight >}}

And same thing for each tone.

I'll now add this step to the <strong>Timer</strong> object.

I'm using the Timer class in order to have a <strong>cross platform</strong> method. But you can use any kind of listener or Signal.

{{< highlight haxe >}}
var timer = new haxe.Timer(Math.round(1000 / (INCREMENT_VALUE/2)))
timer.run = function()
{
  // [...] 
}
{{< /highlight >}}

In this loop, you'll have to change the property of your object.

For example in JavaScript you'll have :

{{< highlight haxe >}}
pElem.style.background = rgb2hex(currentColor);
{{< /highlight >}}

Where <strong>rgb2hex</strong> transform the RGB object in hexa :

{{< highlight haxe >}}
private static function rgb2hex(color: RGB): String
{
  return "#" + 
    StringTools.hex(color.r, 2) + 
    StringTools.hex(color.g, 2) + 
    StringTools.hex(color.b, 2);
}
{{< /highlight >}}

## Here is an example :

<div class="row" id="color-example" style="background-color: #C1C1C1; height: 100px;"></div>
<script src="color-changer.js"></script>