﻿/*Created by David Tran (unsignedzero) twice
 *on 1-3-2013
 *Version 0.6.2.0
 *Last modified 1-9-2013
 *This code draws an interactive GO board on the screen
 *allowing two users to play the game
 */

//Remember to "refresh" a layer ONCE
//any change or made

//WARNING setOpacity explicit wants a float type. Feeding it an int, makes it do nothing

var GO_UI_DEBUG = false;
var GO_UI_ANIM  = true;

//////////////////////////////////////////////////////////////////////////////

//Specifies whose turn it is by the piece that needs to be played
var GO_UI_curPTurn = 0;
//Contains the current Player's stone in the upper left
var GO_UI_curPStonePiece;
//Links to the animation for the above stone
var GO_UI_curPStoneAnim;
//Array of UI board pieces
var GO_UI_stoneBoard;
//Stores the backend Go Board from the engine
var GO_UI_backendGOBoard;

//Animation Values
var captureFade = 500;

var GO_UI_stage = new Kinetic.Stage({
  container: 'container',
  width:  800,
  height: 700
});

var GO_UI_menuLayer    = new Kinetic.Layer();
var GO_UI_brdLayer     = new Kinetic.Layer();
var GO_UI_msgLayer     = new Kinetic.Layer();
var GO_UI_UILayer      = new Kinetic.Layer();
var GO_UI_FadeLayer    = new Kinetic.Layer();
var GO_UI_CurTurnLayer = new Kinetic.Layer();

function drawGOBoard( _layer, _x, _y, _size, div){
  //Draws the GO Board Background and the labels
  //In this function, div is the number of divisions one would see
  //so div 8 yields a 9x9 board (there are 8x8 squares)
  
  var _fontSize    = 14;
  var _fontXShift  = -5;    //Sets the relitative hor shift
  var _fontYShift  = -50;   //Sets the position away from the board
  var i,j, tempPos, _radius;

/////Draw Grid
  _layer.add( new Kinetic.Rect({
    x:           _x,
    y:           _y,
    width:       _size,
    height:      _size,
    stroke:      'black',
    strokeWidth: 2
  }));

  for( i = 0 ; i < div ; i++ ){
    //We cache the position of each hor/vert piece below
    tempPos = Math.floor( i * _size / div );

    //Horizontal Text
    _layer.add( new Kinetic.Text({
        x:          _x + _fontXShift + tempPos,
        y:          _y + _fontYShift, 
        text:       i+1,
        fontSize:   _fontSize,
        fontFamily: 'Calibri',
        Fill:       'black',
      }));
    
    //Horizontal Line
    _layer.add( new Kinetic.Line({
      points:       [_x,_y+tempPos,_x+_size,_y+tempPos],
      stroke:       '#000',
      strokeWidth:  2,
      lineCap:      'butt',
    }));

    //Vertical Text
    _layer.add( new Kinetic.Text({
        x:          _x + _fontYShift,
        y:          _y + _fontXShift + tempPos, 
        text:       i+1,
        fontSize:   _fontSize,
        fontFamily: 'Calibri',
        Fill:       'black',
      }));

    //Vertical Line
    _layer.add( new Kinetic.Line({
      points:       [_x+tempPos,_y,_x+tempPos,_y+_size],
      stroke:       '#000',
      strokeWidth:  2,
      lineCap:      'butt',
    }));
  }

  //"Last" Numbers
  //Horizontal Text
  _layer.add( new Kinetic.Text({
      x:          _x + _fontXShift + _size,
      y:          _y + _fontYShift, 
      text:       div+1,
      fontSize:   _fontSize,
      fontFamily: 'Calibri',
      Fill:       'black',
    }));

  //Vertical Text
  _layer.add( new Kinetic.Text({
      x:          _x + _fontYShift,
      y:          _y + _fontXShift + _size,
      text:       div+1,
      fontSize:   _fontSize,
      fontFamily: 'Calibri',
      Fill:       'black',
    }));

/////Draws the extra dots on the board( reference points )
  _radius = _size / 100 + 1;

  //Is this even?
  if ( div & 1 ^ 1 ){
    //Case 1 the board is smaller than 8x8, 
    //Only possible thing is to draw the center

    if ( div < 8 )  
      _layer.add( new Kinetic.Circle({
        x:           _x + (_size>>1),
        y:           _y + (_size>>1),
        radius:      _radius,
        fill:        'black',
        stroke:      'black',
        strokeWidth:  2
      }));
    //Case 2
    //At this point we will always draw 3x3 set of dots
    //For 10x10 and 8x8 the outer ring will have a 2 piece gap to the edge
    //For all other cases, we draw the outer ring with 3 piece gap

    else if ( div >= 8 ){
      var border = div >= 12 ? 3 : 2;
      var delta  = (div>>1) - border;
      for( i = 0 ; i <= 2 ; i++ )
        for( j = 0 ; j <= 2 ; j++ )
          _layer.add( new Kinetic.Circle({
            x:           _x + Math.floor( ( border + i * delta ) * _size / div ),
            y:           _y + Math.floor( ( border + j * delta ) * _size / div ),
            radius:      _radius,
            fill:        'black',
            stroke:      'black',
            strokeWidth:  2
          }));
    }
  }
  //If not even and 7x7 or larger
  else if( div >= 7 ){
    //Here we draw the four corners that are diagonally 2 pieces gap
    //from the edge for 7x7, 9x9 and 11x11 and 3 otherwise

    var border = div >= 12 ? 3 : 2;
    var delta = div - (border<<1);
    for( i = 0 ; i <= 1 ; i++ )
      for( j = 0 ; j <= 1 ; j++ )
        _layer.add( new Kinetic.Circle({
          x:           _x + Math.floor( ( border + i * delta ) * _size / div ),
          y:           _y + Math.floor( ( border + j * delta ) * _size / div ),
          radius:      _radius,
          fill:        'black',
          stroke:      'black',
          strokeWidth:  2
        }));
  }
}

