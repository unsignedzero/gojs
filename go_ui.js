/*Created by David Tran (unsignedzero) twice
 *on 1-3-2013
 *Version 0.7.0.0
 *Last modified 01-20-2013
 *This code draws an interactive GO board on the screen
 *allowing two users to play the game
 */

//Remember to "refresh" a layer ONCE
//any change or made

//WARNING setOpacity explicit wants a float type. Feeding it an int, makes it do nothing
//ZIndex must be non-negative

var ZX_GO_UI = (function(){

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
  //Cursor for GO Game
  var GO_UI_cursor;
  var GO_UI_cursorAnim;

  //GO Status Object
  var GO_UI_statusObj = [];

  //GO Pause Button
  var GO_UI_PauseButton;
  var GO_UI_PauseBack;

  //Clock Object
  var GO_UI_Clock;

  //Animation Values
  var captureFade = 500;

  var GO_UI_stage = new Kinetic.Stage({
    container: 'container',
    width:  800,
    height: 700
  });

  var GO_UI_scorePage    = new Kinetic.Layer();
  var GO_UI_newGamePage  = new Kinetic.Layer();
  var GO_UI_pausePage    = new Kinetic.Layer();

  var GO_UI_cursorLayer  = new Kinetic.Layer();
  var GO_UI_brdLayer     = new Kinetic.Layer();
  var GO_UI_msgLayer     = new Kinetic.Layer();
  var GO_UI_UILayer      = new Kinetic.Layer();
  var GO_UI_FadeLayer    = new Kinetic.Layer();
  var GO_UI_CurTurnLayer = new Kinetic.Layer();

  var GO_UI_devNullLayer = new Kinetic.Layer();
  
/////////////////////////////////////////////////////////////////////////////
//Miscellaneous Functions

  function clearLayer( _layer ){
    //Here we clear the layer of everything
    //(Note:To remove one node (graphic element) use the method remove
    _layer.removeChildren();
  };

/////////////////////////////////////////////////////////////////////////////
//Code to create and support the GO Grid
 
  function createBoard( brdLayer, _x, _y, sideLength, div ){
    //Here we create the GO Board itself

    var interfaceArray;
    GO_UI_backendGOBoard = new ZX_GO_Board(div+1,1);
    drawGOBoard(                 brdLayer,_x,_y,sideLength,div);
    interfaceArray = layGoStones(brdLayer,_x,_y,sideLength,div);

    drawCursor( GO_UI_cursorLayer , sideLength , div );
    return interfaceArray;
  };
 
  function drawGOBoard( _layer, _x, _y, _size, div){
    //Draws the GO Board Background and the labels
    //In this function, div is the number of divisions one would see
    //so div 8 yields a 9x9 board (there are 8x8 squares)
    
    var _fontSize    = 14;
    var _fontXShift  = -5;    //Sets the relative hor shift
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
  };

  function layGoStones( _layer, _x, _y, _size, div ){
    //This function takes the same args are drawGOBoard
    //and creates the "interactive" clickable area (possible stone position)

    var i,_grid_size   = ((div+1)*(div+1));
    var div_new        =   div+1;
    //var _radius        = Math.floor(_size / 25 ) + 1;
    var _radius        = Math.floor(_size / 25 * 8/div) + 1;
    var interfaceArray = [];
    var temp;

    if ( !isMobile() && _radius > 23 ) 
      _radius = 23;

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
      temp.on('mousedown dbltap', function() {
        if (this.getOpacity() == 0 ){

          if ( checkValidMove(this.posID, GO_UI_curPTurn + 1 ) ){
            this.setOpacity(1);

            updateCursor(this.getX(),this.getY());

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
  };

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
      temp = GO_UI_stoneBoard[deadPieces.pop()];
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
  };

  function updateBoardFin( brdArray ){
    //We will update the backend array to match the final array we are on
    //We will clean the original array in the next call
    //We assume the arrays are the same size
    
    var max,i;
    var deadPieces           = [];
    var terrorityPieces      = [];
    max = brdArray.length;
    
    for( i = 0 ; i < max ; i++ ){
      if ( GO_UI_stoneBoard[i].color )
        deadPieces.push(i);
      else{
        terrorityPieces.push([i,brdArray[i]]);
      }
    }

    drawBoardFadeFin(deadPieces,terrorityPieces);
    
  };

  function drawBoardFadeFin( deadPieces, terrorityPieces ){
    //This draws the final grid, with territories shown as squares
    //This applies even without animation!

    var temp, pos;
    var i,j,max,anim;

    GO_UI_FadeLayer.removeChildren();
    GO_UI_FadeLayer.setOpacity(0.0);
    GO_UI_brdLayer.draw();
    
    max = deadPieces.length;

    for( i = 0 ; i < max ; i++ ){
      temp = GO_UI_stoneBoard[deadPieces.pop()];
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
      temp.color = 0;
    }
    
    max = terrorityPieces.length;
    
    for( i = 0 ; i < max ; i++ ){
      pos  = terrorityPieces.pop();
      j = pos.pop();
      temp = GO_UI_stoneBoard[pos.pop()];
      
      GO_UI_FadeLayer.add( new Kinetic.Rect({
        x:           temp.getX(),
        y:           temp.getY(),
        width:       temp.getRadius()<<1,
        height:      temp.getRadius()<<1,
        offset:      [temp.getRadius(),temp.getRadius()],
        fill:        j == 1 ? 'white': ( j == 2 ? 'black' : "grey" ),
        opacity:     1,
        stroke:      'black',
        strokeWidth: 2
      }));
      //temp.setOpacity(0.0);
    }

    GO_UI_FadeLayer.draw();
    GO_UI_brdLayer.draw();
    if ( GO_UI_ANIM ){
      anim = new Kinetic.Animation(function(frame) {
        GO_UI_FadeLayer.setOpacity( frame.time/captureFade );
        if ( frame.time >= captureFade ){
          this.stop();
          frame.time = 0;
          GO_UI_FadeLayer.setOpacity(1.0);
        }
      }, GO_UI_FadeLayer);

      anim.start();
    }
    else{
      GO_UI_FadeLayer.setOpacity(1.0);
      GO_UI_FadeLayer.draw();
    }
     
  };
/////////////////////////////////////////////////////////////////////////////
//Code to create the cursor
  function drawCursor( _layer , _size , div ){
    //Creates the cursor
    
    var sideLength  =  (Math.floor(_size / 25 * 8/div)<<1) + 3;
    
    if ( !isMobile() && sideLength > 47 )
      sideLength = 47;
    
    var _x = 48;
    var _y = 48;
    
    _layer.setOpacity(0.0);

    GO_UI_cursor =  new Kinetic.Rect({
      x:           _x,
      y:           _y,
      width:       sideLength,
      height:      sideLength,
      stroke:      'red',
      offset:      [sideLength>>1,sideLength>>1],
      fill:        '#777',
      opacity:     0.5,
      strokeWidth: 2,
    });
 
    if ( GO_UI_ANIM ){
      GO_UI_cursorAnim = new Kinetic.Animation(function(frame){
        if ( frame.time > 0 ){
          this.stop();
          frame.time = 0;
        }
      }, GO_UI_cursorLayer);
      GO_UI_cursorAnim.stop();
    }
    else{
      GO_UI_cursorAnim            = {};
      GO_UI_cursorAnim.frame      = {};
      GO_UI_cursorAnim.frame.time = 0;
    }
 
    GO_UI_cursor.on('mousedown dbltap', function() {
      if ( GO_UI_cursorAnim.frame.time == 0 )
        passTurn();
    });

    _layer.add( GO_UI_cursor );
    
    GO_UI_cursor.origX = _x;
    GO_UI_cursor.origY = _y;

  };

  function updateCursor( _x , _y ){
    //Moves the cursor to the right position, via anim, or just "jump"
    var curX   = GO_UI_cursor.getX();
    var curY   = GO_UI_cursor.getY();

    if ( GO_UI_ANIM ){
      var deltaX = _x-curX;
      var deltaY = _y-curY;

      GO_UI_cursorAnim.stop();

      GO_UI_cursorAnim = new Kinetic.Animation(function(frame) {
        GO_UI_cursor.setX( Math.floor(curX + deltaX*(frame.time/1000)));
        GO_UI_cursor.setY( Math.floor(curY + deltaY*(frame.time/1000)));
        if( frame.time >= 1000 ){
          GO_UI_cursorAnim.stop();
          frame.time = 0;
          this.stop();
          GO_UI_cursor.setX( _x );
          GO_UI_cursor.setY( _y );
        }
      },GO_UI_cursorLayer);

      GO_UI_cursorAnim.start();
    }
    else{
      GO_UI_cursor.setX( _x );
      GO_UI_cursor.setY( _y );
      GO_UI_cursorLayer.draw();
    }
  };

/////////////////////////////////////////////////////////////////////////////
//Code to create and update the extra UI
  function drawPStoneUI( CurTurnLayer ){
  /////Draw Upper Left UI Element (player counter)
    // This IS a hard coded position

    var temp = new Kinetic.Rect({
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
    temp.on( 'mousedown touchmove', function(){
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
      /*
      ZX_BOARD_DEBUG = ZX_BOARD_DEBUG ? false : true;
      externWriteMsg( "DEBUG STATUS: " + ZX_BOARD_DEBUG );
       */
     //loadPauseScreen();
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
    
    GO_UI_curPStonePiece.hasPassed = false;

    //Creates the animation for clicking the piece in the upper left
    //This will fade (in and out) the right column UI if GO_UI_ANIM is true
    //else instantly change it
    GO_UI_curPStonePiece.on('mousedown tap', function(){
      //Case A we use animation to make it work
      if ( GO_UI_ANIM ){
        var UI_shrink = new Kinetic.Animation(function(frame) {
          if ( UI_shrink.fade ){
            GO_UI_UILayer.setOpacity( 1 - (frame.time/200) );
            if ( frame.time >= 200 ){
              this.stop();
              GO_UI_stage.setWidth(626);
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
   
        UI_shrink.fade = GO_UI_stage.getWidth() < 630 ? false : true;

        UI_shrink.start();
      }
      //Case B no GO_UI_ANIM
      else{
        if( GO_UI_stage.getWidth() < 630 ){
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
  };

  function updatePStoneUI( CurTurnLayer ){
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
      CurTurnLayer.draw();
    }
  };
  
  function drawColumnUI( UILayer , shiftx, shifty, scaley){
   //Draws the right column UI (for future use) and other non-board UI
    var _x, _y, _width, _height, _font, _fontSize, _radius;
    var _stonePad, _textPad, _statusy;
    var _turnBoxSize;
    var temp;
    var curY;
    var i, max, j, max_j;

    _x           = 630 + (shiftx == undefined ? 0 : shiftx);
    _y           =  20 + (shifty == undefined ? 0 : shifty);
    _width       = 160;
    _height      = 560;
    _font        = 'Calibri';
    _fontSize    =  20;
    _turnBoxSize = 140;

    //Status Var
    _radius      =  20;
    _stonePad    =  10;
    _textPad     =  5;
    _statusY     =  _height*0.15;
    curY         =   0;

  /////Draw Right Column UI Element
    UILayer.add( new Kinetic.Rect({
      x:           _x,
      y:           _y,
      width:       _width,
      height:      _height,
      stroke:      'black',
      strokeWidth: 2
    }));

    //Creates the Status Box
    max = 2;
    for( i = 0 ; i < max ; i++ ){

       temp = new Kinetic.Text({
        x:           _x + (_width>>1),
        y:           _y + _statusY + curY + _textPad,
        text:        i ? 'Captured' : 'Remaining',
        fontSize:    _fontSize + 6,
        font:        _font,
        Fill:       'black',
      });
      
      temp.setOffset({
        x: temp.getWidth()>>1,
      });

      GO_UI_statusObj.push(temp);

      curY += _textPad;
      
      GO_UI_statusObj.push( new Kinetic.Rect({
        x:           _x,
        y:           _y + _statusY + curY - _textPad,
        width:       _width,
        height:      (_textPad<<1) + _fontSize,
        stroke:      'black',
        strokeWidth: 2
      })); 
      
      curY += _fontSize + _textPad;

      max_j = 2;
      for( j = 0 ; j < max_j ; j++ ){
        GO_UI_statusObj.push( new Kinetic.Circle({
          x:           _x + _radius + _stonePad,
          y:           _y + _radius + _stonePad + _statusY + curY,
          radius:      _radius,
          fill:        j ? 'black' : 'white',
          stroke:      'black',
          strokeWidth: 2
        })); 

        GO_UI_statusObj.push( new Kinetic.Text({
          x:           _x + _radius + _stonePad + _textPad + _radius,
          y:           _y + ((_radius)>>1) + _stonePad + _statusY + curY - 3,
          text:        '0',
          fontSize:    _fontSize + 12,
          font:        _font,
          Fill:       'black',
        })); 

        GO_UI_statusObj.push( new Kinetic.Rect({
          x:           _x,
          y:           _y + _statusY + curY,
          width:       _width,
          height:      ( _radius+_stonePad)<<1,
          stroke:      'black',
          strokeWidth: 2
        })); 

        curY += (_radius+_stonePad)<<1;
      }
    }

    max = GO_UI_statusObj.length;
    for( i = 0 ; i < max ; i++)
      UILayer.add( GO_UI_statusObj[i] );
   
    //Create Text
    temp = new Kinetic.Text({
      x:           _x + (_width>>1),
      y:           _y + 20,
      text:        'Go Game',
      fontSize:    _fontSize + 6,
      font:        _font,
      Fill:       'black',
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
  };

  function updateStats( stoneCount ){
    //Updatse the right column stats
    GO_UI_statusObj[14].setText(stoneCount.pop());
    GO_UI_statusObj[11].setText(stoneCount.pop());
    GO_UI_statusObj[ 6].setText(stoneCount.pop());
    GO_UI_statusObj[ 3].setText(stoneCount.pop());
  }
  
/////////////////////////////////////////////////////////////////////////////
//Board actions
  function passTurn(){
    var finalBoard;
    //Allows players to pass a turn
    
    //Check if this is the end
    if ( GO_UI_curPStonePiece.hasPassed ){
      
      //Prompt for end game?

      //Cover Board area (to hide changes)

      //End game calculations
      var score = GO_UI_backendGOBoard.endGame( );
      
      finalBoard = score[1];
      score      = score[0];

      //Update Board (to show territory)
      updateBoardFin(finalBoard);

      //Fade Layer?
      if ( GO_UI_ANIM ){
        
      }
      else{
      }

      //Show stats and ask for new game?
      if ( GO_UI_ANIM ){
      }
      else{
      }

      //TEMP OUTPUT
      var temp_output = "Game time: " + (GO_UI_Clock.frame.time/1000) + "s | ";
      temp_output += "White:" + score[0] + " Black:" + score[1];
      externWriteMsg(temp_output);
      
      //Reset the clock (will be completed later)
      GO_UI_Clock.stop();
      GO_UI_Clock.frame.time = 0;
      GO_UI_Clock.start();
      
      loadPauseScreen();

      GO_UI_backendGOBoard.hasPassed = false;

      //Reset Screen

    }
    else
      GO_UI_curPStonePiece.hasPassed = true;

    //Prompt it?

    //Redraw Stone
    updatePStoneUI( GO_UI_CurTurnLayer );
    
    GO_UI_curPTurn ^=1;
  };

  function checkValidMove( pos, color_id ){
    //Checks IF the click is valid and PStoneUI, as needed
    var stoneCount;
    var i, max;
    var valid = true;
    
    //Call code to check
    valid = GO_UI_backendGOBoard.isValidMove(pos, color_id);
    
    if ( !valid )
      return false;
      
    GO_UI_curPStonePiece.hasPassed = false;

    //Update grid
    GO_UI_stoneBoard[pos].color = color_id;

    updateBoard(GO_UI_backendGOBoard.curState());

    updatePStoneUI( GO_UI_CurTurnLayer );

    //Update Stone Count
    stoneCount = GO_UI_backendGOBoard.stoneCount();

    updateStats( stoneCount );

    /*
      //Run this to find out which entries contain text
      max = GO_UI_statusObj.length;
      for( i = 0 ; i < max ; i++ ){
        try{
          GO_UI_statusObj[ i ].setText(i);
        }
        catch( error ){}
      }
     */

    GO_UI_UILayer.draw();

    return valid;
  };

  function cleaningGame(){
    //Resets game for next "round"
    var boardAnim;
    if ( GO_UI_ANIM ){
      boardAnim = new Kinetic.Animation(function(frame){
        GO_UI_FadeLayer.setOpacity( 1 - (frame.time/2000) );
        if ( frame.time>= 2000 ){
          this.stop();
          frame.time = 0;
          GO_UI_FadeLayer.setOpacity(0.0);
          GO_UI_FadeLayer.removeChildren();
        }
      },GO_UI_FadeLayer);
      
      boardAnim.start();
    }
    else{
      GO_UI_FadeLayer.setOpacity(0.0);
      GO_UI_FadeLayer.removeChildren();
      GO_UI_FadeLayer.draw();
    }
     
    //Move Cursor
    updateCursor(GO_UI_cursor.origX,GO_UI_cursor.origY);
    
    //Erase Msg
    ClearMsg( GO_UI_msgLayer );
    
    //Reset Stats
    updateStats( [0,0,0,0] );
    
    //Update Turn Counter
    if ( GO_UI_curPTurn != 0 ){
      updatePStoneUI( GO_UI_CurTurnLayer );
      GO_UI_curPTurn = 0;
    }
  };
  
/////////////////////////////////////////////////////////////////////////////
//Foreground Events
  function createBGLayer( width, height, Border ){
    //Creates a rectangle for the background
    
    return (new Kinetic.Rect({
      x:             Border,
      y:             Border,
      width:         width,
      height:        height,
      stroke:        '#666',
      strokeWidth:   Border,
      fill:          '#888',
      opacity:       0.5,
      cornerRadius:  20,
    }));
  };

  function drawScorePage( scorePage ){
    //Will eventually create the score page
    scorePage.setOpacity(0.0);
  };

  function drawSetupPage( newGamePage ){
    //Will eventually create the new game page
    newGamePage.setOpacity(0.0);
  
    var Border = 5;

    var width  = GO_UI_stage.getWidth() - (Border<<1);
    var height = 640 - ( Border << 2 );
    var temp, BGLayer;
  
    var _font, _fontSize, _radius;
    var _stonePad, _textPad, _statusy;

    _font        = 'Calibri';
    _fontSize    =  20;

    //Status Var
    _radius      =  20;
    _stonePad    =  10;
    _textPad     =  5;
    _statusY     =  _height*0.15;
    
    //Background
    BGLayer = createBGLayer( width, height, Border );

    newGamePage.add(BGLayer);

    temp = new Kinetic.Text({
      x:             width<<1,
      y:             40,
      fill:          'black',
      shadowColor:   'white',
      shadowBlur:    2,
      shadowOpacity: 1,

      font:          _font,
      fontSize:      _fontSize,
      text:          "Setup Page",
    });

    temp.setOffset({
      x:   temp.getWidth()>>1,
    });

    newGamePage.add(temp);
    
  };

  function drawPauseScreen( pauseLayer ){
    //Builds the initial invisible pause screen
    pauseLayer.setOpacity(0.0);
    
    var Border = 5;
    
    var width  = GO_UI_stage.getWidth() - (Border<<1);
    var height    = 640 - (Border<<2);
    var unpause_y = 60;  
    var temp;
    var box;

    GO_UI_PauseBack = createBGLayer( width, height, Border );
    
    pauseLayer.add(GO_UI_PauseBack);
    
    temp = new Kinetic.Text({
      x:             width>>1,
      y:             height>>1,
      fill:          'black',
      shadowColor:   'white',
      shadowBlur:    2,
      shadowOpacity: 1,
      
      fontSize:      60,
      font:          'Calibri',
      text:          'Another game?',
    });
    
    temp.setOffset({
      x:   temp.getWidth()>>1,
      y:   temp.getHeight()>>1
    });
    
    pauseLayer.add(temp);
    
    temp = new Kinetic.Text({
      x:             width>>1,
      y:             unpause_y+(height>>1),
      fill:          'black',
      shadowColor:   'white',
      shadowBlur:    2,
      shadowOpacity: 1,
      
      fontSize:      40,
      font:          'Calibri',
      text:          'Yes',
    });

    temp.setOffset({
      x:   temp.getWidth()>>1,
      y:   temp.getHeight()>>1
    });
    
    GO_UI_PauseButton = new Kinetic.Rect({
      x:            width>>1,
      y:            unpause_y+(height>>1),
      stroke:       '#222',
      strokeWidth:   5,
      width:         10+temp.getWidth(),
      height:        10+temp.getHeight(),
      shadowColor:   'black',
      shadowBlur:    10,
      shadowOpacity: 1,
      cornerRadius:  10
    });

    GO_UI_PauseButton.inAnim = GO_UI_ANIM;
    
    GO_UI_PauseButton.setOffset({
      x:   GO_UI_PauseButton.getWidth()>>1,
      y:   GO_UI_PauseButton.getHeight()>>1
    });
    
    GO_UI_PauseButton.on('mouseover', function(){
      if ( GO_UI_ANIM && !GO_UI_PauseButton.inAnim ){
        GO_UI_PauseButton.setStroke("#ddd");
        pauseLayer.draw();
      }
    });
    
    GO_UI_PauseButton.on('mouseout', function(){
      if ( GO_UI_ANIM && !GO_UI_PauseButton.inAnim ){
        GO_UI_PauseButton.setStroke("#222");
        pauseLayer.draw();
      }
    });
    
    GO_UI_PauseButton.on('mousedown tap', function(){
      if ( GO_UI_ANIM && !GO_UI_PauseButton.inAnim ){
        GO_UI_PauseButton.inAnim = true;
        (new Kinetic.Animation(function(frame){
          pauseLayer.setOpacity( 1 - (frame.time/2000) );
          if ( frame.time>= 2000 ){
            pauseLayer.setZIndex(0);
            this.stop();
            pauseLayer.setOpacity(0.0);
            afterFadePauseScreen();
          }
        },pauseLayer)).start();
      }
      else if ( !GO_UI_ANIM ) {
        pauseLayer.setZIndex(0);
        pauseLayer.setOpacity(0.0);
        pauseLayer.draw();
        afterFadePauseScreen();
      }
    });
    
    pauseLayer.add(temp);
    pauseLayer.add(GO_UI_PauseButton);
    pauseLayer.setZIndex(0);

  };

  function loadPauseScreen(){
    //Fades in the pause screen page, or instantly draws it
    
    GO_UI_PauseBack.setWidth(GO_UI_stage.getWidth()-10);
    GO_UI_pausePage.setZIndex(50);
    GO_UI_pausePage.setOpacity(0.0);
    
    if ( GO_UI_ANIM ){  
      (new Kinetic.Animation(function(frame){
        GO_UI_pausePage.setOpacity( frame.time/2000 );
        if ( frame.time>= 2000 ){
          this.stop();
          GO_UI_pausePage.setOpacity(1.0);
          frame.time = 0;
          GO_UI_PauseButton.inAnim = false;
        }
      },GO_UI_pausePage)).start();
    }
    else{
      GO_UI_pausePage.setOpacity(1.0);
      GO_UI_pausePage.draw();
    }
  };

  function afterFadePauseScreen(){
    //Extra event after the "exiting" animation for the pause
    cleaningGame();
  };

/////////////////////////////////////////////////////////////////////////////
//Background Events
  function setBackground(){
    //Here we set up all miscellaneous/background work
    //that will be done for the game

    //Setup Clock
    //frame.time increases per millisecond
    var hour = 1000*60*60;

    GO_UI_Clock = new Kinetic.Animation( function(frame){
      if ( frame.time >= hour )
        frame.time = 0;
    }, GO_UI_devNullLayer);

    GO_UI_Clock.start();
  };

///////////////////////////////////////////////////////////////////////////// 
//"Main" Functions
  function drawUI( brdLayer, UILayer, CurTurnLayer ,addx , addy){
    //Creates the full UI

    drawColumnUI( UILayer , addx, 0, addy);
    drawPStoneUI( CurTurnLayer );

    //Start initial animation or correct initial color
    if ( GO_UI_ANIM )
      GO_UI_curPStoneAnim.start();
    else
      GO_UI_curPStonePiece.setFill('white');

    //Draw the Actual GO Board
    GO_UI_stoneBoard = createBoard( brdLayer,100,100,500+addx,8);
  };

  function WriteMsg( _layer, msg ){
    //This is a message function to send messages to the screen

    var context = _layer.getContext();
    _layer.clear();

    context.font      = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(msg, 100, 30);
  };
  
  function ClearMsg( _layer ){
    //This clears the message
    
    var context = _layer.getContext();
    _layer.clear();
  };

  function startAfterFade(){
    //After the fade-in animation is completed what do we do
    GO_UI_cursorLayer.setOpacity(1.0);
    drawPauseScreen(GO_UI_pausePage);
  };

///////////////////////////////////////////////////////////////////////////// 
//Extern Functions
//These functions preform the work someone outside requested
  function externWriteMsg( msg ){
    //This is a message function to send messages to the screen

    var context = GO_UI_msgLayer.getContext();
    GO_UI_msgLayer.clear();

    context.font      = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(msg, 100, 30);
  };

  function externCreateBoard( div, MODE ){
    //Creates the new board, NOT TESTED
    //GO_UI_backendGOBoard = new ZX_GO_Board(div+1,1);
    GO_UI_backendGOBoard.resizeBoard(div);
    GO_UI_brdLayer.removeChildren();
    GO_UI_brdLayer.draw();
    GO_UI_stoneBoard = createBoard( GO_UI_brdLayer, 100,100,500,div);
  };

  function externStartUI(){
    //Check for mobile and resize as needed
    var addx, addy;

    if ( isMobile() ){
      addx = 1500;
      addy = 1500;
      GO_UI_stage.setWidth(GO_UI_stage.getWidth()+addx);
      GO_UI_stage.setHeight(GO_UI_stage.getHeight()+addy);
      GO_UI_ANIM = false;
    }
    else{
      addx = 0;
      addy = 0;
    }
    //Add our full UI
    drawUI( GO_UI_brdLayer, GO_UI_UILayer, GO_UI_CurTurnLayer ,
            addx , addy);

    //Startup Background Work
    setBackground();

    //Add the layers to the GO_UI_stage
    //Remember the first layer added IS the lowest layer
    
    GO_UI_stage.add(GO_UI_pausePage);
    GO_UI_stage.add(GO_UI_newGamePage);
    GO_UI_stage.add(GO_UI_scorePage);

    GO_UI_stage.add(GO_UI_msgLayer);
    if ( !isMobile() )
      GO_UI_stage.add(GO_UI_UILayer);
    
    GO_UI_stage.add(GO_UI_brdLayer);
    GO_UI_stage.add(GO_UI_FadeLayer);
    GO_UI_stage.add(GO_UI_cursorLayer);
    
    if ( !isMobile() )
      GO_UI_stage.add(GO_UI_CurTurnLayer);
    
    if ( GO_UI_ANIM ){
      GO_UI_stage.setOpacity(0.0);
      (new Kinetic.Animation(function(frame) {
         GO_UI_stage.setOpacity( (frame.time/1000) );
         if ( frame.time >= 1000 ){
           GO_UI_stage.setOpacity(1.0);
           this.stop();
           startAfterFade();
         }
       }, GO_UI_stage)).start();
     }
     else
       startAfterFade();
    
  };

///////////////////////////////////////////////////////////////////////////// 
//Extern Wrapper Call
//These functions filter the input so extern calls are successful
  this.WriteMsg = function ( msg ){
    //What is the max length?
    externWriteMsg(msg);
  };

  this.CreateBoard = function( div, MODE ){
    //Filters div count and mode
    if ( div > 4 ){
      if ( div < 24 ){
        if ( MODE == undefined )
          externCreateBoard(div , 1);
        else
          externCreateBoard(div , MODE);
        }
      else
        WriteMsg(GO_UI_msgLayer, "CreateBoard called. Too many divs" );
    }
    else
      WriteMsg(GO_UI_msgLayer, "CreateBoard called. Too few divs" ); 
  };

  this.StartUI = function(){
    //Starts up our UI
    externStartUI();
  };
  
  //Public Methods
  return{
    StartUI     : StartUI,
    WriteMsg    : WriteMsg,
    CreateBoard : CreateBoard
  };
  
})();

