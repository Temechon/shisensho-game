import { ratio } from "../scenes/Boot";

export class Helpers {

    /**
     * Returns the string to be used as a style to create a phaser text
     * @param _size 
     * @param _family 
     */
    public static font(_size: number): string {
        let px = _size * ratio;
        return px + "px ";
    }

    /**
     * array.filter(distinct) return an array with distinct values
     */
    public static distinct(value, index, self) {
        return self.indexOf(value) === index;
    }

    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    public static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    /**
     * Removes all ';' and white spaces at the beginning and at the end of the string
     * @param str 
     */
    public static clean(str: string) {
        return str.trim().replace(/^;+|;+$/g, '').trim();
    }
}