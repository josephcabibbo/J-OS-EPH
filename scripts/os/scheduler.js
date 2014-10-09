/**
 * 	scheduler.js
 *
 * 	This code supports round robin scheduling and performs
 *	context switching when necessary
 */
 
 function Scheduler()
 {
	this.quantum = RR_Quantum; // Default value is 6
	
	this.algorithm = ROUND_ROBIN; // Round Robin by default
	
	this.contextSwitch = function()
	{	
		// Only perform a context switch if there are other processes waiting for CPU Time
		if( _ReadyQueue.peek() )
		{
			log("\nPerforming a context switch...\n\n"); // Found in programValidation.js
				
			// Switch from user mode to kernel mode
			_Mode = KERNEL_MODE;
			
			// Update the current process's PCB to match the current state
			//  of the CPU and add it back to the Ready Queue * ONLY IF * 
			//  the process has not been terminated (Only used for RoundRobin)
			if( _CurrentProcess.state != PROCESS_TERMINATED )
			{
				_CurrentProcess.update(PROCESS_READY,
									   _CPU.PC,
									   _CPU.Acc,
									   _CPU.Xreg,
									   _CPU.Yreg,
									   _CPU.Zflag);
									   
				_ReadyQueue.enqueue( _CurrentProcess, _CurrentProcess.priority );
			}
			
			// Testing purposes
			console.log("Switching from:\t" + "Slot: " +_CurrentProcess.slot + " which contains" 
									   + " PC: "  + _CurrentProcess.pc
									   + " ACC: " + _CurrentProcess.acc
									   + " X: "   + _CurrentProcess.x
									   + " Y: "   + _CurrentProcess.y
									   + " Z: "   + _CurrentProcess.z);
								   

			// Get next process in line and remove it from the ready queue
			_CurrentProcess = _ReadyQueue.dequeue();
			
			// Determine if we need to perform a rollIn / rollOut (process not in memory)
			// If process slot is -1 it is contained in the filesystem
			if( _CurrentProcess.slot === -1 )
			{	
				// Only roll out if there are processes still on the RQ and
				//  there are no open slots in memory
				if( _ReadyQueue.size() != 0 && !_MemoryManager.openSlotExists() )
				{
					// Roll out the most recently processed process
					_MemoryManager.rollOut(_ReadyQueue.getItem(_ReadyQueue.size() - 1));
				}
				// Roll in the process from the filesystem into the rolled out memory slot
				_MemoryManager.rollIn(_CurrentProcess);
			}
			
			// Synchronize the CPU values and the new process's values
			_CPU.update(_CurrentProcess.pc,
						_CurrentProcess.acc,
						_CurrentProcess.x,
						_CurrentProcess.y,
						_CurrentProcess.z);
						
			// Switch back to user mode
			_Mode = USER_MODE;
			
			// Testing purposes
			console.log("Switching to:\t" + "Slot: " +_CurrentProcess.slot + " which contains" 
									   + " PC: "  + _CurrentProcess.pc
									   + " ACC: " + _CurrentProcess.acc
									   + " X: "   + _CurrentProcess.x
									   + " Y: "   + _CurrentProcess.y
									   + " Z: "   + _CurrentProcess.z + "\n");
		}
		
		// Reset the cycle count regardless of whether we context switch or not
		// Only relevent for Round Robin
		_CycleCount = 1;
	}
 }