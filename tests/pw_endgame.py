"""R13 short UI acceptance: Chromium/WebKit, 390×844, fresh/legacy saves."""
import os, sys, json, re
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pw_baseline as b
from playwright.sync_api import sync_playwright
out='/workspace/design/laoyang_m1_shots/codex_endgame'
os.makedirs(out,exist_ok=True)
srv,url=b.start_server()
results=[]
try:
 with sync_playwright() as p:
  for engine in ['chromium','webkit']:
   browser=getattr(p,engine).launch()
   for legacy in [False,True]:
    ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,device_scale_factor=1)
    ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),b.Cloud('ok').handle)
    ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(b.fake_session()))+')')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url+'/index.html');page.wait_for_timeout(3500)
    page.evaluate('''legacy=>{PWRF.paused=1;CL_GATE=false;CQSys.createChar('终局验收','zs');document.body.classList.remove('nochar');S.auto=0;CL_GATE=false;document.querySelectorAll('.login-overlay,#loginOverlay,#applock').forEach(e=>e.remove());if(legacy){S.eg={mj:{cur:35,best:34},uber:{k:{t:2,h:3,d:4},o:{horn:1,eye:1,brain:1},wins:2}};S=JSON.parse(JSON.stringify(S));}calc();TAB='eg';cqPg.fl('more');EGT='rift';render();}''',legacy)
    tag=f'{engine}_{"old" if legacy else "new"}'
    page.screenshot(path=f'{out}/{tag}_locked.png')
    assert page.evaluate('!lfGated()&&!document.body.classList.contains("nochar")')
    assert page.evaluate('!!egMjLock()&&!!ubLock()')
    page.evaluate('''()=>{S.Q=S.Q||{};S.Q[2]=S.Q[2]||{};S.Q[2][ACTS[ACTS.length-1].fq]=1;TAB='eg';cqPg.fl('more');EGT='mj';render();}''')
    page.wait_for_timeout(150)
    page.screenshot(path=f'{out}/{tag}_domain.png')
    assert page.locator('.mjp').count()==1
    assert page.evaluate('egMjCap()')==(35 if legacy else 20)
    assert page.evaluate('''()=>Array.from(document.querySelectorAll('.mjp button')).every(e=>e.getBoundingClientRect().height>=44&&getComputedStyle(e).whiteSpace==='nowrap')''')
    assert page.evaluate('document.documentElement.scrollWidth<=390')
    page.evaluate('''()=>{egMj().best=Math.max(20,egMj().best);TAB='eg';cqPg.fl('more');EGT='uber';render();}''')
    page.screenshot(path=f'{out}/{tag}_keys.png')
    assert page.locator('.ubp').count()==1
    assert page.evaluate('document.documentElement.scrollWidth<=390')
    assert page.evaluate('''()=>Array.from(document.querySelectorAll('.ubp button')).every(e=>e.getBoundingClientRect().height>=44&&getComputedStyle(e).whiteSpace==='nowrap')''')
    if legacy: assert page.evaluate('egUb().k.t===2&&egUb().wins===2')
    # Gate selection avoids duplicate keys; no final win before third phase.
    page.evaluate('''()=>{egUb().k={t:3,h:3,d:3};egUb().o={horn:0,eye:0,brain:0};ubPrison();nextWave();}''')
    assert page.evaluate('EGM.k===\'ubp\'&&EGM.g===\'abyss_g1\'&&egUb().k.t===2')
    page.evaluate('''()=>{MON[0].hp=0;killMon(MON[0]);egLeave(1);closeM();egUb().o={horn:1,eye:1,brain:1};ubAbyss();nextWave();S.auto=0;render();}''')
    assert page.evaluate('EGM.stage===0&&MON.length===1&&MON[0].n===\'魔龙教主\'')
    page.wait_for_timeout(2100)
    # Dismiss the delayed gate result before photographing the final encounter.
    page.evaluate('closeM()')
    page.screenshot(path=f'{out}/{tag}_phase1.png')
    for stage in [1,2]:
     page.evaluate('''()=>{const m=MON.find(m=>m.ubS);m.hp=0;killMon(m);S.auto=0;render();}''')
     assert page.evaluate('EGM.stage')==stage
     page.wait_for_timeout(2100)
     assert page.locator('#cqStage').inner_text().find(page.evaluate('MON[0].n'))>=0
     page.screenshot(path=f'{out}/{tag}_phase{stage+1}.png')
    page.evaluate('''()=>{const r=EGM;ubFail(r,'验收退出');egLeave(1);}''')
    page.wait_for_timeout(1200)
    assert page.locator('#modal .mtitle').count()==1
    page.screenshot(path=f'{out}/{tag}_result.png')
    page.locator('#modal').click(position={'x':2,'y':2});page.wait_for_timeout(250)
    assert page.locator('#modal').evaluate('(e)=>e.classList.contains("hide")')
    assert not errors,errors
    assert '请先登录账号' not in page.locator('#app').inner_text()
    results.append({'browser':engine,'legacy':legacy,'pass':True,'errors':errors})
    ctx.close()
   browser.close()
finally:
 srv.shutdown()
 (Path(out)/'ui_results.json').write_text(json.dumps(results,indent=2))
print('R13 Chromium/WebKit × fresh/legacy: PASS')
