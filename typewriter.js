(function () {
  
  var ModKeys = {
    none: 0x0,
    shift: 0x1,
    ctrl: 0x2,
    alt: 0x4,

    mod: function(evt) {
      var value = ModKeys.none;
      value |= evt.shiftKey ? ModKeys.shift : ModKeys.none;
      value |= evt.ctrlKey ? ModKeys.ctrl : ModKeys.none;
      value |= evt.altKey ? ModKeys.alt : ModKeys.none;
      return value;
    },
    isShift: function(mod) {
      return (mod & ModKeys.shift) === ModKeys.shift;
    },
    isCtrl: function(mod) {
      return (mod & ModKeys.ctrl) === ModKeys.ctrl;
    },
    isAlt: function(mod) {
      return (mod & ModKeys.alt) === ModKeys.alt;
    }
  };

  // ======================================
  //          Page Class
  // ======================================
  function Page() {
    var me = this;
    this.pos = { x: this.margin.left, y: this.margin.top };
    this.actions = [];
    this.move = {
      offset: function(x, y) { 
        this.pos.x += x; 
        this.pos.y += y; 
        this.pos.x = this.pos.x < 0 ? 0 : this.pos.x > this.dimensions.width ? this.dimensions.width : this.pos.x;
        this.pos.y = this.pos.y < 0 ? 0 : this.pos.y > this.dimensions.height ? this.dimensions.height : this.pos.y;
      }.bind(me),
      left: function(_) { this.move.offset(-_, 0); }.bind(me),
      right: function(_) { this.move.offset(_, 0); }.bind(me),
      up: function(_) { this.move.offset(0, -_); }.bind(me),
      down: function(_) { this.move.offset(0, _); }.bind(me),
      cr: function() { this.pos.x = this.margin.left; this.move.down(this.dimensions.lineHeight); }.bind(me),
      tab: function() { this.move.right(this.dimensions.tabWidth); }.bind(me),
    }
  };

  Page.prototype.margin = { top: 50, right: 50, bottom: 50, left: 50 };

  Page.prototype.dimensions = { width: 670, height: 867, lineHeight: 20, charWidth: 10, tabWidth: 40 };
  
  Page.list = function() {
    var pages = [];
    for (var i=0; i<localStorage.length; i++) {
      pages.push(localStorage.key(i));
    }
    pages.sort();
    return pages;
  };

  Page.open = function(name) {
    var json = localStorage.getItem(name);
    var data = JSON.parse(json);
    var page = new Page();
    page.pos = { x: obj.x, y: obj.y };
    for (var i=0; i<obj.a.length; i++) {
      this.actions.push(Action.parse(obj.a[i]));
    }
    return page;
  };

  Page.prototype.save = function(name) {
    var page = { x: this.pos.x, y: this.pos.y, a: [] };
    for (var i=0; i<this.actions.length; i++) {
      page.a.push(this.actions[i].toJson());
    }
    localStorage.setItem(name, JSON.stringify(page));
  };

  Page.prototype.delete = function(name) {
    localStorage.removeItem(name);
  };

  Page.prototype.render = function(ctx) {
    var action;
    for (var i=0; i<this.actions.length; i++) {
      this.actions[i].render(ctx);
    }
  };

  Page.prototype.action = function(key, mod) {
    var rand = Math.random() / ((Math.ceil(Math.random() * 10) % 2 === 0) ? 1 : -1);
    var x = this.pos.x + rand;
    rand = Math.random() / ((Math.ceil(Math.random() * 10) % 2 === 0) ? 5 : -5);
    var y = this.pos.y + rand; 
    var action = new Action(x, y, key);
    this.actions.push(action);
    this.move.right(this.dimensions.charWidth);
    return action;
  }


  // ======================================
  //          Action Class
  // ======================================
  function Action(x, y, key) {
    this.x = x || 0;
    this.y = y || 0;
    this.key = key || '';
  };
  Action.parse = function(obj) {
    return new Action(obj.x, obj.y, obj.k);    
  };
  Action.prototype.toJson = function() {
    return { x: this.x, y: this.y, k: this.key }
  };
  Action.prototype.render = function(ctx) {
    ctx.fillStyle = 'Black';    
    ctx.fillText (this.key, this.x, this.y);
  };


  // ======================================
  //          Typewriter Class
  // ======================================
  function Typewriter() {
    this.$main = null;
    this.$paper = null;
    this.$typewriter = null;
    this.$print;
    this.ctx;
    this.dimensions = { };
    this.page = new Page();
  };

  Typewriter.prototype.initialize = function(window) {
    var document = window.document;
    this.$main = document.getElementsByTagName("main")[0];
    this.$paper = document.getElementById('paper');
    this.$typewriter = document.getElementById('typewriter');
    this.$print = document.getElementById('print');
    
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('keypress', this.onKeyPress.bind(this));
    document.addEventListener('wheel', this.onMouseWheel.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('beforeprint', function(e) { this.$print.src = this.$paper.toDataURL(); }.bind(this));
    window.addEventListener('afterprint', function(e) { this.ctx = this.$paper.getContext('2d'); this.page.render(this.ctx); }.bind(this));

    this.onResize();
  }

  Typewriter.prototype.renderTypewriter = function() {

    var sz = { width: this.dimensions.totalWidth, height: this.$typewriter.height };
    var w = this.page.dimensions.width + 100;
    var x = (sz.width - w) / 2;

    var ctx = this.$typewriter.getContext('2d');
    ctx.clearRect(0, 0, sz.width, sz.height);
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 150, x, 50);
    ctx.fillRect(sz.width - x - 3, 150, x, 50);
    ctx.fillStyle = '#009999';
    ctx.fillRect(x, 150, w, 50);
    ctx.fillStyle = '#999999';
    ctx.fillRect(x, 10, w, 4);
    ctx.fillStyle = '#050505';
    ctx.fillRect(x + 40, 2, 50, 20);
    ctx.fillRect(x + w - 90, 2, 50, 20);

    this.$typewriter.style.left = '0';
    this.$typewriter.style.top = '' + (this.dimensions.totalHeight - sz.height) + 'px';
  };

  Typewriter.prototype.onResize = function() {
    this.dimensions = {
      totalWidth: window.innerWidth,
      totalHeight: window.innerHeight,
      pageWidth: this.page.dimensions.width,
    };

    var sz = { width: this.dimensions.totalWidth, height: 200 };
    this.dimensions.x = (this.dimensions.totalWidth / 2);
    this.dimensions.y = (this.dimensions.totalHeight - sz.height + 50);

    this.$typewriter.width = sz.width;
    this.$typewriter.height = sz.height;
    this.$typewriter.style.width = '' + sz.width + 'px';
    this.$typewriter.style.height = '' + sz.height + 'px';

    this.$paper.width = this.page.dimensions.width;
    this.$paper.height = this.page.dimensions.height;
    this.$paper.style.width = '' + this.page.dimensions.width + 'px';
    this.$paper.style.height = '' + this.page.dimensions.height + 'px';

    this.ctx = this.$paper.getContext('2d');
    this.ctx.font = '14px Mechanical';

    this.renderTypewriter();
    this.moveCanvas();
  };

  Typewriter.prototype.onMouseWheel = function(evt) {
    var delta = { x: evt.delaMode == 0x1 ? evt.deltaX * this.page.dimensions.charWidth : evt.deltaX / 10, 
                  y: evt.delaMode == 0x1 ? evt.deltaY * this.page.dimensions.lineHeight : evt.deltaY / 10 };
    
    if (delta.x > 0)
      this.page.move.right(delta.x);
    else if (delta.x < 0)
        this.page.move.left(-delta.x);

    if (delta.y > 0)
      this.page.move.up(delta.y);
    else if (delta.y < 0)
        this.page.move.down(-delta.y);
  
    this.moveCanvas();
  }

  Typewriter.prototype.onKeyDown = function(evt) {
    if (evt.key === 'Tab' ) {
      evt.preventDefault();
      evt.stopPropagation();
    }
  };

  Typewriter.prototype.onKeyUp = function(evt) {
    if (evt.repeat)
      return;

    var handled = false;
    var charWidth = this.page.dimensions.charWidth;
    var lineHeight = this.page.dimensions.lineHeight;
    switch (evt.key) {
      case 'Enter':
        this.page.move.cr();
        handled = true;
        break;
      case 'Tab':
        console.log('keyup: tab');
        this.page.move.tab();
        handled = true;
        break;
      case 'Backspace':
        this.page.move.left(charWidth);
        handled = true;
        break;
      case 'ArrowLeft':
        this.page.move.right(evt.shiftKey ? charWidth * 4 : evt.ctrlKey ? 1 : charWidth);
        handled = true;
        break;
      case 'ArrowRight':
        this.page.move.left(evt.shiftKey ? charWidth * 4 : evt.ctrlKey ? 1 : charWidth);
        handled = true;
        break;
      case 'ArrowUp':
        this.page.move.down(evt.shiftKey ? lineHeight * 3 : evt.ctrlKey ? 1 : lineHeight);
        handled = true;
        break;
      case 'ArrowDown':
        this.page.move.up(evt.shiftKey ? lineHeight * 3 : evt.ctrlKey ? 1 : lineHeight);
        handled = true;
        break;
    }
    if (handled) {
      evt.preventDefault();
      evt.stopPropagation();
      this.moveCanvas(true);
    }
  };

  Typewriter.prototype.onKeyPress = function(evt) {
    if (evt.repeat)
      return;

    if (evt.key.length == 1) {
      this.page.action(evt.key).render(this.ctx);
      evt.preventDefault();
      evt.stopPropagation();
      this.moveCanvas();
    }
  }

  Typewriter.prototype.moveCanvas = function(a) {
    var left = (this.dimensions.x - this.page.pos.x);
    var top = (this.dimensions.y - this.page.pos.y);
    console.log("x:" + left + ", y:" + top);
    if (a) {
      animate(this.$paper, 'left', left, 50);
      animate(this.$paper, 'top', top, 50);
    }
    else
    {
      this.$paper.style.left = left + 'px';
      this.$paper.style.top = top + 'px';
      this.$paper._vars = { left: left, top: top };
    }
  }

  function animate(elem, prop, to, ms) {
    if (!elem._vars)
      elem._vars = {};
    var val = elem._vars[prop] || 0;
    var distance = to - val;
    var rate = distance / (ms / 5);
    rate = rate > 15 ? 15 : rate < -15 ? -15 : rate;
    var id;

    function frame() {
      if (Math.abs(to - val) < Math.abs(rate))
        val = to;
      else
        val += rate;

      elem.style[prop] = val + 'px';
      if (val == to) {
        elem._vars[prop] = to;
        clearInterval(id);
      }
    }

    id = setInterval(frame, 5);
  }

  var typewriter = new Typewriter();
  document.addEventListener('DOMContentLoaded', function(evt) { typewriter.initialize(window); });
})();