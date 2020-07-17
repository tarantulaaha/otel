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
        let available_rooms=$('body .available-rooms');
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
                    $(this).parent().parent().find('.counter > .value').html(cur_slide + '/' + all_slides);
                });
                _obj.find('.room-photos .slick-track').attr_change({
                    callback: function (event) {
                        cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                        all_slides = $(this).parents('.available-rooms-result').eq(0).find('.room-photos .slick-slide').not('.slick-cloned').length;
                        $(this).parents('.available-rooms-result').find('.counter > .value').html(cur_slide + '/' + all_slides);
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
                callback: function (event) {
                    cur_slide = parseInt($(this).parent().find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    all_slides = $(this).parents('.available-rooms-result').find('.slick-slide').not('.slick-cloned').length
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
        if ($('body').find('.available-rooms').length > 0) {
            $('body').find('.available-rooms').remove();
        }
        $('body').append(_obj);
        $('.available-rooms').animate({
            opacity: 1
        }, animationDuration);
    }).fail(function (err) {
        console.log(err)
    });
}
let cumulativeOffset = function(element) {
    let top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};
$(document).ready(function () {
    let bodyStyles = window.getComputedStyle(document.body);
    let __zoom = bodyStyles.getPropertyValue('--zoom');
    $('*[width]').each(function(){
       // $(this).attr('width',$(this).attr('width')*__zoom);
    });
    $('*[height]').each(function(){
        //$(this).attr('height',$(this).attr('height')*__zoom);
    });
    $('body').on('click','.left-replies-block-slider .slick-prev,.left-replies-block-slider .slick-next',function(){
        let active_vote={
            value:$('.left-replies-block-slider .slick-slide.slick-active [data-vote-value]').eq(0).attr('data-vote-value'),
            level:$('.left-replies-block-slider .slick-slide.slick-active [data-vote-text-level]').eq(0).attr('data-vote-text-level'),
            name:$('.left-replies-block-slider .slick-slide.slick-active [data-vote-name]').eq(0).attr('data-vote-name'),
            avatar:$('.left-replies-block-slider .slick-slide.slick-active [data-avatar]').eq(0).attr('data-avatar'),
            room:$('.left-replies-block-slider .slick-slide.slick-active [data-room-type]').eq(0).attr('data-room-type'),
        }

        $('.left-replies-block-slider .vote-value .middle').html(active_vote.value);
        $('.left-replies-block-slider .vote-level').html(active_vote.level);
        $('.left-replies-block-slider .person .name').html(active_vote.name);
        $('.left-replies-block-slider .person .avatar').attr('src',active_vote.avatar);
        $('.left-replies-block-slider .person .room-type').html(active_vote.room);
    });
    $(window).on('scroll', function () {
        let left_replies_block_slider = $('.left-replies-block-slider');
        if(left_replies_block_slider.length>0) {
            let _diff=cumulativeOffset(left_replies_block_slider[0]).top;
            let _block_height=left_replies_block_slider.height();
            console.log(left_replies_block_slider.eq(0),cumulativeOffset(left_replies_block_slider[0]).top,window.scrollY);
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
        $.get('static/popup-room-info.html', function (data) {
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
