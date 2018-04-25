(function () {
  
  var $container;
  var $canvas;
  var ctx;
  var keys = [];
  var mods = [];
  var sz = { w: 670, h: 867 }
  var margin = { top: 20, right: 10, bottom: 20, left: 10 };
  var tab = charWidth * 4;
  var charWidth = 10;
  var lineHeight = 20;
  var pos = { 
    x: margin.left, 
    y: margin.top,

    left: function(_) { this.x = Math.max(margin.left, this.x - _ ); },
    right: function(_) { this.x = Math.min(sz.w - margin.right, this.x + _ ); },
    up: function(_) { this.y = Math.max(margin.top, this.y - _ ); },
    down: function(_) { this.y = Math.min(sz.h - margin.bottom, this.y + _ ); },
    cr: function() { this.x = margin.left; this.down(lineHeight); }
   };

  function initialize() {
    $container = document.getElementById('container');
    $canvas = document.getElementById('page');
    ctx = $canvas.getContext('2d');
    ctx.font = '12px Mechanical';
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    moveCanvas();
  }

  function onKeyDown(evt) {
    if (evt.repeat)
      return;
    if (evt.key.length > 1)
      mods.push(evt.key);
    else
      keys.push(evt.key);
    
    console.log(' v: ' + evt.key + '  keys:' + JSON.stringify(keys) + '  mods:' + JSON.stringify(mods));
  }

  function onKeyUp(evt) {
    var idx = keys.indexOf(evt.key);
    if (idx >= 0) {
      keys.splice(idx, 1);
      renderCharacter(evt.key);
      console.log(' ^: ' + evt.key + '  keys:' + JSON.stringify(keys) + '  mods:' + JSON.stringify(mods));
      moveCanvas();
      return;
    }

    idx = mods.indexOf(evt.key);
    if (idx >= 0) {
      mods.splice(idx, 1);
      switch (evt.key) {
        case 'Enter':
          pos.cr();
          break;
        case 'Backspace':
          pos.left(charWidth)
          break;
        case 'ArrowLeft':
          pos.left(evt.shiftKey ? charWidth * 4 : charWidth);
          break;
        case 'ArrowRight':
          pos.right(evt.shiftKey ? charWidth * 4 : charWidth);
          break;
        case 'ArrowUp':
          pos.up(evt.shiftKey ? lineHeight * 1 : lineHeight);
          break;
        case 'ArrowDown':
          pos.down(evt.shiftKey ? lineHeight * 1 : lineHeight);
          break;
      }
      moveCanvas();
      console.log(' ^: ' + evt.key + '  keys:' + JSON.stringify(keys) + '  mods:' + JSON.stringify(mods));
      return;
    }
  }

  function renderCharacter(val) {
    ctx.fillStyle = 'Black';
    ctx.fillText (val, pos.x, pos.y);
    pos.x += 10;
  }

  function moveCanvas() {
    $canvas.style.left = '' + ($container.offsetWidth / 2) - pos.x + 'px';    
    $canvas.style.top = '' + 150 - pos.y + 'px';
  }

  document.addEventListener('DOMContentLoaded', function(evt) { initialize(); });
})();