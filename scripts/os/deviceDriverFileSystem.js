/* ----------------------------------
   DeviceDriverFileSystem.js
   
   Requires deviceDriver.js
   
   The Kernel File System Device Driver.
   ---------------------------------- */
   
   // TODO: (for write command) return error object to tell the user why it failed? ex. no file exists of that name

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem()
{
    // Override the base method pointers.
    this.driverEntry = krnFileSystemDriverEntry;
    this.isr = null;
    
	// Main functionality
	this.format = krnFormat;
	this.create = krnCreate;
	this.write	= krnWrite;
	this.read	= krnRead;
	this.delete = krnDelete;
	this.listFiles = krnlistFiles;
	
	// Helper functions
	this.findOpenDirectoryBlock = krnFindOpenDirectoryBlock;
	this.findOpenFileBlock = krnFindOpenFileBlock;
	this.setValueOccupied = krnSetValueOccupied;
	this.getMatchingDirectory = krnGetMatchingDirectory;
	this.getAllLinkedFileBlocks = krnGetAllLinkedFileBlocks;
	this.formatLineWithKey = krnFormatLineWithKey;
	this.getOccupiedDirectories = krnGetOccupiedDirectories;
	this.fillEmptySpace = krnFillEmptySpace;
	this.parseKey = parseKey;
}

// Initialization for the File System
function krnFileSystemDriverEntry()
{
    this.status = "loaded";
	
	// Initial format to set up the File System
	krnFormat();
}

// Basic key in the file system (constructor)
function fileSystemKey(track, sector, block)
{
	// Return array in string form so it is accepted by localStorage
	return JSON.stringify([track, sector, block]);
}

// Basic value in the file system (constructor)
function fileSystemValue(occupied, track, sector, block, data)
{
	// Return array in string form so it is accepted by localStorage
	return JSON.stringify( [occupied, track, sector, block, krnFillEmptySpace(data)] );
}

/** Begin main functionality **/

function krnFormat()
{
	try
	{
		// Clear local storage before entering default key:value pairs
		localStorage.clear();
		
		var fsKey = "";
		var fsValue = "";

		// Track 0-3 (4 Tracks)
		for(var t = 0; t < 4; t++)
		{
			// Sector 0-7 (8 Sectors)
			for(var s = 0; s < 8; s++)
			{
				// Block 0-7 (8 Blocks)
				for(var b = 0; b < 8; b++)
				{
					// Create key in the format [T,S,B]
					fsKey = fileSystemKey(t, s, b);
					// Create value in the format [0|1,T,S,B,"60 BYTES OF DATA"]
					fsValue = fileSystemValue(0, -1, -1, -1, "");
					
					localStorage[fsKey] = fsValue;
				}
			}
		}
		
		// Assign the MBR to TSB[0,0,0]
		localStorage[MBR_KEY] = fileSystemValue(1, -1, -1, -1, "MBR");
		
		return true;
	}
	catch(error)
	{
		return false;
	}
}

function krnCreate(filename)
{
	// Find and save the key of the next open directory block
	var directoryKey = krnFindOpenDirectoryBlock();
	// Find and save the key of the next open file block
	var fileKey = krnFindOpenFileBlock();
	
	if( directoryKey && fileKey && filename.length < 60)
	{	
		// Set up directory block value as occupied pointing to its associated file TSB and filename
		localStorage[directoryKey] = krnSetValueOccupied(fileKey, filename);
		// Set up file block as occupied with no chain and empty data
		localStorage[fileKey] = krnSetValueOccupied(NULL_TSB, "");
		
		return true;
	}
	else
	{	
		// For keeping a record of the errors
		var errorReport = {};
		var errorCount = 0;
	
		// No directory blocks availabale
		if( !directoryKey )
		{
			errorReport[errorCount] = "There are currently no directory blocks available."
			errorCount++;
		}
		
		// No file blocks available
		if( !fileKey )
		{
			errorReport[errorCount] = "There are currently no file blocks available."
			errorCount++;
		}
		
		// Filename too large
		if( filename.length < 60 )
		{
			errorReport[errorCount] = "The size of the filename is too large."
			errorCount++;
		}
		
		return errorReport;
	}
}

