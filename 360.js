/**
 * Image 360 on canvas
 * Author: yehuya
 * Github: https://github.com/yehuya/canvas360
 */

function canvas360(options) {
    if (!(this instanceof canvas360)) return new canvas360(options);

    // extend options
    for(var p in options){
        if(this.options.hasOwnProperty(p)){
            this.options[p] = options[p];
        }
    }

    this.init();
}

/**
 * default options
 */
canvas360.prototype.options = {
    path: null,
    prefix: null,
    type: null,
    start: 0,
    end: null,
    now: 0,
    distance: 10,
    height: window.innerHeight,
    width: window.innerWidth,
    id: null,
    onresize: null,
    onstart: null,
    onmove: null,
    onstop: null
}

/**
 * on resize
 */
canvas360.prototype.resize = function(e){
    if(typeof this.options.onresize == "function") this.options.onresize(e, this);
}

/**
 * cache storage
 * save all images as base64
 */
canvas360.prototype.storage = {
    base64: [],
    cache: function (data, index) {
        if (!this.exists(index)) {
            this.add(data, index);
        }
    },
    get: function (index) {
        return this.base64[index];
    },
    add: function (data, index) {
        this.base64[index] = data;
    },
    exists: function (index) {
        return this.get(index) != undefined;
    }
};

/**
 * get next image
 */
canvas360.prototype.nextImage = function () {
    var o = this.options;

    if (this.p.d > o.distance) {
        if (this.p.x == "left") {
            o.now < o.end ? o.now++ : o.now = o.start;
        } else if (this.p.x == "right") {
            o.now > o.start ? o.now-- : o.now = o.end;
        }
    }

    // return next image path
    return o.path + o.prefix + o.now + o.type;
}

/**
 * user position on the canvas
 * for mouse | touch event position - direction
 */
canvas360.prototype.p = {
    top: 0,
    left: 0,
    d: 0, // distance between the mousemove (left - current)
    x: null, // left | right
    y: null, // up | down
    set: function (e) {
        this.top = e.clientY || e.touches[0].clientY;
        this.left = e.clientX || e.touches[0].clientX;
    },
    update: function (e) {
        var left = e.clientX || e.touches[0].clientX;
        var top = e.clientY || e.touches[0].clientY;

        this.d > 10 ? this.d = Math.abs(this.left - left) : this.d += Math.abs(this.left - left);
        left > this.left ? this.x = "right" : this.x = "left";
        top >= this.top ? this.y = "bottom" : this.y = "up";

        this.set(e);
    }
}

/**
 * draw image on canvas
 */
canvas360.prototype.drawImage = function(src){
    var current = this.options.now - 1;
    var self = this;

    var img = new Image();

    img.onload = function(){
        var ratio = img.width / img.height;
        self.canvas.ctx.clearRect(0, 0, self.options.width, self.options.height);
        self.canvas.ctx.drawImage(img,0,0, self.options.width, self.options.width/ratio);
        if(!self.storage.exists(current)) self.storage.cache(self.canvas.c.toDataURL(), current);
    }

    img.src = !this.storage.exists(current) ? src : this.storage.get(current);
}

/**
 * create canvas element for lazy load
 */
canvas360.prototype.createCanvasToLazyLoad = function(){
    this.canvas.lazyload.canvas = document.createElement("canvas");
    this.canvas.lazyload.canvas.setAttribute("height", this.options.height);
    this.canvas.lazyload.canvas.setAttribute("width", this.options.width);

    this.canvas.lazyload.ctx = this.canvas.lazyload.canvas.getContext("2d");
}

/**
 * get user canvas
 */
canvas360.prototype.getCanvas = function(){
    this.canvas.c = document.getElementById(this.options.id);
    this.canvas.c.setAttribute("height", this.options.height);
    this.canvas.c.setAttribute("width", this.options.width);

    this.canvas.ctx = this.canvas.c.getContext("2d");
}

/**
 * object for canvas store
 */
canvas360.prototype.canvas = {
    lazyload: {
        canvas: null,
        ctx: null
    },
    c: null,
    ctx: null
}

/**
 * lazy load images for 360
 * load all images on window.load and save them in storage object
 */
canvas360.prototype.lazyLoad = function (i) {
    var o = this.options;
    var self = this;
    if (i > o.end) return;
    var img = new Image();

    img.onload = function () {
        var ratio = img.width / img.height;
        self.canvas.lazyload.ctx.clearRect(0, 0, self.options.width, self.options.height);
        self.canvas.lazyload.ctx.drawImage(img, 0, 0, self.options.width, self.options.width / ratio);
        if (!self.storage.exists(i - 1)) self.storage.cache(self.canvas.lazyload.canvas.toDataURL(), i - 1);

        self.lazyLoad(++i);
    }

    var src = o.path + o.prefix + i + o.type;
    img.src = src;
}

/**
 * for remove function - removeEventListener
 */
canvas360.prototype.bindFnForRemove = null;

/**
 * draw next image on the canvas
 */
canvas360.prototype.drawNextImage = function() {
    var img = this.nextImage();
    this.drawImage(img);
}

/**
 * on event move
 */
canvas360.prototype.onMove = function(e) {
    this.p.update(e);
    this.drawNextImage();

    if(typeof this.options.onmove == "function") this.options.onmove();
}

/**
 * on event down
 * start
 */
canvas360.prototype.onDown = function(e) {
    this.p.set(e);

    this.bindFnForRemove = this.onMove.bind(this);
    
    if(typeof this.options.onstart == "function") this.options.onstart();

    this.canvas.c.addEventListener("mousemove", this.bindFnForRemove);
    this.canvas.c.addEventListener('touchmove', this.bindFnForRemove);
}

/**
 * on event up
 * end
 */
canvas360.prototype.onUp = function(e) {
    this.canvas.c.removeEventListener("mousemove", this.bindFnForRemove);
    this.canvas.c.removeEventListener('touchmove', this.bindFnForRemove);

    this.p.d = 0;
    this.p.x = null;
    this.p.y = null;

    if(typeof this.options.onstop == "function") this.options.onstop();
}

/**
 * init all the function 
 */
canvas360.prototype.init = function(){
    var self = this;

    this.createCanvasToLazyLoad();
    self.getCanvas()

    // mouse event   
    this.canvas.c.addEventListener("mousedown", this.onDown.bind(self));
    this.canvas.c.addEventListener("mouseup", this.onUp.bind(self));
    this.canvas.c.addEventListener("mouseleave", this.onUp.bind(self));

    // touch event
    this.canvas.c.addEventListener('touchstart', this.onDown.bind(self));
    this.canvas.c.addEventListener('touchend', this.onUp.bind(self));

    window.onload = function(){;
        self.drawNextImage();
        self.lazyLoad(self.options.start);
    }

    window.onresize = self.resize.bind(self);
}