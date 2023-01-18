import Board from "./board.js";

const canvas = document.querySelector("#canvas");
// ctx.translate(0.5, 0.5)

const board = new Board(35, canvas);
board.solve()
