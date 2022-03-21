// Copyright (c) 2015 Tilde Ltd All Rights Reserved.

/**
 * Word-to-digit converter
 * @fileoverview Converts words to digits
 * implementation
 */
(function() {

// FST for conversion
var fst = CFST.load({
    "0": {
        "arcs": {
            "<eps>": {
                "input_state": 0,
                "output_state": 1,
                "input_sym": "<eps>",
                "output_sym": "1"
            },
            "divdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "divdesmit",
                "output_sym": "2"
            },
            "trīsdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "trīsdesmit",
                "output_sym": "3"
            },
            "četrdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "četrdesmit",
                "output_sym": "4"
            },
            "piecdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "piecdesmit",
                "output_sym": "5"
            },
            "sešdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "sešdesmit",
                "output_sym": "6"
            },
            "septiņdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "septiņdesmit",
                "output_sym": "7"
            },
            "astoņdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "astoņdesmit",
                "output_sym": "8"
            },
            "deviņdesmit": {
                "input_state": 0,
                "output_state": 2,
                "input_sym": "deviņdesmit",
                "output_sym": "9"
            },
            "simt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "simt",
                "output_sym": "1"
            },
            "divsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "divsimt",
                "output_sym": "2"
            },
            "trīssimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "trīssimt",
                "output_sym": "3"
            },
            "četrsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "četrsimt",
                "output_sym": "4"
            },
            "piecsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "piecsimt",
                "output_sym": "5"
            },
            "sešsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "sešsimt",
                "output_sym": "6"
            },
            "septiņsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "septiņsimt",
                "output_sym": "7"
            },
            "astoņsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "astoņsimt",
                "output_sym": "8"
            },
            "deviņsimt": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "deviņsimt",
                "output_sym": "9"
            },
            "viens": {
                "input_state": 0,
                "output_state": 4,
                "input_sym": "viens",
                "output_sym": "1"
            },
            "divi": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "divi",
                "output_sym": "2"
            },
            "trīs": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "trīs",
                "output_sym": "3"
            },
            "četri": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "četri",
                "output_sym": "4"
            },
            "pieci": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "pieci",
                "output_sym": "5"
            },
            "seši": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "seši",
                "output_sym": "6"
            },
            "septiņi": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "septiņi",
                "output_sym": "7"
            },
            "astoņi": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "astoņi",
                "output_sym": "8"
            },
            "deviņi": {
                "input_state": 0,
                "output_state": 5,
                "input_sym": "deviņi",
                "output_sym": "9"
            },
            "nulle": {
                "input_state": 0,
                "output_state": 6,
                "input_sym": "nulle",
                "output_sym": "0"
            },
            "tūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "1"
            },
            "tūkstotis": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "1"
            },
            "divtūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "divtūkstoš",
                "output_sym": "2"
            },
            "trīstūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "trīstūkstoš",
                "output_sym": "3"
            },
            "četrtūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "četrtūkstoš",
                "output_sym": "4"
            },
            "piectūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "piectūkstoš",
                "output_sym": "5"
            },
            "seštūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "seštūkstoš",
                "output_sym": "6"
            },
            "septiņtūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "septiņtūkstoš",
                "output_sym": "7"
            },
            "astoņtūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "astoņtūkstoš",
                "output_sym": "8"
            },
            "deviņtūkstoš": {
                "input_state": 0,
                "output_state": 7,
                "input_sym": "deviņtūkstoš",
                "output_sym": "9"
            },
            "simts": {
                "input_state": 0,
                "output_state": 3,
                "input_sym": "simts",
                "output_sym": "1"
            }
        }
    },
    "1": {
        "arcs": {
            "desmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "desmit",
                "output_sym": "0"
            },
            "vienpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "vienpadsmit",
                "output_sym": "1"
            },
            "divpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "divpadsmit",
                "output_sym": "2"
            },
            "trīspadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "trīspadsmit",
                "output_sym": "3"
            },
            "četrpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "četrpadsmit",
                "output_sym": "4"
            },
            "piecpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "piecpadsmit",
                "output_sym": "5"
            },
            "sešpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "sešpadsmit",
                "output_sym": "6"
            },
            "septiņpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "septiņpadsmit",
                "output_sym": "7"
            },
            "astoņpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "astoņpadsmit",
                "output_sym": "8"
            },
            "deviņpadsmit": {
                "input_state": 1,
                "output_state": 8,
                "input_sym": "deviņpadsmit",
                "output_sym": "9"
            }
        }
    },
    "2": {
        "arcs": {
            "<eps>": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "<eps>",
                "output_sym": "0"
            },
            "viens": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "viens",
                "output_sym": "1"
            },
            "divi": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "divi",
                "output_sym": "2"
            },
            "trīs": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "trīs",
                "output_sym": "3"
            },
            "četri": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "četri",
                "output_sym": "4"
            },
            "pieci": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "pieci",
                "output_sym": "5"
            },
            "seši": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "seši",
                "output_sym": "6"
            },
            "septiņi": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "septiņi",
                "output_sym": "7"
            },
            "astoņi": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "astoņi",
                "output_sym": "8"
            },
            "deviņi": {
                "input_state": 2,
                "output_state": 8,
                "input_sym": "deviņi",
                "output_sym": "9"
            }
        }
    },
    "3": {
        "arcs": {
            "<eps>": {
                "input_state": 3,
                "output_state": 9,
                "input_sym": "<eps>",
                "output_sym": "<eps>"
            },
            "divdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "divdesmit",
                "output_sym": "2"
            },
            "trīsdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "trīsdesmit",
                "output_sym": "3"
            },
            "četrdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "četrdesmit",
                "output_sym": "4"
            },
            "piecdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "piecdesmit",
                "output_sym": "5"
            },
            "sešdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "sešdesmit",
                "output_sym": "6"
            },
            "septiņdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "septiņdesmit",
                "output_sym": "7"
            },
            "astoņdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "astoņdesmit",
                "output_sym": "8"
            },
            "deviņdesmit": {
                "input_state": 3,
                "output_state": 2,
                "input_sym": "deviņdesmit",
                "output_sym": "9"
            }
        }
    },
    "4": {
        "arcs": {
            "<eps>": {
                "input_state": 4,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "<eps>"
            },
            "tūkstoš": {
                "input_state": 4,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "<eps>"
            },
            "tūkstotis": {
                "input_state": 4,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "<eps>"
            },
            "simts": {
                "input_state": 4,
                "output_state": 3,
                "input_sym": "simts",
                "output_sym": "<eps>"
            },
            "tūkstoši": {
                "input_state": 4,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "<eps>"
            }
        }
    },
    "5": {
        "arcs": {
            "tūkstoš": {
                "input_state": 5,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "<eps>"
            },
            "tūkstotis": {
                "input_state": 5,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "<eps>"
            },
            "tūkstoši": {
                "input_state": 5,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "<eps>"
            },
            "simti": {
                "input_state": 5,
                "output_state": 3,
                "input_sym": "simti",
                "output_sym": "<eps>"
            },
            "<eps>": {
                "input_state": 5,
                "output_state": -1,
                "input_sym": "<eps>",
                "output_sym": "<eps>"
            }
        }
    },
    "6": {
        "arcs": {
            "<eps>": {
                "input_state": 6,
                "output_state": -1,
                "input_sym": "<eps>",
                "output_sym": "<eps>"
            }
        }
    },
    "7": {
        "arcs": {
            "viens": {
                "input_state": 7,
                "output_state": 10,
                "input_sym": "viens",
                "output_sym": "1"
            },
            "divi": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "divi",
                "output_sym": "2"
            },
            "trīs": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "trīs",
                "output_sym": "3"
            },
            "četri": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "četri",
                "output_sym": "4"
            },
            "pieci": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "pieci",
                "output_sym": "5"
            },
            "seši": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "seši",
                "output_sym": "6"
            },
            "septiņi": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "septiņi",
                "output_sym": "7"
            },
            "astoņi": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "astoņi",
                "output_sym": "8"
            },
            "deviņi": {
                "input_state": 7,
                "output_state": 11,
                "input_sym": "deviņi",
                "output_sym": "9"
            },
            "<eps>": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "<eps>",
                "output_sym": "0"
            },
            "simt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "simt",
                "output_sym": "1"
            },
            "divsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "divsimt",
                "output_sym": "2"
            },
            "trīssimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "trīssimt",
                "output_sym": "3"
            },
            "četrsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "četrsimt",
                "output_sym": "4"
            },
            "piecsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "piecsimt",
                "output_sym": "5"
            },
            "sešsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "sešsimt",
                "output_sym": "6"
            },
            "septiņsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "septiņsimt",
                "output_sym": "7"
            },
            "astoņsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "astoņsimt",
                "output_sym": "8"
            },
            "deviņsimt": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "deviņsimt",
                "output_sym": "9"
            },
            "simts": {
                "input_state": 7,
                "output_state": 12,
                "input_sym": "simts",
                "output_sym": "1"
            }
        }
    },
    "8": {
        "arcs": {
            "tūkstoš": {
                "input_state": 8,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "<eps>"
            },
            "tūkstotis": {
                "input_state": 8,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "<eps>"
            },
            "tūkstoši": {
                "input_state": 8,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "<eps>"
            },
            "<eps>": {
                "input_state": 8,
                "output_state": -1,
                "input_sym": "<eps>",
                "output_sym": "<eps>"
            }
        }
    },
    "9": {
        "arcs": {
            "<eps>": {
                "input_state": 9,
                "output_state": 13,
                "input_sym": "<eps>",
                "output_sym": "0"
            },
            "viens": {
                "input_state": 9,
                "output_state": 14,
                "input_sym": "viens",
                "output_sym": "0"
            },
            "divi": {
                "input_state": 9,
                "output_state": 15,
                "input_sym": "divi",
                "output_sym": "0"
            },
            "trīs": {
                "input_state": 9,
                "output_state": 16,
                "input_sym": "trīs",
                "output_sym": "0"
            },
            "četri": {
                "input_state": 9,
                "output_state": 17,
                "input_sym": "četri",
                "output_sym": "0"
            },
            "pieci": {
                "input_state": 9,
                "output_state": 18,
                "input_sym": "pieci",
                "output_sym": "0"
            },
            "seši": {
                "input_state": 9,
                "output_state": 19,
                "input_sym": "seši",
                "output_sym": "0"
            },
            "septiņi": {
                "input_state": 9,
                "output_state": 20,
                "input_sym": "septiņi",
                "output_sym": "0"
            },
            "astoņi": {
                "input_state": 9,
                "output_state": 21,
                "input_sym": "astoņi",
                "output_sym": "0"
            },
            "deviņi": {
                "input_state": 9,
                "output_state": 22,
                "input_sym": "deviņi",
                "output_sym": "0"
            },
            "desmit": {
                "input_state": 9,
                "output_state": 13,
                "input_sym": "desmit",
                "output_sym": "1"
            },
            "vienpadsmit": {
                "input_state": 9,
                "output_state": 14,
                "input_sym": "vienpadsmit",
                "output_sym": "1"
            },
            "divpadsmit": {
                "input_state": 9,
                "output_state": 15,
                "input_sym": "divpadsmit",
                "output_sym": "1"
            },
            "trīspadsmit": {
                "input_state": 9,
                "output_state": 16,
                "input_sym": "trīspadsmit",
                "output_sym": "1"
            },
            "četrpadsmit": {
                "input_state": 9,
                "output_state": 17,
                "input_sym": "četrpadsmit",
                "output_sym": "1"
            },
            "piecpadsmit": {
                "input_state": 9,
                "output_state": 18,
                "input_sym": "piecpadsmit",
                "output_sym": "1"
            },
            "sešpadsmit": {
                "input_state": 9,
                "output_state": 19,
                "input_sym": "sešpadsmit",
                "output_sym": "1"
            },
            "septiņpadsmit": {
                "input_state": 9,
                "output_state": 20,
                "input_sym": "septiņpadsmit",
                "output_sym": "1"
            },
            "astoņpadsmit": {
                "input_state": 9,
                "output_state": 21,
                "input_sym": "astoņpadsmit",
                "output_sym": "1"
            },
            "deviņpadsmit": {
                "input_state": 9,
                "output_state": 22,
                "input_sym": "deviņpadsmit",
                "output_sym": "1"
            }
        }
    },
    "10": {
        "arcs": {
            "simts": {
                "input_state": 10,
                "output_state": 12,
                "input_sym": "simts",
                "output_sym": "<eps>"
            }
        }
    },
    "11": {
        "arcs": {
            "simti": {
                "input_state": 11,
                "output_state": 12,
                "input_sym": "simti",
                "output_sym": "<eps>"
            }
        }
    },
    "12": {
        "arcs": {
            "<eps>": {
                "input_state": 12,
                "output_state": 23,
                "input_sym": "<eps>",
                "output_sym": "<eps>"
            },
            "divdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "divdesmit",
                "output_sym": "2"
            },
            "trīsdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "trīsdesmit",
                "output_sym": "3"
            },
            "četrdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "četrdesmit",
                "output_sym": "4"
            },
            "piecdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "piecdesmit",
                "output_sym": "5"
            },
            "sešdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "sešdesmit",
                "output_sym": "6"
            },
            "septiņdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "septiņdesmit",
                "output_sym": "7"
            },
            "astoņdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "astoņdesmit",
                "output_sym": "8"
            },
            "deviņdesmit": {
                "input_state": 12,
                "output_state": 24,
                "input_sym": "deviņdesmit",
                "output_sym": "9"
            }
        }
    },
    "13": {
        "arcs": {
            "<eps>": {
                "input_state": 13,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "0"
            },
            "tūkstoš": {
                "input_state": 13,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "0"
            },
            "tūkstotis": {
                "input_state": 13,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "0"
            },
            "tūkstoši": {
                "input_state": 13,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "0"
            }
        }
    },
    "14": {
        "arcs": {
            "<eps>": {
                "input_state": 14,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "1"
            },
            "tūkstoš": {
                "input_state": 14,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "1"
            },
            "tūkstotis": {
                "input_state": 14,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "1"
            },
            "tūkstoši": {
                "input_state": 14,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "1"
            }
        }
    },
    "15": {
        "arcs": {
            "<eps>": {
                "input_state": 15,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "2"
            },
            "tūkstoš": {
                "input_state": 15,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "2"
            },
            "tūkstotis": {
                "input_state": 15,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "2"
            },
            "tūkstoši": {
                "input_state": 15,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "2"
            }
        }
    },
    "16": {
        "arcs": {
            "<eps>": {
                "input_state": 16,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "3"
            },
            "tūkstoš": {
                "input_state": 16,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "3"
            },
            "tūkstotis": {
                "input_state": 16,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "3"
            },
            "tūkstoši": {
                "input_state": 16,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "3"
            }
        }
    },
    "17": {
        "arcs": {
            "<eps>": {
                "input_state": 17,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "4"
            },
            "tūkstoš": {
                "input_state": 17,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "4"
            },
            "tūkstotis": {
                "input_state": 17,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "4"
            },
            "tūkstoši": {
                "input_state": 17,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "4"
            }
        }
    },
    "18": {
        "arcs": {
            "<eps>": {
                "input_state": 18,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "5"
            },
            "tūkstoš": {
                "input_state": 18,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "5"
            },
            "tūkstotis": {
                "input_state": 18,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "5"
            },
            "tūkstoši": {
                "input_state": 18,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "5"
            }
        }
    },
    "19": {
        "arcs": {
            "<eps>": {
                "input_state": 19,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "6"
            },
            "tūkstoš": {
                "input_state": 19,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "6"
            },
            "tūkstotis": {
                "input_state": 19,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "6"
            },
            "tūkstoši": {
                "input_state": 19,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "6"
            }
        }
    },
    "20": {
        "arcs": {
            "<eps>": {
                "input_state": 20,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "7"
            },
            "tūkstoš": {
                "input_state": 20,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "7"
            },
            "tūkstotis": {
                "input_state": 20,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "7"
            },
            "tūkstoši": {
                "input_state": 20,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "7"
            }
        }
    },
    "21": {
        "arcs": {
            "<eps>": {
                "input_state": 21,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "8"
            },
            "tūkstoš": {
                "input_state": 21,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "8"
            },
            "tūkstotis": {
                "input_state": 21,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "8"
            },
            "tūkstoši": {
                "input_state": 21,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "8"
            }
        }
    },
    "22": {
        "arcs": {
            "<eps>": {
                "input_state": 22,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "9"
            },
            "tūkstoš": {
                "input_state": 22,
                "output_state": 7,
                "input_sym": "tūkstoš",
                "output_sym": "9"
            },
            "tūkstotis": {
                "input_state": 22,
                "output_state": 7,
                "input_sym": "tūkstotis",
                "output_sym": "9"
            },
            "tūkstoši": {
                "input_state": 22,
                "output_state": 7,
                "input_sym": "tūkstoši",
                "output_sym": "9"
            }
        }
    },
    "23": {
        "arcs": {
            "<eps>": {
                "input_state": 23,
                "output_state": 25,
                "input_sym": "<eps>",
                "output_sym": "0"
            },
            "viens": {
                "input_state": 23,
                "output_state": 26,
                "input_sym": "viens",
                "output_sym": "0"
            },
            "divi": {
                "input_state": 23,
                "output_state": 27,
                "input_sym": "divi",
                "output_sym": "0"
            },
            "trīs": {
                "input_state": 23,
                "output_state": 28,
                "input_sym": "trīs",
                "output_sym": "0"
            },
            "četri": {
                "input_state": 23,
                "output_state": 29,
                "input_sym": "četri",
                "output_sym": "0"
            },
            "pieci": {
                "input_state": 23,
                "output_state": 30,
                "input_sym": "pieci",
                "output_sym": "0"
            },
            "seši": {
                "input_state": 23,
                "output_state": 31,
                "input_sym": "seši",
                "output_sym": "0"
            },
            "septiņi": {
                "input_state": 23,
                "output_state": 32,
                "input_sym": "septiņi",
                "output_sym": "0"
            },
            "astoņi": {
                "input_state": 23,
                "output_state": 33,
                "input_sym": "astoņi",
                "output_sym": "0"
            },
            "deviņi": {
                "input_state": 23,
                "output_state": 34,
                "input_sym": "deviņi",
                "output_sym": "0"
            },
            "desmit": {
                "input_state": 23,
                "output_state": 25,
                "input_sym": "desmit",
                "output_sym": "1"
            },
            "vienpadsmit": {
                "input_state": 23,
                "output_state": 26,
                "input_sym": "vienpadsmit",
                "output_sym": "1"
            },
            "divpadsmit": {
                "input_state": 23,
                "output_state": 27,
                "input_sym": "divpadsmit",
                "output_sym": "1"
            },
            "trīspadsmit": {
                "input_state": 23,
                "output_state": 28,
                "input_sym": "trīspadsmit",
                "output_sym": "1"
            },
            "četrpadsmit": {
                "input_state": 23,
                "output_state": 29,
                "input_sym": "četrpadsmit",
                "output_sym": "1"
            },
            "piecpadsmit": {
                "input_state": 23,
                "output_state": 30,
                "input_sym": "piecpadsmit",
                "output_sym": "1"
            },
            "sešpadsmit": {
                "input_state": 23,
                "output_state": 31,
                "input_sym": "sešpadsmit",
                "output_sym": "1"
            },
            "septiņpadsmit": {
                "input_state": 23,
                "output_state": 32,
                "input_sym": "septiņpadsmit",
                "output_sym": "1"
            },
            "astoņpadsmit": {
                "input_state": 23,
                "output_state": 33,
                "input_sym": "astoņpadsmit",
                "output_sym": "1"
            },
            "deviņpadsmit": {
                "input_state": 23,
                "output_state": 34,
                "input_sym": "deviņpadsmit",
                "output_sym": "1"
            }
        }
    },
    "24": {
        "arcs": {
            "<eps>": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "0"
            },
            "viens": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "viens",
                "output_sym": "1"
            },
            "divi": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "divi",
                "output_sym": "2"
            },
            "trīs": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "trīs",
                "output_sym": "3"
            },
            "četri": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "četri",
                "output_sym": "4"
            },
            "pieci": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "pieci",
                "output_sym": "5"
            },
            "seši": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "seši",
                "output_sym": "6"
            },
            "septiņi": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "septiņi",
                "output_sym": "7"
            },
            "astoņi": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "astoņi",
                "output_sym": "8"
            },
            "deviņi": {
                "input_state": 24,
                "output_state": 6,
                "input_sym": "deviņi",
                "output_sym": "9"
            }
        }
    },
    "25": {
        "arcs": {
            "<eps>": {
                "input_state": 25,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "0"
            }
        }
    },
    "26": {
        "arcs": {
            "<eps>": {
                "input_state": 26,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "1"
            }
        }
    },
    "27": {
        "arcs": {
            "<eps>": {
                "input_state": 27,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "2"
            }
        }
    },
    "28": {
        "arcs": {
            "<eps>": {
                "input_state": 28,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "3"
            }
        }
    },
    "29": {
        "arcs": {
            "<eps>": {
                "input_state": 29,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "4"
            }
        }
    },
    "30": {
        "arcs": {
            "<eps>": {
                "input_state": 30,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "5"
            }
        }
    },
    "31": {
        "arcs": {
            "<eps>": {
                "input_state": 31,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "6"
            }
        }
    },
    "32": {
        "arcs": {
            "<eps>": {
                "input_state": 32,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "7"
            }
        }
    },
    "33": {
        "arcs": {
            "<eps>": {
                "input_state": 33,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "8"
            }
        }
    },
    "34": {
        "arcs": {
            "<eps>": {
                "input_state": 34,
                "output_state": 6,
                "input_sym": "<eps>",
                "output_sym": "9"
            }
        }
    },
    "-1": {
        "arcs": {}
    }
});

    var legalTokens = {
"divdesmit": 20,
"trīsdesmit": 30,
"četrdesmit": 40,
"piecdesmit": 50,
"sešdesmit": 60,
"septiņdesmit": 70,
"astoņdesmit": 80,
"deviņdesmit": 90,
"simt": 100,
"divsimt": 200,
"trīssimt": 300,
"četrsimt": 400,
"piecsimt": 500,
"sešsimt": 600,
"septiņsimt": 700,
"astoņsimt": 800,
"deviņsimt": 900,
"viens": 1,
"divi": 2,
"trīs": 3,
"četri": 4,
"pieci": 5,
"seši": 6,
"septiņi": 7,
"astoņi": 8,
"deviņi": 9,
"nulle": 0,
"tūkstoš": 1000,
"tūkstotis": 1000,
"divtūkstoš": 2000,
"trīstūkstoš": 3000,
"četrtūkstoš": 4000,
"piectūkstoš": 5000,
"seštūkstoš": 6000,
"septiņtūkstoš": 7000,
"astoņtūkstoš": 8000,
"deviņtūkstoš": 9000,
"simts": 100,
"simti": 100,
"desmit": 10,
"vienpadsmit": 11,
"divpadsmit": 12,
"trīspadsmit": 13,
"četrpadsmit": 14,
"piecpadsmit": 15,
"sešpadsmit": 16,
"septiņpadsmit": 17,
"astoņpadsmit": 18,
"deviņpadsmit": 19,
"tūkstoši": 1000
};

