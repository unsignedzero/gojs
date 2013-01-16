//Main for the GO Game
  
//Check if the backend exists
if ( ( ZX_Board == undefined ) ||
     ( typeof(ZX_Board) != 'function') 
   ){
  alert("GO backend does not exist. Halting Execution.");
  throw new Error("go_engine.js missing");
}
else if ( GO_UI_DEBUG ){
  GO_UI_backendGOBoard.draw();
}

//Check if we can draw
if ( ( externStartUI == undefined ) ||
     ( typeof(externStartUI) != 'function') ){ 
  alert("GO frontend does not exist. Halting Execution.");
  throw new Error("go_ui.js missing");
}

externStartUI();
