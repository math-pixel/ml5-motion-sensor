let brain;
let sequenceLength = 15;

function setup() {
    createCanvas(640, 480);

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
    brain.loadData('train/Data.json', dataReady);
}

function dataReady() {
    brain.normalizeData();

    const trainingOptions = {
        epochs: 80,
        batchSize: 6
    }

    brain.train(trainingOptions, finished);
}

function finished() {
    console.log('model trained');
    brain.save();
}
