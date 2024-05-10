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
var crane, container;
var pieces = [];
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


const components_measurements = {
    base: {width: 10, length: 10, height: 5},
    tower: {width: 5, length: 5, height: 50},
    cabin: {width: 6, length: 6, height: 6},
    spearHolder: {radius: 4, height: 20},
    frontSpear: {width: 5, length: 50, height: 6},
    backSpear: {width: 5, length: 15, height: 6},
    counterWeight: {width: 3, length: 6, height: 10},
    car: {width: 3, length: 3, height: 2},
    clawCable: {height: 30},
    hand: {radius: 8, height: 4},
    finger: {radius: 3, height: 8},
    floor: {width: 20, length: 20, height: 1},
    wall: {width: 1, length: 20, height: 10}
}

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    createCrane(0, 0, 0);
    createContainer(-10, 0, 30);
    createPieces();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createPerspectiveCamera(position, lookAt, FOV, parent) {
    var cam = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight);
    cam.position.set(position.x, position.y, position.z);
    cam.lookAt(lookAt.x, lookAt.y, lookAt.z);
    parent.add(cam);

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
    cam4 = createOrthogonalCamera(new THREE.Vector3(100, 50, 100), new THREE.Vector3(0, 50, 0), scene);
    cam5 = createPerspectiveCamera(new THREE.Vector3(100, 50, 100), new THREE.Vector3(0, 50, 0), 70, scene);
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

    var geometry = new THREE.BoxGeometry(components_measurements.base.width, components_measurements.base.height, components_measurements.base.length);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addTower(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.tower.length, components_measurements.tower.height, components_measurements.tower.width);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addCabin(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.cabin.width, components_measurements.cabin.height, components_measurements.cabin.length);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addSpearHolder(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.ConeGeometry(components_measurements.spearHolder.radius, components_measurements.spearHolder.height, components_measurements.spearHolder.radius);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj).rotateY(THREE.MathUtils.degToRad(45));
}

function addFrontSpear(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.frontSpear.width, components_measurements.frontSpear.height, components_measurements.frontSpear.length);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addBackSpear(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.backSpear.width, components_measurements.backSpear.height, components_measurements.backSpear.length);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addCounterWeight(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.counterWeight.width, components_measurements.counterWeight.height, components_measurements.counterWeight.length);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addCable(obj, x, y, z, size, angle) {
    'use strict';

    var geometry = new THREE.CylinderGeometry( 0.1, 0.1, size);
    return createObject(geometry, cableMaterial, new THREE.Vector3(x, y, z), obj).rotateX(THREE.MathUtils.degToRad(angle));
}

function addCar(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.car.width, components_measurements.car.height, components_measurements.car.length);
    return createObject(geometry, craneMaterial, new THREE.Vector3(x, y, z), obj);
}

function addHand(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry(components_measurements.hand.radius, components_measurements.hand.radius, components_measurements.hand.height, 16);
    return createObject(geometry, clawMaterial, new THREE.Vector3(x, y, z), obj);
}

function addFinger(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.ConeGeometry(components_measurements.finger.radius, components_measurements.finger.height, 4);
    return createObject(geometry, clawMaterial, new THREE.Vector3(x, y, z), obj).rotateZ(THREE.MathUtils.degToRad(180));
}

function createClaw(obj, x, y, z) {
    'use strict';

    var claw = new THREE.Object3D();

    clawMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

    var cable = addCable(claw, claw.position.x, components_measurements.clawCable.height/2, claw.position.z, components_measurements.clawCable.height, 0);
    addHand(claw, 0, 0, 0);
    var f1 = addFinger(claw, components_measurements.hand.radius/2, -components_measurements.hand.height, 0);
    var f2 = addFinger(claw, -components_measurements.hand.radius/2, -components_measurements.hand.height, 0);
    var f3 = addFinger(claw, 0, -components_measurements.hand.height, components_measurements.hand.radius/2);
    var f4 = addFinger(claw, 0, -components_measurements.hand.height, -components_measurements.hand.radius/2);
    cam6 = createPerspectiveCamera(new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, -50, 0), 70, claw);

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
    var claw = createClaw(car, 0, -components_measurements.clawCable.height, 0);

    car.userData = {slideFront: false, slideBack: false, claw: claw, min: 15, max: 45}
    obj.add(car);
    car.position.set(x, y, z);

    return car;
}

