const shell = require('shelljs');
require('dotenv').config();
let { exec } = shell;

require('dotenv').config();

let cwd = process.cwd();

let { code } = exec(`tmux has-session -t "${cwd}"`, { silent: true });

if (code !== 0) {
    exec(`
        tmux new-session -s "${cwd}" -d \n
        tmux rename-window 'dev-env' \n
        tmux select-window -t 'dev-env' \n
        tmux send-keys 'ssh -R ${process.env.URI}:80:localhost:4000 serveo.net' 'C-m' \n
        tmux split-window -h -t 'dev-env' \n
        tmux send-keys 'npm start' 'C-m'
    `);
}
