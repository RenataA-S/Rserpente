// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS PRINCIPAIS
// ==========================================

const canvas = document.getElementById("snakeCanvas");
// Busca e armazena o elemento <canvas> do HTML no script

const ctx = canvas.getContext("2d");
// Obtém o contexto de desenho 2D para renderizar as formas na tela

const scoreElement = document.getElementById("score");
// Armazena a tag do placar em tempo real

const finalScoreElement = document.getElementById("final-score");
// Armazena a tag do placar na tela de fim de jogo

const gameOverScreen = document.getElementById("game-over-screen");
// Armazena a camada visual da tela de Game Over

const gridSize = 20;
// Define o tamanho fixo de cada bloco da grade em 20x20 pixels

const tileCount = canvas.width / gridSize;
// Calcula a quantidade de casas da grade (700 / 20 = 35 colunas e linhas)

let snake = [];
// Lista para registrar as coordenadas das partes do corpo da serpente

let food = { x: 0, y: 0 };
// Objeto que armazena a posição X e Y da fruta no mapa

let obstacles = [];
// Lista com as coordenadas das barreiras no modo difícil

let dx = gridSize;
// Velocidade e direção horizontal inicial (movimento para a direita)

let dy = 0;
// Velocidade e direção vertical inicial (parado na vertical)

let score = 0;
// Variável numérica que acumula a pontuação atual

let gameLoopTimeout = null;
// Guarda a referência do temporizador de execução do jogo

let difficulty = 'easy';
// Guarda a dificuldade selecionada (Padrão: fácil)

let speed = 150;
// Define o tempo em milissegundos a cada passo (menor valor = jogo mais rápido)

let changingDirection = false;
// Trava que impede dois comandos seguidos no mesmo quadro para evitar colisão acidental

// ==========================================
// 2. CONTROLE DE DIFICULDADES
// ==========================================

function setDifficulty(level) {
// Função disparada ao clicar nos botões de escolha de nível
  difficulty = level;
  // Atualiza a variável com o nível escolhido ('easy', 'medium' ou 'hard')

  document.getElementById("btn-easy").classList.remove("active");
  // Remove o estado de selecionado do botão Fácil
  document.getElementById("btn-medium").classList.remove("active");
  // Remove o estado de selecionado do botão Intermediário
  document.getElementById("btn-hard").classList.remove("active");
  // Remove o estado de selecionado do botão Difícil

  document.getElementById(`btn-${level}`).classList.add("active");
  // Adiciona o brilho de botão ativo apenas na opção clicada

  if (level === 'easy') {
    speed = 150; // Velocidade lenta para nível fácil
  } else if (level === 'medium') {
    speed = 100; // Velocidade moderada para nível intermediário
  } else if (level === 'hard') {
    speed = 60;  // Velocidade rápida para nível difícil
  }

  resetGame();
  // Reinicia a partida imediatamente aplicando a nova dificuldade
}

// ==========================================
// 3. INICIALIZAÇÃO E REINÍCIO DO JOGO
// ==========================================

function resetGame() {
// Limpa e reinicia todos os dados para uma nova partida
  const startX = Math.floor(tileCount / 2) * gridSize;
  const startY = Math.floor(tileCount / 2) * gridSize;

  snake = [
  // Define o corpo inicial da serpente com 3 gomos no centro da tela
    { x: startX, y: startY },                 // Posição da Cabeça
    { x: startX - gridSize, y: startY },      // Posição do Corpo
    { x: startX - (2 * gridSize), y: startY } // Posição da Cauda
  ];

  score = 0;
  // Zera a pontuação no código
  scoreElement.innerText = score;
  // Atualiza o valor zero no placar visível na tela

  dx = gridSize;
  // Restaura a direção inicial para a direita
  dy = 0;
  // Zera o movimento vertical

  gameOverScreen.classList.remove("show");
  // Oculta o painel de Game Over se estiver aberto

  generateObstacles();
  // Cria os obstáculos do modo difícil se essa opção estiver ativa

  generateFood();
  // Sorteia a posição da primeira fruta do jogo

  if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
  // Interrompe qualquer temporizador antigo ainda em execução

  mainLoop();
  // Dá o pontapé inicial no ciclo de funcionamento do jogo
}

// ==========================================
// 4. CICLO PRINCIPAL (GAME LOOP)
// ==========================================

function mainLoop() {
// Função contínua que executa todos os passos do jogo em sequência
  if (hasGameEnded()) {
  // Verifica se ocorreu alguma colisão fatal
    showGameOver();
    // Exibe a tela de aviso de derrota
    return;
    // Interrompe o ciclo do jogo imediatamente
  }

  changingDirection = false;
  // Libera a leitura de um novo comando de tecla

  clearCanvas();
  // Limpa o desenho do quadro anterior

  drawObstacles();
  // Desenha os obstáculos em tela (caso existam)

  drawFood();
  // Desenha a fruta no mapa

  moveSnake();
  // Atualiza as coordenadas de movimento da serpente

  drawSnake();
  // Desenha a serpente em sua nova posição

  gameLoopTimeout = setTimeout(mainLoop, speed);
  // Reexecuta a função mainLoop repetidamente conforme a velocidade configurada
}

