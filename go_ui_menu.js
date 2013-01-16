/*Go board
 *Created by = David Tran 
 *on 01-11-2013
 *Version 0.6.4.1
 *Last modified 01-15-2013
 */

//////////////////////////////////////////////////////////////////////////////

var GO_MENU_DEBUG = false;

var GO_MENU_Stage = new Kinetic.Stage({
  container: 'container',
  width:  800,
  height: 700
});

var GO_MENU_textLayer  = new Kinetic.Layer();
var GO_MENU_stoneLayer = new Kinetic.Layer();
var GO_MENU_backLayer  = new Kinetic.Layer();

function drawBackground( _layer ){
  //Draws the static background for the menu
  
  //Draw Static Box
  _layer.add( new Kinetic.Rect({
    x:           50,
    y:           50,
    width:       GO_MENU_Stage.getWidth()  - 100,
    height:      GO_MENU_Stage.getHeight() - 100,
    
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

  var temp;
  temp = new Kinetic.Text({
    x:             _x,
    y:             _y, 
    text:          _string,
    fontSize:      _size,
    fontFamily:    'Calibri',

    shadowColor:   'white',
    shadowOpacity:  1.0,

    fill:           'black',

  });

  temp.setOffset({
    x: temp.getWidth()>>1
  });

  _layer.add(temp);
}

function createOptions( _layer , _x, _y, _string ){
  var temp;
  var _radius = 30;

  temp = new Kinetic.Circle({
    stroke:      'black',
    x:           _x,
    y:           _y,
    radius:      _radius,
    stroke:      'black',
    strokeWidth: 2,
    fill:        'white',
  });

  temp.on( 'mousedown' , function(){
    this.setFill('black');
    _layer.draw();
  });

  temp.on( 'mouseover' , function(){
    this.setFill('grey');
    _layer.draw();
  });

  temp.on( 'mouseup' , function(){
    this.setFill('white');
    _layer.draw();
  });
  
  temp.on( 'mouseout' , function(){
    this.setFill('white');
    _layer.draw();
  });

  _layer.add(temp);

  temp = new Kinetic.Text({
    x:             _x + 50,
    y:             _y - (_radius>>1), 
    text:          _string,
    fontSize:      30,
    fontFamily:    'Calibri',

    shadowColor:   'black',
    shadowOpacity:  1.0,

    fill:          'white',

  });
 
  _layer.add(temp);

}

function YinYang( _layer ){
  var temp;

  temp = new Kinetic.Shape({
    drawFunc: function(canvas) {
      var context = canvas.getContext();
      context.beginPath();
      context.closePath();
      canvas.fillStroke(this);
    },
    stroke: 'black',
    strokeWidth: 4
  });

  _layer.add(temp);
}

function externStartMenu(){
  
  //Adds and starts our menu
  drawBackground(GO_MENU_backLayer);
  drawText(GO_MENU_backLayer,"----GO----",400,80,40);
  createOptions(GO_MENU_backLayer,400,300,"Single Player");
  createOptions(GO_MENU_backLayer,400,400,"Multi Player");
  GO_MENU_Stage.add(GO_MENU_backLayer);
}

externStartMenu();
