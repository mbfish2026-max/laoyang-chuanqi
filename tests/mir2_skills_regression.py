"""Run all Node regression tests; integrate the shared icon test only in memory.
The immutable baseline test's 19-book catalog becomes 45 after the 26 additions.
No shared source or harness is written.
"""
import glob,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/workspace/design/laoyang_m1_shots/codex_mir2_skill')
BOOT=r"""
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.resolve('tests/cq_icons_test.js');let src=fs.readFileSync(file,'utf8');
const marker="const I=JSON.parse";
if(!src.includes(marker)||!src.includes('I.books.length===19'))throw Error('shared icon test changed; review adapter');
src=src.replace(marker,`G(fs.readFileSync(path.join(root,'cq/mir2_skills.js'),'utf8'));G("S=newSave();load();CQSys.createChar('图标集成','fs');mir2SkillsWire()");\n`+marker)
 .replace('I.books.length===19','I.books.length===45').replace('19 本书 + 15 件底材','45 本书 + 15 件底材（临时接线）');
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(src,file);
"""
def main():
 rows=[]
 for p in sorted(glob.glob(str(ROOT/'tests/*_test.js')))+[str(ROOT/'cq/cq_battle_test.js')]:
  integrated=Path(p).name=='cq_icons_test.js'
  cmd=['node','-e',BOOT] if integrated else ['node',p]
  r=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True)
  rows.append({'file':str(Path(p).relative_to(ROOT)),'temporaryIntegration':integrated,'code':r.returncode,'output':r.stdout+r.stderr})
  print(Path(p).name,r.returncode,flush=True)
 OUT.mkdir(parents=True,exist_ok=True);(OUT/'integrated_node_tests.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
 assert all(r['code']==0 for r in rows),[r for r in rows if r['code']]
 print('ALL INTEGRATED PASS',len(rows))
if __name__=='__main__':main()
