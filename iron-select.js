(function () {
	var KEYS = {
		ENTER : 13,
		ESC : 27,
		UP : 38,
		DOWN : 40,
		LEFT : 37,
		RIGHT : 39,
		BACKSPACE : 8
	};
	
	var KEYSHASH = {};
	Object.keys(KEYS).forEach(function(k) { KEYSHASH[KEYS[k]] = true });
		
	Polymer({
		is : 'iron-select',
		
		handleControlKeys : function (e) {
			var val, that = this;

			if(this.itemInFocus && ([KEYS.LEFT, KEYS.RIGHT, KEYS.BACKSPACE].indexOf(e.keyCode) == -1))
			{
				this.itemInFocus.blur();
				delete this.itemInFocus;
			}
				
			this.input.focus();
			switch(e.keyCode)
			{
				case KEYS.ENTER: 
					if(this.preventDefault)
						e.preventDefault();

					if(!this.input.value)
						return;

					val = this.$.selectBox.selectedItem ? this.suggestedOptions[this.$.selectBox.selected] : { title : this.input.value }
					
					this.addSelection(val);

					this.input.value = "";
					this.suggestedOptions = [];
					
					this.$.selectBox.select(-1);
					console.log(this.$.selectBox.selected);
					
					break;

				case KEYS.ESC:
					this.suggestedOptions = [];

					this.$.selectBox.select(-1);

					break;
					
				// up arrow - select previous item when iron-select is open
					case KEYS.UP: 
					if(!this.$.selectBox.selectedItem && this.$.selectBox.items.length) 
						this.$.selectBox.select	(this.$.selectBox.items[this.$.selectBox.items.length-1].value);
					else if(this.$.selectBox.selectedItem)
						this.$.selectBox.selectPrevious();						
						// this.input.value = this.$.selectBox.selectedItem.innerHTML						
					break;
				
				 // down arrow - select next item when iron-select is open
				case KEYS.DOWN:
					if(!this.$.selectBox.selectedItem && this.$.selectBox.items.length) 
						this.$.selectBox.select(0);
					else
						this.$.selectBox.selectNext();	
						// this.input.value = this.$.selectBox.selectedItem.innerHTML						
					break;
					
				// left arrow - focus on previous item
				case KEYS.LEFT:					
					if(this.input.value)
						break;

					var children = this.getChildItems(),
						focusIndex = children.length;
						
					if(!children.length) break
					
					if(this.itemInFocus) // if not set focusIndex defaults to last one
					{
						focusIndex = children.indexOf(this.itemInFocus);
						this.itemInFocus.blur();
					}
					
					if(!focusIndex && !(focusIndex === 0))
						break;
					
					if(focusIndex >	 0)
						focusIndex--;

					this.itemInFocus = children[focusIndex];
					this.itemInFocus.focus();	

					break;

				// right arrow - focus on next item
				case KEYS.RIGHT:
					if(this.input.value || !this.itemInFocus)
						break;

					var children = this.getChildItems(),
						focusIndex = 0;
						
					if(!children.length) break
					
					focusIndex = children.indexOf(this.itemInFocus);
					this.itemInFocus.blur();
					
					if(!focusIndex && !(focusIndex === 0))
						break;
					
					if(focusIndex < children.length-1)
					{
						focusIndex++;
						this.itemInFocus = children[focusIndex];
						this.itemInFocus.focus();
						
						break;
					}

					this.itemInFocus.blur();
					delete this.itemInFocus;

					break;

				// backspace or delete remove the itemInFocus
				case KEYS.BACKSPACE:
					if(this.input.value)
						break;

					var children = this.getChildItems();
					
					if(!children.length)
						break;
					
					var focusIndex = children.length;
					if(this.itemInFocus)
					{
						focusIndex = children.indexOf(this.itemInFocus)						
						this.itemInFocus.close();						
					}
					
					if(focusIndex > 0)
						focusIndex--;
					else if(children.length > 1)
						focusIndex++;

					this.itemInFocus = children[focusIndex];
					this.itemInFocus.focus();
					
					break;
			}
		},
		
		handleTyping : function(e)
		{
			if([KEYS.ESC, KEYS.DOWN, KEYS.UP].indexOf(e.keyCode) > -1)
				return;					// we are either navigating or suggestions were closed in handleControlKeys and we don't want to reopen them until next typing
			
			this.loadSuggestions();
		},
		
		loadSuggestions : function () {
			var that = this;
			
			if(this.input.value.length >= this.minLength)
			{
				var params = this.dataSourceQueryByLabel
				this.$.optionsLoader.url = this.dataSource +"?"
											+	encodeQuery(this.dataSourceQueryByLabel) + "&"
											+	this.dataSourceQueryField+"="+encodeURIComponent(".*" + this.input.value + ".*");

				this.$.optionsLoader.generateRequest();
				
				this.$.selectBox.select(0)
			}
			else
			{
				this.$.selectBox.select(-1);
				this.suggestedOptions = [];
			}

		},
		
		getValue: function(obj, key) {
			return obj[key];
		},
		
		setPreselectedOptions : function(e) {
			//this.selected = this.loadedSelection
			var that = this;
			
			this.loadedSelection.forEach(function(o) { that.addSelection(o) });
			
			this.$.selectionLoader.url = "";
		},
		getChildren : function() {	
			var content = Polymer.dom(this.root).querySelector('content');
			return Polymer.dom(content).getDistributedNodes();
		},
		getChildItems : function() {	
			return this.getChildren().filter(function(n) { return n.is == 'iron-select-item' });
		},
		getSelected : function() {
			var that = this, 
				res = [];
				
			[].forEach.call(this.getChildItems(), function(o) { res.push(o.toObject(that.labelField, that.valueField)); } )
						
			return res;
		},
		
		isSelected : function(sel)
		{
			// has item with same val => true
			// val is 
			
			var lf = this.labelField, vf = this.valueField,
				val = sel[vf], label = sel[lf];
			
			return this.getSelected().filter(function(o) { 
												console.log(o[vf] == val && val != 'undefined' && typeof o[vf] != 'undefined', o[lf] == label && typeof val == 'undefined' && typeof o[vf] == 'undefined')
												return 	(o[vf] == val && val != 'undefined' && typeof o[vf] != 'undefined') || 
														(o[lf] == label && typeof val == 'undefined' && typeof o[vf] == 'undefined' ) 
											}).length;
		},

		/**
			* @func addSelection(selection) adds a selection
			* @access public
			* @param {object} [selection] should have sel[valueField] and/or sel[labelField] set
			* @emits 
			* @returns {Number} Returns the value of x for the equation.
			* @emits #change `change` is fired whenever the value changes.
			* @example
			* adds iron-select-item with value set to 10
			* .addSelection({ value : 10, label : "tag1" });
			* @example
			* adds iron-select item with value set to "tag2" if allowCreate is true
			* .addSelection(label : "tag2" });
		*/
		addSelection : function(sel) {
			if(this.isSelected(sel))
				return;
			
			if(!sel[this.valueField] && !this.allowCreate)
				return;
			
			var item = document.createElement('iron-select-item');

			Polymer.dom(this).insertBefore(item, this.input);
			Polymer.dom.flush();			
			
			item.value = sel[this.valueField];
			item.label = sel[this.labelField];

			this.updateValue();
			
			this.fire('change');
		},
		
		// adds item when user clicks on selectBox
		addFromSelector : function(e) {
			console.log(e.detail);
			var index = this.$.selectBox.items.indexOf(e.target);
			this.addSelection(this.suggestedOptions[this.$.selectBox.items.indexOf(e.target)]);

			// this.$.selectBox.select(-1);
			this.suggestedOptions = [];
		},
		
		updateValue : function() {
			var vf = this.valueField, lf = this.labelField,
				selected = this.getSelected(),
			//console.log('updating value', !selected.length ? '' : selected.map(function(o) { return o[vf] ? o[vf] : o[lf] }).filter(function (o) { return o } ).join(','));
				value = !selected.length ? '' : selected.map(function(o) { return o[vf] ? o[vf] : o[lf] }).filter(function (o) { return o } ).join(',');
			
			Polymer.dom(this).setAttribute('value', value);
			
			console.log('updating value, nativeClone:', this.nativeClone, value	);
			if(this.nativeClone)
				this.nativeClone.setAttribute('value', value);
		},

		/**
			* select values passed as array
			* setter for .selected property - see .selected
			* @access private
		*/
		_selectedChanged: function() 
		{
			var that = this,
				lf = this.labelField,
				vf = this.valueField;


			if(!this.selected.length) return;

			var missingLabels = this.selected.filter(function(sel) { return !sel[lf] && sel[that.valueField] });
			
			this.updateValue();
			
			if(!missingLabels.length)
				return

			var missingIdsList = missingLabels.map(function (sel) { return sel[that.valueField] }).join(",");

			this.$.selectionLoader.url = this.dataSource+"?" 
						+	encodeQuery(this.dataSourceQueryByValue) + "&"
						+	this.dataSourceQueryField+"="+missingIdsList;

			this.$.selectionLoader.generateRequest();			
		},
		
		ready	: function() {
			var that = this, form;

			this.input = document.createElement("input");
			

			this.input.is = "iron-input";
			Polymer.dom(this).appendChild(this.input);
			
			Polymer.dom.flush();

			this.input.addEventListener('click', function () { console.log("click!"); that.loadSuggestions(); } );
			this.input.placeholder = this.placeholder;
			
			this.addEventListener('keyup', this.handleTyping);
			this.addEventListener('keydown', this.handleControlKeys);
			this.input.type = 'text';

			this.addEventListener('item-attached', function(ev) { 
				that.updateValue();
			});

			this.addEventListener('item-close', function(ev) {
				//if(this.itemInFocus == ev.detail)
				//	delete this.itemInFocus;

				delete this.itemInFocus;
				
				var that = this;
				
				console.log('will delete', ev.detail.toObject());
				
				setTimeout(function() {
					Polymer.dom(that).removeChild(ev.detail);
					Polymer.dom.flush();
					that.updateValue();
				}, 300)

			});			

			
			if(this.cloneToNative && this.name)
			{
				do {
					form = this.parentElement;
				} while(form.tagName.toLowerCase() != 'form');
					
				if(!form)
					return;
				
				this.nativeClone = document.createElement('input');
				this.nativeClone.setAttribute("type", "hidden");
				this.nativeClone.setAttribute("name", this.name);
				this.name = "";
				
				this.updateValue();
				
				form.insertBefore(this.nativeClone, this);
			}

		},
		
		_valueChanged: function()
		{
		},

		properties : {
			/*
				@namespace iron-select
				@property {Array setter} - selects an entirely new set of values, old values are lost
				@property {String} placeholder - input placeholder
				@property {String} multi - [unimplemented] defaults to true, if false will allow only one selection at a time
				@property {String} dataSource - url to query
				@property {String} dataSourceQueryByValue - query parameters to query by value
				@property {String} dataSourceQueryByLabel - query parameters to query by label
				@property {String} valueField - value field on received objects, default is "value"
				@property {String} labelField - label field on received objects, default is "label"
				@property {String} preventDefault - prevents submission when the control in a static form and user selects an item with Enter key. Defaults to true.
				@property {String} allowCreate - Allows adding (new) element without value. The new label will be used instead of the value when submitting to the server. Defaults to true.
				@property {String} value - [read-only] a comma denoted list of "valueField" properties of the selected objects. [29,31,4,newlabel1,34].
				
				@property {boolean} cloneToNative - If element is inside a <form> tag and has a name set, a sibling hidden element with the same name will be created and its value will be updated to reflect the iron-select element value. Defaults to true.
				@property {String} name - specifies input name, has meaning when cloneToNative is true.
				
				
				
			*/
			selected : 				{ type : Array,		value : [],				notify : true	},

			placeholder : 			{ type : String,	value : "type a tag",	notify : true	},
			multi : 				{ type : Boolean,	value : true,			notify : true	},

			dataSource : 			{ type : String,	value : "",				notify : true	},
			dataSourceQueryByLabel :{ type : String,	value : "",				notify : true	},
			dataSourceQueryByValue :{ type : String,	value : "",				notify : true	},
			dataSourceQueryField : 	{ type : String,	value : "q",			notify : true	},
			minLength :				{ type : Number,	value : 3,				notify : true	},

			labelField : 			{ type : String,	value : "label",		notify : true	},
			valueField : 			{ type : String,	value : "value",		notify : true	},

			preventDefault : 		{ type : Boolean,	value : true,			notify : true	},
	
			allowCreate : 			{ type : Boolean,	value : true },
			value : 				{ type : String,	value : "",				notify : true,  observer: '_valueChanged'	},
			
			cloneToNative :			{ type : Boolean,	value : true },
			name :					{ type : String, value : "" }
		},
		
		observers: [
			'_selectedChanged(selected.splices)'
		],
		
	});
	
	function encodeQuery(q)
	{
		if(!q) 
			return ""
		return q.split("&").map(function(pair) { var res = pair.split("="); return [res[0], encodeURIComponent(res[1])].join("=") }).join('&');
	}
})();
