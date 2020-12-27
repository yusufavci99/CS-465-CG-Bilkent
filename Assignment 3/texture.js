// Modified from hatImage1.js in Chapter 7

"use strict";

var imageSize = 256;

// Create image data
// Here i used Uint8ClampedArray instead of Uint8Array so that it is clamped.
// * 3 is for dimension
var image = new Uint8ClampedArray(imageSize * imageSize * 3);

let outer_space_color = vec4(0.0,0.0,0.0,1.0)
let default_object_color = vec4(0.8,0.6,1.0,1.0)

const red = vec4(1.0,0.0,0.0,1.0)
const green = vec4(0.0,1.0,0.0,1.0)
const blue = vec4(0.0,0.0,1.0,1.0)

const SPHERE = 0
const TRIANGLE = 1
const INF = 9999999


// Texture coords for quad
var canvas;
var gl;

var program;

var texture;
var lights = []
var objects = []

//these are examples for the objects that are created by the generator
var sphere = { type: SPHERE, center: vec3( 0.0, 0.0, 20), radius: 5.0, material: {clr: green, reflect: 0, refract:0 } } //TODO NORMAL FINDING
var triangle = { type: TRIANGLE, a: vec3( 0.0, 0.0, 20.0), b: vec3( 10.0, 0.0, 20.0 ), material: {clr: green, reflect: 0, refract:0 } } //TODO NORMAL FINDING
var intersection = { distance: 0, pos: vec3(0.0,0.0,0.0), normal: vec3(0.0,0.0,0.0), material: {clr: green, reflect: 0, refract:0 }, count:0 } //TODO
var light = { pos: vec3(-20, 0, 20), intensity: 1.0 } //TODO




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

function generate_objects() {
	for( let i = 0; i < 5; i++ ) {
		objects.push( { type: SPHERE, center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 20 + Math.random() * 30 - 15), radius: Math.random() * 10, 
			material: { 
				color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
				reflect: 0,
				refract: 0
			} 
		} )
	}
}

function point_in_triangle_test( p, tri ) {
/* algorithm taken from https://blackpawn.com/texts/pointinpoly/ */
	
	// Compute vectors        
	let v0 = subtract( tri.c, tri.a )
	let v1 = subtract( tri.b, tri.a )
	let v2 = subtract( p, tri.a )

	// Compute dot products
	let dot00 = dot(v0, v0)
	let dot01 = dot(v0, v1)
	let dot02 = dot(v0, v2)
	let dot11 = dot(v1, v1)
	let dot12 = dot(v1, v2)

	// Compute barycentric coordinates
	let invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
	let u = (dot11 * dot02 - dot01 * dot12) * invDenom
	let v = (dot00 * dot12 - dot01 * dot02) * invDenom

	// Check if point is in triangle
	return (u >= 0) && (v >= 0) && (u + v < 1)

}

function object_intersection(p, d, obj ) {
	function triangle_intersection(p,d, tri) {
		/* combination of ray plane intersection 
		and point in polygon test (3-D or 2-D) */
		/* plane = (x-q) . n*/
		/*n = crossproduct of 2 edges */
		let edge1 = subtract( tri.b, tri.a )
		let edge2 = subtract( tri.c, tri.a )
		let n = cross( edge1, edge2 )
		if ( dot( d, n ) == 0 )
			return INF
		//sign of t might be changed (there was a minus here)
		let t = ( dot( p, n) + dot( tri.b, n ) ) / dot( d, n ) 
		/* t = -(p.n + q.n) / d.n */
		let intersection = add( p, vec3( d[0] * t, d[1] * t, d[2] * t ) )
		if ( ! point_in_triangle_test( intersection, triangle ) || t < 0 )
			return INF
		else
			return t
	}
	function sphere_intersection(p, d, sph) {
	//http://viclw17.github.io/2018/07/16/raytracing-ray-sphere-intersection/
		let A = dot(d,d)
		let B = 2 * dot( d, subtract(p, sph.center) )
		let C = dot( subtract(p,sph.center), subtract(p,sph.center) ) - sph.radius * sph.radius
		let delta = B*B - 4 * A * C
		//console.log( sphere )
		//console.log("A: ", A.toPrecision(2), "B: ", B.toPrecision(2), "C: ", C.toPrecision(2),"delta: ", delta.toPrecision(2))
		if ( delta < 0 ) 
			return INF 
		let t1 = ( -B + Math.sqrt( B*B + 4*A*C ) ) / 2
		let t2 = ( -B + Math.sqrt( B*B - 4*A*C ) ) / 2
		let t = Math.min( t1, t2 )
		let pos = add( p, vec3( d[0] * t, d[1] * t, d[2] * t) )
		return { distance: t, pos: pos, normal: normalize( subtract( pos, sph.center ) ), material: sph.material, count:0 } //TODO 
	}
	if( obj.type == SPHERE ) 
		return sphere_intersection(p, d, obj)
	else if ( obj.type == TRIANGLE )
		return triangle_intersection(p, d, obj)
}

function closest_ray_surface_intersection(p, d) {
	/*
		for each surface in scene
		calc_intersection(ray, surface)
		return the closest point of intersection to viewer 
		(also return other info about that point, e.g., surface normal, material properties, etc.)
	*/
	//let sorted = objects.sort( (a,b) => { return object_intersection( p, d, a ) > object_intersection( p, d, b ) } )
	let closest_dist = INF
	let selected_inter = null
	objects.forEach( (o,i) => {
		let intersection = object_intersection( p, d, o )
		let dist = intersection.distance
		if ( dist < closest_dist ) {
			closest_dist = dist
			selected_inter = intersection
		}
	} )
	return selected_inter
}

function reflect( p, d, normal ) {
	//TODO
	return ray
}

function refract( p, d, normal, coeff ) {
	//TODO OR NOT TODO
	return ray
}

function shade( p, d, inter ) {
	let clr = inter.material.color
	//TODO more light sources
	//TODO reject light if it's not in the from of the sphere
	//if shadow_feeler( material.pos, ray, source)
		// I = I * k * (N . L)
		// I light intensity
		// k diffuse reflection coeff of s
		// L light vector normalized
		// N normal vector
		//	add_light(source)
	let lvec = subtract( light.pos, inter.pos )
	let L = normalize( lvec )
	let ldist = lvec[0] / L[0]
	let N = inter.normal
	let k = 0.5
	let ks = 0.7
	let fatt = Math.min( 1 / ( 0.1 + 0.2 * ldist + 0.9 * Math.pow( ldist, 2 ) ), 1 ) //
	let I = 0.3 + light.intensity * fatt * ( ( k * dot( N, L ) ) + ks * Math.pow( dot( N, L ), 4 ) ) // 
	if( inter.material.reflect > 0 )
		res = add( res, reflect( p, d, inter.normal ) )
	if ( inter.material.color[3] < 0.99 )
		res = add( res, refract( ray, inter.normal, inter.refract) )
	return vec4( clr[0] * I, clr[1] * I, clr[2] * I, clr[3] )
	
}

//ray is always represented by p, d
function trace(p, d) {
	let intersection = closest_ray_surface_intersection(p, d)
	if ( intersection )
		return shade(p, d, intersection)
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
	
	generate_objects()
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
