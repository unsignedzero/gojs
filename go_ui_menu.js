/*Go board
 *Created by = David Tran 
 *on 01-11-2013
 *Version 0.6.2.0
 *Last modified 01-11-2013
 */

//////////////////////////////////////////////////////////////////////////////

var GO_MENU_DEBUG = false;

var GO_MENU_Stage = new Kinetic.Stage({
  container: 'container',
  width:  800,
  height: 700
});

var GO_MENU_textLayer = new Kinetic.Layer();
var GO_MENU_backLayer = new Kinetic.Layer();

function drawBackground( _layer ){
  //Draws the static background for the menu
  
  //Draw Static Box
  _layer.add( new Kinetic.Rect({
    x:           0,
    y:           0,
    width:       GO_MENU_Stage.getWidth(),
    height:      GO_MENU_Stage.getHeight(),
    
    stroke:      'black',
    strokeWidth: 2,
    //fill:        'grey',
    cornerRadius: 50,
    
    fillLinearGradientStartPoint: [ GO_MENU_Stage.getWidth(),  GO_MENU_Stage.getHeight()],
    fillLinearGradientEndPoint:   [-GO_MENU_Stage.getWidth(), -GO_MENU_Stage.getHeight()],
    fillLinearGradientColorStops: [0.0, '#333', 0.5, '#BBB'],
  }));

   _layer.draw();

}

function drawText( _layer, _string, _x, _y, _size ){

  _layer.add( new Kinetic.Text({
    x:          _x,
    y:          _y, 
    text:       _string,
    fontSize:   _size,
    fontFamily: 'Calibri',
    textFill:   'black',
    fill:       'black',
  }));
}

function externStartMenu(){
  
  //Adds and starts our menu
  
  drawBackground(GO_MENU_backLayer);
  drawText(GO_MENU_backLayer,"The game",200,200,30);
  GO_MENU_Stage.add(GO_MENU_backLayer);
}

externStartMenu();