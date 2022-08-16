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
    first: function () {
      if (this.h == null) return null;
      else return this.h[0];
    },
    last: function () {
      if (this.q == null) return null;
      else return this.q[0];
    },
    clear: function () {
      this.h = null;
      this.q = null;
      this.length = 0;
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
      this.stageScaleX = this.stageWidth / stgWidth;
      this.stageScaleY = this.stageHeight / stgHeight;
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
      new planet.states.GameState(),
      null,
      30,
      '',
      'game'
    );
  };
  Main.__name__ = true;
  Main.main = function () {
    age.Loader.addResource(
      'img/green.png',
      age.ResourceType.IMAGE,
      'greenShipImg'
    );
    age.Loader.addResource('img/red.png', age.ResourceType.IMAGE, 'redShipImg');
    age.Loader.addResource('img/earth.png', age.ResourceType.IMAGE, 'earthImg');
    age.Loader.addResource(
      'img/earth_selected.png',
      age.ResourceType.IMAGE,
      'earthImgSelected'
    );
    age.Loader.addResource('img/moon.png', age.ResourceType.IMAGE, 'moonImg');
    age.Loader.addResource(
      'img/moon_selected.png',
      age.ResourceType.IMAGE,
      'moonImgSelected'
    );
    age.Loader.addResource('img/mars.png', age.ResourceType.IMAGE, 'marsImg');
    age.Loader.addResource(
      'img/mars_selected.png',
      age.ResourceType.IMAGE,
      'marsImgSelected'
    );
    age.Loader.addResource('img/heart.png', age.ResourceType.IMAGE, 'heartImg');
    age.Loader.addResource(
      'img/explosion.png',
      age.ResourceType.IMAGE,
      'explosionAnim'
    );
    age.Loader.addResource(
      'img/time.png',
      age.ResourceType.IMAGE,
      'hourglassImg'
    );
    age.Loader.start(function () {
      window.document.getElementById('loader').remove();
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
      age.Loader.onResourceError(pName);
    };
    image.src = pSrc;
  };
  age.Loader.loadText = function (pName, pSrc) {
    var r = new XMLHttpRequest();
    r.open('GET', pSrc, true);
    r.onerror = function (pEvt) {
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
  age.core.IEntity = function () {};
  age.core.IEntity.__name__ = true;
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
  age.display = {};
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
  age.managers = {};
  age.managers.SoundManager = function () {
    this._globalVolume = 0.8;
    var AudioContext = age.utils.HtmlUtils.loadExtension('AudioContext').value;
    if (AudioContext != null) this._context = new AudioContext();
    else null;
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
    null;
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
    stop: function () {
      if (this.id == null) return;
      clearInterval(this.id);
      this.id = null;
    },
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
  var planet = {};
  planet.FightHandler = function () {};
  planet.FightHandler.__name__ = true;
  planet.FightHandler.fight = function (pPlanet, pShip1, pShip2) {
    if (pShip1 == null || pShip2 == null) return;
    var life1 = pShip1.life;
    var life2 = pShip2.life;
    pShip1.life = life1 - 1;
    pShip2.life = life2 - 1;
    age.core.Global.currentState.add(
      new planet.entities.Explosion(pShip1.x, pShip1.y)
    );
    age.core.Global.currentState.add(
      new planet.entities.Explosion(pShip2.x, pShip2.y)
    );
    if (pShip1.life <= 0) {
      pPlanet.removeShip(pShip1);
      age.core.Global.currentState.remove(pShip1);
    }
    if (pShip2.life <= 0) {
      pPlanet.removeShip(pShip2);
      age.core.Global.currentState.remove(pShip2);
    }
  };
  planet.FightHandler.waveFight = function (pPlanet, pWave1, pWave2) {};
  planet.PlayerIA = function (pDifficulty) {
    this._difficulty = pDifficulty;
    this.canPlay = false;
    this._lastTime = haxe.Timer.stamp() * 1000;
  };
  planet.PlayerIA.__name__ = true;
  planet.PlayerIA.prototype = {
    update: function () {
      var now = haxe.Timer.stamp() * 1000;
      if (
        !this.canPlay &&
        now - this._lastTime >
          planet.DifficultyEnum.getTimerValue(this._difficulty)
      ) {
        this.canPlay = true;
        this._lastTime = now;
      }
    },
    turnComplete: function () {
      this.canPlay = false;
    },
    reset: function () {
      this.canPlay = false;
      this._difficulty = null;
    },
  };
  planet.Difficulty = {
    __ename__: true,
    __constructs__: ['EASY', 'MEDIUM', 'HARD'],
  };
  planet.Difficulty.EASY = ['EASY', 0];
  planet.Difficulty.EASY.__enum__ = planet.Difficulty;
  planet.Difficulty.MEDIUM = ['MEDIUM', 1];
  planet.Difficulty.MEDIUM.__enum__ = planet.Difficulty;
  planet.Difficulty.HARD = ['HARD', 2];
  planet.Difficulty.HARD.__enum__ = planet.Difficulty;
  planet.DifficultyEnum = function () {};
  planet.DifficultyEnum.__name__ = true;
  planet.DifficultyEnum.getTimerValue = function (pDifficulty) {
    switch (pDifficulty[1]) {
      case 0:
        return 3000;
      case 1:
        return 2000;
      case 2:
        return 1000;
    }
  };
  planet.behaviors = {};
  planet.behaviors.OrbitBehavior = function (pEntity, pSpeed) {
    this.entity = pEntity;
    this.activated = false;
    this._speed = pSpeed;
    this.angle = 0;
  };
  planet.behaviors.OrbitBehavior.__name__ = true;
  planet.behaviors.OrbitBehavior.__interfaces__ = [age.core.IBehavior];
  planet.behaviors.OrbitBehavior.prototype = {
    setOrbit: function (pOrbitCenter, pRadius) {
      this._orbitCenter = pOrbitCenter;
      this._radius = pRadius;
      this.angle = 0;
    },
    update: function () {
      this.angle -= this._speed;
      this.entity.x = Math.round(
        this._orbitCenter.x + Math.cos(this.angle * 2 * Math.PI) * this._radius
      );
      this.entity.y = Math.round(
        this._orbitCenter.y + Math.sin(this.angle * 2 * Math.PI) * this._radius
      );
      if (this.angle < -1) this.angle = 0;
    },
    destroy: function () {
      this._orbitCenter = null;
      this.entity = null;
    },
  };
  planet.behaviors.TravellingBehavior = function (pEntity, pSpeed) {
    this.entity = pEntity;
    this.activated = false;
    this._speed = pSpeed;
  };
  planet.behaviors.TravellingBehavior.__name__ = true;
  planet.behaviors.TravellingBehavior.__interfaces__ = [age.core.IBehavior];
  planet.behaviors.TravellingBehavior.prototype = {
    setDestination: function (pDestination) {
      this._destination = pDestination;
    },
    update: function () {
      var angle = Math.atan2(
        this._destination.y - this.entity.y,
        this._destination.x - this.entity.x
      );
      this.entity.x += Math.round(Math.cos(angle) * this._speed);
      this.entity.y += Math.round(Math.sin(angle) * this._speed);
    },
    destroy: function () {
      this._destination = null;
      this.entity = null;
    },
  };
  planet.entities = {};
  planet.entities.ConquestTime = function (pX, pY) {
    age.display.Entity.call(this, 20, 19);
    this.x = pX;
    this.y = pY;
    this.addImage('time', 'hourglassImg', true);
  };
  planet.entities.ConquestTime.__name__ = true;
  planet.entities.ConquestTime.__super__ = age.display.Entity;
  planet.entities.ConquestTime.prototype = $extend(
    age.display.Entity.prototype,
    {
      update: function () {
        if (!this.visible) return;
        this.rotation += 5;
        if (this.rotation > 360) this.rotation -= 360;
        age.display.Entity.prototype.update.call(this);
      },
    }
  );
  planet.entities.Explosion = function (pX, pY) {
    age.display.AnimatedEntity.call(this, 23, 20, 'explosionAnim', 5, 12);
    this._loop = false;
    this.x = pX;
    this.y = pY;
  };
  planet.entities.Explosion.__name__ = true;
  planet.entities.Explosion.__super__ = age.display.AnimatedEntity;
  planet.entities.Explosion.prototype = $extend(
    age.display.AnimatedEntity.prototype,
    {
      onAnimationComplete: function () {
        age.core.Global.currentState.remove(this);
      },
    }
  );
  planet.entities.Planet = function (pName, pType, pX, pY, pOwner, pIsRegen) {
    if (pIsRegen == null) pIsRegen = false;
    var bounds = planet.enums.PlanetTypeEnum.getSize(pType);
    age.display.Entity.call(this, bounds.width, bounds.height);
    this.addImage('normal', planet.enums.PlanetTypeEnum.getAsset(pType), true);
    this.addImage(
      'selected',
      planet.enums.PlanetTypeEnum.getAsset(pType) + 'Selected'
    );
    this.name = pName;
    this.owner = pOwner;
    this.x = pX;
    this.y = pY;
    this.centerPoint = {
      x: Math.round(this.x + this.width * 0.5 - 10),
      y: Math.round(this.y + this.height * 0.5 - 10),
    };
    this.allies = new List();
    this.enemies = new List();
    this.text = new age.display.text.BasicText(
      '0',
      this.get_centerPoint().x + 10,
      this.get_centerPoint().y
    );
    this.text.setStyle(
      'pixelade',
      25,
      planet.enums.TeamEnum.getColor(this.owner),
      true,
      age.display.text.TextAlign.CENTER
    );
    this.set_shipsNeededForConquest(0);
    this.isRegen = pIsRegen;
    if (this.isRegen) this.addHeart();
  };
  planet.entities.Planet.__name__ = true;
  planet.entities.Planet.__super__ = age.display.Entity;
  planet.entities.Planet.prototype = $extend(age.display.Entity.prototype, {
    selected: function (pVal) {
      this.play(pVal ? 'selected' : 'normal');
    },
    addHeart: function () {
      this._regenTimer = 0;
      if (this._heart == null) {
        this._heart = new age.display.Entity(21, 19);
        this._heart.addImage('heart', 'heartImg', true);
        this._heart.x = this.get_centerPoint().x;
        this._heart.y = this.text.y - 20;
      }
    },
    set_shipsNeededForConquest: function (pVal) {
      if (pVal > 0 && this.owner == planet.enums.Team.NEUTRAL) {
        this.shipsNeededForConquest = pVal;
        this._timeForConquest = this.shipsNeededForConquest * 100;
        this.text.text = Std.string(this.shipsNeededForConquest);
        return this.shipsNeededForConquest;
      }
      return 0;
    },
    get_radius: function () {
      return 80;
    },
    get_shipsNumber: function () {
      return this.allies.length;
    },
    addNewShip: function () {
      var ship = new planet.entities.Ship(this, this.owner);
      this.addShip(ship);
      age.core.Global.currentState.add(ship);
    },
    addShip: function (pShip) {
      var last = null;
      if (pShip.owner == this.owner) {
        if (this.enemies.length > 0) last = this.enemies.last();
        else last = this.allies.last();
        pShip.life *= 2;
        this.allies.add(pShip);
        this.text.text = Std.string(this.allies.length);
      } else if (
        this.owner == planet.enums.Team.NEUTRAL &&
        (this.enemies.length == 0 || pShip.owner == this.enemies.first().owner)
      ) {
        last = this.enemies.last();
        if (last == null) last = this.allies.last();
        this.enemies.add(pShip);
      } else {
        var ship1 = this.allies.first();
        last = this.enemies.last();
        this.enemies.add(pShip);
        planet.FightHandler.fight(this, ship1, pShip);
      }
      pShip.setDefaultAngle(last == null ? 0 : last.getOrbitAngle() + 0.02);
    },
    removeShip: function (pShip) {
      if (pShip.owner == this.owner) {
        pShip.life = 1;
        this.allies.remove(pShip);
        this.text.text = Std.string(this.allies.length);
      } else {
        this.enemies.remove(pShip);
        if (
          this.enemies.length == 0 &&
          this.owner == planet.enums.Team.NEUTRAL &&
          this._conquestTimer != null
        ) {
          this.removeConquestTimer();
          this.text.color = planet.enums.TeamEnum.getColor(
            planet.enums.Team.NEUTRAL
          );
          this.text.text = Std.string(this.shipsNeededForConquest);
        }
      }
    },
    get_centerPoint: function () {
      return this.centerPoint;
    },
    addConquestTimer: function (pTime) {
      this._conquestTimer = new haxe.Timer(pTime);
      this._conquestTimer.run = $bind(this, this.onConquestComplete);
      if (this._conquestGraphic == null) {
        this._conquestGraphic = new planet.entities.ConquestTime(
          this.get_centerPoint().x - 25,
          this.text.y - 20
        );
        age.core.Global.currentState.add(this._conquestGraphic);
      } else this._conquestGraphic.visible = true;
    },
    removeConquestTimer: function () {
      this._conquestTimer.stop();
      this._conquestTimer = null;
      this._conquestGraphic.visible = false;
    },
    onConquestComplete: function () {
      this._conquestTimer.stop();
      this._conquestTimer = null;
      this._conquestGraphic.visible = false;
      this._conquestGraphic.rotation = 0;
      this.owner = this.enemies.first().owner;
      var $it0 = this.enemies.iterator();
      while ($it0.hasNext()) {
        var ship = $it0.next();
        this.allies.add(ship);
      }
      this.enemies.clear();
      this.text.color = planet.enums.TeamEnum.getColor(this.owner);
      this.text.text = Std.string(this.allies.length);
      if (this.isRegen) this.addHeart();
    },
    update: function () {
      if (this.owner == planet.enums.Team.NEUTRAL) {
        if (this._conquestTimer == null) {
          var conquest = Math.max(
            0,
            this.shipsNeededForConquest - this.enemies.length
          );
          if (conquest == null) this.text.text = 'null';
          else this.text.text = '' + conquest;
          if (conquest == 0) this.addConquestTimer(this._timeForConquest);
        }
      } else if (this.allies.length == 0 && this.enemies.length > 0) {
        if (this._conquestTimer == null)
          this.addConquestTimer(this._timeForConquest);
      }
      if (this.isRegen) {
        if (this.allies.length > 0) {
          this._regenTimer++;
          if (this._regenTimer > 100) {
            this.addNewShip();
            this._regenTimer = 0;
          }
        }
      }
      age.display.Entity.prototype.update.call(this);
    },
    render: function (pContext) {
      age.display.Entity.prototype.render.call(this, pContext);
      if (this.text != null) this.text.render(pContext);
      if (this._heart != null) this._heart.render(pContext);
    },
  });
  planet.entities.Ship = function (pPlanet, pOwner) {
    age.display.Entity.call(this);
    this.addImage('ship', planet.enums.TeamEnum.getShip(pOwner), true);
    this._planet = pPlanet;
    this.owner = pOwner;
    this.life = 1;
    this.attack = 1;
    this.defense = 1;
    this._orbitBehavior = new planet.behaviors.OrbitBehavior(this, 0.007);
    this._orbitBehavior.setOrbit(this._planet.get_centerPoint(), 80);
    this._orbitBehavior.activated = true;
    this.addBehavior('orbit', this._orbitBehavior);
    this._travellingBehavior = new planet.behaviors.TravellingBehavior(this, 3);
    this.addBehavior('travel', this._travellingBehavior);
  };
  planet.entities.Ship.__name__ = true;
  planet.entities.Ship.__super__ = age.display.Entity;
  planet.entities.Ship.prototype = $extend(age.display.Entity.prototype, {
    travelTo: function (pPlanet) {
      this._orbitBehavior.activated = false;
      this._travellingBehavior.setDestination(pPlanet.get_centerPoint());
      this._travellingBehavior.activated = true;
      this._planet.removeShip(this);
      this._planet = pPlanet;
    },
    setDefaultAngle: function (pVal) {
      this._orbitBehavior.angle = pVal;
    },
    getOrbitAngle: function () {
      return this._orbitBehavior.angle;
    },
    update: function () {
      if (
        this._travellingBehavior.activated &&
        age.core.Global.collide(this._planet, this.x, this.y)
      ) {
        this._travellingBehavior.activated = false;
        this._orbitBehavior.setOrbit(this._planet.get_centerPoint(), 80);
        this._orbitBehavior.activated = true;
        this._planet.addShip(this);
      }
      age.display.Entity.prototype.update.call(this);
    },
  });
  planet.enums = {};
  planet.enums.PlanetTypeEnum = function () {};
  planet.enums.PlanetTypeEnum.__name__ = true;
  planet.enums.PlanetTypeEnum.getAsset = function (pType) {
    switch (pType[1]) {
      case 0:
        return 'earthImg';
      case 1:
        return 'moonImg';
      case 2:
        return 'marsImg';
    }
  };
  planet.enums.PlanetTypeEnum.getSize = function (pType) {
    switch (pType[1]) {
      case 0:
        return { x: 0, y: 0, width: 121, height: 118 };
      case 1:
        return { x: 0, y: 0, width: 118, height: 118 };
      case 2:
        return { x: 0, y: 0, width: 125, height: 119 };
    }
  };
  planet.enums.PlanetType = {
    __ename__: true,
    __constructs__: ['EARTH', 'MOON', 'MARS'],
  };
  planet.enums.PlanetType.EARTH = ['EARTH', 0];
  planet.enums.PlanetType.EARTH.__enum__ = planet.enums.PlanetType;
  planet.enums.PlanetType.MOON = ['MOON', 1];
  planet.enums.PlanetType.MOON.__enum__ = planet.enums.PlanetType;
  planet.enums.PlanetType.MARS = ['MARS', 2];
  planet.enums.PlanetType.MARS.__enum__ = planet.enums.PlanetType;
  planet.enums.Team = {
    __ename__: true,
    __constructs__: ['FRIEND', 'ENEMY', 'NEUTRAL'],
  };
  planet.enums.Team.FRIEND = ['FRIEND', 0];
  planet.enums.Team.FRIEND.__enum__ = planet.enums.Team;
  planet.enums.Team.ENEMY = ['ENEMY', 1];
  planet.enums.Team.ENEMY.__enum__ = planet.enums.Team;
  planet.enums.Team.NEUTRAL = ['NEUTRAL', 2];
  planet.enums.Team.NEUTRAL.__enum__ = planet.enums.Team;
  planet.enums.TeamEnum = function () {};
  planet.enums.TeamEnum.__name__ = true;
  planet.enums.TeamEnum.getColor = function (pTeam) {
    switch (pTeam[1]) {
      case 0:
        return '#228B22';
      case 1:
        return '#B22222';
      case 2:
        return '#000';
    }
  };
  planet.enums.TeamEnum.getShip = function (pTeam) {
    switch (pTeam[1]) {
      case 0:
        return 'greenShipImg';
      case 1:
        return 'redShipImg';
      case 2:
        return '';
    }
  };
  planet.states = {};
  planet.states.GameState = function () {
    age.display.State.call(this);
    this._pause = false;
    this._planets = new List();
    this._gameEnded = false;
  };
  planet.states.GameState.__name__ = true;
  planet.states.GameState.__super__ = age.display.State;
  planet.states.GameState.prototype = $extend(age.display.State.prototype, {
    create: function () {
      this._ia = new planet.PlayerIA(planet.Difficulty.EASY);
      age.core.Input.registerGlobalClickHandler($bind(this, this.clickHandler));
      var t = new age.display.text.BasicText('Planets Experiment Demo', 10, 10);
      t.setStyle('pixelade', 25, '#FFF');
      this.add(t);
      this.addPlanet(
        'earth',
        planet.enums.PlanetType.EARTH,
        50,
        70,
        planet.enums.Team.FRIEND,
        20,
        true
      );
      this.addPlanet(
        'moon',
        planet.enums.PlanetType.MOON,
        500,
        80,
        planet.enums.Team.NEUTRAL,
        30,
        true
      );
      this.addPlanet(
        'mars',
        planet.enums.PlanetType.MARS,
        200,
        240,
        planet.enums.Team.NEUTRAL,
        30
      );
      this.addPlanet(
        'earth',
        planet.enums.PlanetType.EARTH,
        600,
        300,
        planet.enums.Team.ENEMY,
        20,
        true
      );
      this.addPlanet(
        'moon',
        planet.enums.PlanetType.MOON,
        30,
        450,
        planet.enums.Team.NEUTRAL,
        30,
        true
      );
      this.addPlanet(
        'mars',
        planet.enums.PlanetType.MARS,
        400,
        400,
        planet.enums.Team.NEUTRAL,
        30,
        true
      );
    },
    addPlanet: function (pName, pType, pX, pY, pOwner, pShips, pIsRegen) {
      if (pIsRegen == null) pIsRegen = false;
      if (pShips == null) pShips = 0;
      var planet1 = new planet.entities.Planet(
        pName,
        pType,
        pX,
        pY,
        pOwner,
        pIsRegen
      );
      this.add(planet1);
      this._planets.add(planet1);
      if (pOwner != planet.enums.Team.NEUTRAL && pShips > 0)
        this.addShip(planet1, pOwner, pShips);
      else if (pOwner == planet.enums.Team.NEUTRAL)
        planet1.set_shipsNeededForConquest(pShips);
      return planet1;
    },
    addShip: function (pPlanet, pOwner, pNumber) {
      if (pNumber == null) pNumber = 1;
      var ship = null;
      var _g = 0;
      while (_g < pNumber) {
        var i = _g++;
        ship = new planet.entities.Ship(pPlanet, pOwner);
        this.add(ship);
        pPlanet.addShip(ship);
      }
    },
    clickHandler: function (pEvt) {
      var bounds = age.core.Input.getCanvasBounds();
      var mouseX = pEvt.clientX - bounds.left;
      var mouseY = pEvt.clientY - bounds.top;
      var found = false;
      var $it0 = this._planets.iterator();
      while ($it0.hasNext()) {
        var planet1 = $it0.next();
        if (age.core.Global.collide(planet1, mouseX, mouseY)) {
          if (
            this._selectedPlanet != null &&
            planet1 != this._selectedPlanet &&
            (this._selectedPlanet.owner == planet.enums.Team.FRIEND ||
              this._selectedPlanet.enemies.length > 0)
          )
            this.sendWave(
              this._selectedPlanet,
              planet1,
              planet.enums.Team.FRIEND
            );
          else if (
            this._selectedPlanet != null &&
            (planet1 == this._selectedPlanet ||
              this._selectedPlanet.owner == planet.enums.Team.FRIEND)
          ) {
            this._selectedPlanet.selected(false);
            this._selectedPlanet = null;
          } else {
            if (this._selectedPlanet != null)
              this._selectedPlanet.selected(false);
            this._selectedPlanet = planet1;
            this._selectedPlanet.selected(true);
          }
          found = true;
          break;
        }
      }
      if (!found && this._selectedPlanet != null) {
        this._selectedPlanet.selected(false);
        this._selectedPlanet = null;
      }
    },
    sendWave: function (pFrom, pTo, pSenderTeam) {
      var list;
      if (pFrom.owner == pSenderTeam) list = pFrom.allies;
      else list = pFrom.enemies;
      var len = Math.round(list.length / 2);
      var cpt = 0;
      var $it0 = list.iterator();
      while ($it0.hasNext()) {
        var ship = $it0.next();
        ship.travelTo(pTo);
        if (++cpt >= len) break;
      }
    },
    update: function () {
      if (!this._pause) {
        this._ia.update();
        if (this._ia.canPlay) {
          this.handleIaTurn();
          this._ia.turnComplete();
        }
        age.display.State.prototype.update.call(this);
      }
      if (this.sameOwnerForAllPlanets()) {
        this._gameEnded = this._pause = true;
        var t = new age.display.text.BasicText(
          'Team ' +
            (this._planets.first().owner == planet.enums.Team.ENEMY
              ? 'red'
              : 'green') +
            ' win !',
          0,
          200
        );
        t.setStyle('pixelade', 30, '#FFF');
        t.x = Math.round((age.core.Global.engine.stageWidth - t.width) / 2);
        this.add(t);
      }
    },
    sameOwnerForAllPlanets: function () {
      var firstOwner = this._planets.first().owner;
      if (firstOwner == planet.enums.Team.NEUTRAL) return false;
      var $it0 = this._planets.iterator();
      while ($it0.hasNext()) {
        var p = $it0.next();
        if (p.owner != firstOwner) return false;
      }
      return true;
    },
    handleIaTurn: function () {
      var iaAllies = new Array();
      var others = new Array();
      var all = new Array();
      var $it0 = this._planets.iterator();
      while ($it0.hasNext()) {
        var p = $it0.next();
        if (this.withIAShips(p)) iaAllies.push(p);
        else others.push(p);
        all.push(p);
      }
      var _g = 0;
      while (_g < iaAllies.length) {
        var p1 = iaAllies[_g];
        ++_g;
        p1.coeff = 0;
        if (p1.isRegen && p1.get_shipsNumber() < 10) p1.coeff -= 200;
        else if (p1.isRegen && p1.get_shipsNumber() < 5) p1.coeff -= 300;
        if (p1.owner == planet.enums.Team.ENEMY)
          p1.coeff += 120 + p1.get_shipsNumber();
        else if (this.withIAShips(p1))
          p1.coeff += p1.enemies.length - p1.shipsNeededForConquest;
      }
      var pos = iaAllies.filter($bind(this, this.filterCoeffPos));
      var startPlanet = null;
      if (pos.length > 0) {
        var v = 0;
        startPlanet = pos[v];
      }
      if (startPlanet == null) return;
      var _g1 = 0;
      while (_g1 < all.length) {
        var p2 = all[_g1];
        ++_g1;
        p2.coeff = 0;
        if (p2 == startPlanet) {
          p2.coeff = -1000;
          continue;
        }
        if (p2.isRegen && p2.owner != planet.enums.Team.ENEMY) p2.coeff += 100;
        if (p2.owner == planet.enums.Team.NEUTRAL) {
          if (p2.enemies.length == 0) p2.coeff += 50;
          else if (p2.enemies.first().owner == planet.enums.Team.ENEMY)
            p2.coeff += 500 + p2.enemies.length;
          else p2.coeff -= 50;
          if (startPlanet.get_shipsNumber() / 2 > p2.shipsNeededForConquest)
            p2.coeff += 100;
          else if (startPlanet.get_shipsNumber() > p2.shipsNeededForConquest)
            p2.coeff += 20;
        } else if (p2.owner == planet.enums.Team.FRIEND) {
          if (p2.get_shipsNumber() == 0) p2.coeff += 200;
          if (p2.get_shipsNumber() > startPlanet.get_shipsNumber() * 2)
            p2.coeff += 100;
        } else null;
      }
      var endPlanet = this.getPlanet(all, 1);
      if (endPlanet != null) null;
      else null;
      if (endPlanet == null) return;
      this.sendWave(startPlanet, endPlanet, planet.enums.Team.ENEMY);
    },
    withIAShips: function (pPlanet, pShips) {
      if (pShips == null) pShips = 0;
      if (
        (pPlanet.owner == planet.enums.Team.ENEMY &&
          pPlanet.get_shipsNumber() > pShips) ||
        (pPlanet.owner == planet.enums.Team.NEUTRAL &&
          pPlanet.enemies.length > pShips &&
          pPlanet.enemies.first().owner == planet.enums.Team.ENEMY)
      )
        return true;
      return false;
    },
    getWavesForShips: function (pShipsOnPlanet, pMax) {
      var waves = 0;
      while (pShipsOnPlanet < pMax) {
        waves++;
        pShipsOnPlanet = Math.floor(pShipsOnPlanet / 2);
        if (pShipsOnPlanet <= 0) break;
      }
      return waves;
    },
    getPlanet: function (pPlanets, rand) {
      pPlanets.sort($bind(this, this.sortByCoeff));
      if (pPlanets.length < rand) rand = pPlanets.length;
      var l = pPlanets.slice(0, rand);
      return l[Math.round(Math.random() * (l.length - 1))];
    },
    sortByCoeff: function (p1, p2) {
      if (p1.coeff > p2.coeff) return -1;
      else if (p2.coeff > p1.coeff) return 1;
      return 0;
    },
    filterCoeffPos: function (p) {
      return p.coeff > 0;
    },
    distance: function (p1, p2) {
      var dx = p1.x - p2.x;
      var dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
  });
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
  if (Array.prototype.filter == null)
    Array.prototype.filter = function (f1) {
      var a1 = [];
      var _g11 = 0;
      var _g2 = this.length;
      while (_g11 < _g2) {
        var i1 = _g11++;
        var e = this[i1];
        if (f1(e)) a1.push(e);
      }
      return a1;
    };
  Main.DEFAULT_FONT = 'pixelade';
  Main.ASSETS_DIR = '/assets/img/portfolio/PlanetsExperiment/';
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
  planet.entities.Planet.REGEN_TIME = 100;
  Main.main();
})();
