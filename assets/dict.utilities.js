// *********************************************************
//		CONSTANTS AND FLAGS
// *********************************************************
var APP_ID = 'TBJ2014',		    // Global application identifier
	APP_ID_2015 = 'TBJ2015',	// Global application identifier
	MT_MIN_WORDS = 25,		    // If word count is greater than MT_MIN_WORDS, automatically navigate to MT
	MT_MAX_REL_WORDS = 2,	    // If word count is greater than MT_MAX_REL_WORDS, dont show related entries
	MT_LANG_PREFIX = '{mt}',    // Prefix language identifiers only available in MT, i.e., [MT]de, [MT]jp
	MT_MAX_RETRY = 50,          // Number of times the application should retry comunicating with MT, if it's not ready yet
	ASR_MAX_RETRY = 17,         // Same thing as MT_MAX_RETRY
	DIC_MAX = 6, 			    // If word count is less than DIC_MAX, don't query DicBrowser for translatiosn
	T_CNTX = false, 		    // Whether context menu has set transparent selection on selected elements
	M_HIST = false,			    // Indicator wether history drop-down is opened; as it is not a native control, it needs to be handeled differently
	KEY_ACT = false;		    // Indicator wether action on drop downs is caused by a keyboard key press


// *********************************************************
//		MAIN GLOBAL OBJECTS
// *********************************************************
// Instance of Dictionary()
var View = null,
	// Instance of Localization()
	Locale = null,
	// Instance of HistoryManager()
	History = null,
	// A set of initalization scripts for various views
	InitStack = new Array(),
	// FIXME: Remove global variable ViewType and use View.activeViewID instead!
	ViewType = 'full',
	// Cross-component Settings object
	Settings = {
		ProductName: 'Tildes Birojs',
        UILang: '1033',
		Autotranslate: 'true',
		LetAPIUrl: 'https://www.letonika.lv/Letonikatbwebapp',
		OcrAPIUrl: 'http://91.223.165.38:3001',
		AsrAPIUrl: 'https://runa.tilde.lv',
        AsrResample: '0',
		//AsrAPIUrl: 'http://192.168.2.73:8889',
		ContextUrl: 'http://tbcontext.tilde.com/api',
		LanguagePairs: [
			'1033-1062', '1062-1033', '1049-1062',
			'1062-1049', '1031-1062', '1062-1031',
			'1036-1062', '1062-1036', '1062-1040',
			'1040-1062', '1033-1033'/*, '0000-1062'*/],
		LastProfile: '1033-1062',
		MTUrl: 'https://www.letsmt.eu/ws/',
		ActivationStatuss: 'active',
		AutoCheckUpdates: false,
		WordTemplates: false,
		ContextEnabled: true,
		TutorialPopup: true,
		FirstRun: true,
		//OnlDicEnabled: true,
		Holidays: {
			date: '2015-02-22',
			nameDay: 'Rigonda, Adrians, Adriāna, Ārija, Adrija'
		},
		DefaultLang: '1033',
		DefaultProf: '1062-1033',
		ViewsPinned: 'welcome-view|full-view|synonyms-view|reference-view|grammar-view|template-view|ocr-view|asr-view|asr-recording-view|literature-view',
		ActiveViewID: 'full-view',
		OCRTextRecognitionStatus: [],
		ASRTextRecognitionStatus: [],
		DictationStatus1: [],
		DictationStatus: []
	};



// *********************************************************
//		LANGUAGE AND LOCALIZATION
// *********************************************************

function Language(name, code, iso) {
	this.name = name;
	this.code = code;
	this.iso = iso;
}

function langCodeToISO(code) {
	switch (code) {
		case '1062': return 'lv';
		case '1033': return 'en';
		case '1063': return 'lt';
		case '1061': return 'et';
		case '1049': return 'ru';
		case '1031': return 'de';
		case '1036': return 'fr';
		case '1045': return 'pl';
		default: return null;
	}
}

