// *********************************************************
//		INTERFACE FOR BACKEND METHODS
// *********************************************************

function DataModel(mode) {

    this.mode = mode;


    this.getTranslations = function (direction, text, fullsearch) {
        if (this.mode === 'desktop' /*&& typeof dict !== 'undefined'*/) {
            console.log('MOD: Sending "' + direction + '" and "' + text + '" to DicBrowser : fullsearch ' + fullsearch);
            //return View.translationsRetrieved('', false, false);
            return dict.minimal.getTranslations(direction, text, fullsearch);
        }
        else {
            return false;
        }
    };

    this.getInflection = function (direction, text, pos) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Querying for inflections. Sending "' + direction + '" and "' + text + '" to DicBrowser; part of speech: ' + pos);
            return dict.minimal.getInflection(direction, text, pos);
        }
        else {
            return false;
        }
    };

    this.getAutocomplete = function (text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Querying for autocompletion for text "' + text + '"...');
           return dict.minimal.getAutocomplete(text);
        }
        else {
            return false;
        }

    };

    this.restartApplication = function (allusers) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: restartApplication: allusers = ' + allusers);
            return dict.minimal.restartApplication(allusers);
        }
        else {
            return false;
        }
    };

    this.changeWindowHeight = function (height) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Changing app window height to: ' + Math.round(height) + '...');
           return dict.minimal.changeWindowHeight(Math.round(height));
        }
        else {
            return false;
        }

    };
    this.switchPreviewProfile = function (type) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Changing result preview type to ' + type + '...');
            return dict.minimal.switchPreviewProfile(type);
        }
        else {
            return false;
        }
    };

    this.addTranslation = function (type, text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Querying for Add Translation page with type "' + type + '" and text "' + text + '"...');
            return dict.minimal.addTranslation(type, text);
        }
        else {
            return false;
        }
    };
    this.resizeApplicationWindow = function (cx, cy) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Resizing application window: ' + cx + 'x' + cy);
            return dict.minimal.resizeApplicationWindow(cx, cy);
        }
        else {
            return false;
        }
    };
    this.closeApplicationWindow = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            //console.log('MOD: Closing application window...');
            //return dict.minimal.closeApplicationWindow();
            console.log('MOD: Closing / Mimimizing application window...');
            return dict.minimal.minimizeApplicationWindow();
        }
        else {
            return false;
        }
    };
    this.minimizeApplicationWindow = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Mimimizing application window...');
            return dict.minimal.minimizeApplicationWindow();
        }
        else {
            return false;
        }
    };
    
    this.fullscreenApplicationWindow = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: set fullscreen to application window...');
            return dict.minimal.fullscreenApplicationWindow();
        }
        else {
            return false;
        }
    };
    this.maximizeApplicationWindow = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: maximizing application window...');
            return dict.minimal.maximizeApplicationWindow();
        }
        else {
            return false;
        }
    };
    this.restoredownApplicationWindow = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: restore down application window...');
            return dict.minimal.restoredownApplicationWindow();
        }
        else {
            return false;
        }
    };
    this.LButtonDownApplicationWindow = function (x, y) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: mouse left button clicked...' + x + '-' + y);
            return dict.minimal.LButtonDownApplicationWindow(x, y);
        }
        else {
            return false;
        }
    };
    this.pronounceText = function (text, language) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Pronouncing provided text...');
            if (text.length > 2500) {
                text = text.substring(0, 2500);
            }
            return dict.minimal.pronounceText(text, language);
        }
        else {
            return false;
        }
    };
	

    this.transformOnlDicResult = function (text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Sending Online Dictionary result for xsl transformation with text "' + text + '"');
            return dict.minimal.transformOnlDicResult(text);
        }
        else {
            return false;
        }

    };

    this.appendTranslationDirection = function (id, from, to, direction, short) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Appending translation direction: ' + from + '-' + to);
            return dict.minimal.appendTranslationDirection(id, from, to, direction, short);
        }
        else {
            return false;
        }
    };

    this.openFullView = function (direction, text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Full Dictionary with text "' + text + '" and direction "' + direction + '"...');
            return dict.minimal.openFullView(direction, text);
        }
        else {
            return false;
        }

    };

   
    this.BackFromSettings = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening full Dictionary...');
            return dict.minimal.BackFromSettings();
        }
        else {
            return false;
        }

    };

    this.OpenHelp = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Help...');
            return dict.minimal.OpenHelp();
        }
        else {
            return false;
        }

    };

    this.changeSetting = function (property, value, direction) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Changing setting for "' + property + '": ' + value + '; direction: ' + direction);
            return dict.minimal.changeSetting(property, value, direction);
        }
        else {
            return false;
        }
    };

    this.openSettings = function (direction) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Settings page with direction "' + direction + '"...');
            return dict.minimal.openSettings(direction);
        }
        else {
            return false;
        }

    };

    this.showWelcomePage = function (direction, text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Navigating to Welcome page with text "' + text + '" and direction "' + direction + '"...');
            return dict.minimal.showWelcomePage(direction, text);
        }
        else {
            return false;
        }

    };

    this.showTranslatorPage = function (direction, text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Dictionary Translation page with text "' + text + '" and direction "' + direction + '"...');
            return dict.minimal.showTranslatorPage(direction, text);
        }
        else {
            return false;
        }

    };

    this.showMachineTranslatorPage = function (direction, text, document) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening ' + (document ? 'Document' : 'Machine') + ' Translation page with text "' + text + '" and direction "' + direction + '"...');
            return dict.minimal.showMachineTranslatorPage(direction, text, document);
        }
        else {
            return false;
        }
    };
    this.checkSpell = function (text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Sending text to check spelling. Text: "' + text + '"');
            return dict.minimal.checkSpell( text);
        }
        else {
            return false;
        }
    };

    this.showOcrPage = function (direction) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Ocr page with direction: "' + direction + '"...');
            return dict.minimal.showOcrPage(direction);
        }
        else {
            return false;
        }
    };

    this.showGrammarPage = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Grammar page...');
            return dict.minimal.showGrammarPage();
        }
        else {
            return false;
        }
    };

    this.showReferencePage = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Reference page...');
            return dict.minimal.showReferencePage();
        }
        else {
            return false;
        }
    };

    this.showSynonymPage = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Synonym page...');
            return dict.minimal.showSynonymPage();
        }
        else {
            return false;
        }
    };

    this.showInvolvePage = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Involve page...');
            return dict.minimal.showInvolvePage();
        }
        else {
            return false;
        }
    };

    this.GeneralSettings = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening General Settings...');
            return dict.minimal.GeneralSettings();
        }
        else {
            return false;
        }

    };

    this.DicSettings = function (direction) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined' && direction !== 'null-null') {
            console.log('MOD: Querying settings for "' + direction + '"...');
            return dict.minimal.DicSettings(direction);
        }
        else {
            return false;
        }
    };

    // path === '' => New Dictionary
    // path === 'C:/...' => Append
    this.editUserDictionary = function (path, direction, translation, comment, reload) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Editing user Dictionary; path: ' + path + '; direction: ' + direction + '; text: ' + translation + '; ' + comment + '... Should reload: ' + reload);
            return dict.minimal.editUserDictionary(path, direction, translation, comment, reload);
        }
        else {
            return false;
        }

    };

    this.getDictionarySettings = function (success, error) {
        if (this.mode === 'desktop') {
            throw ("NOT_IMPLEMENTED", 0);
        }
        else {
            return false;
        }
    };


    // Possible type String values:
    // 		'fiesta' - open Fiesta.exe to install Outlook Add-install
    // 		'calendar' - Open add-in page
    // 		'lingo' - open lingo.exe
    // 		'karogs' - open Flag32.exe
    // 		'link' - open a web resource in default browser; requires url to be passed as paramter
    //		'langswitch' - open UILanguageSwitcher.exe
    // 		'autoupdate' - self explanatory
    //		'activation' - self explanatory
    this.openExternalResource = function (type, parameters) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening external resource with type "' + type + '"; parameters: ' + parameters);
            return dict.minimal.openExternalResource(type, parameters);
        }
        else {
            return false;
        }
    };

    this.showTemplatePage = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening Template page...');
            return dict.minimal.showTemplatePage();
        }
        else {
            return false;
        }

    };

    this.OpenTemplateWithSoft = function (link) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Opening MS Word template: "' + link);
            return dict.minimal.OpenTemplateWithSoft(link);
        }
        else {
            return false;
        }

    };

    this.getTranslationHistory = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Querying DicBrowser for translation history...');
            return dict.minimal.getTranslationHistory();
        }
        else {
            return false;
        }
    };

    this.getTemplateDataUrl = function () {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Querying DicBrowser for Template data XML location...');
            return dict.minimal.getTemplateDataUrl();
        }
        else {
            return false;
        }

    };

    this.getHashValue = function (text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Querying DicBrowser for hash of "' + text + '"...');
            return dict.minimal.getHashValue(text);
        }
        else {
            return false;
        }
    };

    this.setInputLanguage = function (langFrom, langTo) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Changing input language to: "' + langFrom + '" and "' + langTo + '"...');
            return dict.minimal.setInputLanguage(langFrom, langTo ? langTo : '');
        }
        else {
            return false;
        }
    };



    this.editExistingUserDict = function (direction, location) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Editing existing User Dictionary. Direction: "' + direction + '"; location: ' + location + '...');
            return dict.minimal.editExistingUserDict(direction, location);
        }
        else {
            return false;
        }
    };

    this.deleteExistingUserDict = function (direction, id) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Deleting existing User Dictionary. Direction: "' + direction + '"; id: ' + id + '...');
            return dict.minimal.deleteExistingUserDict(direction, id);
        }
        else {
            return false;
        }
    };

    this.exportExistingUserDict = function (direction, location) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Exporting existing User Dictionary. Direction: "' + direction + '"; location: ' + location + '...');
            return dict.minimal.exportExistingUserDict(direction, location);
        }
        else {
            return false;
        }
    };

    this.createNewUserDict = function (direction) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Creating new dictionary. Direction: "' + direction + '"...');
            return dict.minimal.createNewUserDict(direction);
        }
        else {
            return false;
        }
    };

    this.importExistingUserDict = function (direction) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Importing existing User Dictionary. Direction: "' + direction + '"...');
            return dict.minimal.importExistingUserDict(direction);
        }
        else {
            return false;
        }
    };

    this.setDocumentStatus = function (status) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Setting document status: ' + status + '...');
            return dict.minimal.setDocumentStatus(status);
        }
        else {
            return false;
        }

    };

    this.setOCRStatus = function (status) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Setting OCR status: ' + status + '...');
            return dict.minimal.setOCRStatus(status);
        }
        else {
            return false;
        }

    };

    this.downloadFile = function (url) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: Downloading file from url ' + url + '...');
            return dict.minimal.downloadFile(url, url.decodeString());
        }
        else {
            return false;
        }
    };
    this.openFile = function (filename, text) {
        if (this.mode === 'desktop' && typeof dict !== 'undefined') {
            console.log('MOD: opening file: ' + filename + ' with text: ' + text);
            return dict.minimal.openFile(filename, text);
        }
        else {
            return false;
        }
    };
	this.processEvent = function (event, data) {
		if (this.mode === 'desktop' && typeof dict !== 'undefined') {
			console.log('MOD: Processing event "' + event + '" with data "' + data + '"...');
			return dict.minimal.processEvent(event, data);
		}
		else {
			return false;
		}

	};

	this.getKarogsLingoStatus = function (success, error) {
		if (this.mode === 'desktop') {
			console.log('MOD: Querying for karogs,lingo,fiesta settings...');
			window.cefQuery({
				request: 'GetKarogsLingoStatus',
				onSuccess: function (response) {
					console.log(typeof success);
					if (typeof success === 'function') {
						success(response);
					}
					else {
						console.log('WRN: No callback provided.');
					}
				},
				onFailure: function (error_code, error_message) {
					console.log(typeof error);
					if (typeof error === 'function') {
						error(error_code, error_message);
					}
					else {
						throw (error_code, error_message);
					}
				}
			});
		}
		else {
			return false;
		}
	};

	this.reloadHolidays = function () {
		if (this.mode === 'desktop' && typeof dict !== 'undefined') {
			console.log('MOD: Updating Holiday data...');
			return dict.minimal.reloadHolidays();
		}
		else {
			return false;
		}
	};
	this.RefreshUpdateStatus = function () {
		if (this.mode === 'desktop' && typeof dict !== 'undefined') {
			console.log('MOD: Refresh update statuss...');
			return dict.minimal.RefreshUpdateStatus();
		}
		else {
			return false;
		}
	};
	this.InstallUpdate = function (updateID) {
		if (this.mode === 'desktop' && typeof dict !== 'undefined') {
			console.log('MOD: Install/download update ' + updateID);
			return dict.minimal.InstallUpdate(updateID);
		}
		else {
			return false;
		}
	};
	
    this.toogleDiv = function (elementID) {
        alert(elementID);
    };
}

var Model = new DataModel('desktop');
