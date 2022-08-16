(function () { "use strict";
var ColorChanger = function() { };
ColorChanger.createTransition = function(pId,pLoop) {
	if(ColorChanger._timer != null) ColorChanger._timer.stop();
	ColorChanger.loop = pLoop;
	ColorChanger.elm = window.document.getElementById(pId);
	var currentColor = ColorChanger.getElementBG(ColorChanger.elm);
	var endColor = ColorChanger.generateRGB();
	if(currentColor.r == endColor.r && currentColor.g == endColor.g && currentColor.b == endColor.b) return;
	var distance = ColorChanger.calculateDistance(currentColor,endColor);
	var increment = ColorChanger.calculateIncrement(distance);
	ColorChanger.iterate(currentColor,endColor,increment);
};
ColorChanger.iterate = function(currentColor,endColor,increment) {
	var iteration = Math.round(20.);
	ColorChanger._timer = new haxe.Timer(iteration);
	ColorChanger._timer.run = function() {
		if(currentColor.r > endColor.r) {
			currentColor.r -= increment.r;
			if(currentColor.r <= endColor.r) increment.r = 0;
		} else {
			currentColor.r += increment.r;
			if(currentColor.r >= endColor.r) increment.r = 0;
		}
		if(currentColor.g > endColor.g) {
			currentColor.g -= increment.g;
			if(currentColor.g <= endColor.g) increment.g = 0;
		} else {
			currentColor.g += increment.g;
			if(currentColor.g >= endColor.g) increment.g = 0;
		}
		if(currentColor.b > endColor.b) {
			currentColor.b -= increment.b;
			if(currentColor.b <= endColor.b) increment.b = 0;
		} else {
			currentColor.b += increment.b;
			if(currentColor.b >= endColor.b) increment.b = 0;
		}
		ColorChanger.elm.style.background = ColorChanger.rgb2hex(currentColor);
		if(increment.r == 0 && increment.g == 0 && increment.b == 0) {
			ColorChanger._timer.stop();
			ColorChanger._timer = null;
			if(ColorChanger.loop) {
				var distance = ColorChanger.calculateDistance(currentColor,endColor);
				ColorChanger.iterate(endColor,ColorChanger.generateRGB(),ColorChanger.calculateIncrement(distance));
			}
		}
	};
};
ColorChanger.getElementBG = function(pElem) {
	var bg = window.getComputedStyle(pElem).backgroundColor;
	bg = StringTools.replace(bg,"rgb(","");
	bg = StringTools.replace(bg,")","");
	var rgbStr = bg.split(",");
	return { r : Std.parseInt(rgbStr[0]), g : Std.parseInt(rgbStr[1]), b : Std.parseInt(rgbStr[2])};
};
ColorChanger.generateRGB = function() {
	return { r : ColorChanger.getRandomValue(), g : ColorChanger.getRandomValue(), b : ColorChanger.getRandomValue()};
};
ColorChanger.getRandomValue = function() {
	var num = Math.floor(Math.random() * 225);
	while(num < 25) num = Math.floor(Math.random() * 225);
	return num;
};
ColorChanger.calculateDistance = function(current,next) {
	return { r : Math.round(Math.abs(current.r - next.r)), g : Math.round(Math.abs(current.g - next.g)), b : Math.round(Math.abs(current.b - next.b))};
};
ColorChanger.calculateIncrement = function(distance) {
	var incR = Std["int"](Math.abs(Math.floor(distance.r / 100)));
	var incG = Std["int"](Math.abs(Math.floor(distance.g / 100)));
	var incB = Std["int"](Math.abs(Math.floor(distance.b / 100)));
	return { r : incR + (incR == 0?1:0), g : incG + (incG == 0?1:0), b : incB + (incB == 0?1:0)};
};
ColorChanger.rgb2hex = function(color) {
	return "#" + StringTools.hex(color.r,2) + StringTools.hex(color.g,2) + StringTools.hex(color.b,2);
};
var HxOverrides = function() { };
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
var Main = function() {
	ColorChanger.createTransition("color-example",true);
};
Main.main = function() {
	new Main();
};
var Std = function() { };
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
};
var haxe = {};
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
ColorChanger.INCREMENT_STOP = 100;
Main.main();
})();
