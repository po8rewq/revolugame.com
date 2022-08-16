(function () {
  'use strict';
  function $extend(from, fields) {
    function Inherit() {}
    Inherit.prototype = from;
    var proto = new Inherit();
    for (var name in fields) proto[name] = fields[name];
    if (fields.toString !== Object.prototype.toString)
      proto.toString = fields.toString;
    return proto;
  }
  var Data = function () {};
  Data.__name__ = true;
  Data.init = function () {
    Data.levels = [
      {
        thumbnail: 'thumbnail1',
        title: 'First level',
        map: 'map1',
        waves: 'waves1',
      },
    ];
    Data.weapons = [
      new weapons.Revolver(),
      new weapons.Shotgun(),
      new weapons.Magnum(),
      new weapons.MachineGun(),
      new weapons.DoubleGun(),
    ];
    Data.DEFAULT_WEAPON = Data.weapons[0];
  };
  var HxOverrides = function () {};
  HxOverrides.__name__ = true;
  HxOverrides.substr = function (s, pos, len) {
    if (pos != null && pos != 0 && len != null && len < 0) return '';
    if (len == null) len = s.length;
    if (pos < 0) {
      pos = s.length + pos;
      if (pos < 0) pos = 0;
    } else if (len < 0) len = s.length + len - pos;
    return s.substr(pos, len);
  };
  HxOverrides.indexOf = function (a, obj, i) {
    var len = a.length;
    if (i < 0) {
      i += len;
      if (i < 0) i = 0;
    }
    while (i < len) {
      if (a[i] === obj) return i;
      i++;
    }
    return -1;
  };
  HxOverrides.remove = function (a, obj) {
    var i = HxOverrides.indexOf(a, obj, 0);
    if (i == -1) return false;
    a.splice(i, 1);
    return true;
  };
  HxOverrides.iter = function (a) {
    return {
      cur: 0,
      arr: a,
      hasNext: function () {
        return this.cur < this.arr.length;
      },
      next: function () {
        return this.arr[this.cur++];
      },
    };
  };
  var List = function () {
    this.length = 0;
  };
  List.__name__ = true;
  List.prototype = {
    add: function (item) {
      var x = [item];
      if (this.h == null) this.h = x;
      else this.q[1] = x;
      this.q = x;
      this.length++;
    },
    remove: function (v) {
      var prev = null;
      var l = this.h;
      while (l != null) {
        if (l[0] == v) {
          if (prev == null) this.h = l[1];
          else prev[1] = l[1];
          if (this.q == l) this.q = prev;
          this.length--;
          return true;
        }
        prev = l;
        l = l[1];
      }
      return false;
    },
    iterator: function () {
      return {
        h: this.h,
        hasNext: function () {
          return this.h != null;
        },
        next: function () {
          if (this.h == null) return null;
          var x = this.h[0];
          this.h = this.h[1];
          return x;
        },
      };
    },
  };
  var age = {};
  age.core = {};
  age.core.Engine = function (
    pWidth,
    pHeight,
    pFirstState,
    pKeepRatio,
    pFps,
    pBgColor,
    pDivContainer
  ) {
    if (pDivContainer == null) pDivContainer = '';
    if (pBgColor == null) pBgColor = '';
    if (pFps == null) pFps = 30;
    if (pKeepRatio == null) pKeepRatio = true;
    age.core.Global.engine = this;
    this._backgroundColor = pBgColor;
    this.stageWidth = pWidth;
    this.stageHeight = pHeight;
    this._fps = pFps;
    this._last = haxe.Timer.stamp() * 1000;
    this._delta = 0;
    this._stepRate = 1000 / this._fps;
    var doc = window.document;
    var container = null;
    this._canvas = doc.createElement('Canvas');
    this._context = this._canvas.getContext('2d');
    if (pDivContainer != '') container = doc.getElementById(pDivContainer);
    else container = doc.body;
    container.appendChild(this._canvas);
    this._offScreenCanvas = doc.createElement('Canvas');
    this._offScreenContext = this._offScreenCanvas.getContext('2d');
    this._canvas.width = this._offScreenCanvas.width = pWidth;
    this._canvas.height = this._offScreenCanvas.height = pHeight;
    if (pKeepRatio)
      this._canvas.style.imageRendering = '-webkit-optimize-contrast';
    new age.core.Input(this._canvas);
    this.switchState(pFirstState);
    var requestAnimFrame = age.utils.HtmlUtils.loadExtension(
      'requestAnimationFrame'
    );
    if (requestAnimFrame != null) {
      this._animFunction = requestAnimFrame.value;
      this.mainLoop();
    } else {
      console.log(
        'No requestAnimationFrame support, falling back to setInterval'
      );
      var frequency = this._stepRate | 0;
      this._globalTimer = new haxe.Timer(frequency);
      this._globalTimer.run = $bind(this, this.mainLoop);
    }
    this.mainLoop();
    window.onresize = $bind(this, this.onResizeEvent);
    this.onResizeEvent(null);
  };
  age.core.Engine.__name__ = true;
  age.core.Engine.prototype = {
    onResizeEvent: function (pEvt) {
      var scaleX = 1;
      var scaleY = 1;
      var scale = Math.min(scaleX, scaleY);
      var stgWidth = this.stageWidth * scale;
      var stgHeight = this.stageHeight * scale;
      this._canvas.style.width =
        (stgWidth == null ? 'null' : '' + stgWidth) + 'px';
      this._canvas.style.height =
        (stgHeight == null ? 'null' : '' + stgHeight) + 'px';
      this.stageScaleX = 1;
      this.stageScaleY = 1;
    },
    switchState: function (pState) {
      if (age.core.Global.currentState != null)
        age.core.Global.currentState.destroy();
      pState.create();
      age.core.Global.currentState = pState;
    },
    mainLoop: function () {
      var state = age.core.Global.currentState;
      var now = haxe.Timer.stamp() * 1000;
      age.core.Global.elapsed = (now - this._last) / 1000;
      this._delta += now - this._last;
      this._last = now;
      if (this._delta >= this._stepRate) {
        if (this._delta > 50) this._delta = this._stepRate;
        while (this._delta >= this._stepRate) {
          this._delta -= this._stepRate;
          state.update();
          if (this._backgroundColor != '') {
            this._offScreenContext.fillStyle = this._backgroundColor;
            this._offScreenContext.fillRect(
              0,
              0,
              this.stageWidth,
              this.stageHeight
            );
          } else
            this._offScreenContext.clearRect(
              0,
              0,
              this.stageWidth,
              this.stageHeight
            );
          age.core.Global.currentState.render(this._offScreenContext);
          this._context.clearRect(0, 0, this.stageWidth, this.stageHeight);
          this._context.drawImage(this._offScreenCanvas, 0, 0);
        }
      }
      age.core.Input.update();
      if (this._animFunction != null)
        Reflect.callMethod(window, this._animFunction, [
          $bind(this, this.mainLoop),
        ]);
    },
  };
  var Main = function () {
    age.core.Engine.call(
      this,
      800,
      600,
      new states.IntroState(),
      true,
      60,
      '#D0F4F7',
      'ArenaInvasion'
    );
    Data.init();
  };
  Main.__name__ = true;
  Main.main = function () {
    age.Loader.addResource('bullet.png', age.ResourceType.IMAGE, 'bullet');
    age.Loader.addResource('box.png', age.ResourceType.IMAGE, 'weaponBox');
    age.Loader.addResource(
      'boxCoinAlt.png',
      age.ResourceType.IMAGE,
      'pointsBox'
    );
    age.Loader.addResource(
      'boxExplosive.png',
      age.ResourceType.IMAGE,
      'explosiveBox'
    );
    age.Loader.addResource(
      'animPlayer1.png',
      age.ResourceType.IMAGE,
      'player1'
    );
    age.Loader.addResource(
      'animPlayer2.png',
      age.ResourceType.IMAGE,
      'player2'
    );
    age.Loader.addResource('p3_front30.png', age.ResourceType.IMAGE, 'player3');
    age.Loader.addResource('p1_front30.png', age.ResourceType.IMAGE, 'player4');
    age.Loader.addResource('min_p1.png', age.ResourceType.IMAGE, 'minPlayer1');
    age.Loader.addResource('min_p2.png', age.ResourceType.IMAGE, 'minPlayer2');
    age.Loader.addResource('min_p3.png', age.ResourceType.IMAGE, 'minPlayer3');
    age.Loader.addResource('min_p1.png', age.ResourceType.IMAGE, 'minPlayer4');
    age.Loader.addResource('hud_p1.png', age.ResourceType.IMAGE, 'hudPlayer1');
    age.Loader.addResource('hud_p2.png', age.ResourceType.IMAGE, 'hudPlayer2');
    age.Loader.addResource('hud_p3.png', age.ResourceType.IMAGE, 'hudPlayer3');
    age.Loader.addResource('hud_p1.png', age.ResourceType.IMAGE, 'hudPlayer4');
    age.Loader.addResource('animMob1.png', age.ResourceType.IMAGE, 'animMob1');
    age.Loader.addResource(
      'tmpMob1Hit.png',
      age.ResourceType.IMAGE,
      'animMob1Hit'
    );
    age.Loader.addResource('tmpMob2.png', age.ResourceType.IMAGE, 'animMob2');
    age.Loader.addResource(
      'tmpMob2Hit.png',
      age.ResourceType.IMAGE,
      'animMob2Hit'
    );
    age.Loader.addResource(
      'playerSelection.png',
      age.ResourceType.IMAGE,
      'playerSelection'
    );
    age.Loader.addResource('keyboard.png', age.ResourceType.IMAGE, 'keyboard');
    age.Loader.addResource('xbox.png', age.ResourceType.IMAGE, 'xbox');
    age.Loader.addResource('ps3.png', age.ResourceType.IMAGE, 'ps3');
    age.Loader.addResource(
      'genericGamepad.png',
      age.ResourceType.IMAGE,
      'genericGamepad'
    );
    age.Loader.addResource(
      'questionmark.png',
      age.ResourceType.IMAGE,
      'questionmark'
    );
    age.Loader.addResource(
      'maps/map1.png',
      age.ResourceType.IMAGE,
      'thumbnail1'
    );
    age.Loader.addResource(
      'maps/wavesMap1.json',
      age.ResourceType.TEXT,
      'waves1'
    );
    age.Loader.addResource(
      'maps/map1_25x25.json',
      age.ResourceType.TEXT,
      'map1'
    );
    age.Loader.addResource(
      'maps/map2.png',
      age.ResourceType.IMAGE,
      'thumbnail2'
    );
    age.Loader.addResource('maps/map2.json', age.ResourceType.TEXT, 'map2');
    age.Loader.start(function () {
      new Main();
    });
  };
  Main.__super__ = age.core.Engine;
  Main.prototype = $extend(age.core.Engine.prototype, {});
  var IMap = function () {};
  IMap.__name__ = true;
  Math.__name__ = true;
  var Reflect = function () {};
  Reflect.__name__ = true;
  Reflect.field = function (o, field) {
    try {
      return o[field];
    } catch (e) {
      return null;
    }
  };
  Reflect.callMethod = function (o, func, args) {
    return func.apply(o, args);
  };
  var Std = function () {};
  Std.__name__ = true;
  Std.string = function (s) {
    return js.Boot.__string_rec(s, '');
  };
  age.core.IEntity = function () {};
  age.core.IEntity.__name__ = true;
  age.display = {};
  age.display.EntityContainer = function () {
    this._entities = new Array();
    this.visible = true;
    this.x = this.y = this.width = this.height = this.depth = 0;
  };
  age.display.EntityContainer.__name__ = true;
  age.display.EntityContainer.__interfaces__ = [age.core.IEntity];
  age.display.EntityContainer.prototype = {
    update: function () {
      var _g = 0;
      var _g1 = this._entities;
      while (_g < _g1.length) {
        var en = _g1[_g];
        ++_g;
        en.update();
      }
    },
    add: function (pEntity) {
      this._entities.push(pEntity);
    },
    remove: function (pEntity) {
      if (pEntity != null) {
        HxOverrides.remove(this._entities, pEntity);
        pEntity.destroy();
      }
    },
    render: function (pContext) {
      var _g = 0;
      var _g1 = this._entities;
      while (_g < _g1.length) {
        var en = _g1[_g];
        ++_g;
        if (en.visible) en.render(pContext);
      }
    },
    destroy: function () {
      var _g = 0;
      var _g1 = this._entities;
      while (_g < _g1.length) {
        var en = _g1[_g];
        ++_g;
        en.destroy();
      }
      this._entities = new Array();
    },
    numChildren: function () {
      return this._entities.length;
    },
  };
  var TiledMap = function (pFile, pWaves, pCellSize) {
    if (pCellSize == null) pCellSize = 0;
    age.display.EntityContainer.call(this);
    var json = JSON.parse(age.Assets.getText(pFile));
    this._mapWidth = Reflect.field(json, 'width');
    this._mapHeight = Reflect.field(json, 'height');
    if (pCellSize > 0) this._tileSize = pCellSize;
    else this._tileSize = Reflect.field(json, 'tilewidth');
    this._mapData = Reflect.field(json, 'layers')[0].data;
    var _g1 = 0;
    var _g = this._mapHeight;
    while (_g1 < _g) {
      var y = _g1++;
      var _g3 = 0;
      var _g2 = this._mapWidth;
      while (_g3 < _g2) {
        var x = _g3++;
        var cell = this._mapData[x + y * this._mapWidth];
        if (cell > 0)
          this.add(
            new entities.Tile(x * this._tileSize, y * this._tileSize, cell)
          );
      }
    }
    this.boxesSpots = new Array();
    this.mobsSpots = new Array();
    var spawnData = Reflect.field(json, 'layers')[1].objects;
    var _g4 = 0;
    while (_g4 < spawnData.length) {
      var spawn = spawnData[_g4];
      ++_g4;
      if (spawn.name == 'box')
        this.boxesSpots.push({
          x: Math.round((spawn.x / 70) * pCellSize),
          y: Math.round((spawn.y / 70) * pCellSize),
        });
      else if (spawn.name == 'monsters')
        this.mobsSpots.push({
          x: Math.round((spawn.x / 70) * pCellSize),
          y: Math.round((spawn.y / 70) * pCellSize),
        });
      else if (spawn.name == 'player1')
        this.player1 = {
          x: Math.round((spawn.x / 70) * pCellSize),
          y: Math.round((spawn.y / 70) * pCellSize),
        };
      else if (spawn.name == 'player2')
        this.player2 = {
          x: Math.round((spawn.x / 70) * pCellSize),
          y: Math.round((spawn.y / 70) * pCellSize),
        };
      else if (spawn.name == 'player3')
        this.player3 = {
          x: Math.round((spawn.x / 70) * pCellSize),
          y: Math.round((spawn.y / 70) * pCellSize),
        };
      else if (spawn.name == 'player4')
        this.player4 = {
          x: Math.round((spawn.x / 70) * pCellSize),
          y: Math.round((spawn.y / 70) * pCellSize),
        };
    }
    var jsonWaves = JSON.parse(age.Assets.getText(pWaves));
    this.timelapsWave = Reflect.field(jsonWaves, 'timelaps');
    this._currentWave = 0;
    this._waves = new Array();
    var waves = Reflect.field(jsonWaves, 'waves');
    var _g5 = 0;
    while (_g5 < waves.length) {
      var wave = waves[_g5];
      ++_g5;
      this._waves.push(Reflect.field(wave, 'monsters'));
    }
  };
  TiledMap.__name__ = true;
  TiledMap.__super__ = age.display.EntityContainer;
  TiledMap.prototype = $extend(age.display.EntityContainer.prototype, {
    registerCollisions: function (pEntity) {
      pEntity.addBehavior(
        'collisions',
        new behaviors.MapCollisions(
          pEntity,
          this._mapData,
          this._mapWidth,
          this._tileSize
        )
      );
    },
    getData: function () {
      return this._mapData;
    },
    nextWave: function () {
      if (this._currentWave >= this._waves.length) this._currentWave = 0;
      return this._waves[this._currentWave++];
    },
  });
  age.Assets = function () {};
  age.Assets.__name__ = true;
  age.Assets.getImage = function (pName) {
    var image;
    if (age.Assets._cacheImg.exists(pName))
      image = age.Assets._cacheImg.get(pName);
    else {
      image = new Image();
      image.style.position = 'absolute';
      image.src = pName;
      age.Assets._cacheImg.set(pName, image);
    }
    return image;
  };
  age.Assets.setImage = function (pName, pImage) {
    age.Assets._cacheImg.set(pName, pImage);
  };
  age.Assets.getSound = function (pName) {
    if (age.Assets._cacheSounds.exists(pName))
      return age.Assets._cacheSounds.get(pName);
    throw 'Error sound not loaded';
  };
  age.Assets.setSound = function (pName, pAudio) {
    age.Assets._cacheSounds.set(pName, pAudio);
  };
  age.Assets.getText = function (pName) {
    if (age.Assets._cacheText.exists(pName))
      return age.Assets._cacheText.get(pName);
    throw 'Error text not loaded';
  };
  age.Assets.setText = function (pName, pText) {
    age.Assets._cacheText.set(pName, pText);
  };
  age.Loader = function () {};
  age.Loader.__name__ = true;
  age.Loader.addResource = function (pSrc, pType, pName) {
    if (pName == null) pName = '';
    switch (pType[1]) {
      case 0:
        age.Loader._dataToLoad.add({
          type: age.ResourceType.IMAGE,
          src: pSrc,
          name: pName != '' ? pName : pSrc,
        });
        break;
      case 1:
        age.Loader._dataToLoad.add({
          type: age.ResourceType.TEXT,
          src: pSrc,
          name: pName != '' ? pName : pSrc,
        });
        break;
      case 2:
        age.Loader._dataToLoad.add({
          type: age.ResourceType.SOUND,
          src: pSrc,
          name: pName != '' ? pName : pSrc,
        });
        break;
    }
  };
  age.Loader.removeResource = function (pName) {
    var $it0 = age.Loader._dataToLoad.iterator();
    while ($it0.hasNext()) {
      var r = $it0.next();
      if (r.name == pName) {
        age.Loader._dataToLoad.remove(r);
        return;
      }
    }
  };
  age.Loader.onResourceError = function (pName) {
    age.Loader.removeResource(pName);
    age.Loader.ERROR++;
    age.Loader.allComplete();
  };
  age.Loader.onResourceLoaded = function (pName) {
    age.Loader.LOADED++;
    age.Loader.removeResource(pName);
    age.Loader.allComplete();
  };
  age.Loader.start = function (pCallback) {
    if (age.Loader._dataToLoad.length == 0) pCallback();
    else {
      age.Loader._endCallback = pCallback;
      age.Loader._totalToLoad = age.Loader._dataToLoad.length;
      var $it0 = age.Loader._dataToLoad.iterator();
      while ($it0.hasNext()) {
        var data = $it0.next();
        var _g = data.type;
        switch (_g[1]) {
          case 0:
            age.Loader.loadImage(data.name, data.src);
            break;
          case 1:
            age.Loader.loadText(data.name, data.src);
            break;
          case 2:
            age.Loader.loadSound(data.name, data.src);
            break;
        }
      }
    }
  };
  age.Loader.loadImage = function (pName, pSrc) {
    var image = new Image();
    image.style.position = 'absolute';
    image.onload = function (pEvt) {
      age.Assets.setImage(pName, pEvt.currentTarget);
      age.Loader.onResourceLoaded(pName);
    };
    image.onerror = function (pEvt1) {
      console.log('Error: ' + Std.string(pEvt1.currentTarget));
      age.Loader.onResourceError(pName);
    };
    image.src = pSrc;
  };
  age.Loader.loadText = function (pName, pSrc) {
    var r = new XMLHttpRequest();
    r.open('GET', pSrc, true);
    r.onerror = function (pEvt) {
      console.log('Error while loading ' + pName);
      age.Loader.onResourceError(pName);
    };
    r.onload = function (pEvt1) {
      age.Assets.setText(pName, r.responseText);
      age.Loader.onResourceLoaded(pName);
    };
    r.send();
  };
  age.Loader.loadSound = function (pName, pSrc) {
    var r = new XMLHttpRequest();
    r.open('GET', pSrc, true);
    r.responseType = 'arraybuffer';
    r.onerror = function (pEvt) {
      console.log('Error while loading ' + pName);
      age.Loader.onResourceError(pName);
    };
    r.onload = function (pEvt1) {
      age.Assets.setSound(pName, r.response);
      age.Loader.onResourceLoaded(pName);
    };
    r.send();
  };
  age.Loader.allComplete = function () {
    if (age.Loader._totalToLoad <= age.Loader.LOADED + age.Loader.ERROR)
      age.Loader._endCallback();
  };
  age.ResourceType = {
    __ename__: true,
    __constructs__: ['IMAGE', 'TEXT', 'SOUND'],
  };
  age.ResourceType.IMAGE = ['IMAGE', 0];
  age.ResourceType.IMAGE.__enum__ = age.ResourceType;
  age.ResourceType.TEXT = ['TEXT', 1];
  age.ResourceType.TEXT.__enum__ = age.ResourceType;
  age.ResourceType.SOUND = ['SOUND', 2];
  age.ResourceType.SOUND.__enum__ = age.ResourceType;
  age.core.Global = function () {};
  age.core.Global.__name__ = true;
  age.core.Global.collide = function (pEntity, pX, pY) {
    if (
      pX >= pEntity.x &&
      pX <= pEntity.x + pEntity.width &&
      pY >= pEntity.y &&
      pY <= pEntity.y + pEntity.height
    )
      return true;
    return false;
  };
  age.core.IBehavior = function () {};
  age.core.IBehavior.__name__ = true;
  age.core.Input = function (pRoot) {
    age.core.Input._root = pRoot;
    var b = window.document;
    b.addEventListener('keydown', age.core.Input.onKeyDown);
    b.addEventListener('keyup', age.core.Input.onKeyUp);
    age.core.Input._root.addEventListener(
      'mousemove',
      age.core.Input.onMouseMove
    );
    age.utils.GamepadSupport.init();
  };
  age.core.Input.__name__ = true;
  age.core.Input.onMouseMove = function (pEvt) {
    var bounds = age.core.Input.getCanvasBounds();
    age.core.Input.mousePosition.x = Math.round(pEvt.clientX - bounds.left);
    age.core.Input.mousePosition.y = Math.round(pEvt.clientY - bounds.top);
    age.core.Input.mousePosition.x = Math.round(
      age.core.Input.mousePosition.x * age.core.Global.engine.stageScaleX
    );
    age.core.Input.mousePosition.y = Math.round(
      age.core.Input.mousePosition.y * age.core.Global.engine.stageScaleY
    );
  };
  age.core.Input.registerGlobalClickHandler = function (pCallback) {
    age.core.Input._root.addEventListener('click', pCallback);
  };
  age.core.Input.removeGlobalClickHandler = function (pCallback) {
    age.core.Input._root.removeEventListener('click', pCallback);
  };
  age.core.Input.getCanvasBounds = function () {
    return age.core.Input._root.getBoundingClientRect();
  };
  age.core.Input.onKeyDown = function (pEvt) {
    var code = pEvt.keyCode;
    if (!age.core.Input._key[code]) {
      age.core.Input._key[code] = true;
      age.core.Input._keyNum++;
      age.core.Input._press[age.core.Input._pressNum++] = code;
    }
  };
  age.core.Input.onKeyUp = function (pEvt) {
    var code = pEvt.keyCode;
    if (age.core.Input._key[code]) {
      age.core.Input._key[code] = false;
      age.core.Input._keyNum--;
      age.core.Input._release[age.core.Input._releaseNum++] = code;
    }
  };
  age.core.Input.indexOf = function (a, v) {
    var i = 0;
    var _g = 0;
    while (_g < a.length) {
      var v2 = a[_g];
      ++_g;
      if (v == v2) return i;
      i++;
    }
    return -1;
  };
  age.core.Input.update = function () {
    while (age.core.Input._pressNum-- > -1)
      age.core.Input._press[age.core.Input._pressNum] = -1;
    age.core.Input._pressNum = 0;
    while (age.core.Input._releaseNum-- > -1)
      age.core.Input._release[age.core.Input._releaseNum] = -1;
    age.core.Input._releaseNum = 0;
    age.utils.GamepadSupport.update();
  };
  age.core.Input.check = function (input) {
    if (typeof input == 'string') {
      var v;
      var key = input;
      v = age.core.Input._control.get(key);
      var i = v.length;
      while (i-- > 0)
        if (v[i] < 0 && age.core.Input._keyNum > 0) return true;
        else if (age.core.Input._key[v[i]] == true) return true;
      return false;
    }
    if (input < 0) return age.core.Input._keyNum > 0;
    else return age.core.Input._key[input];
  };
  age.core.Input.pressed = function (input) {
    if (typeof input == 'string') {
      var v;
      var key = input;
      v = age.core.Input._control.get(key);
      var i = v.length;
      while (i-- > 0)
        if (
          v[i] < 0
            ? age.core.Input._pressNum != 0
            : age.core.Input.indexOf(age.core.Input._press, v[i]) >= 0
        )
          return true;
      return false;
    }
    if (input < 0) return age.core.Input._pressNum != 0;
    else return age.core.Input.indexOf(age.core.Input._press, input) >= 0;
  };
  age.core.Input.released = function (input) {
    if (typeof input == 'string') {
      var v;
      var key = input;
      v = age.core.Input._control.get(key);
      var i = v.length;
      while (i-- > 0)
        if (
          v[i] < 0
            ? age.core.Input._releaseNum != 0
            : age.core.Input.indexOf(age.core.Input._release, v[i]) >= 0
        )
          return true;
      return false;
    }
    if (input < 0) return age.core.Input._releaseNum != 0;
    else return age.core.Input.indexOf(age.core.Input._release, input) >= 0;
  };
  age.display.Entity = function (pWidth, pHeight, pImgSrc) {
    if (pImgSrc == null) pImgSrc = '';
    if (pHeight == null) pHeight = 0;
    if (pWidth == null) pWidth = 0;
    this.visible = true;
    this.x = this.y = 0;
    this.rotation = 0;
    this.depth = 0;
    this.alpha = 1;
    this.mirror = false;
    this.dead = false;
    this.width = pWidth;
    this.height = pHeight;
    this.hitbox = { x: 0, y: 0, width: pWidth, height: pHeight };
    this._images = new haxe.ds.StringMap();
    this._behaviors = new haxe.ds.StringMap();
    if (pImgSrc != '') this.addImage('default', pImgSrc, true);
  };
  age.display.Entity.__name__ = true;
  age.display.Entity.__interfaces__ = [age.core.IEntity];
  age.display.Entity.prototype = {
    addImage: function (pName, pSrc, pDefault) {
      if (pDefault == null) pDefault = false;
      var value = age.Assets.getImage(pSrc);
      this._images.set(pName, value);
      if (pDefault) this.play(pName);
    },
    play: function (pName) {
      this._image = this._images.get(pName);
    },
    addBehavior: function (pName, pBehavior) {
      this._behaviors.set(pName, pBehavior);
    },
    removeBehavior: function (pName) {
      if (this._behaviors.exists(pName)) this._behaviors.remove(pName);
    },
    getBehavior: function (pName) {
      return this._behaviors.get(pName);
    },
    update: function () {
      if (!this.dead) {
        var $it0 = this._behaviors.iterator();
        while ($it0.hasNext()) {
          var b = $it0.next();
          if (b.activated) b.update();
        }
      }
    },
    render: function (pContext) {
      if (this._image == null || !this.visible || this.dead) return;
      pContext.save();
      if (this.mirror) {
        var decX = (this.x + this.width * 0.5) | 0;
        var decY = (this.y + this.height * 0.5) | 0;
        pContext.translate(decX, decY);
        pContext.scale(-1, 1);
        pContext.translate(-decX, -decY);
      }
      if (this.rotation != 0) {
        var decX1 = (this.x + this.width * 0.5) | 0;
        var decY1 = (this.y + this.height * 0.5) | 0;
        pContext.translate(decX1, decY1);
        pContext.rotate((this.rotation * Math.PI) / 180);
        pContext.translate(-decX1, -decY1);
      }
      var globalAlpha = pContext.globalAlpha;
      if (this.alpha < 1 && this.alpha >= 0) pContext.globalAlpha = this.alpha;
      if (this.width != 0 && this.height != 0)
        pContext.drawImage(
          this._image,
          this.x,
          this.y,
          this.width,
          this.height
        );
      else pContext.drawImage(this._image, this.x, this.y);
      pContext.globalAlpha = globalAlpha;
      pContext.restore();
    },
    destroy: function () {
      var $it0 = this._behaviors.iterator();
      while ($it0.hasNext()) {
        var b = $it0.next();
        b.destroy();
      }
      this._behaviors = new haxe.ds.StringMap();
    },
    collideRect: function (pX, pY, pWidth, pHeight) {
      if (
        pX >= this.x + this.hitbox.x &&
        pX <= this.x + this.hitbox.x + this.hitbox.width &&
        pY >= this.y + this.hitbox.y &&
        pY <= this.y + this.hitbox.y + this.hitbox.height
      )
        return true;
      if (
        pX + pWidth >= this.x + this.hitbox.x &&
        pX + pWidth <= this.x + this.hitbox.x + this.hitbox.width &&
        pY >= this.y + this.hitbox.y &&
        pY <= this.y + this.hitbox.y + this.hitbox.height
      )
        return true;
      if (
        pX >= this.x + this.hitbox.x &&
        pX <= this.x + this.hitbox.x + this.hitbox.width &&
        pY + pHeight >= this.y + this.hitbox.y &&
        pY + pHeight <= this.y + this.hitbox.y + this.hitbox.height
      )
        return true;
      if (
        pX + pWidth >= this.x + this.hitbox.x &&
        pX + pWidth <= this.x + this.hitbox.x + this.hitbox.width &&
        pY + pHeight >= this.y + this.hitbox.y &&
        pY + pHeight <= this.y + this.hitbox.y + this.hitbox.height
      )
        return true;
      return false;
    },
    collideEntity: function (pEntity) {
      return this.collideRect(
        pEntity.x + pEntity.hitbox.x,
        pEntity.y + pEntity.hitbox.y,
        pEntity.hitbox.width,
        pEntity.hitbox.height
      );
    },
  };
  age.display.AnimatedEntity = function (
    pWidth,
    pHeight,
    pSrc,
    pTotalFrames,
    pFrameRate
  ) {
    age.display.Entity.call(this, pWidth, pHeight);
    this.addImage('default', pSrc, true);
    this._frames = pTotalFrames;
    this._currentFrame = 0;
    this._pauseAnim = false;
    this._frameRate = pFrameRate;
    this._timer = 0;
    this._loop = true;
    this._complete = false;
  };
  age.display.AnimatedEntity.__name__ = true;
  age.display.AnimatedEntity.__super__ = age.display.Entity;
  age.display.AnimatedEntity.prototype = $extend(age.display.Entity.prototype, {
    onAnimationComplete: function () {},
    update: function () {
      if (this._complete) return;
      var oldIndex = this._currentFrame;
      this._timer += this._frameRate * age.core.Global.elapsed;
      if (this._timer >= 1 && !this._pauseAnim)
        while (this._timer >= 1) {
          this._timer--;
          this._currentFrame++;
          if (this._currentFrame >= this._frames) {
            if (this._loop) this._currentFrame = 0;
            else {
              this._currentFrame = this._frames - 1;
              this._complete = true;
              this.onAnimationComplete();
              break;
            }
          }
        }
      age.display.Entity.prototype.update.call(this);
    },
    render: function (pContext) {
      pContext.save();
      if (this.mirror) {
        var decX = (this.x + this.width * 0.5) | 0;
        var decY = (this.y + this.height * 0.5) | 0;
        pContext.translate(decX, decY);
        pContext.scale(-1, 1);
        pContext.translate(-decX, -decY);
      }
      if (this.rotation != 0) {
        var decX1 = (this.x + this.width * 0.5) | 0;
        var decY1 = (this.y + this.height * 0.5) | 0;
        pContext.translate(decX1, decY1);
        pContext.rotate((this.rotation * Math.PI) / 180);
        pContext.translate(-decX1, -decY1);
      }
      var globalAlpha = pContext.globalAlpha;
      if (this.alpha < 1 && this.alpha >= 0) pContext.globalAlpha = this.alpha;
      pContext.drawImage(
        this._image,
        this._currentFrame * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      pContext.globalAlpha = globalAlpha;
      pContext.restore();
    },
  });
  age.display.State = function () {
    age.display.EntityContainer.call(this);
  };
  age.display.State.__name__ = true;
  age.display.State.__super__ = age.display.EntityContainer;
  age.display.State.prototype = $extend(age.display.EntityContainer.prototype, {
    create: function () {},
  });
  age.display.text = {};
  age.display.text.BasicText = function (pText, pX, pY) {
    if (pY == null) pY = 0;
    if (pX == null) pX = 0;
    this.text = pText;
    this.visible = true;
    this.font = 'sans-serif';
    this.size = 12;
    this.bold = false;
    this.color = '#000';
    this.textAlign = age.display.text.TextAlign.LEFT;
    this.textBaseline = age.display.text.TextBaseline.TOP;
    this.x = pX;
    this.y = pY;
    this.width = 0;
    this.height = 0;
    this.depth = 0;
  };
  age.display.text.BasicText.__name__ = true;
  age.display.text.BasicText.__interfaces__ = [age.core.IEntity];
  age.display.text.BasicText.prototype = {
    setStyle: function (pFont, pSize, pColor, pBold, pTextAlign) {
      if (pBold == null) pBold = false;
      if (pColor == null) pColor = '';
      if (pSize == null) pSize = 0;
      if (pFont == null) pFont = '';
      if (pFont != '') this.font = pFont;
      if (pSize > 0) this.size = pSize;
      if (pColor != '') this.color = pColor;
      this.bold = pBold;
      if (pTextAlign != null) this.textAlign = pTextAlign;
    },
    update: function () {},
    render: function (pContext) {
      pContext.fillStyle = this.color;
      pContext.font =
        (this.bold ? 'bold ' : '') + this.size + 'px ' + this.font;
      pContext.textAlign = age.display.text.TextAlignEnum.toStyle(
        this.textAlign
      );
      pContext.textBaseline = age.display.text.TextBaselineEnum.toStyle(
        this.textBaseline
      );
      pContext.fillText(this.text, this.x, this.y);
    },
    destroy: function () {},
  };
  age.display.text.TextAlign = {
    __ename__: true,
    __constructs__: ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY'],
  };
  age.display.text.TextAlign.LEFT = ['LEFT', 0];
  age.display.text.TextAlign.LEFT.__enum__ = age.display.text.TextAlign;
  age.display.text.TextAlign.CENTER = ['CENTER', 1];
  age.display.text.TextAlign.CENTER.__enum__ = age.display.text.TextAlign;
  age.display.text.TextAlign.RIGHT = ['RIGHT', 2];
  age.display.text.TextAlign.RIGHT.__enum__ = age.display.text.TextAlign;
  age.display.text.TextAlign.JUSTIFY = ['JUSTIFY', 3];
  age.display.text.TextAlign.JUSTIFY.__enum__ = age.display.text.TextAlign;
  age.display.text.TextAlignEnum = function () {};
  age.display.text.TextAlignEnum.__name__ = true;
  age.display.text.TextAlignEnum.toStyle = function (pType) {
    switch (pType[1]) {
      case 0:
        return 'left';
      case 2:
        return 'right';
      case 1:
        return 'center';
      case 3:
        return 'justify';
    }
  };
  age.display.text.TextBaseline = {
    __ename__: true,
    __constructs__: ['TOP', 'BOTTOM', 'MIDDLE', 'ALPHABETIC', 'HANGING'],
  };
  age.display.text.TextBaseline.TOP = ['TOP', 0];
  age.display.text.TextBaseline.TOP.__enum__ = age.display.text.TextBaseline;
  age.display.text.TextBaseline.BOTTOM = ['BOTTOM', 1];
  age.display.text.TextBaseline.BOTTOM.__enum__ = age.display.text.TextBaseline;
  age.display.text.TextBaseline.MIDDLE = ['MIDDLE', 2];
  age.display.text.TextBaseline.MIDDLE.__enum__ = age.display.text.TextBaseline;
  age.display.text.TextBaseline.ALPHABETIC = ['ALPHABETIC', 3];
  age.display.text.TextBaseline.ALPHABETIC.__enum__ =
    age.display.text.TextBaseline;
  age.display.text.TextBaseline.HANGING = ['HANGING', 4];
  age.display.text.TextBaseline.HANGING.__enum__ =
    age.display.text.TextBaseline;
  age.display.text.TextBaselineEnum = function () {};
  age.display.text.TextBaselineEnum.__name__ = true;
  age.display.text.TextBaselineEnum.toStyle = function (pType) {
    switch (pType[1]) {
      case 0:
        return 'top';
      case 1:
        return 'bottom';
      case 2:
        return 'middle';
      case 3:
        return 'alphabetic';
      case 4:
        return 'hanging';
    }
  };
  age.display.ui = {};
  age.display.ui.Button = function (
    pX,
    pY,
    pWidth,
    pHeight,
    pText,
    pFont,
    pCallback
  ) {
    age.display.EntityContainer.call(this);
    this.enabled = true;
    this.x = pX;
    this.y = pY;
    this.width = pWidth;
    this.height = pHeight;
    this._callback = pCallback;
    this._currentState = age.display.ui.StateEnum.NORMAL;
    this._backgroundColor = '';
    this._borderColor = '';
    var textX = Math.round(pX + pWidth * 0.5);
    var textY = Math.round(pY + pHeight * 0.5);
    this.text = new age.display.text.BasicText(pText, textX, textY);
    this.text.setStyle(
      pFont,
      24,
      '#0000FF',
      false,
      age.display.text.TextAlign.CENTER
    );
    this.text.textBaseline = age.display.text.TextBaseline.MIDDLE;
    if (this._callback != null)
      age.core.Input.registerGlobalClickHandler($bind(this, this.onClick));
    this.add(this.text);
  };
  age.display.ui.Button.__name__ = true;
  age.display.ui.Button.__super__ = age.display.EntityContainer;
  age.display.ui.Button.prototype = $extend(
    age.display.EntityContainer.prototype,
    {
      render: function (pContext) {
        if (this._backgroundColor != '' || this._borderColor != '') {
          pContext.beginPath();
          pContext.rect(this.x, this.y, this.width, this.height);
          if (this._backgroundColor != '') {
            pContext.fillStyle = this._backgroundColor;
            pContext.fill();
          }
          if (this._borderColor != '') {
            pContext.lineWidth = 2;
            pContext.strokeStyle = this._borderColor;
            pContext.stroke();
          }
        }
        age.display.EntityContainer.prototype.render.call(this, pContext);
      },
      update: function () {
        this._currentState = age.display.ui.StateEnum.NORMAL;
        if (!this.enabled)
          this._currentState = age.display.ui.StateEnum.DISABLE;
        else {
          var mouse = age.core.Input.mousePosition;
          if (
            mouse.x >= this.x &&
            mouse.x <= this.x + this.width &&
            mouse.y >= this.y &&
            mouse.y <= this.y + this.height
          )
            this._currentState = age.display.ui.StateEnum.OVER;
        }
        var _g = this._currentState;
        switch (_g[1]) {
          case 0:
            this.text.color = '#000';
            this._backgroundColor = '#FFF';
            break;
          case 1:
            this.text.color = '#FFF';
            this._backgroundColor = '#000';
            break;
          case 2:
            this.text.color = '#FFF';
            this._backgroundColor = '#DCDCDC';
            break;
        }
        age.display.EntityContainer.prototype.update.call(this);
      },
      onClick: function (pEvt) {
        if (!this.enabled) return;
        var bounds = age.core.Input.getCanvasBounds();
        var mouseX = age.core.Input.mousePosition.x;
        var mouseY = age.core.Input.mousePosition.y;
        if (
          mouseX >= this.x &&
          mouseX <= this.x + this.width &&
          mouseY >= this.y &&
          mouseY <= this.y + this.height
        )
          this._callback();
      },
      destroy: function () {
        age.core.Input.removeGlobalClickHandler($bind(this, this.onClick));
      },
    }
  );
  age.display.ui.StateEnum = {
    __ename__: true,
    __constructs__: ['NORMAL', 'OVER', 'DISABLE'],
  };
  age.display.ui.StateEnum.NORMAL = ['NORMAL', 0];
  age.display.ui.StateEnum.NORMAL.__enum__ = age.display.ui.StateEnum;
  age.display.ui.StateEnum.OVER = ['OVER', 1];
  age.display.ui.StateEnum.OVER.__enum__ = age.display.ui.StateEnum;
  age.display.ui.StateEnum.DISABLE = ['DISABLE', 2];
  age.display.ui.StateEnum.DISABLE.__enum__ = age.display.ui.StateEnum;
  age.display.ui.Img = function (pX, pY, pSrc, pScale) {
    if (pScale == null) pScale = 1;
    this.visible = true;
    this.x = pX;
    this.y = pY;
    this.scale = pScale;
    this.rotation = 0;
    this.depth = 0;
    this.alpha = 1;
    this._image = age.Assets.getImage(pSrc);
    this.width = this._image.width;
    this.height = this._image.height;
  };
  age.display.ui.Img.__name__ = true;
  age.display.ui.Img.__interfaces__ = [age.core.IEntity];
  age.display.ui.Img.prototype = {
    changeImg: function (pSrc) {
      this._image = age.Assets.getImage(pSrc);
      this.width = this._image.width;
      this.height = this._image.height;
    },
    update: function () {},
    render: function (pContext) {
      if (this._image == null || !this.visible) return;
      pContext.save();
      if (this.rotation != 0) {
        var decX = (this.x + this.width * 0.5) | 0;
        var decY = (this.y + this.height * 0.5) | 0;
        pContext.translate(decX, decY);
        pContext.rotate((this.rotation * Math.PI) / 180);
        pContext.translate(-decX, -decY);
      }
      if (this.scale != 1) {
        var decX1 = (this.x + this.width * 0.5) | 0;
        var decY1 = (this.y + this.height * 0.5) | 0;
        pContext.translate(decX1, decY1);
        pContext.scale(this.scale, this.scale);
        pContext.translate(-decX1, -decY1);
      }
      var globalAlpha = pContext.globalAlpha;
      if (this.alpha < 1 && this.alpha >= 0) pContext.globalAlpha = this.alpha;
      if (this.width != 0 && this.height != 0)
        pContext.drawImage(
          this._image,
          this.x,
          this.y,
          this.width,
          this.height
        );
      else pContext.drawImage(this._image, this.x, this.y);
      pContext.globalAlpha = globalAlpha;
      pContext.restore();
    },
    destroy: function () {},
  };
  age.display.ui.Rect = function (pX, pY, pWidth, pHeight, pColor, pAlpha) {
    if (pAlpha == null) pAlpha = 1;
    this.visible = true;
    this.x = pX;
    this.y = pY;
    this.depth = 0;
    this.alpha = pAlpha;
    this._backgroundColor = pColor;
    this.width = pWidth;
    this.height = pHeight;
  };
  age.display.ui.Rect.__name__ = true;
  age.display.ui.Rect.__interfaces__ = [age.core.IEntity];
  age.display.ui.Rect.prototype = {
    update: function () {},
    render: function (pContext) {
      if (this._backgroundColor != '') {
        pContext.save();
        var globalAlpha = pContext.globalAlpha;
        if (this.alpha < 1 && this.alpha >= 0)
          pContext.globalAlpha = this.alpha;
        pContext.beginPath();
        pContext.rect(this.x, this.y, this.width, this.height);
        if (this._backgroundColor != '') {
          pContext.fillStyle = this._backgroundColor;
          pContext.fill();
        }
        pContext.globalAlpha = globalAlpha;
        pContext.restore();
      }
    },
    destroy: function () {},
  };
  age.managers = {};
  age.managers.SoundManager = function () {
    this._globalVolume = 0.8;
    var AudioContext = age.utils.HtmlUtils.loadExtension('AudioContext').value;
    if (AudioContext != null) this._context = new AudioContext();
    else console.log('No audio context found');
  };
  age.managers.SoundManager.__name__ = true;
  age.managers.SoundManager.getInstance = function () {
    if (age.managers.SoundManager._instance == null)
      age.managers.SoundManager._instance = new age.managers.SoundManager();
    return age.managers.SoundManager._instance;
  };
  age.managers.SoundManager.prototype = {
    setGlobalVolume: function (pVal) {
      this._globalVolume = pVal;
    },
    getSource: function (pAudioData) {
      if (this._context == null) return null;
      var soundSource = this._context.createBufferSource();
      var soundBuffer = this._context.createBuffer(pAudioData, true);
      soundSource.buffer = soundBuffer;
      soundSource.connect(this._context.destination, 0, 0);
      return soundSource;
    },
    play: function (pName, pPos, pLoop) {
      if (pLoop == null) pLoop = false;
      if (pPos == null) pPos = 0;
      if (this._context == null) return;
      var s = this.getSource(age.Assets.getSound(pName));
      if (pLoop) s.loop = pLoop;
      if (Reflect.field(s, 'start')) s.start(pPos);
      else s.noteOn(pPos);
    },
    stop: function (pName) {
      if (this._context == null) return;
    },
  };
  age.utils = {};
  age.utils.GamepadSupport = function () {};
  age.utils.GamepadSupport.__name__ = true;
  age.utils.GamepadSupport.init = function () {
    age.utils.GamepadSupport._buttons = new haxe.ds.IntMap();
    age.utils.GamepadSupport._axes = new haxe.ds.IntMap();
    age.utils.GamepadSupport._pads = new haxe.ds.IntMap();
    age.utils.GamepadSupport.NB_PAD = 0;
    age.utils.GamepadSupport.enabled =
      age.utils.HtmlUtils.loadExtension('GetGamepads', window.navigator)
        .value != null;
    console.log(
      'GamePad support : ' + Std.string(age.utils.GamepadSupport.enabled)
    );
  };
  age.utils.GamepadSupport.update = function () {
    if (
      !age.utils.GamepadSupport.enabled ||
      age.utils.GamepadSupport._buttons == null
    )
      return;
    age.utils.GamepadSupport.NB_PAD = 0;
    var t = window.navigator;
    var gamepads = t.webkitGetGamepads();
    if (gamepads != null) {
      var pad;
      var _g1 = 0;
      var _g = gamepads.length;
      while (_g1 < _g) {
        var i = _g1++;
        age.utils.GamepadSupport.NB_PAD++;
        pad = gamepads.item(i);
        if (pad != null) {
          if (!age.utils.GamepadSupport._pads.exists(i))
            age.utils.GamepadSupport._pads.set(i, pad.id);
          var currentPadButtons;
          if (age.utils.GamepadSupport._buttons.exists(i))
            currentPadButtons = age.utils.GamepadSupport._buttons.get(i);
          else {
            currentPadButtons = new haxe.ds.IntMap();
            age.utils.GamepadSupport._buttons.set(i, currentPadButtons);
          }
          var btnIndex = 0;
          var _g2 = 0;
          var _g3 = pad.buttons;
          while (_g2 < _g3.length) {
            var b = _g3[_g2];
            ++_g2;
            if (currentPadButtons.exists(btnIndex) && b == 1) {
              var state = currentPadButtons.get(btnIndex);
              if (state == age.utils.GamePadState.OFF)
                currentPadButtons.set(btnIndex, age.utils.GamePadState.PRESSED);
            } else
              currentPadButtons.set(
                btnIndex,
                b == 1
                  ? age.utils.GamePadState.PRESSED
                  : age.utils.GamePadState.OFF
              );
            btnIndex++;
          }
          var currentPadAxes;
          if (age.utils.GamepadSupport._axes.exists(i))
            currentPadAxes = age.utils.GamepadSupport._axes.get(i);
          else {
            currentPadAxes = {
              leftStick_right: false,
              leftStick_left: false,
              leftStick_up: false,
              leftStick_down: false,
              rightStick_right: false,
              rightStick_left: false,
              rightStick_up: false,
              rightStick_down: false,
            };
            age.utils.GamepadSupport._axes.set(i, currentPadAxes);
          }
          currentPadAxes.leftStick_right =
            pad.axes[0] > age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.leftStick_left =
            pad.axes[0] < -age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.leftStick_up =
            pad.axes[1] > age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.leftStick_down =
            pad.axes[1] < -age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.rightStick_right =
            pad.axes[2] > age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.rightStick_left =
            pad.axes[2] < -age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.rightStick_up =
            pad.axes[3] > age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
          currentPadAxes.rightStick_down =
            pad.axes[3] < -age.utils.GamepadSupport.GAMEPAD_SENSITIVITY;
        }
      }
    }
  };
  age.utils.GamepadSupport.pressed = function (pPadId, pBtn) {
    if (
      age.utils.GamepadSupport._buttons != null &&
      age.utils.GamepadSupport._buttons.exists(pPadId)
    ) {
      var state;
      var this1 = age.utils.GamepadSupport._buttons.get(pPadId);
      state = this1.get(pBtn);
      if (state == age.utils.GamePadState.PRESSED) {
        var this2 = age.utils.GamepadSupport._buttons.get(pPadId);
        this2.set(pBtn, age.utils.GamePadState.ON);
        return true;
      }
    }
    return false;
  };
  age.utils.GamepadSupport.check = function (pPadId, pBtn) {
    if (
      age.utils.GamepadSupport._buttons != null &&
      age.utils.GamepadSupport._buttons.exists(pPadId)
    )
      return (
        (function ($this) {
          var $r;
          var this1 = age.utils.GamepadSupport._buttons.get(pPadId);
          $r = this1.get(pBtn);
          return $r;
        })(this) != age.utils.GamePadState.OFF
      );
    return false;
  };
  age.utils.GamepadSupport.direction = function (pPadId, pDirection, pStick) {
    if (pStick == null) pStick = 0;
    if (
      age.utils.GamepadSupport._axes != null &&
      age.utils.GamepadSupport._axes.exists(pPadId)
    ) {
      var padAxes = age.utils.GamepadSupport._axes.get(pPadId);
      switch (pDirection[1]) {
        case 0:
          if (pStick == 0) return padAxes.leftStick_left;
          else return padAxes.rightStick_left;
          break;
        case 1:
          if (pStick == 0) return padAxes.leftStick_right;
          else return padAxes.rightStick_right;
          break;
        case 2:
          if (pStick == 0) return padAxes.leftStick_up;
          else return padAxes.rightStick_up;
          break;
        case 3:
          if (pStick == 0) return padAxes.leftStick_down;
          else return padAxes.rightStick_down;
          break;
      }
    }
    return false;
  };
  age.utils.GamePadAxes = {
    __ename__: true,
    __constructs__: ['LEFT', 'RIGHT', 'UP', 'DOWN'],
  };
  age.utils.GamePadAxes.LEFT = ['LEFT', 0];
  age.utils.GamePadAxes.LEFT.__enum__ = age.utils.GamePadAxes;
  age.utils.GamePadAxes.RIGHT = ['RIGHT', 1];
  age.utils.GamePadAxes.RIGHT.__enum__ = age.utils.GamePadAxes;
  age.utils.GamePadAxes.UP = ['UP', 2];
  age.utils.GamePadAxes.UP.__enum__ = age.utils.GamePadAxes;
  age.utils.GamePadAxes.DOWN = ['DOWN', 3];
  age.utils.GamePadAxes.DOWN.__enum__ = age.utils.GamePadAxes;
  age.utils.GamePadState = {
    __ename__: true,
    __constructs__: ['PRESSED', 'ON', 'OFF'],
  };
  age.utils.GamePadState.PRESSED = ['PRESSED', 0];
  age.utils.GamePadState.PRESSED.__enum__ = age.utils.GamePadState;
  age.utils.GamePadState.ON = ['ON', 1];
  age.utils.GamePadState.ON.__enum__ = age.utils.GamePadState;
  age.utils.GamePadState.OFF = ['OFF', 2];
  age.utils.GamePadState.OFF.__enum__ = age.utils.GamePadState;
  age.utils.HtmlUtils = function () {};
  age.utils.HtmlUtils.__name__ = true;
  age.utils.HtmlUtils.loadExtension = function (pName, obj) {
    if (obj == null) obj = window;
    var extension = Reflect.field(obj, pName);
    if (extension != null)
      return { prefix: '', field: pName, value: extension };
    var capitalized =
      pName.charAt(0).toUpperCase() + HxOverrides.substr(pName, 1, null);
    var _g = 0;
    var _g1 = age.utils.HtmlUtils.VENDOR_PREFIXES;
    while (_g < _g1.length) {
      var prefix = _g1[_g];
      ++_g;
      var field = prefix + capitalized;
      var extension1 = Reflect.field(obj, field);
      if (extension1 != null)
        return { prefix: prefix, field: field, value: extension1 };
    }
    return { prefix: null, field: null, value: null };
  };
  age.utils.Key = function () {};
  age.utils.Key.__name__ = true;
  age.utils.Key.nameOfKey = function ($char) {
    if ($char >= 97 && $char <= 122) return String.fromCharCode($char);
    if ($char >= 112 && $char <= 126) return 'F' + Std.string($char - 111);
    if ($char >= 96 && $char <= 105) return 'NUMPAD ' + Std.string($char - 96);
    switch ($char) {
      case 37:
        return 'LEFT';
      case 38:
        return 'UP';
      case 39:
        return 'RIGHT';
      case 40:
        return 'DOWN';
      case 13:
        return 'ENTER';
      case 17:
        return 'CONTROL';
      case 32:
        return 'SPACE';
      case 16:
        return 'SHIFT';
      case 8:
        return 'BACKSPACE';
      case 20:
        return 'CAPS LOCK';
      case 46:
        return 'DELETE';
      case 35:
        return 'END';
      case 27:
        return 'ESCAPE';
      case 36:
        return 'HOME';
      case 45:
        return 'INSERT';
      case 9:
        return 'TAB';
      case 34:
        return 'PAGE DOWN';
      case 33:
        return 'PAGE UP';
      case 107:
        return 'NUMPAD ADD';
      case 110:
        return 'NUMPAD DECIMAL';
      case 111:
        return 'NUMPAD DIVIDE';
      case 108:
        return 'NUMPAD ENTER';
      case 106:
        return 'NUMPAD MULTIPLY';
      case 109:
        return 'NUMPAD SUBTRACT';
    }
    return String.fromCharCode($char);
  };
  age.utils.MathUtil = function () {};
  age.utils.MathUtil.__name__ = true;
  age.utils.MathUtil.bound = function (pVal, pMin, pMax) {
    if (Math.max(pMin, pVal) == pMin) return pMin;
    if (Math.min(pVal, pMax) == pMax) return pMax;
    return pVal;
  };
  age.utils.MathUtil.randomValue = function (pMin, pMax) {
    return pMin + Math.round(Math.random() * (pMax - pMin));
  };
  age.utils.MathUtil.distance = function (p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  };
  var behaviors = {};
  behaviors.BasicMovements = function (pEntity) {
    this.activated = true;
    this.entity = pEntity;
    this.velocityX = 0;
    this.velocityY = 0;
    this.canJump = true;
  };
  behaviors.BasicMovements.__name__ = true;
  behaviors.BasicMovements.__interfaces__ = [age.core.IBehavior];
  behaviors.BasicMovements.prototype = {
    update: function () {
      this.entity.y = Math.round(this.entity.y + this.velocityY);
      this.entity.x = Math.round(this.entity.x + this.velocityX);
    },
    onMapCollisions: function (pSide) {},
    destroy: function () {
      this.entity = null;
    },
  };
  behaviors.AiMovements = function (pEntity, pDirection, pMaxSpeed) {
    behaviors.BasicMovements.call(this, pEntity);
    this._gravity = 1;
    this._walkSpeed = 1;
    this._maxSpeed = 4;
    this._direction = pDirection;
  };
  behaviors.AiMovements.__name__ = true;
  behaviors.AiMovements.__super__ = behaviors.BasicMovements;
  behaviors.AiMovements.prototype = $extend(
    behaviors.BasicMovements.prototype,
    {
      update: function () {
        this.velocityX = 0;
        this.velocityY += this._gravity;
        if (this.velocityY > this._maxSpeed) this.velocityY = this._maxSpeed;
        this.velocityX += this._walkSpeed * this._direction;
        behaviors.BasicMovements.prototype.update.call(this);
      },
      onMapCollisions: function (pSide) {
        if (pSide.get('left') || pSide.get('right')) this._direction *= -1;
        this.entity.mirror = this._direction == 1;
      },
    }
  );
  behaviors.BulletMovements = function (pEntity, pAngle, pDistance, pSpeed) {
    behaviors.BasicMovements.call(this, pEntity);
    this._startPoint = { x: this.entity.x, y: this.entity.y };
    this._angle = pAngle;
    this._distance = pDistance;
    this.canJump = false;
    this._speed = pSpeed;
  };
  behaviors.BulletMovements.__name__ = true;
  behaviors.BulletMovements.__super__ = behaviors.BasicMovements;
  behaviors.BulletMovements.prototype = $extend(
    behaviors.BasicMovements.prototype,
    {
      update: function () {
        if (
          age.utils.MathUtil.distance(this._startPoint, {
            x: this.entity.x,
            y: this.entity.y,
          }) > this._distance
        ) {
          this.entity.dead = true;
          return;
        }
        this.velocityX = this.velocityY = 0;
        var ang = (6.283185308 * this._angle) / 360;
        this.velocityY += this._speed * Math.cos(ang);
        this.velocityX += this._speed * Math.sin(ang);
        behaviors.BasicMovements.prototype.update.call(this);
      },
      onMapCollisions: function (pSide) {
        this.entity.dead = true;
      },
    }
  );
  behaviors.GravityMovements = function (pEntity) {
    behaviors.BasicMovements.call(this, pEntity);
    this.velocityX = 0;
    this._gravity = 1;
    this._fallSpeed = 3;
  };
  behaviors.GravityMovements.__name__ = true;
  behaviors.GravityMovements.__super__ = behaviors.BasicMovements;
  behaviors.GravityMovements.prototype = $extend(
    behaviors.BasicMovements.prototype,
    {
      update: function () {
        this.velocityY += this._gravity;
        if (this.velocityY > this._fallSpeed) this.velocityY = this._fallSpeed;
        behaviors.BasicMovements.prototype.update.call(this);
      },
    }
  );
  behaviors.KeyboardMovements = function (pEntity) {
    behaviors.BasicMovements.call(this, pEntity);
    this._gravity = 0.8;
    this._walkSpeed = 2;
    this._jumpSpeed = 15;
    this._maxJumpSpeed = 15;
    this._maxSpeed = 4;
    this._frictionX = 0.8;
    this._frictionY = 0.99;
    this._hero = pEntity;
  };
  behaviors.KeyboardMovements.__name__ = true;
  behaviors.KeyboardMovements.__super__ = behaviors.BasicMovements;
  behaviors.KeyboardMovements.prototype = $extend(
    behaviors.BasicMovements.prototype,
    {
      update: function () {
        var directionX = 0;
        if (this._hero.isMovingLeft()) directionX = -1;
        else if (this._hero.isMovingRight()) directionX = 1;
        this._dir = directionX;
        if (this.canJump && this._hero.isJumping()) {
          this.velocityY -= this._jumpSpeed;
          this.canJump = false;
        }
        if (directionX != 0) this.velocityX += this._walkSpeed * directionX;
        if (Math.abs(this.velocityX) > this._maxSpeed)
          this.velocityX = this._maxSpeed * directionX;
        this.velocityX *= this._frictionX;
        this.velocityY += this._gravity;
        behaviors.BasicMovements.prototype.update.call(this);
      },
      getDirection: function () {
        return this._dir;
      },
      onMapCollisions: function (pSide) {},
    }
  );
  behaviors.MapCollisions = function (pEntity, pData, pMapWidth, pTileSize) {
    this.activated = true;
    this.entity = pEntity;
    this._map = pData;
    this._mapWidth = pMapWidth;
    this._tileSize = pTileSize;
    this.mvt = this.entity.getBehavior('movements');
    this.collisions = new haxe.ds.StringMap();
  };
  behaviors.MapCollisions.__name__ = true;
  behaviors.MapCollisions.__interfaces__ = [age.core.IBehavior];
  behaviors.MapCollisions.prototype = {
    setInitPos: function (pX, pY) {
      this.previousX = pX;
      this.previousY = pY;
    },
    update: function () {
      this.collisions.set('left', false);
      this.collisions.set('right', false);
      this.collisions.set('top', false);
      this.collisions.set('bottom', false);
      this.forecast_x = this.entity.x;
      this.forecast_y = this.entity.y;
      if (
        this.forecast_x == this.previousX &&
        this.forecast_y == this.previousY
      )
        return;
      this.get_corners(this.forecast_x, this.forecast_y);
      if (this.downleft > 0) {
        this.get_corners(this.previousX, this.forecast_y);
        this.downC = this.downleft > 0;
        this.get_corners(this.forecast_x, this.previousY);
        this.leftC = this.downleft > 0;
        if (this.leftC && this.downC) {
          this.forecast_x = (this.leftx + 1) * this._tileSize;
          this.forecast_y =
            (this.downy + 1) * this._tileSize - this.entity.height - 1;
          this.mvt.velocityY = 0;
          this.collisions.set('left', true);
          this.collisions.set('bottom', true);
        } else if (this.leftC) {
          this.forecast_x = (this.leftx + 1) * this._tileSize;
          this.collisions.set('left', true);
        } else if (this.downC) {
          this.forecast_y =
            (this.downy + 1) * this._tileSize - this.entity.height - 1;
          this.mvt.velocityY = 0;
          this.collisions.set('bottom', true);
        } else if (
          this.previousX > this.forecast_x &&
          this.previousY < this.forecast_y
        ) {
          this.forecast_x = (this.leftx + 1) * this._tileSize;
          this.mvt.velocityX = 0;
          this.collisions.set('left', true);
        }
      }
      this.get_corners(this.forecast_x, this.forecast_y);
      if (this.downright > 0) {
        this.get_corners(this.previousX, this.forecast_y);
        this.downC = this.downright > 0;
        this.get_corners(this.forecast_x, this.previousY);
        this.rightC = this.downright > 0;
        if (this.rightC && this.downC) {
          this.forecast_x =
            this.rightx * this._tileSize - this.entity.width - 1;
          this.forecast_y =
            (this.downy + 1) * this._tileSize - this.entity.height - 1;
          this.mvt.velocityY = 0;
          this.collisions.set('right', true);
          this.collisions.set('bottom', true);
        } else if (this.rightC) {
          this.forecast_x =
            this.rightx * this._tileSize - this.entity.width - 1;
          this.collisions.set('right', true);
        } else if (this.downC) {
          this.forecast_y =
            (this.downy + 1) * this._tileSize - this.entity.height - 1;
          this.mvt.velocityY = 0;
          this.collisions.set('bottom', true);
        } else if (
          this.previousX < this.forecast_x &&
          this.previousY < this.forecast_y
        ) {
          this.forecast_x =
            this.rightx * this._tileSize - this.entity.width - 1;
          this.mvt.velocityX = 0;
          this.collisions.set('right', true);
        }
      }
      this.get_corners(this.forecast_x, this.forecast_y);
      if (this.upleft > 0) {
        this.get_corners(this.previousX, this.forecast_y);
        this.upC = this.upleft > 0;
        this.get_corners(this.forecast_x, this.previousY);
        this.leftC = this.upleft > 0;
        if (this.leftC && this.upC) {
          this.forecast_x = (this.leftx + 1) * this._tileSize;
          this.forecast_y = this.upy * this._tileSize;
          this.mvt.velocityY = 0;
          this.collisions.set('top', true);
          this.collisions.set('left', true);
        } else if (this.leftC) {
          this.forecast_x = (this.leftx + 1) * this._tileSize;
          this.collisions.set('left', true);
        } else if (this.upC) {
          this.forecast_y = this.upy * this._tileSize;
          this.mvt.velocityY = 0;
          this.collisions.set('top', true);
        } else if (
          this.previousX > this.forecast_x &&
          this.previousY > this.forecast_y
        ) {
          this.forecast_x = (this.leftx + 1) * this._tileSize;
          this.mvt.velocityX = 0;
          this.collisions.set('left', true);
        }
      }
      this.get_corners(this.forecast_x, this.forecast_y);
      if (this.upright > 0) {
        this.get_corners(this.previousX, this.forecast_y);
        this.upC = this.upright > 0;
        this.get_corners(this.forecast_x, this.previousY);
        this.rightC = this.upright > 0;
        if (this.rightC && this.upC) {
          this.forecast_x =
            this.rightx * this._tileSize - this.entity.width - 1;
          this.forecast_y = this.upy * this._tileSize;
          this.mvt.velocityY = 0;
          this.collisions.set('right', true);
          this.collisions.set('top', true);
        } else if (this.rightC) {
          this.forecast_x =
            this.rightx * this._tileSize - this.entity.width - 1;
          this.collisions.set('right', true);
        } else if (this.upC) {
          this.forecast_y = this.upy * this._tileSize;
          this.mvt.velocityY = 0;
          this.collisions.set('top', true);
        } else if (
          this.previousX < this.forecast_x &&
          this.previousY > this.forecast_y
        ) {
          this.forecast_x =
            this.rightx * this._tileSize - this.entity.width - 1;
          this.mvt.velocityX = 0;
          this.collisions.set('right', true);
        }
      }
      this.entity.x = this.forecast_x;
      this.entity.y = this.forecast_y;
      this.check_ground();
      if (
        this.collisions.get('left') ||
        this.collisions.get('right') ||
        this.collisions.get('top') ||
        this.collisions.get('bottom')
      )
        this.mvt.onMapCollisions(this.collisions);
    },
    get_corners: function (point_x, point_y) {
      this.downy = Math.round(
        (point_y + this.entity.height - this._tileSize / 2) / this._tileSize
      );
      this.upy = Math.round((point_y - this._tileSize / 2) / this._tileSize);
      this.rightx = Math.round(
        (point_x + this.entity.width - this._tileSize / 2) / this._tileSize
      );
      this.leftx = Math.round((point_x - this._tileSize / 2) / this._tileSize);
      this.downleft = this.getCell(this.leftx, this.downy);
      this.downright = this.getCell(this.rightx, this.downy);
      this.upright = this.getCell(this.rightx, this.upy);
      this.upleft = this.getCell(this.leftx, this.upy);
    },
    getCell: function (pX, pY) {
      return this._map[pX + pY * this._mapWidth];
    },
    check_ground: function () {
      this.downy = Math.round(
        (this.entity.y + this.entity.height + 1 - this._tileSize / 2) /
          this._tileSize
      );
      this.rightx = Math.round(
        (this.entity.x + this.entity.width - this._tileSize / 2) /
          this._tileSize
      );
      this.leftx = Math.round(
        (this.entity.x - this._tileSize / 2) / this._tileSize
      );
      this.downleft = this.getCell(this.leftx, this.downy);
      this.downright = this.getCell(this.rightx, this.downy);
      if (this.downleft > 0 || this.downright > 0) {
        this.mvt.canJump = true;
        this.collisions.set('bottom', true);
      } else this.mvt.canJump = false;
    },
    destroy: function () {
      this.entity = null;
    },
  };
  var entities = {};
  entities.Bullet = function (pX, pY, pShooter) {
    age.display.Entity.call(this, 13, 12);
    this.x = pX;
    this.y = pY;
    this.shooter = pShooter;
    this.dead = false;
    this.addImage('bullet', 'bullet', true);
  };
  entities.Bullet.__name__ = true;
  entities.Bullet.__super__ = age.display.Entity;
  entities.Bullet.prototype = $extend(age.display.Entity.prototype, {});
  entities.Player = function (pX, pY, pID, pIdControls, pDefaultWeapon) {
    this.id = pID;
    var img;
    switch (pID) {
      case 2:
        img = 'player2';
        break;
      case 3:
        img = 'player3';
        break;
      case 4:
        img = 'player4';
        break;
      default:
        img = 'player1';
    }
    age.display.AnimatedEntity.call(this, 22, 22, img, 2, 7);
    this.idControls = pIdControls;
    this.weapon = pDefaultWeapon;
    this.ammunitionLeft = this.weapon.ammunition;
    this.hitbox.x = 3;
    this.hitbox.y = 6;
    this.hitbox.width = this.hitbox.height = 16;
    this.x = pX;
    this.y = pY;
    this._pauseAnim = true;
    this._canJump = true;
    this._direction = 1;
    this._lastFire = haxe.Timer.stamp() * 1000 - this.weapon.firelaps;
    this._movements = new behaviors.KeyboardMovements(this);
    this.addBehavior('movements', this._movements);
  };
  entities.Player.__name__ = true;
  entities.Player.__super__ = age.display.AnimatedEntity;
  entities.Player.prototype = $extend(age.display.AnimatedEntity.prototype, {
    changeWeapon: function (pWeapon) {
      this.weapon = pWeapon;
      this.ammunitionLeft = this.weapon.ammunition;
    },
    update: function () {
      if (this.dead) return;
      if (this._collisions == null)
        this._collisions = this.getBehavior('collisions');
      this._collisions.setInitPos(this.x, this.y);
      age.display.AnimatedEntity.prototype.update.call(this);
      if (this.y > age.core.Global.engine.stageHeight) this.dead = true;
      var currentDir = this._movements.getDirection();
      if (currentDir != 0) {
        this._direction = currentDir;
        this.mirror = this._direction == -1;
      }
      if (this.isFiring()) {
        var now = haxe.Timer.stamp() * 1000;
        if (now > this._lastFire + this.weapon.firelaps) {
          this._lastFire = now;
          this.weapon.fire(this, this._direction);
          this.ammunitionLeft -= this.weapon.ammunitionPerShoot;
          if (
            this.weapon.name != Data.DEFAULT_WEAPON.name &&
            ((this.weapon.ammunition > 0 && this.ammunitionLeft <= 0) ||
              this.ammunitionLeft < this.weapon.ammunitionPerShoot)
          ) {
            managers.UiManager.getInstance().displayWeapon(
              Data.DEFAULT_WEAPON.name,
              Math.round(this.x + this.width / 2),
              this.y - 10
            );
            this.changeWeapon(Data.DEFAULT_WEAPON);
          }
        }
      }
    },
    isFiring: function () {
      if (this.idControls == -1) return age.core.Input.check(32);
      return age.utils.GamepadSupport.check(this.idControls, 2);
    },
    isMovingLeft: function () {
      var val = false;
      if (this.idControls == -1) val = age.core.Input.check(37);
      else
        val = age.utils.GamepadSupport.direction(
          this.idControls,
          age.utils.GamePadAxes.LEFT
        );
      this._pauseAnim = !val;
      return val;
    },
    isMovingRight: function () {
      var val = false;
      if (this.idControls == -1) val = age.core.Input.check(39);
      else
        val = age.utils.GamepadSupport.direction(
          this.idControls,
          age.utils.GamePadAxes.RIGHT
        );
      this._pauseAnim = !val;
      return val;
    },
    isJumping: function () {
      var val = false;
      if (
        this._canJump &&
        ((this.idControls == -1 && age.core.Input.check(38)) ||
          age.utils.GamepadSupport.check(this.idControls, 0))
      ) {
        this._canJump = false;
        val = true;
      } else if (
        (!this._canJump &&
          this._movements.canJump &&
          this.idControls == -1 &&
          !age.core.Input.check(38)) ||
        (this.idControls != -1 &&
          !age.utils.GamepadSupport.check(this.idControls, 0))
      ) {
        val = false;
        this._canJump = true;
      }
      return val;
    },
    resetAfterPause: function (pValue) {
      this._lastFire += pValue;
    },
  });
  entities.Tile = function (pX, pY, pIdCell) {
    age.display.Entity.call(this, 25, 25);
    this.x = pX;
    this.y = pY;
    var img;
    switch (pIdCell) {
      case 1:
        img = 'grass';
        break;
      case 2:
        img = 'grassCenter';
        break;
      case 3:
        img = 'grassCliffLeft';
        break;
      case 4:
        img = 'grassCliffRight';
        break;
      case 5:
        img = 'grassLeft';
        break;
      case 6:
        img = 'grassMid';
        break;
      case 7:
        img = 'grassRight';
        break;
      default:
        img = '';
    }
    this.addImage('block', img + '.png', true);
  };
  entities.Tile.__name__ = true;
  entities.Tile.__super__ = age.display.Entity;
  entities.Tile.prototype = $extend(age.display.Entity.prototype, {});
  entities.bonus = {};
  entities.bonus.Box = function (pX, pY) {
    age.display.Entity.call(this, 20, 20);
    this.x = pX;
    this.y = pY;
    var movements = new behaviors.GravityMovements(this);
    this.addBehavior('movements', movements);
  };
  entities.bonus.Box.__name__ = true;
  entities.bonus.Box.__super__ = age.display.Entity;
  entities.bonus.Box.prototype = $extend(age.display.Entity.prototype, {
    update: function () {
      if (this._collisions == null)
        this._collisions = this.getBehavior('collisions');
      this._collisions.setInitPos(this.x, this.y);
      age.display.Entity.prototype.update.call(this);
    },
    use: function (pPlayer) {},
    destroy: function () {
      age.display.Entity.prototype.destroy.call(this);
    },
  });
  entities.bonus.BoxExplosive = function (pX, pY) {
    entities.bonus.Box.call(this, pX, pY);
    this.addImage('explosiveBox', 'explosiveBox', true);
  };
  entities.bonus.BoxExplosive.__name__ = true;
  entities.bonus.BoxExplosive.__super__ = entities.bonus.Box;
  entities.bonus.BoxExplosive.prototype = $extend(
    entities.bonus.Box.prototype,
    {}
  );
  entities.bonus.BoxPoints = function (pX, pY) {
    entities.bonus.Box.call(this, pX, pY);
    this._value = age.utils.MathUtil.randomValue(1, 5) * 100;
    this.addImage('pointsBox', 'pointsBox', true);
  };
  entities.bonus.BoxPoints.__name__ = true;
  entities.bonus.BoxPoints.__super__ = entities.bonus.Box;
  entities.bonus.BoxPoints.prototype = $extend(entities.bonus.Box.prototype, {
    use: function (pPlayer) {
      managers.UiManager.getInstance().displayWeapon(
        Std.string(this._value),
        Math.round(pPlayer.x + pPlayer.width / 2),
        pPlayer.y - 10
      );
      managers.ScoreManager.getInstance().addScore(pPlayer.id, this._value);
    },
  });
  entities.bonus.BoxWeapon = function (pX, pY) {
    entities.bonus.Box.call(this, pX, pY);
    this.addImage('weaponBox', 'weaponBox', true);
  };
  entities.bonus.BoxWeapon.__name__ = true;
  entities.bonus.BoxWeapon.__super__ = entities.bonus.Box;
  entities.bonus.BoxWeapon.prototype = $extend(entities.bonus.Box.prototype, {
    use: function (pPlayer) {
      pPlayer.changeWeapon(this.addRandomWeapon(pPlayer));
    },
    addRandomWeapon: function (pPlayer) {
      var weapon =
        Data.weapons[
          age.utils.MathUtil.randomValue(0, Data.weapons.length - 1)
        ];
      managers.UiManager.getInstance().displayWeapon(
        weapon.name,
        Math.round(pPlayer.x + pPlayer.width / 2),
        pPlayer.y - 10
      );
      managers.ScoreManager.getInstance().addScore(pPlayer.id, 10);
      return weapon;
    },
  });
  entities.monsters = {};
  entities.monsters.BaseMonster = function (
    pX,
    pY,
    pWidth,
    pHeight,
    pSrc,
    pTotalFrames,
    pFrameRate
  ) {
    this.hitAnim = 0;
    age.display.AnimatedEntity.call(
      this,
      pWidth,
      pHeight,
      pSrc,
      pTotalFrames,
      pFrameRate
    );
    this.x = pX;
    this.y = pY;
  };
  entities.monsters.BaseMonster.__name__ = true;
  entities.monsters.BaseMonster.__super__ = age.display.AnimatedEntity;
  entities.monsters.BaseMonster.prototype = $extend(
    age.display.AnimatedEntity.prototype,
    {
      hit: function (pDamage) {
        this._life -= pDamage;
        this.play('hit');
        this.hitAnim = 7;
        if (this._life <= 0) this.dead = true;
      },
      update: function () {
        if (this.hitAnim > 0) {
          this.hitAnim--;
          if (this.hitAnim == 0) this.play('default');
        }
        if (this._collisions == null)
          this._collisions = this.getBehavior('collisions');
        this._collisions.setInitPos(this.x, this.y);
        age.display.AnimatedEntity.prototype.update.call(this);
      },
      destroy: function () {
        age.display.AnimatedEntity.prototype.destroy.call(this);
      },
    }
  );
  entities.monsters.BasicMonster = function (pX, pY, pDirection) {
    this.score = 10;
    this._life = 2;
    entities.monsters.BaseMonster.call(this, pX, pY, 22, 22, 'animMob1', 2, 4);
    var movements = new behaviors.AiMovements(this, pDirection, 3);
    this.addBehavior('movements', movements);
    this.addImage('hit', 'animMob1Hit');
  };
  entities.monsters.BasicMonster.__name__ = true;
  entities.monsters.BasicMonster.__super__ = entities.monsters.BaseMonster;
  entities.monsters.BasicMonster.prototype = $extend(
    entities.monsters.BaseMonster.prototype,
    {}
  );
  entities.monsters.BigMonster = function (pX, pY, pDirection) {
    this.score = 150;
    this._life = 8;
    entities.monsters.BaseMonster.call(this, pX, pY, 50, 50, 'animMob2', 1, 4);
    var movements = new behaviors.AiMovements(this, pDirection, 3);
    this.addBehavior('movements', movements);
    this.addImage('hit', 'animMob2Hit');
  };
  entities.monsters.BigMonster.__name__ = true;
  entities.monsters.BigMonster.__super__ = entities.monsters.BaseMonster;
  entities.monsters.BigMonster.prototype = $extend(
    entities.monsters.BaseMonster.prototype,
    {}
  );
  var haxe = {};
  haxe.Timer = function (time_ms) {
    var me = this;
    this.id = setInterval(function () {
      me.run();
    }, time_ms);
  };
  haxe.Timer.__name__ = true;
  haxe.Timer.stamp = function () {
    return new Date().getTime() / 1000;
  };
  haxe.Timer.prototype = {
    run: function () {},
  };
  haxe.ds = {};
  haxe.ds.IntMap = function () {
    this.h = {};
  };
  haxe.ds.IntMap.__name__ = true;
  haxe.ds.IntMap.__interfaces__ = [IMap];
  haxe.ds.IntMap.prototype = {
    set: function (key, value) {
      this.h[key] = value;
    },
    get: function (key) {
      return this.h[key];
    },
    exists: function (key) {
      return this.h.hasOwnProperty(key);
    },
    keys: function () {
      var a = [];
      for (var key in this.h) {
        if (this.h.hasOwnProperty(key)) a.push(key | 0);
      }
      return HxOverrides.iter(a);
    },
    iterator: function () {
      return {
        ref: this.h,
        it: this.keys(),
        hasNext: function () {
          return this.it.hasNext();
        },
        next: function () {
          var i = this.it.next();
          return this.ref[i];
        },
      };
    },
  };
  haxe.ds.StringMap = function () {
    this.h = {};
  };
  haxe.ds.StringMap.__name__ = true;
  haxe.ds.StringMap.__interfaces__ = [IMap];
  haxe.ds.StringMap.prototype = {
    set: function (key, value) {
      this.h['$' + key] = value;
    },
    get: function (key) {
      return this.h['$' + key];
    },
    exists: function (key) {
      return this.h.hasOwnProperty('$' + key);
    },
    remove: function (key) {
      key = '$' + key;
      if (!this.h.hasOwnProperty(key)) return false;
      delete this.h[key];
      return true;
    },
    keys: function () {
      var a = [];
      for (var key in this.h) {
        if (this.h.hasOwnProperty(key)) a.push(key.substr(1));
      }
      return HxOverrides.iter(a);
    },
    iterator: function () {
      return {
        ref: this.h,
        it: this.keys(),
        hasNext: function () {
          return this.it.hasNext();
        },
        next: function () {
          var i = this.it.next();
          return this.ref['$' + i];
        },
      };
    },
  };
  var js = {};
  js.Boot = function () {};
  js.Boot.__name__ = true;
  js.Boot.__string_rec = function (o, s) {
    if (o == null) return 'null';
    if (s.length >= 5) return '<...>';
    var t = typeof o;
    if (t == 'function' && (o.__name__ || o.__ename__)) t = 'object';
    switch (t) {
      case 'object':
        if (o instanceof Array) {
          if (o.__enum__) {
            if (o.length == 2) return o[0];
            var str = o[0] + '(';
            s += '\t';
            var _g1 = 2;
            var _g = o.length;
            while (_g1 < _g) {
              var i = _g1++;
              if (i != 2) str += ',' + js.Boot.__string_rec(o[i], s);
              else str += js.Boot.__string_rec(o[i], s);
            }
            return str + ')';
          }
          var l = o.length;
          var i1;
          var str1 = '[';
          s += '\t';
          var _g2 = 0;
          while (_g2 < l) {
            var i2 = _g2++;
            str1 += (i2 > 0 ? ',' : '') + js.Boot.__string_rec(o[i2], s);
          }
          str1 += ']';
          return str1;
        }
        var tostr;
        try {
          tostr = o.toString;
        } catch (e) {
          return '???';
        }
        if (tostr != null && tostr != Object.toString) {
          var s2 = o.toString();
          if (s2 != '[object Object]') return s2;
        }
        var k = null;
        var str2 = '{\n';
        s += '\t';
        var hasp = o.hasOwnProperty != null;
        for (var k in o) {
          if (hasp && !o.hasOwnProperty(k)) {
            continue;
          }
          if (
            k == 'prototype' ||
            k == '__class__' ||
            k == '__super__' ||
            k == '__interfaces__' ||
            k == '__properties__'
          ) {
            continue;
          }
          if (str2.length != 2) str2 += ', \n';
          str2 += s + k + ' : ' + js.Boot.__string_rec(o[k], s);
        }
        s = s.substring(1);
        str2 += '\n' + s + '}';
        return str2;
      case 'function':
        return '<function>';
      case 'string':
        return o;
      default:
        return String(o);
    }
  };
  var managers = {};
  managers.BonusManager = function () {
    this._boxVisible = false;
  };
  managers.BonusManager.__name__ = true;
  managers.BonusManager.getInstance = function () {
    if (managers.BonusManager._instance == null)
      managers.BonusManager._instance = new managers.BonusManager();
    return managers.BonusManager._instance;
  };
  managers.BonusManager.prototype = {
    init: function (pParent, pMap, pPlayer1, pPlayer2, pPlayer3, pPlayer4) {
      this._parent = pParent;
      this._map = pMap;
      this._player1 = pPlayer1;
      this._player2 = pPlayer2;
      this._player3 = pPlayer3;
      this._player4 = pPlayer4;
      this._lastSpawn = haxe.Timer.stamp() * 1000;
    },
    update: function () {
      if (!this._boxVisible) {
        var now = haxe.Timer.stamp() * 1000;
        if (now > this._lastSpawn + 10000) {
          this._boxVisible = true;
          var list = this._map.boxesSpots;
          var rndPoint =
            list[age.utils.MathUtil.randomValue(0, list.length - 1)];
          var rndBox = age.utils.MathUtil.randomValue(0, 1);
          switch (rndBox) {
            case 1:
              this._box = new entities.bonus.BoxPoints(rndPoint.x, rndPoint.y);
              break;
            default:
              this._box = new entities.bonus.BoxWeapon(rndPoint.x, rndPoint.y);
          }
          this._parent.add(this._box);
          this._map.registerCollisions(this._box);
        }
      } else if (this._player1.collideEntity(this._box))
        this.manageBox(this._player1);
      else if (this._player2 != null && this._player2.collideEntity(this._box))
        this.manageBox(this._player2);
      else if (this._player3 != null && this._player3.collideEntity(this._box))
        this.manageBox(this._player3);
      else if (this._player4 != null && this._player4.collideEntity(this._box))
        this.manageBox(this._player4);
    },
    manageBox: function (pPlayer) {
      this._boxVisible = false;
      this._box['use'](pPlayer);
      this._parent.remove(this._box);
      this._lastSpawn = haxe.Timer.stamp() * 1000;
    },
    resetAfterPause: function (pValue) {
      this._lastSpawn += pValue;
    },
    clean: function () {
      this._boxVisible = false;
      this._parent.remove(this._box);
      this._box = null;
    },
  };
  managers.BulletManager = function () {
    this._bullets = new List();
  };
  managers.BulletManager.__name__ = true;
  managers.BulletManager.getInstance = function () {
    if (managers.BulletManager._instance == null)
      managers.BulletManager._instance = new managers.BulletManager();
    return managers.BulletManager._instance;
  };
  managers.BulletManager.prototype = {
    init: function (pParent, pMap) {
      this._parent = pParent;
      this._map = pMap;
    },
    createBullet: function (pX, pY, pAngle, pDistance, pSpeed, pShooter) {
      var b = new entities.Bullet(pX, pY, pShooter);
      b.addBehavior(
        'movements',
        new behaviors.BulletMovements(b, pAngle, pDistance, pSpeed)
      );
      this._map.registerCollisions(b);
      this._bullets.add(b);
      this._parent.add(b);
    },
    update: function () {
      var $it0 = this._bullets.iterator();
      while ($it0.hasNext()) {
        var p = $it0.next();
        if (p.dead) {
          this._bullets.remove(p);
          this._parent.remove(p);
        }
      }
    },
    getBullets: function () {
      return this._bullets;
    },
    getEntitiesOnScreen: function () {
      return this._bullets.length;
    },
    clean: function () {
      var $it0 = this._bullets.iterator();
      while ($it0.hasNext()) {
        var p = $it0.next();
        this._bullets.remove(p);
        this._parent.remove(p);
      }
      this._bullets = new List();
    },
  };
  managers.MonsterManager = function () {};
  managers.MonsterManager.__name__ = true;
  managers.MonsterManager.getInstance = function () {
    if (managers.MonsterManager._instance == null)
      managers.MonsterManager._instance = new managers.MonsterManager();
    return managers.MonsterManager._instance;
  };
  managers.MonsterManager.prototype = {
    init: function (pParent, pMap) {
      this._parent = pParent;
      this._map = pMap;
      this._lastWave = haxe.Timer.stamp() * 1000 - this._map.timelapsWave;
      this._monsters = new List();
    },
    resetAfterPause: function (pValue) {
      this._lastWave += pValue;
    },
    update: function () {
      var now = haxe.Timer.stamp() * 1000;
      if (now > this._lastWave + this._map.timelapsWave) {
        var _this = this._map.nextWave();
        this._currentWaveMonsters = _this.slice();
        if (Math.random() > 0.5) this._currentWaveDirection = 1;
        else this._currentWaveDirection = -1;
        this._lastMonster = now - 700;
        this._lastWave = now;
      }
      this.updateWave();
      var $it0 = this._monsters.iterator();
      while ($it0.hasNext()) {
        var m = $it0.next();
        if (m.dead || m.y > age.core.Global.engine.stageHeight) {
          this._monsters.remove(m);
          this._parent.remove(m);
        }
      }
    },
    updateWave: function () {
      if (this._currentWaveMonsters != null) {
        var now = haxe.Timer.stamp() * 1000;
        if (now > this._lastMonster + 700) {
          var list = this._map.mobsSpots;
          var rndPoint =
            list[age.utils.MathUtil.randomValue(0, list.length - 1)];
          var id = this._currentWaveMonsters.pop();
          var mob;
          switch (id) {
            case 1:
              mob = new entities.monsters.BigMonster(
                rndPoint.x,
                rndPoint.y,
                this._currentWaveDirection
              );
              break;
            default:
              mob = new entities.monsters.BasicMonster(
                rndPoint.x,
                rndPoint.y,
                this._currentWaveDirection
              );
          }
          this._map.registerCollisions(mob);
          this._parent.add(mob);
          this._monsters.add(mob);
          if (this._currentWaveMonsters.length == 0)
            this._currentWaveMonsters = null;
          this._lastMonster = now;
        }
      }
    },
    getMonsters: function () {
      return this._monsters;
    },
    clean: function () {
      var $it0 = this._monsters.iterator();
      while ($it0.hasNext()) {
        var m = $it0.next();
        this._monsters.remove(m);
        this._parent.remove(m);
      }
      this._monsters = new List();
    },
  };
  managers.ScoreManager = function () {
    this._scores = new haxe.ds.IntMap();
    var value = new managers.PlayerScore(
      20,
      560,
      'hudPlayer1',
      age.display.text.TextAlign.LEFT
    );
    this._scores.set(1, value);
    var value1 = new managers.PlayerScore(
      780,
      560,
      'hudPlayer2',
      age.display.text.TextAlign.RIGHT
    );
    this._scores.set(2, value1);
    var value2 = new managers.PlayerScore(
      20,
      15,
      'hudPlayer3',
      age.display.text.TextAlign.LEFT
    );
    this._scores.set(3, value2);
    var value3 = new managers.PlayerScore(
      780,
      15,
      'hudPlayer4',
      age.display.text.TextAlign.RIGHT
    );
    this._scores.set(4, value3);
  };
  managers.ScoreManager.__name__ = true;
  managers.ScoreManager.getInstance = function () {
    if (managers.ScoreManager._instance == null)
      managers.ScoreManager._instance = new managers.ScoreManager();
    return managers.ScoreManager._instance;
  };
  managers.ScoreManager.prototype = {
    init: function (pMap, pNbPlayer) {
      this._nbPlayer = pNbPlayer;
      var _g1 = 0;
      var _g = this._nbPlayer;
      while (_g1 < _g) {
        var i = _g1++;
        this._scores.get(i + 1).init(pMap);
      }
    },
    addScoreWithCombo: function (pIdJoueur, pValue) {
      this._scores.get(pIdJoueur).addScoreWithCombo(pValue);
    },
    addScore: function (pIdJoueur, pValue) {
      this._scores.get(pIdJoueur).addScore(pValue);
    },
    clean: function () {
      var _g1 = 0;
      var _g = this._nbPlayer;
      while (_g1 < _g) {
        var i = _g1++;
        this._scores.get(i + 1).clean();
      }
    },
    update: function () {
      var $it0 = this._scores.iterator();
      while ($it0.hasNext()) {
        var i = $it0.next();
        i.update();
      }
    },
    resetAfterPause: function (pValue) {
      var $it0 = this._scores.iterator();
      while ($it0.hasNext()) {
        var i = $it0.next();
        i.resetAfterPause(pValue);
      }
    },
  };
  managers.PlayerScore = function (pX, pY, pImg, pAlignHorizontal) {
    this._hud = new age.display.ui.Img(
      pX - (pAlignHorizontal == age.display.text.TextAlign.LEFT ? 0 : 25),
      pY - 1,
      pImg
    );
    this._scoreText = new age.display.text.BasicText(
      '0',
      pAlignHorizontal == age.display.text.TextAlign.LEFT ? pX + 28 : pX - 28,
      pY
    );
    this._scoreText.setStyle('pixel', 25, '#FFF', null, pAlignHorizontal);
    this._comboInfoText = new age.display.text.BasicText(
      'combo',
      pX,
      pY + (pY == 15 ? 25 : -15)
    );
    this._comboInfoText.setStyle('pixel', 12, '#FFF');
  };
  managers.PlayerScore.__name__ = true;
  managers.PlayerScore.prototype = {
    init: function (pMap) {
      this._container = pMap;
      this._scoreText.text = '0';
      this._container.add(this._scoreText);
      this._container.add(this._hud);
      this._comboInfoText.visible = false;
      this._container.add(this._comboInfoText);
      this._score = 0;
      this._combo = 0;
      this._scoreForCombo = 0;
      this._lastScore = haxe.Timer.stamp() * 1000;
    },
    update: function () {
      var now = haxe.Timer.stamp() * 1000;
      if (this._combo > 0 && now > this._lastScore + 1500) {
        this._score += this._scoreForCombo * this._combo;
        this._scoreText.text = Std.string(this._score);
        this._comboInfoText.visible = false;
        this._combo = 0;
        this._scoreForCombo = 0;
      }
    },
    clean: function () {
      this._container.remove(this._scoreText);
      this._container.remove(this._hud);
      this._container.remove(this._comboInfoText);
    },
    resetAfterPause: function (pValue) {
      this._lastScore += pValue;
    },
    addScoreWithCombo: function (pValue) {
      this._combo++;
      this._scoreForCombo += pValue;
      this._lastScore = haxe.Timer.stamp() * 1000;
      this._comboInfoText.text = 'combo x' + this._combo;
      this._comboInfoText.visible = this._combo >= 1;
    },
    addScore: function (pValue) {
      this._score += pValue;
      this._scoreText.text = Std.string(this._score);
    },
  };
  managers.UiManager = function () {
    this._texts = new List();
  };
  managers.UiManager.__name__ = true;
  managers.UiManager.getInstance = function () {
    if (managers.UiManager._instance == null)
      managers.UiManager._instance = new managers.UiManager();
    return managers.UiManager._instance;
  };
  managers.UiManager.prototype = {
    init: function (pLayer) {
      this._layer = pLayer;
    },
    displayWeapon: function (pName, pX, pY) {
      var txt = new ui.LimitedText(pName, pX, pY);
      this._layer.add(txt);
      this._texts.add(txt);
    },
    update: function () {
      var $it0 = this._texts.iterator();
      while ($it0.hasNext()) {
        var t = $it0.next();
        if (t.dead) {
          this._layer.remove(t);
          this._texts.remove(t);
        }
      }
    },
  };
  var states = {};
  states.GameState = function (pIdLevel) {
    age.display.State.call(this);
    this._currentLevel = pIdLevel;
    this._pause = false;
    this._allDead = false;
  };
  states.GameState.__name__ = true;
  states.GameState.__super__ = age.display.State;
  states.GameState.prototype = $extend(age.display.State.prototype, {
    create: function () {
      var map = Data.levels[this._currentLevel];
      this._map = new TiledMap(map.map, map.waves, 25);
      this.add(this._map);
      this._bonusManager = managers.BonusManager.getInstance();
      var nbPlayer = 1;
      this._hero1 = new entities.Player(
        this._map.player1.x,
        this._map.player1.y,
        1,
        Data.PLAYER1_ID,
        Data.DEFAULT_WEAPON
      );
      this._map.registerCollisions(this._hero1);
      this.add(this._hero1);
      if (Data.PLAYER2_ID != -2) {
        this._hero2 = new entities.Player(
          this._map.player2.x,
          this._map.player2.y,
          2,
          Data.PLAYER2_ID,
          Data.DEFAULT_WEAPON
        );
        this._map.registerCollisions(this._hero2);
        this.add(this._hero2);
        nbPlayer++;
      }
      if (Data.PLAYER3_ID != -2) {
        this._hero3 = new entities.Player(
          this._map.player3.x,
          this._map.player3.y,
          3,
          Data.PLAYER3_ID,
          Data.DEFAULT_WEAPON
        );
        this._map.registerCollisions(this._hero3);
        this.add(this._hero3);
        nbPlayer++;
      }
      if (Data.PLAYER4_ID != -2) {
        this._hero4 = new entities.Player(
          this._map.player4.x,
          this._map.player4.y,
          4,
          Data.PLAYER4_ID,
          Data.DEFAULT_WEAPON
        );
        this._map.registerCollisions(this._hero4);
        this.add(this._hero4);
        nbPlayer++;
      }
      this._bulletManager = managers.BulletManager.getInstance();
      this._bulletManager.init(this, this._map);
      this._bonusManager.init(
        this,
        this._map,
        this._hero1,
        this._hero2,
        this._hero3,
        this._hero4
      );
      this._monstersContainer = new age.display.EntityContainer();
      this.add(this._monstersContainer);
      this._monsterManager = managers.MonsterManager.getInstance();
      this._monsterManager.init(this._monstersContainer, this._map);
      this._uiContainer = new age.display.EntityContainer();
      this.add(this._uiContainer);
      this._scoreManager = managers.ScoreManager.getInstance();
      this._scoreManager.init(this._uiContainer, nbPlayer);
      this._uiManager = managers.UiManager.getInstance();
      this._uiManager.init(this._uiContainer);
      this._pauseMenuContainer = new ui.PauseMenuContainer();
      this._pauseMenuContainer.visible = false;
      this.add(this._pauseMenuContainer);
    },
    update: function () {
      if (age.core.Input.pressed(27) && !this._allDead) {
        this._pause = !this._pause;
        if (this._pause) {
          this._pauseStarts = haxe.Timer.stamp() * 1000;
          this._pauseMenuContainer.openPauseMenu();
        } else {
          var delay = haxe.Timer.stamp() * 1000 - this._pauseStarts;
          this._bonusManager.resetAfterPause(delay);
          this._monsterManager.resetAfterPause(delay);
          this._scoreManager.resetAfterPause(delay);
          this._hero1.resetAfterPause(delay);
          if (this._hero2 != null) this._hero2.resetAfterPause(delay);
          if (this._hero3 != null) this._hero3.resetAfterPause(delay);
          if (this._hero4 != null) this._hero4.resetAfterPause(delay);
          this._pauseMenuContainer.visible = false;
        }
      }
      if (this._pauseMenuContainer.endGame) this.endGame();
      else if (this._pauseMenuContainer.restartGame) this.restartGame();
      if (this._pause) {
        this._pauseMenuContainer.update();
        return;
      }
      if (
        this._hero1.dead &&
        (this._hero2 == null || this._hero2.dead) &&
        (this._hero3 == null || this._hero3.dead) &&
        (this._hero4 == null || this._hero4.dead)
      ) {
        this._allDead = true;
        this._pause = true;
        this._pauseMenuContainer.openGameOverMenu();
        this._monsterManager.clean();
        this._bonusManager.clean();
        this._bulletManager.clean();
        return;
      }
      var bullets = this._bulletManager.getBullets();
      var mobs = this._monsterManager.getMonsters();
      var $it0 = bullets.iterator();
      while ($it0.hasNext()) {
        var bullet = $it0.next();
        if (bullet.dead) continue;
        var $it1 = mobs.iterator();
        while ($it1.hasNext()) {
          var mob = $it1.next();
          if (mob.dead) continue;
          if (mob.collideEntity(bullet)) {
            mob.hit(bullet.shooter.weapon.damage);
            bullet.dead = true;
            if (mob.dead)
              this._scoreManager.addScoreWithCombo(
                bullet.shooter.id,
                mob.score
              );
            else this._scoreManager.addScore(bullet.shooter.id, mob.score);
            break;
          }
        }
      }
      var $it2 = mobs.iterator();
      while ($it2.hasNext()) {
        var mob1 = $it2.next();
        if (!mob1.dead && mob1.collideEntity(this._hero1))
          this._hero1.dead = true;
        else if (
          this._hero2 != null &&
          !mob1.dead &&
          mob1.collideEntity(this._hero2)
        )
          this._hero2.dead = true;
        else if (
          this._hero3 != null &&
          !mob1.dead &&
          mob1.collideEntity(this._hero3)
        )
          this._hero3.dead = true;
        else if (
          this._hero4 != null &&
          !mob1.dead &&
          mob1.collideEntity(this._hero4)
        )
          this._hero4.dead = true;
      }
      this._monsterManager.update();
      this._bulletManager.update();
      this._bonusManager.update();
      this._scoreManager.update();
      this._uiManager.update();
      age.display.State.prototype.update.call(this);
    },
    endGame: function () {
      this.clean();
      age.core.Global.engine.switchState(new states.IntroState());
    },
    restartGame: function () {
      this.clean();
      age.core.Global.engine.switchState(
        new states.GameState(this._currentLevel)
      );
    },
    clean: function () {
      this._bulletManager.clean();
      this._bonusManager.clean();
      this._monsterManager.clean();
      this._scoreManager.clean();
    },
  });
  states.GamepadSelectionState = function () {
    age.display.State.call(this);
    this._currentPlayer = 0;
  };
  states.GamepadSelectionState.__name__ = true;
  states.GamepadSelectionState.__super__ = age.display.State;
  states.GamepadSelectionState.prototype = $extend(
    age.display.State.prototype,
    {
      create: function () {
        this._p1 = new ui.GamepadSelectionContainer(25, 130, 1);
        this._p2 = new ui.GamepadSelectionContainer(215, 130, 2);
        this._p3 = new ui.GamepadSelectionContainer(405, 130, 3);
        this._p4 = new ui.GamepadSelectionContainer(595, 130, 4);
        if (Data.PLAYER1_ID != -2) {
          this._p1.displayController(
            Data.PLAYER1_ID == -1
              ? ui.ControllerName.KEYBOARD
              : ui.ControllerName.GENERIC
          );
          this._currentPlayer = 1;
          this._p1.displayChoice();
        }
        this.add(this._p1);
        if (Data.PLAYER2_ID != -2) {
          this._p2.displayController(
            Data.PLAYER2_ID == -1
              ? ui.ControllerName.KEYBOARD
              : ui.ControllerName.GENERIC
          );
          this._currentPlayer = 2;
          this._p2.displayChoice();
        }
        this.add(this._p2);
        if (Data.PLAYER3_ID != -2) {
          this._p3.displayController(
            Data.PLAYER3_ID == -1
              ? ui.ControllerName.KEYBOARD
              : ui.ControllerName.GENERIC
          );
          this._currentPlayer = 3;
          this._p3.displayChoice();
        }
        this.add(this._p3);
        if (Data.PLAYER4_ID != -2) {
          this._p4.displayController(
            Data.PLAYER4_ID == -1
              ? ui.ControllerName.KEYBOARD
              : ui.ControllerName.GENERIC
          );
          this._currentPlayer = 4;
          this._p4.displayChoice();
        }
        this.add(this._p4);
        this.add(new age.display.ui.Rect(0, 0, 800, 100, '#000', 0.5));
        this._textInfo = new age.display.text.BasicText(
          'PLAYER ' + (this._currentPlayer + 1) + ' - Press START',
          400,
          20
        );
        this._textInfo.setStyle(
          'pixel',
          24,
          '#FFF',
          false,
          age.display.text.TextAlign.CENTER
        );
        this.add(this._textInfo);
        this._textPlay = new age.display.text.BasicText(
          'or click next to select a level',
          400,
          60
        );
        this._textPlay.setStyle(
          'pixel',
          24,
          '#FFF',
          false,
          age.display.text.TextAlign.CENTER
        );
        this._textPlay.visible = Data.PLAYER1_ID != -2;
        this.add(this._textPlay);
        var backBtn = new age.display.ui.Button(
          0,
          540,
          150,
          50,
          'BACK',
          'pixel',
          $bind(this, this.onClickBackBtn)
        );
        this.add(backBtn);
        this._nextBtn = new age.display.ui.Button(
          650,
          540,
          150,
          50,
          'NEXT',
          'pixel',
          $bind(this, this.onClickNextBtn)
        );
        this._nextBtn.enabled = Data.PLAYER1_ID != -2;
        this.add(this._nextBtn);
      },
      update: function () {
        if (this._currentPlayer >= 0 && this._currentPlayer < 4) {
          var idPressed = -2;
          if (age.core.Input.pressed(13)) idPressed = -1;
          else {
            var _g1 = 0;
            var _g = age.utils.GamepadSupport.NB_PAD;
            while (_g1 < _g) {
              var i = _g1++;
              if (age.utils.GamepadSupport.pressed(i, 9)) {
                idPressed = i;
                break;
              }
            }
          }
          if (
            idPressed != -2 &&
            idPressed != Data.PLAYER1_ID &&
            idPressed != Data.PLAYER2_ID &&
            idPressed != Data.PLAYER3_ID &&
            idPressed != Data.PLAYER4_ID
          ) {
            var _g2 = this._currentPlayer;
            switch (_g2) {
              case 0:
                Data.PLAYER1_ID = idPressed;
                this._p1.displayController(
                  idPressed == -1
                    ? ui.ControllerName.KEYBOARD
                    : ui.ControllerName.GENERIC
                );
                this._p1.displayChoice();
                break;
              case 1:
                Data.PLAYER2_ID = idPressed;
                this._p2.displayController(
                  idPressed == -1
                    ? ui.ControllerName.KEYBOARD
                    : ui.ControllerName.GENERIC
                );
                this._p2.displayChoice();
                break;
              case 2:
                Data.PLAYER3_ID = idPressed;
                this._p3.displayController(
                  idPressed == -1
                    ? ui.ControllerName.KEYBOARD
                    : ui.ControllerName.GENERIC
                );
                this._p3.displayChoice();
                break;
              case 3:
                Data.PLAYER4_ID = idPressed;
                this._p4.displayController(
                  idPressed == -1
                    ? ui.ControllerName.KEYBOARD
                    : ui.ControllerName.GENERIC
                );
                this._p4.displayChoice();
                break;
            }
            this._currentPlayer++;
            this._textInfo.text =
              'PLAYER ' + (this._currentPlayer + 1) + ' - Press START';
            this._textPlay.visible = true;
            this._nextBtn.enabled = true;
          } else if (
            (idPressed != -2 &&
              this._currentPlayer == 1 &&
              idPressed == Data.PLAYER1_ID &&
              Data.PLAYER1_ID != -2) ||
            (this._currentPlayer == 2 &&
              idPressed == Data.PLAYER2_ID &&
              Data.PLAYER2_ID != -2) ||
            (this._currentPlayer == 3 &&
              idPressed == Data.PLAYER3_ID &&
              Data.PLAYER3_ID != -2) ||
            (this._currentPlayer == 4 &&
              idPressed == Data.PLAYER4_ID &&
              Data.PLAYER4_ID != -2)
          ) {
            this._currentPlayer--;
            var _g3 = this._currentPlayer;
            switch (_g3) {
              case 0:
                Data.PLAYER1_ID = -2;
                this._p1.hideChoice();
                break;
              case 1:
                Data.PLAYER2_ID = -2;
                this._p2.hideChoice();
                break;
              case 2:
                Data.PLAYER3_ID = -2;
                this._p3.hideChoice();
                break;
              case 3:
                Data.PLAYER4_ID = -2;
                this._p4.hideChoice();
                break;
            }
            this._textInfo.text =
              'PLAYER ' + (this._currentPlayer + 1) + ' - Press START';
            this._nextBtn.enabled = this._textPlay.visible =
              Data.PLAYER1_ID != -2;
          }
        }
        age.display.State.prototype.update.call(this);
      },
      onClickBackBtn: function () {
        age.core.Global.engine.switchState(new states.IntroState());
      },
      onClickNextBtn: function () {
        age.core.Global.engine.switchState(new states.LevelSelectionState());
      },
    }
  );
  states.IntroState = function () {
    age.display.State.call(this);
  };
  states.IntroState.__name__ = true;
  states.IntroState.__super__ = age.display.State;
  states.IntroState.prototype = $extend(age.display.State.prototype, {
    create: function () {
      var title = new age.display.text.BasicText('Arena Invasion', 400, 50);
      title.textBaseline = age.display.text.TextBaseline.MIDDLE;
      title.setStyle(
        'pixel',
        42,
        '#000',
        true,
        age.display.text.TextAlign.CENTER
      );
      this.add(title);
      var arcadeBtn = new age.display.ui.Button(
        250,
        200,
        300,
        50,
        'ARCADE MODE',
        'pixel',
        $bind(this, this.onClickArcadeBtn)
      );
      this.add(arcadeBtn);
      var helpBtn = new age.display.ui.Button(0, 480, 200, 50, 'HELP', 'pixel');
      helpBtn.enabled = false;
      this.add(helpBtn);
      var optionsBtn = new age.display.ui.Button(
        0,
        540,
        300,
        50,
        'OPTIONS',
        'pixel'
      );
      optionsBtn.enabled = false;
      this.add(optionsBtn);
      var quitBtn = new age.display.ui.Button(
        730,
        510,
        80,
        50,
        'QUIT',
        'pixel',
        $bind(this, this.onClickQuickBtn)
      );
      this.add(quitBtn);
    },
    onClickArcadeBtn: function () {
      Data.PLAYER1_ID = -2;
      Data.PLAYER2_ID = -2;
      Data.PLAYER3_ID = -2;
      Data.PLAYER4_ID = -2;
      age.core.Global.engine.switchState(new states.GamepadSelectionState());
    },
    onClickQuickBtn: function () {
      var gui = require('nw.gui');
      gui.App.quit();
    },
  });
  states.LevelSelectionState = function () {
    age.display.State.call(this);
    this._currentLvlDisplayed = 0;
    this._levels = Data.levels;
  };
  states.LevelSelectionState.__name__ = true;
  states.LevelSelectionState.__super__ = age.display.State;
  states.LevelSelectionState.prototype = $extend(age.display.State.prototype, {
    create: function () {
      this._thumbnail = new age.display.ui.Img(
        250,
        150,
        this._levels[this._currentLvlDisplayed].thumbnail
      );
      this.add(this._thumbnail);
      this.add(new age.display.ui.Rect(0, 0, 800, 100, '#000', 0.5));
      var infoText = new age.display.text.BasicText(
        'player 1 - choose a level',
        400,
        20
      );
      infoText.setStyle(
        'pixel',
        24,
        '#FFF',
        false,
        age.display.text.TextAlign.CENTER
      );
      this.add(infoText);
      this.add(new age.display.ui.Rect(0, 432, 800, 60, '#000', 0.5));
      this._bestScore = new age.display.text.BasicText('best : 0', 400, 450);
      this._bestScore.setStyle(
        'pixel',
        24,
        '#FFF',
        false,
        age.display.text.TextAlign.CENTER
      );
      this.add(this._bestScore);
      this._levelTitle = new age.display.text.BasicText(
        this._levels[this._currentLvlDisplayed].title,
        400,
        60
      );
      this._levelTitle.setStyle(
        'pixel',
        24,
        '#FFF',
        false,
        age.display.text.TextAlign.CENTER
      );
      this.add(this._levelTitle);
      var leftArrow = new age.display.text.BasicText('<', 200, 230);
      leftArrow.setStyle(
        'pixel',
        70,
        '#000',
        false,
        age.display.text.TextAlign.CENTER
      );
      this.add(leftArrow);
      var rightArrow = new age.display.text.BasicText('>', 600, 230);
      rightArrow.setStyle(
        'pixel',
        70,
        '#000',
        false,
        age.display.text.TextAlign.CENTER
      );
      this.add(rightArrow);
      var backBtn = new age.display.ui.Button(
        0,
        540,
        150,
        50,
        'BACK',
        'pixel',
        $bind(this, this.onClickBackBtn)
      );
      this.add(backBtn);
      var nextBtn = new age.display.ui.Button(
        650,
        540,
        150,
        50,
        'play',
        'pixel',
        $bind(this, this.onClickPlayBtn)
      );
      this.add(nextBtn);
    },
    update: function () {
      if (age.core.Input.pressed(37)) {
        if (this._currentLvlDisplayed == 0)
          this._currentLvlDisplayed = this._levels.length - 1;
        else this._currentLvlDisplayed--;
        this.displayLevel(this._currentLvlDisplayed);
      } else if (age.core.Input.pressed(39)) {
        if (this._currentLvlDisplayed >= this._levels.length - 1)
          this._currentLvlDisplayed = 0;
        else this._currentLvlDisplayed++;
        this.displayLevel(this._currentLvlDisplayed);
      }
      age.display.State.prototype.update.call(this);
    },
    displayLevel: function (pId) {
      this._thumbnail.changeImg(
        this._levels[this._currentLvlDisplayed].thumbnail
      );
      this._levelTitle.text = this._levels[this._currentLvlDisplayed].title;
    },
    onClickBackBtn: function () {
      age.core.Global.engine.switchState(new states.GamepadSelectionState());
    },
    onClickPlayBtn: function () {
      age.core.Global.engine.switchState(
        new states.GameState(this._currentLvlDisplayed)
      );
    },
  });
  var ui = {};
  ui.GamepadSelectionContainer = function (pX, pY, pIdPlayer) {
    age.display.EntityContainer.call(this);
    this.x = pX;
    this.y = pY;
    this.width = 180;
    this.height = 350;
    this._bg = new age.display.ui.Img(this.x, this.y, 'playerSelection');
    this.add(this._bg);
    this._rectCharacter = new age.display.ui.Rect(
      this.x + 10,
      this.y + 10,
      160,
      160,
      '#000',
      0.2
    );
    this._character = new age.display.ui.Img(
      this.x + 55,
      this.y + 50,
      'minPlayer' + pIdPlayer
    );
    this._txtPlayer = new age.display.text.BasicText(
      'PLAYER ' + pIdPlayer,
      this.x + 90,
      this.y + 190
    );
    this._txtPlayer.setStyle(
      'pixel',
      24,
      '#000',
      false,
      age.display.text.TextAlign.CENTER
    );
    this.displayController(ui.ControllerName.NONE);
  };
  ui.GamepadSelectionContainer.__name__ = true;
  ui.GamepadSelectionContainer.__super__ = age.display.EntityContainer;
  ui.GamepadSelectionContainer.prototype = $extend(
    age.display.EntityContainer.prototype,
    {
      displayController: function (pName) {
        var img;
        switch (pName[1]) {
          case 1:
            img = 'xbox';
            break;
          case 0:
            img = 'keyboard';
            break;
          case 2:
            img = 'ps3';
            break;
          case 3:
            img = 'genericGamepad';
            break;
          default:
            img = 'questionmark';
        }
        if (this._controller == null) {
          this._controller = new age.display.ui.Img(
            this.x + 26,
            this.y + 220,
            img
          );
          this.add(this._controller);
        } else this._controller.changeImg(img);
      },
      displayChoice: function () {
        this.add(this._rectCharacter);
        this.add(this._txtPlayer);
        this.add(this._character);
      },
      hideChoice: function () {
        this.displayController(ui.ControllerName.NONE);
        this.remove(this._rectCharacter);
        this.remove(this._txtPlayer);
        this.remove(this._character);
      },
    }
  );
  ui.ControllerName = {
    __ename__: true,
    __constructs__: ['KEYBOARD', 'XBOX', 'PS3', 'GENERIC', 'NONE'],
  };
  ui.ControllerName.KEYBOARD = ['KEYBOARD', 0];
  ui.ControllerName.KEYBOARD.__enum__ = ui.ControllerName;
  ui.ControllerName.XBOX = ['XBOX', 1];
  ui.ControllerName.XBOX.__enum__ = ui.ControllerName;
  ui.ControllerName.PS3 = ['PS3', 2];
  ui.ControllerName.PS3.__enum__ = ui.ControllerName;
  ui.ControllerName.GENERIC = ['GENERIC', 3];
  ui.ControllerName.GENERIC.__enum__ = ui.ControllerName;
  ui.ControllerName.NONE = ['NONE', 4];
  ui.ControllerName.NONE.__enum__ = ui.ControllerName;
  ui.LimitedText = function (pText, pX, pY) {
    age.display.text.BasicText.call(this, pText, pX, pY);
    this.setStyle(
      'pixel',
      18,
      '#000',
      false,
      age.display.text.TextAlign.CENTER
    );
    this.dead = false;
    this._speed = -1;
    this._duration = 1000;
    this._spawnTime = haxe.Timer.stamp() * 1000;
  };
  ui.LimitedText.__name__ = true;
  ui.LimitedText.__super__ = age.display.text.BasicText;
  ui.LimitedText.prototype = $extend(age.display.text.BasicText.prototype, {
    update: function () {
      var now = haxe.Timer.stamp() * 1000;
      if (now > this._spawnTime + this._duration) this.dead = true;
      this.y += this._speed;
      age.display.text.BasicText.prototype.update.call(this);
    },
  });
  ui.PauseMenuContainer = function () {
    age.display.EntityContainer.call(this);
    this.endGame = false;
    this.restartGame = false;
    this.add(new age.display.ui.Rect(0, 230, 800, 150, '#000', 0.5));
    this._title = new age.display.text.BasicText('', 400, 240);
    this._title.setStyle(
      'pixel',
      25,
      '#FFF',
      false,
      age.display.text.TextAlign.CENTER
    );
    this.add(this._title);
    var restartBtn = new age.display.ui.Button(
      310,
      280,
      180,
      40,
      'restart',
      'pixel',
      $bind(this, this.onClickRestartBtn)
    );
    this.add(restartBtn);
    var quitBtn = new age.display.ui.Button(
      310,
      330,
      180,
      40,
      'quit',
      'pixel',
      $bind(this, this.onClickQuitBtn)
    );
    this.add(quitBtn);
  };
  ui.PauseMenuContainer.__name__ = true;
  ui.PauseMenuContainer.__super__ = age.display.EntityContainer;
  ui.PauseMenuContainer.prototype = $extend(
    age.display.EntityContainer.prototype,
    {
      openPauseMenu: function () {
        this._title.text = 'Pause - esc to continue';
        this.visible = true;
      },
      openGameOverMenu: function () {
        this._title.text = 'Game over';
        this.visible = true;
      },
      onClickRestartBtn: function () {
        if (this.visible) this.restartGame = true;
      },
      onClickQuitBtn: function () {
        if (this.visible) this.endGame = true;
      },
    }
  );
  var weapons = {};
  weapons.IWeapon = function () {};
  weapons.IWeapon.__name__ = true;
  weapons.DoubleGun = function () {
    this.name = 'double gun';
    this.damage = 1;
    this.firelaps = 400;
    this.ammunition = 20;
    this.ammunitionPerShoot = 2;
    this.boxPoints = 30;
  };
  weapons.DoubleGun.__name__ = true;
  weapons.DoubleGun.__interfaces__ = [weapons.IWeapon];
  weapons.DoubleGun.prototype = {
    fire: function (pShooter, pDirection) {
      managers.BulletManager.getInstance().createBullet(
        pShooter.x,
        pShooter.y,
        90,
        200,
        6,
        pShooter
      );
      managers.BulletManager.getInstance().createBullet(
        pShooter.x,
        pShooter.y,
        -90,
        200,
        6,
        pShooter
      );
    },
  };
  weapons.MachineGun = function () {
    this.name = 'machine gun';
    this.damage = 1;
    this.firelaps = 80;
    this.ammunition = 50;
    this.ammunitionPerShoot = 1;
    this.boxPoints = 100;
  };
  weapons.MachineGun.__name__ = true;
  weapons.MachineGun.__interfaces__ = [weapons.IWeapon];
  weapons.MachineGun.prototype = {
    fire: function (pShooter, pDirection) {
      managers.BulletManager.getInstance().createBullet(
        pShooter.x,
        pShooter.y,
        pDirection * 90,
        300,
        6,
        pShooter
      );
    },
  };
  weapons.Magnum = function () {
    this.name = 'magnum';
    this.damage = 2;
    this.firelaps = 700;
    this.ammunition = 10;
    this.ammunitionPerShoot = 1;
    this.boxPoints = 20;
  };
  weapons.Magnum.__name__ = true;
  weapons.Magnum.__interfaces__ = [weapons.IWeapon];
  weapons.Magnum.prototype = {
    fire: function (pShooter, pDirection) {
      managers.BulletManager.getInstance().createBullet(
        pShooter.x,
        pShooter.y,
        pDirection * 90,
        200,
        6,
        pShooter
      );
    },
  };
  weapons.Revolver = function () {
    this.name = 'revolver';
    this.damage = 1;
    this.firelaps = 400;
    this.ammunition = -1;
    this.ammunitionPerShoot = 1;
    this.boxPoints = 5;
  };
  weapons.Revolver.__name__ = true;
  weapons.Revolver.__interfaces__ = [weapons.IWeapon];
  weapons.Revolver.prototype = {
    fire: function (pShooter, pDirection) {
      managers.BulletManager.getInstance().createBullet(
        pShooter.x,
        pShooter.y,
        pDirection * 90,
        200,
        6,
        pShooter
      );
    },
  };
  weapons.Shotgun = function () {
    this.name = 'shotgun';
    this.damage = 1;
    this.firelaps = 1000;
    this.ammunitionPerShoot = 3;
    this.boxPoints = 80;
  };
  weapons.Shotgun.__name__ = true;
  weapons.Shotgun.__interfaces__ = [weapons.IWeapon];
  weapons.Shotgun.prototype = {
    fire: function (pShooter, pDirection) {
      var startX = Math.round(pShooter.x + pShooter.width / 2);
      var startY = pShooter.y;
      managers.BulletManager.getInstance().createBullet(
        startX,
        startY,
        pDirection * 80,
        70,
        5,
        pShooter
      );
      managers.BulletManager.getInstance().createBullet(
        startX,
        startY,
        pDirection * 90,
        70,
        5,
        pShooter
      );
      managers.BulletManager.getInstance().createBullet(
        startX,
        startY,
        pDirection * 100,
        70,
        5,
        pShooter
      );
    },
  };
  var $_,
    $fid = 0;
  function $bind(o, m) {
    if (m == null) return null;
    if (m.__id__ == null) m.__id__ = $fid++;
    var f;
    if (o.hx__closures__ == null) o.hx__closures__ = {};
    else f = o.hx__closures__[m.__id__];
    if (f == null) {
      f = function () {
        return f.method.apply(f.scope, arguments);
      };
      f.scope = o;
      f.method = m;
      o.hx__closures__[m.__id__] = f;
    }
    return f;
  }
  if (Array.prototype.indexOf)
    HxOverrides.indexOf = function (a, o, i) {
      return Array.prototype.indexOf.call(a, o, i);
    };
  Math.NaN = Number.NaN;
  Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
  Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
  Math.isFinite = function (i) {
    return isFinite(i);
  };
  Math.isNaN = function (i1) {
    return isNaN(i1);
  };
  String.__name__ = true;
  Array.__name__ = true;
  Date.__name__ = ['Date'];
  Data.DEFAULT_PLAYER_ID = -2;
  Data.PLAYER1_ID = -2;
  Data.PLAYER2_ID = -2;
  Data.PLAYER3_ID = -2;
  Data.PLAYER4_ID = -2;
  Data.TILE_SIZE = 25;
  Data.BOX_WEAPON_SCORE = 10;
  Data.BOX_POINTS_MIN = 1;
  Data.BOX_POINTS_MAX = 5;
  Main.DEFAULT_FONT = 'pixel';
  Main.DEFAULT_PATH = '/assets/img/portfolio/ArenaInvasion/';
  age.Assets._cacheImg = new haxe.ds.StringMap();
  age.Assets._cacheText = new haxe.ds.StringMap();
  age.Assets._cacheSounds = new haxe.ds.StringMap();
  age.Loader.LOADED = 0;
  age.Loader.ERROR = 0;
  age.Loader._dataToLoad = new List();
  age.Loader._totalToLoad = 0;
  age.core.Input._key = new Array();
  age.core.Input._keyNum = 0;
  age.core.Input._press = new Array();
  age.core.Input._pressNum = 0;
  age.core.Input._release = new Array();
  age.core.Input._releaseNum = 0;
  age.core.Input._control = new haxe.ds.StringMap();
  age.core.Input.mousePosition = { x: 0, y: 0 };
  age.utils.GamepadSupport.GAMEPAD_SENSITIVITY = 0.5;
  age.utils.HtmlUtils.VENDOR_PREFIXES = ['webkit', 'moz', 'ms', 'o', 'khtml'];
  age.utils.Key.ANY = -1;
  age.utils.Key.LEFT = 37;
  age.utils.Key.UP = 38;
  age.utils.Key.RIGHT = 39;
  age.utils.Key.DOWN = 40;
  age.utils.Key.ENTER = 13;
  age.utils.Key.COMMAND = 15;
  age.utils.Key.CONTROL = 17;
  age.utils.Key.SPACE = 32;
  age.utils.Key.SHIFT = 16;
  age.utils.Key.BACKSPACE = 8;
  age.utils.Key.CAPS_LOCK = 20;
  age.utils.Key.DELETE = 46;
  age.utils.Key.END = 35;
  age.utils.Key.ESCAPE = 27;
  age.utils.Key.HOME = 36;
  age.utils.Key.INSERT = 45;
  age.utils.Key.TAB = 9;
  age.utils.Key.PAGE_DOWN = 34;
  age.utils.Key.PAGE_UP = 33;
  age.utils.Key.LEFT_SQUARE_BRACKET = 219;
  age.utils.Key.RIGHT_SQUARE_BRACKET = 221;
  age.utils.Key.A = 97;
  age.utils.Key.B = 98;
  age.utils.Key.C = 99;
  age.utils.Key.D = 100;
  age.utils.Key.E = 101;
  age.utils.Key.F = 102;
  age.utils.Key.G = 103;
  age.utils.Key.H = 104;
  age.utils.Key.I = 105;
  age.utils.Key.J = 106;
  age.utils.Key.K = 107;
  age.utils.Key.L = 108;
  age.utils.Key.M = 109;
  age.utils.Key.N = 78;
  age.utils.Key.O = 111;
  age.utils.Key.P = 112;
  age.utils.Key.Q = 113;
  age.utils.Key.R = 114;
  age.utils.Key.S = 115;
  age.utils.Key.T = 116;
  age.utils.Key.U = 117;
  age.utils.Key.V = 118;
  age.utils.Key.W = 119;
  age.utils.Key.X = 120;
  age.utils.Key.Y = 121;
  age.utils.Key.Z = 122;
  age.utils.Key.F1 = 112;
  age.utils.Key.F2 = 113;
  age.utils.Key.F3 = 114;
  age.utils.Key.F4 = 115;
  age.utils.Key.F5 = 116;
  age.utils.Key.F6 = 117;
  age.utils.Key.F7 = 118;
  age.utils.Key.F8 = 119;
  age.utils.Key.F9 = 120;
  age.utils.Key.F10 = 121;
  age.utils.Key.F11 = 122;
  age.utils.Key.F12 = 123;
  age.utils.Key.F13 = 124;
  age.utils.Key.F14 = 125;
  age.utils.Key.F15 = 126;
  age.utils.Key.DIGIT_0 = 48;
  age.utils.Key.DIGIT_1 = 49;
  age.utils.Key.DIGIT_2 = 50;
  age.utils.Key.DIGIT_3 = 51;
  age.utils.Key.DIGIT_4 = 52;
  age.utils.Key.DIGIT_5 = 53;
  age.utils.Key.DIGIT_6 = 54;
  age.utils.Key.DIGIT_7 = 55;
  age.utils.Key.DIGIT_8 = 56;
  age.utils.Key.DIGIT_9 = 57;
  age.utils.Key.NUMPAD_0 = 96;
  age.utils.Key.NUMPAD_1 = 97;
  age.utils.Key.NUMPAD_2 = 98;
  age.utils.Key.NUMPAD_3 = 99;
  age.utils.Key.NUMPAD_4 = 100;
  age.utils.Key.NUMPAD_5 = 101;
  age.utils.Key.NUMPAD_6 = 102;
  age.utils.Key.NUMPAD_7 = 103;
  age.utils.Key.NUMPAD_8 = 104;
  age.utils.Key.NUMPAD_9 = 105;
  age.utils.Key.NUMPAD_ADD = 107;
  age.utils.Key.NUMPAD_DECIMAL = 110;
  age.utils.Key.NUMPAD_DIVIDE = 111;
  age.utils.Key.NUMPAD_ENTER = 108;
  age.utils.Key.NUMPAD_MULTIPLY = 106;
  age.utils.Key.NUMPAD_SUBTRACT = 109;
  age.utils.Key.GAMEPAD_A = 0;
  age.utils.Key.GAMEPAD_B = 1;
  age.utils.Key.GAMEPAD_X = 2;
  age.utils.Key.GAMEPAD_Y = 3;
  age.utils.Key.GAMEPAD_LB = 4;
  age.utils.Key.GAMEPAD_RB = 5;
  age.utils.Key.GAMEPAD_LT = 6;
  age.utils.Key.GAMEPAD_RT = 7;
  age.utils.Key.GAMEPAD_BACK = 8;
  age.utils.Key.GAMEPAD_START = 9;
  age.utils.Key.GAMEPAD_LEFT_STICK_BTN = 10;
  age.utils.Key.GAMEPAD_RIGHT_STICK_BTN = 11;
  age.utils.Key.GAMEPAD_TOP_BTN = 12;
  age.utils.Key.GAMEPAD_BOTTOM_BTN = 13;
  age.utils.Key.GAMEPAD_LEFT_BTN = 14;
  age.utils.Key.GAMEPAD_RIGHT_BTN = 15;
  age.utils.MathUtil.PI = 3.141592654;
  entities.monsters.BaseMonster.NORMAL_ANIM = 'default';
  entities.monsters.BaseMonster.HIT_ANIM = 'hit';
  managers.BonusManager.SPAWN_TIME = 10000;
  managers.MonsterManager.SPAWN_TIME = 700;
  managers.ScoreManager.COMBO_TIME = 1500;
  states.GameState.BOARD_WIDTH = 5;
  states.GameState.BOARD_HEIGHT = 5;
  Main.main();
})();
