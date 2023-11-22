let brain;
let state = 'waiting';
let targetLabel;
let rawData = []; // Stocke les données brutes de l'accéléromètre
let sequenceLength = 15; // La longueur de la séquence pour chaque axe
let sequenceCounter = 0; // Compteur pour le nombre de séquences ajoutées
let maxSequences = 100; // Nombre maximal de séquences à collecter
let collectionInterval; // Pour stocker l'identifiant de l'intervalle de collecte

// Charger un son pour le bip
let bipSound;

function preload() {
    bipSound = loadSound('../sound/bip.mp3');
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

    const options = {
        inputs: inputs,
        outputs: 4, // Nombre de labels de classification
        task: 'classification',
        debug: true
    };

    console.log(options)
    brain = ml5.neuralNetwork(options);

    // Boutons pour la collecte de données
    createCollectButton('LigneHorizontal', 'hline', 1);
    createCollectButton('Circle', 'circle', 2);
    createCollectButton('LigneVertical', 'vline', 3);
    // createCollectButton('Triangle', 'triangle', 4);
    createCollectButton('Rien', 'nothing', 5);

    // Bouton pour télécharger les données
    let downloadButton = createButton('Télécharger les données');
    downloadButton.position(19, 19);
    downloadButton.mousePressed(() => {
        brain.saveData('collectedData');
    });
}

function collectData(x, y, z, xOrientation, yOrientation, zOrientation) {
    // Arrondir les valeurs à deux décimales
    let roundedX = parseFloat(x.toFixed(3));
    let roundedY = parseFloat(y.toFixed(3));
    let roundedZ = parseFloat(z.toFixed(3));
    let roundedXOrientation = parseFloat(xOrientation.toFixed(3));
    let roundedYOrientation = parseFloat(yOrientation.toFixed(3));
    let roundedZOrientation = parseFloat(zOrientation.toFixed(3));
    

    rawData.push({ x: roundedX, y: roundedY, z: roundedZ, xO : roundedXOrientation, yO : roundedYOrientation, zO : roundedZOrientation });

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
        console.log(dataObject)
        brain.addData(dataObject, { label: targetLabel });
        sequenceCounter++;

        rawData = []; // Réinitialiser pour la prochaine séquence
        if (sequenceCounter >= maxSequences) {
            clearInterval(collectionInterval); // Arrêtez la collecte
            state = 'waiting';
            sequenceCounter = 0; // Réinitialiser pour la prochaine fois
            bipSound.play(); // Jouer le son pour indiquer la fin
        }
    }
}

function createCollectButton(buttonText, label, index) {
    let button = createButton(buttonText);
    button.position(19, (19 + index * 40));
    button.mousePressed(() => {
        prepareToCollect(label);
    });
}

function prepareToCollect(label) {
    if (state === 'waiting' && sequenceCounter < maxSequences) {
        targetLabel = label;
        state = 'preparing';
        setTimeout(() => startCollecting(), 1500);
    }
}

let latestDeviceOrientationEvent;
function startCollecting() {
    if (state === 'preparing') {
        bipSound.play();
        state = 'collecting';
        collectionInterval = setInterval(() => {
            if (window.DeviceMotionEvent && window.latestDeviceMotionEvent && latestDeviceOrientationEvent) {
                let eventMotion = window.latestDeviceMotionEvent;
                let eventOrientation = latestDeviceOrientationEvent
                collectData(
                    eventMotion.accelerationIncludingGravity.x,
                    eventMotion.accelerationIncludingGravity.y,
                    eventMotion.accelerationIncludingGravity.z,
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
    textSize(16);
    textAlign(LEFT, TOP);
    text('Collecte: ' + state, 50, 50);
    text('Label: ' + targetLabel, 50, 70);
    text('Séquences collectées: ' + sequenceCounter, 50, 90);
}

// Gestionnaire d'événements pour l'accéléromètre
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        window.latestDeviceMotionEvent = event;
    });
}
