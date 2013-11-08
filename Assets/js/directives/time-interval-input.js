(function () {

	"use strict";

	var	app = angular.module('RbsChange');

	/**
	 * TODO: this directive is only use for notification time interval (on user admin profile).
	 * refactor this directive to use it with anything need time-interval-input
	 */
	app.directive('rbsTimeIntervalInput', ['RbsChange.i18n', function (i18n) {

		return {
			restrict   : 'E',
			scope      : true,
			require    : 'ngModel',
			replace    : true,
			templateUrl: 'Rbs/Admin/js/directives/time-interval-input.twig',

			link : function(scope, elm, attrs, ngModel) {
				if (angular.isDefined(attrs.disabled))
				{
					scope.$watch(attrs.disabled, function (value){
						scope.disable = value;
					}, true);
				}

				var durationTranslations = {
					years: i18n.trans('m.rbs.admin.admin.js.time-interval-years'),
					months: i18n.trans('m.rbs.admin.admin.js.time-interval-months'),
					weeks: i18n.trans('m.rbs.admin.admin.js.time-interval-weeks'),
					days: i18n.trans('m.rbs.admin.admin.js.time-interval-days'),
					hours: i18n.trans('m.rbs.admin.admin.js.time-interval-hours'),
					minutes: i18n.trans('m.rbs.admin.admin.js.time-interval-minutes'),
					seconds: i18n.trans('m.rbs.admin.admin.js.time-interval-seconds')
				};
				var durationTypes = Object.keys(durationTranslations);
				scope.durations = {};

				if (angular.isDefined(attrs.show))
				{
					var elements = attrs.show.split(',');
					angular.forEach(elements, function (element){
						scope.durations[element] = durationTranslations[element];
					});
				}
				else
				{
					//if show is not defined, show all
					scope.durations = durationTranslations;
				}

				//time interval is ISO 8601 string (like P3Y6M4DT12H30M5S) for 3 years, 6 months, 4 days, 12 hours, 30 minutes and 5 seconds
				var mtiRegexp = /^P([0-9]?[.,]?[0-9]+)Y([0-9]?[.,]?[0-9]+)M([0-9]?[.,]?[0-9]+)W([0-9]?[.,]?[0-9]+)DT([0-9]?[.,]?[0-9]+)H([0-9]?[.,]?[0-9]+)M([0-9]?[.,]?[0-9]+)S$/;
				//                  11111111111111111   22222222222222222   33333333333333333    44444444444444444   55555555555555555   66666666666666666   77777777777777777

				ngModel.$render = function () {
					if (mtiRegexp.test(ngModel.$viewValue))
					{
						var matches = ngModel.$viewValue.match(mtiRegexp);
						angular.forEach(matches, function (match, index){
							if (index !== 0 && parseInt(match, 10) !== 0)
							{
								scope.durationInterval = parseInt(match, 10);
								scope.durationType = durationTypes[index - 1];
							}
						});
					}
					else
					{
						ngModel.$setViewValue('');
					}
				};

				function makeISO8601Duration()
				{
					if (angular.isDefined(scope.durationInterval) &&  parseInt(scope.durationInterval, 10) !== 0
						&& angular.isDefined(scope.durationType) && scope.durationType !== '')
					{
						var durations = { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
						durations[scope.durationType] = scope.durationInterval;
						return 'P' + durations.years + 'Y' + durations.months + 'M' + durations.weeks + 'W' +
							durations.days + 'DT' +
							durations.hours + 'H' + durations.minutes + 'M' + durations.seconds + 'S';
					}
					else
					{
						return '';
					}
				}

				scope.$watch('durationInterval', function (){
					ngModel.$setViewValue(makeISO8601Duration());
					ngModel.$render();
				}, true);

				scope.$watch('durationType', function (){
					ngModel.$setViewValue(makeISO8601Duration());
					ngModel.$render();
				}, true);
			}
		};

	}]);

})();
