import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { degToRad, randInt } from 'three/src/math/MathUtils.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from 'three/addons/geometries/ParametricGeometries.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;
var currentCamera, cam1, cam2, cam3, cam4;
var ring1, ring2, ring3, cylinder, skydome, Mobius;
var ambientLight, directionalLight;
var ring1Materials, ring2Materials, ring3Materials, CylinderMaterials, MobiusMaterials, ParametricsMaterials;
var clock = new THREE.Clock();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    createCarousell(0, 0, 0);
    createSkyDome(0, 0, 0);
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
    directionalLight.position.set(0, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    //const helper = new THREE.DirectionalLightHelper(directionalLight, 10);
    //scene.add(helper);
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
        "Lambert": new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide}),
        "Phong": new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide}),
        "Toon": new THREE.MeshToonMaterial({ color: color, side: THREE.DoubleSide}),
        "Normal": new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
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
    
    ring.userData.up = true;
    ring.userData.moving = false;
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

var coneParametric = function(u, v, target) {
    var radius = 2; 
    var height = 5

    var x = radius * (1 - v) * Math.cos(u*2*Math.PI);
    var y = radius * (1 - v) * Math.sin(u*2*Math.PI);
    var z = height * v;

    target.set(x, y, z);
}

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

var cylinderParametric = function(u, v, target) {
    const radius = 1;
    const height = 3;

    const x = radius * Math.cos(u*2*Math.PI);
    const y = radius * Math.sin(u*2*Math.PI);
    const z = height * v;

    target.set(x, y, z);
}

//NOT WORKING
var mobiusParametric = function (u, v, target) {
    u = u * Math.PI * 2;  // Parameter u ranges from 0 to 2π
    v = v * 2 * Math.PI;        // Parameter t ranges from -1 to 1
    
    const a = 5;  // Radius of the Möbius strip
    const half_width = 3;
    const x = (a + half_width*Math.cos(v/2))*Math.cos(u);
    const y = (a + half_width*Math.cos(v/2))*Math.sin(u);
    const z = half_width*Math.sin(v/2);

    target.set(x, y, z);
}

