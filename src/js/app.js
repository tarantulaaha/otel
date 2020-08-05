import Settings from "./setting";
require('typeface-inter');
import $ from 'jquery';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/fonts/slick.woff';
import 'slick-carousel/slick/fonts/slick.ttf';
import {client_data} from './client-data.js'
import './jquery-vcCalendar.js'

let hideSearchBox = false;
let _zoom = 0;

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
                hideSearchBox = true;
                Settings.loadNextPage = 'services-block';
                $('body').scrollTop = 0;
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
                Settings.loadNextPage = 'services-block';
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
            if (client_data.promoCode !== '') {
                currentObj.find('.have-promo .promo-entered').html(client_data.promoCode);
                currentObj.find('.have-promo .promo-entered,.have-promo .promo-entered-title').css({
                    display: 'block'
                });
                currentObj.find('.have-promo .no-promo').css({
                    display: 'none'
                });
            } else {
                currentObj.find('.have-promo .promo-entered,.have-promo .promo-entered-title').css({
                    display: 'none'
                });
                currentObj.find('.have-promo .no-promo').css({
                    display: 'block'
                });
            }
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

let selectGuestObj = null;

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
                child_age_row.on('click', '.droopdown', function (e) {
                    e.stopPropagation();
                    $('body').find('.droopdown-expanded').removeClass('show');
                    $(this).find('.droopdown-element').removeClass('selected');
                    $(this).find('[data-value="' + $(this).attr('data-value') + '"]').addClass('selected');
                    $(this).find('.droopdown-expanded').toggleClass('show');
                });
                child_age_row.on('click', '.droopdown-element', function (e) {
                    e.stopPropagation();
                    $(this).parents('.droopdown-expanded').find('[data-value]').removeClass('selected');
                    $(this).parents('.droopdown-expanded').parent().find('.droopdown-value').html($(this).find('.value').text());
                    $(this).parents('.droopdown').eq(0).attr('data-value', $(this).attr('data-value'));
                    $(this).parents('.droopdown-expanded').removeClass('show');
                    child_age_row.find('.age-value').html($(this).attr('data-value'));
                    if(parseInt($(this).attr('data-value'))>4){
                        child_age_row.find('.age-3').css({
                            display:'none'
                        });
                        child_age_row.find('.age-5').css({
                            display:'block'
                        });
                    }else if(parseInt($(this).attr('data-value'))<5){
                        child_age_row.find('.age-3').css({
                            display:'block'
                        });
                        child_age_row.find('.age-5').css({
                            display:'none'
                        });
                    }
                });
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
        _obj.roomSelectionWindow();
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
                $(this).parent().find('.answer').css({
                    display: 'block'
                }).animate({
                    height: 145
                }, {
                    duration: 500,
                    step: function (now) {
                        $(this).css({heigh: now + '%)'});
                    },
                    complete: function () {
                    }
                });
                $(this).filter('.arrow-down').animate({
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
                $(this).parent().find('.answer').animate({
                    height: 0
                }, {
                    duration: 500,
                    step: function (now) {
                        $(this).css({heigh: now + '%)'});
                    },
                    complete: function () {
                        $(this).css({
                            display: 'none'
                        });
                    }
                });
                $(this).filter('.arrow-down').animate({
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
        });
        _obj.find('.question').on('click', function () {
            //$(this).parent().find('.answer').attr('data-height',$(this).parent().find('.answer')[0].offsetHeight-23);
            $('.faq .arrow-down').not($(this).find('.arrow-down')).removeClass('opened').trigger('classChange');
            $(this).find('.arrow-down').toggleClass('opened').promise().done(function () {
                console.log($(this).find('.arrow-down'));
                $(this).trigger('classChange');
            });
        });
        _obj.find('.arrow-down').trigger('classChange');
        let available_rooms = $('body .available-rooms');
        if (available_rooms.length > 0) {
            available_rooms.animate({
                opacity: 0
            }, Settings.animationDuration, function () {
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
                $('.available-rooms').animate({
                    opacity: 1
                }, Settings.animationDuration);
                $('.frame-155-overflow').slick({
                    infinite: true,
                    slidesToShow: 4,
                    swipeToSlide: true,
                    arrows: false,
                    dots: false,
                    variableWidth: true,
                    useTransform: false,
                    responsive: [
                        {
                            breakpoint: 1199,
                            settings: "unslick"
                        }
                    ]
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
            }, Settings.animationDuration);
            $('.frame-155-overflow').slick({
                infinite: true,
                slidesToShow: 4,
                swipeToSlide: true,
                arrows: false,
                dots: false,
                variableWidth: true,
                useTransform: false,
                responsive: [
                    {
                        breakpoint: 1199,
                        settings: 'unslick'
                    }
                ]
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
        }, {
            duration: Settings.animationDuration,
            complete: function () {
                $('html').animate({
                    scrollTop: $('.available-rooms').offset().top
                }, 500);
            }
        });
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
    //hideSearchBox = true;
    //Settings.loadNextPage = 'services-block';
    //Settings.loadNextPage = 'pay-parameters';
    //Settings.loadNextPage = 'paying';
    //Settings.loadNextPage = 'pay-result-ok';
    $('body').on('click', '.reserve-room-window .have-promo .value', function () {
        $('.search-form .have-promo .value').trigger('click');
        $('html').animate({
            scrollTop: $('.search-form').offset().top - 300
        }, 500);
    });
    if (typeof $('body').css('zoom') === typeof undefined) {
        _zoom = new WebKitCSSMatrix($('body').css('-moz-transform')).a;
    } else {
        _zoom = parseInt($('body').css('zoom'));
    }

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        $(window).on('scroll', function () {
            if (window.innerWidth > 1199) {
            }
        });
    }
    if (navigator.userAgent.toLowerCase().indexOf('safari') > -1) {
        _zoom=_zoom+0.015;
    }
    console.log(_zoom);
    let opening = false;
    let mousePosY = 0;
    $('body').on('touchstart', '.reserve-room-window', function (e) {
       // opening = true;
        mousePosY = e.touches[0].screenY;
        console.log('touchstart');
    });
    $('body').on('touchend', '.reserve-room-window', function (e) {
        opening = false;
        console.log('touchend');
    });
    $('body').on('touchstart', '.pay-parameters .paragon-block', function (e) {
        //opening = true;
        mousePosY = e.touches[0].screenY;
    });
    $('body').on('touchend', '.pay-parameters .paragon-block', function (e) {
        opening = false;
    });
    $('body').on('touchmove', function (e) {
        let delta = mousePosY - e.touches[0].screenY;
        if (opening) {
            let _obj = $('.paragon-block').eq(0).find('.rolling');
            let _obj2 = $('.reserve-room-window').eq(0).find('.rolling');
            if (delta < -10) {
                opening = false;
                _obj.parent().animate({
                    // bottom: -158
                }, 500);
                _obj2.slideUp(500, function () {
                    _obj.addClass('roll-up');
                });
                _obj.slideUp(500, function () {
                    _obj.addClass('roll-up');
                    $(this).parents('.paragon-block').find('.full-price-block').addClass('price-white');
                });
            } else if (delta > 10) {
                opening = false;
                _obj.parent().animate({
                    //bottom: -438
                }, 500);
                _obj2.slideDown(500, function () {
                    _obj.removeClass('roll-up');
                });
                _obj.slideDown(500, function () {
                    _obj.removeClass('roll-up');
                    _obj.parents('.paragon-block').eq(0).find('.full-price-block').removeClass('price-white');
                });
            }
        }
    });
    $('body').on('click', '.pay-parameters .paragon-block .roll-block, .reserve-room-window .roll-block', function () {
        let _obj = $(this).parents('.paragon-block').eq(0).find('.rolling');
        if (_obj.hasClass('roll-up')) {
            _obj.parent().animate({
                // bottom: -438
            }, 500);
            _obj.slideDown(500, function () {
                _obj.removeClass('roll-up');
                _obj.parents('.paragon-block').eq(0).find('.full-price-block').removeClass('price-white');
            });
        } else {
            _obj.parent().animate({
                // bottom: -158
            }, 500);
            _obj.slideUp(500, function () {
                _obj.addClass('roll-up');
                $(this).parents('.paragon-block').find('.full-price-block').addClass('price-white');
            });
        }
        let _obj2 = $('.reserve-room-window').eq(0).find('.rolling');
        if (_obj2.hasClass('roll-up')) {
            _obj2.slideDown(500, function () {
                _obj2.removeClass('roll-up');
            });
        } else {
            _obj2.slideUp(500, function () {
                _obj2.addClass('roll-up');
            });
        }
    });
    $('body').on('DOMSubtreeModified', '.content-page', function () {
        try {
            if (window.innerWidth < 1200) {
                let _obj = $(this).parent().find('.rolling.roll-up');
                if (_obj.length > 0) {
                    _obj.parent().find('.full-price-block').addClass('price-white');
                }
                if ($('.room-variants').length > 0) {
                    $('.room-variants').slick({
                        infinite: false,
                        slidesToShow: 1.131,
                        swipeToSlide: true,
                        arrows: false,
                        dots: false,
                        variableWidth: true,
                        useTransform: false
                    });
                }
            }
            if ($('.room-photos').length > 0) {
                $('.room-photos').slick({
                    infinite: true,
                    slidesToShow: 1,
                    swipeToSlide: true,
                    arrows: true,
                    dots: false,
                    variableWidth: false,
                    useTransform: false
                });
            }
            let cur_slide = 1;
            let all_slides = $('.room-photos').find('.slick-slide').not('.slick-cloned').length;
            $('.room-photos').parent().find('.slick-counter > .value').html(cur_slide + '/' + all_slides);
            $('.room-photos').find('.slick-prev,.slick-next').on('click', function () {
                cur_slide = parseInt($(this).parents('.row').eq(0).find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                $(this).parents('.row').eq(0).find('.slick-counter > .value').html(cur_slide + '/' + all_slides);
            });
            $('.room-photos').find('.slick-track').attr_change({
                callback: function () {
                    cur_slide = parseInt($(this).parents('.row').eq(0).find('.slick-slide.slick-current.slick-active').eq(0).attr('data-slick-index')) + 1;
                    $(this).parents('.row').eq(0).find('.slick-counter > .value').html(cur_slide + '/' + all_slides);
                }
            });
        } catch (e) {
        }
    });
    let promoShowed = false;
    $('body').on('click', '.pay-parameters .mobile-version.back-btn', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'services-block';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.paying .mobile-version.back-btn', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'pay-parameters';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.pay-result-ok .mobile-version.back-btn', function () {
        hideSearchBox = false;
        Settings.loadNextPage = 'main-page';
        $('body').scrollTop = 0;
    });
    $('.have-promo').on('click', function (e) {
        let havePromo = $(this);
        if (!promoShowed) {
            $.get('templates/promo1.html', function (data) {
                    let promo1 = $(data);
                    promo1.on('click', '.accept-promo-btn', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        client_data.promoCode = promo1.find('.promo-value').val();
                        client_data.needRefresh = true;
                        $.get('templates/promo2.html', function (data) {
                                let promo2 = $(data);
                                promo2.find('.promo-value').html(client_data.promoCode);
                                promo2.on('click', '.promo-cross', function (e) {
                                    $.get('templates/promo0.html', function (data) {
                                            client_data.promoCode = '';
                                            client_data.needRefresh = true;
                                            let promo0 = $(data);
                                            promo2.on('click', '.promo-cross', function (e) {
                                            });
                                            havePromo.html('').append(promo0);
                                            promoShowed = false;
                                        }
                                    ).fail(function (err) {
                                        console.log(err)
                                    });
                                });
                                havePromo.html('').append(promo2);
                                promoShowed = true;
                            }
                        ).fail(function (err) {
                            console.log(err)
                        });
                    });
                    havePromo.html('').append(promo1);
                    promoShowed = true;
                }
            ).fail(function (err) {
                console.log(err)
            });
        }
    });
    $('body').on('click', '.available-rooms-filter .input1', function () {
        $('.available-rooms-filter .input3').attr('data-value', "any");
        $('.available-rooms-filter .input3').find('.droopdown-value').html($('.available-rooms-filter .input3 [data-value="any"] .value').text());
        $('.available-rooms-filter .input4').attr('data-value', "0");
        $('.available-rooms-filter .input4').find('.droopdown-value').html($('.available-rooms-filter .input3 [data-value="any"] .value').text());
        $(this).parents('.available-rooms-filter').find('[data-value]').removeClass('selected');
        $(this).parents('.available-rooms-filter').eq(0).find('.input4 .droopdown-value').css({
            display: 'none'
        });
        $(this).parents('.available-rooms-filter').eq(0).find('.input4 .droopdown-default-value').css({
            display: 'block'
        });
        $(this).parents('.available-rooms-filter').find('.input4 .droopdown-variable-value').find('.var1-2,.var1-5').css({
            display: 'none'
        });
        $(this).parents('.available-rooms-filter').find('.input4 .droopdown-variable-value').css({
            display: 'none'
        });
        $(this).addClass('selected');
    });
    $('body').on('click', '.droopdown', function (e) {
        e.stopPropagation();
        $('body').find('.droopdown-expanded').removeClass('show');
        $(this).find('.droopdown-element').removeClass('selected');
        $(this).find('[data-value="' + $(this).attr('data-value') + '"]').addClass('selected');
        $(this).find('.droopdown-expanded').toggleClass('show');
    });
    $('body').on('click', '.droopdown-element', function (e) {
        e.stopPropagation();
        $(this).parents('.droopdown-expanded').find('[data-value]').removeClass('selected');
        $(this).parents('.droopdown-expanded').parent().find('.droopdown-value').html($(this).find('.value').text());
        $(this).parents('.droopdown').eq(0).attr('data-value', $(this).attr('data-value'));
        $(this).parents('.droopdown-expanded').removeClass('show');
        let input3 = $('.available-rooms-filter .input3[data-value="any"]').length > 0;
        let input4 = $('.available-rooms-filter .input4[data-value="0"]').length > 0;
        if (input4 && input3) {
            $('.available-rooms-filter .input1').addClass('selected');
        } else {
            $('.available-rooms-filter .input1').removeClass('selected');
        }
    });
    $('body').on('click', '.droopdown-clear-checked', function (e) {
        $(this).parents('.droopdown').find('.selected').removeClass('selected');
        $(this).parents('.droopdown').eq(0).attr('data-value', '0');
        $(this).parents('.droopdown').eq(0).find('.droopdown-value').css({
            display: 'none'
        });
        $(this).parents('.droopdown').eq(0).find('.droopdown-default-value').css({
            display: 'block'
        });
        $(this).parents('.droopdown').find('.droopdown-variable-value').find('.var1-2,.var1-5').css({
            display: 'none'
        });
        $(this).parents('.droopdown').find('.droopdown-variable-value').css({
            display: 'none'
        });
        let input3 = $('.available-rooms-filter .input3[data-value="any"]').length > 0;
        let input4 = $('.available-rooms-filter .input4[data-value="0"]').length > 0;
        if (input4 && input3) {
            $('.available-rooms-filter .input1').addClass('selected');
        } else {
            $('.available-rooms-filter .input1').removeClass('selected');
        }
    });
    $('body').on('click', '.droopdown-check-element', function (e) {
        e.stopPropagation();
        $(this).toggleClass('selected');
        let arr = [];
        $(this).parents('.droopdown-expanded').find('.droopdown-check-element.selected').each(function () {
            arr.push($(this).attr('data-value'));
        });
        if (arr.length === 0) {
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-default-value').css({
                display: 'block'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-variable-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown').find('.droopdown-variable-value').find('.var1-2,.var1-5').css({
                display: 'none'
            });
            $(this).parents('.droopdown').find('.droopdown-variable-value').css({
                display: 'none'
            });
        } else if (arr.length === 1) {
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-value').css({
                display: 'block'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-default-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-variable-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown').find('.droopdown-variable-value').find('.var1-2,.var1-5').css({
                display: 'none'
            });
            $(this).parents('.droopdown').find('.droopdown-variable-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-value').html($(this).parents('.droopdown-expanded').parent().find('[data-value="' + arr[0] + '"] .value').text());
        } else {
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-default-value').css({
                display: 'none'
            });
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-variable-value').css({
                display: 'block'
            });
            if (arr.length < 5) {
                $(this).parents('.droopdown').find('.droopdown-variable-value .var1-2').css({
                    display: 'inline-block'
                });
                $(this).parents('.droopdown').find('.droopdown-variable-value .var1-5').css({
                    display: 'none'
                });
            } else {
                $(this).parents('.droopdown').find('.droopdown-variable-value .var1-2').css({
                    display: 'none'
                });
                $(this).parents('.droopdown').find('.droopdown-variable-value .var1-5').css({
                    display: 'inline-block'
                });
            }
            $(this).parents('.droopdown-expanded').parent().find('.droopdown-variable-value .var1').html(arr.length);
        }
        if (arr.length === 0) {
            arr.push("0");
        }
        $(this).parents('.droopdown').eq(0).attr('data-value', arr.toString());
        let input3 = $('.available-rooms-filter .input3[data-value="any"]').length > 0;
        let input4 = $('.available-rooms-filter .input4[data-value="0"]').length > 0;
        if (input4 && input3) {
            $('.available-rooms-filter .input1').addClass('selected');
        } else {
            $('.available-rooms-filter .input1').removeClass('selected');
        }
    });
    $('body').on('mouseover', '.available-rooms-result .slick-slider', function () {
        $(this).parents('.available-rooms-result').eq(0).find('.slick-counter').addClass('slick-counter-show');
    });
    $('body').on('mouseout', '.available-rooms-result .slick-slider', function () {
        $(this).parents('.available-rooms-result').eq(0).find('.slick-counter').removeClass('slick-counter-show');
    });
    $('body').on('click', '.pay-result-ok .back-to-main-page', function () {
        hideSearchBox = false;
        Settings.loadNextPage = 'main-page';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.paying .pay-confirm', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'pay-result-ok';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.services-block .button-subbmit', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'pay-parameters';
        $('body').scrollTop = 0;
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
        if (Settings.loadNextPage.length > 0) {
            if (Settings.loadNextPage === 'services-block') {
                hideSearchBox = true;
            }
            $('.content-page').html('');
            $.get('templates/' + Settings.loadNextPage + '.html', function (data) {
                $('.content-page').append($(data));
            });
            Settings.loadNextPage = '';
        }
    }, 100);
    $('body').on('click', '.pay-parameters .next-step-button', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'paying';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.back-paying', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'pay-parameters';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.back-box-services, .services-block .back-btn', function () {
        hideSearchBox = false;
        $('.content-page').html('');
        showAvailableRooms();
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.next-box-services, .services-block .next-btn', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'pay-parameters';
        $('body').scrollTop = 0;
    });
    $('body').on('click', '.back-box-pay-parameters', function () {
        hideSearchBox = true;
        Settings.loadNextPage = 'services-block';
        $('body').scrollTop = 0;
    });
    let calendarWindow = $('.in-out').vcCalendar();
    $('body').on('click', '.select-tariff-group .btn-large', function () {
        $(this).parent().roomAppendingWindow();
    });
    function selectGuestPopup() {
        if (selectGuestObj === null) {
            $.get('templates/popup-select-guest.html', function (data) {
                selectGuestObj = $(data);
                selectGuestObj.css({
                    display: 'none',
                    opacity: 0,
                });
                selectGuestObj.on('click', function (event) {
                    selectGuestObj.find('.droopdown-expanded').removeClass('show');
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
                        let roomCount = $('.popup-select-guest .apartment-block').length;
                        guest_row.find('.apartment-num-value').html(roomCount + 1);
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
                        display: 'none'
                    });
                });
                $('div.guests').append(selectGuestObj);
                selectGuestObj.css({
                    display: 'block'
                }).stop().animate({
                    opacity: 1
                }, Settings.animationDuration);
            }).fail(function (err) {
                console.log(err)
            });
        } else {
            selectGuestObj.css({
                display: 'block'
            }).animate({
                opacity: 1
            }, Settings.animationDuration);
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
        if (window.innerWidth > 1199) {
            let fixedObjects = $('.fixed');
            fixedObjects.each(function () {
                if (typeof $(this).attr('data-css-top') === typeof undefined) {
                    $(this).attr('data-css-top', $(this)[0].offsetTop);
                }
                if ($(this).attr('scrolling') !== 'true') {
                    if (parseInt($(this).attr('data-offset')) < $('html')[0].scrollTop) {
                        let top = $('html')[0].scrollTop - $(this).offset().top + $(this)[0].offsetTop;
                        $(this).css({
                            top: top + 18
                        });
                    } else {
                        $(this).css({
                            top: $(this).attr('data-css-top')
                        });
                    }
                }
            });
        }
    });
    $('body').on('click', '.slick-slider img', function () {

            let _caller = $(this);
            let _slide = _caller.parents('.slick-slide').eq(0);
            let _slider = $(this).parents('.slick-slider').eq(0);
            let cur_slide = 0;
            let all_slides = 0;
            cur_slide = parseInt(_slide.attr('data-slick-index')) + 1;
            all_slides = _slider.find('.slick-slide').not('.slick-cloned').length;
            $('.image-counter-value').html(cur_slide + '/' + all_slides);
            $('.prev-btn-block').on('click', function () {
                if (_slide.prev().not('.slick-cloned').length > 0) {
                    $(this).parent().find('.photo-view').stop().animate({
                        opacity: 0
                    }, 100, function () {
                        _slide = _slide.prev().not('.slick-cloned');
                        let _prev = _slide.find('img').attr('data-big-img');
                        $(this).parent().find('.photo-view').attr('src', _prev);
                        cur_slide = parseInt(_slide.attr('data-slick-index')) + 1;
                        all_slides = _slider.find('.slick-slide').not('.slick-cloned').length;
                        $(this).parent().find('.images-counter > .image-counter-value').html(cur_slide + '/' + all_slides);
                        $(this).parent().find('.photo-view').stop().animate({
                            opacity: 1
                        }, 1000);
                    });
                }
            });
            $('.next-btn-block').on('click', function () {
                if (_slide.next().not('.slick-cloned').length > 0) {
                    $(this).parent().find('.photo-view').stop().animate({
                        opacity: 0
                    }, 100, function () {
                        _slide = _slide.next().not('.slick-cloned');
                        let _next = _slide.find('img').attr('data-big-img');
                        $(this).parent().find('.photo-view').attr('src', _next);
                        cur_slide = parseInt(_slide.attr('data-slick-index')) + 1;
                        all_slides = _slider.find('.slick-slide').not('.slick-cloned').length;
                        $(this).parent().find('.images-counter > .image-counter-value').html(cur_slide + '/' + all_slides);
                        $(this).parent().find('.photo-view').stop().animate({
                            opacity: 1
                        }, 1000);
                    });
                }
            });
            let _obj = $('img.photo-view').attr('src', $(this).eq(0).attr('data-big-img'));
            _obj.parent().css({
                display: 'block'
            });
            $('.hide-doc').css({
                display: 'block'
            });

    });
    $('body').on('click', '.image-wiev-block .close-btn', function () {
        $(this).parent().css({
            display: 'none'
        });
        $('.hide-doc').css({
            display: 'none'
        });
    });
    $('body').on('click', '.room-info-btn', function () {
        $('.hide-doc').css({
            display: 'block',
            height: $('body')[0].offsetHeight
        });
        $('body').find('.popup-room-info').remove();
        $.get('templates/popup-room-info.html', function (data) {
            let popup_room_info = $(data);
            popup_room_info.find('.close-btn').on('click', function () {
                popup_room_info.remove();
                $('.hide-doc').css({
                    display: 'none'
                });
            });
            popup_room_info.css({});
            $('body').append(popup_room_info);
            popup_room_info.css({
                top: $('html')[0].scrollTop / _zoom + window.outerHeight / 2 - ((popup_room_info[0].offsetHeight / 2) * _zoom),
                left: ((window.innerWidth / 2) - (popup_room_info[0].offsetWidth / 2) * _zoom)
            });
            // if (window.innerWidth > 1199) {
            //     $('.popup-room-info').css({
            //         top: $('html')[0].scrollTop*0.8 + 25
            //     });
            // }
        });
    });
    $('body').on('click', '.mobile-tooltip .close-btn', function () {
        $('.mobile-tooltip').css({
            display: 'none'
        });
        $('.hide-doc').css({
            display: 'none'
        });
    });
    $('body').on('click', '[data-tooltip]', function () {
        if (window.innerWidth < 1200) {
            let value = $(this).attr('data-tooltip');
            $('.mobile-tooltip .tooltip-value').html(value);
            let _obj = $('.mobile-tooltip');
            $('.mobile-tooltip').css({
                display: 'block'
            });
            $('.hide-doc').css({
                display: 'block',
                height: $('body')[0].offsetHeight
            });
            $('.mobile-tooltip').css({
                top: ($('html')[0].scrollTop / _zoom) + (window.outerHeight / 2) - ((_obj[0].offsetHeight / 2) * _zoom),
                left: ((window.innerWidth / 2) - (_obj[0].offsetWidth / 2) * _zoom) - 5
            });
        }
    });
    $('body').on('mouseover', '[data-tooltip]', function () {
        if (window.innerWidth >= 1200) {
            let value = $(this).attr('data-tooltip');
            let _tooltip = $('<div class="tooltip"></div>');
            let _frame116 = $('<div class="frame-116"></div>');
            let _tooltip_value = $('<span class="tooltip-value">' + value + '</span>');
            let _tooltip_rectangle = $('<span class="tooltip-rectangle"></span>');
            _frame116.append(_tooltip_value);
            _tooltip.append(_frame116);
            _tooltip.append(_tooltip_rectangle);
            $(this).append(_tooltip);
        }
    });
    $('body').on('mouseout', '[data-tooltip]', function () {
        $(this).find('.tooltip').remove();
    });
    $('.photos').slick({
        infinite: true,
        slidesToShow: 6,
        swipeToSlide: true,
        variableWidth: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false,
                    swipeToSlide: true,
                    variableWidth: true
                }
            }
        ]
    });
    $('html').on('click', function () {
        $(this).find('.droopdown-expanded').removeClass('show');
        $('.popup-select-guest').animate({
            opacity: 0,
        }, Settings.animationDuration, function () {
            $(this).css({
                display: 'none'
            });
        });
    });
    $('.guests,.guests-icon').on('click', function (event) {
        selectGuestPopup();
        calendarWindow.hideWindow();
        event.stopPropagation();
        return false;
    });
    $('.btn-search').on('click', function (event) {
        searchAvailableRooms();
    });
});
