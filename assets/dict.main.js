Dictionary = typeof Dictionary == 'undefined' ? function () { } : Dictionary;

Dictionary.prototype = {
	status: Status.NotReady,
	//documentContentHeight: null,
	currentSearch: '',				// User entered text sent to DicBrowser
	currentTranslated: '',			// DicBrowser interpreted input - misspelled, baseform etc.
	currentAutocompleteHistory: [], // Autocomplete history list sent from DicBrowser for current user input
	activeViewID: 'full-view',   // [id] of currently active subviews DOM element

	currentDirectionFrom: null,
	currentDirectionTo: null,

	keyboard: null,                 // On-screen keyboard object, instance of Keyboard('lang')
	languages: new Array(),         // Array of language objets - instances of Language()
	languagePairs: new Object(),    // Key - source language code, value - array of respective target language codes

	translationTimeout: null,       // Used when Autotranslate is enabled - timeout before translating on keypress
	translationProgressTimeout: null,
	ETBTimeout: null,
	ONLDICTimeout: null,

	ETBHash: '',

	// References to DOM objects
	activeView: null,               // <div /> of currently active subview
	searchArea: null,               // <textarea /> - main input field
	// autocompleteArea: null,      // <div /> behind main input field for autocomplete results
	contextArea: null,              // TODO: Do we still need this?
	preloaderArea: null,            // A <div/> containing loading animation
	introArea: null,

	initDictionary: function () {

		/* Initialize google analytics object*/
		//jQuery.expr.filters.offscreen = function (el) {
		//    return (
		//            (el.offsetLeft + el.offsetWidth) > window.innerWidth
		//               // (el.offsetLeft + el.offsetWidth) < 0
		//                //|| (el.offsetTop + el.offsetHeight) < 0
		//                //|| (el.offsetLeft > window.innerWidth || el.offsetTop > window.innerHeight)
		//           );
		//};
		//(function (i, s, o, g, r, a, m) {
		//    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
		//        (i[r].q = i[r].q || []).push(arguments)
		//    }, i[r].l = 1 * new Date(); a = s.createElement(o),
		//    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
		//})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

		//ga('create', 'UA-2818381-30', 'auto');
		////ga('set', 'appName', 'Tildes Birojs 2015');
		////ga('set', 'appVersion', 'C.54');
		////ga('set', 'anonymizeIp', false);
		////ga('set', 'dataSource', 'DicBrowser.exe');
		//ga('set', 'language', Settings.UILang);
		//ga('send', 'pageview', { 'page': 'Tildes Birojs initialization', 'sessionControl': 'start' });

		//window.addEventListener("unload", function (e) {
		//    ga('send', 'pageview', { 'sessionControl': 'end' });
		//});

        window.addEventListener("resize", this.setWindowSize, false);

        $("#dictation-trans").css("height", (window.innerHeight - 80) + "px");

        /**************************************************************************************
                INITIALIZE USER INTERFACE
        **************************************************************************************/
		var self = this,
			e = null;


		document.body.setAttribute('activation-statuss', Settings.ActivationStatuss);
		document.body.setAttribute('autocheckupdates', Settings.AutoCheckUpdates);
		if (typeof Settings.UpdateCount != 'undefined' && Number(Settings.UpdateCount) > 0) {
			document.body.setAttribute('has-updates', true);
		}

		this.updateViewStatus();
		this.updateDirections();

		e = document.getElementById('search-input');
		if (typeof e != 'undefined' && e != null) {
			e.setAttribute('placeholder', Locale['text_enterText']);
		}


		//
		// Object references for quicker manipulations
		//

		this.contextArea = document.getElementById('context-panel');
		this.searchArea = document.getElementById('search-input');
		this.preloaderArea = $('#global-linear-loader');
		this.introArea = $('#view-introduction-wrapper');

		this.switchSubview('asr-view');

		if (Settings.DefaultViewPinned) {
			$('#btn-pin-window, #btn-restoredown-window, #btn-maximize-window, #btn-fullscreen-window').addClass('pinned');
			$("#resizable").resizable({ disabled: false });
		}

		var contextPanels = document.getElementsByClassName('btn-toggle-context');
		for (var i = 0; i < contextPanels.length; i++) {
			var contextPanel = contextPanels[i];
			if (typeof contextPanel != 'undefined' && contextPanel != null) {
				if (Settings.ContextEnabled) {
					contextPanel.setAttribute('data-enabled', 'true');
				}
				else {
					contextPanel.setAttribute('data-enabled', 'false');
				}
			}
		}

        /**************************************************************************************
                BIND EVENTS
        **************************************************************************************/

		//
		// Button and link events
		//

		$('#view-introduction-wrapper').on({
			'click': function (event) {
				event.preventDefault();
				event.stopPropagation();
				if (event.which == 1) {
					this.removeIntroduction(this.activeViewID, true);
				}
			}.bind(this)
		}, '.btn-close-introduction');

		/* History button events*/
		$('#btn-history-back').click(
			function (event) {
				if (event.which == 1 && typeof History != 'undefined' && History != null) {
					History.goBack(this.activeViewID);
					this.setHistoryButtonStatuss(this.activeViewID);
					if (window.KEY_ACT) {
						event.currentTarget.focus();
					}
				}
			}.bind(this));

		$('#btn-history-forward').click(
			function (event) {
				if (event.which == 1 && typeof History != 'undefined' && History != null) {
					History.goForward(this.activeViewID);
					this.setHistoryButtonStatuss(this.activeViewID);
					if (window.KEY_ACT) {
						event.currentTarget.focus();
					}
				}
			}.bind(this));

        /*
        *      BIND TILDES BIROJS CONTAINER EVENTS
        */

		$('#welcome-view .introduction-wrapper').on({
			'click keyup': function (event) {
				event.preventDefault();
				event.stopPropagation();
				if ((event.which == 1 || event.which == 13 || typeof event.isTrigger != 'undefined') && !$(this).hasClass('active') && typeof View != 'undefined' && View != null) {
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
				}
			}
		}, '.navigation-item').on({
			'click keyup': function (event) {
				event.preventDefault();
				event.stopPropagation();
				if ((event.which == 1 || event.which == 13 || typeof event.isTrigger != 'undefined') && typeof Model != 'undefined') {
					Model.openExternalResource(this.getAttribute('href'));
				}
			}
		}, '.external-item');

		$('#app-system_menu_top').mousedown(
			function (event) {
				event.preventDefault();
				// 1 - left mouse button
				if (event.which == 1 && typeof Model != 'undefined' && event.delegateTarget == event.target) {
					Model.LButtonDownApplicationWindow(event.pageX, event.pageY);
				}
			}.bind(this));

		$('#btn-close-window').click(
			function (event) {
				if (event.which == 1 && typeof Model != 'undefined') {
					Model.pronounceText(' ');
					Model.closeApplicationWindow();
				}
			}.bind(this));

		$('#btn-minimize-window').click(
			function (event) {
				if (event.which == 1 && typeof Model != 'undefined') {
					event.currentTarget.blur();
					Model.minimizeApplicationWindow();
				}
			}.bind(this));

		$('#btn-fullscreen-window').click(
			function (event) {
				if (event.which == 1 && typeof Model != 'undefined') {
					event.currentTarget.blur();
					Model.fullscreenApplicationWindow();
					$('#btn-maximize-window, #btn-fullscreen-window').addClass('hidden');
					$('#btn-restoredown-window').removeClass('hidden');
					$("#resizable").resizable({ disabled: true });
				}
			}.bind(this));

		$('#btn-maximize-window').click(
			function (event) {
				if (event.which == 1 && typeof Model != 'undefined') {
					event.currentTarget.blur();
					Model.maximizeApplicationWindow();
					$('#btn-maximize-window, #btn-fullscreen-window').addClass('hidden');
					$('#btn-restoredown-window').removeClass('hidden');
					$("#resizable").resizable({ disabled: true });
					this.focusInput();
				}
			}.bind(this));

		$('#btn-restoredown-window').click(
			function (event) {
				if (event.which == 1 && typeof Model != 'undefined') {
					event.currentTarget.blur();
					Model.restoredownApplicationWindow();
					$('#btn-maximize-window, #btn-fullscreen-window').removeClass('hidden');
					$('#btn-restoredown-window').addClass('hidden');
					$("#resizable").resizable({ disabled: false });
					this.focusInput();
				}
			}.bind(this));

		$('#btn-pin-window').click(
			function (event, triggered) {
				if ((event.which == 1 || typeof event.isTrigger != 'undefined') && typeof Model != 'undefined') {
					$('#btn-pin-window, #btn-restoredown-window, #btn-maximize-window, #btn-fullscreen-window').toggleClass('pinned');
					event.currentTarget.blur();
					Settings.DefaultViewPinned = $(event.currentTarget).hasClass('pinned');
					this.checkWindowHeight($(event.currentTarget).hasClass('pinned'));
					Model.changeSetting('DefaultViewPinned', $(event.currentTarget).hasClass('pinned'), '-1');
					event.currentTarget.setAttribute('data-tooltip', $(event.currentTarget).hasClass('pinned') ? Locale.tip_Quick_view : Locale.tip_Full_view);
					this.focusInput();
				}
			}.bind(this));

		$('#btn-toggle-keyboard').click(
			function (event, triggered) {
				if ((event.which == 1 || typeof event.isTrigger != 'undefined') && !event.currentTarget.getAttribute('data-disabled').toBoolean()) {
					this.toggleKeyboard(typeof triggered == 'boolean' ? triggered : false);
					event.currentTarget.blur();
				}
			}.bind(this));

		$('.btn-toggle-context').click(
			function (event) {
				if (event.which == 1 && typeof Model != 'undefined') {
					this.toggleContext(event.currentTarget);
				}
			}.bind(this));

		$('#btn-dictionaries').click(
			function (event) {
				if (event.which != 1 || window.Model == undefined)
					return false;
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

			}.bind(this));

		$('#dictionaries-panel-wrapper, #settings-panel-wrapper').delegate('input[type=range]', 'mouseup',
			function (event) {
				this.rangeChanged(event);
			}.bind(this));

		$('#dictionaries-panel-wrapper, #settings-panel-wrapper, #autoupdate-view').delegate('input[type=checkbox]', 'change',
			function (event) {
				this.checkboxChanged(event);
			}.bind(this));

		$('#dictionaries-panel-wrapper, #settings-panel-wrapper').delegate('a#change-ui-lang', 'click',
			function (event) {
				if (typeof Model != 'undefined')
					Model.openExternalResource('langswitch');
			});


		//
		//	Language switching events
		//


		$('#direction-from, #direction-to').on({
			'change': function (event) {
				var dir;
				if (event.currentTarget.id == 'direction-from') {
					dir = this.setDirection(event.currentTarget.value);
				}
				else {
					dir = this.setDirection(null, event.currentTarget.value);
				}
				if (this.activeViewID == 'dictionaries-view') {
					Model.DicSettings(this.currentDirectionFrom + '-' + this.currentDirectionTo);
					this.scrollToTop = true;
				}
				else if (this.activeViewID == 'synonyms-view') {
					this.getSynonyms(this.searchArea.value, true, 1);
				}
				else if (this.activeViewID == 'grammar-view') {
					this.getInflection(this.currentDirectionFrom, this.searchArea.value);
				}
				else if (dir.from.value != 99999 && this.shouldTranslate(false)) {
					this.getTranslations();
				}
			}.bind(this),

			// When direction is changed with a keyboard, set flag to prevent text input field gaining focus
			'keyup': function (event) {
				window.KEY_ACT = false;
			},

			'keydown': function (event) {
				window.KEY_ACT = true;
			},

			'change.fs': function (event) {
				$(this).trigger('change.$');
			}

		});

		$('#btn-reverse-dir').on({
			'click': function (event) {
				// The button will be disabled if there is no reverse dictionary
				var disabled = event.currentTarget.getAttribute('data-disabled');

				// 1 - left mouse button or event is triggered via trigger() function
				if ((event.which == 1 || typeof event.isTrigger != 'undefined') && (typeof disabled == 'undefined' || !disabled.toBoolean())) {
					self.reverseDirection();
				}
			}
		});


		//
		//	Events for keyboard panel
		//

		$('body').on({
			click: function (event) {
				// Block hyperlinks from redirecting to another page except mailto:tilde.lv or www.tilde.lv
				if (typeof $(event.currentTarget).attr('href') != 'undefined' && $(event.currentTarget).attr('href').indexOf("tilde.") == -1) {
					event.preventDefault();
					event.stopPropagation();
				}
				if (event.which == 1) {
					if ($(event.currentTarget).hasClass('keyboard-item')) {
						this.onKeyboardClick(event.currentTarget, true);
					}
				}
			}.bind(this)

		}, 'a').on({

			keydown: function (event) {

				if (event.keyCode == 13) {
					event.preventDefault();
					event.stopPropagation();
					this.onKeyboardClick(event.currentTarget, false);
				}
			}.bind(this)

		}, '.keyboard-item');

		//
		//	Events in translation result panel
		//


		$('#result-panel').on({

			focus: function (event) {
				Model.setInputLanguage(this.currentDirectionTo);
			}.bind(this),

			blur: function (event) {
				Model.setInputLanguage(this.currentDirectionFrom);
			}.bind(this)
		}, '#new-translation, #new-comment').on({

			contextmenu: function (event) {
				if (window.getSelectionHtml().indexOf(this.outerHTML) == -1) {
					$(event.currentTarget).addClass('transparent-selection');
					window.T_CNTX = true;
					window.setSelection(event.currentTarget);
				}
			}
		}, '.transl');

		$('#subview-wrapper').on({

			'click keyup': (function (event) {
				if (event.which == 1 || event.keyCode == 13) {
					$(event.currentTarget).closest('.dictionary-block').toggleClass('clamped');
				}
			}).bind(this)
		}, '.btn-toggle-expansion');



		this.status = Status.Ready;


	},



    /**************************************************************************************
            SUBVIEW NAVIGATION
    **************************************************************************************/
	updateViewStatus: function () {
		var views = Settings.ViewsPinned.split('|');
		$('#settings-wrapper .pin-item').attr('data-tooltip', Locale.tip_pin);
		for (var i = 0; i < views.length; i++) {
			var elem = $('#main-navigation .navigation-item[href^="' + views[i] + '"]');
			if (elem.length > 0) {
				elem.parent().show();
				elem.parent().addClass('pinned');
			}
			var settingsElem = $('#settings-wrapper .pin-item[href^="' + views[i] + '"]');
			if (settingsElem.length > 0) {
				settingsElem.addClass('pinned');
				settingsElem.attr('data-tooltip', Locale.tip_unpin);
			}

		}
	},

	switchSubview: function (sender, reload) {
		if (typeof sender == 'string') {
			var elem = $('[href=' + sender + '].navigation-item');
			if (elem.length == 0) {
				elem = $('[href=\'full-view\'].navigation-item');
			}
			elem[0].click();
			return;
		}

		var $e = $(sender);
		if (!$e.parent().parent().children().find('.active').parent().hasClass('pinned')) {
			if (!(this.activeViewID == 'ocr-view' && !$.isEmptyObject(Settings.OCRTextRecognitionStatus)) &&
				!(this.activeViewID == 'full-view' && !(this.fileTranslationStatus == Status.OK))) {
				$e.parent().parent().children().find('.active').parent().hide();
			}
		}

		$e.parent().parent().find('.active').removeClass('active');
		$e.parent().show();
		$e.addClass('active').parent().addClass('active');

		var targetID = $e.attr('href'),
			targetView = $('#' + targetID);

		this.currentSearch = this.searchArea ? this.searchArea.value : '';
		this.onSubviewHide(this.activeViewID, this.activeView);
		this.onSubviewShow(targetID, targetView, reload);

		// Hide/show subview panes
		if (this.activeView) {
			this.activeView.addClass('hidden');
		}
		targetView.removeClass('hidden');

		// Keep reference to View's DOM element
		this.activeViewID = targetID;
		this.activeView = targetView;

		document.body.setAttribute('data-active-view', this.activeViewID);

	},

	// Called before a view is shown with the target view as parameter
	onSubviewShow: function (id, element, reload) {
		//ga('send', 'pageview', {
		//    'page': id,
		//    'hitCallback': function () {
		//        console.log('analytics.js done sending data: pageview with id: ' + id);
		//    }
		//});
		$('#direction-block').hide();
		$('#btn-reverse-dir').removeClass('hide');
		$($('.fancy-select')[1]).removeClass('hide');
		$('#btn-history-back, #btn-history-forward').addClass('hide');

		switch (id) {
			case 'welcome-view': {
				break;
			}

			case 'full-view': {
				this.setHistoryButtonStatuss('full-view');
				$('#btn-history-back, #btn-history-forward').removeClass('hide');
				$('#btn-choose-file, #direction-block').show();

				this.currentSearch = '';
				if (reload == true) {
					this.clearInput();
				}

				if (!(this.translatorWidget && this.translatorWidget.isActive)) {
					this.getTranslations(this.searchArea.value);
				}

				Model.changeSetting('activeViewID', id, '-1');
				break;
			}

			case 'synonyms-view': {
				$('#direction-block').show();
				$('#btn-reverse-dir').addClass('hide');
				$($('.fancy-select')[1]).addClass('hide');
				// Hide unavailable synonim languages and set direction, if neccessary
				$('#direction-from option[value="1061"]').attr('disabled', 'disabled').parent().trigger('update.fs');
				if (this.currentDirectionFrom == '1061') {
					this.setDirection($('#direction-from option:not([disabled]):first').val());
				}
				$('#direction-from option[value="1045"]').attr('disabled', 'disabled').parent().trigger('update.fs');
				if (this.currentDirectionFrom == '1045') {
					this.setDirection($('#direction-from option:not([disabled]):first').val());
				}
				this.setHistoryButtonStatuss('synonyms-view');
				$('#btn-history-back, #btn-history-forward').removeClass('hide');
				this.currentSearch = '';
				this.getSynonyms(this.searchArea.value, true, 1);
				Model.changeSetting('activeViewID', id, '-1');
				break;
			}

			case 'reference-view': {
				this.setHistoryButtonStatuss('reference-view');
				$('#btn-history-back, #btn-history-forward').removeClass('hide');
				this.currentSearch = '';
				this.getReference(true, this.searchArea.value);
				Model.changeSetting('activeViewID', id, '-1');
				break;
			}

			case 'grammar-view': {
				$('#direction-block').show();
				$('#btn-reverse-dir').addClass('hide');
				$($('.fancy-select')[1]).addClass('hide');
				// Hide unavailable synonim languages and set direction, if neccessary
				$('#direction-from option[value="1061"]').attr('disabled', 'disabled').parent().trigger('update.fs');
				if (this.currentDirectionFrom == '1061') {
					this.setDirection($('#direction-from option:not([disabled]):first').val());
				}
				$('#direction-from option[value="1045"]').attr('disabled', 'disabled').parent().trigger('update.fs');
				if (this.currentDirectionFrom == '1045') {
					this.setDirection($('#direction-from option:not([disabled]):first').val());
				}

				try {
					this.currentSearch = '';
					this.switchPreviewProfile('gram');
					this.getInflection(this.currentDirectionFrom, this.searchArea.value);
				} catch (e) {
					console.log("ERR: Could not change the preview profile!");
				}
				Model.changeSetting('activeViewID', id, '-1');
				break;
			}

			case 'ocr-view': {
				$('#btn-choose-file').show();
				$('#direction-block').show();
				$('#btn-reverse-dir').addClass('hide');
				$($('.fancy-select')[1]).addClass('hide');
				this.switchPreviewProfile('ocr');
				$('#ocrupload-source, #ocr-translation-block, #ocr-translation-block-right').show();
				this.disableKeyboard();
				break;
			}

			case 'asr-view': {
				//$('#direction-block').show();
				$('#btn-reverse-dir').addClass('hide');
				$($('.fancy-select')[1]).addClass('hide');
				if ($(document.body).attr('productname') == 'Tildes Birojs') {
					$('#direction-from option[value!="1062"]').attr('disabled', 'disabled').parent().trigger('update.fs');
				}
				else {
					$('#direction-from option[value!="1063"]').attr('disabled', 'disabled').parent().trigger('update.fs');
				}

				$("#settings-overlay").addClass('high_z_index');

				this.switchPreviewProfile('asr');
				this.disableKeyboard();
				this.setDirection($('#direction-from option:not([disabled]):first').val());

				if ($("#recognition_result").hasClass('hide') == false && $("#play_button").hasClass('pause') == true) { // if audio was playing when leaving ASR view
					this.asrAudioPlayer.play();         // ..... then resume playing when returning to ASR view
				}

				if ($("#dictation_button").hasClass("stop_dictation") == true) {
					$("#dictation_button").trigger({ type: "click", which: 1 });
				}

				break;
			}

			case 'settings-view': {
				$('#btn-dictionaries').show();
				Model.GeneralSettings();
				this.disableKeyboard();
				break;
			}

			case 'template-view': {
				$('#btn-tamplate-back').removeClass('hide');
				this.LoadTemplateList();
				Model.changeSetting('activeViewID', id, '-1');
				this.disableKeyboard();
				break;
			}

			case 'literature-view': {
				$('#literature-subtitle').removeClass('hide');
				this.loadLiteratureList();
				Model.changeSetting('activeViewID', id, '-1');

				this.disableKeyboard();
				break;
			}

			case 'dictionaries-view': {
				History.addRecord('dictionaries-view', this.switchSubview, ['dictionaries-view'], this);
				this.setHistoryButtonStatuss('dictionaries-view');
				$('#btn-history-back').removeClass('hide');

				var from = this.currentDirectionFrom,
					to = this.currentDirectionTo;

				$('#direction-block').show();

				this.scrollToTop = true;
				this.hideMTExclusiveSourceSystems(false);
				this.activeViewID = 'dictionaries-view';
				this.unsetDirection();
				this.setDirection(from, to);

				Model.DicSettings(this.currentDirectionFrom + '-' + this.currentDirectionTo);
				this.disableKeyboard();
				break;
			}

			case 'autoupdate-view': {
				$('#about-product-block').removeClass('hide');
				this.scrollToTop = true;
				this.RefreshAutoupdate();
				this.disableKeyboard();
				break;
			}

			default: break;
		}
	},

	// Called before navigating away from a view
	onSubviewHide: function (id, element) {
		$('#btn-choose-file').hide();
		switch (id) {
			case 'welcome-view': {
				break;
			}

			case 'full-view': {
				if (this.translatorWidget && this.translatorWidget.isActive) {
					this.switchToDictionary();
				}
				$('#btn-dictionaries').hide();
				this.enableKeyboard();
				this.switchPreviewProfile('default');
				break;
			}

			case 'synonyms-view': {
				$('#direction-from option[value="1061"]').removeAttr('disabled').parent().trigger('update.fs');
				$('#direction-from option[value="1045"]').removeAttr('disabled').parent().trigger('update.fs');
				break;
			}

			case 'asr-view': {
				if ($(document.body).attr('productname') == 'Tildes Birojs') {
					$('#direction-from option[value!="1062"]').removeAttr('disabled').parent().trigger('update.fs');
				} else {
					$('#direction-from option[value!="1063"]').removeAttr('disabled').parent().trigger('update.fs');
				}
				$("#btn-toggle-keyboard").removeClass('hide');
				$("#settings-overlay").removeClass('high_z_index');

				if ($("#recognition_result").hasClass('hide') == false && this.asrAudioPlayer.paused == false) { // if audio is playing when leaving ASR view ......
					this.asrAudioPlayer.pause();            // ....... pause it
				}

				if ($("#record_step").hasClass('hide') == false && $("#is_recording").hasClass('recording') == true) { // if TB is recording when leaving ASR view ......
					$("#start_stop_recording").trigger({ type: 'click', which: 1 });    // ........ stop recording
				}

				if ($("#dictation_step_mac").hasClass("hide") == false) {
					if ($("#start_stop_dictation_mac").hasClass("dictation_stop_mac") == true) {
						$("#start_stop_dictation_mac").trigger({ type: 'click', which: 1 });
						if ($("#dictation-trans p span").text() == "") {
							$("#asr_button_back").trigger({ type: 'click', which: 1 });
						}
					}

					if ($("#start_stop_dictation_mac").hasClass("dictation_begin_mac") == true) {
						$("#asr_button_back").trigger({ type: 'click', which: 1 });
					}
				}

				//$("#dictation_button").removeClass('hidden');
				$("#dictation_button").removeClass('invisible');

				this.enableKeyboard();
				this.switchPreviewProfile('default');

				break;
			}

			case 'literature-view': {
				$('#literature-subtitle').addClass('hide');
				break;
			}

			case 'reference-view': {
				break;
			}

			case 'grammar-view': {
				$('#direction-from option[value="1061"]').removeAttr('disabled').parent().trigger('update.fs');
				$('#direction-from option[value="1045"]').removeAttr('disabled').parent().trigger('update.fs');
				try {
					this.switchPreviewProfile('default');
				} catch (e) {
					console.log("ERR: Could not change the preview profile!");
				}
				break;
			}

			case 'ocr-view': {
				$('#ocrupload-source, #ocr-translation-block, #ocr-translation-block-right').hide();
				this.enableKeyboard();
				this.switchPreviewProfile('default');
				break;
			}

			case 'settings-view': {
				$('#btn-dictionaries').hide();
				$('#search-control-wrapper').removeClass('hidden');
				this.enableKeyboard();
				break;
			}

			case 'dictionaries-view': {
				var from = this.currentDirectionFrom,
					to = this.currentDirectionTo;

				// Force reload source and target language list without (activeViewID == 'dictionaries-view')
				// condition in setDirection() method evaluating to true, thus again hiding MT exclusive systems
				this.showAllSourceSystems(true);
				this.activeViewID = 'fakeview';
				this.unsetDirection();
				this.setDirection(from, to);
				this.enableKeyboard();
				break;
			}
			case 'template-view': {
				$('#btn-tamplate-back').addClass('hide');
				this.enableKeyboard();
				break;
			}
			case 'autoupdate-view': {
				$('#about-product-block').addClass('hide');
				this.enableKeyboard();
				break;
			}
			default: break;
		}

	},



    /**************************************************************************************
            TRANSLATION DIRECTION CONTROL
    **************************************************************************************/

	// Stores available languages and translation directions in easily traversable object
	registerLanguagePair: function (from, to, altNameFrom, altNameTo) {
		if (typeof this.languagePairs[from] == 'undefined')
			this.languagePairs[from] = new Array();
		this.languagePairs[from].push(to);

		var languageNameFrom = Locale['lang_' + from] || altNameFrom,
			languageNameTo = Locale['lang_' + to] || altNameTo,
			exists = { from: false, to: false },
			i = 0;

		for (; i < this.languages.length; i++) {
			if (this.languages[i].code == from) {
				exists.from = true;
			}
			else if (this.languages[i].code == to) {
				exists.to = true;
			}
		}

		if (!exists.from) {
			if (languageNameFrom)
				this.languages.push(new Language(languageNameFrom, from, langCodeToISO(from)));
		}
		if (!exists.to) {
			if (languageNameTo)
				this.languages.push(new Language(languageNameTo, to, langCodeToISO(to)));
		}
	},

	// Tests whether given source language has a target language
	hasTargetLanguage: function (source) {
		return !(typeof this.languagePairs[source] == 'undefined' || !this.languagePairs[source].length);
	},

	// Uptades selectable drop downs with registered translation directions
	updateDirections: function () {
		var view = this,
			opt = null;

		$('#direction-from, #direction-to')
			.empty()
			.each(function () {
				for (var i = 0; i < view.languages.length; i++) {
					if (this.id == 'direction-from' && !view.hasTargetLanguage(view.languages[i].code)) {
						continue;
					}
					opt = document.createElement('option');
					opt.setAttribute('value', view.languages[i].code);
					opt.innerHTML = view.languages[i].name;
					$(this).append(opt);
				}
			}).trigger('update.fs');
	},

	changeSrctoDetectedLanguage: function (from) {
		this.setDirection(from);
		this.currentSearch = '';
		if (this.activeViewID == 'synonyms-view') {
			this.getSynonyms(this.searchArea.value, true, 1);
		}
		else {
			this.getTranslations(this.searchArea.value);
		}
	},

	// Sets input language and translation direction globally (i.e. for dictionary, machine translator, settings etc.)
	setDirection: function (from, to, fromElement, toElement) {
		var self = this;

		console.log("INF: Direction change requested. From: " + from + ", to: " + to);

		if (from && from == this.currentDirectionFrom && to && to == this.currentDirectionTo)
			return false;

		if (typeof fromElement == 'undefined' || fromElement == null)
			fromElement = document.getElementById('direction-from');
		if (typeof toElement == 'undefined' || toElement == null)
			toElement = document.getElementById('direction-to');

		// Set source value whether it is passed or present
		if (typeof from != 'undefined' && from != null && typeof fromElement != 'undefined' && fromElement != null)
			fromElement.value = from;

		// Disable selection of target language options that are not processable
		$(toElement).children().each(
			function () {
				if ((typeof self.languagePairs[fromElement.value] == 'undefined' ||
					self.languagePairs[fromElement.value].indexOf(this.value) == -1) && fromElement.value != 0) {
					this.setAttribute('disabled', 'disabled');
				}
				else {
					this.removeAttribute('disabled');
				}
			});

		if (this.translatorWidget && this.translatorWidget && this.translatorWidget.isActive) {
			// In file translation view show only available MT systems
			this.hideUnavailableTargetSystems(fromElement.value, false);
		} else if (this.activeViewID == 'dictionaries-view') {
			// In dictionary settings view show only offline dictionaries
			this.hideMTExclusiveTargetSystems(fromElement.value, false);
		}

		return { from: fromElement, to: toElement };
	},

	// Clears stored current translation direction
	unsetDirection: function () {
		this.currentDirectionFrom = '';
		this.currentDirectionTo = '';
	},

	// Swaps translation direction 'from' <--> 'to'
	reverseDirection: function () {
		var from = document.getElementById('direction-from');
		var to = document.getElementById('direction-to');
		this.setDirection(to.value, from.value, from, to);
		this.printDetectedLanguage('');

		if (this.shouldTranslate(false)) {
			this.getTranslations();
		}
	},

	//
	canReverseDirection: function (fromElement, toElement) {
		// TODO: Check availability for exclusive and unavailable directions in MT in certain views
		return (typeof (this.languagePairs[toElement.value]) == 'undefined' ||
			this.languagePairs[toElement.value].indexOf(fromElement.value) == -1);
	},

    /**************************************************************************************
            DICTIONARY TRANSLTION FUNCTIONNALITY
    **************************************************************************************/

	getTranslations: function (input, fullsearch, isHistory) {
		// Clear current translation progress

		console.log('INF: Getting translations for: ' + input);
		window.clearTimeout(this.translationProgressTimeout);
		this.setTranslatedWord('');

		if (typeof window.Model == 'undefined' || Settings.ActivationStatuss == 'blacklist' || Settings.ActivationStatuss == 'fullexpired')
			return false;

		if (isHistory) {
			this.searchArea.value = input;
			this.searchArea.setCaretPosition(input.length);
		}

		if (typeof input == 'undefined' || !input)
			input = this.searchArea;


		var text = typeof input == 'string' ? input : input.value.trim().replace(/[\/\\]/g, '');

		if (text != '' && (text != this.currentSearch || this.activeViewID == 'welcome-view')) {
			//ga('send', 'event', 'getTranslations', this.currentDirectionFrom + '-' + this.currentDirectionTo, text, 1);
			this.printDetectedLanguage('');
			// Prevent useless queries
			window.clearTimeout(this.ETBTimeout);
			window.clearTimeout(this.ONLDICTimeout);
			this.currentSearch = text;

			// Current language pair is only available from MT widget - don't bother DicBrowser
			if (this.isMTExclusiveDirection()) {
				// But only when translation widget view is not active
				if (!this.translatorWidget.isActive) {
					this.getMachineTranslation(text);
				} else {
					return;
				}
			} else {
				window.Model.getTranslations(this.currentDirectionFrom + '-' + this.currentDirectionTo, text, typeof fullsearch == 'undefined' ? false : fullsearch);
				this.translationProgressTimeout = window.setTimeout(
					function () {
						this.showPreloader('full-view');
					}.bind(this), 3000);
			}

			if (!isHistory) {
				var from = this.currentDirectionFrom,
					to = this.currentDirectionTo;

				History.addRecord('full-view', function () {
					this.setDirection(from, to);
					this.getTranslations(text, typeof fullsearch == 'undefined' ? false : fullsearch, true);
				}.bind(this), [from, to, text, typeof fullsearch == 'undefined' ? false : fullsearch], this);
				this.setHistoryButtonStatuss('full-view');
			}


		}
		else if (text == '') {
			// Prevent useless queries
			window.clearTimeout(this.ETBTimeout);
			window.clearTimeout(this.ONLDICTimeout);
			// Clear translation output field if query is not valid
			this.translationsRetrieved('', true);
			this.printSuggestions('');
			this.printDetectedLanguage('');
			$('#context-holder').addClass('hidden');
			$('#mt-dict-block').addClass('hidden');
		}

	},

	setTranslatedWord: function (text) {
		var word = text.decodeString();
		console.log('INF: Setting actual translated word: "' + word + '"...');
		this.currentTranslated = word;
	},

	uploadFile: function (filename) {
		if (this.status != Status.Ready) {
			console.log('WRN: View not ready. Waiting...');
			window.setTimeout(function () { this.uploadFile(filename); }.bind(this), 200);
			return;
		}
		console.log('INF: Process is piped... upload File: ' + filename);
		filename = filename.trim();
		var input = document.getElementById('search-input') || document.getElementById('source_text');
		input.value = filename;
		$(input).removeClass('empty');
		input.focus();
		input.setCaretPosition(input.value.length);
		if (this.activeViewID != 'full-view') {
			this.switchSubview('full-view');
		}
		else {
			this.currentSearch = '';
			this.getTranslations(input);
		}
	},

	translateText: function (direction, text, piped, i) {
		if (this.status != Status.Ready) {
			console.log('WRN: View not ready. Waiting...');
			window.setTimeout(function () {
				this.translateText(direction, text, piped);
			}.bind(this), 200);
			return;
		} else if (text.split(/[ \n]+/).length > DIC_MAX && (typeof this.translatorWidget == 'undefined' || this.translatorWidget.status == Status.NotReady)) {
			var retry = typeof i == 'number' ? i + 1 : 0;
			if (retry < MT_MAX_RETRY) {
				console.log("WRN: Translator Widget is not ready! Waiting for it to become available...");
				window.setTimeout(function () {
					this.translateText(direction, text, piped, retry);
				}.bind(this), 500);
			}
			return;
		}


		if (typeof direction != 'undefined' && direction != null) {
			var dir = direction.split('-');
			if (dir.length > 1 && dir[1].trim() != '' && dir[0] != this.currentDirectionFrom && dir[1] != this.currentDirectionTo) {
				this.setDirection(dir[0], dir[1]);
			}
			else if (dir.length == 1 && dir[0] != this.currentDirectionFrom) {
				var from = document.getElementById('direction-from');
				from.value = dir[0];
				$(from).change();
			}
		}

		if (text && text.trim() != '') {
			if (piped) {
				console.log('INF: Process is piped...');
				text = text.trim();
				this.checkWindowHeight(true);
			}

			text = text.decodeString();

			if (text.split(/[ \n]+/).length > MT_MIN_WORDS && this.setCurrentSystem(this.currentDirectionFrom, this.currentDirectionTo)) {
				this.searchArea.blur();

				this.currentSearch = text;
				this.translatorWidget.textPluginResultClear();
				this.translatorWidget.textTranslator.setSourceText(this.currentSearch.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, ''));

				if (document.body.getAttribute('data-active-widget') != 'text') {
					this.switchToTextTranslator();
				}
				if (this.activeViewID != 'full-view') {
					this.switchSubview('full-view');
				}

				this.focusInput();
				return;
			}
			else if (this.translatorWidget && this.translatorWidget.isActive) {
				this.switchToDictionary();
			}
			var input = document.getElementById('search-input') || document.getElementById('source_text');
			input.value = text;
			$(input).removeClass('empty');
			input.focus();
			input.setCaretPosition(input.value.length);
			if (this.activeViewID == 'synonyms-view') {
				this.getSynonyms(input.value, false, 1);
			}
			else if (this.activeViewID != 'full-view' && this.activeViewID != 'synonyms-view') {
				this.switchSubview('full-view');
			}
			else {
				this.currentSearch = '';
				this.getTranslations(input);
			}
			this.checkWindowHeight();
		}
	},

	getOnlDicSystemList: function () {
		Settings.ONLDICSystems = Status.NotReady;
		$.ajax({
			url: Settings.ContextUrl + '/GetSystems',
			type: 'GET',
			context: this,
			cache: false,
			dataType: 'json',
			data: {
				appid: APP_ID
			},
			success: function (data) {
				console.log('INF: Online Dictionary system list retrieved');
				if (!data || !data.r) {
					Settings.ONLDICSystems = '[]';
					return true;
				}
				Settings.ONLDICSystems = data.r.d.systems;
				try {
					Model.changeSetting('OnlDicSystems', JSON.stringify(Settings.ONLDICSystems), '-1');
				}
				catch (e) {
					console.log('WRN: Unable to store Online Dictionary system list.');
				}
			},
			error: function (xhr, status, error) {
				console.log('ERR: Retrieving Online Dictionary system list failed: ' + status + '. Error: ' + error);
				Settings.ONLDICSystems = Status.Error;
			}
		});


	},

	isOnlDicAvailable: function (directionFrom, directionTo) {
		if (!Settings.ONLDICSystems || Settings.ONLDICSystems.length == 0 || Settings.ONLDICSystems == Status.Error)
			return false;
		for (var i = 0; i < Settings.ONLDICSystems.length - 1; i++) {
			if (Settings.ONLDICSystems[i].sourceLang == langCodeToISO(directionFrom) && Settings.ONLDICSystems[i].targetLang == langCodeToISO(directionTo)) {
				return true;
			}
		}

		return false;
	},

	translationsRetrieved: function (data, translated, isdialog) {
		this.hidePreloader('full-view');
		if (data.indexOf("id=\"dict-report-container\"") > -1) {
			$('#full-view-dialog').remove();
			var obj = document.createElement('span');
			obj.setAttribute("id", "full-view-dialog");
			obj.innerHTML = data;
			document.body.appendChild(obj);
			$('#ud-custom-dicts').fancySelect();
			$("#full-view-dialog").dialog({
				autoOpen: true,
				resizable: false,
				modal: true,
				show: { effect: "blind", duration: 800 },
				position: { my: "center top+15px ", at: "center top+15px", of: window },
				dialogClass: "no-close",
				width: 500,
				buttons: [
					{
						text: " ",
						click: function () {
							$(this).dialog("close");
						}
					}
				]
			});
			return;
		}
		if (this.currentSearch.split(/[ \n]+/).length == 0 && !translated) {
			return;
		} else if (translated) {
			this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] =
				typeof this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] != 'undefined'
					? this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] : [];
			this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo].unshift(this.currentSearch);
			if (data.length == 0) {
				//$('#translation-category').addClass('hidden');
				//document.getElementById('translation-category-content').innerHTML = data;
			}
			else {
				$('.recognizedLangMsg').remove();
			}
		}
		console.log('INF: Translations retrieved: ' + translated + '...');
		//if (this.activeViewID == 'welcome-view' && data.length > 0) {
		//    document.getElementById('translation-category-content').innerHTML += data;
		//    $('#translation-category').removeClass('hidden');
		//}
		//else if (this.activeViewID == 'synonyms-view' && !translated) {
		//    $('#related-synonym-panel').html('');
		//    $('#synonym-result-panel').html('<span class="error">' + Locale.text_nothingFound + '</span>');
		//    //if (this.currentSearch.split(/[ \n]+/).length > MT_MAX_REL_WORDS) {
		//    //    this.switchSubview('full-view');
		//    //}
		//}
		//else if (this.activeViewID == 'full-view') {
		var resultPanel = document.getElementById('result-panel');
		resultPanel.parentNode.scrollTop = 0;
		resultPanel.innerHTML = (data == this.currentSearch) ? '' : data;
		if (resultPanel.innerHTML.length > 0) {
			this.removeIntroduction();
		}

		window.clearTimeout(this.translationProgressTimeout);

		if (!translated) {
			var hasMTSystem = false;
			if (this.translatorWidget && this.translatorWidget.isActive) {
				View.translateText(this.currentDirectionFrom + '-' + this.currentDirectionTo, this.currentSearch);
				return;
			} else if (this.setCurrentSystem(this.currentDirectionFrom, this.currentDirectionTo)) {
				hasMTSystem = true;
				if (this.currentSearch.split(/[ \n]+/).length > MT_MIN_WORDS) {
					this.searchArea.value = '';
					this.checkWindowHeight();
					this.switchToTextTranslator();
					this.translatorWidget.textPluginResultClear();
					this.translatorWidget.textTranslator.setSourceText(this.currentSearch.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, ''));

					return;
				} else {
					this.getMachineTranslation(this.currentSearch, resultPanel);
				}
			}

		}

		if (data && data.length > 0 && (translated || this.currentSearch.split(/[ \n]+/).length <= MT_MAX_REL_WORDS || hasMTSystem == false)) {
			$('#mt-dict-block').addClass('hidden');
			$(resultPanel).removeClass('hidden');

			if (this.isOnlDicAvailable(this.currentDirectionFrom, this.currentDirectionTo)) {
				$('#online-dict-block').show();
			}

			var scripts = resultPanel.getElementsByClassName('executable'),
				i = 0;
			for (; i < scripts.length; i++) {
				eval(scripts[i].innerHTML);
			}

			$(resultPanel).find('.btn-toggle-expansion').each(
				function (i, e) {
					if (e.parentNode.getElementsByClassName('hide_in_compact').length > 0) {
						$(e).removeClass('hidden');
					}
				});

			if (Settings.ContextEnabled) {
				if (this.currentDirectionFrom == '99999') {
					this.contextRetrieved({ ContextRes: null }, this.currentSearch, true);
				}
				else {
					this.getContext(this.currentTranslated == '' ? this.currentSearch : this.currentTranslated);
				}
			}
		}
		//}
	},

	getContext: function (text) {

		$('#context-holder').addClass('hidden clamped');
		if (!Settings.ActivationStatuss || Settings.ActivationStatuss != 'active')
			return false;

		if (!text)
			text = this.currentTranslated.trim() == '' ? this.currentSearch : this.currentTranslated;

		$.ajax({
			type: 'GET',
			context: this,
			url: Settings.ContextUrl + '/contexts',
			data: { appID: APP_ID, search: text, langFrom: this.currentDirectionFrom, langTo: this.currentDirectionTo, hash: this.ETBHash },
			dataType: 'json',
			error: function (xhr, status, error) {
				console.log('ERR: Error retrieveing context! Status: ' + status, error);
				this.contextRetrieved({ ContextRes: null }, text, false);
			},
			success: function (data, status, xhr) {
				this.contextRetrieved(data, text, true);
			}
		});

	},

	contextRetrieved: function (result, text, success) {
		console.log('INF: Context retrieved for "' + text + '"...');

		if (this.currentSearch == text || this.currentTranslated == text) {

			var str = result.ContextRes;
			var arr = JSON.parse(str);

			if (!arr) {
				return;
				//arr = {
				//	entry: {
				//		context: [{
				//			src: {
				//				$t: success ? '<span class="error">' + Locale.text_nothingFound + '</span>' : '<span class="error">' + Locale.text_connectionError + '</span>'
				//			},
				//			trg: {
				//				$t: ''
				//			}
				//		}]
				//	}
				//};
			}

			$('#context-holder').removeClass('hidden');
			var height = 0;
			var cPane = this.contextArea;
			var navPane = document.getElementById('context-navigator');
			cPane.innerHTML = '';
			cPane.scrollLeft = 0;
			cPane.setAttribute('data-index', '1');

			navPane.innerHTML = '';

			$(arr.entry.context).each(function (index, item) {
				var cHolder = document.createElement('div');
				cHolder.className = 'context-holder selected' + (index == 0 ? ' selected' : '');
				cPane.appendChild(cHolder);

				$(cHolder).append(
					$(document.createElement('div')).html(item.src.$t),
					$(document.createElement('div')).html(item.trg.$t)
				);
				if (index == 0) {
					cPane.setAttribute('min-height', $(cHolder).height());
				}
				height += $(cHolder).height();
			});
			cPane.setAttribute('max-height', height);
		}
	},

	checkWindowHeight: function (fullHeight, minHeight) {
		if (typeof minHeight != 'undefined' ) {
			if (window.innerHeight < minHeight) {
				Model.changeWindowHeight(minHeight);
			}
			return;
		}
		if (typeof fullHeight != 'undefined' && fullHeight == false) {
			if (window.innerHeight != 38) {
				Model.changeWindowHeight(38);
			}
			var btnKeyboard = $('#btn-toggle-keyboard');
			if (btnKeyboard.hasClass('active')) {
				btnKeyboard.trigger('click', true);
				$('#keyboard-panel').addClass('hidden');
			}

			return;
		}
		var height = this.searchArea.style.height;
		this.searchArea.style.height = 'auto';
		var clientHeight = this.searchArea.clientHeight;
		if (this.searchArea.scrollHeight <= clientHeight * 3) {
			this.searchArea.style.height = this.searchArea.scrollHeight + 'px';
		}
		else if (this.searchArea.scrollHeight > clientHeight * 3) {
			this.searchArea.style.height = clientHeight * 3 + 'px';
		}

		if (Settings.DefaultViewPinned)
			return;

		height = document.getElementById('search-panel').getBoundingClientRect().top - 1;
		height += document.getElementById('search-panel').getBoundingClientRect().height;
		if (typeof document.getElementById('search-autocomplete-list') != 'undefined') {
			height += document.getElementById('search-autocomplete-list').getBoundingClientRect().height;
		}
		if ((typeof fullHeight != 'undefined' && fullHeight == true) || $('#fileupload-source').length > 0 || $('#ocrupload-source').length > 0 || (this.translatorWidget && this.translatorWidget.isActive)) {
			height = 498;
		}

		if (height < 38) {
			height = 38;
		}

		if (window.innerHeight < height) {
			Model.changeWindowHeight(height);
		}
	},

	getAutocomplete: function (text) {
		if (!this.isMTExclusiveDirection()) {
			text = text || this.searchArea.value;
			Model.getAutocomplete(text);
		}
	},

	autocompleteRetrived: function (text) {
		if (text.length == 0)
			return false;

		console.log('INF: AutocompleteRetrived...' + text);
		this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] =
			typeof this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] != 'undefined'
				? this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] : [];
		this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo] = this.currentAutocompleteHistory[this.currentDirectionFrom + '-' + this.currentDirectionTo].concat(text.split("\t"));
		$('#search-input').textcomplete('trigger');
	},

	switchPreviewProfile: function (type) {
		Model.switchPreviewProfile(type);
	},

	pronounceText: function (text) {
		Model.pronounceText(text);
	},

	addTranslation: function (type, text) {
		window.clearTimeout(this.machineTranslationTimeout);
		this.machineTranslationID = null;
		text = text || this.searchArea.value;
		View.checkWindowHeight(true, 420);
		Model.addTranslation(type, text.decodeString());
	},

	reportTranslation: function (postUrl, direction, text, sender, message, add) {
		var statusBlock;
		if (typeof add != 'undefined' && add == true) {
			statusBlock = document.getElementById('ud-add-status');
		}
		else {
			statusBlock = document.getElementById('ud-report-status');
		}
		statusBlock.innerHTML = Locale.text_reportSending;

		var postData = new Object();
		postData.appModule = APP_ID_2015;
		postData.profile = direction;
		postData.title = text;

		var translBox = document.getElementById('new-translation-report');
		if (typeof translBox != 'undefined' && translBox.value.trim() != '') {
			postData.text = '[new translation] ' + translBox.value;
		}
		else if (typeof message != 'undefined') {
			postData.text = message;
		}

		$.ajax({
			type: 'POST',
			context: this,
			url: postUrl,
			data: postData,
			error: function (xhr, status, error) {
				console.log('ERR: Error sending tranlsation report! Status: ' + status + '; ' + error);
				if (typeof statusBlock != 'undefined') {
					statusBlock.innerHTML = Locale.text_reportFailed;
				}
			},
			success: function (data, status, xhr) {
				console.log('INF: Translation report successful!');
				var sb = document.getElementById('report-status');
				statusBlock.innerHTML = Locale.text_reportSuccess;
				sender.style.display = 'none';
				$("#full-view-dialog").dialog("close");
				this.currentSearch = '';
				this.getTranslations(this.searchArea.value);
			}
		});

	},

	editUserDictionary: function (postUrl, direction, text, sender, path) {
		path = path || document.getElementById('ud-custom-dicts').value;

		if (typeof direction == 'undefined') {
			Model.editExistingUserDict(this.currentDirectionFrom + '-' + this.currentDirectionTo, path.decodeString());
		}
		else {
			var valid = true;
			var focused = false;
			$('#new-translation, #new-comment').each(
				function () {
					if (this.value.replace(/\n/g, '').trim() == '') {
						this.className += ' error';
						window.setTimeout((function () { $(this).removeClass('error'); }).bind(this), 1000);
						this.value = '';
						console.log(this.id);
						if (this.id == 'new-translation') {
							this.setAttribute('placeholder', Locale.text_enterTranslation);
						}
						else if (this.id == 'new-comment') {
							this.setAttribute('placeholder', Locale.text_enterComment);
						}

						if (!focused) {
							this.focus();
							focused = true;
						}

						$(this).addClass('italic').off('keydown').on('keydown',
							function (event) {
								$(this).removeClass('italic');
								this.setAttribute('placeholder', '');
							});

						valid = false;
					}

				});
			if (valid) {
				var report = $('#ud-send').is(':checked');

				if (report) {
					this.reportTranslation(postUrl, direction, text, sender, $('#new-translation').val() + '; ' + $('#new-comment').val(), true);
				}

				Model.editUserDictionary(path.decodeString(), direction, $('#new-translation').val(), $('#new-comment').val(), true);
				setTimeout(function () {
					if (!report) {
						$("#full-view-dialog").dialog("close");
						this.currentSearch = '';
						this.getTranslations(this.searchArea.value);
					}
				}.bind(this), 500);
			}

		}
	},

	getETBTranslations: function (url, text, langFrom, langTo, uiLang, hash) {

		// Show the controls and fields, if hidden
		//var e = document.getElementById('btn-disable-etb');
		//$(e).show();

		//e = document.getElementById('btn-enable-etb');
		//$(e).hide();

		e = document.getElementById('etb-status');
		$(e).show();

		e = document.getElementById('etb-results');
		$(e).show();


		if (!Settings.ETBEnabled && this.currentDirectionFrom != '99999') {
			// If there is no flag that ETB is enabled or it is set to false, enable searching
			Model.changeSetting('ETB', true, this.currentDirectionFrom + '-' + this.currentDirectionTo);
			Settings.ETBEnabled = true;
		}

		// If results from ETB are retrieved, prevent second request
		if ($(e).hasClass('retrieved')) {
			return true;
		}

		var statusBlock = document.getElementById('etb-status');
		text = text.decodeString().trim();

		if (typeof statusBlock == 'undefined' || text != this.currentSearch)
			return false;

		statusBlock.innerHTML = Locale.text_etbSearching;

		// Don't search in ETB instantly, current query might not be final
		this.ETBTimeout = setTimeout(function () {
			$.ajax({
				type: 'POST',
				context: this,
				cache: false,
				url: url + '&search=' + (this.currentTranslated.trim() == '' ? text : this.currentTranslated) + '&LangFrom=' + langFrom + '&LangTo=' + langTo + '&uiLang=' + uiLang + '&hash=' + (this.currentTranslated.trim() == '' ? hash : Model.getHashValue(this.currentTranslated)),
				dataType: 'html',
				error: function (xhr, status, error) {
					console.log('ERR: Error retrieveing context! Status: ' + status + '; ' + error);
					statusBlock.innerHTML = Locale.text_etbError;
					statusBlock.className += ' error';
				},
				success: function (data, status, xhr) {
					console.log('INF: ETB translations retrieved.');
					this.ETBTranslationsRetrieved(data, text, langFrom, langTo);
				}
			});
		}.bind(this), 2000);


	},

	ETBTranslationsRetrieved: function (result, text, directionFrom, directionTo) {
		if (this.currentSearch != text)
			return false;

		var resultBlock = document.getElementById('etb-results');
		var statusBlock = document.getElementById('etb-status');

		if (typeof resultBlock == 'undefined' || typeof statusBlock == 'undefined')
			return false;

		if (result.indexOf('noResults') == -1 && typeof resultBlock != 'undefined') {
			$(statusBlock).hide();
			statusBlock.innerHTML = '';

			$(result).each(
				function () {
					$(this).children().each(
						function () {
							if (this.className && this.className == 'EntryTitle') {
								$(this).wrap('<a class="transl" tabindex="-1" href="#" onclick="View.translateText(\'' + directionTo + '-' + directionFrom + '\', \'' + this.innerHTML + '\');" />');
							}
						});
					resultBlock.appendChild(this);
				});

			resultBlock.className = 'retrieved';
			$('#etb-dict-block').removeClass('hide');

		}
		else {
			statusBlock.innerHTML = Locale.text_etbNoResults;
		}

	},

	disableETBTranslations: function () {
		var e = document.getElementById('etb-status');
		$(e).hide();

		e = document.getElementById('etb-results');
		$(e).hide();

		//e = document.getElementById('btn-disable-etb');
		//$(e).hide();

		//e = document.getElementById('btn-enable-etb');
		//$(e).show();


		Settings.ETBEnabled = false;

		if (this.currentDirectionFrom == '99999') // Non-existant setting, don't bother DicBrowser.exe
			return false;

		// Notify DicBrowser.exe to store the setting
		Model.changeSetting('ETB', false, this.currentDirectionFrom + '-' + this.currentDirectionTo);

	},

	getONLDICTranslations: function (text, langFrom, langTo, uiLang, hash) {
		if (!this.isOnlDicAvailable(this.currentDirectionFrom, this.currentDirectionTo))
			return false;

		//if (!Settings.IsActivated)
		//    return false;


		e = document.getElementById('onldic-status');
		$(e).show();

		e = document.getElementById('onldic-results');
		$(e).show();


		// If results from ONLDIC are retrieved, prevent second request
		if ($(e).hasClass('retrieved')) {
			return true;
		}

		var statusBlock = document.getElementById('onldic-status');
		text = text.decodeString().trim();

		if (typeof statusBlock == 'undefined' || text != this.currentSearch)
			return false;

		statusBlock.innerHTML = Locale.text_onldicSearching;

		// Don't search in ETB instantly, current query might not be final
		this.ONLDICTimeout = setTimeout(function () {
			$.ajax({
				type: 'GET',
				context: this,
				cache: false,
				url: Settings.ContextUrl + '/getTranslation?appID=' + APP_ID + '&text=' + (this.currentTranslated.trim() == '' ? text : this.currentTranslated) + '&system=' + this.currentDirectionFrom + '_' + this.currentDirectionTo + '&langFrom=' + this.currentDirectionFrom + '&uiLang=' + uiLang + '&h=' + (this.currentTranslated.trim() == '' ? hash : Model.getHashValue(this.currentTranslated)),
				dataType: 'json',
				error: function (xhr, status, error) {
					console.log('ERR: Error retrieveing context! Status: ' + status + '; ' + error);
					statusBlock.innerHTML = Locale.text_onldicError;
					statusBlock.className += ' error';
				},
				success: function (data, status, xhr) {
					statusBlock.innerHTML = '';
					console.log('INF: ONLDIC translations retrieved.');
					this.ONLDICTranslationsRetrieved(data, text, langFrom, langTo);
				}
			});
		}.bind(this), 0);
	},

	ONLDICTranslationsRetrieved: function (result, text, directionFrom, directionTo) {
		if (this.currentSearch != text)
			return false;

		var resultBlock = document.getElementById('onldic-results');
		var statusBlock = document.getElementById('onldic-status');

		if (typeof resultBlock == 'undefined' || typeof statusBlock == 'undefined')
			return false;


		if (!result.r || !result.r.entries) {

			statusBlock.innerHTML = Locale.text_onldicNoResults;
		}
		else {
			var str = '<entries>' + result.r.entries + '</entries>';
			console.log('INF: OnlDic Entries retrieved.' + str);
			Model.transformOnlDicResult(str);
		}
	},

	//    ONLDICTranslationsRetrieved:
	OnlDicTransformedStringRetrieved: function (transformedResult, text) {
		if (this.currentSearch != text)
			return false;

		var resultBlock = document.getElementById('onldic-results');
		var statusBlock = document.getElementById('onldic-status');

		console.log('INF: transformed OnlDic result retrieved: ' + transformedResult);

		if (transformedResult && transformedResult.trim() != '') {

			$(statusBlock).hide();
			$(transformedResult).each(
				function () {
					$(this).children().each(
						function () {
							if (this.className && this.className == 'EntryTitle') {
								$(this).wrap('<a class="transl" tabindex="-1" href="#" onclick="View.translateText(\'' + 1033 + '-' + 1062 + '\', \'' + this.innerHTML + '\');" />');
							}
						});
					resultBlock.appendChild(this);
				});
			resultBlock.innerHTML = transformedResult;
			$('#online-dict-block').find('.btn-toggle-expansion').each(
				function (i, e) {
					if (e.parentNode.getElementsByClassName('hide_in_compact').length > 0) {
						$(e).removeClass('hidden');
					}
				});
			resultBlock.className = 'retrieved';
			$('#online-dict-block').removeClass('hide');
		}
		else {
			statusBlock.innerHTML = Locale.text_onldicNoResults;
		}
	},

	printSuggestions: function (data) {
		console.log('INF: Suggestions retrieved.');

		var suggestions = data.split('!-!'),
			list = document.createElement('ol'),
			item = null,
			i = 0;
		for (; i < suggestions.length; i++) {
			if (suggestions[i].trim() == '')
				continue;

			item = document.createElement('li');
			if (this.activeViewID == 'synonyms-view') {
				item.innerHTML = '<a tabindex="-1" onclick="View.translateText(\'' + this.currentDirectionFrom + '-' + this.currentDirectionFrom + '\', this.innerHTML);" href="#">' + suggestions[i].trim() + '</a>';
			}
			else {
				item.innerHTML = '<a tabindex="-1" onclick="View.translateText(\'' + this.currentDirectionFrom + '-' + this.currentDirectionTo + '\', this.innerHTML);" href="#">' + suggestions[i].trim() + '</a>';
			}
			list.appendChild(item);
		}
		var pane;
		if (this.activeViewID == 'full-view') {
			if ($('#mt-dict-block').hasClass('hidden')) {
				pane = document.getElementById('related-translation-panel');
			}
		}
		else if (this.activeViewID == 'synonyms-view') {
			pane = document.getElementById('related-synonym-panel');
		}

		if (!pane || typeof pane == 'undefined')
			return;

		if (!data || data.trim() == '' || data.trim() == '!-!') {
			pane.parentNode.style.display = 'none';
			pane.parentNode.nextElementSibling.style.right = '0';
		}
		else {
			pane.innerHTML = '';
			pane.appendChild(list);
			pane.scrollTop = 0;
			pane.parentNode.style.display = 'block';
			pane.parentNode.nextElementSibling.style.right = '180px';
		}
	},

	printDetectedLanguage: function (language) {
		$('.recognizedLangMsg').remove();
		if (language != '' && document.getElementById('direction-from').value != language) {
			console.log('INF: recognized language: ' + language);
			var span = document.createElement('span');
			span.className = "recognizedLangMsg";

			var langTitle = eval('Locale.lang_' + language);

			if (langTitle && typeof langTitle != 'undefined') {
				var resultPanel;
				if (this.activeViewID == 'full-view') {
					span.innerHTML = Locale.text_detectedLanguage + '<a tabindex="-1" href="#" id="btn-detected_language"  onclick="javascript:View.changeSrctoDetectedLanguage(\'' + language.trim() + '\');" class="button">' + langTitle + '</a>' + Locale.text_detectedLanguageEnd;
					resultPanel = document.getElementById('result-panel');
				}
				else if (this.activeViewID == 'synonyms-view') {
					span.innerHTML = Locale.text_detectedLanguageSyn + '<a tabindex="-1" href="#" id="btn-detected_language"  onclick="javascript:View.changeSrctoDetectedLanguage(\'' + language.trim() + '\');" class="button">' + langTitle + '</a>' + Locale.text_detectedLanguageEndSyn;
					resultPanel = document.getElementById('synonym-result-title');
				}
				if (typeof resultPanel != 'undefined') {
					this.removeIntroduction();
					resultPanel.parentNode.scrollTop = 0;
					resultPanel.parentNode.insertBefore(span, resultPanel.parentNode.firstChild);
				}
			}
		}
	},

	clearInput: function (input) {
		if (typeof input == 'undefined')
			input = document.getElementById('search-input');

		input.value = '';
		//this.updateInputView(input);
		//this.autocompleteArea.innerHTML = '';
		input.className += ' empty';
		input.focus();
		input.placeholder = Locale.text_enterText;
		//$('#report-translation').addClass('hide');
	},

	focusInput: function () {
		if (this.activeViewID == 'full-view' && this.translatorWidget && this.translatorWidget.isActive &&
			document.body.getAttribute('data-active-widget') == 'text' && document.activeElement.id != 'search-input') {
			$('#mt-search-input').focus();
		} else {
			this.searchArea.focus();
		}
	},

	updateInputView: function (input) {
		// Update the height of text area according to amount of text it contains
		$(input).height(0);
		$(input).height(input.scrollHeight);
		var sp;
		if (input.value.length == 0) {
			// If text area is empty scroll to top
			sp = document.getElementById('search-panel');
			sp.scrollTop = 0;
		}
		else if (input.getSelection().end == input.value.length) {
			// If caret is at the end, scroll down
			sp = document.getElementById('search-panel');
			sp.scrollTop = input.scrollHeight;
		}

	},


	toggleKeyboard: function (triggered) {
		if (typeof this.keyboard == 'undefined' || !this.generateKeyboard()) {
			return false;
		}

		if (!triggered) {
			this.checkWindowHeight(true);
		}

		var panel = $('#keyboard-panel'),
			button = $('#btn-toggle-keyboard');

		if (!panel.hasClass('active') && window.KEY_ACT) {
			window.setTimeout(function () {
				$('#keyboard-panel .keyboard-item:first').focus();
			}, 100);
		}
		panel.toggleClass('active');
		button.toggleClass('active');

	},

	disableKeyboard: function () {
		if ($("#dictation_button").hasClass("stop_dictation")) {
			$("#dictation_button").trigger({ type: "click", which: 1 });
			$("#dictation_button").addClass("inactive");
		}
		else {
			$("#dictation_button").addClass("inactive");
		}

		var btnKeyboard = $('#btn-toggle-keyboard');
		if (btnKeyboard.hasClass('active')) {
			btnKeyboard.trigger('click', true);
		}
		btnKeyboard.attr('data-disabled', true);

		if (btnKeyboard.attr('tabindex') != '-1') {
			btnKeyboard.attr('data-tabindex', btnKeyboard.attr('tabindex')).attr('tabindex', '-1');
		}
	},

	enableKeyboard: function () {
		$("#dictation_button").removeClass("inactive");
		var btnKeyboard = $('#btn-toggle-keyboard');
		btnKeyboard.attr('data-disabled', false).attr('tabindex', btnKeyboard.attr('data-tabindex'));
	},

	generateKeyboard: function (lang) {
		lang = lang || document.getElementById('direction-from').value;
		if (typeof this.keyboard != 'undefined' && this.keyboard != null && this.keyboard.lang == lang)
			return true;

		this.keyboard = new Keyboard(lang);
		var kb = document.getElementById('keyboard-panel');

		if (typeof this.keyboard != 'undefined' && this.keyboard != null && this.keyboard.keySet.length > 0) {
			if ($(kb).is(':visible')) {
				var self = this;
				$(kb).fadeOut(100,
					function () {
						kb.innerHTML = self.keyboard.keySet;
						$(this).fadeIn(100);
					});
			}
			else {
				kb.innerHTML = this.keyboard.keySet;
			}
			return true;
		} else if ($(kb).hasClass('active')) {
			$(kb).removeClass('active');
			$('#btn-toggle-keyboard').removeClass('active');
		}

		kb.innerHTML = '';
		this.keyboard = null;
		return false;
	},

	onKeyboardClick: function (sender, focus) {

		var isWidgetActive = typeof this.translatorWidget != 'undefined' && this.translatorWidget.isActive == true,
			input = isWidgetActive ? document.getElementById('mt-search-input') : document.getElementById('search-input'),
			selection = input.getSelection(),
			char = sender.getAttribute('href');

		if (char == '\n') {
			$(input).trigger(jQuery.Event('keyup', { keyCode: 13, which: 13 }));

			if (!isWidgetActive) {
				return;
			}
		}

		if (char == '\bs') {
			if (selection.start == 0) {
				return;
			} else if (selection.start == selection.end && selection.start == input.value.length) {
				input.value = input.value.substring(0, input.value.length - 1);
			} else {
				input.value = input.value.substring(0, selection.start - 1) + /*char +*/ input.value.substring(selection.end, input.length);
			}

			input.setCaretPosition(selection.start - 1);

		} else {
			if (selection.start == selection.end && selection.start == input.value.length) {
				input.value += char;
			} else {
				input.value = input.value.substring(0, selection.start) + char + input.value.substring(selection.end, input.length);
			}

			input.setCaretPosition(selection.start + 1);
		}


		if (focus) {
			input.focus();
		}
		else {
			sender.focus();
		}

		if (isWidgetActive) {
			$(input).trigger('input');
		} else {
			this.getAutocomplete(input.value);

			if (this.shouldTranslate(false)) {
				this.getTranslations(input);
			}
		}

	},

	shouldTranslate: function (isKeyAction) {
		return (this.activeViewID == 'full-view') && !(this.translatorWidget && this.translatorWidget.isActive) && ((isKeyAction && Settings.Autotranslate) || !isKeyAction);
	},

	toggleSpeaker: function (enabled) {
		if (this.status == Status.NotReady) {
			window.setTimeout(function () { View.toggleSpeaker(enabled); }, 200);
			return;
		}

		var speaker = document.getElementById('btn-pronounce');
		if (!speaker) return;

		speaker.setAttribute('data-disabled', !enabled);
	},

	toggleSpeakerRight: function (enabled) {
		if (this.status == Status.NotReady) {
			window.setTimeout(function () { View.toggleSpeakerRight(enabled); }, 200);
			return;
		}

		var speaker = document.getElementById('btn-pronounce-right');
		if (!speaker) return;

		speaker.setAttribute('data-disabled', !enabled);
	},
	setHistoryButtonStatuss: function (ID) {
		var back = $('#btn-history-back'),
			forward = $('#btn-history-forward');

		if (!History.canGoForward(ID)) {
			forward.attr('data-disabled', true).addClass('disabled');
			if (forward.attr('tabindex') != '-1') {
				forward.attr('data-tabindex', forward.attr('tabindex')).attr('tabindex', '-1');
			}
		}
		else {
			forward.attr('data-disabled', false).removeClass('disabled').attr('tabindex', forward.attr('data-tabindex'));

		}
		if (!History.canGoBack(ID)) {
			back.attr('data-disabled', true).addClass('disabled');
			if (back.attr('tabindex') != '-1') {
				back.attr('data-tabindex', back.attr('tabindex')).attr('tabindex', '-1');
			}
		}
		else {
			back.attr('data-disabled', false).removeClass('disabled').attr('tabindex', back.attr('data-tabindex'));
		}
	},

	changeJSSetting: function (key, value) {
		console.log('INF: changing Settings: ' + key + ' with value: ' + value);
		if (key == 'AutoCheckUpdates') {
			Settings[key] = value == '1' ? true : false;
			var toggler = document.getElementById('AutoCheckUpdates');
			if (typeof toggler != 'undefined') {
				toggler.checked = Settings.AutoCheckUpdates;
				toggler.setAttribute('data-content', toggler.checked ? Locale.label_on : Locale.label_off);
				toggler.setAttribute('data-tooltip', toggler.checked ? Locale.label_on : Locale.label_off);
			}
			document.body.setAttribute('autocheckupdates', Settings.AutoCheckUpdates);
		}
		else {
			Settings[key] = value;
			if (key == 'saassstring') {
				this.RefreshAutoupdate(true);
			}
			else if (key == 'ActivationStatuss') {
				document.body.setAttribute('activation-statuss', value);
				if (value == 'active')
					$('#global-fileupload').fileupload('enable');
				else
					$('#global-fileupload').fileupload('disable');
			}
			else if (key == 'LicenceType') {
				document.body.setAttribute('LicenceType', value);
			}
		}
	},

	notifyUser: function (param, value) {
		if (typeof param == 'undefined')
			return;
		console.log('INF: Notify user: ' + param + ' value: ' + value);
		if (param == 'updateinstalled') {
			if (typeof value != 'undefined' && value == 'true') {
				Notify(Locale.String_Updates_installed, 'success', function () { $.noty.closeAll(); });
			}
			else {
				Notify(Locale.String_Updates_installed2, 'success');
			}
		}
		else if (param == 'updateavailable') {
			Notify(Locale.String_Updates_available, 'success', function () { $.noty.closeAll(); });
		}
		else if (param == 'upgradeavailable') {
			Notify(Locale.String_Upgrade_available, 'success', function () { $.noty.closeAll(); });
		}
		else if (param == 'willExpire') {
			Notify(Locale[value], 'warning', function () { $.noty.closeAll(); });
		}
		else if (param == 'updateInstalled') {
			Notify(Locale[value], 'information', function () { $.noty.closeAll(); });
		}
	},

	setWindowSize: function () {
		var windowHeight = window.innerHeight;
		document.getElementById('resizable').style.height = windowHeight + "px";
		document.body.style.height = windowHeight + "px";
		if (windowHeight <= 38) {
			$("#resizable").resizable({ disabled: true }).addClass('strip');

		}
		else {
			$("#resizable").resizable({ disabled: false }).removeClass('strip');
		}
		var windowWidth = window.innerWidth;
		document.body.style.width = windowWidth + "px";
		document.getElementById('resizable').style.width = windowWidth + "px";
		console.log(document.body.style.width + 'x' + document.body.style.height);
		//this.documentContentHeight = windowHeight;
        $("#dictation-trans").css("height", (windowHeight - 80) + "px");
	},

	showPreloader: function (viewID, className) {
		// Shows preloader animation only in certain views according to
		// document.body active view attribute + preloades class name.
		// If new views which require preloader functionallity are added,
		// the CSS file must be updated respectively.
		// An extra class name can be added.
		viewID = viewID || this.activeViewID;
		if (!this.preloaderArea.hasClass(viewID)) {
			this.preloaderArea.addClass(viewID);
		}

		if (typeof className == 'string' && className.length > 0 && !this.preloaderArea.hasClass(className)) {
			this.preloaderArea.addClass(className);
		}
	},

	hidePreloader: function (viewID, className) {
		viewID = viewID || this.activeViewID;

		if (this.preloaderArea.hasClass(viewID)) {
			this.preloaderArea.removeClass(viewID);
		}

		if (typeof className == 'string' && className.length > 0 && this.preloaderArea.hasClass(className)) {
			this.preloaderArea.removeClass(className);
		}
	},
	removeIntroduction: function (viewID, preserveClass) {
		viewID = viewID || this.activeViewID;
		if (typeof this.introArea != 'undefined' && this.introArea != null) {

			var introduction = this.introArea.find('.' + viewID).stop().addClass('animated bounceOutDown');
			window.setTimeout(function () {
				introduction.remove();
			}, 2000);

			if (!(typeof preserveClass == 'boolean' && preserveClass)) {
				$('#' + viewID).removeClass('transparent');
			}


			if (this.introArea.children().length == 0) {
				this.introArea.remove();
				this.introArea = null;
			}
		} else if (this.activeView.hasClass('transparent')) {
			this.activeView.removeClass('transparent');
		}
	}


};

