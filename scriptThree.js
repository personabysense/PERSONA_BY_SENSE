import * as THREE from '../build/three.module.js';

import Stats from './libs/stats.module.js';
import { GUI } from './libs/dat.gui.module.js';

import { GLTFLoader } from './GLTFLoader.js';

let container, stats, clock, gui, mixer, actions, activeAction, previousAction;
let camera, scene, renderer, model, face;
let tween;

const api = { state: 'Nla_neutro' };

let neutralValue = [];
let happyValue = [];
let sadValue = [];
let surprisedValue = [];
let angryValue = [];
let fearfulValue = [];
let disgustedValue = [];
let maxValue = [];

//contatore tempo emozioni
let countHappy = 0;
let countSad = 0;
let countSurprised = 0;
let countAngry = 0;
let countFearful = 0;
let countDisgusted = 0;
let countNeutral = 0;
let countTotal;
let jsarray = [];

//treshold emozione
let count = 0;
let emo;

init();

function init() {

  /*---------------------------------Face Api-------------------------------*/

  let activeEmo;
  let prevEmo;

  const video = document.getElementById('video')

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startVideo)

  function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }

  video.addEventListener('play', () => {

    const displaySize = { width: video.width, height: video.height }

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      neutralValue = [resizedDetections[0].expressions.neutral];
      happyValue = [resizedDetections[0].expressions.happy];
      sadValue = [resizedDetections[0].expressions.sad];
      surprisedValue = [resizedDetections[0].expressions.surprised];
      angryValue = [resizedDetections[0].expressions.angry];
      fearfulValue = [resizedDetections[0].expressions.fearful];
      disgustedValue = [resizedDetections[0].expressions.disgusted];

      maxValue = Math.max(neutralValue,happyValue,sadValue,surprisedValue,angryValue,fearfulValue,disgustedValue);

    }, 100)
  })


  /*-----------------------------------Three--------------------------------*/
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xFFFFFF );

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
  camera.position.set( 0, 0, 40 );
  camera.lookAt( 0, 0, 0 );

  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  // renderer.outputEncoding = THREE.sRGBEncoding;
  // document.body.appendChild(renderer.domElement);

  window.addEventListener( 'resize', onWindowResize );

  // stats
  // stats = new Stats();
  // container.appendChild( stats.dom );

  // lights

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff );
  hemiLight.position.set( 0, 0, 0 );
  scene.add( hemiLight );

  const dirLight = new THREE.DirectionalLight( 0xffffff );
  dirLight.position.set( -10, 10, 10 );
  const helper = new THREE.DirectionalLightHelper( dirLight, 5 );
  // scene.add( helper );
  scene.add( dirLight );


  // model

  const loader = new GLTFLoader();
  loader.load( '/maskk.glb', function ( gltf ) {

    model = gltf.scene;
    model.position.set(0, 0, 0);

    model.traverse((o) => {
      if (o.isMesh) {
        // o.material.emissive = new THREE.Color( 0x0064fb );
        o.material.color.set( 0x6e717b );

        // o.material.wireframe = true;
        o.material.transparent = true;
        o.material.opacity = 0.9;
      }
    });

    scene.add( model );

    createGUI( model, gltf.animations );

  }, undefined, function ( e ) {

    console.error( e );

  } );



  function createGUI( model, animations ) {


    const states = [ 'Nla_neutro', 'Nla_gioia', 'Nla_tristezza', 'Nla_sorpresa', 'Nla_rabbia', 'Nla_paura', 'Nla_disgusto'];

    gui = new GUI();

    mixer = new THREE.AnimationMixer( model );

    actions = {};

    for ( let i = 0; i < animations.length; i ++ ) {

      const clip = animations[ i ];
      const action = mixer.clipAction( clip );
      actions[ clip.name ] = action;

    }

    // states

    const statesFolder = gui.addFolder( 'States' );

    const clipCtrl = statesFolder.add( api, 'state' ).options( states );

    clipCtrl.onChange( function () {

      fadeToAction( api.state, 0.5 );

    } );

    statesFolder.open();


    activeAction = actions[ 'Nla_neutro' ];
    activeAction.play();


  }

  function fadeToAction( name, duration ) {

    previousAction = activeAction;
    activeAction = actions[ name ];

    if ( previousAction !== activeAction ) {

      previousAction.fadeOut( duration );

    }

    activeAction
    .reset()
    .setEffectiveTimeScale( 1 )
    .setEffectiveWeight( 1 )
    .fadeIn( duration )
    .play();

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }


  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    const dt = clock.getDelta();

    if ( mixer ) mixer.update( dt );

    renderer.render(scene, camera);

    requestAnimationFrame(render);

    /*-------------------------emozions----------------------------*/

    if ( prevEmo !== activeEmo ) {
      count = 0;
    }

    /*-------------neutral----------------*/
    if (maxValue == neutralValue){
      prevEmo = activeEmo;
      activeEmo = "neutral";
      count++;


      if ( count == 5) {
        emo = "NEUTRO"
        fadeToAction ('Nla_neutro', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0x6e717b );
          }
        });

      }
    }


    /*-------------happy----------------*/
    if (maxValue==happyValue){
      prevEmo = activeEmo;
      activeEmo = "happy";
      countHappy++;
      count++;


      if ( count == 5) {
        emo = "GIOIA"
        fadeToAction ('Nla_gioia', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0xf8a221 );
          }
        });

      }
    }

    /*-------------sad----------------*/
    if (maxValue==sadValue){
      prevEmo = activeEmo;
      activeEmo = "sad";
      countSad++;
      count++;


      if ( count == 5) {
        emo = "TRISTEZZA"
        fadeToAction ('Nla_tristezza', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0x0d4598 );
          }
        });

      }
    }

    /*-------------surprised----------------*/
    if (maxValue==surprisedValue){
      prevEmo = activeEmo;
      activeEmo = "surprised";
      countSurprised++;
      count++;


      if ( count == 5) {
        emo = "SORPRESA"
        fadeToAction ('Nla_sorpresa', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0x0dbff6 );
          }
        });

      }
    }


    /*---------------angry--------------*/
    if (maxValue==angryValue){
      prevEmo = activeEmo;
      activeEmo = "angry";
      countAngry++;
      count++;


      if ( count == 5) {
        emo = "RABBIA"
        fadeToAction ('Nla_rabbia', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0xea1b1b );
          }
        });

      }
    }

    /*-------------fearful----------------*/
    if (maxValue==fearfulValue){
      prevEmo = activeEmo;
      activeEmo = "fearful";
      countFearful++;
      count++;


      if ( count == 5) {
        emo = "PAURA"
        fadeToAction ('Nla_paura', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0x7a49c8 );
          }
        });

      }
    }

    /*-------------disgusted----------------*/
    if (maxValue==disgustedValue){
      prevEmo = activeEmo;
      activeEmo = "disgusted";
      countDisgusted++;
      count++;


      if ( count == 5) {
        emo = "DISGUSTO"
        fadeToAction ('Nla_disgusto', 0.5);

        model.traverse((o) => {
          if (o.isMesh) {
            o.material.color.set( 0x09b879 );
          }
        });

      }
    }

    //emoTxt
    document.getElementById("emoTxt").innerHTML = emo;


    console.log(prevEmo, activeEmo);

    // TWEEN.update();
    // stats.update();
  }

  requestAnimationFrame(render);

}
