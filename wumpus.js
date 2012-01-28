/*
+---------------------------------------------------------------------------
|
|   wumpus.js
|
|   by Benjam Welker
|   http://iohelix.net
|
+---------------------------------------------------------------------------
|
|	JavaScript port of the classic BASIC game "Hunt the Wumpus"
|		- Including (most) maps from Wumpus 2
|	(BASIC source for both games at end of file)
|
|	http://en.wikipedia.org/wiki/Hunt_the_Wumpus
|
|	This is not a direct translation of the game
|	I have tried to keep the gameplay the same,
|	but the back-end is very different
|
|	Date Started: 2009-06-07
|	Last Updated: 2009-09-27 (v0.9.0)
|
+---------------------------------------------------------------------------
|
|	Change Log
| -----------------------------------------
|	v0.9.0 - Added (most) maps from Wumpus 2
		as well as the Wumpus 2 source code
|	v0.8.1 - Fixed issue when resetting game
|	v0.8.0 - Initial Creation and Release
|
*/


/** The Wumpus Game object
 *		Controller for Hunt the Wumpus game
 */
function Wumpus( ) {

	/**
	 *		PROPERTIES
	 * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/** property caves
	 *		Holds the room map selection array
	 *
	 * @var array of map arrays
	 */
	this.caves = [
		// 0 = Dodecahedron
		[[0,0,0], // this fixes the 0-index issue
			[2,5,8],    [1,3,10],   [2,4,12],   [3,5,14],   [1,4,6],
			[5,7,15],   [6,8,17],   [1,7,9],    [8,10,18],  [2,9,11],
			[10,12,19], [3,11,13],  [12,14,20], [4,13,15],  [6,14,16],
			[15,17,20], [7,16,18],  [9,17,19],  [11,18,20], [13,16,19]
		],

		// 1 = Mobius Strip
		[[0,0,0], // this fixes the 0-index issue
			[2,3,20],   [1,4,19],   [1,4,5],    [2,3,6],    [3,6,7],
			[4,5,8],    [5,8,9],    [6,7,10],   [7,10,11],  [8,9,12],
			[9,12,13],  [10,11,14], [11,14,15], [12,13,16], [13,16,17],
			[14,15,18], [15,18,19], [16,17,20], [2,17,20],  [1,18,19]
		],

		// 2 = String of Beads
		[[0,0,0], // this fixes the 0-index issue
			[2,3,20],   [1,3,4],    [1,2,4],    [2,3,5],    [4,6,7],
			[5,7,8],    [5,6,8],    [6,7,9],    [8,10,11],  [9,11,12],
			[9,10,12],  [10,11,13], [12,14,15], [13,15,16], [13,14,16],
			[14,15,17], [16,18,19], [17,19,20], [17,18,20], [1,18,19]
		],

		// 3 = Toroidal Hexagon Network
		[[0,0,0], // this fixes the 0-index issue
			[6,10,17], [6,7,18],  [7,8,19],  [8,9,20],   [9,10,16],
			[1,2,15],  [2,3,11],  [3,4,12],  [4,5,13],   [1,5,14],
			[7,16,20], [8,16,17], [9,17,18], [10,18,19], [6,19,20],
			[5,11,12], [1,12,13], [2,13,14], [3,14,15],  [4,11,15]
		],

		// 4 = Dendrite w/ Degeneracies
		[[0,0,0], // this fixes the 0-index issue
			[1,1,5],    [2,2,5],    [3,3,6],    [4,4,6],    [1,2,7],
			[3,4,7],    [5,6,10],   [8,9,9],    [8,8,10],   [7,9,11],
			[10,13,14], [11,13,13], [12,12,13], [11,15,16], [14,17,18],
			[14,19,20], [15,17,17], [15,18,18], [16,19,19], [16,20,20]
		],

		// 5 = One-way Lattice
		[[0,0,0], // this fixes the 0-index issue
			[4,8,5],    [1,5,6],    [2,6,7],    [3,7,8],    [8,9,12],
			[5,9,10],   [6,10,11],  [7,11,12],  [12,13,16], [9,13,14],
			[10,14,15], [11,15,16], [16,17,20], [13,17,18], [14,18,19],
			[15,19,20], [1,4,20],   [1,2,17],   [2,3,18],   [3,4,19]
		]
	];

	/** property cave
	 *		Holds the key for the selected cave
	 *
	 * @var int cave index
	 */
	this.cave = 0;


	/** property hunter
	 *		Holds the hunter's location
	 *
	 * @var int room id
	 */
	this.hunter = 0;


	/** property wumpus
	 *		Holds the wumpus location
	 *
	 * @var int room id
	 */
	this.wumpus = 0;


	/** property pits
	 *		Holds the pit locations
	 *
	 * @var array of int room ids
	 */
	this.pits = [0, 0];


	/** property bats
	 *		Holds the bat locations
	 *
	 * @var array of int room ids
	 */
	this.bats = [0, 0];


	/** property start
	 *		An array of all the above locations
	 *
	 * @var array of room ids
	 */
	this.start = [];


	/** property arrows
	 *		The player's arrow count
	 *
	 * @var int arrows remaining
	 */
	this.arrows = 5;


	/** property instruct
	 *		Holds the instruct flag
	 *			-1 = no value
	 *			 0 = no instructions
	 *			>0 = instruction step
	 *
	 * @var int instruct step
	 */
	this.instruct = -1;


	/** property choosing
	 *		Lets the game know if the player is choosing a map
	 *
	 * @var bool choosing
	 */
	this.choosing = false;


	/** property resetting
	 *		Lets the game know if the player is resetting
	 *
	 * @var bool resetting
	 */
	this.resetting = false;


	/** property moving
	 *		Lets the game know if the hunter is moving
	 *
	 * @var bool moving
	 */
	this.moving = false;


	/** property shooting
	 *		Lets the game know if the hunter is shooting
	 *
	 * @var bool shooting
	 */
	this.shooting = false;


	/** property num_rooms
	 *		How many rooms is the hunter shooting
	 *
	 * @var int num rooms shooting (false if none)
	 */
	this.num_rooms = false;


	/** property rooms_shot
	 *		Which rooms is the hunter shooting
	 *
	 * @var array of int rooms id
	 */
	this.rooms_shot = [];



	/**
	 *		METHODS
	 * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/** function setup_cave
	 *		Sets the various locations
	 *		uses the start values if any
	 *
	 * @param bool reset the game (discard start values)
	 * @action initializes cave
	 * @return void
	 */
	this.setup_cave = function(reset) {
		var i;

		// reset game variables
		this.instruct = -1;
		this.choosing = false;
		this.moving = false;
		this.shooting = false;
		this.resetting = false;

		if (undefined === reset) {
			reset = true;
		}

		if (reset || (4 != this.start.length)) {
			this.start = [];

			// place the player
			this.hunter = rand(1, 20);

			// place the wumpus
			do {
				this.wumpus = rand(1, 20);
			}
			while (this.hunter == this.wumpus);

			// place the pits
			for (i = 0; i < 2; ++i) {
				do {
					this.pits[i] = rand(1, 20);
				}
				while ((this.hunter == this.pits[i])
					|| (this.wumpus == this.pits[i])
					|| (this.pits[i - 1] == this.pits[i]));
			}

			// place the bats
			for (i = 0; i < 2; ++i) {
				do {
					this.bats[i] = rand(1, 20);
				}
				while ((this.hunter == this.bats[i])
					|| (this.wumpus == this.bats[i])
					|| (this.pits[0] == this.bats[i])
					|| (this.pits[1] == this.bats[i])
					|| (this.bats[i - 1] == this.bats[i]));
			}

			this.start = clone([this.hunter, this.wumpus, this.pits, this.bats]);
		}
		else { // use the saved startup
			// disable the instructions
			this.instruct = 0;

			// grab the player
			this.hunter = clone(this.start[0]);

			// grab the wumpus
			this.wumpus = clone(this.start[1]);

			// grab the pits
			this.pits = clone(this.start[2]);

			// grab the bats
			this.bats = clone(this.start[3]);
		}
	}


	/** function input
	 *		Parses the user imput
	 *
	 * @param string input
	 * @action parses input and performs appropriate action
	 * @return null
	 */
	 this.input = function(input) {
		this._log( );

		input = input.toLowerCase( );
		if ('' != input) {
			// deal with instructions
			if (0 > this.instruct) {
				if ('n' == input) {
					this.instruct = 0;
					this.choose_map( );
					return;
				}
				else {
					this.instruct = 1;
					this.instructions( );
					return;
				}
			} // end run instructions

			// deal with choosing map
			if (this.choosing) {
				if (input != parseInt(input)) {
					input = 0;
				}
				input = parseInt(input);

				if ((0 > input) || (5 < input)) {
					this.print('ERROR');
					this.choose_map( );
					return;
				}

				this.cave = input;
				this.choosing = false;
				this.show_position( );
				return;
			} // end run map choosing

			// deal with resets
			if (this.resetting) {
				this.resetting = false;

				if ('y' == input) {
					this.setup_cave(false);
					this.show_position( );
				}
				else {
					this.startup( );
				}

				return;
			} // end resetting

			// deal with movements
			if (this.moving) {
				if (input != parseInt(input) || 1 > input || 20 < input || ! this._adj(this.hunter, input)) {
					this.print('NOT POSSIBLE -');
					input = 'm'; // just redo it
				}
				else { // valid room
					// move into the room
					this.hunter = input;

					// test for deadly things
					if (this.test_dead( )) {
						return;
					}

					// test for bats
					if ((this.hunter == this.bats[0]) || (this.hunter == this.bats[1])) {
						this.print('ZAP--SUPER BAT SNATCH! ELSEWHEREVILLE FOR YOU!');
						this.hunter = rand(1, 20);

						// test again for deadly things
						if (this.test_dead( )) {
							return;
						}
					}

					this.moving = false;
					this.show_position( );
					return;
				} // end do move
			} // end moving

			// deal with shooting
			if (this.shooting) {
				if ( ! this.num_rooms) {
					if ((1 <= input) && (5 >= input)) {
						this.num_rooms = input;
						input = 0;
					}
					else {
						this.print("NO. OF ROOMS (1-5)\n");
						return;
					}
				} // end if no room count

				if (this.num_rooms && (this.rooms_shot.length < this.num_rooms)) {
					if ((1 <= input) && (20 >= input)) {
						var in_array = false;

						// make sure the arrow isn't backtracking
						for (var key in this.rooms_shot) {
							if (this.rooms_shot[key] == input) {
								this.print("ARROWS AREN'T THAT CROOKED - TRY ANOTHER ROOM\n");
								in_array = true;
							}
						}

						if ( ! in_array) {
							this.rooms_shot.push(input);
						}
					} // end if valid room num

					// if the shot quota hasn't been filled yet...
					if (this.rooms_shot.length < this.num_rooms) {
						this.print("ROOM #");
						return;
					}
					else { // done collecting rooms, do the shots
						var off_course = false;
						var prev = this.hunter;
						var cur = prev;
						for (var i = 0; i <= this.rooms_shot.length; ++i) {
							if ( ! off_course) {
								// check the next room and see if it's connected to this one
								if ( ! this._adj(prev, this.rooms_shot[i])) {
									off_course = true;
								}
							}

							// separate if statement because off_course may have changed above
							if (off_course) {
								cur = this.caves[this.cave][prev][rand(0, 2)];
							}
							else {
								cur = this.rooms_shot[i];
							}

							// test if we killed ourselves
							if (this.hunter == cur) {
								this.print('OUCH! ARROW GOT YOU!');
								this.dead( );
								return;
							}

							// test if we got the wumpus
							if (this.wumpus == cur) {
								this.print('AHA! YOU GOT THE WUMPUS!');
								this.win( );
								return;
							}

							prev = cur;
						}

						this.print('MISSED');
						this.move_wumpus( );

						if (this.hunter == this.wumpus) {
							this.print('TSK TSK TSK - WUMPUS GOT YOU!');
							this.dead( );
							return;
						}

						// remove an arrow
						if (1 == this.arrows) {
							this.dead( );
							return;
						}
						else {
							--this.arrows;
						}

						this.shooting = false;
						this.show_position( );
						return;
					} // end doing the shots
				} // end if collecting rooms
			} // end shooting

			switch (input) {
				case 'q' : // quit
					this.print('CHICKEN');
					window.location.reload( );
					break;

				case 'm' : // move
					this.moving = true;
					this.print('WHERE TO');
					break;

				case 's' : // shoot
					this.shooting = true;
					this.print('NO. OF ROOMS (1-5)');
					break;

				default : // anything else
					this.show_prompt( );
					break;
			} // end input switch
		}
		else { // '' == input
			if (0 < this.instruct) {
				this.instructions( );
			}
			else {
				this.moving = false;
				this.shooting = false;
				this.show_position( );
			}
		}

		return;
	} // end input


	/** function show_position
	 *		Displays the hunter's current position
	 *		along with any hazard warnings
	 *
	 * @param void
	 * @action prints current status and position
	 * @return void
	 */
	this.show_position = function( ) {
		// grab the hunter's location
		var output = "\n"+this.get_hazards( );
		output += 'YOU ARE IN ROOM '+this.hunter+"\n";
		output += 'TUNNELS LEAD TO'+this._connections( );

		this.print(output);
		this.show_prompt( )
	}


	/** function show_prompt
	 *		Displays the action prompt
	 *
	 * @param void
	 * @action prints prompt
	 * @return void
	 */
	this.show_prompt = function( ) {
		this.print('SHOOT OR MOVE (S-M)');
	}


	/** function get_hazards
	 *		Grabs the current hazards from the cave
	 *		and returns a textual representation
	 *
	 * @param void
	 * @return string hazard text
	 */
	this.get_hazards = function( ) {
		var output = '';

		if (this.near_wumpus( )) {
			output += "I SMELL A WUMPUS\n";
		}

		if (this.near_pit( )) {
			output += "I FEEL A DRAFT\n";
		}

		if (this.near_bat( )) {
			output += "BATS NEARBY\n";
		}

		return output;
	}


	/** function print
	 *		Prints the given string to "stdout"
	 *		via Terminal object
	 *
	 * @param string output
	 * @action prints string
	 * @return void
	 */
	this.print = function(line) {
		Terminal.stdout.puts(line);
	}


	/** function startup
	 *		Initializes the game
	 *
	 * @param void
	 * @action initializes the game
	 * @return void
	 */
	this.startup = function( ) {
		this.setup_cave( );
		this.print('INSTRUCTIONS (Y-N)');
	}


	/** function test_dead
	 *		Test if anything deadly got the hunter
	 *
	 * @param void
	 * @action runs dead stuff if needed
	 * @return bool hunter is dead
	 */
	this.test_dead = function( ) {
		// test for the wumpus
		if (this.hunter == this.wumpus) {
			this.print('... OOPS! BUMPED A WUMPUS!');
			if ( ! this.move_wumpus( )) {
				this.print('TSK TSK TSK - WUMPUS GOT YOU!');
				this.dead( );
				return true;
			}
		}

		// test for pits
		if ((this.hunter == this.pits[0]) || (this.hunter == this.pits[1])) {
			this.print('YYYYIIIIEEEE . . . FELL IN PIT');
			this.dead( );
			return true;
		}

		return false;
	}


	/** function move_wumpus
	 *		Moves the wumpus
	 *
	 * @param void
	 * @return bool wumpus moved
	 */
	this.move_wumpus = function( ) {
		// there's a 1:4 chance the wumpus will move
		if (1 != rand(1, 4)) {
			this.wumpus = this.caves[this.cave][this.wumpus][rand(0, 2)];
			return true;
		}

		return false;
	}


	/** function near_wumpus
	 *		Tests if the hunter is near the wumpus
	 *
	 * @param void
	 * @return bool near the wumpus
	 */
	this.near_wumpus = function( ) {
		var near = false;

		// test the hunter's neighbor locations for hazards
		for (var key in this.caves[this.cave][this.hunter]) {
			near = (near || (this.wumpus == this.caves[this.cave][this.hunter][key]));
		}

		return near;
	}


	/** function near_pit
	 *		Tests if the hunter is near a pit
	 *
	 * @param void
	 * @return bool near a pit
	 */
	this.near_pit = function( ) {
		var near = false;

		// test the hunter's neighbor locations for hazards
		for (var key in this.caves[this.cave][this.hunter]) {
			for (var pit = 0; pit <= 1; ++pit) {
				near = (near || (this.pits[pit] == this.caves[this.cave][this.hunter][key]));
			}
		}

		return near;
	}


	/** function near_bat
	 *		Tests if the hunter is near a bat
	 *
	 * @param void
	 * @return bool near a bat
	 */
	this.near_bat = function( ) {
		var near = false;

		// test the hunter's neighbor locations for hazards
		for (var key in this.caves[this.cave][this.hunter]) {
			for (var bat = 0; bat <= 1; ++bat) {
				near = (near || (this.bats[bat] == this.caves[this.cave][this.hunter][key]));
			}
		}

		return near;
	}


	/** function instructions
	 *		Displays instructions based on the instruct flag
	 *
	 * @param void
	 * @action prints instructions
	 * @return void
	 */
	this.instructions = function( ) {
		switch (this.instruct) {
			case 1 :
				this.print("WELCOME TO 'HUNT THE WUMPUS'\n"
						+ "  THE WUMPUS LIVES IN A CAVE OF 20 ROOMS. EACH ROOM\n"
						+ "HAS 3 TUNNELS LEADING TO OTHER ROOMS. (LOOK AT A\n"
						+ "DODECAHEDRON TO SEE HOW THIS WORKS-IF YOU DON'T KNOW\n"
						+ "WHAT A DODECAHEDRON IS, ASK SOMEONE)\n\n"

						+ "     HAZARDS:\n"
						+ " BOTTOMLESS PITS - TWO ROOMS HAVE BOTTOMLESS PITS IN THEM\n"
						+ "     IF YOU GO THERE, YOU FALL INTO THE PIT (& LOSE!)\n"
						+ " SUPER BATS - TWO OTHER ROOMS HAVE SUPER BATS. IF YOU\n"
						+ "     GO THERE, A BAT GRABS YOU AND TAKES YOU TO SOME OTHER\n"
						+ "     ROOM AT RANDOM. (WHICH MAY BE TROUBLESOME)\n");
				this.print('HIT RETURN TO CONTINUE');
				this.instruct = 2;
				break;

			case 2 :
				this.print("     WUMPUS:\n"
						+ " THE WUMPUS IS NOT BOTHERED BY HAZARDS (HE HAS SUCKER\n"
						+ " FEET AND IS TOO BIG FOR A BAT TO LIFT).  USUALLY\n"
						+ " HE IS ASLEEP.  TWO THINGS WAKE HIM UP: YOU SHOOTING AN\n"
						+ "ARROW OR YOU ENTERING HIS ROOM.\n"
						+ "     IF THE WUMPUS WAKES HE MOVES (P=.75) ONE ROOM\n"
						+ " OR STAYS STILL (P=.25).  AFTER THAT, IF HE IS WHERE YOU\n"
						+ " ARE, HE EATS YOU UP AND YOU LOSE!\n\n"

						+ "     YOU:\n"
						+ " EACH TURN YOU MAY MOVE OR SHOOT A CROOKED ARROW\n"
						+ "   MOVING:  YOU CAN MOVE ONE ROOM (THRU ONE TUNNEL)\n"
						+ "   ARROWS:  YOU HAVE 5 ARROWS.  YOU LOSE WHEN YOU RUN OUT\n"
						+ "   EACH ARROW CAN GO FROM 1 TO 5 ROOMS. YOU AIM BY TELLING\n"
						+ "   THE COMPUTER THE ROOM'S YOU WANT THE ARROW TO GO TO.\n"
						+ "   IF THE ARROW CAN'T GO THAT WAY (IF NO TUNNEL) IT MOVES\n"
						+ "   AT RANDOM TO THE NEXT ROOM.\n"
						+ "     IF THE ARROW HITS THE WUMPUS, YOU WIN.\n"
						+ "     IF THE ARROW HITS YOU, YOU LOSE.\n");
				this.print('HIT RETURN TO CONTINUE');
				this.instruct = 3;
				break;

			case 3 :
				this.print("    WARNINGS:\n"
						+ "     WHEN YOU ARE ONE ROOM AWAY FROM A WUMPUS OR HAZARD,\n"
						+ "     THE COMPUTER SAYS:\n"
						+ " WUMPUS:  'I SMELL A WUMPUS'\n"
						+ " BAT   :  'BATS NEARBY'\n"
						+ " PIT   :  'I FEEL A DRAFT'\n\n");
				this.print('HIT RETURN TO CONTINUE');
				this.instruct = 4;
				break;

			case 4 :
				this.print("WELCOME TO WUMPUS II\n"
						+ "THIS VERSION HAS THE SAME RULES AS 'HUNT THE WUMPUS'.\n"
						+ "HOWEVER, YOU NOW HAVE A CHOICE OF CAVES TO PLAY IN.\n"
						+ "SOME CAVE ARE EASIER THAN OTHERS. ALL CAVES HAVE 20\n"
						+ "ROOMS AND 3 TUNNELS LEADING FROM ONE ROOM TO OTHER ROOMS.\n"
						+ "  0  -  DODECAHEDRON   THE ROOMS OF THIS CAVE ARE ON A\n"
						+ "        12-SIDED OBJECT, EACH FORMS A PENTAGON.\n"
						+ "        THE ROOMS ARE AT THE CORNERS OF THE PENTAGONS.\n"
						+ "        EACH ROOM HAVING TUNNELS THAT LEAD TO 3 OTHER ROOMS.\n\n"
						+ "  1  -  MOBIUS STRIP   THIS CAVE IS TWO ROOMS\n"
						+ "        WIDE AND 10 ROOMS AROUND (LIKE A BELT)\n"
						+ "        YOU WILL NOTICE THERE IS A HALF TWIST\n"
						+ "        SOMEWHERE.\n\n"
						+ "  2  -  STRING OF BEADS   FIVE BEADS IN A CIRCLE.\n"
						+ "        EACH BEAD IS A DIAMOND WITH A VERTICAL\n"
						+ "        CROSS-BAR. THE RIGHT & LEFT CORNERS LEAD\n"
						+ "        TO NEIGHBORING BEADS. (THIS ONE IS DIFFICULT\n"
						+ "        TO PLAY)\n\n"
						+ "  3  -  HEX NETWORK   IMAGINE A HEX TILE FLOOR. TAKE\n"
						+ "        A RECTANGLE WITH 20 POINTS (INTERSECTIONS)\n"
						+ "        INSIDE (4X4). JOIN RIGHT & LEFT SIDES TO MAKE A\n"
						+ "        CYLINDER. THEN JOIN TOP & BOTTOM TO FORM A\n"
						+ "        TORUS (DOUGHNUT).\n"
						+ "        HAVE FUN IMAGINING THIS ONE!!\n\n");
				this.print('HIT RETURN TO CONTINUE');
				this.instruct = 5;
				break;

			case 5 :
				this.print("  CAVES 1-3 ARE REGULAR IN A SENSE THAT EACH ROOM\n"
						+ "GOES TO THREE OTHER ROOMS & TUNNELS ALLOW TWO-\n"
						+ "WAY TRAFFIC. HERE ARE SOME 'IRREGULAR' CAVES:\n\n"
						+ "  4  -  DENDRITE WITH DEGENRACIES   PULL A PLANT FROM\n"
						+ "        THE GROUND. THE ROOTS & BRANCHES FORM A\n"
						+ "        DENDRITE - IE., THERE ARE NO LOOPING PATHS\n"
						+ "        DEGENERACY MEANS A) SOME ROOMS CONNECT TO\n"
						+ "        THEMSELVES AND B) SOME ROOMS HAVE MORE THAN ONE\n"
						+ "        TUNNEL TO THE SAME OTHER ROOM IE., 12 HAS\n"
						+ "        TWO TUNNELS TO 13.\n\n"
						+ "  5  -  ONE WAY LATTICE   HERE ALL TUNNELS GO ONE\n"
						+ "        WAY ONLY. TO RETURN, YOU MUST GO AROUND THE CAVE\n"
						+ "        (ABOUT 5 MOVES).\n\n"
//						+ "  6  -  ENTER YOUR OWN CAVE   THE COMPUTER WILL ASK YOU\n"
//						+ "        THE ROOMS NEXT TO EACH ROOM IN THE CAVE.\n"
//						+ "          FOR EXAMPLE:\n"
//						+ "            ROOM #1     ? 2,3,4       - YOUR REPLY OF 2,3,4\n"
//						+ "             MEANS ROOM 1 HAS TUNNELS GOING TO ROOMS:\n"
//						+ "             2, 3, & 4.\n"
						+ "  HAPPY HUNTING!\n\n");
				this.choose_map( );
				this.instruct = 0;
				break;

			default :
				// do nothing
				break;
		} // end instruct switch
	} // end instructions


	this.choose_map = function( ) {
		this.choosing = true;
		this.print("CAVE #(0-5)");
	} // end choose_map


	/** function win
	 *		Does all the things we need to do
	 *		when the hunter wins
	 *
	 * @param void
	 * @return void
	 */
	this.win = function( ) {
		this.print('HEE HEE HEE - THE WUMPUS\'LL GET YOU NEXT TIME!!');
		this.resetting = true;
		this.print('SAME SETUP (Y-N)');
	}


	/** function dead
	 *		Does all the things we need to do
	 *		when the hunter dies
	 *
	 * @param void
	 * @return void
	 */
	this.dead = function( ) {
		this.print('HA HA HA - YOU LOSE!');
		this.resetting = true;
		this.print('SAME SETUP (Y-N)');
	}


	/** function _connections
	 *		Returns a string of the rooms that are
	 *		connected to the one the hunter is in
	 *
	 * @param void
	 * @return string concatenated room ids
	 */
	this._connections = function( ) {
		var output = '';

		for (var key in this.caves[this.cave][this.hunter]) {
			output += ' '+this.caves[this.cave][this.hunter][key];
		}

		return output;
	}


	/** function _adj
	 *		Test if two rooms are adjacent
	 *
	 * @param int room id
	 * @param int room id
	 * @return bool rooms are connected
	 */
	this._adj = function(room1, room2) {
		var key;
		for (key in this.caves[this.cave][room1]) {
			if (room2 == this.caves[this.cave][room1][key]) {
				return true;
			}
		}

		return false;
	}


	/** function _log
	 *		Outputs data to the console
	 *
	 * @param void
	 * @action outputs to console
	 * @return void
	 */
	this._log = function( ) {
		return false;

		if (console.log) {
			console.log(this.start);
		}
	}

}


