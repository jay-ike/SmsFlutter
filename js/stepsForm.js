/**
 * stepsForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */

/**
 * modified by jay ike for implementing the prev button
 * to go backwards
 *
 */

(function (window) {
  "use strict";

  var transEndEventNames = {
      WebkitTransition: "webkitTransitionEnd",
      MozTransition: "transitionend",
      OTransition: "oTransitionEnd",
      msTransition: "MSTransitionEnd",
      transition: "transitionend"
    },
    transEndEventName = transEndEventNames[Modernizr.prefixed("transition")],
    support = {
      transitions: Modernizr.csstransitions
    };

  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  function stepsForm(el, options) {
    this.el = el;
    this.options = extend({}, this.options);
    extend(this.options, options);
    this._init();
  }

  stepsForm.prototype.options = {
    onSubmit: function () {
      return false;
    }
  };

  stepsForm.prototype._init = function () {
    // current question
    this.current = 0;

    // questions
    this.questions = $("ol.questions").children;
    // total questions
    this.questionsCount = this.questions.length;
    // show first question
    classie.addClass(this.questions[0], "current");

    //prev question control
    this.ctrlPrev = $("button.prev", this.el);

    // next question control
    this.ctrlNext = $("button.next", this.el);

    // progress bar
    this.progress = $("div.progress", this.el);

    // question number status
    this.questionStatus = $("span.number", this.el);
    // current question placeholder
    this.currentNum = $("span.number-current", this.questionStatus);
    this.currentNum.innerHTML = Number(this.current + 1);
    // total questions placeholder
    this.totalQuestionNum = this.questionStatus.querySelector(
      "span.number-total"
    );
    this.totalQuestionNum.innerHTML = this.questionsCount;

    // error message
    this.error = $("span.error-message", this.el);

    // init events
    this._initEvents();
  };

  stepsForm.prototype._initEvents = function () {
    var self = this,
      // first input
      firstElInput = $("input", this.questions[this.current]),
      // focus
      onFocusStartFn = function () {
        firstElInput.removeEventListener("focus", onFocusStartFn);
        classie.addClass(self.ctrlNext, "show");
      };

    // show the next question control first time the input gets focused
    firstElInput.addEventListener("focus", onFocusStartFn);

    //show the previous question
    this.ctrlPrev.addEventListener("click", function (ev) {
      ev.preventDefault();
      self._prevQuestion();
    });
    // show next question
    this.ctrlNext.addEventListener("click", function (ev) {
      ev.preventDefault();
      self._nextQuestion();
    });

    // pressing enter will jump to next question
    document.addEventListener("keydown", function (ev) {
      var keyCode = ev.keyCode || ev.which;
      // enter
      if (keyCode === 13) {
        ev.preventDefault();
        self._nextQuestion();
      } else if (keyCode === 27) {
        ev.preventDefault();
        self._prevQuestion();
      }
    });

    // disable tab
    this.el.addEventListener("keydown", function (ev) {
      var keyCode = ev.keyCode || ev.which;
      // tab
      if (keyCode === 9) {
        ev.preventDefault();
      }
    });
  };

  stepsForm.prototype._nextQuestion = function () {
    if (!this._validade()) {
      return false;
    }

    // check if form is filled
    if (this.current === this.questionsCount - 1) {
      this.isFilled = true;
    }

    // make the prev button appear
    classie.addClass(this.ctrlPrev, "show");
    // clear any previous error messages
    this._clearError();

    // current question
    var currentQuestion = this.questions[this.current];

    // increment current question iterator
    ++this.current;

    // update progress bar
    this._progress();

    if (!this.isFilled) {
      // change the current question number/status
      this._updateQuestionNumber();

      // add class "show-next" to form element (start animations)
      classie.addClass(this.el, "show-next");

      // remove class "current" from current question and add it to the next one
      // current question
      var nextQuestion = this.questions[this.current];
      classie.removeClass(currentQuestion, "current");
      classie.addClass(nextQuestion, "current");
      var input = $('input', nextQuestion);
      if (input) {
        if (input.type == 'email' && input.value == '')
          input.value = 'clubinfo@gmail.com';
      }
    }

    // after animation ends, remove class "show-next" from form element and change current question placeholder
    var self = this,
      onEndTransitionFn = function (ev) {
        if (support.transitions) {
          this.removeEventListener(transEndEventName, onEndTransitionFn);
        }
        if (self.isFilled) {
          self._submit();
        } else {
          classie.removeClass(self.el, "show-next");
          self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
          self.questionStatus.removeChild($('span.number-next', self.questionStatus));

          // force the focus on the next input
          ($("input", nextQuestion) ? $("input", nextQuestion) :
            $("select", nextQuestion)
          ).focus();
          if (nextQuestion) {
            let v = ($("input", nextQuestion) ? $('input', nextQuestion) : $('select', nextQuestion));
            if (v.getAttribute("id") == "q4")
              génerer().then(val => {
                $("input", nextQuestion).value = val;
              });
          }
        }
      };

    if (support.transitions) {
      this.progress.addEventListener(transEndEventName, onEndTransitionFn);
    } else {
      onEndTransitionFn();
    }
  };

  stepsForm.prototype._prevQuestion = function () {
    // clear any previous error messages
    this._clearError();

    // current question
    var currentQuestion = this.questions[this.current];

    // increment current question iterator
    if (this.current > 0) {
      --this.current;
      this._progress();
      this._updateQuestionNumber();

      // add class "show-next" to form element (start animations)
      classie.addClass(this.el, "show-prev");

      // remove class "current" from current question and add it to the next one
      // current question
      var nextQuestion = this.questions[this.current];
      classie.removeClass(currentQuestion, "current");
      classie.addClass(nextQuestion, "current");
      var self = this,
        onEndTransitionFn = function (ev) {
          if (support.transitions) {
            this.removeEventListener(transEndEventName, onEndTransitionFn);
          }
          if (self.isFilled) {
            self._submit();
          } else {
            classie.removeClass(self.el, "show-prev");
            self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
            self.questionStatus.removeChild($('span.number-next', self.questionStatus));
            // force the focus on the next input
            nextQuestion.querySelector("input").focus();
          }
        };

      if (support.transitions) {
        this.progress.addEventListener(transEndEventName, onEndTransitionFn);
      } else {
        onEndTransitionFn();
      }
    } else if (this.current == 0) {
      classie.removeClass(this.ctrlPrev, "show");
    }
  };

  // updates the progress bar by setting its width
  stepsForm.prototype._progress = function () {
    this.progress.style.width =
      this.current * (100 / this.questionsCount) + "%";
  };

  // changes the current question number
  stepsForm.prototype._updateQuestionNumber = function () {
    // first, create next question number placeholder
    this.nextQuestionNum = document.createElement("span");
    this.nextQuestionNum.className = "number-next";
    this.nextQuestionNum.innerHTML = Number(this.current + 1);
    // insert it in the DOM
    this.questionStatus.appendChild(this.nextQuestionNum);
  };
  // submits the form
  stepsForm.prototype._submit = function () {
    this.options.onSubmit(this.el);
  };

  // TODO (next version..)
  // the validation function
  stepsForm.prototype._validade = function () {
    // current question´s input
    var cur = this.questions[this.current];
    var inputType;
    if (cur.querySelector("input")) {
      inputType = cur.querySelector("input").getAttribute("type");
    }
    var input = ($("input", cur) ? $("input", cur) :
      $("select", cur)
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
      if (input.trim().match(/^(((\+|00)237)?6[5-9][0-9]{7})$/) == null) {
        this._showError("INVALIDPHONE");
        return false;
      }
    }

    return true;
  };

  // TODO (next version..)
  stepsForm.prototype._showError = function (err) {
    var message = "";
    switch (err) {
      case "EMPTYSTR":
        message = "Veuillez remplir le champ correspondant avant de continuer";
        break;
      case "INVALIDEMAIL":
        message = "Veuillez entrer une addresse e-mail valide";
        break;
      case "INVALIDPHONE":
        message = "Veuillez entrer un numéro valide";
        // ...
    }
    this.error.innerHTML = message;
    classie.addClass(this.error, "show");
  };

  // clears/hides the current error message
  stepsForm.prototype._clearError = function () {
    classie.removeClass(this.error, "show");
  };

  // add to global namespace
  window.stepsForm = stepsForm;
})(window);

