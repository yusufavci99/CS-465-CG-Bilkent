// Modified from hatImage1.js in Chapter 7

"use strict";

var imageSize = 256;
let pixCount = imageSize*imageSize
let renderMap = []

let cam_pos = vec3(0,0,0)
let vert_rot = 0
let hor_rot = 0
let front = vec3(0,0,1)
let right = vec3(1,0,0)
//let cam_dir = vec3(0,0,1)
let elapsed_time = 0

let noise_texture_size = 512
let noise_texture = Array.from(Array(noise_texture_size), () => new Array(noise_texture_size) )
let perlin_steps = 4


// Create image data
// Here i used Uint8ClampedArray instead of Uint8Array so that it is clamped. Clamped: 0-255
// * 3 is for dimension
var image = new Uint8ClampedArray(imageSize * imageSize * 3);

let outer_space_color = vec4(Math.random(), Math.random(), Math.random() ,1.0)
let default_object_color = vec4(Math.random(), Math.random(), Math.random() ,1.0)

const white = vec4(1.0,1.0,1.0,1.0)
const red = vec4(1.0,0.0,0.0,1.0)
const green = vec4(0.0,1.0,0.0,1.0)
const blue = vec4(0.0,0.0,1.0,1.0)

const SPHERE = 0
const TRIANGLE = 1
const CUBE = 2
const CONE = 3
const INF = 9999999

var drawIndex = 0

// Texture coords for quad
var canvas;
var gl;

var program;

// Texture to draw on
var texture;
var lights = []
var objects = []

// These are examples for the objects that are created by the generator
var sphere = { 
	type: SPHERE, center: vec3( 0.0, 0.0, 20), 
	radius: 5.0, 
	material: {clr: green, reflect: 0, refract:0 } 
} //TODO NORMAL FINDING

//var triangle = { type: TRIANGLE, a: vec3( 0.0, 0.0, 20.0), b: vec3( 10.0, 0.0, 20.0 ), material: {clr: green, reflect: 0, refract:0 } } //TODO NORMAL FINDING
var intersection = {
	distance: 0, 
	pos: vec3(0.0,0.0,0.0),
	normal: vec3(0.0,0.0,0.0), 
	material: {clr: green, reflect: 0, refract:0 }, count:0 
} //TODO
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

function generate_objects( generateCounts) {

	//Create Spheres
	for( let i = 0; i < generateCounts.sphere; i++ ) {
		objects.push( {
			type: SPHERE, 
			center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 30 + Math.random() * 30 - 15),
			radius: Math.random() * 10, 
			material: { 
				color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
				reflect: 0.5,
				refract: 0
			},
			velocity: vec3(0,0,0), 
		} )
	}

	// //Create Triangles
	// for( let i = 0; i < generateCounts.triangle; i++ ) {
		// objects.push(  
			// createTriangle(
				// vec3(Math.random() * 30 - 15, Math.random() * 30 - 15, 20 + Math.random() * 30 - 15), 
				// vec3(Math.random() * 30 - 15, Math.random() * 30 - 15, 20 + Math.random() * 30 - 15), 
				// vec3(Math.random() * 30 - 15, Math.random() * 30 - 15, 20 + Math.random() * 30 - 15),
				// vec4( Math.random(), Math.random(), Math.random(), 1 ))
			// )
	// }

	objects.push(
		createCube(
			vec3(0,0,20),
			vec3(20,0,20),
			vec3(0,20,20),
			vec4( Math.random(), Math.random(), Math.random(), 1 )
		)
	)
	
	objects.push(
		{
			type: CONE,
			center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 30 + Math.random() * 30 - 15),
			radius: 10,//Math.random() * 10, 
			height: 7,
			material: { 
				color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
				reflect: 0.9,
				refract: 0
			}, 

		}
	)
}

