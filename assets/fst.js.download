// Copyright (c) 2015 Tilde Ltd All Rights Reserved.

/**
 * FST lib
 * @fileoverview Simple deterministic FST (Finite State Transducer)
 * implementation
 */
(function() {

    /**
     * Initial state name of FST
     */
    var START_STATE = 0;

    /**
     * Construct a deterministic FST (Finite State Transducer)
     * from given table in string format
     * @param {object} table is a convert table
     * @returns {FST} FST object
     */
    var construct = function(str) {         
        var fst = new FST();
        var transitions = str.split("\n");
        for (var i in transitions) {
            fst.add_arc(transitions[i].split("\t"))
        }
        return fst;
    };

    /**
     * Load a deterministic FST from JSON
     */
    var load = function(table) {
        var fst = new FST();
        fst.table = table;
        return fst;
    };

    /**
     * FST constructor
     * @constructor
     */
    function FST() {
        // transition table
        this.table = {};
    };

    /**
     * Add a transition to this FST
     * @param {Array} parameter arc is an array describing an arc
     */
    FST.prototype.add_arc = function(arc) {

        if (arc.length < 4) {
            arc[1] = "-1";
            arc[2] = "<eps>";
            arc[3] = "<eps>";
        }
        var arc = { 
            input_state: parseInt(arc[0]),
            output_state: parseInt(arc[1]),
            input_sym: arc[2],
            output_sym: arc[3],
        };

        if (typeof this.table[arc.input_state] == 'undefined') {
            this.table[arc.input_state] = {arcs: {}};
        }
        if (typeof this.table[arc.output_state] == 'undefined') {
            this.table[arc.output_state] = {arcs: {}};
        }

        this.table[arc.input_state].arcs[arc.input_sym] = arc;
    };

    /**
     * Add a transition to this FST
     * @param {Array} parameter arc is an array describing an arc
     */
    FST.prototype.convert = function(input) {

        var state = START_STATE; // starting state
        var output = [];
        var table = this.table;

        for (var i in input) {
            if (state == -1) {
                // finishing state reached before all input consumed
                return null; // error
            }
            if (typeof table[state].arcs[input[i]] != 'undefined') {
                // follow arc
                var arc = table[state].arcs[input[i]];
                state = arc.output_state;
                if (arc.output_sym != "<eps>") {
                    output.push(arc.output_sym);
                }
            } else {
                // try epsilon arc
                var arc;
                while (typeof table[state].arcs[input[i]] == 'undefined') {
                    if (typeof table[state].arcs["<eps>"] == 'undefined') {
                        // failed to consume input symbol
                        return null;
                    }
                    arc = table[state].arcs["<eps>"];
                    state = arc.output_state;
                    if (state == -1) {
                       // finishing state reached before all input consumed
                       return null; // error
                    }
                    if (arc.output_sym != "<eps>") {
                        output.push(arc.output_sym);
                    }
                }
                // follow arc
                arc = table[state].arcs[input[i]];
                state = arc.output_state;
                if (arc.output_sym != "<eps>") {
                    output.push(arc.output_sym);
                }
            }
        }

        // try to reach final state
        if (state != -1) {
            while (state != -1) {
                if (typeof table[state].arcs["<eps>"] == 'undefined') {
                     // failed to reach final state
                        return null;
                }
                arc = table[state].arcs["<eps>"];
                state = arc.output_state;
                if (arc.output_sym != "<eps>") {
                     output.push(arc.output_sym);
                }
            }
        }

        return output;
    };


    /**
     * Public methods or fields of global object CFST
     */
    var CFST = {
        'construct': construct,
        'load': load,
    };

    if ('undefined' == typeof module) {
	    // In browser
	    window.CFST = CFST;
    } else {
	    // In node
	    module.exports = CFST;
    }
})();

