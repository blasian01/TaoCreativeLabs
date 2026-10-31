// Keeps provider credentials out of source, command arguments and console output.
import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawn} from 'node:child_process';
const [envFile,...command]=process.argv.slice(2);
if(!envFile||!command.length)throw new Error('Usage: node scripts/admin/with-env.mjs PRIVATE_ENV_FILE COMMAND [ARGS]');
const child=spawn(command[0],command.slice(1),{stdio:'inherit',env:{...process.env,...parseEnv(readFileSync(envFile,'utf8')),APP_BASE_URL:process.env.APP_BASE_URL||'http://localhost:3000'}});
child.on('exit',code=>process.exit(code??1));
process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));
