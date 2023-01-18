export default class Board {
  
  config = {}
  cells = []
  solved = false
  STATES = {
    UNVISITED: 0,
    VISITED: 1
  }

  canvas = null
  ctx = null

  constructor (sideLength = 25, canvas) {
    // settings
    this.config = {
      columns: sideLength,
      lines: sideLength, 
      cell: {
        width: canvas.clientWidth / sideLength,
        height: canvas.clientHeight / sideLength,
       
      }, 
      // entry: [0, 0],
      // exit: [sideLength - 1, sideLength - 1],
    }

    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d");

    // fill board cells
    this.init()
  }

  init () {
    this.cells = (() => {
      let matrix = []
      for (let i = 0; i < this.config.columns; i++) {
        let line = []
        for (let j = 0; j < this.config.lines; j++) {
          line.push({
            state: this.STATES.UNVISITED,
            walls: [true, true, true, true]
          })
        }
        matrix.push(line)
      }
      return matrix
    })()

    // console.log('board.cells begin', this.cells)
  }

  draw () {
    this.ctx.clearRect(0, 0, this.config.cell.width * this.config.columns, this.config.cell.height * this.config.lines)
    for (let i = 0; i < this.config.columns; i++) {
      for (let j = 0; j < this.config.lines; j++) {
        let path = new Path2D();
        const cell = this.cells[i][j]
        if (cell.state === this.STATES.VISITED) {
          if (cell.walls[0]) {
            path.moveTo(i * this.config.cell.width, j * this.config.cell.height)
            path.lineTo((i + 1) * this.config.cell.width, j * this.config.cell.height)
          }
          if (cell.walls[1]) {
            path.moveTo((i + 1) * this.config.cell.width, j * this.config.cell.height)
            path.lineTo((i + 1) * this.config.cell.width, (j + 1) * this.config.cell.height)
          }
          if (cell.walls[2]) {
            path.moveTo((i + 1) * this.config.cell.width, (j + 1) * this.config.cell.height)
            path.lineTo(i * this.config.cell.width, (j + 1) * this.config.cell.height)
          }
          if (cell.walls[3]) {
            path.moveTo(i * this.config.cell.width, (j + 1) * this.config.cell.height)
            path.lineTo(i * this.config.cell.width, j * this.config.cell.height)
          }
        }
        else {
          path.moveTo(i * this.config.cell.width, j * this.config.cell.height)
          path.lineTo((i + 1) * this.config.cell.width, j * this.config.cell.height)
          path.lineTo((i + 1) * this.config.cell.width, (j + 1) * this.config.cell.height)
          path.lineTo(i * this.config.cell.width, (j + 1) * this.config.cell.height)
          path.closePath()
        }

        this.ctx.stroke(path);
        this.ctx.fillStyle = "#444";
        this.ctx.fill(path);
      }
    }
  }

  async solve () {
    let i = this.randomInt(this.config.columns)
    let j = this.randomInt(this.config.lines)

    // let n = 0
    const path = []

    do {
      // profit
      // console.log('[i][j]', i, j, '=', this.cells[i][j])

      // debugger
      this.cells[i][j].state = this.STATES.VISITED
      let possibleMoves = this.getPossibleMoves(i, j)
      
      // if there are no possible moves, revert path to last bifurcation
      while (possibleMoves.filter(m => m === true).length === 0 && path.length > 0) {
        const lastCell = path.pop()
        i = lastCell.i
        j = lastCell.j
        possibleMoves = lastCell.possibleMoves
        console.log('pop', lastCell)
      } 

      const moveIndex = this.getMove(possibleMoves)
      this.cells[i][j].walls[moveIndex] = false
      
      possibleMoves[moveIndex] = false
      await this.delay(5)
      this.draw();

      path.push({
        i: i,
        j: j,
        possibleMoves: possibleMoves
      });
      
      switch (moveIndex) {
        case 0: j--; break;
        case 1: i++; break;
        case 2: j++; break;
        case 3: i--; break;
      }

      // next cell open wall
      if (this.cells[i][j].state === this.STATES.UNVISITED) {
        this.cells[i][j].walls[moveIndex < 2 ? moveIndex + 2 : moveIndex - 2] = false
      }

    } while (!this.allCellsVisited())

    this.solved = true
    // console.log('board.cells final', this.cells)
  }

  allCellsVisited () {
    for (let i = 0; i < this.config.columns; i++) {
      for (let j = 0; j < this.config.lines; j++) {
        if (this.cells[i][j].state === this.STATES.UNVISITED) {
          return false
        }
      }
    }
    return true
  }

  getPossibleMoves (i, j) {
    let moves = [
      false, // top
      false, // right
      false, // bottom
      false  // left
    ]

    if (j > 0 && this.cells[i][j - 1].state === this.STATES.UNVISITED) {
      moves[0] = true
    }

    if (i < this.config.columns - 1 && this.cells[i + 1][j].state === this.STATES.UNVISITED) {
      moves[1] = true
    }

    if (j < this.config.lines - 1 && this.cells[i][j + 1].state === this.STATES.UNVISITED) {
      moves[2] = true
    }

    if (i > 0 && this.cells[i - 1][j].state === this.STATES.UNVISITED) {
      moves[3] = true
    }
    
    // console.log('getPossibleMoves', moves)
    return moves
  }

  getMove (possibleMoves) {
    let index;

    do {
      index = Math.floor(Math.random() * possibleMoves.length)
    } while (possibleMoves[index] === false)

    // console.log('getMove', index)
    return index
  }
  
  
  randomInt (max) {
    return Math.floor(Math.random() * max)
  }

  delay (delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }
}