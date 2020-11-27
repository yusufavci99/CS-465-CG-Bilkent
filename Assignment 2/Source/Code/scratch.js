
var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

let lemul = 3;
let legrow = 1.5;
torsoVertices = [
    // Bottom
    vec4(0.0, -0.5, 0.0, 1.0),
    vec4(-0.5, 0.0, 0.0, 1.0),
    vec4(-Math.sqrt(0.5) / 2, 0.0, Math.sqrt(0.5) / 2, 1.0),
    vec4(0.0, 0.0, 0.5, 1.0),
    vec4(Math.sqrt(0.5) / 2, 0.0, Math.sqrt(0.5) / 2, 1.0),
    vec4(0.5, 0.0, 0.0, 1.0),
    vec4(Math.sqrt(0.5) / 2, 0.0, -Math.sqrt(0.5) / 2, 1.0),
    vec4(0.0, 0.0, -0.5, 1.0),
    vec4(-Math.sqrt(0.5) / 2, 0.0, -Math.sqrt(0.5) / 2, 1.0),
    vec4(-0.5, 0.0, 0.0, 1.0),
    // Lower
    vec4(-0.5, 0.0, 0.0, 1.0),
    vec4(-Math.sqrt(0.5) / 2, 0.0, Math.sqrt(0.5) / 2, 1.0),
    vec4(-Math.sqrt(0.5) * lemul / 2, legrow, Math.sqrt(0.5) * lemul / 2, 1.0),
    vec4(-0.5 * lemul, legrow, 0.0 * lemul, 1.0),

    vec4(-Math.sqrt(0.5) / 2, 0.0, Math.sqrt(0.5) / 2, 1.0),
    vec4(0.0, 0.0, 0.5, 1.0),
    vec4(0.0 * lemul, legrow, 0.5 * lemul, 1.0),
    vec4(-Math.sqrt(0.5) * lemul / 2, legrow, Math.sqrt(0.5) * lemul / 2, 1.0),

    vec4(0.0, 0.0, 0.5, 1.0),
    vec4(Math.sqrt(0.5) / 2, 0.0, Math.sqrt(0.5) / 2, 1.0),
    vec4(Math.sqrt(0.5) * lemul/ 2, legrow, Math.sqrt(0.5) * lemul/ 2, 1.0),
    vec4(0.0 * lemul, legrow, 0.5 * lemul, 1.0),

    vec4(Math.sqrt(0.5) / 2, 0.0, Math.sqrt(0.5) / 2, 1.0),
    vec4(0.5, 0.0, 0.0, 1.0),
    vec4(0.5 * lemul, legrow, 0.0 * lemul, 1.0),
    vec4(Math.sqrt(0.5) * lemul/ 2, legrow, Math.sqrt(0.5) * lemul/ 2, 1.0),

    vec4(0.5, 0.0, 0.0, 1.0),
    vec4(Math.sqrt(0.5) / 2, 0.0, -Math.sqrt(0.5) / 2, 1.0),
    vec4(Math.sqrt(0.5) * lemul / 2, legrow, -Math.sqrt(0.5) * lemul / 2, 1.0),
    vec4(0.5 * lemul, legrow, 0.0 * lemul, 1.0),

    vec4(Math.sqrt(0.5) / 2, 0.0, -Math.sqrt(0.5) / 2, 1.0),
    vec4(0.0, 0.0, -0.5, 1.0),
    vec4(0.0 * lemul, legrow, -0.5 * lemul, 1.0),
    vec4(Math.sqrt(0.5) * lemul/ 2, legrow, -Math.sqrt(0.5) * lemul / 2, 1.0),

    vec4(0.0, 0.0, -0.5, 1.0),
    vec4(-Math.sqrt(0.5) / 2, 0.0, -Math.sqrt(0.5) / 2, 1.0),
    vec4(-Math.sqrt(0.5) * lemul/ 2, legrow, -Math.sqrt(0.5) * lemul/ 2, 1.0),
    vec4(0.0 * lemul, legrow, -0.5 * lemul, 1.0),

    vec4(-Math.sqrt(0.5) / 2, 0.0, -Math.sqrt(0.5) / 2, 1.0),
    vec4(-0.5, 0.0, 0.0, 1.0),
    vec4(-0.5 * lemul, legrow, 0.0 * lemul, 1.0),
    vec4(-Math.sqrt(0.5) * lemul / 2, legrow, -Math.sqrt(0.5) * lemul/ 2, 1.0),

]
torsoVertices = ultimatron(torsoVertices, 3, 2);
var wing = [
    vec4( 0.06, 0.7,  0.0, 1.0 ),
    vec4( -0.30, 0.73,  0.0, 1.0 ),
    vec4( -0.48, 0.48,  0.0, 1.0 ),
    vec4( -0.57, 0.2,  0.0, 1.0 ),
    vec4( -0.56, -0.11,  0.0, 1.0 ),
    vec4( -0.35, -0.55,  0.0, 1.0 ),
    vec4( 0.06, -0.89,  0.0, 1.0 ),
]

pointyPrism = [
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(-0.2, 0.0, -0.2, 1.0),
    vec4(0.2, 0.0, -0.2, 1.0),
    vec4(0.2, 0.0, 0.2, 1.0),
    vec4(-0.2, 0.0, 0.2, 1.0),
    vec4(-0.2, 0.0, -0.2, 1.0),
]

