// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS PRINCIPAIS
// ==========================================

const canvas = document.getElementById("snakeCanvas");
// Captura o elemento <canvas> do HTML para poder desenhar nele

const ctx = canvas.getContext("2d");
// Pega o "contexto 2D", que é a nossa ferramenta para desenhar formas na tela

const scoreElement = document.getElementById("score");
// Captura a tag do placar simples da tela

const finalScoreElement = document.getElementById("final-score");
// Captura a tag que exibe a pontuação na tela de Game Over

const gameOverScreen = document.getElementById("game-over-screen");
// Captura o quadro da tela de Game Over para mostrar/esconder

const gridSize = 20;
// Define o tamanho de cada "quadradinho" da grade do jogo em pixels (20x20)

const tileCount = canvas.width / gridSize;
// Calcula quantas casas cabem na tela (400 dividido por 20 = 20 colunas e 20 linhas)

let snake = [];
// Lista que vai guardar a posição x e y de cada parte do corpo da serpente

let food = { x: 0, y: 0 };
// Objeto que armazena a posição X e Y atual da comida

let obstacles = [];
// Lista que guardará os obstáculos fixos do modo Difícil

let dx = gridSize;
// Velocidade/Direção inicial do movimento no eixo X (anda para a direita)

let dy = 0;
// Velocidade/Direção inicial do movimento no eixo Y (parado na vertical)

let score = 0;
// Guarda a pontuação atual da partida

let gameLoopTimeout = null;
// Guarda a referência do temporizador do jogo para poder pausar/parar

let difficulty = 'easy';
// Armazena qual a dificuldade atual (Padrão: fácil)

let speed = 150;
// Tempo em milissegundos entre cada passo da serpente (quanto menor, mais rápido)

let changingDirection = false;
// Trava de segurança para impedir que o jogador aperte duas teclas ao mesmo tempo e se atropele

// ==========================================
// 2. CONTROLE DE DIFICULDADES
// ==========================================

function setDifficulty(level) {
// Função acionada ao clicar nos botões de dificuldade
  difficulty = level;
  // Atualiza a variável de dificuldade com o nível escolhido ('easy', 'medium' ou 'hard')

  document.getElementById("btn-easy").classList.remove("active");
  // Remove a cor de selecionado do botão Fácil
  document.getElementById("btn-medium").classList.remove("active");
  // Remove a cor de selecionado do botão Intermediário
  document.getElementById("btn-hard").classList.remove("active");
  // Remove a cor de selecionado do botão Difícil

  document.getElementById(`btn-${level}`).classList.add("active");
  // Adiciona o estilo iluminado apenas ao botão selecionado no momento

  // Ajusta a velocidade de atualização do jogo de acordo com a dificuldade:
  if (level === 'easy') {
    speed = 150; // Velocidade tranquila/lenta
  } else if (level === 'medium') {
    speed = 100; // Velocidade moderada
  } else if (level === 'hard') {
    speed = 60;  // Velocidade alta e frenética
  }

  resetGame();
  // Reinicia a partida imediatamente com as novas configurações aplicadas
}

// ==========================================
// 3. INICIALIZAÇÃO E REINÍCIO DO JOGO
// ==========================================

function resetGame() {
// Função que prepara a mesa para um novo jogo limpo
  snake = [
  // Define a serpente inicial com 3 pedaços no centro da tela
    { x: 10 * gridSize, y: 10 * gridSize }, // Cabeça
    { x: 9 * gridSize, y: 10 * gridSize },  // Corpo
    { x: 8 * gridSize, y: 10 * gridSize }   // Cauda
  ];

  score = 0;
  // Zera os pontos
  scoreElement.innerText = score;
  // Atualiza o texto do placar para zero na tela

  dx = gridSize;
  // Aponta a direção inicial de movimento para a direita
  dy = 0;
  // Garante que não está se movendo na vertical

  gameOverScreen.classList.remove("show");
  // Esconde a tela de Game Over caso esteja visível

  generateObstacles();
  // Gera barreiras se o jogo estiver na dificuldade Difícil

  generateFood();
  // Coloca a primeira frutinha no mapa

  if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
  // Cancela qualquer ciclo do jogo anterior que estivesse ativo

  mainLoop();
  // Dá o pontapé inicial e começa a rodar a lógica do jogo
}

// ==========================================
// 4. CICLO PRINCIPAL (GAME LOOP)
// ==========================================

function mainLoop() {
// Esta função é o "coração" do jogo: executa repetidamente em ciclo
  if (hasGameEnded()) {
  // Verifica se a serpente bateu ou perdeu o jogo
    showGameOver();
    // Se perdeu, mostra a tela de fim de jogo
    return;
    // Para a execução do ciclo imediatamente
  }

  changingDirection = false;
  // Libera o teclado para receber o próximo comando do jogador

  clearCanvas();
  // Apaga o desenho anterior da tela para pintar o novo quadro limpo

  drawObstacles();
  // Desenha as paredes/obstáculos no mapa (se houver)

  drawFood();
  // Desenha a frutinha na tela

  moveSnake();
  // Atualiza as posições X e Y da serpente

  drawSnake();
  // Desenha a serpente em sua nova posição atualizada

  gameLoopTimeout = setTimeout(mainLoop, speed);
  // Chama esta mesma função novamente após o tempo definido na variável `speed`
}