function langCodeTotriISO(code) {
	switch (code) {
		case '1062': return 'lav';
		case '1033': return 'eng';
		case '1063': return 'lit';
		case '1061': return 'est';
		case '1049': return 'rus';
		case '1045': return 'pol';
		case '1031': return 'deu';
		case '1036': return 'fra';
		default: return null;
	}
}

function isoToLangCode(iso) {
	switch (iso) {
		case 'lv': return '1062';
		case 'en': return '1033';
		case 'lt': return '1063';
		case 'et': return '1061';
		case 'ru': return '1049';
		case 'pl': return '1045';
		case 'de': return '1031';
		case 'fr': return '1036';
		default: return null;
	}
}

function localizeView(view) {
	if (Locale == null || Locale == {}) {
		console.log('ERR: Localization strings not initialized!');
		return false;
	}

	$(view).find('[localize]').each(function (i, e) {
		var text = Locale[e.getAttribute('locale-text')],
			tip = Locale[e.getAttribute('locale-tooltip')];
		if (text) {
			e.innerHTML = text;
		}

		if (tip) {
			e.setAttribute('data-tooltip', tip);
		}
	});
}


// *******************************************
// 		ON-SCREEN KEYBOARD
// *******************************************

function Keyboard(lang_code) {
	this.keySet = '';
	this.lang = lang_code.substring(0, 4);

	this.generateKeyboard = function (lang) {
		switch (lang) {
			// EN 
			case '1033':
				this.keySet = this.wrapKeys(
					['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
						'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
						'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '\n', '\bs']
				);
				return true;
			// LV
			case '1062':
				this.keySet = this.wrapKeys(
					['A', 'Ā', 'B', 'C', 'Č', 'D', 'E', 'Ē', 'F', 'G',
						'Ģ', 'H', 'I', 'Ī', 'J', 'K', 'Ķ', 'L', 'Ļ', 'M',
						'N', 'Ņ', 'O', 'P', 'R', 'S', 'Š', 'T', 'U', 'Ū',
						'V', 'Z', 'Ž', ' ', '\n', '\bs']
				);
				return true;
			// LT
			case '1063':
				this.keySet = this.wrapKeys(
					['A', 'Ą', 'B', 'C', 'Č', 'D', 'E', 'Ę', 'Ė', 'F',
						'G', 'H', 'I', 'Į', 'Y', 'J', 'K', 'L', 'M', 'N',
						'O', 'P', 'R', 'S', 'Š', 'T', 'U', 'Ų', 'Ū', 'V',
						'Z', 'Ž', ' ', '\n', '\bs']
				);
				return true;
			// ET
			case '1061':
				this.keySet = this.wrapKeys(
					['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
						'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Š', 'Z', 'Ž',
						'T', 'U', 'V', 'Õ', 'Ä', 'Ö', 'Ü', ' ', '\n', '\bs']
				);
				return true;
			// RU
			case '1049':
				this.keySet = this.wrapKeys(
					['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И',
						'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т',
						'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь',
						'Э', 'Ю', 'Я', ' ', '\n', '\bs']
				);
				return true;
			// PL
			case '1045':
				this.keySet = this.wrapKeys(
					['A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', 'H',
						'I', 'J', 'K', 'L', 'Ł', 'M', 'N', 'Ń', 'O', 'Ó',
						'P', 'R', 'S', 'Ś', 'T', 'U', 'W', 'Y', 'Z', 'Ź',
						'Ż', ' ', '\n', '\bs']
				);
				return true;
			// DE
			case '1031':
				this.keySet = this.wrapKeys(
					['A', 'Ä', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
						'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'Q', 'R',
						'S', 'T', 'U', 'Ü', 'V', 'W', 'X', 'Y', 'Z', 'ß',
						' ', '\n', '\bs']
				);
				return true;
			// FR
			case '1036':
				this.keySet = this.wrapKeys(
					['A', 'À', 'Â', 'Æ', 'B', 'C', 'Ç', 'D', 'E', 'É',
						'È', 'Ê', 'Ë', 'F', 'G', 'H', 'I', 'Î', 'Ï', 'J',
						'K', 'L', 'M', 'N', 'O', 'Ô', 'Œ', 'P', 'Q', 'R',
						'S', 'T', 'U', 'Ù', 'Û', 'Ü', 'V', 'W', 'X', 'Y',
						'Ÿ', 'Z', ' ', '\n', '\bs']
				);
				return true;

			default:
				return null;
		}
	};

	this.wrapKeys = function (keys) {
		var result = '';

		for (var i = 0; i < keys.length; i++) {
			result += '<a class="button medium-square inline-block keyboard-item" href="' + keys[i].toLowerCase() +
				'" data-disabled="false" tabindex="' + (2000 + i) + '">' +
				'<div class="text">' +
				(keys[i] == ' ' ? '&blank;' : (keys[i] == '\n' ? '&crarr;' : (keys[i] == '\bs' ? '&larr;' : keys[i]))) +
				'</div>' +
				'</a>';
		}

		return result;
	};

	this.generateKeyboard(this.lang.toString());
}


// *********************************************************
// 		ENUM-TYPE OBJECT 
// 		FOR STATUS MANAGEMENT
// *********************************************************

var Status =
{
	OK: 0,
	Error: 1,
	Ready: 2,
	NotReady: 3,
	InProgress: 4,
	Completed: 5,
	Uploading: 6
};


// *********************************************************
//		BUILT-IN FUNCTION EXTENSIONS AND OVERLOADS
// *********************************************************

HTMLTextAreaElement.prototype.getSelection = function () {
	var ss = this.selectionStart;
	var se = this.selectionEnd;
	if (typeof ss == 'number' && typeof se == 'number') {
		return { start: this.selectionStart, end: this.selectionEnd, value: this.value.substring(this.selectionStart, this.selectionEnd) };
	}
	return { start: null, end: null, value: '' };
};

HTMLTextAreaElement.prototype.setCaretPosition = function (pos) {
	if (this.setSelectionRange) {
		this.focus();
		this.setSelectionRange(pos, pos);
	}
	else if (this.createTextRange) {
		var range = this.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
};

String.prototype.toBoolean = function () {
	return (/^true$/i).test(this);
};

String.prototype.multiReplace = function (original, replacement) {
	var str = this;
	while (str.indexOf(original) != -1) {
		str = str.replace(original, replacement);
	}
	return str;
};

String.prototype.decodeString = function () {

	var result = this;
	try {
		result = decodeURIComponent(result.sanitize());
	}
	catch (e) {
		console.log('WRN: Failed to decode string.');
	}

	result = result.multiReplace("%7E", "~");
	result = result.multiReplace("%21", "!");
	result = result.multiReplace("%2A", "*");
	result = result.multiReplace("%28", "(");
	result = result.multiReplace("%29", ")");
	result = result.multiReplace("%27", "'");
	result = result.multiReplace("%0A", "\n");

	return result.toString();
	//return result.unescapeHTMLEntities().toString();
};

String.prototype.encodeString = function () {

	var result = this;
	try {
		result = encodeURIComponent(result);
	}
	catch (e) {
		console.log('WRN: Failed to encode string.');
	}

	result = result.multiReplace("~", "%7E");
	result = result.multiReplace("!", "%21");
	result = result.multiReplace("*", "%2A");
	result = result.multiReplace("(", "%28");
	result = result.multiReplace(")", "%29");
	result = result.multiReplace("'", "%27");
	result = result.multiReplace("\n", "%0A");

	return result.toString();
};

String.prototype.escapeHTMLEntities = function () {
	var tagsToReplace = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};

	return this.replace(/[&<>]/g, function (tag) {
		return tagsToReplace[tag] || tag;
	});
};

String.prototype.unescapeHTMLEntities = function () {
	var tagsToReplace = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>'
	};

	return this.replace(/(&amp;|&lt;|&gt;)/g, function (tag) {
		return tagsToReplace[tag] || tag;
	});
};

