


const canvasBox = document.getElementById("canvasbox");
let gameover = false;
let particles = [];

let fruitsdata = [
    {
        name: "cherry",
        level: 0,
        size: 20,
        color: "#FF0000" // Red
    },
    {
        name: "seedy",
        level: 1,
        size: 30,
        color: "#008000" // Green
    },


    {
        name: "orange",
        level: 2,
        size: 40,
        color: "#FFA500" // Orange
    },
    {
        name: "lemon",
        level: 3,
        size: 50,
        color: "#E63745" // Orange
    },



    {
        name: "kiwi",
        level: 4,
        size: 60,
        color: "#FFA500" // Orange
    },
    {
        name: "peach",
        level: 5,
        size: 70,
        color: "#E63745" // Orange
    },



    {
        name: "pomegranate",
        level: 6,
        size: 80,
        color: "#765827" // Brown
    },
    {
        name: "pineapple",
        level: 7,
        size: 90,
        color: "#008000" // Green
    },




    {
        name: "coconut",
        level: 8,
        size: 100,
        color: "#765827" // Brown
    },
    {
        name: "watermelon",
        level: 9,
        size: 150,
        color: "#008000" // Green
    }
]


// module aliases
var Engine = Matter.Engine,
    //   Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Detector = Matter.Detector,
    Query = Matter.Query,
    Composite = Matter.Composite;
var engine
let leftWall;
let rightWall;

function createBlast(x, y) {
    for (let i = 0; i < 20; i++) { // Number of particles
        particles.push(new Particle(x, y));
    }
}

var ground
let fruitinhand
let fruits = []
let score = 0

let handpos = [canvasBox.offsetWidth / 2, 70]

let playing = true


function preload() {

    fruitsdata[0].image = loadImage('assets/images/level0.png');
    fruitsdata[1].image = loadImage('assets/images/level1.png');
    fruitsdata[2].image = loadImage('assets/images/level2.png');
    fruitsdata[3].image = loadImage('assets/images/level3.png');
    fruitsdata[4].image = loadImage('assets/images/level4.png');
    fruitsdata[5].image = loadImage('assets/images/level5.png');
    fruitsdata[6].image = loadImage('assets/images/level6.png');
    fruitsdata[7].image = loadImage('assets/images/level7.png');
    fruitsdata[8].image = loadImage('assets/images/level8.png');
    fruitsdata[9].image = loadImage('assets/images/level9.png');

}
function displayGameOver() {
    background("#EAC696"); // Clear the screen or show a different background
    textAlign(CENTER, CENTER);
    fill("#FF0000");
    textSize(60);
    text("Game Over", width / 2, height / 2);
}

function setup() {
    // Create a p5.js canvas inside the "canvasbox" div
    const canvas = createCanvas(canvasBox.offsetWidth, canvasBox.offsetHeight);
    canvas.parent("canvasbox"); // Attach the canvas to the div

    engine = Engine.create();
    engine.world.gravity.y = 0.8;
    // Add ground and walls
    ground = new Ground(width / 2, height, 60, engine.world);
    leftWall = Matter.Bodies.rectangle(0, height / 2, 10, height, { isStatic: true });
    rightWall = Matter.Bodies.rectangle(width, height / 2, 10, height, { isStatic: true });
    Composite.add(engine.world, [leftWall, rightWall]);

    // Create one fruit in hand
    assignfruitinhand();

    // Create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // Add touch event listeners
    canvas.touchStarted(handleTouchStart);
    canvas.touchMoved(handleTouchMove);
    canvas.touchEnded(handleTouchEnd);
}

function handleTouchStart(event) {
    if(gameover){
        return;
    }
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    isTouching = true;
    return false; // Prevent default behavior
}

function handleTouchMove(event) {
    if(gameover){
        return;
    }
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    return false; // Prevent default behavior
}

function handleTouchEnd(event) {
    if(gameover){
        return;
    }
    // console.log(fruitinhand);
    fruitinhand.isfixed = false;
    // Move fruit in hand to fruits array
    fruits.push(fruitinhand);
    
    // Assign a new fruit in hand
    assignfruitinhand();
    isTouching = false;
    return false; // Prevent default behavior
}

