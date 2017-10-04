const { spawn, execFile } = require('child_process');
const process = require('process');
const path = require('path');
const fs = require('fs');

var ts;

if(process.platform === 'win32')
{
    ts = spawn('cmd.exe', ['/C', path.resolve(__dirname, 'node_modules/.bin/tsc.cmd'), '-p', __dirname]);
}
else
{
    ts = execFile(path.resolve(__dirname, 'node_modules/.bin/tsc'), ['-p', __dirname]);
}

process.stdin.pipe(ts.stdin);
ts.stdout.pipe(process.stdout);
ts.stderr.pipe(process.stderr);

ts.on('close', function(code)
{
    if(code === 0)
    {
        fs.writeFile('./index.d.ts', 'export * from "./typings/index";', { encoding: 'UTF-8' }, (err) =>
        {
            if(err)
            {
                process.exit(1);
            }
            else
            {
                process.exit(0);
            }
        });   
    }
    else
    {
        process.exit(code);
    }
});