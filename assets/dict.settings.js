Dictionary = typeof Dictionary === 'undefined' ? function () { } : Dictionary;

Dictionary.prototype.settingsType = '';//'general';
Dictionary.prototype.mozillaUrl = 'http://www.tilde.lv/birojs/firefox';
Dictionary.prototype.chromeUrl = 'https://chrome.google.com/webstore/detail/tildes-birojs/dnbgcpgkobmfpedfhpepffbbmamffhgg';
Dictionary.prototype.scrollToTop = false;
Dictionary.prototype.componentStatus = {};

Dictionary.prototype.initSettings = function () {

    /*
     *  Settings side menu actions
     */

	History.addRecord('dictionaries-view', this.switchSubview, ['settings-view'], this);
	$('#settings-wrapper').on({
		'click keyup': function (event) {
			event.preventDefault();
			event.stopPropagation();
			if ((event.which === 1 /*|| event.which == 13 */ || typeof event.isTrigger !== 'undefined') && !$(this).hasClass('active') && View !== null) {
				var href = $(event.currentTarget).attr('href');
				if (href && href.length) {
					var elem = $('#main-navigation .navigation-item[href^="' + href + '"]');
					if (elem.length > 0) {
						elem.parent().show();
						elem.click();

					}
					else {
						View.switchSubview(this);
					}
				}

				$(document.body).removeClass('settings-menu');
				window.setTimeout(function () {
					if (document.body.className.indexOf('settings-menu') === -1) {
						$('#settings-wrapper').css('visibility', 'hidden');
					}
				}, 350);

				$(this).removeClass('active');
			}
			return false;
		}
	}, '.navigation-item').on({
		'keyup': function (event) {
			if (event.which === 13) {
				$(this).find('a.navigation-item').stop().trigger('click');
			}
		}
	}, 'li').on({
		'click keyup': function (event) {
			event.preventDefault();
			event.stopPropagation();
			if ((event.which === 1 || event.which === 13 || typeof event.isTrigger !== 'undefined') && typeof Model !== 'undefined') {
				$(document.body).removeClass('settings-menu');
				Model.openExternalResource(this.getAttribute('href'));
			}
		}
	}, '.external-item').on({
		'click keyup': function (event) {
			event.preventDefault();
			event.stopPropagation();
			if ((event.which === 1 /*|| event.which == 13*/ || typeof event.isTrigger !== 'undefined') && typeof Model !== 'undefined') {
				var href = $(event.currentTarget).attr('href');
				if (href && href.length) {
					var elem = $('#main-navigation .navigation-item[href^="' + href + '"]');
					if (elem.length > 0) {
						var arr = Settings.ViewsPinned.split('|');
						if ($(this).hasClass('pinned')) {
							$(this).removeClass('pinned');
							this.setAttribute('data-tooltip', Locale.tip_pin)
							elem.parent().hide();
							elem.parent().removeClass('pinned');
							arr.splice(arr.indexOf('href'), 1);
						}
						else {
							$(this).addClass('pinned');
							this.setAttribute('data-tooltip', Locale.tip_unpin);
							elem.parent().show();
							elem.parent().addClass('pinned');
							arr.push(href);
						}
						Settings.ViewsPinned = arr.join('|');
						Model.changeSetting('ViewsPinned', Settings.ViewsPinned, '-1');
					}
					else {
						View.switchSubview(this);
					}
				}
			}
			//$(this).blur();
		}
	}, '.pin-item').on({
		'click keyup': function (event) {
			event.preventDefault();
			event.stopPropagation();
			if (event.which !== 1 || window.Model === undefined)
				return false;
			Model.OpenHelp();
		}
	}, '.help-item');

	$('#btn-settings-menu').on({
		'click': function (event) {
			if (event.which === 1 || typeof (event.isTrigger) !== 'undefined') {

				if (document.body.className.indexOf('settings-menu') === -1) {
					// Show the settings menu
					$('#settings-wrapper').css('visibility', 'visible');
					$(document.body).addClass('settings-menu');
					if (window.KEY_ACT) {
						window.setTimeout(function () {
							$('#settings-menu-primary li:first a:first').focus();
						}, 350);
					}
				} else {
					// Hide the settings menu
					$(document.body).removeClass('settings-menu');
					window.setTimeout(function () {
						if (document.body.className.indexOf('settings-menu') === -1) {
							$('#settings-wrapper').css('visibility', 'hidden');
						}
					}, 350);
				}
			}
		}
	});

	$('#settings-overlay').on({
		'click': function (event) {
			if (event.which === 1) {
				$(document.body).removeClass('settings-menu');
				window.setTimeout(function () {
					if (document.body.className.indexOf('settings-menu') === -1) {
						$('#settings-wrapper').css('visibility', 'hidden');
					}
				}, 350);
			}
		}
	});

	// Delegate events

	$('#btn-help').click(
		function (event) {
			if (event.which !== 1 || window.Model === undefined)
				return false;
			Model.OpenHelp();
		});


};


