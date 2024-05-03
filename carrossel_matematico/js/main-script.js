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
var ambientLight, directionalLight;
var ring1Materials, ring2Materials, ring3Materials, CylinderMaterials, MobiusMaterials, ParametricsMaterials;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    createCarousell(0, 0, 0);
    //createSkyDome(0, 0, 0);
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
    ambientLight = new THREE.AmbientLight(0xffa500, 0.2);
    scene.add(ambientLight);
}

function addDirectionalLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function toggleDirectionalLight() {
    directionalLight.visible = !directionalLight.visible;
}
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createObject(geom, matr, position, parent) {
    var obj = new THREE.Object3D;
    var mesh = new THREE.Mesh(geom, matr);
    obj.add(mesh)
    parent.add(obj);
    obj.position.set(position.x, position.y, position.z);
    
    obj.userData = {mesh: mesh};
    return obj;
}

function createMaterial(color) {
    var list = {
        "Lambert": new THREE.MeshLambertMaterial({ color: color }),
        "Phong": new THREE.MeshPhongMaterial({ color: color }),
        "Toon": new THREE.MeshToonMaterial({ color: color }),
        "Normal": new THREE.MeshNormalMaterial()
    }

    return list;
}

function switchMaterial(materialType) {
    cylinder.userData.mesh.material = CylinderMaterials[materialType];
    ring1.userData.mesh.material = ring1Materials[materialType];
    ring2.userData.mesh.material = ring1Materials[materialType];
    ring3.userData.mesh.material = ring1Materials[materialType];

    for (var p in ring1.userData.parametrics) {
        ring1.userData.parametrics[p].userData.mesh.material = ParametricsMaterials[materialType];
    }
    for (p in ring2.userData.parametrics) {
        ring2.userData.parametrics[p].userData.mesh.material = ParametricsMaterials[materialType];
    }
    for (p in ring3.userData.parametrics) {
        ring3.userData.parametrics[p].userData.mesh.material = ParametricsMaterials[materialType];
    }
}

function createCylinder(x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry(5, 5, 5);
    CylinderMaterials = createMaterial(0x00ff00);
    cylinder = createObject(geometry, CylinderMaterials["Lambert"], new THREE.Vector3(x, y, z), scene);
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
    ring1Materials = createMaterial(color);
    var ring = createObject(geometry, ring1Materials["Lambert"], new THREE.Vector3(x, y, z), scene);
    ring.rotateX(degToRad(90));
    
    ring.userData.up = false;
    ring.userData.down = false;
    ring.userData.step = 0.5;
    ring.userData.min = y;
    ring.userData.max = 40;
    ring.userData.iRadius = innerRadius;
    ring.userData.oRadius = outerRadius;
    ring.userData.parametrics = [];

    return ring;
}

var sphereParametric = function(u, v, target) {
    var radius = 1;
    var phi = u * Math.PI;
    var theta = v * 2 * Math.PI;

    var x = radius * Math.sin(phi) * Math.cos(theta);
    var y = radius * Math.sin(phi) * Math.sin(theta);
    var z = radius * Math.cos(phi);

    target.set(x, y, z);
}

var torusParametric = function(u, v, target) {
    var radius = 1.5;
    var tubeRadius = 0.5;
    var phi = u * Math.PI * 2;
    var theta = v * Math.PI * 2;

    var x = (radius + tubeRadius * Math.cos(theta)) * Math.cos(phi);
    var y = (radius + tubeRadius * Math.cos(theta)) * Math.sin(phi);
    var z = tubeRadius * Math.sin(theta);

    target.set(x, y, z);
}

// NOT WORKING
var hyperboloidParametric = function(u, v, target) {
    var a = 0.5;
    var b = 0.5;
    var c = 0.5;

    var theta = u * Math.PI * 2;
    var phi = v * Math.PI;

    var x = a * Math.sinh(phi) * Math.cos(theta);
    var y = b * Math.sinh(phi) * Math.sin(theta);
    var z = c * Math.cosh(phi);

    target.set(x, y, z);
}

