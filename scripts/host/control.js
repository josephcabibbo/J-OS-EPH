/* ------------  
   Control.js

   Requires global.js.
   
   Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code that
   hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
   both the host and client environments.
   
   This (and other host/simulation scripts) is the only place that we should see "web" code, like 
   DOM manipulation and JavaScript event handling, and so on.  (Index.html is the only place for markup.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */


//
// Control Services
//
function simInit()
{
	// Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
	CANVAS  = document.getElementById('display');
	// Get a global reference to the drawing context.
	DRAWING_CONTEXT = CANVAS.getContext('2d');
	// Enable the added-in canvas text functions (see canvastext.js for provenance and details).
	CanvasTextFunctions.enable(DRAWING_CONTEXT);
	// Clear the log text box.
	document.getElementById("taLog").value="";
	// Set focus on the start button.
	document.getElementById("btnStartOS").focus();     // TODO: This does not seem to work.  Why?
	// Create the memory display by default
	createMemoryTable();
}

function simLog(msg, source)
{
    // Check the source.
    if (!source)
    {
        source = "?";
    }

    // Note the OS CLOCK.
    var clock = _OSclock;

    // Note the REAL clock in milliseconds since January 1, 1970.
    var now = new Date().getTime();

    // Build the log string.   
    var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";    
    // WAS: var str = "[" + clock   + "]," + "[" + now    + "]," + "[" + source + "]," +"[" + msg    + "]"  + "\n";

    // Update the log console.
    taLog = document.getElementById("taLog");
    taLog.value = str + taLog.value;
    // Optionally udpate a log database or some streaming service.
}


//
// Control Events
//
function simBtnStartOS_click(btn)
{
    // Disable the start button...
    btn.disabled = true;
    
    // ... enable the Emergency Halt and Reset buttons ...
    document.getElementById("btnHaltOS").disabled = false;
    document.getElementById("btnReset").disabled = false;
    
    // ... set focus on the OS console display ... 
    document.getElementById("display").focus();
    
    // ... Create and initialize the CPU ...
    _CPU = new cpu();
    _CPU.init();

    // ... then set the clock pulse simulation to call ?????????.
    hardwareClockID = setInterval(simClockPulse, CPU_CLOCK_INTERVAL);
    // ... and call the OS Kernel Bootstrap routine.
    krnBootstrap();
	
	// ... Create and initialize the memory
   _Memory = new Memory();
   
   // ... Create and initialize the JobList
   _JobList = new Array();
   
   // ... Create and initialize the ReadyQueue
   _ReadyQueue = PriorityQueue();
   
   // ... Create and initialize the MemoryManager
   _MemoryManager = new MemoryManager();
   
   // ... Create and initialize the Scheduler
   _Scheduler = new Scheduler();
}

function simBtnHaltOS_click(btn)
{
    simLog("emergency halt", "host");
    simLog("Attempting Kernel shutdown.", "host");
    // Call the OS sutdown routine.
    krnShutdown();
    // Stop the JavaScript interval that's simulating our clock pulse.
    clearInterval(hardwareClockID);
    // TODO: Is there anything else we need to do here?
}

function simBtnReset_click(btn)
{
    // The easiest and most thorough way to do this is to reload (not refresh) the document.
    location.reload(true);  
    // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
    // be reloaded from the server. If it is false or not specified, the browser may reload the 
    // page from its cache, which is not what we want.
}

function simSingleStep_click(btn)
{
	// Only run a cycle if we have a currenly "executing" program
	if( _CPU.isExecuting )
	{
		_CPU.cycle();
	}
	else
	{
		document.getElementById("btnStep").disabled = true;
	}
}

/*
 *  Function to switch views between memory and the file system
 */
function simSwitchStorageDisplay_click(btn)
{
	switchStorageDisplay(); // Found in hardwareServices.js
}

/*
 *  Functions to fill the program area with the associated program
 */

function simProgram1_click(btn)
{
	// Fill the program area with program 1
	var programTA = document.getElementById("taProgramArea");
	programTA.value = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 A2 02 A0 42 FF 00";
}

function simProgram2_click(btn)
{
	// Fill the program area with program 2
	var programTA = document.getElementById("taProgramArea");
	programTA.value = "A9 00 8D 00 00 A9 00 8D 3B 00 A9 01 8D 3B 00 A9 00 8D 3C 00 A9 02 8D 3C 00 A9 01 6D 3B 00 8D 3B 00 A9 03 6D 3C 00 8D 3C 00 AC 3B 00 A2 01 FF A0 3D A2 02 FF AC 3C 00 A2 01 FF 00 00 00 20 61 6E 64 20 00";
}

function simProgram3_click(btn)
{
	// Fill the program area with program 3
	var programTA = document.getElementById("taProgramArea");
	programTA.value = "A9 00 8D 00 00 A9 00 8D 4B 00 A9 00 8D 4B 00 A2 03 EC 4B 00 D0 07 A2 01 EC 00 00 D0 05 A2 00 EC 00 00 D0 26 A0 4C A2 02 FF AC 4B 00 A2 01 FF A9 01 6D 4B 00 8D 4B 00 A2 02 EC 4B 00 D0 05 A0 55 A2 02 FF A2 01 EC 00 00 D0 C5 00 00 63 6F 75 6E 74 69 6E 67 00 68 65 6C 6C 6F 20 77 6F 72 6C 64 00";
}
