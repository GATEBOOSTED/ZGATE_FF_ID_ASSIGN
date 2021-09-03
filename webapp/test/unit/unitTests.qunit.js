/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"GATE/ZGATE_FF_ASS/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
