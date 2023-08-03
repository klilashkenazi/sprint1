'use strict'

const MINE = '💣'
const FLAG = '🚩'
var LIVES

var gLevel = {
    size: 4,
    mines: 2
}


var gBoard
var gfirstClick
var gHint
var gGameEnd
var gFlagsLeft
var isTimerRunning = false;
var startTime
var gScore

function onInit() {
    gGameEnd = false
    stopTimer()
    startTime=Date.now()
    LIVES = (gLevel.size > 4) ? '❤❤❤' : '❤❤'
    renderLives()
    gHint = false
    gfirstClick = false
    gFlagsLeft = +gLevel.mines
    displayMinesLeft()
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
}

function setLevel(size, mines) {
    gLevel.size = +size
    gLevel.mines = +mines
    onInit()
}

function displayMinesLeft() {
    const elDiv = document.querySelector('.flags-count')
    elDiv.innerText = `${gFlagsLeft}`
}

function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell
            if (!board[i][j].isShown) {
                cell = ''
            } else {
                if (board[i][j].isMine) {
                    cell = MINE
                } else {
                    cell = board[i][j].minesAroundCount
                }
            }
            if (board[i][j].isMarked) cell = FLAG
            strHTML += `<td data-i="${i}" data-j="${j}" class="cell" oncontextmenu="onCellMarked(this, ${i},${j})" onclick="onCellClicked(this, ${i}, ${j})">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('tbody')
    elBoard.innerHTML = strHTML
}

function renderLives() {
    const elSpan = document.querySelector('span')
    elSpan.innerText = LIVES
}

function expandShown(board, elCell, i, j) {
    if (gHint) return
    if (board[i][j].minesAroundCount !== 0 || board[i][j].isMine) return
    for (var rIdx = i - 1; rIdx <= i + 1; rIdx++) {
        if (rIdx < 0 || rIdx >= board.length) continue;
        for (var cIdx = j - 1; cIdx <= j + 1; cIdx++) {
            if (rIdx === i && cIdx === j) continue;
            if (cIdx < 0 || cIdx >= board[0].length) continue;
            board[rIdx][cIdx].isShown = true
        }

    }

}

function getLocations(boardSize, firstClickI, firstClickJ) {
    var locations = []
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (i === firstClickI && j === firstClickJ) continue
            locations.push({ i, j })
        }
    }
    return locations
}

function getMines(boardSize, mines, firstClickI, firstClickJ) {
    var locations = getLocations(boardSize, firstClickI, firstClickJ)
    for (var i = 1; i <= mines; i++) {
        var location = locations.splice(getRandomInt(0, locations.length), 1)
        var randI = location[0].i
        var randJ = +location[0].j
        gBoard[randI][randJ].isMine = true
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = NegsCount(board, i, j)
        }
    }
    renderBoard(board)
}

function NegsCount(board, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            if (board[i][j].isMine) count++
        }
    }
    return count
}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true
            }
        }
    }
}

function onCellClicked(elCell, i, j) {
    const elBtn = document.querySelector('.smiley')
    if (gGameEnd) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine === true && gBoard[i][j].isShown === true) return
    if (gfirstClick === false) {
        getMines(gLevel.size, gLevel.mines, i, j)
        setMinesNegsCount(gBoard)
        gfirstClick = 
        startTimer()
    }
    if (gBoard[i][j].isShown === false) {
        gBoard[i][j].isShown = true
    }
    if (gBoard[i][j].isMine && LIVES === '❤') {
        revealAllMines(gBoard)
        elBtn.innerText = '🤯'
        LIVES = '0'
        gGameEnd = true
        stopTimer()
    } else if (gBoard[i][j].isMine) {
        LIVES = LIVES.slice(0, -1)
        gFlagsLeft--
        displayMinesLeft()
    }
    expandShown(gBoard, elCell, i, j)
    renderBoard(gBoard)
    renderLives()

    if (gHint) showNegs(gBoard, i, j)

    checkGameOver(gBoard)

}


//   function checkScore(elapsedTime){
//     // console.log('score',gScore)
//   }

function onCellMarked(elCell, i, j) {
    event.preventDefault()
    if (gGameEnd) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        gFlagsLeft++
        displayMinesLeft()
    } else {
        gBoard[i][j].isMarked = true
        gFlagsLeft--
        displayMinesLeft()
    }
    renderBoard(gBoard)
    checkGameOver(gBoard)
}

function hint(elImg) {
    elImg.classList.toggle('light')
    gHint = true
}


function showNegs(board, rowIdx, colIdx) {
    var negsToShow = [{ i: rowIdx, j: colIdx }]
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isShown === true) {
                console.log(board[i][j])
                continue
            }
            var location = { i, j }
            negsToShow.push(location)
        }
    }
    console.log(negsToShow)

    for (var i = 0; i < negsToShow.length; i++) {
        board[negsToShow[i].i][negsToShow[i].j].isShown = true
    }
    renderBoard(board)

    for (var i = 0; i < negsToShow.length; i++) {
        board[negsToShow[i].i][negsToShow[i].j].isShown = false
    }

    const elImg = document.querySelector('.light')
    setTimeout(() => {
        renderBoard(board)
        elImg.style.display = 'none'
    }, 1000)

    gHint = false
}

function checkGameOver(board) {
    if (gFlagsLeft !== 0) return
    var isShowncount = 0
    const nums = gLevel.size ** 2 - gLevel.mines
    console.log('nums', nums)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isShown === true) {
                if (board[i][j].isMine === false) isShowncount++
            }
        }
    }
    console.log(isShowncount)
    if (isShowncount === nums && gFlagsLeft === 0) {
        const elBtn = document.querySelector('.smiley')
        const elScore = document.querySelector('.score')
        elBtn.innerText = '😍'
        // elScore.innerText =`Score: ${gScore}`
        gGameEnd = true
        stopTimer()
    }
}

function safeClick(){
    console.log(gBoard)
}
////////////////////////////////////////////////////////////////////////////////////////

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
    // The maximum is exclusive and the minimum is inclusive
}

