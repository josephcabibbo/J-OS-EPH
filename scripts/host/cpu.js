/* ------------
   CPU.js

   Requires global.js.

   Routines for the host CPU simulation, NOT for the OS itself.
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book:
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function cpu()
{
    this.PC    = 0;     // Program Counter
    this.Acc   = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;

    this.init = function()
    {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;
        this.isExecuting = false;
    }

	this.update = function(pc, acc, x, y, z)
	{
		this.PC    = pc;
        this.Acc   = acc;
        this.Xreg  = x;
        this.Yreg  = y;
        this.Zflag = z;
	}

	// Called every clock cycle when CPU isExecuting
    this.cycle = function()
    {
		// This check is only relevent if we try to run a process from the filesystem before any
		// processes in memory.
		// Determine if we need to perform a rollIn / rollOut (process not in memory)
		// If process slot is -1 it is contained in the filesystem
		if( _CurrentProcess.slot === -1 )
		{
			// Only roll out if there are no open slots in memory
			if( !_MemoryManager.openSlotExists() )
			{
				// This is a case where we runall, and our first process is in the filesystem
				if( _ReadyQueue.size() > 0 )
					_MemoryManager.rollOut(_ReadyQueue.getItem(0)); // Grab the 1st item from the memory slots to roll out
				// This is a case where we call a single run <PID> on a process in the filesystem
				else
				{
					var indexToRoll;
					// Try to find a process i memory to roll out
					for(index in _JobList)
                    {
                        if( _JobList[index].slot != -1 )
							indexToRoll = index;
                    }

					_MemoryManager.rollOut(_JobList[indexToRoll]);
				}
			}
			// Roll in the process from the filesystem into the rolled out memory slot
			_MemoryManager.rollIn(_CurrentProcess);
		}

		// Determine when we need a context switch for the selected scheduling algorithm
		if( _Scheduler.algorithm === ROUND_ROBIN )
		{
			// Context switch if the current process has exceeded quantum
			if( _CycleCount > RR_Quantum )
			{
				// Initiate a context switch to the next process
				_Scheduler.contextSwitch();
			}
		}
		else if( _Scheduler.algorithm === FCFS || _Scheduler.algorithm === PRIORITY )
		{
			// Context switch if the current process has finished executing (non preemptive)
			if( _CurrentProcess.state === PROCESS_TERMINATED )
			{
				// Initiate a context switch to the next process
				_Scheduler.contextSwitch();
			}
		}

		// Fetch and execute next instruction
		this.execute( this.fetch() );

		krnTrace("CPU cycle");

		// Only relevent for Round Robin scheduling
		_CycleCount++;

		// Display "real time" CPU values
		updateCPUDisplay();
	}

	// Fetch instruction from memory at location [PC]
	this.fetch = function()
	{
		var relocationValue = _MemoryManager.getRelocationValue();
		return _Memory[this.PC + relocationValue];
	}

	// Execute instruction and necessary operands (if any)
	this.execute = function(opcode)
	{
		switch(opcode)
		{
			case "A9": 	loadAccImmediate(); 	break;
			case "AD": 	loadAccDirect();		break;
			case "8D":	storeAccInMem();		break;
			case "6D":	addWithCarry();			break;
			case "A2":	loadXRegWithConst();	break;
			case "AE":	loadXRegFromMem();		break;
			case "A0":	loadYRegWithConst();	break;
			case "AC":	loadYRegFromMem();		break;
			case "EA":	noOperation();			break;
			case "00": 	sysBreak();				break;
			case "EC":  compareXReg();			break;
			case "D0":	branchXBytes();			break;
			case "EE":	incByteValue();			break;
			case "FF": 	sysCall();				break;

			default: 	sysBreak();				break;
		}
	}
}

// A9
function loadAccImmediate()
{
	// Place the next byte in memory in the ACC
	//_CPU.Acc = _MemoryManager.getNextByte();

	// Place the decimal conversion of next byte in memory in the ACC
	_CPU.Acc = parseInt( _MemoryManager.getNextByte(), 16 );
	// Increment PC
	_CPU.PC++; // Increment from A9
}

// AD
function loadAccDirect()
{
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate the hex address in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Place contents of the memory location in the ACC
		_CPU.Acc = parseInt( _Memory[decAddress] );
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment PC
	_CPU.PC++; // Increment from AD
}

// 8D
function storeAccInMem()
{
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate them in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Convert value of ACC to hex
		var hexForm = _CPU.Acc.toString(16).toUpperCase();
		// Format byte properly
		if( hexForm.length === 1)
			hexForm = "0" + hexForm;
		// Place value of ACC in hex byte form in memory
		_Memory[decAddress] = hexForm;
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment the PC
	_CPU.PC++; // Increment from 8D
}

// 6D
function addWithCarry()
{
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate them in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Add contents of the memory location and the contents of the ACC
		_CPU.Acc += parseInt( _Memory[decAddress], 16 );
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment the PC
	_CPU.PC++; // Increment from 6D
}

// A2
function loadXRegWithConst()
{
	// Place the decimal conversion of next byte in memory in the X register
	_CPU.Xreg = parseInt( _MemoryManager.getNextByte(), 16 );
	// Increment PC
	_CPU.PC++; // Increment from A2
}

// AE
function loadXRegFromMem()
{
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate them in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Place contents of the memory location (in decimal form) in the x register
		_CPU.Xreg = parseInt( _Memory[decAddress], 16 );
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment the PC
	_CPU.PC++; // Increment from AE
}

// A0
function loadYRegWithConst()
{
	// Place the next byte in memory in the Y register
	_CPU.Yreg = _MemoryManager.getNextByte();
	// Increment PC
	_CPU.PC++; // Increment from A0
}

// AC
function loadYRegFromMem()
{
	// Get relocation value
	var relocationValue = _MemoryManager.getRelocationValue();
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate them in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Place contents of the memory location in the y register
		_CPU.Yreg = parseInt( _Memory[decAddress], 16 );
		//_CPU.Yreg = _Memory[decAddress];
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment the PC
	_CPU.PC++; // Increment from AC
}

// EA
function noOperation()
{
	// Increment PC
	_CPU.PC++;
}

// 00
function sysBreak()
{
	// Update the process's PCB to match the current state of the CPU
	_CurrentProcess.update(PROCESS_TERMINATED, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
	// Change memory slot open status to true
	_MemoryManager.toggleSlotStatus(_CurrentProcess.slot);

	// Do not stop CPU execution if there are more processes in need of CPU time
	if( _ReadyQueue.peek() )
    {
		// Force a context switch to the next process
		_Scheduler.contextSwitch();
    }
	else // Stop CPU execution because there are no more processes
	{
		// Change status of the CPU
	    _CPU.isExecuting = false;
	}
}

// EC
function compareXReg()
{
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate them in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Compare contents of the memory location with the x reg
		// Set z flag if they are equal
		_CPU.Zflag = ( parseInt( _Memory[decAddress] ) === _CPU.Xreg ) ? 1 : 0;
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment the PC
	_CPU.PC++; // Increment from EC
}

// D0
function branchXBytes()
{
	if( _CPU.Zflag === 0 )
	{
		// Get next byte (Our total branch-ahead value)
		var branchValue = parseInt( _MemoryManager.getNextByte(), 16 );

		// Add branch value to the PC
		_CPU.PC += branchValue;

		// Check to see that we havent gone "around" our memory block (past 255)
		if( _CPU.PC > 255 )
		{
			_CPU.PC -= 256;
		}

		// Increment PC
		_CPU.PC++;
	}
	else
	{
		_CPU.PC += 2; // Just because we do not want to process D0's operand
	}
}

// EE
function incByteValue()
{
	// Get next two bytes in memory
	var byteOne = _MemoryManager.getNextByte();
	var byteTwo = _MemoryManager.getNextByte();
	// Concatenate them in the correct order
	var hexAddress = (byteTwo + byteOne);
	// Translate hex address into address readable by my OS memory
	var decAddress = _MemoryManager.translateAddress(hexAddress);
	// Make sure it is not out of bounds (ie. in that block and memory address exists)
	if( _MemoryManager.isValidAddress(decAddress) )
	{
		// Convert to decimal
		var decForm = parseInt( _Memory[decAddress], 16 );
		// Increment
		decForm++;
		// Convert back to hex
		var hexForm = decForm.toString(16).toUpperCase();
		// Format byte properly
		if( hexForm.length === 1)
			hexForm = "0" + hexForm;
		// Place in memory
		_Memory[decAddress] = hexForm;

		// TODO: prevent FF from being incremented?
	}
	else
	{
		// Halt the OS
		simBtnHaltOS_click();
		// Show error in log
		log("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
		// Throw error
		throw new Error("\nRuntime Error: The requested address, " + hexAddress + ", is not in slot " + _CurrentProcess.slot + "\n\n");
	}
	// Increment the PC
	_CPU.PC++;
}

// FF
function sysCall()
{
	// Print the integer stored in the Y reg
	if( _CPU.Xreg === 1 )
	{
		// Get value in the Y register, turn it into an int (to strip the 0?), then back into a string
		var value = parseInt( _CPU.Yreg ).toString();

		for( var i = 0; i < value.length; i++)
		{
			_StdIn.putText( value.charAt(i) );
		}

		// Advance Line
		_StdIn.advanceLine();
		// Put prompt
		_StdIn.putText(">");
	}
	// Print the 00-terminated string stored at the
	//	address in the Y register
	else if( _CPU.Xreg === 2 )
	{
		// Translate hex address in the Y register into address readable by my OS memory
		var decAddress = _MemoryManager.translateAddress( _CPU.Yreg );
		// "00" terminated string
		var sentinelValue = "00";
		// Get first byte of the string
		var currentByte = _Memory[decAddress];

		var keyCode = 0;
		var chr = "";

		while( currentByte != sentinelValue )
		{
			// Turn byte into a decimal integer
			keyCode = parseInt( currentByte, 16 );
			// then do -> chr = String.fromCharCode(keyCode);
			chr = String.fromCharCode(keyCode);
			// then _StdIn.putText(chr);
			_StdIn.putText(chr);
			// Increment the address
			decAddress++;
			// Get next byte
			currentByte = _Memory[decAddress];
		}
		// Advance Line
		_StdIn.advanceLine();
		// Put prompt
		_StdIn.putText(">");
	}

	_CPU.PC++; // One opcode processed
}
