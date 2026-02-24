(function () {
  "use strict";

  const CELL_SIZE = 48;
  const COLS = 10;
  const ROWS = 20;
  const WIDTH = COLS * CELL_SIZE;
  const HEIGHT = ROWS * CELL_SIZE;
  const WEAPON_FIND_CHANCE = 0.2;

  const COLORS = {
    bg: "#1a1410",
    grid: "#3c3228",
    groundA: "#557832",
    groundB: "#4e7030",
    move: "rgba(65, 190, 70, 0.35)",
    attack: "rgba(210, 65, 65, 0.35)",
    attackL: "rgba(230, 120, 50, 0.40)", // Новый цвет для L-атаки
    selected: "#e8c35b",
    p1: "#59a3ff",
    p2: "#e35757"
  };

  const ARTIFACTS = [
    "Трава серебряных",
    "Палочка заклинаний",
    "Трава С.",
    "Посох огня",
    "Волшебная палочка",
    "Солнечные часы",
    "Вода серебряных трав"
  ];

  const ARTIFACT_COLORS = {
    "Трава серебряных": "#b8e3ae",
    "Палочка заклинаний": "#cfb4ff",
    "Трава С.": "#8fdd7f",
    "Посох огня": "#ff8d62",
    "Волшебная палочка": "#dfb2ff",
    "Солнечные часы": "#ffe281",
    "Вода серебряных трав": "#85c9ff"
  };

  const UNIT_TYPES = {
    knight: {
      name: "Рыцарь",
      hp: 3,
      damage: 5,
      armor: 4,
      moves: 2,
      frame: 192,
      letter: "K"
    },
    cavalry: {
      name: "Конный",
      hp: 5,
      damage: 6,
      armor: 3,
      moves: 3,
      frame: 320,
      letter: "L"
    },
    archer: {
      name: "Лучник",
      hp: 3,
      damage: 2,
      armor: 1,
      moves: 3,
      frame: 192,
      letter: "A"
    }
  };

  const SPELLS = [
    {
      name: "Дождь защиты",
      recipe: {
        "Трава серебряных": 2,
        "Палочка заклинаний": 1,
        "Трава С.": 1
      },
      desc: "+2 HP всем своим"
    },
    {
      name: "Сталь свободы",
      recipe: {
        "Посох огня": 1,
        "Трава серебряных": 1,
        "Волшебная палочка": 1
      },
      desc: "Восстанавливает до +2 защиты, но не выше стартовой"
    },
    {
      name: "Небо огня",
      recipe: {
        "Трава С.": 3,
        "Палочка заклинаний": 1,
        "Солнечные часы": 1
      },
      desc: "Щит на 1 ход противника"
    }
  ];

  const WEAPONS = [
    {
      name: "Солнечный меч",
      recipe: {
        "Посох огня": 1,
        "Палочка заклинаний": 1,
        "Солнечные часы": 1
      },
      desc: "+3 урона выбранному юниту",
      amount: 3,
      archerOnly: false
    },
    {
      name: "Синий лук",
      recipe: {
        "Вода серебряных трав": 1,
        "Трава С.": 2,
        "Посох огня": 1,
        "Палочка заклинаний": 1
      },
      desc: "+2 урона лучнику",
      amount: 2,
      archerOnly: true
    }
  ];

  let TOWERS = [
    { row: 5, col: 3 },
    { row: 5, col: 6 },
    { row: 14, col: 3 },
    { row: 14, col: 6 }
  ];

  let RUINS = {
    top: 9,
    left: 4,
    width: 2,
    height: 2
  };

  let CASTLE_P1_COL = 3; // Стартовая позиция замка игрока 1 по горизонтали
  let CASTLE_P2_COL = 3; // Стартовая позиция замка игрока 2 по горизонтали

  const START_POSITIONS_P1 = [
    { type: "cavalry", row: 3, col: 1 }, // col будет пересчитан относительно замка
    { type: "cavalry", row: 3, col: 2 },
    { type: "knight", row: 1, col: 0 },
    { type: "knight", row: 1, col: 3 },
    { type: "knight", row: 2, col: 0 },
    { type: "knight", row: 2, col: 3 },
    { type: "knight", row: 0, col: 0 },
    { type: "archer", row: 0, col: 1 },
    { type: "archer", row: 0, col: 2 },
    { type: "knight", row: 0, col: 3 }
  ];

  const MENU_RULES_HTML = `
    <div class="rules">
      <h4>🏰 Рыцари и Замки</h4>
      <p>Средневековая пошаговая стратегия 1 на 1</p>
      <p>Добро пожаловать в мир стали, магии и тактики. Два замка. Две армии. Одно поле боя.</p>

      <h4>🎯 Цель игры</h4>
      <p>Уничтожьте всех воинов противника или дождитесь его капитуляции.</p>
      <p>Побеждает тот, кто останется единственной силой на поле.</p>

      <h4>🗺 Поле боя</h4>
      <p>Размер поля — 20 × 10 клеток.</p>
      <p>Игроки начинают в своих замках: один — сверху, другой — снизу.</p>
      <p>В центре расположены: 🧙 Башня Мага (2×2) и 🏚 Руины (2×2).</p>
      <p>Каждая клетка — это стратегическое решение.</p>

      <h4>👥 Воины</h4>
      <p>Каждый игрок управляет 10 бойцами:</p>
      <ul>
        <li>🛡 Рыцарь: ❤️ 3 | ⚔ 5 | 🛡 4 | 🏃 2. Мощный и устойчивый боец ближнего боя.</li>
        <li>🐎 Конный: ❤️ 5 | ⚔ 6 | 🛡 3 | 🏃 3. Самый мобильный и разрушительный юнит.</li>
        <li>🏹 Лучник: ❤️ 3 | ⚔ 2 | 🛡 1 | 🏃 3. Манёвренный стрелок ближней дистанции.</li>
      </ul>

      <h4>⚔ Боевая система</h4>
      <p>Урон сначала снимает 🛡 защиту. Когда защита равна 0 — урон уменьшает ❤️ здоровье.</p>
      <p>Если здоровье падает до 0 — воин погибает. Тактика важнее силы.</p>

      <h4>🔄 Ход игрока</h4>
      <p>За один ход можно управлять до 3 воинов. Если осталось меньше трёх — ходят все.</p>
      <p>Когда действия трёх воинов завершены — ход передаётся сопернику.</p>
      <p>Каждое действие расходует очки хода юнита.</p>

      <h4>🛡 Особые правила атаки</h4>
      <p>⚔ <strong>Рыцари и Конные</strong> имеют два типа атаки:</p>
      <ul>
        <li><strong>Прямая атака:</strong> прыжок через врага на 1 клетку за ним. Если клетка занята — атака невозможна.</li>
        <li><strong>Атака буквой "Г":</strong> L-образный ход как конь в шахматах (2 клетки в одну сторону + 1 в другую). После хода атакует врага и приземляется на соседнюю свободную клетку.</li>
      </ul>
      <p>Любая атака = движение + удар за 1 ход (тратит 2 очка хода).</p>
      <p>🏹 <strong>Лучник</strong> может двигаться до 2 клеток и стрелять только по соседней клетке (вверх/вниз/влево/вправо).</p>
      <p>Выстрел тратит 1 ход. Лучник может подойти → выстрелить → отойти, если остались ходы.</p>

      <h4>🧙 Башня Мага</h4>
      <p>Только один воин может находиться внутри. Использование магии тратит 1 ход.</p>
      <ul>
        <li>🌧 Дождь защиты — +2 к здоровью всем своим</li>
        <li>🔥 Сталь свободы — восстанавливает до +2 защиты (не выше стартовой)</li>
        <li>☀ Небо огня — щит на 1 ход противника</li>
      </ul>
      <p>Эффекты применяются мгновенно и не суммируются.</p>

      <h4>🏚 Руины</h4>
      <p>Воин в руинах может потратить ход, чтобы найти артефакт.</p>
      <p>Иногда в руинах можно найти готовое оружие — его нужно сразу экипировать союзнику.</p>
      <p>Колода бесконечна. Редкие предметы могут выпасть в любой момент.</p>
      <p>Удача любит смелых.</p>

      <h4>🏁 Конец игры</h4>
      <p>Игра заканчивается, когда все воины одного игрока уничтожены или игрок добровольно сдаётся.</p>

      <h4>🏆 Помни</h4>
      <p>Защита важнее урона. Контроль центра решает исход. Магия меняет баланс.</p>
      <p>Побеждает тот, кто думает на два хода вперёд.</p>
    </div>
  `;

  const KEY_SPACE = "Space";
  const SAVE_KEY = "knights_and_castles_save_v1";
  const SAVE_VERSION = 1;
  const AD_COOLDOWN_MS = 45000;

  function isMobileDevice() {
    return (
      window.matchMedia("(max-width: 860px)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );
  }

  class YandexBridge {
    constructor() {
      this.sdk = null;
      this.initPromise = null;
      this.lastAdAt = 0;
      this.lang = document.documentElement.lang || "ru";
      this.stickyBanner = null;
    }

    init() {
      if (this.initPromise) {
        return this.initPromise;
      }
      this.initPromise = this.initInternal();
      return this.initPromise;
    }

    async initInternal() {
      if (!window.YaGames || typeof window.YaGames.init !== "function") {
        return null;
      }
      try {
        this.sdk = await window.YaGames.init();
        const lang = this.sdk &&
          this.sdk.environment &&
          this.sdk.environment.i18n &&
          this.sdk.environment.i18n.lang;
        if (lang) {
          this.lang = lang;
          document.documentElement.lang = lang;
        }
        return this.sdk;
      } catch (error) {
        this.sdk = null;
        return null;
      }
    }

    async loadingReady() {
      const sdk = await this.init();
      if (
        sdk &&
        sdk.features &&
        sdk.features.LoadingAPI &&
        typeof sdk.features.LoadingAPI.ready === "function"
      ) {
        try {
          sdk.features.LoadingAPI.ready();
        } catch (error) {
          // Игру нужно запускать и без SDK (локальная разработка / fallback).
        }
      }
    }

    canShowAd() {
      return Date.now() - this.lastAdAt >= AD_COOLDOWN_MS;
    }

    async showFullscreenAd() {
      const sdk = await this.init();
      if (!sdk || !sdk.adv || typeof sdk.adv.showFullscreenAdv !== "function") {
        return false;
      }
      if (!this.canShowAd()) {
        return false;
      }
      return new Promise((resolve) => {
        let done = false;
        const finish = (shown) => {
          if (done) {
            return;
          }
          done = true;
          if (shown) {
            this.lastAdAt = Date.now();
          }
          resolve(shown);
        };

        try {
          sdk.adv.showFullscreenAdv({
            callbacks: {
              onClose: () => finish(true),
              onError: () => finish(false),
              onOffline: () => finish(false)
            }
          });
          setTimeout(() => finish(false), 8000);
        } catch (error) {
          finish(false);
        }
      });
    }
    
    async showStickyBanner() {
      const sdk = await this.init();
      const container = document.getElementById("adBanner");
      
      if (!sdk || !container) {
        return false;
      }
      
      // Проверяем наличие Sticky Banner API
      if (!sdk.adv || typeof sdk.adv.showBannerAdv !== "function") {
        return false;
      }
      
      try {
        await sdk.adv.showBannerAdv();
        container.classList.remove("hidden");
        return true;
      } catch (error) {
        container.classList.add("hidden");
        return false;
      }
    }
    
    async hideStickyBanner() {
      const sdk = await this.init();
      const container = document.getElementById("adBanner");
      
      if (!sdk || !container) {
        return;
      }
      
      if (sdk.adv && typeof sdk.adv.hideBannerAdv === "function") {
        try {
          await sdk.adv.hideBannerAdv();
        } catch (error) {
          // Ignore errors
        }
      }
      
      container.classList.add("hidden");
    }
  }

  function toKey(row, col) {
    return row + "," + col;
  }

  function otherPlayer(player) {
    return player === 1 ? 2 : 1;
  }

  function cloneRecipeText(recipe) {
    return Object.keys(recipe)
      .map((name) => recipe[name] + "x " + name)
      .join(", ");
  }

  function randomChoice(list) {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
  
  function randomizeMapPositions() {
    // Случайная позиция замка игрока 1 (0-6, но с местом под 4 клетки)
    CASTLE_P1_COL = Math.floor(Math.random() * 7); // 0-6
    
    // Случайная позиция замка игрока 2 (независимо от игрока 1)
    CASTLE_P2_COL = Math.floor(Math.random() * 7); // 0-6
    
    // Случайная позиция руин (избегаем конфликтов с замками)
    let ruinsCol;
    let attempts = 0;
    do {
      ruinsCol = Math.floor(Math.random() * 7); // 0-6 для руин 2x2
      attempts++;
    } while (
      attempts < 20 &&
      (
        // Проверяем пересечение с замком P1
        (ruinsCol < CASTLE_P1_COL + 4 && ruinsCol + 2 > CASTLE_P1_COL) ||
        // Проверяем пересечение с замком P2
        (ruinsCol < CASTLE_P2_COL + 4 && ruinsCol + 2 > CASTLE_P2_COL)
      )
    );
    
    RUINS.left = ruinsCol;
    RUINS.top = 8 + Math.floor(Math.random() * 3); // 8-10
    
    // Башни в разных позициях (избегаем замков и руин)
    const towerCols = [];
    for (let i = 0; i < 10; i++) {
      // Проверяем что колонка не конфликтует с замками
      const conflictsP1 = i >= CASTLE_P1_COL && i < CASTLE_P1_COL + 4;
      const conflictsP2 = i >= CASTLE_P2_COL && i < CASTLE_P2_COL + 4;
      const conflictsRuins = i >= RUINS.left && i < RUINS.left + RUINS.width;
      
      if (!conflictsP1 && !conflictsP2 && !conflictsRuins) {
        towerCols.push(i);
      }
    }
    
    // Выбираем 2 случайные колонки для башен
    const shuffled = towerCols.sort(() => Math.random() - 0.5);
    const col1 = shuffled[0] || 2;
    const col2 = shuffled[1] || 7;
    
    TOWERS = [
      { row: 5, col: col1 },
      { row: 5, col: col2 },
      { row: 14, col: col1 },
      { row: 14, col: col2 }
    ];
  }

  function insideBoard(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
  }

  function manhattan(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
  }

  class AssetStore {
    constructor() {
      this.items = {};
      this.pending = 0;
      this.resolved = 0;
      this.finished = false;
      this.onFinish = [];
    }

    add(key, src) {
      this.items[key] = {
        key,
        src,
        image: null,
        loaded: false,
        failed: false
      };
    }

    loadAll() {
      const keys = Object.keys(this.items);
      this.pending = keys.length;
      if (this.pending === 0) {
        this.finished = true;
        this.flushCallbacks();
        return;
      }
      keys.forEach((key) => {
        const item = this.items[key];
        const img = new Image();
        img.onload = () => {
          item.image = img;
          item.loaded = true;
          this.bump();
        };
        img.onerror = () => {
          item.failed = true;
          this.bump();
        };
        img.src = item.src;
      });
    }

    bump() {
      this.resolved += 1;
      if (this.resolved >= this.pending) {
        this.finished = true;
        this.flushCallbacks();
      }
    }

    flushCallbacks() {
      while (this.onFinish.length) {
        const cb = this.onFinish.shift();
        cb();
      }
    }

    whenFinished(cb) {
      if (this.finished) {
        cb();
      } else {
        this.onFinish.push(cb);
      }
    }

    get(key) {
      const item = this.items[key];
      if (!item || !item.loaded || !item.image) {
        return null;
      }
      return item.image;
    }

    stats() {
      return {
        pending: this.pending,
        resolved: this.resolved
      };
    }
  }

  class Unit {
    constructor(id, player, type, row, col) {
      const t = UNIT_TYPES[type];
      this.id = id;
      this.player = player;
      this.type = type;
      this.name = t.name;
      this.row = row;
      this.col = col;

      this.maxHp = t.hp;
      this.hp = t.hp;
      this.startArmor = t.armor;
      this.armor = t.armor;
      this.maxArmor = t.armor;
      this.damage = t.damage;
      this.maxMoves = t.moves;
      this.movesLeft = t.moves;

      this.done = false;
      this.activated = false;
      
      // Smooth movement animation
      this.visualRow = row;
      this.visualCol = col;
      this.targetRow = row;
      this.targetCol = col;
      this.moveProgress = 1.0; // 1.0 = arrived
      
      // Death animation
      this.dying = false;
      this.deathProgress = 0;
      this.deathDuration = 30; // frames (ускорено с 60)
    }

    alive() {
      return this.hp > 0 && !this.dying;
    }

    resetTurn() {
      this.movesLeft = this.maxMoves;
      this.done = false;
      this.activated = false;
    }
    
    startMoveTo(targetRow, targetCol) {
      this.targetRow = targetRow;
      this.targetCol = targetCol;
      this.moveProgress = 0.0;
    }
    
    updateMovement() {
      // Handle death animation
      if (this.dying) {
        this.deathProgress++;
        return;
      }
      
      // Handle movement animation with easing
      if (this.moveProgress < 1.0) {
        this.moveProgress += 0.12; // Faster movement
        if (this.moveProgress >= 1.0) {
          this.moveProgress = 1.0;
          this.visualRow = this.targetRow;
          this.visualCol = this.targetCol;
        } else {
          // Smooth easing (ease-in-out)
          const t = this.moveProgress;
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          this.visualRow = this.row * (1 - eased) + this.targetRow * eased;
          this.visualCol = this.col * (1 - eased) + this.targetCol * eased;
        }
      }
    }
    
    isMoving() {
      return this.moveProgress < 1.0;
    }
    
    startDeath() {
      this.dying = true;
      this.deathProgress = 0;
    }
    
    isDead() {
      return this.dying && this.deathProgress >= this.deathDuration;
    }
  }

  class Board {
    constructor() {
      this.units = [];
      this.nextId = 1;
      this.initUnits();
    }

    initUnits() {
      this.units = [];
      this.nextId = 1;
      
      // Создаём юниты для игрока 1 (позиции относительно CASTLE_P1_COL)
      START_POSITIONS_P1.forEach((p) => {
        this.units.push(new Unit(this.nextId++, 1, p.type, p.row, p.col + CASTLE_P1_COL));
      });
      
      // Создаём юниты для игрока 2 (зеркально, но относительно CASTLE_P2_COL)
      START_POSITIONS_P1.forEach((p) => {
        this.units.push(new Unit(this.nextId++, 2, p.type, 19 - p.row, p.col + CASTLE_P2_COL));
      });
    }

    unitAt(row, col) {
      for (let i = 0; i < this.units.length; i += 1) {
        const u = this.units[i];
        if (u.alive() && u.row === row && u.col === col) {
          return u;
        }
      }
      return null;
    }

    isFree(row, col) {
      return insideBoard(row, col) && !this.unitAt(row, col);
    }

    removeDead() {
      // Start death animation for units with hp <= 0
      this.units.forEach(u => {
        if (u.hp <= 0 && !u.dying && !u.isDead()) {
          u.startDeath();
        }
      });
      
      // Remove units that finished death animation
      this.units = this.units.filter((u) => !u.isDead());
    }

    unitsOf(player) {
      return this.units.filter((u) => u.player === player && u.alive());
    }

    inRuins(row, col) {
      return (
        row >= RUINS.top &&
        row < RUINS.top + RUINS.height &&
        col >= RUINS.left &&
        col < RUINS.left + RUINS.width
      );
    }

    isTower(row, col) {
      return TOWERS.some((t) => t.row === row && t.col === col);
    }
  }

  class AIPlayer {
    constructor(game, player) {
      this.game = game;
      this.player = player;
      this.frameWait = 18;
      this.frameCounter = 0;
      this.strategyCache = new Map();
      this.turnPlan = null;
    }

    reset() {
      this.frameCounter = 0;
      this.strategyCache.clear();
      this.turnPlan = null;
    }

    update() {
      if (!this.game.isGameActive()) {
        return;
      }
      if (this.game.mode !== "ai") {
        return;
      }
      if (this.game.currentPlayer !== this.player) {
        return;
      }
      if (this.game.winner !== null) {
        return;
      }
      this.frameCounter += 1;
      if (this.frameCounter < this.frameWait) {
        return;
      }
      this.frameCounter = 0;
      this.takeStep();
    }

    takeStep() {
      const game = this.game;
      if (game.currentPlayer !== this.player || game.winner !== null) {
        return;
      }

      // Создаём план на весь ход, если его ещё нет
      if (!this.turnPlan) {
        this.turnPlan = this.createTurnPlan();
      }

      if (game.selectedUnit && game.selectedUnit.player === this.player) {
        const action = this.turnPlan.shift() || this.bestActionForUnit(game.selectedUnit);
        this.executeAction(action);
        return;
      }

      const candidates = game
        .ownUnits(this.player)
        .filter((u) => !u.done)
        .filter((u) => game.canUnitAct(u));

      if (!candidates.length) {
        this.turnPlan = null;
        game.forceEndTurn();
        return;
      }

      // Если план пустой, выбираем лучшего юнита по общей оценке
      if (!this.turnPlan || this.turnPlan.length === 0) {
        this.turnPlan = this.createTurnPlan();
      }

      const nextAction = this.turnPlan.shift();
      if (!nextAction) {
        const sortedCandidates = this.sortUnitsByPriority(candidates);
        const best = sortedCandidates[0];

        if (!best) {
          game.forceEndTurn();
          return;
        }

        game.selectUnit(best.unit.row, best.unit.col, true);
        if (!game.selectedUnit || game.selectedUnit.id !== best.unit.id) {
          return;
        }
        const refined = this.bestActionForUnit(game.selectedUnit) || { type: "skip", score: -999 };
        this.executeAction(refined);
        return;
      }

      // Выполняем действие из плана
      const targetUnit = game.board.units.find(u => u.id === nextAction.unitId && u.alive());
      if (targetUnit && !targetUnit.done) {
        game.selectUnit(targetUnit.row, targetUnit.col, true);
        if (game.selectedUnit && game.selectedUnit.id === targetUnit.id) {
          this.executeAction(nextAction.action);
        }
      }
    }
    
    // НОВАЯ СИСТЕМА: Создание плана на весь ход
    createTurnPlan() {
      const game = this.game;
      const myUnits = game.ownUnits(this.player).filter(u => !u.done && game.canUnitAct(u));
      const enemies = game.ownUnits(otherPlayer(this.player));
      
      if (!myUnits.length) return [];
      
      // Оцениваем текущую позицию
      const currentEval = this.evaluatePosition();
      
      // Генерируем все возможные комбинации действий для 3 юнитов
      const maxUnits = Math.min(3, myUnits.length);
      const unitCombinations = this.generateUnitCombinations(myUnits, maxUnits);
      
      let bestPlan = [];
      let bestScore = -Infinity;
      
      // Оцениваем каждую комбинацию
      unitCombinations.slice(0, 50).forEach(combo => { // Ограничиваем для производительности
        const plan = this.generatePlanForCombination(combo);
        const score = this.evaluatePlan(plan, currentEval);
        
        if (score > bestScore) {
          bestScore = score;
          bestPlan = plan;
        }
      });
      
      return bestPlan;
    }
    
    // Генерация комбинаций юнитов
    generateUnitCombinations(units, maxCount) {
      const combinations = [];
      const count = Math.min(maxCount, units.length);
      
      // Простая генерация всех комбинаций
      const generate = (start, current) => {
        if (current.length === count) {
          combinations.push([...current]);
          return;
        }
        for (let i = start; i < units.length; i++) {
          current.push(units[i]);
          generate(i + 1, current);
          current.pop();
        }
      };
      
      generate(0, []);
      return combinations;
    }
    
    // Генерация плана для комбинации юнитов
    generatePlanForCombination(units) {
      const plan = [];
      
      units.forEach(unit => {
        const action = this.bestActionForUnit(unit);
        if (action && action.type !== "skip") {
          plan.push({
            unitId: unit.id,
            action: action
          });
        }
      });
      
      return plan;
    }
    
    // Оценка плана
    evaluatePlan(plan, baseEval) {
      let score = 0;
      const game = this.game;
      
      // Симулируем выполнение плана (упрощённо)
      plan.forEach(step => {
        const unit = game.board.units.find(u => u.id === step.unitId);
        if (!unit) return;
        
        const action = step.action;
        
        if (action.type === "attack") {
          const target = game.board.unitAt(action.targetRow, action.targetCol);
          if (target) {
            const damage = game.computeDamage(unit, target);
            
            // Очень высокая ценность убийства
            if (damage >= target.hp) {
              score += 15000;
              // Бонус за тип юнита
              if (target.type === "cavalry") score += 5000;
              if (target.type === "archer") score += 3000;
              if (target.type === "knight") score += 2000;
            } else {
              score += damage * 500;
            }
            
            // Штраф за опасную позицию
            if (!this.isSafePosition(action.landingRow, action.landingCol, unit)) {
              score -= 8000;
            }
          }
        } else if (action.type === "spell") {
          score += 7000; // Заклинания очень ценны
        } else if (action.type === "move") {
          // Бонус за стратегическое позиционирование
          const centerDist = manhattan(action.row, action.col, 10, 5);
          score += (20 - centerDist) * 100;
          
          // Бонус за захват ключевых точек
          if (game.board.isTower(action.row, action.col)) {
            score += 5000;
          }
          if (game.board.inRuins(action.row, action.col)) {
            score += 2000;
          }
        }
      });
      
      // Добавляем оценку позиции
      score += baseEval.totalScore;
      
      return score;
    }
    
    // ПРОДВИНУТАЯ ОЦЕНКА ПОЗИЦИИ
    evaluatePosition() {
      const game = this.game;
      const myUnits = game.ownUnits(this.player);
      const enemyUnits = game.ownUnits(otherPlayer(this.player));
      
      let materialScore = 0;
      let positionScore = 0;
      let threatScore = 0;
      let controlScore = 0;
      
      // 1. Материальное преимущество
      myUnits.forEach(u => {
        materialScore += u.hp * 1000;
        materialScore += u.armor * 500;
        materialScore += u.damage * 300;
        if (u.type === "cavalry") materialScore += 2000;
        if (u.type === "knight") materialScore += 1000;
      });
      
      enemyUnits.forEach(u => {
        materialScore -= u.hp * 1000;
        materialScore -= u.armor * 500;
        materialScore -= u.damage * 300;
        if (u.type === "cavalry") materialScore -= 2000;
        if (u.type === "knight") materialScore -= 1000;
      });
      
      // 2. Позиционное преимущество
      myUnits.forEach(u => {
        // Контроль центра
        const centerDist = manhattan(u.row, u.col, 10, 5);
        positionScore += (20 - centerDist) * 50;
        
        // Близость к врагу (для атакующих)
        const nearestEnemy = this.findNearestEnemy(u.row, u.col);
        if (nearestEnemy) {
          const dist = manhattan(u.row, u.col, nearestEnemy.row, nearestEnemy.col);
          if (dist <= 3) positionScore += (4 - dist) * 200;
        }
        
        // Контроль ключевых точек
        if (game.board.isTower(u.row, u.col)) positionScore += 3000;
        if (game.board.inRuins(u.row, u.col)) positionScore += 1000;
      });
      
      // 3. Угрозы и безопасность
      const threats = this.evaluateThreats();
      threats.forEach(t => {
        if (t.lethal) {
          threatScore -= 5000;
        } else {
          threatScore -= t.damage * 200;
        }
      });
      
      // 4. Контроль территории
      const controlledCells = this.calculateControlledCells(myUnits);
      const enemyControlledCells = this.calculateControlledCells(enemyUnits);
      controlScore = (controlledCells - enemyControlledCells) * 100;
      
      const totalScore = materialScore + positionScore + threatScore + controlScore;
      
      return {
        totalScore,
        materialScore,
        positionScore,
        threatScore,
        controlScore
      };
    }
    
    // Подсчёт контролируемых клеток
    calculateControlledCells(units) {
      const controlled = new Set();
      
      units.forEach(u => {
        // Клетки в радиусе атаки/движения
        const moves = this.game.moveActionsFor(u);
        const attacks = this.game.attackActionsFor(u);
        
        moves.forEach(m => controlled.add(toKey(m.row, m.col)));
        attacks.forEach(a => controlled.add(toKey(a.targetRow, a.targetCol)));
      });
      
      return controlled.size;
    }
    
    // Найти ближайшего врага
    findNearestEnemy(row, col) {
      const enemies = this.game.ownUnits(otherPlayer(this.player));
      if (!enemies.length) return null;
      
      let nearest = enemies[0];
      let minDist = manhattan(row, col, nearest.row, nearest.col);
      
      enemies.forEach(e => {
        const dist = manhattan(row, col, e.row, e.col);
        if (dist < minDist) {
          minDist = dist;
          nearest = e;
        }
      });
      
      return nearest;
    }

    executeAction(action) {
      const game = this.game;
      if (!action) {
        game.skipSelected(true);
        return;
      }
      if (action.type === "attack") {
        game.performAttack(action.row, action.col, true);
        return;
      }
      if (action.type === "move") {
        game.performMove(action.row, action.col, true);
        return;
      }
      if (action.type === "draw") {
        game.drawArtifact(true);
        return;
      }
      if (action.type === "spell") {
        game.castSpell(action.index, true);
        return;
      }
      game.skipSelected(true);
    }

    // ШАГ 1: Оценка угроз
    evaluateThreats() {
      const enemies = this.game.ownUnits(otherPlayer(this.player));
      const myUnits = this.game.ownUnits(this.player);
      const threats = [];

      enemies.forEach(enemy => {
        const enemyAttacks = this.game.attackActionsFor(enemy);
        enemyAttacks.forEach(attack => {
          const target = this.game.board.unitAt(attack.targetRow, attack.targetCol);
          if (target && target.player === this.player) {
            const damage = this.game.computeDamage(enemy, target);
            if (damage >= target.hp) {
              threats.push({
                enemy,
                target,
                damage,
                lethal: true,
                priority: 1000
              });
            } else if (damage > 0) {
              threats.push({
                enemy,
                target,
                damage,
                lethal: false,
                priority: damage * 10
              });
            }
          }
        });
      });

      return threats.sort((a, b) => b.priority - a.priority);
    }

    // ШАГ 2: Лучшее действие для юнита (УЛУЧШЕННАЯ ВЕРСИЯ)
    bestActionForUnit(unit) {
      const game = this.game;
      if (!unit || unit.done || unit.movesLeft <= 0) {
        return { type: "skip", score: -300 };
      }

      const actions = [];
      const enemies = game.ownUnits(otherPlayer(this.player));
      const allies = game.ownUnits(this.player);
      const threats = this.evaluateThreats();
      const positionEval = this.evaluatePosition();

      // ПРИОРИТЕТ 1: Тактические убийства (комбо-анализ)
      const attackActions = game.attackActionsFor(unit);
      attackActions.forEach((a) => {
        const target = game.board.unitAt(a.targetRow, a.targetCol);
        if (!target || target.player === unit.player) {
          return;
        }
        
        const damage = game.computeDamage(unit, target);
        const targetValue = this.calculateUnitValue(target);
        
        // Проверка безопасности и стратегической ценности позиции
        const willBeSafe = this.isSafePosition(a.landingRow, a.landingCol, unit);
        const landingValue = this.evaluateCellValue(a.landingRow, a.landingCol);
        
        let score = 0;
        
        if (damage >= target.hp) {
          // УБИЙСТВО - максимальный приоритет
          score = 20000 + targetValue;
          
          // Супер бонус за убийство опасных юнитов
          if (target.type === "cavalry") score += 8000;
          if (target.type === "archer" && target.damage > 3) score += 6000;
          if (target.type === "knight") score += 4000;
          
          // Бонус за убийство раненых (добивание)
          if (target.hp < target.maxHp) score += 3000;
          
          // Анализ последствий: откроется ли путь для других юнитов?
          const openedOpportunities = this.analyzeOpenedOpportunities(a.landingRow, a.landingCol, target);
          score += openedOpportunities * 1000;
          
          // Штраф если позиция опасна (но убийство все равно приоритетнее)
          if (!willBeSafe) {
            if (unit.type === "cavalry") {
              score -= 5000; // Береж ём конных
            } else {
              score -= 2000;
            }
          }
          
          // Бонус за стратегическую позицию после атаки
          score += landingValue;
          
        } else {
          // Атака без убийства - анализ ценности
          score = damage * 800;
          
          // Бонус за ослабление опасных целей
          if (damage >= target.armor) {
            score += 2000; // Пробили броню
          }
          
          // Штраф за неэффективную атаку
          if (damage < 2) {
            score -= 1000;
          }
          
          // Большой штраф если позиция опасна без убийства
          if (!willBeSafe) {
            score -= 8000;
          }
          
          // Бонус если это настройка для убийства союзником
          const canAllyFinish = this.canAllyFinishTarget(target, damage);
          if (canAllyFinish) {
            score += 4000;
          }
        }
        
        actions.push({
          type: "attack",
          row: a.row,
          col: a.col,
          targetRow: a.targetRow,
          targetCol: a.targetCol,
          score
        });
      });

      // ПРИОРИТЕТ 2: Экстренное отступление от смертельной угрозы
      const myThreats = threats.filter(t => t.target.id === unit.id);
      if (myThreats.length > 0 && myThreats[0].lethal) {
        const escapeActions = this.findEscapeRoutes(unit);
        escapeActions.forEach(escape => {
          // Оцениваем качество позиции отступления
          const escapeValue = this.evaluateCellValue(escape.row, escape.col);
          const score = 15000 + escapeValue + escape.distance * 500;
          
          actions.push({
            type: "move",
            row: escape.row,
            col: escape.col,
            score
          });
        });
      }

      // ПРИОРИТЕТ 3: Захват и использование башни мага
      if (unit.movesLeft >= 1) {
        TOWERS.forEach(tower => {
          const occupant = game.board.unitAt(tower.row, tower.col);
          if (!occupant || occupant.player !== this.player) {
            const dist = manhattan(unit.row, unit.col, tower.row, tower.col);
            if (dist === 0) {
              // Уже на башне - использовать заклинание
              this.evaluateSpells(unit, actions);
            } else if (dist <= unit.movesLeft) {
              // Оценка ценности захвата башни
              const towerValue = this.evaluateTowerCapture();
              actions.push({
                type: "move",
                row: tower.row,
                col: tower.col,
                score: 12000 + towerValue - dist * 200
              });
            }
          }
        });
      }

      // ПРИОРИТЕТ 4: Заклинания (если на башне) - УЛУЧШЕННАЯ ОЦЕНКА
      if (game.board.isTower(unit.row, unit.col) && unit.movesLeft >= 1) {
        this.evaluateSpells(unit, actions);
      }

      // ПРИОРИТЕТ 5: Поиск артефактов (с учётом инвентаря)
      if (game.board.inRuins(unit.row, unit.col) && unit.movesLeft >= 1) {
        const artifactValue = this.evaluateArtifactNeed();
        actions.push({
          type: "draw",
          score: 3000 + artifactValue
        });
      }

      // ПРИОРИТЕТ 6: Стратегическое движение
      if (actions.length === 0 || actions.every(a => a.score < 5000)) {
        const moveActions = game.moveActionsFor(unit);
        const strategicTarget = this.findStrategicTarget(unit, enemies);
        
        moveActions.forEach((m) => {
          let score = 0;
          
          // Базовая оценка приближения к цели
          if (strategicTarget) {
            const distBefore = manhattan(unit.row, unit.col, strategicTarget.row, strategicTarget.col);
            const distAfter = manhattan(m.row, m.col, strategicTarget.row, strategicTarget.col);
            score = (distBefore - distAfter) * 300;
          }
          
          // Оценка ценности клетки
          const cellValue = this.evaluateCellValue(m.row, m.col);
          score += cellValue;
          
          // Безопасность
          const isSafe = this.isSafePosition(m.row, m.col, unit);
          if (!isSafe) score -= 3000;
          
          // Бонус за поддержку союзников
          const supportValue = this.evaluateSupportPosition(m.row, m.col, unit, allies);
          score += supportValue;
          
          // Бонус за контроль территории
          const controlValue = this.evaluateControlPosition(m.row, m.col, unit);
          score += controlValue;
          
          // Специальные локации
          if (game.board.inRuins(m.row, m.col)) score += 800;
          if (game.board.isTower(m.row, m.col)) score += 2000;
          
          actions.push({
            type: "move",
            row: m.row,
            col: m.col,
            score
          });
        });
      }

      if (!actions.length) {
        return { type: "skip", score: -200 };
      }

      actions.sort((a, b) => b.score - a.score);
      return actions[0];
    }
    
    // Расчёт ценности юнита
    calculateUnitValue(unit) {
      let value = unit.hp * 1000 + unit.armor * 500 + unit.damage * 300;
      
      if (unit.type === "cavalry") value += 3000;
      if (unit.type === "knight") value += 2000;
      if (unit.type === "archer") value += 1500;
      
      return value;
    }
    
    // Оценка ценности клетки
    evaluateCellValue(row, col) {
      let value = 0;
      
      // Близость к центру
      const centerDist = manhattan(row, col, 10, 5);
      value += (20 - centerDist) * 50;
      
      // Ключевые позиции
      if (this.game.board.isTower(row, col)) value += 3000;
      if (this.game.board.inRuins(row, col)) value += 1000;
      
      return value;
    }
    
    // Анализ открытых возможностей после убийства
    analyzeOpenedOpportunities(row, col, killedUnit) {
      const allies = this.game.ownUnits(this.player);
      let opportunities = 0;
      
      // Проверяем, сколько союзников получат новые цели
      allies.forEach(ally => {
        const dist = manhattan(ally.row, ally.col, killedUnit.row, killedUnit.col);
        if (dist <= ally.maxMoves + 2) {
          opportunities += 1;
        }
      });
      
      return opportunities;
    }
    
    // Может ли союзник добить цель?
    canAllyFinishTarget(target, alreadyDamage) {
      const allies = this.game.ownUnits(this.player);
      const remainingHp = target.hp - alreadyDamage;
      
      return allies.some(ally => {
        if (ally.done) return false;
        const potentialDamage = Math.max(0, ally.damage - target.armor);
        return potentialDamage >= remainingHp;
      });
    }
    
    // Оценка ценности захвата башни
    evaluateTowerCapture() {
      const inv = this.game.inventory[this.player];
      let value = 0;
      
      // Проверяем, можем ли скастовать заклинания
      SPELLS.forEach(spell => {
        if (this.game.canAfford(inv, spell.recipe)) {
          value += 3000;
        }
      });
      
      return value;
    }
    
    // Оценка необходимости артефактов
    evaluateArtifactNeed() {
      const inv = this.game.inventory[this.player];
      let need = 0;
      
      // Считаем, сколько нужно до заклинаний
      SPELLS.forEach(spell => {
        let missing = 0;
        Object.keys(spell.recipe).forEach(artifact => {
          const required = spell.recipe[artifact];
          const have = inv[artifact] || 0;
          missing += Math.max(0, required - have);
        });
        if (missing <= 2) need += 1000; // Близко к заклинанию
      });
      
      return need;
    }
    
    // Найти стратегическую цель
    findStrategicTarget(unit, enemies) {
      if (!enemies.length) return null;
      
      // Приоритет: слабейший враг
      const weakest = this.findWeakestEnemy(enemies);
      
      // Или ближайшая башня
      let nearestTower = null;
      let minDist = Infinity;
      
      TOWERS.forEach(t => {
        const occupant = this.game.board.unitAt(t.row, t.col);
        if (!occupant || occupant.player !== this.player) {
          const dist = manhattan(unit.row, unit.col, t.row, t.col);
          if (dist < minDist) {
            minDist = dist;
            nearestTower = t;
          }
        }
      });
      
      // Выбираем между врагом и башней
      if (nearestTower && minDist < 5) {
        return nearestTower;
      }
      
      return weakest;
    }
    
    // Оценка позиции поддержки
    evaluateSupportPosition(row, col, unit, allies) {
      let value = 0;
      
      allies.forEach(ally => {
        if (ally.id === unit.id) return;
        
        const dist = manhattan(row, col, ally.row, ally.col);
        
        // Бонус за близость к союзникам (формации)
        if (dist >= 2 && dist <= 3) {
          value += 200;
        }
      });
      
      return value;
    }
    
    // Оценка контроля территории
    evaluateControlPosition(row, col, unit) {
      const attacks = this.game.attackActionsFor({
        ...unit,
        row: row,
        col: col
      });
      
      return attacks.length * 100;
    }

    // Оценка заклинаний (УЛУЧШЕННАЯ)
    evaluateSpells(unit, actions) {
      const game = this.game;
      const allies = game.ownUnits(this.player);
      const enemies = game.ownUnits(otherPlayer(this.player));
      
      SPELLS.forEach((spell, index) => {
        if (!game.canAfford(game.inventory[this.player], spell.recipe)) {
          return;
        }
        
        let score = 0;
        
        if (index === 0) {
          // Дождь защиты - детальный анализ
          const wounded = allies.reduce((sum, ally) => 
            sum + Math.max(0, ally.maxHp - ally.hp), 0);
          
          const aliveAllies = allies.length;
          const avgWounded = wounded / Math.max(1, aliveAllies);
          
          if (wounded >= 6) {
            score = 14000; // Критически важно
          } else if (wounded >= 4) {
            score = 10000;
          } else if (wounded >= 2) {
            score = 7000;
          } else {
            score = 3000; // Даже без ран полезно для буфа
          }
          
          // Бонус если враги близко (HP поможет выжить)
          const enemiesNearby = enemies.filter(e => {
            return allies.some(a => manhattan(a.row, a.col, e.row, e.col) <= 3);
          }).length;
          score += enemiesNearby * 1000;
          
        } else if (index === 1) {
          // Сталь свободы - восстановление защиты
          const needArmor = allies.reduce((sum, ally) => 
            sum + Math.max(0, ally.maxArmor - ally.armor), 0);
          
          const criticalArmor = allies.filter(a => a.armor === 0 && a.maxArmor > 0).length;
          
          if (criticalArmor >= 3) {
            score = 12000; // Много юнитов без брони
          } else if (needArmor >= 5) {
            score = 9000;
          } else if (needArmor >= 3) {
            score = 6000;
          } else {
            score = 2000;
          }
          
          // Бонус если предстоит бой
          const incomingThreats = this.evaluateThreats().length;
          score += incomingThreats * 500;
          
        } else if (index === 2) {
          // Небо огня - щит перед атакой противника
          const threats = this.evaluateThreats();
          const lethalThreats = threats.filter(t => t.lethal).length;
          const totalThreats = threats.length;
          
          if (lethalThreats >= 3) {
            score = 16000; // Спасение от разгрома
          } else if (lethalThreats >= 2) {
            score = 13000;
          } else if (lethalThreats >= 1) {
            score = 9000;
          } else if (totalThreats >= 3) {
            score = 6000; // Много атак, даже не смертельных
          } else {
            score = 2000;
          }
          
          // Супер бонус если щит спасёт конного
          const cavalryInDanger = threats.filter(t => 
            t.lethal && t.target.type === "cavalry"
          ).length;
          score += cavalryInDanger * 5000;
        }
        
        if (score > 0) {
          actions.push({
            type: "spell",
            index,
            score
          });
        }
      });
    }

    // Проверка безопасности позиции
    isSafePosition(row, col, unit) {
      const enemies = this.game.ownUnits(otherPlayer(this.player));
      
      for (const enemy of enemies) {
        const attacks = this.game.attackActionsFor(enemy);
        for (const attack of attacks) {
          if (attack.targetRow === row && attack.targetCol === col) {
            const damage = this.game.computeDamage(enemy, unit);
            if (damage >= unit.hp) {
              return false; // Смертельная опасность
            }
          }
        }
      }
      
      return true;
    }

    // Найти пути отступления
    findEscapeRoutes(unit) {
      const moves = this.game.moveActionsFor(unit);
      const safe = [];
      
      moves.forEach(m => {
        if (this.isSafePosition(m.row, m.col, unit)) {
          const distFromEnemies = this.nearestEnemyDistance(m.row, m.col);
          safe.push({
            row: m.row,
            col: m.col,
            distance: distFromEnemies
          });
        }
      });
      
      return safe.sort((a, b) => b.distance - a.distance);
    }

    // Найти слабейшего врага
    findWeakestEnemy(enemies) {
      if (!enemies.length) return null;
      
      return enemies.reduce((weakest, enemy) => {
        const value = enemy.hp + enemy.armor;
        const weakestValue = weakest.hp + weakest.armor;
        return value < weakestValue ? enemy : weakest;
      });
    }

    // ШАГ 3: Сортировка юнитов по приоритету
    sortUnitsByPriority(units) {
      const priorities = units.map(unit => {
        const action = this.bestActionForUnit(unit);
        let priority = action ? action.score : 0;
        
        // Дополнительные факторы
        const threats = this.evaluateThreats().filter(t => t.target.id === unit.id);
        if (threats.length > 0 && threats[0].lethal) {
          priority += 9000; // Юнит в опасности - первый приоритет
        }
        
        if (unit.type === "cavalry") priority += 100;
        if (unit.type === "archer") priority += 50;
        
        return { unit, action, priority };
      });
      
      return priorities.sort((a, b) => b.priority - a.priority);
    }

    nearestEnemyDistance(row, col) {
      const enemies = this.game.ownUnits(otherPlayer(this.player));
      if (!enemies.length) {
        return 999;
      }
      let best = Infinity;
      enemies.forEach((e) => {
        best = Math.min(best, manhattan(row, col, e.row, e.col));
      });
      return best;
    }

    nearestTowerDistance(row, col) {
      let best = Infinity;
      TOWERS.forEach((t) => {
        best = Math.min(best, manhattan(row, col, t.row, t.col));
      });
      return best;
    }
  }

  class KnightsAndCastlesGame {
    constructor(canvas, sidebar, assets, platform) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.sidebar = sidebar;
      this.assets = assets;
      this.platform = platform;
      this.canvasWrap = document.getElementById("canvasWrap");

      this.screen = "loading";
      this.mode = null;
      this.board = new Board();
      this.currentPlayer = 1;
      this.maxActivatedPerTurn = 3;
      this.activatedCount = 0;
      this.selectedUnit = null;
      this.previewUnitId = null;
      this.winner = null;
      this.turnNumber = 1;
      this.message = "";
      this.lastEvent = "";
      this.shieldTurns = { 1: 0, 2: 0 };
      this.pendingWeaponEquip = null;

      this.inventory = {
        1: this.newInventory(),
        2: this.newInventory()
      };

      this.moveMap = new Map();
      this.attackMap = new Map();
      this.saveQueued = false;
      this.pendingSavedState = this.readSavedState();
      this.fullscreenRequested = false;
      this.battleAdShown = false;

      this.ai = new AIPlayer(this, 2);
      
      // ANIMATION SYSTEM
      this.particles = [];
      this.frameCount = 0;
      this.unitAnimations = new Map();
      this.floatingTexts = [];
      this.highlightPulse = 0;
      this.cameraShake = 0;
      this.cameraShakeX = 0;
      this.cameraShakeY = 0;

      this.bindEvents();
      this.applyResponsiveCanvasSize();
      this.renderSidebar();
      this.loop();
    }

    bindEvents() {
      this.canvas.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }
        this.requestFullscreenIfNeeded();
        const rect = this.canvas.getBoundingClientRect();
        const sourceX = typeof event.clientX === "number" ? event.clientX : 0;
        const sourceY = typeof event.clientY === "number" ? event.clientY : 0;
        const x = (sourceX - rect.left) * (this.canvas.width / rect.width);
        const y = (sourceY - rect.top) * (this.canvas.height / rect.height);
        this.handleCanvasClick(Math.floor(x), Math.floor(y));
      });

      this.canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        this.skipSelected(false);
      });

      document.addEventListener("keydown", (event) => {
        if (event.code === KEY_SPACE) {
          event.preventDefault();
          this.skipSelected(false);
        }
      });

      document.addEventListener(
        "touchmove",
        (event) => {
          const target = event.target;
          if (target && target.closest && target.closest("#sidebar")) {
            return;
          }
          if (event.cancelable) {
            event.preventDefault();
          }
        },
        { passive: false }
      );

      window.addEventListener("resize", () => {
        this.applyResponsiveCanvasSize();
      });
      window.addEventListener("orientationchange", () => {
        this.applyResponsiveCanvasSize();
      });
      window.addEventListener("pagehide", () => {
        this.saveProgressNow();
      });
      window.addEventListener("beforeunload", () => {
        this.saveProgressNow();
      });

      this.sidebar.addEventListener("click", (event) => {
        const target = event.target.closest("button[data-action]");
        if (!target) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const action = target.dataset.action;
        if (action === "equip-weapon") {
          const unitId = Number(target.dataset.unitId);
          this.equipPendingWeapon(unitId);
          return;
        }
        if (this.pendingWeaponEquip) {
          this.blockUntilWeaponEquipped();
          return;
        }
        if (action === "start-pvp") {
          this.requestFullscreenIfNeeded();
          this.startMatch("pvp");
          return;
        }
        if (action === "start-ai") {
          this.requestFullscreenIfNeeded();
          this.startMatch("ai");
          return;
        }
        if (action === "continue-save") {
          this.requestFullscreenIfNeeded();
          const saved = this.readSavedState();
          if (saved && this.restoreSavedState(saved)) {
            this.pendingSavedState = null;
            this.renderSidebar();
          }
          return;
        }
        if (action === "skip") {
          this.skipSelected(false);
          return;
        }
        if (action === "surrender") {
          this.surrender();
          return;
        }
        if (action === "back-menu") {
          if (this.pendingWeaponEquip) {
            this.message = "Сначала экипируйте оружие.";
            this.renderSidebar();
            return;
          }
          this.showMenuInterstitial();
          this.backToMenu();
          return;
        }
        if (action === "restart") {
          this.showMenuInterstitial();
          this.startMatch(this.mode || "pvp");
          return;
        }
        if (action === "draw-artifact") {
          this.drawArtifact(false);
          return;
        }
        if (action === "clear-preview") {
          this.previewUnitId = null;
          this.renderSidebar();
          return;
        }
        if (action === "cast-spell") {
          const idx = Number(target.dataset.idx);
          this.castSpell(idx, false);
          return;
        }
        if (action === "craft") {
          const idx = Number(target.dataset.idx);
          this.craftWeapon(idx);
        }
      });
    }

    applyResponsiveCanvasSize() {
      const wrap = this.canvasWrap || this.canvas.parentElement;
      if (!wrap) {
        return;
      }
      const rect = wrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }
      const scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
      const safeScale = Math.max(0.1, scale);
      const drawWidth = Math.floor(WIDTH * safeScale);
      const drawHeight = Math.floor(HEIGHT * safeScale);
      this.canvas.style.width = drawWidth + "px";
      this.canvas.style.height = drawHeight + "px";
    }

    requestFullscreenIfNeeded() {
      if (this.fullscreenRequested || !isMobileDevice()) {
        return;
      }
      this.fullscreenRequested = true;
      if (document.fullscreenElement) {
        return;
      }
      const target = document.documentElement;
      if (!target || typeof target.requestFullscreen !== "function") {
        return;
      }
      try {
        const promise = target.requestFullscreen({ navigationUI: "hide" });
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {});
        }
      } catch (error) {
        try {
          const fallback = target.requestFullscreen();
          if (fallback && typeof fallback.catch === "function") {
            fallback.catch(() => {});
          }
        } catch (fallbackError) {
          // Полноэкранный режим может быть недоступен, это не критично.
        }
      }
    }

    showMenuInterstitial() {
      if (!this.platform) {
        return;
      }
      this.platform.showFullscreenAd();
    }

    showBattleInterstitial() {
      if (this.battleAdShown) {
        return;
      }
      this.battleAdShown = true;
      this.showMenuInterstitial();
    }

    queueSaveProgress() {
      if (this.screen !== "game" || this.winner !== null || this.saveQueued) {
        return;
      }
      this.saveQueued = true;
      setTimeout(() => {
        this.saveQueued = false;
        this.saveProgressNow();
      }, 0);
    }

    saveProgressNow() {
      if (this.screen !== "game" || this.winner !== null) {
        return;
      }
      const snapshot = this.createSaveSnapshot();
      try {
        window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
      } catch (error) {
        // Ограничения стораджа не должны мешать игровому процессу.
      }
    }

    createSaveSnapshot() {
      return {
        version: SAVE_VERSION,
        screen: this.screen,
        mode: this.mode,
        currentPlayer: this.currentPlayer,
        activatedCount: this.activatedCount,
        turnNumber: this.turnNumber,
        winner: this.winner,
        message: this.message,
        lastEvent: this.lastEvent,
        castleP1Col: CASTLE_P1_COL,
        castleP2Col: CASTLE_P2_COL,
        shieldTurns: {
          1: this.shieldTurns[1] || 0,
          2: this.shieldTurns[2] || 0
        },
        pendingWeaponEquip: this.pendingWeaponEquip
          ? {
              name: this.pendingWeaponEquip.name,
              amount: this.pendingWeaponEquip.amount,
              archerOnly: !!this.pendingWeaponEquip.archerOnly
            }
          : null,
        previewUnitId: this.previewUnitId,
        selectedUnitId: this.selectedUnit ? this.selectedUnit.id : null,
        inventory: {
          1: Object.assign({}, this.inventory[1]),
          2: Object.assign({}, this.inventory[2])
        },
        units: this.board.units.map((u) => ({
          id: u.id,
          player: u.player,
          type: u.type,
          row: u.row,
          col: u.col,
          maxHp: u.maxHp,
          hp: u.hp,
          startArmor: u.startArmor,
          armor: u.armor,
          maxArmor: u.maxArmor,
          damage: u.damage,
          maxMoves: u.maxMoves,
          movesLeft: u.movesLeft,
          done: u.done,
          activated: u.activated,
          visualRow: u.visualRow,
          visualCol: u.visualCol,
          dying: u.dying,
          deathProgress: u.deathProgress
        }))
      };
    }

    readSavedState() {
      try {
        const raw = window.localStorage.getItem(SAVE_KEY);
        if (!raw) {
          return null;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== SAVE_VERSION) {
          return null;
        }
        return parsed;
      } catch (error) {
        return null;
      }
    }

    clearSave() {
      try {
        window.localStorage.removeItem(SAVE_KEY);
      } catch (error) {
        // Ошибка очистки не критична.
      }
    }

    hasContinuableSave() {
      const saved = this.readSavedState();
      return !!(saved && saved.screen === "game" && saved.winner === null);
    }

    restoreSavedState(snapshot) {
      if (!snapshot || typeof snapshot !== "object") {
        return false;
      }
      const nextScreen = snapshot.screen === "game" ? "game" : "menu";
      const nextMode = snapshot.mode === "ai" ? "ai" : snapshot.mode === "pvp" ? "pvp" : null;
      if (nextScreen === "game" && !nextMode) {
        return false;
      }

      // Восстанавливаем позиции замков
      if (Number.isFinite(snapshot.castleP1Col)) {
        CASTLE_P1_COL = Math.max(0, Math.min(6, Math.floor(snapshot.castleP1Col)));
      }
      if (Number.isFinite(snapshot.castleP2Col)) {
        CASTLE_P2_COL = Math.max(0, Math.min(6, Math.floor(snapshot.castleP2Col)));
      }

      this.screen = nextScreen;
      this.mode = nextMode;
      this.currentPlayer = snapshot.currentPlayer === 2 ? 2 : 1;
      this.activatedCount = Math.max(0, Math.floor(Number(snapshot.activatedCount) || 0));
      this.turnNumber = Math.max(1, Math.floor(Number(snapshot.turnNumber) || 1));
      this.winner = snapshot.winner === 1 || snapshot.winner === 2 ? snapshot.winner : null;
      this.message = typeof snapshot.message === "string" ? snapshot.message : "";
      this.lastEvent = typeof snapshot.lastEvent === "string" ? snapshot.lastEvent : "";
      this.shieldTurns = {
        1: Math.max(0, Math.floor(Number(snapshot.shieldTurns && snapshot.shieldTurns[1]) || 0)),
        2: Math.max(0, Math.floor(Number(snapshot.shieldTurns && snapshot.shieldTurns[2]) || 0))
      };

      const pending = snapshot.pendingWeaponEquip;
      if (
        pending &&
        typeof pending.name === "string" &&
        Number.isFinite(Number(pending.amount))
      ) {
        this.pendingWeaponEquip = {
          name: pending.name,
          amount: Math.max(0, Number(pending.amount)),
          archerOnly: !!pending.archerOnly
        };
      } else {
        this.pendingWeaponEquip = null;
      }

      this.inventory = {
        1: this.newInventory(),
        2: this.newInventory()
      };
      [1, 2].forEach((player) => {
        ARTIFACTS.forEach((artifact) => {
          const value =
            snapshot.inventory &&
            snapshot.inventory[player] &&
            snapshot.inventory[player][artifact];
          if (Number.isFinite(Number(value)) && Number(value) >= 0) {
            this.inventory[player][artifact] = Math.floor(Number(value));
          }
        });
      });

      const unitsData = Array.isArray(snapshot.units) ? snapshot.units : [];
      const restoredUnits = [];
      const occupied = new Set();
      let maxId = 0;

      unitsData.forEach((raw) => {
        const unit = this.deserializeUnit(raw);
        if (!unit) {
          return;
        }
        const key = toKey(unit.row, unit.col);
        if (occupied.has(key)) {
          return;
        }
        occupied.add(key);
        restoredUnits.push(unit);
        maxId = Math.max(maxId, unit.id);
      });

      if (nextScreen === "game" && restoredUnits.length === 0) {
        return false;
      }

      if (restoredUnits.length) {
        this.board = new Board();
        this.board.units = restoredUnits;
        this.board.nextId = maxId + 1;
      } else {
        this.board = new Board();
      }

      this.previewUnitId = Number.isFinite(Number(snapshot.previewUnitId))
        ? Number(snapshot.previewUnitId)
        : null;

      const selectedId = Number(snapshot.selectedUnitId);
      if (Number.isFinite(selectedId)) {
        this.selectedUnit = this.board.units.find((u) => u.id === selectedId && u.alive()) || null;
      } else {
        this.selectedUnit = null;
      }

      if (
        this.selectedUnit &&
        (this.selectedUnit.player !== this.currentPlayer || this.selectedUnit.done)
      ) {
        this.selectedUnit = null;
      }

      this.clearHighlights();
      if (this.selectedUnit) {
        this.rebuildHighlights();
      }
      this.ai.reset();
      this.applyResponsiveCanvasSize();
      return true;
    }

    deserializeUnit(raw) {
      if (!raw || typeof raw !== "object") {
        return null;
      }
      if (raw.type !== "knight" && raw.type !== "cavalry" && raw.type !== "archer") {
        return null;
      }
      const id = Math.floor(Number(raw.id));
      const player = Number(raw.player) === 2 ? 2 : 1;
      const row = Math.floor(Number(raw.row));
      const col = Math.floor(Number(raw.col));
      if (!Number.isFinite(id) || id <= 0 || !insideBoard(row, col)) {
        return null;
      }

      const unit = new Unit(id, player, raw.type, row, col);
      unit.maxHp = Math.max(1, Math.floor(Number(raw.maxHp) || unit.maxHp));
      unit.hp = Math.max(0, Math.min(unit.maxHp, Math.floor(Number(raw.hp) || unit.hp)));
      unit.startArmor = Math.max(0, Math.floor(Number(raw.startArmor) || unit.startArmor));
      unit.maxArmor = Math.max(
        0,
        Math.min(unit.startArmor, Math.floor(Number(raw.maxArmor) || unit.maxArmor))
      );
      unit.armor = Math.max(0, Math.min(unit.maxArmor, Math.floor(Number(raw.armor) || unit.armor)));
      unit.damage = Math.max(0, Math.floor(Number(raw.damage) || unit.damage));
      unit.maxMoves = Math.max(1, Math.floor(Number(raw.maxMoves) || unit.maxMoves));
      unit.movesLeft = Math.max(
        0,
        Math.min(unit.maxMoves, Math.floor(Number(raw.movesLeft) || unit.movesLeft))
      );
      unit.done = !!raw.done;
      unit.activated = !!raw.activated;
      
      // Restore animation state
      if (Number.isFinite(raw.visualRow)) {
        unit.visualRow = raw.visualRow;
      }
      if (Number.isFinite(raw.visualCol)) {
        unit.visualCol = raw.visualCol;
      }
      if (raw.dying) {
        unit.dying = true;
        unit.deathProgress = Math.max(0, Math.floor(Number(raw.deathProgress) || 0));
      }
      
      return unit;
    }

    newInventory() {
      const inv = {};
      ARTIFACTS.forEach((a) => {
        inv[a] = 0;
      });
      return inv;
    }

    onAssetsReady() {
      if (this.pendingSavedState && this.restoreSavedState(this.pendingSavedState)) {
        this.pendingSavedState = null;
        this.message = this.message || "Партия восстановлена.";
        this.renderSidebar();
        return;
      }
      this.screen = "menu";
      this.message = "Выберите режим игры";
      this.renderSidebar();
      
      // Показываем баннер при переходе в меню
      if (this.platform) {
        this.platform.showStickyBanner();
      }
    }

    backToMenu() {
      this.screen = "menu";
      this.mode = null;
      this.selectedUnit = null;
      this.previewUnitId = null;
      this.winner = null;
      this.lastEvent = "";
      this.pendingWeaponEquip = null;
      this.battleAdShown = false;
      this.clearHighlights();
      this.message = "Выберите режим игры";
      this.ai.reset();
      this.renderSidebar();
      
      // Показываем баннер в меню
      if (this.platform) {
        this.platform.showStickyBanner();
      }
    }

    isGameActive() {
      return this.screen === "game";
    }

    startMatch(mode) {
      this.clearSave();
      
      // Рандомизируем позиции замков, башен и руин
      randomizeMapPositions();
      
      this.screen = "game";
      this.mode = mode;
      this.board = new Board();
      this.currentPlayer = 1;
      this.activatedCount = 0;
      this.selectedUnit = null;
      this.previewUnitId = null;
      this.winner = null;
      this.turnNumber = 1;
      this.message = "";
      this.lastEvent = "";
      this.shieldTurns = { 1: 0, 2: 0 };
      this.pendingWeaponEquip = null;
      this.battleAdShown = false;
      this.inventory = {
        1: this.newInventory(),
        2: this.newInventory()
      };
      this.clearHighlights();
      this.startTurn();
      this.ai.reset();
    }

    startTurn() {
      this.activatedCount = 0;
      this.selectedUnit = null;
      this.clearHighlights();
      this.ownUnits(this.currentPlayer).forEach((u) => {
        u.resetTurn();
        this.clampUnitArmor(u);
      });

      const maxCanActivate = Math.min(this.maxActivatedPerTurn, this.ownUnits(this.currentPlayer).length);
      this.message = "Ход игрока " + this.currentPlayer + ". Активируйте до " + maxCanActivate + " юнитов.";
      this.renderSidebar();
    }

    ownUnits(player) {
      return this.board.unitsOf(player);
    }

    canUnitAct(unit) {
      if (!unit || !unit.alive() || unit.done) {
        return false;
      }
      if (unit.activated) {
        return true;
      }
      return this.activatedCount < this.maxActivatedPerTurn;
    }

    handleCanvasClick(px, py) {
      if (this.screen !== "game") {
        return;
      }

      const col = Math.floor(px / CELL_SIZE);
      const row = Math.floor(py / CELL_SIZE);
      if (!insideBoard(row, col)) {
        return;
      }

      const clickedUnit = this.board.unitAt(row, col);
      if (this.pendingWeaponEquip) {
        if (clickedUnit && this.canEquipWeaponToUnit(this.pendingWeaponEquip, clickedUnit)) {
          this.equipPendingWeapon(clickedUnit.id);
        } else {
          this.message = "Выберите подходящего союзника для экипировки оружия.";
          this.renderSidebar();
        }
        return;
      }

      if (clickedUnit) {
        if (this.previewUnitId === clickedUnit.id) {
          this.previewUnitId = null;
        } else {
          this.previewUnitId = clickedUnit.id;
        }
      }

      if (this.winner !== null) {
        this.renderSidebar();
        return;
      }

      if (this.mode === "ai" && this.currentPlayer === 2) {
        this.renderSidebar();
        return;
      }

      if (this.selectedUnit) {
        const atk = this.attackMap.get(toKey(row, col));
        if (atk) {
          this.performAttack(row, col, false);
          return;
        }

        const mv = this.moveMap.get(toKey(row, col));
        if (mv) {
          this.performMove(row, col, false);
          return;
        }

        if (
          clickedUnit &&
          clickedUnit.player === this.currentPlayer &&
          !clickedUnit.done &&
          clickedUnit.id !== this.selectedUnit.id &&
          this.selectedUnit.movesLeft === this.selectedUnit.maxMoves
        ) {
          this.selectedUnit.activated = false;
          this.activatedCount = Math.max(0, this.activatedCount - 1);
          this.selectUnit(row, col, false);
          return;
        }

        this.renderSidebar();
        return;
      }

      if (clickedUnit && clickedUnit.player === this.currentPlayer && !clickedUnit.done) {
        this.selectUnit(row, col, false);
      } else {
        this.renderSidebar();
      }
    }

    selectUnit(row, col, fromAI) {
      if (this.pendingWeaponEquip) {
        if (!fromAI) {
          this.blockUntilWeaponEquipped();
        }
        return false;
      }
      const unit = this.board.unitAt(row, col);
      if (!unit) {
        return false;
      }
      if (unit.player !== this.currentPlayer || unit.done) {
        return false;
      }
      if (!this.canUnitAct(unit)) {
        return false;
      }
      if (this.mode === "ai" && this.currentPlayer === 2 && !fromAI) {
        return false;
      }

      if (!unit.activated) {
        unit.activated = true;
        this.activatedCount += 1;
      }

      this.selectedUnit = unit;
      this.rebuildHighlights();
      this.message = "Юнит выбран: " + unit.name + ". Ходов: " + unit.movesLeft + ".";
      this.renderSidebar();
      return true;
    }

    moveActionsFor(unit) {
      if (!unit || unit.movesLeft <= 0) {
        return [];
      }
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      const moves = [];

      if (unit.type === "archer") {
        dirs.forEach((d) => {
          for (let step = 1; step <= 2; step += 1) {
            if (step > unit.movesLeft) {
              break;
            }
            const nr = unit.row + d[0] * step;
            const nc = unit.col + d[1] * step;
            if (!this.board.isFree(nr, nc)) {
              break;
            }
            moves.push({ row: nr, col: nc, cost: step });
          }
        });
      } else {
        dirs.forEach((d) => {
          const nr = unit.row + d[0];
          const nc = unit.col + d[1];
          if (this.board.isFree(nr, nc) && unit.movesLeft >= 1) {
            moves.push({ row: nr, col: nc, cost: 1 });
          }
        });
      }

      return moves;
    }

    attackActionsFor(unit) {
      if (!unit || unit.movesLeft <= 0) {
        return [];
      }
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      const attacks = [];

      if (unit.type === "archer") {
        if (unit.movesLeft < 1) {
          return attacks;
        }
        dirs.forEach((d) => {
          const nr = unit.row + d[0];
          const nc = unit.col + d[1];
          const target = this.board.unitAt(nr, nc);
          if (target && target.player !== unit.player) {
            attacks.push({
              row: nr,
              col: nc,
              cost: 1,
              targetRow: nr,
              targetCol: nc,
              landingRow: unit.row,
              landingCol: unit.col,
              mode: "shot"
            });
          }
        });
        return attacks;
      }

      if (unit.movesLeft < 2) {
        return attacks;
      }

      // Обычные прыжковые атаки (через врага)
      dirs.forEach((d) => {
        const er = unit.row + d[0];
        const ec = unit.col + d[1];
        const enemy = this.board.unitAt(er, ec);
        if (!enemy || enemy.player === unit.player) {
          return;
        }
        const lr = er + d[0];
        const lc = ec + d[1];
        if (!this.board.isFree(lr, lc)) {
          return;
        }
        attacks.push({
          row: lr,
          col: lc,
          cost: 2,
          targetRow: er,
          targetCol: ec,
          landingRow: lr,
          landingCol: lc,
          mode: "jump"
        });
      });

      // НОВОЕ: Атака буквой "Г" (L-образный ход как конь в шахматах)
      // Доступна для рыцарей и конных
      if (unit.type === "knight" || unit.type === "cavalry") {
        const lShapeMoves = [
          // Длинная сторона по вертикали
          [1, 0],  [1, 0],   // 2 вниз, 1 влево/вправо
          [-1, 0], [0, -1],  // 2 вверх, 1 влево/вправо
        ];

        lShapeMoves.forEach((move) => {
          const tr = unit.row + move[0];
          const tc = unit.col + move[1];
          
          if (!insideBoard(tr, tc)) {
            return;
          }

          const target = this.board.unitAt(tr, tc);
          if (!target || target.player === unit.player) {
            return;
          }

          // Проверяем возможные позиции приземления вокруг цели
          const landingOffsets = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
          ];

          landingOffsets.forEach((offset) => {
            const lr = tr + offset[0];
            const lc = tc + offset[1];

            if (!this.board.isFree(lr, lc)) {
              return;
            }

            attacks.push({
              row: lr,
              col: lc,
              cost: 2,
              targetRow: tr,
              targetCol: tc,
              landingRow: lr,
              landingCol: lc,
              mode: "l-attack" // Новый режим атаки
            });
          });
        });
      }

      return attacks;
    }

    rebuildHighlights() {
      this.clearHighlights();
      if (!this.selectedUnit) {
        return;
      }
      const moves = this.moveActionsFor(this.selectedUnit);
      const attacks = this.attackActionsFor(this.selectedUnit);

      moves.forEach((m) => {
        this.moveMap.set(toKey(m.row, m.col), m);
      });
      attacks.forEach((a) => {
        this.attackMap.set(toKey(a.row, a.col), a);
      });
    }

    clearHighlights() {
      this.moveMap.clear();
      this.attackMap.clear();
    }

    performMove(row, col, fromAI) {
      if (this.pendingWeaponEquip) {
        if (!fromAI) {
          this.blockUntilWeaponEquipped();
        }
        return false;
      }
      if (!this.selectedUnit) {
        return false;
      }
      if (this.mode === "ai" && this.currentPlayer === 2 && !fromAI) {
        return false;
      }
      const action = this.moveMap.get(toKey(row, col));
      if (!action) {
        return false;
      }
      if (this.selectedUnit.movesLeft < action.cost) {
        return false;
      }

      // Start smooth movement animation
      this.selectedUnit.startMoveTo(action.row, action.col);
      this.selectedUnit.row = action.row;
      this.selectedUnit.col = action.col;
      this.selectedUnit.movesLeft -= action.cost;

      if (this.selectedUnit.movesLeft <= 0) {
        this.lastEvent = this.selectedUnit.name + " завершил ход.";
        this.finishSelectedUnit();
      } else {
        this.rebuildHighlights();
        this.message = "Ходов осталось: " + this.selectedUnit.movesLeft + ".";
        this.renderSidebar();
      }
      return true;
    }

    computeDamage(attacker, target) {
      let damage = Math.max(0, attacker.damage - target.armor);
      if (this.shieldTurns[target.player] > 0) {
        damage = Math.max(0, damage - 2);
      }
      return damage;
    }

    performAttack(row, col, fromAI) {
      if (this.pendingWeaponEquip) {
        if (!fromAI) {
          this.blockUntilWeaponEquipped();
        }
        return false;
      }
      if (!this.selectedUnit) {
        return false;
      }
      if (this.mode === "ai" && this.currentPlayer === 2 && !fromAI) {
        return false;
      }
      const action = this.attackMap.get(toKey(row, col));
      if (!action) {
        return false;
      }
      if (this.selectedUnit.movesLeft < action.cost) {
        return false;
      }

      const target = this.board.unitAt(action.targetRow, action.targetCol);
      if (!target || target.player === this.selectedUnit.player) {
        return false;
      }

      if (action.mode === "jump" || action.mode === "l-attack") {
        // Animate jump movement
        this.selectedUnit.startMoveTo(action.landingRow, action.landingCol);
        this.selectedUnit.row = action.landingRow;
        this.selectedUnit.col = action.landingCol;
      }

      const damage = this.computeDamage(this.selectedUnit, target);
      target.hp -= damage;
      this.selectedUnit.movesLeft -= action.cost;
      
      // Camera shake on hit!
      this.cameraShake = 8;

      // ANIMATIONS!
      const targetX = target.col * CELL_SIZE + CELL_SIZE / 2;
      const targetY = target.row * CELL_SIZE + CELL_SIZE / 2;
      
      // Simple hit particles
      this.createExplosion(targetX, targetY, "#ff6b6b", 6);
      
      // Floating damage text
      this.createFloatingText("-" + damage, targetX, targetY - 10, "#ff6b6b", 18);

      this.lastEvent =
        this.selectedUnit.name +
        " атакует " +
        target.name +
        " на " +
        damage +
        " урона.";

      if (target.hp <= 0) {
        this.lastEvent += " " + target.name + " повержен.";
        // Start death animation instead of immediate removal
        target.startDeath();
        // Death particles and flash
        this.createExplosion(targetX, targetY, "#666", 8);
        this.createExplosion(targetX, targetY, "#ffffff", 4);
        this.cameraShake = 12; // Bigger shake on death
      }

      this.board.removeDead();
      
      // Clean up truly dead units periodically
      if (this.frameCount % 10 === 0) {
        this.board.removeDead();
      }
      
      if (this.previewUnitId !== null && !this.board.units.some((u) => u.id === this.previewUnitId)) {
        this.previewUnitId = null;
      }

      this.checkWinner();
      if (this.winner !== null) {
        this.selectedUnit = null;
        this.clearHighlights();
        this.renderSidebar();
        return true;
      }

      if (this.selectedUnit.movesLeft <= 0) {
        this.finishSelectedUnit();
      } else {
        this.rebuildHighlights();
        this.message = "Ходов осталось: " + this.selectedUnit.movesLeft + ".";
        this.renderSidebar();
      }
      return true;
    }

    finishSelectedUnit() {
      if (!this.selectedUnit) {
        return;
      }
      this.selectedUnit.done = true;
      this.selectedUnit.movesLeft = 0;
      this.selectedUnit = null;
      this.clearHighlights();

      if (this.winner !== null) {
        this.renderSidebar();
        return;
      }

      if (this.shouldEndTurn()) {
        this.endTurn();
      } else {
        const left = Math.max(0, this.maxActivatedPerTurn - this.activatedCount);
        this.message = "Выберите юнит. Осталось активаций: " + left + ".";
        this.renderSidebar();
      }
    }

    shouldEndTurn() {
      if (this.pendingWeaponEquip) {
        return false;
      }
      const own = this.ownUnits(this.currentPlayer);
      if (!own.length) {
        return true;
      }
      if (own.every((u) => u.done)) {
        return true;
      }
      if (this.activatedCount >= Math.min(this.maxActivatedPerTurn, own.length) && this.selectedUnit === null) {
        return true;
      }
      return false;
    }

    endTurn() {
      if (this.winner !== null) {
        return;
      }

      const defender = otherPlayer(this.currentPlayer);
      if (this.shieldTurns[defender] > 0) {
        this.shieldTurns[defender] -= 1;
      }

      this.currentPlayer = defender;
      this.turnNumber += 1;
      this.startTurn();
    }

    forceEndTurn() {
      if (this.pendingWeaponEquip) {
        return;
      }
      this.selectedUnit = null;
      this.clearHighlights();
      this.endTurn();
    }

    skipSelected(fromAI) {
      if (this.pendingWeaponEquip) {
        if (!fromAI) {
          this.blockUntilWeaponEquipped();
        }
        return;
      }
      if (!this.selectedUnit) {
        return;
      }
      if (this.mode === "ai" && this.currentPlayer === 2 && !fromAI) {
        return;
      }
      this.lastEvent = this.selectedUnit.name + " пропускает ход.";
      this.finishSelectedUnit();
    }

    canAfford(inv, recipe) {
      const names = Object.keys(recipe);
      for (let i = 0; i < names.length; i += 1) {
        const name = names[i];
        if ((inv[name] || 0) < recipe[name]) {
          return false;
        }
      }
      return true;
    }

    spend(inv, recipe) {
      Object.keys(recipe).forEach((name) => {
        inv[name] -= recipe[name];
      });
    }

    blockUntilWeaponEquipped() {
      if (!this.pendingWeaponEquip) {
        return false;
      }
      this.message =
        "Сначала экипируйте " +
        this.pendingWeaponEquip.name +
        ". Отменить выбор нельзя.";
      this.renderSidebar();
      return true;
    }

    clampUnitArmor(unit) {
      if (!unit) {
        return;
      }
      const cap = unit.startArmor;
      unit.maxArmor = Math.min(unit.maxArmor, cap);
      unit.armor = Math.min(unit.armor, cap);
    }

    canEquipWeaponToUnit(weapon, unit) {
      if (!weapon || !unit || !unit.alive()) {
        return false;
      }
      if (unit.player !== this.currentPlayer) {
        return false;
      }
      if (weapon.archerOnly && unit.type !== "archer") {
        return false;
      }
      return true;
    }

    weaponEquipTargets(weapon) {
      return this.ownUnits(this.currentPlayer).filter((u) =>
        this.canEquipWeaponToUnit(weapon, u)
      );
    }

    queueWeaponEquip(weapon, sourceLabel) {
      this.pendingWeaponEquip = {
        name: weapon.name,
        amount: weapon.amount,
        archerOnly: !!weapon.archerOnly
      };
      this.lastEvent = sourceLabel + ": " + weapon.name + ".";
      this.message =
        "Экипируйте " +
        weapon.name +
        " одному из своих юнитов. Отменить выбор нельзя.";
      this.renderSidebar();
    }

    equipPendingWeapon(unitId) {
      if (!this.pendingWeaponEquip) {
        return false;
      }
      const target = this.board.units.find((u) => u.id === unitId && u.alive());
      if (!this.canEquipWeaponToUnit(this.pendingWeaponEquip, target)) {
        this.message = "Нужно выбрать подходящего союзника для экипировки.";
        this.renderSidebar();
        return false;
      }

      const weapon = this.pendingWeaponEquip;
      target.damage += weapon.amount;
      this.pendingWeaponEquip = null;
      this.lastEvent =
        weapon.name +
        " экипировано юниту " +
        target.name +
        " (+" +
        weapon.amount +
        " урона).";
      this.message = "Оружие экипировано.";
      if (this.selectedUnit) {
        this.rebuildHighlights();
      }
      if (this.shouldEndTurn()) {
        this.endTurn();
      } else {
        this.renderSidebar();
      }
      return true;
    }

    drawArtifact(fromAI) {
      if (this.pendingWeaponEquip) {
        if (!fromAI) {
          this.blockUntilWeaponEquipped();
        }
        return false;
      }
      if (!this.selectedUnit) {
        return false;
      }
      if (this.mode === "ai" && this.currentPlayer === 2 && !fromAI) {
        return false;
      }
      if (this.selectedUnit.movesLeft < 1) {
        return false;
      }
      if (!this.board.inRuins(this.selectedUnit.row, this.selectedUnit.col)) {
        this.message = "Юнит должен стоять в руинах.";
        this.renderSidebar();
        return false;
      }
      if (!fromAI && Math.random() < WEAPON_FIND_CHANCE) {
        const weapon = randomChoice(WEAPONS);
        const targets = this.weaponEquipTargets(weapon);
        if (targets.length > 0) {
          this.selectedUnit.movesLeft -= 1;
          this.queueWeaponEquip(weapon, "Найдено оружие");
          if (this.selectedUnit.movesLeft <= 0) {
            this.selectedUnit.done = true;
            this.selectedUnit.movesLeft = 0;
            this.selectedUnit = null;
            this.clearHighlights();
          } else {
            this.rebuildHighlights();
          }
          this.renderSidebar();
          return true;
        }
      }
      const artifact = randomChoice(ARTIFACTS);
      this.inventory[this.currentPlayer][artifact] += 1;
      this.selectedUnit.movesLeft -= 1;
      this.lastEvent = "Найден артефакт: " + artifact + ".";

      if (this.selectedUnit.movesLeft <= 0) {
        this.finishSelectedUnit();
      } else {
        this.rebuildHighlights();
        this.renderSidebar();
      }
      return true;
    }

    castSpell(index, fromAI) {
      if (this.pendingWeaponEquip) {
        if (!fromAI) {
          this.blockUntilWeaponEquipped();
        }
        return false;
      }
      if (!this.selectedUnit) {
        return false;
      }
      if (this.mode === "ai" && this.currentPlayer === 2 && !fromAI) {
        return false;
      }
      if (this.selectedUnit.movesLeft < 1) {
        return false;
      }
      if (!this.board.isTower(this.selectedUnit.row, this.selectedUnit.col)) {
        this.message = "Заклинания доступны только на башне мага.";
        this.renderSidebar();
        return false;
      }

      const spell = SPELLS[index];
      if (!spell) {
        return false;
      }

      const inv = this.inventory[this.currentPlayer];
      if (!this.canAfford(inv, spell.recipe)) {
        this.message = "Недостаточно артефактов для заклинания.";
        this.renderSidebar();
        return false;
      }

      this.spend(inv, spell.recipe);
      const allies = this.ownUnits(this.currentPlayer);
      
      // Apply spell effects
      if (index === 0) {
        // Дождь защиты
        allies.forEach((u) => {
          u.maxHp += 2;
          u.hp += 2;
          const ux = u.col * CELL_SIZE + CELL_SIZE / 2;
          const uy = u.row * CELL_SIZE + CELL_SIZE / 2;
          this.createFloatingText("+2 HP", ux, uy - 10, "#67cf6f", 16);
        });
      } else if (index === 1) {
        // Сталь свободы
        allies.forEach((u) => {
          u.maxArmor = u.startArmor;
          u.armor = Math.min(u.startArmor, u.armor + 2);
        });
      } else if (index === 2) {
        // Небо огня
        this.shieldTurns[this.currentPlayer] = 1;
      }

      this.selectedUnit.movesLeft -= 1;
      this.lastEvent = "Заклинание: " + spell.name + ".";

      if (this.selectedUnit.movesLeft <= 0) {
        this.finishSelectedUnit();
      } else {
        this.rebuildHighlights();
        this.renderSidebar();
      }
      return true;
    }

    craftWeapon(index) {
      if (this.pendingWeaponEquip) {
        this.blockUntilWeaponEquipped();
        return false;
      }
      if (!this.selectedUnit || this.winner !== null) {
        return false;
      }
      if (this.mode === "ai" && this.currentPlayer === 2) {
        return false;
      }

      const recipe = WEAPONS[index];
      if (!recipe) {
        return false;
      }
      const targets = this.weaponEquipTargets(recipe);
      if (!targets.length) {
        this.message = recipe.archerOnly
          ? "Нет доступного лучника для экипировки."
          : "Нет подходящих союзников для экипировки.";
        this.renderSidebar();
        return false;
      }

      const inv = this.inventory[this.currentPlayer];
      if (!this.canAfford(inv, recipe.recipe)) {
        this.message = "Недостаточно артефактов для крафта.";
        this.renderSidebar();
        return false;
      }

      this.spend(inv, recipe.recipe);
      this.queueWeaponEquip(recipe, "Скрафчено");
      return true;
    }

    surrender() {
      if (this.screen !== "game" || this.winner !== null) {
        return;
      }
      if (this.mode === "ai" && this.currentPlayer === 2) {
        return;
      }
      this.winner = otherPlayer(this.currentPlayer);
      this.message = "Игрок " + this.currentPlayer + " сдался.";
      this.lastEvent = "Победа игрока " + this.winner + ".";
      this.selectedUnit = null;
      this.clearHighlights();
      this.showBattleInterstitial();
      this.clearSave();
      this.renderSidebar();
    }

    checkWinner() {
      const p1 = this.ownUnits(1).length;
      const p2 = this.ownUnits(2).length;
      if (p1 <= 0) {
        this.winner = 2;
        this.message = "Победа игрока 2!";
        this.showBattleInterstitial();
        this.clearSave();
      } else if (p2 <= 0) {
        this.winner = 1;
        this.message = "Победа игрока 1!";
        this.showBattleInterstitial();
        this.clearSave();
      }
    }

    renderSidebar() {
      if (this.screen === "loading") {
        const st = this.assets.stats();
        this.sidebar.innerHTML =
          '<div class="menu-wrap">' +
          '<div class="menu-title">Рыцари и Замки</div>' +
          '<div class="card loading">Загрузка спрайтов: ' + st.resolved + '/' + st.pending + '</div>' +
          '<div class="card rules">Игра запускается после загрузки ассетов или через 3 секунды таймаута.</div>' +
          '</div>';
        this.applyResponsiveCanvasSize();
        return;
      }

      if (this.screen === "menu") {
        let menuHTML = '<div class="menu-wrap">';
        menuHTML += '<div class="menu-title">Рыцари и Замки</div>';
        menuHTML += '<div class="card">';
        menuHTML += '<div class="line">Тактическая браузерная игра на поле 10x20.</div>';
        menuHTML += '</div>';
        menuHTML += '<div class="card">';
        menuHTML += '<h3>Правила</h3>';
        menuHTML += MENU_RULES_HTML;
        menuHTML += '</div>';
        menuHTML += '<div class="menu-buttons">';
        if (this.hasContinuableSave()) {
          menuHTML += '<button class="btn restart" data-action="continue-save">Продолжить партию</button>';
        }
        menuHTML += '<button class="btn secondary" data-action="start-pvp">2 Игрока</button>';
        menuHTML += '<button class="btn primary" data-action="start-ai">Против ИИ</button>';
        menuHTML += '</div>';
        menuHTML += '</div>';
        
        this.sidebar.innerHTML = menuHTML;
        this.applyResponsiveCanvasSize();
        return;
      }

      const p1Count = this.ownUnits(1).length;
      const p2Count = this.ownUnits(2).length;
      const playerClass = this.currentPlayer === 1 ? "player-p1" : "player-p2";
      const inv = this.inventory[this.currentPlayer];
      const activationLeft = Math.max(0, this.maxActivatedPerTurn - this.activatedCount);
      const waitingWeaponEquip = !!this.pendingWeaponEquip;

      let html = "";
      html += '<div class="player-label ' + playerClass + '">Игрок ' + this.currentPlayer + '</div>';
      html += '<div class="message">' + this.escape(this.message) + '</div>';
      html += '<div class="score">Счёт: P1 ' + p1Count + ' : ' + p2Count + ' P2</div>';
      html += '<div class="line">Режим: ' + (this.mode === "ai" ? "Против ИИ" : "2 Игрока") + '</div>';
      html += '<div class="line">Активаций осталось: ' + activationLeft + '</div>';
      html +=
        '<button class="btn secondary" data-action="back-menu" style="margin-top:8px" ' +
        (waitingWeaponEquip ? "disabled" : "") +
        '>В меню</button>';

      if (this.shieldTurns[1] > 0) {
        html += '<div class="badge p1">Щит P1 активен</div>';
      }
      if (this.shieldTurns[2] > 0) {
        html += '<div class="badge p2">Щит P2 активен</div>';
      }

      if (this.lastEvent) {
        html += '<div class="card"><div class="hint">' + this.escape(this.lastEvent) + '</div></div>';
      }

      if (waitingWeaponEquip && this.pendingWeaponEquip) {
        const pending = this.pendingWeaponEquip;
        const targets = this.weaponEquipTargets(pending);
        html += '<hr class="sep" />';
        html += '<div class="section">';
        html += '<h3>Обязательная экипировка</h3>';
        html +=
          '<div class="line">Выберите союзника для ' +
          this.escape(pending.name) +
          " (+" +
          pending.amount +
          ' урона).</div>';
        html += '<div class="hint">Отменить или пропустить нельзя.</div>';
        if (!targets.length) {
          html += '<div class="line">Подходящих юнитов нет.</div>';
        } else {
          targets.forEach((unit) => {
            html +=
              '<button class="btn primary" data-action="equip-weapon" data-unit-id="' +
              unit.id +
              '">' +
              this.escape(unit.name) +
              ' (HP ' +
              unit.hp +
              "/" +
              unit.maxHp +
              ", Armor " +
              unit.armor +
              ", DMG " +
              unit.damage +
              ")</button>";
          });
        }
        html += "</div>";
      }

      html += '<hr class="sep" />';
      html += '<div class="section"><h3>Инвентарь артефактов (Игрок ' + this.currentPlayer + ')</h3>';
      ARTIFACTS.forEach((name) => {
        const count = inv[name] || 0;
        const state = count > 0 ? "has" : "empty";
        const color = count > 0 ? ARTIFACT_COLORS[name] : "#8f7d65";
        html +=
          '<div class="inventory-row ' +
          state +
          '" style="color:' +
          color +
          '">' +
          this.escape(name) +
          ': ' +
          count +
          '</div>';
      });
      html += "</div>";

      const previewUnit = this.getPreviewUnit();
      if (previewUnit) {
        html += '<hr class="sep" />';
        html += '<div class="section preview">';
        html += '<h3>Превью юнита</h3>';
        html += '<canvas id="previewSprite" width="144" height="144"></canvas>';
        html +=
          '<div class="preview-title">' +
          this.escape(previewUnit.name) +
          ' <span class="tag" style="color:' +
          (previewUnit.player === 1 ? COLORS.p1 : COLORS.p2) +
          '">Игрок ' +
          previewUnit.player +
          "</span></div>";
        html +=
          '<div class="kv">HP: ' +
          previewUnit.hp +
          '/' +
          previewUnit.maxHp +
          ' | Armor: ' +
          previewUnit.armor +
          ' | Damage: ' +
          previewUnit.damage +
          ' | Moves: ' +
          previewUnit.movesLeft +
          '/' +
          previewUnit.maxMoves +
          "</div>";
        html += '<button class="btn" data-action="clear-preview">Закрыть превью</button>';
        html += "</div>";
      }

      if (this.selectedUnit && this.selectedUnit.player === this.currentPlayer && this.winner === null) {
        const u = this.selectedUnit;
        html += '<hr class="sep" />';
        html += '<div class="section">';
        html += '<h3>Выбранный юнит</h3>';
        html +=
          '<div class="line">' +
          this.escape(u.name) +
          ' | HP ' +
          u.hp +
          '/' +
          u.maxHp +
          ' | Armor ' +
          u.armor +
          ' | DMG ' +
          u.damage +
          ' | Ходы ' +
          u.movesLeft +
          '/' +
          u.maxMoves +
          "</div>";

        if (this.board.inRuins(u.row, u.col) && u.movesLeft > 0) {
          html +=
            '<button class="btn secondary" data-action="draw-artifact" ' +
            (waitingWeaponEquip ? "disabled" : "") +
            '>Тянуть артефакт</button>';
        }

        if (this.board.isTower(u.row, u.col) && u.movesLeft > 0) {
          html += '<h3>Заклинания</h3>';
          SPELLS.forEach((spell, idx) => {
            const can = this.canAfford(this.inventory[this.currentPlayer], spell.recipe) && !waitingWeaponEquip;
            html +=
              '<button class="btn" data-action="cast-spell" data-idx="' +
              idx +
              '" ' +
              (can ? "" : "disabled") +
              '>' +
              this.escape(spell.name) +
              '<div class="recipe">' +
              this.escape(cloneRecipeText(spell.recipe)) +
              "</div>" +
              '<div class="recipe-desc">' +
              this.escape(spell.desc) +
              "</div></button>";
          });
        }

        html += '<h3>Крафт оружия</h3>';
        WEAPONS.forEach((w, idx) => {
          const canRecipe = this.canAfford(this.inventory[this.currentPlayer], w.recipe);
          const hasTarget = this.weaponEquipTargets(w).length > 0;
          const can = canRecipe && hasTarget && !waitingWeaponEquip;
          html +=
            '<button class="btn" data-action="craft" data-idx="' +
            idx +
            '" ' +
            (can ? "" : "disabled") +
            '>' +
            this.escape(w.name) +
            '<div class="recipe">' +
            this.escape(cloneRecipeText(w.recipe)) +
            "</div>" +
            '<div class="recipe-desc">' +
            this.escape(w.desc) +
            "</div></button>";
        });

        html += "</div>";
      }

      html += '<hr class="sep" />';
      html +=
        '<button class="btn skip" data-action="skip" ' +
        (this.selectedUnit && this.winner === null && !waitingWeaponEquip ? "" : "disabled") +
        '>Пропустить (ПКМ/Space)</button>';
      html +=
        '<button class="btn danger" data-action="surrender" ' +
        (this.winner === null && !waitingWeaponEquip ? "" : "disabled") +
        '>Сдаться</button>';

      if (this.winner !== null) {
        html += '<hr class="sep" />';
        html +=
          '<div class="card"><h3>Победа</h3><div class="line" style="color:' +
          (this.winner === 1 ? COLORS.p1 : COLORS.p2) +
          '">Победил игрок ' +
          this.winner +
          "</div></div>";
        html += '<button class="btn restart" data-action="restart">Рестарт</button>';
      }

      this.sidebar.innerHTML = html;
      this.paintPreviewSprite();
      this.applyResponsiveCanvasSize();
      this.queueSaveProgress();
    }

    paintPreviewSprite() {
      const unit = this.getPreviewUnit();
      if (!unit) {
        return;
      }
      const canvas = document.getElementById("previewSprite");
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#241c15";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (unit.type === "cavalry") {
        this.drawMountedComposite(ctx, unit, 0, 0, canvas.width, canvas.height);
        return;
      }

      const key = this.spriteKeyForUnit(unit);
      const img = this.assets.get(key);
      if (img) {
        const frame = UNIT_TYPES[unit.type].frame;
        const frameIndex = this.frameIndexForUnit(unit);
        ctx.drawImage(img, frame * frameIndex, 0, frame, frame, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = unit.player === 1 ? COLORS.p1 : COLORS.p2;
        ctx.fillRect(22, 22, 100, 100);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(UNIT_TYPES[unit.type].letter, 72, 72);
      }
    }

    getPreviewUnit() {
      if (this.previewUnitId === null) {
        return null;
      }
      const unit = this.board.units.find((u) => u.id === this.previewUnitId && u.alive());
      if (!unit) {
        this.previewUnitId = null;
        return null;
      }
      return unit;
    }

    escape(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    spriteKeyForUnit(unit) {
      const color = unit.player === 1 ? "blue" : "red";
      return "u_" + color + "_" + unit.type;
    }

    drawMountedComposite(ctx, unit, dx, dy, dw, dh) {
      const horse = this.assets.get("horse_knight_base");
      if (horse) {
        const sw = 91;
        const sh = 57;
        const hx = dx + dw * 0.02;
        const hy = dy + dh * 0.46;
        const hw = dw * 0.96;
        const hh = dh * 0.46;
        // Use a static frame instead of animated
        ctx.drawImage(horse, 149, 165, sw, sh, hx, hy, hw, hh);
      } else {
        ctx.fillStyle = "rgba(110, 102, 96, 0.9)";
        ctx.beginPath();
        ctx.ellipse(
          dx + dw * 0.54,
          dy + dh * 0.63,
          dw * 0.34,
          dh * 0.2,
          -0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const rider = this.assets.get(this.spriteKeyForUnit(unit));
      if (rider) {
        const rsx = 115;
        const rsy = 48;
        const rsw = 69;
        const rsh = 150;
        const riderW = dw * 0.34;
        const riderH = dh * 0.50;
        const rx = dx + dw * 0.33;
        const ry = dy + dh * 0.11;
        ctx.drawImage(rider, rsx, rsy, rsw, rsh, rx, ry, riderW, riderH);
      } else {
        ctx.fillStyle = unit.player === 1 ? COLORS.p1 : COLORS.p2;
        ctx.fillRect(dx + dw * 0.28, dy + dh * 0.1, dw * 0.35, dh * 0.35);
      }
    }

    frameIndexForUnit(unit) {
      // Very slow animation through sprite sheet
      const animSpeed = 30; // Much slower for smooth GIF
      const totalFrames = unit.type === "cavalry" ? 4 : 6;
      return Math.floor(this.frameCount / animSpeed) % totalFrames;
    }

    drawMenuCanvas() {
      const ctx = this.ctx;
      ctx.fillStyle = "#0e0e0e";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const cover = this.assets.get("cover");
      if (cover) {
        const scale = Math.min(WIDTH / cover.width, HEIGHT / cover.height);
        const dw = cover.width * scale;
        const dh = cover.height * scale;
        const dx = (WIDTH - dw) / 2;
        const dy = (HEIGHT - dh) / 2;
        ctx.drawImage(cover, dx, dy, dw, dh);
      } else {
        ctx.fillStyle = "#3a2a1b";
        ctx.fillRect(28, 180, WIDTH - 56, HEIGHT - 360);
        ctx.fillStyle = "#f0d7a6";
        ctx.font = "bold 42px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Рыцари и Замки", WIDTH / 2, HEIGHT / 2 - 12);
      }

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, WIDTH - 1, HEIGHT - 1);
    }

    drawGameCanvas() {
      const ctx = this.ctx;
      
      // Apply camera shake
      ctx.save();
      ctx.translate(this.cameraShakeX, this.cameraShakeY);

      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.groundA : COLORS.groundB;
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }

      this.drawCastle(1, 0, CASTLE_P1_COL);
      this.drawCastle(2, 16, CASTLE_P2_COL);
      this.drawTowers();
      this.drawRuins();

      if (this.selectedUnit) {
        const sx = this.selectedUnit.col * CELL_SIZE;
        const sy = this.selectedUnit.row * CELL_SIZE;
        ctx.strokeStyle = COLORS.selected;
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 2, sy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }

      this.moveMap.forEach((m) => {
        ctx.fillStyle = COLORS.move;
        ctx.fillRect(m.col * CELL_SIZE, m.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

      this.attackMap.forEach((a) => {
        // Разный цвет для обычной атаки и L-атаки
        ctx.fillStyle = a.mode === "l-attack" ? COLORS.attackL : COLORS.attack;
        ctx.fillRect(a.col * CELL_SIZE, a.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        // Рисуем траекторию для L-атаки
        if (a.mode === "l-attack" && this.selectedUnit) {
          ctx.save();
          ctx.strokeStyle = "rgba(230, 120, 50, 0.6)";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          
          const startX = this.selectedUnit.col * CELL_SIZE + CELL_SIZE / 2;
          const startY = this.selectedUnit.row * CELL_SIZE + CELL_SIZE / 2;
          const targetX = a.targetCol * CELL_SIZE + CELL_SIZE / 2;
          const targetY = a.targetRow * CELL_SIZE + CELL_SIZE / 2;
          const endX = a.col * CELL_SIZE + CELL_SIZE / 2;
          const endY = a.row * CELL_SIZE + CELL_SIZE / 2;
          
          // Рисуем L-образный путь
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(targetX, targetY); // К цели
          ctx.lineTo(endX, endY); // К месту приземления
          ctx.stroke();
          
          // Маркер на цели
          ctx.fillStyle = "rgba(230, 120, 50, 0.5)";
          ctx.beginPath();
          ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      });

      // Draw all units including dying ones
      this.board.units.forEach((u) => {
        this.drawUnit(u);
      });

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (let row = 0; row <= ROWS; row += 1) {
        ctx.beginPath();
        ctx.moveTo(0, row * CELL_SIZE + 0.5);
        ctx.lineTo(WIDTH, row * CELL_SIZE + 0.5);
        ctx.stroke();
      }
      for (let col = 0; col <= COLS; col += 1) {
        ctx.beginPath();
        ctx.moveTo(col * CELL_SIZE + 0.5, 0);
        ctx.lineTo(col * CELL_SIZE + 0.5, HEIGHT);
        ctx.stroke();
      }
      
      // Draw particles and floating texts on top
      this.drawParticles();
      this.drawFloatingTexts();
      
      ctx.restore();
    }

    drawCastle(player, topRow, leftCol) {
      const ctx = this.ctx;
      const x = leftCol * CELL_SIZE;
      const y = topRow * CELL_SIZE;
      const size = CELL_SIZE * 4;
      const key = player === 1 ? "castle_blue" : "castle_red";
      const img = this.assets.get(key);

      if (img) {
        ctx.drawImage(img, x, y, size, size);
      } else {
        ctx.fillStyle = player === 1 ? "rgba(70,130,220,0.30)" : "rgba(220,70,70,0.30)";
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = player === 1 ? COLORS.p1 : COLORS.p2;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
        ctx.fillStyle = player === 1 ? COLORS.p1 : COLORS.p2;
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("CASTLE", x + size / 2, y + size / 2);
      }
    }

    drawTowers() {
      const ctx = this.ctx;
      const img = this.assets.get("tower_blue");
      TOWERS.forEach((t) => {
        const x = t.col * CELL_SIZE;
        const y = t.row * CELL_SIZE;
        
        if (img) {
          ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = "#513c6f";
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = "#b89dff";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          ctx.fillStyle = "#decfff";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("T", x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }
      });
    }

    drawRuins() {
      const ctx = this.ctx;
      const x = RUINS.left * CELL_SIZE;
      const y = RUINS.top * CELL_SIZE;
      const w = RUINS.width * CELL_SIZE;
      const h = RUINS.height * CELL_SIZE;

      const customRuins = this.assets.get("ruins_custom");
      if (customRuins) {
        // Harmonize custom ruins with board palette and perspective.
        const grassCenter = ctx.createRadialGradient(
          x + w * 0.5,
          y + h * 0.56,
          w * 0.08,
          x + w * 0.5,
          y + h * 0.56,
          w * 0.74
        );
        grassCenter.addColorStop(0, "#9fd56e");
        grassCenter.addColorStop(0.52, "#78aa4e");
        grassCenter.addColorStop(1, "#4d7038");
        ctx.fillStyle = grassCenter;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = "rgba(0,0,0,0.14)";
        ctx.beginPath();
        ctx.ellipse(x + w * 0.52, y + h * 0.73, w * 0.44, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.filter = "saturate(0.96) brightness(1.08) contrast(0.98)";
        ctx.globalAlpha = 0.98;
        // Crop inner composition to avoid glow/vignette and keep clean fit in 2x2.
        ctx.drawImage(customRuins, 170, 170, 700, 620, x + 3, y + 2, w - 6, h - 4);
        ctx.restore();

        const centerGlow = ctx.createRadialGradient(
          x + w * 0.5,
          y + h * 0.58,
          w * 0.1,
          x + w * 0.5,
          y + h * 0.58,
          w * 0.72
        );
        centerGlow.addColorStop(0, "rgba(150,203,103,0.44)");
        centerGlow.addColorStop(0.56, "rgba(112,162,76,0.26)");
        centerGlow.addColorStop(1, "rgba(60,88,42,0)");
        ctx.fillStyle = centerGlow;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "rgba(52,43,32,0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 26, y + 30);
        ctx.lineTo(x + 32, y + 46);
        ctx.lineTo(x + 25, y + 62);
        ctx.lineTo(x + 34, y + 77);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 64, y + 24);
        ctx.lineTo(x + 56, y + 42);
        ctx.lineTo(x + 66, y + 58);
        ctx.lineTo(x + 58, y + 76);
        ctx.stroke();

        ctx.fillStyle = "rgba(96,128,74,0.52)";
        ctx.beginPath();
        ctx.ellipse(x + 18, y + 82, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 74, y + 79, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(x, y + 10, w, h - 10);
    }

      const fallbackGrass = ctx.createRadialGradient(
        x + w * 0.5,
        y + h * 0.56,
        w * 0.06,
        x + w * 0.5,
        y + h * 0.56,
        w * 0.74
      );
      fallbackGrass.addColorStop(0, "#94c662");
      fallbackGrass.addColorStop(0.56, "#6f9f47");
      fallbackGrass.addColorStop(1, "#496b37");
      ctx.fillStyle = fallbackGrass;
      ctx.fillRect(x, y, w, h);

      const monastery = this.assets.get("monastery_ruins");
      if (monastery) {
        ctx.save();
        ctx.globalAlpha = 0.93;
        // Lower body of monastery sprite keeps Tiny Swords style and fits 2x2 ruins zone.
        ctx.drawImage(monastery, 0, 128, 192, 192, x + 3, y - 6, w - 6, h + 12);
        ctx.restore();
      }

      this.drawBrokenColumn(x + 12, y + 20, 15, 40, "#8a8178");
      this.drawBrokenColumn(x + 60, y + 24, 14, 35, "#776d63");

      ctx.fillStyle = "rgba(39,30,23,0.72)";
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 2);
      ctx.lineTo(x + 26, y + 2);
      ctx.lineTo(x + 17, y + 18);
      ctx.lineTo(x + 4, y + 15);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + w - 3, y + 8);
      ctx.lineTo(x + w - 24, y + 14);
      ctx.lineTo(x + w - 10, y + 28);
      ctx.lineTo(x + w - 3, y + 25);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(30,24,19,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 30, y + 24);
      ctx.lineTo(x + 38, y + 40);
      ctx.lineTo(x + 30, y + 56);
      ctx.lineTo(x + 42, y + 74);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 70, y + 18);
      ctx.lineTo(x + 58, y + 36);
      ctx.lineTo(x + 66, y + 52);
      ctx.lineTo(x + 54, y + 72);
      ctx.stroke();

      ctx.fillStyle = "#68615a";
      ctx.beginPath();
      ctx.ellipse(x + 22, y + 76, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#76706a";
      ctx.beginPath();
      ctx.ellipse(x + 48, y + 67, 13, 6, 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#5f8053";
      ctx.beginPath();
      ctx.ellipse(x + 34, y + 84, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 68, y + 83, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(x, y + 10, w, h - 10);
    }

    drawBrokenColumn(x, y, w, h, color) {
      const ctx = this.ctx;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + 14);
      ctx.lineTo(x + w - 5, y + 8);
      ctx.lineTo(x + w - 10, y + 12);
      ctx.lineTo(x + w - 13, y + 7);
      ctx.lineTo(x + 5, y + 10);
      ctx.lineTo(x + 2, y + 6);
      ctx.lineTo(x, y + 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(x + 2, y + 16, w - 4, h - 18);
    }

    drawUnit(unit) {
      const ctx = this.ctx;
      
      // Use visual position for smooth animation
      const baseX = unit.visualCol * CELL_SIZE;
      const baseY = unit.visualRow * CELL_SIZE;

      ctx.save();
      ctx.translate(baseX, baseY);
      
      // Death animation overlay
      if (unit.dying) {
        const progress = unit.deathProgress / unit.deathDuration;
        
        // Fade out the unit
        ctx.globalAlpha = Math.max(0, 1 - progress * 1.5);
        
        // Scale down slightly
        const scale = 1 - progress * 0.3;
        ctx.translate(CELL_SIZE / 2, CELL_SIZE / 2);
        ctx.scale(scale, scale);
        ctx.translate(-CELL_SIZE / 2, -CELL_SIZE / 2);
      }

      if (unit.type === "cavalry") {
        this.drawMountedComposite(ctx, unit, 0, 0, CELL_SIZE, CELL_SIZE);
      } else {
        const sprite = this.assets.get(this.spriteKeyForUnit(unit));
        const frame = UNIT_TYPES[unit.type].frame;
        const frameIndex = this.frameIndexForUnit(unit);

        if (sprite) {
          ctx.drawImage(
            sprite,
            frame * frameIndex,
            0,
            frame,
            frame,
            0,
            0,
            CELL_SIZE,
            CELL_SIZE
          );
        } else {
          ctx.fillStyle = unit.player === 1 ? COLORS.p1 : COLORS.p2;
          ctx.fillRect(5, 5, CELL_SIZE - 10, CELL_SIZE - 10);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 17px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(UNIT_TYPES[unit.type].letter, CELL_SIZE / 2, CELL_SIZE / 2);
        }
      }
      
      ctx.restore();
      
      // Draw skull death animation on top
      if (unit.dying) {
        const progress = unit.deathProgress / unit.deathDuration;
        
        ctx.save();
        
        // Skull appears and floats up
        const skullAlpha = Math.sin(progress * Math.PI); // Fade in then out
        const skullY = baseY + CELL_SIZE / 2 - progress * CELL_SIZE * 0.8;
        const skullSize = CELL_SIZE * 0.6;
        
        ctx.globalAlpha = skullAlpha * 0.9;
        ctx.translate(baseX + CELL_SIZE / 2, skullY);
        
        // Slight rotation
        ctx.rotate(Math.sin(progress * Math.PI * 4) * 0.2);
        
        // Draw skull
        this.drawSkull(ctx, -skullSize / 2, -skullSize / 2, skullSize, skullSize);
        
        ctx.restore();
      }

      // Draw overlays in original position (only if not dying)
      if (!unit.dying) {
        if (unit.id === this.previewUnitId) {
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 3;
          ctx.strokeRect(baseX + 3, baseY + 3, CELL_SIZE - 6, CELL_SIZE - 6);
        }

        const barWidth = CELL_SIZE - 6;
        const hpY = baseY + CELL_SIZE - 8;
        const armorY = hpY - 5;

        ctx.fillStyle = "#141414";
        ctx.fillRect(baseX + 3, armorY, barWidth, 4);
        ctx.fillRect(baseX + 3, hpY, barWidth, 4);

        const hpRatio = unit.maxHp > 0 ? Math.max(0, unit.hp) / unit.maxHp : 0;
        const armorRatio = unit.maxArmor > 0 ? Math.max(0, unit.armor) / unit.maxArmor : 0;

        ctx.fillStyle = "#2ed14e";
        ctx.fillRect(baseX + 3, hpY, barWidth * hpRatio, 4);
        
        ctx.fillStyle = "#4f91ff";
        ctx.fillRect(baseX + 3, armorY, barWidth * armorRatio, 4);

        if (unit.done && unit.player === this.currentPlayer) {
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(baseX, baseY, CELL_SIZE, CELL_SIZE);
        }

        if (this.selectedUnit && this.selectedUnit.id === unit.id) {
          ctx.strokeStyle = COLORS.selected;
          ctx.lineWidth = 3;
          ctx.strokeRect(baseX + 1, baseY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      }
    }
    
    drawSkull(ctx, x, y, w, h) {
      // Draw white skull icon with shadow
      ctx.save();
      
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      const shadowOffset = w * 0.05;
      const headWidth = w * 0.7;
      const headHeight = h * 0.6;
      const headX = x + (w - headWidth) / 2;
      const headY = y + h * 0.1;
      ctx.ellipse(headX + headWidth / 2 + shadowOffset, headY + headHeight / 2 + shadowOffset, headWidth / 2, headHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Skull head (rounded rectangle)
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.ellipse(headX + headWidth / 2, headY + headHeight / 2, headWidth / 2, headHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Eye sockets (black with gradient)
      const eyeSize = w * 0.15;
      const eyeY = headY + headHeight * 0.35;
      
      // Left eye socket
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(headX + headWidth * 0.3, eyeY, eyeSize * 0.8, eyeSize, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(headX + headWidth * 0.28, eyeY - eyeSize * 0.2, eyeSize * 0.3, eyeSize * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Right eye socket
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(headX + headWidth * 0.7, eyeY, eyeSize * 0.8, eyeSize, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(headX + headWidth * 0.68, eyeY - eyeSize * 0.2, eyeSize * 0.3, eyeSize * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Nose (triangle)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(headX + headWidth / 2, headY + headHeight * 0.55);
      ctx.lineTo(headX + headWidth / 2 - eyeSize * 0.4, headY + headHeight * 0.75);
      ctx.lineTo(headX + headWidth / 2 + eyeSize * 0.4, headY + headHeight * 0.75);
      ctx.closePath();
      ctx.fill();
      
      // Teeth (detailed lines)
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      const teethY = headY + headHeight * 0.85;
      const teethWidth = headWidth * 0.5;
      const teethX = headX + (headWidth - teethWidth) / 2;
      
      // Upper teeth
      for (let i = 0; i < 5; i++) {
        const tx = teethX + (teethWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(tx, teethY);
        ctx.lineTo(tx, teethY + h * 0.06);
        ctx.stroke();
      }
      
      // Jaw
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      const jawWidth = headWidth * 0.6;
      const jawHeight = h * 0.2;
      const jawX = headX + (headWidth - jawWidth) / 2;
      const jawY = y + h * 0.7;
      
      ctx.beginPath();
      ctx.arc(jawX + jawWidth / 2, jawY, jawWidth / 2, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Lower teeth
      const lowerTeethY = jawY;
      const lowerTeethWidth = jawWidth * 0.7;
      const lowerTeethX = jawX + (jawWidth - lowerTeethWidth) / 2;
      
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const tx = lowerTeethX + (lowerTeethWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(tx, lowerTeethY);
        ctx.lineTo(tx, lowerTeethY + h * 0.06);
        ctx.stroke();
      }
      
      // Cracks on skull for detail
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(headX + headWidth * 0.2, headY + headHeight * 0.15);
      ctx.lineTo(headX + headWidth * 0.3, headY + headHeight * 0.05);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(headX + headWidth * 0.8, headY + headHeight * 0.2);
      ctx.lineTo(headX + headWidth * 0.75, headY + headHeight * 0.08);
      ctx.stroke();
      
      ctx.restore();
    }

    drawLoadingCanvas() {
      const ctx = this.ctx;
      ctx.fillStyle = "#0e0e0e";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#f0d28d";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Загрузка...", WIDTH / 2, HEIGHT / 2 - 20);

      const st = this.assets.stats();
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#c9b48a";
      ctx.fillText(st.resolved + " / " + st.pending, WIDTH / 2, HEIGHT / 2 + 16);

      ctx.strokeStyle = COLORS.grid;
      ctx.strokeRect(0.5, 0.5, WIDTH - 1, HEIGHT - 1);
    }

    // ANIMATION METHODS
    
    createParticle(x, y, color, vx = 0, vy = -2, life = 30) {
      this.particles.push({
        x, y, color, vx, vy, life, maxLife: life, size: 3
      });
    }
    
    createExplosion(x, y, color, count = 8) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 1.5 + Math.random() * 1.5; // Slower particles
        this.createParticle(
          x, y, color,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          15 + Math.random() * 15 // Shorter life
        );
      }
    }
    
    createFloatingText(text, x, y, color = "#fff", size = 16) {
      this.floatingTexts.push({
        text, x, y, color, size,
        vy: -1, // Slower rise
        life: 50, // Shorter duration
        maxLife: 50
      });
    }
    
    updateAnimations() {
      this.frameCount++;
      this.highlightPulse = Math.sin(this.frameCount * 0.05) * 0.3 + 0.7; // Slower pulse
      
      // Update camera shake
      if (this.cameraShake > 0) {
        this.cameraShakeX = (Math.random() - 0.5) * this.cameraShake;
        this.cameraShakeY = (Math.random() - 0.5) * this.cameraShake;
        this.cameraShake *= 0.8; // Decay
        if (this.cameraShake < 0.5) {
          this.cameraShake = 0;
          this.cameraShakeX = 0;
          this.cameraShakeY = 0;
        }
      }
      
      // Update unit movements and deaths
      this.board.units.forEach(u => u.updateMovement());
      
      // Update particles
      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Slower gravity
        p.life--;
        return p.life > 0;
      });
      
      // Update floating texts
      this.floatingTexts = this.floatingTexts.filter(t => {
        t.y += t.vy;
        t.life--;
        return t.life > 0;
      });
    }
    
    drawParticles() {
      const ctx = this.ctx;
      this.particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    
    drawFloatingTexts() {
      const ctx = this.ctx;
      this.floatingTexts.forEach(t => {
        const alpha = t.life / t.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = t.color;
        ctx.font = `bold ${t.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
      });
      ctx.globalAlpha = 1;
    }

    draw() {
      if (this.screen === "loading") {
        this.drawLoadingCanvas();
        return;
      }
      if (this.screen === "menu") {
        this.drawMenuCanvas();
        return;
      }
      this.drawGameCanvas();
    }

    loop() {
      this.updateAnimations();
      this.draw();
      this.ai.update();
      requestAnimationFrame(() => this.loop());
    }
  }

  const assets = new AssetStore();
  const root = "Tiny Swords/Tiny Swords (Free Pack)/";

  assets.add("cover", "Knights_and_Castles_1920x1080.png");

  assets.add("u_blue_knight", root + "Units/Blue Units/Warrior/Warrior_Idle.png");
  assets.add("u_blue_cavalry", root + "Units/Blue Units/Lancer/Lancer_Idle.png");
  assets.add("u_blue_archer", root + "Units/Blue Units/Archer/Archer_Idle.png");

  assets.add("u_red_knight", root + "Units/Red Units/Warrior/Warrior_Idle.png");
  assets.add("u_red_cavalry", root + "Units/Red Units/Lancer/Lancer_Idle.png");
  assets.add("u_red_archer", root + "Units/Red Units/Archer/Archer_Idle.png");

  assets.add("castle_blue", root + "Buildings/Blue Buildings/Castle.png");
  assets.add("castle_red", root + "Buildings/Red Buildings/Castle.png");
  assets.add("tower_blue", root + "Buildings/Blue Buildings/Tower.png");
  assets.add("monastery_ruins", root + "Buildings/Blue Buildings/Monastery.png");
  assets.add("ruins_custom", "assets/custom/ruins_custom.png");
  assets.add("horse_knight_base", "assets/external/horse_sheet.png");

  const canvas = document.getElementById("gameCanvas");
  const sidebar = document.getElementById("sidebar");
  const platform = new YandexBridge();
  platform.init();
  
  const game = new KnightsAndCastlesGame(canvas, sidebar, assets, platform);

  assets.loadAll();

  let launched = false;
  const boot = () => {
    if (launched) {
      return;
    }
    launched = true;
    game.onAssetsReady();
    platform.loadingReady();
  };

  assets.whenFinished(boot);
  setTimeout(boot, 3000);
  
  // Показываем баннер после инициализации
  setTimeout(() => {
    platform.showStickyBanner();
  }, 1500);
})();
