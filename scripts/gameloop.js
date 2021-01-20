let inputState = {};            //Inputs
let highScores = [];

function showOptionButtons(){
    var myTable = '<h2>Options</h2>';
    myTable += '<table id = "button-table">';
    myTable += '<tr><td><button class="optionButton" onclick="showSizeButtons()">New Game</button></td></tr>';
    myTable += '<tr><td><button class="optionButton" onclick="showHighScores()">High Scores</button></td></tr>';
    myTable += '<tr><td><button class="optionButton" onclick="showCredits()">Credits</button></td></tr>';
    myTable += '</table>';
    document.getElementById('right-table').innerHTML = myTable;
}

function showSizeButtons(){
    var myTable = '<h2>Options</h2>';
    myTable += '<table id = "button-table">';
    myTable += '<tr><td><button class="sizeButton" onclick="startGameloop(5)">5x5</button></td></tr>';
    myTable += '<tr><td><button class="sizeButton" onclick="startGameloop(10)">10x10</button></td></tr>';
    myTable += '<tr><td><button class="sizeButton" onclick="startGameloop(15)">15x15</button></td></tr>';
    myTable += '<tr><td><button class="sizeButton" onclick="startGameloop(20)">20x20</button></td></tr>';
    myTable += '<tr><td><button class="sizeButton" onclick="startGameloop(25)">25x25</button></td></tr>';
    myTable += '<tr><td><button class="optionButton" onclick="showOptionButtons()">Back to Options</button></td></tr>';
    myTable += '</table>';
    document.getElementById('right-table').innerHTML = myTable;
}

function showHighScores(){
    var myTable = '<h2>High Scores</h2>';
    highScores.sort(function(a, b){return b-a});
    if(highScores.length > 0){
        for(let i = 1; i <= 10 && i <= highScores.length; i++){
            myTable += '<h4>' + i + ': ' + highScores[i-1] + '</h4>';
        }
    }
    else{
        myTable += '<p>No recorded scores...</p>';
    }
    myTable += '<div><button class="optionButton" onclick="showOptionButtons()">Back to Options</button></div>'
    document.getElementById('right-table').innerHTML = myTable;
}

function showCredits(){
    var myTable = '<h2>Credits</h2>';
    myTable += '<h3>Created by</h3>';
    myTable += '<h3>Sam Christiansen</h3>';
    myTable += '<h3>for CS 5410 </h3>';
    myTable += '<div><button class="optionButton" onclick="showOptionButtons()">Back to Options</button></div>'
    document.getElementById('right-table').innerHTML = myTable;
}

let imgFloor = new Image();     //TODO Floor

function createCharacter(imageSource, location){
    let image = new Image();
    image.isReady = false;
    image.onload = function(){
        this.isReady = true;
    };
    image.src = imageSource;
    return {
        location: location,
        image: image
    };
}

let breadCrumb = new Image();
breadCrumb.isReady = false;
breadCrumb.onload = function(){
    this.isReady = true;
}
breadCrumb.src = 'breadCrumb.png';
let showBreadCrumbs = false;
let showHint = false;
let showPath = false;
let showScore = false;

let maze = [];
let usedCells = [];
let frontier = [];
let stack = [];
let gameRunning = false;
let wonGame = false;
let startTime = 0;
let gameScore = 0;

function initializeMaze(size){
    showOptionButtons();
    setMazeSize(size);
    myChar.location = maze[0][0];
    showBreadCrumbs = false;
    initUsedCells(size);
    gameRunning = true;
    wonGame = false;
    startTime = performance.now();
    gameScore = 0;

    var rndRow = Math.floor((Math.random() * size));
    var rndCol = Math.floor((Math.random() * size));
    usedCells[rndRow][rndCol].used = true;
    frontier = updateFrontier(maze[rndRow][rndCol]);
    while(frontier.length !== 0){
        var rnd = Math.floor((Math.random() * frontier.length));
        usedCells[frontier[rnd].y][frontier[rnd].x].used = true;
        eraseWall(frontier[rnd]);
        frontier = updateFrontier(frontier[rnd]);
        frontier.splice(rnd, 1);
    }
    createStack();
}

