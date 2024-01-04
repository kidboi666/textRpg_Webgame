const $wrap = document.querySelector('#wrap');
const $startButton = document.querySelector('#start_button');
const $gameMenuButton = document.querySelector('#game_menu_button');
const $battleMenuButton = document.querySelector('#battle_menu_button');
const $startScreen = document.querySelector('#start_screen');
const $gameMenu = document.querySelector('#game_menu');
const $battleMenu = document.querySelector('#battle_menu');
const $heroStat = document.querySelector('#hero_stat')
const $heroName = document.querySelector('#hero_name');
const $heroLevel = document.querySelector('#hero_level');
const $heroHp = document.querySelector('#hero_hp');
const $heroXp = document.querySelector('#hero_xp');
const $heroAtt = document.querySelector('#hero_att');
const $monsterStat = document.querySelector('#monster_stat');
const $monsterName = document.querySelector('#monster_name');
const $monsterLevel = document.querySelector('#monster_level');
const $monsterHp = document.querySelector('#monster_hp');
const $monsterAtt = document.querySelector('#monster_att');
const $message = document.querySelector('#message');
const $footerWrap = document.querySelector('#footer_wrap');
const $inventory = document.querySelector('#inventory');
const $condition = document.querySelector('#current_condition');
let EffectIntervalId;

