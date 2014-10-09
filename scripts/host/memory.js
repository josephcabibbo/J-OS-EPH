/* ------------  
   memory.js

   Requires global.js.
   
   Our host core memory prototype
   ------------ */
   
function Memory()
{
	var memoryArray = new Array();

	// TOTAL_MEMORY = 768
	for(i = 0; i < TOTAL_MEMORY; i++)
	{
		memoryArray[i] = "00";
	}
	
	return memoryArray;
}