function createSpotlight(position, target, obj) {
    var spotlight = new THREE.SpotLight(0xffffff, 5);

    spotlight.position.set(position.x, position.y, position.z);
    spotlight.target.position.set(target.x, target.y, target.z);

    obj.add(spotlight);
    obj.add(spotlight.target);

    //var helper = new THREE.SpotLightHelper(spotlight);
    //obj.add(helper);

    return spotlight;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createParametrics(ring) {
    'use strict';

    var parametricFunctions = [sphereParametric, torusParametric, taperedCylinderParametric, coneParametric, 
                                kleinParametric, cylinderParametric, ruledHyperboloid, twistedTorusParametric];

    parametricFunctions = shuffleArray(parametricFunctions);

    for (var i = 0; i < parametricFunctions.length; i++) {
        var angle = i * (2*Math.PI/parametricFunctions.length);

        var x = ring.position.x + Math.cos(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var y = ring.position.z + Math.sin(angle) * (ring.userData.iRadius + (ring.userData.oRadius - ring.userData.iRadius) / 2);
        var z = ring.position.y/2 - 5;

        var geometry = new ParametricGeometry(parametricFunctions[i], 50, 50);
        ParametricsMaterials = createMaterial(0xff0000);
        var obj = createObject(geometry, ParametricsMaterials["Lambert"], new THREE.Vector3(x, y, z), ring);
        ring.userData.parametrics.push(obj);

        obj.userData.axis = randInt(1, 3);

        var spot = createSpotlight(new THREE.Vector3(x, z+5, y), new THREE.Vector3(x, z, y), ring);
        ring.userData.spotlights.push(spot);
    }
}

function createRings(x, y, z) {
    ring1Materials = createMaterial(0xffffff);
    ring2Materials = createMaterial(0xffd700);
    ring3Materials = createMaterial(0xff8c00);
    ring1 = createRing(x, y, z, 5, 10, 5, ring1Materials["Lambert"]);
    ring2 = createRing(x, y, z, 10, 15, 5, ring2Materials["Lambert"]);
    ring3 = createRing(x, y, z, 15, 20, 5, ring3Materials["Lambert"]);
}


function createPointLight(obj, x, y, z) {
    const light = new THREE.PointLight(0xffffff, 5);
    light.position.set(x, y, z);
    obj.add(light);

    //const helper = new THREE.PointLightHelper(light, 1);
    //obj.add(helper);

    return light;
}


function createMobius(x, y, z) {
    const segments = 100;
    const scale = 5;
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;

        for (let v = -1; v <= 1; v += 2) {
            const px = scale * (Math.cos(u) * (1 + (v / 2) * Math.cos(u / 2)));
            const py = scale * (Math.sin(u) * (1 + (v / 2) * Math.cos(u / 2)));
            const pz = scale * ((v / 2) * Math.sin(u / 2));

            vertices.push(px, py, pz);
        }
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2 ;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;

        indices.push(a, b, d);
        indices.push(a, d, c);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = createMaterial(0xff0000)["Lambert"];
    const mobius = createObject(geometry, material, new THREE.Vector3(x, y, z), scene);
    mobius.rotateX(degToRad(90));

    for (let i = 0; i < 8; i++) {
        const t = (i / 8) * Math.PI * 2;
        const lightX = Math.cos(t) * scale;
        const lightY = 0;
        const lightZ = Math.sin(t) * scale;

        createPointLight(mobius, lightX, lightY, lightZ);
    }
}

function createCarousell(x, y, z) {
    createCylinder(x, y, z);
    createRings(x, y, z);
    createParametrics(ring1);
    createParametrics(ring2);
    createParametrics(ring3);
    createMobius(x, y + 20, z);
}

function createSkyDome(x, y, z) {
    'use strict';

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const texture = loader.load('./js/frame_louco.png');

    const geometry = new THREE.SphereGeometry(100);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide  // Render the inside of the sphere
    });

    skydome = new THREE.Mesh(geometry, material);
    skydome.position.set(x, y, z);
    skydome.rotateY(160);

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

function moveRing(ring, dt) {
    if (ring.userData.up) {
        ring.position.y += 40 * dt;

        if (ring.position.y > ring.userData.max) {
            ring.position.y = ring.userData.max;
            ring.userData.up = false;
        }
    } else {
        ring.position.y -= 40 * dt;

        if (ring.position.y < ring.userData.min) {
            ring.position.y = ring.userData.min;
            ring.userData.up = true;
        }
    }
}

function rotateParametrics(ring, dt) {
    'use strict';

    for (var p in ring.userData.parametrics) {
        switch (ring.userData.parametrics[p].userData.axis) {
            case 1:
                ring.userData.parametrics[p].rotation.x += 2.5 * dt;
                break;
            case 2:
                ring.userData.parametrics[p].rotation.y += 2.5 * dt;
                break;
            case 3:
                ring.userData.parametrics[p].rotation.z += 2.5 * dt;
                break;
        }
    }
}

function animate() {
    'use strict';
    const dt = clock.getDelta();

    update();

    if (ring1.userData.moving) {
        moveRing(ring1, dt);
    }

    if (ring2.userData.moving) {
        moveRing(ring2, dt);
    }

    if (ring3.userData.moving) {
        moveRing(ring3, dt);
    }

    
    cylinder.rotation.y = 1 * dt;
    ring1.rotation.z += 1 * dt;
    ring2.rotation.z += 1 * dt;
    ring3.rotation.z += 1 * dt;

    rotateParametrics(ring1, dt);
    rotateParametrics(ring2, dt);
    rotateParametrics(ring3, dt);

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
    
    if(window.innerHeight > 0 && window.innerWidth > 0) {
        //camera.aspect = window.innerWidth/window.innerHeight;
        //camera.updateProjectionMatrix();
        cam1.aspect = window.innerWidth/window.innerHeight;
        cam1.updateProjectionMatrix();
        cam2.aspect = window.innerWidth/window.innerHeight;
        cam2.updateProjectionMatrix();
        cam3.aspect = window.innerWidth/window.innerHeight;
        cam3.updateProjectionMatrix();
        cam4.aspect = window.innerWidth/window.innerHeight;
        cam4.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    switch (e.key) {
        case "1":
            ring1.userData.moving = true;
            break;
        case "2":
            ring2.userData.moving = true;
            break;
        case "3":
            ring3.userData.moving = true;
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
            ring1.userData.moving = false;
            break;
        case "2":
            ring2.userData.moving = false;
            break;
        case "3":
            ring3.userData.moving = false;
            break;
        }
}

init();
animate();

console.log("STARTING...")