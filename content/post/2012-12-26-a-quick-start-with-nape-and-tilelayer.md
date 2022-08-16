---
title: "A quick start with nape and tilelayer"
date: 2012-12-26
tags:
- Haxe
- nape
- NME
aliases: ["/a-quick-start-with-nape-and-tilelayer/"]
---

Recently, I started a mobile game with <strong>NME</strong>, and I wanted to give a try to <a href="http://napephys.com">nape</a>. Since I've seen the <a href="https://github.com/elsassph/nme-runnermark">NME's runnermark</a>, I've wanted to try the <a href="https://github.com/elsassph/nme-tilelayer">tilelayer</a> library too. So why not dot it at the same time !

## Overall view

### Nape

This month was annonced the <strong>2.0 version of nape</strong>. Nape is an <strong>open-source Haxe/AS3 physics engine</strong> that lets you do <strong>cross platform</strong> applications. It's fast and powerful (actually I prefer <strong>nape</strong> over <strong>box2d</strong>, it's much easier to use, and really fast). See by yourself : <a href="http://napephys.com/samples.html">http://napephys.com/samples.html</a>.

Just download it through <a href="http://lib.haxe.org/p/nape">haxelib</a> :

{{< highlight Bash shell scripts >}}
haxelib install nape
{{< /highlight >}}

<h3>Tilelayer</h3>

To quote the github description :

> A lightweight and very optimized wrapper over NME's powerful but lowlevel 'drawTiles' which offers the best rendering performance (ie. batching) on native platforms.

To install the <a href="http://lib.haxe.org/p/tilelayer">haxelib</a> version :

{{< highlight Bash shell scripts >}}
haxelib install tilelayer
{{< /highlight >}}

## Simple implementation

So now to use these two great libraries :

{{< highlight Haxe >}}
import nape.phys.Body;
import aze.display.TileSprite;

class Entity
{
    // The tilelayer's sprite
    public var sprite(default, null): TileSprite;
    // The nape's body
    public var body(default, null) : Body;

    public function new(){}
	
    /**
     * Update the positions and the rotation
     **/
    public function update()
    {
        if(sprite != null && body != null)
        {
            sprite.x = body.position.x;
            sprite.y = body.position.y;
            sprite.rotation = body.rotation;
        }
    }
}
{{< /highlight >}}

All the entities will have to be updated on <strong>each frame</strong>, as well as the nape's space and the layer :

{{< highlight Haxe >}}
class Main 
{
    var _space : Space;
    var _layer : TileLayer;
    var _entities : List<Entity>;

    public function new() 
    {
        var tilesheet = new SparrowTilesheet(
            Assets.getBitmapData("assets/spritesheet.png"), 
            Assets.getText("assets/spritesheet.xml")
        );
        _layer = new TileLayer(tilesheet);
        addChild(_layer.view);

        _space = new Space( new Vec2(0, 600));
    }

    public function update()
    {
        _space.step(1/60);
        for(entity in _entities)
            entity.update();
        _layer.render();
    }
}
{{< /highlight >}}

Now to define a simple rectangular entity :

{{< highlight Haxe >}}
class Box extends Entity
{
    public function new(pSpace: Space)
    {
        super();

        // Nape's data
        body = new Body(BodyType.DYNAMIC);
        body.shapes.add(new Polygon(Polygon.box(50, 50)));
        body.position.setxy(10, 10);
        body.space = pSpace;
        
        sprite = new TileSprite('box');
    }
}
{{< /highlight >}}

And simply add it to the stage :

{{< highlight Haxe >}}
var box = new Box(_space);
_entities.add(box);
_layer.addChild( box.sprite );
{{< /highlight >}}