var legalDelim = {
"punkts": ".",
"komats": ",",
};

    var convertAll = function (str) {
        var tokens = str.split(" ");
        var lengthToSkip = 0;
        for (var i in tokens) {
            var token = tokens[i].toLowerCase();
            if (typeof legalTokens[token] !== "undefined") {
                var converted = convert(str.substr(lengthToSkip));
                return str.substr(0, lengthToSkip) + convertAll(converted);                
            } else {
                lengthToSkip += token.length + 1;
            }
        }
        return str;
    };

    var convert = function(str) {
       var tokens = str.split(" ");
       var tokens_left = str.split(" ");
       var number = [];
       var result = "";

       for (var i in tokens) {
           var token = tokens[i].toLowerCase();
           if (typeof legalTokens[token] !== "undefined") {
               number.push(token);
               tokens_left.shift();
           } else {
               break;
           }
       }

       if (number.length == 0) {
           // no number found
           return str;
       }

       var number_converted = fst.convert(number);
       if (number_converted == null) {
           number_converted = []
           // do alternative conversion
           for (var i in number) {
              number_converted.push(legalTokens[number[i]]);
           }
       }       
       result = number_converted.join("");

       if (typeof legalDelim[tokens_left[0]] !== "undefined") {
           var token = tokens_left.shift();
           // process number after delimeter
           var next = convert(tokens_left.join(" "));
           var mapping = next.split('->');
           var wc = number.length;
           if (mapping.length > 1) {
               // sum replaced word count
               // NB: +1 is to include delimeter
               wc += +1 + parseInt(mapping[0]);
               // return new mapping pair
               return wc + "->" + result + legalDelim[token] + mapping[1];
           }
           // no number after delimeted, return unmodified           
       }

        // save result as "word count->new token" pair
        // this will be later parsed        
       return (number.length) + "->" + result + " " + tokens_left.join(" ");
    }


    /**
     * Public methods or fields of global object
     */
    var DigitConverter = {
        'convert': convert,
        'convertAll': convertAll,
    };

    if ('undefined' == typeof module) {
	    // In browser
	    window.DigitConverter = DigitConverter;
    } else {
	    // In node
	    module.exports = DigitConverter;
    }
})();
