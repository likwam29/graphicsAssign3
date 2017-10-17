// assignment3.js -- A starting point for your work on Assignment 3

var canvas;
var gl;
var program;

var near = 0.3;
var far = 10.0;
var radius = 4.0;		// Used to establish eye point
var theta  = 0.0;		// Used to establish eye point
var phi    = 0.0;		// Used to establish eye point
var rotation_by_5_deg = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;			// Established by radius, theta, phi as we move
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

////////////////// Object 1 vertex information //////////////////  

// numVerticesObj1, pointsArray1, vertices1, coordsForObj1 are all
// used to generate the vertex information for "Object 1".  In the
// assignment, you are required to make this object a more interesting
// mathematically defined object such as the sombrero surface or
// Moebius band

var nRows = 25;
var nColumns = 25;

var datax = [];
var datay = [];
var dataz = [];

var numVerticesObj1  = 36;	// For the 12 triangles

var pointsArray1 = [];
var tempArr = [];

var transX = 1;
var transY = 1;
var rotateX = 0.0;


var vertices1 = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4( 0.5, -0.5, 0.5, 1.0) 
];

function coordsForObj1()
{
    for( var i = 0; i <= nRows; ++i ) {
		datax.push( [] );
		datay.push( [] );
		dataz.push( [] );
		var u = 2.0 * Math.PI * (i/nRows);
		console.log(u);
		
		for( var j = 0; j <= nColumns; ++j ) {
			var v = -0.3 + ((j/nColumns) * 0.6);
			datax[i].push(Math.cos(u) + v * Math.sin(u/2.0) * Math.cos(u));
			datay[i].push(Math.sin(u) + v * Math.sin(u/2.0) * Math.sin(u));
			dataz[i].push(v * Math.cos(u/2.0));
		}
    }
    
    for(var i=0; i<nRows; i++) {
        for(var j=0; j<nColumns;j++) {
            pointsArray1.push( vec4(datax[i][j], datay[i][j], dataz[i][j],1.0));
            pointsArray1.push( vec4(datax[i+1][j], datay[i+1][j], dataz[i+1][j], 1.0));
            pointsArray1.push( vec4(datax[i+1][j+1], datay[i+1][j+1], dataz[i+1][j+1], 1.0));
            pointsArray1.push( vec4(datax[i][j+1], datay[i][j+1], dataz[i][j+1], 1.0));
		}	

    }
}

///////// End of vertex information for Object 1  ////////

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
	gl.enable( gl.POLYGON_OFFSET_FILL );
	gl.polygonOffset(1.0,2.0);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    coordsForObj1();		// This will probably change once you finalize Object 1
	
	for(var i = 0; i < 240; i+=12){
		tempArr.push(buckyBall[i]);
		tempArr.push(buckyBall[i+1]);
		tempArr.push(buckyBall[i+2]);
		tempArr.push(buckyBall[i+10]);
		tempArr.push(buckyBall[i+8]);
		tempArr.push(buckyBall[i+5]);
	}

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
//    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray1), gl.STATIC_DRAW );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray1.concat(buckyBall).concat(tempArr)), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // buttons for viewing parameters

    document.getElementById("Button1").onclick = function(){near  *= 1.02; far *= 1.02;};
    document.getElementById("Button2").onclick = function(){near *= 0.98; far *= 0.98;};
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += rotation_by_5_deg;};
    document.getElementById("Button6").onclick = function(){theta -= rotation_by_5_deg;};
    document.getElementById("Button7").onclick = function(){phi += rotation_by_5_deg;};
    document.getElementById("Button8").onclick = function(){phi -= rotation_by_5_deg;};
    
    render(); 
};


var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
               radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    // Object 1
    modelViewMatrix = lookAt(eye, at , up);
    modelViewMatrix = mult(modelViewMatrix, translate(-1.2,0.0,0.0));
	modelViewMatrix = mult(modelViewMatrix, rotateY(rotateX, 0.0,0.0));
    modelViewMatrix = mult(modelViewMatrix, scalem(1.0,1.0,1.0));
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    for(var i=0; i<pointsArray1.length; i+=4) { 
        gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(vec4(0.0, 0.0, Math.cos(transX), 1.0)));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(gl.getUniformLocation(program, "fColor"), flatten(vec4(.5, .5, .5, 1.0)));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

    // The BuckyBall
    modelViewMatrix = lookAt(eye, at , up);
	
    modelViewMatrix = mult(modelViewMatrix, translate(1.75 * transX, Math.cos(transY) / 3,0.0));
	modelViewMatrix = mult(modelViewMatrix, rotateZ(rotateX, 0.0,0.0));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.03,0.03,0.03));
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniform4fv(gl.getUniformLocation(program, "fColor"),
	  flatten(vec4(0.0, Math.cos(transX), 1.0, 1.0)));
	gl.drawArrays( gl.TRIANGLES, pointsArray1.length, 240 );
	gl.uniform4fv(gl.getUniformLocation(program, "fColor"),
	  flatten(vec4(Math.cos(transX), 1.0, Math.cos(transX), 1.0)));
	gl.drawArrays( gl.TRIANGLES, pointsArray1.length + 240, 109 );
	for(var i=0; i<119; i+=6) { 
		gl.uniform4fv(gl.getUniformLocation(program, "fColor"),
		  flatten(vec4(0.0, 0.0, 0.0, 1.0)));
		gl.drawArrays( gl.LINE_LOOP, pointsArray1.length + buckyBall.length + i, 6 );
    }
	rotateX -= 2;
    transX -= .17;
	transY += .85;
	if(1.75 * transX < -3.7){
		transX = 2;
		transY = 1;
	}

    requestAnimFrame(render);
};

window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;
	
   if (key == 82) {
	    // 82 == 'r'
		transX -= .01;
   }else if(key == 38){
	   // key up
	   tweenRate = Math.min(tweenRate + .01, .5);
   }else if(key == 40){
	   // key down
	   tweenRate = Math.max(tweenRate - .005, .0001);
   }else if( key == 69){
	   //explode
	   tweenRate = -.05;
   }else if(key == 66){
	   // 66 == 'b'
	   bounce = !bounce;
   }else{
	   tweenRate = 0.015;
	   bounce = false;
   }
}
