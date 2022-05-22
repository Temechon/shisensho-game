/**
 * Contains all constants of the game
 */
export abstract class Constants {

    static EVENTS = {
        GRID_CHECK_HINTS: "grid:checkHints",
        GAME_FINISHED: "game:finished",

        MOVE_DONE: "move:done",
        CORRECT_MOVE_DONE: "move:correct:done",
        INCORRECT_MOVE_DONE: "move:incorrect:done",

        SHUFFLING: "shuffling",
        SHUFFLING_DONE: "shuffling:done",

        SHOW_HINT: "hint:show",

        ADD_SCORE: "add:score",

        COMBO_UPDATE: "combo:update"
    }
}