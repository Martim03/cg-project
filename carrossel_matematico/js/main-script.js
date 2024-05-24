import * as THREE from 'three';
import { MathUtils } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from 'three/addons/geometries/ParametricGeometries.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;
var ring1, ring2, ring3, cylinder, skydome, mobius;
var ambientLight, directionalLight, lighting = true;
var ring1Materials, ring2Materials, ring3Materials, CylinderMaterials, MobiusMaterials, ParametricsMaterials, currentMaterial = "Lambert";
var clock = new THREE.Clock();

const measurements = {
    cylinder: {radius: 5, height: 30},
    ring1: {oRadius: 10, iRadius: 5, height: 5},
    ring2: {oRadius: 15, iRadius: 10, height: 5},
    ring3: {oRadius: 20, iRadius: 15, height: 5},
    skydome: {radius: 100},
    mobius: {flight: 15, scale: 10},
}

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

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    camera.position.set(70, 60, 0); 
    camera.lookAt(scene.position.x, scene.position.y+20, scene.position.z);
    scene.add(camera);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function addAmbientLight() {
    ambientLight = new THREE.AmbientLight(0xffa500, 0.5);
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
    //let lambert = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide})
    //lambert.shading = THREE.FlatShading;
    var list = {
        "Lambert": new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide}),
        "Phong": new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide}),
        "Toon": new THREE.MeshToonMaterial({ color: color, side: THREE.DoubleSide}),
        "Normal": new THREE.MeshNormalMaterial({side: THREE.DoubleSide}),
        "Basic": new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide})
    }

    return list;
}