String.prototype.startsWith = function (str) {
	return this.slice(0, str.length) == str;
};

// Sanitizes malformed input from browser plugins. 
// The text sent to DicBrowser is urlencoded and due to pipe limitations might be truncated
// The function validates the trailing symbol integrity
String.prototype.sanitize = function () {

	if (this.charAt(this.length - 1) == '%') {
		return this.substring(0, this.length - 1);
	}

	if (this.charAt(this.length - 2) == '%') {
		return this.substring(0, this.length - 2);
	}

	return this;
};


String.prototype.sha1 = function () {
	//  discuss at: http://phpjs.org/functions/sha1/
	// original by: Webtoolkit.info (http://www.webtoolkit.info/)
	// improved by: Michael White (http://getsprink.com)
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	//    input by: Brett Zamir (http://brett-zamir.me)
	//  depends on: utf8_encode
	//   example 1: sha1('Kevin van Zonneveld');
	//   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

	var rotate_left = function (n, s) {
		var t4 = (n << s) | (n >>> (32 - s));
		return t4;
	};

	var cvt_hex = function (val) {
		var str = '';
		var i;
		var v;

		for (i = 7; i >= 0; i--) {
			v = (val >>> (i * 4)) & 0x0f;
			str += v.toString(16);
		}
		return str;
	};

	var blockstart;
	var i, j;
	var W = new Array(80);
	var H0 = 0x67452301;
	var H1 = 0xEFCDAB89;
	var H2 = 0x98BADCFE;
	var H3 = 0x10325476;
	var H4 = 0xC3D2E1F0;
	var A, B, C, D, E;
	var temp;

	str = this;
	var str_len = str.length;

	var word_array = [];
	for (i = 0; i < str_len - 3; i += 4) {
		j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
		word_array.push(j);
	}

	switch (str_len % 4) {
		case 0:
			i = 0x080000000;
			break;
		case 1:
			i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
			break;
		case 2:
			i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
			break;
		case 3:
			i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
				8 | 0x80;
			break;
	}

	word_array.push(i);

	while ((word_array.length % 16) != 14) {
		word_array.push(0);
	}

	word_array.push(str_len >>> 29);
	word_array.push((str_len << 3) & 0x0ffffffff);

	for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
		for (i = 0; i < 16; i++) {
			W[i] = word_array[blockstart + i];
		}
		for (i = 16; i <= 79; i++) {
			W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
		}

		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;

		for (i = 0; i <= 19; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		for (i = 20; i <= 39; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		for (i = 40; i <= 59; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		for (i = 60; i <= 79; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}

		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;
	}

	temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	return temp.toLowerCase();
};

Boolean.prototype.toBoolean = function () {
	return this;
};

if (typeof qq == 'object') {
	// Prevents qq - a File Translation Plugin component - from managing 
	// file drag and drop functionallity
	qq.FileUploader.prototype._setupDragDrop = function () {
		return;
	};
}



// *********************************************************
//		INPUT FIELD MANIPULATION
// *********************************************************

function setSelection(element) {
	if (window.getSelection) {
		var sel = window.getSelection();
		sel.removeAllRanges();
		var range = document.createRange();
		range.selectNodeContents(element);
		sel.addRange(range);
	}
	else if (document.selection) {
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(element);
		textRange.select();
	}
}

function getSelectionHtml() {
	var html = '';
	if (typeof window.getSelection != 'undefined') {
		var sel = window.getSelection();
		if (sel.rangeCount) {
			var container = document.createElement('div');
			for (var i = 0, len = sel.rangeCount; i < len; ++i) {
				container.appendChild(sel.getRangeAt(i).cloneContents());
			}
			html = container.innerHTML;
		}
	} else if (typeof document.selection != 'undefined') {
		if (document.selection.type == 'Text') {
			html = document.selection.createRange().htmlText;
		}
	}
	return html;
}



// *********************************************************
//		HTML TOOL-TIP FUNCTIONALITY
// *********************************************************

var tTipTimeout = null;
function removeTooltip(event) {
	clearTimeout(tTipTimeout);
	tTipTimeout = null;
	var tip = document.getElementsByClassName('tooltip');
	if (tip.length) {
		for (var i = tip.length - 1; i >= 0; i--) {
			document.body.removeChild(tip[i]);
		}
	}
}


// *********************************************************
//		FANCY NOTIFICATIO FUNCTIONALITY
// *********************************************************

$.extend($.noty.defaults, {
	layout: 'bottom', //layout: 'topRight',
	theme: 'relax',
	killer: true,
	timeout: 15000,         // Delay for closing event. Set false for sticky notifications
	maxVisible: 1,
	animation: {            // The project must include animate.css
		open: 'animated bounceInUp',
		close: 'animated bounceOutDown',
		//open: { height: 'toggle' }, // or Animate.css class names like: 'animated bounceInLeft'
		//close: { height: 'toggle' }, // or Animate.css class names like: 'animated bounceOutLeft'
		easing: 'swing',
		speed: 500 // opening & closing animation speed
	},
	closeWith: ['click']    // ['click', 'button', 'hover', 'backdrop']
	// Backdrop click will close all notifications  
});

function Notify(text, type, onConfirm, onCancel, close) {
	// Available types: 'alert', 'information', 'warning', 'success', 'error', 'confirm'
	if (text == 'close') {
		$.noty.closeAll();
		return;
	}
	var buttons = new Array();
	if (typeof onConfirm == 'function') {
		buttons.push({
			addClass: 'button',
			text: '&nbsp;',
			onClick: function ($noty) {
				$noty.close();
				onConfirm();
			}
		});
	}

	if (typeof onCancel == 'function') {
		buttons.push({
			addClass: 'button danger',
			text: 'Atcelt',
			onClick: function ($noty) {
				$noty.close();
				onCancel();
			}
		});
	}

	noty({
		text: text,
		type: type ? type : 'alert',
		buttons: buttons.length == 0 ? false : buttons,
		still_close: close
	});
}


// *********************************************************
//		VIEW-DEPENDANT HISTORY MANAGEMENT
// *********************************************************

function HistoryManager() {

	// Private variables and methods
	var _h = {
		'dummy-view': {
			iterator: 0,
			stack: new Array()
		}
	};

	function _recordForViewExists(viewID) {
		return typeof _h[viewID] != 'undefined' || _h[viewID];
	}

	function _createRecordForView(viewID) {
		_h[viewID] = {
			iterator: 0,
			stack: new Array()
		};
	}

	function _executeRecord(f, p, c) {
		c = c || window;
		f.apply(c, p);
		return true;
	}


	// Public variables and methods
	this.addRecord = function (viewID, funct, parameters, context) {
		console.log('INF: Adding History record... for view: ' + viewID);

		if (!_recordForViewExists(viewID)) {
			_createRecordForView(viewID);
		}

		// TODO: ja skata 'iterator' ir mazāks par steka izmēru, steka liekie objekti jāanihilē
		// ar array.splice() vai kaut ko tamlīdzīgu
		if (_h[viewID].iterator == 0 || JSON.stringify(_h[viewID].stack[_h[viewID].iterator - 1].p) != JSON.stringify(parameters)) {
			_h[viewID].stack.splice(_h[viewID].iterator);
			_h[viewID].stack.push({ f: funct, p: parameters, c: context });
			_h[viewID].iterator++;
		}
		return true;
	};

	this.canGoBack = function (viewID) {
		if (!_recordForViewExists(viewID) || !(_h[viewID].iterator > 1)) {
			return false;
		}
		return true;
	};

	this.canGoForward = function (viewID) {
		if (!_recordForViewExists(viewID) || _h[viewID].iterator == _h[viewID].stack.length) {
			return false;
		}
		return true;
	};

	this.goBack = function (viewID) {
		if (!_recordForViewExists(viewID) || !this.canGoBack(viewID)) {
			return false;
		}

		console.log('INF: Going back in time...');

		// TODO: vai vispār var iet atpakaļ? iterator pārbaude uz negatīvām vērtībām
		var i = --_h[viewID].iterator - 1,
			f = _h[viewID].stack[i].f,          // Function call
			p = _h[viewID].stack[i].p || [],    // Array of parameters
			c = _h[viewID].stack[i].c;          // Execution context
		if (typeof f == 'function') {
			return _executeRecord(f, p, c);
		}

		return false;
	};

	this.goForward = function goForward(viewID) {
		if (!_recordForViewExists(viewID) || !this.canGoForward(viewID)) {
			return false;
		}

		console.log('INF: Going forward in space...');

		// TODO: Pašaprotāmās pārbaudes, vai ieraksti eksistē
		var i = ++_h[viewID].iterator - 1,
			f = _h[viewID].stack[i].f,
			p = _h[viewID].stack[i].p || [],
			c = _h[viewID].stack[i].c;

		if (typeof f == 'function') {
			return _executeRecord(f, p, c);
		}

		return false;
	};
}


$(document).ready(function () {

	//
	//	Custom Tool-Tips
	//
	$('body').on({
		mouseover: function (event) {
			event.preventDefault();
			var title = this.getAttribute('title') || this.getAttribute('data-tooltip');

			// Prevent native tool-tips from popping up
			this.setAttribute('data-tooltip', title);
			this.removeAttribute('title');

			// Create tool-tip element
			var tip = document.createElement('div');
			tip.id = 'tooltip-' + this.id;
			tip.className = 'tooltip';
			if ($(this).hasClass('button')) {
				tip.className += ' button';
			}
			tip.innerHTML = unescape(title);

			document.body.appendChild(tip);
		},
		mouseout: function (event) {
			removeTooltip(event);
		},
		click: function (event) {
			removeTooltip(event);
		},
		mousemove: function (event) {
			var tip = document.getElementById('tooltip-' + this.id);
			if (tip && tip.className.indexOf('positioned') == -1 && tTipTimeout == null) {
				var posX = (event.pageX + tip.offsetWidth + 15 > document.body.offsetWidth) ? Math.abs((event.pageX - 3 - tip.offsetWidth)) + 'px' : Math.abs((event.pageX + 10)) + 'px';
				var posY = (event.pageY + tip.offsetHeight + 15 > document.body.offsetHeight) ? (((event.pageY - 3 - tip.offsetHeight) < 0 ? 3 : Math.abs((event.pageY - 3 - tip.offsetHeight))) + 'px') : Math.abs((event.pageY + 20)) + 'px';


				tip.style.left = posX;
				tip.style.top = posY;

				tTipTimeout = setTimeout(function () {
					tip.style.display = 'none';
					tip.style.visibility = 'visible';
					tip.className += ' positioned';
					$(tip).fadeIn(200);
					tTipTimeout = null;
				}, 300);
			}
		}
	}, '*[title], *[data-tooltip]');

	$('body').on({
		mouseover: function (event) {
			var enabled;
			if (this.getAttribute('type') == 'checkbox') {
				enabled = this.checked;
			}
			else {
				enabled = (this.getAttribute('data-enabled')).toBoolean();
			}

			if (enabled != null) {
				this.setAttribute('data-tooltip', enabled ? Locale.label_on : Locale.label_off);
				$(this).trigger('mouseover');
			}
		}
	}, 'input[type=checkbox]:not([data-tooltip]), a[data-enabled]:not([data-tooltip])');


	// 
	//	Hotkey events
	//
	$('body').keydown(
		function (event) {
			//console.log(event);
			if (event.altKey && !event.ctrlKey && !event.shiftKey) {
				switch (event.which) {
					// Alt + W         
					case 87:
						{
							$('#btn-pin-window').click();
							return;
						}
					// Alt + Home
					case 36:
						{
							View.switchSubview('full-view');
							return;
						}
					// Alt + K
					case 75:
						{
							$('#btn-toggle-keyboard').click();
							return;
						}
					// Alt + N
					case 78:
						{
							$('#btn-reverse-dir').click();
							return;
						}
					// Alt + S
					case 83:
						{
							$('#btn-pin-app').click();
							return;
						}
					default: return;
				}
			}
			else if (event.ctrlKey && !event.altKey && !event.shiftKey) {
				switch (event.which) {
					// Ctrl + A         
					case 65:
						{
							if (typeof View != 'undefined' && View != null) {
								if (View.activeViewID != 'ocr-view') {
									View.focusInput();
								}
							}
							return;
						}
					// Ctrl + C
					case 67:
						{
							event.preventDefault();
							if (typeof View != 'undefined' && View != null) {
								var sel = window.getSelection().toString();
								if ((View.translatorWidget && View.translatorWidget.isActive) || View.activeViewID == 'ocr-view' || View.activeViewID == 'asr-view') {
									Model.processEvent('copyFull', sel.replace(/\n/g, '%0A'));
								} else {
									Model.processEvent('copy', sel.replace(/\n/g, '%0A'));
								}
							}
							return;
						}
					default: return;
				}
			} else if (event.ctrlKey && !event.altKey && event.shiftKey) {
				switch (event.which) {
					// Ctrl + Shift + R
					case 82:
						{
							if (event.shiftKey) {
								$('#btn-reverse-dir').click();
							}
							return;
						}
					// Ctrl + Shift + F8
					case 119: {
						//window.location = 'chrome://gpu/';
						return;
					}
					default: return;
				}
			}
		});


	$(window).blur(
		function () {
			if (window.T_CNTX) {
				window.T_CNTX = false;
				$('.transparent-selection').removeClass('transparent-selection');
			}

			if (window.M_HIST) {
				$('#history-item-panel').hide();
				window.M_HIST = false;
			}
			if (!Settings.DefaultViewPinned) {
				$("#full-view-dialog").dialog("close");
				if (typeof View != 'undefined' && View != null) {
					View.checkWindowHeight(false);
				}
			}
		});

	$(document).mousedown(
		function (event) {
			if (window.T_CNTX) {
				window.T_CNTX = false;
				$('.transparent-selection').removeClass('transparent-selection');
			}

			if (window.M_HIST && (!event.target || (event.target.id != 'history-item-panel' && event.target.id != 'history-wrapper'))) {

				$('#history-item-panel').hide();
				window.M_HIST = false;
			}

		});

	$(document).on({
		'keyup': function (event) {
			window.KEY_ACT = false;
		},

		'keydown': function (event) {
			window.KEY_ACT = true;
		}
	});

	//
	//	Navigation pane magic line
	//
	var item = $('#main-navigation .navigation-item').on({
		/*'mouseenter focus': function (event) {
			event.stopPropagation();
			var e = $(this),
				w = e.width() + 10,
				x = e.position().left + 10;
			e.parent().parent().children().last().css('transform', 'translateX(' + x + 'px)').css('width', w + 'px');
		},
		'mouseleave blur': function (event) {
			event.stopPropagation();
			if (!$(this).hasClass('active')) {
				var e = $(this).parent().parent().find('.active'),
					w = e.width() + 10,
					x = e.position().left + 10;
				e.parent().parent().children().last().css('transform', 'translateX(' + x + 'px)').css('width', w + 'px'); 
			}
		},*/
		'click keyup': function (event) {
			event.preventDefault();
			event.stopPropagation();
			if ((event.which == 1 /*|| event.which == 13*/ || typeof event.isTrigger != 'undefined') && !$(this).hasClass('active') && View != null) {
				View.switchSubview(this);
				var e = $(this),
					w = e.width() + 30,
					x = e.position().left + 1;

				e.parent().parent().children().last().css('transform', 'translateX(' + x + 'px)').css('width', w + 'px');




			}
			else if ((event.which == 1 /*|| event.which == 13*/ || typeof event.isTrigger != 'undefined') && $(this).hasClass('active') && View != null) {
				View.switchSubview(this, true);

			}
		}

	})[0];
	

});







