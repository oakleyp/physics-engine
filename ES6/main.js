'use strict';

(function() {
  const canvas = document.getElementById('main');
  const context = canvas.getContext('2d');
  document.onkeydown = keyEvent;
  document.onclick = clickEvent;

  function clickEvent(e) {
    e = e || window.event;
    worldEntities.push(new SquareEntity({
      x: Math.floor(Math.random()*canvas.width), 
      y: Math.floor(Math.random()*canvas.height), 
      xvector: Math.floor(Math.random()*8) - Math.floor(Math.random()*32),
      yvector: Math.floor(Math.random()*8),
      bounciness: Math.floor(Math.random()*100)/100,
      fillStyle: randomHexColor()
    }))
  }

  function keyEvent(e) {
    e = e || window.event;
    defaultTarget.receiveKey(e.keyCode);

    switch(e.keyCode) {
      case 32: togglePause(); //space
    };
  }

  function togglePause() {
    gameState.running = !gameState.running;
  }

  function randomHexColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
  }

  const gameState = {
    running: true,
    fps: 60,
  };
  
  class SquareEntity {
    constructor({x = 10, y = 10, width = 30, height = 30, fillStyle = '#000000', speedx = 80, speedy = 90, 
      xvector = 0, yvector = 0, friction = 0.8, gravity = 98, bounciness = 0.9}) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speedx = speedx;
      this.speedy = speedy;
      this.fillStyle = fillStyle;
      this.xvector = xvector;
      this.yvector = yvector;
      this.gravity = gravity;
      this.friction = friction;
      this.bounciness = bounciness;
    }
  
    draw(ctx) {
      // console.log('drawing as', this.x, this.y, this.xvector, this.yvector);
      ctx.fillStyle = this.fillStyle;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    receiveKey(keyCode) {
      const keyDirection = {
        38: 'up',     //up 
        40: 'down',   //down 
        37: 'left',   //left
        39: 'right',  //right
        87: 'up',     //w
        83: 'down',   //a
        65: 'left',   //s
        68: 'right'   //d
      };

      if(keyDirection[`${keyCode}`]) {
        this.move(keyDirection[`${keyCode}`]);
      }
    }

    doesIntersect(entity) {

    }

    move(direction) {
      console.log('move dir', direction);
      switch(direction) {
        case 'up':
          this.yvector -= this.speedy;
          break;
        case 'down':
          this.yvector += this.speedy;
          break;
        case 'left':
          this.xvector -= this.speedx;
          break;
        case 'right':
          this.xvector += this.speedx;
      }

    }
  }

  let worldEntities = [ ];
  let defaultTarget = { };

  function initWorld() {
    worldEntities.push(new SquareEntity({fillStyle: '#FF0000', width: 30, height: 30}));
    defaultTarget = worldEntities[0];
  }

  async function tick() {
    setInterval(() => {
      if (gameState.running) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawScreen();
      }
    }, gameState.fps / 1000);
  }

  function drawScreen() {
    worldEntities.forEach(entity => {
      entity.draw(context);
    });

    applyFramePhysics(worldEntities);
  }

  function applyFramePhysics(entities) {
    applyBorderCollions(entities);
    applyEntityCollisions(entities);
  }
  
  function applyEntityCollisions(entities) {
    entities.forEach(entity => {
      const collidingEntities = entities.filter(target => entity.doesIntersect(target));

      collidingEntities.forEach(target => {
        entity.xvector -= (target.xvector*target.bounciness*entity.bounciness);
        entity.yvector -= (target.yvector*target.bounciness*entity.bounciness);
      });
    });
  }

  function applyBorderCollions(entities) {
    entities.forEach(entity => {
      if (entity.y <= canvas.height-entity.height || entity.yvector >= 0) { // If entity is in the air, apply gravity
        entity.yvector += entity.gravity/gameState.fps;
        entity.y += entity.yvector/gameState.fps;
      } 
      
      if (entity.y >= canvas.height-entity.height) { // if entity touches the ground and has momentum, deflect it based on bounciness
        entity.yvector = -(entity.yvector*entity.bounciness);
        entity.xvector -= (entity.xvector * entity.friction)/gameState.fps; // apply friction if entity is on the ground
        entity.y = canvas.height-entity.height;
      }

      entity.x += entity.xvector/gameState.fps;
      
      if (entity.x >= canvas.width - entity.width) { // entity touches right boundary
        entity.x = canvas.width - entity.width;
        entity.xvector = -(entity.xvector*entity.bounciness);
      } else if (entity.x <= 0) { // entity touches left boundary
        entity.x = 0;
        entity.xvector = -(entity.xvector*entity.bounciness);
      }
    });
  }

  initWorld();
  tick();
})();

