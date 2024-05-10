import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { AsciiEffect, ConvexObjectBreaker, ThreeMFLoader } from 'three/examples/jsm/Addons.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cam1, cam2, cam3, cam4, cam5, cam6, currentCamera, scene, renderer;
var crane, container, p1, p2, p3, p4, p5;
var inContainer = {
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false
};
var craneMaterial, cableMaterial, clawMaterial, containerMaterial, pieceMaterial;
var pressedKeys = [];
var phases = [
    {action: pickUp },
    {action: lift },
    {action: rotate },
    {action: slide },
    {action: descend },
    {action: drop },
    {action: lift },
];
var currentPhase = 0;
var clock = new THREE.Clock();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    createCrane(0, 0, 0);
    createContainer( -10, 0, 30);
    createPieces();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createPrespectiveCamera(position, lookAt, FOV, parent) {
    var cam = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight);
    cam.position.set(position.x, position.y, position.z);
    cam.lookAt(lookAt.x, lookAt.y, lookAt.z);
    parent.add(cam)
    
    return cam;
}

function createOrthogonalCamera(position, lookAt, parent) {
    var cam = new THREE.OrthographicCamera( window.innerWidth / - 12, window.innerWidth / 12,  
    window.innerHeight / 12, window.innerHeight / - 12, 1, 1000 );
    cam.position.set(position.x, position.y, position.z);
    cam.lookAt(lookAt.x, lookAt.y, lookAt.z);
    parent.add(cam)

    return cam;
}