class Game {
  constructor(name) {
    this.monster = null;
    this.hero = null;
    this.monsterList = [
      { name: '슬라임', hp: 25, maxHp: 25, att: 10, xp: 10 },
      { name: '슬라임', hp: 25, maxHp: 25, att: 10, xp: 10 },
      { name: '슬라임', hp: 25, maxHp: 25, att: 10, xp: 10 },
      { name: '스켈레톤', hp: 50, maxHp: 50, att: 15, xp: 20 },
      { name: '스켈레톤', hp: 50, maxHp: 50, att: 15, xp: 20 },
      { name: '스켈레톤', hp: 50, maxHp: 50, att: 15, xp: 20 },
      { name: '마왕', hp: 150, maxHp: 150, att: 35, xp: 50 },
    ];
    this.conditionEffect = new ConditionEffect();
    this.effect = new Effect();
    this.start(name);
  }
  start(name) {
    $gameMenu.addEventListener('submit', this.onGameMenuInput);
    $battleMenu.addEventListener('submit', this.onBattleMenuInput);
    this.changeScreen('game');
    this.hero = new Hero(this, name);
    this.updateHeroStat();
  }
  changeScreen(screen) {
    if (screen === 'start') {
      $startScreen.style.display = 'block';
      $gameMenu.style.display = 'none';
      $battleMenu.style.display = 'none';
      this.conditionEffect.normalCondition();
    } else if (screen === 'game') {
      $startScreen.style.display = 'none';
      $gameMenu.style.display = 'block';
      $battleMenu.style.display = 'none';
      $footerWrap.style.display ='flex';
      this.showCondition(`자, 뭐 부터 할까`);
      this.conditionEffect.normalCondition();
    } else if (screen === 'battle') {
      $startScreen.style.display = 'none';
      $gameMenu.style.display = 'none';
      $battleMenu.style.display = 'block';
    }
  }
  onGameMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['menu_input'].value;
    this.updateHeroStat();
    if (input === '1') { // 1.모험
      this.updateMonsterStat();
      this.showCondition(`전투상태`);
      this.effect.eventEffect();
      this.conditionEffect.battleCondition();
      this.generatorMonster();
      this.updateMonsterStat();
      this.showMessage(`${this.monster.name} 을(를) 발견했다! 어쩌지?`);
      this.changeScreen('battle');
      EffectIntervalId = setInterval(this.effect.eventEffect, 120);
      setTimeout(() => {
        clearInterval(EffectIntervalId);
      }, 400)
    } else if (input === '2') { // 2.휴식
      this.hero.hp = this.hero.maxHp;
      this.effect.healingSelfEffect();
      this.showMessage(`휴식으로 체력이 모두 회복되었다!`)
      this.updateHeroStat();
      this.hpCondition();
      setTimeout(() => {
        this.changeScreen('game');
      }, 1000)
    } else if (input === '3') { // 3.종료
      this.quit();
      this.showMessage();
    }
  }
  onBattleMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['battle_input'].value;
    if (input === '1') { // 1.공격
      const { hero, monster } = this;
      hero.attack(monster);
      monster.attack(hero);
      if (hero.hp <= 0) {
        this.effect.dyingEffect();
        $battleMenu.style.display = 'none';
        $monsterStat.style.display = 'none';
        $heroStat.style.display = 'none';
        $condition.style.display = 'none';
        this.showMessage(`당신은 ${monster.name} 에게 사망하였습니다. 잠시 뒤 메인화면으로 나갑니다`)
        $gameMenu.removeEventListener('submit', this.onGameMenuInput);
        $battleMenu.removeEventListener('submit', this.onBattleMenuInput);
        setTimeout(() => {
          this.showMessage(`${hero.lev} 레벨에서 전사. 새 주인공을 생성하세요.`)
          this.changeScreen('start');
          this.quit();
        },5000);
      } else if (monster.hp <= 0) {
        this.showMessage(`몬스터를 잡아 ${monster.xp} 경험치를 얻었다`)
        hero.getXp(monster.xp);
        this.monster = null;
        this.changeScreen('game');
      } else {
        this.effect.battleEffect();
        this.showMessage(`나의 공격으로 ${this.hero.att}의 데미지를 주고 ${this.monster.att}의 데미지를 받았다!`);   
      }
      this.updateHeroStat();
      this.updateMonsterStat();
      console.log(this.hero.hp <= (this.hero.maxHp / 2))
    } else if (input === '2') { // 2.회복
      const { hero, monster } = this;
      hero.heal(monster);
      this.effect.healingSelfEffect();
      this.showMessage(`체력을 소량 회복했지만 적의 기습에 당했다!`);
      this.updateHeroStat();
    } else if (input === '3') { // 3.도망
      this.showMessage(`${this.monster.name}으로 부터 가까스러 도망쳤다!`);
      this.monster = null;
      this.updateMonsterStat();
      this.changeScreen('game');
    }
  }
  quit() {
    this.hero = null;
    this.monster = null;
    this.updateHeroStat();
    this.updateMonsterStat();
    this.changeScreen('start');
    game = null;
  }
  generatorMonster = () => {
    const randomMonster = this.monsterList[
      Math.floor(Math.random() * this.monsterList.length)
    ]
    this.monster = new Monster(
      this,
      randomMonster.name,
      randomMonster.hp,
      randomMonster.att,
      randomMonster.xp,
    )
  }
  updateHeroStat() {
    const { hero } = this;
    if (hero === null) {
      $heroName.textContent = '';
      $heroLevel.textContent = '';
      $heroHp.textContent = '';
      $heroXp.textContent = '';
      $heroAtt.textContent = '';
      return;
    }
    $heroName.textContent = hero.name;
    $heroLevel.textContent = `${hero.lev}Level`;
    $heroHp.textContent = `HP:${hero.hp}/${hero.maxHp}`;
    $heroXp.textContent = `XP:${hero.xp}/${hero.lev * 15}`;
    $heroAtt.textContent = `ATT:${hero.att}`;
    if (this.hero.hp <= (this.hero.maxHp / 2)) {
      $heroHp.style.color = 'red';
    } else if (this.hero.hp <= ((this.hero.maxHp / 2) + (this.hero.maxHp / 4))) {
      $heroHp.style.color = 'yellow';
      console.log(this.hero.hp)
    } else if (this.hero.hp >= ((this.hero.maxHp / 2) + (this.hero.maxHp / 4))) {
      $heroHp.style.color = 'white';
      console.log('white')
    }
  }
  updateMonsterStat() {
    const { monster } = this;
    if (monster === null) {
      $monsterName.textContent = '';
      $monsterHp.textContent = '';
      $monsterAtt.textContent = '';
      return;
    }
    $monsterName.textContent = monster.name;
    $monsterHp.textContent = `HP : ${monster.hp}/${monster.maxHp}`;
    $monsterAtt.textContent = `ATT : ${monster.att}`;
    if (this.monster.hp <= (this.monster.maxHp / 2)) {
      $monsterHp.style.color = 'red';
    } else if (this.monster.hp <= ((this.monster.maxHp / 2) + (this.monster.maxHp / 4))) {
      $monsterHp.style.color = 'yellow';
      console.log(this.monster.hp)
    } else if (this.monster.hp >= ((this.monster.maxHp / 2) + (this.monster.maxHp / 4))) {
      $monsterHp.style.color = 'white';
      console.log('white')
    }
  }
  showMessage(text) {
    $message.textContent = text;
  }
  showCondition(text) {
    $condition.textContent = text;
  }
}
class Effect {
  eventEffect = () => {
    document.body.style.backgroundColor = 'white';
    $wrap.style.paddingLeft = '40px';
    this.returnScreen();
  }
  battleEffect = () => {
    document.body.style.backgroundColor = 'red';
    $wrap.style.paddingLeft = '40px';
    $heroHp.style.backgroundColor = 'red';
    $monsterHp.style.backgroundColor = 'red';
    setTimeout(() => {
      $heroHp.style.backgroundColor = 'black';
      $monsterHp.style.backgroundColor = 'black';
    }, 1000)
    this.returnScreen();
  }
  healingSelfEffect = () => {
    $heroHp.style.backgroundColor = 'rgb(12, 146, 0)';
    $heroHp.style.transition = '.5s';
    setTimeout(() => {
      $heroHp.style.backgroundColor = 'black';
    }, 500);
  }
  dyingEffect = () => {
    document.body.style.backgroundColor = 'red';
    document.body.style.transition = '3s'
    setTimeout(() => {
      document.body.style.backgroundColor = 'black';
    }, 3000);
    setTimeout(() => {
      document.body.style.transition = 'none';
    }, 6000);
  }
  levelUpEffect = () => {
    $heroLevel.style.backgroundColor = 'white'
    
    $heroLevel.style.transition = '.5s'
    setTimeout(() => {
      $heroLevel.style.backgroundColor = 'black';
    }, 500);
    setTimeout(() => {
      $heroLevel.style.transition = 'none';
    }, 1000)
  }
  getXpEffect = () => {
    $heroXp.style.backgroundColor = 'white'
    
    $heroXp.style.transition = '.5s'
    setTimeout(() => {
      $heroXp.style.backgroundColor = 'black';
    }, 500);
    setTimeout(() => {
      $heroXp.style.transition = 'none';
    }, 1000)
  }
  returnScreen = () => {
    setTimeout(() => {
      document.body.style.backgroundColor = 'black';
      $wrap.style.paddingLeft = '0';
    }, 60)
  }
}

