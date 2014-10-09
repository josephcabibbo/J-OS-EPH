/* ------------
   Shell.js

   The OS Shell - The "command line interface" (CLI) or interpreter for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell()
{
    // Properties
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
    // Methods
    this.init        = shellInit;
    this.putPrompt   = shellPutPrompt;
    this.handleInput = shellHandleInput;
    this.execute     = shellExecute;
}

function shellInit()
{
    var sc = null;
    //
    // Load the command list.

    // ver
    sc = new ShellCommand();
    sc.command = "ver";
    sc.description = "- Displays the current version data."
    sc.function = shellVer;
    this.commandList[this.commandList.length] = sc;

    // help
    sc = new ShellCommand();
    sc.command = "help";
    sc.description = "- This is the help command. Seek help."
    sc.function = shellHelp;
    this.commandList[this.commandList.length] = sc;

    // shutdown
    sc = new ShellCommand();
    sc.command = "shutdown";
    sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running."
    sc.function = shellShutdown;
    this.commandList[this.commandList.length] = sc;

    // cls
    sc = new ShellCommand();
    sc.command = "cls";
    sc.description = "- Clears the screen and resets the cursosr position."
    sc.function = shellCls;
    this.commandList[this.commandList.length] = sc;

/*
    // man <topic>
    sc = new ShellCommand();
    sc.command = "man";
    sc.description = "<topic> - Displays the MANual page for <topic>.";
    sc.function = shellMan;
    this.commandList[this.commandList.length] = sc;

    // trace <on | off>
    sc = new ShellCommand();
    sc.command = "trace";
    sc.description = "<on | off> - Turns the OS trace on or off.";
    sc.function = shellTrace;
    this.commandList[this.commandList.length] = sc;

    // rot13 <string>
    sc = new ShellCommand();
    sc.command = "rot13";
    sc.description = "<string> - Does rot13 obfuscation on <string>.";
    sc.function = shellRot13;
    this.commandList[this.commandList.length] = sc;

    // prompt <string>
    sc = new ShellCommand();
    sc.command = "prompt";
    sc.description = "<string> - Sets the prompt.";
    sc.function = shellPrompt;
    this.commandList[this.commandList.length] = sc;
*/
/*
    // date
    sc = new ShellCommand();
    sc.command = "date";
    sc.description = "- Displays the current date and time.";
    sc.function = shellDate;
    this.commandList[this.commandList.length] = sc;

	// whereami
    sc = new ShellCommand();
    sc.command = "whereami";
    sc.description = "- Displays the current users location.";
    sc.function = shellWhereAmI;
    this.commandList[this.commandList.length] = sc;

	// meaningoflife
    sc = new ShellCommand();
    sc.command = "meaningoflife";
    sc.description = "- Displays the meaning of life.";
    sc.function = shellMeaningOfLife;
    this.commandList[this.commandList.length] = sc;
*/
	// bsod
	sc = new ShellCommand();
    sc.command = "bsod";
    sc.description = "- Tests the BSOD";
    sc.function = shellBSOD;
    this.commandList[this.commandList.length] = sc;

	// status
	sc = new ShellCommand();
    sc.command = "status";
    sc.description = "<string> - Sets the current status";
    sc.function = shellStatus;
    this.commandList[this.commandList.length] = sc;

	// load
	sc = new ShellCommand();
    sc.command = "load";
    sc.description = "<priority (optional)>- Loads the user program";
    sc.function = shellLoadProgram;
    this.commandList[this.commandList.length] = sc;

	// run
	sc = new ShellCommand();
    sc.command = "run";
    sc.description = "<PID> - Run program containing the supplied PID";
    sc.function = shellRun;
    this.commandList[this.commandList.length] = sc;

	// runall
	sc = new ShellCommand();
    sc.command = "runall";
    sc.description = "- Run all loaded programs.";
    sc.function = shellRunAll;
    this.commandList[this.commandList.length] = sc;

	// step
	sc = new ShellCommand();
    sc.command = "step";
    sc.description = "<on | off && PID> - Enable single-step execution";
    sc.function = shellStep;
    this.commandList[this.commandList.length] = sc;

	// quantum
	sc = new ShellCommand();
    sc.command = "quantum";
    sc.description = "<int> - Set the cycle quantum for Round Robin";
    sc.function = shellQuantum;
    this.commandList[this.commandList.length] = sc;

	// processes
	sc = new ShellCommand();
    sc.command = "processes";
    sc.description = "Display PIDs of all active processes";
    sc.function = shellProcesses;
    this.commandList[this.commandList.length] = sc;

	// kill
	sc = new ShellCommand();
    sc.command = "kill";
    sc.description = "<PID> - Kill an active process with a given PID.";
    sc.function = shellKillProcess;
    this.commandList[this.commandList.length] = sc;

	// create
	sc = new ShellCommand();
    sc.command = "create";
    sc.description = "<filename> - Create the file ~filename~.";
    sc.function = shellCreateFile;
    this.commandList[this.commandList.length] = sc;

	// read
	sc = new ShellCommand();
    sc.command = "read";
    sc.description = "<filename> - Read and display the contents of ~filename~.";
    sc.function = shellReadFile;
    this.commandList[this.commandList.length] = sc;

	// write
	sc = new ShellCommand();
    sc.command = "write";
    sc.description = "<filename data> - Write the data to ~filename~.";
    sc.function = shellWriteFile;
    this.commandList[this.commandList.length] = sc;

	// delete
	sc = new ShellCommand();
    sc.command = "delete";
    sc.description = "<filename> - Remove ~filename~ from storage.";
    sc.function = shellDeleteFile;
    this.commandList[this.commandList.length] = sc;

	// format
	sc = new ShellCommand();
    sc.command = "format";
    sc.description = "- Initialize all blocks in all sectors in all tracks.";
    sc.function = shellFormatFS;
    this.commandList[this.commandList.length] = sc;

	// ls
	sc = new ShellCommand();
    sc.command = "ls";
    sc.description = "- List the files currently stored on disk";
    sc.function = shellListFiles;
    this.commandList[this.commandList.length] = sc;

	// setsch
	sc = new ShellCommand();
    sc.command = "setsch";
    sc.description = "<rr | fcfc | priority> - Set the CPU scheduling algorithm";
    sc.function = shellSetSchedulerAlgorithm;
    this.commandList[this.commandList.length] = sc;

	// getsch
	sc = new ShellCommand();
    sc.command = "getsch";
    sc.description = "- Get the current CPU scheduling algorithm";
    sc.function = shellGetSchedulerAlgorithm;
    this.commandList[this.commandList.length] = sc;

	// test
