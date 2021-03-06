/*
# formFive jQuery Plugin
# A plugin for HTML5 Form compatibility
# version 1.1.4, September 22nd, 2013
# by Etienne Talbot
*/


(function() {

  jQuery.fn.formFive = function(settings) {
    var autofocusInit, commonPresubmitCheckup, commonReplaceWithType, commonSetCaret, commonSubmitCheckup, config, formAlternativesChangeAttribute, formAlternativesInit, formAttributeCloning, formAttributeIsSupported, formAttributeSubmitWatch, init, isSupported, placeholderCheckFocus, placeholderCheckValues, placeholderCleanFields, placeholderInit, placeholderSetValues, placeholderTextBoxes, targetForm,
      _this = this;
    config = {
      placeholder: false,
      placeholderClass: 'placeholder',
      autofocus: false,
      formaction: false,
      formenctype: false,
      formmethod: false,
      formtarget: false,
      formAttribute: false
    };
    if (settings) {
      jQuery.extend(config, settings);
    }
    targetForm = null;
    placeholderTextBoxes = null;
    init = function() {
      var formAlternatives;
      targetForm = jQuery(_this);
      if (config.placeholder) {
        if (!isSupported('input', 'placeholder')) {
          targetForm.off('submit.formFive', commonSubmitCheckup);
          targetForm.on('submit.formFive', commonSubmitCheckup);
          placeholderInit();
        } else {
          config.placeholder = false;
        }
      }
      if (config.autofocus) {
        if (!isSupported('input', 'autofocus')) {
          autofocusInit();
        } else {
          config.autofocus = false;
        }
      }
      formAlternatives = false;
      if (config.formaction) {
        if (!isSupported('input', 'formAction')) {
          formAlternatives = true;
        } else {
          config.formaction = false;
        }
      }
      if (config.formenctype) {
        if (!isSupported('input', 'formEnctype')) {
          formAlternatives = true;
        } else {
          config.formenctype = false;
        }
      }
      if (config.formmethod) {
        if (!isSupported('input', 'formMethod')) {
          formAlternatives = true;
        } else {
          config.formmethod = false;
        }
      }
      if (config.formtarget) {
        if (!isSupported('input', 'formTarget')) {
          formAlternatives = true;
        } else {
          config.formtarget = false;
        }
      }
      if (config.formAttribute) {
        if (formAttributeIsSupported()) {
          config.formAttribute = false;
        } else {
          formAttributeSubmitWatch();
        }
      }
      if (config.formAttribute || formAlternatives) {
        targetForm.off('submit.formFive', commonSubmitCheckup);
        targetForm.on('submit.formFive', commonSubmitCheckup);
      }
      if (formAlternatives) {
        formAlternativesInit();
      }
    };
    isSupported = function(theElement, theAttribute) {
      var testElement;
      testElement = document.createElement(theElement);
      return theAttribute in testElement;
    };
    commonSetCaret = function(currentElement, position) {
      var part;
      if (currentElement[0].createTextRange) {
        part = currentElement[0].createTextRange();
        part.collapse(true);
        part.moveEnd('character', position);
        part.moveStart('character', position);
        part.select();
      } else if (currentElement[0].setSelectionRange) {
        currentElement[0].setSelectionRange(position, position);
      }
    };
    commonReplaceWithType = function(currentTextbox, newType, clone) {
      var eThis, newAttributes, newTextbox, oldAttribute, oldAttributes, theValue, x, _i, _len;
      theValue = currentTextbox.val();
      if (clone === true) {
        currentTextbox = currentTextbox.clone();
      }
      eThis = currentTextbox.get(0);
      oldAttributes = eThis.attributes;
      newAttributes = {};
      for (_i = 0, _len = oldAttributes.length; _i < _len; _i++) {
        oldAttribute = oldAttributes[_i];
        if (oldAttribute.specified === true) {
          newAttributes[oldAttribute.name] = oldAttribute.value;
        }
      }
      newAttributes['type'] = newType;
      newTextbox = jQuery(document.createElement('input'));
      for (x in newAttributes) {
        newTextbox.attr(x, newAttributes[x]);
      }
      newTextbox.val(theValue);
      newTextbox.on('focus.formFive click.formFive keyup.formFive', placeholderCheckFocus);
      newTextbox.on('keyup.formFive', placeholderCheckValues);
      currentTextbox.replaceWith(newTextbox);
      return newTextbox;
    };
    commonPresubmitCheckup = function() {
      if (config.placeholder) {
        placeholderCleanFields();
      }
      if (config.formAttribute) {
        formAttributeCloning();
      }
      return true;
    };
    commonSubmitCheckup = function(e) {
      targetForm.off('submit.formFive', commonSubmitCheckup);
      e.preventDefault();
      if (commonPresubmitCheckup()) {
        targetForm.trigger('submit');
      }
    };
    placeholderInit = function() {
      placeholderTextBoxes = targetForm.find('*[placeholder]');
      placeholderTextBoxes.on('focus.formFive click.formFive keyup.formFive keydown.formFive keypress.formFive', placeholderCheckFocus);
      placeholderTextBoxes.on('keyup.formFive textinput.formFive', placeholderCheckValues);
      placeholderSetValues();
    };
    placeholderCheckFocus = function() {
      var currentElement;
      currentElement = jQuery(this);
      if (currentElement.hasClass(config.placeholderClass)) {
        commonSetCaret(currentElement, 0);
      }
    };
    placeholderCheckValues = function() {
      var currentElement, currentElementMax;
      currentElement = jQuery(this);
      currentElementMax = currentElement.attr('data-ffmaxlength');
      if (currentElement.val() === '') {
        currentElement.addClass(config.placeholderClass);
        currentElement.val(currentElement.attr('placeholder'));
        if (currentElementMax != null) {
          currentElement.attr('maxlength', '');
        }
        if (currentElement.attr('type') === 'password') {
          currentElement = commonReplaceWithType(currentElement, 'text', false);
          currentElement.focus();
        }
        commonSetCaret(currentElement, 0);
      } else {
        if (currentElement.hasClass(config.placeholderClass) && currentElement.val() !== currentElement.attr('placeholder')) {
          currentElement.removeClass(config.placeholderClass);
          if (currentElementMax != null) {
            currentElement.attr('maxlength', currentElementMax);
          }
          if (currentElement.hasClass('formFivePlaceholder')) {
            currentElement = commonReplaceWithType(currentElement, 'password', false);
            commonSetCaret(currentElement, 99999);
            currentElement.focus();
          }
          if (currentElement.index(currentElement.attr('placeholder'))) {
            currentElement.val(currentElement.val().replace(currentElement.attr('placeholder'), ''));
          }
        }
      }
    };
    placeholderSetValues = function() {
      var currentTextbox, currentTextboxMax, i, placeHolderTextBox, _i, _len;
      for (i = _i = 0, _len = placeholderTextBoxes.length; _i < _len; i = ++_i) {
        placeHolderTextBox = placeholderTextBoxes[i];
        currentTextbox = placeholderTextBoxes.eq(i);
        currentTextboxMax = currentTextbox.attr('maxlength');
        if (currentTextbox.val() === '' || currentTextbox.val() === currentTextbox.attr('placeholder')) {
          currentTextbox.val(currentTextbox.attr('placeholder'));
          currentTextbox.addClass(config.placeholderClass);
          if (currentTextboxMax != null) {
            currentTextbox.attr('data-ffmaxlength', currentTextboxMax);
            currentTextbox.attr('maxlength', '');
          }
          if (currentTextbox.attr('type') === 'password') {
            currentTextbox.addClass('formFivePlaceholder');
            currentTextbox = commonReplaceWithType(currentTextbox, 'text', false);
          }
        }
      }
    };
    placeholderCleanFields = function() {
      var currentTextbox, i, placeholderTextBox, _i, _len;
      placeholderTextBoxes = targetForm.find('*[placeholder]');
      placeholderTextBoxes.off();
      for (i = _i = 0, _len = placeholderTextBoxes.length; _i < _len; i = ++_i) {
        placeholderTextBox = placeholderTextBoxes[i];
        currentTextbox = placeholderTextBoxes.eq(i);
        if (currentTextbox.val() === currentTextbox.attr('placeholder')) {
          currentTextbox.val('');
          currentTextbox.removeClass(config.placeholderClass);
        }
      }
    };
    autofocusInit = function() {
      var autofocusElement;
      autofocusElement = targetForm.find('*[autofocus]');
      commonSetCaret(autofocusElement.eq(0), 0);
    };
    formAlternativesInit = function() {
      var formactionElement, formactionElements, formenctypeElement, formenctypeElements, formmethodElement, formmethodElements, formtargetElement, formtargetElements, i, j, k, l, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      if (config.formaction) {
        formactionElements = targetForm.find('*[formaction]');
        for (i = _i = 0, _len = formactionElements.length; _i < _len; i = ++_i) {
          formactionElement = formactionElements[i];
          formactionElements.eq(i).on('click.formFive', formAlternativesChangeAttribute);
        }
      }
      if (config.formenctype) {
        formenctypeElements = targetForm.find('*[formenctype]');
        for (j = _j = 0, _len1 = formenctypeElements.length; _j < _len1; j = ++_j) {
          formenctypeElement = formenctypeElements[j];
          formenctypeElements.eq(j).off('click.formFive');
          formenctypeElements.eq(j).on('click.formFive', formAlternativesChangeAttribute);
        }
      }
      if (config.formmethod) {
        formmethodElements = targetForm.find('*[formmethod]');
        for (k = _k = 0, _len2 = formmethodElements.length; _k < _len2; k = ++_k) {
          formmethodElement = formmethodElements[k];
          formmethodElements.eq(k).off('click.formFive');
          formmethodElements.eq(k).on('click.formFive', formAlternativesChangeAttribute);
        }
      }
      if (config.formtarget) {
        formtargetElements = targetForm.find('*[formtarget]');
        for (l = _l = 0, _len3 = formtargetElements.length; _l < _len3; l = ++_l) {
          formtargetElement = formtargetElements[l];
          formtargetElements.eq(l).off('click.formFive');
          formtargetElements.eq(l).on('click.formFive', formAlternativesChangeAttribute);
        }
      }
    };
    formAlternativesChangeAttribute = function(e) {
      var clickedButton;
      targetForm.off('submit.formFive', commonSubmitCheckup);
      e.preventDefault();
      clickedButton = jQuery(this);
      if (clickedButton.attr('formaction') !== '' && config.formaction) {
        targetForm.attr('action', clickedButton.attr('formaction'));
      }
      if (clickedButton.attr('formenctype') !== '' && config.formenctype) {
        targetForm.attr('enctype', clickedButton.attr('formenctype'));
      }
      if (clickedButton.attr('formmethod') !== '' && config.formmethod) {
        targetForm.attr('method', clickedButton.attr('formmethod'));
      }
      if (clickedButton.attr('formtarget') !== '' && config.formtarget) {
        targetForm.attr('target', clickedButton.attr('formtarget'));
      }
      if (commonPresubmitCheckup()) {
        targetForm.trigger('submit');
      }
    };
    formAttributeIsSupported = function() {
      var $testInput, testInput, theResult;
      testInput = document.createElement('input');
      $testInput = jQuery(testInput);
      jQuery('body').append(testInput);
      $testInput.attr('form', targetForm.attr('id'));
      if (typeof testInput.form === 'object' && testInput.form !== null) {
        theResult = true;
      } else {
        theResult = false;
      }
      $testInput.remove();
      return theResult;
    };
    formAttributeCloning = function() {
      var clonedElement, elementWithForm, elementWithFormTarget, elementsWithForm, formId, _i, _len;
      elementsWithForm = jQuery('*[form]');
      for (_i = 0, _len = elementsWithForm.length; _i < _len; _i++) {
        elementWithForm = elementsWithForm[_i];
        elementWithForm = jQuery(elementWithForm);
        elementWithFormTarget = elementWithForm.attr('form');
        formId = targetForm.attr('id');
        if (!jQuery.contains(targetForm[0], elementWithForm[0]) && elementWithFormTarget === formId) {
          clonedElement = commonReplaceWithType(jQuery(elementWithForm), 'hidden', true);
          targetForm.append(clonedElement);
        }
      }
    };
    formAttributeSubmitWatch = function() {
      var formId, formSubmit;
      formId = targetForm.attr('id');
      formSubmit = jQuery('*[type="submit"][form="' + formId + '"]');
      formSubmit.on('click.formFive', function() {
        if (!jQuery(this).is(':disabled')) {
          return targetForm.submit();
        }
      });
    };
    init();
    return this;
  };

}).call(this);