function layGoStones( _layer, _x, _y, _size, div ){
  //This function takes the same args are drawGOBoard
  //and creates the "interactive" clickable area (possible stone position)

  var i,_grid_size   = ((div+1)*(div+1));
  var div_new        =   div+1;
  var _radius        = Math.floor(_size / 25) + 1;
  var interfaceArray = [];
  var temp;
  
  //Creates the clickable areas for the stones on the board
  for ( i = 0 ; i < _grid_size ; i++ ){
    temp = new Kinetic.Circle({
      x:           _x + Math.floor( ( i % div_new ) * _size / div ),
      y:           _y + Math.floor( Math.floor( i / div_new ) * _size / div ),
      radius:      _radius,
      fill:        'white',
      //fillRadialGradientStartPoint: 0,
      //fillRadialGradientStartRadius: 0,
      //fillRadialGradientEndPoint: 0,
      //fillRadialGradientEndRadius: 100,
      //fillRadialGradientColorStops: [0, 'black', 0.5, '#222', 1.0, 'black'],
      opacity:     0.0,
      stroke:      'black',
      strokeWidth: 2
    });

    temp.posID = i;
    temp.color = 0;

    //Modify this for the click area
    //GO_UI_CLICK
    temp.on('mousedown', function() {
      if (this.getOpacity() == 0 ){

        if ( checkValidMove(this.posID, GO_UI_curPTurn + 1 ) ){
          this.setOpacity(1);
          //this.setFill( this.getFill() == 'white' ? 'black' : 'white' );
          if( GO_UI_curPTurn == 0 ){
            GO_UI_curPTurn = 1;
            this.setFill('white');
            this.color = 1;
          }
          else{
            GO_UI_curPTurn = 0;
            this.setFill('black');
            this.color = 2;
          }

          //Don't forget to redraw to show changes!
          _layer.draw();
        }
        else{
          //BAD MOVE
        }
      }

      if ( GO_UI_DEBUG )
        WriteMsg( GO_UI_msgLayer, this.posID );
    });

    interfaceArray.push(temp);
    _layer.add( temp );
  }
  return interfaceArray;
}

function createBoard( brdLayer, _x, _y, sideLength, div ){
  //Here we create the GO Board itself
  //clearLayer( brdLayer ); // Profit?
  var interfaceArray;
  GO_UI_backendGOBoard = new ZX_Board(div+1);
  drawGOBoard(                 brdLayer,_x,_y,sideLength,div);
  interfaceArray = layGoStones(brdLayer,_x,_y,sideLength,div);
  return interfaceArray;
}

