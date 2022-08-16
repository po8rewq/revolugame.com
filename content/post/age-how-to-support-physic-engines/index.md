---
title: "AGE - How to support physic engines"
date: 2012-11-17
tags:
- AGE
- Haxe
- NME
aliases: ["/age-how-to-support-physic-engines/"]
---

In the previous post, we have seen how to use <a href="/age-box2d-support/" title="AGE – Box2D support">the Box2D support</a> into the <strong>AGE engine</strong>. Now I just want to show you how simple it is to add a new framework/engine support.

For example, we are going to add the <a href="https://github.com/deltaluca/nape/">Nape</a> support.

For those of you who don't know, <strong>Nape</strong> is a <strong>Haxe/AS3</strong> physics engine. Since <strong>Nape</strong> is really close to <strong>Box2D</strong>, it will be simple to understand how <strong>box2d</strong> has been added to <strong>AGE</strong>.

<h2>The behavior</h2>

Since <strong>AGE</strong> is based on a <strong>behaviors system</strong>, we are just going to create a new behavior, that we will call <strong>NapeMovementBehavior</strong> :

{{< highlight haxe >}}
class NapeMovementBehavior implements IBehavior
{
    private var _entity : BasicEntity;
    public var enabled(default, null) : Bool;

    public function update():Void {}
    
    public function enable()
    {
	enabled = true;
    }
    
    public function disable()
    {
	enabled = false;
    }

    public function destroy():Void {}
}
{{< /highlight >}}

Now we are going to <strong>initialize</strong> the data needed by <strong>Nape</strong> for the behavior's entity :

{{< highlight Haxe >}}
private var _body : Body;
public static var world : Space;
public function new(pEntity: BasicEntity, pDynamic:Bool)
{
    if(world == null)
        world = new Space( new Vec2(0, 500) );

    _body = new Body( (pDynamic ? BodyType.DYNAMIC : BodyType.STATIC), 
                       new Vec2(pEntity.x + pEntity.halfWidth, pEntity.y + pEntity.halfHeight)
                   );
	    
    var block:Polygon = new Polygon(Polygon.box(pEntity.width,pEntity.height));
	    
    _body.shapes.add(block);
    _body.align();
				
    _body.space = world;
	
    _entity = pEntity;
}
{{< /highlight >}}

If you need more information on how <strong>Nape</strong> is working, go check the <a href="http://deltaluca.me.uk/docnew/">documentation</a>.
So for now, we have a basic entity initialized for working into Nape.

We have to <strong>update</strong> the <strong>entity position</strong> into the game based on the Nape's one :

{{< highlight Haxe >}}
public function update():Void
{
    #if cpp
    _entity.x = _body.position.x;
    _entity.y = _body.position.y;
    #else
    _entity.x = _body.position.x - _entity.halfWidth;
    _entity.y = _body.position.y - _entity.halfHeight;
    #end
        
    _entity.rotation = _body.rotation * 57.2957795;
}
{{< /highlight >}}

There is some differences between c++ and flash: with the flash renderer, we must have the center point at the top left position (for now).

Now the destroy function (called after the behavior has been removed) :

{{< highlight Haxe >}}
public function destroy():Void
{
    world.bodies.remove(_body);
}
{{< /highlight >}}

If you have noticed, the <strong>world</strong> variable is <strong>static</strong>, because we have to update it on each frame. So to keep the behaviors system intact, we are going to use the <strong>BehaviorsManager</strong> :

{{< highlight Haxe >}}
public function new(pEntity: BasicEntity, pDynamic:Bool)
{
    if(world == null)
    {    
	world = new Space( new Vec2(0, 500) );        
        BehaviorsManager.getInstance().registerUpdater(globalUpdate);
    }
    // [...]
}{{< /highlight >}}

Now the <strong>globalUpdate()</strong> function is going to be called on each frame :

{{< highlight Haxe >}}
public function globalUpdate():Void
{
    world.step(1/30, 10, 10);
}
{{< /highlight >}}

<h2>How to use it ?</h2>

Now to use this behavior with an entity, just add the <strong>NapeMovementBehavior</strong> to the behaviors list :

{{< highlight Haxe >}}
var e : BasicEntity = new BasicEntity(0, 0);
e.makeGraphic(32, 32, 0xFFFF0000); // create a rectangle
e.addBehavior( new NapeMovementBehavior(e, true) ); // add the behavior
add(e); // add the entity to the game
{{< /highlight >}}

Here is a quick demo (drag the blocks) :

<object width="370" height="290" data="NapeDemo.swf"></object>

You can see the <strong>NapeMovementBehavior</strong> class <a href="https://github.com/po8rewq/AGE/blob/master/src/com/revolugame/age/behaviors/NapeMovementBehavior.hx" title="NapeMovementBehavior.hx">here</a> and the <strong>NapeEntity</strong> class <a href="https://github.com/po8rewq/AGE/blob/master/src/com/revolugame/age/display/NapeEntity.hx" title="NapeEntity.hx">here</a>.