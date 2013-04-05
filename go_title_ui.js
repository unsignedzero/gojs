/*Created by David Tran (unsignedzero)
 *on 1-13-2013
 *Version 0.7.3.0
 *Last modified 04-05-2013
 *This code creates the interactive go Title
 */

zxGoTitle = function(canvasName, width, height){

  var padding = 20;

  function drawCircleTitle(localLayer, x, y, radius){

    var defaultSpinAnim;
    var yinYangStartAnim,yinYangEndAnim;
    var to_end;
    var mouse_on;

    to_end = false;
    mouse_on = false;

     x += radius;
     y += radius;

    var bendValue = radius*240/380;

    var arc_end = Math.sin(Math.PI/4);
    var arc_mid = Math.tan(Math.PI/8);

    function drawYinYangShape(x, y, radius){

      function drawOutline(context){
        //Reference
        //http://board.flashkit.com/board/showthread.php?369672-Draw-a-circle-with-quadratic-bezier-curves
        context.beginPath();
        context.moveTo(x+(radius<<1), y+radius);
        context.quadraticCurveTo(
          radius+x+radius,-arc_mid*radius+y+radius,
          arc_end*radius+x+radius,-arc_end*radius+y+radius);
        context.quadraticCurveTo(
          arc_mid*radius+x+radius,        -radius+y+radius,
                         x+radius,        -radius+y+radius);
        context.quadraticCurveTo(
         -arc_mid*radius+x+radius,        -radius+y+radius,
         -arc_end*radius+x+radius,-arc_end*radius+y+radius);
        context.quadraticCurveTo(
                 -radius+x+radius,-arc_mid*radius+y+radius,
                 -radius+x+radius,                y+radius);
        context.bezierCurveTo(
                         (radius>>1)+x,radius+y-bendValue,
           ((radius   )+(radius>>1))+x,radius+y+bendValue,
                         (radius<<1)+x,radius+y);
        context.closePath();
      }

      return new Kinetic.Shape({
      x: x,
      y: y,
      offset: [x+radius,y+radius],
      fill: 'black',

      drawFunc: function(canvas) {
        drawOutline( canvas.getContext() );
        canvas.fillStroke(this);
      },

      drawHitFunc: function(canvas) {
        drawOutline( canvas.getContext() );
        canvas.fillStroke(this);
      }
      });

    }

    var circle_back = drawYinYangShape(x, y, radius);
    var circle      = drawYinYangShape(x, y, radius);

    yinYangStartAnim = (new Kinetic.Animation(function(frame){
        var angleDiff = frame.timeDiff * (Math.PI/2) / 1000;
        circle_back.rotate(angleDiff);
        if ( frame.time >= 2000 ){
          frame.time = 0;
          circle_back.setRotation(circle.getRotation()+Math.PI);
          yinYangStartAnim.stop();
          //CODE for full circle here

          //outline.setFill('black');
          if ( !mouse_on ){
            to_end  = false;
            //outline.setFill('white');
            yinYangEndAnim.start();
          }
          else
            to_end = true;
        }
      },localLayer));

   yinYangEndAnim = (new Kinetic.Animation(function(frame){
        var angleDiff = frame.timeDiff * (Math.PI/2) / 1000;
        circle_back.rotate(angleDiff);
        if ( frame.time >= 2000 ){
          frame.time = 0;
          circle_back.setRotation(circle.getRotation());
          yinYangEndAnim.stop();
          to_end = false;
          }
      },localLayer));

   defaultSpinAnim = (new Kinetic.Animation(function(frame){
        var angleDiff = frame.timeDiff * (Math.PI/2) / 1000;
        circle_back.rotate(angleDiff);
        circle.rotate(angleDiff);
      },localLayer));

    defaultSpinAnim.start();
    var outline = new Kinetic.Circle({
      x: x,
      y: y,
      radius: radius, stroke: 'black', strokeWidth: 2
    });

    outline.on('mouseout touchstart', function(){
      circle.setFill('black');
      circle_back.setFill('black');
      localLayer.draw();

      mouse_on = false;

      defaultSpinAnim.start();
      if ( yinYangStartAnim.frame.time === 0 && yinYangEndAnim.frame.time === 0 && to_end ){
        //outline.setFill('white');
        yinYangEndAnim.start();
      }
    });

    outline.on('mouseover touchmove', function(){
      circle.setFill("#222");
      circle_back.setFill("#222");
      localLayer.draw();

      mouse_on = true;
      defaultSpinAnim.stop();
    });

    outline.on('mousedown tap', function(){
      if ( yinYangStartAnim.frame.time === 0 && yinYangEndAnim.frame.time === 0 && !to_end )
        yinYangStartAnim.start();
    });

    localLayer.add(circle_back);
    localLayer.add(circle);

    localLayer.add(outline);

  }

  function createCanvas(){
    var min = width > height ? height : width;
    min -= 2*padding;

    var stage = new Kinetic.Stage({
      container: canvasName,
      width: width,
      height: height
    });

    var MainLayer = new Kinetic.Layer();

    drawCircleTitle(MainLayer, padding + (width-min-padding)/2,padding + (height-min-padding)/2, min/2);

    stage.add(MainLayer);
  }

  this.setup = function(){
    createCanvas();
  };

};
