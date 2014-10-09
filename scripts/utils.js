/* --------  
   Utils.js

   Utility functions.
   -------- */

function trim(str)      // Use a regular expression to remove leading and trailing spaces.
{
	return str.replace(/^\s+ | \s+$/g, "");
	/* 
	Huh?  Take a breath.  Here we go:
	- The "|" separates this into two expressions, as in A or B.
	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
    - "\s+$" is the same thing, but at the end of the string.
    - "g" makes is global, so we get all the whitespace.
    - "" is nothing, which is what we replace the whitespace with.
	*/
	
}

function rot13(str)     // An easy-to understand implementation of the famous and common Rot13 obfuscator.
{                       // You can do this in three lines with a complex regular experssion, but I'd have
    var retVal = "";    // trouble explaining it in the future.  There's a lot to be said for obvious code.
    for (var i in str)
    {
        var ch = str[i];
        var code = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0)
        {            
            code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
            retVal = retVal + String.fromCharCode(code);
        }
        else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0)
        {
            code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
            retVal = retVal + String.fromCharCode(code);
        }
        else
        {
            retVal = retVal + ch;
        }
    }
    return retVal;
}

/**
 * A utility function for getting the current time in standard format
 */
function currentTime()
{
	var dateObject = new Date();
	var hours = dateObject.getHours();
	var minutes = dateObject.getMinutes();
	var seconds = dateObject.getSeconds();
	var suffix = "AM";

	// Convert hours from military to standard format
	if( hours >= 12 )
	{
		suffix = "PM";
		hours = hours - 12;
	}
	// Handle midnight 
	if( hours == 0 ) 
	{
		hours = 12;
	}
	// Format single digit minutes
	if( minutes < 10 ) 
	{
		minutes = "0" + minutes;
	}
	// Format single digit seconds
	if( seconds < 10 )
	{
		seconds = "0" + seconds;
	}
	
	return (hours.toString() + ":" + minutes.toString() + ":" + seconds.toString() + " " + suffix);
}

/**
 * A utility function for getting the current date
 */
function currentDate()
{
	var dateObject = new Date();
	return dateObject.toLocaleDateString();
}