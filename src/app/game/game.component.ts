import { Component, OnInit } from '@angular/core';
import * as Phaser from 'phaser';
import { Boot } from './shisensho/scenes/Boot';
import { End } from './shisensho/scenes/End';
import { Game } from './shisensho/scenes/Game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio);

    const config = {
      parent: 'game',
      type: Phaser.AUTO,
      backgroundColor: '#78D9B2',
      scale: {
        mode: Phaser.Scale.FIT,
        width: window.innerWidth * devicePixelRatio,
        height: window.innerHeight * devicePixelRatio,
      },
      scene: [
        Boot,
        // SSS.Home,
        Game,
        // SSS.Loading,
        End
      ]
    };

    const game = new Phaser.Game(config);
  }

}
