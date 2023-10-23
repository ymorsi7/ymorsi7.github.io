const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const retryButton = document.getElementById('retry');

let bird = {
    x: 50,
    y: canvas.height / 2,
    vy: 0,
    gravity: 0.5,
    jump: -8,
    radius: 20
};

let pipes = [];
let spacing = 180; // Increased the spacing between bars
let pipeWidth = 60;
let pipeSpacing = 250;
let score = 0;
let useAI = false;

document.getElementById('toggleAI').addEventListener('click', function () {
    useAI = !useAI;
    resetGame();
    update();
    this.innerText = useAI ? 'AI On' : 'AI Off';
});


// Adding left-click event to the canvas
canvas.addEventListener('click', function() {
    if (!useAI) bird.vy = bird.jump;
});

document.addEventListener('keydown', function () {
    if (!useAI) bird.vy = bird.jump;
});

retryButton.addEventListener('click', function () {
    resetGame();
    update();
    this.style.display = 'none';
});


function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipe(pipe) {
    ctx.fillStyle = "green";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + spacing, pipeWidth, canvas.height - pipe.top - spacing);
}

function collision(pipe) {
    return bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.top + spacing;
}

function aiDecision() {
    let nextPipe = pipes[0];
    if (nextPipe.x + pipeWidth < bird.x) nextPipe = pipes[1];

    let birdFuturePosition = bird.y + bird.vy;

    if (birdFuturePosition > nextPipe.top + spacing || birdFuturePosition < nextPipe.top) {
        bird.vy = bird.jump;
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.vy += bird.gravity;
    bird.y += bird.vy;

    // If bird hits the bottom
    if (bird.y + bird.radius > canvas.height) {
        retryButton.style.display = 'block';
        return;
    }

    if (bird.y < 0) bird.y = 0;

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeSpacing) {
        let top = Math.random() * (canvas.height - spacing);
        pipes.push({ x: canvas.width, top: top });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        if (pipes[i].x < bird.x && !pipes[i].scored && pipes[i].x + pipeWidth > bird.x) {
            score++;
            pipes[i].scored = true;
        }

        if (pipes[i].x < -pipeWidth) {
            pipes.splice(i, 1);
        }

        if (collision(pipes[i]) && pipes[i].x < bird.x + bird.radius && pipes[i].x + pipeWidth > bird.x - bird.radius) {
            retryButton.style.display = 'block';
            return;
        }

        drawPipe(pipes[i]);
    }

    if (useAI) aiDecision();

    drawBird();

    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 10);

    requestAnimationFrame(update);
}

let model;

// We will represent the game state as a simple array: [bird.y, pipe.top, pipe.bottom]
async function trainAI() {
    model = tf.sequential();
    
    model.add(tf.layers.dense({units: 10, activation: 'relu', inputShape: [3]}));
    model.add(tf.layers.dense({units: 2, activation: 'softmax'})); // jump or not jump
    
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    // Some example training data here (you will need to generate real training data)
    const xs = tf.tensor2d([[150, 200, 350], [170, 220, 370]]);
    const ys = tf.tensor2d([[1, 0], [0, 1]]);

    await model.fit(xs, ys, { epochs: 1000 });
}

function aiDecision() {
    if (!model) return;
    
    let nextPipe = pipes[0];
    if (nextPipe.x + pipeWidth < bird.x) nextPipe = pipes[1];
    
    const prediction = model.predict(tf.tensor2d([[bird.y, nextPipe.top, nextPipe.top + spacing]]));
    if (prediction.argMax(-1).dataSync()[0] == 0) {
        bird.vy = bird.jump;
    }
}


function resetGame() {
    bird.y = canvas.height / 2;
    bird.vy = 0;
    pipes = [];
    score = 0;
}

update();