// Append main initalization script to a set of scripts
// called after general settings object has been initialized 
window.InitStack.push(function () {

	// Language dependant messages and user iterface elements
	Locale = new Localization(Settings.UILang);

	// Object for keeping view-dependant histroy records
	History = new HistoryManager();

	// Main object (View)
	View = new Dictionary();

	// Register available language pairs for local dictionaries
	for (var i = 0; i < Settings.LanguagePairs.length; i++) {

		var pairs = Settings.LanguagePairs[i].split('-');
		if (pairs[0] != pairs[1])
			View.registerLanguagePair(pairs[0], pairs[1]);
	}

	// Initialize Translation and its View functionallity, set default direction
	View.initDictionary();
	localizeView(document);

	// Visual fixes for localized elements
	$('#main-header .navigation-item').each(
		function () {
			var width = 0,
				clone = $(this).clone()
					.css({ 'visibility': 'hidden', 'display': 'inline' })
					.appendTo(document.body);

			this.style.width = [clone.innerWidth() + 5, 'px'].join('');
			clone.remove();
		});

	// Runtime styles
	$('#runtime-style').text(function (i, text) {
		var style = new Array(),
			file_clone = $(document.getElementById('btn-translate-file'))
				.clone()
				.removeClass('hide')
				.css({ 'visibility': 'hidden' })
				.appendTo(document.body),
			ocr_clone = $(document.getElementById('btn-start-ocr-process'))
				.clone()
				.removeClass('hide')
				.css({ 'visibility': 'hidden' })
				.appendTo(document.body);

		style = style.concat([
			'#mt-result-wrapper .translated-no-preview::after', '{',
			'content:', '\'' + Locale['text_docTranslationFinished'] + '\'', ';',
			'}'], [
				'#doc-translation-block-top', '{',
				'min-width:', (file_clone.outerWidth() + 35) + 'px', ';',
				'}'], [
				'#ocr-top-controls', '{',
				'min-width:', (ocr_clone.outerWidth() + 35) + 'px', ';',
				'}']);

		file_clone.remove();
		ocr_clone.remove();
		return style.join(' ');
	});


	var cDir = Settings.LastProfile ? Settings.LastProfile.split('-') : ['1062', '1033'];
	View.setDirection(cDir[0], cDir[1]);

	//if (Settings.IsActivated) {
	//    Notify('Tu esi aktīvs un pilntiesīgs izmantot visu, ko Tildes Birojs tev var sniegt.', 'success');
	//} else {
	//    Notify('Tu esi pasīvs, un Tildes Birojs tev tik viegli neatdosies.', 'error');
	//}
});


