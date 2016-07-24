'use strict';

const scriptDir = process.cwd();
const path = require( 'path' );
const util = require( 'util' );
const exec = require( 'child_process' ).exec;

let temperature = 0.7;
const length = 1000;
const smallLength = 1000;

// Change this to the path to a torch-rnn .t7 output file
const checkpointPath = path.join( scriptDir, 'cv/wired-titles.t7' );

const torchDir = `${process.env.HOME}/torch/torch-rnn/`;

try {
  process.chdir( torchDir );
} catch(e) {
  console.error( 'Could not find Torch-RNN directory!' );
  console.error( 'This toy expects torch-rnn to be installed in ~/torch/torch-rnn;' );
  console.error( 'See https://github.com/jcjohnson/torch-rnn for instructions.' );
  process.exit();
}

const baseCommand = `th sample.lua -checkpoint ${checkpointPath} -gpu -1`;
const printCommant = `${baseCommand} -length ${length} -temperature `;
const seededCommand = `${baseCommand} -length ${smallLength} -temperature `;

function generate( input ) {
  let command = input ?
    `${seededCommand} ${temperature} -start_text "${input}"` :
    printCommant + temperature;

  return new Promise((resolve, reject) => {
    exec( command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(input ? truncate( stdout ) : stdout);
    });
  });
}

function truncate( output ) {
  if ( ! output ) {
    // console.log( 'Please write a couple words to start your headline\n' );
    return false;
  }
  // let firstLine = output.replace( /,\n/g, ',' ).replace(/([^\n]+)\n([^\n]+)\n/, '$1 $2\n').match( /^[^\n]+\n/ );
  return output
    .replace( /,\n/g, ',' )
    .replace( /([^\.]+\.[^\.]+\.).*/, '$1$2' );
  if ( firstLine ) {
    return firstLine[ 0 ];
  } else {
    return;
  }
}

function removeFinalLine( output ) {
  return output.replace( /\n[^\n]+$/, '' );
}

function print( output ) {
  if ( ! output ) {
    if ( output !== false ) {
      console.log( 'Sorry, not even machine hallucinations could make that headline work\n' );
    }
    return;
  }
  console.log( output );
}

const setTemp = ( tempMatch ) => {
  if ( tempMatch ) {
    temperature = tempMatch[ 0 ];
    console.log( `> Temperature set to ${temperature}\n` );
  }
}

const doubleSpace = ( str ) => str.split( '\n' ).filter(content => !!content).join( '\n\n' );

process.stdin.resume();
process.stdin.setEncoding('utf8');

const showHelp = () => {
  console.log( '\nHit "Enter" to use this neural network to generate random text' );
  console.log( '\n(Or write some words, and let the machines do the rest!)' );
  console.log( '\nChange temperature with "temperature ___" (value between 0.1 and 1.0);' );
  console.log( 'Lower temperatures produce less-random output, 0.7 is the default.' );
  console.log( '\nType "quit" to exit.\n' );
}

const clearScreen = () => {
  process.stdout.write(`\u001b[2J\u001b[0;0H`);
  showHelp();
}

clearScreen();

const onErr = (err) => {
  console.error( err );
  process.exit();
}

process.stdin.on('data', function( input ) {
  input = input.replace( /\n$/, '' );
  if ( input === 'quit' ) {
    return done();
  }
  if ( input === 'clear' ) {
    return clearScreen();
  }
  if ( input.match( /^temperature [\d\.]+/ ) ) {
    return setTemp( input.match( /[\d\.]+/ ) );
  }
  if ( input === 'random' ) {
    return generate()
      .then( removeFinalLine )
      .then( doubleSpace )
      .then( print )
      .catch( onErr );
  }
  generate( input.replace( /\n/g, '' ) )
    .then( removeFinalLine )
    .then( doubleSpace )
    .then( print )
    .then(() => console.log( '\n' ) )
    .catch( onErr );
});

process.stdin.on('error', function( err ) {
  console.error( err );
  process.exit( 1 );
});

function done() {
  console.log('\nExiting...');
  process.exit();
}
