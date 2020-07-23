require('typeface-inter');
import $ from 'jquery';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/fonts/slick.woff';
import 'slick-carousel/slick/fonts/slick.ttf';
let loadNextPage = 'main-page';
let hideSearchBox = false;
let client_data = new Object({
    roomCount: 0,
    rooms: {
        'first_room': {
            adult: 1,
            children: []
        }
    },
    peoples: {
        children: 0,
        adult: 1
    },
    promo_code: '',
    selectedDate: {
        in: {
            selected: false,
            timestamp: 0
        },
        out: {
            selected: false,
            timestamp: 99999999999999
        }
    },
    childId: 1,
    needRefresh: true,
});
(function ($) {
    $.fn.roomAppendingWindow = function () {
        let thisObj = this;
        let keys = Object.keys(client_data.rooms);
        this.refreshKeys = function () {
            keys = Object.keys(client_data.rooms);
            return this;
        }
        this.removeWindow = function () {
            $('body').find('.reserve-selection-popup').remove();
        }
        this.unbindWindow = function () {
            thisObj.unbind().removeData().find('.reserve-selection-popup').remove();
        }
        this.attachEventListeners = function () {
            thisObj.on('click', '.reserve-selection-popup', function (event) {
                event.stopPropagation();
                event.preventDefault();
            });
            thisObj.on('click', function (event) {
                thisObj.removeWindow();
                thisObj.refreshKeys();
                if (keys.length > 1) {
                    thisObj.windowLoad();
                }
                event.stopPropagation();
                event.preventDefault();
                return false;
            });
            $('body').on('click', function () {
                thisObj.removeWindow();
            });
            thisObj.on('click', '.window-close-btn', function (event) {
                thisObj.removeWindow();
                event.stopPropagation();
                event.preventDefault();
            });
            return this;
        }
        this.getRows = function () {
            $.get('templates/reserve-selection-row.html', function (data) {
                    let row = $(data);
                }
            ).fail(function (err) {
                console.log(err)
            });
            return this;
        }
        this.showWindow = function () {
            thisObj.removeWindow();
            thisObj.refreshKeys();
            if (keys.length > 1) {
                thisObj.windowLoad();
            } else {
                loadNextPage = 'services-block';
            }
            return false;
        }
        this.windowLoad = function () {
            $.get('templates/reserve-selection-popup.html', function (data) {
                    let reserveWindow = $(data);
                    thisObj.append(reserveWindow);
                }
            ).fail(function (err) {
                console.log(err)
            });
            return this;
        }
        thisObj.showWindow();
        thisObj.attachEventListeners();
        return true;
    }
})(jQuery);
(function ($) {
    $.fn.roomSelectionWindow = function () {
        let currentObj = this;
        let keys = Object.keys(client_data.rooms);
        this.stopUpdate = false;
        this.windowExists = function () {
            if (currentObj.find('.reserve-room-window').length > 0) {
                return true;
            } else {
                return false;
            }
        }
        this.refreshKeys = function () {
            keys = Object.keys(client_data.rooms);
            return this;
        }
        this.removeWindow = function () {
            currentObj.find('.reserve-room-window').remove();
        }
        this.loadWindow = function () {
            console.log('load window right');
            currentObj.refreshKeys();
            currentObj.refreshKeys();
            let arrb = $('body').find('.available-rooms-results-block').length > 0;
            if ((keys.length > 1) && arrb) {
                $.get('templates/room-reserve-window.html', function (data) {
                        let roomWindow = $(data);
                        currentObj.stopUpdate = true;
                        currentObj.removeWindow();
                        currentObj.append(roomWindow);
                        currentObj.stopUpdate = false;
                        currentObj.refreshWindow();
                    }
                ).fail(function (err) {
                    console.log(err);
                });
            } else {
                currentObj.removeWindow();
            }
        }
        this.refreshWindow = function () {
            currentObj.find('.room-row').remove();
            currentObj.refreshKeys();
            function loadNext(i) {
                if (i <= keys.length) {
                    $.get('templates/room-row.html', function (data) {
                            currentObj.stopUpdate = true;
                            let roomRow = $(data);
                            roomRow.find('.room-row').eq(0).attr('data-id', keys[i - 1]);
                            roomRow.find('.room-row-count').eq(0).html(i);
                            roomRow.find('.adult .count').html(client_data.rooms[keys[i - 1]].adult);
                            roomRow.find('.children .count').html(client_data.rooms[keys[i - 1]].children.length);
                            currentObj.find('.rooms-list').append(roomRow);
                            loadNext(++i);
                            currentObj.stopUpdate = false;
                        }
                    ).fail(function (err) {
                        console.log(err)
                    });
                }
            }
            loadNext(1);
            return this;
        }
        setInterval(function () {
            if (client_data.needRefresh) {
                currentObj.loadWindow();
                client_data.needRefresh = false;
            }
        }, 500);
        return this;
    }
})(jQuery);
(function ($) {
    $.fn.vcCalendar = function () {
        this.hidden = true;
        this.scrolling = false;
        let calendarObj = this;
        this.currentYear = new Date().getFullYear();
        this.activeYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
        this.activeMonth = new Date().getMonth() + 1;
        this.getDaysInMonth = function (year, month) {
            return new Date(year, month, 0).getDate();
        }
        this.clearMonth = function () {
            calendarObj.find('.month').remove();
            return this;
        }
        this.getDayInWeek = function (year, month) {
            let weekday = new Date(year, month - 1, 1).getDay();
            if (weekday === 0) {
                weekday = 7;
            }
            return weekday;
        }
        this.scrollToActive = function () {
            let offsetTop = 0;
            calendarObj.find('.month.active').removeClass('active');
            calendarObj.find('.month').filter($('[data-year="' + calendarObj.activeYear + '"][data-month="' + calendarObj.activeMonth + '"]')).addClass('active');
            if (calendarObj.find('.dates .month.active').length > 0) {
                offsetTop = calendarObj.find('.dates .month.active')[0].offsetTop;
            }
            calendarObj.find('.dates').eq(0).stop().animate({
                scrollTop: offsetTop
            }, {
                duration: 100,
                easing: "linear",
                start: function () {
                    calendarObj.scrolling = true;
                },
                complete: function () {
                    calendarObj.scrolling = false;
                },
                queue: false
            });
            return this;
        }
        this.selectRange = function () {
            calendarObj.find('.day.selected-first-date').removeClass('selected-first-date');
            calendarObj.find('.day.selected-second-date').removeClass('selected-second-date');
            calendarObj.find('.day.selected-range').removeClass('selected-range');
            if (client_data.selectedDate.in.selected) {
                calendarObj.find('.day[data-date="' + client_data.selectedDate.in.timestamp + '"]').addClass('selected-first-date');
            } else {
                calendarObj.find('.day.selected-first-date').removeClass('selected-first-date');
            }
            if (client_data.selectedDate.out.selected) {
                calendarObj.find('.day[data-date="' + client_data.selectedDate.out.timestamp + '"]').addClass('selected-second-date');
            } else {
                calendarObj.find('.day.selected-second-date').removeClass('selected-second-date');
            }
            if (client_data.selectedDate.in.selected && client_data.selectedDate.out.selected) {
                let start_selection = false;
                calendarObj.find('.day').each(function () {
                    if ($(this).hasClass('selected-first-date')) {
                        start_selection = true;
                        return;
                    }
                    if ($(this).hasClass('selected-second-date')) {
                        start_selection = false;
                        return false;
                    }
                    if (start_selection) {
                        $(this).addClass('selected-range');
                    }
                });
            } else {
                calendarObj.find('.day.selected-range').removeClass('selected-range');
            }
        }
        this.updateValues = function () {
            calendarObj.find('.month-row.active').removeClass('active');
            calendarObj.find('.month-row[data-id="' + calendarObj.activeMonth + '"]').addClass('active');
            calendarObj.find('.year-value').eq(0).html(calendarObj.activeYear);
        }
        this.refresh = function () {
            this.updateValues();
            calendarObj.scrollToActive();
        }
        this.showWindow = function () {
            if (calendarObj.hidden) {
                calendarObj.find('.calendar-window').css({
                    display: 'block'
                }).animate({
                    opacity: 1
                }, {
                    duration: 100,
                    easing: "linear",
                    start: function () {
                        calendarObj.scrolling = true;
                    },
                    complete: function () {
                        calendarObj.scrolling = false;
                    },
                    queue: false
                });
                calendarObj.hidden = false;
            }
            $('.popup-select-guest').animate({
                opacity: 0,
            }, animationDuration, function () {
                $(this).css({
                    display: 'none'
                });
            });
            return this;
        };
        this.hideWindow = function () {
            if (!calendarObj.hidden) {
                calendarObj.find('.calendar-window').animate({
                    opacity: 0,
                }, animationDuration, function () {
                    $(this).css({
                        display: 'none'
                    });
                });
                calendarObj.hidden = true;
            }
            return this;
        };
        this.vc_addScrollEventListener = function () {
            calendarObj.find('.dates').on('scroll', function () {
                let _obj = $(this);
                calendarObj.find('.month').each(function () {
                    let offsetTop = $(this)[0].offsetTop;
                    if (calendarObj.scrolling === false && (_obj[0].scrollTop - offsetTop) <= 50 && (_obj[0].scrollTop - offsetTop) >= -200) {
                        calendarObj.activeYear = parseInt($(this).attr('data-year'));
                        calendarObj.activeMonth = parseInt($(this).attr('data-month'));
                        calendarObj.updateValues();
                        calendarObj.addPreviousMonth(2);
                        calendarObj.addNextMonth(2);
                        return false;
                    }
                });
            });
        }
        this.vc_addEventListeners = function () {
            calendarObj.find('.calendar-icon').on('click', function (event) {
                calendarObj.showWindow();
                event.stopPropagation();
                return false;
            });
            calendarObj.find('.year-left-btn').on('click', function () {
                calendarObj.find('.month').remove();
                calendarObj.activeYear--;
                calendarObj.addActiveMonth();
                calendarObj.addPreviousMonth(2);
                calendarObj.addNextMonth(2);
                calendarObj.refresh();
            });
            calendarObj.find('.year-right-btn').on('click', function () {
                calendarObj.find('.month').remove();
                calendarObj.activeYear++;
                calendarObj.addActiveMonth();
                calendarObj.addPreviousMonth(2);
                calendarObj.addNextMonth(2);
                calendarObj.refresh();
            });
            calendarObj.on('click', function (event) {
                event.stopPropagation();
            });
            calendarObj.find('.dates').on('click', '.day', function () {
                if (!$(this).hasClass('selected-first-date') && !$(this).hasClass('selected-second-date')) {
                    if (!client_data.selectedDate.in.selected) {
                        if (parseInt($(this).attr('data-date')) < client_data.selectedDate.out.timestamp) {
                            $(this).addClass('selected-first-date');
                            client_data.selectedDate.in.selected = true;
                            client_data.selectedDate.in.timestamp = $(this).attr('data-date');
                            let _date = new Date(parseInt(client_data.selectedDate.in.timestamp));
                            let day = (_date.getDate() < 10) ? '0' + _date.getDate() : _date.getDate();
                            let month = (_date.getMonth() < 10) ? '0' + (_date.getMonth() + 1) : (_date.getMonth() + 1);
                            let text_date = day + '.' + month + '.' + _date.getFullYear();
                            $('.in-date-value').val(text_date);
                            if (client_data.selectedDate.out.selected) {
                                let start_selection = false;
                                calendarObj.find('.day').each(function () {
                                    if ($(this).hasClass('selected-first-date')) {
                                        start_selection = true;
                                        return;
                                    }
                                    if ($(this).hasClass('selected-second-date')) {
                                        start_selection = false;
                                        return false;
                                    }
                                    if (start_selection) {
                                        $(this).addClass('selected-range');
                                    }
                                });
                            }
                            return true;
                        } else {
                            console.log('err1');
                        }
                    }
                    if (!client_data.selectedDate.out.selected) {
                        if (parseInt($(this).attr('data-date')) > client_data.selectedDate.in.timestamp) {
                            $(this).addClass('selected-second-date');
                            client_data.selectedDate.out.selected = true;
                            client_data.selectedDate.out.timestamp = $(this).attr('data-date');
                            let _date = new Date(parseInt(client_data.selectedDate.out.timestamp));
                            let day = (_date.getDate() < 10) ? '0' + _date.getDate() : _date.getDate();
                            let month = (_date.getMonth() < 10) ? '0' + (_date.getMonth() + 1) : (_date.getMonth() + 1);
                            let text_date = day + '.' + month + '.' + _date.getFullYear();
                            $('.out-date-value').val(text_date);
                            let start_selection = false;
                            calendarObj.find('.day').each(function () {
                                if ($(this).hasClass('selected-first-date')) {
                                    start_selection = true;
                                    return;
                                }
                                if ($(this).hasClass('selected-second-date')) {
                                    start_selection = false;
                                    return false;
                                }
                                if (start_selection) {
                                    $(this).addClass('selected-range');
                                }
                            });
                            return true;
                        } else {
                            console.log('err2');
                        }
                    }
                } else {
                    if ($(this).hasClass('selected-first-date')) {
                        $(this).removeClass('selected-first-date');
                        calendarObj.find('.selected-range').removeClass('selected-range')
                        client_data.selectedDate.in.selected = false;
                        client_data.selectedDate.in.timestamp = 0;
                        $('.in-date-value').val('');
                        return true;
                    }
                    if ($(this).hasClass('selected-second-date')) {
                        $(this).removeClass('selected-second-date');
                        calendarObj.find('.selected-range').removeClass('selected-range')
                        client_data.selectedDate.out.selected = false;
                        client_data.selectedDate.out.timestamp = 99999999999999;
                        $('.out-date-value').val('');
                        return true;
                    }
                }
            });
            calendarObj.on('click', '.month-row', function () {
                calendarObj.activeMonth = parseInt($(this).attr('data-id'));
                calendarObj.addActiveMonth();
                calendarObj.addPreviousMonth(2);
                calendarObj.addNextMonth(2);
                calendarObj.scrollToActive();
            });
            calendarObj.on('click', '.in-date-value,.out-date-value', function () {
                calendarObj.showWindow();
            });
            calendarObj.find('.in-date-value').on("keyup paste change", function () {
                let date_arr = $(this).val().split(".");
                let start_date = new Date(date_arr[2], date_arr[1] - 1, date_arr[0]).getTime();
                if (start_date > 0) {
                    if (start_date < client_data.selectedDate.out.timestamp) {
                        calendarObj.activeYear = parseInt(date_arr[2]);
                        calendarObj.activeMonth = parseInt(date_arr[1]);
                        calendarObj.clearMonth();
                        calendarObj.addActiveMonth();
                        calendarObj.addNextMonth(1);
                        calendarObj.addPreviousMonth(1);
                        client_data.selectedDate.in.timestamp = start_date;
                        client_data.selectedDate.in.selected = true;
                        calendarObj.refresh();
                        calendarObj.selectRange();
                        return true;
                    }
                } else {
                    calendarObj.activeYear = calendarObj.currentYear;
                    calendarObj.activeMonth = calendarObj.currentMonth;
                    client_data.selectedDate.in.timestamp = 0;
                    client_data.selectedDate.in.selected = false;
                    calendarObj.refresh();
                    calendarObj.selectRange();
                }
            });
            calendarObj.find('.out-date-value').on("keyup paste change", function () {
                let date_arr = $(this).val().split(".");
                let end_date = new Date(date_arr[2], date_arr[1] - 1, date_arr[0]).getTime();
                if (end_date > 0) {
                    if (end_date > client_data.selectedDate.in.timestamp) {
                        calendarObj.activeYear = parseInt(date_arr[2]);
                        calendarObj.activeMonth = parseInt(date_arr[1]);
                        calendarObj.addActiveMonth();
                        calendarObj.addNextMonth(1);
                        calendarObj.addPreviousMonth(1);
                        client_data.selectedDate.out.timestamp = end_date;
                        client_data.selectedDate.out.selected = true;
                        calendarObj.refresh();
                        calendarObj.selectRange();
                    }
                } else {
                    client_data.selectedDate.out.timestamp = 9999999999999;
                    client_data.selectedDate.out.selected = false;
                    calendarObj.refresh();
                    calendarObj.selectRange();
                }
            });
            $('html').on('click', function () {
                calendarObj.hideWindow();
            });
            $('.in-date-value,.out-date-value').on('keypress', function (event) {
                if (event.keyCode < 47 || event.keyCode > 57) {
                    event.preventDefault();
                }
                let len = $(this)[0].value.length;
                if (len !== 1 || len !== 3) {
                    if (event.keyCode == 47) {
                        event.preventDefault();
                    }
                }
                if (len === 2) {
                    $(this)[0].value += '.';
                }
                if (len === 5) {
                    $(this)[0].value += '.';
                }
            });
            return this;
        }
        this.getFirstMonth = function () {
            let obj = this.find('.month').first();
            return new Object({
                year: parseInt(obj.attr('[data-year]')),
                month: parseInt(obj.attr('[data-month]'))
            });
        }
        this.getLastMonth = function () {
            let obj = this.find('.month').last();
            return new Object({
                year: parseInt(obj.attr('[data-year]')),
                month: parseInt(obj.attr('[data-month]'))
            });
        }
        this.getNext = function (_year, _month) {
            let year = _year;
            let month = _month + 1;
            if (month > 12) {
                month = 1;
                year++;
            }
            return new Object({
                year: year,
                month: month
            });
        }
        this.getPrevious = function (_year, _month) {
            let year = _year;
            let month = _month - 1;
            if (month < 1) {
                month = 12;
                year--;
            }
            return new Object({
                year: year,
                month: month
            });
        }
        this.getActiveDate = function () {
            return new Object({
                year: calendarObj.activeYear,
                month: calendarObj.activeMonth
            });
        }
        this.addPreviousMonth = function (i = 1) {
            let startDate = this.getActiveDate();
            startDate = this.getPrevious(startDate.year, startDate.month);
            for (let _i = 1; _i <= i; _i++) {
                this.addMonth(startDate.year, startDate.month);
                startDate = this.getPrevious(startDate.year, startDate.month);
            }
            return this;
        }
        this.addCurrentMonth = function () {
            this.addMonth(this.currentYear, this.currentMonth);
            return this;
        }
        this.addActiveMonth = function () {
            this.addMonth(this.activeYear, this.activeMonth);
            return this;
        }
        this.addNextMonth = function (i = 1) {
            let startDate = this.getActiveDate();
            startDate = this.getNext(startDate.year, startDate.month);
            for (let _i = 1; _i <= i; _i++) {
                this.addMonth(startDate.year, startDate.month);
                startDate = this.getNext(startDate.year, startDate.month);
            }
            return this;
        }
        this.addDataRangeSelection = function () {
            this.find('[data-date="' + client_data.selectedDate.in.timestamp + '"]').addClass('selected-first-date');
            this.find('[data-date="' + client_data.selectedDate.out.timestamp + '"]').addClass('selected-second-date');
        }
        this.addMonth = function (year, month) {
            calendarObj.scrolling = true;
            let monthText = calendarObj.find('.month-row[data-id="' + month + '"]').eq(0).find('.name').eq(0).text();
            let activeClass = ((year === this.activeYear) && (month === this.activeMonth)) ? 'active' : '';
            let monthBlock = $('<div class="month ' + activeClass + '" data-year="' + year + '" data-month="' + month + '"></div>');
            let yearLine = $('<div class="year-line"></div>');
            let monthCaption = $('<div class="month-caption">' + monthText + '</div>');
            let yearCaption = $('<div class="year-caption"></div>');
            let daysBlock = $('<div class="days"></div>');
            if (month === 1) {
                yearCaption.html(year);
                yearLine.css({
                    display: 'block'
                })
                monthBlock.append(yearLine);
                monthBlock.append(yearCaption);
            } else {
                yearCaption.html('');
            }
            monthBlock.append(monthCaption);
            if (this.getDayInWeek(year, month) > 1) {
                for (let i = 1; i < this.getDayInWeek(year, month); i++) {
                    daysBlock.append($('<div class="day"></div>'));
                }
            }
            for (let i = 1; i <= this.getDaysInMonth(year, month); i++) {
                daysBlock.append($('<div class="day" data-date="' + new Date(year, month - 1, i).getTime() + '"><span class="middle">' + i + '</span></div>'));
            }
            monthBlock.append(daysBlock);
            let elementExists = calendarObj.find('.month').filter($('[data-year="' + year + '"][data-month="' + month + '"]'));
            if (elementExists.length === 0) {
                let biggerMonth = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-month")) > month;
                });
                let likeMonth = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-month")) === month;
                });
                let lessMonth = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-month")) < month;
                });
                let biggerYear = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-year")) > year;
                });
                let likeYear = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-year")) === year;
                });
                let lessYear = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-year")) < year;
                });
                if (likeYear.length > 0) {
                    let filter1 = likeYear.filter($(lessMonth));
                    let filter2 = likeYear.filter($(biggerMonth));
                    if (filter1.length > 0) {
                        monthBlock.insertAfter(filter1.last());
                    } else if (filter2.length > 0) {
                        monthBlock.insertBefore(filter2.first());
                    }
                } else if (lessYear.length > 0) {
                    let filter1 = lessYear.filter($(lessMonth));
                    let filter2 = lessYear.filter($(biggerMonth));
                    let filter3 = lessYear.filter($(likeMonth));
                    if (filter2.length > 0) {
                        monthBlock.insertAfter(filter2.last());
                    }
                } else if (biggerYear.length > 0) {
                    let filter1 = biggerYear.filter($(lessMonth));
                    let filter2 = biggerYear.filter($(biggerMonth));
                    let filter3 = biggerYear.filter($(likeMonth));
                    if (filter1.length > 0) {
                        monthBlock.insertBefore(filter1.first());
                    }
                } else {
                    calendarObj.find('.dates').append(monthBlock);
                }
            } else {
            }
            calendarObj.scrolling = false;
        }
        $.get('templates/calendar.html', function (data) {
                calendarObj.append($(data));
                calendarObj.find('.calendar-window').css({
                    opacity: 0,
                    display: 'none'
                });
                calendarObj.vc_addEventListeners();
                calendarObj.vc_addScrollEventListener();
                calendarObj.addPreviousMonth(3);
                calendarObj.addNextMonth(3);
                calendarObj.addActiveMonth();
                calendarObj.refresh();
            }
        ).fail(function (err) {
            console.log(err)
        });
        return this;
    }
})(jQuery);
let selectGuestObj = null;
const animationDuration = 100;
(function ($) {
    function isDOMAttrModifiedSupported() {
        let p = document.createElement('p');
        let flag = false;
        if (p.addEventListener) p.addEventListener('DOMAttrModified', function () {
            flag = true
        }, false);
        else if (p.attachEvent) p.attachEvent('onDOMAttrModified', function () {
            flag = true
        });
        else return false;
        p.setAttribute('id', 'target');
        return flag;
    }
    function checkAttributes(chkAttr, e) {
        if (chkAttr) {
            let attributes = this.data('attr-old-value');
            if (e.attributeName.indexOf('style') >= 0) {
                if (!attributes['style']) attributes['style'] = {}; //initialize
                let keys = e.attributeName.split('.');
                e.attributeName = keys[0];
                e.oldValue = attributes['style'][keys[1]]; //old value
                e.newValue = keys[1] + ':' + this.prop("style")[$.camelCase(keys[1])]; //new value
                attributes['style'][keys[1]] = e.newValue;
            } else {
                e.oldValue = attributes[e.attributeName];
                e.newValue = this.attr(e.attributeName);
                attributes[e.attributeName] = e.newValue;
            }
            this.data('attr-old-value', attributes); //update the old value object
        }
    }
    //initialize Mutation Observer
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    $.fn.attr_change = function (o) {
        let cfg = {
            trackValues: false,
            callback: $.noop
        };
        //for backward compatibility
        if (typeof o === "function") {
            cfg.callback = o;
        } else {
            $.extend(cfg, o);
        }
        if (cfg.trackValues) { //get attributes old value
            $(this).each(function (i, el) {
                let attributes = {};
                for (let attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
                    attr = attrs.item(i);
                    attributes[attr.nodeName] = attr.value;
                }
                $(this).data('attr-old-value', attributes);
            });
        }
        if (MutationObserver) { //Modern Browsers supporting MutationObserver
            /*
               Mutation Observer is still new and not supported by all browsers.
               http://lists.w3.org/Archives/Public/public-webapps/2011JulSep/1622.html
            */
            let mOptions = {
                subtree: false,
                attributes: true,
                attributeOldValue: cfg.trackValues
            };
            let observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    let _this = e.target;
                    //get new value if trackValues is true
                    if (cfg.trackValues) {
                        /**
                         * @KNOWN_ISSUE: The new value is buggy for STYLE attribute as we don't have
                         * any additional information on which style is getting updated.
                         * */
                        e.newValue = $(_this).attr(e.attributeName);
                    }
                    cfg.callback.call(_this, e);
                });
            });
            return this.each(function () {
                observer.observe(this, mOptions);
            });
        } else if (isDOMAttrModifiedSupported()) { //Opera
            //Good old Mutation Events but the performance is no good
            //http://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/
            return this.on('DOMAttrModified', function (event) {
                if (event.originalEvent) event = event.originalEvent; //jQuery normalization is not required for us
                event.attributeName = event.attrName; //property names to be consistent with MutationObserver
                event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
                cfg.callback.call(this, event);
            });
        } else if ('onpropertychange' in document.body) { //works only in IE
            return this.on('propertychange', function (e) {
                e.attributeName = window.event.propertyName;
                //to set the attr old value
                checkAttributes.call($(this), cfg.trackValues, e);
                cfg.callback.call(this, e);
            });
        }
        return this;
    }
})(jQuery);
(function ($) {
    $.fn.disableSelection = function () {
        return this
            .attr('unselectable', 'on')
            .css('user-select', 'none')
            .on('selectstart dragstart', false);
    };
})(jQuery);
function updateCounts() {
    $('.guests-value .adult').html(client_data.peoples.adult);
    $('.guests-value .children').html(client_data.peoples.children);
}
(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);
function recountPeoples() {
    client_data.roomCount = 0;
    client_data.rooms = {};
    client_data.peoples.adult = 0;
    client_data.peoples.children = 0;
    $('.popup-select-guest .input-value.adult').each(function () {
        client_data.peoples.adult += parseInt($(this).val());
    });
    $('.popup-select-guest .input-value.children').each(function () {
        client_data.peoples.children += parseInt($(this).val());
    });
    $('.popup-select-guest .apartment-block').each(function () {
        let room_id = $(this).attr('data-id');
        let adult_count = $(this).find('.input-value.adult').val();
        client_data.rooms[room_id] = new Object({
            adult: adult_count,
            children: new Array()
        });
        $(this).find('.child-age-row span.age-value').each(function (i) {
            client_data.rooms[room_id].children[i] = $(this).text();
        });
    });
    if ($('.popup-select-guest #apartment-blocks').hasScrollBar()) {
        $($('.popup-select-guest').find('.fade-top')[0]).css({
            display: 'block'
        });
    } else {
        $($('.popup-select-guest').find('.fade-top')[0]).css({
            display: 'none'
        });
    }
    updateCounts();
}
$.fn.inputPlusMinus = function () {
    let input_obj = null
    this.on('click', '.apartment-delete', function () {
        let parent = $(this).parents('.apartment-block');
        parent.remove();
        recountPeoples()
    });
    this.on('click', '.input-minus', function () {
        let parent = $(this).parents('.apartment-block').eq(0);
        $(this).disableSelection();
        input_obj = $(this).parent().find('.input-value').eq(0);
        let input_value = parseInt(input_obj.val());
        input_obj.val(--input_value);
        if ($(this).parent().find('input.children').length > 0) {
            parent.find('.child-age-row').last().remove();
        }
        input_obj.change();
        recountPeoples()
    });
    this.on('click', '.input-plus', function () {
        $(this).disableSelection();
        input_obj = $(this).parent().find('.input-value').eq(0);
        let parent = $(this).parents('.apartment-block').eq(0);
        let input_value = parseInt(input_obj.val());
        input_obj.val(++input_value);
        if ($(this).parent().find('input.children').length > 0) {
            $.get('templates/child-age-row.html', function (data) {
                let child_age_row = $(data);
                child_age_row.attr('data-child-id', client_data.childId);
                child_age_row.find('.child-count').html(parent.find('.child-age-row').length + 1);
                parent.append(child_age_row);
                input_obj.change();
            });
        }
        client_data.childId++;
        recountPeoples();
    });
    this.find('input.children').on("keyup paste change", function () {
        let child_count = $(this).val();
        if (child_count > 255) {
            $(this).val(255);
        }
        if (child_count < 1) {
            $(this).val(0);
        }
        let children_rows_count = $(this).parents('.apartment-block').eq(0).find('.child-age-row').length;
        if (children_rows_count > child_count) {
            let _i = 0;
            $(this).parents('.apartment-block').eq(0).find('.child-age-row').each(function () {
                _i++;
                if (_i > child_count) {
                    $(this).remove();
                }
            });
        }
        if (children_rows_count < child_count) {
            let row_diff = child_count - children_rows_count;
            let parent = $(this).parents('.apartment-block').eq(0);
            for (let i = 1; i <= row_diff; i++) {
                $.get('templates/child-age-row.html', function (data) {
                    let child_age_row = $(data);
                    child_age_row.attr('data-child-id', client_data.childId);
                    child_age_row.find('.child-count').html(parent.find('.child-age-row').length + 1);
                    parent.append(child_age_row);
                    client_data.childId++;
                });
            }
        }
        recountPeoples();
    });
    this.find('input.adult').on("keyup paste change", function () {
        let child_count = $(this).val();
        if (child_count > 255) {
            $(this).val(255);
        }
        if (child_count < 1) {
            $(this).val(1);
        }
        recountPeoples();
    });
};
function showAvailableRooms() {
    $.get('templates/available-rooms.html', function (data) {
        let _obj = $(data);
        _obj.css({
            opacity: 0,
        });
        _obj.find('.alternative-date .btn-large').each(function () {
            $(this).on('click', function () {
                showAvailableRooms();
            });
        });
        _obj.find('.arrow-down').on('classChange', function () {
            if ($(this).hasClass('opened')) {
                $(this).animate({
                    deg: -180
                }, {
                    duration: 500,
                    step: function (now) {
                        $(this).css({transform: 'rotate(' + now + 'deg)'});
                    },
                    complete: function () {
                        //$(this).removeClass('opened');
                    }
                });
            } else {
                $(this).animate({
                    deg: 0
                }, {
                    duration: 500,
                    step: function (now) {
                        $(this).css({transform: 'rotate(' + now + 'deg)'});
                    },
                    complete: function () {
                        //$(this).addClass('opened');
                    }
                });
            }
        }).on('click', function () {
            $(this).toggleClass('opened').promise().done(function () {
                $(this).trigger('classChange');
            });
        });
        let available_rooms = $('body .available-rooms');
        if (available_rooms.length > 0) {
            available_rooms.animate({
                opacity: 0
            }, animationDuration, function () {
                available_rooms.remove();
                _obj.find('.replies-list').slick({
                    infinite: true,
                    slidesToShow: 1,
                    swipeToSlide: true,
                    arrows: true,
                    dots: false,
                    variableWidth: true,
                    useTransform: false
                });
                _obj.find('.room-photos').slick({
                    infinite: true,
                    slidesToShow: 1,
                    swipeToSlide: true,
                    arrows: true,
                    dots: false,
                    variableWidth: false,
                    useTransform: false
                });
                let cur_slide = 0;
                let all_slides = 0
                _obj.find('.slick-prev,.slick-next').on('click', function () {
                    cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    $(this).parent().parent().eq(0).find('.slick-counter > .value').html(cur_slide + '/' + all_slides);
                });
                _obj.find('.room-photos .slick-track').attr_change({
                    callback: function () {
                        cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                        all_slides = $(this).parents('.available-rooms-result').eq(0).find('.room-photos .slick-slide').not('.slick-cloned').length;
                        $(this).parents('.available-rooms-result').eq(0).find('.slick-counter > .value').html(cur_slide + '/' + all_slides);
                    }
                });
                $('.content-page').append(_obj);
                $('.reserve-room-window').roomSelectionWindow();
                $('.available-rooms').animate({
                    opacity: 1
                }, animationDuration);
                $('.frame-155-overflow').slick({
                    infinite: true,
                    slidesToShow: 4,
                    swipeToSlide: true,
                    arrows: false,
                    dots: false,
                    variableWidth: true,
                    useTransform: false
                });
            });
        } else {
            _obj.find('.replies-list').slick({
                infinite: true,
                slidesToShow: 1,
                swipeToSlide: true,
                arrows: true,
                dots: false,
                variableWidth: true,
                useTransform: false
            });
            _obj.find('.room-photos').slick({
                infinite: true,
                slidesToShow: 1,
                swipeToSlide: true,
                arrows: true,
                dots: false,
                variableWidth: false,
                useTransform: false
            });
            let cur_slide = 0;
            let all_slides = 0;
            _obj.find('.slick-prev,.slick-next').on('click', function () {
                cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                all_slides = $(this).parents('.available-rooms-result').eq(0).find('.room-photos .slick-slide').not('.slick-cloned').length;
                $(this).parent().parent().find('.slick-counter > .value').html(cur_slide + '/' + all_slides);
            });
            _obj.find('.room-photos .slick-track').attr_change({
                callback: function () {
                    cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    all_slides = $(this).parents('.available-rooms-result').eq(0).find('.slick-slide').not('.slick-cloned').length
                }
            });
            $('.content-page').append(_obj);
            $('.available-rooms').animate({
                opacity: 1
            }, animationDuration);
            $('.frame-155-overflow').slick({
                infinite: true,
                slidesToShow: 4,
                swipeToSlide: true,
                arrows: false,
                dots: false,
                variableWidth: true,
                useTransform: false
            });
        }
    }).fail(function (err) {
        console.log(err)
    });
}
function searchAvailableRooms() {
    $.get('json/available.rooms.json', function (data) {
        let _json = $.parseJSON(JSON.stringify(data));
        if (Object.keys(_json).length > 0) {
        }
    });
    $.get('templates/available-rooms-none.html', function (data) {
        let _obj = $(data);
        _obj.css({
            opacity: 0,
        });
        _obj.find('.btn-large').each(function () {
            $(this).on('click', function () {
                showAvailableRooms();
            });
        });
        let _available_rooms = $('body').find('.available-rooms');
        if (_available_rooms.length > 0) {
            _available_rooms.remove();
        }
        $('.content-page').append(_obj);
        $('.available-rooms').animate({
            opacity: 1
        }, animationDuration);
    }).fail(function (err) {
        console.log(err)
    });
}
let cumulativeOffset = function (element) {
    let top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    return {
        top: top,
        left: left
    };
};
$(document).ready(function () {
    //loadNextPage = 'services-block';
    //loadNextPage = 'pay-parameters';
    //loadNextPage = 'paying';
    //loadNextPage = 'pay-result-ok';
    $('body').on('mouseover', '.available-rooms-result .slick-slider', function () {
        $(this).parents('.available-rooms-result').eq(0).find('.slick-counter').addClass('slick-counter-show');
    });
    $('body').on('mouseout', '.available-rooms-result .slick-slider', function () {
        $(this).parents('.available-rooms-result').eq(0).find('.slick-counter').removeClass('slick-counter-show');
    });
    $('body').on('click', '.pay-result-ok .back-to-main-page', function () {
        hideSearchBox = false;
        loadNextPage = 'main-page';
    });
    $('body').on('click', '.paying .pay-confirm', function () {
        hideSearchBox = true;
        loadNextPage = 'pay-result-ok';
    });
    $('body').on('click', '.services-block .button-subbmit', function () {
        hideSearchBox = true;
        loadNextPage = 'pay-parameters';
    });
    $('body').on('click', '.service-checkbox', function () {
        if (typeof $(this).attr('checked') === typeof undefined) {
            $(this).attr('src', 'static/checkbox-checked.svg').attr('checked', 'checked');
            $(this).parent().find('.price').addClass('price-blue');
            let minHeight = parseInt($(this).parents('.service-row').eq(0).find('.service-settings').attr('data-css-min-height'));
            /* future !!!!!!!!!!!!!!! DONT DELETE!!!!!!! */
            /*
            $(this).parents('.service-row').eq(0).find('.service-settings').css({
                display:'block'
            }).stop().animate({
                'min-height':minHeight,
            },500);

             */
        } else {
            $(this).attr('src', 'static/checkbox.svg').removeAttr('checked');
            $(this).parent().find('.price').removeClass('price-blue');
            $(this).parents('.service-row').eq(0).find('.service-settings').animate({
                'min-height': 0,
                'height': 0
            }, 500, function () {
                $(this).css({
                    display: 'none'
                });
            });
        }
    });
    $('body').on('click', '.contacts-block .checkbox', function () {
        if (typeof $(this).attr('checked') === typeof undefined) {
            $(this).attr('src', 'static/checkbox-checked.svg').attr('checked', 'checked');
        } else {
            $(this).attr('src', 'static/checkbox.svg').removeAttr('checked');
        }
    });
    $('body').on('click', '.room-info .checkbox', function () {
        if (typeof $(this).attr('checked') === typeof undefined) {
            $(this).attr('src', 'static/checkbox-checked.svg').attr('checked', 'checked');
        } else {
            $(this).attr('src', 'static/checkbox.svg').removeAttr('checked');
        }
    });
    setInterval(function () {
        if (hideSearchBox) {
            $('.search-form').css({
                display: 'none'
            });
        } else {
            $('.search-form').css({
                display: 'block'
            });
        }
        if (loadNextPage.length > 0) {
            if (loadNextPage === 'services-block') {
                hideSearchBox = true;
            }
            $('.content-page').html('');
            $.get('templates/' + loadNextPage + '.html', function (data) {
                $('.content-page').append($(data));
            });
            loadNextPage = '';
        }
    }, 100);
    $('body').on('click', '.pay-parameters .next-step-button', function () {
        hideSearchBox = true;
        loadNextPage = 'paying';
    });
    $('body').on('click', '.back-paying', function () {
        hideSearchBox = true;
        loadNextPage = 'pay-parameters';
    });
    $('body').on('click', '.back-box-services', function () {
        hideSearchBox = false;
        $('.content-page').html('');
        showAvailableRooms();
    });
    $('body').on('click', '.next-box-services', function () {
        hideSearchBox = true;
        loadNextPage = 'pay-parameters';
    });
    $('body').on('click', '.back-box-pay-parameters', function () {
        hideSearchBox = true;
        loadNextPage = 'services-block';
    });
    let calendarWindow = $('.in-out').vcCalendar();
    $('body').roomSelectionWindow();
    $('body').on('click', '.select-tariff-group .btn-large', function () {
        $(this).parent().roomAppendingWindow();
    });
    function selectGuestPopup() {
        if (selectGuestObj === null) {
            $.get('templates/popup-select-guest.html', function (data) {
                selectGuestObj = $(data);
                selectGuestObj.css({
                    opacity: 0,
                });
                selectGuestObj.on('click', function (event) {
                    event.stopPropagation();
                });
                selectGuestObj.find('.apartment-block').inputPlusMinus();
                selectGuestObj.find('.apartment-blocks').on('scroll', function () {
                    let top_scroll_position = $('.popup-select-guest #apartment-blocks').scrollTop();
                    if (top_scroll_position > 0) {
                        $($('.popup-select-guest').find('.fade-top')[0]).css({
                            display: 'block'
                        });
                    } else {
                        $($('.popup-select-guest').find('.fade-top')[0]).css({
                            display: 'none'
                        });
                    }
                });
                selectGuestObj.find('.button-1').on('click', function () {
                    let guest_row = null;
                    $.get('templates/apartment-block.html', function (data) {
                        guest_row = $(data);
                    }).done(function () {
                        let round_id = 'room_' + (new Date()).getTime();
                        guest_row.attr('data-id', round_id);
                        guest_row.inputPlusMinus();
                        client_data.rooms[round_id] = new Object({});
                        selectGuestObj.find('#apartment-blocks').append(guest_row);
                        recountPeoples();
                        selectGuestObj.find('#apartment-blocks').stop().animate({
                            scrollTop: selectGuestObj.find('#apartment-blocks .apartment-block').last()[0].offsetTop
                        }, 100);
                    });
                });
                selectGuestObj.find('.button-2').on('click', function () {
                    recountPeoples();
                    client_data.needRefresh = true;
                    selectGuestObj.css({
                        opacity: 0,
                    });
                });
                $('div.guests').append(selectGuestObj);
                selectGuestObj.css({
                    display: 'block'
                }).stop().animate({
                    opacity: 1
                }, animationDuration);
            }).fail(function (err) {
                console.log(err)
            });
        } else {
            selectGuestObj.css({
                display: 'block'
            }).animate({
                opacity: 1
            }, animationDuration);
        }
    }
    $('body').on('click', '.left-replies-block-slider .slick-prev,.left-replies-block-slider .slick-next', function () {
        let active_vote = {
            value: $('.left-replies-block-slider .slick-slide.slick-active [data-vote-value]').eq(0).attr('data-vote-value'),
            level: $('.left-replies-block-slider .slick-slide.slick-active [data-vote-text-level]').eq(0).attr('data-vote-text-level'),
            name: $('.left-replies-block-slider .slick-slide.slick-active [data-vote-name]').eq(0).attr('data-vote-name'),
            avatar: $('.left-replies-block-slider .slick-slide.slick-active [data-avatar]').eq(0).attr('data-avatar'),
            room: $('.left-replies-block-slider .slick-slide.slick-active [data-room-type]').eq(0).attr('data-room-type'),
        }
        $('.left-replies-block-slider .vote-value .middle').html(active_vote.value);
        $('.left-replies-block-slider .vote-level').html(active_vote.level);
        $('.left-replies-block-slider .person .name').html(active_vote.name);
        $('.left-replies-block-slider .person .avatar').attr('src', active_vote.avatar);
        $('.left-replies-block-slider .person .room-type').html(active_vote.room);
    });
    $(window).on('scroll', function () {
        let left_replies_block_slider = $('.left-replies-block-slider');
        if (left_replies_block_slider.length > 0) {
            let _diff = cumulativeOffset(left_replies_block_slider[0]).top;
            let _block_height = left_replies_block_slider.height();
            if (cumulativeOffset(left_replies_block_slider[0]).top < window.scrollY) {
                /*
                left_replies_block_slider.css({
                    display:'block',
                    position:'fixed',
                    top: '0px',
                    left:'0px'
                });

                 */
            } else {
                /*
                left_replies_block_slider.css({
                    display:'none',
                    position:'absolute',
                    top: '150px'
                });

                 */
            }
        }
    });
    $('body').on('click', '.room-info-btn', function () {
        $('body').find('.popup-room-info').remove();
        $.get('templates/popup-room-info.html', function (data) {
            let popup_room_info = $(data);
            popup_room_info.find('.close-btn').on('click', function () {
                popup_room_info.remove();
            });
            popup_room_info.css({});
            $('body').append(popup_room_info);
        });
    });
    $('body').on('mouseover', '[data-tooltip]', function () {
        let value = $(this).attr('data-tooltip');
        let _tooltip = $('<div class="tooltip"></div>');
        let _frame116 = $('<div class="frame-116"></div>');
        let _tooltip_value = $('<span class="tooltip-value">' + value + '</span>');
        let _tooltip_rectangle = $('<span class="tooltip-rectangle"></span>');
        _frame116.append(_tooltip_value);
        _tooltip.append(_frame116);
        _tooltip.append(_tooltip_rectangle);
        $(this).append(_tooltip);
    });
    $('body').on('mouseout', '[data-tooltip]', function () {
        $(this).find('.tooltip').remove();
    });
    $('.photos').slick({
        infinite: true,
        slidesToShow: 6,

        swipeToSlide: true,
    });
    $('html').on('click', function () {
        $('.popup-select-guest').animate({
            opacity: 0,
        }, animationDuration, function () {
            $(this).css({
                display: 'none'
            });
        });
    });
    $('.guests-icon').on('click', function (event) {
        selectGuestPopup();
        calendarWindow.hideWindow();
        event.stopPropagation();
        return false;
    });
    $('.btn-search').on('click', function (event) {
        searchAvailableRooms();
    });
});