// ==========================================
// 5. DESENHANDO ELEMENTOS NA TELA (VISUAL NEON)
// ==========================================

function clearCanvas() {
// Limpa a tela inteira para o próximo quadro
  ctx.fillStyle = "#121212";
  // Define a cor de fundo interna do canvas
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Pinta um retângulo preto ocupando toda a área da tela
}

function drawSnake() {
// Função responsável por pintar a serpente bloco por bloco
  snake.forEach((part, index) => {
  // Percorre cada pedaço do corpo da serpente
    const isHead = index === 0;
    // Checa se o pedaço atual é o primeiro elemento (a Cabeça)

    // Se for a cabeça, usamos Amarelo Neon; se for o corpo, usamos Verde Neon
    ctx.fillStyle = isHead ? "#ffff00" : "#00ffcc";
    ctx.shadowColor = isHead ? "#ffff00" : "#00ffcc";
    ctx.shadowBlur = 12; // Aplica o brilho Neon ao redor de cada parte

    ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    // Desenha o bloco com 2px de margem para criar uma separação elegante entre os gomos

    ctx.shadowBlur = 0;
    // Reseta a sombra brilhante para não afetar outras renderizações do sistema
  });
}

function drawFood() {
// Função que pinta a fruta/comida na tela
  ctx.fillStyle = "#ff0055";
  // Define a cor da fruta como Rosa/Vermelho Neon reluzente
  ctx.shadowColor = "#ff0055";
  // Define a cor do brilho da fruta
  ctx.shadowBlur = 15;
  // Aplica um brilho mais intenso na fruta para atrair o olho do jogador

  ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
  // Desenha o quadradinho da fruta na posição sorteada

  ctx.shadowBlur = 0;
  // Limpa a configuração de brilho
}

function drawObstacles() {
// Função que desenha as barreiras físicas no modo Difícil
  if (difficulty !== 'hard') return;
  // Se não estiver no nível difícil, não desenha nada e sai da função

  ctx.fillStyle = "#ff9900";
  // Define a cor dos obstáculos como Laranja Neon
  ctx.shadowColor = "#ff9900";
  // Cor do brilho do obstáculo
  ctx.shadowBlur = 10;
  // Intensidade da luz do obstáculo

  obstacles.forEach(obstacle => {
  // Percorre a lista de obstáculos existentes
    ctx.fillRect(obstacle.x, obstacle.y, gridSize - 2, gridSize - 2);
    // Desenha cada bloco de barreira no mapa
  });

  ctx.shadowBlur = 0;
  // Desliga o efeito de brilho
}

// ==========================================
// 6. LÓGICA DE MOVIMENTO E COLISÃO
// ==========================================

function moveSnake() {
// Calcula o movimento da serpente passo a passo
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  // Cria uma nova posição para a cabeça baseada na velocidade/direção atual

  // MODO FÁCIL: Efeito de Atravessar a Parede (Teleporte de Borda)
  if (difficulty === 'easy') {
    if (head.x < 0) head.x = canvas.width - gridSize; // Se passar da esquerda, volta pela direita
    if (head.x >= canvas.width) head.x = 0;            // Se passar da direita, volta pela esquerda
    if (head.y < 0) head.y = canvas.height - gridSize;// Se passar por cima, volta por baixo
    if (head.y >= canvas.height) head.y = 0;           // Se passar por baixo, volta por cima
  }

  snake.unshift(head);
  // Coloca a nova cabeça no início da lista da serpente

  const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
  // Verifica se as coordenadas da cabeça são exatamente iguais às da comida

  if (hasEatenFood) {
  // Se a cabeça encostou na fruta:
    score += 10;
    // Soma 10 pontos ao placar
    scoreElement.innerText = score;
    // Atualiza o valor do placar na interface de usuário
    generateFood();
    // Sorteia o surgimento de uma nova comida em outro lugar
  } else {
    snake.pop();
    // Se NÃO comeu a comida, remove o último gomo do rabo (mantendo o tamanho constante ao andar)
  }
}

