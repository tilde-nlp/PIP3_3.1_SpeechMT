# PIP3_3.1_SpeechMT

This is the prototype created in activity 3.1 of the project "AI Assistant for Multilingual Meeting Management" (No. of the Contract/Agreement: 1.1.1.1/19/A/082).

This repository contains HTML/JS prototype solution which performs real-time Latvian speech recognition and translation to English.

The prototype displays real-time Latvian transcript of a speech stream and dynamically replaces finalized parts with English translation. 

## Design

### Audio Capture

Audio stream capture is implemented using Web Audio API (https://www.w3.org/TR/webaudio/) and AudioWorklets. This allows to process incoming audio buffers in JavaScript in a separate thread instead of a busy main thread (which is used for calling APIs and displaying results). Such design prevents dropping audio buffers and simultaneously improves user interface responsiveness. 

### Speech Recognition

Captured audio buffers are concatenated into larger buffer, which is resampled to 16kHz (input sample rate for ASR). This larger buffer is then streamed to the Tilde Speech Recognition service via  WebSocket protocol (https://www.rfc-editor.org/rfc/rfc6455) based API. 

The recognition channel is fully-duplex, while buffers are streamed into ASR, recognition results are simultaneously received from the opposite side.

There are two types of results provided by Tilde ASR API:
- Partial. Contains raw recognition hypothesis, which can be change depending on future audio.
- Full. Contains final transcript of some segment of speech.

Partial transcript is immediately displayed on the screen using gray font color.

### Machine Translation

Final transcripts from ASR are not displayed and are instead sent to Machine Translation service via a simple HTTP POST API. The prototype uses prototype machine translation service which is adapted for speech. Translated transcripts are then immediately displayed on the screen using black font color.

## Installation

As this solution is HTTP/JS only, it's very to deploy. Just copy all files from the repo to your web server directory and open the page "index.hml" in the browser. 

NB: The code contains some hardcoded API keys and API endpoints, which can be closed or revoked without any notice. Contact Tilde if you are interested in accessing Speech Recognition and Machine Translation APIs.