/*
	sc = new ShellCommand();
    sc.command = "test";
    sc.description = "- For testing purposes only";
    sc.function = shellTest;
    this.commandList[this.commandList.length] = sc;
*/


    // Display the initial prompt.
    this.putPrompt();
}

function shellPutPrompt()
{
    _StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
    krnTrace("Shell Command~" + buffer);
    //
    // Parse the input...
    //
    var userCommand = new UserCommand();
    userCommand = shellParseInput(buffer);
    // ... and assign the command and args to local variables.
    var cmd = userCommand.command;
    var args = userCommand.args;
    //
    // Determine the command and execute it.
    //
    // Javascript may not support associative arrays (one of the few nice features of PHP, actually)
    // so we have to iterate over the command list in attempt to find a match.  TODO: Is there a better way?
    var index = 0;
    var found = false;
    while (!found && index < this.commandList.length)
    {
        if (this.commandList[index].command === cmd)
        {
            found = true;
            fn = this.commandList[index].function;
        }
        else
        {
            ++index;
        }
    }
    if (found)
    {
        this.execute(fn, args);
    }
    else
    {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
        {
            this.execute(shellCurse);
        }
        else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apoligies.
        {
            this.execute(shellApology);
        }
        else    // It's just a bad command.
        {
            this.execute(shellInvalidCommand);
        }
    }
}