function clearLayer( _layer ){
  //Here we clear the layer of everything
  //(Note:To remove one node (graphic element) use the method remove
  _layer.removeChildren();
}

function drawPStoneUI( CurTurnLayer ){
/////Draw Upper Left UI Element (player counter)
  // This IS hard coded (postionally!)

  temp = new Kinetic.Rect({
    x:            45,
    y:            10,
    width:        70,
    height:       70,
    stroke:       'black',
    strokeWidth:  2,
    fill:         '#999',
    cornerRadius: 32,
  });

  temp.setOffset({
    x: temp.getWidth()>>1
  });

  //Click event for the "grey" back
  temp.on( 'mousedown', function(){
    /*
    var _width = $(window).width(); 
    var _height = $(window).height();
    GO_UI_stage.transitionTo({
      x:     (_width-GO_UI_stage.getWidth())>>1,
      y:     (_height-GO_UI_stage.getHeight())>>1,
      opacity: 1,
      duration: 2
    });
    */
    /*
    $('container').animate({
      "left": ($(window).width())>>1}, "slow");
     */
    ZX_BOARD_DEBUG = ZX_BOARD_DEBUG ? false : true;
    externWriteMsg( "DEBUG STATUS: " + ZX_BOARD_DEBUG );
    });

  CurTurnLayer.add(temp);

  GO_UI_curPStonePiece = new Kinetic.Circle({
    stroke:      'black',
    x:           45,
    y:           45,
    radius:      30,
    stroke:      'black',
    strokeWidth: 2,
    fill:        'gray',
  });

  GO_UI_curPStoneAnim = new Kinetic.Animation(function(frame) {
    //Creates the "flip" animation for the stone piece
    var scale = Math.cos( (frame.time<<1) * Math.PI /2000)  + 0.001;

    GO_UI_curPStonePiece.setScale(1,scale);
    if( frame.time >1000 ){
      frame.time = 0;
      this.half = false;
      this.stop();
    }
    else if( frame.time > 500 ){
      if ( GO_UI_curPStoneAnim.half == false){
        GO_UI_curPStonePiece.setFill( GO_UI_curPStonePiece.getFill() == 'white' ? 'black' : 'white'); 
        //GO_UI_curPStonePiece.setFill( GO_UI_curPTurn == 1 ? 'black' : 'white'); 
        this.half = true;
      }
    }
  }, CurTurnLayer);

  GO_UI_curPStoneAnim.half = false;

  //Creates the animation for clicking the piece in the upper left
  //This will fade (in and out) the right column UI if GO_UI_ANIM is true
  //else instantly change it
  GO_UI_curPStonePiece.on('mousedown', function(){
    //Case A we use animation to make it work
    if ( GO_UI_ANIM ){
      var UI_shrink = new Kinetic.Animation(function(frame) {
        if ( UI_shrink.fade ){
          GO_UI_UILayer.setOpacity( 1 - (frame.time/200) );
          if ( frame.time >= 200 ){
            this.stop();
            GO_UI_stage.setWidth(620);
            frame.time = 0;
            UI_shrink.fade = false;
          }
        }
        else{
          GO_UI_stage.setWidth(800);
          GO_UI_UILayer.setOpacity( frame.time/200 );
          if ( frame.time >= 200 ){
            this.stop();
            frame.time = 0;
            UI_shrink.fade = true;
          }
        }
      }, GO_UI_UILayer);
 
      UI_shrink.fade = GO_UI_stage.getWidth() < 625 ? false : true;

      UI_shrink.start();
    }
    //Case B no GO_UI_ANIM
    else{
      if( GO_UI_stage.getWidth() < 625 ){
        GO_UI_UILayer.setOpacity(1.0);
        GO_UI_UILayer.draw();
        GO_UI_stage.setWidth(800);
      }
      else{
        GO_UI_UILayer.setOpacity(0.0);
        GO_UI_UILayer.draw();
        GO_UI_stage.setWidth(620);
      }
    }
  });

  CurTurnLayer.add(GO_UI_curPStonePiece);
}