Dictionary.prototype.injectHTMLContent = function (content, general) {
	var settingsPanel = [];
	if (general && general === 'dictionaries')
		settingsPanel = document.getElementById('dictionaries-panel-wrapper');
	else if (general && general === 'general')
		settingsPanel = document.getElementById('settings-panel-wrapper');

	if (typeof settingsPanel !== 'undefined' && settingsPanel !== null) {
		settingsPanel.innerHTML = content;
		if (general && general === 'general') {
			var addinHtml = '<div class="horizontal-rule dotted clearfix"></div>' +
				'<div class="settings-description no-margin"><b>' + Locale.text_officeTitle + '</b><br />' + Locale.text_officeBody + '</div>' +
				'<div class="selection-container"><div style="float:left;"><input name="Word" type="checkbox" id="WordPlugin" /></div>' +
				'<span style="float:left;" class="settings-description">Microsoft Word</span><div style="clear:both;"></div></div>' +
				'<div id="outlook-container" class="selection-container"><div style="float:left;"><input name="Outlook" type="checkbox" id="OutlookPlugin" /></div>' +
				'<span style="float:left;" class="settings-description">Microsoft Outlook</span><div style="clear:both;"></div></div>' +
				'<div class="horizontal-rule dotted clearfix"></div>';
			if (Settings.DefaultLang === '1062') {
				addinHtml += '<div class="settings-description no-margin"><b>' + Locale.text_outlookTitle + '</b><br />' + Locale.text_outlookBody + '</div>' +
					'<div class="selection-container"><a href="#" ' + (this.componentStatus.fiesta ? 'onclick="Model.openExternalResource(\'fiesta\');' : ' data-disabled="true" title="' + Locale.tip_notInstalled + '"') + ' ">' +
					'<span>Microsoft Outlook</span></a></div>';
			}
			$(settingsPanel).append(addinHtml);
			this.setCheckboxStates();

		}


		var scripts = settingsPanel.getElementsByClassName('executable');
		for (var i = 0; i < scripts.length; i++) {
			eval(scripts[i].innerHTML);
		}

		$('input[type=checkbox]').each(
			function () {
				this.setAttribute('data-content', this.checked ? Locale.label_on : Locale.label_off);
			});
		$('input[type=range]').each(
			function () {
				this.setAttribute('data-content', (100 + this.value * 25) + '%');
				this.setAttribute('data-tooltip', (100 + this.value * 25) + '%');
			});
	}
	if (this.scrollToTop) {
		settingsPanel.parentNode.scrollTop = 0;
		this.scrollToTop = false;
	}


};



Dictionary.prototype.hotKeyChange = function (event, sender) {
	if (event.keyCode === 9) {
		return true;
	}



	else /*if (event.keyCode < 16 || event.keyCode > 18)*/ {
		var keyComb = '';

		if (event.shiftKey === 1) {
			keyComb = 'Shift';
		}

		if (event.altKey === 1) {
			if (keyComb !== '') keyComb += '+';
			keyComb = keyComb + 'Alt';
		}

		if (event.ctrlKey === 1) {
			if (keyComb !== '') keyComb += '+';
			keyComb += 'Ctrl';
		}


		if (keyComb !== '') {
			var blacklist = [
				8, 		// Backspace
				9, 		// Tab
				13, 	// Enter
				16, 	// Shift
				17, 	// Ctrl
				18,		// Alt
				19, 	// Pause/Break
				20, 	// Caps Lock
				27, 	// Esc
				33, 	// Page up
				34, 	// Page down
				35, 	// End
				36, 	// Home
				93		// Select key
			];

			if (event.ctrlKey && !event.shiftKey && !event.altKey) {
				// Ctrl + A (Position caret inside input field)
				blacklist.push(65);
				// Ctrl + C (Copy)
				blacklist.push(67);
				// Ctrl + P (Print)
				blacklist.push(80);
				// Ctrl + S (Save)
				blacklist.push(83);
				// Ctrl + V (Paste)
				blacklist.push(86);
				// Ctrl + X (Cut)
				blacklist.push(88);
				// Ctrl + Z (Undo)
				blacklist.push(90);
			}
			else if (!event.ctrlKey && !event.shiftKey && event.altKey) {
				// Alt + K (On-screen keyboard)
				blacklist.push(75);
				// Alt + N (Reverse translation direction)
				blacklist.push(78);
				// Alt + S (Pin on top)
				blacklist.push(83);
				// Alt + W (Switch windows)
				blacklist.push(87);
			}
			else if (event.ctrlKey && event.shiftKey && !event.altKey) {
				// Ctrl + Shift + C (Copy translation)
				blacklist.push(67);
				// Ctrl + Shift + R (Reverse translation direction)
				blacklist.push(82);
				// Ctrl + Shift + V (Paste and translate)
				blacklist.push(86);
			}

			if (blacklist.indexOf(event.keyCode) !== -1) {
				event.preventDefault();
				event.stopPropagation();
				return false;
			}

			keyComb += '+' + String.fromCharCode(event.keyCode);
			sender.value = keyComb;

			if (typeof Model !== 'undefined')
				Model.changeSetting('hotkey', keyComb, '-1');
		}

	}
	return false;
};
//
// Event triggered when any range (of what???) is changed; 
//
Dictionary.prototype.rangeChanged = function (event) {
	console.log(event.currentTarget.name + '-' + event.currentTarget.value);
	event.currentTarget.setAttribute('data-content', (100 + event.currentTarget.value * 25) + '%');
	event.currentTarget.setAttribute('data-tooltip', (100 + event.currentTarget.value * 25) + '%');
	Model.changeSetting(event.currentTarget.name, event.currentTarget.value, -1);

};

