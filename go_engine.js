/*Go board Engine
 *Created by = David Tran 
 *on 1-3-2013
 *Version 0.6.2.0
 *Last modified 1-10-2013
 */

//Array.prototype.clone = function() { return jQuery.extend(true,[],this); }

//Board Class

var ZX_BOARD_DEBUG = false;

ZX_Board = function( size ) {

  //Private Variable Members 
  //CONSTSTANTS
  var BOARD_SIZE    = size;
  var MAX           = BOARD_SIZE * BOARD_SIZE;

  var EMPTY_PIECE   = 0;
  var NEUTRAL_PIECE = 100;

  //Local
  var _Board      = [];
  var _History    = {};
  var _BoardHash  = {};

  //HELPER VAR
  var i;

  //Possible values of the board
  /*var PLAYER_MAP = { 
   *EMPTY_PIECE  = "Liberty"  , 1  = "Player 1" ,
   *2            = "Player 2" };
   */
  
  //Constructor WORK

  for( i = 0 ; i < MAX ; i++ )
    _Board[i] = EMPTY_PIECE;

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
    
    /*
    var new_board = [];

    for( i = 0 ; i < MAX; i++)
      new_board.push(_Board[i]);

    return new_board;
    
    */
    return $.extend(true,[],_Board);
  };

  function clearBoard(){
    //Clears the board

    for ( i = 0; i < MAX ; i++ ){
      _Board[i] = EMPTY_PIECE;
    }
  };

  function canRemoveStones( pos ){
    //We return the number of cells being replaced from the board

    if ( pos < 0 || pos >= MAX )
      return -1;
    return stoneRemover(_Board[pos],pos);
  };

  function stoneRemover( color, pos ){
    //Preforms a flood fill at pos, changing all color to EMPTY_PIECE
    //We flood fill using left hand orientation
    //https://en.wikipedia.org/wiki/Flood_fill

    var queue = [];
    var count = 0;
    var i;

    queue.push(pos);

    while ( queue.length != 0 ){
      pos = queue.shift();
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
    //Preforms a flood fill at pos, checking if we have any liberty
    //Returning true means we have at least one free liberty
    //We flood fill using left hand orientation
    //https://en.wikipedia.org/wiki/Flood_fill

    var local_board = cloneBoard();
    var queue = [];
    var i,j;

    queue.push(pos);

    while ( queue.length != 0 ){
      //alert("Start node =" + pos);
      pos = queue.shift();
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
    var enemyColor = color == 2 ? 1 : 2;

    if( pos < 0 || pos >= MAX )
      return false

        if ( _Board[pos] != EMPTY_PIECE )
          return false;

    isValid = true;

    //At this point, the move is valid but...
    _Board[pos] = color;

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
            canRemoveStones( i );
            isValid = true;
          }    

    if ( !isValid ){
      alert("FAILED");
      _Board[pos] = EMPTY_PIECE;
    }
    return isValid;
  };

}

ZX_Board.prototype = {
  //Public Methods
  //function_name: function(){

  //},

};
