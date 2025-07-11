"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = shuffle;
function shuffle(array) {
    const arr = [...array];
    // Fisher-Yates shuffle algorithm with multiple passes for better randomization
    for (let pass = 0; pass < 3; pass++) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    return arr;
}