var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var leftMiddleArmId = 11;
var rightMiddleArmId = 12;
var leftUpperMiddleArmId = 13;
var leftMiddleMiddleArmId = 14;
var leftLowerMiddleArmId = 15;
var rightUpperMiddleArmId = 16;
var rightMiddleMiddleArmId = 17;
var rightLowerMiddleArmId = 18;
var leftWingId = 19;
var rightWingId = 20;

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;
var middleMiddleArmHeight = 1.5;
var middleMiddleArmWidth = 1.0;
var lowerMiddleArmHeight = 5;
var lowerMiddleArmWidth = 1.0;

var numNodes = 21;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 90, 90, 90, 90, 180, 40, 220, 40, 40];
var anim = []

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function traverse(Id) {
   
   if(Id == null) return; 
   stack.push(modelViewMatrix);

   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

// Runs On Page Creation
window.onload = function init() {

    // Get WebGL canvas
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    aspectRatio = canvas.clientWidth / canvas.clientHeight;

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST ); 
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
    
    // Perspective Matrix
    projectionMatrix = perspective( 90, aspectRatio, 0.1, 200 )

    // ModelViewMatrix
    modelViewMatrix = translate(0, 0,-20);
    //modelViewMatrix = mult( modelViewMatrix, rotate(0,0,0,1));

    // Get ModelViewMatrix locations
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix");

    // Load Matrices to the vertex shader
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    // Create A cube and use it multiple times
    cube();

    pointsArray = pointsArray.concat(torsoVertices);
    pointsArray = pointsArray.concat(pointyPrism);
    pointsArray = pointsArray.concat(wing);
        
    // Vertex Buffer
    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Color Yoktu Kodda Gecici Olarak 50 tane yesil color koydum buffera. Poligonlarla birlikte color eklenmesi lazim.
    colors = Array(100).fill(vec4(0.0,1.0,0.0,1.0));
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    document.getElementById("slider0").onchange = function() {
        theta[torsoId] = parseFloat( event.srcElement.value );
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function() {
        theta[head1Id] = parseFloat( event.srcElement.value );
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function() {
         theta[leftUpperArmId] = parseFloat( event.srcElement.value );
         initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function() {
         theta[leftLowerArmId] =  parseFloat( event.srcElement.value );
         initNodes(leftLowerArmId);
    };
     
    document.getElementById("slider4").onchange = function() {
        theta[rightUpperArmId] = parseFloat( event.srcElement.value );
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function() {
         theta[rightLowerArmId] =  parseFloat( event.srcElement.value );
         initNodes(rightLowerArmId);
    };
    document.getElementById("slider6").onchange = function() {
        theta[leftUpperLegId] = parseFloat( event.srcElement.value );
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function() {
         theta[leftLowerLegId] = parseFloat( event.srcElement.value );
         initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function() {
         theta[rightUpperLegId] =  parseFloat( event.srcElement.value );
         initNodes(rightUpperLegId);
    };
    document.getElementById("slider9").onchange = function() {
        theta[rightLowerLegId] = parseFloat( event.srcElement.value );
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function() {
         theta[head2Id] = parseFloat( event.srcElement.value );
         initNodes(head2Id);
    };
	document.getElementById("add_keyframe").onclick = function() {
         anim.push([...theta])
		 console.log("anim length = ", anim.length, "theta length = ", theta.length)
    };
	document.getElementById("play_anim").onclick = function() {
		if (anim.length > 0)
			playing = !playing
		for( let i = 0; i < anim.length; i++ )
			console.log(anim[i])
    };

    for(i=0; i<numNodes; i++) initNodes(i);
    
    startAnimating(60);
}

var fps, fpsInterval, startTime, now, then;
var elapsed = 0;
var playing = false

// initialize the timer variables and start the animation

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
	setInterval(function(){ requestAnimFrame(render); }, fpsInterval);
    render();
}

// Repeats
var render = function() {

    now = Date.now();
    elapsed += now - then;

    // if enough time has elapsed, draw the next frame


	// Get ready for next frame by setting then=now, but also adjust for your
	// specified fpsInterval not being a multiple of RAF's interval (16.7ms)
	then = now - (elapsed % fpsInterval);

	// Put your drawing code here
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );


	let anim_index = 0
	let anim_offset = 0
	let progress = ( elapsed / 1000 ) % anim.length

	if (playing) {
		anim_index = Math.floor(progress)
		anim_offset = progress - Math.floor(progress)
		console.log("p=", progress, "i=", anim_index, "o=", anim_offset)
		for( let i = 0; i < theta.length; i++ ) {
			theta[i] = anim[anim_index][i] * (1-anim_offset) + anim[ (anim_index + 1) % anim.length][i] * (anim_offset)
		}
	}
	theta[1] = theta[1] + 1.0;
	for(i=0; i < numNodes; i++) initNodes(i);

	traverse(torsoId);
}

function ultimatron( arrayx, heightI, widthI) {
    let spx = []
    for(let i = 10; i < arrayx.length; i += 4) {
        let anon = arrayx[i + 2];
        let anan = arrayx[i + 3];

        spx.push(anon);
        spx.push(anan);
        spx.push(vec4(anan[0] * widthI,anan[1] + heightI, anan[2] * widthI, anan[3]));
        spx.push(vec4(anon[0] * widthI,anon[1] + heightI, anon[2] * widthI, anon[3]))
    }
    return arrayx.concat(spx);
}