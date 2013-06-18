/* global console:false, jQuery:false */
/**
 * Created with JetBrains PhpStorm.
 * User: oroessner
 * Date: 18.06.13
 * Time: 14:06
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
    "use strict";

    var isDragging = false;
    var isMoving = false;
    var dragStart = {};
    var settings = {};
    var $svg, svg, pt, $wrapper;
    var eventNamespace = 'svg_map.';

    /**
     *
     * @param [options]
     */
    $.fn.svgMap = function (options) {

        settings = $.extend({
            zoomLevels         : 20,
            plusButtonText     : '+',
            minusButtonText    : '-',
            enableConsoleOutput: false
        }, options);

        return this.filter('svg').each(function () {
            init(this);
        });
    };

    function init(elem) {
        $svg = $(elem);
        svg = $svg.get(0);
        //noinspection JSUnresolvedFunction
        pt = svg.createSVGPoint();

        disableSelection();
        createZoomButtons();

        $svg.on('mousemove', onMouseOverSvg);
        $svg.on('mousedown', onSvgMouseDown);
        $svg.on('mouseup', onSvgMouseUp);

        $wrapper.find('.zoom_button').on('click', zoomSvg);

        $svg.trigger(eventNamespace + 'init');
    }

    function createZoomButtons() {
        $svg.wrap('<section id="svg_map_wrapper" style="position: relative" />');
        $wrapper = $('#svg_map_wrapper');

        var $buttonPlus = $('<button class="zoom_button" type="button" id="zoom_in" data-zoom="-1">' + settings.plusButtonText + '</button>');
        var $buttonMinus = $('<button class="zoom_button" type="button" id="zoom_out" data-zoom="1">' + settings.minusButtonText + '</button>');
        var $buttonWrapper = $('<aside class="zoom_button_container" />');
        $buttonWrapper.css({
            position: 'absolute',
            top     : 0,
            right   : 0
        });
        $buttonWrapper.append($buttonPlus);
        $buttonWrapper.append($buttonMinus);

        $wrapper.prepend($buttonWrapper);
    }

    function disableSelection() {
        svg.onselectstart = function () {
            return false;
        };
        svg.unselectable = "on";
        $svg.css('user-select', 'none');
        $svg.css('-o-user-select', 'none');
        $svg.css('-moz-user-select', 'none');
        $svg.css('-khtml-user-select', 'none');
        $svg.css('-webkit-user-select', 'none');
    }

    function onMouseOverSvg(e) {

        var cursorpt = cursorPoint(e, svg);

        $svg.trigger(eventNamespace + 'move', [cursorpt]);

        isMoving = true;

        if (isDragging) {
            var x = e.offsetX;
            var y = e.offsetY;

            var maxWidth = $svg.width();
            var maxHeight = $svg.height();

            var oldViewBox = svg.getAttribute('viewBox') || '0 0 ' + maxWidth + ' ' + maxHeight;
            var nVB = oldViewBox.split(' ');
            var newVB = [dragStart.x - dragStart.xOffset - x, dragStart.y - dragStart.yOffset - y, nVB[2], nVB[3]];

            svg.setAttribute("viewBox", newVB.join(' '));
            //console.log(newVB);
            $svg.trigger(eventNamespace + 'drag', [cursorpt]);
        }
    }

    function onSvgMouseDown(e) {

        var cursorpt = cursorPoint(e, svg);

        isDragging = true;
        isMoving = false;
        var offset = (svg.getAttribute('viewBox') || '0 0 0 0').split(' ');

        dragStart = {x: e.offsetX, y: e.offsetY, xOffset: offset[0] * -1, yOffset: offset[1] * -1};

        $svg.trigger(eventNamespace + 'mousedown', [cursorpt, dragStart]);
    }

    function onSvgMouseUp(e) {

        var cursorpt = cursorPoint(e, svg);

        if (isMoving === false) {
            $svg.trigger(eventNamespace + 'click', [cursorpt]);
        }

        isDragging = false;

        $svg.trigger(eventNamespace + 'mousedown', [cursorpt]);
    }

    function cursorPoint(evt, element) {
        pt.x = evt.clientX;
        pt.y = evt.clientY;

        if (element === null) {
            //noinspection JSUnresolvedFunction
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }
        else {
            //noinspection JSUnresolvedFunction
            return pt.matrixTransform(element.getScreenCTM().inverse());
        }
    }

    function zoomSvg(e) {
        var button = $(e.target);
        var zoomFactor = button.data('zoom');

        if (settings.enableConsoleOutput === true) {
            //noinspection JSCheckFunctionSignatures
            console.groupCollapsed('SVG Zoom');
            console.log('zoomFactor', zoomFactor);
        }

        var maxWidth = $svg.width();
        var maxHeight = $svg.height();

        var oldViewBox = svg.getAttribute('viewBox') || '0 0 ' + maxWidth + ' ' + maxHeight;
        var nVB = oldViewBox.split(' ');

        var currentWidth = nVB[2];
        var currentHeight = nVB[3];

        if (settings.enableConsoleOutput === true) {
            console.log('currentWidth', currentWidth);
            console.log('currentHeight', currentHeight);
        }

        var zoomStepWidth = maxWidth / settings.zoomLevels;
        var zoomStepHeight = maxHeight / settings.zoomLevels;

        if (settings.enableConsoleOutput === true) {
            console.log('zoomStepWidth', zoomStepWidth);
            console.log('zoomStepHeight', zoomStepHeight);
        }

        var currentStepWidth = currentWidth / zoomStepWidth;
        var currentStepHeight = currentHeight / zoomStepHeight;

        if (settings.enableConsoleOutput === true) {
            console.log('currentStepWidth', currentStepWidth);
            console.log('currentStepHeight', currentStepHeight);
        }

        var newWidth = zoomStepWidth * (currentStepWidth + zoomFactor);
        var newHeight = zoomStepHeight * (currentStepHeight + zoomFactor);

        if (settings.enableConsoleOutput === true) {
            console.log('newWidth', newWidth);
            console.log('newHeight', newHeight);
        }

        if (newWidth < 1) {
            newWidth = 1;
        }

        if (newHeight < 1) {
            newHeight = 1;
        }

        if (settings.enableConsoleOutput === true) {
            console.groupEnd();
        }

        var newVB = [nVB[0], nVB[1], Math.floor(newWidth), Math.floor(newHeight)];

        svg.setAttribute("viewBox", newVB.join(' '));

        $svg.trigger(eventNamespace + 'zoom', [newVB]);
    }

})(jQuery);