$(document).ready(function () {

	if (typeof Model == 'undefined' || Model == null) {
		// <script> tag in string for some reason messes real bad with intellij
		console.log("ERR: Model not ready! Try changing < script > tag order in representing HTML file.");
		return false;
	}

	// Load cross-session application Settings
	try {
		Model.getDictionarySettings(
			// On success
			function (response) {
				console.log('INF: Settings retrieved...');
				console.log(response);

				try {
					window.Settings = JSON.parse(response);
					$("body").attr("ProductName", window.Settings.ProductName);
				} catch (e) {
					console.log('ERR: Unable to parse Settings: ' + e);
					console.log('WRN: Using predefined settings...');
				}
				var i = 0,
					scripts = window.InitStack;

				for (; i < scripts.length; i++) {
					if (typeof scripts[i] == 'function') {
						scripts[i]();
					}
				}
				if (window.Settings.ActivationStatuss != 'active') {
					$('#global-fileupload').fileupload('disable');
				}
				else {
					$('#global-fileupload').fileupload('enable');
				}
			},
			// On error
			function (error_code, error_message) {
				console.log('ERR: Error while retrieving settings: ' + error_message);
			}
		);



	}
	catch (e) {
		console.log('ERR: Unable to get Settings: ' + e);
		console.log('WRN: Using predefined settings...');

		var i = 0,
			scripts = window.InitStack;

		for (; i < scripts.length; i++) {
			if (typeof scripts[i] == 'function') {
				scripts[i]();
			}
		}
	}

});


