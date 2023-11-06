let brain;
let label = "waiting..."; // Label initial pour l'affichage
let confidence = 0; // Confiance initiale pour l'affichage
let isClassifying = false; // Flag pour contrôler quand classer

// Sons pour les labels
let bipSoundA;
let bipSoundB;
let classifyButton; // Bouton pour commencer la classification

function preload() {
    bipSoundA = loadSound('../sound/bip2.mp3');
    bipSoundB = loadSound('../sound/bip3.mp3');
}

function setup() {
    createCanvas(640, 480);
    background(255);

    classifyButton = createButton('Start Classification');
    classifyButton.position(59, 59);
    classifyButton.mousePressed(startClassification);

    // Initialisation du réseau de neurones
    let options = {
        inputs: 3,
        outputs: 4,
        task: 'classification',
        debug: true
    };
    brain = ml5.neuralNetwork(options);

    // Charger le modèle pré-entraîné
    const modelInfo = {
        model: '../model/model.json',
        metadata: '../model/model_meta.json',
        weights: '../model/model.weights.bin',
    };
    brain.load(modelInfo, brainLoaded);
}

function startClassification() {
    isClassifying = true; // Active la classification
    classifyButton.html('Classifying...');
}

function brainLoaded() {
    console.log('Model ready for classification');
}

function classifyAcceleration() {
    if (isClassifying) {
        let inputs = [
            accelerationX,
            accelerationY,
            accelerationZ
        ];
        brain.classify(inputs, gotResult);
    }
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    if (results[0].confidence > 0.55) {
        label = results[0].label.toUpperCase();
        confidence = results[0].confidence;

        if (label === 'LINE') {
            bipSoundA.play();
        } else if (label === 'INFINITE') {
            bipSoundB.play();
        }
    }
    classifyAcceleration(); // Continue la classification si isClassifying est vrai
}

let accelerationX, accelerationY, accelerationZ;

function draw() {
    background(255);
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(label, width / 2, height / 2);
    text(confidence.toFixed(2), width / 2, height / 2 + 32);

    if (isClassifying) {
        classifyAcceleration();
    }
}

// Gestionnaire d'événements pour l'accéléromètre
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        accelerationX = event.accelerationIncludingGravity.x;
        accelerationY = event.accelerationIncludingGravity.y;
        accelerationZ = event.accelerationIncludingGravity.z;
    });
} else {
    console.log("DeviceMotionEvent is not supported");
}