function createCraneTop(obj, x, y, z) {
    'use strict';

    var craneTop = new THREE.Object3D();

    var cabin = addCabin(craneTop, 0, components_measurements.cabin.height/2, 0);
    var spearHolder = addSpearHolder(craneTop, cabin.position.x, components_measurements.cabin.height+components_measurements.spearHolder.height/2, cabin.position.z);
    var frontSpear = addFrontSpear(craneTop, spearHolder.position.x, components_measurements.cabin.height+components_measurements.frontSpear.height/2, components_measurements.frontSpear.length/2+components_measurements.cabin.length/2);
    var backSpear = addBackSpear(craneTop, spearHolder.position.x, components_measurements.cabin.height+components_measurements.backSpear.height/2, -(components_measurements.backSpear.length/2+components_measurements.cabin.length/2));
    addCounterWeight(craneTop, backSpear.position.x, backSpear.position.y-components_measurements.counterWeight.height/5, -(components_measurements.backSpear.length/2+components_measurements.cabin.length/2)*1.2);
    addCable(craneTop, frontSpear.position.x, components_measurements.spearHolder.height*0.95, components_measurements.frontSpear.length*0.37, 40, -70);
    addCable(craneTop, backSpear.position.x, components_measurements.spearHolder.height*0.93, -components_measurements.backSpear.length*0.4, 18, 40);
    var car = createCar(craneTop, frontSpear.position.x, components_measurements.cabin.height-components_measurements.car.height/2, components_measurements.frontSpear.length/2+components_measurements.cabin.length/2);

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

    var base = addBase(crane, 0, components_measurements.base.height/2, 0);
    var tower = addTower(crane, base.position.x, components_measurements.base.height+components_measurements.tower.height/2, base.position.z);
    var craneTop = createCraneTop(crane, tower.position.x, components_measurements.base.height+components_measurements.tower.height, tower.position.z);

    crane.userData = {top: craneTop, playingAnimation: false, base: base};
    scene.add(crane);
    crane.position.set(x,y,z);
}

function addFloor(obj, x, y, z) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.floor.width, components_measurements.floor.height, components_measurements.floor.length);
    return createObject(geometry, containerMaterial, new THREE.Vector3(x, y, z), obj);
}

function addWall(obj, x, y, z, rotate) {
    'use strict';

    var geometry = new THREE.BoxGeometry(components_measurements.wall.width, components_measurements.wall.height, components_measurements.wall.length);
    var wall = createObject(geometry, containerMaterial, new THREE.Vector3(x, y, z), obj);
    if (rotate) { wall.rotateY(THREE.MathUtils.degToRad(90)); }

    return wall;
}

function createContainer(x, y, z) {
    'use strict';

    container = new THREE.Object3D();

    containerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });

    addFloor(container, 0, components_measurements.floor.height, 0);
    addWall(container, components_measurements.wall.length/2, components_measurements.wall.height/2, 0, false);
    addWall(container, -components_measurements.wall.length/2, components_measurements.wall.height/2, 0, false);
    addWall(container, 0, components_measurements.wall.height/2, components_measurements.wall.length/2, true);
    addWall(container, 0, components_measurements.wall.height/2, -components_measurements.wall.length/2, true);

    scene.add(container);
    container.position.set(x,y,z);
}

function createPieces() {
    'use strict';

    pieceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var geometries = [
        new THREE.BoxGeometry(7, 7, 7),
        new THREE.DodecahedronGeometry(6),
        new THREE.IcosahedronGeometry(7),
        new THREE.TorusGeometry(4, 0.5),
        new THREE.TorusKnotGeometry(3, 0.7)
    ]

    var radiuses = [5, 6, 7, 4, 3];


    var piece_positions = [
        new THREE.Vector3(30, 0, -10),
        new THREE.Vector3(-20, 0, 10),
        new THREE.Vector3(20, 0, -40),
        new THREE.Vector3(-40, 0, 0),
        new THREE.Vector3(40, 0, 30)
    ]

    
    for (var i = 0; i < 5; i++) {
        piece_positions[i].y = radiuses[i];
        pieces.push(createObject(geometries[i], pieceMaterial, piece_positions[i], scene));
        pieces[i].userData = {radius: radiuses[i], inContainer: false};
    }

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

    for (var i = 0; i < 5; i++) {
        if (isColliding(crane.userData.top.userData.car.userData.claw, pieces[i]) && !pieces[i].userData.inContainer) {
            handleCollisions(pieces[i]);
            pieces[i].userData.inContainer = true;
        }
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

    if (clawPos.x > container.position.x && clawPos.z > container.position.z) {
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
    var car_posY = crane.userData.top.userData.car.getWorldPosition(new THREE.Vector3()).y;
    var claw_posY = crane.userData.top.userData.car.userData.claw.getWorldPosition(new THREE.Vector3()).y;
    var oldScale = crane.userData.top.userData.car.userData.claw.userData.cable.scale.y;
    var cable = crane.userData.top.userData.car.userData.claw.userData.cable;

    // Calculate new center: Claw - Car / 2
    cable.position.y = -(claw_posY - car_posY)/2;

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
        var oldPosition = claw.getWorldPosition(new THREE.Vector3()).y;
        claw.position.y += 25*dt;

        if (claw.position.y > claw.userData.maxH) claw.position.y = claw.userData.maxH;

        scaleCable(oldPosition);
    }
    if (claw.userData.down) {
        var oldPosition = claw.getWorldPosition(new THREE.Vector3()).y;
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
