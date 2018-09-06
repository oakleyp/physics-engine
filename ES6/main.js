'use strict';

(function() {
  const canvas = document.getElementById('main');
  const context = canvas.getContext('2d');
  onkeydown = keyEvent;
  document.getElementById('main').onclick = clickEvent;

  const entityTypeDropdown = document.getElementById('entity_type');
  const bouncinessInput = document.getElementById('bounciness');
  const dropButton = document.getElementById('drop');

  dropButton.addEventListener('click', function() {
    switch(entityTypeDropdown.value.toLowerCase()) {
      case 'square':
        let sqEnt = new SquareEntity ({
            x: Math.floor(Math.random()*canvas.width), 
            y: Math.floor(Math.random()*canvas.height), 
            xvector: Math.floor(Math.random()*8) - Math.floor(Math.random()*32),
            yvector: Math.floor(Math.random()*8),
            bounciness: parseFloat(bouncinessInput.value || 0.2),
            fillStyle: randomHexColor()
        });
        worldEntities.push(sqEnt);
        defaultTarget = sqEnt;
      }
  });

  function clickEvent(e) {
    e = e || window.event;
    worldEntities.push(new SquareEntity({
      name: Math.random()*9123482,
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

  function selectEntity(selected) {

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
      xvector = 0, yvector = 0, friction = 0.8, gravity = 98, bounciness = 0.2, name = 'entity'}) {

      // yes there should be accessors, but this is javascript, and neither me nor the browser cares
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
      this.name = name;
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

    doesIntersect(entity) {
      if(entity instanceof SquareEntity) {
        const sides = {
          top: (x, y, w, h) => [[x, y], [x+w, y]],
          left: (x, y, w, h) => [[x, y], [x, y+h]],
          right: (x, y, w, h) => [[x+w, y], [x+w, y+h]],
          bottom: (x, y, w, h) => [[x, y+h], [x+w, y+h]]
        }

        // (a, b) -> (c, d) intersection with line (p, q) -> (r, s)
        for (const [side, [ [[a, b], [c, d]], [[p, q], [r, s]] ] ] of 
          Object.keys(sides).map(key => 
            [ key, 
              [ sides[key](entity.x, entity.y, entity.width, entity.height), 
                sides[key](this.x, this.y, this.width, this.height) ] ]
          )) {

          // console.log(`checking ${entity.name} against ${this.name}`);

          // console.log({
          //   side, a, b, c, d, p, q, r, s
          // });

          const det = (c-a) * (s-q) - (r-p) * (d-b);

          if(det === 0) { // parallel
            // console.log({s, d, r, c})
            // if (Math.abs(s - d) < 0.9 && (Math.abs(r-c) <= this.width || Math.abs(p-a) <= this.width)) {
            //   return side;
            // } else if (Math.abs(r - c) < 0.01 && (Math.abs(s-d) <= this.height || Math.abs(q-b) <= this.height)) {
            //   return side;
            // }
            if (c >= p && c <= r && b >= q) { // right side touches left
              return 'right';
            } 
            else if (a <= r && p <= c && b >= q) {
              return 'left';
            }
            else if (d + entity.height >= q + 5 && ((c >= p && c <= r) || (a <= r && p <= c))) {
              return 'bottom';
            }
            else if (b + this.height >= q + 5 && ((c >= p && c <= r) || (a <= r && p <= c))) {
              return 'top';
            }

          }

          const lambda = ((s-q) * (r-a) + (p - r) * (s-b)) / det;
          const gamma = ((b-d) * (r-a) + (c-a) * (s-b)) / det;

          if ((-0.01 < lambda && lambda < 1.01) && (-0.01 < gamma && gamma < 1.01)) {
            return side;
          }
        }
      }
    }

  }

  let worldEntities = [ ];
  let defaultTarget = { };

  function initWorld() {
    worldEntities.push(new SquareEntity({fillStyle: '#FF0000', name: 'ent1', width: 30, height: 30}));
    worldEntities.push(new SquareEntity({fillStyle: '#777', name: 'ent2', width: 50, height: 50, x: 500, y: 300}));
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
      const collidingEntities = entities.filter(t => entity.name !== t.name)
        .map(target => [entity.doesIntersect(target), target]).filter(e => !!e[0]);

        if (collidingEntities.length) console.log(collidingEntities);
      // console.log({collidingEntities});

      // let a = collidingEntities.find(e => !!e);
      collidingEntities.forEach(([side, target]) => {
        const side_axis_dir = {
          top: ['y', -1],
          bottom: ['y', +1],
          left: ['x', -1],
          right: ['x', +1]
        }

        if(side === 'right' || side === 'left') {
          // entity.x = 'right' ? entity.x-target.width + 0.01 : target.x - 0.01;
          entity[`${side_axis_dir[side][0]}vector`] += 
            (side_axis_dir[side][1])*(target[`${side_axis_dir[side][0]}vector`]);
        }
      
        if(side === 'top') {
          // target[`${side_axis_dir[side][0]}vector`] += 
          // (side_axis_dir[side][1])*(entity[`${side_axis_dir[side][0]}vector`]);
          
          target[`${side_axis_dir[side][0]}vector`] = -(target.yvector*target.bounciness);
          target[side_axis_dir[side][0]] = entity.y-target.height-0.2; //put the entity right next to 0, otherwise it's colliding
        } 
        // entity.xvector -= (target.xvector*target.bounciness*entity.bounciness);
        // entity.yvector -= (target.yvector*target.bounciness*entity.bounciness);
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

