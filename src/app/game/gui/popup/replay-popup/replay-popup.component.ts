import { Component, Input } from '@angular/core';
import { Popup } from '../popup';
import * as _ from 'underscore';

type Score = {
  gamenumber: number,
  time: string,
  totalTiles: number,
  totalMoves: number,
  totalCorrectMoves: number,
  bestcombo: number,
  score: number
}

@Component({
  selector: 'replay-popup',
  templateUrl: './replay-popup.component.html',
  styleUrls: ['./replay-popup.component.scss']
})
export class ReplayPopupComponent extends Popup {

  /**
   * All scores for this user
   */
  scores: Array<Score> = [];
  /** The index of the current game in the score array */
  currentGameIndex = 0

  /**
   * Replay button click
   */
  action() {
    super.action();
    this.close();
  }

  /**
   * Get score in local storage
   */
  onShow() {
    this.scores = JSON.parse(localStorage.getItem('shisensho.scores'));
    if (this.scores === null) {
      this.scores = [];
    }

    // Get the number of games played
    let gamenumber = this.scores.length + 1;


    // Add current score and save it in local storage
    this.scores.push({
      gamenumber: gamenumber,
      time: this.inputData.time,
      totalTiles: this.inputData.totalTiles,
      totalMoves: this.inputData.totalMoves,
      totalCorrectMoves: this.inputData.totalCorrectMoves,
      bestcombo: this.inputData.bestcombo,
      score: this.inputData.score
    })

    // Sort by score
    this.scores = _.sortBy(this.scores, 'gamenumber').reverse();

    // Find current game index among the score array
    this.currentGameIndex = _.findIndex(this.scores, (score: Score) => {
      return score.gamenumber === gamenumber;
    });

    localStorage.setItem('shisensho.scores', JSON.stringify(this.scores));
  }



}
