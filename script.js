// Game state
let topics = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

// DOM elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestions = document.getElementById('total-questions');
const finalScore = document.getElementById('final-score');
const maxScore = document.getElementById('max-score');
const scorePercentage = document.getElementById('score-percentage');
const topicSelect = document.getElementById('topic-select');

// Load topics manifest
async function loadTopics() {
    try {
        const response = await fetch('questions/topics.json');
        if (!response.ok) {
            throw new Error('Failed to load topics');
        }
        topics = await response.json();
        return topics;
    } catch (error) {
        console.error('Error loading topics:', error);
        alert('Failed to load topics. Please make sure questions/topics.json exists.');
        return [];
    }
}

// Populate topic selector dropdown
function populateTopicSelector() {
    topicSelect.innerHTML = '';
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.file;
        option.textContent = topic.name;
        topicSelect.appendChild(option);
    });
}

// Load questions from JSON file
async function loadQuestions(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Failed to load questions');
        }
        questions = await response.json();
        return questions;
    } catch (error) {
        console.error('Error loading questions:', error);
        alert(`Failed to load questions from ${file}.`);
        return [];
    }
}

// Initialize game
async function initGame() {
    topics = await loadTopics();
    if (topics.length === 0) {
        return;
    }
    populateTopicSelector();
    
    currentQuestionIndex = 0;
    score = 0;
    updateScoreDisplay();
    showScreen('start');
}

// Start game with selected topic
async function startGame() {
    const selectedFile = topicSelect.value;
    questions = await loadQuestions(selectedFile);
    if (questions.length === 0) {
        return;
    }
    
    shuffleArray(questions);
    currentQuestionIndex = 0;
    score = 0;
    updateScoreDisplay();
    totalQuestions.textContent = questions.length;
    displayQuestion();
    showScreen('question');
}

// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Show specific screen
function showScreen(screenName) {
    startScreen.classList.add('hidden');
    questionScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');

    switch (screenName) {
        case 'start':
            startScreen.classList.remove('hidden');
            break;
        case 'question':
            questionScreen.classList.remove('hidden');
            break;
        case 'results':
            resultsScreen.classList.remove('hidden');
            break;
    }
}

// Display current question
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    currentQuestionNum.textContent = currentQuestionIndex + 1;
    
    // Clear previous answers
    answersContainer.innerHTML = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    selectedAnswer = null;

    // Shuffle answers
    const answers = [...question.incorrect, question.correct];
    shuffleArray(answers);

    // Create answer buttons
    answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.addEventListener('click', () => selectAnswer(answer, question.correct, button));
        answersContainer.appendChild(button);
    });
}

// Handle answer selection
function selectAnswer(selected, correct, buttonElement) {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    selectedAnswer = selected;
    const allButtons = document.querySelectorAll('.answer-btn');
    
    // Disable all buttons
    allButtons.forEach(btn => btn.disabled = true);

    // Mark correct and incorrect answers
    allButtons.forEach(btn => {
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        } else if (btn.textContent === selected && selected !== correct) {
            btn.classList.add('incorrect');
        }
    });

    // Update score and show feedback
    if (selected === correct) {
        score++;
        updateScoreDisplay();
        feedback.textContent = 'Correct! ✓';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `Incorrect! The correct answer is: ${correct}`;
        feedback.className = 'feedback incorrect';
    }

    // Move to next question after a delay
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

// Show results screen
function showResults() {
    const percentage = Math.round((score / questions.length) * 100);
    finalScore.textContent = score;
    maxScore.textContent = questions.length;
    scorePercentage.textContent = `${percentage}%`;
    showScreen('results');
}

// Event listeners
startBtn.addEventListener('click', startGame);

restartBtn.addEventListener('click', () => {
    initGame();
});

// Initialize game on page load
initGame();

