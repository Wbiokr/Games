let game = {
  stage: 'SetUp',

  turn: 'user',

  userIndex: '',

  num: {
    round: 0,
    inactiveMines: 0,
    asteroid: 0,
    // activeMines:0,
    roboticSpaceships: 0,
    userSpaceships: 0,
  },

  init() {
    this.render()

    this.dom('#content').addEventListener('click', this.setActor.bind(this))

    this.dom('#nextStage').addEventListener('click', this.nextStage.bind(this))

    this.dom('#overGame').addEventListener('click', this.overGame.bind(this))

    this.dom('#againGame').addEventListener('click', () => {
      location.reload()
    })

    document.addEventListener('keyup', this.move.bind(this))
  },

  overGame() {
    setTimeout(() => {
      this.stage = 'OverGame';

      this.renderHeader(3);

      let result = 'Draw'

      if (this.num.userSpaceships && this.num.roboticSpaceships) {
        result = 'Draw'
        this.toast('You ended the game by yourself !')
      } else if (this.num.userSpaceships && !this.num.roboticSpaceships) {
        result = 'User Win'
        this.toast('User won the game !')
      } else if (!this.num.userSpaceships && this.num.roboticSpaceships) {
        result = 'Computer Win'
        this.toast('Computer won the game !')
      } else {
        this.toast('The outcome is a draw !')
      }

      this.dom('#content').innerHTML = `<div class=result>${result}</div>`

      return false;
    }, 500)
  },

  nextStage() {
    if (!this.num.userSpaceships) {
      this.toast('You don not have your own spaceship !')
      return;
    }
    const wDom = document.createElement('div')
    wDom.innerText =
      this.dom('#content').style.opacity = '0.2';
    this.toast('You are going to the stage of paly-game !');
    let timer = setTimeout(() => {
      this.stage = 'PlayGame';
      this.renderHeader(2);
      // this.render()
      this.dom('#content').style.opacity = '1';

      clearTimeout(timer)
    }, 2400)
  },

  move(e) {

    if (this.stage !== 'PlayGame') { return; }

    if (this.turn !== 'user') { return; }

    switch (String(e.key).toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.goUp();
        break;
      case 's':
      case 'arrowdown':
        this.goDown();
        break;
      case 'a':
      case 'arrowleft':
        this.goLeft();
        break;
      case 'd':
      case 'arrowright':
        this.goRight();
        break;
      default:
        this.toast('sorry,it is invalid!')
        break;
    }
  },

  goUp() {
    const t = this.dom('.uSpaceship')
    const i = Number(t.getAttribute('data-index'));
    this.checkUserMove(i, i - 10)
  },

  goDown() {
    const t = this.dom('.uSpaceship')
    const i = Number(t.getAttribute('data-index'));
    this.checkUserMove(i, i + 10)
  },

  goLeft() {
    const t = this.dom('.uSpaceship')
    const i = Number(t.getAttribute('data-index'));
    this.checkUserMove(i, i - 1)
  },

  goRight() {
    const t = this.dom('.uSpaceship')
    const i = Number(t.getAttribute('data-index'));
    this.checkUserMove(i, i + 1)
  },

  checkUserMove(oI, nI) {

    this.num.round += 1;

    if (nI < 0 || nI > 99 || oI % 10 === 9 && nI === oI + 1 || oI % 10 === 0 && nI === oI - 1) {
      this.toast('Out of bounds, invalid movement !')
      nI = oI
    } else if (this.dom('li', this.dom('#content'), true)[nI].className.includes('asteroid')) {
      this.toast('Asteroid occupy position,invalid movement !');
    } else {

      this.dom('li', this.dom('#content'), true)[oI].className = this.dom('li', this.dom('#content'), true)[oI].className.replace(/uSpaceship/g, '');
      this.dom('li', this.dom('#content'), true)[nI].className += ' uSpaceship ';
      let newClsNm = this.dom('li', this.dom('#content'), true)[nI].className

      // 当碰到雷时候
      if (newClsNm.includes('mine')) {
        newClsNm = newClsNm.replace(/mine/g, '');
        newClsNm += ' mineActive '

        this.dom('li', this.dom('#content'), true)[nI].className = newClsNm;

        this.getIndexs(nI).forEach((item, i) => {
          let itemClsNm = this.dom('li', this.dom('#content'), true)[item].className;
          if (item > -1 && itemClsNm.includes('asteroid')) {
            this.dom('li', this.dom('#content'), true)[item].className = itemClsNm.replace(/asteroid/g, '')
            this.toast('Asteroid is destroyed!')
          }
          if (item > -1 && itemClsNm.includes('rSpaceship')) {
            this.dom('li', this.dom('#content'), true)[item].className = itemClsNm.replace(/rSpaceship/g, '')
            this.toast('Robotic spaceships is destroyed!')
          }
        })
      }

      // 当碰到敌机时候
      if (newClsNm.includes('rSpaceship')) {
        newClsNm = newClsNm.replace(/rSpaceship|uSpaceship/g, '')
        this.dom('li', this.dom('#content'), true)[nI].className = newClsNm;
        this.toast('Game Over !')
        this.overGame();
        return;
      }
    }

    this.userIndex = this.dom('li', this.dom('#content'), true)[nI].getAttribute('data-index')

    this.renderHeader()

    this.checkCollision()

    let timer = setTimeout(() => {
      this.checkComputerMove(nI)
      clearTimeout(timer)
    }, 500)
  },

  checkComputerMove(i) {

    this.turn = 'computer';

    const uCoor = this.getCoordinate(i);

    Array.from(this.dom('.rSpaceship', this.dom('#content'), true), (item) => {
      const rI = item.getAttribute('data-index');
      const rCoor = this.getCoordinate(rI);
      const disX = rCoor.x - uCoor.x;
      const disY = rCoor.y - uCoor.y;

      const rClsNm = this.dom('li', this.dom('#content'), true)[rI].className;

      this.sureComMove(disX, disY, Number(rI))

    })
    this.checkCollision()
  },

  sureComMove(disX, disY, i) {

    let result = '';
    if (disX < 0) { result += '-1' }
    if (disX == 0) { result += '0' }
    if (disX > 0) { result += '1' }
    result += ',';
    if (disY < 0) { result += '-1' }
    if (disY == 0) { result += '0' }
    if (disY > 0) { result += '1' }


    const isXLgY = Math.abs(disX) >= Math.abs(disY)
    const clsI = this.dom('li', this.dom('#content'), true)[i].className;
    const yClsB = i < 90 ? this.dom('li', this.dom('#content'), true)[i + 10].className : 'mineasteroidrSpaceship';
    const yClsT = i > 9 ? this.dom('li', this.dom('#content'), true)[i - 10].className : 'mineasteroidrSpaceship';
    const xClsR = i % 10 < 9 ? this.dom('li', this.dom('#content'), true)[i + 1].className : 'mineasteroidrSpaceship';
    const xClsL = i % 10 > 0 ? this.dom('li', this.dom('#content'), true)[i - 1].className : 'mineasteroidrSpaceship';

    switch (result) {
      // 自己右上角
      case '-1,-1':
        this.computerMoveTwoDir(isXLgY, result, yClsB, xClsR, i, clsI)
        break;
      // 自己在右边中心
      case '-1,0':
        this.computerMoveOneDir(xClsR, 1, Number(i), clsI)
        break;
      case '-1,1':
        this.computerMoveTwoDir(isXLgY, result, yClsT, xClsR, i, clsI)
        break;
      case '0,1':
        this.computerMoveOneDir(yClsT, -10, Number(i), clsI);
        break;
      case '1,1':
        this.computerMoveTwoDir(isXLgY, result, yClsT, xClsL, i, clsI)
        break;
      case '1,0':
        this.computerMoveOneDir(xClsL, -1, Number(i), clsI);
        break;
      case '1,-1':
        this.computerMoveTwoDir(isXLgY, result, yClsB, xClsL, i, clsI)
        break;
      case '0,-1':
        this.computerMoveOneDir(yClsB, 10, Number(i), clsI);
        break;
    }
  },

  computerMoveTwoDir(isXLgY, result, yCls, xCls, i, clsI) {

    const [x, y] = result.split(',');

    const [iX, iY] = [-1 * Number(x), -10 * Number(y)]

    if (isXLgY) {
      if (yCls.includes('asteroid') || yCls.includes('rSpaceship')) {
        if (xCls.includes('asteroid') || xCls.includes('rSpaceship')) {

        } else {

          this.dom('li', this.dom('#content'), true)[i].className = clsI.replace(/rSpaceship/g, '');

          this.dom('li', this.dom('#content'), true)[i + iX].className += ' rSpaceship ';

        }
      } else {

        this.dom('li', this.dom('#content'), true)[i].className = clsI.replace(/rSpaceship/g, '');

        this.dom('li', this.dom('#content'), true)[i + iY].className += ' rSpaceship '

      }
    } else {
      if (xCls.includes('asteroid') || xCls.includes('rSpaceship')) {
        if (yCls.includes('asteroid') || yCls.includes('rSpaceship')) {
        } else {

          this.dom('li', this.dom('#content'), true)[i].className = clsI.replace(/rSpaceship/g, '');

          this.dom('li', this.dom('#content'), true)[i + iY].className += ' rSpaceship ';

        }
      } else {

        this.dom('li', this.dom('#content'), true)[i].className = clsI.replace(/rSpaceship/g, '');

        this.dom('li', this.dom('#content'), true)[i + iX].className += ' rSpaceship '

      }
    }
  },

  computerMoveOneDir(cls, disIndex, i, clsI) {
    if (cls.includes('mine') || cls.includes('asteroid') || cls.includes('rSpaceship')) {
    } else {

      this.dom('li', this.dom('#content'), true)[i].className = clsI.replace(/rSpaceship/g, '');

      this.dom('li', this.dom('#content'), true)[i + disIndex].className += ' rSpaceship '

    }
  },

  checkCollision() {
    let stageIndex = 2

    Array.from(this.dom('.mineActive', '', true), (item) => {
      this.getIndexs(item.getAttribute('data-index')).forEach((i) => {
        if (i == -1) { return; }
        const itemCls = this.dom('li', this.dom('#content'), true)[i].className;
        this.dom('li', this.dom('#content'), true)[i].className = itemCls.replace(/asteroid|rSpaceship/g, '')
      })
    })

    if (this.dom('.uSpaceship', this.dom('#content'), true).length === 0) {
      stageIndex = 3
      this.renderHeader(stageIndex)

      this.overGame()
      return;
    } else if (this.dom('.uSpaceship').className.includes('rSpaceship')) {

      this.dom('.uSpaceship').className += ' over';
      this.renderHeader(stageIndex)

      this.overGame()
      return;
    }

    if (this.dom('.rSpaceship', this.dom('#content'), true).length === 0) {
      stageIndex = 3
      this.renderHeader(stageIndex)

      this.overGame()
      return;
    }

    this.renderHeader(stageIndex)

    this.turn = 'user'

  },

  getCoordinate(i) {
    return {
      x: i % 10,
      y: Math.ceil(i / 10)
    }
  },

  getIndexs(i) {
    i = Number(i);
    let index1 = i - 11,
      index2 = i - 10,
      index3 = i - 9,
      index4 = i - 1,
      index5 = i + 1,
      index6 = i + 9,
      index7 = i + 10,
      index8 = i + 11;

    if (i % 10 === 0) {
      index1 = index4 = index6 = -1
    }
    if (i % 10 === 9) {
      index3 = index5 = index8 = -1
    }
    if (i <= 9) {
      index1 = index2 = index3 = -1
    }
    if (i >= 90) {
      index6 = index7 = index8 = -1
    }

    return [index1, index2, index3, index4, index5, index6, index7, index8]
  },

  setActor(e) {
    if (this.stage !== 'SetUp') { return; }
    if (e.target.className.includes('place')) {
      this.toast('sorry,the actor cannot be changed!');
      return;
    }
    const actor = prompt('Please enter the actor ', '');
    switch (String(actor).trim()) {
      case 'a':
        e.target.className += ' asteroid place ';
        this.num.asteroid += 1;
        break;
      case 'm':
        e.target.className += ' mine place';
        this.num.inactiveMines += 1;
        break;
      case 'r':
        e.target.className += ' rSpaceship place';
        this.num.roboticSpaceships += 1;
        break;
      case 'u':
        if (this.num.userSpaceships) {
          this.toast('sorry,the actor of user-spaceship has existed! ');
          return;
        }
        e.target.className += ' uSpaceship place';
        this.num.userSpaceships = 1;
        break;
      default:
        this.toast('sorry,the word of actor is invalid! ');
        break;
    }
  },

  renderHeader(i) {
    this.num.inactiveMines = this.dom('.mine', this.dom('#content'), true).length;
    this.num.roboticSpaceships = this.dom('.rSpaceship', this.dom('#content'), true).length;
    this.num.userSpaceships = this.dom('.uSpaceship', this.dom('#content'), true).length;

    this.dom('#stageTitle').innerHTML = `${i}. ${this.stage}`;
    this.dom('span', this.dom('#roundNum')).innerHTML = `${this.num.round}`;
    this.dom('span', this.dom('#inactiveMinesNum')).innerHTML = `${this.num.inactiveMines}`;
    this.dom('span', this.dom('#roboticSpaceshipsNum')).innerHTML = `${this.num.roboticSpaceships}`;
    if (i == 3) {
      this.dom('#information').style.display = 'none'
      this.dom('#overGame').style.display = 'none'
      this.dom('#nextStage').style.display = 'none'
      this.dom('#againGame').style.display = 'block'
      // this.dom('#information').
    } else if (i == 2) {
      this.dom('#information').style.display = 'block'
      this.dom('#overGame').style.display = 'block'
      this.dom('#nextStage').style.display = 'none'
      this.dom('#againGame').style.display = 'none'

    } else if (i == 1) {
      this.dom('#information').style.display = 'none'
      this.dom('#overGame').style.display = 'none'
      this.dom('#nextStage').style.display = 'block'
      this.dom('#againGame').style.display = 'none'

    }
  },

  render() {
    let H = '';
    for (let i = 0; i < 100; i++) {
      H += `<li data-index=${i} class='iconfont '></li>`
    }
    this.dom('#content').innerHTML = H;
    this.renderHeader(1)
  },

  dom(s, f, n) {
    const fatherDom = f || document;
    return n ? fatherDom.querySelectorAll(s) : fatherDom.querySelector(s)
  },

  toast(msg) {
    if (this.dom('.msg')) { return; }
    const tDom = document.createElement('div');
    tDom.className = 'toast msg';
    tDom.innerText = msg;
    document.body.appendChild(tDom);
    let timerW = setTimeout(() => {
      this.dom('.toast').className = 'msg';
      clearTimeout(timerW)
    }, 2000)
    let timerC = setTimeout(() => {
      document.body.removeChild(this.dom('.msg'));
      clearTimeout(timerC)
    }, 2500)
  },

  prompt(actor) {

  },
}

game.init()