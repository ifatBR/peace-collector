'use strict';
const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GLUE = 'GLUE';
const GAMER = 'GAMER';

const GAMER_IMG = '<img src="img/hippie.png">';
const BALL_IMG = '<img src="img/peace2.png">';
const GLUE_IMG = '<img src="img/stain2.png">';

var gGamerPos;
var gBoard;
var gBallsCollectedCount;
var gBallsOnBoardCount;
var gAddBallInterval;
var gAddGlueInterval;
var gGluedCellPos;

function init() {
    var elGameOver = document.querySelector('.game-over');
    elGameOver.classList.add('hide');
    gBallsCollectedCount = 0;
    gGluedCellPos = null;
    gGamerPos = { i: 2, j: 9 };

    gBoard = buildBoard();
    renderBoard(gBoard);

    gAddBallInterval = setInterval(addBall, 3000);
    gAddGlueInterval = setInterval(addGlue, 5000);
}

// Create the Matrix 10 * 12
function buildBoard() {
    var board = createMat(10, 12);
    var midI = parseInt(board.length / 2);
    var midJ = parseInt(board[0].length / 2);

    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = { type: FLOOR, gameElement: null };
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                if (i !== midI && j !== midJ) cell.type = WALL;
            }
            board[i][j] = cell;
        }
    }
    // Place the gamer
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    board[2][7].gameElement = BALL;
    board[1][3].gameElement = BALL;
    gBallsOnBoardCount = 2;
    return board;
}

// Render the board to an HTML table
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j });

            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';

            strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gGluedCellPos && gGamerPos.i === gGluedCellPos.i && gGamerPos.j === gGluedCellPos.j) return;

    var passageCoords;

    if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length) {
        passageCoords = returnPassageNextCoords(i, j);
        i = passageCoords.i;
        j = passageCoords.j;
    }

    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;

    // Calculate distance to ake sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === 1 && jAbsDiff === 0) || passageCoords) {
        if (targetCell.gameElement === BALL) {
            ballCollected();
            if (!gBallsOnBoardCount) gameOver();
        }
        //Move the gamer

        //update the model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

        //update the DOM:
        renderCell(gGamerPos, '');

        //update the model
        gGamerPos = { i: i, j: j };
        targetCell.gameElement = GAMER;

        //update the DOM:
        renderCell(gGamerPos, GAMER_IMG);
    } 
}

function returnPassageNextCoords(i, j) {
    var midI = parseInt(gBoard.length / 2);
    var midJ = parseInt(gBoard[0].length / 2);

    if (i <= 0 && j === midJ) i = gBoard.length - 1;
    else if (i >= gBoard.length - 1 && j === midJ) i = 0;
    else if (j <= 0 && i === midI) j = gBoard[0].length - 1;
    else if (j >= gBoard[0].length - 1 && i === midI) j = 0;
    else return null;

    return { i: i, j: j };
}
function ballCollected() {
    var audio = new Audio('../img/charm.mp3');
    audio.play();
    gBallsCollectedCount++;
    var elBallsSelectedCountSpan = document.querySelector('.balls-collected span');
    elBallsSelectedCountSpan.innerText = gBallsCollectedCount;
    gBallsOnBoardCount--;
}
// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location);
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
    var i = gGamerPos.i;
    var j = gGamerPos.j;

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function addBall() {
    var i = getRandomIntImp(1, gBoard.length - 2);
    var j = getRandomIntImp(1, gBoard[0].length - 2);

    while (gBoard[i][j].gameElement) {
        i = getRandomIntImp(1, gBoard.length - 2);
        j = getRandomIntImp(1, gBoard[0].length - 2);
    }

    gBoard[i][j].gameElement = BALL;
    var ballPos = { i: i, j: j };
    renderCell(ballPos, BALL_IMG);
    gBallsOnBoardCount++;
}

function gameOver() {
    clearInterval(gAddBallInterval);
    clearInterval(gAddGlueInterval);
    gAddBallInterval = null;
    gAddGlueInterval = null;

    var elBallsSelectedCountSpan = document.querySelector('.balls-collected span');
    elBallsSelectedCountSpan.innerText = 0;

    var elGameOver = document.querySelector('.game-over');
    elGameOver.classList.remove('hide');
}

function addGlue() {
    // console.log('glue', GLUE_IMG);

    var i = getRandomIntImp(1, gBoard.length - 2);
    var j = getRandomIntImp(1, gBoard[0].length - 2);

    while (gBoard[i][j].gameElement) {
        i = getRandomIntImp(1, gBoard.length - 2);
        j = getRandomIntImp(1, gBoard[0].length - 2);
    }

    gBoard[i][j].gameElement = GLUE;
    gGluedCellPos = { i: i, j: j };
    renderCell(gGluedCellPos, GLUE_IMG);

    setTimeout(removeGlue, 3000, i, j);
}

function removeGlue(i, j) {
    if (gGluedCellPos.i === gGamerPos.i && gGluedCellPos.j === gGamerPos.j) {
        gBoard[i][j].gameElement = GAMER;
        renderCell(gGluedCellPos, GAMER_IMG);
    } else {
        gBoard[i][j].gameElement = '';
        renderCell(gGluedCellPos, '');
    }
    gGluedCellPos = null;
}