function draw() {
    if (gameover) {
        displayGameOver();
        return; // Stop any further processing if the game is over
    }

    background("#EAC696");
    ground.display();

    movehand();

    // Display hand
    ellipse(handpos[0], handpos[1], 10, 10);

    // Display fruit in hand
    if (fruitinhand.isfixed) {
        fruitinhand.display();

        // Draw vertical line from the fruit in hand to the ground
        stroke("#FFFFFF"); // Set line color to white
        strokeWeight(3);
        const groundY = height - 160;
        drawDashedLine2(handpos[0], handpos[1]+25, handpos[0], groundY); // Draw line from hand to bottom of canvas
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].lifetime <= 0) {
            particles.splice(i, 1); // Remove dead particles
        }
    }
    // Display fruits in the game
    for (let index = 0; index < fruits.length; index++) {
        fruits[index].display();
    }

    // Check for collisions
    if (fruits.length >= 2) {
        checkCollisions(fruits);
    }

    // Display score
    displayscore();
    drawDashedLine();
}
function drawDashedLine2(x1, y1, x2, y2) {
    const dashLength = 10; // Length of each dash
    const gapLength = 5;   // Length of each gap between dashes

    let lineLength = dist(x1, y1, x2, y2); // Total length of the line
    let dashes = Math.floor(lineLength / (dashLength + gapLength)); // Number of dashes

    for (let i = 0; i < dashes; i++) {
        let startX = lerp(x1, x2, (i * (dashLength + gapLength)) / lineLength);
        let startY = lerp(y1, y2, (i * (dashLength + gapLength)) / lineLength);
        let endX = lerp(x1, x2, ((i * (dashLength + gapLength)) + dashLength) / lineLength);
        let endY = lerp(y1, y2, ((i * (dashLength + gapLength)) + dashLength) / lineLength);

        line(startX, startY, endX, endY);
    }
}



let timer;
let conditionTrueStartTime = null;

function checkCondition() {
    const lowestY = findObjectWithLowestY(fruits);
    
    // Check if the lowest fruit is near the bottom
    if (lowestY < 180) {
        if (conditionTrueStartTime === null) {
            // Start the timer when the condition first becomes true
            conditionTrueStartTime = Date.now();
        }

        // Calculate how long the condition has been true
        const elapsedTime = Date.now() - conditionTrueStartTime;
// console.log(elapsedTime)
        if (elapsedTime >= 3000) { // 3 seconds in milliseconds
            gameover = true;
            console.log("Game over!");
            clearInterval(timer);
            // Disable controls, show game over message, etc.
        }
    } else {
        // Reset the timer if the condition becomes false
        conditionTrueStartTime = null;
    }
}


// Run checkCondition every 100ms (or adjust as needed)
timer = setInterval(checkCondition, 10);

let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

function movehand() {
    if (playing && !gameover) {
        // Handle touch movement
        if (isTouching) {
            let touchX = touchStartX; // Default to start touch position if not updated
            let touchY = touchStartY;

            if (touchX) {
                // Move hand based on touch position
                handpos[0] = touchX;

                // Constrain the hand position
                handpos[0] = constrain(handpos[0], 50, width - 50);
            }
        }

        // Handle keyboard movement
        if (keyIsDown(LEFT_ARROW)) {
            handpos[0] -= 10;
        }

        if (keyIsDown(RIGHT_ARROW)) {
            handpos[0] += 10;
        }

        // Constrain the hand position
        handpos[0] = constrain(handpos[0], 50, width - 50);
       
    }
}

function createFruit(x, y) {
    // Define options with restitution for bounce
    const options = {
        restitution: 0.8, // Increase this value to make the fruit more bouncy
        density: 0.001
    };

    // Create the fruit body
    const fruit = Matter.Bodies.circle(x, y, 20, options);

    // Add the fruit to the Matter.js world
    Matter.Composite.add(engine.world, fruit);

    return fruit;
}

function assignfruitinhand() {
    // choose a number beween 0 and 2
    let rannum = floor(random(3))
    //  console.log(rannum)
    fruitinhand = new Fruit(engine.world, rannum); 

}
let pushForce = null;
// Function to push nearby fruits
function pushNearbyFruits(mergedFruit) {
     // Adjust this value to control the force
     for (let i = 0; i < fruits.length; i++) {
        let fruit = fruits[i];

        // Skip the merged fruit
        if (fruit === mergedFruit){ pushForce=convertToRange(fruit.size); break;}
     }
    // Loop through all fruits
    for (let i = 0; i < fruits.length; i++) {
        let fruit = fruits[i];

        // Skip the merged fruit
        if (fruit === mergedFruit){  continue;}

        // Calculate distance between merged fruit and current fruit
        let distance = dist(mergedFruit.body.position.x, mergedFruit.body.position.y,
                            fruit.body.position.x, fruit.body.position.y);

        // Apply force if within a certain range
        if (distance < 500) { // Adjust range as needed
            let angle = atan2(fruit.body.position.y - mergedFruit.body.position.y,
                               fruit.body.position.x - mergedFruit.body.position.x);
console.log(pushForce)
            // Apply force to push the neighboring fruit
            Matter.Body.applyForce(fruit.body, fruit.body.position, {
                x: pushForce * cos(angle),
                y: pushForce * sin(angle)
            });
        }
    }
}