function shellParseInput(buffer)
{
    var retVal = new UserCommand();
    //
    // 1. Remove leading and trailing spaces.
    buffer = trim(buffer);
    // 2. Lower-case it.
    buffer = buffer.toLowerCase();
    // 3. Separate on spaces so we can determine the command and command-line args, if any.
    var tempList = buffer.split(" ");
    // 4. Take the first (zeroth) element and use that as the command.
    var cmd = tempList.shift();  // Yes, you can do that to an array in Javascript.  See the Queue class.
    // 4.1 Remove any left-over spaces.
    cmd = trim(cmd);
    // 4.2 Record it in the return value.
    retVal.command = cmd;
    //
    // 5. Now create the args array from what's left.
    for (var i in tempList)
    {
        var arg = trim(tempList[i]);
        if (arg != "")
        {
            retVal.args[retVal.args.length] = tempList[i];
        }
    }
    return retVal;
}


function shellExecute(fn, args)
{
    // we just got a command, so advance the line...
    _StdIn.advanceLine();
    // .. call the command function passing in the args...
    fn(args);
    // Check to see if we need to advance the line again
    if (_StdIn.CurrentXPosition > 0)
    {
        _StdIn.advanceLine();
    }
    // ... and finally write the prompt again.
    this.putPrompt();
}


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately),
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect Javascript, we'd be
// able to make then private.  (Actually, we can. Someone look at Crockford's stuff and give me the details, please.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()
{
    // Properties
    this.command = "";
    this.description = "";
    this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
    // Properties
    this.command = "";
    this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode)
    {
        _StdIn.putText("Duh. Go back to your Speak & Spell.");
    }
    else
    {
        _StdIn.putText("Type 'help' for, well... help.");
    }
}

function shellCurse()
{
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
}

function shellApology()
{
    _StdIn.putText("Okay. I forgive you. This time.");
    _SarcasticMode = false;
}

function shellVer(args)
{
    _StdIn.putText("You are currently using " + APP_NAME + " version " + APP_VERSION);
}

function shellHelp(args)
{
    _StdIn.putText("Commands:");
    for (i in _OsShell.commandList)
    {
        _StdIn.advanceLine();
        _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
    }
}

function shellShutdown(args)
{
     _StdIn.putText("Shutting down...");
     // Call Kernal shutdown routine.
    krnShutdown();
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
    _StdIn.clearScreen();
    _StdIn.resetXY();
}

/*
function shellMan(args)
{
    if (args.length > 0)
    {
        var topic = args[0];
        switch (topic)
        {
            case "help":
                _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                break;
            default:
                _StdIn.putText("No manual entry for " + args[0] + ".");
        }
    }
    else
    {
        _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
}

function shellTrace(args)
{
    if (args.length > 0)
    {
        var setting = args[0];
        switch (setting)
        {
            case "on":
                if (_Trace && _SarcasticMode)
                {
                    _StdIn.putText("Trace is already on, dumbass.");
                }
                else
                {
                    _Trace = true;
                    _StdIn.putText("Trace ON");
                }

                break;
            case "off":
                _Trace = false;
                _StdIn.putText("Trace OFF");
                break;
            default:
                _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
        }
    }
    else
    {
        _StdIn.putText("Usage: trace <on | off>");
    }
}

function shellRot13(args)
{
    if (args.length > 0)
    {
        _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellPrompt(args)
{
    if (args.length > 0)
    {
        _OsShell.promptStr = args[0];
    }
    else
    {
        _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
}
*/
/*
function shellDate(args)
{
	_StdIn.putText(currentDate() + " -- " + currentTime()); // Requires Utils.js for currentTime() and currentDate() function.
}

function shellWhereAmI(args)
{
	_StdIn.putText("A land far far away... or at your desk writing code.");
}

function shellMeaningOfLife(args)
{
	var randomNum = Math.floor((Math.random() * 4) + 1); // Random number between 1-4

	switch(randomNum)
	{
		case 1:
			_StdIn.putText("Well that is simple, its pizza...");
			break;
		case 2:
			_StdIn.putText("I would never be able to fit that answer in this box");
			break;
		case 3:
			_StdIn.putText("You ask to many questions...");
			break;
		case 4:
			_StdIn.putText("We may never know...");
			break;
		case 5:
			_StdIn.putText("42");
			break;
		default:
			break;
	}
}
*/
function shellBSOD()
{
	// Place bsod on canvas
	var bsod = new Image();
	bsod.src = "images/bsod.png";
	bsod.onload = function()
	{
		DRAWING_CONTEXT.drawImage(bsod, 0, 0);
	}
	// Shutdown OS
	krnShutdown();
}