function createCube(a, b, c, color) {
	let cube = {
		type: CUBE,
		triangles: [],
	}
	
	var sc = 10
	
	var points = [
		vec3(-sc,-sc,-sc), //0
		vec3(sc,-sc,-sc), //1
		vec3(-sc,sc,-sc), //2
		vec3(sc,sc,-sc), // 3
		vec3(-sc,-sc,sc), //4
		vec3(sc,-sc,sc), //5
		vec3(-sc,sc,sc), //6
		vec3(sc,sc,sc) //7
	]
	
	// let rtt = rotate(0, 1,0,0);
	let rtt = rotate(Math.random() * 360 - 180, normalize(vec3(Math.random(), Math.random(), Math.random())));
	let trt = translate( 0, 0, 50 );
	// let trt = translate( 0, 0, 50 );
	for (let i = 0; i < 8; i++ ) {
		//console.log(points[i])

		let ta =  vec4(points[i]);
		
		let tmpa = mult(trt, mult(rtt, ta) );
		
		points[i] = vec3(tmpa)
		//console.log(points[i])
	}
	
	let ord = [ 6,4,7, 7,4,5, 6,2,4, 2,0,4, 7,5,3, 3,5,1, 2,3,0, 3,1,0, 2,6,3, 3,6,7, 0,1,4, 1,5,4 ];
	
	for( let i = 0; i < 36; i += 3 ) {
		//console.log(i, ord[i])
		cube.triangles.push(
			createTriangle(
				points[ord[i]],
				points[ord[i+1]],
				points[ord[i+2]],
				color
			)
		);
	}

	return cube;
}

function createTriangle(a, b, c, color) {
	return {
		type: TRIANGLE, 
		a: a,
		b: b,
		c: c,
		material: { 
			color: color,
			reflect: 0.7,
			refract: 0
		} 
	}
}

function update_objects() {
	objects.forEach( (o, i) => {
		if( o.type == SPHERE ) {
			o.velocity = add(o.velocity, vec3( Math.random() * 0.002 - 0.001, Math.random() * 0.002 - 0.001, Math.random() * 0.002 - 0.001));
			// o.center = add( o.center, vec3( 0.01, 0.01, 0.01 ) );
			o.center = add( o.center, o.velocity);
		}
	});
}


// Perlin noise algorithm from
// https://en.wikipedia.org/wiki/Perlin_noise
// Compute Perlin noise at coordinates x, y
function perlin( x,  y) {
	/* Function to linearly interpolate between a0 and a1
	 * Weight w should be in the range [0.0, 1.0]
	 */
	function interpolate( a0,  a1,  w) {
		/* // You may want clamping by inserting:
		 * if (0.0 > w) return a0;
		 * if (1.0 < w) return a1;
		 */
		return (a1 - a0) * w + a0;
		/* // Use this cubic interpolation [[Smoothstep]] instead, for a smooth appearance:
		 * return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
		 *
		 * // Use [[Smootherstep]] for an even smoother result with a second derivative equal to zero on boundaries:
		 * return (a1 - a0) * (x * (w * 6.0 - 15.0) * w * w *w + 10.0) + a0;
		 */
	}

	/* Create random direction vector
	 */
	function randomGradient( ix, iy) {
		// Random float. No precomputed gradients mean this works for any number of grid coordinates
		let random = 2920 * Math.sin(ix * 21942 + iy * 171324 + 8912) * Math.cos(ix * 23157 * iy * 217832 + 9758);
		return vec2( Math.cos(random), Math.sin(random) );
	}

	// Computes the dot product of the distance and gradient vectors.
	function dotGridGradient( ix,  iy,  x,  y) {
		// Get gradient from integer coordinates
		let gradient = randomGradient(ix % perlin_steps, iy % perlin_steps);

		// Compute the distance vector
		let dx = x - ix;
		let dy = y - iy;

		// Compute the dot-product
		return (dx*gradient[0] + dy*gradient[1]);
	}
    
	// Determine grid cell coordinates
    let x0 = Math.floor(x);
    let x1 = (x0 + 1);
    let y0 = Math.floor(y);
    let y1 = (y0 + 1);

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    let sx = x - x0;
    let sy = y - y0;
	
	//console.log('sx', sx, 'sy', sy)

    // Interpolate between grid point gradients
    let n0, n1;

    n0 = dotGridGradient(x0, y0, x, y);
    n1 = dotGridGradient(x1, y0, x, y);
    let ix0 = interpolate(n0, n1, sx);
	
	//console.log('n0', n1, 'n0', n1)

    n0 = dotGridGradient(x0, y1, x, y);
    n1 = dotGridGradient(x1, y1, x, y);
    let ix1 = interpolate(n0, n1, sx);
	
	//console.log('ix0', ix0, 'ix1', ix1)

    let value = interpolate(ix0, ix1, sy);
    return value;
}

