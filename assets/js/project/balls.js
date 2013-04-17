var fi = fi || {};
fi.labs = fi.labs || {};

/**
 * @class Balls
 * Description.
 */

/**
 * @param {Element} $context - the container element for the component elements.
 */
fi.labs.Balls = function($context, options) {
  this.$context = $context;
  this.$displayCanvas = $('canvas', this.$context);
  this.dCtx = this.$displayCanvas[0].getContext('2d');
  this.renderCanvas = document.createElement('canvas');
  this.rCtx = this.renderCanvas.getContext('2d');
  this.animationFrameRequest;
  this.maxVerticalBalls = 0;
  this.maxHoriztonalBalls = 0;
  this.maxY;
  this.maxV;
  this.bars = [];
  this.rowColors = [];
  this.gui;

  this.opts = $.extend({
    ballRadius: 3.5,
    startColor: [255, 255, 255],
    endColor: [196, 23, 129],
    direction: 1,
    horizontalGapSize: 3,
    verticalGapSize: 3,
    gravity: -1.5,
    impulseFrequency: 0.1,
    maxImpulse: 10,
    groupImpulseFrequency: 0.08,
    maxGroupImpulse: 20,
    mirrored: true
  }, options);
};


fi.labs.Balls.prototype = {

  init: function() {

    if (!(this.renderCanvas.getContext || this.renderCanvas.getContext('2d'))) {
      console.log('no canvas support - TODO add static image fallback');
      return;
    }

    this.setupTestSliders();
    this.setupCanvases();
    this.setupBars();
    this.doLoop();
  },

  // Add dat.GUI sliders.
  setupTestSliders: function() {
    this.gui = new dat.GUI();
    this.gui.add(this.opts, 'direction', {up: 1, down: -1});
    this.gui.add(this.opts, 'verticalGapSize', 0, 10);
    this.gui.add(this.opts, 'gravity', -5.0, -0.1);
    this.gui.add(this.opts, 'impulseFrequency', 0.05, 0.20);
    this.gui.add(this.opts, 'maxImpulse', 0, 40);
    this.gui.add(this.opts, 'groupImpulseFrequency', 0.00, 0.3);
    this.gui.add(this.opts, 'maxGroupImpulse', 0, 40);
    this.gui.add(this.opts, 'mirrored');
  },

  // Prepares render and display canvases.
  setupCanvases: function() {
    this.$displayCanvas = $('canvas', this.$context);
    this.$displayCanvas[0].width = this.renderCanvas.width = this.$context.width();
    this.$displayCanvas[0].height = this.renderCanvas.height = this.$context.height();
    this.maxV = this.opts.maxImpulse*1.5;
    this.maxY = this.renderCanvas.height;
    this.dCtx = this.$displayCanvas[0].getContext('2d');
    this.rCtx = this.renderCanvas.getContext('2d');
  },

  // Calculates initial bar/ball display information.
  setupBars: function() {
    this.maxHoriztonalBalls = Math.floor(this.$context.width()/(this.opts.horizontalGapSize + 2*this.opts.ballRadius));
    this.maxVerticalBalls = Math.floor(this.$context.height()/(this.opts.verticalGapSize + 2*this.opts.ballRadius));

    if (this.opts.mirrored) {
      this.maxVerticalBalls = this.maxVerticalBalls/2;
    }

    // Set initial velocity, position, and horizontal spacing for bars (columns).
    for (var i=0; i<this.maxHoriztonalBalls; i++) {
      this.bars[i] = {
        v: Math.random()*20,
        x: i*(this.opts.ballRadius*2 + this.opts.horizontalGapSize),
        y: Math.round(Math.random()*this.$context.height()/2)
      };
    }

    // Calculate ball colors based on height.
    var r, g, b;
    for (var i=0; i<this.maxVerticalBalls; i++) {
      r = Math.round(this.opts.startColor[0] + i/this.maxVerticalBalls*(this.opts.endColor[0] - this.opts.startColor[0]));
      g = Math.round(this.opts.startColor[1] + i/this.maxVerticalBalls*(this.opts.endColor[1] - this.opts.startColor[1]));
      b = Math.round(this.opts.startColor[2] + i/this.maxVerticalBalls*(this.opts.endColor[2] - this.opts.startColor[2]));
      this.rowColors[i] = 'rgb(' + r + ',' + g + ',' + b + ')';
    }
  },

  doLoop: function() {
    this.animationFrameRequest = requestAnimationFrame($.proxy(this.step, this));
  },

  stop: function() {
    cancelAnimationFrame(this.animationFrameRequest);
  },

  step: function() {
    this.doLoop();

    this.rCtx.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    this.dCtx.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);

    var impulse = 0,
        groupImpulse = (Math.random() < this.opts.groupImpulseFrequency) ? Math.random()*this.opts.maxGroupImpulse : 0,
        bar,
        numBallsToRender = 0,
        startingY = (this.opts.direction == 1) ? this.renderCanvas.height : 0;

    if (this.opts.mirrored) {
      startingY = startingY/2;
    }

    for (var i in this.bars) {
      // Update bar heights.
      bar = this.bars[i];
      impulse = groupImpulse + (Math.random() < this.opts.impulseFrequency) ? Math.random()*this.opts.maxImpulse : 0;
      bar.v = bar.v + this.opts.gravity;
      bar.v += (bar.v >= this.maxV/2) ? 0 : impulse;
      bar.v = Math.min(this.maxV, (bar.y > 0) ? bar.v : Math.max(0, bar.v));
      bar.y = Math.min(this.maxY, Math.max(0, bar.y + bar.v));

      // Render balls.
      numBallsToRender = Math.min(this.maxVerticalBalls, Math.round(bar.y/(this.opts.verticalGapSize + 2*this.opts.ballRadius)));
      for (var i=0; i<numBallsToRender; i++) {
        this.rCtx.beginPath();
        this.rCtx.arc(bar.x + this.opts.ballRadius,
          startingY + (-1*this.opts.direction)*(i*(2*this.opts.ballRadius + this.opts.verticalGapSize) + this.opts.ballRadius),
          this.opts.ballRadius,
          0, 2 * Math.PI, false);
        this.rCtx.fillStyle = this.rowColors[i];
        this.rCtx.fill();
      }
    }


    this.draw();
  },

  // Draws render canvas to display canvas (mirroring if requested).
  draw: function() {
    if (this.opts.mirrored) {
      this.rCtx.scale(1, -1);
      this.rCtx.drawImage(this.renderCanvas, 0, -1*(this.renderCanvas.height - 2*this.opts.ballRadius));
      this.rCtx.scale(1, 1);
      this.dCtx.drawImage(this.renderCanvas, 0, 0);
    } else {
      this.dCtx.drawImage(this.renderCanvas, 0, 0);
    }
  }
};

fi.labs.ComponentLoader.register('fi.labs.Balls', fi.labs.Balls);
