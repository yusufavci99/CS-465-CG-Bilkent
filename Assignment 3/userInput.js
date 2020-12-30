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
    
    document.getElementById("cutOffDepth").oninput = (event) => {
        cutOffDepth = parseInt( event.target.value );
        document.getElementById("cutValue").innerText = event.target.value;
    };
}