// MISC FUNCTIONS

/** function rand
 *		Generates a random integer between
 *		two given values, inclusive
 *
 * @param int lower value
 * @param int upper value
 * @return int random number
 */
function rand(min, max) {
	if (min == max) { return min; }

	// 'seed' the random number (cuz js random numbers kinda suck)
	var date = new Date( );
	var count = date.getMilliseconds( ) % 10;

	for (var i = 0; i <= count; ++i) 	{
		Math.random( );
	}

	if (min > max) 	{
		// XOR variable switching
		min ^= max;
		max ^= min;
		min ^= max;
	}

	return Math.floor((Math.random( ) * (max - min + 1)) + min);
}


/** function is_int
 *		Tests if the given value is an integer
 *
 * @param mixed value to test
 * @return bool value is an integer
 */
function is_int(input) {
	return (('number' == typeof(input)) && (parseInt(input) == input));
}


/** function clone
 *		Clones a given object or array
 *
 * @param mixed original
 * @return mixed clone
 */
function clone(obj){
	if ((null == obj) || ('object' != typeof(obj))) {
		return obj;
	}

	if (Array == obj.constructor) {
		var temp = [];

		for (var i = 0; i < obj.length; i++) {

			if ('object' == typeof(obj[i])) {
				temp.push(clone(obj[i]));
			}
			else {
				temp.push(obj[i]);
			}
		}

		return temp;
	}

	var temp = new obj.constructor( );
	for (var key in obj) {
		if (obj !== obj[key]) {
			temp[key] = clone(obj[key]);
		}
		else {
			temp[key] = temp;
		}
	}

	return temp;
}


