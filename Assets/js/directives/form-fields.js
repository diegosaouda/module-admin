(function () {

	"use strict";

	var	app = angular.module('RbsChange'),
		fieldIdCounter = 0;


	registerFieldDirective('Text', '<input type="text"/>', 'input');
	registerFieldDirective('Email', '<input type="email"/>', 'input');
	registerFieldDirective('Url', '<input type="url"/>', 'input');
	registerFieldDirective('Integer', '<input type="number" class="input-mini" ng-pattern="/^\\-?[0-9]+$/"/>', 'input');
	registerFieldDirective('Float', '<input type="number" class="input-mini" smart-float=""/>', 'input');
	registerFieldDirective('Boolean', '<switch></switch>', 'switch');
	registerFieldDirective('RichText', '<rbs-rich-text-input></rbs-rich-text-input>', 'rbs-rich-text-input');
	registerFieldDirective('Picker', '<div class="document-picker-single"></div>', '.document-picker-single');
	registerFieldDirective('PickerMultiple', '<div class="document-picker-multiple"></div>', '.document-picker-multiple');
	registerFieldDirective('Date', '<date-selector></date-selector>', 'date-selector');
	registerFieldDirective('Price', '<rbs-price-input></rbs-price-input>', 'rbs-price-input');


	/**
	 * Basic Directive to wrap custom fields.
	 *
	 * <code>
	 *     <rbs-field required="true" label="Property label">...</rbs-field>
	 * </code>
	 */
	app.directive('rbsField', function () {

		return {
			restrict   : 'E',
			replace    : true,
			transclude : true,
			template   : fieldTemplate(''),
			priority   : 1,

			compile : function (tElement, tAttrs, transcludeFn) {
				var $lbl = tElement.find('label').first(),
					fieldId = 'rbs_field_' + (++fieldIdCounter),
					required = (tAttrs.required === 'true');
				$lbl.html(tAttrs.label);
				$lbl.attr('for', fieldId);
				return function link (scope, element) {
					transcludeFn(scope, function (clone) {
						element.find('.controls').append(clone);
						var $input = element.find('.controls [ng-model]').attr('id', fieldId);
						if (required) {
							element.addClass('required');
							$input.attr('required', 'required');
						}
					});
				};
			}
		};

	});


	function fieldTemplate (contents) {
		return '<div class="control-group property">' +
			'<label class="control-label"></label>' +
			'<div class="controls">' + contents + '</div>' +
			'</div>';
	}


	function registerFieldDirective (name, tpl, selector) {
		app.directive('rbsField' + name, ['RbsChange.Utils', function (Utils) {
			return {

				restrict   : 'E',
				replace    : true,
				transclude : true,
				template   : fieldTemplate(tpl + '<div ng-transclude=""></div>'),
				// Should be executed before any other directives eventually defined on the element:
				priority   : 1,

				compile : function (tElement, tAttrs) {
					rbsFieldCompile(tElement, tAttrs, selector, Utils);
				}

			};
		}]);
	}


	/**
	 * Generic compile function for all field Directives.
	 * @param tElement
	 * @param tAttrs
	 * @param inputSelector
	 * @param Utils
	 * @param inputIdSelector
	 */
	function rbsFieldCompile (tElement, tAttrs, inputSelector, Utils) {
		if (! tAttrs.property) {
			throw new Error("Missing 'property' attribute on <rbs-field-*/> directive");
		}

		var $lbl = tElement.find('label').first(),
			$ipt = tElement.find(inputSelector).first(),
			fieldId, property, ngModel, p;

		// Determine property's name and ngModel value.
		if ((p = tAttrs.property.indexOf('.')) === -1) {
			property = tAttrs.property;
			ngModel = 'document.' + property;
		} else {
			property = tAttrs.property.substr(p + 1);
			ngModel = property;
		}

		// Bind label and input field (unique 'for' attribute).
		fieldId = 'rbs_field_' + property.replace(/[^a-z0-9]/ig, '') + '_' + (++fieldIdCounter);
		$lbl.html(tAttrs.label).attr('for', fieldId);
		$ipt.attr('id', fieldId);
		$ipt.attr('input-id', fieldId);

		// CSS class for Correction
		tElement.attr('ng-class', '{\'success\': hasCorrectionOnProperty(\'' + property + '\')}');

		// Init input field
		$ipt.attr('ng-model', ngModel);

		// Copy most attributes to the input field
		angular.forEach(tAttrs, function (value, name) {
			if (name === 'required') {
				$ipt.attr('required', 'required');
				tElement.addClass('required');
			}
			else if (name === 'inputClass') {
				$ipt.addClass(value);
			}
			else if (name !== 'id' && name !== 'class' && name !== 'property' && name !== 'label' && name.charAt(0) !== '$') {
				name = Utils.normalizeAttrName(name);
				$ipt.attr(name, value);
				tElement.removeAttr(name);
			}
		});
	}

})();
