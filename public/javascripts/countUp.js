 function countup(){
	 alert("begin");
    // Get the element to append to
    var cdays = $('.days');
	var chours = $('.hours');
	var cminutes = $('.minutes');
    var cseconds = $('.seconds');
    // Set the targetDate
    var targetDate = new Date("May 12, 2011 20:00:00");

    var remainingSeconds = ~ ~((targetDate - new Date()) / 1000);
    var remainingTime = {
        "days": remainingSeconds / (60 * 60 * 24),
        "hours": (remainingSeconds % (60 * 60 * 24)) / (60 * 60),
        "minutes": (remainingSeconds % (60 * 60)) / 60,
        "seconds": remainingSeconds % 60
    };

    // Store the result in the element
    cdays.innerHTML = ~ ~remainingTime[0];
	chours.innerHTML = ~ ~remainingTime[1];
	cminutes.innerHTML = ~ ~remainingTime[2];
	cseconds.innerHTML = ~ ~remainingTime[3];
	alert("end");
 }

 // Update the timer every 1 second
 setInterval(updateTimer, 1000);