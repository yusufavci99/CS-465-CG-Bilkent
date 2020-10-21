"use strict"

var canvas;
var gl;

var maxNumVertices  = 200;
var index = 0;
 
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var points = [];
var resultPoints = [];
var iterationCount = 2;
var backgroundColorRGB;
var shapeColorRGB;

var fColorPointer;
var oxo;
var zoomMultiplier = 1;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    var a = document.getElementById("Button1")
    a.addEventListener("click", function() {
        resultPoints = [];

        if(iterationCount > 0) {
            for(let lineIndex = 0; lineIndex < points.length - 1; lineIndex++) {
                koch(points[lineIndex], points[lineIndex + 1], iterationCount);
            }
            //koch(points[points.length - 1], points[0], iterationCount);
        }
        else {
            resultPoints = points;
        }
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        //gl.bufferSubData(gl.ARRAY_BUFFER, 8*i, flatten(points[i]));
        gl.bufferData( gl.ARRAY_BUFFER, flatten(resultPoints), gl.STATIC_DRAW );

        for(let i = 0; i < resultPoints.length; i ++) {
            gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
            //gl.bufferSubData(gl.ARRAY_BUFFER, 16*i, flatten(colorData[i]));
        }
    
        numPolygons++;
        numIndices[numPolygons] = 0;
        start[numPolygons] = index;
        render();
    });

    canvas.addEventListener("mousedown", function(event){
        t  = vec2(2*event.clientX/canvas.width-1, 
           2*(canvas.height-event.clientY)/canvas.height-1);

        points.push(t);

        // gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        // gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));

        // gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
        // gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));

        numIndices[numPolygons]++;
        index++;
    } );

    

    gl.viewport( 0, 0, canvas.width, canvas.height );

    //get selected colors in hex
    var backgroundColorHex = document.getElementById("backgroundColor").value;

    //convert hex colors into rgb
    backgroundColorRGB = hexToRgb(backgroundColorHex);

    //clear buffer with new color
    gl.clearColor(backgroundColorRGB.r / 255.0, backgroundColorRGB.g / 255.0, backgroundColorRGB.b / 255.0, 1.0);

    gl.clear( gl.COLOR_BUFFER_BIT );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    fColorPointer = gl.getUniformLocation(program, "fColor");
    oxo = gl.getUniformLocation(program, "zoomC");

    gl.useProgram( program );

  
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );
    
    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    // UTILITIES

    // Saving The Koch Curve
    document.getElementById("saveShapeButton").addEventListener("click", () => {
        download(JSON.stringify({backgroundColor: backgroundColorRGB, iteration: iterationCount, vertices: points}), "koch.txt", "text/plain");
    })

    // Loading A koch Curve
    const inputElement = document.getElementById("fileInput");
    inputElement.addEventListener("change", handleFiles, false);
    function handleFiles() {

        var r = new FileReader();
        r.onload = (function(file) {
            return function(e) {
                var contents = e.target.result;
                
                console.log(JSON.parse(contents));
                let loadedContent = JSON.parse(contents);
                points = loadedContent.vertices;
                backgroundColorRGB = loadedContent.backgroundColor;
                iterationCount = loadedContent.iteration;

                document.getElementById("Button1").click();
            };
        })(this.files[0]);
        r.readAsText(this.files[0]);
    }

    // Iteration Number
    let slider = document.getElementById("sliderNumber");
    let numForm = document.getElementById("formNumber");
    slider.addEventListener("change", (event) => {
        let newValue = parseInt(event.target.value);

        numForm.value = event.target.value;
        iterationCount = newValue;
    })
    numForm.addEventListener("change", (event) => {
        let newValue = parseInt(event.target.value);
        
        if (event.target.value > parseInt(numForm.max)) {
            slider.value = numForm.max;
            numForm.value = numForm.max;
            iterationCount = parseInt(numForm.max);
        }
        else if (event.target.value < parseInt(numForm.min)){
            slider.value = numForm.min;
            numForm.value = numForm.min;
            iterationCount = parseInt(numForm.min);
        }
        else {
            slider.value = event.target.value;
            iterationCount = newValue;
        }
    })

    // Reset Polygon

    document.getElementById("resetPolygon").addEventListener("click", () => {
        points = [];
        gl.clear( gl.COLOR_BUFFER_BIT);
    });

    // ZOOMING

    //StackOverFlow
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        
        switch (event.key) {
            case "-":
                zoomMultiplier *= (10/9);
                render();
                break;
            case "+":
                zoomMultiplier *= 0.9;
                render();
                break;
            default:
            return; // Quit when this doesn't handle the key event.
        }
        
        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }, true);
    // the last option dispatches the event to the listener first,
    // then dispatches event to window


}

function render() {
   

    //get selected colors in hex
    var backgroundColorHex = document.getElementById("backgroundColor").value;
    var shapeColorHex = document.getElementById("shapeColor").value;

    //convert hex colors into rgb
    backgroundColorRGB = hexToRgb(backgroundColorHex);
    shapeColorRGB = hexToRgb(shapeColorHex);

    //clear buffer with new color
    gl.clearColor(backgroundColorRGB.r / 255.0, backgroundColorRGB.g / 255.0, backgroundColorRGB.b / 255.0, 1.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    // change fragment shader during render time
    gl.uniform4f(fColorPointer, shapeColorRGB.r / 255.0, shapeColorRGB.g / 255.0, shapeColorRGB.b / 255.0, 1.0);
    
    gl.uniform1f(oxo, zoomMultiplier);

    // for(var i=0; i<numPolygons; i++) {
    //     gl.drawArrays( gl.POINTS, start[i], numIndices[i] );
    // }
    gl.drawArrays( gl.LINE_STRIP, 0, resultPoints.length );
    //gl.drawArrays( gl.TRIANGLE_FAN, 0, resultPoints.length );
}

function koch(point1, point9, iteration) {
    iteration--;

    // Calculate Point 2
    let point2 = mix(point1, point9, 0.25);

    // Calculate Point 3
    let temp = subtract(point1, point2);
    temp = vec2(temp[1], -temp[0]);
    let point3 = add( temp, point2);

    // Calculate Point 5
    let point5 = mix(point1, point9, 0.50);
    
    // Calculate Point 4
    temp = subtract(point2, point5);
    temp = vec2(temp[1], -temp[0]);
    let point4 = add( temp, point5);

    // Calculate Point 6
    temp = subtract(point2, point5);
    temp = vec2(-temp[1], temp[0]);
    let point6 = add( temp, point5);

    // Calculate Point 8
    let point8 = mix(point1, point9, 0.75);

    // Calculate Point 7
    temp = subtract(point5, point8);
    temp = vec2(-temp[1], temp[0]);
    let point7 = add( temp, point8);


    // Create Koch Curve with the resulting lines.
    if(iteration === 0) {
        resultPoints.push(point1);
        resultPoints.push(point2);
        resultPoints.push(point3);
        resultPoints.push(point4);
        resultPoints.push(point5);
        resultPoints.push(point6);
        resultPoints.push(point7);
        resultPoints.push(point8);
        resultPoints.push(point9);
    }

    // Create A koch Curve with each line
    else {
        koch(point1, point2, iteration);
        koch(point2, point3, iteration);
        koch(point3, point4, iteration);
        koch(point4, point5, iteration);
        koch(point5, point6, iteration);
        koch(point6, point7, iteration);
        koch(point7, point8, iteration);
        koch(point8, point9, iteration);
    }
}

/*
 * method that translates hex codes into RGB and returns them as an array. Taken from:
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : alert('color value not correct');
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}