// ==========================================
// 5. DESENHANDO ELEMENTOS NA TELA
// ==========================================

function clearCanvas() {
// Limpa toda a área útil da tela para evitar rastros visuais
  ctx.fillStyle = "#121212";
  // Define a cor de fundo interna do canvas
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Pinta um retângulo cobrindo toda a área de 700x700 pixels
}

function drawSnake() {
// Pinta cada gomo da serpente com visual brilhante
  snake.forEach((part, index) => {
  // Percorre todas as partes do corpo da serpente
    const isHead = index === 0;
    // Identifica se o segmento atual é o primeiro elemento (a Cabeça)

    ctx.fillStyle = isHead ? "#ffee00" : "#00ffcc";
    // Define a cor: Amarelo Neon para a Cabeça e Verde Neon para o Corpo
    ctx.shadowColor = isHead ? "#ffee00" : "#00ffcc";
    // Define a cor do brilho acompanhando o elemento
    ctx.shadowBlur = 14;
    // Aplica a intensidade de iluminação em volta do bloco

    ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    // Desenha o bloco com margem de 2px para separar cada gomo visualmente

    ctx.shadowBlur = 0;
    // Desliga a sombra brilhante para não afetar os demais desenhos da tela
  });
}

function drawFood() {
// Pinta a fruta na tela com destaque
  ctx.fillStyle = "#ff0055";
  // Define a cor da fruta como Rosa/Vermelho Neon
  ctx.shadowColor = "#ff0055";
  // Define a cor do brilho da fruta
  ctx.shadowBlur = 16;
  // Aplica luz forte para chamar atenção do jogador

  ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
  // Desenha o quadrado da fruta no local sorteado

  ctx.shadowBlur = 0;
  // Limpa as configurações de brilho
}

function drawObstacles() {
// Pinta as barreiras físicas do modo difícil
  if (difficulty !== 'hard') return;
  // Se não estiver na dificuldade difícil, interrompe a função

  ctx.fillStyle = "#ff9900";
  // Cor Laranja Neon para indicar perigo
  ctx.shadowColor = "#ff9900";
  // Cor do brilho do obstáculo
  ctx.shadowBlur = 10;
  // Intensidade da sombra brilhante das barreiras

  obstacles.forEach(obstacle => {
  // Percorre a lista de barreiras salvas
    ctx.fillRect(obstacle.x, obstacle.y, gridSize - 2, gridSize - 2);
    // Desenha o bloco da barreira na tela
  });

  ctx.shadowBlur = 0;
  // Desativa o efeito de iluminação
}

// ==========================================
// 6. LÓGICA DE MOVIMENTO E COLISÃO
// ==========================================

function moveSnake() {
// Calcula o deslocamento e o crescimento da serpente
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  // Calcula a nova posição da cabeça somando o deslocamento atual

  if (difficulty === 'easy') {
  // Regra do modo Fácil: Atravessar bordas (Teleporte)
    if (head.x < 0) head.x = canvas.width - gridSize; // Se sair pela esquerda, reaparece na direita
    if (head.x >= canvas.width) head.x = 0;            // Se sair pela direita, reaparece na esquerda
    if (head.y < 0) head.y = canvas.height - gridSize;// Se sair por cima, reaparece por baixo
    if (head.y >= canvas.height) head.y = 0;           // Se sair por baixo, reaparece por cima
  }

  snake.unshift(head);
  // Adiciona a nova posição da cabeça no início da lista

  const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
  // Checa se a posição da cabeça é idêntica à posição da fruta

  if (hasEatenFood) {
  // Se alcançou a fruta:
    score += 10;
    // Adiciona 10 pontos ao placar
    scoreElement.innerText = score;
    // Atualiza o texto do placar na tela
    generateFood();
    // Sorteia uma nova posição para a próxima fruta
  } else {
    snake.pop();
    // Se não comeu a fruta, remove o último gomo para manter o tamanho ao andar
  }
}

