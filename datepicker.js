// CronusTimePicker v1.03a (19 Apr 2012)
// https://github.com/search?q=CronusTimePicker

(function($){
	"use strict";
	
	// http://blog.stevenlevithan.com/archives/date-time-format
	// Date Format 1.2.3
	var dateFormat=function(){var a=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,b=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,c=/[^-+\dA-Z]/g,d=function(a,b){a=String(a),b=b||2;while(a.length<b)a="0"+a;return a};return function(e,f,g){var h=dateFormat;arguments.length==1&&Object.prototype.toString.call(e)=="[object String]"&&!/\d/.test(e)&&(f=e,e=undefined),e=e?new Date(e):new Date;if(isNaN(e))throw SyntaxError("invalid date");f=String(h.masks[f]||f||h.masks["default"]),f.slice(0,4)=="UTC:"&&(f=f.slice(4),g=!0);var i=g?"getUTC":"get",j=e[i+"Date"](),k=e[i+"Day"](),l=e[i+"Month"](),m=e[i+"FullYear"](),n=e[i+"Hours"](),o=e[i+"Minutes"](),p=e[i+"Seconds"](),q=e[i+"Milliseconds"](),r=g?0:e.getTimezoneOffset(),s={d:j,dd:d(j),ddd:h.i18n.dayNames[k],dddd:h.i18n.dayNames[k+7],m:l+1,mm:d(l+1),mmm:h.i18n.monthNames[l],mmmm:h.i18n.monthNames[l+12],yy:String(m).slice(2),yyyy:m,h:n%12||12,hh:d(n%12||12),H:n,HH:d(n),M:o,MM:d(o),s:p,ss:d(p),l:d(q,3),L:d(q>99?Math.round(q/10):q),t:n<12?"a":"p",tt:n<12?"am":"pm",T:n<12?"A":"P",TT:n<12?"AM":"PM",Z:g?"UTC":(String(e).match(b)||[""]).pop().replace(c,""),o:(r>0?"-":"+")+d(Math.floor(Math.abs(r)/60)*100+Math.abs(r)%60,4),S:["th","st","nd","rd"][j%10>3?0:(j%100-j%10!=10)*j%10]};return f.replace(a,function(a){return a in s?s[a]:a.slice(1,a.length-1)})}}();
		
	// Some common format strings.
	dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};
	
	// Internationalization strings.
	var dateFormati18n = {
		dayHeaders: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};
	if ($.dateFormat == undefined || $.dateFormat.i18n == undefined) dateFormat.i18n = dateFormati18n;
	
	// DatePicker class.
	
	function DatePicker(Element, Settings) {
		// Configuration.
		var Configuration = {
			MonthNameFormat: 'mmm yyyy',
			Format: 'isoDate'
		};
		
		// Preferences.
		var Self = this;
		Self.Preferences = $.extend({ }, Configuration, Settings);

		// Private methods.
		
		var C = function(Name, Default) {
			if (Default == undefined) Default = false;
			var Result = Default;
			if (Name in Self.Preferences) Result = Self.Preferences[Name];
			return Result;
		};
		
		var GetMonthHtml = function(DateMonth) {
			var bCurrentMonth = (Today.getFullYear() == DateMonth.getFullYear() && DateMonth.getMonth() == Today.getMonth());
			var DayNames = dateFormati18n.dayHeaders;
			if (!(DateMonth instanceof Date)) throw new Error("Fatal error in DatePicker.DrawMonth(): DateMonth is not an object.");
			
			// Month sequence.
			var Year = DateMonth.getFullYear();
			var Month = DateMonth.getMonth();
			var FirstDay = new Date(Year, Month, 1);
			var LastDay = new Date(FirstDay.getFullYear(), FirstDay.getMonth() + 1, 0);
			var Sequence = new Array(43);
			var WeekDay = FirstDay.getDay() - 1;
			if (WeekDay < 0) WeekDay = 6;
			for (var i = 1, LastDayDate = LastDay.getDate(); i <= LastDayDate; i++) {
				if (bCurrentMonth && i == Today.getDate()) Sequence[i + WeekDay] = Wrap(i, 'td', {'class': 'Today'});
				else Sequence[i + WeekDay] = Wrap(i, 'td');
			}
			var PrevMonthLastDay = (new Date(Year, Month, 0)).getDate();
			for (i = 6; i >= 0; i--) {
				if (typeof Sequence[i] == 'undefined') Sequence[i] = Wrap(PrevMonthLastDay--, 'td', {'class': 'PreviousDayMonth' });
			}
			var NextMonthFirstDay = (new Date(Year, Month + 1, 1)).getDate();
			for (i = 31; i < 43; i++) {
				if (typeof Sequence[i] == 'undefined') {
					Sequence[i] = Wrap(NextMonthFirstDay++, 'td', {'class': 'NextDayMonth' });
				}
			}
			
			var MonthHtml = '<thead><tr>';
			var MonthTitle = dateFormat(DateMonth, C('MonthNameFormat'));
			MonthHtml += Wrap('<span class="ClearButton">Clear</span>', 'th');
			MonthHtml += Wrap(MonthTitle, 'th', {'colspan': 5, 'class': 'MonthName'});
			MonthHtml += Wrap('<span class="CloseButton">Close</span>', 'th');

			// Control buttons.
			MonthHtml += '</tr>';
			MonthHtml += '<tr>';
			MonthHtml += Wrap('«', 'th', {'class': 'NavigationButton PrevYearButton'});
			MonthHtml += Wrap('‹', 'th', {'class': 'NavigationButton PrevMonthButton'});
			MonthHtml += Wrap('Today', 'th', {'colspan': 3, 'class': 'NavigationButton TodayButton'});
			MonthHtml += Wrap('›', 'th', {'class': 'NavigationButton NextMonthButton'});
			MonthHtml += Wrap('»', 'th', {'class': 'NavigationButton NextYearButton'});
			MonthHtml += '</tr><tr>';
			for (var n = 0; n < 7; n++) MonthHtml += Wrap(DayNames[n], 'th');
			
			MonthHtml += '</tr>';
			MonthHtml += '</thead><tbody>';
			var DayOffset = 1;
			var DayEnd = 36;
			for (var i = DayOffset; i <= DayEnd; i += 7) {
				MonthHtml += '<tr>';
				for (var EndWeek = i + 6, Day = i; Day <= EndWeek; Day++) {
					MonthHtml += Sequence[Day];
				}
				MonthHtml += '</tr>';
			}
			MonthHtml += '</tbody>';
			MonthHtml = Wrap(MonthHtml, 'table', {'class': 'Month', 'data-year': DateMonth.getFullYear(), 'data-month': DateMonth.getMonth()});
			MonthHtml = Wrap(MonthHtml, 'div', {'class': 'MonthBox'});
			return MonthHtml;
		};
		
		var GetNewMonthData = function(NextDate){
			if (!(NextDate instanceof Date)) {
				var Offset;
				var Button = $(this);
				if (Button.is('.PrevMonthButton')) Offset = -1;
				else if (Button.is('.NextMonthButton')) Offset = 1;
				else if (Button.is('.PrevYearButton')) Offset = -12;
				else if (Button.is('.NextYearButton')) Offset = 12;
				else throw new Error("Unknow button class.");
				NextDate = GetViewingDateObject(this, Offset);
			}
			var SelfSelector = 'div.DatePicker';
			var DatePickerBox = $(this).is(SelfSelector) ? this : $(this).parents(SelfSelector);
			if (DatePickerBox.length == 0) throw new Error("Fatal error in DatePicker.GetNewMonthData(): [div.DatePicker] not found.");
			var NextMonthHtml = GetMonthHtml(NextDate);
			DatePickerBox.html(NextMonthHtml);
			
			$('.PrevMonthButton', DatePickerBox).bind('click', GetNewMonthData);
			$('.NextMonthButton', DatePickerBox).bind('click', GetNewMonthData);
			$('.PrevYearButton', DatePickerBox).bind('click', GetNewMonthData);
			$('.NextYearButton', DatePickerBox).bind('click', GetNewMonthData);
			$('.TodayButton', DatePickerBox).bind('click', function(){
				GetNewMonthData.call(this, Today);
			});
			$('td', DatePickerBox).bind('click', function(){
				var Day = $(this).html();
				var ViewingDate = GetViewingDateObject(this, 0, Day);
				var Time = DatePickerBox.find('.InputTimeBox').val();
				if (Time) {
					Time = Time.split(':');
					ViewingDate.setHours(Time[0]);
					ViewingDate.setMinutes(Time[1]);
					ViewingDate.setSeconds(Time[2]);
				}
				$(Element).val( dateFormat(ViewingDate, C('Format')) );
				Self.Close();
				return false;
			});
			$('.CloseButton').bind('click', Self.Close);
			$('.ClearButton').bind('click', Self.Clear);
		};
		
		// Public methods.
		Self.Close = function(){
			Calendar.fadeOut('fast', function(){
				$(this).remove();
			});
		};
		
		Self.Clear = function() {
			$(Element).val('');
			Self.Close();
		};
		
		Self.Open = function() {
			Calendar.appendTo('body');
			var ElementDateValue;
			if ($(Element).is(':input')) {
				ElementDateValue = $(Element).val();
			} else throw new Error("Invalid element.");
			// Get date from input element.
			var ElementDate = new Date(ElementDateValue);
			var ElementDateGetTime = ElementDate.getTime();
			if (ElementDateGetTime == 0 || isNaN(ElementDateGetTime)) ElementDate = new Date();
			GetNewMonthData.call(Calendar, ElementDate);
			Calendar.fadeIn('fast');
		};
	
		// Initialize calendar.
		var Calendar = $('<div class="DatePicker"/>').hide();
		var position = $(Element).position();
		Calendar.css('position', 'absolute');
		Calendar.css('top', position.top + $(Element).outerHeight());
		Calendar.css('left', position.left);
		
		// Attach calendar to element.
		$(Element).focus(function(){
			Self.Open();
		});
	}
	
	// Useful functions.
	
	var UniqueID = function() {
		return new Date().getTime();
	};
	
	var LeadingZeros = function(N) {
		return ('0'+N).substr(-2);
	};
	
	var Wrap = function(NewString, Tag, Attributes) {
		if (!Tag) return NewString;
		var NewAttributes = '';
		if (typeof Attributes == 'object') {
			$.each(Attributes, function(Index, Value){
				NewAttributes += ' ' + Index + '="' + Value + '"';
			});				
		}
		return '<' + Tag + NewAttributes + '>' + NewString + '</' + Tag + '>';
	};
	
	// Pre initializtion.
	var Today = new Date();
	
	var GetViewingDateObject = function(Sender, Offset, Day) {
		if (!Day) Day = 1;
		if ($(Sender).is('.PreviousDayMonth')) Offset = Offset - 1;
		else if ($(Sender).is('.NextDayMonth')) Offset = Offset + 1;
		var TableMonth = $(Sender).parents('.DatePicker').find('table');
		var ViewingMonth = Number(TableMonth.attr('data-month'))
		var ViewingYear = Number(TableMonth.attr('data-year'));
		if (!Offset) Offset = 0;
		return new Date(ViewingYear, ViewingMonth + Offset, Day);
	};
	
	var AllObjects = [];
	
	$.DatePicker = DatePicker;
	
	$.DatePicker.CloseAll = function() {
		for (var i = 0; i < AllObjects.length; i++) {
			var Plugin = AllObjects[i];
			Plugin.Close();
		}
	};

    $.fn.DatePicker = function(Settings) {
        return this.each(function() {
            // if plugin has not already been attached to the element
            if (undefined == $(this).data('DatePicker')) {
                var Plugin = new DatePicker(this, Settings);
				AllObjects[AllObjects.length] = Plugin;
                $(this).data('DatePicker', Plugin);
            }
        });
    };
	
	$(document).bind('click', function(e){
		var target = $(e.target);
		if (target.is('.NavigationButton')) return;
		if (target.data('DatePicker')) return;
		if (undefined == target.data('events')) {
			$.DatePicker.CloseAll();
		}
	});

})(jQuery);
