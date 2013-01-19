/*Go board Engine
 *Created by = David Tran 
 *on 1-3-2013
 *Version 0.7.0.0
 *Last modified 01-19-2013
 */

//Board Class

var ZX_BOARD_DEBUG = false;

ZX_GO_Board = function( size, MODE ) {

  //Private Variable Members 
  //CONSTSTANTS
  var BOARD_SIZE    = size;
  var MAX           = BOARD_SIZE * BOARD_SIZE;

  var EMPTY_PIECE   = 0;
  var NEUTRAL_PIECE = 100;

  var _MODE = MODE;
  /*0 Free, no rules
   *1 Stone Limiter, There are only a finite amount of stones
   *2 KO, KO blocked
   */
  
  //Local
  var _Board      = [];
  var _History    = {};
  var _BoardHash  = {};

  var _StoneCount;
  
  //HELPER VAR
  var i;

  //Possible values of the board
  /*var PLAYER_MAP = { 
   *EMPTY_PIECE  = "Liberty"  , 1  = "Player 1" ,
   *2            = "Player 2" };
   */
  
  //Constructor WORK

  for( i = 0 ; i < MAX ; i++ )
    _Board.push(EMPTY_PIECE);

  if ( _MODE&1 ){
    if ( MAX&1 )
       _StoneCount = [ 2+(MAX>>1), 2+(MAX>>1) , 0 , 0];
    else
       _StoneCount = [ MAX>>1, MAX>>1 , 0 , 0];
  }
  
  /***************************************************************************/
  /////Private Members
  
  //Library dereferencing
  var floor = Math.floor;

  //Array Support Functions
  //Check if moving in direction is valid, else -1
  function left( x ){
    return (x % BOARD_SIZE) ? x-1 : -1;
  };

  function right( x ){
    return ((x+1) % BOARD_SIZE) ? x+1 : -1;
  };

  function up( x ){
    return x >= BOARD_SIZE ? x-BOARD_SIZE : -1;
  };

  function down( x ){
    return x+BOARD_SIZE < MAX ? x+BOARD_SIZE : -1;
  };

  var direction      = [left,right,up,down];
  var directionCount = direction.length;
  
  //Assist Functions for debugging
  //Converts the 1d <-> 2d coords
  function twoOne( x , y ){
    return x + y * BOARD_SIZE;
  };

  function oneTwo( z ){
    return [ z % BOARD_SIZE , floor( z / BOARD_SIZE ) ];
  };

  /***************************************************************************/
  /////Main Functions
  
  function cloneBoard(){
    //Returns a deep copy of the board

    var newBoard = [];
    for( i = 0 ; i < MAX ; i++ )
      newBoard.push(_Board[i]);
    //return $.extend(true,[],_Board);
    return newBoard;
  };
  
  function cloneStoneCount(){
    //Returns a deep copy of the StoneCount

    return $.extend(true,[],_StoneCount);
  };

  function resizeBoard( size ){
    //Resizes the interal board

    BOARD_SIZE    = size;
    MAX           = BOARD_SIZE * BOARD_SIZE;

    _Board = [];

    for ( i = 0; i < MAX ; i++ ){
      _Board.push( EMPTY_PIECE );
    }

    clearSupport();

  };

  function clearBoard(){
    //Clears the board

    for ( i = 0; i < MAX ; i++ ){
      _Board[i] = EMPTY_PIECE;
    }

    clearSupport();
  };

  function clearSupport(){
    //Cleans up the board's extra data
    if ( _MODE&1 ){
      if ( MAX&1 )
         _StoneCount = [ 2+(MAX>>1), 2+(MAX>>1) , 0 , 0];
      else
         _StoneCount = [ MAX>>1, MAX>>1 , 0 , 0];
    }

    _History    = {};

    _BoardHash  = {};
  };

  function canRemoveStones( pos ){
    //We return the number of cells being replaced from the board

    if ( pos < 0 || pos >= MAX )
      return -1;
    return stoneRemover(_Board[pos],pos);
  };

  function stoneRemover( color, pos ){
    /*Preforms a flood fill at pos, changing all color to EMPTY_PIECE
     *We flood fill using left hand orientation
     *https://en.wikipedia.org/wiki/Flood_fill
     */

    var queue = [];
    var count = 0;
    var i;

    queue.push(pos);

    while ( queue.length != 0 ){
      pos = queue.pop();
      if ( pos != -1 && _Board[pos] == color ){
        count +=1;
        _Board[pos] = EMPTY_PIECE;
        if ( (i = left( pos)) != -1 )
          if ( _Board[i] == color )
            queue.push(i);
        if ( (i = right(pos)) != -1 )
          if ( _Board[i] == color )
            queue.push(i);
        if ( (i = up(   pos)) != -1 )
          if ( _Board[i] == color )
            queue.push(i);
        if ( (i = down( pos)) != -1 )
          if ( _Board[i] == color )
            queue.push(i);
      }
    }

    return count;
  };

  function hasLiberty( pos ){
    //Returns true if there is liberty connected to the pieces at pos
    //Else false

    if ( pos < 0 || pos >= MAX )
      return false;
    return libertyCheck(_Board[pos],pos);
  };
  
  function libertyCheck ( color, pos ){
    /*Preforms a flood fill at pos, checking if we have any liberty
     *Returning true means we have at least one free liberty
     *We flood fill using left hand orientation
     *https://en.wikipedia.org/wiki/Flood_fill
     */

    var local_board = cloneBoard();
    var queue = [];
    var i,j;

    queue.push(pos);

    while ( queue.length != 0 ){
      //alert("Start node =" + pos);
      pos = queue.pop();
      if ( pos != -1 ){
        if( local_board[pos] == EMPTY_PIECE ){
          if (ZX_BOARD_DEBUG){
            alert('-' + pos + '-');
          }
          return true;
        }
        else if ( local_board[pos] == color ){
          local_board[pos] = NEUTRAL_PIECE;
          if ( (i = left( pos)) != -1 )
              queue.push(i);
          if ( (i = right(pos)) != -1 )
              queue.push(i);
          if ( (i = up(   pos)) != -1 )
              queue.push(i);
          if ( (i = down( pos)) != -1 )
              queue.push(i);
        }
      }
    }

    return false;
  };

  function endGameCalc(){
    /*Preforms a breadth first search on the board
     *to calculate territory
     */
     
    var P1Score, P2Score, hasP1, hasP2, P1STONE, P2STONE;
    var i, j, k, blanksLeft, piecesToColor, roundPieceLeft;
    var lastblanksLeft;

    P1STONE = 1;
    P2STONE = 2;

    P1Score = 0;
    P2Score = 0;

    var emptySpot      = [];
    var newEmptySpot   = [];
    var updateSpot     = [];
    var updateColor    = [];

    //Find all empty spots and add it
    for( i = 0 ; i < MAX ; i++ )
      if ( _Board[i] == EMPTY_PIECE )
        emptySpot.push(i);

    //Algorithm for updating the squares
    blanksLeft = emptySpot.length;

    do{
    
      lastblanksLeft = blanksLeft;
      
      //For every blanksquare
      roundPieceLeft = emptySpot.length;
      while( roundPieceLeft ){
        roundPieceLeft -= 1;
        i = emptySpot.pop();

        hasP1 = hasP2 = false;

        //For every possible neighbor
        for( j = 0 ; j < directionCount ; j++ ){
          if ( ( k = direction[j](i) ) != -1 ){
            if ( _Board[k] == P1STONE ){
              //alert("At pos" + i );
              hasP1 = true;
            }
            else if ( _Board[k] == P2STONE ){
              hasP2 = true;
            }
          }
        }

        //Update on result
        if ( hasP1 || hasP2 ){
          //alert( "hasP1 is " + hasP1 );
          blanksLeft -=1;
        }

        //What do we see?
        if ( !hasP1 && !hasP2 ){
          newEmptySpot.push(i);
        }
        else if (  hasP1 && !hasP2 ){
          P1Score += 1;
          updateSpot.push(i);
          updateColor.push(P1STONE);
        }
        else if ( !hasP1 && hasP2 ){
          P2Score += 1;
          updateSpot.push(i);
          updateColor.push(P2STONE);
        }
        else if ( hasP1 && hasP2 ){
          updateSpot.push(i);
          updateColor.push(NEUTRAL_PIECE);
        }

      }
      
      //If we made no progress escape
      if ( lastblanksLeft == blanksLeft ){
        //alert("BLANK BOARD");
        break;
      }

      //Add in the new pieces
      piecesToColor = updateSpot.length;

      for( i = 0 ; i < piecesToColor ; i++ ){
        _Board[updateSpot.pop()] = updateColor.pop();
      }

      emptySpot    = newEmptySpot;
      newEmptySpot = [];

    }while( blanksLeft );

    //Account for prisoners

    P1Score += _StoneCount[3];
    P2Score += _StoneCount[2];

    return [ P1Score , P2Score ];
  };

  /***************************************************************************/
  /////Privileged Members

  //DEBUGGING FUNCTION
  this.draw = function(){
    //Draws to the console via alert

    var i;
    var mid    = cloneBoard();
    var output = [];

    for( i = 0 ; i < BOARD_SIZE ; i++ )
      output.push(mid.slice(i,BOARD_SIZE+i).join(""));
    alert(output.join("\n"));
  };

  /////Main Functions
  this.curMode = function(){
    if ( _MODE == 0 )
      return [0,"unlimited"];
    else
      return [1,"real"];
  }
  
  this.stoneCount = function(){
    //Returns a copy of the current stoneCount
    
    return cloneStoneCount();
  }
  
  this.curState = function(){
    //Returns a copy of the current board

    return cloneBoard();
  };

  this.hash = function(){
    //Computes the hash of the board
    //This is not efficient but it works

    return cloneBoard().join("");
  };

  this.isValidMove = function( pos, color ){
    //Checks if pos is a valid move
    //If so returns true else false

    var isValid;
    var i,j;
    var new_board; 
    var colorPiece = color - 1;
    var enemyColor = color == 2 ? 1 : 2;
    var stoneCapture = 0;

    //Invalid position
    if( pos < 0 || pos >= MAX )
      return false

    //Piece already contained
    if ( _Board[pos] != EMPTY_PIECE )
      return false;

    //Out of stone
    if ( (  _MODE & 1) && _StoneCount[colorPiece] == 0 )
      return false;

    isValid = true;

    //At this point, the move is valid but...
    _Board[pos] = color;
    
    //Check Hash
    if ( _MODE&2 ){
    }

    //Will this move be suicidal?
    if ( hasLiberty(pos) < 1 ){
      if ( ZX_BOARD_DEBUG )
        alert("Suscidal?");
      isValid = false;
    }
    
    for( j = 0 ; j < directionCount ; j++ )
      if ( ( i =  direction[j](pos) ) != -1 )
        if ( _Board[i] != color )
          if ( hasLiberty( i ) == false ){
            stoneCapture += canRemoveStones( i );
            isValid = true;
          }    

    if ( !isValid ){
      //alert("FAILED");
      _Board[pos] = EMPTY_PIECE;
    }
    else if ( _MODE&1 ){
      //Update Stone Count
      _StoneCount[        colorPiece  ] -= 1;
      _StoneCount[ 2 + (1^colorPiece) ] += stoneCapture;

      //Update Hash
    }
    return isValid;
  };

  this.endGame = function (){
    //Ends the game and calculates score
    var output = endGameCalc();
    var a = cloneBoard();

    clearBoard();
    return [output,a];
  }

}

ZX_GO_Board.prototype = {
  //Public Methods
  //function_name: function(){

  //},

};
