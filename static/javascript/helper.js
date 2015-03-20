/**
 * Created by simonhutton on 19/11/14.
 */

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'gi'), replace);
}


Date.prototype.convertDateToUTC = (function() {
    return new Date(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds());
});


Date.prototype.getWeekday = function() {
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	return days[this.getDay()];
};

Date.prototype.getMonthNameShort = function(lang) {
	lang = lang && (lang in Date.locale) ? lang : 'en';
	return Date.locale[lang].month_names_short[this.getMonth()];
};

Date.locale = {
	en: {
	   month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	   month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	}
};

function secondsToText(seconds){
	var diffHours = seconds / 60;

	var hours = Math.floor(diffHours/60);
	var minutes = Math.floor(diffHours % 60);

	var result = "";

	if (hours > 48){
		result = Math.floor(hours / 24) + " Days";
	} else {
		if (hours == 1){
			result = "1 hour ";
		} else if (hours > 1){
			result = hours + " hours ";
		}

		if (hours < 12 ){
			if (minutes == 1){
				result += "1 minute";
			} else if (minutes > 1){
				result += minutes + " minutes";
			}
		}
	}

	return result;
}

Date.prototype.getDifferenceText = function(date) {
	var started;
	var ended;
	if (this < date){
		started = this;
		ended = date;
	} else{
		started = date;
		ended = this;
	}

	var secondsDiff = Math.abs((ended.getTime() - started.getTime()) / 1000);

	return secondsToText(secondsDiff);
}

Date.prototype.getTimeText = function() {

    if (this.getHours() < 12){
        return this.getHours() + ":" + ("0" + this.getMinutes()).slice(-2) + "am";
    }

    if (this.getHours() > 12){
        return (this.getHours() - 12) + ":" + ("0" + this.getMinutes()).slice(-2) + "pm";
    }

    return "12:" + ("0" + this.getMinutes()).slice(-2) + "pm";
}
