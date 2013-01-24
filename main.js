//Main for the GO Game
  
if ( ( zxGoBoard == undefined ) || ( typeof(zxGoBoard) != 'function') ){
  alert("GO backend does not exist. Halting Execution.");
  throw new Error("go_engine.js missing");
}

if ( ( zxGoUI == undefined ) || ( typeof(zxGoUI) != 'object') ){ 
  alert("GO frontend does not exist. Halting Execution.");
  throw new Error("go_ui.js missing");
}

zxGoUI.StartUI();