function setMazeSize(size){
    maze = [];
    usedCells = [];
    frontier = [];
    for (let row = 0; row < size; row++){
        maze.push([]);
        usedCells.push([]);
        for(let col = 0; col < size; col++){
            maze[row].push({
                x: col,
                y: row,
                edges: {
                    n: null,
                    s: null,
                    w: null,
                    e: null
                },
                mazeSize: size,
                hasBeenVisited: false
            });
            usedCells[row].push({used: false});
        }
    }
}

function initUsedCells(size){
    for(let row = 0; row < size; row++){
        for(let col = 0; col < size; col++){
            usedCells[row][col].used = false;
        }
    }
}

function eraseWall(cell){
    while(true){
        var rndDirection = Math.floor((Math.random() * 4));
        if(rndDirection == 0 && cell.y > 0 && usedCells[cell.y-1][cell.x].used){
            cell.edges.n = maze[cell.y-1][cell.x];
            maze[cell.y-1][cell.x].edges.s = cell;
            return;
        }
        if(rndDirection == 1 && cell.y < cell.mazeSize - 1 && usedCells[cell.y+1][cell.x].used){
            cell.edges.s = maze[cell.y+1][cell.x];
            maze[cell.y+1][cell.x].edges.n = cell;
            return;
        }
        if(rndDirection == 2 && cell.x > 0 && usedCells[cell.y][cell.x-1].used){
            cell.edges.w = maze[cell.y][cell.x-1];
            maze[cell.y][cell.x-1].edges.e = cell;
            return;
        }
        if(rndDirection == 3 && cell.x < cell.mazeSize - 1 && usedCells[cell.y][cell.x+1].used){
            cell.edges.e = maze[cell.y][cell.x+1];
            maze[cell.y][cell.x+1].edges.w = cell;
            return;
        }
    }
}

function updateFrontier(cell){
    if(cell.y > 0 && cell.edges.n == null && !frontier.includes(maze[cell.y-1][cell.x]) && maze[cell.y-1][cell.x] !== undefined && !usedCells[cell.y-1][cell.x].used)
        frontier.push(maze[cell.y-1][cell.x]);
    if(cell.y < cell.mazeSize - 1 && cell.edges.s == null && !frontier.includes(maze[cell.y+1][cell.x]) && maze[cell.y+1][cell.x] !== undefined && !usedCells[cell.y+1][cell.x].used)
        frontier.push(maze[cell.y+1][cell.x]);
    if(cell.x > 0 && cell.edges.w == null && !frontier.includes(maze[cell.y][cell.x-1]) && maze[cell.y][cell.x-1] !== undefined && !usedCells[cell.y][cell.x-1].used)
        frontier.push(maze[cell.y][cell.x-1]);
    if(cell.x < cell.mazeSize - 1 && cell.edges.e == null && !frontier.includes(maze[cell.y][cell.x+1]) && maze[cell.y][cell.x+1] !== undefined && !usedCells[cell.y][cell.x+1].used)
        frontier.push(maze[cell.y][cell.x+1]);
    return frontier;
}

function createStack(){
    stack = [];
    stack.push(maze[maze[0][0].mazeSize-1][maze[0][0].mazeSize-1]);
    stack[stack.length - 1].hasBeenVisited = true;
    while(!maze[0][0].hasBeenVisited){
        if (stack[stack.length - 1].edges.w !== null && stack[stack.length - 1].edges.w !== undefined && !stack[stack.length - 1].edges.w.hasBeenVisited){
            stack.push(stack[stack.length - 1].edges.w);
        } else if (stack[stack.length - 1].edges.n !== null && stack[stack.length - 1].edges.n !== undefined && !stack[stack.length - 1].edges.n.hasBeenVisited){
            stack.push(stack[stack.length - 1].edges.n);
        } else if (stack[stack.length - 1].edges.e !== null && stack[stack.length - 1].edges.e !== undefined && !stack[stack.length - 1].edges.e.hasBeenVisited){
            stack.push(stack[stack.length - 1].edges.e);
        } else if (stack[stack.length - 1].edges.s !== null && stack[stack.length - 1].edges.s !== undefined && !stack[stack.length - 1].edges.s.hasBeenVisited){
            stack.push(stack[stack.length - 1].edges.s);
        } else {
            stack.pop();
        }
        stack[stack.length - 1].hasBeenVisited = true;
    }
    stack.pop();
    for(let row = 0; row < maze[0][0].mazeSize; row++){
        for(let col = 0; col < maze[0][0].mazeSize; col++){
            maze[row][col].hasBeenVisited = false;
        }
    }
}