function createCameras() {
    'use strict';
    cam1 = createOrthogonalCamera(new THREE.Vector3(150, 50, 0), new THREE.Vector3(0, 50, 0), scene);
    cam2 = createOrthogonalCamera(new THREE.Vector3(0, 50, 150), new THREE.Vector3(0, 50, 0), scene);
    cam3 = createOrthogonalCamera(new THREE.Vector3(0, 150, 0), scene.position, scene);
    cam4 = createPrespectiveCamera(new THREE.Vector3(100, 50, 100), new THREE.Vector3(0, 50, 0), 70, scene);
    cam5 = createOrthogonalCamera(new THREE.Vector3(100, 50, 100), new THREE.Vector3(0, 50, 0), scene);
    currentCamera = cam1;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

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

function addBase(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(10, 5, 10);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addTower(obj, x, y, z) {
    'use strict';
    
    var geometry = new THREE.BoxGeometry(5, 50, 5);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addCabin(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(6, 6, 6);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addSpearHolder(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.ConeGeometry( 4, 20, 4 );
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj).rotateY(THREE.MathUtils.degToRad(45));
}

function addFrontSpear(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(6, 5, 50);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addBackSpear(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(6, 5, -15);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addCounterWeight(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(3, 10, -6);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addCable(obj, x, y, z, size, angle) {
    'use strict';

    var geometry = new THREE.CylinderGeometry( 0.1, 0.1, size);
    var obj = createObject(geometry, cableMaterial, new THREE.Vector3(x, y, z), obj).rotateX(THREE.MathUtils.degToRad(angle));
    
    return obj;
}

function addCar(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(3, 2, 3);
    createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addHand(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry( 8, 8, 4, 10); 
    createObject(geometry, clawMaterial, new THREE.Vector3(x, y, z), obj);
}

function addFinger(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.ConeGeometry( 3, 8, 4 );
    var obj = createObject(geometry, clawMaterial, new THREE.Vector3(x, y, z), obj).rotateZ(THREE.MathUtils.degToRad(180));

    return obj;
}

function createClaw(obj, x, y, z) {
    'use strict';

    var claw = new THREE.Object3D();
    
    clawMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

    var cable = addCable(claw, 0, 15.5, 0, 27.5, 0);
    addHand(claw, 0, 0, 0);
    var f1 = addFinger(claw, 4, -4, 0);
    var f2 = addFinger(claw, -4, -4, 0);
    var f3 = addFinger(claw, 0, -4, 4);
    var f4 = addFinger(claw, 0, -4, -4);
    cam6 = createPrespectiveCamera(new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, -50, 0), 70, claw);

    claw.userData = {up: false, down: false,  minH: -50, maxH: -10, 
                    close: false, open: false, minA: 0, maxA: 45,
                    f1: f1, f2: f2, f3: f3, f4: f4, 
                    cable: cable, piece: null, radius: 8}
    obj.add(claw);
    claw.position.set(x,y,z);

    return claw;
}

function createCar(obj, x, y, z) {
    'use strict';

    var car = new THREE.Object3D();

    addCar(car, 0, 0, 0);
    var claw = createClaw(car, 0, -30, 0);

    car.userData = {slideFront: false, slideBack: false, claw: claw, min: 15, max: 45}
    obj.add(car);
    car.position.set(x, y, z);

    return car;
}

function createCraneTop(obj, x, y, z) {
    'use strict';

    var craneTop = new THREE.Object3D();

    addCabin(craneTop, 0, 0, 0); //55.5
    addSpearHolder(craneTop, 0, 13, 0);
    addFrontSpear(craneTop, 0, 5.5, 27.5);
    addBackSpear(craneTop, 0, 5.5, -10);
    addCounterWeight(craneTop, 0, 2.5, -12);
    addCable(craneTop, 0, 15.5, 19, 41, -70);
    addCable(craneTop, 0, 15.5, -6, 19, 40);
    var car = createCar(craneTop, 0, 2, 45);

    craneTop.userData = {rotateLeft: false, rotateRight: false, car: car}
    obj.add(craneTop);
    craneTop.position.set(x, y, z);

    return craneTop;
}

function createCrane(x, y, z) {
    'use strict';
    
    crane = new THREE.Object3D();

    craneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    cableMaterial = new THREE.MeshBasicMaterial({ color: 0x770000, wireframe: true });

    addBase(crane, 0, 0, 0);
    addTower(crane, 0, 27.5, 0);
    var craneTop = createCraneTop(crane, 0, 55.5, 0);

    crane.userData = {top: craneTop, playingAnimation: false};
    scene.add(crane);
    crane.position.set(x,y,z);
}

function addFloor(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(20, 1, 20);
    createObject(geometry, containerMaterial, new THREE.Vector3(x, y, z), obj);
}

function addWall(obj, x, y, z, rotate) {
    'use strict';

    var geometry = new THREE.BoxGeometry(1, 10, 20);
    var wall = createObject(geometry, containerMaterial, new THREE.Vector3(x, y, z), obj);
    if (rotate) { wall.rotateY(THREE.MathUtils.degToRad(90)); }
}

function createContainer(x, y, z) {
    'use strict';

    container = new THREE.Object3D();

    containerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });

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

    pieceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var geometry = new THREE.BoxGeometry(7, 7, 7);
    p1 = createObject(geometry, pieceMaterial, new THREE.Vector3(30, 0, -10), scene);

    var geometry = new THREE.DodecahedronGeometry(6);
    p2 = createObject(geometry, pieceMaterial, new THREE.Vector3(-20, 0, 10), scene);

    var geometry = new THREE.IcosahedronGeometry(5);
    p3 = createObject(geometry, pieceMaterial, new THREE.Vector3(20, 0, -40), scene);

    var geometry = new THREE.TorusGeometry(4, 0.5);
    p4 = createObject(geometry, pieceMaterial, new THREE.Vector3(-40, 0, 0), scene);
    p4.rotateX(THREE.MathUtils.degToRad(90));

    var geometry = new THREE.TorusKnotGeometry(3, 0.7);
    p5 = createObject(geometry, pieceMaterial, new THREE.Vector3(40, 0, 30), scene);

    p1.userData = {radius: 7};
    p2.userData = {radius: 6};
    p3.userData = {radius: 5};
    p4.userData = {radius: 4};
    p5.userData = {radius: 3};
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function isColliding(obj1, obj2) {
    const r1 = obj1.userData.radius;
    const r2 = obj1.userData.radius;
    const dist = obj1.getWorldPosition(new THREE.Vector3).distanceToSquared(obj2.getWorldPosition(new THREE.Vector3));

    return dist <= r1**2 + r2**2;
}

function checkCollisions(){
    'use strict';

    if (crane.userData.playingAnimation) return;

    if (isColliding(crane.userData.top.userData.car.userData.claw, p1) && !inContainer["1"]){
        handleCollisions(p1);
        inContainer["1"] = true;
    } else if (isColliding(crane.userData.top.userData.car.userData.claw, p2) && !inContainer["2"]) {
        handleCollisions(p2);
        inContainer["2"] = true;
    } else if (isColliding(crane.userData.top.userData.car.userData.claw, p3) && !inContainer["3"]) {
        handleCollisions(p3);
        inContainer["3"] = true;
    } else if (isColliding(crane.userData.top.userData.car.userData.claw, p4) && !inContainer["4"]) {
        handleCollisions(p4);
        inContainer["4"] = true;
    } else if (isColliding(crane.userData.top.userData.car.userData.claw, p5) && !inContainer["5"]) {
        handleCollisions(p5);
        inContainer["5"] = true;
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function clearKeys() {
    crane.userData.top.userData.rotateLeft = false;
    crane.userData.top.userData.rotateRight = false;
    crane.userData.top.userData.car.userData.slideFront = false;
    crane.userData.top.userData.car.userData.slideBack = false;
    crane.userData.top.userData.car.userData.claw.userData.up = false;
    crane.userData.top.userData.car.userData.claw.userData.down = false;
    crane.userData.top.userData.car.userData.claw.userData.close = false;
    crane.userData.top.userData.car.userData.claw.userData.open = false;
}

function handleCollisions(piece){
    'use strict';

    clearKeys();

    crane.userData.playingAnimation = true;
    crane.userData.top.userData.car.userData.claw.add(piece);
    crane.userData.top.userData.car.userData.claw.userData.piece = piece;
    piece.position.set(0, -6, 0);
}

////////////
/* UPDATE */
////////////
function pickUp() {
    var claw = crane.userData.top.userData.car.userData.claw;
    claw.userData.close = true;

    if (THREE.MathUtils.radToDeg(claw.userData.f3.rotation.x) >= claw.userData.maxA) {
        claw.userData.close = false;
        nextPhase();
    }
}

function lift() {
    var claw = crane.userData.top.userData.car.userData.claw;
    claw.userData.up = true;

    if (claw.position.y == claw.userData.maxH) {
        claw.userData.up = false;
        nextPhase()
    }
}

function rotate() {
    var craneTop = crane.userData.top;
    var claw = craneTop.userData.car.userData.claw;
    craneTop.userData.rotateRight = true;

    var clawPos = claw.getWorldPosition(new THREE.Vector3());
    var slope = (crane.position.z - container.position.z) / (crane.position.x - container.position.x);
    if (Math.abs(clawPos.z - slope*clawPos.x) < 2 && clawPos.z > 0) {
        craneTop.userData.rotateRight = false;
        nextPhase()
    }
}

function slide() {
    var car = crane.userData.top.userData.car;
    var claw = car.userData.claw;

    var clawPos = claw.getWorldPosition(new THREE.Vector3());
    var dist1 = crane.position.distanceToSquared(container.position);
    var dist2 = new THREE.Vector3(crane.position.x, clawPos.y, crane.position.z).distanceToSquared(clawPos);
    if (dist1 < dist2) {
        car.userData.slideBack = true;
    } else {
        car.userData.slideFront = true;
    }

    if (Math.abs(dist1 - dist2) < 25) {
        car.userData.slideBack = false;
        car.userData.slideFront = false;
        nextPhase()
    }
}

function descend() {
    var claw = crane.userData.top.userData.car.userData.claw;
    claw.userData.down = true;

    if (claw.position.y == claw.userData.minH) {
        claw.userData.down = false;
        nextPhase()
    }
}

function drop() {
    var claw = crane.userData.top.userData.car.userData.claw;
    claw.userData.open = true;

    if (THREE.MathUtils.radToDeg(claw.userData.f3.rotation.x) <= claw.userData.minA) {
        claw.userData.open = false;

        container.add(claw.userData.piece);
        claw.userData.piece.position.y += 6;
        claw.userData.piece = null;
        nextPhase()
    }
}

function nextPhase() {
    currentPhase += 1;
    if (!(currentPhase in phases)) {
        currentPhase = 0;
        crane.userData.playingAnimation = false;
    }
}

function update(){
    'use strict';

    animate();
    checkCollisions();

    if (crane.userData.playingAnimation) {
        phases[currentPhase].action();
    }

    render();
    requestAnimationFrame(update);
}

/////////////
/* DISPLAY */
/////////////
function toogleWireframe() {
    craneMaterial.wireframe = !craneMaterial.wireframe
    cableMaterial.wireframe = !cableMaterial.wireframe
    clawMaterial.wireframe = !clawMaterial.wireframe
    containerMaterial.wireframe = !containerMaterial.wireframe
    pieceMaterial.wireframe = !pieceMaterial.wireframe
}

function updateHUDText() {
    var hudText = document.getElementById('hudText');
    hudText.innerHTML = '<p>Press 7 to toggle wireframe mode</p>' +
                        '<p>Press Q to rotate the crane left</p>' +
                        '<p>Press A to rotate the crane right</p>' +
                        '<p>Press W to slide the car to the front</p>' + 
                        '<p>Press S to slide the car to the back</p>' +
                        '<p>Press E to lift the claw</p>' +
                        '<p>Press D to descend the claw</p>' +
                        '<p>Press R to close the claw</p>' +
                        '<p>Press F to open the claw</p>' +
                        '<p>Press [1-6] to switch between cameras</p>';
}

function updatePressingKeys(key, clear) {
    key = key.toUpperCase();

    if (clear) {
        var i = pressedKeys.indexOf(key);
        delete pressedKeys[i];
    } else if (!pressedKeys.includes(key)) {
        pressedKeys.push(key);
    }

    var pressingKeys = document.getElementById('pressingKeys');
    pressingKeys.innerHTML = "";
    for (var k in pressedKeys) {
        pressingKeys.innerHTML += pressedKeys[k] + ' ';
    }
}

function createHUD() {
    var hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.position = 'fixed';
    hud.style.top = '10px';
    hud.style.left = '10px';
    hud.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    hud.style.padding = '10px';
    hud.style.borderRadius = '5px';
    hud.style.fontFamily = 'Arial, sans-serif';

    var hudText = document.createElement('div');
    hudText.id = 'hudText';
    hudText.style.fontSize = '13px';
    var pressingKeys = document.createElement('div');
    pressingKeys.id = 'pressingKeys';
    pressingKeys.style.fontSize = '13px';

    hud.appendChild(hudText);
    hud.appendChild(pressingKeys);
    document.body.appendChild(hud);

    updateHUDText();
}

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

    createHUD();
    createScene();
    createCameras();
    render();

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function scaleCable(oldClaw_posY) {
    var car_posY = crane.userData.top.userData.car.getWorldPosition(new THREE.Vector3()).y-1;
    var claw_posY = crane.userData.top.userData.car.userData.claw.getWorldPosition(new THREE.Vector3()).y+2;
    var oldScale = crane.userData.top.userData.car.userData.claw.userData.cable.scale.y;
    var cable = crane.userData.top.userData.car.userData.claw.userData.cable;

    // Calculate new center: Claw - Car / 2 (off_set = 2)
    cable.position.y = -(claw_posY - car_posY)/2 + 2;
    
    // Calculate Scale: NewSize * OldScale / OldSize (regra de 3 simples)
    cable.scale.y = (oldScale * (claw_posY - car_posY)) / (oldClaw_posY - car_posY)
}

function closeClaw(claw, dt) {
    claw.userData.f1.rotation.z -= 1*dt;
    claw.userData.f2.rotation.z += 1*dt;
    claw.userData.f3.rotation.x += 1*dt;
    claw.userData.f4.rotation.x -= 1*dt;
}

function openClaw(claw, dt) {
    claw.userData.f1.rotation.z += 1*dt;
    claw.userData.f2.rotation.z -= 1*dt;
    claw.userData.f3.rotation.x -= 1*dt;
    claw.userData.f4.rotation.x += 1*dt;
}

function animate() {
    'use strict';

    const dt = clock.getDelta();

    var craneTop = crane.userData.top;
    var car = craneTop.userData.car;
    var claw = car.userData.claw;

    if (craneTop.userData.rotateLeft) {
        craneTop.rotation.y += 1*dt;
    }
    if (craneTop.userData.rotateRight) {
        craneTop.rotation.y -= 1*dt;
    }

    if (car.userData.slideFront) {
        car.position.z += 20*dt;

        if (car.position.z > car.userData.max) car.position.z = car.userData.max;
    }
    if (car.userData.slideBack) {
        car.position.z -= 20*dt;

        if (car.position.z < car.userData.min) car.position.z = car.userData.min;
    }

    if (claw.userData.up) {
        var oldPosition = claw.getWorldPosition(new THREE.Vector3()).y + 2;
        claw.position.y += 25*dt;

        if (claw.position.y > claw.userData.maxH) claw.position.y = claw.userData.maxH;

        scaleCable(oldPosition);
    }
    if (claw.userData.down) {
        var oldPosition = claw.getWorldPosition(new THREE.Vector3()).y + 2;
        claw.position.y -= 25*dt;

        if (claw.position.y < claw.userData.minH) claw.position.y = claw.userData.minH;

        scaleCable(oldPosition);
    }

    if (claw.userData.close && THREE.MathUtils.radToDeg(claw.userData.f3.rotation.x) < claw.userData.maxA) {
        closeClaw(claw, dt);
    }
    if (claw.userData.open && THREE.MathUtils.radToDeg(claw.userData.f3.rotation.x) > claw.userData.minA) {
        openClaw(claw, dt);
    }
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    
    renderer.setSize(window.innerWidth, window.innerHeight);

    function updateCamera(cam) {
        if (cam.isOrthographicCamera) {
            cam.left = window.innerWidth / - 12;
            cam.right = window.innerWidth / 12;
            cam.top = window.innerHeight / 12;
            cam.bottom = window.innerHeight / - 12;
        } else {
            cam.aspect = window.innerWidth/window.innerHeight;;
        }

        cam.updateProjectionMatrix();
    }

    if(window.innerHeight > 0 && window.innerWidth > 0) {
        updateCamera(cam1);
        updateCamera(cam2);
        updateCamera(cam3);
        updateCamera(cam4);
        updateCamera(cam5);
        updateCamera(cam6);
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    if (crane.userData.playingAnimation) return;

    switch (e.key) {
        case '1':
            currentCamera = cam1;
            break;
        case '2':
            currentCamera = cam2;
            break;
        case '3':
            currentCamera = cam3;
            break;
        case '4':
            currentCamera = cam4;
            break;
        case '5':
            currentCamera = cam5;
            break;
        case '6':
            currentCamera = cam6;
            break;
        case '7':
            toogleWireframe();
            break;
        case 'Q':
        case 'q':
            crane.userData.top.userData.rotateLeft = true;
            break;
        case 'A':
        case 'a':
            crane.userData.top.userData.rotateRight = true;
            break;
        case 'W':
        case 'w':
            crane.userData.top.userData.car.userData.slideFront = true;
            break;
        case 'S':
        case 's':
            crane.userData.top.userData.car.userData.slideBack = true;
            break;
        case 'E':
        case 'e':
            crane.userData.top.userData.car.userData.claw.userData.up = true;
            break;
        case 'D':
        case 'd':
            crane.userData.top.userData.car.userData.claw.userData.down = true;
            break;
        case 'R':
        case 'r':
            crane.userData.top.userData.car.userData.claw.userData.close = true;
            break;
        case 'F':
        case 'f':
            crane.userData.top.userData.car.userData.claw.userData.open = true;
            break;
        default:
            return;
    }

    updatePressingKeys(e.key, false);
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
            break;
        case 'Q':
        case 'q':
            crane.userData.top.userData.rotateLeft = false;
            break;
        case 'A':
        case 'a':
            crane.userData.top.userData.rotateRight = false;
            break;
        case 'W':
        case 'w':
            crane.userData.top.userData.car.userData.slideFront = false;
            break;
        case 'S':
        case 's':
            crane.userData.top.userData.car.userData.slideBack = false;
            break;
        case 'E':
        case 'e':
            crane.userData.top.userData.car.userData.claw.userData.up = false;
            break;
        case 'D':
        case 'd':
            crane.userData.top.userData.car.userData.claw.userData.down = false;
            break;
        case 'R':
        case 'r':
            crane.userData.top.userData.car.userData.claw.userData.close = false;
            break;
        case 'F':
        case 'f':
            crane.userData.top.userData.car.userData.claw.userData.open = false;
            break;
        default:
            return;
    }

    updatePressingKeys(e.key, true);
}

init();
update();

console.log("STARTING...")