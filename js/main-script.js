import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { degToRad } from 'three/src/math/MathUtils.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cam1, cam2, cam3, cam4, cam5, cam6, scene, renderer;
var currentCamera, cameraMap;
var geometry, material, mesh;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    createCrane(0, 0, 0);
    createContainer( -20, 0, 40);
    createPieces();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';

    // FOV, aspect, near, far
    cam1 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam2 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam3 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam4 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam5 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    //cam6 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);

    cam1.position.set(70, 57, 0);
    cam2.position.set(0, 60, 70);
    cam3.position.set(0, 100, 0);
    cam4.position.set(-100, 50, 100);
    cam5.position.set(-100, 50, 100);
    //cam6.position.set(...);
    
    cam1.lookAt(0, 57, 0);
    cam2.lookAt(0, 60, 0);
    cam3.lookAt(scene.position);
    cam4.lookAt(0, 50, 0);
    cam5.lookAt(0, 50, 0);
    //cam6.lookAt(scene.position);

    scene.add(cam1);
    scene.add(cam2);
    scene.add(cam3);
    scene.add(cam4);
    scene.add(cam5);
    //scene.add(cam6);
    currentCamera = cam1;

    cameraMap = {
        '1': cam1,
        '2': cam2,
        '3': cam3,
        '4': cam4,
        '5': cam5
        //'6': cam6
    };
}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function addBase(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(10, 5, 10);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(5, 50, 5);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCabin(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(6, 6, 6);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addSpearHolder(obj, x, y, z) {
    'use strict';

    geometry = new THREE.ConeGeometry( 4, 20, 4 );
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateY(degToRad(45));
    obj.add(mesh);
}

function addFrontSpear(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(6, 5, 50);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addBackSpear(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(6, 5, -15);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCounterWeight(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3, 10, -6);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCable(obj, x, y, z, size, angle) {
    'use strict';

    geometry = new THREE.CylinderGeometry( 0.1, 0.1, size);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateX(degToRad(angle));
    obj.add(mesh);
}

function addCar(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3, 2, 3);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHand(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry( 8, 8, 4, 10); 
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFinger(obj, x, y, z) {
    'use strict';

    geometry = new THREE.ConeGeometry( 4, 8, 4 );
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateZ(degToRad(180))
    obj.add(mesh);
}

function createClaw(x, y, z) {
    'use strict';

    var claw = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

    addHand(claw, 0, 0, 0);
    addFinger(claw, 4, -4, 0);
    addFinger(claw, -4, -4, 0);
    addFinger(claw, 0, -4, 4);
    addFinger(claw, 0, -4, -4);

    scene.add(claw);

    claw.position.set(x,y,z);
}

function createCrane(x, y, z) {
    'use strict';

    var crane = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

    addBase(crane, 0, 0, 0);
    addTower(crane, 0, 27.5, 0);
    addCabin(crane, 0, 55.5, 0);
    addSpearHolder(crane, 0, 68.5, 0);
    addFrontSpear(crane, 0, 61, 27.5);
    addBackSpear(crane, 0, 61, -10);
    addCounterWeight(crane, 0, 58, -12);
    addCable(crane, 0, 71, 19, 41, -70);
    addCable(crane, 0, 71, -6, 19, 40);
    addCar(crane, 0, 57.5, 45);

    createClaw(0, 30, 45);

    scene.add(crane);

    crane.position.set(x,y,z);
}

function addFloor(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 1, 20);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWall(obj, x, y, z, rotate) {
    'use strict';

    geometry = new THREE.BoxGeometry(1, 10, 20);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (rotate) { mesh.rotateY(degToRad(90)); }
    obj.add(mesh);
}

function createContainer(x, y, z) {
    'use strict';

    var container = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });

    addFloor(container, 0, -5, 0);
    addWall(container, 10, 0, 0, false);
    addWall(container, -10, 0, 0, false);
    addWall(container, 0, 0, 10, true);
    addWall(container, 0, 0, -10, true);

    scene.add(container);

    container.position.set(x,y,z);
}

function createPieces() {
    'use strict';

    var p1 = new THREE.Object3D();
    var p2 = new THREE.Object3D();
    var p3 = new THREE.Object3D();
    var p4 = new THREE.Object3D();
    var p5 = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    geometry = new THREE.BoxGeometry(5, 5, 5);
    mesh = new THREE.Mesh(geometry, material);
    p1.add(mesh);

    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    geometry = new THREE.DodecahedronGeometry(4);
    mesh = new THREE.Mesh(geometry, material);
    p2.add(mesh);

    material = new THREE.MeshBasicMaterial({ color: 0xf00f00, wireframe: true });
    geometry = new THREE.IcosahedronGeometry(4);
    mesh = new THREE.Mesh(geometry, material);
    p3.add(mesh);

    material = new THREE.MeshBasicMaterial({ color: 0xf0000f, wireframe: true });
    geometry = new THREE.TorusGeometry(4, 0.5);
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(degToRad(90));
    p4.add(mesh);

    material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    geometry = new THREE.TorusKnotGeometry(3, 0.7);
    mesh = new THREE.Mesh(geometry, material);
    p5.add(mesh);


    scene.add(p1);
    scene.add(p2);
    scene.add(p3);
    scene.add(p4);
    scene.add(p5);

    p1.position.set(40, 0, -20);
    p2.position.set(-60, 0, 10);
    p3.position.set(20, 0, -40);
    p4.position.set(-40, 0, -40);
    p5.position.set(40, 0, 30);
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

    renderer.render(scene, currentCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xADD8E6);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    render();

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    
    renderer.setSize(window.innerWidth, window.innerHeight);

    if(window.innerHeight > 0 && window.innerWidth > 0) {
        //camera.aspect = renderer.getSize().width/renderer.getSize().height;
        //camera.updateProjectionMatrix;
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    if (e.key in cameraMap) {
        currentCamera = cameraMap[e.key];
        console.log("Switched to camera " + e.key);
    }

    render();
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();

console.log("STARTING...")