(function ($) {
    $.fn.getSelection = function () {
        var input = this[0];
        var start = 0, end = 0, normalizedValue, range, textInputRange, len, endRange;

        if (typeof input.selectionStart == "number" && typeof input.selectionEnd == "number") {
            start = input.selectionStart;
            end = input.selectionEnd;
        } else {
            // For IE <=8 compatibility, if you still need it
            range = document.selection.createRange();
            if (range && range.parentElement() == input) {
                len = input.value.length;
                normalizedValue = input.value.replace(/\r\n/g, "\n");
                textInputRange = input.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());
                endRange = input.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    start = end = len;
                } else {
                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("\n").length - 1;

                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                    }
                }
            }
        }
        return {
            start: start,
            end: end,
            length: end - start,
            text: input.value.substring(start, end)
        };
    };

    $.fn.replaceSelection = function (text) {
        var input = this[0];
        if (typeof input.selectionStart == "number" && typeof input.selectionEnd == "number") {
            var value = input.value;
            var start = input.selectionStart, end = input.selectionEnd;
            input.value = value.substring(0, start) + text + value.substring(end, value.length);
            input.selectionStart = input.selectionEnd = start + text.length;
        } else if (document.selection && document.selection.createRange) {
            input.focus();
            var range = document.selection.createRange();
            range.text = text;
            range.collapse(false);
            range.select();
        }
        return this;
    };
    var caretPositionAmp;
    $.fn.insertAtCaretPos = function(inputStr) {
        var input = this.jquery ? this[0] : this;
        var start;
        var end;
        var position;
        var s;
        var re;
        var rc;
        var point;
        var minus = 0;
        var number = 0;
        var mozScrollFix = (input.scrollTop == undefined) ? 0 : input.scrollTop;
        input.focus();
        if (document.selection && typeof (input.selectionStart) != "number") {
            if (input.value.match(/\n/g) != null) {
                number = input.value.match(/\n/g).length;// number of EOL simbols
            }
            point = parseInt(caretPositionAmp);
            if (number > 0) {
                for (var i = 0; i <= number; i++) {
                    var w = input.value.indexOf("\n", position);
                    if (w != -1 && w <= point) {
                        position = w + 1;
                        point = point - 1;
                        minus++;
                    }
                }
            }
        }
        caretPositionAmp = parseInt(caretPositionAmp);
        // IE
        input.onmouseup = function () { // for IE because it loses caret position when focus changed
            if (document.selection && typeof (input.selectionStart) != "number") {
                input.focus();
                s = document.selection.createRange();
                re = input.createTextRange();
                rc = re.duplicate();
                re.moveToBookmark(s.getBookmark());
                rc.setEndPoint("EndToStart", re);
                caretPositionAmp = rc.text.length;
            }
        }

        if (document.selection && typeof (input.selectionStart) != "number") {
            s = document.selection.createRange();
            if (s.text.length != 0) {
                return this;
            }
            re = input.createTextRange();
            textLength = re.text.length;
            rc = re.duplicate();
            re.moveToBookmark(s.getBookmark());
            rc.setEndPoint("EndToStart", re);
            start = rc.text.length;
            if (caretPositionAmp > 0 && start == 0) {
                minus = caretPositionAmp - minus;
                re.move("character", minus);
                re.select();
                s = document.selection.createRange();
                caretPositionAmp += inputStr.length;
            } else if (!(caretPositionAmp >= 0) && textLength == 0) {
                s = document.selection.createRange();
                caretPositionAmp = inputStr.length + textLength;
            } else if (!(caretPositionAmp >= 0) && start == 0) {
                re.move("character", textLength);
                re.select();
                s = document.selection.createRange();
                caretPositionAmp = inputStr.length + textLength;
            } else if (!(caretPositionAmp >= 0) && start > 0) {
                re.move("character", 0);
                document.selection.empty();
                re.select();
                s = document.selection.createRange();
                caretPositionAmp = start + inputStr.length;
            } else if (caretPositionAmp >= 0 && caretPositionAmp == textLength) {
                if (textLength != 0) {
                    re.move("character", textLength);
                    re.select();
                } else {
                    re.move("character", 0);
                }
                s = document.selection.createRange();
                caretPositionAmp = inputStr.length + textLength;
            } else if (caretPositionAmp >= 0 && start != 0 && caretPositionAmp >= start) {
                minus = caretPositionAmp - start;
                re.move("character", minus);
                document.selection.empty();
                re.select();
                s = document.selection.createRange();
                caretPositionAmp = caretPositionAmp + inputStr.length;
            } else if (caretPositionAmp >= 0 && start != 0 && caretPositionAmp < start) {
                re.move("character", 0);
                document.selection.empty();
                re.select();
                s = document.selection.createRange();
                caretPositionAmp = caretPositionAmp + inputStr.length;
            } else {
                document.selection.empty();
                re.select();
                s = document.selection.createRange();
                caretPositionAmp = caretPositionAmp + inputStr.length;
            }
            s.text = inputStr;
            input.focus();

            return this;
        } else if (typeof (input.selectionStart) == "number" && // MOZILLA support
            input.selectionStart == input.selectionEnd) {
            position = input.selectionStart + inputStr.length;
            start = input.selectionStart;
            end = input.selectionEnd;
            input.value = input.value.substr(0, start) + inputStr + input.value.substr(end);
            input.setSelectionRange(position, position);
            input.scrollTop = mozScrollFix;
            return this;
        }
        return this;
    };

    $.fn.setSelection = function (startPosition, endPosition) {
        startPosition = parseInt(startPosition);
        endPosition = parseInt(endPosition);

        var input = this.jquery ? this[0] : this;
        input.focus();
        if (typeof (input.selectionStart) != "number") {
            re = input.createTextRange();
            if (re.text.length < endPosition) {
                endPosition = re.text.length + 1;
            }
        }
        if (endPosition < startPosition) {
            return this;
        }
        if (document.selection) {
            var number = 0;
            var plus = 0;
            var position = 0;
            var plusEnd = 0;
            if (typeof (input.selectionStart) != "number") { // IE
                re.collapse(true);
                re.moveEnd('character', endPosition);
                re.moveStart('character', startPosition);
                re.select();
                return this;
            } else if (typeof (input.selectionStart) == "number") {      // Opera
                if (input.value.match(/\n/g) != null) {
                    number = input.value.match(/\n/g).length;// number of EOL simbols
                }
                if (number > 0) {
                    for (var i = 0; i <= number; i++) {
                        var w = input.value.indexOf("\n", position);
                        if (w != -1 && w < startPosition) {
                            position = w + 1;
                            plus++;
                            plusEnd = plus;
                        } else if (w != -1 && w >= startPosition && w <= endPosition) {
                            if (w == startPosition + 1) {
                                plus--;
                                plusEnd--;
                                position = w + 1;
                                continue;
                            }
                            position = w + 1;
                            plusEnd++;
                        } else {
                            i = number;
                        }
                    }
                }
                startPosition = startPosition + plus;
                endPosition = endPosition + plusEnd;
                input.selectionStart = startPosition;
                input.selectionEnd = endPosition;
                return this;
            } else {
                return this;
            }
        }
        else if (input.selectionStart) {   // MOZILLA support
            input.focus();
            input.selectionStart = startPosition;
            input.selectionEnd = endPosition;
            return this;
        }
    };
    // workaround for Opera browser
    if (navigator.userAgent.match(/opera/i)) {
        $(document).keypress(function (e) {
            if ($.floautocompleteFocused) {
                $.floautocompleteFocused.focus();
                $.floautocompleteFocused = null;
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    $.floautocompleteKeys = {
        UNKNOWN: 0,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        DEL: 46,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        COMMA: 188,
        PAGEUP: 33,
        PAGEDOWN: 34,
        BACKSPACE: 8
        //SPACE: 32
    };
    $.floautocompleteFocused = null;

    $.fn.floautocomplete = function (suggests, options) {
        return this.each(function () {
            $.makeSuggest(this, suggests, options);
        });
    };

    $.fn.floautocomplete.defaults = {
        'delimiters': '\n ',
        'minChunkSize': 1,
        'cycleOnTab': true,
        'autoComplete': true,
        'endingSymbols': '. ',
        'stopSuggestionKeys': [$.floautocompleteKeys.RETURN],
        'ignoreCase': true
    }
    $.makeSuggest = function (area, suggests, options) {
        options = $.extend({}, $.fn.floautocomplete.defaults, options);

        var KEY = $.floautocompleteKeys,
            $area = $(area);
        $area.suggests = suggests;
        $area.options = options;

        var del = "\n,.";
        var delDet = "-1";
        /* Internal method: get the chunk of text before the cursor */
        $area.getChunk = function () {
            var delimiters = del.split(','),  //this.options.delimiters.split(''), // array of chars
                textBeforeCursor = this.val().substr(0, this.getSelection().start),
                indexOfDelimiter = -1,
                i,
                d,
                idx;
            
            for (i = 0; i < delimiters.length; i++) {
                d = delimiters[i];
                //d = '\n';
                idx = textBeforeCursor.lastIndexOf(d);
                if (idx > indexOfDelimiter) {
                    indexOfDelimiter = idx;
                    delDet = d;
                }
            }
            
            if (indexOfDelimiter < 0) {
                return textBeforeCursor;
            } else {
                if (delDet == '\n')
                return textBeforeCursor.substr(indexOfDelimiter + 1);
                else
                    return textBeforeCursor.substr(indexOfDelimiter + 2);
            }
        };

        /* Internal method: get completion.
         * If performCycle is true then analyze getChunk() and and getSelection()
         */
        $area.getCompletion = function (performCycle) {
            var text = this.getChunk(),
                selectionText = this.getSelection().text,
                suggests = this.suggests,
                foundAlreadySelectedValue = false,
                firstMatchedValue = null,
                i,
                suggest;
            // search the variant
            var suggestCase = "";
            for (i = 0; i < suggests.length; i++) {
                suggest = suggests[i];
                if ($area.options.ignoreCase) {
                    suggestCase = suggest;
                    suggest = suggest.toLowerCase();
                    text = text.toLowerCase();
                }
                // some variant is found
                if (suggest.indexOf(text) === 0) {
                   
                    if (performCycle) {
                        if (text + selectionText === suggest) {
                            foundAlreadySelectedValue = true;
                        } else if (foundAlreadySelectedValue) {
                            return suggestCase.substr(text.length);
                        } else if (firstMatchedValue === null) {
                            firstMatchedValue = suggestCase;
                        }
                    } else {
                        return suggestCase.substr(text.length);
                    }
                }
            }
            if (performCycle && firstMatchedValue) {
                return firstMatchedValue.substr(text.length);
            } else {
                return null;
            }
        };

        $area.updateSelection = function (completion) {
            if (completion) {
                var _selectionStart = $area.getSelection().start,
                    _selectionEnd = _selectionStart + completion.length;
                if ($area.getSelection().text === "") {
                    if ($area.val().length === _selectionStart) { // Weird IE workaround, I really have no idea why it works
                        $area.setCaretPos(_selectionStart + 10000);
                    }
                    $area.insertAtCaretPos(completion);
                } else {
                    $area.replaceSelection(completion);
                }
                $area.setSelection(_selectionStart, _selectionEnd);
            }
        };

        $area.unbind('keydown.floautocomplete').bind('keydown.floautocomplete', function (e) {
            if (e.keyCode === KEY.TAB) {
                if ($area.options.cycleOnTab) {
                    var chunk = $area.getChunk();
                    if (chunk.length >= $area.options.minChunkSize) {
                        $area.updateSelection($area.getCompletion(true));
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    $area.focus();
                    $.floautocompleteFocused = this;
                    return false;
                }
            }
            // Check for conditions to stop suggestion
            //console.log("length :" + $area.getSelection().length);
            //console.log("InArray :" + $.inArray(e.keyCode, $area.options.stopSuggestionKeys));
            if ($area.getSelection().length &&
                    $.inArray(e.keyCode, $area.options.stopSuggestionKeys) !== -1) {
                // apply suggestion. Clean up selection and insert a space
                var _selectionEnd = $area.getSelection().end +
                        $area.options.endingSymbols.length;
                var _text = $area.getSelection().text +
                        $area.options.endingSymbols;
                $area.replaceSelection(_text);
                $area.setSelection(_selectionEnd, _selectionEnd);
                e.preventDefault();
                e.stopPropagation();
                this.focus();
                $.floautocompleteFocused = this;
                return false;
            }
        });

        $area.unbind('keyup.floautocomplete').bind('keyup.floautocomplete', function (e) {
            var hasSpecialKeys = e.altKey || e.metaKey || e.ctrlKey,
                hasSpecialKeysOrShift = hasSpecialKeys || e.shiftKey;
            switch (e.keyCode) {
            case KEY.UNKNOWN: // Special key released
            case KEY.SHIFT:
            case KEY.CTRL:
            case KEY.ALT:
            case KEY.RETURN: // we don't want to suggest when RETURN key has pressed (another IE workaround)
                break;
            case KEY.TAB:
                if (!hasSpecialKeysOrShift && $area.options.cycleOnTab) {
                    break;
                }
            case KEY.ESC:
            case KEY.BACKSPACE:
            case KEY.DEL:
            case KEY.UP:
            case KEY.DOWN:
            case KEY.LEFT:
            case KEY.RIGHT:
                if (!hasSpecialKeysOrShift && $area.options.autoComplete) {
                    $area.replaceSelection("");
                }
                break;
            default:
                if (!hasSpecialKeys && $area.options.autoComplete) {
                    var chunk = $area.getChunk();
                    if (chunk.length >= $area.options.minChunkSize) {
                        $area.updateSelection($area.getCompletion(false));
                    }
                }
                break;
            }
        });
        return $area;
    };
}(jQuery));