function hasGameEnded() {
// Checa todas as condições de derrota da partida
  
  for (let i = 4; i < snake.length; i++) {
  // Verifica se a cabeça bateu em qualquer parte do próprio corpo
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true; // Colisão com o próprio corpo detectada: Fim de jogo
    }
  }

  if (difficulty !== 'easy') {
  // Verifica colisão com as paredes externas (aplicado nos modos Intermediário e Difícil)
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
      return true; // Colisão com a parede detectada: Fim de jogo
    }
  }

  if (difficulty === 'hard') {
  // Verifica colisão com barreiras laranjas (aplicado apenas no modo Difícil)
    for (let obstacle of obstacles) {
      if (obstacle.x === snake[0].x && obstacle.y === snake[0].y) {
        return true; // Colisão com obstáculo detectada: Fim de jogo
      }
    }
  }

  return false; // Nenhuma colisão detectada: O jogo continua ativo
}

function showGameOver() {
// Ativa e mostra a tela de fim de jogo
  finalScoreElement.innerText = score;
  // Atualiza o valor dos pontos no painel final
  gameOverScreen.classList.add("show");
  // Adiciona a classe CSS que torna a janela visível
}

// ==========================================
// 7. GERAÇÃO DE ELEMENTOS ALEATÓRIOS
// ==========================================

function randomTen(min, max) {
// Função auxiliar que gera coordenadas ajustadas aos quadros da grade
  return Math.floor((Math.random() * (max - min) + min) / gridSize) * gridSize;
}

function generateFood() {
// Sorteia uma posição válida para colocar a fruta
  food.x = randomTen(0, canvas.width - gridSize);
  // Sorteia coordenada X dentro da área do jogo
  food.y = randomTen(0, canvas.height - gridSize);
  // Sorteia coordenada Y dentro da área do jogo

  snake.forEach(part => {
  // Garante que a fruta não surja dentro do corpo da serpente
    const hasEaten = part.x === food.x && part.y === food.y;
    if (hasEaten) generateFood(); // Se a fruta surgiu sobre a serpente, sorteia novamente
  });

  if (difficulty === 'hard') {
  // Garante que a fruta não surja dentro de uma barreira laranja
    obstacles.forEach(obstacle => {
      if (obstacle.x === food.x && obstacle.y === food.y) generateFood(); // Sorteia novamente
    });
  }
}

function generateObstacles() {
// Gera barreiras fixas aleatórias para o modo difícil
  obstacles = [];
  // Zera a lista de barreiras anteriores

  if (difficulty !== 'hard') return;
  // Se não estiver no modo difícil, ignora o sorteio

  const obstacleCount = 12;
  // Quantidade de blocos de obstáculo a serem gerados no mapa 700x700

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let i = 0; i < obstacleCount; i++) {
  // Loop para criar as barreiras
    let obsX = randomTen(0, canvas.width - gridSize);
    let obsY = randomTen(0, canvas.height - gridSize);

    const nearCenter = Math.abs(obsX - centerX) < 100 && Math.abs(obsY - centerY) < 100;
    // Evita posicionar obstáculos muito perto do ponto onde a serpente nasce (centro da tela)

    if (!nearCenter) {
      obstacles.push({ x: obsX, y: obsY });
      // Registra o obstáculo sorteado na lista
    }
  }
}

// ==========================================
// 8. ESCUTA DE TECLAS DE CONTROLE (TECLADO)
// ==========================================

function changeDirection(event) {
// Captura as teclas pressionadas para alterar a direção do movimento
  const LEFT_KEY = 37;  // Código da Seta Esquerda
  const RIGHT_KEY = 39; // Código da Seta Direita
  const UP_KEY = 38;    // Código da Seta Para Cima
  const DOWN_KEY = 40;  // Código da Seta Para Baixo

  const A_KEY = 65;     // Código da Tecla A (Esquerda)
  const D_KEY = 68;     // Código da Tecla D (Direita)
  const W_KEY = 87;     // Código da Tecla W (Para Cima)
  const S_KEY = 83;     // Código da Tecla S (Para Baixo)

  if (changingDirection) return;
  // Se um comando já foi lido neste ciclo, descarta outros até o próximo quadro

  const keyPressed = event.keyCode;
  // Lê o código da tecla acionada pelo usuário

  const goingUp = dy === -gridSize;
  const goingDown = dy === gridSize;
  const goingRight = dx === gridSize;
  const goingLeft = dx === -gridSize;

  // Evita que a serpente faça uma curva direta de 180 graus sobre si mesma:
  if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
    dx = -gridSize; // Vira para a Esquerda
    dy = 0;
    changingDirection = true;
  }

  if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
    dx = 0;
    dy = -gridSize; // Vira para Cima
    changingDirection = true;
  }

  if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
    dx = gridSize;  // Vira para a Direita
    dy = 0;
    changingDirection = true;
  }

  if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
    dx = 0;
    dy = gridSize;  // Vira para Baixo
    changingDirection = true;
  }
}

document.addEventListener("keydown", changeDirection);
// Registra o leitor de eventos para capturar qualquer tecla pressionada no navegador

resetGame();
// Executa o início do jogo ao carregar o código na página

// Fim do Código JavaScript