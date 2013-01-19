/* Event listener
 * Useful if you want, for example, multiple functions called for an onload event
 * Useful for Easeljs, where events are actually just called methods on an object (with no native handling)
 * In a more general way, calls many functions when a single fn is clled
	eg.
	var listener = new Listener();
	listener.bind(stage, "onclick", function() {
		console.log("called first");
	});
	listener.bind(stage, "onclick", function() {
		console.log("called second");
	});
*/
var EventListener = Class.extend({
	init: function() {
		_.bindAll(this, "bind")
	},
	bindings: {/*
		stage: {
			onclick: [ fn1, fn2, fn3],
			onmouseout: [ fn1, fn2, fn3 ]
		}*/
	},
	bind: function(object, event, fn) {
		var self = this;

		// Ensure objects exist
		this.bindings[object] || (this.bindings[object] = {});

		if(!this.bindings[object][event]) {
			// Create events array
			this.bindings[object][event] = [fn];
			// Run all functions on event
			object[event] = function() {
				for(var i=0; i < self.bindings[object][event].length; ++i) {
					self.bindings[object][event][i].apply(this, arguments);
				}
			}
			return;
		};

		// Add event to array
		this.bindings[object][event].push(fn);
	},

	unbind: function(object, event) {
		if(!event) { this.unbindAll(object); return; }

		if(this.bindings[object][event]) {
			this.bindings[object][event] = [];
		}
	},

	unbindAll: function(object) {
		for(var event in this.bindings[object]) {
			this.unbind(object, event);
		}
	}
});
