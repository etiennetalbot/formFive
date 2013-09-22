###
# formFive jQuery Plugin
# A plugin for HTML5 Form compatibility
# version 1.1.4, September 22nd, 2013
# by Etienne Talbot
###

jQuery.fn.formFive = (settings) ->
  
  # default config values
  config =
    placeholder:      false             # Set to true to activate the placeholder functionality
    placeholderClass: 'placeholder'     # Name of the desired placeholder class (no . in front of it!)
    autofocus:        false             # Set to true to activate the autofocus functionality
    formaction:       false             # Set to true to activate the formaction functionality
    formenctype:      false             # Set to true to activate the formenctype functionality
    formmethod:       false             # Set to true to activate the formmethod functionality
    formtarget:       false             # Set to true to activate the formtarget functionality
    formAttribute:    false             # Set to true to activate the form attribute on form elements outside the form
  
  jQuery.extend(config, settings) if settings
  
  targetForm =            null
  placeholderTextBoxes =  null
  
  # Initialize the plugin
  init = =>
    targetForm = jQuery this
    
    # initialize the placeholder functionality if unsupported and wanted
    if config.placeholder
      if not isSupported('input', 'placeholder')
        targetForm.off 'submit.formFive', commonSubmitCheckup
        targetForm.on 'submit.formFive', commonSubmitCheckup
        placeholderInit()
      else
        config.placeholder = false
    
    # initialize the autofocus functionality if unsupported and wanted
    if config.autofocus
      if not isSupported('input', 'autofocus')
        autofocusInit()
      else
        config.autofocus = false
    
    # initialize the form functionalities on submit buttons if unsupported and wanted
    formAlternatives = false
    
    if config.formaction
      if not isSupported('input', 'formAction')
        formAlternatives = true
      else
        config.formaction = false
    
    if config.formenctype
      if not isSupported('input', 'formEnctype')
        formAlternatives = true
      else
        config.formenctype = false
    
    if config.formmethod
      if not isSupported('input', 'formMethod')
        formAlternatives = true
      else
        config.formmethod = false
    
    if config.formtarget
      if not isSupported('input', 'formTarget')
        formAlternatives = true
      else
        config.formtarget = false

    # Check if formAttribute is supported
    if config.formAttribute
      if formAttributeIsSupported()
        config.formAttribute = false
      else
        formAttributeSubmitWatch()

    if config.formAttribute or formAlternatives
      targetForm.off 'submit.formFive', commonSubmitCheckup
      targetForm.on 'submit.formFive', commonSubmitCheckup
    
    if formAlternatives
      formAlternativesInit()
    
    return
  
  # Check if the functionality is supported by the browser
  isSupported = (theElement, theAttribute) ->
    testElement = document.createElement theElement
    
    return (theAttribute of testElement)
  
  # Set the caret position
  commonSetCaret = (currentElement, position) ->
    if currentElement[0].createTextRange
      part = currentElement[0].createTextRange()
      part.collapse true
      part.moveEnd 'character', position
      part.moveStart 'character', position
      part.select()
    else if currentElement[0].setSelectionRange
      currentElement[0].setSelectionRange position, position
    
    return

  # Replace a form element (input) with another type attribute (ex: text to password)
  commonReplaceWithType = (currentTextbox, newType, clone) ->
    theValue = currentTextbox.val()
    
    if clone is true
      currentTextbox = currentTextbox.clone()
    
    eThis = currentTextbox.get 0

    oldAttributes = eThis.attributes
    newAttributes = {}

    for oldAttribute in oldAttributes
      newAttributes[oldAttribute.name] = oldAttribute.value if oldAttribute.specified is true
    newAttributes['type'] = newType
    
    newTextbox = jQuery document.createElement 'input'
    
    for x of newAttributes
      newTextbox.attr x, newAttributes[x]
    
    newTextbox.val theValue
    newTextbox.on 'focus.formFive click.formFive keyup.formFive', placeholderCheckFocus
    newTextbox.on 'keyup.formFive', placeholderCheckValues
    
    currentTextbox.replaceWith newTextbox
    
    return newTextbox
  
  # Before submitting, check if placeholders are still there
  commonPresubmitCheckup = ->
    if config.placeholder
      placeholderCleanFields()

    if config.formAttribute
      formAttributeCloning()

    return true
  
  # Before submitting, check if placeholders are still there
  commonSubmitCheckup = (e) ->
    targetForm.off 'submit.formFive', commonSubmitCheckup
    e.preventDefault()
    if commonPresubmitCheckup()
      targetForm.trigger 'submit'
    
    return
  
  # Initialize the placeholder handling
  placeholderInit = ->
    placeholderTextBoxes = targetForm.find '*[placeholder]'
    
    placeholderTextBoxes.on 'focus.formFive click.formFive keyup.formFive keydown.formFive keypress.formFive', placeholderCheckFocus
    placeholderTextBoxes.on 'keyup.formFive textinput.formFive', placeholderCheckValues
    
    placeholderSetValues()
    
    return
  
  # When an element is focused, perform placeholder check for the caret
  placeholderCheckFocus = ->
    currentElement = jQuery this
    
    if currentElement.hasClass config.placeholderClass
      commonSetCaret currentElement, 0
    
    return
  
  # Add or remove placeholder classes depending on the current value
  placeholderCheckValues = ->
    currentElement    = jQuery this
    currentElementMax = currentElement.attr 'data-ffmaxlength'

    if currentElement.val() is ''
      currentElement.addClass config.placeholderClass
      currentElement.val currentElement.attr 'placeholder'
      if currentElementMax?
        currentElement.attr 'maxlength', ''
      if currentElement.attr('type') is 'password'
        currentElement = commonReplaceWithType currentElement, 'text', false
        currentElement.focus()
      commonSetCaret currentElement, 0
    else
      if currentElement.hasClass(config.placeholderClass) && currentElement.val() isnt currentElement.attr 'placeholder'
        currentElement.removeClass config.placeholderClass
        if currentElementMax?
          currentElement.attr 'maxlength', currentElementMax
        if currentElement.hasClass 'formFivePlaceholder'
          currentElement = commonReplaceWithType currentElement, 'password', false
          commonSetCaret currentElement, 99999
          currentElement.focus()
        if currentElement.index currentElement.attr 'placeholder'
          currentElement.val currentElement.val().replace currentElement.attr('placeholder'), ''
    
    return
  
  # Set the value attribute accordingly with the placeholder attribute
  placeholderSetValues = ->
    for placeHolderTextBox, i in placeholderTextBoxes
      currentTextbox    = placeholderTextBoxes.eq i
      currentTextboxMax = currentTextbox.attr 'maxlength'

      if currentTextbox.val() is '' or currentTextbox.val() is currentTextbox.attr 'placeholder'
        currentTextbox.val currentTextbox.attr 'placeholder'
        currentTextbox.addClass config.placeholderClass

        if currentTextboxMax?
          currentTextbox.attr 'data-ffmaxlength', currentTextboxMax
          currentTextbox.attr 'maxlength', ''
        
        if currentTextbox.attr('type') is 'password'
          currentTextbox.addClass 'formFivePlaceholder'
          currentTextbox = commonReplaceWithType currentTextbox, 'text', false
    
    return

  # Remove the values in the placeholder fields if these values are the same as the placeholder
  placeholderCleanFields = ->
    placeholderTextBoxes = targetForm.find '*[placeholder]'
    placeholderTextBoxes.off()
    for placeholderTextBox, i in placeholderTextBoxes
      currentTextbox = placeholderTextBoxes.eq i
      
      if currentTextbox.val() is currentTextbox.attr 'placeholder'
        currentTextbox.val ''
        currentTextbox.removeClass config.placeholderClass

    return
  
  # If autofocus found, put caret there
  autofocusInit = ->
    autofocusElement = targetForm.find '*[autofocus]'
    commonSetCaret autofocusElement.eq(0), 0
    
    return
  
  # Initialize form alternatives click binding
  formAlternativesInit = ->
    if config.formaction
      formactionElements = targetForm.find '*[formaction]'
      for formactionElement, i in formactionElements
        formactionElements.eq(i).on 'click.formFive', formAlternativesChangeAttribute
    if config.formenctype
      formenctypeElements = targetForm.find '*[formenctype]'
      for formenctypeElement, j in formenctypeElements
        formenctypeElements.eq(j).off 'click.formFive'
        formenctypeElements.eq(j).on 'click.formFive', formAlternativesChangeAttribute
    if config.formmethod
      formmethodElements = targetForm.find '*[formmethod]'
      for formmethodElement, k in formmethodElements
        formmethodElements.eq(k).off 'click.formFive'
        formmethodElements.eq(k).on 'click.formFive', formAlternativesChangeAttribute
    if config.formtarget
      formtargetElements = targetForm.find '*[formtarget]'
      for formtargetElement, l in formtargetElements
        formtargetElements.eq(l).off 'click.formFive'
        formtargetElements.eq(l).on 'click.formFive', formAlternativesChangeAttribute
    
    return
  
  # Change the attributes of the form right before submitting it
  formAlternativesChangeAttribute = (e) ->
    targetForm.off 'submit.formFive', commonSubmitCheckup
    e.preventDefault()
    
    clickedButton = jQuery this
    
    if clickedButton.attr('formaction') isnt '' and config.formaction
      targetForm.attr 'action', clickedButton.attr 'formaction'
    
    if clickedButton.attr('formenctype') isnt '' and config.formenctype
      targetForm.attr 'enctype', clickedButton.attr 'formenctype'
    
    if clickedButton.attr('formmethod') isnt '' and config.formmethod
      targetForm.attr 'method', clickedButton.attr 'formmethod'
    
    if clickedButton.attr('formtarget') isnt '' and config.formtarget
      targetForm.attr 'target', clickedButton.attr 'formtarget'
    
    if commonPresubmitCheckup()
      targetForm.trigger 'submit'
    
    return
  
  # Check if the form attribute is supported
  formAttributeIsSupported = ->
    testInput =  document.createElement 'input'
    $testInput = jQuery testInput
    jQuery('body').append testInput
    $testInput.attr 'form', targetForm.attr('id')

    # If the form attribute is used as HTML5 uses it, it will be an object
    if typeof testInput.form == 'object' and testInput.form != null
      theResult = true
    else
      theResult = false

    $testInput.remove()
    theResult


  # Clone form elements with the right form attribute value that are outside the form... inside the form
  formAttributeCloning = ->
    elementsWithForm = jQuery '*[form]'

    for elementWithForm in elementsWithForm
      elementWithForm =       jQuery elementWithForm
      elementWithFormTarget = elementWithForm.attr 'form'
      formId =                targetForm.attr 'id'
      if not jQuery.contains(targetForm[0], elementWithForm[0]) and elementWithFormTarget is formId
        clonedElement = commonReplaceWithType jQuery(elementWithForm), 'hidden', true

        targetForm.append clonedElement

    return

  # Check if submit buttons with the form attribute are used outside the form
  formAttributeSubmitWatch = ->
    formId =     targetForm.attr 'id'
    formSubmit = jQuery('*[type="submit"][form="'+formId+'"]')
    
    formSubmit.on 'click.formFive', ->
      if !jQuery(this).is(':disabled')
        targetForm.submit()

    return


  init()
  
  this