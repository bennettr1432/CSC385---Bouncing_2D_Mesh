// This is the main JS file.
window.onload = init;

const FLATNESS = 0.001;
const MIN_VELOCITY = .01;
const inside_color = [COLOR_YELLOW, COLOR_BLACK];
const outside_color = [COLOR_BLUE, COLOR_WHITE];
var color_index = 0;

var WIDTH; //Current canvas width
var HEIGHT; //Current canvas height
var mouse = {x:0, y:0};
var start = {x:0, y:0};
var click_ok = false;
var drag_ok = false;
var version1 = false;
var version2 = true;
var gravity = 0.001;
var bounce_factor = -0.5;

var rad = 0.25;



// Renders the frame.
function render(){
    setTimeout(function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        blob_world.init_blob_world();
        blob_world.free_fall();
        blob_world.render();
        if (version2) {
            gravity = 0.005;
            bounce_factor = -0.6
            click_ok = true;
            blob_world.evolve1();
        } else {
            gravity = 0.001;
            bounce_factor = -0.5;
            blob_world.evolve();
        }

        requestAnimFrame(render);
    }, 100);
}


function init(){

    // Initialize WebGL.
    canvas = document.getElementById("gl-canvas");
    HEIGHT = canvas.height;
    WIDTH = canvas.width;

    canvas.onclick = getMousePosition;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;
    document.onkeydown = keyDown;
    var random_button = document.getElementById("Random");

    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl){
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0,WIDTH, HEIGHT);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Initialize shaders and attribute pointers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var blob = new Blob(vec4(0,0,0,1), rad, 8, color_index);
    blob_world = new BlobWorld(blob, gl, program);

    // Start rendering.
    render();

}

function getMousePosition(event) {
    click_ok = true;
    //var blob = blob_world.get_blob();
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

    //For testing purposes
    var coords = "Pixel X coords: " + mouse.x + ", Pixel Y coords: " + mouse.y;

    var point_clicked = convertToWebGLCoords(mouse);

    //Set WebGL coordinates for mouse.x and mouse.y
    mouse.x = point_clicked[0];
    mouse.y = point_clicked[1];

    //Set the new positions of each vertex
    if (version1) {
        blob_world.new_position(mouse);
    } else {
        blob_world.new_position1(mouse);
    }

    //For testing purposes
    console.log(coords); //Print the coordinates to the console
    console.log("Transformed point clicked " + point_clicked);
}

function mouseDown(event) {

    // tell the browser we're handling this mouse event
    event.preventDefault();
    event.stopPropagation();

    // get the current mouse position
    mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
    mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

    drag_ok = false;
    var blob = blob_world.get_blob();

    var point_clicked = convertToWebGLCoords(mouse);

    //Set WebGL coordinates for mouse.x and mouse.y
    mouse.x = point_clicked[0];
    mouse.y = point_clicked[1];

    var dx = blob.center.pos[0] - mouse.x;
    var dy = blob.center.pos[1] - mouse.y;

    // test if the mouse is inside this circle
    if (dx * dx + dy * dy < blob.rad * blob.rad) {
        drag_ok = true;
    }

    // save the current mouse position
    start.x = mouse.x;
    start.y = mouse.y;

}

function mouseUp(event) {
    // tell the browser we're handling this mouse event
    event.preventDefault();
    event.stopPropagation();

    // clear all the dragging flags
    drag_ok = false;
}

function mouseMove(event) {
    // if we're dragging anything...
    var blob = blob_world.get_blob();
    click_ok = false;

    if (drag_ok) {

        // tell the browser we're handling this mouse event
        event.preventDefault();
        event.stopPropagation();

        // get the current mouse position
        mouse.x = event.clientX - canvas.offsetLeft; //Get the x-coordinate of the mouse
        mouse.y = event.clientY - canvas.offsetTop; //Get the y-coordinate of the mouse

        var point_clicked = convertToWebGLCoords(mouse);

        //Set WebGL coordinates for mouse.x and mouse.y
        mouse.x = point_clicked[0];
        mouse.y = point_clicked[1];

        // redraw the scene with the new positions
        //Set the new positions of each vertex
        if (version1 == true) {
            blob_world.new_position(mouse);
        } else {
            blob_world.new_position1(mouse);
        }

        // reset the starting mouse position for the next mousemove
        start.x = mouse.x;
        start.y = mouse.y;
    }
}

function keyDown(event) {
    var blob = blob_world.get_blob();
    switch (event.key) {
        case "ArrowRight":
            console.log('right');
            version1 = true;
            version2 = false;
            break;
        case "ArrowUp":
            console.log('up');
            if (rad < 0.75) {
                rad += 0.1;
                blob.rad = rad;
            }
            break;
        case "ArrowLeft":
            console.log('left');
            version1 = false;
            version2 = true;
            break;
        case "ArrowDown":
            console.log('down');
            if (rad > 0.15) {
                rad -= 0.1;
            }
            break;
    }
    blob.rad = rad;
}

function convertToWebGLCoords(mouse) {

    var mouseX = mouse.x;
    var mouseY = mouse.y;

    //Convert the pixel to WebGL coordinates
    var pixel_x = ((mouseX / canvas.width * canvas.width) - canvas.width / 2);
    var pixel_y = ((canvas.height - mouseY) / canvas.height * canvas.height) - canvas.height / 2;
    var point_clicked = vec2((Math.floor(pixel_x)) / (canvas.width / 2), (Math.floor(pixel_y)) / (canvas.height / 2));

    return point_clicked;
}