function moveCharacter(keyCode, character){
    console.log('keyCode: ', keyCode);
    character.location.hasBeenVisited = true;
    if(keyCode === 83 || keyCode === 75 || keyCode == 40){//s, k, (down-arrow)
        if(character.location.edges.s){
            updateStack(character.location, character.location.edges.s);
            character.location = character.location.edges.s;
        }
    }
    if(keyCode === 87 || keyCode === 73 || keyCode == 38){//w, i, (up-arrow)
        if(character.location.edges.n){
            updateStack(character.location, character.location.edges.n);
            character.location = character.location.edges.n;
        }
    }
    if(keyCode === 68 || keyCode === 76 || keyCode == 39){//d, l, (right-arrow)
        if(character.location.edges.e){
            updateStack(character.location, character.location.edges.e);
            character.location = character.location.edges.e;
        }
    }
    if(keyCode === 65 || keyCode === 74 || keyCode == 37){//a, j, (down-arrow)
        if(character.location.edges.w){
            updateStack(character.location, character.location.edges.w);
            character.location = character.location.edges.w;
        }
    }
    if(keyCode === 66){//b
        showBreadCrumbs = !showBreadCrumbs;
    }
    if(keyCode === 72){//h
        showHint = !showHint;
    }
    if(keyCode === 80){//p
        showPath = !showPath;
    }
    if(keyCode === 89){
        showScore = !showScore;
    }
}

function updateStack(currentCell, nextCell){
    updateScore(currentCell, nextCell);
    if(stack[stack.length - 1] === nextCell){
        stack.pop();
        if(stack.length === 0)
            wonGame = true;
    }
    else{
        stack.push(currentCell);
    }
}

function updateScore(currentCell, nextCell){
    if(!nextCell.hasBeenVisited){
        if(stack[stack.length - 1] === nextCell)
            gameScore += 5;
        else
            gameScore -= 2;
    }
}

function drawCell(cell){
    context.beginPath();
    if (cell.edges.n === null) {
		context.moveTo(cell.x * (600 / cell.mazeSize), cell.y * (600 / cell.mazeSize));
		context.lineTo((cell.x + 1) * (600 / cell.mazeSize), cell.y * (600 / cell.mazeSize));
	}

	if (cell.edges.s === null) {
		context.moveTo(cell.x * (600 / cell.mazeSize), (cell.y + 1) * (600 / cell.mazeSize));
		context.lineTo((cell.x + 1) * (600 / cell.mazeSize), (cell.y + 1) * (600 / cell.mazeSize));
	}

	if (cell.edges.e === null) {
		context.moveTo((cell.x + 1) * (600 / cell.mazeSize), cell.y * (600 / cell.mazeSize));
		context.lineTo((cell.x + 1) * (600 / cell.mazeSize), (cell.y + 1) * (600 / cell.mazeSize));
	}

	if (cell.edges.w === null) {
		context.moveTo(cell.x * (600 / cell.mazeSize), cell.y * (600 / cell.mazeSize));
		context.lineTo(cell.x * (600 / cell.mazeSize), (cell.y + 1) * (600 / cell.mazeSize));
    }
    context.closePath();
    context.stroke();
    if(cell.hasBeenVisited && showBreadCrumbs){
        context.drawImage(breadCrumb, (cell.x * (600 / cell.mazeSize)) + ((600/cell.mazeSize) / 2), (cell.y * (600 / cell.mazeSize)) + ((600/cell.mazeSize) / 2), 600 / (maze[0][0].mazeSize * 10), 600 / (maze[0][0].mazeSize * 10));
    }
}

function renderMaze(){
    context.strokeStyle = 'rgb(255,255,255';
    context.lineWidth = 2;
    let size = maze[0][0].mazeSize
    for (let row = 0; row < size; row++){
        for(let col = 0; col < maze[0][0].mazeSize; col++){
            drawCell(maze[row][col]);
        }
    }
    context.beginPath();
    context.moveTo((maze[size-1][size-1].x + .25) * (600 / size), (maze[size-1][size-1].y + .25) * (600 / size));
    context.lineTo((maze[size-1][size-1].x + .75) * (600 / size), (maze[size-1][size-1].y + .75) * (600 / size));
    context.moveTo((maze[size-1][size-1].x + .25) * (600 / size), (maze[size-1][size-1].y + .75) * (600 / size));
    context.lineTo((maze[size-1][size-1].x + .75) * (600 / size), (maze[size-1][size-1].y + .25) * (600 / size));
    context.stroke();
}

