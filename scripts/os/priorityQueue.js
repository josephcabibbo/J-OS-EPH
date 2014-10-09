/* ----------------------------------
   priorityQueue.js
   
   A priority queue implementation with some not so queue functions :)
   ---------------------------------- */

(function() {
  /**
   * @private
   */
  var prioritySortLow = function(a, b) {
    return b.priority - a.priority;
  };

  /**
   * @private
   */
  var prioritySortHigh = function(a, b) {
    return a.priority - b.priority;
  };

  /*global PriorityQueue */
  /**
   * @constructor
   * @class PriorityQueue manages a queue of elements with priorities. Default
   * is highest priority first.
   *
   * @param [options] If low is set to true returns lowest first.
   */
  PriorityQueue = function(options) {
    var contents = [];

    var sorted = false;
    var sortStyle;

    if(options && options.low) {
      sortStyle = prioritySortLow;
    } else {
      sortStyle = prioritySortHigh;
    }

    /**
     * @private
     */
    var sort = function() {
      contents.sort(sortStyle);
      sorted = true;
    };

    var self = {
      /**
       * Removes and returns the next element in the queue.
       * @member PriorityQueue
       * @return The next element in the queue. If the queue is empty returns
       * undefined.
       *
       * @see PrioirtyQueue#top
       */
      dequeue: function() {
        if(!sorted) {
          sort();
        }

        var element = contents.shift();;     

        if(element) {
          return element.object;
        } else {
          return undefined;
        }
      },
	  
	  /**
       * Gives the caller access to the data structure. This is terrible practice but I need it :)
       * @member PriorityQueue
       * @return The javascript array (pretend its a queue)
       */
	  getQueue: function() {
		return contents;
	  },

      /**
       * Returns but does not remove the first element in the queue.
       * @member PriorityQueue
       * @return The first element in the queue. If the queue is empty returns
       * undefined.
       *
       * @see PriorityQueue#pop
       */
      peek: function() {
        if(!sorted) {
          sort();
        }

        var element = contents[0];

        if(element) {
          return element.object;
        } else {
          return undefined;
        }
      },
	  
	  /**
       * @member PriorityQueue
       * @param index The index of the desired object.
       * @returns the object if the index exists in the queue, undefined otherwise.
       */
	  getItem: function(index) {
      
        var element = contents[index];

        if(element) {
          return element.object;
        } else {
          return undefined;
        }
      },

      /**
       * @member PriorityQueue
       * @param object The object to check the queue for.
       * @returns true if the object is in the queue, false otherwise.
       */
      includes: function(object) {
        for(var i = contents.length - 1; i >= 0; i--) {
          if(contents[i].object === object) {
            return true;
          }
        }

        return false;
      },

      /**
       * @member PriorityQueue
       * @returns the current number of elements in the queue.
       */
      size: function() {
        return contents.length;
      },

      /**
       * @member PriorityQueue
       * @returns true if the queue is empty, false otherwise.
       */
      empty: function() {
        return contents.length === 0;
      },
	  
	  /**
       * @member PriorityQueue
       * @param index The index of the object to be removed.
       */
	   removeItem: function(index) {
		 try {
			contents.splice(index, 1);
		 } 
		 catch( err ) {
			return false;
		 }
		 
		 return true;
	   },

      /**
       * @member PriorityQueue
       * @param object The object to be pushed onto the queue.
       * @param priority The priority of the object.
       */
      enqueue: function(object, priority) {
        contents.push({object: object, priority: priority});
        sorted = false;
      }
    };

    return self;
  };
})();