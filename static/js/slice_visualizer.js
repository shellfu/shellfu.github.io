const canvas = document.getElementById('sliceCanvas');
const ctx = canvas.getContext('2d');
const operationLabel = document.getElementById('operationLabel');
const operationDescription = document.getElementById('operationDescription');

const elements = Array.from({ length: 12 }, (_, i) => i + 1);
let animationProgress = 0;
let animationStep = 0.02;
let currentStart = 0;
let currentEnd = elements.length;
let currentCap = elements.length;
let targetStart = 0;
let targetEnd = elements.length;
let targetCap = elements.length;

const operations = {
    'Full Array': {
        description: 'Displays the full array (slice[:]). No slicing applied, showing the entire array.\n',
        start: 0,
        end: elements.length,
        cap: elements.length
    },
    'First Half': {
        description: 'Displays the first half of the array (slice[:6]). This operation slices the array from the start until the 6th element.\n',
        start: 0,
        end: 6,
        cap: elements.length
    },
    'Second Half': {
        description: 'Displays the second half of the array (slice[6:]). This slices the array from the 6th element to the end.\n',
        start: 6,
        end: elements.length,
        cap: elements.length
    },
    'Middle': {
        description: 'Displays a middle segment of the array (slice[3:8]). This slices the array to include elements from the 3rd to the 8th.\n',
        start: 3,
        end: 8,
        cap: elements.length
    },
    'Custom Cap': {
        description: 'Displays a slice with a custom capacity (slice[3:6:10]). This operation demonstrates how slices can be limited in size, indicating the maximum capacity without reallocating.\n',
        start: 3,
        end: 6,
        cap: 10
    },
    'Pop': {
        description: 'Removes the last element of the slice, reducing its length by one.',
        start: 0,
        end: elements.length - 1,
        cap: elements.length
    },
    'Cut': {
        description: 'Removes a segment from the slice (e.g., elements 5 to 7).',
        start: 0,
        end: elements.length,
        cap: elements.length,
        cut: { start: 5, end: 7 }
    },
    'Delete': {
        description: 'Removes a specific element from the slice (e.g., the 5th element).',
        start: 0,
        end: elements.length,
        cap: elements.length,
        delete: 5
    }
};

function linearEasing(t) {
    return t;
}

function animate() {
    if (animationProgress < 1) {
        animationProgress += animationStep;
        if (animationProgress > 1) {
            animationProgress = 1;
        }

        const easingProgress = linearEasing(animationProgress);
        currentStart = targetStart * easingProgress + currentStart * (1 - easingProgress);
        currentEnd = targetEnd * easingProgress + currentEnd * (1 - easingProgress);
        currentCap = targetCap * easingProgress + currentCap * (1 - easingProgress);

        drawArrayAndSlice();
        requestAnimationFrame(animate);
    }
}

function selectOperation(operation) {
    const op = operations[operation];
    operationLabel.textContent = `Operation: ${operation} ${operation.includes('Custom Cap') ? 'slice[3:6:10]' : ''}`;
    operationDescription.textContent = op.description;
    targetStart = op.start;
    targetEnd = op.end;
    targetCap = op.cap;
    animationProgress = 0;
    animate();
}

function drawArrayAndSlice() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const boxWidth = 50;
    const boxHeight = 50;
    const startX = 50;
    const startY = 25;
    const spacing = 10;

    elements.forEach((val, i) => {
        let color = 'lightgray';
        if (i >= Math.floor(currentStart) && i < Math.ceil(currentEnd)) {
            color = 'skyblue';
        }
        if (i >= Math.ceil(currentEnd) && i < currentCap) {
            color = 'rgba(0, 255, 0, 0.2)';
        }

        const x = startX + i * (boxWidth + spacing);
        ctx.fillStyle = color;
        ctx.fillRect(x, startY, boxWidth, boxHeight);
        ctx.fillStyle = 'black';
        ctx.fillText(val-1, x + 15, startY + 30);
    });

    if (currentEnd > currentStart) {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(startX + currentStart * (boxWidth + spacing) - 5, startY - 5, (currentEnd - currentStart) * (boxWidth + spacing), boxHeight + 10);
    }
}

drawArrayAndSlice();
