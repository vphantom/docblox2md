#!/usr/bin/env node

'use strict';

var fs = require('fs');
var docblox2md = require('./docblox2md.js');
var posixGetopt = require('posix-getopt');
var parser;
var option;
var files;
var verbose = false;
var fatalErrors = false;
var options = {
  threshold: 1,
};

// Parse command line arguments
//
parser = new posixGetopt.BasicParser(
  'h(help)v(verbose)p(skip-protected)i(include-private)',
  process.argv
);
while ((option = parser.getopt()) !== undefined) {
  // option.option: the letter
  // option.optarg: the argument (if option needs one)
  switch (option.option) {
    case 'h':
      process.stderr.write('TODO: HELP NOT IMPLEMENTED\n');
      process.exit(0);
      break;
    case 'v':
      verbose = true;
      break;
    case 'p':
      options.threshold = 0;
      break;
    case 'i':
      options.threshold = 2;
      break;
    default:
      // posix-getopt already emitted a message
      process.exit(1);
  }
}

// Iterate over every specified Markdown file
//
files = process.argv.slice(parser.optind());
files.forEach(function(filename) {
  var file;

  if (verbose) {
    process.stderr.write('Processing ' + filename + '...\n');
  }

  try {
    file = fs.readFileSync(filename, {encoding: 'utf-8'});
  } catch (e) {
    process.stderr.write(
      'Error: unable to read ' + filename + ', skipping...\n'
    );
    return;
  }

  try {
    fs.writeFileSync(
      filename,
      docblox2md.filterDocument(file, options.threshold)
    );
  } catch (e) {
    process.stderr.write(
      'Error: unable to write to ' + filename + ':' + e + '\n'
    );
    fatalErrors = true;
  }
});

process.exit(fatalErrors ? 2 : 0);
