import { ratio } from "../scenes/Boot";

export class Debugger {

    constructor(
        private scene: Phaser.Scene
    ) {

    }

    container(
        container: Phaser.GameObjects.Container,
        parent?: Phaser.GameObjects.Container
    ) {

        let graphics = this.scene.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        graphics.lineStyle(5 * ratio, 0xff0000);
        graphics.fillStyle(0xff00ff);

        if (parent) {
            parent.add(graphics)
        } else {
            this.scene.add.existing(graphics);
        }

        graphics.fillCircle(container.x, container.y, 25 * ratio)
    }

    point(
        point: Phaser.Geom.Point | Phaser.Math.Vector2,
        parent?: Phaser.GameObjects.Container
    ) {

        let graphics = this.scene.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        graphics.lineStyle(5 * ratio, 0xff0000);
        graphics.fillStyle(0xffff00);

        if (parent) {
            parent.add(graphics)
        } else {
            this.scene.add.existing(graphics);
        }

        graphics.fillCircle(point.x, point.y, 25 * ratio)
    }

    rectangle(
        rectangle: Phaser.Geom.Rectangle,
        parent?: Phaser.GameObjects.Container
    ) {

        let graphics = this.scene.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        graphics.lineStyle(5 * ratio, 0xff0000);
        graphics.fillStyle(0xffff00, 0.5);

        if (parent) {
            parent.add(graphics)
        } else {
            this.scene.add.existing(graphics);
        }

        graphics.fillRectShape(rectangle);
    }
}