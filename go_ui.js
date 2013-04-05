/*Created by David Tran (unsignedzero)
 *on 1-3-2013
 *Version 0.7.3.0
 *Last modified 04-05-2013
 *This code draws an interactive GO board on the screen
 *allowing two users to play the game
 */

//Remember to "refresh" a layer ONCE
//any change or made

//WARNING setOpacity explicit wants a float type. Feeding it an int, makes it do nothing
//ZIndex must be non-negative

var zxGoUI = (function(){ 

  var DEBUG = false,
      ANIM  = true,
      BIG   = false;

  if(isMobile()){
    ANIM = false;
  }

//////////////////////////////////////////////////////////////////////////////

  //Specifies whose turn it is by the piece that needs to be played
  var curPTurn = 0,
  //Contains the current Player's stone in the upper left
      curPStonePiece,
  //Links to the animation for the above stone
      curPStoneAnim,
  //Array of UI board pieces
      stoneBoard,
  //Stores the backend Go Board from the engine
      backendGOBoard,
  //Cursor for GO Game
      cursor,
      cursorAnim,

  //GO Status Object
      statusObj = [],

  //GO Pause Button
      PauseButton,
      PauseBack,

  //clock Object
      clock,

  //Animation Values
      captureFade = 500,
  //Shrike Animation
      shrinkAnim;

  var stage = new Kinetic.Stage({
    container: 'container',
    width:  800,
    height: 700
  });

  var scorePage    = new Kinetic.Layer(),
      newGamePage  = new Kinetic.Layer(),
      pausePage    = new Kinetic.Layer(),

      cursorLayer  = new Kinetic.Layer(),
      brdLayer     = new Kinetic.Layer(),
      msgLayer     = new Kinetic.Layer({
        listening: false
  }),
      UILayer      = new Kinetic.Layer(),
      fadeLayer    = new Kinetic.Layer({
        listening: false
  }),
      curTurnLayer = new Kinetic.Layer(),

      devNullLayer = new Kinetic.Layer({
        listening: false
  });
  
/////////////////////////////////////////////////////////////////////////////
//Miscellaneous Functions

  function clearLayer(localLayer){
    //Here we clear the layer of everything
    //(Note:To remove one node (graphic element) use the method remove
    localLayer.removeChildren();
  }

////////////////////////////////////////////////////////////////////////////
//Code to create and support the GO Grid
 
  function createBoard(boardOption, localX, localy){
    //Here we create the GO Board itself
    var brdLayer   = boardOption['brdLayer'],
        sideLength = 500 + boardOption['addx'],
        div        = boardOption['div'],

        interfaceArray;

    backendGOBoard = new zxGoBoard(div+1,boardOption['MODE']);
    drawGOBoard(                 brdLayer,localX,localy,sideLength,div);
    interfaceArray = layGoStones(brdLayer,localX,localy,sideLength,div);

    drawCursor(cursorLayer , sideLength , div);
    return interfaceArray;
  }
 
  function drawGOBoard(localLayer, localX, localy, drawSize, div){
    //Draws the GO Board Background and the labels
    //In this function, div is the number of divisions one would see
    //so div 8 yields a 9x9 board (there are 8x8 squares)
    
    var fontSize    = 14,
        fontXShift  = -5,    //Sets the relative hor shift
        fontYShift  = -50,   //Sets the position away from the board
        i,j, tempPos, radius,
        border, delta;

  /////Draw Grid
    localLayer.add(new Kinetic.Rect({
      x:           localX,
      y:           localy,
      width:       drawSize,
      height:      drawSize,
      stroke:      'black',
      strokeWidth: 2
    }));

    i = 0;
    while(i < div){
      //We cache the position of each hor/vert piece below
      tempPos = Math.floor(i * drawSize / div);

      //Horizontal Text
      localLayer.add(new Kinetic.Text({
          x:          localX + fontXShift + tempPos,
          y:          localy + fontYShift, 
          text:       i+1,
          fontSize:   fontSize,
          fontFamily: 'Calibri',
          Fill:       'black'
        }));
      
      //Horizontal Line
      localLayer.add(new Kinetic.Line({
        points:       [localX,localy+tempPos,localX+drawSize,localy+tempPos],
        stroke:       '#000',
        strokeWidth:  2,
        lineCap:      'butt'
      }));

      //Vertical Text
      localLayer.add(new Kinetic.Text({
          x:          localX + fontYShift,
          y:          localy + fontXShift + tempPos, 
          text:       i+1,
          fontSize:   fontSize,
          fontFamily: 'Calibri',
          Fill:       'black'
        }));

      //Vertical Line
      localLayer.add(new Kinetic.Line({
        points:       [localX+tempPos,localy,localX+tempPos,localy+drawSize],
        stroke:       '#000',
        strokeWidth:  2,
        lineCap:      'butt'
      }));
      i += 1;
    }

    //"Last" Numbers
    //Horizontal Text
    localLayer.add(new Kinetic.Text({
        x:          localX + fontXShift + drawSize,
        y:          localy + fontYShift, 
        text:       div+1,
        fontSize:   fontSize,
        fontFamily: 'Calibri',
        Fill:       'black'
      }));

    //Vertical Text
    localLayer.add(new Kinetic.Text({
        x:          localX + fontYShift,
        y:          localy + fontXShift + drawSize,
        text:       div+1,
        fontSize:   fontSize,
        fontFamily: 'Calibri',
        Fill:       'black'
      }));

  /////Draws the extra dots on the board(reference points)
    radius = drawSize / 100 + 1;

    //Is this even?
    if(div & 1 ^ 1){
      //Case 1 the board is smaller than 8x8, 
      //Only possible thing is to draw the center

      if(div < 8)  
        localLayer.add(new Kinetic.Circle({
          x:           localX + (drawSize>>1),
          y:           localy + (drawSize>>1),
          radius:      radius,
          fill:        'black',
          stroke:      'black',
          strokeWidth:  2
        }));
      //Case 2
      //At this point we will always draw 3x3 set of dots
      //For 10x10 and 8x8 the outer ring will have a 2 piece gap to the edge
      //For all other cases, we draw the outer ring with 3 piece gap

      else if(div >= 8){
        border = div >= 12 ? 3 : 2;
        delta  = (div>>1) - border;
        for(i = 0 ; i <= 2 ; i++){
          for(j = 0 ; j <= 2 ; j++)
            localLayer.add(new Kinetic.Circle({
              x:           localX + Math.floor((border + i * delta) * drawSize / div),
              y:           localy + Math.floor((border + j * delta) * drawSize / div),
              radius:      radius,
              fill:        'black',
              stroke:      'black',
              strokeWidth:  2
            }));
        }
      }
    }
    //If not even and 7x7 or larger
    else if(div >= 7){
      //Here we draw the four corners that are diagonally 2 pieces gap
      //from the edge for 7x7, 9x9 and 11x11 and 3 otherwise

      border = div >= 12 ? 3 : 2;
      delta = div - (border<<1);

      for(i = 0 ; i <= 1 ; i++){
        for(j = 0 ; j <= 1 ; j++)
          localLayer.add(new Kinetic.Circle({
            x:           localX + Math.floor((border + i * delta) * drawSize / div),
            y:           localy + Math.floor((border + j * delta) * drawSize / div),
            radius:      radius,
            fill:        'black',
            stroke:      'black',
            strokeWidth:  2
          }));
      }
    }
  }

  function layGoStones(localLayer, localX, localy, drawSize, div){
    //This function takes the same args are drawGOBoard
    //and creates the "interactive" clickable area (possible stone position)

    var i,griddrawSize = ((div+1)*(div+1)),
        divnew         = div+1,
        radius         = Math.floor(drawSize / 25 * 8/div) + 1,
        interfaceArray = [],
        temp;

    if(!BIG && radius > 23) 
      radius = 23;

    //Creates the clickable areas for the stones on the board
    i = 0;
    while(i < griddrawSize){
      temp = new Kinetic.Circle({
        x:           localX + Math.floor((i % divnew) * drawSize / div),
        y:           localy + Math.floor(Math.floor(i / divnew) * drawSize / div),
        radius:      radius,
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
      //CLICK
      temp.on('mousedown dbltap', function() {
        if(this.getOpacity() === 0){

          if(checkValidMove(this.posID, curPTurn + 1)){
            this.setOpacity(1.0);

            updateCursor(this.getX(),this.getY());

            //this.setFill(this.getFill() === 'white' ? 'black' : 'white');
            if(curPTurn === 0){
              curPTurn = 1;
              this.setFill('white');
              this.color = 1;
            }
            else{
              curPTurn = 0;
              this.setFill('black');
              this.color = 2;
            }

            //Don't forget to redraw to show changes!
            localLayer.draw();
          }
          /*
          else{
            //BAD MOVE
          }
          */
        }

        if(DEBUG)
          WriteMsg(msgLayer, this.posID);
      });

      interfaceArray.push(temp);
      localLayer.add(temp);
      i += 1;
    }
    return interfaceArray;
  }

  function updateBoard(brdArray){
    //We will update the backend array to match the current array we are on
    //We assume the arrays are the same size
    
    var max,i,
        deadPieces = [];
    max = brdArray.length;
    
    i = 0;
    while(i < max){
      //This case happens only when a piece is removed due to a capture
      if(stoneBoard[i].color !== brdArray[i]){
        //Animation options here

        if(ANIM){
          stoneBoard[i].color = 0;
          deadPieces.push(i);
           /*
           temp     = stoneBoard[i];

           tempAnim.start();
           */
        }
        else{
          stoneBoard[i].color = 0;
          stoneBoard[i].setOpacity(0.0);
        }
      }
      i += 1;
    }

    if(deadPieces.length > 0)
      drawBoardFade(deadPieces);
    
  }
  
  function drawBoardFade(deadPieces){
    //This creates the "fade" effect for all pieces captured
    var temp, i,max,anim;

    if(deadPieces.length === 0)
      return;

    max = deadPieces.length;

    fadeLayer.removeChildren();
    fadeLayer.setOpacity(1.0);
    brdLayer.draw();

    i = 0;
    while(i < max){
      temp = stoneBoard[deadPieces.pop()];
      fadeLayer.add(new Kinetic.Circle({
        x:           temp.getX(),
        y:           temp.getY(),
        radius:      temp.getRadius(),
        fill:        temp.getFill(),
        opacity:     1,
        stroke:      'black',
        strokeWidth: 2
      }));
      temp.setOpacity(0.0);
      i += 1;
    }
    
    brdLayer.draw();

    anim = new Kinetic.Animation(function(frame) {
      fadeLayer.setOpacity(1 - (frame.time/captureFade));
      if(frame.time >= captureFade){
        anim.stop();
        frame.time = 0;
        fadeLayer.setOpacity(0.0);
        fadeLayer.removeChildren();
        fadeLayer.draw();
      }
    }, fadeLayer);

    anim.start();
  }

  function updateBoardFin(brdArray){
    //We will update the backend array to match the final array we are on
    //We will clean the original array in the next call
    //We assume the arrays are the same size
    
    var max, i,
        deadPieces      = [],
        terrorityPieces = [];
        
    max = brdArray.length;
    
    i = 0;
    while(i < max){
      if(stoneBoard[i].color)
        deadPieces.push(i);
      else{
        terrorityPieces.push([i,brdArray[i]]);
      }
      i += 1;
    }

    drawBoardFadeFin(deadPieces,terrorityPieces);
  }

  function drawBoardFadeFin(deadPieces, terrorityPieces){
    //This draws the final grid, with territories shown as squares
    //This applies even without animation!

    var temp, pos, i, j, max, anim;

    fadeLayer.removeChildren();
    fadeLayer.setOpacity(0.0);
    brdLayer.draw();
    
    max = deadPieces.length;

    i = 0;
    while(i < max){
      temp = stoneBoard[deadPieces.pop()];
      fadeLayer.add(new Kinetic.Circle({
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
      i += 1;
    }
    
    max = terrorityPieces.length;
    
    i = 0;
    while(i < max){
      pos  = terrorityPieces.pop();
      j = pos.pop();
      temp = stoneBoard[pos.pop()];
      
      fadeLayer.add(new Kinetic.Rect({
        x:           temp.getX(),
        y:           temp.getY(),
        width:       temp.getRadius()<<1,
        height:      temp.getRadius()<<1,
        offset:      [temp.getRadius(),temp.getRadius()],
        fill:        j === 1 ? 'white': (j === 2 ? 'black' : "grey"),
        opacity:     1,
        stroke:      'black',
        strokeWidth: 2
      }));
      //temp.setOpacity(0.0);
      i += 1;
    }

    fadeLayer.draw();
    brdLayer.draw();
    if(ANIM){
      anim = new Kinetic.Animation(function(frame) {
        fadeLayer.setOpacity(frame.time/captureFade);
        if(frame.time >= captureFade){
          anim.stop();
          frame.time = 0;
          fadeLayer.setOpacity(1.0);
        }
      }, fadeLayer);

      anim.start();
    }
    else{
      fadeLayer.setOpacity(1.0);
      fadeLayer.draw();
    }
     
  }
/////////////////////////////////////////////////////////////////////////////
//Code to create the cursor
  function drawCursor(localLayer , drawSize , div){
    //Creates the cursor
    
    var sideLength = (Math.floor(drawSize / 25 * 8/div)<<1) + 3,
        localX     = 48,
        localy     = 48;

    if(!BIG && sideLength > 47)
      sideLength = 47;
    
    localLayer.setOpacity(0.0);

    cursor =  new Kinetic.Rect({
      x:           localX,
      y:           localy,
      width:       sideLength,
      height:      sideLength,
      stroke:      'red',
      offset:      [sideLength>>1,sideLength>>1],
      fill:        '#777',
      opacity:     0.5,
      strokeWidth: 2
    });
 
    if(ANIM){
      cursorAnim = new Kinetic.Animation(function(frame){
        if(frame.time > 0){
          anim.stop();
          frame.time = 0;
        }
      }, cursorLayer);
      cursorAnim.stop();
    }
    else{
      cursorAnim            = {};
      cursorAnim.frame      = {};
      cursorAnim.frame.time = 0;
    }
 
    cursor.on('mousedown dbltap', function() {
      if(cursorAnim.frame.time === 0)
        passTurn();
    });

    localLayer.add(cursor);
    
    cursor.origX = localX;
    cursor.origY = localy;

  }

  function updateCursor(localX , localy){
    //Moves the cursor to the right position, via anim, or just "jump"
    var curX   = cursor.getX(),
        curY   = cursor.getY(),
        deltaX = localX-curX,
        deltaY = localy-curY;

    if(ANIM){

      cursorAnim.stop();

      cursorAnim = new Kinetic.Animation(function(frame) {
        cursor.setX(Math.floor(curX + deltaX*(frame.time/1000)));
        cursor.setY(Math.floor(curY + deltaY*(frame.time/1000)));
        if(frame.time >= 1000){
          cursorAnim.stop();
          frame.time = 0;
          cursorAnim.stop();
          cursor.setX(localX);
          cursor.setY(localy);
        }
      },cursorLayer);

      cursorAnim.start();
    }
    else{
      cursor.setX(localX);
      cursor.setY(localy);
      cursorLayer.draw();
    }
  }

/////////////////////////////////////////////////////////////////////////////
//Update State Column
  function updateColumnUI(){
    //Updates the canvas, as needed then starts the animation
    if ( !shrinkAnim.fade )
      stage.setWidth(800);
    shrinkAnim.start();
  }

//Code to create and update the extra UI
  function drawPStoneUI(curTurnLayer){
  /////Draw Upper Left UI Element (player counter)
    // This IS a hard coded position

    var scale, temp = new Kinetic.Rect({
      x:            45,
      y:            10,
      width:        70,
      height:       70,
      stroke:       'black',
      strokeWidth:  2,
      fill:         '#999',
      cornerRadius: 32
    });

    temp.setOffset({
      x: temp.getWidth()>>1
    });

    //Click event for the "grey" back
    temp.on('mousedown touchmove', function(){
      });

    curTurnLayer.add(temp);

    curPStonePiece = new Kinetic.Circle({
      stroke:      'black',
      x:           45,
      y:           45,
      radius:      30,
      stroke:      'black',
      strokeWidth: 2,
      fill:        'gray'
    });

    curPStoneAnim = new Kinetic.Animation(function(frame) {
      //Creates the "flip" animation for the stone piece
      scale = Math.cos((frame.time*2) * Math.PI /2000);

      curPStonePiece.setScale(1,scale);
      if(frame.time >1000){
        frame.time = 0;
        curPStonePiece.setScale(1,1);
        curPStoneAnim.half = false;
        curPStoneAnim.stop();
      }
      else if(frame.time > 500){
        if(curPStoneAnim.half === false){
          curPStoneAnim.half = true;
          curPStonePiece.setFill(curPStonePiece.getFill() === 'white' ? 'black' : 'white'); 
        }
      }
    }, curTurnLayer);

    curPStoneAnim.half = false;
    curPStoneAnim.half = false;
    
    curPStonePiece.hasPassed = false;

    //Creates the animation for clicking the piece in the upper left
    //This will fade (in and out) the right column UI if ANIM is true
    //else instantly change it
    curPStonePiece.on('mousedown tap', function(){
      //Case A we use animation to make it work
      if(ANIM){
        shrinkAnim = new Kinetic.Animation(function(frame) {
          if(shrinkAnim.fade){
            UILayer.setOpacity(1 - (frame.time/200));
            if(frame.time >= 200){
              shrinkAnim.stop();
              stage.setWidth(626);
              frame.time = 0;
              shrinkAnim.fade = false;
            }
          }
          else{
            UILayer.setOpacity(frame.time/200);
            if(frame.time >= 200){
              shrinkAnim.stop();
              frame.time = 0;
              shrinkAnim.fade = true;
            }
          }
        }, UILayer);
   
        shrinkAnim.fade = stage.getWidth() < 630 ? false : true;

        updateColumnUI();
      }
      //Case B no ANIM
      else{
        if(stage.getWidth() < 630){
          UILayer.setOpacity(1.0);
          UILayer.draw();
          stage.setWidth(800);
        }
        else{
          UILayer.setOpacity(0.0);
          UILayer.draw();
          stage.setWidth(620);
        }
      }
    });

    curTurnLayer.add(curPStonePiece);
  }

  function updatePStoneUI(curTurnLayer){
    //Changes the color piece in the PStoneUI
    
    if(ANIM){

      curPStoneAnim.stop();

      //Solves really fast clicks problem
      curPStonePiece.setFill(curPTurn === 1 ? 'black' : 'white');

      curPStoneAnim.frame.time = 0;
      curPStoneAnim.half = false;
    
      curPStoneAnim.start();
    }
    else{
      curPStonePiece.setFill(curPStonePiece.getFill() === 'white' ? 'black' : 'white'); 
      curTurnLayer.draw();
    }
  }
  
  function drawColumnUI(UILayer , shiftx, shifty, scaley){
   //Draws the right column UI (for future use) and other non-board UI
    var localX, localy, width, height, font, fontSize, radius,
        stonePad, textPad, statusy,
        turnBoxSize, temp,
        curY, i, maxi, j, maxj,

    localX      = 630 + (shiftx === undefined ? 0 : shiftx);
    localy      =  20 + (shifty === undefined ? 0 : shifty);
    width       = 160;
    height      = 560;
    font        = 'Calibri';
    fontSize    = 20;
    turnBoxSize = 140;

    //Status Var
    radius      = 20;
    stonePad    = 10;
    textPad     = 5;
    statusY     = height*0.15;
    curY        = 0;

    //Draw Right Column UI Element
    UILayer.add(new Kinetic.Rect({
      x:           localX,
      y:           localy,
      width:       width,
      height:      height,
      stroke:      'black',
      strokeWidth: 2
    }));

    //Creates the Status Box
    maxi = 2;
    for(i = 0 ; i < maxi ; i++){

       temp = new Kinetic.Text({
        x:           localX + (width>>1),
        y:           localy + statusY + curY + textPad,
        text:        i ? 'Captured' : 'Remaining',
        fontSize:    fontSize + 6,
        font:        font,
        Fill:       'black'
      });
      
      temp.setOffset({
        x: temp.getWidth()>>1
      });

      statusObj.push(temp);

      curY += textPad;
      
      statusObj.push(new Kinetic.Rect({
        x:           localX,
        y:           localy + statusY + curY - textPad,
        width:       width,
        height:      (textPad<<1) + fontSize,
        stroke:      'black',
        strokeWidth: 2
      })); 
      
      curY += fontSize + textPad;

      maxj = 2;
      for(j = 0 ; j < maxj ; j++){
        statusObj.push(new Kinetic.Circle({
          x:           localX + radius + stonePad,
          y:           localy + radius + stonePad + statusY + curY,
          radius:      radius,
          fill:        j ? 'black' : 'white',
          stroke:      'black',
          strokeWidth: 2
        })); 

        statusObj.push(new Kinetic.Text({
          x:           localX + radius + stonePad + textPad + radius,
          y:           localy + ((radius)>>1) + stonePad + statusY + curY - 3,
          text:        '0',
          fontSize:    fontSize + 12,
          font:        font,
          Fill:       'black'
        })); 

        statusObj.push(new Kinetic.Rect({
          x:           localX,
          y:           localy + statusY + curY,
          width:       width,
          height:      (radius+stonePad)<<1,
          stroke:      'black',
          strokeWidth: 2
        })); 

        curY += (radius+stonePad)<<1;
      }
    }

    maxi = statusObj.length;

    i = 0;
    while(i < maxi){
      UILayer.add(statusObj[i]);
      i += 1;
    }
   
    //Create Text
    temp = new Kinetic.Text({
      x:           localX + (width>>1),
      y:           localy + 20,
      text:        'Go Game',
      fontSize:    fontSize + 6,
      font:        font,
      Fill:       'black'
    });

    //Aligns the text in the center. >>1 is /2 in this case
    temp.setOffset({
      x: (temp.getWidth()>>1)
    });

    UILayer.add(temp);

    //Create Turn Counter
    temp = new Kinetic.Text({
      x:           localX + (width>>1),
      y:           localy + height - turnBoxSize - (turnBoxSize>>3),
      text:        'Turn',
      fontSize:    fontSize + 4,
      font:        font,
      Fill:       'black',
      textColor:  'black'
    });

    temp.setOffset({
      x: temp.getWidth()>>1
    });

    UILayer.add(temp);

    temp = new Kinetic.Rect({
      x:           localX + (width>>1),
      y:           localy + height - turnBoxSize + (turnBoxSize>>3),
      width:       turnBoxSize - (turnBoxSize>>2),
      height:      turnBoxSize - (turnBoxSize>>2),
      stroke:      'black',
      strokeWidth: 1
    });

    temp.setOffset({
      x: temp.getWidth()>>1
    });

    UILayer.add(temp);
  }

  function updateStats(stoneCount){
    //Updatse the right column stats
    statusObj[14].setText(stoneCount.pop());
    statusObj[11].setText(stoneCount.pop());
    statusObj[ 6].setText(stoneCount.pop());
    statusObj[ 3].setText(stoneCount.pop());
  }
  
/////////////////////////////////////////////////////////////////////////////
//Board actions
  function passTurn(){
    var finalBoard, score, tempoutput;
    //Allows players to pass a turn
    
    //Check if this is the end
    if(curPStonePiece.hasPassed){
      
      //Prompt for end game?

      //Cover Board area (to hide changes)

      //End game calculations
      score = backendGOBoard.endGame();
      
      finalBoard = score[1];
      score      = score[0];

      //Update Board (to show territory)
      updateBoardFin(finalBoard);

      /*
      //Fade Layer?
      if(ANIM){
      }

      //Show stats and ask for new game?
      if(ANIM){
      }
      */

      //TEMP OUTPUT
      tempoutput = "Game time: " + (clock.frame.time/1000) + "s | " +
                   "White:" + score[0] + " Black:" + score[1];
      externWriteMsg(tempoutput);
      
      //Reset the clock (will be completed later)
      clock.stop();
      clock.frame.time = 0;
      clock.start();
      
      loadPauseScreen();

      backendGOBoard.hasPassed = false;

      //Reset Screen

    }
    else
      curPStonePiece.hasPassed = true;

    //Prompt it?

    //Redraw Stone
    updatePStoneUI(curTurnLayer);
    
    curPTurn ^=1;
  }

  function checkValidMove(pos, colorid){
    //Checks IF the click is valid and PStoneUI, as needed
    var i, max, valid = true;
    
    //Call code to check
    valid = backendGOBoard.isValidMove(pos, colorid);
    
    if(!valid)
      return false;
      
    curPStonePiece.hasPassed = false;

    //Update grid
    stoneBoard[pos].color = colorid;

    updateBoard(backendGOBoard.curState());

    updatePStoneUI(curTurnLayer);

    //Update Stone Count
    updateStats(backendGOBoard.stoneCount());

    UILayer.draw();

    return valid;
  }

  function cleaningGame(){
    //Resets game for next "round"
    var boardAnim;

    if(ANIM){
      boardAnim = new Kinetic.Animation(function(frame){
        fadeLayer.setOpacity(1 - (frame.time/2000));
        if(frame.time>= 2000){
          boardAnim.stop();
          frame.time = 0;
          fadeLayer.setOpacity(0.0);
          fadeLayer.removeChildren();
        }
      },fadeLayer);
      
      boardAnim.start();
    }
    else{
      fadeLayer.setOpacity(0.0);
      fadeLayer.removeChildren();
      fadeLayer.draw();
    }
     
    //Move Cursor
    updateCursor(cursor.origX,cursor.origY);
    
    //Erase Msg
    ClearMsg(msgLayer);
    
    //Reset Stats
    updateStats(backendGOBoard.stoneCount());
    
    //Update Turn Counter
    if(curPTurn !== 0){
      updatePStoneUI(curTurnLayer);
      curPTurn = 0;
    }
  }
  
/////////////////////////////////////////////////////////////////////////////
//Foreground Events
  function createBGLayer(width, height, Border){
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
      cornerRadius:  20
    }));
  }

  function drawScorePage(scorePage){
    //Will eventually create the score page
    scorePage.setOpacity(0.0);
  }

  function drawSetupPage(newGamePage){
    //Will eventually create the new game page
    newGamePage.setOpacity(0.0);
  
    var Border = 5,
        width  = stage.getWidth() - (Border<<1),
        height = 640 - (Border << 2),
        temp, BGLayer, font, fontSize, radius,
        stonePad, textPad, statusy;

    font        = 'Calibri';
    fontSize    =  20;

    //Status Var
    radius      =  20;
    stonePad    =  10;
    textPad     =  5;
    statusY     =  height*0.15;
    
    //Background
    BGLayer = createBGLayer(width, height, Border);

    newGamePage.add(BGLayer);

    temp = new Kinetic.Text({
      x:             width<<1,
      y:             40,
      fill:          'black',
      shadowColor:   'white',
      shadowBlur:    2,
      shadowOpacity: 1,

      font:          font,
      fontSize:      fontSize,
      text:          "Setup Page"
    });

    temp.setOffset({
      x:   temp.getWidth()>>1
    });

    newGamePage.add(temp);
    
  }

  function drawPauseScreen(pauseLayer){
    //Builds the initial invisible pause screen
    pauseLayer.setOpacity(0.0);
    
    var Border = 5,
        width         = stage.getWidth() - (Border<<1),
        height        = 640 - (Border<<2),
        unpauselocaly = 60,
        temp, box;

    PauseBack = createBGLayer(width, height, Border);
    
    pauseLayer.add(PauseBack);
    
    temp = new Kinetic.Text({
      x:             width>>1,
      y:             height>>1,
      fill:          'black',
      shadowColor:   'white',
      shadowBlur:    2,
      shadowOpacity: 1,
      
      fontSize:      60,
      font:          'Calibri',
      text:          'Another game?'
    });
    
    temp.setOffset({
      x:   temp.getWidth()>>1,
      y:   temp.getHeight()>>1
    });
    
    pauseLayer.add(temp);
    
    temp = new Kinetic.Text({
      x:             width>>1,
      y:             unpauselocaly+(height>>1),
      fill:          'black',
      shadowColor:   'white',
      shadowBlur:    2,
      shadowOpacity: 1,
      
      fontSize:      40,
      font:          'Calibri',
      text:          'Yes'
    });

    temp.setOffset({
      x:   temp.getWidth()>>1,
      y:   temp.getHeight()>>1
    });
    
    PauseButton = new Kinetic.Rect({
      x:             width>>1,
      y:             unpauselocaly+(height>>1),
      stroke:        '#222',
      strokeWidth:   5,
      width:         10+temp.getWidth(),
      height:        10+temp.getHeight(),
      shadowColor:   'black',
      shadowBlur:    10,
      shadowOpacity: 1,
      cornerRadius:  10
    });

    PauseButton.inAnim = ANIM;
    
    PauseButton.setOffset({
      x:   PauseButton.getWidth()>>1,
      y:   PauseButton.getHeight()>>1
    });
    
    PauseButton.on('mouseover', function(){
      if(ANIM && !PauseButton.inAnim){
        PauseButton.setStroke("#ddd");
        pauseLayer.draw();
      }
    });
    
    PauseButton.on('mouseout', function(){
      if(ANIM && !PauseButton.inAnim){
        PauseButton.setStroke("#222");
        pauseLayer.draw();
      }
    });
    
    PauseButton.on('mousedown tap', function(){
      if(ANIM && !PauseButton.inAnim){
        PauseButton.inAnim = true;
        (function (){
          var ptr;
          ptr = new Kinetic.Animation(function(frame){
            pauseLayer.setOpacity(1 - (frame.time/2000));
            if(frame.time>= 2000){
              pauseLayer.setZIndex(0);
              ptr.stop();
              pauseLayer.setOpacity(0.0);
              afterFadePauseScreen();
            }
          },pauseLayer);
          ptr.start();
        })();
      }
      else if(!ANIM) {
        pauseLayer.setZIndex(0);
        pauseLayer.setOpacity(0.0);
        pauseLayer.draw();
        afterFadePauseScreen();
      }
    });
    
    pauseLayer.add(temp);
    pauseLayer.add(PauseButton);
    pauseLayer.setZIndex(0);

  }

  function loadPauseScreen(){
    //Fades in the pause screen page, or instantly draws it
    
    PauseBack.setWidth(stage.getWidth()-10);
    pausePage.setZIndex(50);
    pausePage.setOpacity(0.0);
    
    if(ANIM){
      (function (){
        var ptr = new Kinetic.Animation(function(frame){
          pausePage.setOpacity(frame.time/2000);
          if(frame.time>= 2000){
            ptr.stop();
            pausePage.setOpacity(1.0);
            frame.time = 0;
            PauseButton.inAnim = false;
          }
        },pausePage);
       ptr.start();
     })();
    }
    else{
      pausePage.setOpacity(1.0);
      pausePage.draw();
    }
  }

  function afterFadePauseScreen(){
    //Extra event after the "exiting" animation for the pause
    cleaningGame();
  }

/////////////////////////////////////////////////////////////////////////////
//Background Events
  function setBackground(){
    //Here we set up all miscellaneous/background work
    //that will be done for the game

    //Setup clock
    //frame.time increases per millisecond
    var hour = 1000*60*60;

    clock = new Kinetic.Animation(function(frame){
      if(frame.time >= hour)
        frame.time = 0;
    }, devNullLayer);

    clock.start();
  }

///////////////////////////////////////////////////////////////////////////// 
//"Main" Functions
  function drawUI(boardOption){
    //Creates the full UI

    drawColumnUI(boardOption['UILayer'] , boardOption['addx'], 0, boardOption['addy']);
    drawPStoneUI(boardOption['curTurnLayer']);

    //Start initial animation or correct initial color
    if(ANIM)
      curPStoneAnim.start();
    else
      curPStonePiece.setFill('white');

    //Draw the Actual GO Board
    stoneBoard = createBoard(boardOption,100,100);
  }

  function WriteMsg(localLayer, msg){
    //This is a message function to send messages to the screen

    var context = localLayer.getContext();
    localLayer.clear();

    context.font      = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(msg, 100, 30);
  }
  
  function ClearMsg(localLayer){
    //This clears the message
    
    var context = localLayer.getContext();
    localLayer.clear();
  }

  function startAfterFade(){
    //After the fade-in animation is completed what do we do
    cursorLayer.setOpacity(1.0);
    drawPauseScreen(pausePage);
  }

///////////////////////////////////////////////////////////////////////////// 
//Extern Functions
//These functions preform the work someone outside requested
  function externWriteMsg(msg){
    //This is a message function to send messages to the screen

    var context = msgLayer.getContext();
    msgLayer.clear();

    context.font      = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(msg, 100, 30);
  }

  function externCreateBoard(div, MODE){
    //Creates the new board, NOT TESTED
    backendGOBoard.resizeBoard(div);
    brdLayer.removeChildren();
    brdLayer.draw();
    stoneBoard = createBoard({'brdLayer':brdLayer, 'addx':0, 'addy':0, 'div':div}
      , 100,100);
  }

  function externStartUI(boardOption){
    //Check for mobile and resize as needed
    var addx, addy, temp;

    if(BIG){
      addx = 1500;
      addy = 1500;
      stage.setWidth(stage.getWidth()+addx);
      stage.setHeight(stage.getHeight()+addy);
      ANIM = false;
    }
    else{
      addx = 0;
      addy = 0;
    }

    //Add to our board option
    boardOption.addx         = addx;
    boardOption,addy         = addy;
    boardOption.brdLayer     = brdLayer;
    boardOption.UILayer      = UILayer;
    boardOption.curTurnLayer = curTurnLayer;

    //Add our full UI
    drawUI(boardOption);

    //Startup Background Work
    setBackground();

    //Set initial stone count
    updateStats(backendGOBoard.stoneCount());

    //Add the layers to the stage
    //Remember the first layer added IS the lowest layer
    
    stage.add(pausePage);
    stage.add(newGamePage);
    stage.add(scorePage);

    stage.add(msgLayer);

    if(!BIG)
      stage.add(UILayer);
    
    stage.add(brdLayer);
    stage.add(fadeLayer);
    stage.add(cursorLayer);
    
    if(!BIG)
      stage.add(curTurnLayer);

    if(ANIM){
      stage.setOpacity(0.0);
      (function (){
        var ptr = new Kinetic.Animation(function(frame) {
           stage.setOpacity((frame.time/1000));
           if(frame.time >= 1000){
             stage.setOpacity(1.0);
             ptr.stop();
             startAfterFade();
           }
         }, stage);
         ptr.start();
       })();
      
     }
     else
       startAfterFade();
    
  }

///////////////////////////////////////////////////////////////////////////// 
//Extern Wrapper Call
//These functions filter the input so extern calls are successful
  this.WriteMsg = function (msg){
    //What is the max length?
    externWriteMsg(msg);
  };

  this.CreateBoard = function(div, MODE){
    //Filters div count and mode
    if(div > 4){
      if(div < 24){
        if(MODE === undefined)
          externCreateBoard(div , 1);
        else
          externCreateBoard(div , MODE);
        }
      else
        WriteMsg(msgLayer, "CreateBoard called. Too many divs");
    }
    else
      WriteMsg(msgLayer, "CreateBoard called. Too few divs"); 
  };

  this.StartUI = function(div, MODE){
    //Filters div count and mode
    if(div  === undefined || div < 4 || div > 24)
      div  = 8;
    if(MODE === undefined)
      MODE = 3;

    //Starts up our UI
    externStartUI({div:div, MODE:MODE});
  };
  
  //Public Methods
  return{
    StartUI     : StartUI,
    WriteMsg    : WriteMsg,
    CreateBoard : CreateBoard
  };
  
})();

