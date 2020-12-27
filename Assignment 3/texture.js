// Modified from hatImage1.js in Chapter 7

"use strict";

var imageSize = 128;

// Create image data
// Here i used Uint8ClampedArray instead of Uint8Array so that it is clamped.
// * 3 is for dimension
var image = new Uint8ClampedArray(imageSize * imageSize * 3);

let outer_space_color = vec4(0.0,0.0,0.0,1.0)
let default_object_color = vec4(0.8,0.6,1.0,1.0)

// Texture coords for quad
var canvas;
var gl;

var program;

var texture;

var sphere = { c: vec3( 0.0, 0.0, 20), r: 10.0 }




/*
Shade(point, ray)	// return radiance of light leaving
					// point in opposite of ray direction
{
	/*
		calculate surface normal vector
		use Phong illumination formula (or something similar)
		to calculate contributions of each light source
	
}
*/



function triangle_intersection() {
	/* combination of ray plane intersection 
	and point in polygon test (3-D or 2-D) */
	
	return false
}

function sphere_intersection(p, d, sph) {
	//http://viclw17.github.io/2018/07/16/raytracing-ray-sphere-intersection/
	let A = dot(d,d)
	let B = 2 * dot( d, subtract(p, sph.c) )
	let C = dot( subtract(p,sph.c), subtract(p,sph.c) ) - sph.r * sph.r
	let delta = B*B - 4 * A * C
	console.log( sphere )
	console.log("A: ", A.toPrecision(2), "B: ", B.toPrecision(2), "C: ", C.toPrecision(2),"delta: ", delta.toPrecision(2))
	return delta >= 0
}

function closest_ray_surface_intersection(p, d) {
	/*
		for each surface in scene
		calc_intersection(ray, surface)
		return the closest point of intersection to viewer 
		(also return other info about that point, e.g., surface normal, material properties, etc.)
	*/
	return sphere_intersection(p, d, sphere)
}

function trace(p, d) {
	let object_point = closest_ray_surface_intersection(p, d)
	if ( object_point )
		return default_object_color
	return outer_space_color
}

// Ray tracing function
function raytrace()
{
    for (var y = 0; y < imageSize; ++y)
    {
        for (var x = 0; x < imageSize; ++x)
        {
			let px = ( x / imageSize - 0.5 ) * 2
			let py = ( y / imageSize - 0.5 ) * 2
			let p = vec3( px, py, 1.0 )
			let d = normalize( vec3( px, py, 1.0 ), false )
            // Get a random color
            var color = trace(p,d);

            // Trace Here

            // Set color values
            image[(y * imageSize + x) * 3 + 0] = 255 * color[0];
            image[(y * imageSize + x) * 3 + 1] = 255 * color[1];
            image[(y * imageSize + x) * 3 + 2] = 255 * color[2];
        }
    }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var pointsArray = [];
    var texCoordsArray = [];

    // Use a quad to render texture 
    pointsArray.push(vec2(-1, -1));
    pointsArray.push(vec2(-1, 1));
    pointsArray.push(vec2(1, 1));
    pointsArray.push(vec2(1, -1));

    texCoordsArray.push(vec2(0, 0));
    texCoordsArray.push(vec2(0, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 0));

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Set up texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    render();
}


function render() {
    raytrace();

    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,    // target
        0,                // level
        gl.RGB,           // image format 
        imageSize,        // width
        imageSize,        // height
        0,                // Border
        gl.RGB,           // Format
        gl.UNSIGNED_BYTE, // type
        image             // Data source
    );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    //requestAnimationFrame(render);
}