//
// Event triggered when any checkbox is changed; 
//
Dictionary.prototype.checkboxChanged = function (event) {
	var enabled = event.currentTarget.checked;
	event.currentTarget.setAttribute('data-content', enabled ? Locale.label_on : Locale.label_off);
	event.currentTarget.setAttribute('data-tooltip', enabled ? Locale.label_on : Locale.label_off);

	if (this.settingsType === 'addin') {
		Settings[event.currentTarget.id] = enabled;
		Model.changeSetting(event.currentTarget.name, enabled, '-1');
		//event.currentTarget.setAttribute('data-content', enabled ? 'On' : 'Off');
	}
	else if (event.currentTarget.id === 'AutoCheckUpdates') {
		Settings[event.currentTarget.id] = enabled;
		Model.openExternalResource('updateLauncher', enabled ? '1' : '0', '-1');
	}
	else {

		var from = document.getElementById('direction-from');
		var to = document.getElementById('direction-to');

		if (event.currentTarget.id === 'toggle-all') {
			// All visible checkboxes are enabled or disabled
			// One by one send their names and states do DicBrowser
			$('input[type=checkbox]:not([name=toggle-all])').each(
				function () {
					if (this.checked !== enabled) {
						this.checked = enabled;
						try {
							Model.changeSetting(this.name, enabled, from.value + '-' + to.value);
							this.setAttribute('data-content', enabled ? Locale.label_on : Locale.label_off);
						}
						catch (e) {
							console.log("ERR: Could not change setting!");
						}
					}
				});

			return;
		}

		var toggler = document.getElementById('toggle-all');
		if (typeof toggler !== 'undefined' && toggler !== null) {
			toggler.checked = $('.checkbox:checked').length === $('.checkbox').length;
			toggler.setAttribute('data-content', toggler.checked ? Locale.label_on : Locale.label_off);
			toggler.setAttribute('data-tooltip', toggler.checked ? Locale.label_on : Locale.label_off);
		}

		Model.changeSetting(event.currentTarget.name, enabled, $(event.currentTarget).hasClass('dictionary-state') ? from.value + '-' + to.value : '-1');
	}
};

Dictionary.prototype.setCheckboxStates = function () {
	var e = document.getElementById('IEPlugin');
	if (e && Settings.IEPlugin) e.checked = true;

	e = document.getElementById('WordPlugin');
	if (e && Settings.WordPlugin) e.checked = true;

	e = document.getElementById('OutlookPlugin');
	if (e && Settings.OutlookPlugin) e.checked = true;
};


Dictionary.prototype.editExistingUserDict = function (location) {
	Model.editExistingUserDict(this.currentDirectionFrom + '-' + this.currentDirectionTo, location.decodeString());
};

Dictionary.prototype.deleteExistingUserDict = function (id) {
	var retval = Model.deleteExistingUserDict(this.currentDirectionFrom + '-' + this.currentDirectionTo, id);
};

Dictionary.prototype.exportExistingUserDict = function (location) {
	Model.exportExistingUserDict(this.currentDirectionFrom + '-' + this.currentDirectionTo, location.decodeString());
};


Dictionary.prototype.createNewUserDict = function () {
	var retval = Model.createNewUserDict(this.currentDirectionFrom + '-' + this.currentDirectionTo);
};

Dictionary.prototype.importExistingUserDict = function () {
	var retval = Model.importExistingUserDict(this.currentDirectionFrom + '-' + this.currentDirectionTo);
};


InitStack.push(function () {
	View.initSettings();
});