class ConditionEffect {
  battleCondition = () => {
    setTimeout(() => {
      $condition.style.backgroundColor = 'red';
      $condition.style.transform = 'none'
    }, 500)
  }
  normalCondition = () => {
    $condition.style.backgroundColor = 'black';
    $condition.style.transform = 'translate3d(10px, 10px, -10px)';
  }
}
class Unit {
  constructor(game, name, hp, att, xp) {
    this.game = game;
    this.name = name;
    this.maxHp = hp;
    this.hp = hp;
    this.xp = xp;
    this.att = att;
  }
  attack(target) {
    target.hp -= this.att;
  }
}

class Hero extends Unit {
  constructor(game, name) {
    super(game, name, 100, 10, 0);
    this.lev = 1;
    this.effect = new Effect();
  }
  heal(monster) {
    this.hp = Math.min(this.maxHp, this.hp + 20);
    this.hp -= monster.att;
  }
  getXp(xp) {
    this.xp += xp;
    this.effect.getXpEffect();
    if (this.xp >= this.lev * 15) {// 경험치를 다 채우면
      this.effect.levelUpEffect();
      this.xp -= this.lev * 15;
      this.lev += 1;
      this.maxHp += 5;
      this.att += 5;
      this.hp = this.maxHp;
      this.game.showMessage(`레벨업! 레벨 ${this.lev}`)
    }
  }
}

class Monster extends Unit {
  constructor(game, name, hp, att, xp) {
    super(game, name, hp, att, xp);
  }
}



let game = null;
$startScreen.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = event.target['name_input'].value;
  game = new Game(name);
});
$startButton.addEventListener('mouseover', () => {
  $startButton.style.borderBottom = '4px solid white';
})
$startButton.addEventListener('mouseleave', () => {
  $startButton.style.borderBottom = 'none';
})
$gameMenuButton.addEventListener('mouseover', () => {
  $gameMenuButton.style.borderBottom = '4px solid white';
})
$gameMenuButton.addEventListener('mouseleave', () => {
  $gameMenuButton.style.borderBottom = 'none';
})
$battleMenuButton.addEventListener('mouseover', () => {
  $battleMenuButton.style.borderBottom = '4px solid white';
})
$battleMenuButton.addEventListener('mouseleave', () => {
  $battleMenuButton.style.borderBottom = 'none';
})