/**
 * Contains all constants of the game
 */
export abstract class Constants {

    static EVENTS = {
        GRID_CHECK_HINTS: "grid:checkHints",
        GAME_FINISHED: "game:finished",

        MOVE: "move:done",
        CORRECT_MOVE: "move:correct:done",

        SHUFFLING: "shuffling",
        SHUFFLING_DONE: "shuffling:done",

        SHOW_HINT: "hint:show"
    }
}