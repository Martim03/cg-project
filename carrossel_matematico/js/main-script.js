import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { degToRad } from 'three/src/math/MathUtils.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;
var ring1, ring2, ring3, cylinder, skydome;
var ringMovement = { 1: 0, 2: 0, 3: 0 };
var ambientLight, directionalLight, pointLight;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    createCylinder(0, 0, 0);
    createRings();
    createSkyDome();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';

    // FOV, aspect, near, far
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    camera.position.set(70, 70, 0); 
    camera.lookAt(scene.position);
    scene.add(camera);

}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function addAmbientLight() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);
}

function addDirectionalLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50); // Adjust the position to change from where the light comes
    directionalLight.castShadow = true; // Enable shadows
    scene.add(directionalLight);
}

function addPointLight() {
    pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(0, 50, 0); // Positioned above the scene
    scene.add(pointLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createRings() {
    ring1 = createRing(5, 10, 0xffffff, 5);
    ring2 = createRing(10, 15, 0xffd700, 5);
    ring3 = createRing(15, 20, 0xff8c00, 5);
}

function createCylinder(x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry(5, 5, 5, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(x, y, z);
    scene.add(cylinder);
}

function createRing(innerRadius, outerRadius, color, height) {
    'use strict';
    var shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false); // Outer circle
    var hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true); // Inner circle
    shape.holes.push(hole);

    // Extrude settings
    var extrudeSettings = {
        steps: 2, // Number of steps along the extrusion path (minimal since we're only pushing out a simple shape)
        depth: height, // The depth (thickness) of the extrusion
        bevelEnabled: false, // Disable beveling to maintain a sharp edge
    };

    // Create the geometry by extruding the shape
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create the material
    var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

    // Create the mesh using the geometry and material
    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.x = Math.PI / 2; // Rotate 90 degrees around the X-axis to stand up
    // Add the mesh to the scene
    scene.add(ring);

    return ring;
}


function createSkyDome() {
    'use strict';
    // Load the texture
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const texture = loader.load('/home/lourenco/projects/ist/cg/cg-project/carrossel_matematico/js/frame_louco.png', function (loadedTexture) {
        scene.background = loadedTexture; // or apply to your object here
        console.log("Texture loaded successfully");
    }, undefined, function (error) {
        console.error("Error while loading texture: ", error);
    });  // Replace with the path to your texture file

    // Adjust the texture settings if necessary
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);  // You can adjust repeat settings to get the desired effect

    // Create the geometry and material
    const geometry = new THREE.SphereGeometry(50, 50, 40);  // Size large enough to act as a sky
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide  // Render the inside of the sphere
    });

    // Create the mesh
    skydome = new THREE.Mesh(geometry, material);
    skydome.position.set(0, 0, 0);  // Center it over your scene

    // Add the skydome to the scene
    scene.add(skydome);
}



//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    renderer.setClearColor(0xADD8E6);
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    createScene();
    createCameras();

    addAmbientLight();

    render();

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);


    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);


    animate();
}

function onSessionStart() {
    console.log("VR Session started");
}

function onSessionEnd() {
    console.log("VR Session ended");
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function updateRings() {
    ring1.position.y += ringMovement[1];
    ring2.position.y += ringMovement[2];
    ring3.position.y += ringMovement[3];
    cylinder.rotation.y += 10; // Rotação constante do cilindro central
}

function animate() {
    'use strict';

    renderer.setAnimationLoop(render);

    requestAnimationFrame(animate);
    updateRings();
    render();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    
    renderer.setSize(window.innerWidth, window.innerHeight);

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 49: // '1'
            ringMovement[1] = 0.5;
            break;
        case 50: // '2'
            ringMovement[2] = 0.5;
            break;
        case 51: // '3'
            ringMovement[3] = 0.5;
            break;
        case 52: // '4'
            ringMovement[1] = -0.5;
            break;
        case 53: // '5'
            ringMovement[2] = -0.5;
            break;
        case 54: // '6'
            ringMovement[3] = -0.5;
            break;
        }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
        case 49: // '1'
            ringMovement[1] = 0;
            break;
        case 50: // '2'
            ringMovement[2] = 0;
            break;
        case 51: // '3'
            ringMovement[3] = 0;
            break;
        case 52: // '4'
            ringMovement[1] = 0;
            break;
        case 53: // '5'
            ringMovement[2] = 0;
            break;
        case 54: // '6'
            ringMovement[3] = 0;
            break;
    }
}

init();
animate();

console.log("STARTING...")