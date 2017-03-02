# inline2md v0.0.1

[![license](https://img.shields.io/github/license/vphantom/php-email.svg?style=plastic)]()

Generate Markdown from doc-comments.

Inserts/replaces API documentation derived from inline doc-comments into Markdown format.  While it is written in JavaScript, it supports JavaDoc, JSDoc, PhpDoc and is easily extensible to many more languages.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
- [Supported Languages](#supported-languages)
- [MIT License](#mit-license)


## UNDER CONSTRUCTION!

I created this repo early in the writing process to benefit from GitHub's issues.  It is not completed nor available in NPM yet!


## Installation

```sh
$ npm install inline2md
```


## Usage

This tool only modifies files, it does not generate any.  You are thus in full control of your overall structure.  This is best suited for smaller projects (bigger ones benefitting from heavier tools such as Doxygen).

### Placeholders

Anywhere you want to insert the documentation for a specific file, insert an HTML comment telling inline2md which file to process:

```md
...markdown content...

<!-- BEGIN DOC-COMMENT src/example.php -->
<!-- END DOC-COMMENT -->

...markdown content...
```

The generated Markdown documentation will be inserted between these two comments.  If there was already anything between them, it will be replaced by freshly generated documentation, so it is very easy to keep your Markdown files up to date.

To better adapt to your documents, you can optionally specify the header level to start with before the file name.  For OO projects, this will be the header level for classes, and properties and methods will get the next level after that.  It is `H1` by default.

```md
...markdown content...

<!-- BEGIN DOC-COMMENT H3 src/example.php -->
<!-- END DOC-COMMENT -->

...markdown content...
```

The above would title root-level comments with `###`, the next level with `####` if applicable.

### Running

Simply run with a list of Markdown files to update.  For example:

```sh
$ inline2md docs/*.md
```

Every recognized comment in each Markdown file will be processed.  Any comment leading to a missing file or a file which doesn't parse properly will be emptied and errors will be displayed in the console.

To omit `protected` items (in language where this makes sense), specify `--skip-protected`:

```sh
$ inline2md --skip-protected docs/*.md
```


## Supported Languages

This initial release supports `/** ... */` comment blocks and languages based on `{}` blocks.  This includes:

* C++
* Java
* JavaScript
* PHP

Support for Perl, Python and Ruby is planned for a future release.

### JavaDoc-style tags

As this is geared more towards end-user documentation, most tags are silently ignored.  Recognized tags are:

* `@param[eter] type name [[-] description...]`
* `@return[s] type [description...]`

### Visibility

For languages which declare property and method visibility, such as C++, Java and PHP, inline2md will automatically skip documentation for which the next line of code (anything before `{` or `;`) contains the `private` keyword.

Additionally, inline2md can also skip `protected` items if invoked with argument `--skip-protected`.  (See [Usage](#usage).)


## MIT License

Copyright (c) 2017 Stéphane Lavergne <https://github.com/vphantom>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
