(function(){

	// the minimum version of jQuery we want
	// totally arbitrary version, swiped from Resizer
	var jQueryVersion = "1.7.1";
	var jQueryUIVersion = "1.8.17";

	/* This will be our global jQuery variable. We'll use it with
	noConflict() to make sure we don't step on any existing jQuery in
	a page. */
	var jQSegment;

	var Rearrange = {

		traverse: function( element, classes ) {
			// If it is a body tag and hasn't already been declared unsortable, traverse it!
			if( Rearrange.isBodyTag(element) && !jQSegment(element).hasClass(classes.unsortableClass) ) {

				// All parents, all the way up to the top level
				var parents = jQSegment(element).parents();

				if( Rearrange.meetsCriteria(element) ) {

					/* If an element meets criteria, mark it sortable and mark it's
					parent as a sortable container */
					jQSegment(element).addClass(classes.sortableClassItem);
					jQSegment(parents[0]).addClass(classes.sortableClassContainer);

					// If something is sortable, none of its parents can be sortable
					jQSegment(parents).each(function() {
						if( jQSegment(this).hasClass(classes.sortableClassItem) ) {
							jQSegment(this).removeClass(classes.sortableClassItem);
							jQSegment(this).addClass(classes.unsortableClass);	
						}
					});

				} else {
					jQSegment(element).addClass(classes.unsortableClass);
				}

				// Traverse the DOM from the bottom up.
				jQSegment(parents).each(function() {
					Rearrange.traverse( this, classes );
				})

			}
		},

		init: function() {

			// These are the classes Rearrange will apply to all body elements
			var classes = [];
			classes.sortableClassItem = 'segmenter-sortable';
			classes.sortableClassContainer = 'segmenter-sortable-container'
			classes.unsortableClass = 'segmenter-unsortable';
			classes.deleteClass = 'delete';

			// Lets make them unique if they're already used on the page.
			classes = Rearrange.getUniqueNames(classes);

			var bodyElem = jQSegment('body');

			var childlessElements = jQSegment('body *:not(:has(*)):visible');

			/* Rearrange.traverse starts at the bottom of the DOM tree (elements without
			children) and works its way up. */
			jQSegment(childlessElements).each(function() {
				Rearrange.traverse(this, classes);
			});

			/* After traverse has run, all body elements should be labeled with either a 
			sortable, unsortable, or sortable container class (which are also unsortable).
			So make the sortable containers sortable and connect them together. Yay jQuery! */
			jQSegment('.'+classes.sortableClassContainer).sortable({ helper: Rearrange.getDragClone });
			jQSegment('.'+classes.sortableClassContainer).sortable("option", "connectWith", '.'+classes.sortableClassContainer);

			/* This is some hacky code to re-size elements to fit their new container when you
			move them somewhere. Doesn't expand back to original size if you move it out of the
			small container. Will make this more robust later. */
			jQSegment('.'+classes.sortableClassContainer).bind( "sortreceive", function(event, ui) {
				var movedElement = ui.item;

				jQSegment(movedElement).find("*").each(function() {

					if(this.clientWidth > event.currentTarget.clientWidth) {
						jQSegment(this).width(event.currentTarget.clientWidth);
					
					}
				});

			});
/*
			var deleteButton = "<div class=\""+classes.deleteClass+"\" style='width:10px;height:10px;border:1px solid black;position:absolute;right:1%;top:1%;text-align:center;line-height:8px;font-weight:normal;font-size:10px;font-family:Arial;sans-serif;background-color:#FFFFFF;-moz-user-select: -moz-none;-khtml-user-select: none;-webkit-user-select: none;user-select: none;'>X</div>";
			jQSegment('body .'+classes.sortableItemContainer).children().css('position', 'relative');
			jQSegment('body .'+classes.sortableItemContainer).children().append(deleteButton);

			jQSegment('.'+classes.deleteClass).click(function() {
				jQSegment(this).parent().slideUp();
			});
*/

			Rearrange.displayLoadedMessage();
		},

		displayLoadedMessage: function(element) {
	/*		var loadedMessage = "<div id=\"loadedMessage\" style=\"display:none;style="border-radius:8px;width:200px;height:20px;margin-right:auto;position:fixed;top:5px;left:40%;background-color:#ADD8E6;padding:8px;font-size:10pt;text-align:center;\">Page can now be rearranged.</div>";
	//		jQSegment('body').append(loadedMessage);
	//		jQSegment('#loadedMessage').fadeIn("fast").delay(5000).fadeOut("slow");
	*/
		},

		// This function returns true if an element is not a header tag.
		isBodyTag: function(element) {

			switch(element.nodeName.toLowerCase()) {
	
				case 'html':
					return false;
				case 'head':
					return false;
				case 'title':
					return false;
				case 'script':
					return false;
				case 'style':
					return false;
				case 'meta':
					return false;
				case 'link':
					return false;
				case 'noscript':
					return false;
				default:
					return true;
			}
		},

		/* This function takes in a DOM element and returns true or false based on whether
		it meets the criteria for being a re-arrangeable object. */
		meetsCriteria: function(elem) {

			/* The minimum and maximum area (as % of entire <body> area) an element
			can be between and be considered re-arrangeable. */
			var minPercentage = .007;
			var maxPercentage = .12;

			var bodyArea = jQSegment('body').width()*jQSegment('body').height();
			var elemArea = jQSegment(elem).width()*jQSegment(elem).height()

			// If the element is within the area constraints and is visible on the page, return true
			if(elemArea/bodyArea > minPercentage && elemArea/bodyArea < maxPercentage && jQSegment(elem).is(':visible') ) {
				return true;
			} else {
				return false;
			}
		},

		/* This function takes in the array of class names the script will apply to
		all the elements based on the page. It makes sure they do not currently exist
		and if they do, it appends random integers to the end of them until they're unique. */
		getUniqueNames: function(classes) {
			jQSegment(classes).each(function() {
				while( jQSegment("."+this.toString()).size() > 0 ) {
					jQSegment(this) = this.toString() + Math.floor(Math.random()*10);	
				}
			});

			return classes;
		},

		/* Return an element that is a clone if the element to be dragged
		with some changes for dragging */
		getDragClone: function(event, ui) {

			var cloneElem = ui.clone();

			var newWidth = event.currentTarget.clientWidth+"px";
			var newHeight = event.currentTarget.clientHeight+"px";

			// Set the CSS for the drag element (semi transparent, border, padding)
			jQSegment(cloneElem).css('width', newWidth).css('border', "1px dashed grey").css('opacity', '0.8').css('background-color', '#FFFFFF').css('padding', '3px');

			return cloneElem;
		}

	};

	// check prior inclusion and version for jQuery
	// and load from Google if not already there
	if (window.jQuery === undefined || window.jQuery.fn.jquery < jQueryVersion) {
		console.log("no jquery!");
		var done = false;
		var script = document.createElement("script");
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + jQueryVersion + "/jquery.min.js";
		console.log(script);
		script.onload = script.onreadystatechange = function(){
			console.log("script.onload");
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				console.log("first done.");
				if (jQuery.ui === undefined || jQuery.ui.version < jQueryUIVersion) {
					console.log("first ui if");
					var uiDone = false;
					var uiScript = document.createElement("script");
					uiScript.src = "http://ajax.googleapis.com/ajax/libs/jqueryui/" + jQueryUIVersion + "/jquery-ui.min.js";
					uiScript.onload = script.onreadystatechange = function(){
						console.log("uiscript onload");
						if (!uiDone && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
							console.log("uiscript done");
							uiDone = true;
							jQSegment = jQuery.noConflict();
							Rearrange.init();
						}
					};
					document.getElementsByTagName("head")[0].appendChild(uiScript);
				}
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		if (jQuery.ui === undefined || jQuery.ui.version < jQueryUIVersion) {
			console.log("second ui if");
			var uiDone = false;
			var uiScript = document.createElement("script");
			uiScript.src = "http://ajax.googleapis.com/ajax/libs/jqueryui/" + jQueryUIVersion + "/jquery-ui.min.js";
			uiScript.onload = uiScript.onreadystatechange = function(){
				if (!uiDone && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					uiDone = true;
					jQSegment = jQuery.noConflict();
					Rearrange.init();
				}
			};
			document.getElementsByTagName("head")[0].appendChild(uiScript);
		}		
	}

})();