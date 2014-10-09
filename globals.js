/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global Constants
//
var APP_NAME = "J(OS)EPH";
var APP_VERSION = "0.4"

var CPU_CLOCK_INTERVAL = 100;   	// in ms, or milliseconds, so 1000 = 1 second.
var SINGLE_STEP_STATUS = false; 	// Global boolean to keep track of the single step execution status

var TIMER_IRQ    = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority). 
                       // NOTE: The timer is different from hardware clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;  

// Core Memory Constants
var TOTAL_MEMORY = 768; // 768 total bytes in memory
var MEMORY_BLOCK_SIZE = 255; // 256 total space (0 - 256)

// File System Constants
var MBR_KEY = "[0,0,0]";
var NULL_TSB = "[-1,-1,-1]";

// States of the PCB
var PROCESS_NEW 		= 0; // Process newly created
var PROCESS_LOADED   	= 1; // Process loaded in memory
var PROCESS_READY		= 2; // Process added to ready queue awaiting execution
var PROCESS_RUNNING 	= 3; // Process currently executing
var PROCESS_TERMINATED 	= 4; // Process finished executing
var PROCESS_ON_DISK		= 5; // Process loaded into the filesystem

// Scheduling Algorithm Constants
var ROUND_ROBIN	= 0;
var FCFS		= 1;
var PRIORITY	= 2;

var DEFAULT_PRIORITY = 5;

// Kernel Modes
var KERNEL_MODE = 0;
var USER_MODE	= 1;

//
// Global Variables
//
var _CPU = null;

var _Memory = null;

var _OSclock = 0;       // Page 23.

var _Mode = 1;   		// 0 = Kernel Mode, 1 = User Mode.  See page 21.

var _PID = 0;			// A global variable to manage the PID

var _JobList = null; 	// An array containing all loaded processes

var _ReadyQueue = null; // A priority queue containing all processes waiting to be executed

var _CurrentProcess = null; // A reference to the currently executing process

var _MemoryDisplayCells = null; // A two-dimensional array for updating the memory display

var _FileSystemDisplayCells = null;  // A two-dimensional array for updating the filesystem display

var _Scheduler = null;	// A reference to our scheduler

var RR_Quantum = 6;		// Set to 6 as the default quantum, but can be changed in the shell

var _CycleCount = 1;	// A counter to keep track of how many cycles have ran to help decide when to context switch

// TODO: Fix the naming convention for these next five global vars.
var CANVAS = null;              // Initialized in hostInit().
var DRAWING_CONTEXT = null;     // Initialized in hostInit().
var DEFAULT_FONT = "sans";      // Ignored, just a place-holder in this version.
var DEFAULT_FONT_SIZE = 13;     
var FONT_HEIGHT_MARGIN = 4;     // Additional space added to font size when advancing a line.

// Default the OS trace to be on.
var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console = null;
var _OsShell = null;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

//
// Global Device Driver Objects - page 12
//
var krnKeyboardDriver = null;
var krnFileSystemDriver = null;
