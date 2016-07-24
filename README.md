# Sampling from a Recurrent Neural Network

To run this script, first install Torch and Torch-RNN (see https://github.com/jcjohnson/torch-rnn).

Then, download this repository. Take your trained model and update the path in `generate.js` to point at your own `.t7` file (the included one is trained on 3 years of headlines from WIRED.com), then run `npm start` to run the interactive prompt.

This has only been tested on OSX, but should work on Linux if both Node.js and Torch-RNN are available. The script assumes Torch-RNN is installed in `~/torch/torch-rnn`.
