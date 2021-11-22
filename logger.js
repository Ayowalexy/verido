const tracer = require('tracer')

function logger(){
    return tracer.colorConsole({ level: 'debug' });
}

module.exports = logger;