function shellStatus(args)
{
	if (args.length > 0)
    {
		var status = document.getElementById("status");
		status.innerHTML = "Current Status: " + args.join(" "); // Join the word args and put a space between them
    }
    else
    {
        _StdIn.putText("Usage: status <string>  Please supply a string.");
    }
}

function shellLoadProgram(args)
{
	// See if user has paired the process with a priority
	var priority = -1;

	if( args[0] )
		priority = parseInt( args[0] );

	var resultArray = loadProgram(priority); // from programLoader.js

	var pid = resultArray[0];
	var location = resultArray[1];

	// If load is unsuccessful, no PID is returned
	if( typeof pid == "undefined" || isNaN(pid)) // Overkill?
	{
		_StdIn.putText("There was an error, please consult the log --->");
	}
	else
	{
		// Display PID and location
		if( priority === -1 ) // No priority supplied
		{
			if( location === "memory" )
				_StdIn.putText("Process with PID " + pid + " added to memory");
			else if( location === "disk" )
				_StdIn.putText("Process with PID " + pid + " added to disk");
		}
		else
		{
			if( location === "memory" )
				_StdIn.putText("Process with PID " + pid + " added to memory with priority " + priority);
			else if( location === "disk" )
				_StdIn.putText("Process with PID " + pid + " added to disk with priority " + priority);
		}
	}
}

function shellRun(pid)
{
	if( typeof _JobList[pid] == "undefined" || isNaN(pid))
	{
		_StdIn.putText("Invalid PID");
	}
	else
	{
		// Get process from job list
		_CurrentProcess = _JobList[pid];
		// Change process status
		_CurrentProcess.state = PROCESS_RUNNING;
		// Add process to the _ReadyQueue
		_ReadyQueue.enqueue( _CurrentProcess, _CurrentProcess.priority );
		// Then remove process from _ReadyQueue bc its the only process??
		_ReadyQueue.dequeue();
		// Clear cpu values before processing
		clearCPU();
		// Change state of CPU
		_CPU.isExecuting = true;
		// Remove the process from the _JobList
		//_JobList.splice(pid, 1);
		delete _JobList[pid];  // Because splice was moving the indexes around
							   // (i.e. process with PID of 1 would change to 0 after a splice of index 0)
	}
}

function shellRunAll()
{
	var process = null;

	for( index in _JobList )
	{
		// Get Process
		process = _JobList[index];
		// Remove process from the job list
		delete _JobList[index];
		// Add it to the Ready Queue
		_ReadyQueue.enqueue(process, process.priority);
	}

	// Take the first process off the ready queue and assign it as our current process
	_CurrentProcess = _ReadyQueue.dequeue();
	// Clear cpu values before processing
	clearCPU();
	// Change state of CPU
	_CPU.isExecuting = true;
}

