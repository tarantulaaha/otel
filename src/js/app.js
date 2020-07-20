require('typeface-inter');
import $ from 'jquery';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/fonts/slick.woff';
import 'slick-carousel/slick/fonts/slick.ttf';
let client_data = new Object({
    rooms: [],
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
});
(function ($) {
    $.fn.vcCalendar = function () {
        this.hidden = true;
        let calendarObj = this;
        this.currentYear = new Date().getFullYear();
        this.activeYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
        this.activeMonth = new Date().getMonth() + 1;
        this.scrollToActive = function () {
            let offsetHeight = 0;
            let offsetTop = 0;
            if (calendarObj.find('.dates .month.active').length > 0) {
                offsetTop = calendarObj.find('.dates .month.active')[0].offsetTop;
            }
            calendarObj.find('.dates').eq(0).stop().animate({
                scrollTop: offsetTop
            }, 100);
            return this;
        }
        this.refresh = function () {
            calendarObj.find('.month-row[data-id="' + calendarObj.activeMonth + '"]').addClass('active');
            calendarObj.find('.year-value').eq(0).html(calendarObj.activeYear);
            calendarObj.find('.month.active').removeClass('active');
            calendarObj.find('.month').filter($('[data-year="' + calendarObj.activeYear + '"][data-month="' + calendarObj.activeMonth + '"]')).addClass('active');
            calendarObj.scrollToActive();
        }
        this.show = function () {
            if (calendarObj.hidden) {
                calendarObj.refresh();
                calendarObj.find('.calendar-window').css({
                    display: 'block'
                }).animate({
                    opacity: 1
                }, animationDuration);
                calendarObj.hidden = false;
            }
            return this;
        };
        this.hide = function () {
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
        this.vc_addEventListeners = function () {
            calendarObj.find('.calendar-icon').on('click', function (event) {
                calendarObj.show();
                $('.popup-select-guest').animate({
                    opacity: 0,
                }, animationDuration, function () {
                    $(this).css({
                        display: 'none'
                    });
                });
                event.stopPropagation();
                return false;
            });
            calendarObj.find('.dates').on('scroll', function () {
                console.log('scrolling');
                let _obj = $(this);
                let active_month_obj = _obj.find('.month.active');
                let amo_offsetTop = active_month_obj[0].offsetTop * 2;
                let amo_offsetHeight = active_month_obj[0].offsetHeight;
                let amo_delta1 = (amo_offsetTop * 0.5) + amo_offsetHeight - 100;
                console.log(amo_delta1, amo_delta1 / 2, _obj[0].scrollTop);
                //calendarObj.find('.dates .days .day').remove();
                let activeObj = active_month_obj;
                if (_obj[0].scrollTop > amo_delta1) {
                    if (activeObj.next().next().length === 0) {
                        calendarObj.addNextMonth();
                    }
                    if (active_month_obj.next().length > 0) {
                        // activeObj = active_month_obj.removeClass('active').next().addClass('active');
                    }
                }
                if (_obj[0].scrollTop < amo_delta1 / 2) {
                    if (activeObj.prev().prev().length === 0) {
                        calendarObj.addPreviousMonth();
                    }
                    if (active_month_obj.prev().length > 0) {
                        //activeObj = active_month_obj.removeClass('active').prev().addClass('active');
                    }
                }
                //calendarObj.find('.month-row.active').removeClass('active');
                //calendarObj.find('.month-row[data-id="' + activeObj.attr('data-month') + '"]').addClass('active');
                //calendarObj.find('.year-value').html(activeObj.attr('data-year'));
            });
            calendarObj.find('.year-left-btn').on('click', function () {
                calendarObj.find('.month').remove();
                vc_calendar.setYear(parseInt(calendarObj.find('.year-value').eq(0).text()) - 1);
                vc_calendar.setMonth(parseInt(calendarObj.find('.month-row.active').attr('data-id')));
                //redraw();
            });
            calendarObj.find('.year-right-btn').on('click', function () {
                calendarObj.find('.month').remove();
                vc_calendar.setYear(parseInt(calendarObj.find('.year-value').eq(0).text()) + 1);
                vc_calendar.setMonth(parseInt(calendarObj.find('.month-row.active').attr('data-id')));
                //redraw();
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
                calendarObj.find('.month-row.active').removeClass('active');
                calendarObj.activeMonth = parseInt($(this).attr('data-id'));
                calendarObj.addActiveMonth();
                calendarObj.addPreviousMonth();
                calendarObj.addNextMonth();
                calendarObj.refresh();
            });
            calendarObj.find('.in-date-value').on("keyup paste change", function () {
                let date_arr = $(this).val().split(".");
                let start_date = new Date(date_arr[2], date_arr[1] - 1, date_arr[0]).getTime();
                if (start_date > 0) {
                    vc_calendar.activeYear = date_arr[2];
                    vc_calendar.activeMonth = date_arr[1];
                    vc_calendar.setYear(date_arr[2]).setMonth(date_arr[1]);
                    client_data.selectedDate.in.timestamp = start_date;
                    client_data.selectedDate.in.selected = true;
                }
            });
            calendarObj.find('.out-date-value').on("keyup paste change", function () {
                let date_arr = $(this).val().split(".");
                let end_date = new Date(date_arr[2], date_arr[1] - 1, date_arr[0]).getTime();
                if (end_date > 0) {
                    client_data.selectedDate.out.timestamp = end_date;
                    client_data.selectedDate.out.selected = true;
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
        this.getNext = function () {
            let year = this.activeYear;
            let month = this.activeMonth + 1;
            if (month > 12) {
                month = 1;
                year++;
            }
            return new Object({
                year: year,
                month: month
            });
        }
        this.getPrevious = function () {
            let year = this.activeYear;
            let month = this.activeMonth - 1;
            if (month < 1) {
                month = 12;
                year--;
            }
            return new Object({
                year: year,
                month: month
            });
        }
        this.addPreviousMonth = function () {
            let obj = this.getPrevious();
            this.addMonth(obj.year, obj.month);
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
        this.addNextMonth = function () {
            let obj = this.getNext();
            this.addMonth(obj.year, obj.month);
            return this;
        }
        this.addDataRangeSelection = function () {
            this.find('[data-date="' + client_data.selectedDate.in.timestamp + '"]').addClass('selected-first-date');
            this.find('[data-date="' + client_data.selectedDate.out.timestamp + '"]').addClass('selected-second-date');
        }
        this.addMonth = function (year, month) {
            console.log(year, month);
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
            if (vc_calendar.getDayInWeek() > 1) {
                for (let i = 1; i < vc_calendar.getDayInWeek(); i++) {
                    daysBlock.append($('<div class="day"></div>'));
                }
            }
            for (let i = 1; i <= vc_calendar.getDaysInMonth(); i++) {
                daysBlock.append($('<div class="day" data-date="' + new Date(year, month - 1, i).getTime() + '"><span class="middle">' + i + '</span></div>'));
            }
            monthBlock.append(daysBlock);
            let elementExists = calendarObj.find('.month').filter($('[data-year="' + year + '"][data-month="' + month + '"]'));
            if (elementExists.length === 0) {
                let biggerYear = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-year")) > year;
                });
                let likeYear = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-year")) === year;
                });
                let lessYear = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-year")) < year;
                });
                let biggerMonth = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-month")) > month;
                });
                let likeMonth = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-month")) === month;
                });
                let lessMonth = calendarObj.find('.month').filter(function () {
                    return parseInt($(this).attr("data-month")) < month;
                });
                monthBlock.insertAfter(lessYear.filter($(lessMonth)).last());
                monthBlock.insertAfter(lessYear.filter($(likeMonth)).last());
                monthBlock.insertAfter(lessYear.filter($(biggerMonth)).last());
                monthBlock.insertAfter(likeYear.filter($(lessMonth)).last());
                monthBlock.insertBefore(likeYear.filter($(biggerMonth)).first());
                monthBlock.insertBefore(biggerYear.filter($(lessMonth)).first());
                monthBlock.insertBefore(biggerYear.filter($(likeMonth)).first());
                monthBlock.insertBefore(biggerYear.filter($(biggerMonth)).first());
                if (biggerYear.length === 0 && likeYear.length === 0 && lessYear.length === 0) {
                    calendarObj.find('.dates').append(monthBlock);
                }
            } else {
            }
        }
        $.get('templates/calendar.html', function (data) {
                calendarObj.append($(data));
                calendarObj.find('.calendar-window').css({
                    opacity: 0
                });
                calendarObj.vc_addEventListeners();
                calendarObj.addPreviousMonth();
                calendarObj.addCurrentMonth();
                calendarObj.addNextMonth();
            }
        ).fail(function (err) {
            console.log(err)
        });
    }
})(jQuery);
let vc_calendar = {
    'calendarObj': null,
    'currentYear': new Date().getFullYear(),
    'currentMonth': new Date().getMonth() + 1,
    'activeYear': new Date().getFullYear(),
    'activeMonth': new Date().getMonth() + 1,
    'setYear': function (i) {
        this.year.current = i;
        this.activeYear = i;
        return this;
    },
    'setMonth': function (i) {
        this.month.current = i;
        this.activeMonth = i;
        return this;
    },
    'year': {
        previous: 0,
        current: 0,
        next: 0
    },
    'month': {
        previous: 0,
        current: 0,
        next: 0
    },
    'init': function () {
        this.reset();
        return this;
    },
    'reset': function () {
        let date = new Date();
        this.year.current = date.getFullYear();
        this.month.current = date.getMonth() + 1;
        return this;
    },
    'next': function () {
        this.month.current++;
        if (this.month.current > 12) {
            this.month.current = 1;
            this.year.current++;
        }
        return this;
    },
    'previous': function () {
        this.month.current--;
        if (this.month.current === 0) {
            this.month.current = 12;
            this.year.current--;
        }
        return this;
    },
    'getDaysInMonth': function () {
        return new Date(this.year.current, this.month.current, 0).getDate();
    },
    'getDayInWeek': function () {
        let weekday = new Date(this.year.current, this.month.current - 1, 1).getDay();
        if (weekday === 0) {
            weekday = 7;
        }
        return weekday;
    }
}
let selectGuestObj = null;
const animationDuration = 100;
function loadCalendar() {
    /*
    function drawMonth(type = 'next') {

    }
    let redraw = function () {
        calendarObj.find('.year-value').eq(0).html(vc_calendar.year.current);
        vc_calendar.previous();
        drawMonth();
        vc_calendar.next();
        drawMonth();
        vc_calendar.next();
        drawMonth();
        vc_calendar.next();
        drawMonth();
        calendarObj.find('.dates').scrollTop(calendarObj.find('.dates .month')[0].offsetHeight);
    }
    if (calendarObj === null) {
    } else {
        calendarObj.find('.month-row.active').removeClass('.active');
        calendarObj.find('.month-row[data-id="' + vc_calendar.currentMonth + '"]').addClass('active');
        redraw();
        calendarObj.find('.dates').scrollTop(calendarObj.find('.dates .month')[0].offsetHeight);
        calendarObj.css({
            display: 'block'
        }).stop().animate({
            opacity: 1
        }, animationDuration);
    }

     */
}
let input = document.querySelectorAll('.in-date-value,.out-date-value');
let dateInputMask = function dateInputMask(elm) {
    elm.addEventListener('keypress', function (e) {
        if (e.keyCode < 47 || e.keyCode > 57) {
            e.preventDefault();
        }
        let len = elm.value.length;
        // If we're at a particular place, let the user type the slash
        // i.e., 12/12/1212
        if (len !== 1 || len !== 3) {
            if (e.keyCode == 47) {
                e.preventDefault();
            }
        }
        // If they don't add the slash, do it for them...
        if (len === 2) {
            elm.value += '.';
        }
        // If they don't add the slash, do it for them...
        if (len === 5) {
            elm.value += '.';
        }
    });
}
dateInputMask(input[0]);
dateInputMask(input[1]);
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
    client_data.rooms = [];
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
        client_data.rooms[room_id] = {
            adult: adult_count,
            children: []
        };
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
    console.log(client_data);
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
                    client_data.rooms[round_id] = {}
                    selectGuestObj.find('#apartment-blocks').append(guest_row);
                    recountPeoples();
                    selectGuestObj.find('#apartment-blocks').stop().animate({
                        scrollTop: selectGuestObj.find('#apartment-blocks .apartment-block').last()[0].offsetTop
                    }, 100);
                });
            });
            selectGuestObj.find('.button-2').on('click', function () {
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
                    $(this).parent().parent().eq(0).find('.counter > .value').html(cur_slide + '/' + all_slides);
                });
                _obj.find('.room-photos .slick-track').attr_change({
                    callback: function () {
                        cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                        all_slides = $(this).parents('.available-rooms-result').eq(0).find('.room-photos .slick-slide').not('.slick-cloned').length;
                        $(this).parents('.available-rooms-result').eq(0).find('.counter > .value').html(cur_slide + '/' + all_slides);
                    }
                });
                $('body').append(_obj);
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
                $(this).parent().parent().find('.counter > .value').html(cur_slide + '/' + all_slides);
            });
            _obj.find('.room-photos .slick-track').attr_change({
                callback: function () {
                    cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    all_slides = $(this).parents('.available-rooms-result').eq(0).find('.slick-slide').not('.slick-cloned').length
                }
            });
            $('body').append(_obj);
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
        $('body').append(_obj);
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
    $('.in-out').vcCalendar();
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
            console.log(left_replies_block_slider.eq(0), cumulativeOffset(left_replies_block_slider[0]).top, window.scrollY);
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
            popup_room_info.css({
                top: window.scrollY - 526
            });
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
        slidesToScroll: 1
    });
    $('html').on('click', function () {
        $('.calendar-window, .popup-select-guest').animate({
            opacity: 0,
        }, animationDuration, function () {
            $(this).css({
                display: 'none'
            });
        });
    });
    $('.guests-icon').on('click', function (event) {
        selectGuestPopup();
        $('.calendar-window').animate({
            opacity: 0,
        }, animationDuration, function () {
            $(this).css({
                display: 'none'
            });
        });
        event.stopPropagation();
        return false;
    });
    $('.btn-search').on('click', function (event) {
        searchAvailableRooms();
    });
});
