'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gLevel = {
    size: 8,
    mines: 14
}

var gBoard
var gMarkCount=0
var gShownCount=0
var gfirstClick=false

function onInit() {
    gBoard = buildBoard(gLevel.size)

    getMines(gLevel.size, gLevel.mines)
    // getLocations(4)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

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
    // console.log(gBoard)
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            // const currCell = board[i][j]
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

function checkGameOver() {



}

function expandShown(board, elCell, i, j) {
    if (board[i][j].minesAroundCount !== 0 || board[i][j].isMine) return
    // console.log(board[i][j].minesAroundCount)
    for (var rIdx = i - 1; rIdx <= i + 1; rIdx++) {
        if (rIdx < 0 || rIdx >= board.length) continue;
        for (var cIdx = j - 1; cIdx <= j + 1; cIdx++) {
            if (rIdx === i && cIdx === j) continue;
            if (cIdx < 0 || cIdx >= board[0].length) continue;
            board[rIdx][cIdx].isShown = true
        }
    }
}

function getLocations(boardSize) {
    var locations = []
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            locations.push({ i, j })
        }
    }
    return locations
}

function getMines(boardSize, mines) {
    var locations = getLocations(boardSize)
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
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isMine) count++;
        }
    }
    // console.log(rowIdx,colIdx,'count:',count)
    return count;
}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) board[i][j].isShown=true
        }
    }
}

function onCellClicked(elCell, i, j) {
    // console.log('elCell', elCell)
    // console.log('i', i)
    // console.log('j', j)
    if (gBoard[i][j].isMarked) return
    gBoard[i][j].isShown = true
    if (gBoard[i][j].isMine) revealAllMines(gBoard)
    
    expandShown(gBoard, elCell, i, j)

    renderBoard(gBoard)
    // console.log(gBoard)

}

function onCellMarked(elCell, i, j) {
    event.preventDefault()
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
    } else {
        gBoard[i][j].isMarked = true
        gMarkCount++
    }
    renderBoard(gBoard)

    console.log(elCell)


}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
    // The maximum is exclusive and the minimum is inclusive
}