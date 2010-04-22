/*
 * Creates a monospaced text message box control, automatically
 * handling kerning, text wrap, line height, etc.
 *
 * MonoText assumes that the png containing the font is on a 
 * single line, with a line height of 12 pixels, and a single
 * pixel between characters (which can be variable width).
 * 
 * This is dependent on an accurate kerning file for the font,
 * which should be named the same as the png file, except having
 * a js extension.
 *
 * @author Andrew Petersen kirbysayshi@gmail.com
 */
function MonoText(name, canvas, width, height, showbox, boxHPadding, boxVPadding, dKerning){
	
	this.messageShowing = false;
	
	this.canvas = canvas || document.createElement('canvas');
	this.cwidth = width;
	this.cheight = height;
	this.context = canvas.getContext('2d');
	this.ipath = "../font/"+name+".png";
	this.defaultKern = dKerning;
	
	this.boxname = showbox == true ? 'ct_grey.png': false;
	this.boximage = new Image();
	
	if(this.boxname != false){
		this.boximage.src = '../images/windows/ct_grey.png';
		this.boxY = this.cheight - this.boximage.height;
		this.boxX = 0;
		this.boxHPadding = boxHPadding;
		this.boxVPadding = boxVPadding;
	}else {
		// TODO: this needs to make the text in the middle of the screen...
		
	}
	
	// this is loaded from global context...
	this.kerngrid = kerning;
	
	this.fimage = new Image();
	this.fimage.src = this.ipath;

	// holds messages in the queue. each time this.draw() is called, one message is printed
	this.mgs = [];
	
	// holds last message, for box position swapping
	this.previousMessage = '';

	return this.init();
}

MonoText.prototype = {
	init: function(){
		return this;
	},
	
	// prints the next message in the queue to the screen
	printNextMessage: function(){
		
		if(this.mgs.length > 0){
			this.previousMessage = this.mgs.shift();
		} else {
			this.previousMessage = '';
			this.messageShowing = false;
			return false;
		}

		return true;
	},
	
	draw: function(ctx){
		if(this.messageShowing == true){
			//console.log('show message');
			
			// draw box
			if(this.boxname != false){
				ctx.drawImage(this.boximage, 
									0, 0, this.boximage.width, this.boximage.height, 
									this.boxX, this.boxY, 
									this.boximage.width, this.boximage.height);
			}
			
			/*if(this.previousMessage != '')
				console.log(this.previousMessage);*/
			
			var words = this.previousMessage.split(' ');
			var col = this.boxHPadding;
			var row = this.boxY + this.boxVPadding;

			var printedLeftQuotes = false;
			
			for(var w in words){

				// if the length of this word's chars * 10 *multiplier is > the width + padding....
				if( col + words[w].length*5 > this.cwidth - (2*this.boxHPadding)){
					row += 15;
					col = 12 + this.boxHPadding;
				}

				// special keywords for special symbols
				switch(words[w]){
					case 'MUSIC':
						col += this.printChar(ctx, 'MUSIC', col, row);
						break;
					case 'HEART':
						col += this.printChar(ctx, 'HEART', col, row);
						col += this.printChar(ctx, " ", col, row);
						break;
					case '...':
						col += this.printChar(ctx, 'ELLIPSES', col, row);
						col += this.printChar(ctx, " ", col, row);
						break;
					case 'INFINITY':
						col += this.printChar(ctx, 'INFINITY', col, row);
						break;
					case '<>':
						col = 12 + this.boxHPadding;
						row += 15;
						break;
					case 'POINTRIGHT':
						col += this.printChar(ctx, 'POINTRIGHT', col, row);
						col += this.printChar(ctx, " ", col, row);
						break;
					case 'POINTLEFT':
						col += this.printChar(ctx, 'POINTLEFT', col, row);
						col += this.printChar(ctx, " ", col, row);
						break;
					case 'POINTBLANK':
						col += this.printChar(ctx, 'POINTBLANK', col, row);
						col += this.printChar(ctx, " ", col, row);
						break;
					default:
						var split = words[w].split('');

						for(var l in split){

							if(split[l] == '"' && printedLeftQuotes == true){
								// right quote
								col += this.printChar(ctx,  'RQUOTES', col, row );
								printedLeftQuotes = false;
							}else if(split[l] == '"' && printedLeftQuotes == false){
								// left quote
								col += this.printChar(ctx,  'LQUOTES', col, row );
								printedLeftQuotes = true;
							}else if(this.kerngrid[split[l]] != undefined){
								// typical char
								col += this.printChar(ctx, split[l], col, row );
							}else {
								// unrecognized character
								col += this.printChar(ctx, ' ', col, row);
							}
						}
						col += this.printChar(ctx, " ", col, row);
				}

			}
		}
	},
	
	// prints a single character to the screen at the specified coordinates
	printChar: function(ctx, character, x, y){
		var ki = this.kerngrid[character];
		ctx.drawImage(this.fimage, 
						ki.start, 0, ki.end-ki.start, 12, 
						x, y, 
						ki.end-ki.start, 12);
		return (ki.end - ki.start) + this.defaultKern; // 0.5 for slight space.
	},
	
	// adds a message to the message queue
	message: function(txt){
		this.mgs.push(txt);
		this.messageShowing = true;
	},
	
	// swaps the position of the box from either the top of the screen or the bottom
	swapPosition: function(){
		if(this.boxY != 0)
			this.boxY = 0;
		else
			this.boxY = this.cheight - this.boximage.height;
		
		if( this.previousMessage != ''){
			this.mgs.unshift(this.previousMessage);
			this.printNextMessage();
		}
	},
	
	// removes the box, in the event that no messages exist
	clear: function(){
		this.context.clearRect(0, 0, this.cwidth, this.cheight);
	}
};