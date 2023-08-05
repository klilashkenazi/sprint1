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
var isTimerRunning = false
var startTime
var gSafeClicksCount
var gMineEx

function onInit() {
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    gGameEnd = false
    stopTimer()
    startTime = Date.now()
    LIVES = (gLevel.size > 4) ? '❤❤❤' : '❤❤'
    renderLives()
    gHint = false
    gfirstClick = false
    gFlagsLeft = (gMineEx) ? gLevel.mines += 3 : gLevel.mines
    gMineEx = false
    displayMinesLeft()
    gSafeClicksCount = 3
    const elP = document.querySelector('p')
    elP.innerText = `${gSafeClicksCount} left`
    const elImgs = document.querySelectorAll('img')
    for (var i = 0; i < elImgs.length; i++) {
        elImgs[i].style.display = 'inline'
    }
}

function setLevel(size, mines) {
    gLevel.size = +size
    gLevel.mines = +mines
    gMineEx = false
    onInit()
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
            strHTML += `<td data-i="${i}" data-j="${j}" class="cell cell-${i}-${j}" oncontextmenu="onCellMarked(this, ${i},${j})" onclick="onCellClicked(this, ${i}, ${j})">${cell}</td>`
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

function displayMinesLeft() {
    const elDiv = document.querySelector('.flags-count')
    elDiv.innerText = `${gFlagsLeft}`
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
    if (gBoard[i][j].isMine && LIVES === '❤' && gHint === false) {
        revealAllMines(gBoard)
        elBtn.innerText = '🤯'
        LIVES = '0'
        gGameEnd = true
        stopTimer()
    } else if (gBoard[i][j].isMine && gHint === false) {
        LIVES = LIVES.slice(0, -1)
        gFlagsLeft--
        displayMinesLeft()
    }
    expandShown(gBoard, elCell, i, j)
    renderBoard(gBoard)
    renderLives()

    if (gHint) showNegs(gBoard, i, j)

    checkGameOver(gBoard)
    // console.log('gFlagsLeft:', gFlagsLeft)
    // console.log('gLevel.mines:', gLevel.mines)
}

function onCellMarked(elCell, i, j) {
    event.preventDefault()
    if (gGameEnd) return
    if (gBoard[i][j].isShown) return
    // console.log(gBoard[i][j].isShown)
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
    console.log('gFlagsLeft:', gFlagsLeft)
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

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true
            }
        }
    }
}

function hint(elImg) {
    if (gfirstClick === false) return
    elImg.classList.add('light')
    gHint = true
    setTimeout(() => {
        elImg.style.display = 'none'
        elImg.classList.remove('light')
    }, 2000)

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

    setTimeout(() => {
        renderBoard(board)

    }, 1000)

    gHint = false
}

function safeClick() {
    if (gfirstClick === false) return
    if (gSafeClicksCount === 0) return
    var safeClicks = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine === false && gBoard[i][j].isShown === false) {
                safeClicks.push({ i, j })
            }
        }
    }
    var location = safeClicks.splice(getRandomInt(0, safeClicks.length), 1)
    var randI = location[0].i
    var randJ = location[0].j

    var elTd = document.querySelector(`.cell-${randI}-${randJ}`)
    console.log(elTd)
    elTd.classList.add('safe')
    setTimeout(() => {
        elTd.classList.remove('safe')
        renderBoard(gBoard)

    }, 2000)
    gSafeClicksCount--
    const elP = document.querySelector('p')
    elP.innerText = `${gSafeClicksCount} left`
}

function mineExterminator() {
    if (gLevel.mines < 4) {
        alert('Can\'t use Mine Exterminator in Beginner level')
        return
    }
    if (gMineEx) return
    if (gfirstClick === false) return
    var mines = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                mines.push({ i, j })
            }
        }
    }
    // console.log(mines)
    for (var i = 0; i < 3; i++) {
        var location = mines.splice(getRandomInt(0, mines.length), 1)
        var randI = location[0].i
        var randJ = location[0].j
        if (gBoard[randI][randJ].isMarked) {
            gBoard[randI][randJ].isMarked = false
            gFlagsLeft++
        }
        gBoard[randI][randJ].isMine = false

    }
    // console.log(mines)
    setMinesNegsCount(gBoard)
    gLevel.mines -= 3
    gFlagsLeft -= 3
    displayMinesLeft()
    renderBoard(gBoard)
    gMineEx = true
    console.log('gFlagsLeft:', gFlagsLeft)
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
    if (isShowncount === nums && gFlagsLeft === 0) {
        const elBtn = document.querySelector('.smiley')
        elBtn.innerText = '😍'
        gGameEnd = true
        stopTimer()
    }
}

function darkMode() {
    const elBody = document.querySelector('body')
    elBody.classList.toggle('dark-mode-body')
}

////////////////////////////////////////////////////////////////////////////////////////

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
    // The maximum is exclusive and the minimum is inclusive
}