// NOT WORKING
var boySurfaceParametric = function(u, v, target) {
    var x = Math.sin(u) * Math.cos(v);
    var y = Math.sin(u) * Math.sin(v);
    var z = Math.cos(u) + Math.log(Math.tan(u / 2));

    target.set(x, y, z);
}

// NOT WORKING
var helicoidParametric = function(u, v, target) {
    var a = 1;
    var b = 1;

    var x = u * Math.cos(v);
    var y = u * Math.sin(v);
    var z = a * v + b * u;

    target.set(x, y, z);
}

//NOT WORKING
var hyperbolicParaboloidParametric = function(u, v, target) {
    var a = 50;
    var b = 50;

    var x = u;
    var y = v;
    var z = a * u * u - b * v * v;

    target.set(x, y, z);
}

//NOT WORKING
var cylinderParametric = function(u, v, target) {
    var radius = 2;
    var height = 4;

    var x = radius * Math.cos(u);
    var y = radius * Math.sin(u);
    var z = v * height;

    target.set(x, y, z);
}


var coneParametric = function(u, v, target) {
    var radius = 2; 
    var height = 5

    var x = radius * (1 - v) * Math.cos(u*2*Math.PI);
    var y = radius * (1 - v) * Math.sin(u*2*Math.PI);
    var z = height * v;

    target.set(x, y, z);
}

//NOT WORKING
var mobiusParametric = function (u, v, target) {
    var radius = 5;
    var width = 1;

    var x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
    var y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
    var z = v * Math.sin(u / 2);

    target.set(x * radius, y * radius, z * width);
}

function createParemetrics(ring) {
    'use strict';

    var angleStep = Math.PI / 4;

    for (var i = 0; i < 8; i++) {
        var angle = i * angleStep;

        var x = ring.position.x + Math.cos(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var y = ring.position.z + Math.sin(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var z = ring.position.y/2 - 3;

        var geometry = new ParametricGeometry(sphereParametric, 5, 5);
        ParametricsMaterials = createMaterial(0xff0000);
        var obj = createObject(geometry, ParametricsMaterials["Lambert"], new THREE.Vector3(x, y, z), ring);
        ring.userData.parametrics.push(obj);
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
function rotateParametrics(ring) {
    'use strict';

    for (var p in ring.userData.parametrics) {
        ring.userData.parametrics[p].rotation.y += 2;
    }
}

function update(){
    'use strict';

    cylinder.rotateY(degToRad(5));
    ring1.rotateZ(degToRad(0.5));
    ring2.rotateZ(degToRad(-1));
    ring3.rotateZ(degToRad(1.5));

    rotateParametrics(ring1);
    rotateParametrics(ring2);
    rotateParametrics(ring3);
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
    addDirectionalLight();

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
    } 
    if (ring1.userData.down && ring1.position.y >= ring1.userData.min) {
        ring1.position.y -= ring1.userData.step;
    }

    if (ring2.userData.up && ring2.position.y <= ring2.userData.max) {
        ring2.position.y += ring2.userData.step;
    }
    if (ring2.userData.down && ring2.position.y >= ring2.userData.min) {
        ring2.position.y -= ring2.userData.step;
    }

    if (ring3.userData.up && ring3.position.y <= ring3.userData.max) {
        ring3.position.y += ring3.userData.step;
    }
    if (ring3.userData.down && ring3.position.y >= ring3.userData.min) {
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
        case "D":
        case "d":
            toggleDirectionalLight();
            break;
        case 'T':
        case 't':
            //toggleLighting();
            break;
        case 'Q':
        case 'q':
            switchMaterial('Lambert');
            break;
        case 'W':
        case 'w':
            switchMaterial('Phong');
            break;
        case 'E':
        case 'e':
            switchMaterial('Toon');
            break;
        case 'R':
        case 'r':
            switchMaterial('Normal');
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