Dictionary.prototype.toggleContext = function (sender) {
	var enabled = sender.getAttribute('data-enabled').toBoolean();
	var contextPanels = document.getElementsByClassName('context-panel-content');
	for (var i = 0; i < contextPanels.length; i++) {
		var contextPanel = contextPanels[i];
		if (enabled) {

			$(contextPanel).animate(
				{
					height: '0px'
				}, {
					duration: 200,
					complete: function () {
						document.getElementById('synonym-context-panel').innerHTML = '';
						document.getElementById('context-panel').innerHTML = '';
					}
				}
			);
		}
		else {
			contextPanel.style.height = 'auto';
		}
	}

	var contextbtns = document.getElementsByClassName('btn-toggle-context');
	for (var k = 0; k < contextbtns.length; k++) {
		var contextbtn = contextbtns[k];
		if (typeof contextbtn != 'undefined' && contextbtn != null) {
			contextbtn.setAttribute('data-enabled', (!enabled).toString());
			contextbtn.setAttribute('data-tooltip', !enabled ? Locale.label_on : Locale.label_off);
		}
	}
	if (!enabled && this.currentSearch && this.currentSearch.trim() != '') {

		if (this.activeViewID == 'synonyms-view') {
			this.getSynonymContext();
		}
		else {
			this.getContext();
		}
	}
	Settings.ContextEnabled = !enabled;

	try {
		Model.changeSetting('context', !enabled, '-1');
	}
	catch (e) {
		console.log('WRN: Unable to save setting.');
	}

};

Dictionary.prototype.addNotification = function (target, text, className) {
	if (target == 'updates') {
		document.body.setAttribute('has-updates', true);
	}
	else {
		var targetElement = $('#main-navigation .navigation-item[href^="' + target + '"]');
		if (targetElement) {
			$('#main-navigation .navigation-item[href^="' + target + '"] + .info').remove();
			info = document.createElement('span');
			info.className = typeof className == 'string' && className.length ? 'info ' + className : 'info';
			info.innerHTML = text;
			targetElement.after(info);
		}
	}
};
