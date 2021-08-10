let AudioManager = null;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getAvailableCat = (activeCats) => {
    if (activeCats.length === 9) {
        console.error('cat overflow');
        return null;
    }

    let validCat = null;
    while (validCat === null) {
        const position = getRandomIntInclusive(1, 9);
        if (!activeCats.includes(position)) {
            validCat = position;
        }
    }

    return validCat;
};

const removeCatPosition = (position, cats) =>
    cats.filter((cat) => cat !== position);

const MAX_CATS = 4;
const POINT_VALUE = 200;
const MATCH_TIME = 30 * 1000;
// const MATCH_TIME = 5 * 1000;

const cats = document.querySelectorAll('.cat');
const boops = document.querySelectorAll('.boop');
const scoreElement = document.querySelector('.scoreText');
const highScoreElement = document.querySelector('.highScoreText');
const remaingTimeElement = document.querySelector('.remaingTimeText');
const startScreen = document.querySelector('.startScreen');
const endScreen = document.querySelector('.endScreen');
const newHighScoreText = document.querySelector('.newHighScoreText');
const finalScoreElement = document.querySelector('.finalScoreText');
const finalHighScoreElement = document.querySelector('.finalHighScoreText');
const playButton = document.querySelector('.playButton');
const playHardButton = document.querySelector('.playHardButton');
const playAgainButton = document.querySelector('.playAgainButton');
const playHardAgainButton = document.querySelector('.playHardAgainButton');
const toggleSoundButton = document.querySelector('.toggleSoundButton');

let activeCatPositions = [];
let score = 0;
let highScore = 0;
let mulitplier = 1;
let isRunning = false;
let startTime = null;
let remainigTime = MATCH_TIME;

const updateUI = () => {
    remaingTimeElement.textContent = `${remainigTime}s`;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
};

const updateScore = (currentScore) => {
    const nextScore = currentScore + POINT_VALUE;
    return nextScore;
};

const updateHighScore = (currentScore) => {
    const newHighScore = currentScore > highScore ? currentScore : highScore;
    localStorage.setItem('catHighScore', newHighScore);
    return newHighScore;
};

const loadHighScore = () => {
    const savedHighScore = localStorage.getItem('catHighScore');
    return savedHighScore ? savedHighScore : 0;
};

const resetGame = () => {
    activeCatPositions = [];
    score = 0;
    highScore = loadHighScore();
    mulitplier = 1;
    startTime = Date.now();

    console.log('highScore', highScore);

    cats.forEach((cat) => {
        cat.classList.remove('popUp');
        cat.classList.remove('popDown');
    });
    boops.forEach((boop) => boop.classList.remove('popUp'));
    updateHighScore(score);
    playButton.classList.add('hidden');
};

const createAudioManager = () => {
    let isSoundEnabled = true;
    let sources = [];
    const audio = new Audio('./audio/528193__fthgurdy__cat-meow-2.wav');

    const getAvailable = () => sources.find((s) => !!s.paused);

    const getOrCreateSource = () => {
        const available = getAvailable();
        if (available) {
            return available;
        } else {
            const newSource = audio.cloneNode();
            sources = [...sources, newSource];
            return newSource;
        }
    };
    return {
        play: () => isSoundEnabled && getOrCreateSource().play(),
        toggleSound: () => (isSoundEnabled = !isSoundEnabled),
        isSoundEnabled: () => isSoundEnabled,
    };
};

boops.forEach((boop) => {
    boop.addEventListener('animationend', (e) =>
        e.target.classList.remove('popUp')
    );
});

cats.forEach((cat) => {
    cat.addEventListener('click', (e) => {
        e.target.classList.remove('popUp');
        const position = Number(e.target.getAttribute('data-position'));
        const boop = e.target.parentElement.querySelector(
            `.boop[data-position="${position}"]`
        );
        boop.classList.add('popUp');
        activeCatPositions = removeCatPosition(position, activeCatPositions);
        console.log('clicked on cat', position);
        if (isRunning) {
            score = updateScore(score);
            AudioManager.play();
            updateUI();
        }
    });

    cat.addEventListener('animationend', (e) => {
        if (e.animationName === 'popUp') {
            e.target.classList.remove('popUp');
            const position = Number(e.target.getAttribute('data-position'));
            activeCatPositions = removeCatPosition(
                position,
                activeCatPositions
            );
            console.log('animtion ended on cat', position, activeCatPositions);
        }
    });
});

AudioManager = createAudioManager();

playButton.addEventListener('click', (e) => {
    startScreen.classList.add('startGame');
    startIntro(800);
});

playAgainButton.addEventListener('click', (e) => {
    endScreen.classList.add('startGame');
    endScreen.classList.remove('endGame');
    startIntro(800);
});

playHardButton.addEventListener('click', (e) => {
    startScreen.classList.add('startGame');
    startIntro(100);
});

playHardAgainButton.addEventListener('click', (e) => {
    endScreen.classList.add('startGame');
    endScreen.classList.remove('endGame');
    startIntro(100);
});

toggleSoundButton.addEventListener('click', (e) => {
    AudioManager.toggleSound();
    toggleSoundButton.innerHTML = `Sound: ${
        AudioManager.isSoundEnabled() ? 'ON' : 'OFF'
    }`;
});

const showEndScreen = (currentScore, currentHighScore, hasNewHighScore) => {
    if (hasNewHighScore) {
        newHighScoreText.classList.remove('hidden');
    } else {
        newHighScoreText.classList.add('hidden');
    }

    finalScoreElement.textContent = currentScore;
    finalHighScoreElement.textContent = currentHighScore;

    endScreen.classList.add('endGame');
};

const startIntro = (speed) => {
    cats.forEach((cat) => {
        cat.classList.add('popDown');
    });

    setTimeout(() => startGame(speed), 1000);
};

const startGame = (speed) => {
    isRunning = true;
    resetGame();

    const gameInterval = setInterval(() => {
        if (isRunning && activeCatPositions.length <= MAX_CATS) {
            const position = getAvailableCat(activeCatPositions);
            const cat = document.querySelector(
                `.cat[data-position="${position}"]`
            );
            cat.classList.add('popUp');
            activeCatPositions.push(position);
            remainigTime = Math.floor(
                (MATCH_TIME - (Date.now() - startTime)) / 1000
            );

            updateUI();
        }
    }, speed);

    setTimeout(() => {
        console.log('game completed');
        clearInterval(gameInterval);
        const hasNewHighScore = score > highScore;

        isRunning = false;
        highScore = updateHighScore(score);
        updateUI();
        playButton.classList.remove('hidden');

        showEndScreen(score, highScore, hasNewHighScore);
    }, MATCH_TIME);
};
