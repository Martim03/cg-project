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
var crane, container, p1, p2, p3, p4, p5;
var clawHitbox, clawHV, p1Hitbox, p2Hitbox, p3Hitbox, p4Hitbox, p5Hitbox, p1HV, p2HV, p3HV, p4HV, p5HV;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    //scene.add(new THREE.AxesHelper(10));

    createCrane(0, 0, 0);
    createContainer( -10, 0, 30);
    createPieces();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';

    // FOV, aspect, near, far
    //TODO cam5 Orthogonal
    cam1 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam2 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam3 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam4 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam5 = new THREE.OrthographicCamera(70, window.innerWidth / window.innerHeight);

    cam1.position.set(150, 50, 0);
    cam2.position.set(0, 50, 150);
    cam3.position.set(0, 150, 0);
    cam4.position.set(-100, 50, 100);
    cam5.position.set(-150, 50, 150);
    
    cam1.lookAt(0, 50, 0);
    cam2.lookAt(0, 50, 0);
    cam3.lookAt(scene.position);
    cam4.lookAt(0, 50, 0);
    cam5.lookAt(0, 50, 0);

    scene.add(cam1);
    scene.add(cam2);
    scene.add(cam3);
    scene.add(cam4);
    scene.add(cam5);
    currentCamera = cam1;

    cameraMap = {
        '1': cam1,
        '2': cam2,
        '3': cam3,
        '4': cam4,
        '5': cam5,
        '6': cam6
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

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(10, 5, 10);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTower(obj, x, y, z) {
    'use strict';
    
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(5, 50, 5);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCabin(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(6, 6, 6);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addSpearHolder(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.ConeGeometry( 4, 20, 4 );
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateY(degToRad(45));
    obj.add(mesh);
}

function addFrontSpear(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(6, 5, 50);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addBackSpear(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(6, 5, -15);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCounterWeight(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(3, 10, -6);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCable(obj, x, y, z, size, angle) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.CylinderGeometry( 0.1, 0.1, size);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateX(degToRad(angle));
    obj.add(mesh);

    return mesh;
}

function addCar(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.BoxGeometry(3, 2, 3);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHand(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.CylinderGeometry( 8, 8, 4, 10); 
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFinger(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var geometry = new THREE.ConeGeometry( 3, 8, 4 );
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateZ(degToRad(180))
    obj.add(mesh);

    return mesh;
}

function addCamera(obj, x, y, z) {
    'use strict';

    cam6 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam6.position.set(x, y, z);
    cam6.lookAt(x, -50, z);
    obj.add(cam6)
}

function createClaw(obj, x, y, z) {
    'use strict';

    var claw = new THREE.Object3D();

    var cable = addCable(claw, 0, 15.5, 0, 27.5, 0);
    addHand(claw, 0, 0, 0);
    var f1 = addFinger(claw, 4, -4, 0);
    var f2 = addFinger(claw, -4, -4, 0);
    var f3 = addFinger(claw, 0, -4, 4);
    var f4 = addFinger(claw, 0, -4, -4);
    addCamera(claw, 0, -2, 0);

    claw.userData = {open: false, close: false, f1: f1, f2: f2, f3: f3, f4: f4, min: 0, max: 45, current: 0, cable: cable}
    obj.add(claw);
    claw.position.set(x,y,z);

    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    var geometry = new THREE.SphereGeometry(8);
    clawHV = new THREE.Mesh(geometry, material);
    clawHV.position.set(0, 0, 0);
    claw.add(clawHV);

    clawHitbox = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 8);

    return claw;
}

function createCar(obj, x, y, z) {
    'use strict';

    var car = new THREE.Object3D();

    addCar(car, 0, 0, 0);

    var claw = createClaw(car, 0, -30, 0);

    car.userData = {up: false, down: false, claw: claw, min: -50, max: -10}
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

    craneTop.userData = {slideFront: false, slideBack: false, car: car, min: 15, max: 45}
    obj.add(craneTop);
    craneTop.position.set(x, y, z);

    return craneTop;
}

function createCrane(x, y, z) {
    'use strict';
    
    crane = new THREE.Object3D();

    addBase(crane, 0, 0, 0);
    addTower(crane, 0, 27.5, 0);

    var craneTop = createCraneTop(crane, 0, 55.5, 0);

    crane.userData = { rotateLeft: false, rotateRight: false, top: craneTop};
    scene.add(crane);
    crane.position.set(x,y,z);
}

function addFloor(obj, x, y, z) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    var geometry = new THREE.BoxGeometry(20, 1, 20);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWall(obj, x, y, z, rotate) {
    'use strict';

    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    var geometry = new THREE.BoxGeometry(1, 10, 20);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (rotate) { mesh.rotateY(degToRad(90)); }
    obj.add(mesh);
}

function createContainer(x, y, z) {
    'use strict';

    container = new THREE.Object3D();

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

    p1 = new THREE.Object3D();
    p2 = new THREE.Object3D();
    p3 = new THREE.Object3D();
    p4 = new THREE.Object3D();
    p5 = new THREE.Object3D();

    var material1 = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var mesh = new THREE.Mesh(geometry, material1);
    p1.add(mesh);

    var material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    var geometry = new THREE.DodecahedronGeometry(4);
    var mesh = new THREE.Mesh(geometry, material2);
    p2.add(mesh);

    var material3 = new THREE.MeshBasicMaterial({ color: 0xf00f00, wireframe: true });
    var geometry = new THREE.IcosahedronGeometry(4);
    var mesh = new THREE.Mesh(geometry, material3);
    p3.add(mesh);

    var material4 = new THREE.MeshBasicMaterial({ color: 0xf0000f, wireframe: true });
    var geometry = new THREE.TorusGeometry(4, 0.5);
    var mesh = new THREE.Mesh(geometry, material4);
    mesh.rotateX(degToRad(90));
    p4.add(mesh);

    var material5 = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    var geometry = new THREE.TorusKnotGeometry(3, 0.7);
    var mesh = new THREE.Mesh(geometry, material5);
    p5.add(mesh);


    scene.add(p1);
    scene.add(p2);
    scene.add(p3);
    scene.add(p4);
    scene.add(p5);

    p1.position.set(30, 0, -10);
    p2.position.set(-20, 0, 10);
    p3.position.set(20, 0, -40);
    p4.position.set(-40, 0, 0);
    p5.position.set(40, 0, 30);

    p1Hitbox = new THREE.Sphere(p1.position, 4);
    p2Hitbox = new THREE.Sphere(p2.position, 4);
    p3Hitbox = new THREE.Sphere(p3.position, 4);
    p4Hitbox = new THREE.Sphere(p4.position, 4);
    p5Hitbox = new THREE.Sphere(p5.position, 4);

    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    var geometry = new THREE.SphereGeometry(4);
    p1HV = new THREE.Mesh(geometry, material);
    p1HV.position.set(p1.position.x, p1.position.y, p1.position.z);
    scene.add(p1HV);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    var geometry = new THREE.SphereGeometry(4);
    p2HV = new THREE.Mesh(geometry, material);
    p2HV.position.set(p2.position.x, p2.position.y, p2.position.z);
    scene.add(p2HV);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    var geometry = new THREE.SphereGeometry(4);
    p3HV = new THREE.Mesh(geometry, material);
    p3HV.position.set(p3.position.x, p3.position.y, p3.position.z);
    scene.add(p3HV);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    var geometry = new THREE.SphereGeometry(4);
    p4HV = new THREE.Mesh(geometry, material);
    p4HV.position.set(p4.position.x, p4.position.y, p4.position.z);
    scene.add(p4HV);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    var geometry = new THREE.SphereGeometry(4);
    p5HV = new THREE.Mesh(geometry, material);
    p5HV.position.set(p5.position.x, p5.position.y, p5.position.z);
    scene.add(p5HV);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

    if (clawHitbox.intersectsSphere(p1Hitbox)){
        handleCollisions(p1);
    } else if (clawHitbox.intersectsSphere(p2Hitbox)) {
        handleCollisions(p2);
    } else if (clawHitbox.intersectsSphere(p3Hitbox)) {
        handleCollisions(p3);
    } else if (clawHitbox.intersectsSphere(p4Hitbox)) {
        handleCollisions(p4);
    } else if (clawHitbox.intersectsSphere(p5Hitbox)) {
        handleCollisions(p5);
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(piece){
    'use strict';

    console.log("HIT: " + piece);
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    var craneTop = crane.userData.top;
    var car = craneTop.userData.car;
    var claw = car.userData.claw;

    clawHitbox.center = claw.getWorldPosition(new THREE.Vector3);
    clawHV.center = claw.getWorldPosition(new THREE.Vector3);
    //clawHV.visible = false;

    checkCollisions();
}

/////////////
/* DISPLAY */
/////////////
function updateHUDText() {
    var hudText = document.getElementById('hudText');
    hudText.innerHTML = '<p>Press 0 to toggle wireframe mode</p>' +
                        '<p>Press Q to rotate the crane left</p>' +
                        '<p>Press A to rotate the crane right</p>' +
                        '<p>Press W to slide the car to the front</p>' + 
                        '<p>Press S to slide the car to the back</p>' +
                        '<p>Press E to lift the claw</p>' +
                        '<p>Press D to descend the claw</p>' +
                        '<p>Press R to open the claw</p>' +
                        '<p>Press F to close the claw</p>' +
                        '<p>Press [1-6] to switch between cameras</p>';
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

    hud.appendChild(hudText);
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

    createScene();
    createCameras();
    createHUD();

    render();

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function scaleCable(oldClaw_posY) {
    var car_posY = crane.userData.top.userData.car.position.y;
    var claw_posY = crane.userData.top.userData.car.userData.claw.position.y;
    var oldScale = crane.userData.top.userData.car.userData.claw.userData.cable.scale.y;

    // Calculate new center: Claw - Car / 2
    crane.userData.top.userData.car.userData.claw.userData.cable.position.y = -(claw_posY - car_posY)/2;

    
    // Calculate Scale: NewSize * OldScale / OldSize (regra de 3 simples)
    crane.userData.top.userData.car.userData.claw.userData.cable.scale.y = (oldScale * (claw_posY - car_posY)) / (oldClaw_posY - car_posY)
}

function openClaw(claw) {
    claw.userData.f1.rotateZ(-degToRad(1));
    claw.userData.f2.rotateZ(degToRad(1));
    claw.userData.f3.rotateX(-degToRad(1));
    claw.userData.f4.rotateX(degToRad(1));
}

function closeClaw(claw) {
    claw.userData.f1.rotateZ(degToRad(1));
    claw.userData.f2.rotateZ(-degToRad(1));
    claw.userData.f3.rotateX(degToRad(1));
    claw.userData.f4.rotateX(-degToRad(1));
}

function animate() {
    'use strict';

    update();

    var craneTop = crane.userData.top;
    var car = craneTop.userData.car;
    var claw = car.userData.claw;

    if (crane.userData.rotateLeft) {
        crane.userData.top.rotateY(degToRad(1));
    } else if (crane.userData.rotateRight) {
        crane.userData.top.rotateY(-degToRad(1));
    }

    if (craneTop.userData.slideFront && car.position.z <= craneTop.userData.max) {
        car.position.z += 1
    } else if (craneTop.userData.slideBack  && car.position.z >= craneTop.userData.min) {
        car.position.z -= 1
    }

    if (car.userData.up && claw.position.y <= car.userData.max) {
        var oldPosition = claw.position.y;
        claw.position.y += 1;
        scaleCable(oldPosition);
    } else if (car.userData.down && claw.position.y >= car.userData.min) {
        var oldPosition = claw.position.y;
        claw.position.y -= 1;
        scaleCable(oldPosition);
    }

    if (claw.userData.open && claw.userData.current <= claw.userData.max) {
        openClaw(claw);
        claw.userData.current += 1;
    } else if (claw.userData.close && claw.userData.current >= claw.userData.min) {
        closeClaw(claw);
        claw.userData.current -= 1;
    }

    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    
    renderer.setSize(window.innerWidth, window.innerHeight);

    if(window.innerHeight > 0 && window.innerWidth > 0) {
        //TODO
        //camera.aspect = renderer.getSize().width/renderer.getSize().height;
        //camera.updateProjectionMatrix;
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    console.log(e.key);

    if (e.key in cameraMap) {
        currentCamera = cameraMap[e.key];
    }

    switch (e.key) {
        case '0':
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            break;

        case 'Q':
        case 'q':
            crane.userData.rotateLeft = true;
            break;
        case 'A':
        case 'a':
            crane.userData.rotateRight = true;
            break;
        case 'W':
        case 'w':
            crane.userData.top.userData.slideFront = true;
            break;
        case 'S':
        case 's':
            crane.userData.top.userData.slideBack = true;
            break;
        case 'E':
        case 'e':
            crane.userData.top.userData.car.userData.up = true;
            break;
        case 'D':
        case 'd':
            crane.userData.top.userData.car.userData.down = true;
            break;
        case 'R':
        case 'r':
            crane.userData.top.userData.car.userData.claw.userData.open = true;
            break;
        case 'F':
        case 'f':
            crane.userData.top.userData.car.userData.claw.userData.close = true;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.key) {
        case 'Q':
        case 'q':
            crane.userData.rotateLeft = false;
            break;
        case 'A':
        case 'a':
            crane.userData.rotateRight = false;
            break;
        case 'W':
        case 'w':
            crane.userData.top.userData.slideFront = false;
            break;
        case 'S':
        case 's':
            crane.userData.top.userData.slideBack = false;
            break;    
        case 'E':
        case 'e':
            crane.userData.top.userData.car.userData.up = false;
            break;
        case 'D':
        case 'd':
            crane.userData.top.userData.car.userData.down = false;
            break;
        case 'R':
        case 'r':
            crane.userData.top.userData.car.userData.claw.userData.open = false;
            break;
        case 'F':
        case 'f':
            crane.userData.top.userData.car.userData.claw.userData.close = false;
            break;
    }
}

init();
update();
animate();

console.log("STARTING...")