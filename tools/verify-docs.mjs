import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['README.md','SECURITY.md','CONTRIBUTING.md','CHANGELOG.md',...fs.readdirSync('docs').filter(x=>x.endsWith('.md')).map(x=>'docs/'+x)];
const failures=[];
for(const file of files){
 const text=fs.readFileSync(file,'utf8');
 if((text.match(/^```/gm)||[]).length%2)failures.push(`${file}: unbalanced code fences`);
 const links=[...text.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]);
 const images=[...text.matchAll(/src="([^"]+)"/g)].map(m=>m[1]);
 for(const link of [...links,...images]){
  if(/^(https?:|mailto:|#)/.test(link))continue;
  const target=path.resolve(path.dirname(file),decodeURIComponent(link.split('#')[0]));
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target))failures.push(`${file}: missing or out-of-scope link ${link}`);
 }
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`Validated local links and code fences in ${files.length} documentation files.`);
