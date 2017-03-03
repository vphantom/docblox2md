'use strict';

var fs = require('fs');

/* eslint-disable max-len */
var re = {

  // Document level

  // mdSplit - Split Markdown by doc-comment placeholders
  //
  // Used with String.split(), the strings returned are a repeating sequence of:
  // 1. Raw Markdown to preserve
  // 2. Header level or undefined
  // 3. File name
  // The very last instance may end on raw Markdown without 2 and 3.
  //
  mdSplit: /<!--\s+BEGIN\s+DOC-COMMENT\s+(?:H([123456])\s+)?(\S+)\s+-->[^]*?<!--\s+END\s+DOC-COMMENT\s+-->/i,


  // Source parsing level

  // srcSplit - Split C/C++/Java/JavaScript/PHP source by doc-comment
  //
  // Used with String.split(), the strings returned are a repeating sequence of:
  // 1. Ignore
  // 2. Doc comment (excluding "/**" and "*/")
  // 3. Next line of code
  // The very last instance may end on ignore without 2 and 3.
  //
  // Note that it cannot handle nested comments (say in sample code, for
  // example).
  //
  // srcSplit: /\/\*\*([^]*?)\*\/([^;{\/]+?)[;{]/,
  srcSplit: /(?:\/\*\*[^]*?\*\/\s*)?\/\*\*([^]*?)\*\/([^;{\/]+?)[;{]/,

  // lineSplit - Get clean lines from doc comment
  //
  // Used with String.split(), the strings returned are a repeating sequence of:
  // 1. Ignore
  // 2. Trimmed line (inner indent preserved)
  // The very last instance may end on ignore without 2.
  //
  lineSplit: /^\s*(?:\*\s)?(?:.*?)/m,

  // tag
  //
  // Used with String.match(), returns NULL if line is not a tag, an array otherwise:
  // 1. Ignore
  // 2. Tag (i.e. "param")
  // 3. Rest of line
  //
  tag: /^\s*@(\S+)\s*(.*)$/,


  // Tag parsing level

  // tagType
  //
  // Used with String.match()
  // 1. Ignore
  // 2. Argument
  //
  tagType: /^\{?([^\s}]+)\}?$/,

  // tagTypeName
  //
  // Used with String.match()
  // 1. Ignore
  // 2. Type (optional)
  // 3. Name
  //
  tagTypeName: /^(?:\{?([^\s}]+)?\}?\s+)?(.*)$/,

  // tagTypeNameDesc
  //
  // Used with String.match()
  // 1. Ignore
  // 2. Type
  // 3. Name
  // 4. Description (Optional)
  //
  tagTypeNameDesc: /^\{?([^\s}]+)\}?\s+([^-]\S*)(?:\s+-)?(?:\s+(.*))?$/


};
/* eslint-enable max-len */

/**
 * Extract abstract blocks from doc-commented source
 *
 * Each block in the array is an object with the following properties:
 *
 * lines: Array of trimmed lines (excluding '@' tags)
 * tags: Array of tags extracted from lines
 * code: Declaration-looking line of code following the doc-comment
 *
 * Each tag is an object with the following properties:
 * tag: The tag string
 * line: The rest of the tag line, trimmed
 *
 * @param {String} src Source with doc-comments
 *
 * @return {Array} Blocks
 */
function srcToBlocks(src) {
  var chunks = src.split(re.srcSplit);
  var blocks = [];
  var i = 0;

  for (i = 0; i < chunks.length; i++) {
    let block = {
      lines: [],
      tags : [],
      code : ''
    };
    let hasTag = false;

    // First of triplet: ignore

    // Iterate
    i++;
    if (i >= chunks.length) {
      break;
    }

    // Second of triplet: doc-comment
    let lines = chunks[i].split(re.lineSplit);
    let j = 1;

    // Only ignore very first line
    for (j = 1; j < lines.length; j++) {
      let line = lines[j].trimRight();
      let tag = line.match(re.tag);

      if (tag === null) {
        if (hasTag === false || line !== '') {
          block.lines.push(line);
        }
      } else {
        hasTag = true;
        block.tags.push({
          tag : tag[1],
          line: tag[2]
        });
      }
    }

    // Iterate
    i++;
    if (i < chunks.length) {
      // Third of triplet: code
      block.code = chunks[i].trim().replace(/\s+/g, ' ');
    }

    if (block.lines.length > 0 || block.tags.length > 0) {
      blocks.push(block);
    }
  }

  return blocks;
}

/**
 * Generate Markdown from abstract blocks
 *
 * Visibility threshold can be:
 *
 * 0: public only
 * 1: public and protected
 * 2: public, protected and private
 *
 * @param {Array}  blocks    Blocks
 * @param {Number} level     Header starting level (1-6)
 * @param {Number} threshold Visibility threshold
 *
 * @return {String} Markdown text
 */
