let brain;
let state = 'waiting';
let targetLabel;
let rawData = []; // Stocke les données brutes de l'accéléromètre
let sequenceLength = 10; // La longueur de la séquence pour chaque axe
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
    }

    const options = {
        inputs: inputs,
        outputs: 3, // Nombre de labels de classification
        task: 'classification',
        debug: true
    };

    brain = ml5.neuralNetwork(options);
    const modelInfo = {
        model: '/model/model.json',
        metadata: '/model/model_meta.json',
        weights: '/model/model.weights.bin',
    };
    brain.load(modelInfo, brainLoaded);

    // Boutons pour la collecte de données
    createCollectButton('Test');
}

function brainLoaded() {
    console.log('Classification ready!');
}

function collectData(x, y, z) {
    // Arrondir les valeurs à deux décimales
    let roundedX = parseFloat(x.toFixed(3));
    let roundedY = parseFloat(y.toFixed(3));
    let roundedZ = parseFloat(z.toFixed(3));

    rawData.push({ x: roundedX, y: roundedY, z: roundedZ });

    if (rawData.length === sequenceLength) {
        let dataObject = {};
        for (let i = 0; i < sequenceLength; i++) {
            dataObject['x' + i] = rawData[i].x;
            dataObject['y' + i] = rawData[i].y;
            dataObject['z' + i] = rawData[i].z;
        }

        brain.classify(dataObject, function(error, results) {
            if (error) {
                console.error(error);
            } else {
                let label = results[0].label;
                let confidence = results[0].confidence;
                if (confidence > 0.65) {
                    console.log(label, confidence);
                    targetLabel = label;
                }
            }
        });

        rawData = []; // Réinitialiser pour la prochaine séquence
    }
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
            if (window.DeviceMotionEvent && window.latestDeviceMotionEvent) {
                let event = window.latestDeviceMotionEvent;
                collectData(
                    event.accelerationIncludingGravity.x,
                    event.accelerationIncludingGravity.y,
                    event.accelerationIncludingGravity.z
                );
            }
        }, 100);
    }
}

function draw() {
    background(255);
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text('Collecte: ' + state, 50, 50);
    text('Label: ' + targetLabel, 50, 70);
}

// Gestionnaire d'événements pour l'accéléromètre
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        window.latestDeviceMotionEvent = event;
    });
}
