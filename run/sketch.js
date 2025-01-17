let brain;
let state = 'waiting';
let targetLabel;
let rawData = []; // Stocke les données brutes de l'accéléromètre
let sequenceLength = 15; // La longueur de la séquence pour chaque axe
let collectionInterval; // Pour stocker l'identifiant de l'intervalle de collecte

// Charger un son pour le bip
let bipSound;

let lineSong
let squareSong
let circleSong
let triangleSong

let labelAllConfidence = ""
let textConfidence = document.getElementById("textConfidence")

let currentSpellLabel = "nothing"
let arrayAverageSpell = []


// init websocket
// const socket = io();

function preload() {
    bipSound = loadSound('../sound/bip.mp3');

    lineSong = loadSound('../sound/ligne.mp3')
    squareSong = loadSound('../sound/carrer.mp3')
    circleSong = loadSound('../sound/cercle.mp3')
    triangleSong = loadSound('../sound/triangle.mp3')
}

function setup() {
    createCanvas(640, 480);
    background(255);

    // Configuration du réseau de neurones
    let inputs = [];
    for (let i = 0; i < sequenceLength; i++) {
        inputs.push('x' + i);
        inputs.push('y' + i);
        inputs.push('z' + i);
        //inputs.push('xOrien' + i);
        //inputs.push('yOrien' + i);
        //inputs.push('zOrien' + i);
    }

    let options = {
        inputs: inputs,
        outputs: 4,
        task: 'classification',
        layers: [
            {
              type: 'dense',
              units: 16,
              activation: 'relu'
            },
            {
              type: 'dense',
              units: 8,
              activation: 'sigmoid'
            },
            {
              type: 'dense',
              activation: 'sigmoid'
            }
          ],
        debug: true
    }

    brain = ml5.neuralNetwork(options);
    const modelInfo = {
        model: '/model/toto2/model.json',
        metadata: '/model/toto2/model_meta.json',
        weights: '/model/toto2/model.weights.bin',
    };//capteur_orientation/model2_027
    brain.load(modelInfo, brainLoaded);

    // Boutons pour la collecte de données
    createCollectButton('Test');
}

function brainLoaded() {
    console.log('Classification ready!');
}

function collectData(x, y, z, xOrientation, yOrientation, zOrientation) {
    // Arrondir les valeurs à deux décimales
    let roundedX = parseFloat(x.toFixed(3));
    let roundedY = parseFloat(y.toFixed(3));
    let roundedZ = parseFloat(z.toFixed(3));
    let roundedXOrientation = parseFloat(xOrientation.toFixed(3));
    let roundedYOrientation = parseFloat(yOrientation.toFixed(3));
    let roundedZOrientation = parseFloat(zOrientation.toFixed(3));

    rawData.push({ x: roundedX, y: roundedY, z: roundedZ , xO : roundedXOrientation, yO : roundedYOrientation, zO : roundedZOrientation });

    if (rawData.length === sequenceLength) {
        let dataObject = {};
        for (let i = 0; i < sequenceLength; i++) {
            dataObject['x' + i] = rawData[i].x;
            dataObject['y' + i] = rawData[i].y;
            dataObject['z' + i] = rawData[i].z;
            //dataObject['xOrien' + i] = rawData[i].xO;
            //dataObject['yOrien' + i] = rawData[i].yO;
            //dataObject['zOrien' + i] = rawData[i].zO;
        }

        //brain.normalizeData();
        brain.classify(dataObject, function(error, results) {
            if (error) {
                console.error(error);
            } else {

                // ? set up interface
                labelAllConfidence = "";
                for (let index = 0; index < results.length; index++) {
                    labelAllConfidence += `${results[index].label} : ${results[index].confidence} \n`
                }
                //textConfidence.innerHTML = labelAllConfidence


                let label = results[0].label;
                let confidence = results[0].confidence;
                targetLabel = label;

                /*if (confidence > 0.10) {
                    // console.log(label, confidence);
                    targetLabel = label;
                    // definedSpell(label)
                    if (arrayAverageSpell.length > 4) {

                        // remove first element and add new
                        arrayAverageSpell.shift()
                        arrayAverageSpell.push(label)
                        
                    }else{
                        arrayAverageSpell.push(label)
                    }

                    currentSpellLabel = getAverageSpell(arrayAverageSpell)
                    definedSpell(currentSpellLabel)
                    
                }*/
                
            }
        });

        rawData = []; // Réinitialiser pour la prochaine séquence
    }
}

function getAverageSpell(array){

    let uniqueElements = [...new Set(array)];

    const elementCounts = uniqueElements.map(value => [value, array.filter(str => str === value).length]);

    
    let biggest = ["toto", 0]
    elementCounts.forEach(element => {
        if (element[1] > biggest[1]) {
            biggest = element
        }
    });
    
    // console.log(elementCounts)
    textConfidence.innerHTML = biggest;
    return biggest[0]
}

function definedSpell(label){
    if (label == "triangle") {
        triangleSong.play()
        // socket.emit("triangle", "triangle")
        resetForm()
    }else if(label == "square"){
        squareSong.play()
        resetForm()
    }else if(label == "circle"){
        circleSong.play()
        resetForm()
    }else if(label == "line" || label ==  "linehorizontal" || label == "LigneVertical" ){
        lineSong.play()
        resetForm()
    }
}

function resetForm(){
    arrayAverageSpell = ["nothing","nothing","nothing","nothing"]
}

function createCollectButton(buttonText) {
    let button = createButton(buttonText);
    button.position(20, 60);
    button.mousePressed(() => {
        prepareToCollect();
    });
}

function prepareToCollect() {
    if (state === 'waiting') {
        state = 'preparing';
        setTimeout(() => startCollecting(), 1500);
    }
}

function startCollecting() {
    if (state === 'preparing') {
        bipSound.play();
        state = 'collecting';
        collectionInterval = setInterval(() => {
            if (window.DeviceMotionEvent && window.latestDeviceMotionEvent && latestDeviceOrientationEvent) {
                let event = window.latestDeviceMotionEvent;
                let eventOrientation = latestDeviceOrientationEvent
                collectData(
                    event.accelerationIncludingGravity.x,
                    event.accelerationIncludingGravity.y,
                    event.accelerationIncludingGravity.z,
                    eventOrientation.x,
                    eventOrientation.y,
                    eventOrientation.z
                );
            }
        }, 100);
    }
}

window.addEventListener("deviceorientation", (event) => {
    latestDeviceOrientationEvent = {
        x : event.alpha,
        y : event.beta,
        z : event.gamma
    }
  });

function draw() {
    background(255);
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text('Collecte: ' + state, 50, 50);
    text('Label: ' + targetLabel, 50, 70);
    text('Label: ' + labelAllConfidence, 70, 120);
}

// Gestionnaire d'événements pour l'accéléromètre
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        window.latestDeviceMotionEvent = event;
    });
}
