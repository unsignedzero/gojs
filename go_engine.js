/*Go board Engine
 *Created by David Tran
 *on 1-3-2013
 *Version 0.7.2.0
 *Last modified 03-03-2013
 */

//Board Class


zxGoBoard = function(size, BoardMODE) {

  var DEBUG = false;

  //Private Variable Members
  //CONSTSTANTS
  var BOARD_SIZE = size,
  MAX            = BOARD_SIZE * BOARD_SIZE,

  EMPTY_PIECE    = 0,
  NEUTRAL_PIECE  = 100,

  MODE           = BoardMODE;
  /*0 Free, no rules
   *1 Capture count, captures are accounted for
   *2 KO, KO blocked
   *4 History, History added (not used yet)
   *8 Stone Limiter, there is only a finite amount of stones
   */

  //Local
  var Board     = [],
      History   = [],
      BoardHash = {};

  //This is the default null values
  var i, StoneCount;
  setStoneCount(MODE,StoneCount);

  //HELPER VAR

  //Possible values of the board
  /*var PLAYER_MAP = {
   *EMPTY_PIECE  : "Liberty"  , 1  : "Player 1" ,
   *2            : "Player 2" }
   */

  //Constructor WORK

  i = 0;
  while(i < MAX){
    Board.push(EMPTY_PIECE);
    i += 1;
  }

  /***************************************************************************/
  /////Private Members

  //Library dereferencing
  var floor = Math.floor;

  //Array Support Functions
  //Check if moving in direction is valid, else -1
  function left(x){
    return (x % BOARD_SIZE) ? x-1 : -1;
  }

  function right(x){
    return ((x+1) % BOARD_SIZE) ? x+1 : -1;
  }

  function up(x){
    return x >= BOARD_SIZE ? x-BOARD_SIZE : -1;
  }

  function down(x){
    return x+BOARD_SIZE < MAX ? x+BOARD_SIZE : -1;
  }

  var direction      = [left,right,up,down],
      directionCount = direction.length;

  //Assist Functions for debugging
  //Converts the 1d <-> 2d coords
  function twoOne(x , y){
    return x + y * BOARD_SIZE;
  }

  function oneTwo(z){
    return [ z % BOARD_SIZE , floor(z / BOARD_SIZE) ];
  }

  function setStoneCount(MODE, stoneCount){
    if (MODE&8){
      if (MODE&1){
        if (MAX&1)
           StoneCount = [2+(MAX>>1), 2+(MAX>>1), 0, 0];
        else
           StoneCount = [MAX>>1, MAX>>1, 0, 0];
      }
      else{
        if (MAX&1)
           StoneCount = [2+(MAX>>1), 2+(MAX>>1), '-', '-'];
        else
           StoneCount = [MAX>>1, MAX>>1, '-', '-'];
      }
    }
    else if (MODE&1)
      StoneCount = ['∞', '∞', 0, 0];
  }

  /***************************************************************************/
  /////Main Functions

  function cloneBoard(){
    //Returns a deep copy of the board
    var newBoard = [];

    i = 0;
    while(i < MAX){
      newBoard.push(Board[i]);
      i += 1;
    }
    return newBoard;
    //return $.extend(true,[],Board);
  }

  function cloneStoneCount(){
    //Returns a deep copy of the StoneCount

    return $.extend(true,[],StoneCount);
  }

  function resizeBoard(size){
    //Resizes the interal board

    BOARD_SIZE    = size;
    MAX           = BOARD_SIZE * BOARD_SIZE;

    Board = [];

    i = 0;
    while(i < MAX){
      Board.push(EMPTY_PIECE);
      i += 1;
    }

    clearSupport();

  }

  function clearBoard(){
    //Clears the board

    i = 0;
    while(i < MAX){
      Board[i] = EMPTY_PIECE;
      i += 1;
    }

    clearSupport();
  }

  function clearSupport(){
    //Cleans up the board's extra data
    setStoneCount(MODE,StoneCount);

    if (MODE&2)
      BoardHash  = {};
    if (MODE&4)
     History     = [];

  }

  function canRemoveStones(pos){
    //We return the number of cells being replaced from the board

    if (pos < 0 || pos >= MAX)
      return -1;
    return stoneRemover(Board[pos],pos);
  }

  function stoneRemover(color, pos){
    /*Preforms a flood fill at pos, changing all color to EMPTY_PIECE
     *We flood fill using left hand orientation
     *https://en.wikipedia.org/wiki/Flood_fill
     */

    var i, queue = [],
        count =  0;

    queue.push(pos);

    while (queue.length !== 0){
      pos = queue.pop();
      if (pos !== -1 && Board[pos] === color){
        count +=1;
        Board[pos] = EMPTY_PIECE;
        if ((i = left(pos)) !== -1){
          if (Board[i] === color)
            queue.push(i);
        }
        if ((i = right(pos)) !== -1){
          if (Board[i] === color)
            queue.push(i);
        }
        if ((i = up(  pos)) !== -1){
          if (Board[i] === color)
            queue.push(i);
        }
        if ((i = down(pos)) !== -1){
          if (Board[i] === color)
            queue.push(i);
        }
      }
    }

    return count;
  }

  function hasLiberty(pos){
    //Returns true if there is liberty connected to the pieces at pos
    //Else false

    if (pos < 0 || pos >= MAX)
      return false;
    return libertyCheck(Board[pos],pos);
  }

  function libertyCheck (color, pos){
    /*Preforms a flood fill at pos, checking if we have any liberty
     *Returning true means we have at least one free liberty
     *We flood fill using left hand orientation
     *https://en.wikipedia.org/wiki/Flood_fill
     */

    var i, j, local_board = cloneBoard(),
        queue = [];

    queue.push(pos);

    while (queue.length !== 0){
      pos = queue.pop();
      if (pos !== -1){
        if (local_board[pos] === EMPTY_PIECE){
          if (DEBUG)
            alert('-' + pos + '-');
          return true;
        }
        else if (local_board[pos] === color){
          local_board[pos] = NEUTRAL_PIECE;
          if ((i = left(pos)) !== -1)
              queue.push(i);
          if ((i = right(pos)) !== -1)
              queue.push(i);
          if ((i = up(  pos)) !== -1)
              queue.push(i);
          if ((i = down(pos)) !== -1)
              queue.push(i);
        }
      }
    }

    return false;
  }

  function endGameCalc(){
    /*Preforms a breadth first search on the board
     *to calculate territory
     */

    var P1Score, P2Score, hasP1, hasP2, P1STONE, P2STONE,
        i, j, k, blanksLeft, piecesToColor, roundPieceLeft,
        lastblanksLeft;

    P1STONE = 1;
    P2STONE = 2;

    P1Score = 0;
    P2Score = 0;

    var emptySpot = [],
    newEmptySpot  = [],
    updateSpot    = [],
    updateColor   = [];

    //Find all empty spots and add it
    i = 0;
    while(i < MAX){
      if (Board[i] === EMPTY_PIECE)
        emptySpot.push(i);
      i += 1;
    }

    //Algorithm for updating the squares
    blanksLeft = emptySpot.length;

    do{

      lastblanksLeft = blanksLeft;

      //For every blanksquare
      roundPieceLeft = emptySpot.length;
      while(roundPieceLeft){
        roundPieceLeft -= 1;
        i = emptySpot.pop();

        hasP1 = hasP2 = false;

        //For every possible neighbor
        j = 0;
        while(j < directionCount){
          if ((k = direction[j](i)) !== -1){
            if (Board[k] === P1STONE){
              //alert("At pos" + i);
              hasP1 = true;
            }
            else if (Board[k] === P2STONE){
              hasP2 = true;
            }
          }
          j += 1;
        }

        //Update on result
        if (hasP1 || hasP2){
          //alert("hasP1 is " + hasP1);
          blanksLeft -=1;
        }

        //What do we see?
        if (!hasP1 && !hasP2){
          newEmptySpot.push(i);
        }
        else if ( hasP1 && !hasP2){
          P1Score += 1;
          updateSpot.push(i);
          updateColor.push(P1STONE);
        }
        else if (!hasP1 && hasP2){
          P2Score += 1;
          updateSpot.push(i);
          updateColor.push(P2STONE);
        }
        else if (hasP1 && hasP2){
          updateSpot.push(i);
          updateColor.push(NEUTRAL_PIECE);
        }

      }

      //If we made no progress escape
      if (lastblanksLeft === blanksLeft){
        //alert("BLANK BOARD");
        break;
      }

      //Add in the new pieces
      piecesToColor = updateSpot.length;

      i = 0;
      while(i < piecesToColor){
        Board[updateSpot.pop()] = updateColor.pop();
        i += 1;
      }

      emptySpot    = newEmptySpot;
      newEmptySpot = [];

    }while(blanksLeft);

    //Account for prisoners

    P1Score += StoneCount[3];
    P2Score += StoneCount[2];

    return [ P1Score , P2Score ];
  }

  /***************************************************************************/
  /////Privileged Members

  //DEBUGGING FUNCTION
  this.draw = function(){
    //Draws to the console via alert

    var i, mid = cloneBoard(),
        output = [];

    i = 0;
    while(i < BOARD){
      output.push(mid.slice(i,BOARD_SIZE+i).join(""));
      i += 1;
    }
    alert(output.join("\n"));
  };

  /////Main Functions
  this.curMode = function(){
    return MODE;
  };

  this.stoneCount = function(){
    //Returns a copy of the current stoneCount
    return MODE&9 ? cloneStoneCount() : ['∞', '∞', '-', '-'];
  };

  this.curState = function(){
    //Returns a copy of the current board
    return cloneBoard();
  };

  this.hash = function(){
    //Computes the hash of the board
    //This is not efficient but it works

    return cloneBoard().join("");
  };

  this.isValidMove = function(pos, color){
    //Checks if pos is a valid move
    //If so returns true else false

    var i, j, hash_val, isValid, newBoard,
        colorPiece = color - 1,
        enemyColor = color === 2 ? 1 : 2,
        stoneCapture = 0;

    //Invalid position
    if (pos < 0 || pos >= MAX)
      return false;

    //Piece already contained
    if (Board[pos] !== EMPTY_PIECE)
      return false;

    //Out of stone
    if ((MODE&8) && StoneCount[colorPiece] === 0)
      return false;

    //At this point, the move is valid but...
    Board[pos] = color;
    isValid = true;

    //Check Hash
    if (MODE&2){
      hash_val = this.hash();
      if (BoardHash[hash_val] !== undefined){
        Board[pos] = EMPTY_PIECE;
        return false;
      }
    }

    //Will this move be suicidal?
    if (hasLiberty(pos) < 1){
      if (DEBUG)
        alert("Suscidal?");
      isValid = false;
    }

    //Check neighbors for capture
    j = 0;
    while(j < directionCount){
      if ((i =  direction[j](pos)) !== -1){
        if (Board[i] !== color){
          if (hasLiberty(i) === false){
            stoneCapture += canRemoveStones(i);
            isValid = true;
          }
        }
      }
      j += 1;
    }

    //Will this new group live?
    if (!isValid){
      //NO
      Board[pos] = EMPTY_PIECE;
    }
    else{
      //YES

      //Update Capture Count
      if (MODE&1)
        StoneCount[2+(1^colorPiece)] += stoneCapture;

      //Update Hash
      if (MODE&2)
        BoardHash[hash_val] = true;

      //Update History
      if (MODE&4)
        History.push([pos,color]);

      //Update Stone Count
      if (MODE&8)
        StoneCount[colorPiece] -= 1;
    }

    return isValid;
  };

  this.endGame = function (){
    //Ends the game and calculates score
    var output = endGameCalc(),
        a = cloneBoard();

    clearBoard();
    return [output,a];
  };

};

zxGoBoard.prototype = {
  //Public Methods
  //function_name: function(){

  //},

};
