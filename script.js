document.addEventListener("DOMContentLoaded", () => {
  candyCrushGame();
});

function candyCrushGame() {
  const grid = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const timerDisplay = document.getElementById("timer");
  const modeSelection = document.getElementById("modeSelection");
  const endlessButton = document.getElementById("endlessMode");
  const timedButton = document.getElementById("timedMode");
  const changeModeButton = document.getElementById("changeMode");

  const width = 8;
  const squares = [];
  let score = 0;
  let currentMode = null;
  let timeLeft = 0;
  let gameInterval = null;
  let timerInterval = null;

  // Ícones de hábitos saudáveis (bons) e não saudáveis (ruins)
  const healthyIcons = [
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f34e.svg)", // maçã
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f34a.svg)", // laranja
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f349.svg)", // melancia
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f966.svg)", // brócolis
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f4aa.svg)", // exercício
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f4a7.svg)"  // água
  ];

  const unhealthyIcons = [
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f354.svg)", // hambúrguer
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f35f.svg)", // batata frita
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f37f.svg)", // pipoca
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f37b.svg)", // bebida alcoólica
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f37d.svg)", // prato cheio/gordura
    "url(https://twemoji.maxcdn.com/v/latest/svg/1f6ac.svg)"  // cigarro
  ];

  // Array geral, misturando bons e ruins
  const allIcons = healthyIcons.concat(unhealthyIcons);

  // Map para saber se um ícone é bom ou ruim (pelo índice no array allIcons)
  function isHealthy(index) {
    return index < healthyIcons.length;
  }

  // Cria o tabuleiro
  function createBoard() {
    grid.innerHTML = "";
    squares.length = 0;

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.setAttribute("draggable", true);
      square.setAttribute("id", i);
      const randomIndex = Math.floor(Math.random() * allIcons.length);
      square.dataset.iconIndex = randomIndex; // guarda qual ícone está ali
      square.style.backgroundImage = allIcons[randomIndex];
      grid.appendChild(square);
      squares.push(square);
    }

    squares.forEach(square => square.addEventListener("dragstart", dragStart));
    squares.forEach(square => square.addEventListener("dragend", dragEnd));
    squares.forEach(square => square.addEventListener("dragover", dragOver));
    squares.forEach(square => square.addEventListener("dragenter", dragEnter));
    squares.forEach(square => square.addEventListener("dragleave", dragLeave));
    squares.forEach(square => square.addEventListener("drop", dragDrop));
  }

  let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced, indexBeingDragged, indexBeingReplaced;

  function dragStart() {
    colorBeingDragged = this.style.backgroundImage;
    squareIdBeingDragged = parseInt(this.id);
    indexBeingDragged = parseInt(this.dataset.iconIndex);
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dragEnter(e) {
    e.preventDefault();
  }

  function dragLeave() {}

  function dragDrop() {
    colorBeingReplaced = this.style.backgroundImage;
    squareIdBeingReplaced = parseInt(this.id);
    indexBeingReplaced = parseInt(this.dataset.iconIndex);

    this.style.backgroundImage = colorBeingDragged;
    this.dataset.iconIndex = indexBeingDragged;

    squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    squares[squareIdBeingDragged].dataset.iconIndex = indexBeingReplaced;
  }

  function dragEnd() {
    let validMoves = [
      squareIdBeingDragged - 1,
      squareIdBeingDragged - width,
      squareIdBeingDragged + 1,
      squareIdBeingDragged + width
    ];
    let validMove = validMoves.includes(squareIdBeingReplaced);

    if (squareIdBeingReplaced !== null && validMove) {
      squareIdBeingReplaced = null;
    } else {
      // volta ao original
      if (squareIdBeingReplaced !== null) {
        squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
        squares[squareIdBeingReplaced].dataset.iconIndex = indexBeingReplaced;

        squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].dataset.iconIndex = indexBeingDragged;
      }
    }
  }

  // Faz “cair” os ícones
  function moveIntoSquareBelow() {
    for (let i = 0; i < width; i++) {
      if (squares[i].style.backgroundImage === "") {
        const randomIndex = Math.floor(Math.random() * allIcons.length);
        squares[i].style.backgroundImage = allIcons[randomIndex];
        squares[i].dataset.iconIndex = randomIndex;
      }
    }

    for (let i = 0; i < width * (width - 1); i++) {
      if (squares[i + width].style.backgroundImage === "") {
        squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
        squares[i + width].dataset.iconIndex = squares[i].dataset.iconIndex;
        squares[i].style.backgroundImage = "";
        squares[i].dataset.iconIndex = "";
      }
    }
  }

  // FUNÇÕES DE MATCH – AGORA COM PONTOS POSITIVOS E NEGATIVOS

  function handleMatch(indices) {
    if (!indices.length) return;

    const first = squares[indices[0]];
    const iconIndex = parseInt(first.dataset.iconIndex);
    if (isNaN(iconIndex)) return;

    const allSame = indices.every(index => {
      const sq = squares[index];
      return (
        sq.style.backgroundImage === first.style.backgroundImage &&
        sq.style.backgroundImage !== ""
      );
    });

    if (!allSame) return;

    const qtd = indices.length;
    // Se for hábito saudável: ganha pontos
    // Se for hábito ruim: perde pontos
    const base = (qtd === 4) ? 4 : 3;
    if (isHealthy(iconIndex)) {
      score += base;
    } else {
      score -= base;
    }

    scoreDisplay.innerHTML = score;

    // Limpa os quadrados
    indices.forEach(index => {
      squares[index].style.backgroundImage = "";
      squares[index].dataset.iconIndex = "";
    });
  }

  function checkRowForFour() {
    for (let i = 0; i < 60; i++) {
      if (i % width >= width - 3) continue;
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      handleMatch(rowOfFour);
    }
  }

  function checkColumnForFour() {
    for (let i = 0; i < 40; i++) {
      const columnOfFour = [i, i + width, i + 2 * width, i + 3 * width];
      handleMatch(columnOfFour);
    }
  }

  function checkRowForThree() {
    for (let i = 0; i < 62; i++) {
      if (i % width >= width - 2) continue;
      const rowOfThree = [i, i + 1, i + 2];
      handleMatch(rowOfThree);
    }
  }

  function checkColumnForThree() {
    for (let i = 0; i < 48; i++) {
      const columnOfThree = [i, i + width, i + 2 * width];
      handleMatch(columnOfThree);
    }
  }

  function gameLoop() {
    checkRowForFour();
    checkColumnForFour();
    checkRowForThree();
    checkColumnForThree();
    moveIntoSquareBelow();
  }

  // Iniciar jogo
  function startGame(mode) {
    currentMode = mode;
    modeSelection.style.display = "none";
    grid.style.display = "flex";
    document.querySelector(".scoreBoard").style.display = "flex";

    createBoard();
    score = 0;
    scoreDisplay.innerHTML = score;

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);

    if (mode === "timed") {
      timeLeft = 120;
      updateTimerDisplay();
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          endGame();
        }
      }, 1000);
    } else {
      timerDisplay.innerHTML = "";
      if (timerInterval) clearInterval(timerInterval);
    }
  }

  function updateTimerDisplay() {
    if (currentMode === "timed") {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.innerHTML = `Tempo restante: ${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      timerDisplay.innerHTML = "";
    }
  }

  function endGame() {
    clearInterval(gameInterval);
    squares.forEach(square => square.setAttribute("draggable", false));
    alert(`Fim do tempo! Sua pontuação foi: ${score}`);
  }

  function changeMode() {
    clearInterval(gameInterval);
    if (timerInterval) clearInterval(timerInterval);
    grid.style.display = "none";
    document.querySelector(".scoreBoard").style.display = "none";
    modeSelection.style.display = "flex";
  }

  endlessButton.addEventListener("click", () => startGame("endless"));
  timedButton.addEventListener("click", () => startGame("timed"));
  changeModeButton.addEventListener("click", changeMode);
}