function krnWrite(filename, data)
{
	// Get the occupied directory that contains the associated filename
	var directoryKey = krnGetMatchingDirectory(filename);
	
	if( directoryKey )
	{
		// Read and store the necessary file block TSB information from the directory block
		var valueArray = JSON.parse(localStorage[directoryKey]);
		
		var track  = valueArray[1];
		var sector = valueArray[2];
		var block  = valueArray[3];
		
		var fileKey = fileSystemKey(track, sector, block);
		
		// Write is an overwrite, so delete everything in the file before writing new data
		
		// See if there are any linked files to the origin file block
		var linkedFileArray = krnGetAllLinkedFileBlocks(fileKey);
		
		// Execute a format on all lines in the file chain
		for(index in linkedFileArray)
		{
			krnFormatLineWithKey( linkedFileArray[index] );
		}
			
		// Go to that file TSB and write
		if( data.length <= 60 )
		{
			localStorage[fileKey] = fileSystemValue(1, -1, -1, -1, data);
		}
		else
		{	
			// Find out how many file blocks we need
			var numBlocksNeeded = Math.ceil( data.length / 60 );
			
			var dataSegments = [];
			// Break the data into 60 (or less) byte segments
			for(var i = 0; i < numBlocksNeeded; i++)
			{
				dataSegments[i] = data.substring((i * 60), ((i + 1) *60));
			}
			
			// Fill origin file block
			//localStorage[fileKey] = fileSystemValue(1, -1, -1, -1, dataSegments[0]);
			localStorage[fileKey] = krnSetValueOccupied(NULL_TSB, dataSegments[0]);

			var currentBlockKey = "";
			// Initialize the nextKey as the current key then allow it to change in the loop
			var nextFileBlockKey = fileKey;

			// Start at 1 because we filled the origin block already
			for(var i = 1; i < dataSegments.length; i++)
			{	
				currentBlockKey = nextFileBlockKey;
				// Get the next open file block
				nextFileBlockKey = krnFindOpenFileBlock();

				// Write data in chained file block
				//localStorage[nextFileBlockKey] = fileSystemValue(1, -1, -1, -1, dataSegments[i]);
				localStorage[nextFileBlockKey] = krnSetValueOccupied(NULL_TSB, dataSegments[i]);
				
				// Link chain to origin file block
				krnLinkFileChainToParent(currentBlockKey, nextFileBlockKey);
			}
		}
		
		// Return true if a matching directory is found and the write was successful
		return true;
	}
	else
	{
		// Return false if a matching directory was not found
		return false;
		//TODO: return error object to tell the user why it failed? ex. no file exists of that name
	}
}

function krnRead(filename)
{
	try
	{
		// Get the occupied directory that contains the associated filename
		var directoryKey = krnGetMatchingDirectory(filename);
		// Read and store the file block TSB from the directory block
		var valueArray = JSON.parse( localStorage[directoryKey] );
		var track = valueArray[1];
		var sector = valueArray[2];
		var block = valueArray[3];
		
		// Put the file key (TSB) in the correct format
		var parentFileKey = fileSystemKey(track, sector, block);
		
		// See if there are any linked files to the origin file block
		var linkedFileArray = krnGetAllLinkedFileBlocks(parentFileKey);
		
		// Vars needed to pull the data from the file values
		var valueArray;
		var data;
		var dataSegmentsList = [];
		
		// Get the data of the files and put it in an array
		for(index in linkedFileArray)
		{
			valueArray = JSON.parse( localStorage[linkedFileArray[index]] );
			data = valueArray[4];
			// Trim the data of dashes (if any)
			if( data.indexOf("-") != -1 )
				data = data.substring(0, data.indexOf("-"));
			dataSegmentsList.push(data);
		}

		// Return the opcode string without commas
		return dataSegmentsList.toString().replace(/,/g, "");
	}
	catch(error)
	{
		return false;
	}
}

function krnDelete(filename)
{
	try
	{
		// Get the occupied directory that contains the associated filename
		var directoryKey = krnGetMatchingDirectory(filename);
		
		// Read and store the file block TSB from the directory block
		var valueArray = JSON.parse( localStorage[directoryKey] );
		var track = valueArray[1];
		var sector = valueArray[2];
		var block = valueArray[3];
		
		// Set the directory as open and clean its value
		localStorage[directoryKey] = fileSystemValue(0, -1, -1, -1, "");
		
		// Put the file key (TSB) in the correct format
		var parentFileKey = fileSystemKey(track, sector, block);
		
		// See if there are any linked files to the origin file block
		var linkedFileArray = krnGetAllLinkedFileBlocks(parentFileKey);
		
		// Vars needed to pull the data from the file values
		var valueArray;
		var data;
		var dataSegmentsList = [];
		
		// Execute a format on all lines in the file chain
		for(index in linkedFileArray)
		{
			krnFormatLineWithKey( linkedFileArray[index] );
		}
		
		return true;
	}
	catch(error)
	{
		return false;
	}
	
}

function krnlistFiles()
{
	try
	{
		return krnGetOccupiedDirectories();
	}
	catch(error)
	{
		return false;
	}
}

/** Begin helper functions **/

// Helper function to return all occupied directory blocks
function krnGetOccupiedDirectories()
{
	var keyIntValue = 0;
	var filenameList = [];
	var valueArray;
	var occupiedBit;
	var filename;
	
	for(key in localStorage)
	{
		keyIntValue = parseKey(key);
		
		// Ensure we are iterating through directory space only
		if( keyIntValue > 0 && keyIntValue <= 77)
		{
			valueArray = JSON.parse(localStorage[key]);
			occupiedBit = valueArray[0];
			
			if( occupiedBit === 1 )
			{
				// Get the filename from the directory value
				filename = valueArray[4];
				// Trim the filename of dashes (if any)
				if( filename.indexOf("-") != -1 )
					filename = filename.substring(0, filename.indexOf("-"));
				// Add the filenames to a list
				filenameList.push( filename );
			}
		}
	}
	
	if( filenameList.length > 0 )
		return filenameList;
	else
		return null; // If no directory blocks are open return null
}

