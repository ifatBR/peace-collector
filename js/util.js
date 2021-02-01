function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomIntImp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    var diff = max - min +1;
    var randNum = Math.floor(Math.random() * diff) + min;
    return randNum;
  }