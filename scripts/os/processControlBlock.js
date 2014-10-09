/* ------------
   processControlBlock.js
   
   the PCB for each process
   ------------ */

function PCB (state, pid, pc, base, limit, slot, priority) 
{
	// Member variables
	this.state  	= state;	// State of the process
	this.pid		= pid;  	// Process id
	this.pc			= pc;		// Initial program counter
	this.base		= base;  	// Base memory address (starting location)
	this.limit		= limit;	// Limit memory address (maximum space for this process)
	this.slot		= slot;	    // Slot in memory (1, 2, 3)
	this.priority 	= priority; // Process priority
	
	// Registers
	this.acc = 0;
	this.x 	 = 0;
	this.y 	 = 0;
	this.z 	 = 0;
	
	// Facility to change/update values of our PCB
	this.update = function(state, pc, acc, x, y, z)
	{
		this.state = state;
		this.pc	   = pc;
		this.acc   = acc;
		this.x     = x;
		this.y     = y;
		this.z     = z;
	}
	
	// Useful for testing
	this.toString = function()
	{
		return ("Process Infromation:\t" + "Slot: "   + this.slot
									     + " Pid: "   + this.pid
									     + " Base: "  + this.base
									     + " Limit: " + this.limit);
	}
}