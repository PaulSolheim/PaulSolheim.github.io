
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    
    this.ball;
    this.paddle;
    this.bricks;
    this.ballOnPaddle = true;
    this.lives = 3;
    this.score = 0;
    this.scoreText;
    this.livesText;
    this.introText;
    this.s;
    
};

BasicGame.Game.prototype = {

    releaseBall: function () {

        if (this.ballOnPaddle)
        {
            this.ballOnPaddle = false;
            ball.body.velocity.y = -300;
            ball.body.velocity.x = -75;
            ball.animations.play('spin');
            this.introText.visible = false;
        } else {
            console.log("ballOnPaddle is false");
        }

    },

    ballLost: function () {

        this.lives--;
        this.livesText.text = 'lives: ' + this.lives;

        if (this.lives === 0)
        {
            this.gameOver();
        }
        else
        {
            this.ballOnPaddle = true;

            ball.reset(paddle.body.x + 16, paddle.y - 16);

            ball.animations.stop();
        }

    },

    gameOver: function () {

        ball.body.velocity.setTo(0, 0);

        this.introText.text = 'Game Over!';
        this.introText.visible = true;
        
        this.quitGame(this);

    },

    ballHitBrick: function (_ball, _brick) {

        _brick.kill();
        
        this.music.play();

        this.score += 10;

        this.scoreText.text = 'score: ' + this.score;

        //  Are they any bricks left?
        if (bricks.countLiving() == 0)
        {
            //  New level starts
            this.score += 1000;
            this.scoreText.text = 'score: ' + this.score;
            this.introText.text = '- Next Level -';

            //  Let's move the ball back to the paddle
            this.ballOnPaddle = true;
            ball.body.velocity.set(0);
            ball.x = paddle.x + 16;
            ball.y = paddle.y - 16;
            ball.animations.stop();

            //  And bring the bricks back from the dead :)
            bricks.callAll('revive');
        }

    },

    ballHitPaddle: function (_ball, _paddle) {

        var diff = 0;

        if (_ball.x < _paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = _paddle.x - _ball.x;
            _ball.body.velocity.x = (-10 * diff);
        }
        else if (_ball.x > _paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = _ball.x -_paddle.x;
            _ball.body.velocity.x = (10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            _ball.body.velocity.x = 2 + Math.random() * 8;
        }

    },

    create: function () {

        this.music = this.add.audio('boing');
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //  We check bounds collisions against all walls other than the bottom one
        this.game.physics.arcade.checkCollision.down = false;

        this.s = this.game.add.tileSprite(0, 0, 1024, 768, 'starfield');

        bricks = this.game.add.group();
        bricks.enableBody = true;
        bricks.physicsBodyType = Phaser.Physics.ARCADE;

        var brick;

        for (var y = 0; y < 4; y++)
        {
            for (var x = 0; x < 15; x++)
            {
                brick = bricks.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_' + (y+1) + '_1.png');
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        }

        paddle = this.game.add.sprite(this.game.world.centerX, 500, 'breakout', 'paddle_big.png');
        paddle.anchor.setTo(0.5, 0.5);

        this.game.physics.enable(paddle, Phaser.Physics.ARCADE);

        paddle.body.collideWorldBounds = true;
        paddle.body.bounce.set(1);
        paddle.body.immovable = true;

        ball = this.game.add.sprite(this.game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
        ball.anchor.set(0.5);
        ball.checkWorldBounds = true;

        this.game.physics.enable(ball, Phaser.Physics.ARCADE);

        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);

        ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

        ball.events.onOutOfBounds.add(this.ballLost, this);

        this.scoreText = this.game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
        this.livesText = this.game.add.text(680, 550, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
        this.introText = this.game.add.text(this.game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
        this.introText.anchor.setTo(0.5, 0.5);

        this.game.input.onDown.add(this.releaseBall, this);
    },

    update: function () {

        paddle.x = this.game.input.x;

        if (paddle.x < 24)
        {
            paddle.x = 24;
        }
        else if (paddle.x > this.game.width - 24)
        {
            paddle.x = this.game.width - 24;
        }

        if (this.ballOnPaddle)
        {
            ball.body.x = paddle.x;
        }
        else
        {
            this.game.physics.arcade.collide(ball, paddle, this.ballHitPaddle, null, this);
            this.game.physics.arcade.collide(ball, bricks, this.ballHitBrick, null, this);
        }
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
        
        // destroy(this.music);
        this.ballOnPaddle = true;
        this.lives = 3;
        this.score = 0;        

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
