/**
 * CONFIG for output of blocks
 * Do not modify it - it is part of distribution.
 * To customize output see the file docblox2md_config_custom_dist.js
 */

module.exports = {
    'header': {
        'pre': '',
        'item': "\n%s\n\n",
        'post': ''
    },
    'params': {
        'pre': '\n**Parameters:**\n\n'
            +'Var | Type | Desciption\n'
            +'--  |--    |--\n',
        'item': "%s | %s | %s\n",
        'post': ''
    },
    'return': {
        'pre': '\n**Return:**\n\n',
        'item': "%s %s\n",
        'post': ''
    }
}