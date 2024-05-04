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
var currentCamera, cam1, cam2, cam3, cam4;
var ring1, ring2, ring3, cylinder, skydome, Mobius;
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

    cam1 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam1.position.set(70, 70, 0); 
    cam1.lookAt(scene.position);
    scene.add(cam1);

    cam2 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam2.position.set(50, 0, 0); 
    cam2.lookAt(scene.position);
    scene.add(cam2);

    cam3 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam3.position.set(0, 0, 50); 
    cam3.lookAt(scene.position);
    scene.add(cam3);

    cam4 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    cam4.position.set(0, 50, 0); 
    cam4.lookAt(scene.position);
    scene.add(cam4);

    currentCamera = cam1;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function addAmbientLight() {
    ambientLight = new THREE.AmbientLight(0xffa500, 0.3);
    scene.add(ambientLight);
}

function addDirectionalLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 2);
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
    ring2.userData.mesh.material = ring2Materials[materialType];
    ring3.userData.mesh.material = ring3Materials[materialType];

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

function toggleLighting() {   
    cylinder.userData.mesh.material.lights = !cylinder.userData.mesh.material.lights;
    ring1.userData.mesh.material.lights = !ring1.userData.mesh.material.lights;
    ring2.userData.mesh.material.lights = !ring2.userData.mesh.material.lights;
    ring3.userData.mesh.material.lights = !ring3.userData.mesh.material.lights;

    for (var p in ring1.userData.parametrics) {
        ring1.userData.parametrics[p].userData.mesh.material.lights = !ring1.userData.parametrics[p].userData.mesh.material.lights;
    }
    for (p in ring2.userData.parametrics) {
        ring2.userData.parametrics[p].userData.mesh.material.lights = !ring2.userData.parametrics[p].userData.mesh.material.lights;
    }
    for (p in ring3.userData.parametrics) {
        ring3.userData.parametrics[p].userData.mesh.material.lights = !ring3.userData.parametrics[p].userData.mesh.material.lights;
    }
}

function toogleSpotlights(visible) {
    for (var s in ring1.userData.spotlights) {
        ring1.userData.spotlights[s].visible = visible;
    }
    for (s in ring2.userData.spotlights) {
        ring2.userData.spotlights[s].visible = visible;
    }
    for (s in ring3.userData.spotlights) {
        ring3.userData.spotlights[s].visible = visible;
    }
}

function createCylinder(x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry(5, 5, 5);
    CylinderMaterials = createMaterial(0x00ff00);
    cylinder = createObject(geometry, CylinderMaterials["Lambert"], new THREE.Vector3(x, y, z), scene);
}

