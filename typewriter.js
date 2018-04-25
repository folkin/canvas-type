(function () {
  
  var $container;
  var $canvas;
  var $tape;
  var $print;
  var ctx;
  var sz = { w: 670, h: 867 }
  var margin = { top: 20, right: 10, bottom: 20, left: 10 };
  var charWidth = 10;
  var lineHeight = 20;
  var tab = charWidth * 4;
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
    $tape = document.getElementById('tape');
    $print = document.getElementById('print');
    ctx = $canvas.getContext('2d');
    ctx.font = '14px Mechanical';
    
    renderTape();
    moveCanvas();
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('keypress', onKeyPress);
    window.addEventListener('beforeprint', function(e) { $print.src = $canvas.toDataURL(); })
  }

  function renderTape() {
    var ctx = $tape.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, 50, 20);
    ctx.fillStyle = 'rgba(0, 0, 160, 0.25)';
    ctx.fillRect(25 - (charWidth / 2), 2, charWidth, lineHeight - 4);
  }

  function onKeyDown(evt) {
    if (evt.key === 'Tab' ) {
      evt.preventDefault();
      evt.stopPropagation();
    }
  }

  function onKeyUp(evt) {
    if (evt.repeat)
      return;

    var handled = false;
    switch (evt.key) {
      case 'Enter':
        pos.cr();
        handled = true;
        break;
      case 'Tab':
        console.log('keyup: tab');
        pos.right(tab);
        handled = true;
        break;
      case 'Backspace':
        pos.left(charWidth);
        handled = true;
        break;
      case 'ArrowLeft':
        pos.left(evt.shiftKey ? charWidth * 4 : charWidth);
        handled = true;
        break;
      case 'ArrowRight':
        pos.right(evt.shiftKey ? charWidth * 4 : charWidth);
        handled = true;
        break;
      case 'ArrowUp':
        pos.up(evt.shiftKey ? lineHeight * 1 : lineHeight);
        handled = true;
        break;
      case 'ArrowDown':
        pos.down(evt.shiftKey ? lineHeight * 1 : lineHeight);
        handled = true;
        break;
    }

    if (handled) {
      evt.preventDefault();
      evt.stopPropagation();
      moveCanvas();
    }
  }

  function onKeyPress(evt) {
    if (evt.key.length == 1) {
      renderCharacter(evt.key);
      evt.preventDefault();
      evt.stopPropagation();
      moveCanvas();
    }
  }

  function renderCharacter(val) {
    ctx.fillStyle = 'Black';
    ctx.fillText (val, pos.x, pos.y);
    pos.right(charWidth);
  }

  function moveCanvas() {
    var totalWidth = $container.offsetWidth;
    var loc = {
      left: '' + (totalWidth / 2) - pos.x + 'px',
      top: '' + 150 - pos.y + 'px'
    };
    $canvas.style.left = loc.left;
    $canvas.style.top = loc.top;
    console.log('[x:' + pos.x + ', y:' + pos.y + ']  --  [l:' + loc.left + ', t:' + loc.top + ']');

    $tape.style.left = '' + (totalWidth / 2) - 20 + 'px';
    $tape.style.top = '135px';
  }

  document.addEventListener('DOMContentLoaded', function(evt) { initialize(); });
})();