function renderHint(){
    if(showHint && stack.length > 0){
        context.beginPath();
        context.moveTo(stack[stack.length - 1].x * (600 / maze[0][0].mazeSize), stack[stack.length - 1].y * (600 / maze[0][0].mazeSize));
        context.lineTo((stack[stack.length - 1].x + 1) * (600 / maze[0][0].mazeSize), stack[stack.length - 1].y * (600 / maze[0][0].mazeSize));
        context.lineTo((stack[stack.length - 1].x + 1) * (600 / maze[0][0].mazeSize), (stack[stack.length - 1].y + 1) * (600 / maze[0][0].mazeSize));
        context.lineTo(stack[stack.length - 1].x * (600 / maze[0][0].mazeSize), (stack[stack.length - 1].y + 1) * (600 / maze[0][0].mazeSize));        
        context.closePath();
        context.fillStyle = 'rgb(128,128,128';
        context.fill();
        context.fillStyle = 'rgba(255, 215, 0, 0.2)';
        context.fill();
    }
}

function renderPath(){
    if(showPath && stack.length > 0){
        for(let i = 0; i < stack.length; i++){
            context.beginPath();
            context.moveTo(stack[i].x * (600 / stack[i].mazeSize), stack[i].y * (600 / stack[i].mazeSize));
            context.lineTo((stack[i].x + 1) * (600 / stack[i].mazeSize), stack[i].y * (600 / stack[i].mazeSize));
            context.lineTo((stack[i].x + 1) * (600 / stack[i].mazeSize), (stack[i].y + 1) * (600 / stack[i].mazeSize));
            context.lineTo(stack[i].x * (600 / stack[i].mazeSize), (stack[i].y + 1) * (600 / stack[i].mazeSize));
            context.closePath();
            context.fillStyle = 'rgb(128,128,128';
            context.fill();
            context.fillStyle = 'rgba(0, 128, 0, 0.2)';
            context.fill();
        }
    }
}

function renderCharacter(character){
    if(character.image.isReady){
        context.drawImage(character.image, character.location.x * (600 / maze[0][0].mazeSize), character.location.y * (600 / maze[0][0].mazeSize), 600 / maze[0][0].mazeSize, 600 / maze[0][0].mazeSize);
    }
}

function renderScore(){
    if(gameRunning){
        var timeLabel = document.getElementById("time-counter");
        var scoreLabel = document.getElementById("score");
        var currTime = performance.now();
        timeLabel.innerHTML = (Math.floor((currTime - startTime) / 1000));
        if(showScore)
            scoreLabel.innerHTML = gameScore;
        else
            scoreLabel.innerHTML = '~';
    }
}

function processInput(){
    for(input in inputState){
        if(maze.length > 0 && gameRunning)
            moveCharacter(inputState[input], myChar);
    }
    inputState = [];
}

function render(){
    context.clear();
    if(maze.length>0){
        renderPath();
        renderHint();
        renderMaze();
        renderCharacter(myChar);
        renderScore();
    }
}

function gameloop(){
    processInput();
    render();

    if(wonGame){
        gameRunning = false;
        highScores.push(gameScore);
        window.alert('Congrats! You finished the maze :)\nCheck the High Scores to see if your score of ' + gameScore + ' made it!');
        wonGame = false;
    }
    requestAnimationFrame(gameloop);
}

let canvas = null;
let context = null;
var myChar = createCharacter('sam.png', null);
let firstGameloop = true;

function startGameloop(size){
    canvas = document.getElementById('maze-canvas');
    context = canvas.getContext('2d');
    showOptionButtons();
    
    CanvasRenderingContext2D.prototype.clear = function(){
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, canvas.width, canvas.height);
        this.restore();
    };

    window.addEventListener('keydown', function(event){
        inputState[event.keyCode] = event.keyCode;
    });
    initializeMaze(size);
    requestAnimationFrame(gameloop);
}