function drawColumnUI( UILayer ){
 //Draws the right column UI (for future use) and other non-board UI
  var _x, _y, _width, _height, _font, _fontSize;
  var _turnBoxSize;
  var temp;

  _x           = 630;
  _y           =  20;
  _width       = 160;
  _height      = 560;
  _font        = 'Calibri';
  _fontSize    =  20;
  _turnBoxSize = 140;

/////Draw Right Column UI Element
  UILayer.add( new Kinetic.Rect({
    x:           _x,
    y:           _y,
    width:       _width,
    height:      _height,
    stroke:      'black',
    strokeWidth: 2
  }));
 
  //Create Text
  temp = new Kinetic.Text({
    x:           _x + (_width>>1),
    y:           _y + 20,
    text:        'Go Game',
    fontSize:    _fontSize + 6,
    font:        _font,
    Fill:       'black',
    textColor:  'black',
  });

  //Aligns the text in the center. >>1 is /2 in this case
  temp.setOffset({
    x: (temp.getWidth()>>1)
  });

  UILayer.add(temp);

  //Create Turn Counter
  temp = new Kinetic.Text({
    x:           _x + (_width>>1),
    y:           _y + _height - _turnBoxSize - (_turnBoxSize>>3),
    text:        'Turn',
    fontSize:    _fontSize + 4,
    font:        _font,
    Fill:       'black',
    textColor:  'black',
  });

  temp.setOffset({
    x: temp.getWidth()>>1
  });

  UILayer.add(temp);

  temp = new Kinetic.Rect({
    x:           _x + (_width>>1),
    y:           _y + _height - _turnBoxSize + (_turnBoxSize>>3),
    width:       _turnBoxSize - (_turnBoxSize>>2),
    height:      _turnBoxSize - (_turnBoxSize>>2),
    stroke:      'black',
    strokeWidth: 1
  });

  temp.setOffset({
    x: temp.getWidth()>>1
  });

  UILayer.add(temp);
}

function checkValidMove( pos, color_id ){
  //Checks IF the click is valid and PStoneUI, as needed
  var valid = true;
  
  //Call code to check
  valid = GO_UI_backendGOBoard.isValidMove(pos, color_id);
  
  if ( !valid )
    return false

  //Update board
  GO_UI_stoneBoard[pos].color = color_id;

  updateBoard(GO_UI_backendGOBoard.curState());

  //Changes the color piece in the PStoneUI
  if ( GO_UI_ANIM ){

    GO_UI_curPStoneAnim.stop();

    //Solves really fast clicks problem
    GO_UI_curPStonePiece.setFill( GO_UI_curPTurn == 1 ? 'black' : 'white' );

    GO_UI_curPStoneAnim.frame.time = 0;
    GO_UI_curPStoneAnim.half = false;
  
    GO_UI_curPStoneAnim.start();
  }
  else{
    GO_UI_curPStonePiece.setFill( GO_UI_curPStonePiece.getFill() == 'white' ? 'black' : 'white'); 
    GO_UI_CurTurnLayer.draw();
  }

  return valid;
}

function updateBoard( brdArray ){
  //We will update the backend array to match the current array we are on
  //We assume the arrays are the same size
  
  var max,i;
  var deadPieces = [];
  max = brdArray.length;
  
  for( i = 0 ; i < max ; i++ ){
    //This case happens only when a piece is removed due to a capture
    if ( GO_UI_stoneBoard[i].color != brdArray[i] ){
      //Animation options here

      if ( GO_UI_ANIM ){
        GO_UI_stoneBoard[i].color = 0;
        deadPieces.push(i);
         /*
         temp     = GO_UI_stoneBoard[i];

         tempAnim.start();
         */
      }
      else{
        GO_UI_stoneBoard[i].color = 0;
        GO_UI_stoneBoard[i].setOpacity(0.0);
      }
    }
  }

  if ( deadPieces.length > 0 )
    drawBoardFade(deadPieces);
  
};

