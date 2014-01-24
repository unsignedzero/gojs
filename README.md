# GO JS [![Build status:Can't load apt.travis-ci.org](https://api.travis-ci.org/unsignedzero/gojs.png?branch=travis)](https://travis-ci.org/unsignedzero/gojs)

This code project has two pieces, a visual frontend that is created
using kineticJS and a logic backend. Each piece can be used
independently. Together, they allow the user to play Go, currently with
someone else at the same machine. As this is currently a WIP, not all features
that one would except in a GO game are implemented. Please see the TODO List below
for more details.

To run this game on your local system, clone this repo and run index.html.
Included are the necessary libraries to run this. The other HTML files are
incomplete demos.

Created by unsignedzero and started on 12-28-2012 as an idea.

## TO DO #
### GO UI #
* Unpollute General Namespace (DONE)
* Add gradient to the stones for realism (0%)
* Add in-game timer (100%)
* Change Right Column?
  * Add logo?
  * Add Turn Counter? (100%)
  * Add prison exchange (0%)
* Create menu for local settings (0%)
* Create menu to display end game stats (0%)
* Create replay menu/interface (0%)
* Create template for different languages (0%)

### GO Engine #
* Account for Kos (100%)
* Add end game checker and scoring (DONE)
* Allow for prisoner exchanges (100%)
* Allows resizing board (50%)
* Modify check return so UI gets more data back (0%)

### GO Title #
1. Create Menu Outline (DONE)
2. Add to spinner page (DONE)
  * Capture clicks
3. Create "hook" for multiplayer?
* Unpollute General Namespace (100%)
* Create non-anim version
* Mobile test (20%)

#### EXTRA #
* Remove start menu.js?
* Remove spinners eventually?

* * * *

## Version/Changelog #

* * * *

* Remove comment in json file.
* Updated package.json version number.
* Cleaning up README.md. [skip ci]

#### 0.8.2.0 [10-27-2013] #
* Added web version of jasmine so tests can be executed via browser only.
* Updated titles of projects.
* Moved js files into JS folder and updated version of kinetic on go title
  page to version 4.7.1
* Bugfix on go\_engine code.
* Removed prototype\_title and updated prototype\_spinner to kinetic 4.4.
* Updated index\_web page to match index and load only web version of kinetic.
* Removing BTest.md as no issues have occurred for a long period of time.

#### 0.8.1.0 [10-07-2013] #
* Updated Kinetic to 4.7.1. 4.7.2 buggy for this system so it is not loaded.
* Added fade animation for message box.
* Added extra empty lines for readability/consistency and spaces after commas
* Travis merged into development. Upgrading Kinetic to 4.6. Stable update
  without any code changes required.
* Added .gitignore to repo.

#### 0.8.0.0 [10-07-2013] #
* Jasmine-node test samples created and working
* Created sample test file. Fixed author naming issue from NAMEREGEX to David
  Tran by rebasing and now cherry-picking to the right branch.
* Created work package.json files to prepare for travis-ci.
* Updating development branch to 0.7.3.1

#### 0.7.3.1 [09-27-2013] #
* Removed extra spaces at end of line.
* Added space before one line comments and make commenting consistent.
* Fixed README with unescaped underscores.
* More browsers tested and moved to make README.md shorter
* Fixed miscellaneous errors such as spacing for README.md
* Updated UI bug where captured count doesn't reset until first click
* Added function in Go engine to exchange prisoners

#### 0.7.3.0 [04-05-2013] #
* Updated comment in go\_engine.js
* Removed jquery library, used in only one place with extend function
* Updated code to work with KineticJS 4.4.0
  Most common bug is this.stop() which doesn't reference the right object
* Simplified vars into one line and main.js is executed in a function

#### 0.7.2.0 [02-27-2013] #
* Fixed warnings from test on js files
* Created basic JSLint Test
* Bugfix, Bad reference name in title page
* Renamed files to reflect their new usage
* Created basic generic class for title page
* Cleaned up extra spaces on go\_ui and go\_engine.js code
* Added listening false to layers that don't require listening

#### 0.7.1.2 [02-03-2013] #
* Removed commented for loops
* Bugfix, stone count doesn't update correctly until first move
* Counting the number of stones left/number of stones captured are seperate
  MODEs
* JS Keyboard Library Added
* Bugfix, with hash, invalid suicidal moves were allowed

#### 0.7.1.1 [01-24-2013] #
* Cleaned up spinner tests. Unpopulated global namespace
* Converted fors in key spots to whiles to improve speed
* Removed the GO\_UI\_ name space in front of variable names
* Created code for menus, not working
* Added new goals and browser testing to readme

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

* * * *

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

* * * *

#### 0.5.0.0 [01-09-2013] #
* Added animation for fading pieces for UI
* Tested GO Engine Prototype Code ( clicks match with board object )

* * * *

#### 0.4.0.0 [01-09-2013] #
* UI works without animation. Animation buggy but working

* * * *

#### 0.2.0.0 [01-08-2013] #
* Debug msg output built into UI
* Created, but not tested, UI code
* All UI references start with GO UI
* Renamed GO Board methods for easier understanding
* Removed bad scoring algorithm

* * * *

#### 0.1.0.0 [01-07-2013] #
* Created prototype GO Engine code (untested)

* * * *

#### 0.0.0.0 [01-07-2013] #
* Created basic working UI with player stone animation (upper left)
* Clicks are captured and stones are placed in the right place
* Created placeholder right column
* Placed board, in now current, position

* * * *

#### Prototype [01-05-2013] #
* Can draw board of any size, and any grid

* * * *