function getRandomHexColor() {
    const randomColorComponent = () => Math.floor(Math.random() * 256);
    let red, green, blue;

    do {
        red = randomColorComponent();
        green = randomColorComponent();
        blue = randomColorComponent();
    } while (red + green + blue < 383);

    const toHex = (component) => component.toString(16).padStart(2, '0');

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function switchMaterial(materialType) {
    currentMaterial = materialType;
    if (!lighting) { materialType = "Basic"; }
    cylinder.userData.mesh.material = CylinderMaterials[materialType];
    mobius.userData.mesh.material = MobiusMaterials[materialType];
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
    lighting = !lighting;

    switchMaterial(currentMaterial);
}

function toggleSpotlights(visible) {
    for (var s in ring1.userData.spotlights) {
        ring1.userData.spotlights[s].visible = visible;
    }
    for (s in ring2.userData.spotlights) {
        ring2.userData.spotlights[s].visible = visible;
    }
    for (s in ring3.userData.spotlights) {
        ring3.userData.spotlights[s].visible = visible;
    }
    for (s in mobius.userData.pointlights) {
        mobius.userData.pointlights[s].visible = visible;
    }
}

function createCylinder(x, y, z) {
    'use strict';

    var geometry = new THREE.CylinderGeometry(measurements.cylinder.radius, measurements.cylinder.radius, measurements.cylinder.height);
    CylinderMaterials = createMaterial(getRandomHexColor());
    cylinder = createObject(geometry, CylinderMaterials["Lambert"], new THREE.Vector3(x, y+measurements.cylinder.height/2, z), scene);
}

function createRing(x, y, z, ringMeasurements, material) {
    'use strict';

    var shape = new THREE.Shape();
    shape.absarc(0, 0, ringMeasurements.oRadius, 0, Math.PI * 2, false);
    var hole = new THREE.Path();
    hole.absarc(0, 0, ringMeasurements.iRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    var extrudeSettings = {
        steps: 2, // Number of steps along the extrusion path
        depth: ringMeasurements.height, // The depth of the extrusion
        bevelEnabled: false, // Disable beveling to maintain a sharp edge
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var ring = createObject(geometry, material, new THREE.Vector3(x, y, z), scene);
    ring.rotateX(Math.PI/2);
    ring.position.y += ringMeasurements.height;
    
    ring.userData.up = true;
    ring.userData.moving = false;
    ring.userData.min = ring.position.y;
    ring.userData.max = measurements.cylinder.height;
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

function createSpotlight(position, obj) {
    var spotlight = new THREE.SpotLight(0xffffff, 10);

    obj.add(spotlight);

    spotlight.position.set(position.x, position.y, position.z);
    spotlight.angle = Math.PI;

    //var helper = new THREE.SpotLightHelper(spotlight);
    //scene.add(helper);

    return spotlight;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createParametrics(ring, color, ringMeasurements) {
    'use strict';

    var parametricFunctions = [sphereParametric, torusParametric, taperedCylinderParametric, coneParametric, 
                                kleinParametric, cylinderParametric, ruledHyperboloid, twistedTorusParametric];

    parametricFunctions = shuffleArray(parametricFunctions);

    for (var i = 0; i < parametricFunctions.length; i++) {
        var angle = i * (2*Math.PI/parametricFunctions.length);
        
        var x = ring.position.x + Math.cos(angle) * (ringMeasurements.iRadius + (ringMeasurements.oRadius - ringMeasurements.iRadius) / 2);
        var y = ring.position.z + Math.sin(angle) * (ringMeasurements.iRadius + (ringMeasurements.oRadius - ringMeasurements.iRadius) / 2);
        var z = ring.position.y/2 - 5;

        var geometry = new ParametricGeometry(parametricFunctions[i], 50, 50);
        ParametricsMaterials = createMaterial(color);
        var obj = createObject(geometry, ParametricsMaterials["Lambert"], new THREE.Vector3(x, y, z), ring);
        ring.userData.parametrics.push(obj);

        obj.rotateX(MathUtils.randInt(0, Math.PI*2));
        
        var spot = createSpotlight(new THREE.Vector3(x, y, z+2), ring);
        ring.userData.spotlights.push(spot);
    }
}

function createRings(x, y, z) {
    ring1Materials = createMaterial(getRandomHexColor());
    ring2Materials = createMaterial(getRandomHexColor());
    ring3Materials = createMaterial(getRandomHexColor());
    ring1 = createRing(x, y, z, measurements.ring1, ring1Materials["Lambert"]);
    ring2 = createRing(x, y, z, measurements.ring2, ring2Materials["Lambert"]);
    ring3 = createRing(x, y, z, measurements.ring3, ring3Materials["Lambert"]);
}


function createPointLight(obj, x, y, z) {
    const light = new THREE.PointLight(0xffffff, 10);
    light.position.set(x, y, z);
    obj.add(light);

    //const helper = new THREE.PointLightHelper(light, 1);
    //obj.add(helper);

    return light;
}


function createMobius(x, y, z) {
    const segments = 100;
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;

        for (let v = -1; v <= 1; v += 2) {
            const px = measurements.mobius.scale * (Math.cos(u) * (1 + (v / 2) * Math.cos(u / 2)));
            const py = measurements.mobius.scale * (Math.sin(u) * (1 + (v / 2) * Math.cos(u / 2)));
            const pz = measurements.mobius.scale * ((v / 2) * Math.sin(u / 2));

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

    MobiusMaterials = createMaterial(getRandomHexColor());
    mobius = createObject(geometry, MobiusMaterials["Lambert"], new THREE.Vector3(x, y, z), scene);
    mobius.rotateX(Math.PI/2);
    mobius.userData.pointlights = [];

    for (let i = 0; i < 8; i++) {
        const t = (i / 8) * Math.PI * 2;
        const lightX = Math.cos(t) * measurements.mobius.scale + 1;
        const lightY = Math.sin(t) * measurements.mobius.scale + 1;
        const lightZ = 0;

        var light = createPointLight(mobius, lightX, lightY, lightZ);
        mobius.userData.pointlights.push(light);
    }
}

function createCarousell(x, y, z) {
    createCylinder(x, y, z);
    createRings(x, y, z);

    let parametricColor = getRandomHexColor();
    createParametrics(ring1, parametricColor, measurements.ring1);
    createParametrics(ring2, parametricColor, measurements.ring2);
    createParametrics(ring3, parametricColor, measurements.ring3);
    createMobius(x, measurements.cylinder.height+measurements.mobius.flight, z);
}

function createSkyDome(x, y, z) {
    'use strict';

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const texture = loader.load('./js/frame_louco.png');

    const geometry = new THREE.SphereGeometry(100, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    });

    skydome = new THREE.Mesh(geometry, material);
    skydome.position.set(x, y, z);
    skydome.rotateY(Math.PI);

    scene.add(skydome);
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    animate();
    render();
    //requestAnimationFrame(update);
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
        ring.userData.parametrics[p].rotation.y += 2.5 * dt;
    }
}

function animate() {
    'use strict';
    const dt = clock.getDelta();

    if (ring1.userData.moving) {
        moveRing(ring1, dt);
    }

    if (ring2.userData.moving) {
        moveRing(ring2, dt);
    }

    if (ring3.userData.moving) {
        moveRing(ring3, dt);
    }

    
    cylinder.rotation.y += 1 * dt;
    ring1.rotation.z += 1 * dt;
    ring2.rotation.z += 1 * dt;
    ring3.rotation.z += 1 * dt;

    rotateParametrics(ring1, dt);
    rotateParametrics(ring2, dt);
    rotateParametrics(ring3, dt);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if(window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
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
            toggleSpotlights(true);
            break;
        case 'S':
        case 's':
            toggleSpotlights(false);
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
//update();
renderer?.setAnimationLoop(update);

console.log("STARTING...")