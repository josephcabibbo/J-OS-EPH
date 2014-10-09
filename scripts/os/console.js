/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

function Console()
{
    // Properties
    this.CurrentFont      = DEFAULT_FONT;
    this.CurrentFontSize  = DEFAULT_FONT_SIZE;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = DEFAULT_FONT_SIZE;
    this.buffer = "";
	this.previousBuffer = ""; // Used for the "up" button
    
    // Methods
    this.init        = consoleInit;
    this.clearScreen = consoleClearScreen;
    this.resetXY     = consoleResetXY;
    this.handleInput = consoleHandleInput;
    this.putText     = consolePutText;
	this.removeText  = consoleRemoveText; // Used for backspace
    this.advanceLine = consoleAdvanceLine;
	this.scroll		 = consoleScroll;
}

function consoleInit()
{
    consoleClearScreen();
    consoleResetXY();
}

function consoleClearScreen()
{
	DRAWING_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
}

function consoleResetXY()
{
    this.CurrentXPosition = 0;
    this.CurrentYPosition = this.CurrentFontSize;    
}

function consoleHandleInput()
{
    while (_KernelInputQueue.getSize() > 0)
    {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
        if ( chr == String.fromCharCode(13) )  // Enter key   
        {
            // The enter key marks the end of a console command, so ...
            // ... tell the shell ... 
            _OsShell.handleInput(this.buffer);
			// Keep the previous buffer before each "enter"
			this.previousBuffer = this.buffer;
            // ... and reset our buffer.
            this.buffer = "";
        }
		else if( chr == String.fromCharCode(8) ) // Backspace
		{
			this.removeText();
		}
		else if( chr == String.fromCharCode(38) ) // "Up" key
		{
			// Nothing to copy if there were no previous commands
			if( this.previousBuffer )
			{
				for(var i = 0; i < this.previousBuffer.length; i++)
				{
					// Display each char of the previous buffer on the console
					this.putText(this.previousBuffer.charAt(i));
					// Set current buffer equal to the previous buffer for proper shell command handling
					this.buffer = this.previousBuffer;
				}
			}
		}
        // TODO: Write a case for Ctrl-C.
        else
        {
            // This is a "normal" character, so ...
            // ... draw it on the screen...
            this.putText(chr);
            // ... and add it to our buffer.
            this.buffer += chr;
        }
    }
}

function consolePutText(txt)    
{
    // My first inclination here was to write two functions: putChar() and putString().
    // Then I remembered that Javascript is (sadly) untyped and it won't differentiate 
    // between the two.  So rather than be like PHP and write two (or more) functions that
    // do the same thing, thereby encouraging confusion and decreasing readability, I 
    // decided to write one function and use the term "text" to connote string or char.
    if (txt != "")
    {
        // Draw the text at the current X and Y coordinates.
        DRAWING_CONTEXT.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, txt);
    	// Move the current X position.
        var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, txt);
        this.CurrentXPosition = this.CurrentXPosition + offset;    
    }
}

function consoleRemoveText()    
{
	var currentBuffer = this.buffer;
	// Current buffer minus last character
	var modifiedBuffer = currentBuffer.substring(0 ,currentBuffer.length - 1);
	
	var startingXPosition = 12.48;
	
	if(currentBuffer)
	{
		// Find buffer text width
		var bufferTextWidth = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, currentBuffer);
		// Clear text on current line
		DRAWING_CONTEXT.clearRect(startingXPosition, (this.CurrentYPosition - this.CurrentFontSize), bufferTextWidth, (this.CurrentFontSize + FONT_HEIGHT_MARGIN));
		// Draw the modifiedBuffer at the starting X and Y coordinates.
        DRAWING_CONTEXT.drawText(this.CurrentFont, this.CurrentFontSize, startingXPosition, this.CurrentYPosition, modifiedBuffer);
		// Set the offset equal to the x and y coordinate where the previous character was
		var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, modifiedBuffer);
        // Start new text input at the end of the "backspaced line" and add in the width of the shell prompt '>'
		this.CurrentXPosition = offset + startingXPosition;  
		// After successful visual erase, erase the backspaced character from the buffer
		this.buffer = modifiedBuffer;
	}
}

function consoleAdvanceLine()
{
    this.CurrentXPosition = 0;
    this.CurrentYPosition += DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
	
    // Replace console image minus the top line to simulate scrolling 
	// if our current position is out of sight
	if( this.CurrentYPosition >= CANVAS.height )
    {
		this.scroll();
		this.CurrentYPosition -= (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN); // Raise currentYPosition up by one line of text
    }
}

function consoleScroll()
{
	// Take screenshot of canvas minus the top line of text that we want to hide to simulate scrolling
	var canvasImage = DRAWING_CONTEXT.getImageData(0, (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN), CANVAS.width, CANVAS.height - (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN) );
	// Erase entire Console
	_Console.clearScreen();
	// Place new canvasImage on canvas
	DRAWING_CONTEXT.putImageData(canvasImage, 0, 0);
}
