---
title: "AGE - Box2D support"
date: 2012-11-10
tags:
- AGE
- Haxe
- NME
aliases: ["/age-box2d-support/"]
---

Since <a href="http://box2d.org/">Box2D</a> is one of the most used <strong>physics engine</strong>, I've started to implement it into the AGE game engine. 

I've used the box2d version from <a href="http://lib.haxe.org/p/box2d">haxelib</a>, so don't forget to add the following to your nmml file :

{{< highlight Xml >}}
<haxelib name="box2d" />
{{< /highlight >}}

I've implemented it with the <strong>behaviors system</strong>. So now we have a <strong>Box2dEntity</strong> that has a special Behavior (Box2dMovementBehavior) which initialize and update all the Box2D stuff.

For example, to define an entity :

{{< highlight Haxe >}}
import com.revolugame.age.display.Box2dEntity;

class Block extends Box2dEntity
{
    public function new (pX: Int, pY: Int)
    {
        super(pX, pY);
        makeGraphic(32, 32, 0xFF000000);
        initBox2dStuff(30, true, 0, 0, 0);
//                                     ^ friction
//                                  ^ restitution
//                               ^ density
//                          ^ if the entity is dynamic
//                     ^ conversion meters to pixels
    }
}
{{< /highlight >}}

{{< highlight Haxe >}}
add(new Block(10, 50));
{{< /highlight >}}

And that's it !

The <strong>Box2D</strong> support works with <strong>Flash</strong> and <strong>C++</strong> but needs some optimization for now.

Here is a quick example (click on the blocks to remove them) :

<object width="180" height="170" data="AgeBlocks.swf"></object>

You can also apply a <strong>force</strong> or an <strong>impulse</strong> on your entity :

{{< highlight Haxe >}}
_b2dBehavior.applyImpulse(1, 2); // x, y
_b2dBehavior.applyForce(1, 2); // x, y
{{< /highlight >}}

Another example (click on the oranges to apply a random impulse) :

<object width="300" height="200" data="AgeBox2dOrange.swf"></object>

For more information on <strong>Box2D</strong>, check out <a href="http://www.box2dflash.org/docs/2.0.2/manual">the flash documentation</a>.
