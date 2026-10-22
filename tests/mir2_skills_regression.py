"""Run all original Node test scripts with the skill icon catalog integrated."""
import glob,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/workspace/design/laoyang_m1_shots/codex_mir2_skill')
def main():
 rows=[]
 for p in sorted(glob.glob(str(ROOT/'tests/*_test.js')))+[str(ROOT/'cq/cq_battle_test.js')]:
  cmd=['node',p]
  r=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True)
  rows.append({'file':str(Path(p).relative_to(ROOT)),'temporaryIntegration':False,'code':r.returncode,'output':r.stdout+r.stderr})
  print(Path(p).name,r.returncode,flush=True)
 OUT.mkdir(parents=True,exist_ok=True);(OUT/'integrated_node_tests.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));(OUT/'node_tests.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
 assert all(r['code']==0 for r in rows),[r for r in rows if r['code']]
 print('ALL NODE TESTS PASS',len(rows))
if __name__=='__main__':main()
