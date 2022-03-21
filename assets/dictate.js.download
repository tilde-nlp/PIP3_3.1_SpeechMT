(function (window) {

    // Defaults
    var SERVER = "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/speech";
    var RESAMPLE = '0';
    var SERVER_STATUS = null;
    var REFERENCE_HANDLER = "http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference";
    // Send blocks 4 x per second as recommended in the server doc.
    var INTERVAL = 250;
    var TAG_END_OF_SENTENCE = "EOS";
    var RECORDER_WORKER_PATH = 'recorderWorker.js';
    // some app id
    var APPID = "test";
    var APPSECRET = "www.tilde.lv";

    // Error codes (mostly following Android error names and codes)
    var ERR_NETWORK = 2;
    var ERR_AUDIO = 3;
    var ERR_SERVER = 4;
    var ERR_CLIENT = 5;

    // Event codes
    var MSG_WAITING_MICROPHONE = 1;
    var MSG_MEDIA_STREAM_CREATED = 2;
    var MSG_INIT_RECORDER = 3;
    var MSG_RECORDING = 4;
    var MSG_SEND = 5;
    var MSG_SEND_EMPTY = 6;
    var MSG_SEND_EOS = 7;
    var MSG_WEB_SOCKET = 8;
    var MSG_WEB_SOCKET_OPEN = 9;
    var MSG_WEB_SOCKET_CLOSE = 10;
    var MSG_STOP = 11;
    var MSG_SERVER_CHANGED = 12;
    var MSG_WAITING_SPEECH = 13;

    // Server status codes
    // from https://github.com/alumae/kaldi-gstreamer-server
    var SERVER_STATUS_CODE = {
        0: 'Success', // Usually used when recognition results are sent
        1: 'No speech', // Incoming audio contained a large portion of silence or non-speech
        2: 'Aborted', // Recognition was aborted for some reason
        9: 'No available', // recognizer processes are currently in use and recognition cannot be performed
        10: 'Authentication failed',
    };

    // Initialized by init()
    var audioContext;
    var inputStream;
    var recorder;
    var animate_called = false;
    // Initialized by startListening()
    var websocket;
    var intervalKey;
    var _isSleeping = false;
    var _isListening = false;
    var prev_hyp = "";
    // Initialized during construction
    var wsServerStatus;
    var is_initialized = false;
    // Send buffer
    var sendBuffer = [];

    var Dictate = function (cfg) {
        var config = cfg || {};
        config.server = config.server || SERVER;
        config.resample = config.resample || RESAMPLE;
        config.appID = config.appID || APPID;
        config.appSecret = config.appSecret || APPSECRET;
        config.serverStatus = config.serverStatus || SERVER_STATUS;
        config.referenceHandler = config.referenceHandler || REFERENCE_HANDLER;
        config.interval = config.interval || INTERVAL;
        config.recorderWorkerPath = config.recorderWorkerPath || RECORDER_WORKER_PATH;
        config.onReadyForSpeech = config.onReadyForSpeech || function () {
        };
        config.onSpeech = config.onSpeech || function () {
        };
        config.onSilence = config.onSilence || function () {
        };
        config.onEndOfSpeech = config.onEndOfSpeech || function () {
        };
        config.onPartialResults = config.onPartialResults || function (data) {
        };
        config.onResults = config.onResults || function (data) {
        };
        config.onEndOfSession = config.onEndOfSession || function () {
        };
        config.onEvent = config.onEvent || function (e, data) {
        };
        config.onError = config.onError || function (e, data) {
        };
        config.onServerStatus = config.onServerStatus || {};
        config.rafCallback = config.rafCallback || function (time) {
        };
        config.adaptationState = config.adaptationState || null;
        config.audioVisualizer = config.audioVisualizer || function (analyzer, vad) {
        };
        if (config.serverStatus && config.onServerStatus) {
            monitorServerStatus();
        }

        // Returns the configuration
        this.getConfig = function () {
            return config;
        };

        this.isListening = function () {
            return _isListening;
        };

        this.isSleeping = function () {
            return _isSleeping;
        };

        this.toggleVAD = function () {
            return recorder.vaDetector.toggle();
        };

        this.isInitialized = function () {
            return is_initialized;
        };

        this.setInitialized = function (value) {
            is_initialized = value;
        };

        this.destroy = function () {
            console.log("%%%%%%%% destroying");
            audioContext = null;
            recorder.terminate();
            recorder = null;
            // Initialized by startListening()
            websocket = null;
            intervalKey = null;
            _isSleeping = false;
            _isListening = false;
            // Initialized during construction
            wsServerStatus = null;
        };
        // Set up the recorder (incl. asking permission)
        // Initializes audioContext
        // Can be called multiple times.
        // TODO: call something on success (MSG_INIT_RECORDER is currently called)
        this.init = function (callbackFunction, audioStream) {
            config.onEvent(MSG_WAITING_MICROPHONE, "Waiting for approval to access your microphone ...");
            try {
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                window.URL = window.URL || window.webkitURL;
                if (!audioContext) {
                    audioContext = new AudioContext();
                }

            } catch (e) {
                // Firefox 24: TypeError: AudioContext is not a constructor
                // Set media.webaudio.enabled = true (in about:config) to fix this.
                config.onError(ERR_CLIENT, "Error initializing Web Audio browser: " + e);
            }
            var mediaSuccess = function (stream) {
                startUserMedia(stream);
                if (callbackFunction) {
                    callbackFunction();
                }
                is_initialized = true;
            };

            if (audioStream) {
                mediaSuccess(audioStream);
            } else if (navigator.getUserMedia) {
                navigator.getUserMedia({audio: true}, mediaSuccess,
                    function (e) {
                        config.onError(ERR_CLIENT, "No live audio input in this browser: " + e);
                    });
            } else {
                config.onError(ERR_CLIENT, "No user media support");
            }
        };

        // Start recording and transcribing
        this.startListening = function () {
            if (!recorder) {
                config.onError(ERR_AUDIO, "Recorder undefined");
                return (ERR_AUDIO);
            }


            if (websocket) {
                this.cancel();
            }

            prev_hyp = "";

            try {
                websocket = createWebSocket();
            } catch (e) {
                config.onError(ERR_CLIENT, "No web socket support in this browser!");
            }
        };

        // Stop listening, i.e. recording and sending of new input.
        this.stopListening = function () {
            // Stop the regular sending of audio
            clearInterval(intervalKey);
            // Stop recording
            if (recorder) {
                recorder.stop();
                var wasSleeping = _isListening;
                _isListening = false;
                _isSleeping = false;

                // destroy audio objects			    
                if (typeof inputStream.stop !== "undefined") {
                    inputStream.stop();
                } else {
                    var a = inputStream.getAudioTracks()[0];
                    a.stop();
                }

                if (!wasSleeping) {
                    // Push the remaining audio to the server
                    recorder.exportRAW(function (blob) {
                        socketSend(blob);
                        socketSend(TAG_END_OF_SENTENCE);
                        recorder.clear();
                    }, 'audio/x-raw');
                } else {
                    config.onEndOfSession();
                }
                config.onEvent(MSG_STOP, 'Stopped recording');
                config.onEndOfSpeech();
            } else {
                config.onError(ERR_AUDIO, "Recorder undefined");
            }
        };

        // Stop sending data to ws
        // sending will be resumed after voice activity is detected
        this.stopSending = function () {
            if (_isSleeping) return; // already sleeping, do nothing

            // Push the remaining audio to the server
            recorder.exportRAW(function (blob) {
                socketSend(TAG_END_OF_SENTENCE);
                recorder.clear();
            }, 'audio/x-raw');
            config.onEvent(MSG_WAITING_SPEECH, 'Stopped sending');
            _isSleeping = true;
            config.onEndOfSpeech();
        };

        // Cancel everything without waiting on the server
        this.cancel = function () {
            console.log("##### cancel called");
            // Stop the regular sending of audio (if present)
            clearInterval(intervalKey);
            _isListening = false;
            _isSleeping = false;
            if (recorder) {
                recorder.stop();
                recorder.clear();
                config.onEvent(MSG_STOP, 'Stopped recording');
            }
            if (websocket) {
                websocket.close();
                websocket = null;
            }
        };

        // Sets the URL of the speech server
        this.setServer = function (server) {
            config.server = server;
            config.onEvent(MSG_SERVER_CHANGED, 'Server changed: ' + server);
        };

        // Sets the URL of the speech server status server
        this.setServerStatus = function (serverStatus) {
            config.serverStatus = serverStatus;

            if (config.onServerStatus) {
                monitorServerStatus();
            }

            config.onEvent(MSG_SERVER_CHANGED, 'Server status server changed: ' + serverStatus);
        };

        // Sends reference text to speech server
        this.submitReference = function submitReference(text, successCallback, errorCallback) {
            var headers = {};
            if (config["user_id"]) {
                headers["User-Id"] = config["user_id"]
            }
            if (config["content_id"]) {
                headers["Content-Id"] = config["content_id"]
            }
            $.ajax({
                url: config.referenceHandler,
                type: "POST",
                headers: headers,
                data: text,
                dataType: "text",
                success: successCallback,
                error: errorCallback,
            });
        };

        // Private methods
        function startUserMedia(stream) {
            inputStream = stream;
            var input = audioContext.createMediaStreamSource(stream);
            config.onEvent(MSG_MEDIA_STREAM_CREATED, 'Media stream created');

            window.analyzer_for_animation = audioContext.createAnalyser();
            window.analyzer_for_animation.fftSize = 512;
            window.analyzer_for_animation.smoothingTimeConstant = 0.95;
            input.connect(window.analyzer_for_animation);

            config.rafCallback();
            // always initialize recorder
            if (recorder)
                recorder.terminate();
            recorder = null;
            recorder = new Recorder(input, {resample: config.resample, workerPath: config.recorderWorkerPath});
            config.onEvent(MSG_INIT_RECORDER, 'Recorder initialized');

            config.audioVisualizer(window.analyzer_for_animation, recorder.vaDetector);
        }

        function socketSend(item) {
            if (websocket) {
                var state = websocket.readyState;
                if (state == 1) {
                    // If item is an audio blob
                    if (item instanceof Blob) {
                        if (item.size > 0) {
                            websocket.send(item);
                            config.onEvent(MSG_SEND, 'Send: blob: ' + item.type + ', ' + item.size);
                        } else {
                            config.onEvent(MSG_SEND_EMPTY, 'Send: blob: ' + item.type + ', EMPTY');
                        }
                        // Otherwise it's the EOS tag (string)
                    } else {
                        websocket.send(item);
                        config.onEvent(MSG_SEND_EOS, 'Send tag: ' + item);
                    }
                } else {
                    config.onError(ERR_NETWORK, 'WebSocket: readyState!=1: ' + state + ": failed to send: " + item);
                }
            } else {
                config.onError(ERR_CLIENT, 'No web socket connection: failed to send: ' + item);
            }
        }

        function sendAuth() {
            if (config.appID) {
                var ts = Math.floor((new Date).getTime() / 1000); // current timestamp in POSIX
                var auth = {
                    'appID': config.appID,
                    'timestamp': ts,
                    'appKey': (ts + config.appID + config.appSecret).sha1(),
                    'enable-postprocess': ["numbers"],
                    'enable-partial-postprocess': ["numbers"],
                };

                socketSend(JSON.stringify(auth));
            }
        }

        function getContentType() {
            if (config.resample != '0')
                return "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)" + config.resample + ",+format=(string)S16LE,+channels=(int)1";
            else
                return "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)" + audioContext.sampleRate + ",+format=(string)S16LE,+channels=(int)1";
        }

        function createWebSocket() {
            var url = config.server + '?' + getContentType();
            if (config["user_id"]) {
                url += '&user-id=' + config["user_id"]
            }
            if (config["content_id"]) {
                url += '&content-id=' + config["content_id"]
            }
            var ws = new WebSocket(url);

            ws.onmessage = function (e) {
                if (_isListening == false) return; // do not return recognition events if not listening

                var data = e.data;
                // fixme MEGA HACK 4 LAMPA relay stuff
                // console.log("relaying message");
                $.ajax({
                    url: "https://balss.tilde.lv/relay",
                    type: "POST",
                    data: data,
                    success: function(data, textStatus, jqXHR) {
                        // console.log("message relayed successfully");
                        // fixme don't think there's anything here that needs doing
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        // console.log("message relay failed");
                        // fixme anything here?
                    },
                });
                // fixme end MEGA HACK

                config.onEvent(MSG_WEB_SOCKET, data);
                if (data instanceof Object && !(data instanceof Blob)) {
                    config.onError(ERR_SERVER, 'WebSocket: onEvent: got Object that is not a Blob');
                } else if (data instanceof Blob) {
                    config.onError(ERR_SERVER, 'WebSocket: got Blob');
                } else {
                    var res = JSON.parse(data);
                    if (res.status == 0) {
                        if (res.adaptation_state) {
                            // TODO: adaptation state
                            config.adaptationState = data;
                        } else if (res.result.final) {
                            prev_hyp = "";
                            config.onResults(res.result.hypotheses);
                        } else {
                            if (prev_hyp != res.result.hypotheses) {
                                config.onPartialResults(res.result.hypotheses);
                            }
                            prev_hyp = res.result.hypotheses;
                        }
                    } else if (res.status == 1) {
                        // adapt VAD
                        recorder.vaDetector.adaptNoSpeech();
                        // stop sending and go to sleep
                        config.onEvent(MSG_WAITING_SPEECH, 'Stopped sending (adapted VAD for noise)');
                        _isSleeping = true;
                        config.onEndOfSpeech();
                    } else if (res.status == 11) {
                        //$("#start_stop_dictation_mac").trigger({ type: 'click', which: 1 });
                        config.onError(19, "no workers available");
                    } else {
                        config.onError(ERR_SERVER, 'Server error: ' + res.status + ': ' + getDescription(res.status));
                    }
                }
            };

            // Start recording only if the socket becomes open
            ws.onopen = function (e) {
                // Send auth data first!
                sendAuth();

                if (sendBuffer.length > 0) {
                    // send buffer not empty, send the "preamble" audio frames
                    for (var i = 0; i < sendBuffer.length; i++) {
                        socketSend(sendBuffer[i]);
                    }
                    sendBuffer = [];
                    config.onSpeech();
                }
                intervalKey = setInterval(function () {
                    recorder.exportRAW(function (blob) {
                        if (blob.size > 0) {
                            // if not silence, then send to server
                            if (!_isSleeping) {
                                if (sendBuffer.length > 0) {
                                    // send buffer not empty, send the "preamble" audio frames
                                    for (var i = 0; i < sendBuffer.length; i++) {
                                        socketSend(sendBuffer[i]);
                                    }
                                    sendBuffer = [];
                                }
                                socketSend(blob);
                                config.onSpeech();
                            } else {
                                // reconnect
                                clearInterval(intervalKey);
                                sendBuffer.push(blob);
                                websocket = createWebSocket();
                            }
                        } else {
                            config.onSilence();
                        }
                    }, 'audio/x-raw');
                }, config.interval);
                // Start recording
                if (!_isSleeping) {
                    recorder.record();
                }

                // Send adaptation state
                if (config.adaptationState !== null) {
                    socketSend(config.adaptationState);
                }
                _isListening = true;
                if (_isSleeping == false) {
                    config.onReadyForSpeech();
                }
                _isSleeping = false;
                config.onEvent(MSG_WEB_SOCKET_OPEN, e);
            };

            // This can happen if the blob was too big
            // E.g. "Frame size of 65580 bytes exceeds maximum accepted frame size"
            // Status codes
            // http://tools.ietf.org/html/rfc6455#section-7.4.1
            // 1005:
            // 1006:
            ws.onclose = function (e) {
                var code = e.code;
                var reason = e.reason;
                var wasClean = e.wasClean;
                if (!_isSleeping) {
                    // if sleeping, session continues, connection closed because of silence
                    // if not sleeping and listening, sleep\wake overlap (?), session lives
                    // if not sleeping and not listening, end of session
                    if (!_isListening) {
                        config.onEndOfSession();
                    }
                }
                config.onEvent(MSG_WEB_SOCKET_CLOSE, e.code + "/" + e.reason + "/" + e.wasClean);
            };

            ws.onerror = function (e) {
                console.log("..... ws on error called ", e);
                var data = e.data;
                config.onError(ERR_NETWORK, data);
            };

            return ws;
        }


        function monitorServerStatus() {
            if (wsServerStatus) {
                wsServerStatus.close();
            }
            wsServerStatus = new WebSocket(config.serverStatus);
            wsServerStatus.onmessage = function (evt) {
                config.onServerStatus(JSON.parse(evt.data));
            };
        }


        function getDescription(code) {
            if (code in SERVER_STATUS_CODE) {
                return SERVER_STATUS_CODE[code];
            }
            return "Unknown error";
        }


    };

    // Simple class for persisting the transcription.
    // If isFinal==true then a new line is started in the transcription list
    // (which only keeps the final transcriptions).
    var Transcription = function (cfg) {
        var index = 0;
        var list = [];

        this.add = function (text, isFinal) {
            list[index] = text;
            if (isFinal) {
                index++;
            }
        };

        this.toString = function () {
            return list.join('. ');
        }
    };

    window.Dictate = Dictate;
    window.Transcription = Transcription;

})(window);
