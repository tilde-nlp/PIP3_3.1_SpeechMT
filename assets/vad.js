/*
 * Voice Activity Detection (VAD) Library
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 18th March 2014
 */

var vad = (function () {

    var enabled = true;

    var vad = function (analyser, options) {
        this.analyser = analyser;
        // The default options
        this.options = {
            pt_E: 40, // Energy_PrimeThresh
            pt_F: 185, // F_PrimeThresh (Hz)
            pt_SF: 1.5, // SF_PrimeThresh
            min_F: 150, // Minimal F (Hz)
            // fftSize: 512,
            sampleRate: 48000,
            sum_counts: 0.1, // Sum counts for X seconds, for noise estimation
            pt_Speech: 0
        };
        // Read in instancing options.
        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                this.options[option] = options[option];
            }
        }

        // Setup the initial thresholds
        this.t_E = this.options.pt_E;
        this.t_F = this.options.pt_F;
        this.t_SF = this.options.pt_SF;
        this.t_Speech = this.options.pt_Speech;
        // Init the min values
        this.min_E = 0;
        this.min_F = 0;
        this.min_SF = 0;
        // The min value sums
        this.sum_E = 0;
        this.sum_F = 0;
        this.sum_SF = 0;
        // The min value sum length
        this.sum_counts = (this.options.sampleRate * this.options.sum_counts / this.analyser.fftSize);
        // Counters
        this.silence_count = 0;
        this.speech_count = 0;
        this.initial_count = 0;

        // Energy detector props
        this.energy_threshold = 1e-8;

        // Noise data
        this.initWaveform = new Uint8Array(analyser.fftSize);
        this.initFFT = new Uint8Array(analyser.frequencyBinCount);

        // log stuff
        this.logging = false;
        this.log_i = 0;
        this.log_limit = 100;
    };
    vad.prototype = {
        triggerLog: function (limit) {
            this.logging = true;
            this.log_i = 0;
            this.log_limit = typeof limit === 'number' ? limit : this.log_limit;
        },
        log: function (msg) {
            if (this.logging && this.log_i < this.log_limit) {
                this.log_i++;
                console.log(msg);
            } else {
                this.logging = false;
            }
        },
        adaptNoSpeech: function () {
            // false positive detected
            // adapt values

            var energy = this.getEnergy();
            var frequency = this.getFrequency();
            var SF = this.getSFM();

            // Update min energy
            this.min_E = ((this.speech_count * 0.5 * this.min_E) + energy * (this.speech_count + 1) * 0.5) / (this.speech_count + 1);
            this.t_E = this.options.pt_E * Math.log(this.min_E + 1);

            // update min_F
            this.min_F = ((this.speech_count * 0.5 * this.min_F) + frequency * (this.speech_count + 1) * 0.5) / (this.speech_count + 1);
            this.min_F = Math.max(this.min_F, this.options.min_F);

            // update SF
            this.min_SF = ((this.speech_count * 0.5 * this.min_SF) + SF * (this.speech_count + 1) * 0.5) / (this.speech_count + 1);

        },
        getEnergy: function () {
            // energy = SUM n=-inf->inf |x(n)|^2

            var value, energy = 0;
            var waveform = new Uint8Array(this.analyser.fftSize);
            this.analyser.getByteTimeDomainData(waveform);

            for (var i = 0, iLen = waveform.length; i < iLen; i++) {
                //value = (waveform[i] - 128) / 128;
                value = waveform[i] - 128;
                energy += (value * value) / (waveform.length + 1);
                //energy += value * value;
            }

            //			energy = 255 * energy / (waveform.length + 1);

            return energy;
        },
        getEnergyB: function () {

            var value, energy = 0;
            var fft = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(fft);

            for (var i = 0, iLen = fft.length; i < iLen; i++) {
                // value = fft[i] / 255;
                value = Math.pow(10, (fft[i] - 255) / 2550);
                energy += value * value;
            }

            // energy = 255 * energy / (fft.length + 1);

            return energy;
        },
        getEnergyC: function () {

            var value, energy = 0;
            var fft = new Float32Array(this.analyser.frequencyBinCount);
            this.analyser.getFloatFrequencyData(fft);

            for (var i = 0, iLen = fft.length; i < iLen; i++) {
                value = Math.pow(10, fft[i] / 10);
                energy += value * value;
            }

            // energy = 255 * energy / (fft.length + 1);

            energy = 255e8 * energy;

            // console.log('energy: ' + energy);

            return energy;
        },
        getEnergyD: function () {

            var value, energy = 0;
            var fft = new Float32Array(this.analyser.frequencyBinCount);
            this.analyser.getFloatFrequencyData(fft);

            // approx 200 to 2k

            for (var i = 2, iLen = fft.length; i < 20; i++) {
                value = Math.pow(10, fft[i] / 10);
                energy += value * value;
            }

            // energy = 255 * energy / (fft.length + 1);

            // energy = 255e8 * energy;

            // console.log('energy: ' + energy);

            return energy;
        },
        energyMonitor: function () {
            var energy = this.getEnergyD();
            var detection = energy - this.energy_threshold;
            var detected = false;
            // var integration = energy / 0.000001; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer
            var integration = detection / 100; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer
            if (detection >= 0) {
                detected = true;
                // this.energy_threshold += integration;
            } else {
                // this.energy_threshold -= integration;
            }
            this.energy_threshold += integration;
            this.energy_threshold = this.energy_threshold < 0 ? 0 : this.energy_threshold;

            if (detected) {
                // We raise an event?
            }

            this.log(
				'e: ' + energy +
				' | e_th: ' + this.energy_threshold +
				' | int: ' + integration +
				' | detection: ' + detection
			);

            return detection;
        },
        getFrequency: function () {
            var dominantBin = 0, maxBin = 0;
            var binHz = this.options.sampleRate / this.analyser.fftSize;

            var fft = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(fft);

            for (var i = 0, iLen = fft.length; i < iLen; i++) {
                if (this.initial_count > this.sum_counts) {
                    //fft[i] -= this.initFFT[i];
                }
                if (fft[i] > maxBin) {
                    dominantBin = i;
                    maxBin = fft[i];
                }
            }

            var frequency = (dominantBin * binHz) + (binHz / 2);
            // console.log("frequency: " + frequency);
            return frequency;
        },
        getSFM: function () {

            var geometric = 0;
            var arithmetic = 0;

            var bin;
            var empty = 0;

            var fft = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(fft);

            // var fft = new Float32Array(this.analyser.frequencyBinCount);
            // this.analyser.getFloatFrequencyData(fft);

            for (var i = 0, iLen = fft.length; i < iLen; i++) {
                bin = (fft[i] + 1) / 256; // So it is never zero
                // console.log("fft[" + i + "]: " + fft[i]);
                if (true || fft[i] > 0) {
                    // bin = fft[i] / 255;
                    // bin = fft[i];
                    geometric += Math.log(bin);
                    arithmetic += bin;
                } else {
                    // empty++;
                }
            }

            var bins = fft.length - empty;

            geometric = Math.exp(geometric / bins);
            arithmetic = arithmetic / bins;

            var SF = geometric / arithmetic;
            var SFM = 10 * (Math.log(SF) / Math.log(10));

            if (arithmetic > 0) {
                // console.log("geometric: " + geometric + " | arithmetic: " + arithmetic + " | SF: " + SF + " | SFM: " + SFM);
            }
            return SFM;
        },
        toggle: function () {
            enabled = !enabled;
        },
        iterate: function () {

            var votes = 0;

            var msg = "";

            if (!enabled) {
                return 1;
            }

            // Assuming the first N frames are silence, and use them to work out the minimums.
            if (this.initial_count < this.sum_counts) {
                this.initial_count++;
                this.sum_E += this.getEnergy();
                this.sum_F += this.getFrequency();
                this.sum_SF += this.getSFM();

                // save init data
                var waveform = new Uint8Array(this.analyser.fftSize);
                this.analyser.getByteTimeDomainData(waveform);
                for (var i = 0; i < this.analyser.fftSize; i++) {
                    this.initWaveform[i] += waveform[i];
                }

                var fft = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteFrequencyData(fft);
                for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
                    this.initFFT[i] += fft[i] * 0.5;
                }

                return 0; // false; // still initializing.
            } else if (this.initial_count === this.sum_counts) {
                this.initial_count++;
                this.min_E = this.sum_E / this.sum_counts;
                this.min_F = this.sum_F / this.sum_counts;
                this.min_F = Math.max(this.min_F, this.options.min_F);
                this.min_SF = this.sum_SF / this.sum_counts;
                // Set decision threshold.
                this.t_E = this.options.pt_E * Math.log(this.min_E + 1);
                // get average noise waveform
                for (var i = 0; i < this.analyser.fftSize; i++) {
                    this.initWaveform[i] = this.initWaveform[i] / this.sumcounts;
                }
                for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
                    this.initFFT[i] = this.initFFT[i] / this.sum_counts;
                }
                var sc = 512 / this.analyser.fftSize;
                this.t_Speech = Math.round(Math.ceil(this.t_Speech * sc));
            }

            // Collect votes on speech detection
            var energy = this.getEnergy();
            var delta_E = energy - this.min_E;
            if (delta_E >= this.t_E) {
                votes++;
                msg += " E";
            }
            var frequency = this.getFrequency();
            var delta_F = frequency - this.min_F;
            if (delta_F >= this.t_F) {
                votes++;
                msg += " F";
            }
            var SF = this.getSFM();
            var delta_SF = this.min_SF - SF;
            if (delta_SF >= this.t_SF) {
                votes++;
                msg += " SF";
            }

            // Record votes
            if (votes > 1) {
                // speech
                this.silence_count = 0;
                this.speech_count++;
            } else {
                // silence
                this.silence_count++;
                this.speech_count = 0;
                if (energy < this.min_E) {
                    // Update min energy
                    this.min_E = ((this.silence_count * this.min_E) + energy) / (this.silence_count + 1);
                    this.t_E = this.options.pt_E * Math.log(this.min_E + 1);

                    // update min_F
                    this.min_F = ((this.silence_count * this.min_F) + frequency) / (this.silence_count + 1);
                    this.min_F = Math.max(this.min_F, this.options.min_F);

                    // update SF
                    this.min_SF = ((this.silence_count * this.min_SF) + SF) / (this.silence_count + 1);
                }
            }

            //console.log("votes: " + votes + "(" + msg + ") | speech: " + this.speech_count + " | silence: " + this.silence_count + " | t_E: " + this.t_E + " | dE: " + delta_E + " | E: " + energy + " | t_F: " + this.t_F + " | dF: " + delta_F + " | t_SF: " + this.t_SF + " | dSF: " + delta_SF);

            if (this.speech_count > this.t_Speech) {
                return 1;
            } else {
                return 0;
            }
        }
    };
    return vad;
}());
