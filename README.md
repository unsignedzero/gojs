# GO JS #

This code project has two pieces a visual front that is created using
mainly kineticJS and a backend which uses some jQuery. Each end can be used
independently. Together, they allow the user to play Go, currently with
someone else at the same machine. As this is currently a WIP, not all features
that one would except in a GO game are implemented. Please see the TODO List below
for more details.

To run this game on your local system, clone this repo and run start.html.
Included are the necessary libraries to run this. The other HTML files are
incomplete demos.

Created by unsignedzero and started on 12-28-2012 as an idea.

# TO DO #
#### GO UI #

* unpollute General Namespace (DONE)
* Add gradient to the stones for realism (0%)
* Add in-game timer (100%)
* Change Right Column?
* * Add logo?
* * Add Turn Counter? 

#### GO Engine #
* Account for Kos (100%)
* Allow for prisoner exchanges (0%)
* Add end game checker and scoring (DONE)

#### GO Title #
1. Create Menu Outline (DONE)
2. Add to spinner page (DONE)
* Capture clicks
3. Create "hook" for multiplayer?
* unpollute General Namespace
* Create non-anim version

# Version #

#### 0.7.1.0 [01-21-2013] #
* History Added (not used yet)
* KO Support Added
* Spinner tests work on mobile devices now
* Mobile support fixed and working. 
* Added outline for mobile support
* Fixed Permissions so it works on all unix boxes

#### 0.7.0.0 [01-19-2013] #
* Added comment for functions created since 0.6.5.0
* Added "clean up" of each end game so board can be reused
* Bugfix, End-game calculation does NOT loop infinitely due to empty board
* Captured territories now shown as squares, rather than nothing
* Non-anim version of end game working
* Bugfix, Readme corrected syntax issue

#### 0.6.6.0 [01-18-2013] #
* Added scope for the UI
* Bugfix, clock reset after each game.

#### 0.6.5.0 [01-17-2013] #
* Added end-game score calculation into Board Object
* Added passing, as a move option.
* Added in-game clock (accurate to MS)
* UI allows players to pass and can detect end game. (No calculations just yet.)
* Updated README with version printout and changelogs

#### 0.6.4.2 [01-16-2013] #
* Bugfix, Fixed stone resizing so that they don't overlap with the right-column UI when they are too large

#### 0.6.4.1 [01-15-2013] #
* Bugfix, Fixed stone resizing so that it resizing when the grid (in-game board) changes size 
* Bugfix, Changed EOF to UNIX
* Readme Updated. To-do list added and basic abstract added

#### 0.6.4.0 [01-13-2013] #
* Created another spinner test for title mockup (Click Area and "cover" animation
* Bugfix, ZX Board works with chrome again

#### 0.6.3.0 [01-12-2013] #
* Created first spinner test for title mockup (Initial Drawing and click test)
* Created pause page for go ui (future purpose loading?)
* Created cursor tracking the last piece placed
* Created initial README file and added license

#### 0.6.2.0 [01-11-2013] #
* Refactored GO engine using Command Pattern and For loops where possible
* Tested GO Engine for captures
* Posted on GitHub

#### 0.6.1.0 [01-11-2013] #
* Refactored GO engine
* Added comments and created capture code

#### 0.6.0.0 [01-10-2013] #
* Converted GO Engine from a collection of functions to a class

#### 0.5.0.0 [01-09-2013] #
* Added animation for fading pieces for UI
* Tested GO Engine Prototype Code ( clicks match with board object )

#### 0.4.0.0 [01-09-2013] #
* UI works without animation. Animation buggy but working

#### 0.2.0.0 [01-08-2013] #
* Debug msg output built into UI
* Created, but not tested, UI code
* All UI references start with GO UI 
* Renamed GO Board methods for easier understanding
* Removed bad scoring algorithm

#### 0.1.0.0 [01-07-2013] #
* Created prototype GO Engine code (untested)

#### 0.0.0.0 [01-07-2013] #
* Created basic working UI with player stone animation (upper left)
* Clicks are captured and stones are placed in the right place
* Created placeholder right column
* Placed board, in now current, position

#### Prototype [01-05-2013] #
* Can draw board of any size, and any grid

# EXTRA #
* Remove start menu.js?
* Remove spinners eventually?