function blocksToMarkdown(blocks, level, threshold) {
  var md = [];
  var inClass = false;
  var i = 0;
  var j = 0;

  if (level < 1 || level > 6) {
    level = 1;
  }

  nextBlock: for (i = 0; i < blocks.length; i++) {
    let tagArgs = null;
    let isClass = false;
    let visibility = '';
    let type = '';
    let name = '';
    let implem = '';
    let params = [];
    let returnType = '';
    let returnDesc = '';

    // Gather useful information from tags
    for (j = 0; j < blocks[i].tags.length; j++) {
      let tag = blocks[i].tags[j];

      switch (tag.tag) {

        case 'class':
        case 'module':
        case 'interface':
          inClass = true;
          isClass = true;
          tagArgs = tag.line.match(re.tagTypeName);
          if (tagArgs !== null) {
            type = tag.tag + ' ' + (tagArgs[1] || '');
            name = tagArgs[2] || '';
          }
          break;

        case 'endclass':
        case 'endmodule':
        case 'endinterface':
          inClass = false;
          continue nextBlock;

        case 'implements':
          tagArgs = tag.line.match(re.tagType);
          if (tagArgs !== null) {
            implem = tagArgs[1] || '';
          }
          break;

        case 'private':
          visibility = tag.tag;
          if (threshold < 2) {
            continue nextBlock;
          }
          break;
        case 'protected':
          visibility = tag.tag;
          if (threshold < 1) {
            continue nextBlock;
          }
          break;
        case 'public':
          visibility = tag.tag;
          break;

        case 'param':
        case 'parameter':
          tagArgs = tag.line.match(re.tagTypeNameDesc);
          if (tagArgs !== null) {
            params.push({
              type: (tagArgs[1] || ''),
              name: (tagArgs[2] || ''),
              desc: (tagArgs[3] || '')
            });
          }
          break;

        case 'return':
        case 'returns':
          tagArgs = tag.line.match(re.tagTypeName);
          if (tagArgs !== null) {
            returnType = tagArgs[1] || '';
            returnDesc = tagArgs[2] || '';
          }
          break;

        case 'ignore':
          continue nextBlock;

        default:
      }
    }

    // Header
    md.push(
      '#'.repeat(Number(level) + (inClass && !isClass ? 1 : 0))
      + ' `'
      + (visibility ? visibility + ' ' : '')
      + (type ? type + ' ' : '')
      + (name ? name + ' ' : '')
      + (implem ? 'implements ' + implem + ' ' : '')
      + blocks[i].code + '`\n\n'
    );

    // Verbatim lines
    md.push(blocks[i].lines.join('\n'));

    // Parameters
    if (params.length > 0) {
      md.push('\n');
    }
    for (j = 0; j < params.length; j++) {
      md.push(
        '* `'
        + params[j].name
        + '` — '
        + params[j].type
        + (params[j].desc ? ' — ' + params[j].desc : '')
        + '\n'
      );
    }

    // Return value
    if (returnType !== '' || returnDesc !== '') {
      md.push('\n**Returns:**');
      if (returnType !== '') {
        md.push(' `' + returnType + '`');
      }
      if (returnDesc !== '') {
        md.push(
          (returnType !== '' ? ' — ' : ' ')
          + returnDesc
          + '\n'
        );
      }
    }

    // Final empty line
    md.push('\n');
  }

  return md.join('');
}

/**
 * Generate Markdown from doc-commented source
 *
 * Visibility threshold can be:
 *
 * 0: public only
 * 1: public and protected
 * 2: public, protected and private
 *
 * @param {String} src       Source code
 * @param {Number} level     Header starting level (1-6)
 * @param {Number} threshold Visibility threshold
 *
 * @return {String} Markdown text
 */
function srcToMarkdown(src, level, threshold) {
  var blocks = srcToBlocks(src);

  return blocksToMarkdown(blocks, level, threshold);
}

/**
 * Load file from disk and process to Markdown
 *
 * Visibility threshold can be:
 *
 * 0: public only
 * 1: public and protected
 * 2: public, protected and private
 *
 * @param {String} filename  File name
 * @param {Number} level     Header starting level (1-6)
 * @param {Number} threshold Visibility threshold
 *
 * @return {String} Markdown text with placeholder envelope
 */
function loadFile(filename, level, threshold) {
  var out = [];
  var file;

  out.push('<!-- BEGIN DOC-COMMENT H' + level + ' ' + filename + ' -->\n');

  try {
    file = fs.readFileSync(filename, {encoding: 'utf-8'});
    out.push(srcToMarkdown(file, level, threshold));
  } catch (e) {
    // I don't see how we can relay this error safely
  }

  out.push('<!-- END DOC-COMMENT -->');

  return out.join('');
}

/**
 * Filter Markdown document for our placeholders
 *
 * Visibility threshold can be:
 *
 * 0: public only
 * 1: public and protected
 * 2: public, protected and private
 *
 * @param {String} doc Input document
 * @param {Number} threshold Visibility threshold
 *
 * @return {String} Updated document
 */
function filterDocument(doc, threshold) {
  var sections = doc.split(re.mdSplit);
  var out = [];
  var i = 0;

  for (i = 0; i < sections.length; i++) {
    // 1. Raw input to preserve
    out.push(sections[i]);

    // Iterate
    i++;
    if (i >= sections.length) {
      break;
    }

    // 2. Header level
    let level = sections[i];

    if (level === undefined) {
      level = 1;
    }

    // Iterate
    i++;
    if (i >= sections.length) {
      break;
    }

    // 3. File name
    out.push(loadFile(sections[i], level, threshold));
  }

  return out.join('');
}

module.exports = {
  // Partial processing
  srcToBlocks     : srcToBlocks,
  blocksToMarkdown: blocksToMarkdown,
  srcToMarkdown   : srcToMarkdown,

  // End-to-end processing
  filterDocument: filterDocument
};
