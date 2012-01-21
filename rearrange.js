
// This function returns true if an element is not a header tag.
function isBodyTag(element) {

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
}

/* This function takes in a DOM element and returns true or false based on whether
it meets the criteria for being a re-arrangeable object. */
function meetsCriteria(elem) {

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
}

function traverse( element, classes ) {
	if( !jQSegment(element).hasClass(classes.unsortableClass) && isBodyTag(element) ) {
		var parents = jQSegment(element).parents();
		if( meetsCriteria(element) ) {
			jQSegment(element).addClass(classes.sortableClassItem);
			jQSegment(parents[0]).addClass(classes.sortableClassContainer);

			jQSegment(parents).each(function() {
				
				if( jQSegment(this).hasClass(classes.sortableClassItem) ) {
					jQSegment(this).removeClass(classes.sortableClassItem);
					jQSegment(this).addClass(classes.unsortableClass);	
				}
			});

		} else {
			jQSegment(element).addClass(classes.unsortableClass);
		}

		jQSegment(parents).each(function() {
			traverse( this, classes );
		})
	} else {
	}

}

/* This function takes in the array of class names the script will apply to
all the elements based on the page. It makes sure they do not currently exist
and if they do, it appends random integers to the end of them until they're unique. */
function getUniqueNames(classes) {
	jQSegment(classes).each(function() {
		while( jQSegment("."+this.toString()).size() > 0 ) {
			this += Math.floor(Math.random()*10);	
		}
	});

	return classes;
}

jQSegment(document).ready(function() {

	var classes = [];
	classes.sortableClassItem = 'segmenter-sortable';
	classes.sortableClassContainer = 'segmenter-sortable-container'
	classes.unsortableClass = 'segmenter-unsortable';
	classes.deleteClass = 'delete';

	classes = getUniqueNames(classes);

	var bodyElem = jQSegment('body');

	var childlessElements = jQSegment('body *:not(:has(*)):visible');
	
	jQSegment(childlessElements).each(function() {
		traverse(this, classes);
	});

	console.log(jQSegment('.'+classes.sortableClassContainer));
	jQSegment('.'+classes.sortableClassContainer).sortable({ helper: getDragClone });
	jQSegment('.'+classes.sortableClassContainer).sortable("option", "connectWith", '.'+classes.sortableClassContainer);

	jQSegment('.'+classes.sortableClassContainer).bind( "sortreceive", function(event, ui) {
		var movedElement = ui.item;

		jQSegment(movedElement).find("*").each(function() {

			if(this.clientWidth > event.currentTarget.clientWidth) {
				jQSegment(this).width(event.currentTarget.clientWidth);
				
			}
		});

	});

	var deleteButton = "<div class=\""+classes.deleteClass+"\" id=\""+i+"\" style='width:10px;height:10px;border:1px solid black;position:absolute;right:1%;top:1%;text-align:center;line-height:8px;font-weight:normal;font-size:10px;font-family:Arial;sans-serif;background-color:#FFFFFF;-moz-user-select: -moz-none;-khtml-user-select: none;-webkit-user-select: none;user-select: none;'>X</div>";
	jQSegment('body .'+classes.sortableItemContainer).children().css('position', 'relative');
	jQSegment('body .'+classes.sortableItemContainer).children().append(deleteButton);

	jQSegment('.'+classes.deleteClass).click(function() {
		jQSegment(this).parent().slideUp();
	});
});

/* Return an element that is a clone if the element to be dragged
with some changes for dragging */
function getDragClone(event, ui) {

	var cloneElem = ui.clone();

	var newWidth = event.currentTarget.clientWidth+"px";
	var newHeight = event.currentTarget.clientHeight+"px";


	jQSegment(cloneElem).css('width', newWidth);
	jQSegment(cloneElem).css('border', "1px dashed grey");
	jQSegment(cloneElem).css('opacity', '0.8');
	jQSegment(cloneElem).css('background-color', '#FFFFFF');
	jQSegment(cloneElem).css('padding', '3px');

	//jQSegment(cloneElemContainer).append(cloneElem);

	return cloneElem;
}
