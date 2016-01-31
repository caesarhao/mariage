 (function ($) {
	 $.fn.countup = function (options, callback) {
 
	
    // Get the element to append to
    var cdays = $('.days');
	var chours = $('.hours');
	var cminutes = $('.minutes');
    var cseconds = $('.seconds');
    // Set the targetDate
    var targetDate = new Date("May 2, 2015 15:00:00");

	function count(){
		 var remainingSeconds =Math.abs( ~ ~((targetDate - new Date()) / 1000));
		 var remainingTime = {
			"days": remainingSeconds / (60 * 60 * 24),
			"hours": (remainingSeconds % (60 * 60 * 24)) / (60 * 60),
			"minutes": (remainingSeconds % (60 * 60)) / 60,
			"seconds": remainingSeconds % 60
		};

    // Store the result in the element
		cdays.text (~ ~remainingTime["days"]);
		chours.text (~ ~remainingTime["hours"]);
		cminutes.text(~ ~remainingTime["minutes"]);
		cseconds.text(~ ~remainingTime["seconds"]);
		

	 }
	 		// start count
		var interval = setInterval(count, 1000);


    };
	


})(jQuery);
	        
 
