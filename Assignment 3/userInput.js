function addKeyboardInput() {
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
		case 82:
			// Restart
			location.reload();
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

function addOptionButtons() {
	document.addEventListener('pointerlockchange', ()=> {
		entered = !entered;
		if(entered) {
			lockedMovement = false;
		} else {
			lockedMovement = true;
		}	
	}, false);

    // Add a new sphere
	document.getElementById("addSphere").onclick = ()=> {
		objects.push( {
			type: SPHERE, 
			center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 30 + Math.random() * 30),
			radius: Math.random() * 10, 
			material: { 
				color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
				reflect: reflectionVal,
				refract: 0,
				texture: useTexture,
			},
			velocity: vec3(0,0,0),
		} );
	}
	document.getElementById("addCone").onclick = ()=> {
		objects.push(
			{
				type: CONE,
				center: vec3( Math.random() * 30 - 15, Math.random() * 30 - 15, 30 + Math.random() * 30),
				radius: 10,//Math.random() * 10, 
				height: 7,
				material: { 
					color: vec4( Math.random(), Math.random(), Math.random(), 1 ),
					reflect: reflectionVal,
					refract: 0,
					texture: false,
				}, 
	
			}
		)
	}
	document.getElementById("addCube").onclick = ()=> {
		objects.push(
			createCube(
				Math.random() * 30 - 15,
				Math.random() * 30 - 15,
				Math.random() * 30,
				Math.random() * 5,
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
	
	let useTex = document.getElementById("useTexture");
	useTex.onclick = (e)=> {
		useTexture = useTex.checked;
	}
	
	let moveSphereElem = document.getElementById("sphereMove");
	moveSphereElem.onclick = (e)=> {
		allowMovement = moveSphereElem.checked;
    }
    
    document.getElementById("cutOffDepth").oninput = (event) => {
        cutOffDepth = parseInt( event.target.value );
        document.getElementById("cutValue").innerText = event.target.value;
	};

	document.getElementById("reflection").oninput = (event) => {
        reflectionVal = parseFloat( event.target.value );
        document.getElementById("reflectValue").innerText = event.target.value;
	};
	
	let backgroundColorElem = document.getElementById("backgroundColor");
	backgroundColorElem.onchange = () => {
		backgroundColorRGB = hexToRgb(backgroundColorElem.value);
		outer_space_color = vec4(backgroundColorRGB.r, backgroundColorRGB.g, backgroundColorRGB.b, 1.0);
		console.log(outer_space_color);
	}	

	// document.getElementById("resolution").onmouseup = (event) => {
    //     imageSize = parseInt( event.target.value );
	// 	document.getElementById("resValue").innerText = event.target.value;
		
	// 	pixCount = imageSize*imageSize;
	// 	renderMap = [];
	// 	for (var i = 0; i < pixCount; i++) {
	// 		renderMap.push(i);
	// 	}
	// 	image = new Uint8ClampedArray(imageSize * imageSize * 3);
    // };
}

/**
 * Translates Hex Color Code To RGB Color Code. Source:
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 256.0,
        g: parseInt(result[2], 16) / 256.0,
        b: parseInt(result[3], 16) / 256.0
    } : alert('color value not correct');
}