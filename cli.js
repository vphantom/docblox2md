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

var usage='\n\
DOCBLOX2MD - Generate Markdown from doc-comments\n\
\n\
license: MIT license \n\
author:  Stéphane Lavergne\n\
source:  https://github.com/vphantom/docblox2md \n\
\n\
\n\
Inserts/replaces API documentation derived from inline doc-comments into \n\
Markdown format, inside Markdown documents. \n\
\n\
It supports JavaDoc, JSDoc, PhpDoc and is easily extensible to many more \n\
languages.\n\
\n\
Unlike other software I could find, docblox2md does not generate any file. It\n\
looks for placeholders in your existing (presumably Markdown) documents and\n\
edits them in place. This suits my small projects much better than more\n\
complex documentation generators.\n\
\n\
\n\
SYNTAX:\n\
  docblox2md [OPIONS] FILE [FILE2 [.. FILE_N]]\n\
\n\
OPTIONS:\n\
  -h | show this help\n\
  -i | public, protected and private\n\
  -p | public only\n\
  -v | verbose: show processed file\n\
\n\
  By default (without -i or -p) it will render public and protected items.\n\
\n\
PARAMETER:\n\
  FILE(s)  {string}  markdown file; read as utf-8\n\
\n\
EXAMPLE:\n\
  docblox2md -v *.md\n\
\n\
'

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
      process.stderr.write(usage);
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
    process.stderr.write('Info: Processing ' + filename + '...\n');
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
    if(!docblox2md.hasPlaceholder(file)){
      if (verbose) {
        process.stderr.write('Skip: ' + filename + ' has no docblox2md placeholder.\n');
      }
    } else {
      var newdata=docblox2md.filterDocument(file, options.threshold);
      fs.writeFileSync(filename,newdata);
      if (verbose) {
        process.stderr.write('OK: '+filename + ' was written\n');
      }
    }
  } catch (e) {
    process.stderr.write(
      'Error: unable to write to ' + filename + ':' + e + '\n'
    );
    fatalErrors = true;
  }
});

process.exit(fatalErrors ? 2 : 0);