// hook into the terminal emulator
var Wumpus = new Wumpus( );
Terminal.header = "\n### HUNT THE WUMPUS ###\n";

Terminal.initHook = function( ) {
	Wumpus.startup( );
};

Terminal.commandCallBack = function(line) {
	var text = null;

	text = Wumpus.input(line);

	if (undefined != text) {
		Wumpus.print(text);
	}
};

/*

HUNT THE WUMPUS BASIC SOURCE CODE
-----------------------------------
5 REM *** HUNT THE WUMPUS ***
10 DIM P(5)
15 PRINT "INSTRUCTIONS (Y-N)";
20 INPUT I$
25 IF (I$ = "N") OR (I$ = "n") THEN 35
30 GOSUB 375
35 GOTO 80
80 REM *** SET UP CAVE (DODECAHEDRAL NODE LIST) ***
85 DIM S(20,3)
90 FOR J = 1 TO 20
95 FOR K = 1 TO 3
100 READ S(J,K)
105 NEXT K
110 NEXT J
115 DATA 2,5,8,1,3,10,2,4,12,3,5,14,1,4,6
120 DATA 5,7,15,6,8,17,1,7,9,8,10,18,2,9,11
125 DATA 10,12,19,3,11,13,12,14,20,4,13,15,6,14,16
130 DATA 15,17,20,7,16,18,9,17,19,11,18,20,13,16,19
135 DEF FNA(X)=INT(20*RND(1))+1
140 DEF FNB(X)=INT(3*RND(1))+1
145 DEF FNC(X)=INT(4*RND(1))+1
150 REM *** LOCATE L ARRAY ITEMS ***
155 REM *** 1-YOU, 2-WUMPUS, 3&4-PITS, 5&6-BATS ***
160 DIM L(6)
165 DIM M(6)
170 FOR J = 1 TO 6
175 L(J) = FNA(0)
180 M(J) = L(J)
185 NEXT J
190 REM *** CHECK FOR CROSSOVERS (IE L(1)=L(2), ETC) ***
195 FOR J = 1 TO 6
200 FOR K = 1 TO 6
205 IF J = K THEN 215
210 IF L(J) = L(K) THEN 170
215 NEXT K
220 NEXT J
225 REM *** SET NO. OF ARROWS ***
230 A = 5
235 L = L(1)
240 REM *** RUN THE GAME ***
245 PRINT "HUNT THE WUMPUS"
250 REM *** HAZARD WARNING AND LOCATION ***
255 GOSUB 585
260 REM *** MOVE OR SHOOT ***
265 GOSUB 670
270 ON O GOTO 280,300
275 REM *** SHOOT ***
280 GOSUB 715
285 IF F = 0 THEN 255
290 GOTO 310
295 REM *** MOVE ***
300 GOSUB 975
305 IF F = 0 THEN 255
310 IF F > 0 THEN 335
315 REM *** LOSE ***
320 PRINT "HA HA HA - YOU LOSE!"
325 GOTO 340
330 REM *** WIN ***
335 PRINT "HEE HEE HEE - THE WUMPUS'LL GET YOU NEXT TIME!!"
340 FOR J = 1 TO 6
345 L(J) = M(J)
350 NEXT J
355 PRINT "SAME SETUP (Y-N)";
360 INPUT I$
365 IF (I$ <> "Y") AND (I$ <> "y") THEN 170
370 GOTO 230
375 REM *** INSTRUCTIONS ***
380 PRINT "WELCOME TO 'HUNT THE WUMPUS'"
385 PRINT "  THE WUMPUS LIVES IN A CAVE OF 20 ROOMS. EACH ROOM"
390 PRINT "HAS 3 TUNNELS LEADING TO OTHER ROOMS. (LOOK AT A"
395 PRINT "DODECAHEDRON TO SEE HOW THIS WORKS-IF YOU DON'T KNOW"
400 PRINT "WHAT A DODECAHEDRON IS, ASK SOMEONE)"
405 PRINT
410 PRINT "     HAZARDS:"
415 PRINT " BOTTOMLESS PITS - TWO ROOMS HAVE BOTTOMLESS PITS IN THEM"
420 PRINT "     IF YOU GO THERE, YOU FALL INTO THE PIT (& LOSE!)"
425 PRINT " SUPER BATS - TWO OTHER ROOMS HAVE SUPER BATS. IF YOU"
430 PRINT "     GO THERE, A BAT GRABS YOU AND TAKES YOU TO SOME OTHER"
435 PRINT "     ROOM AT RANDOM. (WHICH MAY BE TROUBLESOME)"
440 INPUT "HIT RETURN TO CONTINUE";A$
445 PRINT "     WUMPUS:"
450 PRINT " THE WUMPUS IS NOT BOTHERED BY HAZARDS (HE HAS SUCKER"
455 PRINT " FEET AND IS TOO BIG FOR A BAT TO LIFT).  USUALLY"
460 PRINT " HE IS ASLEEP.  TWO THINGS WAKE HIM UP: YOU SHOOTING AN"
465 PRINT "ARROW OR YOU ENTERING HIS ROOM."
470 PRINT "     IF THE WUMPUS WAKES HE MOVES (P=.75) ONE ROOM"
475 PRINT " OR STAYS STILL (P=.25).  AFTER THAT, IF HE IS WHERE YOU"
480 PRINT " ARE, HE EATS YOU UP AND YOU LOSE!"
485 PRINT
490 PRINT "     YOU:"
495 PRINT " EACH TURN YOU MAY MOVE OR SHOOT A CROOKED ARROW"
500 PRINT "   MOVING:  YOU CAN MOVE ONE ROOM (THRU ONE TUNNEL)"
505 PRINT "   ARROWS:  YOU HAVE 5 ARROWS.  YOU LOSE WHEN YOU RUN OUT"
510 PRINT "   EACH ARROW CAN GO FROM 1 TO 5 ROOMS. YOU AIM BY TELLING"
515 PRINT "   THE COMPUTER THE ROOM#S YOU WANT THE ARROW TO GO TO."
520 PRINT "   IF THE ARROW CAN'T GO THAT WAY (IF NO TUNNEL) IT MOVES"
525 PRINT "   AT RANDOM TO THE NEXT ROOM."
530 PRINT "     IF THE ARROW HITS THE WUMPUS, YOU WIN."
535 PRINT "     IF THE ARROW HITS YOU, YOU LOSE."
540 INPUT "HIT RETURN TO CONTINUE";A$
545 PRINT "    WARNINGS:"
550 PRINT "     WHEN YOU ARE ONE ROOM AWAY FROM A WUMPUS OR HAZARD,"
555 PRINT "     THE COMPUTER SAYS:"
560 PRINT " WUMPUS:  'I SMELL A WUMPUS'"
565 PRINT " BAT   :  'BATS NEARBY'"
570 PRINT " PIT   :  'I FEEL A DRAFT'"
575 PRINT
580 RETURN
585 REM *** PRINT LOCATION & HAZARD WARNINGS ***
590 PRINT
595 FOR J = 2 TO 6
600 FOR K = 1 TO 3
605 IF S(L(1),K) <> L(J) THEN 640
610 ON J-1 GOTO 615,625,625,635,635
615 PRINT "I SMELL A WUMPUS!"
620 GOTO 640
625 PRINT "I FEEL A DRAFT"
630 GOTO 640
635 PRINT "BATS NEARBY!"
640 NEXT K
645 NEXT J
650 PRINT "YOU ARE IN ROOM ";L(1)
655 PRINT "TUNNELS LEAD TO ";S(L,1);" ";S(L,2);" ";S(L,3)
660 PRINT
665 RETURN
670 REM *** CHOOSE OPTION ***
675 PRINT "SHOOT OR MOVE (S-M)";
680 INPUT I$
685 IF (I$ <> "S") AND (I$ <> "s") THEN 700
690 O = 1
695 RETURN
700 IF (I$ <> "M") AND (I$ <> "m") THEN 675
705 O = 2
710 RETURN
715 REM *** ARROW ROUTINE ***
720 F = 0
725 REM *** PATH OF ARROW ***
735 PRINT "NO. OF ROOMS (1-5)";
740 INPUT J9
745 IF J9 < 1 THEN 735
750 IF J9 > 5 THEN 735
755 FOR K = 1 TO J9
760 PRINT "ROOM #";
765 INPUT P(K)
770 IF K <= 2 THEN 790
775 IF P(K) <> P(K-2) THEN 790
780 PRINT "ARROWS AREN'T THAT CROOKED - TRY ANOTHER ROOM"
785 GOTO 760
790 NEXT K
795 REM *** SHOOT ARROW ***
800 L = L(1)
805 FOR K = 1 TO J9
810 FOR K1 = 1 TO 3
815 IF S(L,K1) = P(K) THEN 895
820 NEXT K1
825 REM *** NO TUNNEL FOR ARROW ***
830 L = S(L,FNB(1))
835 GOTO 900
840 NEXT K
845 PRINT "MISSED"
850 L = L(1)
855 REM *** MOVE WUMPUS ***
860 GOSUB 935
865 REM *** AMMO CHECK ***
870 A = A-1
875 IF A > 0 THEN 885
880 F = -1
885 RETURN
890 REM *** SEE IF ARROW IS AT L(1) OR AT L(2)
895 L = P(K)
900 IF L <> L(2) THEN 920
905 PRINT "AHA! YOU GOT THE WUMPUS!"
910 F = 1
915 RETURN
920 IF L <> L(1) THEN 840
925 PRINT "OUCH! ARROW GOT YOU!"
930 GOTO 880
935 REM *** MOVE WUMPUS ROUTINE ***
940 K = FNC(0)
945 IF K = 4 THEN 955
950 L(2) = S(L(2),K)
955 IF L(2) <> L THEN 970
960 PRINT "TSK TSK TSK - WUMPUS GOT YOU!"
965 F = -1
970 RETURN
975 REM *** MOVE ROUTINE ***
980 F = 0
985 PRINT "WHERE TO";
990 INPUT L
995 IF L < 1 THEN 985
1000 IF L > 20 THEN 985
1005 FOR K = 1 TO 3
1010 REM *** CHECK IF LEGAL MOVE ***
1015 IF S(L(1),K) = L THEN 1045
1020 NEXT K
1025 IF L = L(1) THEN 1045
1030 PRINT "NOT POSSIBLE -";
1035 GOTO 985
1040 REM *** CHECK FOR HAZARDS ***
1045 L(1) = L
1050 REM *** WUMPUS ***
1055 IF L <> L(2) THEN 1090
1060 PRINT "... OOPS! BUMPED A WUMPUS!"
1065 REM *** MOVE WUMPUS ***
1070 GOSUB 940
1075 IF F = 0 THEN 1090
1080 RETURN
1085 REM *** PIT ***
1090 IF L = L(3) THEN 1100
1095 IF L <> L(4) THEN 1120
1100 PRINT "YYYYIIIIEEEE . . . FELL IN PIT"
1105 F = -1
1110 RETURN
1115 REM *** BATS ***
1120 IF L = L(5) THEN 1130
1125 IF L <> L(6) THEN 1145
1130 PRINT "ZAP--SUPER BAT SNATCH! ELSEWHEREVILLE FOR YOU!"
1135 L = FNA(1)
1140 GOTO 1045
1145 RETURN
1150 END

-----------------------------------

HUNT THE WUMPUS II BASIC SOURCE CODE
-----------------------------------
3 PRINT TAB(25);"WUMPUS 2"
4 PRINT TAB(20);"CREATIVE COMPUTING"
5 PRINT TAB(18);"MORRISTOWN  NEW JERSEY"
7 PRINT
10 PRINT
15 PRINT
20 REM- WUMPUS VERSION 2
30 DIM S(20,3)
40 DIM L(6),M(6),P(5)
50 PRINT "INSTRUCTIONS ";
60 INPUT I$
70 PRINT
80 IF LEFT$(I$,1) <> "Y" THEN 130
100 GOSUB 700
110 REM- CHOOSE AND SETUP CAVE
130 GOSUB 2530
140 DEF FNA(X)=INT(20*RND(1))+1
150 DEF FNB(X)=INT(3*RND(1))+1
160 DEF FNC(X)=INT(4*RND(1))+1
170 REM- LOCATE L ARRAY ITEMS
180 REM- 1-YOU, 2-WUMPUS, 3&4-PITS, 5&6-BATS
210 FOR J=1 TO 6
220 L(J)=FNA(0)
230 M(J)=L(J)
240 NEXT J
250 REM- CHECK FOR CROSSOVERS (IE L(1)=L(2) ETC)
260 FOR J=1 TO 6
270 FOR K=J TO 6
280 IF J=K THEN 300
290 IF L(J)=L(K) THEN 210
300 NEXT K
310 NEXT J
320 REM- SET # ARROWS
330 A=5
340 L=L(1)
350 REM- RUN THE GAME
360 PRINT "HUNT THE WUMPUS 2"
370 REM- HAZARDS WARNINGS AND LOCATION
380 GOSUB 1230
390 REM- MOVE OR SHOOT
400 GOSUB 1400
410 ON O GOTO 430,470
420 REM- SHOOT
430 GOSUB 1550
440 IF F=0 THEN 400
450 GOTO 490
460 REM- MOVE
470 GOSUB 2150
480 IF F=0 THEN 380
490 IF F > 0 THEN 540
500 REM- LOSE
510 PRINT "HA HA HA - YOU LOSE!"
520 GOTO 550
530 REM- WIN
540 PRINT "HEE HEE HEE - THE WUMPUS'LL GET YOU NEXT TIME!!"
550 FOR J=1 TO 6
560 L(J)=M(J)
570 NEXT J
580 PRINT "PLAY AGAIN ";
590 INPUT I$
595 PRINT
600 PRINT
620 IF LEFT$(I$,1) <> "Y" THEN 3310
640 PRINT "SAME SET-UP ";
650 INPUT I$
660 PRINT
670 IF LEFT$(I$,1) <> "Y" THEN 130
680 GOTO 330
700 REM- INSTRUCTIONS
710 PRINT "WELCOME TO WUMPUS II"
720 PRINT "THIS VERSION HAS THE SAME RULES AS 'HUNT THE WUMPUS'."
730 PRINT "HOWEVER, YOU NOW HAVE A CHOICE OF CAVES TO PLAY IN."
740 PRINT "SOME CAVE ARE EASIER THAN OTHERS. ALL CAVES HAVE 20"
750 PRINT "ROOMS AND 3 TUNNELS LEADING FROM ONE ROOM TO OTHER ROOMS."
760 PRINT "  0  -  DODECAHEDRON   THE ROOMS OF THIS CAVE ARE ON A"
780 PRINT "        12-SIDED OBJECT, EACH FORMS A PENTAGON."
790 PRINT "        THE ROOMS ARE AT THE CORNERS OF THE PENTAGONS."
800 PRINT "        EACH ROOM HAVING TUNNELS THAT LEAD TO 3 OTHER ROOMS"
805 PRINT
810 PRINT "  1  -  MOBIUS STRIP   THIS CAVE IS TWO ROOMS"
820 PRINT "        WIDE AND 10 ROOMS AROUND (LIKE A BELT)"
830 PRINT "        YOU WILL NOTICE THERE IS A HALF TWIST"
840 PRINT "        SOMEWHERE."
850 PRINT
860 PRINT "  2  -  STRING OF BEADS   FIVE BEADS IN A CIRCLE."
870 PRINT "        EACH BEAD IS A DIAMOND WITH A VERTICAL"
880 PRINT "        CROSS-BAR. THE RIGHT & LEFT CORNERS LEAD"
890 PRINT "        TO NEIGHBORING BEADS. (THIS ONE IS DIFFICULT"
900 PRINT "        TO PLAY)"
910 PRINT
920 PRINT "  3  -  HEX NETWORK   IMAGINE A HEX TILE FLOOR. TAKE"
930 PRINT "        A RECTANGLE WITH 20 POINTS (INTERSECTIONS)"
940 PRINT "        INSIDE (4X4). JOIN RIGHT & LEFT SIDES TO MAKE A"
950 PRINT "        CYLINDER. THEN JOIN TOP & BOTTOM TO FORM A"
960 PRINT "        TORUS (DOUGHNUT)."
970 PRINT "        HAVE FUN IMAGINING THIS ONE!!"
980 PRINT
990 PRINT "  CAVES 1-3 ARE REGULAR IN A SENSE THAT EACH ROOM"
1000 PRINT "GOES TO THREE OTHER ROOMS & TUNNELS ALLOW TWO-"
1010 PRINT "WAY TRAFFIC. HERE ARE SOME 'IRREGULAR' CAVES:"
1020 PRINT
1030 PRINT "  4  -  DENDRITE WITH DEGENRACIES   PULL A PLANT FROM"
1040 PRINT "        THE GROUND. THE ROOTS & BRANCHES FORM A"
1050 PRINT "        DENDRITE - IE., THERE ARE NO LOOPING PATHS"
1060 PRINT "        DEGENERACY MEANS A) SOME ROOMS CONNECT TO"
1070 PRINT "        THEMSELVES AND B) SOME ROOMS HAVE MORE THAN ONE"
1080 PRINT "        TUNNEL TO THE SAME OTHER ROOM IE., 12 HAS"
1090 PRINT "        TWO TUNNELS TO 13."
1100 PRINT
1110 PRINT "  5  -  ONE WAY LATTICE   HERE ALL TUNNELS GO ONE"
1120 PRINT "        WAY ONLY. TO RETURN, YOU MUST GO AROUND THE CAVE"
1130 PRINT "        (ABOUT 5 MOVES)."
1140 PRINT
1160 PRINT "  6  -  ENTER YOUR OWN CAVE   THE COMPUTER WILL ASK YOU"
1170 PRINT "        THE ROOMS NEXT TO EACH ROOM IN THE CAVE."
1180 PRINT "          FOR EXAMPLE:"
1190 PRINT "            ROOM #1     ? 2,3,4       - YOUR REPLY OF 2,3,4"
1200 PRINT "             MEANS ROOM 1 HAS TUNNELS GOING TO ROOMS:"
1210 PRINT "             2, 3, & 4."
1220 PRINT "  HAPPY HUNTING!"
1225 RETURN
1230 REM- SHOW HAZARDS AND LOCATION
1240 PRINT
1250 FOR J=2 TO 6
1260 FOR K=1 TO 3
1270 IF S(L(1),K) <> L(J) THEN 1340
1280 ON J-1 GOTO 1290,1310,1310,1330,1330
1290 PRINT "I SMELL A WUMPUS!"
1300 GOTO 1340
1310 PRINT "I FEEL A DRAFT!"
1320 GOTO 1340
1330 PRINT "BATS NEARBY!"
1340 NEXT K
1350 NEXT J
1360 PRINT "YOU ARE IN ROOM ";L(1)
1370 PRINT "TUNNELS LEAD TO ";S(L,1);S(L,2);S(L,3)
1380 PRINT
1390 RETURN
1400 REM- CHOOSE OPTION
1410 GOTO 1450
1420 PRINT "ERROR"
1440 PRINT
1450 PRINT "SHOOT OR MOVE ";
1460 INPUT I$
1470 PRINT
1490 IF LEFT$(I$,1) <> "S" THEN 1520
1500 O=1
1510 RETURN
1520 IF LEFT$(I$,1) <> "M" THEN 1420
1530 O=2
1540 RETURN
1550 REM- ARROW ROUTINE
1560 F=0
1570 REM- PATH OF ARROW
1590 GOTO 1630
1600 PRINT "ERROR"
1620 PRINT
1630 PRINT "NO. OF ROOMS ";
1640 INPUT J9
1650 PRINT
1670 IF J9 < 1 OR J9 > 5 OR INT(J9) <> ABS(J9) THEN 1600
1680 FOR K=1 TO J9
1690 PRINT "ROOM #";
1700 INPUT P(K)
1710 PRINT
1730 IF P(K) > 0 AND P(K) < 21 AND INT(P(K))=ABS(P(K)) THEN 1780
1740 PRINT "ERROR"
1760 PRINT
1770 GOTO 1690
1780 NEXT K
1790 PRINT
1800 REM- SHOOT ARROW
1810 A=A-J9
1820 A9=L(1)
1830 FOR K=1 TO J9
1840 FOR K1=1 TO 3
1850 IF S(A9,K1)=P(K) THEN 1990
1860 NEXT K1
1870 REM- NO TUNNEL FOR THE ARROW
1880 A9=S(A9,FNB(1))
1890 GOTO 2000
1900 NEXT K
1910 PRINT "MISSED"
1920 REM- MOVE WUMPUS
1930 GOSUB 2070
1940 REM- AMMO CHECK
1950 IF A > 0 THEN 1970
1955 PRINT "YOU HAVE USED ALL OF YOUR ARROWS."
1960 F=-1
1970 RETURN
1980 REM- SEE IF ARROW IS AT L(1) OR L(2)
1990 A9=P(K)
2000 IF A9 <> L(2) THEN 2040
2010 PRINT "AHA! YOU GOT THE WUMPUS! HE WAS IN ROOM ";L(2)
2020 F=1
2030 RETURN
2040 IF A9 <> L(1) THEN 1900
2050 PRINT "OUCH! ARROW GOT YOU!"
2060 GOTO 1960
2070 REM- MOVE WUMPUS ROUTINE
2080 K=FNC(0)
2090 IF K=4 THEN 2140
2100 L(2)=S(L(2),K)
2110 IF L(2) <> L THEN 2140
2120 PRINT "TSK TSK TSK- WUMPUS GOT YOU!"
2130 F=-1
2140 RETURN
2150 REM- MOVE ROUTINE
2160 F=0
2170 GOTO 2210
2180 PRINT "ERROR"
2200 PRINT
2210 PRINT "WHERE TO ";
2220 INPUT L
2230 PRINT
2240 IF L < 1 OR L > 20 OR ABS(L) <> INT(L) THEN 2180
2250 FOR K=1 TO 3
2260 REM- CHECK IF LEGAL MOVE
2270 IF S(L(1),K)=L THEN 2350
2280 NEXT K
2290 IF L=L(1) THEN 2350
2300 PRINT "NOT POSSIBLE - ";
2320 PRINT
2330 GOTO 2210
2340 REM- CHECK FOR HAZARDS
2350 L(1)=L
2360 REM- WUMPUS
2370 IF L <> L(2) THEN 2430
2380 PRINT "... OOPS! BUMPED A WUMPUS!"
2390 REM- MOVE A WUMPUS
2400 GOSUB 2080
2410 IF F=0 THEN 2430
2420 REM- PIT
2430 IF L <> L(3) AND L <> L(4) THEN 2480
2440 PRINT "YYYIIIEEEE . . . FELL IN A PIT"
2450 F=-1
2460 RETURN
2470 REM- BATS
2480 IF L <> L(5) AND L <> L(6) THEN 2520
2490 PRINT "ZAP--SUPER BAT SNATCH! ELSEWHERESVILLE FOR YOU!"
2500 L=FNA(1)
2510 GOTO 2350
2520 RETURN
2530 REM- SELECT CAVE
2540 GOTO 2580
2550 PRINT "ERROR"
2570 PRINT
2580 PRINT "CAVE #(0-6) ";
2585 RESTORE
2590 INPUT N
2600 PRINT
2620 IF N<0 OR N>6 OR INT(N) <> ABS(N) THEN 2550
2630 ON N+1 GOSUB 2650,2730,2810,2890,2970,3050,3130
2640 RETURN
2650 REM- DODECAHEDRON
2670 DATA 2,5,8, 1,3,10, 2,4,12, 3,5,14, 1,4,6
2680 DATA 5,7,15, 6,8,17, 1,7,9, 8,10,18, 2,9,11
2690 DATA 10,12,19, 3,11,13, 12,14,20, 4,13,15, 6,14,16
2700 DATA 15,17,20, 7,16,18, 9,17,19, 11,18,20, 13,16,19
2710 GOSUB 3240
2720 RETURN
2730 REM- MOBIUS STRIP
2735 FOR B1=1 TO 1
2737 FOR B2=1 TO 60
2740 READ B0
2742 NEXT B2
2744 NEXT B1
2750 DATA 20,2,3, 19,1,4, 1,4,5, 2,3,6, 3,6,7
2760 DATA 4,5,8, 5,8,9, 6,7,10, 7,10,11, 8,9,12
2770 DATA 9,12,13, 10,11,14, 11,14,15, 12,13,16, 13,16,17
2780 DATA 14,15,18, 15,18,19, 16,17,20, 17,20,2, 18,19,1
2790 GOSUB 3240
2800 RETURN
2810 REM- STRING OF BEADS
2815 FOR B1=1 TO 2
2817 FOR B2=1 TO 60
2820 READ B0
2822 NEXT B2
2824 NEXT B1
2830 DATA 2,3,20, 1,3,4, 1,2,4, 2,3,5, 4,6,7
2840 DATA 5,7,8, 5,6,8, 6,7,9, 8,10,11, 9,11,12
2850 DATA 9,10,12, 10,11,13, 12,14,15, 13,15,16, 13,14,16
2860 DATA 14,15,17, 16,18,19, 17,19,20, 17,18,20, 1,18,19
2870 GOSUB 3240
2880 RETURN
2890 REM- HEX NET ON TORUS
2895 FOR B1=1 TO 3
2897 FOR B2=1 TO 60
2900 READ B0
2902 NEXT B2
2904 NEXT B1
2910 DATA 10,6,17, 6,7,18, 7,8,19, 8,9,20, 9,10,16
2920 DATA 15,2,1, 11,3,2, 12,4,3, 13,5,4, 14,1,5
2930 DATA 20,16,7, 16,17,8, 17,18,9, 18,19,10, 19,20,6
2940 DATA 5,12,11, 1,13,12, 2,14,13, 3,15,14, 4,11,15
2950 GOSUB 3240
2960 RETURN
2970 REM- DENDRITE W/ DEGENERACIES
2975 FOR B1=1 TO 4
2977 FOR B2=1 TO 60
2980 READ B0
2982 NEXT B2
2984 NEXT B1
2990 DATA 1,1,5, 2,2,5, 3,3,6, 4,4,6, 1,2,7
3000 DATA 3,4,7, 5,6,10, 8,9,9, 8,8,10, 7,9,11
3010 DATA 10,13,14, 11,13,13, 12,12,13, 11,15,16, 14,17,18
3020 DATA 14,19,20, 15,17,17, 15,18,18, 16,19,19, 16,20,20
3030 GOSUB 3240
3040 RETURN
3050 REM- ONE WAY LATTICE
3055 FOR B1=1 TO 5
3057 FOR B2=1 TO 60
3060 READ B0
3062 NEXT B2
3064 NEXT B1
3070 DATA 4,8,5, 1,5,6, 2,6,7, 3,7,8, 8,12,9
3080 DATA 5,9,10, 6,10,11, 7,11,12, 12,16,13, 9,13,14
3090 DATA 10,14,15, 11,15,16, 16,20,17, 13,17,18, 14,18,19
3100 DATA 15,19,20, 20,4,1, 17,1,2, 18,2,3, 19,3,4
3110 GOSUB 3240
3120 RETURN
3130 REM- INPUT YOUR OWN CAVE
3140 FOR J=1 TO 20
3150 PRINT "ROOM #";J;
3160 INPUT S(J,1),S(J,2),S(J,3)
3170 FOR K=1 TO 3
3180 IF S(J,K) > 0 AND S(J,K) < 21 AND INT(S(J,K))=ABS(S(J,K)) THEN 3210
3190 PRINT "***** ERROR!!!!!"
3200 GOTO 3150
3210 NEXT K
3220 NEXT J
3230 RETURN
3240 REM- INPUT CAVE
3250 FOR J=1 TO 20
3260 FOR K=1 TO 3
3270 READ S(J,K)
3280 NEXT K
3290 NEXT J
3300 RETURN
3310 END

-----------------------------------
*/
