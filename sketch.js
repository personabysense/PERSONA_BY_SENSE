let w = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

let h = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

//prendi variabili dal setup
// let arraySetup = JSON.parse(sessionStorage.getItem("arraySetup"));
// let username = arraySetup[0];
// let data = arraySetup[1];

//sensori
var serial;                                 // variable to hold an instance of the serialport library
var portName = '/dev/tty.usbmodem14301';  // fill in your serial port name here
let hrv;
let gsr;

let incBpm = 0;
let incBpm2 = 0;
let incGsr = 0;
let slider;


//barra
var barWidth = 0;
let barPercent;
let barPercent2;

let barPercent0;

var barWidth0 = 0;


function setup() {

  // crea il canvas dove verrà disegnata la maschera
  // let cnv = createCanvas(210, 210);
  // cnv.parent("graphContainer");

}

function draw() {


//loadingPage
  if (barWidth0<50){
    barWidth0++;
  }
  else if(barWidth0>=50){
    barWidth0 = barWidth0;
  }


  //barra di caricamento
  if (barWidth<3600){
    barWidth++;
  }
  else if(barWidth>=3600){
    barWidth = barWidth;
  }
  // console.log(barWidth);
  barPercent = map(barWidth,0,3600,0,100);
  barPercent2 = nfc(barPercent,0);

  // barPercent0 = map(barWidth0,0,50,0,100); //loadingPage
  // if(barPercent0==10){
  //   document.getElementById("textLoad").innerHTML = "Inizializzazione script...";
  // }
  // if(barPercent0==50){
  //   document.getElementById("textLoad").innerHTML = "Calibrazione sensori...";
  // }
  // if(barPercent0==70){
  //   document.getElementById("textLoad").innerHTML = "Caricamento emozioni...";
  // }

  let root = document.documentElement;
  root.style.setProperty('--barWidth', barPercent + '%');
  // root.style.setProperty('--barWidth0', barPercent0 + '%'); //loadingPage
  document.getElementById("percentage").innerHTML = barPercent2 + "%";

  if(barPercent2>=10){
    // var freccia = document.getElementById("freccia");
    // freccia.setAttribute("style", "color:#0064FB; cursor:pointer;");
  }

}
