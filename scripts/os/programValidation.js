/* ------------
   programValidation.js
   
   This code checks the user program for errors to ensure it is a valid program
   ------------ */

// An object that contains all generated errors to later be outputed
var errorLog = {}   
var errorCount = 0;
   
function validateProgram()
{
	// Get the user program text
	var textArea = document.getElementById("taProgramArea").value;	
	
	// Test the program format to ensure valid formatting
	var isValidFormat = (/^[0-9a-f]{2}( [0-9a-f]{2})*$/i.test(textArea));
	/*
	 *          ^        -> beginning of string
	 *     [0-9a-f]      -> two characters of 0-9, A-F, or a-f
	 * ( [0-9a-f]{2})*   -> zero or more instances of (one space followed by two 
	 *						characters of 0-9, A-F, or a-f)
	 *          $        -> end of string ~ ensures there are no other characters 
	 *						between the last two hex values and the end of string
	 *          i        -> case insensitive (A-F and a-f are valid)
	*/
	
	
	
	// Split the program into separate opcodes
	var opcodeArray = textArea.split(/\s/);
	
	// Test the program to ensure it constains valid opcodes
	//var isValidOpcode = (/^[0-9]{2}|A[9D2E0C]|[86]D|E[ACE]|D0|FF$/i);
	/*
	 *     ^           -> beginning of string
	 *     [0-9]{2}    -> two values of [0-9]
	 *	   |A[9D2E0C]  -> OR A9, AD, A2, AE, A0, AC
	 *	   |[86]D	   -> OR 8D, 6D
	 *	   |E[ACE]     -> OR EA, EC, EE
	 *	   |D0|FF	   -> OR D0 OR FF
	 *     $           -> end of string ~ ensures there are no other characters 
	 *					  between the opcode and the end of string
	 *     i           -> case insensitive (A-F and a-f are valid)
	*/
	
	//var containsValidOpcodes = true;
	//var opcode = "";
	
	/*
	for(index in opcodeArray)
	{
		opcode = opcodeArray[index];
		
		if( ! isValidOpcode.test(opcode) && opcode != "")
		{
			containsValidOpcodes = false;
		}
	}*/
	
	if( isValidFormat && opcodeArray.length < MEMORY_BLOCK_SIZE ) 
	{	
		log("\nNo compilation errors found, program loaded to memory...\n\n");
		return true;
	} 
	else 
	{
		var programErrorsExist = findProgramErrors(opcodeArray);
		
		if( programErrorsExist )
			displayProgramErrors();
		
		// Reset errorLog and errorCount to prevent the same errors from being shown twice
		errorLog = {};
		errorCount = 0;
		
		return false;
	}
}

function findProgramErrors(opcodeArray)
{
	// ** Get the user program text **
	var textArea = document.getElementById("taProgramArea").value;
	
	// ** Make sure text area is not empty or full of just spaces **
	var isOnlySpaces = (/^\s+$/).test(textArea);
	/*
	 *  ^   -> beginning of string
	 * \s+  -> one or more instances of a space, tab, or line break
	 *  $   -> end of string
	 */

	if( ! textArea || isOnlySpaces)
	{
		errorLog[errorCount] = ("Text area cannot be empty...");
		errorCount++;
		
		return true; // No need to process any further errors if text area is empty
	}
	
	// ** Make sure there is not more than one space separating opcodes **
	var invalidSpacing = (/ {2,}/).test(textArea);
	/*
	 * / {2,}/ -> two or more spaces
	 */
	 
	if(invalidSpacing)
	{
		errorLog[errorCount] = ("Only single spaces accepted...");
		errorCount++;
	}
	
	// ** Make sure user program size is not > memory block size (255) **
	if( opcodeArray.length > MEMORY_BLOCK_SIZE)
	{
		errorLog[errorCount] = ("Program too large, must be < 255 bytes...");
		errorCount++;
	}
	
	// ** Make sure the opcodes are valid hex pairs ** 
	var isHexPair = (/^[0-9a-f]{2}$/i);

	var opcode = "";
	
	for(index in opcodeArray)
	{
		opcode = opcodeArray[index];
		
		// Invalid hex pair
		if ( !isHexPair.test(opcode) && opcode != "" )
		{
			errorLog[errorCount] = (opcode + " is not a valid hex pair.");
			errorCount++;
		}
	}
	
	if( errorLog )
		return true;
}

function displayProgramErrors()
{
	if( errorCount )
	{
		log("\n*******************************************************************\n\n");
		
		for(var i = 0; i < errorCount; i++)
		{
			if( i == errorCount - 1) // Just for formatting OCD
				log("\t" + errorLog[i]);
			else
				log("\n\t\t\t" + errorLog[i]);
		}
		
		log("\nCompiler Errors:");
		
		log("\n*******************************************************************");
	}
}


function log(str)
{
	taLog = document.getElementById("taLog");
    taLog.value = str + taLog.value; // add to top
}