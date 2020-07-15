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
        _obj.find('.btn-large').each(function () {
            $(this).on('click', function () {
                showAvailableRooms();
            });
        });
        if ($('div.main-layer').find('.available-rooms').length > 0) {
            $('div.main-layer').find('.available-rooms').animate({
                opacity: 0
            },animationDuration, function(){
                $('div.main-layer').find('.available-rooms').remove();
                $('div.main-layer').append(_obj);
                $('.available-rooms').animate({
                    opacity: 1
                }, animationDuration);
                $('.frame-155-overflow').slick({
                    infinite: true,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: false,
                });
            });
        }else{
            $('div.main-layer').append(_obj);
            $('.available-rooms').animate({
                opacity: 1
            }, animationDuration);
            $('.frame-155-overflow').slick({
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                arrows: false,
                dots: false,
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
