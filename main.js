
externStartUI();

if ( ( GO_UI_backendGOBoard == undefined ) ||
     ( typeof(GO_UI_backendGOBoard.draw) != 'function') 
   )
  alert("GO backend does not exist");
else if ( GO_UI_DEBUG )
  GO_UI_backendGOBoard.draw();
  
