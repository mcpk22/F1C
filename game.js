class RacingGame extends Phaser.Scene {
    constructor() {
        super({ key: "RacingGame" });
    }

    preload() {
        this.load.image("car", "car.png"); // Player car
        this.load.image("aiCar", "ai-car.png"); // AI car
    }

    create() {
        this.createTrack();
        this.createWaypoints();

        // Player Car
        this.playerCar = this.physics.add.sprite(200, 550, "car").setScale(0.5);
        this.playerCar.setCollideWorldBounds(true);
        this.playerCar.speed = 0;
        this.playerCar.angle = 0;

        // AI Cars
        this.aiCars = [
            this.physics.add.sprite(250, 550, "aiCar").setScale(0.5),
            this.physics.add.sprite(300, 550, "aiCar").setScale(0.5)
        ];

        this.playerKeys = this.input.keyboard.createCursorKeys();
        this.lapTime = 0;
        this.startTime = this.time.now;
    }

    createTrack() {
        // Draw the circuit layout using Phaser graphics
        let graphics = this.add.graphics();
        graphics.lineStyle(5, 0xffffff, 1);

        // Track layout (Curved rectangle-like shape)
        graphics.strokeRect(50, 50, 700, 500); // Outer track boundary
        graphics.strokeRect(150, 150, 500, 300); // Inner boundary

        // Starting line
        graphics.lineStyle(5, 0xff0000, 1);
        graphics.strokeLineShape(new Phaser.Geom.Line(200, 500, 250, 500));
    }

    createWaypoints() {
        // Define waypoints for AI path navigation
        this.waypoints = [
            { x: 100, y: 500 }, { x: 700, y: 500 }, // Bottom straight
            { x: 700, y: 100 }, { x: 100, y: 100 }, // Top straight
            { x: 100, y: 500 } // Loop back
        ];

        let graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);

        // Draw waypoints as green dots for debugging
        this.waypoints.forEach(point => {
            graphics.fillCircle(point.x, point.y, 5);
        });
    }

    update() {
        this.handlePlayerInput();
        this.updateAI();
        this.updateLapTime();
    }

    handlePlayerInput() {
        if (this.playerKeys.up.isDown) {
            this.playerCar.speed = Math.min(this.playerCar.speed + 0.1, 5);
        } else {
            this.playerCar.speed *= 0.98;
        }

        if (this.playerKeys.down.isDown) {
            this.playerCar.speed = Math.max(this.playerCar.speed - 0.1, -2);
        }

        if (this.playerKeys.left.isDown) {
            this.playerCar.angle -= 2;
        }

        if (this.playerKeys.right.isDown) {
            this.playerCar.angle += 2;
        }

        this.physics.velocityFromRotation(
            Phaser.Math.DegToRad(this.playerCar.angle),
            this.playerCar.speed * 50,
            this.playerCar.body.velocity
        );
    }

    updateAI() {
        this.aiCars.forEach((aiCar, index) => {
            let wp = this.waypoints[index % this.waypoints.length];
            let dx = wp.x - aiCar.x;
            let dy = wp.y - aiCar.y;
            let targetAngle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));

            aiCar.angle = Phaser.Math.Angle.RotateTo(
                Phaser.Math.DegToRad(aiCar.angle),
                Phaser.Math.DegToRad(targetAngle),
                0.02
            );

            this.physics.velocityFromRotation(
                Phaser.Math.DegToRad(aiCar.angle),
                100,
                aiCar.body.velocity
            );

            if (Math.hypot(dx, dy) < 10) {
                index = (index + 1) % this.waypoints.length;
            }
        });
    }

    updateLapTime() {
        this.lapTime = ((this.time.now - this.startTime) / 1000).toFixed(2);
        document.getElementById("lap-time").innerText = `Lap Time: ${this.lapTime}s`;
    }
}

// Start the game
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: "arcade", arcade: { debug: false } },
    scene: RacingGame,
    parent: "game-container"
};

const game = new Phaser.Game(config);
    