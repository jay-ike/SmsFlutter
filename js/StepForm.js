"use strict";

import classie from './Classie';

var $ = function (Selector, parent) {
    return (parent ? parent : document).querySelector(Selector);
};

class StepForm {
    constructor(element, option) {
        this.el = element;
        this.option = option;
        this.current = 0;
        this.questions = [].slice.call($('ol.questions > li', this.el));
        this.questionsCount = this.questions.length;
        classie.addClass(this.questions[0], 'current');
        this.Prev = $('button.prev', this.el);
        this.Next = $('button.next', this.el);
        this.progress = $('div.progress', this.el);
        this.questionStatus = $('span.number', this.el);
        this.currentNum = $('span.number-current', this.questionStatus);
        this.currentNum.innerHTML = new Number(this.current + 1);
        this.totalQuestionNum = $('span.number-total', this.questionStatus);
        this.questionStatus.innerHTML = this.questionsCount;

    }

    initEvents() {
        fileInput = $('input', this.questions[this.current]);
        var onFocusStart = function () {
            fileInput.removeEventListener('focus', onFocusStart);
            classie.addClass(this.Next, 'show');
        }
        fileInput.addEventListener('focus', onFocusStart);

        this.Next.addEventListener('click', e => {
            e.preventDefault();
        });

        this.Prev.addEventListener('click', e => {
            e.preventDefault();
        });

        document.addEventListener('keydown', e => {
            let keyCode = e.keyCode || e.which
            if (keyCode === 13) {
                e.preventDefault();
            } else if (keyCode === 27) {
                e.preventDefault();
            } else if (keyCode === 9) {
                e.preventDefault();
            }
        });
    }
    validation() {
        var cur = this.questions[this.current];
        var inputType;
        if ($('input', cur)) {
            inputType = $('input', cur).getAttribute("type");
        }
        var input = ($('input', cur) ?
            $('input', cur) :
            $('select', cur)
        ).value;
        if (input === "") {
            this._showError("EMPTYSTR");
            return false;
        } else if (inputType === "email") {
            if (
                input
                .trim()
                .match(
                    /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
                ) == null
            ) {
                this._showError("INVALIDEMAIL");
                return false;
            }
        } else if (inputType == "tel") {
            if (input.trim().match(/^(((\+|00)237)?6[0-9]{8})$/) == null) {
                this._showError("INVALIDPHONE");
                return false;
            }
        }

        return true;
    }
}