function object_intersection(p, d, obj ) {
	function cone_intersection(p, d, cone) {
		//algorithm is adapted from
		//https://github.com/iceman201/RayTracing/blob/master/Ray%20tracing/Cone.cpp
		let px = p[0];
		let py = p[1];
		let pz = p[2];
		let dx = d[0];
		let dy = d[1];
		let dz = d[2];
		let centerx = cone.center[0];
		let centery = cone.center[1];
		let centerz = cone.center[2];
		
		let A = px - centerx;
		let B = pz - centerz;
		let D = cone.height - py + centery;
		
		let tan = (cone.radius / cone.height)*(cone.radius / cone.height);
		
		let a = (dx * dx) + (dz * dz) - (tan * (dy * dy));
		let b = (2 * A * dx) + (2 * B * dz) + (2 * tan * D * dy);
		let c = (A * A) + (B * B) - (tan * (D * D));

		let delta = b*b - 4*(a*c);
		if(Math.abs(delta) < 0.001 || delta < 0.0) {
			return INF; 
		}
		
		let t1 = (-b - Math.sqrt(delta))/(2*a);
		let t2 = (-b + Math.sqrt(delta))/(2*a);
		let t;
		
		if (t1>t2) t = t2;
		else t = t1;
		
		let r = py + t*dy;

		let r2 = Math.sqrt((px-centerx)*(px-centerx) + (pz-centerz)*(pz-centerz) );
		let n = vec3(px-centerx, r2*(cone.radius/cone.height), pz-centerz);

		let pos = add( p, vec3( d[0] * t, d[1] * t, d[2] * t) );

		if ((r > centery) && (r < centery + cone.height)) {
			return { distance: t, pos: pos, normal: normalize(n), material: cone.material, count:0 }
		} else {
			return INF
		}
	}
	function triangle_intersection(p,d, tri) {
		/* combination of ray plane intersection 
		and point in polygon test (3-D or 2-D) */
		/* plane = (x-q) . n*/
		/*n = crossproduct of 2 edges */
		//algorithm is
		//https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
		let EPSILON = 0.0000001;
		let vertex0 = tri.a;
		let vertex1 = tri.b;
		let vertex2 = tri.c;

		let edge1 = subtract(vertex1, vertex0);
		let edge2 = subtract(vertex2, vertex0);
		let h = cross(d, edge2);
		let a = dot(edge1, h);

		if (a > -EPSILON && a < EPSILON)
			return INF;    // This ray is parallel to this triangle.
		
		let f = 1.0/a;
		let s = subtract(p, vertex0);
		let u = f * dot(s,h);
		if (u < 0.0 || u > 1.0)
			return INF;

		let q = cross(s, edge1);
		let v = f * dot(d, q);
		if (v < 0.0 || u + v > 1.0)
			return INF;
		// At this stage we can compute t to find out where the intersection point is on the line.
		let t = f * dot(edge2,q);
		if (t!= undefined && t > EPSILON) // ray intersection
		{
			let pos = add( p, scale( t, d ) )
			return { distance: t, pos: pos, normal: normalize( cross( edge1, edge2 ) ), material: tri.material, count:0 };
		}
		else // This means that there is a line intersection but not a ray intersection.
			return INF;
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
		let t1 = ( -B + Math.sqrt( delta ) ) / 2
		let t2 = ( -B - Math.sqrt( delta ) ) / 2
		let t = Math.min( t1, t2 )
		let pos = add( p, scale( t, d ) )
		let normal = subtract( pos, sph.center )
		//console.log( 'sphere normal ', normal, 'pos ', pos, 'sph.center ', sph.center, 'p', p, 'd', d, 't', t, 't1', t1, 't2', t2 )
		return { distance: t, pos: pos, normal: normalize( normal ), material: sph.material, count:0 } //TODO 
	}
	if( obj.type == SPHERE ) 
		return sphere_intersection(p, d, obj);
	else if ( obj.type == TRIANGLE )
		return triangle_intersection(p, d, obj);
	else if (obj.type == CONE )
		return cone_intersection(p, d, obj);
}

function closest_ray_surface_intersection(p, d) {
	/*
		for each surface in scene
		calc_intersection(ray, surface)
		return the closest point of intersection to viewer 
		(also return other info about that point, e.g., surface normal, material properties, etc.)
	*/
	//let sorted = objects.sort( (a,b) => { return object_intersection( p, d, a ) > object_intersection( p, d, b ) } )
	function chooseClosest( intersection ) {
		if( intersection == null )
			return
		let dist = intersection.distance;
		if ( dist > 0.1 && dist < closest_dist ) {
			closest_dist = dist;
			selected_inter = intersection;
		}
	}
	let closest_dist = INF
	let selected_inter = null
	objects.forEach( (o,i) => {
		let intersection;
		if( o.type == CUBE) {
			o.triangles.forEach( trig => {
				intersection = object_intersection( p, d, trig );
				chooseClosest(intersection );
			})
		} else {
			intersection = object_intersection( p, d, o );
			chooseClosest(intersection );
		}
		
	})
	return selected_inter
}

