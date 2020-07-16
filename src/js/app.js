require('typeface-inter');
import $ from 'jquery';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/fonts/slick.woff';
import 'slick-carousel/slick/fonts/slick.ttf';
let date = new Date();
let month_start = new Date();
let weekday = month_start.getDay();
let calendarObj = null;
let currMonthNum = date.getMonth();
let currentYear = date.getFullYear();
let selectGuestObj = null;
let availableRoomsObj = null;
const animationDuration = 100;
(function ($) {
    function isDOMAttrModifiedSupported() {
        var p = document.createElement('p');
        var flag = false;
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
            var attributes = this.data('attr-old-value');
            if (e.attributeName.indexOf('style') >= 0) {
                if (!attributes['style']) attributes['style'] = {}; //initialize
                var keys = e.attributeName.split('.');
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
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    $.fn.attrchange = function (o) {
        var cfg = {
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
                var attributes = {};
                for (var attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
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
            var mOptions = {
                subtree: false,
                attributes: true,
                attributeOldValue: cfg.trackValues
            };
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    var _this = e.target;
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
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}
function loadCalendar() {
    if (calendarObj === null) {
        $.get('static/calendar.html', function (data) {
            calendarObj = $(data);
            calendarObj.css({
                opacity: 0
            });
            calendarObj.find('.month-row').eq(currMonthNum).addClass('active');
            let setMonth = function () {
                let selectedMonth = calendarObj.find('.month-row.active').eq(0).find('.name').eq(0).text();
                calendarObj.find('.top-month').eq(0).html(selectedMonth);
            }
            setMonth();
            calendarObj.on('click', function (event) {
                event.stopPropagation();
            });
            calendarObj.find('.month-row').on('click', function (event) {
                calendarObj.find('.month-row.active').removeClass('active');
                $(this).addClass('active');
                setMonth();
            });
            $('div.in-out').append(calendarObj);
            $('.calendar-window').animate({
                opacity: 1
            }, animationDuration);
        }).fail(function (err) {
            console.log(err)
        });
    } else {
        $('.calendar-window').css({
            display: 'block'
        }).animate({
            opacity: 1
        }, animationDuration);
    }
}
function selectGuestPopup() {
    if (selectGuestObj === null) {
        $.get('static/popup-select-guest.html', function (data) {
            selectGuestObj = $(data);
            selectGuestObj.css({
                opacity: 0,
            });
            selectGuestObj.on('click', function (event) {
                event.stopPropagation();
            });
            $('div.guests').append(selectGuestObj);
            $('.popup-select-guest').animate({
                opacity: 1
            }, animationDuration);
        }).fail(function (err) {
            console.log(err)
        });
    } else {
        $('.popup-select-guest').css({
            display: 'block'
        }).animate({
            opacity: 1,
        }, animationDuration);
    }
}
function showAvailableRooms() {
    $.get('static/available-rooms.html', function (data) {
        let _obj = $(data);
        _obj.css({
            opacity: 0,
        });
        _obj.find('.alternative-date .btn-large').each(function () {
            $(this).on('click', function () {
                showAvailableRooms();
            });
        });
        if ($('div.main-layer').find('.available-rooms').length > 0) {
            $('div.main-layer').find('.available-rooms').animate({
                opacity: 0
            }, animationDuration, function () {
                $('div.main-layer').find('.available-rooms').remove();
                _obj.find('.room-photos').slick({
                    infinite: true,
                    slidesToShow: 1,
                    swipeToSlide: true,
                    arrows: true,
                    dots: false,
                    variableWidth: false
                });
                let cur_slide = 0;
                let all_slides = 0
                    _obj.find('.slick-prev,.slick-next').on('click', function () {
                    cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    $(this).parent().parent().find('.counter > .value').html(cur_slide + '/' + all_slides);
                });
                _obj.find('.room-photos .slick-track').attrchange({
                    callback: function (event) {
                        cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                        all_slides =$(this).parents('.available-rooms-result').eq(0).find('.room-photos .slick-slide').not('.slick-cloned').length;
                        $(this).parents('.available-rooms-result').find('.counter > .value').html(cur_slide + '/' + all_slides);
                    }
                });
                $('div.main-layer').append(_obj);
                $('.available-rooms').animate({
                    opacity: 1
                }, animationDuration);
                $('.frame-155-overflow').slick({
                    infinite: true,
                    slidesToShow: 4,
                    swipeToSlide: true,
                    arrows: false,
                    dots: false,
                    variableWidth: true
                });
            });
        } else {
            _obj.find('.room-photos').slick({
                infinite: true,
                slidesToShow: 1,
                swipeToSlide: true,
                arrows: true,
                dots: false,
                variableWidth: false
            });
            let cur_slide = 0;
            let all_slides = 0;
            _obj.find('.slick-prev,.slick-next').on('click', function () {
                cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                all_slides =$(this).parents('.available-rooms-result').eq(0).find('.room-photos .slick-slide').not('.slick-cloned').length;
                $(this).parent().parent().find('.counter > .value').html(cur_slide + '/' + all_slides);
            });
            _obj.find('.room-photos .slick-track').attrchange({
                callback: function (event) {
                    cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    all_slides =$(this).parents('.available-rooms-result').find('.slick-slide').not('.slick-cloned').length
                }
            });
            $('div.main-layer').append(_obj);
            $('.available-rooms').animate({
                opacity: 1
            }, animationDuration);
            $('.frame-155-overflow').slick({
                infinite: true,
                slidesToShow: 4,
                swipeToSlide: true,
                arrows: false,
                dots: false,
                variableWidth: true
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
    $.get('static/available-rooms-none.html', function (data) {
        let _obj = $(data);
        _obj.css({
            opacity: 0,
        });
        _obj.find('.btn-large').each(function () {
            $(this).on('click', function () {
                showAvailableRooms();
            });
        });
        if ($('div.main-layer').find('.available-rooms').length > 0) {
            $('div.main-layer').find('.available-rooms').remove();
        }
        $('div.main-layer').append(_obj);
        $('.available-rooms').animate({
            opacity: 1
        }, animationDuration);
    }).fail(function (err) {
        console.log(err)
    });
}
$(document).ready(function () {
    $('.photos').slick({
        infinite: true,
        slidesToShow: 6,
        slidesToScroll: 1
    });
    $('html,body').on('click', function () {
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
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    $('.calendar-icon').on('click', function (event) {
        loadCalendar();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    $('.btn-search').on('click', function (event) {
        searchAvailableRooms();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
});
