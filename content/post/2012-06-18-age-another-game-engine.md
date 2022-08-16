---
title: "AGE : Another Game Engine"
date: 2012-06-18
tags:
- AGE
- Haxe
- NME
aliases: ["/age-another-game-engine/"]
---
I've tried a lot of game engines since I've started making games. And I've never been completely happy with them... so I have decided to develop and share my new **Haxe/NME game engine**.

## Why another engine ? ##

For the past two years I have built game engines, first for **AS3**, then for **Haxe** just to learn how it works. I have made games with <a href="http://flixel.org">Flixel</a>, <a href="http://flashpunk.net">Flashpunk</a> (for the most known), but each time there is something I am not confortable with (how collisions are handled in Flixel for example). So as they say, if you want something done, it's better to do it yourself: that's why I decided to create my own game engine, in order to use a tool that's best suited for me. Despite the specificities I wanted to add, I tried to keep it as simple and as generic as possible.

## Basic concepts : the behaviors ##

Ever since I discovered this **behaviors** concept, it seems that I can't do without it!

But what is this ? It's a small concept, but it's so simple that I don't understand why no other game engines (that I am aware of) use it.

For example, you can have a default jump behavior, and if the player catches a power up, you can enable the jet pack behavior :

{{< highlight Haxe >}}
class Player extends Entity
{
    private var _jumpBehavior : JumpBehavior;
    private var _jetpackBehavior : JetPackBehavior;

    public function new()
    {
        super(0, 0);
        
        _jumpBehavior = new JumpBehavior(this);
        addBehavior(_jumpBehavior);
        
        _jetpackBehavior = new JetPackBehavior(this);
        addBehavior(_jetpackBehavior, false);
    }

    public override function update()
    {
        super.update();
        if( powerup )
        {
            _jumpBehavior.disable();
            _jetpackBehavior.enable();
        }
    }
}
{{< /highlight >}}

And all the player needs to do is in the **update()** function of the **Behavior Class**.
So simple, and you can add it to any entity you like.

By default, there is two behaviors : **Collisions** and **Movements**.
You can decide not to use them. But if you want collisions and movement, just activate them:

{{< highlight Haxe >}}
solid = true;
movable = true;
{{< /highlight >}}

Follow the work on <a href="https://github.com/po8rewq/AGE">github</a>.
