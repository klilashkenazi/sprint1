'use strict'


function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        startTime = Date.now();
        setInterval(updateTime, 250);
    }
}

function stopTimer() {
    isTimerRunning = false;
}

function updateTime() {
    if (isTimerRunning) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const formattedTime = formatTime(elapsedTime);
      // console.log(elapsedTime)
  
      document.getElementById('timeDisplay').innerText = formattedTime;
      // checkScore(elapsedTime)
    }
  }
  function formatTime(timeInMilliseconds) {
    const milSeconds = Math.floor(timeInMilliseconds) % 60;
    const seconds = Math.floor(timeInMilliseconds / 1000) % 60;
    const minutes = Math.floor(timeInMilliseconds / (1000 * 60)) % 60

    return `${padZero(minutes)}:${padZero(seconds)}:${padZero(milSeconds)}`;
}

function padZero(number) {
    return number.toString().padStart(2, '0');
  }