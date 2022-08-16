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
  var CardColorHelper = function () {};
  CardColorHelper.__name__ = true;
  CardColorHelper.getImageFromColor = function (pColor) {
    switch (pColor[1]) {
      case 0:
        return 'card-seashell';
      case 1:
        return 'card';
      case 2:
        return 'card-blue';
      case 6:
        return 'card-pink';
      case 4:
        return 'card-green';
      case 5:
        return 'card-green4';
      case 3:
        return 'card-red';
      case 7:
        return 'card-yellow';
      case 8:
        return 'card-orange';
      case 9:
        return 'card-black';
    }
  };
  CardColorHelper.getRandomColor = function (pAuthColors, pIgnore) {
    var colors = pAuthColors.slice();
    if (pIgnore != null) {
      var _g = 0;
      while (_g < pIgnore.length) {
        var c = pIgnore[_g];
        ++_g;
        HxOverrides.remove(colors, c);
      }
    }
    var rnd = Std['int'](Math.random() * colors.length);
    return colors[rnd];
  };
  CardColorHelper.getNextColor = function (pColor) {
    switch (pColor[1]) {
      case 0:
        return CardColor.YELLOW;
      case 7:
        return CardColor.GREEN;
      case 4:
        return CardColor.DARK_GREEN;
      case 5:
        return CardColor.BLUE;
      case 2:
        return CardColor.PINK;
      case 6:
        return CardColor.ORANGE;
      case 8:
        return CardColor.RED;
      default:
        return null;
    }
  };
  CardColorHelper.getScoreFromColor = function (pColor) {
    switch (pColor[1]) {
      case 0:
        return 1;
      case 7:
        return 2;
      case 4:
        return 3;
      case 5:
        return 5;
      case 2:
        return 8;
      case 6:
        return 13;
      case 8:
        return 21;
      case 3:
        return 34;
      default:
        return 0;
    }
  };
  CardColorHelper.getRgbColorFromColor = function (pColor) {
    switch (pColor[1]) {
      case 0:
        return { r: 205, g: 197, b: 191 };
      case 7:
        return { r: 254, g: 233, b: 141 };
      case 4:
        return { r: 188, g: 227, b: 104 };
      case 5:
        return { r: 0, g: 139, b: 0 };
      case 2:
        return { r: 125, g: 184, b: 236 };
      case 6:
        return { r: 207, g: 140, b: 190 };
      case 8:
        return { r: 255, g: 165, b: 0 };
      case 3:
        return { r: 255, g: 100, b: 126 };
      default:
        return null;
    }
  };
  var CardColor = {
    __ename__: true,
    __constructs__: [
      'GREY',
      'WHITE',
      'BLUE',
      'RED',
      'GREEN',
      'DARK_GREEN',
      'PINK',
      'YELLOW',
      'ORANGE',
      'BLACK',
    ],
  };
  CardColor.GREY = ['GREY', 0];
  CardColor.GREY.__enum__ = CardColor;
  CardColor.WHITE = ['WHITE', 1];
  CardColor.WHITE.__enum__ = CardColor;
  CardColor.BLUE = ['BLUE', 2];
  CardColor.BLUE.__enum__ = CardColor;
  CardColor.RED = ['RED', 3];
  CardColor.RED.__enum__ = CardColor;
  CardColor.GREEN = ['GREEN', 4];
  CardColor.GREEN.__enum__ = CardColor;
  CardColor.DARK_GREEN = ['DARK_GREEN', 5];
  CardColor.DARK_GREEN.__enum__ = CardColor;
  CardColor.PINK = ['PINK', 6];
  CardColor.PINK.__enum__ = CardColor;
  CardColor.YELLOW = ['YELLOW', 7];
  CardColor.YELLOW.__enum__ = CardColor;
  CardColor.ORANGE = ['ORANGE', 8];
  CardColor.ORANGE.__enum__ = CardColor;
  CardColor.BLACK = ['BLACK', 9];
  CardColor.BLACK.__enum__ = CardColor;
  var ColorChanger = function () {};
  ColorChanger.__name__ = true;
  ColorChanger.createTransition = function (pId, forcedColor) {
    if (ColorChanger._timer != null) ColorChanger._timer.stop();
    var elm = window.document.getElementById(pId);
    var currentColor = ColorChanger.getElementBG(elm);
    var endColor;
    if (forcedColor == null) endColor = ColorChanger.generateRGB();
    else endColor = forcedColor;
    if (
      currentColor.r == endColor.r &&
      currentColor.g == endColor.g &&
      currentColor.b == endColor.b
    )
      return;
    var distance = ColorChanger.calculateDistance(currentColor, endColor);
    var increment = ColorChanger.calculateIncrement(distance);
    var iteration = Math.round(40);
    ColorChanger._timer = new haxe.Timer(iteration);
    ColorChanger._timer.run = function () {
      if (currentColor.r > endColor.r) {
        currentColor.r -= increment.r;
        if (currentColor.r <= endColor.r) increment.r = 0;
      } else {
        currentColor.r += increment.r;
        if (currentColor.r >= endColor.r) increment.r = 0;
      }
      if (currentColor.g > endColor.g) {
        currentColor.g -= increment.g;
        if (currentColor.g <= endColor.g) increment.g = 0;
      } else {
        currentColor.g += increment.g;
        if (currentColor.g >= endColor.g) increment.g = 0;
      }
      if (currentColor.b > endColor.b) {
        currentColor.b -= increment.b;
        if (currentColor.b <= endColor.b) increment.b = 0;
      } else {
        currentColor.b += increment.b;
        if (currentColor.b >= endColor.b) increment.b = 0;
      }
      elm.style.background = ColorChanger.rgb2hex(currentColor);
      if (increment.r == 0 && increment.g == 0 && increment.b == 0) {
        ColorChanger._timer.stop();
        ColorChanger._timer = null;
      }
    };
  };
  ColorChanger.getElementBG = function (pElem) {
    var bg = window.getComputedStyle(pElem).backgroundColor;
    bg = StringTools.replace(bg, 'rgb(', '');
    bg = StringTools.replace(bg, ')', '');
    var rgbStr = bg.split(',');
    return {
      r: Std.parseInt(rgbStr[0]),
      g: Std.parseInt(rgbStr[1]),
      b: Std.parseInt(rgbStr[2]),
    };
  };
  ColorChanger.generateRGB = function () {
    return {
      r: ColorChanger.getRandomValue(),
      g: ColorChanger.getRandomValue(),
      b: ColorChanger.getRandomValue(),
    };
  };
  ColorChanger.getRandomValue = function () {
    var num = Math.floor(Math.random() * 225);
    while (num < 25) num = Math.floor(Math.random() * 225);
    return num;
  };
  ColorChanger.calculateDistance = function (current, next) {
    return {
      r: Math.round(Math.abs(current.r - next.r)),
      g: Math.round(Math.abs(current.g - next.g)),
      b: Math.round(Math.abs(current.b - next.b)),
    };
  };
  ColorChanger.calculateIncrement = function (distance) {
    var incR = Std['int'](Math.abs(Math.floor(distance.r / 50)));
    var incG = Std['int'](Math.abs(Math.floor(distance.g / 50)));
    var incB = Std['int'](Math.abs(Math.floor(distance.b / 50)));
    return {
      r: incR + (incR == 0 ? 1 : 0),
      g: incG + (incG == 0 ? 1 : 0),
      b: incB + (incB == 0 ? 1 : 0),
    };
  };
  ColorChanger.rgb2hex = function (color) {
    return (
      '#' +
      StringTools.hex(color.r, 2) +
      StringTools.hex(color.g, 2) +
      StringTools.hex(color.b, 2)
    );
  };
  var ExplosionsManager = function () {};
  ExplosionsManager.__name__ = true;
  ExplosionsManager.init = function (pCtr) {
    if (ExplosionsManager._explosions != null) {
      var $it0 = ExplosionsManager._explosions.iterator();
      while ($it0.hasNext()) {
        var e = $it0.next();
        ExplosionsManager._container.remove(e);
      }
    }
    ExplosionsManager._explosions = new List();
    ExplosionsManager._container = pCtr;
  };
  ExplosionsManager.add = function (pX, pY) {
    var ex = new entities.Explosion(Math.round(pX), Math.round(pY));
    ExplosionsManager._container.add(ex);
    ExplosionsManager._explosions.add(ex);
  };
  ExplosionsManager.update = function () {
    var $it0 = ExplosionsManager._explosions.iterator();
    while ($it0.hasNext()) {
      var e = $it0.next();
      if (e.removeMe) {
        ExplosionsManager._container.remove(e);
        ExplosionsManager._explosions.remove(e);
      }
    }
  };
  var HxOverrides = function () {};
  HxOverrides.__name__ = true;
  HxOverrides.cca = function (s, index) {
    var x = s.charCodeAt(index);
    if (x != x) return undefined;
    return x;
  };
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
      350,
      500,
      new states.GameState(),
      true,
      60,
      '',
      'game'
    );
  };
  Main.__name__ = true;
  Main.main = function () {
    age.Loader.addResource('card.png', age.ResourceType.IMAGE, 'card');
    age.Loader.addResource(
      'card-blue.png',
      age.ResourceType.IMAGE,
      'card-blue'
    );
    age.Loader.addResource(
      'card-pink.png',
      age.ResourceType.IMAGE,
      'card-pink'
    );
    age.Loader.addResource(
      'card-green.png',
      age.ResourceType.IMAGE,
      'card-green'
    );
    age.Loader.addResource('card-red.png', age.ResourceType.IMAGE, 'card-red');
    age.Loader.addResource(
      'card-yellow.png',
      age.ResourceType.IMAGE,
      'card-yellow'
    );
    age.Loader.addResource(
      'card-orange.png',
      age.ResourceType.IMAGE,
      'card-orange'
    );
    age.Loader.addResource(
      'card-green4.png',
      age.ResourceType.IMAGE,
      'card-green4'
    );
    age.Loader.addResource(
      'card-seashell3.png',
      age.ResourceType.IMAGE,
      'card-seashell'
    );
    age.Loader.addResource(
      'card-black.png',
      age.ResourceType.IMAGE,
      'card-black'
    );
    age.Loader.addResource(
      'card-black-1.png',
      age.ResourceType.IMAGE,
      'card-black-1'
    );
    age.Loader.addResource(
      'card-black-2.png',
      age.ResourceType.IMAGE,
      'card-black-2'
    );
    age.Loader.addResource(
      'card-black-3.png',
      age.ResourceType.IMAGE,
      'card-black-3'
    );
    age.Loader.addResource(
      'card-black-4.png',
      age.ResourceType.IMAGE,
      'card-black-4'
    );
    age.Loader.addResource(
      'card-black-5.png',
      age.ResourceType.IMAGE,
      'card-black-5'
    );
    age.Loader.addResource(
      'card-black-6.png',
      age.ResourceType.IMAGE,
      'card-black-6'
    );
    age.Loader.addResource(
      'card-black-7.png',
      age.ResourceType.IMAGE,
      'card-black-7'
    );
    age.Loader.addResource(
      'card-black-8.png',
      age.ResourceType.IMAGE,
      'card-black-8'
    );
    age.Loader.addResource(
      'card-black-9.png',
      age.ResourceType.IMAGE,
      'card-black-9'
    );
    age.Loader.addResource('bg.png', age.ResourceType.IMAGE, 'bg-layer');
    age.Loader.addResource('bg-card.png', age.ResourceType.IMAGE, 'bg-card');
    age.Loader.addResource(
      'explosion.png',
      age.ResourceType.IMAGE,
      'explosion'
    );
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
  var ScoreManager = function () {};
  ScoreManager.__name__ = true;
  ScoreManager.init = function (pParent) {
    if (ScoreManager._score == null) ScoreManager._best = 0;
    else
      ScoreManager._best = Std['int'](
        Math.max(ScoreManager._score, ScoreManager._best)
      );
    ScoreManager._score = 0;
    ScoreManager._stage = 0;
    ScoreManager._text = new age.display.text.BasicText('SCORE: 0', 10, 30);
    ScoreManager._text.setStyle(
      'pixelade',
      20,
      '#000',
      false,
      age.display.text.TextAlign.LEFT
    );
    pParent.add(ScoreManager._text);
    var bestText = new age.display.text.BasicText(
      'BEST: ' + ScoreManager._best,
      10,
      60
    );
    bestText.setStyle(
      'pixelade',
      20,
      '#000',
      false,
      age.display.text.TextAlign.LEFT
    );
    pParent.add(bestText);
  };
  ScoreManager.add = function (pValue) {
    ScoreManager._score += pValue | 0;
    ScoreManager._text.text = 'SCORE: ' + ScoreManager._score;
    ScoreManager._stage += pValue | 0;
    if (ScoreManager._stage >= 100) {
      ColorChanger.createTransition('game');
      ScoreManager._stage -= 100;
    }
  };
  ScoreManager.getScore = function () {
    return ScoreManager._score;
  };
  var Std = function () {};
  Std.__name__ = true;
  Std.string = function (s) {
    return js.Boot.__string_rec(s, '');
  };
  Std['int'] = function (x) {
    return x | 0;
  };
  Std.parseInt = function (x) {
    var v = parseInt(x, 10);
    if (v == 0 && (HxOverrides.cca(x, 1) == 120 || HxOverrides.cca(x, 1) == 88))
      v = parseInt(x);
    if (isNaN(v)) return null;
    return v;
  };
  var StringTools = function () {};
  StringTools.__name__ = true;
  StringTools.replace = function (s, sub, by) {
    return s.split(sub).join(by);
  };
  StringTools.hex = function (n, digits) {
    var s = '';
    var hexChars = '0123456789ABCDEF';
    do {
      s = hexChars.charAt(n & 15) + s;
      n >>>= 4;
    } while (n > 0);
    if (digits != null) while (s.length < digits) s = '0' + s;
    return s;
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
  age.core.IEntity = function () {};
  age.core.IEntity.__name__ = true;
  age.core.Input = function (pRoot) {
    age.core.Input._root = pRoot;
    var b = window.document;
    b.addEventListener('keydown', age.core.Input.onKeyDown);
    b.addEventListener('keyup', age.core.Input.onKeyUp);
    b.addEventListener('mousemove', age.core.Input.onMouseMove);
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
    age.core.Input.mouseOverGame =
      age.core.Input.mousePosition.x >= 0 &&
      age.core.Input.mousePosition.x <= bounds.width &&
      age.core.Input.mousePosition.y >= 0 &&
      age.core.Input.mousePosition.y <= bounds.height;
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
    if (age.core.Input.mouseOverGame) {
      var code = pEvt.keyCode;
      if (!age.core.Input._key[code]) {
        age.core.Input._key[code] = true;
        age.core.Input._keyNum++;
        age.core.Input._press[age.core.Input._pressNum++] = code;
      }
      pEvt.preventDefault();
    }
  };
  age.core.Input.onKeyUp = function (pEvt) {
    if (age.core.Input.mouseOverGame) {
      var code = pEvt.keyCode;
      if (age.core.Input._key[code]) {
        age.core.Input._key[code] = false;
        age.core.Input._keyNum--;
        age.core.Input._release[age.core.Input._releaseNum++] = code;
      }
      pEvt.preventDefault();
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
    collidePoint: function (pX, pY) {
      return this.collideRect(pX, pY, 0, 0);
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
    removeAll: function () {
      var _g = 0;
      var _g1 = this._entities;
      while (_g < _g1.length) {
        var e = _g1[_g];
        ++_g;
        this.remove(e);
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
  age.display.text.BasicText = function (pText, pX, pY, pMaxWidth) {
    if (pMaxWidth == null) pMaxWidth = -1;
    if (pY == null) pY = 0;
    if (pX == null) pX = 0;
    this.text = pText;
    this._maxWidth = pMaxWidth;
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
      if (this._maxWidth > 0)
        pContext.fillText(this.text, this.x, this.y, this._maxWidth);
      else pContext.fillText(this.text, this.x, this.y);
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
  var behaviors = {};
  behaviors.AnimationBehavior = function (pEntity, goTo) {
    this.activated = true;
    this.entity = pEntity;
    this._from = { x: pEntity.x, y: pEntity.y };
    this._to = goTo;
  };
  behaviors.AnimationBehavior.__name__ = true;
  behaviors.AnimationBehavior.__interfaces__ = [age.core.IBehavior];
  behaviors.AnimationBehavior.prototype = {
    update: function () {
      var dx = this._to.x - this.entity.x;
      var dy = this._to.y - this.entity.y;
      if (dx * dx + dy * dy < 324) {
        this.entity.x = this._to.x;
        this.entity.y = this._to.y;
        this.activated = false;
      } else {
        var angle = Math.atan2(dy, dx);
        var vx = Math.cos(angle) * 18;
        var vy = Math.sin(angle) * 18;
        this.entity.x += Math.round(vx);
        this.entity.y += Math.round(vy);
      }
    },
    destroy: function () {
      this._from = this._to = null;
    },
  };
  var entities = {};
  entities.Card = function (pX, pY, pColor) {
    age.display.Entity.call(this, 80, 80);
    this.isMoving = false;
    this.x = pX;
    this.y = pY;
    this.color = pColor;
    this.nbTurnOnScreen = 0;
    this.nbTurnMaxOnScreen = 0;
    if (this.color == CardColor.BLACK) this.nbTurnMaxOnScreen = 5;
    var img = CardColorHelper.getImageFromColor(this.color);
    this.addImage('card', img, true);
  };
  entities.Card.__name__ = true;
  entities.Card.__super__ = age.display.Entity;
  entities.Card.prototype = $extend(age.display.Entity.prototype, {
    moveTo: function (pX, pY) {
      this.removeBehavior('move');
      this.addBehavior(
        'move',
        new behaviors.AnimationBehavior(this, { x: pX, y: pY })
      );
    },
    block: function (pCol, pRow) {
      this.position = { x: pCol, y: pRow };
    },
    get_isMoving: function () {
      return this.getBehavior('move') != null;
    },
    update: function () {
      var mb = this.getBehavior('move');
      if (mb != null && !mb.activated) this.removeBehavior('move');
      age.display.Entity.prototype.update.call(this);
    },
    firstTimeOnBoard: function () {
      if (this.color == CardColor.BLACK) {
        var img =
          CardColorHelper.getImageFromColor(this.color) +
          '-' +
          this.nbTurnMaxOnScreen;
        this.addImage('card', img, true);
      }
    },
    newTurn: function () {
      this.nbTurnOnScreen++;
      if (this.color == CardColor.BLACK) {
        var nb = this.nbTurnMaxOnScreen - this.nbTurnOnScreen;
        if (nb > 0) {
          var img =
            CardColorHelper.getImageFromColor(this.color) +
            '-' +
            (this.nbTurnMaxOnScreen - this.nbTurnOnScreen);
          this.addImage('card', img, true);
        }
      }
    },
  });
  entities.Explosion = function (pX, pY) {
    age.display.AnimatedEntity.call(this, 47, 47, 'explosion', 6, 15);
    this.x = pX - 23;
    this.y = pY - 23;
    this.removeMe = false;
    this._loop = false;
  };
  entities.Explosion.__name__ = true;
  entities.Explosion.__super__ = age.display.AnimatedEntity;
  entities.Explosion.prototype = $extend(age.display.AnimatedEntity.prototype, {
    onAnimationComplete: function () {
      this.removeMe = true;
    },
  });
  var haxe = {};
  haxe.Timer = function (time_ms) {
    var me = this;
    this.id = setInterval(function () {
      me.run();
    }, time_ms);
  };
  haxe.Timer.__name__ = true;
  haxe.Timer.delay = function (f, time_ms) {
    var t = new haxe.Timer(time_ms);
    t.run = function () {
      t.stop();
      f();
    };
    return t;
  };
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
    keys: function () {
      var a = [];
      for (var key in this.h) {
        if (this.h.hasOwnProperty(key)) a.push(key | 0);
      }
      return HxOverrides.iter(a);
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
  var states = {};
  states.GameState = function () {
    this._gameStarted = false;
    age.display.State.call(this);
    this.canClick = false;
  };
  states.GameState.__name__ = true;
  states.GameState.__super__ = age.display.State;
  states.GameState.prototype = $extend(age.display.State.prototype, {
    create: function () {
      var credits = new age.display.text.BasicText(
        'Made for LD31 by RevoluGame.com',
        175,
        480
      );
      credits.setStyle(
        'pixelade',
        20,
        '#000',
        false,
        age.display.text.TextAlign.CENTER
      );
      this.add(credits);
      this._textContainer = new age.display.EntityContainer();
      this.add(this._textContainer);
      var inst = new age.display.text.BasicText(
        'Press [SPACE] when ready',
        175,
        190
      );
      inst.setStyle(
        'pixelade',
        25,
        '#000',
        false,
        age.display.text.TextAlign.CENTER
      );
      this._textContainer.add(inst);
    },
    initGame: function () {
      this.remove(this._textContainer);
      this._textContainer = new age.display.EntityContainer();
      var inst = new age.display.text.BasicText(
        'Press [SPACE] to restart',
        175,
        110
      );
      inst.setStyle(
        'pixelade',
        20,
        '#000',
        false,
        age.display.text.TextAlign.CENTER
      );
      this._textContainer.add(inst);
      ScoreManager.init(this._textContainer);
      this._totalBlackOnBoard = 0;
      this._cards = new List();
      this._authColors = [CardColor.GREY];
      ColorChanger.createTransition(
        'game',
        CardColorHelper.getRgbColorFromColor(CardColor.GREY)
      );
      this._wait = false;
      if (this._backgroundContainer == null) {
        this._backgroundContainer = new age.display.EntityContainer();
        var bg = new age.display.Entity(338, 338, 'bg-layer');
        bg.x = 6;
        bg.y = 135;
        this._backgroundContainer.add(bg);
        var bgcard = new age.display.Entity(90, 90, 'bg-card');
        bgcard.x = 250;
        bgcard.y = 10;
        this._backgroundContainer.add(bgcard);
        this.add(this._backgroundContainer);
      }
      if (this._boardContainer == null) {
        this._boardContainer = new age.display.EntityContainer();
        this.add(this._boardContainer);
      }
      if (this._explosionsContainer == null) {
        this._explosionsContainer = new age.display.EntityContainer();
        this.add(this._explosionsContainer);
      }
      ExplosionsManager.init(this._explosionsContainer);
      this.add(this._textContainer);
      var _g = 0;
      while (_g < 4) {
        var i = _g++;
        var _g1 = 0;
        while (_g1 < 4) {
          var j = _g1++;
          this._backgroundContainer.add(
            new entities.Card(81 * j + 13, 81 * i + 142, CardColor.WHITE)
          );
        }
      }
      this.createNextCards();
      age.core.Input.registerGlobalClickHandler($bind(this, this.clickHandler));
      this.canClick = true;
    },
    restartGame: function () {
      this._textContainer.removeAll();
      var $it0 = this._cards.iterator();
      while ($it0.hasNext()) {
        var c = $it0.next();
        this._boardContainer.remove(c);
      }
      this._cards.clear();
      this._currentCard = null;
      this.initGame();
    },
    createNextCards: function () {
      this._currentCard = new entities.Card(
        255,
        15,
        CardColorHelper.getRandomColor(
          this._authColors,
          this._totalBlackOnBoard >= 3 ? [CardColor.BLACK] : null
        )
      );
      this._boardContainer.add(this._currentCard);
      if (this._currentCard.color == CardColor.BLACK) this._totalBlackOnBoard++;
    },
    clickHandler: function (pEvt) {
      var _g = this;
      if (this._currentCard == null || this._wait || !this.canClick) return;
      this.canClick = false;
      haxe.Timer.delay(function () {
        _g.canClick = true;
      }, 800);
      var bounds = age.core.Input.getCanvasBounds();
      var mouseX = pEvt.clientX - bounds.left;
      var mouseY = pEvt.clientY - bounds.top;
      if (mouseX >= 13 && mouseX <= 336 && mouseY >= 142 && mouseY <= 465) {
        var col = ((mouseX - 13) / 81) | 0;
        var row = ((mouseY - 142) / 81) | 0;
        this._movingCard = this._currentCard;
        this.moveCardToCol(this._currentCard, col);
      }
    },
    moveCardToCol: function (pCard, pCol) {
      var row = this.getPositionInCol(pCol);
      if (row == -1) return;
      this._wait = true;
      var colX = pCol * 81 + 13;
      var rowX = row * 81 + 142;
      this._currentCard.moveTo(colX, rowX);
      this._currentCard.block(pCol, row);
      this._cards.add(this._currentCard);
      this.createNextCards();
    },
    getPositionInCol: function (pCol) {
      var cells = new List();
      var $it0 = this._cards.iterator();
      while ($it0.hasNext()) {
        var c = $it0.next();
        if (c.position.x == pCol) cells.add(c);
      }
      if (cells.length == 0) return 3;
      if (cells.length <= 3) return 3 - cells.length;
      return -1;
    },
    update: function () {
      if (!this._gameStarted && age.core.Input.pressed(32)) {
        this._gameStarted = true;
        this._textContainer.removeAll();
        if (this._cards != null) this.restartGame();
        else this.initGame();
      } else if (this._gameStarted) {
        ExplosionsManager.update();
        if (age.core.Input.pressed(32)) this.restartGame();
        if (this._wait && !this._movingCard.get_isMoving()) {
          if (this._movingCard != null) this.updateCollisions(this._movingCard);
          if (this._movingCard != null) this._movingCard.firstTimeOnBoard();
          this._wait = false;
          this._movingCard = null;
          this.handleEndOfTurn();
        }
        if (
          ScoreManager.getScore() >= 120 &&
          HxOverrides.indexOf(this._authColors, CardColor.BLACK, 0) == -1
        )
          this._authColors.push(CardColor.BLACK);
      }
      age.display.State.prototype.update.call(this);
    },
    updateCollisions: function (pCard) {
      var _g = this;
      var listCards = this.getNeighbourSameColor(pCard);
      if (listCards.length == 0) return;
      var cols = new haxe.ds.IntMap();
      var $it0 = listCards.iterator();
      while ($it0.hasNext()) {
        var c = $it0.next();
        if (
          !cols.exists(c.position.x) ||
          (cols.exists(c.position.x) && cols.get(c.position.x) > c.position.y)
        )
          cols.set(c.position.x, c.position.y);
        this._cards.remove(c);
        this._boardContainer.remove(c);
        ExplosionsManager.add(c.x + 40, c.y + 40);
      }
      var newColor = CardColorHelper.getNextColor(pCard.color);
      if (newColor != null) {
        if (
          newColor != CardColor.RED &&
          HxOverrides.indexOf(this._authColors, newColor, 0) == -1
        )
          this._authColors.push(newColor);
        ColorChanger.createTransition(
          'game',
          CardColorHelper.getRgbColorFromColor(newColor)
        );
        var newRow =
          3 -
          this.getLowerCardsInCol(pCard.position.x, pCard.position.y).length;
        var newY = newRow * 81 + 142;
        var newCard = new entities.Card(pCard.x, newY, newColor);
        this._boardContainer.add(newCard);
        newCard.block(pCard.position.x, newRow);
        this._cards.add(newCard);
        this.updateCollisions(newCard);
      }
      var $it1 = cols.keys();
      while ($it1.hasNext()) {
        var col = $it1.next();
        var row = cols.get(col);
        var cardsToMove = this.getUpperCardsInCol(col, row);
        var $it2 = cardsToMove.iterator();
        while ($it2.hasNext()) {
          var ctm = $it2.next();
          var newRow1 =
            3 - this.getLowerCardsInCol(ctm.position.x, ctm.position.y).length;
          ctm.moveTo(ctm.x, newRow1 * 81 + 142);
          ctm.block(ctm.position.x, newRow1);
        }
      }
      haxe.Timer.delay(function () {
        var $it3 = _g._cards.iterator();
        while ($it3.hasNext()) {
          var c1 = $it3.next();
          _g.updateCollisions(c1);
        }
      }, 300);
      ScoreManager.add(
        CardColorHelper.getScoreFromColor(pCard.color) *
          Math.max(1, listCards.length - 1)
      );
    },
    getNeighbourSameColor: function (pCard) {
      var list = new List();
      if (pCard.get_isMoving() || pCard.color == CardColor.BLACK) return list;
      var leftCard = this.getCardAt(pCard.position.x - 1, pCard.position.y);
      var rightCard = this.getCardAt(pCard.position.x + 1, pCard.position.y);
      var topCard = this.getCardAt(pCard.position.x, pCard.position.y - 1);
      var bottomCard = this.getCardAt(pCard.position.x, pCard.position.y + 1);
      if (leftCard != null && leftCard.color == pCard.color) list.add(leftCard);
      if (rightCard != null && rightCard.color == pCard.color)
        list.add(rightCard);
      if (topCard != null && topCard.color == pCard.color) list.add(topCard);
      if (bottomCard != null && bottomCard.color == pCard.color)
        list.add(bottomCard);
      if (list.length > 0) list.add(pCard);
      return list;
    },
    getUpperCardsInCol: function (pCol, pRow) {
      var list = new List();
      var $it0 = this._cards.iterator();
      while ($it0.hasNext()) {
        var c = $it0.next();
        if (c.position.x == pCol && c.position.y < pRow) list.add(c);
      }
      return list;
    },
    getLowerCardsInCol: function (pCol, pRow) {
      var list = new List();
      var $it0 = this._cards.iterator();
      while ($it0.hasNext()) {
        var c = $it0.next();
        if (c.position.x == pCol && c.position.y > pRow) list.add(c);
      }
      return list;
    },
    getCardAt: function (pX, pY) {
      if (pX >= 0 && pX <= 3 && pY >= 0 && pY <= 3) {
        var $it0 = this._cards.iterator();
        while ($it0.hasNext()) {
          var c = $it0.next();
          if (c.position.x == pX && c.position.y == pY) return c;
        }
      }
      return null;
    },
    endGame: function () {
      this._gameStarted = false;
      this._currentCard = null;
      this._movingCard = null;
      var rect = new age.display.ui.Rect(0, 160, 350, 47, '#FFFFFF', 0.8);
      this._textContainer.add(rect);
      var inst = new age.display.text.BasicText('GAME OVER', 175, 170);
      inst.setStyle(
        'pixelade',
        28,
        '#000',
        false,
        age.display.text.TextAlign.CENTER
      );
      this._textContainer.add(inst);
    },
    handleEndOfTurn: function () {
      var _g = this;
      var $it0 = this._cards.iterator();
      while ($it0.hasNext()) {
        var c = $it0.next();
        c.newTurn();
        if (
          c.color == CardColor.BLACK &&
          c.nbTurnOnScreen >= c.nbTurnMaxOnScreen
        ) {
          c.dead = true;
          this._cards.remove(c);
          this._boardContainer.remove(c);
          ExplosionsManager.add(c.x + 40, c.y + 40);
          var cardsToMove = this.getUpperCardsInCol(c.position.x, c.position.y);
          var $it1 = cardsToMove.iterator();
          while ($it1.hasNext()) {
            var ctm = $it1.next();
            var ctm1 = [ctm];
            var newRow =
              3 -
              this.getLowerCardsInCol(ctm1[0].position.x, ctm1[0].position.y)
                .length;
            ctm1[0].moveTo(ctm1[0].x, newRow * 81 + 142);
            ctm1[0].block(ctm1[0].position.x, newRow);
            haxe.Timer.delay(
              (function (ctm1) {
                return function () {
                  _g.updateCollisions(ctm1[0]);
                };
              })(ctm1),
              300
            );
          }
          this._totalBlackOnBoard--;
        }
      }
      if (this._cards.length >= 16) this.endGame();
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
  ColorChanger.INCREMENT_STOP = 50;
  Main.DEFAULT_FONT = 'pixelade';
  Main.GAME_DIV_ID = 'game';
  Main.URI = '/assets/img/portfolio/ld31/';
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
  age.core.Input.mouseOverGame = false;
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
  behaviors.AnimationBehavior.SPEED = 18;
  states.GameState.BOARD_LEFT = 13;
  states.GameState.BOARD_RIGHT = 336;
  states.GameState.BOARD_TOP = 142;
  states.GameState.BOARD_BOTTOM = 465;
  states.GameState.CARD_SIZE = 81;
  states.GameState.BLACK_LIMIT = 3;
  states.GameState.SCORE_UNLOCK_BLACK = 120;
  Main.main();
})();