function createRing(x, y, z, innerRadius, outerRadius, height, material) {
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
    var ring = createObject(geometry, material, new THREE.Vector3(x, y, z), scene);
    ring.rotateX(degToRad(90));
    
    ring.userData.up = false;
    ring.userData.down = false;
    ring.userData.step = 0.5;
    ring.userData.min = y;
    ring.userData.max = 40;
    ring.userData.iRadius = innerRadius;
    ring.userData.oRadius = outerRadius;
    ring.userData.parametrics = [];
    ring.userData.spotlights = [];

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

var twistedTorusParametric = function( u, v, target )
{
    var n = 50, t = 5, radius = 1, tubeRadius = 0.5;

    u *= 2*Math.PI;
    v *= 2*Math.PI;

    var r = tubeRadius*(Math.cos(v)**n + Math.sin(v)**n)**(-1/n),
            x = (radius+r*Math.cos(v+t*u)) * Math.cos(u),
            y = (radius+r*Math.cos(v+t*u)) * Math.sin(u),
            z = r*Math.sin(v+t*u);
	
  	target.set( x, y, z );
}

var kleinParametric = function (u, v, target) {
    var a = 0.8;
    var n = 0.8;
    var m = 2;

    var u = u * 4 * Math.PI;
    var v = v * 2 * Math.PI;

    var x = (a + Math.cos(n * u / 2.0) * Math.sin(v) - Math.sin(n * u / 2.0) * Math.sin(2 * v)) * Math.cos(m * u / 2.0);
    var y = (a + Math.cos(n * u / 2.0) * Math.sin(v) - Math.sin(n * u / 2.0) * Math.sin(2 * v)) * Math.sin(m * u / 2.0);
    var z = Math.sin(n * u / 2.0) * Math.sin(v) + Math.cos(n * u / 2.0) * Math.sin(2 * v);

    target.set(x, y, z);
}

//KINDA WORKING
var coneParametric = function(u, v, target) {
    var radius = 2; 
    var height = 5

    var x = radius * (1 - v) * Math.cos(u*2*Math.PI);
    var y = radius * (1 - v) * Math.sin(u*2*Math.PI);
    var z = height * v;

    target.set(x, y, z);
}

// KINDA WORKING
var taperedCylinderParametric = function(u, v, target) {
    const baseRadius = 0.8;
    const topRadius = 1.5;
    const height = 3;

    const radius = baseRadius + (topRadius - baseRadius) * v;

    const x = radius * Math.cos(u*2*Math.PI);
    const y = radius * Math.sin(u*2*Math.PI);
    const z = height * v;

    target.set(x, y, z);
}

// KINDA WORKING
var ruledHyperboloid = function(u, v, target) {
    const a = 0.1;
    const b = 0.1;
  
    const theta = u * Math.PI * 2;
    const phi = v * Math.PI;
  
    const x = a * Math.cos(theta) * Math.sinh(phi);
    const y = b * Math.sin(theta) * Math.sinh(phi);
    const z = phi;
  
    target.set(x, y, z);
  }

//KINDA WORKING
var cylinderParametric = function(u, v, target) {
    const radius = 1;
    const height = 3;

    const x = radius * Math.cos(u*2*Math.PI);
    const y = radius * Math.sin(u*2*Math.PI);
    const z = height * v;

    target.set(x, y, z);
}

//NOT WORKING
var mobiusParametric = function(u, v, target) {
    const phi = u * Math.PI * 2;
    const majorRadius = 4;
    const minorRadius = 1;

    const x = (majorRadius + minorRadius * Math.cos(v * Math.PI)) * Math.cos(phi);
    const y = (majorRadius + minorRadius * Math.cos(v * Math.PI)) * Math.sin(phi);
    const z = minorRadius * Math.sin(v * Math.PI);

    target.set(x, y, z);
}

function createSpotlight(position, target, obj) {
    var spotlight = new THREE.SpotLight(0xffffff, 1);

    spotlight.position.set(position.x, position.y, position.z);
    spotlight.target.position.set(target.position);
    //spotlight.angle = Math.PI / 4;

    obj.add(spotlight);

    return spotlight;
}

function createParemetrics(ring) {
    'use strict';

    var angleStep = Math.PI / 4;

    var parametricFunctions = [sphereParametric, torusParametric, taperedCylinderParametric, coneParametric, 
                                kleinParametric, cylinderParametric, ruledHyperboloid, twistedTorusParametric];

    for (var i = 0; i < 8; i++) {
        var angle = i * angleStep;

        var x = ring.position.x + Math.cos(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var y = ring.position.z + Math.sin(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var z = ring.position.y/2 - 5;

        var geometry = new ParametricGeometry(parametricFunctions[i], 50, 50);
        ParametricsMaterials = createMaterial(0xff0000);
        var obj = createObject(geometry, ParametricsMaterials["Lambert"], new THREE.Vector3(x, y, z), ring);
        ring.userData.parametrics.push(obj);

        var spot = createSpotlight(new THREE.Vector3(x, ring.position.y/2, z), new THREE.Vector3(x, y, z), ring);
        ring.userData.spotlights.push(spot);
    }
}

function createRings(x, y, z) {
    ring1Materials = createMaterial(0xffffff);
    ring2Materials = createMaterial(0xffd700);
    ring3Materials = createMaterial(0xff8c00);
    ring1 = createRing(x, y, z, 5, 10, 5, ring1Materials["Lambert"]);
    ring2 = createRing(x, y, z, 10, 15, 5, ring2Materials["Lambert"]);
    ring3 = createRing(x, y, z,15, 20, 5, ring3Materials["Lambert"]);
}

function createPointLight(x, y, z) {
    const light = new THREE.PointLight(0x00ff00, 1);
    light.position.set(x, y, z);
    scene.add(light);
    return light;
}

function createMobius(x, y, z) {
    var geometry = new ParametricGeometry(mobiusParametric, 50, 50);
    Mobius = createObject(geometry, ParametricsMaterials["Lambert"], new THREE.Vector3(x, y, z), scene);
    Mobius.rotateX(degToRad(90));
    Mobius.rotateZ(degToRad(90));

    for (let i = 0; i < 8; i++) {
        var t = (i / 8) * Math.PI * 2;
        var x = Math.cos(t) * 4;
        var y = 0;
        var z = Math.sin(t) * 4;
    
        createPointLight(x, y, z);
    }
}

function createCarousell(x, y, z) {
    createCylinder(x, y, z);
    createRings(x, y, z);
    createParemetrics(ring1);
    createParemetrics(ring2);
    createParemetrics(ring3);
    createMobius(x, y + 20, z);
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

    var vel = 0.01;

    for (var p in ring.userData.parametrics) {
        ring.userData.parametrics[p].rotation.x += vel;
        vel += 0.01;
    }
}

function update(){
    'use strict';

    cylinder.rotateY(degToRad(1));
    ring1.rotateZ(degToRad(0.5));
    ring2.rotateZ(degToRad(-0.7));
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

    renderer.render(scene, currentCamera);
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
            toggleLighting();
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
        case 'P':
        case 'p':
            toogleSpotlights(true);
            break;
        case 'S':
        case 's':
            toogleSpotlights(false);
            break;
        case "7":
            currentCamera = cam1;
            break;
        case "8":
            currentCamera = cam2;
            break;
        case "9":
            currentCamera = cam3;
            break;
        case "0":
            currentCamera = cam4;
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