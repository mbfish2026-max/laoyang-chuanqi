#!/usr/bin/env python3
"""R11 短测：390×844，双引擎，新角色及旧档往返，直接推进现实时间。"""
import os,json,re
from playwright.sync_api import sync_playwright
from pw_baseline import start_server,Cloud,fake_session
OUT='/workspace/design/laoyang_m1_shots/codex_mutate'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server();report=[]
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for mode in ['new','old']:
    ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
    cloud=Cloud('ok');ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),cloud.handle)
    ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+')')
    pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.goto(base+'/index.html');pg.wait_for_timeout(4500)
    pg.evaluate("CQSys.createChar('异变验收','zs');closeM();S.lvl=30;S.unl=99;calc();H.life=ST.life;TAB='fight';render();")
    pg.wait_for_timeout(800)
    if mode=='old':
     pg.evaluate("delete S.mutation;S.bm={h:1,d:0,a:0,i:0};save();")
     pg.reload();pg.wait_for_timeout(3000);pg.evaluate('closeM();TAB="fight";render()')
    pg.wait_for_function('window.CQ&&CQ.Scene&&CQ.Scene.mounted()')
    for kind in ['blood','corpse','pig']:
     pg.evaluate('''k=>{closeM();const t=Date.now();if(!window.__realMutationClock){window.__realMutationClock=Date.now;window.__mutationClock=t;Date.now=()=>window.__mutationClock;}
      const chosen=k==='corpse'?ACTS.flatMap((a,ai)=>a.zones.map((z,zi)=>({z,ai,zi}))).find(x=>/石墓/.test(x.z.n)): {ai:0,zi:0};S.act=chosen.ai;S.zone=chosen.zi;S.wave=0;MON=[];S.mutation={checked:{blood:Math.floor(t/7200000),corpse:Math.floor(t/10800000),pig:Math.floor(t/3600000)},active:{k,start:t,end:t+600000,a:S.act,z:S.zone,d:S.diff,waves:0,pigDone:false}};spawnWave();CQMutation.sync();S.mutation.active.start=t;window.__mutationClock=t;render();}''',kind)
     pg.wait_for_timeout(900)
     pg.evaluate('CQMutation.paint()')
     assert pg.locator('#cqMutation').is_visible()
     assert pg.evaluate('document.documentElement.scrollWidth<=390')
     pg.screenshot(path=f'{OUT}/{engine}_{mode}_{kind}.png')
     if kind=='pig':
      pg.evaluate('window.__mutationClock+=60001;CQMutation.sync();renderFight()')
      assert pg.evaluate('!MON.some(m=>m.mutationPig&&m.hp>0)')
      pg.wait_for_timeout(100)
      pg.screenshot(path=f'{OUT}/{engine}_{mode}_pig_escape.png')
    noise=[e for e in errors if 'supabase.co' in e and 'access control' in e]
    errors=[e for e in errors if e not in noise]
    assert not errors,errors
    report.append({'browser':engine,'save':mode,'errors':errors,'beaconNoise':noise,'passed':True})
    ctx.close()
   browser.close()
finally:
 srv.shutdown()
 with open(OUT+'/report.json','w') as f:json.dump(report,f,ensure_ascii=False,indent=2)
print(json.dumps(report,ensure_ascii=False))