// Helper function to execute a file system format on a given line
function krnFormatLineWithKey(key)
{
	localStorage[key] = fileSystemValue(0, -1, -1, -1, "");
}

// Helper function to retrieve all linked file TSB keys (if any)
function krnGetAllLinkedFileBlocks(parent)
{
	// Add parent key to the array first
	var fileList = [parent];
	
	// Start our iteration with the file pointed to by the parent (if any)
	var currentKey = parent;
	
	while( currentKey != NULL_TSB )
	{
		// Pull out the TSB the parent is pointing to
		var parentValueArray = JSON.parse( localStorage[currentKey] );
		var track = parentValueArray[1];
		var sector = parentValueArray[2];
		var block = parentValueArray[3];
		
		// Format the key in the correct format
		var childKey = fileSystemKey(track, sector, block);
		
		if( childKey != NULL_TSB)
		{
			fileList.push(childKey);
		}
		
		// Set our current key as the key we most recently processed
		currentKey = childKey;
	}
	
	return fileList;
}

// Helper function to change a parent file block to point to it next chain link
function krnLinkFileChainToParent(parentKey, childKey)
{
	// Get necessary parent values
	var originalValueArray = JSON.parse(localStorage[parentKey]);
	var data = originalValueArray[4];
	
	// Get necessary child values
	var childKeyArray = JSON.parse(childKey);
	var track  = childKeyArray[0];
	var sector = childKeyArray[1];
	var block  = childKeyArray[2];
	
	// Update parent value to reflect a pointer to its child
	localStorage[parentKey] = fileSystemValue(1, track, sector, block, data);
}


// Helper function to find the next open directory block
function krnFindOpenDirectoryBlock()
{
	var keyIntValue = 0;
	var valueArray;
	var occupiedBit;
	
	for(key in localStorage)
	{
		keyIntValue = parseKey(key);
		
		// Ensure we are iterating through directory space only
		if( keyIntValue >= 0 && keyIntValue <= 77)
		{
			valueArray = JSON.parse(localStorage[key]);
			occupiedBit = valueArray[0];
			
			if( occupiedBit === 0 )
			{
				// Return the TSB location of the open directory block
				return( key );
			}
		}
	}
	
	// If no directory blocks are open return null
	return null;
}

// Helper function to find the next open file block
function krnFindOpenFileBlock()
{
	var keyIntValue = 0;
	var valueArray;
	var occupiedBit;
	
	for(key in localStorage)
	{
		keyIntValue = parseKey(key);
		
		// Ensure we are iterating through file space only
		if( keyIntValue >= 100 && keyIntValue <= 300)
		{
			valueArray = JSON.parse(localStorage[key]);
			occupiedBit = valueArray[0];
			
			if( occupiedBit === 0 )
			{
				// Return the TSB location of the open file block
				return( key );
			}
		}
	}
	
	// If no file blocks are open return null
	return null;
}

// Helper function to find an occupied directory with matching filename
function krnGetMatchingDirectory(filename)
{
	var keyIntValue = 0;
	var valueArray;
	var occupied;
	var data;
	var storedFilename;
	
	// Iterate through occupied directories to find matching filename
	for(key in localStorage)
	{
		keyIntValue = parseKey(key);
		
		// Ensure we are iterating through directory space only
		if( keyIntValue >= 0 && keyIntValue <= 77 )
		{
			valueArray = JSON.parse(localStorage[key]);
			occupied = valueArray[0];
			data = valueArray[4];

			if( occupied === 1 )
			{
				// Pull filename from the directory data
				storedFilename = data.substring(0, data.indexOf("-"));
				// If key is found with matching filename return that key
				if( filename === storedFilename )
					return key;
			}
		}
	}
	
	// Return null if directory section is fully open or filename doesnt exist
	return null;
}

// Helper function to create an occupied FS value with the appropriate TSB pointer and data
function krnSetValueOccupied(key, data)
{
	// Get the key in array form
	var valueArray = JSON.parse(key);
	
	var track  = valueArray[0];
	var sector = valueArray[1];
	var block  = valueArray[2];
	
	// Return a new value with an occupied status with an appropriate TSB pointer and data
	return ( fileSystemValue(1, track, sector, block, data) );
}

// Helper function to pad all empty bytes of data with dashes
function krnFillEmptySpace(data)
{
	// Determine how many bytes of data we have
	var bytesOfData = data.length;

	// Fill any empty bytes with a dash
	for( var i = bytesOfData; i < 60; i++)
	{
		data += "-";
	}
	
	return data;
}

// Helper function to strip a key down to just numbers and convert it to an int
function parseKey(key)
{
	// Remove brackets and commas
	key = key.replace(/\]|\[|,/g, "");
	// Convert key to an integer
	key = parseInt(key);
	
	return key;
}