/**
 * 	hardwareServices.js
 *
 * 	Hardware simulation services
 */

function updateReadyQueueDisplay()
{
	var numProcesses = _ReadyQueue.size();

	// Only allow the first three processes in the Ready queue to display
	if( numProcesses > 3 )
		numProcesses = 3;

	var process = null;

	clearReadyQueueDisplay();

	for(var i = 0; i < numProcesses; i++)
	{
		// Get handle to the slot elements
		var elements = document.getElementsByName("RQ" + (i + 1)); // RQ1, RQ2, RQ3

		process = _ReadyQueue.getItem(i);

		elements[0].innerHTML = process.pid;						// PID
		elements[1].innerHTML = translateState(process.state);	    // State
		elements[2].innerHTML = formatInHex(process.base, 4);		// Base address
		elements[3].innerHTML = formatInHex(process.limit, 4);		// Limit address
	}
}

function clearReadyQueueDisplay()
{
	for( var i = 0; i < 3; i++)
	{
		// Get handle to the slot elements
		var elements = document.getElementsByName("RQ" + (i + 1)); // RQ1, RQ2, RQ3

		elements[0].innerHTML = "&nbsp;";
		elements[1].innerHTML = "&nbsp;";
		elements[2].innerHTML = "&nbsp;";
		elements[3].innerHTML = "&nbsp;";
	}
}

function updateCPUDisplay()
{
	var elements = document.getElementsByName("cpuData");

	elements[0].innerHTML = formatInHex(_CPU.PC, 3);	// PC
	elements[1].innerHTML = _CPU.Acc;					// ACC
	elements[2].innerHTML = _CPU.Xreg;					// X
	elements[3].innerHTML = _CPU.Yreg;					// Y
	elements[4].innerHTML = _CPU.Zflag;					// Z
}

// Clear CPU values in between processes
function clearCPU()
{
    _CPU.PC    = 0;     // Program Counter
    _CPU.Acc   = 0;     // Accumulator
    _CPU.Xreg  = 0;     // X register
    _CPU.Yreg  = 0;     // Y register
    _CPU.Zflag = 0;     // Z-ero flag
}

function translateState(numericState)
{
	switch(numericState)
	{
		case 0: return "NEW"; break;
		case 1:	return "LOADED"; break;
		case 2: return "READY"; break;
		case 3: return "RUNNING"; break;
		case 4: return "TERMINATED"; break;
		case 5: return "ON DISK"; break;
	}
}

function formatInHex(baseTenNumber, desiredLength)
{
	var hexValue = baseTenNumber.toString(16).toUpperCase();

	// If our process is on disk display -1 as its base
	if( baseTenNumber === -1 )
		return baseTenNumber;

	var addOn = "";

	if( desiredLength === 4 )
	{
		for( var i = hexValue.length; i < 4; i++)
		{
			addOn += "0";
		}
	}
	else if( desiredLength === 3 )
	{
		for( var i = hexValue.length; i < 3; i++)
		{
			addOn += "0";
		}
	}

	return ("$" + addOn + hexValue);
}

function switchStorageDisplay()
{
	// Display the appropriate storage selection
	if( _FileSystemDisplayCells === null )
		createFSTable();
	else if( _MemoryDisplayCells === null )
		createMemoryTable();

	// Change header to appropriate label
	var label = document.getElementById("hardwareLabel");
	label.innerHTML = (label.innerHTML === "Memory Display") ? "File System Display" : "Memory Display";

	// Change button to display appropriate text
	var button = document.getElementById("btnChangeStorageDisplay");
	button.value = (button.value === "View File System") ? "View Memory" : "View File System";
}

function createMemoryTable()
{
    var memoryTable = document.getElementById("storageTable");

    // Clear contents of the table
	while(memoryTable.hasChildNodes())
	{
		memoryTable.removeChild(memoryTable.firstChild);
	}

	// Null the file system table
	_FileSystemDisplayCells = null;

	// Re-draw contents
    var rows = [];
    var cells = [];

    for( var i = 0; i < 96; i++ )
    {
		if(i === 0 || i === 32 || i === 64) // Color the first row of each memory block to signify a separation
		{
			rows[i] = memoryTable.insertRow(i);
			rows[i].style.backgroundColor = "silver";
		}
		else // Insert normal row
		{
			rows[i] = memoryTable.insertRow(i);
		}

		// Cells per row
		cells[i] = [];

        for( var x = 0; x < 9; x++ )
        {
			// Create a header cell for the first column and a normal table cell for the other 8
            cells[i][x] = document.createElement(( x === 0 ) ? "th" : "td");
			// Fill cells in column 0 with memory addresses and the other 8 with memory content
			if( x === 0 )
				cells[i][x].innerHTML = formatInHex((i * 8), 3);
			else
				cells[i][x].innerHTML = "&nbsp;";
			// Add cells to the row
            rows[rows.length - 1].appendChild(cells[i][x]);
        }
    }

	// Assign the two dimensional array for updating
	_MemoryDisplayCells = cells;
}

function updateMemoryDisplay()
{
	// Table format is cells[row][col]

	var memoryIndex = 0;

	// Rows
	for( var row = 0; row < 96; row++ )
	{
		// Columns (start at 1 because column 0 is addresses)
		for( var col = 1; col < 9; col++)
		{
			// Fill in each columns with memory content
			_MemoryDisplayCells[row][col].innerHTML = _Memory[memoryIndex];
			memoryIndex++;
		}
	}
}

function createFSTable()
{
    var fsTable = document.getElementById("storageTable");

    // Clear contents of the table
	while(fsTable.hasChildNodes())
	{
		fsTable.removeChild(fsTable.firstChild);
	}

	// Null the memory table
	_MemoryDisplayCells = null;

	// Re-draw contents
    var rows = [];
    var cells = [];

    for( var i = 0; i < localStorage.length; i++ )
    {
		rows[i] = fsTable.insertRow(i);

		rows[i].style.fontSize = "6.5pt";

		// Cells per row
		cells[i] = [];

        for( var x = 0; x < 2; x++ )
        {
			// Create a header cell for the first column and a normal table cell for the other 8
            cells[i][x] = document.createElement(( x === 0 ) ? "th" : "td");
			// Fill cells in column 0 with the key and column two with the value
			if( x === 0 )
				cells[i][x].innerHTML =  localStorage.key(i);
			else
				cells[i][x].innerHTML = "&nbsp;";
			// Add cells to the row
            rows[rows.length - 1].appendChild(cells[i][x]);
        }
    }

	// Assign the two dimensional array for updating
	_FileSystemDisplayCells = cells;
}

function updateFileSystemDisplay()
{
	// Table format is cells[row][col]
	var row = 0;

	// Fill table content
	for( key in localStorage )
	{
		// Fill in each column with filesystem content
		_FileSystemDisplayCells[row][1].innerHTML = localStorage[key].replace(/\]|\[/g, "");
		row++;
	}

}

function clearMemorySlotOne()
{
	for( var i = _MemoryManager.memoryMap.slotOne.base; i < _MemoryManager.memoryMap.slotOne.limit; i++)
	{
		_Memory[i] = "00";
	}
}

function clearMemorySlotTwo()
{
	for( var i = _MemoryManager.memoryMap.slotTwo.base; i < _MemoryManager.memoryMap.slotTwo.limit; i++)
	{
		_Memory[i] = "00";
	}
}

function clearMemorySlotThree()
{
	for( var i = _MemoryManager.memoryMap.slotThree.base; i < _MemoryManager.memoryMap.slotThree.limit; i++)
	{
		_Memory[i] = "00";
	}
}