var db = new Dexie("Etudiants");

db.version(1).stores({
  etudiant: "++_id,nom,prenom,ident,tel,whatsapp,filière",
});
db.open();

var $ = function (Selector, parent) {
  return (parent ? parent : document).querySelector(Selector);
};
var enreg = $("#enreg");
enreg.addEventListener("click", (e) => {
  e.preventDefault();
  db.transaction("rw", db.etudiant, () => {
      db.etudiant.add({
        nom: $("#nom").value,
        prenom: $("#prenom").value,
        ident: $("#id").value,
        tel: $("#teléphone").value,
        whatsapp: $("#whatsapp").value,
        filière: $("#filière").value,

      });
    })
    .then(
      db.transaction("rw", db.filière, () => {
        db.filière.add({
          nom: $("#q7").value
        });
      })
    )
    .catch(e => {
      console.log("Erreur lors de l'insertion");
    });
  window.location.reload();
});

async function génerer() {
  let a;
  await db.etudiant.orderBy('_id').last(e => {
    a = e ? e._id : 0;
  });
  d = new Date();
  return "CIUD" + d.getFullYear().toFixed().substr(2, 2) + (a + 1);
}

function createVisualizeField(inputSource, target) {
  //inputSource has to be an input tag
  let container = document.createElement("div");
  classie.addClass(container, "field-container");
  let wrapper = document.createElement("div");
  classie.addClass(wrapper, "input-wrapper");
  let editor = document.createElement("i");
  classie.addClass(editor, "field-unlocker");
  classie.addClass(editor, 'icon-lock-closed');
  classie.addClass(editor, "locked");
  container.append(editor, wrapper);
  let label = document.createElement("label");
  let input = inputSource.cloneNode(true);
  input.setAttribute('id', input.name);
  label.setAttribute("for", input.name);
  label.innerText = input.name;
  wrapper.append(label, input);
  if (input.tagName == 'INPUT')
    input.readOnly = true;
  else if (input.tagName == 'SELECT')
    input.disabled = true;
  input.onblur = e => {
    if (input.tagName == 'INPUT')
      input.readOnly = true;
    else if (input.tagName == 'SELECT')
      input.disabled = true;
    classie.addClass(editor, "locked");
    classie.removeClass(editor, 'icon-lock-open');
    classie.addClass(editor, 'icon-lock-closed');
    input.style.background = 'transparent';
  };

  classie.addClass(editor, "locked");

  editor.onclick = (e) => {
    e.preventDefault();
    classie.toggle(editor, "locked");
    classie.removeClass(editor, 'icon-lock-closed');
    classie.addClass(editor, 'icon-lock-open');

    if (input.tagName == 'INPUT') {
      input.readOnly = false;
    } else if (input.tagName == 'SELECT') {
      input.disabled = false;
    }
    input.focus();
    input.style.background = 'bisque';
  };

  classie.addClass(input, "visualize-field");
  target.appendChild(container);
}