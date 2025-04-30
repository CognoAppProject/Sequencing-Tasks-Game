document.addEventListener("DOMContentLoaded", function () {
    const instructionModal = document.getElementById('instruction-modal');
    const startGameBtn = document.getElementById('start-game-btn');
    const stepsList = document.getElementById('steps-list');
    const checkBtn = document.getElementById('check-btn');
    const message = document.getElementById('message');
    const scoreValue = document.getElementById('score-value');
    const levelElement = document.getElementById('level');
    const rewardElement = document.getElementById('reward');
    const timerElement = document.getElementById('timer');

    // Show instructions on load
    window.onload = function () {
        instructionModal.style.display = "flex";
    };

    // Start game
    startGameBtn.onclick = function () {
        instructionModal.style.display = "none";
        loadLevel();
        startTimer();
    };

    const allSteps = [
        "Select a Dish 🍲",
        "Find Recipe 🥣",
        "Prepare Ingredients 📜",
        "Cook 👩‍🍳",
        "Taste 🥢",
        "Serve 🍽️",
        "Eat 🍜",
        "Clean Up 🧼"
    ];

    const levels = [
        { steps: [2, 3, 5, 6], reward: "You unlocked a new recipe! 🎉" },
        { steps: [2, 3, 4, 5, 6], reward: "You unlocked a new recipe! 🥳" },
        { steps: [2, 3, 4, 5, 6, 7], reward: "You unlocked a new recipe! ✨" },
        { steps: [1, 2, 3, 4, 5, 6, 7], reward: "You unlocked a new recipe! 🎊" },
        { steps: [0, 1, 2, 3, 4, 5, 6, 7], reward: "You earned a gold medal 🏅" }
    ];

    let currentLevel = 0;
    let score = 0;
    let timerInterval;
    let startTime;
    let elapsedTime = 0;

    function loadLevel() {
        levelElement.textContent = currentLevel + 1;
        stepsList.innerHTML = '';
        rewardElement.textContent = '';
        message.textContent = '';

        levels[currentLevel].steps.forEach(stepIndex => {
            const step = document.createElement('li');
            step.textContent = allSteps[stepIndex];
            step.setAttribute('draggable', true);
            step.setAttribute('data-index', stepIndex);
            stepsList.appendChild(step);
        });

        shuffleSteps();
    }

    function shuffleSteps() {
        for (let i = stepsList.children.length; i >= 0; i--) {
            stepsList.appendChild(stepsList.children[Math.random() * i | 0]);
        }
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = `Time: ${elapsedTime}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    stepsList.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.index);
    });

    stepsList.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    stepsList.addEventListener('drop', function (event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        const draggedItem = document.querySelector(`li[data-index="${data}"]`);
        const targetItem = event.target.closest('li');
        if (draggedItem && targetItem && draggedItem !== targetItem) {
            stepsList.insertBefore(draggedItem, targetItem);
        }
    });

    checkBtn.addEventListener('click', function () {
        const userOrder = Array.from(stepsList.children).map(step => parseInt(step.getAttribute('data-index')));

        if (JSON.stringify(userOrder) === JSON.stringify(levels[currentLevel].steps)) {
            message.textContent = "Correct Order! 🎉";
            message.style.color = "green";
            score += 10;
            scoreValue.textContent = score;

            if (currentLevel < levels.length - 1) {
                rewardElement.textContent = levels[currentLevel].reward;
                currentLevel++;
                setTimeout(() => {
                    loadLevel();
                }, 1500);
            } else {
                stopTimer();
                message.textContent = "Congratulations! You completed all levels!";
                rewardElement.textContent = "🏆 Game Over!";
                checkBtn.disabled = true;

                // Submit result to Android
                if (window.Android && Android.submitResult) {
                    Android.submitResult("Sequencing Tasks Game", score, elapsedTime);
                    console.log("Result submitted to Android:", score, elapsedTime);
                }
            }
        } else {
            message.textContent = "Incorrect Order! Try Again!";
            message.style.color = "red";
        }
    });
});
