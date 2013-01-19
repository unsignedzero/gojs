//Main for the GO Game
  
if ( ( ZX_GO_Board == undefined ) || ( typeof(ZX_GO_Board) != 'function') ){
  alert("GO backend does not exist. Halting Execution.");
  throw new Error("go_engine.js missing");
}

if ( ( ZX_GO_UI == undefined ) || ( typeof(ZX_GO_UI) != 'object') ){ 
  alert("GO frontend does not exist. Halting Execution.");
  throw new Error("go_ui.js missing");
}

ZX_GO_UI.StartUI();