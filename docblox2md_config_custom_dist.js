/**
 * CUSTOM CONFIG for output of blocks
 * 
 * rename docblox2md_config_custom_dist.js 
 * to docblox2md_config_custom.js
 * 
 * Then your settings overide data from docblox2md_config.js
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