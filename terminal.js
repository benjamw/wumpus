/*
	terminal.js: Terminal-like User Interface
	Copyright (C) 2006 Natsuhiro Ichinose <ichinose@genome.ist.i.kyoto-u.ac.jp>
	http://www.genome.ist.i.kyoto-u.ac.jp/~ichinose/jsterm/
	License: GPL's
	$Id: terminal.js,v 1.3 2006/04/21 18:27:15 ichinose Exp $
*/

var Terminal = (function( ) {

	function getKey(e) {
		if (document.all) {
			return event.keyCode;
		}
		else if (document.getElementById) {
			return (0 !== e.keyCode) ? e.keyCode : e.charCode;
		}
		else if (document.layers) {
			return e.which;
		}
	}

	function cancelKey(e) {
		if (e.preventDefault) {
			e.preventDefault( );
		}

		if (e.stopPropagation) {
			e.stopPropagation( );
		}

		e.cancelBubble = true;
		e.returnValue = false;
	}

	function scrollBottom( ) {
		document.body.scrollTop = document.body.scrollHeight;
		window.scrollTo(0, document.body.scrollHeight);
	}

	function CommandHist( ) {
		this.hist = [];
		this.current = "";
		this.pos = 0;

		this.prev = function(current) {
			if (this.pos == this.hist.length) {
				this.current = current;
			}

			if (0 < this.pos) {
				--this.pos;
			}

			if (this.pos == this.hist.length) {
				return this.current;
			}
			else {
				return this.hist[this.pos];
			}
		};

		this.next = function(current) {
			if (this.pos == this.hist.length) {
				this.current = current;
			}

			if (this.pos < this.hist.length) {
				++this.pos;
			}

			if (this.pos == this.hist.length) {
				return this.current;
			}
			else {
				return this.hist[this.pos];
			}
		};

		this.push = function(current) {
			if (current && (0 < current.length)) {
				if (this.hist.push) {
					this.hist.push(current);
				}
				else {
					this.hist[this.hist.length] = current;
				}
			}
			this.current = "";
			this.pos = this.hist.length;
		};
	}

	function Stdout(target) {
		this.target = target;
		this.buf = "";

		this.write = function(text) {
			this.buf += text;
		};

		this.puts = function(text) {
			this.write(text + "\n");
		};

		this.flushTEXT = function( ) {
			var sp = document.createElement("span");
			var word = "", w;

			for (var i = 0; i < this.buf.length; i++) {
				w = this.buf.substr(i, 1);

				if ('\n' == w) {
					if (0 < word.length) {
						sp.appendChild(document.createTextNode(word));
						word = "";
					}

					sp.appendChild(document.createElement("br"));
				}
				else if (' ' == w) {
					if (0 < word.length) {
						sp.appendChild(document.createTextNode(word));
						word = "";
					}

					sp.appendChild(document.createTextNode("\u00a0"));
					sp.appendChild(document.createElement("wbr"));
				}
				else {
					word += w;
				}
			}

			if (0 < word.length) {
				sp.appendChild(document.createTextNode(word));
			}

			sp.className = "stdout";
			document.getElementById("stdout").insertBefore(sp, this.target);
			this.buf = "";
		};

		this.flushHTML = function( ) {
			var di = document.createElement("div");
			di.innerHTML = this.buf;
			di.className = "stdout";
			document.getElementById("stdout").insertBefore(di, this.target);
			this.buf = "";
		};

		this.flush = function( ) {
			if (0 < this.buf.length) {
				if (this.buf.match(/^[ ]*\</)) {
					this.flushHTML( );
				}
				else {
					this.flushTEXT( );
				}
			}
		};
	}

	function Stdin(element) {
		this.element = element;
		this.hist = new CommandHist( );

		this.gets = function( ) {
			return this.element.value;
		}

		this.enter = function( ) {
			this.hist.push(this.element.value);
			this.element.value = "";
		}

		this.histPrevious = function( ) {
			this.element.value = this.hist.prev(this.element.value);
		}

		this.histNext = function( ) {
			this.element.value = this.hist.next(this.element.value);
		}

		this.focus = function( ) {
			this.element.focus( );
		}
	}

	var term = {
		stdin : null,
		stdout : null,
		promptI : "?> ",
		promptC : "* ",
		prompt : "",
		header : "",
		buf : [],
		gid : function(element,id) {
				if (element.getElementById) {
					return(element.getElementById(id));
				}
				else if (element.all) {
					return element.all[id];
				}
				else if (element.layers) {
					return element.layers[id];
				}
			},
		keyHandlerList : [
				["histPrevious", true, "ctrlKey", "p", 16],
				["histPrevious", true, "ctrlKey", "", 80],
				["histPrevious", false, "shiftKey", "&", 63232],
				["histNext", true, "ctrlKey", "n", 14],
				["histNext", true, "ctrlKey", "N", 78],
				["histNext", false, "shiftKey", "(", 63233]
			],
		stdinfocus : function( ) {
				term.stdin.focus( );
			},
		initHook : function( ) { },
		init : function( ) {
				var s = term.gid(document, "stdin");

				if (document.addEventListener) {
					s.addEventListener("keypress", term.callCommand, true);
					document.body.addEventListener("click", term.stdinfocus, false);
				}
				else if (document.attachEvent) {
					s.attachEvent("onkeypress", term.callCommand);
					s.attachEvent("onkeydown", term.callCommand);
					document.body.attachEvent("onclick", term.stdinfocus);
				}
				else {
					s.onkeypress = term.callCommand;
					s.onkeydown = term.callCommand;
					document.body.onclick = term.stdinfocus;
				}

				term.stdin = new Stdin(s);
				term.stdin.focus( );
				term.stdout = new Stdout(term.stdin.element);

				if (0 < term.header.length) {
					term.stdout.puts(term.header);
				}

				term.initHook( );

				term.prompt = term.promptI;
				term.stdout.write(term.prompt);
				term.stdout.flush( );
			},
		history : function( ) {
				return term.stdin.hist.hist;
			},
		commandCallBack : function(com) { },
		callCommand : function(e) {
				if ( ! e) {
					e = event;
				}

				var key = getKey(e);
				var chara = String.fromCharCode(key);
				var bubflag = false;

				if (("keypress" == e.type) && (13 == key)) {
					var line = term.stdin.gets( );
					var reg = /\\[ ]*$/;

					term.stdout.puts(line);
					term.stdout.flushTEXT( );

					if (line.match(reg)) {
						term.buf.push(line.replace(reg, ""));
						term.prompt = term.promptC;
					}
					else {
						term.commandCallBack(term.buf.join("") + line);
						term.buf = [];
						term.prompt = term.promptI;
					}

					term.stdin.enter( );
					term.stdout.flush( );

					term.stdout.write(term.prompt);
					term.stdout.flush( );
					bubflag = true;
				}
				else {
					for (var i = 0; i < term.keyHandlerList.length; i++) {
						var l = term.keyHandlerList[i];

						if (((l[1] && e[l[2]]) || ( ! l[1] && ! e[l[2]])) && (l[3] == chara || l[4] == key)) {
							term.stdin[l[0]]( );
							bubflag = true;
							break;
						}
					}
				}

				if (bubflag) {
					cancelKey(e);
					scrollBottom( );
					return false;
				}
				else {
					return true;
				}
			}
	};

	return term;
})( );