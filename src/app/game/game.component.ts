import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as Phaser from 'phaser';
import { BehaviorSubject } from 'rxjs';
import { OptionsPopupComponent } from './gui/popup/options-popup/options-popup.component';
import { ReplayPopupComponent } from './gui/popup/replay-popup/replay-popup.component';
import { ShufflePopupComponent } from './gui/popup/shuffle-popup/shuffle-popup.component';
import { Constants } from './shisensho/model/Constants';
import { Boot } from './shisensho/scenes/Boot';
import { End } from './shisensho/scenes/End';
import { Game } from './shisensho/scenes/Game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  /** The popup to display when the game is finished */
  @ViewChild(ReplayPopupComponent)
  replaypopup: ReplayPopupComponent;

  /** The popup to display when the game is shuffling */
  @ViewChild(ShufflePopupComponent)
  shufflepopup: ShufflePopupComponent;

  /** The popup to display when options are displayed */
  @ViewChild(OptionsPopupComponent)
  optionspopup: OptionsPopupComponent;

  /** Instance of the Phaser game */
  phaserGame: Phaser.Game;

  totalMoves = 0;
  totalCorrectMoves = 0;
  score = 0;

  ngAfterViewInit() {
    this.initGame();
  }


  private initGame() {

    const config = {
      parent: 'game',
      type: Phaser.AUTO,
      backgroundColor: '#78D9B2',
      scale: {
        mode: Phaser.Scale.FIT,
        width: window.innerWidth + 15,
        height: window.innerHeight + 15,
      },
      scene: [
        Boot,
        Game,
        End
      ]
    };
    this.phaserGame = new Phaser.Game(config);

    this.phaserGame.events.on(Constants.EVENTS.GAME_FINISHED, () => {
      this.replaypopup.show();
    })
    this.phaserGame.events.on(Constants.EVENTS.MOVE, () => {
      this.totalMoves++
    })
    this.phaserGame.events.on(Constants.EVENTS.CORRECT_MOVE, () => {
      this.totalCorrectMoves++
    })
    this.phaserGame.events.on(Constants.EVENTS.SHUFFLING, () => {
      this.shufflepopup.show();
    })
    this.phaserGame.events.on(Constants.EVENTS.SHUFFLING_DONE, () => {
      this.shufflepopup.hide();
    })
    this.phaserGame.events.on(Constants.EVENTS.ADD_SCORE, (deltascore: number) => {
      this.score += deltascore;
    })
  }

  /**
   * Relaunch a game with the same parameters
   */
  replay() {
    this.phaserGame.scene.stop('end');
    this.phaserGame.scene.start('game');

    this.replaypopup.hide();
    this.shufflepopup.hide();

    // Reset game ui
    this.totalCorrectMoves = 0;
    this.totalMoves = 0;
    this.score = 0;

  }

  unpause() {
    this.phaserGame.scene.run('game');
  }

  options() {
    this.phaserGame.scene.pause('game');
    this.optionspopup.show();
  }

  hint() {
    this.phaserGame.events.emit(Constants.EVENTS.SHOW_HINT);
  }

  getTime() {
    if (!this.phaserGame) {
      return "";
    }

    let gamesecene = this.phaserGame.scene.getScene('game') as Game;

    if (!gamesecene) {
      return ""
    }

    let secondsNb = gamesecene.seconds % 60;
    let minutesNb = Math.floor(gamesecene.seconds / 60);
    let hoursNb = Math.floor(minutesNb / 60);

    let seconds = secondsNb < 10 ? "0" + secondsNb : secondsNb;
    let minutes = minutesNb < 10 ? "0" + minutesNb : minutesNb;

    return `${minutes}:${seconds}`;
  }
}
