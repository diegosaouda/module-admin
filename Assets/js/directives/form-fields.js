(function () {

	"use strict";

	var	app = angular.module('RbsChange'),
		fieldIdCounter = 0;


	registerFieldDirective('Text', '<input type="text" class="form-control"/>', 'input');
	registerFieldDirective('Email', '<input type="email" class="form-control"/>', 'input');
	registerFieldDirective('Url', '<input type="url" class="form-control"/>', 'input');
	registerFieldDirective('Integer', '<input type="number" class="form-control" ng-pattern="/^\\-?[0-9]+$/"/>', 'input');
	registerFieldDirective('Float', '<input type="text" class="form-control" rbs-smart-float=""/>', 'input');
	registerFieldDirective('Boolean', '<rbs-switch></rbs-switch>', 'rbs-switch');
	registerFieldDirective('RichText', '<rbs-rich-text-input></rbs-rich-text-input>', 'rbs-rich-text-input');
	registerFieldDirective('Picker', '<rbs-document-picker-single></rbs-document-picker-single>', 'rbs-document-picker-single');
	registerFieldDirective('PickerMultiple', '<rbs-document-picker-multiple></rbs-document-picker-multiple>', 'rbs-document-picker-multiple');
	registerFieldDirective('Date', '<rbs-date-selector></rbs-date-selector>', 'rbs-date-selector');
	registerFieldDirective('Price', '<rbs-price-input></rbs-price-input>', 'rbs-price-input');
	registerFieldDirective('Image', '<rbs-uploader rbs-image-uploader="" storage-name="images" file-accept="image/*"></div>', '[rbs-image-uploader]');
	registerFieldDirective('File', '<rbs-uploader rbs-file-uploader="" storage-name="files" file-accept="*"></div>', '[rbs-file-uploader]');
	registerFieldDirective('SelectFromCollection', '<select class="form-control"></select>', 'select');
	registerFieldDirective('Address', '<rbs-address-fields></rbs-address-fields>', 'rbs-address-fields', true);
	registerFieldDirective('ChainedSelect', '<rbs-document-chained-select></rbs-document-chained-select>', 'rbs-document-chained-select');
	registerFieldDirective('DocumentSelect', '<rbs-document-select></rbs-document-select>', 'rbs-document-select');


	/**
	 * Basic Directive to wrap custom fields.
	 *
	 * <code>
	 *     <rbs-field required="true" label="Property label">...</rbs-field>
	 * </code>
	 */
	app.directive('rbsField', function ()
	{
		return {
			restrict   : 'E',
			replace    : true,
			transclude : true,
			template   : fieldTemplate(''),

			compile : function (tElement, tAttrs)
			{
				var $lbl = tElement.find('label').first(),
					fieldId = 'rbs_field_' + (++fieldIdCounter),
					required = (tAttrs.required === 'true');
				$lbl.html(tAttrs.label);
				$lbl.attr('for', fieldId);

				return function link (scope, iElement, iAttrs, controller, transcludeFn)
				{
					transcludeFn(function (clone) {
						iElement.find('.controls').append(clone);
						var $input = iElement.find('.controls [ng-model]').attr('id', fieldId);
						if (required) {
							iElement.addClass('required');
							$input.attr('required', 'required');
						}
					});
				};
			}
		};
	});


	function fieldTemplate (contents, omitLabel)
	{
		if (omitLabel) {
			return '<div class="form-group property"><div class="col-lg-12 controls">' + contents + '</div></div>';
		}
		return '<div class="form-group property">' +
				'<label class="col-lg-3 control-label"></label>' +
				'<div class="col-lg-9 controls">' + contents + '</div>' +
			'</div>';
	}


	function registerFieldDirective (name, tpl, selector, omitLabel)
	{
		app.directive('rbsField' + name, ['RbsChange.Utils', function (Utils)
		{
			return {
				restrict   : 'E',
				replace    : true,
				transclude : true,
				template   : fieldTemplate(tpl + '<div ng-transclude=""></div>', omitLabel),

				compile : function (tElement, tAttrs) {
					rbsFieldCompile(tElement, tAttrs, selector, Utils);
					return function () {};
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
	 */
	function rbsFieldCompile (tElement, tAttrs, inputSelector, Utils)
	{
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
			ngModel = tAttrs.property;
			property = tAttrs.property.substr(p + 1);
		}

		// Bind label and input field (unique 'for' attribute).
		fieldId = 'rbs_field_' + property.replace(/[^a-z0-9]/ig, '_') + '_' + (++fieldIdCounter);
		$lbl.html(tAttrs.label).attr('for', fieldId);
		$ipt.attr('id', fieldId).attr('input-id', fieldId).attr('name', property);

		// Init input field
		$ipt.attr('ng-model', ngModel);

		// Transfer most attributes to the input field
		angular.forEach(tAttrs, function (value, name) {
			if (name === 'required') {
				if (value === 'true' || value === 'required') {
					$ipt.attr('required', 'required');
					tElement.addClass('required');
				}
				tElement.removeAttr(name);
			}
			else if (name === 'inputClass') {
				$ipt.addClass(value);
				tElement.removeAttr(name);
			}
			else if (name === 'label') {
				$ipt.attr('property-label', value);
			}
			else if (shouldTransferAttribute(name)) {
				name = Utils.normalizeAttrName(name);
				$ipt.attr(name, value);
				tElement.removeAttr(name);
			}
		});
	}


	function shouldTransferAttribute (name)
	{
		return name !== 'id'
			&& name !== 'class'
			&& name !== 'property'
			&& name !== 'label'
			&& name !== 'ngHide' && name !== 'dataNgHide'
			&& name !== 'ngShow' && name !== 'dataNgShow'
			&& name !== 'ngIf' && name !== 'dataNgIf'
			&& name !== 'ngSwitchWhen' && name !== 'dataNgSwitchWhen'
			&& name.charAt(0) !== '$';
	}


	/**
	 * Directive that displays a 'label' and 'title' fields for publishable Documents.
	 * The value of these two properties an be synchronized with a 'lock' button.
	 */
	app.directive('rbsFieldLabelTitle', [function ()
	{
		return {
			restrict : 'E',
			replace : true,
			scope : true,
			template : fieldTemplate(
				'<table class="field-label-and-title">' +
				'<tr>' +
					'<td>' +
						'<input type="text" class="form-control" name="label" ng-model="document.label"/>' +
						'<input type="text" class="form-control" name="title" ng-model="document.title" ng-readonly="isSync()"/>' +
					'</td>' +
					'<td valign="middle" class="sync-button-cell">' +
						'<button type="button" class="btn btn-sm" ng-class="{true:\'btn-info\', false:\'btn-default\'}[isSync()]" ng-click="toggleSync()">' +
							'<i ng-class="{true:\'icon-lock\', false:\'icon-unlock-alt\'}[isSync()]" class="icon-large"></i>' +
						'</button>' +
						'<div class="decorator" ng-class="{\'locked\':isSync()}"></div>' +
					'</td>' +
				'</tr>' +
				'</table>'
			),

			compile : function (tElement, tAttrs)
			{
				var $lbl = tElement.find('label').first(),
					fieldId = 'rbs_field_label_title_' + (++fieldIdCounter);
				$lbl.html(tAttrs.label).attr('for', fieldId);
				tElement.find('input').first()
					.attr('id', fieldId)
					.attr('input-id', fieldId)
					.attr('name', 'label');
				if (tAttrs.required === 'true') {
					tElement.find('input').attr('required', 'required');
					tElement.addClass('required');
				}

				return function rbsFieldLabelTitleLink (scope)
				{
					scope.toggleSync = function ()
					{
						var doc = scope.document;
						if (! doc) {
							return;
						}

						doc.META$.labelAndTitleSync = ! doc.META$.labelAndTitleSync;
						// When locking both values, 'label' is copied into 'title' property.
						if (doc.META$.labelAndTitleSync) {
							scope.document.title = scope.document.label;
						}
					};

					// Are 'label' and 'title' synchronized?
					scope.isSync = function ()
					{
						return (scope.document && scope.document.META$ && scope.document.META$.labelAndTitleSync) ? true : false;
					};

					// Wait for the Document to become ready, and determine if the 'label' and 'title' are
					// equal (synchronized). When done, watching the Document becomes useless, so we remove the watch.
					var unwatchDoc = scope.$watchCollection('document', function (doc)
					{
						if (angular.isDefined(doc.id)) {
							doc.META$.labelAndTitleSync = (doc.label === doc.title);
							unwatchDoc();
						}
					});

					// Watch for 'label' changes and copy value into 'title' if sync is ON.
					scope.$watch('document.label', function (label, oldLabel)
					{
						if (scope.isSync() && angular.isDefined(label) && label !== oldLabel) {
							scope.document.title = label;
						}
					});

					// Watch for 'title' changes and copy value into 'label' if sync is ON.
					scope.$watch('document.title', function (title, oldTitle)
					{
						if (scope.isSync() && angular.isDefined(title) && title !== oldTitle) {
							scope.document.label = title;
						}
					});

				};
			}
		};
	}]);

})();
