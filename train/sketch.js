let brain;
let sequenceLength = 10;

function setup() {
    createCanvas(640, 480);

    // Configuration du réseau de neurones
    let inputs = [];
    for (let i = 0; i < sequenceLength; i++) {
        inputs.push('x' + i);
        inputs.push('y' + i);
        inputs.push('z' + i);
    }

    let options = {
        inputs: inputs,
        outputs: 3,
        task: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options);
    brain.loadData('train/collectedData_mixed.json', dataReady);
}

function dataReady() {
    brain.normalizeData();

    const trainingOptions = {
        epochs: 250
    }

    brain.train(trainingOptions, finished);
}

function finished() {
    console.log('model trained');
    brain.save();
}