function shellStep(args)
{
	// Step on command must have the on status and a PID number (2 args)
	if( args.length === 2 )
	{
		// Ensure the status is "on", the PID is a number, and a process with that PID exists
		if( args[0] === "on" && typeof parseInt(args[1]) === "number" && _JobList[args[1]])
		{
			document.getElementById("btnStep").disabled = false;
			_StdIn.putText("You have entered single step mode for PID "  + args[1] +"...");

			SINGLE_STEP_STATUS = true;

			// ** Perform normal execution steps
			// Get process from job list
			_CurrentProcess = _JobList[args[1]];
			// Change process status
			_CurrentProcess.state =PROCESS_RUNNING;
			// Add process to the _ReadyQueue
			_ReadyQueue.enqueue( _CurrentProcess, _CurrentProcess.priority );
			// Then remove process from _ReadyQueue bc its the only process??
			_ReadyQueue.dequeue();
			// Clear cpu values before processing
			clearCPU();
			// Change state of CPU
			_CPU.isExecuting = true;
			// Remove process from job list
			delete _JobList[args[1]];
		}
		else
			_StdIn.putText("Invalid... Please provide a status and loaded process PID.");
	}
	else if( args[0] === "off" )
	{
		document.getElementById("btnStep").disabled = true;

		SINGLE_STEP_STATUS = false;
	}
	else
		_StdIn.putText("Invalid... Please provide a status and loaded process PID.");
}

function shellQuantum(args)
{
	var quantumInt = parseInt(args[0]);

	if( isNaN(quantumInt) || quantumInt < 0 )
	{
		_StdIn.putText("Usage: quantum <int>  Please supply a positive integer.");
	}
	else
	{
		RR_Quantum = quantumInt;
	}
}

function shellProcesses()
{
	var numProcesses = 0;

	for( index in _JobList)
	{
		numProcesses++;
	}

	if( numProcesses != 0 )
	{
		_StdIn.putText("Active PID Numbers: ");

		// Display PIDs of all processes in _JobList
		for( index in _JobList )
		{
			_StdIn.putText( _JobList[index].pid.toString() );
			_StdIn.putText(" ");
		}
	}
	else
	{
		_StdIn.putText("There are currently no active processes...");
	}
}

function shellKillProcess(args)
{
	var pid = parseInt( args[0] );

	// Info needed to remove the process
	var process = null;
	var slot = -2; // Was negative 1 but I use that for the filesystem slot default
	var positionInQueue = -1;

	// Not good practice, but get the data structure from the ready queue
	var queue = _ReadyQueue.getQueue();

	// Get the process with the associated PID and its necessary information
	for( index in queue )
	{
		// If the process is found, save all pertinent information about it
		if( _ReadyQueue.getItem(index).pid === pid )
		{
			process = _ReadyQueue.getItem(index);
			slot = process.slot;
			positionInQueue = parseInt( index );
		}
	}

	// If process exists, remove it from memory or filesystem
	if( process )
	{
		// Remove the process from the queue
		_ReadyQueue.removeItem(positionInQueue);

		if( slot === -1 ) // Process is on disk (in filesystem)
		{
			// Remove process information from the filesystem
			krnFileSystemDriver.delete("process " + pid.toString());
		}
		else // Process is in memory
		{
			// Clear its associated memory slot
			switch(slot)
			{
				// Functions found in harwareServices.js
				case 1: clearMemorySlotOne();   break;
				case 2: clearMemorySlotTwo();   break;
				case 3: clearMemorySlotThree(); break;
			}
			// Open the associated memory slot
			_MemoryManager.toggleSlotStatus(slot);
		}

		_StdIn.putText("Process with pid " + process.pid + " has been removed!");
		_StdIn.advanceLine();

		log("\n*** Process with pid " + process.pid + " has been removed! ***\n\n"); // Found in programValidation.js
	}
	else
	{
		_StdIn.putText("No process with that PID exists...");
	}
}

function shellCreateFile(args)
{
	var filename = args[0];

	if(filename)
	{
		var createRetVal = krnFileSystemDriver.create(filename);

		// If a boolean is not our retVal errors exist and create failed
		if( typeof createRetVal === "boolean" )
		{
			_StdIn.putText("Created file: " + filename);
		}
		else
		{
			_StdIn.putText("Create failed, please check log -->:");
			for(index in createRetVal)
			{
				log(createRetVal[index] + "\n");
			}
		}
	}
	else
	{
		_StdIn.putText("Filename cannot be empty!");
	}
}

