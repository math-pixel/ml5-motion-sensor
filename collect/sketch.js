let brain;
let state = 'waiting';
let targetLabel; // Déclarer targetLabel à la portée globale

// Variables pour les données d'accélération
let accelerationX = 0;
let accelerationY = 0;
let accelerationZ = 0;

// Charger un son pour le bip (remplacer 'bip.mp3' par le chemin de votre fichier son)
let bipSound;

function preload() {
    bipSound = loadSound('../sound/bip.mp3'); // Assurez-vous que le fichier 'bip.mp3' est à la racine du projet
}

function setup() {
    createCanvas(640, 480);
    background(255);

    // Écouter les événements d'accéléromètre
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            accelerationX = event.accelerationIncludingGravity.x;
            accelerationY = event.accelerationIncludingGravity.y;
            accelerationZ = event.accelerationIncludingGravity.z;
        });
    } else {
        console.log("DeviceMotionEvent is not supported");
    }

    let options = {
        inputs: 3,
        outputs: 4,
        task: 'classification',
        debug: true
    };
    brain = ml5.neuralNetwork(options);

    // Création et configuration des boutons de collecte pour différents labels
    createCollectButton('Ligne', 'line');
    createCollectButton('Carré', 'square');
    createCollectButton('Infini', 'infinite');
    createCollectButton('Rien', 'nothing');
}

function createCollectButton(buttonText, label) {
    let button = createButton(buttonText);
    button.mousePressed(() => {
        prepareToCollect(label);
    });
}

function prepareToCollect(label) {
    if (state === 'waiting') {
        targetLabel = label;
        state = 'preparing';
        console.log(`Preparing to collect for label: ${label}`);
        setTimeout(() => startCollecting(label), 3000); // Commence la collecte après un délai de 3 secondes
    }
}

function startCollecting(targetLabel) {
    bipSound.play(); // Jouer le bip sonore
    console.log(`Collecting for label: ${targetLabel}`);
    state = 'collecting';
    setTimeout(stopCollecting, 15000); // Arrête la collecte après 15 secondes
}

function stopCollecting() {
    bipSound.play(); // Jouer le bip sonore
    state = 'waiting';
    console.log('Collection stopped');
    brain.saveData('collectedData.json'); // Sauvegarde les données collectées
}

function draw() {
    background(255);
    fill(0);
    noStroke();
    textSize(32);
    textAlign(LEFT, TOP);
    text(`X: ${accelerationX.toFixed(2)}`, 10, 40);
    text(`Y: ${accelerationY.toFixed(2)}`, 10, 80);
    text(`Z: ${accelerationZ.toFixed(2)}`, 10, 120);

    if (state === 'collecting') {
        let inputs = [accelerationX, accelerationY, accelerationZ];
        let target = [targetLabel];
        brain.addData(inputs, target);
    }
}
