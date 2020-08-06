import Settings from "./setting";
import {client_data} from "./client-data";
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
            }, Settings.animationDuration, function () {
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
                }, Settings.animationDuration, function () {
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
                            $('.in-date-value').val(text_date).html(text_date);
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
                            $('.out-date-value').val(text_date).html(text_date);

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

                            calendarObj.hideWindow();
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