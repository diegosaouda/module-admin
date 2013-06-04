(function () {

	var app = angular.module('RbsChange');

	app.provider('RbsChange.NotificationCenter', function RbsChangeNotificationCenterProvider() {


		this.$get = ['RbsChange.ArrayUtils', function (ArrayUtils) {

				return {

					notifications : [],

					push : function (notification) {
						notification.style = notification.style || "info";
						this.notifications.push(notification);
					},
					
					info : function (title, body) {
						this.notifications.push({
							'title': title,
							'body' : body,
							'style': 'info'
						});
					},
					
					error : function (title, body, context) {
						this.clear();
						this.notifications.push({
							'title'  : title,
							'body'   : body,
							'style'  : 'error',
							'context': context
						});
					},
					
					remove : function (index) {
						ArrayUtils.remove(this.notifications, index, index);
					},
					
					clear : function () {
						ArrayUtils.clear(this.notifications);
					}

				};

		}];

	});

})();