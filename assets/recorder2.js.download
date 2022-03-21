(function (window) {
    var WORKER_PATH = "recorderWorker.js";
    var WORKLET_PATH = "lib/recorderWorklet.js";
    var src_glob;
    var Recorder = function (source, cfg) {
      src_glob = source;
      var config = cfg || {};
      this.context = src_glob.context;
      var recording = false,
        currCallback;
      var bufferLen = 128; // fixed for audio worklets
  
      var worker = new Worker(config.workerPath || WORKER_PATH);
  
      this.context.audioWorklet
        .addModule(config.workletPath || WORKLET_PATH)
        .then(() => {
          // After the resolution of module loading, an AudioWorkletNode can be
          // constructed.
          this.node = new AudioWorkletNode(this.context, "recorder-processor");
  
          // pass audio buffers from worklet to worker
          this.node.port.onmessage = (event) => {
            worker.postMessage(event.data);
          };
  
          // speech FFT for VAD
          this.userSpeechAnalyser = this.context.createAnalyser();
          this.userSpeechAnalyser.fftSize = Math.min(bufferLen, 2048);
          var vaDetector = new vad(this.userSpeechAnalyser, {
            pt_SF: 2.5,
            sampleRate: this.context.sampleRate,
            sum_counts: 0.1,
          });
          this.vaDetector = vaDetector;
          worker.onmessage = function (e) {
            if (e.data == "rqVAD") {
              worker.postMessage({
                command: "vad",
                vad: 1, // fake VAD, was vaDetector.iterate(),
              });
            } else {
              var blob = e.data;
              currCallback(blob);
            }
          };
          worker.postMessage({
            command: "init",
            config: {
              sampleRate: this.context.sampleRate,
              resample: config.resample,
              bufferSize: bufferLen,
            },
          });
  
          src_glob.connect(this.userSpeechAnalyser);
          src_glob.connect(this.node);
          this.node.connect(this.context.destination); //TODO: this should not be necessary (try to remove it)
        })
        .catch((err) => {
          // console.log(err);
        });
  
      this.configure = function (cfg) {
        for (var prop in cfg) {
          if (cfg.hasOwnProperty(prop)) {
            config[prop] = cfg[prop];
          }
        }
      };
  
      this.record = function () {
        this.node.port.postMessage({ command: "recording", recording: true });
        recording = true;
      };
  
      this.stop = function () {
        // this.node.port.postMessage({ command: "recording", recording: false });
        // recording = false;
      };
  
      this.terminate = function () {
        //    worker.terminate();
      };
  
      this.clear = function () {
        worker.postMessage({ command: "clear" });
      };
  
      this.getBuffer = function (cb) {
        currCallback = cb || config.callback;
        worker.postMessage({ command: "getBuffer" });
      };
  
      this.exportWAV = function (cb, type) {
        currCallback = cb || config.callback;
        type = type || config.type || "audio/wav";
        if (!currCallback) throw new Error("Callback not set");
        worker.postMessage({
          command: "exportWAV",
          type: type,
        });
      };
  
      this.exportRAW = function (cb, type) {
        currCallback = cb || config.callback;
        type = type || config.type || "audio/raw";
        if (!currCallback) throw new Error("Callback not set");
        worker.postMessage({
          command: "exportRAW",
          type: type,
        });
      };
  
      this.export16kMono = function (cb, type) {
        currCallback = cb || config.callback;
        type = type || config.type || "audio/raw";
        if (!currCallback) throw new Error("Callback not set");
  
        worker.postMessage({
          command: "export16kMono",
          type: type,
        });
      };
  
      // FIXME: doesn't work yet
      this.exportSpeex = function (cb, type) {
        currCallback = cb || config.callback;
        type = type || config.type || "audio/speex";
        if (!currCallback) throw new Error("Callback not set");
        worker.postMessage({
          command: "exportSpeex",
          type: type,
        });
      };
    };
  
    Recorder.forceDownload = function (blob, filename) {
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var link = window.document.createElement("a");
      link.href = url;
      link.download = filename || "output.wav";
      var click = document.createEvent("Event");
      click.initEvent("click", true, true);
      link.dispatchEvent(click);
    };
  
    window.Recorder = Recorder;
  })(window);
  