function reflect( d, normal ) {
	// Rr = Ri - 2 N (Ri . N) 	
	return subtract( d, scale( 2 * dot( d, normal ), normal ) )
}

function refract( p, d, normal, coeff ) {
	//TODO OR NOT TODO THAT IS THE QUESTION INDEED
	return ray
}

// For the third programming assignment, one of the primitives you will render is cone.
// Just like the sphere that we discussed in the lectures, it is easiest to do ray-surface
// intersections for the cone is by using the implicit equation for the cone. Just plug 
// the components of the parametric ray equation (x, y, and z) into the implicit equation
// for the cone and solve for t. Then  plug t (the t value > 0) into the parametric ray
// equation to find the intersection point of the ray with the cone. The implicit equation 
// for the cone is given in the following page. The cone equation generates and infinite cone.
// You must restrict it to a finite cone by extending the implicit equation as described in the following page.
// https://math.stackexchange.com/questions/207753/parametric-and-implicit-representation-of-a-cone

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
	//console.log('lvec', lvec)
	let L = normalize( lvec )
	let ldist = lvec[0] / L[0]
	let N = inter.normal
	let k = 0.5
	let ks = 0.7
	let fatt = Math.min( 1 / ( 0.1 + 0.2 * ldist + 0.9 * Math.pow( ldist, 2 ) ), 1 ) //
	let I = 0.3 + light.intensity * fatt * ( ( k * dot( N, L ) ) + ks * Math.pow( dot( N, L ), 4 ) ) // 
	let reflection = vec4(0,0,0,0)
	if( inter.material.reflect > 0 )
		//reflection = outer_space_color
		//console.log('inter.pos ', inter.pos)
		//console.log('inter.normal ', inter.normal)
		//console.log('d ', d)
		reflection = trace( inter.pos, reflect( d, inter.normal ) )
	// if ( inter.material.color[3] < 0.99 )
		// res = add( res, refract( ray, inter.normal, inter.refract) )
	return add( scale( I * (1-inter.material.reflect) , clr ), scale( inter.material.reflect, reflection ) )
	
}

//ray is always represented by p, d
function trace(p, d) {
	let intersection = closest_ray_surface_intersection(p, d)
	if ( intersection )
		return shade(p, d, intersection)
	//return outer_space_color
	//console.log(Math.floor(100 * d[0]) % imageSize)
	let c1 = noise_texture[ Math.floor( noise_texture_size * (d[1]+1) / 2 ) % noise_texture_size ]
							[ Math.floor( noise_texture_size * (d[0]+1) / 2 ) % noise_texture_size ]
							
	let c2 = noise_texture[ Math.floor( noise_texture_size * (d[0] + elapsed_time / 20000 +1) / 2 ) % noise_texture_size ] 
		[ Math.floor( noise_texture_size * (d[1] + elapsed_time / 40000 + 1) / 2 ) % noise_texture_size]
	//return vec4( rand, rand, rand, 1.0 )
	let rand = c1 + c2
	return add( scale( 1- rand, outer_space_color  ), scale( rand, white  ) )
	//return outer_space_color
}

