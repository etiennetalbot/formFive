formFive
========

CoffeeScript plugin giving some of the HTML5 Form functionalities to older browsers

Requirements
------------

This plugin requires jQuery

Information
-----------
This plugin allows you to use the following attributes on legacy browsers:

- `placeholder`
- `autofocus`
- `formaction`
- `formenctype`
- `formmethod`
- `formtarget`

Apply the plugin directly on a `<form>` tag with the desired parameters and formFive will take care of the rest.


Parameters
----------

### placeholder
*(boolean) default: false* - Wether or not you wish to use the placeholder attribute on your form elements

### placeholderClass
*(string) default: 'placeholder'* - The class that will be automatically added to your elements with a `placeholder` attribute when no value has been given yet (to simulate the placeholder)

### autofocus
*(boolean) default: false* - Wether or not you wish to use the `autofocus` attribute on your form elements

### formaction
*(boolean) default: false* - Wether or not you wish to use the `formaction` attribute on your form elements

### formenctype
*(boolean) default: false* - Wether or not you wish to use the `formenctype` attribute on your form elements

### formmethod
*(boolean) default: false* - Wether or not you wish to use the `formmethod` attribute on your form elements

### formtarget
*(boolean) default: false* - Wether or not you wish to use the `formtarget` attribute on your form elements

Usage
-----
### JavaScript
	$('.form-class').formFive({
      placeholder: true,
      placeholderClass: 'phclass',
      autofocus: true,
      formaction: true,
      formenctype: true,
      formmethod: true,
      formtarget: true
	});

### CoffeeScript
	$('.form-class').formFive
      placeholder: true
      placeholderClass: 'phclass'
      autofocus: true
      formaction: true
      formenctype: true
      formmethod: true
      formtarget: true