function shellReadFile(args)
{
	var filename = args.join(" ");

	if( filename )
	{
		var data = krnFileSystemDriver.read(filename);

		if( data.length > 0 )
		{
			// Display the data in the console
			for( var i = 0; i < data.length; i++ )
			{
				if( i % 45 === 0 )
					_StdIn.advanceLine();

				_StdIn.putText(data.charAt(i));
			}

			_StdIn.advanceLine();
			_StdIn.advanceLine();
		}
		else
		{
			_StdIn.putText("Read not successful, there is no data to read...");
		}
	}
	else
	{
		_StdIn.putText("Filename cannot be empty!");
	}

}

function shellWriteFile(args)
{
	var filename = args[0];

	// If we are trying to read a process get it in the right format
	if(filename === "process")
		filename += " " + args[1];

	// Join all args by a space
	var data = args.join(" ");
	// Remove the filename from the data (+1 to get rid of leading space char)
	data = data.substring(filename.length + 1);

	if( filename && data )
	{
		// Attempt to write data to filename
		var writeIsSuccessful = krnFileSystemDriver.write(filename, data);

		if( writeIsSuccessful )
		{
			_StdIn.putText("Write to " + filename + " was successful!");
		}
		else
		{
			_StdIn.putText("Write to " + filename + " was NOT successful!");
		}
	}
	else
	{
		if( !filename )
			_StdIn.putText("Filename cannot be empty!");
		if( !data )
			_StdIn.putText("Would you like me to write NOTHING to " + filename + "?  NO...");
	}
}

function shellDeleteFile(args)
{
	var filename = args.join(" ");

	if( filename )
	{
		var deleteIsSuccessful = krnFileSystemDriver.delete(filename);

		if( deleteIsSuccessful )
			_StdIn.putText(filename + " has been successfully deleted!");
		else
			_StdIn.putText("No filename: " + filename + " exists...");
	}
	else
		_StdIn.putText("Filename cannot be empty!");
}

function shellFormatFS()
{
	var formatIsSuccessful = krnFileSystemDriver.format();

	if( formatIsSuccessful )
		_StdIn.putText("Format successful.");
	else
		_StdIn.putText("An error has occurred on requested format command");
}

function shellListFiles()
{
	var filenameList = krnFileSystemDriver.listFiles();

	if( filenameList )
	{
		_StdIn.putText("Files in the J(OS)EPH file system:");
		_StdIn.advanceLine();

		for( index in filenameList )
		{
			_StdIn.putText(filenameList[index]);
			_StdIn.advanceLine();
		}
	}
	else
	{
		_StdIn.putText("No files exist in the file system...");
	}
}

function shellSetSchedulerAlgorithm(args)
{
	var algorithm = args[0];

	if( algorithm )
	{
		if( algorithm === "rr" )
			_Scheduler.algorithm = ROUND_ROBIN;
		else if( algorithm === "fcfs" )
			_Scheduler.algorithm = FCFS;
		else if( algorithm === "priority" )
			_Scheduler.algorithm = PRIORITY;
		else
			_Scheduler.algorithm = ROUND_ROBIN; // Round robin by default

		_StdIn.putText("Scheduling algorithm successfully changed to " + algorithm);
	}
	else
	{
		_StdIn.putText("No algorithm provided, algorithm remains as " + algorithm);
	}
}

function shellGetSchedulerAlgorithm()
{
	var algorithm = _Scheduler.algorithm;

	switch( algorithm )
	{
		case 0: _StdIn.putText("Current scheduling algorithm: Round Robin"); 	break;
		case 1: _StdIn.putText("Current scheduling algorithm: FCFS"); 			break;
		case 2: _StdIn.putText("Current scheduling algorithm: Priority"); 		break;

		default: _StdIn.putText("Current scheduling algorithm: Round Robin"); 	break;
	}
}


/*
function shellTest(args)
{
	 var s = "A9 22 WX 00 00 A9 00 00 00";
	 alert(s.substring(0, s.indexOf("00 00 00") - 1));
}
*/