// Ray tracing function
function raytrace()
{
	let startTime = new Date()
	let frameDuration = 1000 / 1
	var loop = true;
	//console.log('start', tempd)
		//mult(trt, mult(rtt, ta) );
	let hor_rtt = rotate(hor_rot, vec3(0,1,0) );
	let right_xz = mult( hor_rtt, vec4(1,0,0,0) );
	let vert_rtt = rotate( vert_rot, vec3(right_xz) );
	let rotator = mult( vert_rtt, hor_rtt)
	front = vec3( mult( rotator, vec4(0,0,1,0) ) )
	right = vec3( mult( rotator, vec4(1,0,0,0) ) )
	// Limit via time
	elapsed_time += 1000 / 60
	while( (new Date) - startTime < 1000 / 60) {
		for( let i = 0; i < 2048; i++ ) {
			let x = renderMap[drawIndex] % imageSize;
			let y = Math.floor( renderMap[drawIndex] / imageSize );
			let px = ( x / imageSize - 0.5 ) * 2
			let py = ( y / imageSize - 0.5 ) * 2
			let p = add( cam_pos, vec3( px, py, 1.0 ) )
			let tempd = vec4( normalize( vec3( px, py, 1.0 ), false ) )
			
			let rotated = mult( rotator, tempd )
			//console.log('rotated', rotated)
			
			let d = vec3(rotated)
			//console.log('end', d)
			
			// Trace Here
			var color = trace(p,d);
			//var rand = noise_texture[y*2%noise_texture_size][x*2%noise_texture_size]
			//var color = vec4( rand, rand, rand, 1.0)
			// Set color values
			image[(y * imageSize + x) * 3 + 0] = 255 * color[0];
			image[(y * imageSize + x) * 3 + 1] = 255 * color[1];
			image[(y * imageSize + x) * 3 + 2] = 255 * color[2];
			//drawIndex = Math.floor ( Math.random() * pixCount );
			drawIndex = ( drawIndex + 1 ) % pixCount;
		}
	}
	update_objects()
	requestAnimationFrame(render);
}

window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
	
  switch (event.keyCode) {
	case 83:
      // code for "down arrow" key press.
	  cam_pos = subtract( cam_pos, front )
      break;
	case 87:
      // code for "up arrow" key press.
	  cam_pos = add( cam_pos, front )
      break;
    case 65:
      // code for "left arrow" key press.
	  cam_pos = subtract( cam_pos, right )
      break;
	case 68:
      // code for "right arrow" key press.
	  cam_pos = add( cam_pos, right )
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }

  // Cancel the default action to avoid it being handled twice
  event.preventDefault();
}, true);
// the last option dispatches the event to the listener first,
// then dispatches event to window

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
	
	canvas.onclick = function() {
		canvas.requestPointerLock();
	}
	
	canvas.addEventListener('mousemove', e => {
		let sensitivity = 0.05
		//console.log(e.movementX)
		//console.log(e.movementY)
		hor_rot += e.movementX * sensitivity
		vert_rot -= e.movementY * sensitivity
	});
	
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
	
	// How many of each object should be generated
	let generateCounts = {
		sphere: 5,
		triangle: 5,
	}
	
	//generate noise texture
	for( let y = 0; y < noise_texture_size; y++ )
		for( let x = 0; x < noise_texture_size; x++ ) {
			noise_texture[y][x] = perlin( x / noise_texture_size * perlin_steps, y / noise_texture_size * perlin_steps )
		}

	//console.log(noise_texture)
	// Creates the objects
	generate_objects( generateCounts )
	
	// Add a new sphere
	document.getElementById("addSphere").onclick = ()=> {
		objects.push( {
			type: SPHERE, 
			center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 30 + Math.random() * 30 - 15),
			radius: Math.random() * 10, 
			material: { 
				color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
				reflect: 0,
				refract: 0
			},
			velocity: vec3(0,0,0), 
		} );
	}
	document.getElementById("addCone").onclick = ()=> {
		objects.push(
			{
				type: CONE,
				center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 30 + Math.random() * 30 - 15),
				radius: 10,//Math.random() * 10, 
				height: 7,
				material: { 
					color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
					reflect: 0,
					refract: 0
				}, 
	
			}
		)
	}
	document.getElementById("addCube").onclick = ()=> {
		objects.push(
			createCube(
				vec3(0,0,20),
				vec3(20,0,20),
				vec3(0,20,20),
				vec4( Math.random(), Math.random(), Math.random(), 1 )
			)
		)
	}

	let randomizedTrace = document.getElementById("randomizedTrace");
	randomizedTrace.onclick = (e)=> {
		if(randomizedTrace.checked) {
			for(let i = pixCount - 1; i > 0; i-- ) {
				let j = Math.floor(Math.random() * i);
				let tmp = renderMap[i]
				renderMap[i] = renderMap[j]
				renderMap[j] = tmp
			}
		} else {
			for (var i = 0; i < pixCount; i++) {
				renderMap[i] = i;
			}
		}
	}

	// Fill the render map ? WHY THO
	for (var i = 0; i < pixCount; i++) {
		renderMap.push(i);
	}

	// WHY for blurring or
	for(let i = pixCount - 1; i > 0; i-- ) {
		let j = Math.floor(Math.random() * i);
		let tmp = renderMap[i]
		renderMap[i] = renderMap[j]
		renderMap[j] = tmp
	}
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