function drawBoardFade( deadPieces ){
  //This creates the "fade" effect for all pieces captured

  if( deadPieces.length == 0 )
    return;

  var temp;
  var i,max,anim;
  max = deadPieces.length;

  GO_UI_FadeLayer.removeChildren();
  GO_UI_FadeLayer.setOpacity(1.0);
  GO_UI_brdLayer.draw();

  for( i = 0 ; i < max ; i++ ){
    temp = GO_UI_stoneBoard[deadPieces[i]];
    GO_UI_FadeLayer.add( new Kinetic.Circle({
      x:           temp.getX(),
      y:           temp.getY(),
      radius:      temp.getRadius(),
      fill:        temp.getFill(),
      opacity:     1,
      stroke:      'black',
      strokeWidth: 2
    }));
    temp.setOpacity(0.0);
  }
  /*
  for( i = 0 ; i < max ; i++ )
    GO_UI_stoneBoard[deadPieces[i]].setOpacity(0.0);
   */

  GO_UI_brdLayer.draw();

  anim = new Kinetic.Animation(function(frame) {
    GO_UI_FadeLayer.setOpacity( 1 - (frame.time/captureFade) );
    if ( frame.time >= captureFade ){
      this.stop();
      frame.time = 0;
      GO_UI_FadeLayer.setOpacity(0.0);
      GO_UI_FadeLayer.removeChildren();
      GO_UI_FadeLayer.draw();
    }
  }, GO_UI_FadeLayer);

  anim.start();
}

function drawMainMenu( menuLayer ){
  //Draw Box
  menuLayer.add( new Kinetic.Rect({
    x:            50,
    y:            50,
    width:        500,
    height:       500,
    stroke:       'black',
    opacity:      0.8,
    strokeWidth:  3,
    fill:         '#999', //Update color
    cornerRadius: 50,
  }));

}

function drawUI( brdLayer, UILayer, CurTurnLayer ){
  //Creates the full UI

  drawColumnUI( UILayer );
  drawPStoneUI( CurTurnLayer );

  //Start initial animation or correct initial color
  if ( GO_UI_ANIM )
    GO_UI_curPStoneAnim.start();
  else
    GO_UI_curPStonePiece.setFill('white');

  //Draw the Actual GO Board
  GO_UI_stoneBoard = createBoard( brdLayer,100,100,500,8);
}

function WriteMsg( _layer, msg ){
  //This is a message function to send messages to the screen
  //(Current use GO_UI_DEBUGGING)

  var context = _layer.getContext();
  _layer.clear();

  context.font      = '18pt Calibri';
  context.fillStyle = 'black';
  context.fillText(msg, 100, 30);
}

function externWriteMsg( msg ){
  //This is a message function to send messages to the screen
  //(Current use GO_UI_DEBUGGING)

  var context = GO_UI_msgLayer.getContext();
  GO_UI_msgLayer.clear();

  context.font      = '18pt Calibri';
  context.fillStyle = 'black';
  context.fillText(msg, 100, 30);
}

function externCreateBoard( div ){
  GO_UI_brdLayer.removeChildren();
  GO_UI_brdLayer.draw();
  GO_UI_stoneBoard = createBoard( GO_UI_brdLayer, 100,100,500,div);
}

function startAfterFade(){
}

function externStartUI(){
  //Add our full UI
  drawUI( GO_UI_brdLayer, GO_UI_UILayer, GO_UI_CurTurnLayer );

  //Add the layers to the GO_UI_stage
  //Remember first add is the lowest layer
  GO_UI_stage.add(GO_UI_msgLayer);
  GO_UI_stage.add(GO_UI_UILayer);
  GO_UI_stage.add(GO_UI_brdLayer);
  GO_UI_stage.add(GO_UI_FadeLayer);
  GO_UI_stage.add(GO_UI_CurTurnLayer);
  
  if ( GO_UI_ANIM ){
    GO_UI_stage.setOpacity(0.0);
    (new Kinetic.Animation(function(frame) {
       GO_UI_stage.setOpacity( (frame.time/1000) );
       if ( frame.time >= 1000 ){
         GO_UI_stage.setOpacity(1.0);
         this.stop();
         frame.time = 0;
         startAfterFade();
       }
     }, GO_UI_stage)).start();
   }
   else
     startAfterFade();
  
}
