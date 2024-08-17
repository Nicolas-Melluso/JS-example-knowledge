let gridSize = 3;
let firstCard = null;
let secondCard = null;
let pairsFound = 0;
let boardLocked = false;

localStorage.setItem('level', 1);
localStorage.setItem('fliped-cards', 0);
localStorage.setItem('pair-cards', 0);
localStorage.setItem('score', 0);

newGame();

async function newGame() {
  pairsFound = 0;
  const cards = await getCardImages();
  createBoard(shuffleCards(cards));
};

function shuffleCards(cards) {
  return cards.sort(() =>0.5 - Math.random());
}

async function getCardImages() {
  const cards = [];
  const numberOfImages = Math.floor((gridSize * gridSize) / 2);
  let j = gridSize - 2;

  for (let i = 1; i <= numberOfImages; i++) {
    try {
      let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${j}`);
      j += 3;
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const pokemon = await response.json();

      cards.push(pokemon.sprites.front_default);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  return cards.concat(cards);
}

function createBoard(cards) {
  const gameBoard = document.getElementById('game-board'); 
  gameBoard.classList.add(`grid-${gridSize}x${gridSize}`);

  cards.forEach((cardImage) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.textContent = cardImage;
    cardElement.addEventListener('click', flipCard);
    gameBoard.appendChild(cardElement);
  });
}

function flipCard() {
  if (boardLocked || this === firstCard) return; 
  this.classList.add('flipped')

  let flipedCards = localStorage.getItem('fliped-cards');
  flipedCards = JSON.parse(flipedCards);
  flipedCards++;
  document.getElementById('fliped-cards').innerHTML = `Fliped cards ${flipedCards}`;
  localStorage.setItem('fliped-cards', JSON.stringify(flipedCards));

  let score = localStorage.getItem('score');
  score = JSON.parse(score);
  score-=10;
  document.getElementById('score').innerHTML = `Score ${score}`;
  localStorage.setItem('score', JSON.stringify(score));

  this.style.backgroundImage = `url(${this.dataset.textContent})`;
  
  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  boardLocked = true; 
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.textContent === secondCard.dataset.textContent;

  if (isMatch) {

    let pairCards = localStorage.getItem('pair-cards');
    pairCards = JSON.parse(pairCards);
    pairCards++;
    document.getElementById('pair-cards').innerHTML = `Pair winned ${pairCards}`;
    localStorage.setItem('pair-cards', JSON.stringify(pairCards));

    let score = localStorage.getItem('score');
    score = JSON.parse(score);
    score+=40;
    document.getElementById('score').innerHTML = `Score ${score}`;
    localStorage.setItem('score', JSON.stringify(score));


    disableCards();
    pairsFound++;

    if (pairsFound === Math.floor((gridSize * gridSize) / 2)) {
      setTimeout(() => {
        if (gridSize < 10) {
            gridSize++;

            let level = localStorage.getItem('level');
            level = JSON.parse(level);
            level++;
            document.getElementById('level').innerHTML = `Level ${level}`;
            localStorage.setItem('level', JSON.stringify(level));

            let score = localStorage.getItem('score');
            score = JSON.parse(score);
            score+=(60 * level);
            document.getElementById('score').innerHTML = `Score ${score}`;
            localStorage.setItem('score', JSON.stringify(score));

            const gameBoard = document.getElementById('game-board');
            gameBoard.innerHTML = '';
            newGame();
        } else {
            const winner = document.getElementById('announce');
            winner.innerHTML = 'Congrats, you finished the game!';
            resetGame();
        }
      }, 1000);
    } else {
      resetBoard();
    }
  } else {
    unflipCards();
  }
}

function disableCards() {
  if (firstCard && secondCard) {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
  }
}

function unflipCards() {
  setTimeout(() => {
    if (firstCard && secondCard) {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.style.backgroundImage = '';
      secondCard.style.backgroundImage = '';
    }
    resetBoard();
  }, 1000);
}

function resetGame() {
  gridSize = 3;
  pairsFound = 0;
  firstCard = null;
  secondCard = null;
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = ''; 
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
}
