(function () {
  'use strict';
  var App = function () {
    var _g = this;
    this._map = L.map('map_canvas').setView({ lat: 43.6, lng: 3.883 }, 13);
    this._myPos = { lat: 43.6, lng: 3.883 };
    L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; 2011 OpenStreetMap contributors',
      subdomains: ['otile1', 'otile2', 'otile3', 'otile4'],
      closePopupOnClick: true,
    }).addTo(this._map);
    var nav = window.navigator;
    if (nav.geolocation != null)
      nav.geolocation.getCurrentPosition(
        $bind(this, this.showPosition),
        $bind(this, this.onError)
      );
    var r = new haxe.Http('data.json');
    r.onError = js.Lib.alert;
    r.onData = function (r1) {
      _g.parseData(r1);
    };
    r.request(false);
  };
  App.__name__ = true;
  App.prototype = {
    onClickLocateMe: function (pEvt) {
      if (this._myPos != null) this._map.panTo(this._myPos);
      else js.Lib.alert('Position unavailable ...');
    },
    onClickCloser: function (pEvt) {
      if (this._myPos != null) {
        var data = new Array();
        var $it0 = this._defibs.iterator();
        while ($it0.hasNext()) {
          var d = $it0.next();
          d.distance = this.calcDistance(
            this._myPos.lat,
            this._myPos.lng,
            d.lat,
            d.lng
          );
          data.push(d);
        }
        data.sort($bind(this, this.orderByDistance));
        var closer = data[0];
        this._map.panTo({ lat: closer.lat, lng: closer.lng });
        var htmlContent = this.getTooltip(closer);
        closer.marker.bindPopup(htmlContent).openPopup();
      } else js.Lib.alert('Position unavailable ...');
    },
    orderByDistance: function (d1, d2) {
      if (d1.distance > d2.distance) return 1;
      else if (d1.distance < d2.distance) return -1;
      return 0;
    },
    showPosition: function (pPosition) {
      this._myPos = {
        lat: pPosition.coords.latitude,
        lng: pPosition.coords.longitude,
      };
      var marker = L.marker(this._myPos, {
        icon: L.icon({ iconUrl: 'img/flag.png', iconSize: [48, 48] }),
      }).addTo(this._map);
      return false;
    },
    onError: function (pPosition) {
      return false;
    },
    calcDistance: function (pLat1, pLng1, pLat2, pLng2) {
      var R = 6371;
      var dLat = ((pLat1 - pLat2) * Math.PI) / 180;
      var dLon = ((pLng1 - pLng2) * Math.PI) / 180;
      var lat1 = (pLat2 * Math.PI) / 180;
      var lat2 = (pLng2 * Math.PI) / 180;
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
          Math.sin(dLon / 2) *
          Math.cos(lat1) *
          Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return Math.round(d * 1000);
    },
    parseData: function (r) {
      this._defibs = new List();
      this._totalNumber = 0;
      var json = JSON.parse(r);
      var defib;
      var listMarkers = new Array();
      var _g = 0;
      var _g1 = Reflect.fields(json);
      while (_g < _g1.length) {
        var index = _g1[_g];
        ++_g;
        var data = Reflect.field(json, index);
        defib = {
          id: Reflect.field(data, 'id'),
          name: Reflect.field(data, 'nom'),
          address: Reflect.field(data, 'adresse'),
          tel: Reflect.field(data, 'tel'),
          lat: Std.parseFloat(
            StringTools.replace(Reflect.field(data, 'coordY'), ',', '.')
          ),
          lng: Std.parseFloat(
            StringTools.replace(Reflect.field(data, 'coordX'), ',', '.')
          ),
          marker: null,
          distance: 0,
        };
        var marker = L.marker([defib.lat, defib.lng]);
        defib.marker = marker;
        this._defibs.add(defib);
        listMarkers.push(marker);
        marker.addEventListener('click', $bind(this, this.onMarkerClicked));
        this._totalNumber++;
      }
      L.layerGroup(listMarkers).addTo(this._map);
      new $('#locateOnMap').click($bind(this, this.onClickLocateMe));
      new $('#closerOnMap').click($bind(this, this.onClickCloser));
    },
    onMarkerClicked: function (pEvt) {
      var defib = this.getDefibFromMarker(pEvt.target);
      if (defib != null) {
        var htmlContent = this.getTooltip(defib);
        defib.marker.bindPopup(htmlContent).openPopup();
      }
    },
    getTooltip: function (pDefib) {
      var str = haxe.Resource.getString('tooltip');
      var t = new haxe.Template(str);
      return t.execute(pDefib);
    },
    getDefibFromMarker: function (pMarker) {
      var $it0 = this._defibs.iterator();
      while ($it0.hasNext()) {
        var defib = $it0.next();
        if (defib.marker == pMarker) return defib;
      }
      return null;
    },
    __class__: App,
  };
  var EReg = function (r, opt) {
    opt = opt.split('u').join('');
    this.r = new RegExp(r, opt);
  };
  EReg.__name__ = true;
  EReg.prototype = {
    match: function (s) {
      if (this.r.global) this.r.lastIndex = 0;
      this.r.m = this.r.exec(s);
      this.r.s = s;
      return this.r.m != null;
    },
    matched: function (n) {
      if (this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n];
      else throw 'EReg::matched';
    },
    matchedRight: function () {
      if (this.r.m == null) throw 'No string matched';
      var sz = this.r.m.index + this.r.m[0].length;
      return this.r.s.substr(sz, this.r.s.length - sz);
    },
    matchedPos: function () {
      if (this.r.m == null) throw 'No string matched';
      return { pos: this.r.m.index, len: this.r.m[0].length };
    },
    __class__: EReg,
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
  var Lambda = function () {};
  Lambda.__name__ = true;
  Lambda.exists = function (it, f) {
    var $it0 = it.iterator();
    while ($it0.hasNext()) {
      var x = $it0.next();
      if (f(x)) return true;
    }
    return false;
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
    push: function (item) {
      var x = [item, this.h];
      this.h = x;
      if (this.q == null) this.q = x;
      this.length++;
    },
    first: function () {
      if (this.h == null) return null;
      else return this.h[0];
    },
    pop: function () {
      if (this.h == null) return null;
      var x = this.h[0];
      this.h = this.h[1];
      if (this.h == null) this.q = null;
      this.length--;
      return x;
    },
    isEmpty: function () {
      return this.h == null;
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
    __class__: List,
  };
  var Main = function () {};
  Main.__name__ = true;
  Main.main = function () {
    new $(function () {
      new App();
    });
  };
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
  Reflect.fields = function (o) {
    var a = [];
    if (o != null) {
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      for (var f in o) {
        if (f != '__id__' && f != 'hx__closures__' && hasOwnProperty.call(o, f))
          a.push(f);
      }
    }
    return a;
  };
  var Std = function () {};
  Std.__name__ = true;
  Std.string = function (s) {
    return js.Boot.__string_rec(s, '');
  };
  Std.parseInt = function (x) {
    var v = parseInt(x, 10);
    if (v == 0 && (HxOverrides.cca(x, 1) == 120 || HxOverrides.cca(x, 1) == 88))
      v = parseInt(x);
    if (isNaN(v)) return null;
    return v;
  };
  Std.parseFloat = function (x) {
    return parseFloat(x);
  };
  var StringBuf = function () {
    this.b = '';
  };
  StringBuf.__name__ = true;
  StringBuf.prototype = {
    add: function (x) {
      this.b += Std.string(x);
    },
    __class__: StringBuf,
  };
  var StringTools = function () {};
  StringTools.__name__ = true;
  StringTools.replace = function (s, sub, by) {
    return s.split(sub).join(by);
  };
  StringTools.fastCodeAt = function (s, index) {
    return s.charCodeAt(index);
  };
  var haxe = {};
  haxe.Http = function (url) {
    this.url = url;
    this.headers = new List();
    this.params = new List();
    this.async = true;
  };
  haxe.Http.__name__ = true;
  haxe.Http.prototype = {
    request: function (post) {
      var me = this;
      me.responseData = null;
      var r = (this.req = js.Browser.createXMLHttpRequest());
      var onreadystatechange = function (_) {
        if (r.readyState != 4) return;
        var s;
        try {
          s = r.status;
        } catch (e) {
          s = null;
        }
        if (s == undefined) s = null;
        if (s != null) me.onStatus(s);
        if (s != null && s >= 200 && s < 400) {
          me.req = null;
          me.onData((me.responseData = r.responseText));
        } else if (s == null) {
          me.req = null;
          me.onError('Failed to connect or resolve host');
        } else
          switch (s) {
            case 12029:
              me.req = null;
              me.onError('Failed to connect to host');
              break;
            case 12007:
              me.req = null;
              me.onError('Unknown host');
              break;
            default:
              me.req = null;
              me.responseData = r.responseText;
              me.onError('Http Error #' + r.status);
          }
      };
      if (this.async) r.onreadystatechange = onreadystatechange;
      var uri = this.postData;
      if (uri != null) post = true;
      else {
        var $it0 = this.params.iterator();
        while ($it0.hasNext()) {
          var p = $it0.next();
          if (uri == null) uri = '';
          else uri += '&';
          uri +=
            encodeURIComponent(p.param) + '=' + encodeURIComponent(p.value);
        }
      }
      try {
        if (post) r.open('POST', this.url, this.async);
        else if (uri != null) {
          var question = this.url.split('?').length <= 1;
          r.open('GET', this.url + (question ? '?' : '&') + uri, this.async);
          uri = null;
        } else r.open('GET', this.url, this.async);
      } catch (e1) {
        me.req = null;
        this.onError(e1.toString());
        return;
      }
      if (
        !Lambda.exists(this.headers, function (h) {
          return h.header == 'Content-Type';
        }) &&
        post &&
        this.postData == null
      )
        r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      var $it1 = this.headers.iterator();
      while ($it1.hasNext()) {
        var h1 = $it1.next();
        r.setRequestHeader(h1.header, h1.value);
      }
      r.send(uri);
      if (!this.async) onreadystatechange(null);
    },
    onData: function (data) {},
    onError: function (msg) {},
    onStatus: function (status) {},
    __class__: haxe.Http,
  };
  haxe.Resource = function () {};
  haxe.Resource.__name__ = true;
  haxe.Resource.getString = function (name) {
    var _g = 0;
    var _g1 = haxe.Resource.content;
    while (_g < _g1.length) {
      var x = _g1[_g];
      ++_g;
      if (x.name == name) {
        if (x.str != null) return x.str;
        var b = haxe.crypto.Base64.decode(x.data);
        return b.toString();
      }
    }
    return null;
  };
  haxe._Template = {};
  haxe._Template.TemplateExpr = {
    __ename__: true,
    __constructs__: [
      'OpVar',
      'OpExpr',
      'OpIf',
      'OpStr',
      'OpBlock',
      'OpForeach',
      'OpMacro',
    ],
  };
  haxe._Template.TemplateExpr.OpVar = function (v) {
    var $x = ['OpVar', 0, v];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe._Template.TemplateExpr.OpExpr = function (expr) {
    var $x = ['OpExpr', 1, expr];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe._Template.TemplateExpr.OpIf = function (expr, eif, eelse) {
    var $x = ['OpIf', 2, expr, eif, eelse];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe._Template.TemplateExpr.OpStr = function (str) {
    var $x = ['OpStr', 3, str];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe._Template.TemplateExpr.OpBlock = function (l) {
    var $x = ['OpBlock', 4, l];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe._Template.TemplateExpr.OpForeach = function (expr, loop) {
    var $x = ['OpForeach', 5, expr, loop];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe._Template.TemplateExpr.OpMacro = function (name, params) {
    var $x = ['OpMacro', 6, name, params];
    $x.__enum__ = haxe._Template.TemplateExpr;
    return $x;
  };
  haxe.Template = function (str) {
    var tokens = this.parseTokens(str);
    this.expr = this.parseBlock(tokens);
    if (!tokens.isEmpty())
      throw "Unexpected '" + Std.string(tokens.first().s) + "'";
  };
  haxe.Template.__name__ = true;
  haxe.Template.prototype = {
    execute: function (context, macros) {
      if (macros == null) this.macros = {};
      else this.macros = macros;
      this.context = context;
      this.stack = new List();
      this.buf = new StringBuf();
      this.run(this.expr);
      return this.buf.b;
    },
    resolve: function (v) {
      if (Object.prototype.hasOwnProperty.call(this.context, v))
        return Reflect.field(this.context, v);
      var $it0 = this.stack.iterator();
      while ($it0.hasNext()) {
        var ctx = $it0.next();
        if (Object.prototype.hasOwnProperty.call(ctx, v))
          return Reflect.field(ctx, v);
      }
      if (v == '__current__') return this.context;
      return Reflect.field(haxe.Template.globals, v);
    },
    parseTokens: function (data) {
      var tokens = new List();
      while (haxe.Template.splitter.match(data)) {
        var p = haxe.Template.splitter.matchedPos();
        if (p.pos > 0)
          tokens.add({
            p: HxOverrides.substr(data, 0, p.pos),
            s: true,
            l: null,
          });
        if (HxOverrides.cca(data, p.pos) == 58) {
          tokens.add({
            p: HxOverrides.substr(data, p.pos + 2, p.len - 4),
            s: false,
            l: null,
          });
          data = haxe.Template.splitter.matchedRight();
          continue;
        }
        var parp = p.pos + p.len;
        var npar = 1;
        var params = [];
        var part = '';
        while (true) {
          var c = HxOverrides.cca(data, parp);
          parp++;
          if (c == 40) npar++;
          else if (c == 41) {
            npar--;
            if (npar <= 0) break;
          } else if (c == null) throw 'Unclosed macro parenthesis';
          if (c == 44 && npar == 1) {
            params.push(part);
            part = '';
          } else part += String.fromCharCode(c);
        }
        params.push(part);
        tokens.add({
          p: haxe.Template.splitter.matched(2),
          s: false,
          l: params,
        });
        data = HxOverrides.substr(data, parp, data.length - parp);
      }
      if (data.length > 0) tokens.add({ p: data, s: true, l: null });
      return tokens;
    },
    parseBlock: function (tokens) {
      var l = new List();
      while (true) {
        var t = tokens.first();
        if (t == null) break;
        if (
          !t.s &&
          (t.p == 'end' ||
            t.p == 'else' ||
            HxOverrides.substr(t.p, 0, 7) == 'elseif ')
        )
          break;
        l.add(this.parse(tokens));
      }
      if (l.length == 1) return l.first();
      return haxe._Template.TemplateExpr.OpBlock(l);
    },
    parse: function (tokens) {
      var t = tokens.pop();
      var p = t.p;
      if (t.s) return haxe._Template.TemplateExpr.OpStr(p);
      if (t.l != null) {
        var pe = new List();
        var _g = 0;
        var _g1 = t.l;
        while (_g < _g1.length) {
          var p1 = _g1[_g];
          ++_g;
          pe.add(this.parseBlock(this.parseTokens(p1)));
        }
        return haxe._Template.TemplateExpr.OpMacro(p, pe);
      }
      if (HxOverrides.substr(p, 0, 3) == 'if ') {
        p = HxOverrides.substr(p, 3, p.length - 3);
        var e = this.parseExpr(p);
        var eif = this.parseBlock(tokens);
        var t1 = tokens.first();
        var eelse;
        if (t1 == null) throw "Unclosed 'if'";
        if (t1.p == 'end') {
          tokens.pop();
          eelse = null;
        } else if (t1.p == 'else') {
          tokens.pop();
          eelse = this.parseBlock(tokens);
          t1 = tokens.pop();
          if (t1 == null || t1.p != 'end') throw "Unclosed 'else'";
        } else {
          t1.p = HxOverrides.substr(t1.p, 4, t1.p.length - 4);
          eelse = this.parse(tokens);
        }
        return haxe._Template.TemplateExpr.OpIf(e, eif, eelse);
      }
      if (HxOverrides.substr(p, 0, 8) == 'foreach ') {
        p = HxOverrides.substr(p, 8, p.length - 8);
        var e1 = this.parseExpr(p);
        var efor = this.parseBlock(tokens);
        var t2 = tokens.pop();
        if (t2 == null || t2.p != 'end') throw "Unclosed 'foreach'";
        return haxe._Template.TemplateExpr.OpForeach(e1, efor);
      }
      if (haxe.Template.expr_splitter.match(p))
        return haxe._Template.TemplateExpr.OpExpr(this.parseExpr(p));
      return haxe._Template.TemplateExpr.OpVar(p);
    },
    parseExpr: function (data) {
      var l = new List();
      var expr = data;
      while (haxe.Template.expr_splitter.match(data)) {
        var p = haxe.Template.expr_splitter.matchedPos();
        var k = p.pos + p.len;
        if (p.pos != 0)
          l.add({ p: HxOverrides.substr(data, 0, p.pos), s: true });
        var p1 = haxe.Template.expr_splitter.matched(0);
        l.add({ p: p1, s: p1.indexOf('"') >= 0 });
        data = haxe.Template.expr_splitter.matchedRight();
      }
      if (data.length != 0) l.add({ p: data, s: true });
      var e;
      try {
        e = this.makeExpr(l);
        if (!l.isEmpty()) throw l.first().p;
      } catch (s) {
        if (js.Boot.__instanceof(s, String)) {
          throw "Unexpected '" + s + "' in " + expr;
        } else throw s;
      }
      return function () {
        try {
          return e();
        } catch (exc) {
          throw 'Error : ' + Std.string(exc) + ' in ' + expr;
        }
      };
    },
    makeConst: function (v) {
      haxe.Template.expr_trim.match(v);
      v = haxe.Template.expr_trim.matched(1);
      if (HxOverrides.cca(v, 0) == 34) {
        var str = HxOverrides.substr(v, 1, v.length - 2);
        return function () {
          return str;
        };
      }
      if (haxe.Template.expr_int.match(v)) {
        var i = Std.parseInt(v);
        return function () {
          return i;
        };
      }
      if (haxe.Template.expr_float.match(v)) {
        var f = Std.parseFloat(v);
        return function () {
          return f;
        };
      }
      var me = this;
      return function () {
        return me.resolve(v);
      };
    },
    makePath: function (e, l) {
      var p = l.first();
      if (p == null || p.p != '.') return e;
      l.pop();
      var field = l.pop();
      if (field == null || !field.s) throw field.p;
      var f = field.p;
      haxe.Template.expr_trim.match(f);
      f = haxe.Template.expr_trim.matched(1);
      return this.makePath(function () {
        return Reflect.field(e(), f);
      }, l);
    },
    makeExpr: function (l) {
      return this.makePath(this.makeExpr2(l), l);
    },
    makeExpr2: function (l) {
      var p = l.pop();
      if (p == null) throw '<eof>';
      if (p.s) return this.makeConst(p.p);
      var _g = p.p;
      switch (_g) {
        case '(':
          var e1 = this.makeExpr(l);
          var p1 = l.pop();
          if (p1 == null || p1.s) throw p1.p;
          if (p1.p == ')') return e1;
          var e2 = this.makeExpr(l);
          var p2 = l.pop();
          if (p2 == null || p2.p != ')') throw p2.p;
          var _g1 = p1.p;
          switch (_g1) {
            case '+':
              return function () {
                return e1() + e2();
              };
            case '-':
              return function () {
                return e1() - e2();
              };
            case '*':
              return function () {
                return e1() * e2();
              };
            case '/':
              return function () {
                return e1() / e2();
              };
            case '>':
              return function () {
                return e1() > e2();
              };
            case '<':
              return function () {
                return e1() < e2();
              };
            case '>=':
              return function () {
                return e1() >= e2();
              };
            case '<=':
              return function () {
                return e1() <= e2();
              };
            case '==':
              return function () {
                return e1() == e2();
              };
            case '!=':
              return function () {
                return e1() != e2();
              };
            case '&&':
              return function () {
                return e1() && e2();
              };
            case '||':
              return function () {
                return e1() || e2();
              };
            default:
              throw 'Unknown operation ' + p1.p;
          }
          break;
        case '!':
          var e = this.makeExpr(l);
          return function () {
            var v = e();
            return v == null || v == false;
          };
        case '-':
          var e3 = this.makeExpr(l);
          return function () {
            return -e3();
          };
      }
      throw p.p;
    },
    run: function (e) {
      switch (e[1]) {
        case 0:
          var v = e[2];
          this.buf.add(Std.string(this.resolve(v)));
          break;
        case 1:
          var e1 = e[2];
          this.buf.add(Std.string(e1()));
          break;
        case 2:
          var eelse = e[4];
          var eif = e[3];
          var e2 = e[2];
          var v1 = e2();
          if (v1 == null || v1 == false) {
            if (eelse != null) this.run(eelse);
          } else this.run(eif);
          break;
        case 3:
          var str = e[2];
          if (str == null) this.buf.b += 'null';
          else this.buf.b += '' + str;
          break;
        case 4:
          var l = e[2];
          var $it0 = l.iterator();
          while ($it0.hasNext()) {
            var e3 = $it0.next();
            this.run(e3);
          }
          break;
        case 5:
          var loop = e[3];
          var e4 = e[2];
          var v2 = e4();
          try {
            var x = v2.iterator();
            if (x.hasNext == null) throw null;
            v2 = x;
          } catch (e5) {
            try {
              if (v2.hasNext == null) throw null;
            } catch (e6) {
              throw 'Cannot iter on ' + Std.string(v2);
            }
          }
          this.stack.push(this.context);
          var v3 = v2;
          while (v3.hasNext()) {
            var ctx = v3.next();
            this.context = ctx;
            this.run(loop);
          }
          this.context = this.stack.pop();
          break;
        case 6:
          var params = e[3];
          var m = e[2];
          var v4 = Reflect.field(this.macros, m);
          var pl = new Array();
          var old = this.buf;
          pl.push($bind(this, this.resolve));
          var $it1 = params.iterator();
          while ($it1.hasNext()) {
            var p = $it1.next();
            switch (p[1]) {
              case 0:
                var v5 = p[2];
                pl.push(this.resolve(v5));
                break;
              default:
                this.buf = new StringBuf();
                this.run(p);
                pl.push(this.buf.b);
            }
          }
          this.buf = old;
          try {
            this.buf.add(Std.string(v4.apply(this.macros, pl)));
          } catch (e7) {
            var plstr;
            try {
              plstr = pl.join(',');
            } catch (e8) {
              plstr = '???';
            }
            var msg =
              'Macro call ' +
              m +
              '(' +
              plstr +
              ') failed (' +
              Std.string(e7) +
              ')';
            throw msg;
          }
          break;
      }
    },
    __class__: haxe.Template,
  };
  haxe.io = {};
  haxe.io.Bytes = function (length, b) {
    this.length = length;
    this.b = b;
  };
  haxe.io.Bytes.__name__ = true;
  haxe.io.Bytes.alloc = function (length) {
    var a = new Array();
    var _g = 0;
    while (_g < length) {
      var i = _g++;
      a.push(0);
    }
    return new haxe.io.Bytes(length, a);
  };
  haxe.io.Bytes.ofString = function (s) {
    var a = new Array();
    var i = 0;
    while (i < s.length) {
      var c = StringTools.fastCodeAt(s, i++);
      if (55296 <= c && c <= 56319)
        c = ((c - 55232) << 10) | (StringTools.fastCodeAt(s, i++) & 1023);
      if (c <= 127) a.push(c);
      else if (c <= 2047) {
        a.push(192 | (c >> 6));
        a.push(128 | (c & 63));
      } else if (c <= 65535) {
        a.push(224 | (c >> 12));
        a.push(128 | ((c >> 6) & 63));
        a.push(128 | (c & 63));
      } else {
        a.push(240 | (c >> 18));
        a.push(128 | ((c >> 12) & 63));
        a.push(128 | ((c >> 6) & 63));
        a.push(128 | (c & 63));
      }
    }
    return new haxe.io.Bytes(a.length, a);
  };
  haxe.io.Bytes.prototype = {
    get: function (pos) {
      return this.b[pos];
    },
    set: function (pos, v) {
      this.b[pos] = v & 255;
    },
    getString: function (pos, len) {
      if (pos < 0 || len < 0 || pos + len > this.length)
        throw haxe.io.Error.OutsideBounds;
      var s = '';
      var b = this.b;
      var fcc = String.fromCharCode;
      var i = pos;
      var max = pos + len;
      while (i < max) {
        var c = b[i++];
        if (c < 128) {
          if (c == 0) break;
          s += fcc(c);
        } else if (c < 224) s += fcc(((c & 63) << 6) | (b[i++] & 127));
        else if (c < 240) {
          var c2 = b[i++];
          s += fcc(((c & 31) << 12) | ((c2 & 127) << 6) | (b[i++] & 127));
        } else {
          var c21 = b[i++];
          var c3 = b[i++];
          var u =
            ((c & 15) << 18) |
            ((c21 & 127) << 12) |
            ((c3 & 127) << 6) |
            (b[i++] & 127);
          s += fcc((u >> 10) + 55232);
          s += fcc((u & 1023) | 56320);
        }
      }
      return s;
    },
    toString: function () {
      return this.getString(0, this.length);
    },
    __class__: haxe.io.Bytes,
  };
  haxe.crypto = {};
  haxe.crypto.Base64 = function () {};
  haxe.crypto.Base64.__name__ = true;
  haxe.crypto.Base64.decode = function (str, complement) {
    if (complement == null) complement = true;
    if (complement)
      while (HxOverrides.cca(str, str.length - 1) == 61)
        str = HxOverrides.substr(str, 0, -1);
    return new haxe.crypto.BaseCode(haxe.crypto.Base64.BYTES).decodeBytes(
      haxe.io.Bytes.ofString(str)
    );
  };
  haxe.crypto.BaseCode = function (base) {
    var len = base.length;
    var nbits = 1;
    while (len > 1 << nbits) nbits++;
    if (nbits > 8 || len != 1 << nbits)
      throw 'BaseCode : base length must be a power of two.';
    this.base = base;
    this.nbits = nbits;
  };
  haxe.crypto.BaseCode.__name__ = true;
  haxe.crypto.BaseCode.prototype = {
    initTable: function () {
      var tbl = new Array();
      var _g = 0;
      while (_g < 256) {
        var i = _g++;
        tbl[i] = -1;
      }
      var _g1 = 0;
      var _g2 = this.base.length;
      while (_g1 < _g2) {
        var i1 = _g1++;
        tbl[this.base.b[i1]] = i1;
      }
      this.tbl = tbl;
    },
    decodeBytes: function (b) {
      var nbits = this.nbits;
      var base = this.base;
      if (this.tbl == null) this.initTable();
      var tbl = this.tbl;
      var size = (b.length * nbits) >> 3;
      var out = haxe.io.Bytes.alloc(size);
      var buf = 0;
      var curbits = 0;
      var pin = 0;
      var pout = 0;
      while (pout < size) {
        while (curbits < 8) {
          curbits += nbits;
          buf <<= nbits;
          var i = tbl[b.get(pin++)];
          if (i == -1) throw 'BaseCode : invalid encoded char';
          buf |= i;
        }
        curbits -= 8;
        out.set(pout++, (buf >> curbits) & 255);
      }
      return out;
    },
    __class__: haxe.crypto.BaseCode,
  };
  haxe.io.Eof = function () {};
  haxe.io.Eof.__name__ = true;
  haxe.io.Eof.prototype = {
    toString: function () {
      return 'Eof';
    },
    __class__: haxe.io.Eof,
  };
  haxe.io.Error = {
    __ename__: true,
    __constructs__: ['Blocked', 'Overflow', 'OutsideBounds', 'Custom'],
  };
  haxe.io.Error.Blocked = ['Blocked', 0];
  haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
  haxe.io.Error.Overflow = ['Overflow', 1];
  haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
  haxe.io.Error.OutsideBounds = ['OutsideBounds', 2];
  haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
  haxe.io.Error.Custom = function (e) {
    var $x = ['Custom', 3, e];
    $x.__enum__ = haxe.io.Error;
    return $x;
  };
  var js = {};
  js.Boot = function () {};
  js.Boot.__name__ = true;
  js.Boot.getClass = function (o) {
    if (o instanceof Array && o.__enum__ == null) return Array;
    else return o.__class__;
  };
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
  js.Boot.__interfLoop = function (cc, cl) {
    if (cc == null) return false;
    if (cc == cl) return true;
    var intf = cc.__interfaces__;
    if (intf != null) {
      var _g1 = 0;
      var _g = intf.length;
      while (_g1 < _g) {
        var i = _g1++;
        var i1 = intf[i];
        if (i1 == cl || js.Boot.__interfLoop(i1, cl)) return true;
      }
    }
    return js.Boot.__interfLoop(cc.__super__, cl);
  };
  js.Boot.__instanceof = function (o, cl) {
    if (cl == null) return false;
    switch (cl) {
      case Int:
        return (o | 0) === o;
      case Float:
        return typeof o == 'number';
      case Bool:
        return typeof o == 'boolean';
      case String:
        return typeof o == 'string';
      case Array:
        return o instanceof Array && o.__enum__ == null;
      case Dynamic:
        return true;
      default:
        if (o != null) {
          if (typeof cl == 'function') {
            if (o instanceof cl) return true;
            if (js.Boot.__interfLoop(js.Boot.getClass(o), cl)) return true;
          }
        } else return false;
        if (cl == Class && o.__name__ != null) return true;
        if (cl == Enum && o.__ename__ != null) return true;
        return o.__enum__ == cl;
    }
  };
  js.Browser = function () {};
  js.Browser.__name__ = true;
  js.Browser.createXMLHttpRequest = function () {
    if (typeof XMLHttpRequest != 'undefined') return new XMLHttpRequest();
    if (typeof ActiveXObject != 'undefined')
      return new ActiveXObject('Microsoft.XMLHTTP');
    throw 'Unable to create XMLHttpRequest object.';
  };
  js.Lib = function () {};
  js.Lib.__name__ = true;
  js.Lib.alert = function (v) {
    alert(js.Boot.__string_rec(v, ''));
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
  Math.NaN = Number.NaN;
  Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
  Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
  Math.isFinite = function (i) {
    return isFinite(i);
  };
  Math.isNaN = function (i1) {
    return isNaN(i1);
  };
  String.prototype.__class__ = String;
  String.__name__ = true;
  Array.__name__ = true;
  var Int = { __name__: ['Int'] };
  var Dynamic = { __name__: ['Dynamic'] };
  var Float = Number;
  Float.__name__ = ['Float'];
  var Bool = Boolean;
  Bool.__ename__ = ['Bool'];
  var Class = { __name__: ['Class'] };
  var Enum = {};
  haxe.Resource.content = [
    {
      name: 'tooltip',
      data: 'PGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTRweDsiPjo6bmFtZTo6PC9kaXY+Cgo8ZGl2PjxzdHJvbmc+QWRyZXNzZTo8L3N0cm9uZz4gOjphZGRyZXNzOjo8L2Rpdj4KPGRpdj48c3Ryb25nPlTDqWzDqXBob25lOjwvc3Ryb25nPiA6OnRlbDo6PC9kaXY+Cg',
    },
  ];
  App.DEFAULT_LAT = 43.6;
  App.DEFAULT_LNG = 3.883;
  App.ROOT = '/assets/';
  App.FILENAME = 'json/mtp-defib.json';
  App.FLAG = 'img/flag.png';
  haxe.Template.splitter = new EReg(
    '(::[A-Za-z0-9_ ()&|!+=/><*."-]+::|\\$\\$([A-Za-z0-9_-]+)\\()',
    ''
  );
  haxe.Template.expr_splitter = new EReg(
    '(\\(|\\)|[ \r\n\t]*"[^"]*"[ \r\n\t]*|[!+=/><*.&|-]+)',
    ''
  );
  haxe.Template.expr_trim = new EReg('^[ ]*([^ ]+)[ ]*$', '');
  haxe.Template.expr_int = new EReg('^[0-9]+$', '');
  haxe.Template.expr_float = new EReg(
    '^([+-]?)(?=\\d|,\\d)\\d*(,\\d*)?([Ee]([+-]?\\d+))?$',
    ''
  );
  haxe.Template.globals = {};
  haxe.crypto.Base64.CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  haxe.crypto.Base64.BYTES = haxe.io.Bytes.ofString(haxe.crypto.Base64.CHARS);
  Main.main();
})();