function checkCollisions(circles) {

    const fruitsToRemove = [];
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            const circleA = circles[i];
            const circleB = circles[j];

            // Check if the circles have the same type and are colliding
            if (circleA.level === circleB.level && circleA.level < fruitsdata.length - 1 && Query.collides(circleA.body, [circleB.body]).length > 0) {
                // Circles with the same type are touching each other
                // console.log(`Circles ${i} and ${j} with type ${circleA.level} are touching.`);

                // if two objects of the same level group are touching

                // create a a new object with one level higher level in the position between two previous bodies


                let templevel = circleA.level

                let tempx = circleA.body.position.x
                let tempy = circleA.body.position.y

                let tempx2 = circleB.body.position.x
                let tempy2 = circleB.body.position.y


                // update score
                score += (circleA.level+1) * 10
                pushNearbyFruits(circleA);
                pushNearbyFruits(circleB);
                createBlast((fruits[i].body.position.x + fruits[j].body.position.x) / 2,
                (fruits[i].body.position.y + fruits[j].body.position.y) / 2);

                fruitsToRemove.push(circleA, circleB);

                // Remove the colliding fruits from the array
                for (const fruit of fruitsToRemove) {
                    const index = fruits.indexOf(fruit);
                    if (index !== -1) {
                        fruits.splice(index, 1);
                        Matter.World.remove(engine.world, fruit.body);
                    }

                }


                let newhigherlevelfruit = new Fruit(engine.world, templevel + 1);
                newhigherlevelfruit.isfixed = false

                // find x and y of collision
                let middle = findMiddlePoint(tempx, tempy, tempx2, tempy2)

                Matter.Body.setPosition(newhigherlevelfruit.body, { x: middle.x, y: middle.y });

                fruits.push(newhigherlevelfruit)





            }
        }
    }





}

function findMiddlePoint(x1, y1, x2, y2) {
    const middleX = (x1 + x2) / 2;
    const middleY = (y1 + y2) / 2;
    return { x: middleX, y: middleY };
}


function displayscore() {
    stroke("#765827")
    strokeWeight(4);


    //  textFont(displayfont);
    textSize(40);
    // noStroke();
    fill("yellow");

    textAlign(LEFT, CENTER);
    text(score, 50, 70);
}
function convertToRange(input) {
    if (input === 150) {
        return 10;
    } else if (input === 100) {
        return 15;
    } else if (input === 90) {
        return 17;
    } else if (input === 80) {
        return 20;
    } else if (input === 70) {
        return 22;
    } else if (input === 60) {
        return 25;
    } else if (input === 50) {
        return 28;
    } else if (input === 40) {
        return 30;
    } else if (input === 30) {
        return 35;
    } else if (input === 20) {
        return 40;
    } else {
        return null; // Return null or a default value if the input doesn't match any of the specific cases
    }
}

function drawDashedLine() {

    stroke("#D90631")
    strokeWeight(5)
    const y = 140; // Y-coordinate of the dashed line
    const dashLength = 20; // Length of each dash
    const gapLength = 20; // Length of each gap between dashes
    const lineLength = width; // Length of the entire line



    for (let x = 0; x < lineLength; x += dashLength + gapLength) {
        line(x, y, x + dashLength, y);
    }
}


function findObjectWithLowestY(fruits) {
    if (fruits.length === 0) {
        // Handle the case where the array is empty
        return 300;
    }

    // Initialize with the first object in the array
    let lowestYObject = fruits[0];

    for (let i = 1; i < fruits.length; i++) {
        const currentObject = fruits[i];

        // Compare the y values
        if (currentObject.body.position.y < lowestYObject.body.position.y) {
            lowestYObject = currentObject;
        }
    }

    return lowestYObject.body.position.y;
}