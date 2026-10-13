import {readFileSync,writeFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('firebase.json','utf8'));
if(process.env.ROOK_DEPLOY_ENABLED!=='true')config.hosting.rewrites=config.hosting.rewrites.filter(r=>!r.function);
writeFileSync('firebase.hosting.json',JSON.stringify({hosting:config.hosting},null,2)+'\n');
