// Initializes the board and test it
// Moves executed here may not be legal in a GO game nor fair...
// Created by David Tran (unsignedzero)
// Updated 10-07-2013

"use strict";
var sideLength = 9,
    boardSize = sideLength*sideLength,
    goBoard, go_engine,
    result;

go_engine = require(__dirname + "/../go_engine.js").zxGoBoard;

goBoard = new zxGoBoard(sideLength, 3);

describe("GO_Engine test", function(){

  describe("Calculating gameplay of", function(){

    describe("Placing a piece", function(){
      it("should record a placment on the board", function(){
        // Remember that 0 is empty piece, 1 is white and two is black
        // First arg is position and second arg is color
        expect(goBoard.isValidMove(0*sideLength+1,1)).toBeTruthy();
      });

      it("should not record a placment on the board if there already is a piece there", function(){
        expect(goBoard.isValidMove(0*sideLength+1,2)).toBeFalsy();
      });
    });

    describe("Updating after capture", function(){
      it("should record the removed piece on the board", function(){
        expect(goBoard.isValidMove(0*sideLength+0,2)).toBeTruthy();
        expect(goBoard.isValidMove(1*sideLength+0,1)).toBeTruthy();

        result = goBoard.curState();
        expect(result[0]).toEqual(0);
      });

      it("should prevent the player from susciding for no good reason", function(){
        expect(goBoard.isValidMove(0*sideLength+0,2)).toBeFalsy();
      });

      it("should allow suscide play if it eliminates enemy pieces", function(){
        expect(goBoard.isValidMove(0*sideLength+2,2)).toBeTruthy();
        expect(goBoard.isValidMove(1*sideLength+1,2)).toBeTruthy();
        expect(goBoard.isValidMove(2*sideLength+0,2)).toBeTruthy();
        expect(goBoard.isValidMove(0*sideLength+0,2)).toBeTruthy();

        result = goBoard.curState();
        expect(result[1]).toEqual(0);
        expect(result[sideLength]).toEqual(0);
      });
    });

    describe("Cleaning the board", function(){
    	it("should return an empty board at the end of the game", function(){

    		var i, max = boardSize;

    		goBoard.endGame();

    		result = goBoard.curState();
    		for( i = 0 ; i < boardSize ; i++ ){
    			expect(result[i]).toEqual(0);
        }

      });
    });
  });

  describe("End game calculation of", function(){

    describe("Calculating score of one piece", function(){
      it("should be boardSize-1", function(){

        // This will empty the board regardless of the first spec
      	goBoard.endGame();

        expect(goBoard.isValidMove(0*sideLength+1,1)).toBeTruthy();

        // Return type result
        //  [0] is [ P1Score , P2Score ];
        //  [1] is a 1d array of the board
        result = goBoard.endGame();

        expect(result[0][0]).toEqual(boardSize-1);
        expect(result[0][1]).toEqual(0);
      });
    });

    describe("Calculating score of two pieces", function(){
    	it("should be equal if they are symmetrical", function(){

        expect(goBoard.isValidMove(2*sideLength+2,1)).toBeTruthy();
        expect(goBoard.isValidMove(boardSize-(2*sideLength+2)-1,2)).toBeTruthy();

        result = goBoard.endGame();

        expect(result[0][0]).toEqual(result[0][1]);
        expect(result[0][0]+result[0][1]).toNotEqual(boardSize-3);

      });

    	it("should be not equal if they are not symmetrical", function(){
        expect(goBoard.isValidMove(2*sideLength+2,1)).toBeTruthy();
        expect(goBoard.isValidMove(boardSize-3*sideLength-1,2)).toBeTruthy();

        result = goBoard.endGame();

        expect(result[0][0]).toNotEqual(result[0][1]);
      });
    });
  });
});
