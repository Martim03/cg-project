import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { degToRad } from 'three/src/math/MathUtils.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;
var ring1, ring2, ring3, cylinder, skydome;
var ambientLight, directionalLight, pointLight;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    createCarousell(0, 2.5, 0);
    createSkyDome(0, 0, 0);
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
function createObject(geom, matr, position, parent) {
    var obj = new THREE.Object3D;
    obj.add(new THREE.Mesh(geom, matr))
    parent.add(obj);
    obj.position.set(position.x, position.y, position.z);
    
    return obj;
}

function createCylinder(x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry(5, 5, 5, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    cylinder = createObject(geometry, material, new THREE.Vector3(x, y, z), scene);
}

function createRing(x, y, z, innerRadius, outerRadius, color, height) {
    'use strict';

    var shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    var hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    var extrudeSettings = {
        steps: 2, // Number of steps along the extrusion path
        depth: height, // The depth of the extrusion
        bevelEnabled: false, // Disable beveling to maintain a sharp edge
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, wireframe: false});

    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.x = degToRad(90);
    ring.position.set(x, y, z);
    ring.userData = {up: false, down: false, step: 0.5, min: y, max: 40, iRadius: innerRadius, oRadius: outerRadius};
    scene.add(ring);

    return ring;
}

function parametricFunction(u, v) {
    var phi = Math.PI * u;
    var theta = 2 * Math.PI * v;

    var x = Math.sin(phi) * Math.cos(theta);
    var y = Math.sin(phi) * Math.sin(theta);
    var z = Math.cos(phi);

    return new THREE.Vector3(x, y, z);
};

function createParemetrics(ring) {
    'use strict';

    var angleStep = Math.PI / 4;

    for (var i = 0; i < 8; i++) {
        var angle = i * angleStep;

        var x = ring.position.x + Math.cos(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var y = ring.position.y*2 + 1;
        var z = ring.position.z + Math.sin(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);

        var geometry = new ParametricGeometry(parametricFunction);
        var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        createObject(geometry, material, new THREE.Vector3(x, y, z), scene);
    }
}

function createRings(x, y, z) {
    ring1 = createRing(x, y, z, 5, 10, 0xffffff, 5);
    ring2 = createRing(x, y, z, 10, 15, 0xffd700, 5);
    ring3 = createRing(x, y, z,15, 20, 0xff8c00, 5);
}

function createCarousell(x, y, z) {
    createCylinder(x, y, z);
    createRings(x, y, z);
    createParemetrics(ring1);
    createParemetrics(ring2);
    createParemetrics(ring3);
}

function createSkyDome(x, y, z) {
    'use strict';

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const texture = loader.load('./js/frame_louco.png');

    const geometry = new THREE.SphereGeometry(50, 50, 40);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide  // Render the inside of the sphere
    });

    skydome = new THREE.Mesh(geometry, material);
    skydome.position.set(x, y, z);

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

    cylinder.rotation.y += 5;
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
function animate() {
    'use strict';

    update();

    if (ring1.userData.up && ring1.position.y <= ring1.userData.max) {
        ring1.position.y += ring1.userData.step;
    } else if (ring1.userData.down && ring1.position.y >= ring1.userData.min) {
        ring1.position.y -= ring1.userData.step;
    }

    if (ring2.userData.up && ring2.position.y <= ring2.userData.max) {
        ring2.position.y += ring2.userData.step;
    } else if (ring2.userData.down && ring2.position.y >= ring2.userData.min) {
        ring2.position.y -= ring2.userData.step;
    }

    if (ring3.userData.up && ring3.position.y <= ring3.userData.max) {
        ring3.position.y += ring3.userData.step;
    } else if (ring3.userData.down && ring3.position.y >= ring3.userData.min) {
        ring3.position.y -= ring3.userData.step;
    }

    renderer.setAnimationLoop(render);

    requestAnimationFrame(animate);
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

    switch (e.key) {
        case "1":
            ring1.userData.up = true;
            break;
        case "2":
            ring2.userData.up = true;
            break;
        case "3":
            ring3.userData.up = true;
            break;
        case "4":
            ring1.userData.down = true;
            break;
        case "5":
            ring2.userData.down = true;
            break;
        case "6":
            ring3.userData.down = true;
            break;
        }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.key) {
        case "1":
            ring1.userData.up = false;
            break;
        case "2":
            ring2.userData.up = false;
            break;
        case "3":
            ring3.userData.up = false;
            break;
        case "4":
            ring1.userData.down = false;
            break;
        case "5":
            ring2.userData.down = false;
            break;
        case "6":
            ring3.userData.down = false;
            break;
        }
}

init();
animate();

console.log("STARTING...")