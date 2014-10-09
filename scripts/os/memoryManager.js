/**
 *  memoryManager.js
 *
 *	An class of objects and functions to keep track and
 *	manage our 3 memory "slots" and all accesses to them
 *
 */

 function MemoryManager()
 {
	this.memoryMap = {
		slotOne:
		{
			open  : true,
			base  : 0,
			limit : 255,
			slotNumber : 1
		},

		slotTwo:
		{
			open  : true,
			base  : 256,
			limit : 511,
			slotNumber : 2
		},

		slotThree:
		{
			open  : true,
			base  : 512,
			limit : 767,
			slotNumber : 3
		}
	};

	// Return the relocation value for the currently executing process (slot of memory)
	this.getRelocationValue = function()
	{
		return _CurrentProcess.base;
	}

	this.getNextByte = function()
	{
		// Return the next byte in memory
		return _Memory[ (++_CPU.PC) + this.getRelocationValue() ];
	}

	// Translate hex addresses from the program into an address readable by my OS memory
	this.translateAddress = function(hexAddress)
	{
		return parseInt( hexAddress, 16 ) + this.getRelocationValue();
	}

	// Determine if the requested address is in bounds according to its slot in memory
	this.isValidAddress = function(address)
	{
		// Get base and limit addresses
		var base = _CurrentProcess.base;
		var limit = _CurrentProcess.limit;
		// Make sure address is between those bounds
		return ( address >= base && address <= limit );
	}

	// Ensures there is at least one open slot of memory to load a program in
	this.openSlotExists = function()
	{
		var slotOneStatus   = this.memoryMap.slotOne.open;
		var slotTwoStatus   = this.memoryMap.slotTwo.open;
		var slotThreeStatus = this.memoryMap.slotThree.open;

		// Return true if at least one slot is open
		return ( slotOneStatus || slotTwoStatus || slotThreeStatus );
	}

	// Enumerate the memory map and return the next open slot in memory (if any)
	this.getNextOpenSlot = function()
	{
		var internalNames = ["slotOne", "slotTwo", "slotThree"];

		for( var i = 0; i < internalNames.length; i++ )
		{
			if( _MemoryManager.memoryMap[internalNames[i]].open == true )
			{
				return( _MemoryManager.memoryMap[internalNames[i]] );
			}
		}

		// No slots are available return null
		return null;
	}

	// Assigns the memory map's slot open properties to true/false
	this.toggleSlotStatus = function(slotNumber)
	{
		if( slotNumber )
		{
			var slotOneStatus   = this.memoryMap.slotOne.open;
			var slotTwoStatus   = this.memoryMap.slotTwo.open;
			var slotThreeStatus = this.memoryMap.slotThree.open;

			switch(slotNumber)
			{
				// Expression explained -->   slotOneStatus = slotOneStatus ? false : true;
				// If slotOneStatus is true, set it to false
				// If slotOneStatus is false, set it to true

				case 1:
					slotOneStatus = slotOneStatus ? false : true;
					this.memoryMap.slotOne.open = slotOneStatus; // Assign correct status
					break;
				case 2:
					slotTwoStatus = slotTwoStatus ? false : true;
					this.memoryMap.slotTwo.open = slotTwoStatus; // Assign correct status
					break;
				case 3:
					slotThreeStatus = slotThreeStatus ? false : true;
					this.memoryMap.slotThree.open = slotThreeStatus; // Assign correct status
					break;
			}
		}
		else
		{
			// Do nothing
		}
	}

	// Return the contents of memory for the specified slot
	this.getMemoryContentFromSlot = function(slotNumber)
	{
		var base = -1;
		var limit = -1;
		var opcodeArray = [];

		// Get the correct base and limit information for the specified slot number
		switch( slotNumber )
		{
			case 1:
				base  = _MemoryManager.memoryMap.slotOne.base;
				limit = _MemoryManager.memoryMap.slotOne.limit;
				break;
			case 2:
				base  = _MemoryManager.memoryMap.slotTwo.base;
				limit = _MemoryManager.memoryMap.slotTwo.limit;
				break;
			case 3:
				base  = _MemoryManager.memoryMap.slotThree.base;
				limit = _MemoryManager.memoryMap.slotThree.limit;
				break;
		}

		for(var i = base; i <= limit; i++)
		{
			opcodeArray.push(_Memory[i]);
		}

		return opcodeArray;
	}

	// Swap in the process with specified filenamefrom filesystem to core memory
	this.rollIn = function(process)
	{
		log("\nRolling in process with pid " + process.pid + " to the memory");

		// Filenames are in the format "process (PID)"
		var filename = "process " + process.pid.toString();

		var opcodeString = krnFileSystemDriver.read(filename);

		// Split the program into separate opcodes
		var opcodeArray = opcodeString.split(/\s/);

		// Update process' base, limit, slot number, and state
		var memorySlot = _MemoryManager.getNextOpenSlot();

		process.base  = memorySlot.base;	// Open memory slot's base
		process.limit = memorySlot.limit;	// Open memory slot's limit
		process.slot  = memorySlot.slotNumber;
		process.state = PROCESS_LOADED; // Process is now in memory

		// Toggle slot status so it is occupied
		this.toggleSlotStatus(process.slot);

		var opcode = "";
		// Add to memory in the slot that we just rolled out
		for( var i = process.base; i < opcodeArray.length + process.base; i++)
		{
			opcode = opcodeArray[i - process.base];
			_Memory[i] = opcode.toUpperCase(); // Want to store them all in one format
		}

		// Remove from filesystem
		krnFileSystemDriver.delete(filename);
	}

	// Swap out the process in the specified slot from core memory to the filesystem
	this.rollOut = function(process)
	{
		log("\nRolling out process with pid " + process.pid + " to the file system\n");

		// Filenames are in the format "process (PID)"
		var filename = "process " + process.pid.toString();

		// Get program opcodes from memory in array form
		var opcodeArray = this.getMemoryContentFromSlot(process.slot);

		// Convert opcode array into a data string with opcodes separated by spaces
		var data = opcodeArray.join(" ");

		// Create and write the process information to the filesystem
		krnFileSystemDriver.create(filename);
		krnFileSystemDriver.write(filename, data);

		// Toggle slot status so it is open
		this.toggleSlotStatus(process.slot);

		// Clear memory slot contents of the process just rolled out
		// Clear functions found in hardwareServices.js (should probably be part of the mem manager)
		if( process.slot === 1 )
			clearMemorySlotOne();
		else if( process.slot === 2 )
			clearMemorySlotTwo();
		else if( process.slot === 3 )
			clearMemorySlotThree();

		// Update process's base, limit, slot to reflect filesystem values (-1)
		// Update state
		process.base  = -1;
		process.limit = -1;
		process.slot  = -1;
		process.state = PROCESS_ON_DISK;
	}
 }