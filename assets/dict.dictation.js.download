Dictionary = typeof Dictionary === "undefined" ? function () {} : Dictionary;

Dictionary.prototype.dictationView = function () {
  Settings.DictationStatus = {};
  Settings.DictationStatus.isConnected = false;
  Settings.DictationStatus.warmup = false; // warm up enabled
  Settings.DictationStatus.done = false;

  Settings.DictationStatus.startPosition = null;
  Settings.DictationStatus.currentP = null;
  Settings.DictationStatus.endPosition = null;
  Settings.DictationStatus.doUpper = false;
  Settings.DictationStatus.doPrependSpace = true;

  Settings.DictationStatus.disableCommands = false;
  Settings.DictationStatus.disableFormatting = false;

  Settings.DictationStatus.noSpeechCount = 0;
  // time before going to sleep mode
  Settings.DictationStatus.maxNoSpeechCount = 5;
  var dictate;

  var animate_dictation = false;
  var anim_req_id;
  var is_dict_initialized = { key: false };
  var show_hints = true;
  var translateEndpoint = "https://comprise-dev.tilde.com/translate";
  commandRules = [];

  function parseNumber(txt) {
    return txt;
  }

  function capitaliseFirstLetter(string) {
    var mapping = string.split("->");
    if (mapping.length == 2) {
      return (
        mapping[0] +
        "->" +
        mapping[1].charAt(0).toUpperCase() +
        mapping[1].slice(1)
      );
    } else {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

  function prettyfyHyp(text, confs, conf_i, disableFormatting) {
    var doCapFirst = Settings.DictationStatus.doUpper;
    var doPrependSpace = Settings.DictationStatus.doPrependSpace;
    var tokens = text.split(" ");
    text = "";
    var doCapitalizeNext = doCapFirst;
    tokens.map(function (token) {
      token = token.replace(/\b(_\$_\w+_\$_)\b/gi, "");
      if (doCapitalizeNext) {
        token = capitaliseFirstLetter(token);
      }
      if (token == "." || token == "!" || token == "?" || /\n$/.test(token)) {
        doCapitalizeNext = true;
        doPrependSpace = false;
      } else if (/[\s_@\)”%]$/.test(token)) {
        doPrependSpace = false;
      } else {
        doCapitalizeNext = false;
      }
      if (doPrependSpace) {
        token = " " + token; // delimeter
        doPrependSpace = false;
      }
      if (/[\s#_@\(“]$/.test(token)) {
        doPrependSpace = false;
      } else {
        doPrependSpace = true;
      }
      if (token != "") {
        token = "<span>" + token + "</span>";
        text = text + token;
      }
    });

    text = text.replace(/ ([,.!?:;@_\)”%])/g, "$1");
    text = text.replace(/ ?\n ?/g, "\n");

    Settings.DictationStatus.doUpper = doCapitalizeNext;
    Settings.DictationStatus.doPrependSpace = doPrependSpace;

    return text;
  }

  function extractRuleFromStr(text, confStr) {
    var str = text; //.toLowerCase();
    var min_ch = str.length;
    var max_len = 0;
    var max_wc = 0;
    var max_i = -1;

    // iterate all rules
    for (var i = 0; i < commandRules.length; i++) {
      for (var j = 0; j < commandRules[i].match.length; j++) {
        // if hyp has rule inside
        var ch = str.indexOf(commandRules[i].match[j]);
        if (
          ch >= 0 &&
          (ch < min_ch ||
            (ch == min_ch && commandRules[i].match[j].length > max_len))
        ) {
          max_i = i;
          max_len = commandRules[i].match[j].length;
          max_wc = wordCount(commandRules[i].match[j]);
          min_ch = ch;
        }
      }
    }
    res = { ch: min_ch, length: max_len, command: -1, token_count: max_wc };
    if (max_len) {
      res.command = max_i;
    }

    return res;
  }

  function createTextNode(hypText, confidence, conf_i, isFinal) {
    // remember formatting status at the time of call
    var disableFormatting = Settings.DictationStatus.disableFormatting;
    return function () {
      // process hyp text
      hypText = prettyfyHyp(hypText, confidence, conf_i, disableFormatting);
      // insert span into trans
      var val = $("<span class='dictResult'>").html(hypText);
      if (!isFinal) {
        val.addClass("partial");
      }
      insertTrans(val);
    };
  }

  function insertTrans(val) {
    if (Settings.DictationStatus.startPosition == null) {
      Settings.DictationStatus.currentP.append(val);
    } else {
      Settings.DictationStatus.startPosition.before(val);
    }
    Settings.DictationStatus.endPosition = val;

    var el = val[0].lastChild;
    if (el.nodeType != 3) {
      el = el.lastChild;
    }

    setCaret(el, el.data.length);
  }

  function wordCount(str) {
    return str.split(" ").length;
  }

  function calcJointConfidence(confs, i, len) {
    conf = 1;
    for (var j = 0; j < i + len; j++) {
      conf = conf * confs[j];
    }
    return conf;
  }

  function processResults(result, confs, isFinal) {
    var conf_i = 0;
    var rule = extractRuleFromStr(result, confs, conf_i);
    var ch = rule.ch;
    processedResults = [];

    while (rule.command != -1 && !Settings.DictationStatus.disableCommands) {
      // add text
      if (ch > 0) {
        var txt = result.substr(0, ch - 1);
        result = result.substr(ch);
        var wc = wordCount(txt);
        processedResults.push(createTextNode(txt, confs, conf_i, isFinal));
        conf_i += wc;
      }
      conf_i += rule.token_count;
      // exec rule
      if (commandRules[rule.command].onProcess) {
        result = commandRules[rule.command].onProcess(
          processedResults,
          result,
          isFinal
        );
      }
      // add rule to result
      if (commandRules[rule.command].onInsert) {
        processedResults.push(
          commandRules[rule.command].onInsert(processedResults, isFinal)
        );
      }

      // try next

      if (rule.length + 1 >= result.length) {
        // no more data
        result = "";
        break;
      }
      result = result.substr(rule.length + 1);
      rule = extractRuleFromStr(result, confs, conf_i);
      ch = rule.ch;
    }

    // push only or last text node
    if (processedResults.length == 0 || result.length > 0) {
      var wc = wordCount(result);
      processedResults.push(createTextNode(result, confs, conf_i, isFinal));
      conf_i += wc;
    }

    return processedResults;
  }

  /*
   * VAD debug info
   */
  function printVADLog(analyser, vad) {
    // print VAD log
    var energy = vad.getEnergy();
    var delta_E = energy - vad.min_E;
    var msg = "";
    if (delta_E >= vad.t_E) {
      msg += " E";
    }
    var delta_F = vad.getFrequency() - vad.min_F;
    if (delta_F >= vad.t_F) {
      msg += " F";
    }
    var delta_SF = Math.abs(vad.getSFM() - vad.min_SF);
    if (delta_SF >= vad.t_SF) {
      msg += " SF";
    }
    var str =
      "Energy:" +
      energy.toFixed(9) +
      "(delta: " +
      delta_E.toFixed(9) +
      "), dominant F: " +
      vad.getFrequency().toFixed(9) +
      " (delta_F: " +
      delta_F.toFixed(9);
    str = str + ") delta_SF: " + delta_SF.toFixed(9);
    str =
      str +
      "<br>t_E:" +
      vad.t_E.toFixed(9) +
      " t_F: " +
      vad.t_F.toFixed(9) +
      " t_SF: " +
      vad.t_SF.toFixed(9) +
      " msg:" +
      msg;

    str =
      str +
      "<br> binCount: " +
      analyser.frequencyBinCount +
      " fft size: " +
      analyser.fftSize +
      " rate: " +
      vad.options.sampleRate;

    $("#vadlog").html(str);
  }

  /*
   * visualize volume
   */
  function visualizeAudio(analyser, vad) {
    var buffer_length = analyser.frequencyBinCount;
    var data_array_i = new Uint8Array(buffer_length);

    draw = function () {
      var canvas = document.getElementById("canvas_dictation");
      if (animate_dictation == true && dictate.isSleeping() == false) {
        var width = canvas.offsetWidth;
        var height = canvas.height;
        var draw_length = 150;
        var canvas_ctx = canvas.getContext("2d");

        canvas_ctx.lineWidth = width / draw_length / 2;
        canvas_ctx.strokeStyle = "#aea";

        analyser.getByteFrequencyData(data_array_i);

        canvas_ctx.clearRect(0, 0, width, height);
        canvas_ctx.beginPath();

        var slice_width = width / draw_length;
        var x = 0;

        if (data_array_i) {
          for (var i = 0; i < draw_length; i++) {
            var y = (data_array_i[i] / 255) * height;

            canvas_ctx.beginPath();
            canvas_ctx.moveTo(x, height);
            canvas_ctx.lineTo(x, height - y);
            canvas_ctx.stroke();

            x += slice_width;
          }
        }
      } else {
        var width = canvas.width;
        var height = canvas.height;
        var canvas_ctx = canvas.getContext("2d");
        canvas_ctx.clearRect(0, 0, width, height);
      }

      anim_req_id = requestAnimationFrame(draw);
    };
    draw();
  }

  /*
   * * * * * * *
   */
  function drawCircle(canvas_id, fill, color, radius, center_x, center_y) {
    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);

    if (fill == true) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = "#aaa";
      ctx.stroke();
    }
  }

  /*
   * * *
   */

  function prepareDictation() {
    // find start position, where will be inserting results
    // also split text nodes if necessary
    Settings.DictationStatus.startPosition = null;
    Settings.DictationStatus.endPosition = null;
    var selection = getSelection();
    if (selection.anchorNode != null) {
      if ($(selection.anchorNode).parents("#dictation-trans").length) {
        if (selection.anchorNode.nodeType == 3) {
          // splitting text node at caret position
          var left = selection.anchorNode.data.slice(0, selection.anchorOffset);
          var right = selection.anchorNode.data.slice(selection.anchorOffset);
          selection.anchorNode.data = left;
          var parent = $(selection.anchorNode).parents("span").first();
          var insertPoint = null;
          if (right == "") {
            // if caret is at the end of a text
            // try to find next sibling and use it as insert position
            if (selection.anchorNode.nextSibling) {
              insertPoint = $(selection.anchorNode.nextSibling);
            } else if (parent.length > 0 && parent[0].nextSibling) {
              insertPoint = $(parent[0].nextSibling);
            }
          }
          if (insertPoint == null) {
            // no suitable insert point present, create new
            insertPoint = $("<span class='dictResult'>").html(right);
            if (parent.length) {
              parent.after(insertPoint);
            } else {
              $(selection.anchorNode).after(insertPoint);
            }
          }
          Settings.DictationStatus.startPosition = insertPoint;
        } else if (selection.anchorNode.nodeType == 1) {
          Settings.DictationStatus.startPosition = $(selection.anchorNode);
        }
      }
    }

    // set end position (actually its pointer to last result)
    if (Settings.DictationStatus.startPosition != null) {
      Settings.DictationStatus.endPosition = Settings.DictationStatus.startPosition.prev();
      if (Settings.DictationStatus.endPosition.length == 0) {
        Settings.DictationStatus.endPosition = Settings.DictationStatus.startPosition.parent(
          "p.dictResult"
        );
      }
    } else {
      Settings.DictationStatus.endPosition = $("span.dictResult").last();
    }

    // find active paragraph
    if (Settings.DictationStatus.startPosition != null) {
      Settings.DictationStatus.currentP = Settings.DictationStatus.startPosition
        .parents("p.dictResult")
        .first();
    } else {
      Settings.DictationStatus.currentP = $("p.dictResult").last();
    }

    if (Settings.DictationStatus.currentP.length == 0) {
      // no P tag found
      $("#dictation-trans").wrapInner("<p class='dictResult'>");
      Settings.DictationStatus.currentP = $("p.dictResult").last();
    }

    prepareProcessing(Settings.DictationStatus.startPosition);
    // save status
    //Settings.InitDictationStatus = Object.assign({}, Settings.DictationStatus);
    Settings.InitDictationStatus = $.extend({}, Settings.DictationStatus);
  }

  function insertNewLine() {
    var currentP = $("<p class='dictResult'>");

    if (Settings.DictationStatus.startPosition != null) {
      // insert current P after last currentP
      Settings.DictationStatus.currentP.after(currentP);
      // move insert point and all its siblings to new P
      Settings.DictationStatus.startPosition.nextAll().appendTo(currentP);
      Settings.DictationStatus.startPosition.prependTo(currentP);
    } else {
      currentP.appendTo($("#dictation-trans"));
    }
    if (Settings.DictationStatus.currentP.text() == "") {
      Settings.DictationStatus.currentP.prepend("&#8203;");
    }
    setCaret(currentP[0].firstChild ? currentP[0].firstChild : currentP[0], 0);

    Settings.DictationStatus.currentP = currentP;
    // don't do prepend
    Settings.DictationStatus.doPrependSpace = false;

    // update endPosition
    Settings.DictationStatus.endPosition = currentP;
  }

  function prepareProcessing(insertPoint) {
    var prevText, textBeforeCaret;
    if (
      Settings.DictationStatus.endPosition &&
      Settings.DictationStatus.endPosition.length > 0
    ) {
      prevText = Settings.DictationStatus.endPosition;
    } else if (insertPoint == null) {
      //  find last child
      prevText = $("#dictation-trans").children().last();
      if (prevText.length == 0) {
        // no children
        prevText = $("#dictation-trans")[0];
      } else {
        prevText = prevText[0];
      }
    } else {
      prevText = insertPoint[0].previousSibling;
    }
    if (prevText == null) {
      textBeforeCaret = "";
    } else if (prevText.nodeType == 3) {
      textBeforeCaret = prevText.data;
    } else {
      textBeforeCaret = $(prevText).text();
    }
    // TODO: new line detection...
    if (textBeforeCaret == "\u200B") {
      // new line is before caret
      textBeforeCaret = prevText.prev().text() + "\n";
    }
    if (
      textBeforeCaret.trim().length == 0 ||
      /[\.\!\?]\s*$/.test(textBeforeCaret)
    ) {
      Settings.DictationStatus.doUpper = true;
    } else {
      Settings.DictationStatus.doUpper = false;
    }
    Settings.DictationStatus.doPrependSpace =
      textBeforeCaret.length > 0 && !/\n *$/.test(textBeforeCaret);
  }

  function placeCaretAtEnd(el) {
    el.focus();
    if (
      typeof window.getSelection != "undefined" &&
      typeof document.createRange != "undefined"
    ) {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  }

  function setCaret(el, pos) {
    var range = document.createRange();
    var sel = window.getSelection();
    if (pos < 0) {
      if (el.nodeType == 3) {
        pos = el.data.length + pos;
      } else {
        el = el.lastChild;
        pos = el.data.length + pos;
      }
    }
    range.setStart(el, pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    if (el.focus) el.focus();

    if (el.offsetHeight == 0) {
      $(el).prepend("&#8203;");
      range = document.createRange();
      sel = window.getSelection();
      range.setStart(el, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    }
  }

  // Private methods (called from the callbacks)
  function __message(code, data) {
    console.log("msg: " + code + ": " + (data || ""));
  }

  function __error(code, data) {
    console.warn("ERR: " + code + ": " + (data || "") + "\n");
    if (code == 2) {
      Notify(Locale["asr_error_no_internet"], "error");
      if (
        $("#start_stop_dictation_mac").hasClass("dictation_stop_mac") == true
      ) {
        $("#start_stop_dictation_mac").trigger({ type: "click", which: 1 });
        $("#dict_bottom_holder_mac").addClass("invisible");
      }
      if ($("#dictation_button").hasClass("stop_dictation") == true) {
        $("#dictation_button").trigger({ type: "click", which: 1 });
      }
    }
    if (code == 19) {
      if (
        $("#start_stop_dictation_mac").hasClass("dictation_stop_mac") == true
      ) {
        $("#start_stop_dictation_mac").trigger({ type: "click", which: 1 });
        $("#dict_bottom_holder_mac").addClass("invisible");
      }
      if ($("#dictation_button").hasClass("stop_dictation") == true) {
        $("#dictation_button").trigger({ type: "click", which: 1 });
      }
      Notify(Locale["asr_no_workers"], "warning");
    }
  }

  function __serverStatus(msg) {
    $("#num_workers").html(msg);
  }

  // button and DOM event handlers

  /*
   * * *
   */

  window.showAllHints = function () {
    Notify(Locale["hint_all_commands"], "gray", function () {
      return true;
    });
  };

  function generateHint(hyp, confs) {}

  $("#dictation-trans").focus(function () {
    $("#first_run_hint_holder").addClass("hide");
  });

  $("#dictation-trans").mousedown(function () {
    if (animate_dictation == true) {
      $("#start_stop_dictation_mac").trigger({ type: "click", which: 1 });
    }
  });

  $("#dictation-trans").keydown(function (e) {
    if (e.which == 13) {
      // find selection and prepare necessary pointers
      prepareDictation();
      // process result
      generateHint($("p.dictResult").text());
      e.preventDefault();
    }
    // prevent simultaneous edit and dictation
  });

  // init
  function callback() {
    console.log("...this is callback");
  }

  $("#dictation-trans")[0].spellcheck = false;

  // debug
  window.debugTextNode = function (str) {
    var fn = createTextNode(str, new Array(wordCount(str)).fill(1), 0, true);
    fn();
  };

  window.debugResult = function (hypText) {
    var confs = new Array(wordCount(hypText)).fill(1);

    // Context-hint generation
    generateHint(hypText);

    // remove partial results
    $(".dictResult.partial").remove();
    // recover previous status
    Settings.DictationStatus = Settings.InitDictationStatus;

    if (hypText == "") return;

    var results = processResults(hypText, confs, true);
    for (var i = 0; i < results.length; i++) {
      results[i](results, i);
    }

    // save status
    Settings.InitDictationStatus = $.extend({}, Settings.DictationStatus);
  };

  /*
   * * *
   */
  function drawMic(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");

    var path = new Path2D(
      "M41.4,25.2 C40.8,25.2 40.4,25.6 40.4,26.2 L40.4,30.2 L38.4,30.2 L38.4,16 L38.4,15.2 L38.4,15.1 L38.4,14.9 C37.9,9.1 33.6,3.9 27.9,1.5 C27.9,1.5 27.9,1.5 27.8,1.5 C25.8,0.7 23.7,0.2 21.5,0.2 C21.5,0.2 21.5,0.2 21.4,0.2 L21.4,0.2 L21.3,0.2 C19.1,0.2 17.1,0.6 15.2,1.3 C15.1,1.3 15.1,1.3 15,1.4 C9.1,3.6 4.9,8.8 4.5,15.2 L4.5,15.3 L4.5,15.4 L4.5,16.2 L4.5,30.3 L2.5,30.3 L2.5,26.3 C2.5,25.7 2.1,25.3 1.5,25.3 C0.9,25.3 0.5,25.7 0.5,26.3 L0.5,31.3 C0.3,36.9 2.4,42.2 6.2,46.2 C9.9,50.1 15,52.2 20.5,52.5 L20.5,60.4 L22.5,60.4 L22.5,52.5 C33.8,51.9 42.5,42.9 42.5,31.4 L42.5,26.4 C42.4,25.6 41.9,25.2 41.4,25.2 L41.4,25.2 Z M6.4,28.2 L16.2,28.2 C16.8,28.2 17.2,27.8 17.2,27.2 C17.2,26.6 16.8,26.2 16.2,26.2 L6.4,26.2 L6.4,22.2 L16.2,22.2 C16.8,22.2 17.2,21.8 17.2,21.2 C17.2,20.6 16.8,20.2 16.2,20.2 L6.4,20.2 L6.4,16.2 L16.2,16.2 C16.8,16.2 17.2,15.8 17.2,15.2 C17.2,14.6 16.8,14.2 16.2,14.2 L6.6,14.2 C7.3,9.3 10.4,5.7 14.5,3.7 L14.5,8.2 C14.5,8.8 14.9,9.2 15.5,9.2 C16.1,9.2 16.5,8.8 16.5,8.2 L16.5,3 C17.8,2.6 19.1,2.3 20.5,2.3 L20.5,8.3 C20.5,8.9 20.9,9.3 21.5,9.3 C22.1,9.3 22.5,8.9 22.5,8.3 L22.5,2.4 C23.9,2.5 25.2,2.8 26.5,3.3 L26.5,8.3 C26.5,8.9 26.9,9.3 27.5,9.3 C28.1,9.3 28.5,8.9 28.5,8.3 L28.5,4 C32.6,6.1 35.6,10 36.3,14.2 L26.3,14.2 C25.7,14.2 25.3,14.6 25.3,15.2 C25.3,15.8 25.7,16.2 26.3,16.2 L36.4,16.2 L36.4,20.2 L26.3,20.2 C25.7,20.2 25.3,20.6 25.3,21.2 C25.3,21.8 25.7,22.2 26.3,22.2 L36.4,22.2 L36.4,26.2 L26.3,26.2 C25.7,26.2 25.3,26.6 25.3,27.2 C25.3,27.8 25.7,28.2 26.3,28.2 L36.4,28.2 L36.4,30.2 L6.4,30.2 L6.4,28.2 L6.4,28.2 Z M36.3,32.2 C35.7,39.1 28.9,45.2 21.4,45.2 C13.9,45.2 7.1,39.1 6.5,32.2 L36.3,32.2 L36.3,32.2 Z M21.2,50.4 C15.9,50.4 11.1,48.4 7.5,44.7 C4.3,41.4 2.5,37 2.4,32.2 L4.4,32.2 C5,40.3 12.6,47.2 21.3,47.2 C30,47.2 37.7,40.3 38.2,32.2 L40.2,32.2 C39.8,42.4 31.6,50.4 21.2,50.4 L21.2,50.4 Z"
    );
    ctx.fillStyle = "white";
    ctx.fill(path);
  }

  /*
   * * *
   */
  function getDictationResult() {
    var result = "";
    for (var i = 0; i < $("#dictation-trans p").length; i++) {
      result += $(".dictResult span", $("#dictation-trans p")[i]).text() + "\n";
    }
    return result;
  }

  /*
   * * *
   */
  function drawRect(canvas_id, x, y, width, height) {
    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");

    ctx.rect(x, y, width, height);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  /*
   * * *
   */
  function clickOnMic() {
    $("#start_stop_dictation_mac").trigger({ type: "click", which: 1 });
  }

  /*
   * * *
   *
   */

  newDictate = function () {
    dictate = new Dictate({
      server:
        Settings.AsrAPIUrl.replace("http", "ws") +
        "/client/ws/speech/LVASR-ONLINE",
      //BIURAS
      //server: Settings.AsrAPIUrl.replace("http", "ws") + "/client/ws/speech/LTASR-ONLINE",
      resample: Settings.AsrResample,
      appID: "TildeTest",
      appSecret:
        "TESTga3V6dcmxkCjAw2xyzVL5Sj9AweC7aDeVxLDmNPJJhS9qvgMT39NwjNHESaCDEtrM4EXu5h3XZNd7FBQzBfFKTEST",
      recorderWorkerPath: "lib/recorderWorker.js",
      audioVisualizer: visualizeAudio,
      onReadyForSpeech: function () {
        Settings.DictationStatus.isConnected = true;
        __message("READY FOR SPEECH");

        if ($("#dictation-trans p span").text() == "") {
          setCaret($("#dictation-trans")[0], 0);
        }

        prepareDictation();

        // skip on warmup
        if (Settings.DictationStatus.warmup) return;
      },
      onSpeech: function () {
        // skip on warmup
        if (Settings.DictationStatus.warmup) return;

        Settings.DictationStatus.noSpeechCount = 0;
      },
      onSilence: function () {
        Settings.DictationStatus.noSpeechCount++;
        if (
          Settings.DictationStatus.noSpeechCount >
          Settings.DictationStatus.maxNoSpeechCount
        ) {
          if (!dictate.isSleeping()) {
            dictate.stopSending();
          }
        }
      }.bind(this),
      onEndOfSpeech: function () {
        __message("END OF SPEECH");
        Settings.DictationStatus.done = true;
      },
      onEndOfSession: function () {
        Settings.DictationStatus.isConnected = false;
        __message("END OF SESSION");
        // zero no-speech counts
        Settings.DictationStatus.noSpeechCount = 0;

        // skip on warmup
        if (Settings.DictationStatus.warmup) return;

        // toggle button state

        // remove partial results
        $(".dictResult.partial").remove();
        // restore status
        Settings.DictationStatus = Settings.InitDictationStatus;
      },
      onServerStatus: function (json) {
        __serverStatus(json.num_workers_available);
        // TODO: server status not implemented both at server and client
      },
      onPartialResults: function (hypos) {
        hypText = hypos[0].transcript;
        if (Settings.DictationStatus.warmup) return;
        generateHint(hypText);
        Settings.DictationStatus = $.extend({}, Settings.InitDictationStatus);
        $(".dictResult.partial").remove();
        var results = processResults(
          hypText,
          new Array(wordCount(hypText)).fill(1),
          false
        );
        for (var i = 0; i < results.length; i++) {
          results[i]();
        }
        var div_to_scroll = document.getElementById("dictation-trans");
        div_to_scroll.scrollTop = div_to_scroll.scrollHeight;
      },
      onResults: function (hypos) {
        hypText = hypos[0].transcript;
        var request = translateText(hypText);
        request.success(function (text) {
          hypText = text;
          if (Settings.DictationStatus.warmup) return;
          generateHint(hypText);
          var confs = new Array(wordCount(hypText)).fill(1);
          if (hypos[0]["word-alignment"]) {
            for (var i = 0; i < hypos[0]["word-alignment"].length; i++) {
              confs[i] = hypos[0]["word-alignment"][i].confidence;
            }
          }
          $(".dictResult.partial").remove();
          Settings.DictationStatus = Settings.InitDictationStatus;
          if (hypText == "") return;

          var results = processResults(text, confs, true);
          for (var i = 0; i < results.length; i++) {
            results[i](results, i);
          }
          insertNewLine();
          Settings.InitDictationStatus = $.extend({}, Settings.DictationStatus);
          var div_to_scroll = document.getElementById("dictation-trans");
          div_to_scroll.scrollTop = div_to_scroll.scrollHeight;
        });
      },
      onError: function (code, data) {
        if (code == 19) {
          // ignore 19 code
          return;
        }
        dictate.cancel();
        __error(code, data);
        // TODO: show error in the GUI
      },
      onEvent: function (code, data) {
        __message(code, data);
        if (code == 10 && Settings.DictationStatus.warmup) {
          // warmup finished
          if (dictate.isListening()) {
            dictate.stopListening();
          }
          Settings.DictationStatus.warmup = false;
        }
      },
    });
  };

  function translateText(result) {
    return $.ajax({
      url: translateEndpoint,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ text: result }),
    });
  }

  /*
   * * *
   */
  doOnActiveMic = function (mic_id) {
    dictate.startListening();
    animate_dictation = true;

    if (mic_id == "start_stop_dictation_mac") {
      $("#start_stop_dictation_mac").removeClass("dictation_begin_mac");
      $("#start_stop_dictation_mac").addClass("dictation_stop_mac");
      //$("#dict_bottom_holder_mac").addClass("invisible");

      $("#first_run_hint_holder").addClass("hide");
    } else if (mic_id == "dictation_button") {
      $("body").attr("dictating_in_main_window", "true");

      $("#dictation_button").removeClass("start_dictation");
      $("#dictation_button").addClass("stop_dictation");

      $(
        ".partial_result_t, .final_result_t, .partial_result, .final_result"
      ).remove();

      if ($("#btn-show-text-translator").hasClass("active") == true) {
        $("#mt-search-input").addClass("hide");
        $("#mt-source-hover").addClass("hide");
        $("#mt-source-tooltip").addClass("hide");
        $("#target-text-tooltip").addClass("hide");
        $("#dictation_holder_1").removeClass("hide");
        $(".tmp_result").remove();

        var tmp_txt;
        if ($("#mt-search-input").val() != "") {
          tmp_txt =
            "<span class=tmp_result>" + $("#mt-search-input").val() + "</span>";
          $("#dictation_holder_1").append(tmp_txt);
        }
      } else {
        $("#search-input").addClass("hide");
        $("#dictation_holder").removeClass("hide");
      }

      timeout_g = setTimeout(function () {
        turnDictationOff();
      }, 15000);

      $("#dictation_canvas_holder").removeClass("hide");
    }
  };
  /*
   * * *
   */
  checkMic = function (notify, id) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        {
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        },
        function (stream) {
          if (stream.active == true) {
            console.log("found active stream...");
            if (dictate) {
              console.log("dictate defined, ", dictate);
            } else {
              console.log("dictate not defined, ", dictate, " defining...");
              newDictate();
            }
            dictate.init(function () {
              doOnActiveMic(id);
            }, stream);
          } else {
            console.log("no active stream...");
            if (dictate) {
              dictate.destroy();
            }
            dictate = null;
            delete dictate;
            cancelAnimationFrame(anim_req_id);
            if (notify == true) {
              Notify(Locale["asr_error_no_mic"], "error");
            }
          }
        },
        function (e) {
          console.log("did not find any stream...");
          if (dictate) {
            dictate.destroy();
          }
          dictate = null;
          delete dictate;
          cancelAnimationFrame(anim_req_id);
          if (notify == true) {
            Notify(Locale["asr_error_no_mic"], "error");
          }
        }
      );
    } else {
      console.log("no navigator...");
    }
  };
  /*
   * * *
   */

  /*
   * * *
   */
  $("#start_stop_dictation_mac").on("click", function (event) {
    if (
      $("#start_stop_dictation_mac").hasClass("dictation_begin_mac") == true
    ) {
      checkMic(true, "start_stop_dictation_mac");
    } else {
      dictate.stopListening();
      animate_dictation = false;
      var canvas = document.getElementById("canvas_dictation");
      var width = canvas.offsetWidth;
      var height = canvas.height;
      var canvas_ctx = canvas.getContext("2d");
      canvas_ctx.clearRect(0, 0, width, height);
      $("#start_stop_dictation_mac").removeClass("dictation_stop_mac");
      $("#start_stop_dictation_mac").addClass("dictation_begin_mac");
    }

    event.preventDefault();
  });
  /*
   * * *
   */
  $("#dictation_button").on(
    "click",
    function (event) {
      if ($("#dictation_button").hasClass("start_dictation") == true) {
        checkMic(true, "dictation_button");
      } else {
        $("#dictation_button").removeClass("stop_dictation");
        $("#dictation_button").addClass("start_dictation");

        $("body").attr("dictating_in_main_window", "false");
        dictate.stopListening();

        $("#dictation_canvas_holder").addClass("hide");
        animate_dictation = false;
        clearTimeout(timeout_g);

        var dictated_text;

        if ($("#btn-show-text-translator").hasClass("active") == true) {
          dictated_text = $(".final_result_t, .partial_result_t").text();
          $("#mt-search-input").removeClass("hide");
          $("#mt-source-hover").removeClass("hide");
          $("#target-text-tooltip").removeClass("hide");
          $("#dictation_holder_1").addClass("hide");

          View.translatorWidget.textTranslator.setSourceText(
            $("#mt-search-input").val() + dictated_text
          );
        } else {
          dictated_text = $(".final_result, .partial_result").text();
          $("#search-input").removeClass("hide");
          $("#dictation_holder").addClass("hide");
          $("#search-input").html(dictated_text);
          this.translateText(null, dictated_text.trim().encodeString());
        }
      }
    }.bind(this)
  );
  /*
   * * *
   */
  turnDictationOff = function () {
    if ($("#dictation_button").hasClass("stop_dictation") == true) {
      $("#dictation_button").trigger({ type: "click", which: 1 });
    }
  };
  /*
   * * *
   */
  $("#btn-show-text-translator").on("click", function () {
    turnDictationOff();
  });
  /*
   * * *
   */
  $("#btn-reverse-dir").on("click", function () {
    if (
      $("#fancy_direction_from .options .selected").text() == "Latviešu" ||
      $("#fancy_direction_from .options .selected").text() == "Latvian"
    ) {
      $("#dictation_button").removeClass("invisible");
    } else {
      turnDictationOff();
      $("#dictation_button").addClass("invisible");
    }
  });
  /*
   * * *
   */
  $("#direction-from").on("change", function (event) {
    if (
      $("#fancy_direction_from .options .selected").text() == "Latviešu" ||
      $("#fancy_direction_from .options .selected").text() == "Latvian"
    ) {
      $("#dictation_button").removeClass("invisible");
    } else {
      turnDictationOff();
      $("#dictation_button").addClass("invisible");
    }
  });
  /*
   * * *
   */
  $("#dict_open").on({
    "click keyup": function (event) {
      if (
        ((event.type === "click" && event.which === 1) ||
          (event.type === "keyup" && event.which === 13)) &&
        event.currentTarget.getAttribute("data-disabled") !== "true"
      ) {
        Model.openFile("ocrresult.rtf", getDictationResult().trim());
      }
    },
  });
  /*
   * * *
   */
  $("#dict_translate").on({
    "click keyup": function (event) {
      if (
        ((event.type === "click" && event.which === 1) ||
          (event.type === "keyup" && event.which === 13)) &&
        event.currentTarget.getAttribute("data-disabled") !== "true"
      ) {
        this.translateText(null, getDictationResult().trim().encodeString());
      }
    }.bind(this),
  });

  /*
   * * *
   */
  $("#dict_clear").on("click", function () {
    $("#dictation-trans").html("");
    $("#first_run_hint_holder").removeClass("hide");
    $("#dict_bottom_holder_mac").addClass("invisible");
    // TODO: set caret
    // prevent simultaneous edit and dictation
    if (dictate && dictate.isListening()) {
      dictate.stopListening();
    }
  });
  if (!Array.prototype.fill) {
    Array.prototype.fill = function (value) {
      // Steps 1-2.
      if (this == null) {
        throw new TypeError("this is null or not defined");
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k =
        relativeStart < 0
          ? Math.max(len + relativeStart, 0)
          : Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ? len : end >> 0;

      // Step 11.
      var final =
        relativeEnd < 0
          ? Math.max(len + relativeEnd, 0)
          : Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    };
  }
};

window.InitStack.push(function () {
  if (typeof View === "undefined") return false;

  View.dictationView();
});
