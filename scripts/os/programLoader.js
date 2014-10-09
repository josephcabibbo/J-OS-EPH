/**
 * programLoader.js
 *
 * Allows the user to enter an "error free" program into memory for later execution
 * 	1.	Check program for errors
 * 	2.	Assign PID
 * 	3.	Create PCB and associate it to this process
 * 	4.	Load program into memory
 * 	5.	Return PID
 */

function loadProgram(priority)
{
	// Perform error checking
	var programIsValidated = validateProgram();

	if( programIsValidated && _MemoryManager.openSlotExists() )
	{
		// Create new process
		var process = createNewProcess(priority);

		// Clear memory slot contents before loading program in that slot
		if( process.slot === 1 )
			clearMemorySlotOne();
		else if( process.slot === 2 )
			clearMemorySlotTwo();
		else if( process.slot === 3 )
			clearMemorySlotThree();

		var opcodeArray = getOpcodeArray();
		var opcode = "";

		// Load program into memory starting at pcb base address
		for( var i = process.base; i < opcodeArray.length + process.base; i++)
		{
			opcode = opcodeArray[i - process.base];
			_Memory[i] = opcode.toUpperCase(); // Want to store them all in one format
		}

		// Update process status
		process.state = PROCESS_LOADED;

		// Add process to the _JobList for later execution
		_JobList[process.pid] = process;

		// Give user the associated PID and where the process was loaded to
		return [process.pid, "memory"];
	}
	else if( programIsValidated && !_MemoryManager.openSlotExists() )
	{
		/*  Load to file system  */

		// Create new process
		var process = createNewProcess(priority);

		// Get the user program text
		var programText = document.getElementById("taProgramArea").value;

		var processFilename = "process " + process.pid.toString();

		// Create file to store program
		krnFileSystemDriver.create(processFilename);
		// Write the program to disk
		krnFileSystemDriver.write(processFilename, programText);

		// Update process status
		process.state = PROCESS_ON_DISK;

		// Add process to the _JobList for later execution
		_JobList[process.pid] = process;

		// Give user the associated PID
		return [process.pid, "disk"];
	}
	else // Program errors exist
	{
		return undefined;
	}
}

function createNewProcess(priorityVal)
{
	var state = PROCESS_NEW;
	var pid   = getCurrentPID();
	var pc	  = 0; 	// First opcode in the program

	// Handle process priority values
	var priority;

	if( _Scheduler.algorithm === ROUND_ROBIN )
		priority = DEFAULT_PRIORITY;
	else if( _Scheduler.algorithm === FCFS )
		priority = pid; // lower PID values were added before higher pid processes
	else if( _Scheduler.algorithm === PRIORITY )
	{
		if( typeof priorityVal != "undefined" )
			priority = priorityVal;
		else
			priority = DEFAULT_PRIORITY;
	}

	var base;
	var limit;
	var slot;

	// Ask the _MemoryManager for the next open slot in memory
	var memorySlot = _MemoryManager.getNextOpenSlot();

	if( memorySlot )
	{
		// Change memory slot open status to false
		_MemoryManager.toggleSlotStatus(memorySlot.slotNumber);

		var base  = memorySlot.base;	// Open memory slot's base
		var limit = memorySlot.limit;	// Open memory slot's limit
		var slot  = memorySlot.slotNumber;
	}
	else
	{
		// Process is not in memory (it is on disk), so fill its info with -1
		var base  = -1;
		var limit = -1;
		var slot  = -1;
	}

	// Create new process and its associated PCB
	return (new PCB(state, pid, pc, base, limit, slot, priority));
}

// Return current PID then increment it for the next process
function getCurrentPID()
{
	return _PID++;
}

function getOpcodeArray()
{
	// Get the user program text
	var textArea = document.getElementById("taProgramArea").value;
	// Split the program into separate opcodes
	var opcodeArray = textArea.split(/\s/);

	return opcodeArray;
}