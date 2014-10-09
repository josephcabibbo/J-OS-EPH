/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.

    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
}

// TODO: Implement "up" key to bring last command on the current line

function krnKbdDispatchKeyPress(params)
{
    // Parse the params
    var keyCode = params[0];
    var isShifted = params[1];
	
	// Logging
    //krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
	
    var chr = "";
	
	if( isShifted )
	{
		// Alphabet (UPPERCASE)
		if( (keyCode >= 65) && ( keyCode <= 90) )
		{
			chr = String.fromCharCode(keyCode);
			_KernelInputQueue.enqueue(chr);
		}
		// Punctuation
		else if( (keyCode>= 186) && (keyCode <= 222) )
		{
			switch(keyCode)
			{
				case 186: chr = String.fromCharCode(58);  break; // :
				case 187: chr = String.fromCharCode(43);  break; // +
				case 188: chr = String.fromCharCode(60);  break; // <
				case 189: chr = String.fromCharCode(95);  break; // _
				case 190: chr = String.fromCharCode(62);  break; // >
				case 191: chr = String.fromCharCode(63);  break; // ?
				case 219: chr = String.fromCharCode(123); break; // {
				case 220: chr = String.fromCharCode(124); break; // |
				case 221: chr = String.fromCharCode(125); break; // }
				case 222: chr = String.fromCharCode(34);  break; // "
			}
			
			_KernelInputQueue.enqueue(chr);
		}
		// Digits
		else if( (keyCode >= 48) && (keyCode <= 57) )
		{
			switch(keyCode)
			{
				case 48: chr = String.fromCharCode(41); break; // )
				case 49: chr = String.fromCharCode(33); break; // !
				case 50: chr = String.fromCharCode(64); break; // @
				case 51: chr = String.fromCharCode(35); break; // #
				case 52: chr = String.fromCharCode(36); break; // $
				case 53: chr = String.fromCharCode(37); break; // %
				case 54: chr = String.fromCharCode(94); break; // ^
				case 55: chr = String.fromCharCode(38); break; // &
				case 56: chr = String.fromCharCode(42); break; // *
				case 57: chr = String.fromCharCode(40); break; // (
			}
			
			_KernelInputQueue.enqueue(chr);
		}
		// Space, Enter, Backspace
		else if( keyCode == 32 || keyCode == 13 || keyCode == 8 )
		{
			chr = String.fromCharCode(keyCode);
			_KernelInputQueue.enqueue(chr); 
		}
		else if(keyCode != 16) // Show error if keyCode does not match any of the predefined conditions (exclude shift)
		{
			showError("You have pressed an unimplemented key"); // Requires Utils.js for showError() function.
		}
	}
	else if( ! isShifted)
	{
		// Alphabet (lowercase)
		if( (keyCode >= 65) && ( keyCode <= 90) )
		{
			// Convert to lowercase letter
			chr = String.fromCharCode(keyCode + 32);
			_KernelInputQueue.enqueue(chr);
		}
		// Punctuation
		else if( (keyCode>= 186) && (keyCode <= 222) )
		{
			switch(keyCode)
			{
				case 186: chr = String.fromCharCode(59); break; // ;
				case 187: chr = String.fromCharCode(61); break; // =
				case 188: chr = String.fromCharCode(44); break; // ,
				case 189: chr = String.fromCharCode(45); break; // -
				case 190: chr = String.fromCharCode(46); break; // .
				case 191: chr = String.fromCharCode(47); break; // /
				case 219: chr = String.fromCharCode(91); break; // [
				case 220: chr = String.fromCharCode(92); break; // \
				case 221: chr = String.fromCharCode(93); break; // ]
				case 222: chr = String.fromCharCode(39); break; // '
			}
			
			_KernelInputQueue.enqueue(chr);
		}
		// Digits
		else if( (keyCode >= 48) && (keyCode <= 57) )
		{
			chr = String.fromCharCode(keyCode);
			_KernelInputQueue.enqueue(chr); 
		}
		// Space, Enter, Backspace, "up" button
		else if( keyCode == 32 || keyCode == 13 || keyCode == 8 || keyCode == 38)
		{
			chr = String.fromCharCode(keyCode);
			_KernelInputQueue.enqueue(chr); 
		}
		// Does not match any of the above cases (ignore shift [16])
		else if(keyCode != 16)
		{
			// An unimplemented key was pressed, shutdown the OS?
			shellBSOD();
		}
	}
}
