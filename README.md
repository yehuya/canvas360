# canvas360
Image 360 on canvas

## Html
```html
<canvas id="i360"></canvas>
<script src="360.js"></script>
```

## Js
```javascript

// image name sort by order of 360
// ex: first image name i-1.png
// ex: last image name i-60.png

var canvas = new canvas360({
    path: "image_path/",
    prefix: "i-", // image name before the order number
    type: ".png", // end of image name after the order number
    start: 1, // first number of image
    end: 60, // last number of image
    now: 1, // start from image number,
    distance: 10, // the speed of image switching
    height: window.innerHeight, // canvas height
    width: window.innerWidth, // canvas width
    id: "i360", // id of canvas element 
    onresize: null, // on resize event
    onstart: null, // on user start touching event
    onmove: null, // on user switching event
    onstop: null // on user stop event
});
```
