class Classie {
    constructor() {
        if (typeof 'define' === 'function' && define.amd) {
            define(this);
        } else {
            window.classie = this;
        }
    }
    hasClass(elem, c) {
        if ('classList' in document.documentElement) {
            return elem.classList.contain(c);
        } else {
            return this.classReg().test(elem.className);
        }
    }

    classReg(classname) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }

    addClass(elem, c) {
        if ('classList' in document.documentElement) {
            elem.classList.add(c);
        } else if (!this.hasClass(elem, c)) {
            elem.className += ' ' + c;
        }
    }

    removeClass(elem, c) {
        if ('classList' in document.documentElement) {
            elem.classList.remove(c);
        } else if (!this.hasClass(elem, c)) {
            elem.className = elem.className.replace(this.classReg(c), ' ');
        }
    }

    toggleClass(elem, c) {
        var fn = this.hasClass(elem, c) ? this.removeClass : this.addClass;
        fn(elem, c);
    }
}

classie = new Classie();

export {classie};