function hasGameEnded() {
// Verifica se o jogador cometeu uma colisão fatal que encerra a partida
  
  // Teste de Colisão com o Próprio Corpo:
  for (let i = 4; i < snake.length; i++) {
  // Percorre do 5º gomo em diante (é impossível bater nos 3 primeiros gomos)
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true; // Bateu no próprio corpo: Fim de Jogo!
    }
  }

  // Teste de Colisão com as Paredes (Aplica apenas nos modos Intermediário e Difícil):
  if (difficulty !== 'easy') {
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    if (hitLeftWall || hitRightWall || hitToptWall || hitBottomWall) {
      return true; // Bateu na parede externa: Fim de Jogo!
    }
  }

  // Teste de Colisão com Obstáculos Laranjas (Aplica apenas no modo Difícil):
  if (difficulty === 'hard') {
    for (let obstacle of obstacles) {
      if (obstacle.x === snake[0].x && obstacle.y === snake[0].y) {
        return true; // Bateu na barreira laranja: Fim de Jogo!
      }
    }
  }

  return false; // Se não colidiu com nada, o jogo continua normalmente
}

function showGameOver() {
// Ativa e renderiza a tela final de derrota
  finalScoreElement.innerText = score;
  // Copia a pontuação final para dentro do painel de Game Over
  gameOverScreen.classList.add("show");
  // Adiciona a classe CSS que torna a janela visível
}

// ==========================================
// 7. GERAÇÃO DE ELEMENTOS ALEATÓRIOS
// ==========================================

function randomTen(min, max) {
// Função auxiliar que gera coordenadas aleatórias alinhadas à grade do jogo
  return Math.floor((Math.random() * (max - min) + min) / gridSize) * gridSize;
}

function generateFood() {
// Sorteia uma posição válida para a fruta
  food.x = randomTen(0, canvas.width - gridSize);
  // Sorteia posição X
  food.y = randomTen(0, canvas.height - gridSize);
  // Sorteia posição Y

  // Evita que a fruta apareça em cima da própria serpente:
  snake.forEach(part => {
    const hasEaten = part.x === food.x && part.y === food.y;
    if (hasEaten) generateFood(); // Se nasceu em cima do corpo da cobra, sorteia de novo recursivamente
  });

  // Evita que a fruta apareça dentro de um obstáculo no modo difícil:
  if (difficulty === 'hard') {
    obstacles.forEach(obstacle => {
      if (obstacle.x === food.x && obstacle.y === food.y) generateFood(); // Sorteia de novo
    });
  }
}

function generateObstacles() {
// Cria blocos de barreiras fixas aleatórias para o modo difícil
  obstacles = [];
  // Limpa a lista de obstáculos antigos

  if (difficulty !== 'hard') return;
  // Se não estiver no modo difícil, ignora e encerra a função

  const obstacleCount = 8;
  // Quantidade total de blocos de barreiras a serem desenhados

  for (let i = 0; i < obstacleCount; i++) {
  // Loop para criar as 8 barreiras
    let obsX = randomTen(0, canvas.width - gridSize);
    let obsY = randomTen(0, canvas.height - gridSize);

    // Evita criar obstáculos muito próximos da área onde a cobra nasce (centro da tela)
    const nearCenter = Math.abs(obsX - 200) < 60 && Math.abs(obsY - 200) < 60;

    if (!nearCenter) {
      obstacles.push({ x: obsX, y: obsY });
      // Adiciona a barreira à lista oficial
    }
  }
}

// ==========================================
// 8. ESCUTA DE TECLAS DE CONTROLE (TECLADO)
// ==========================================

function changeDirection(event) {
// Captura o pressionamento das teclas do teclado do usuário
  const LEFT_KEY = 37;  // Código da Seta para Esquerda
  const RIGHT_KEY = 39; // Código da Seta para Direita
  const UP_KEY = 38;    // Código da Seta para Cima
  const DOWN_KEY = 40;  // Código da Seta para Baixo

  const A_KEY = 65;     // Tecla 'A' (Esquerda)
  const D_KEY = 68;     // Tecla 'D' (Direita)
  const W_KEY = 87;     // Tecla 'W' (Cima)
  const S_KEY = 83;     // Tecla 'S' (Baixo)

  if (changingDirection) return;
  // Se já foi registrado um comando neste passo, ignora comandos extras até o próximo quadro

  const keyPressed = event.keyCode;
  // Descobre o número/código da tecla que o jogador apertou

  const goingUp = dy === -gridSize;
  const goingDown = dy === gridSize;
  const goingRight = dx === gridSize;
  const goingLeft = dx === -gridSize;

  // Garante que a serpente não consiga dar uma "volta de 180° instantânea" sobre si mesma:
  if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
    dx = -gridSize; // Mudar para esquerda
    dy = 0;
    changingDirection = true;
  }

  if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
    dx = 0;
    dy = -gridSize; // Mudar para cima
    changingDirection = true;
  }

  if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
    dx = gridSize;  // Mudar para direita
    dy = 0;
    changingDirection = true;
  }

  if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
    dx = 0;
    dy = gridSize;  // Mudar para baixo
    changingDirection = true;
  }
}

// Adiciona o ouvinte de eventos globais: toda vez que qualquer tecla for apertada, chama `changeDirection`
document.addEventListener("keydown", changeDirection);

// Inicia o jogo automaticamente assim que a página é carregada pela primeira vez
resetGame();

// Fim do Código JavaScript