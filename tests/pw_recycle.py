#!/usr/bin/env python3
"""传奇回收 Chromium/WebKit，新档与真实保存重载的旧设置；云端 mock。"""
import json, os, re
from playwright.sync_api import sync_playwright
from pw_baseline import start_server, Cloud, fake_session
OUT='/workspace/design/laoyang_m1_shots/codex_recycle'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server();results=[]
try:
 with sync_playwright() as pw:
  for name in ['chromium','webkit']:
   browser=getattr(pw,name).launch()
   for kind in ['new','old']:
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,device_scale_factor=2,service_workers='block')
    cloud=Cloud('ok');context.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),cloud.handle)
    context.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+')')
    page=context.new_page();page.goto(base+'/index.html');page.wait_for_timeout(6500)
    page.evaluate("""() => {closeM();CQSys.createChar('回收验收','zs');closeM();window.step=()=>{};S.auto=0;S.autoEq=0;S.autoSk=0;S.autoAt=0;S.bag=[];S.rcy=rcyDefault();S.rcy.keepBetter=0;
    for(let i=0;i<12;i++){const it=genItem(10,{base:BASEM.swd1,q:1,noAnc:true});S.bag.push(it)}S.bag[0].lk=1;S.bag[1].set='zuma_zs';S.bag[2].blk='orclord';S.bag[3].anc=1;
    S.bag.push(genItem(40,{base:BASEM.swdtulong,q:1,noAnc:true}));S.recycleQAIds=S.bag.map(it=>it.uid);save();TAB='bag';STV='bag';render()}""")
    if kind=='old':
     page.evaluate("S.rcy={dv:3,on:0,q:{0:1,1:1,2:1,3:0,4:0},c:{sword:1,armor:1,ring:1},keepSock:1,keepElite:1,keepSkill:1,keepNew:1,keepBetter:0,sk:{n:{weapon:4}},mode:'ess'};save()")
     page.wait_for_function('CL.ready&&!CL_BUSY');assert page.evaluate('flushNow()')=='up'
     page.reload();page.wait_for_timeout(6500)
     page.evaluate("closeM();window.step=()=>{};S.auto=0;TAB='bag';STV='bag';render()")
     assert page.evaluate('S.rcy.v===2&&!S.rcy.sk&&S.bag.some(x=>x.lk)')
     # 重载的离线结算可产生额外掉落，验收固定为最初保存的装备组。
     page.evaluate('S.bag=S.bag.filter(it=>S.recycleQAIds.includes(it.uid));render()')
    def shot(label):
     page.wait_for_timeout(300);page.evaluate('document.querySelector("#toast")?.style.setProperty("visibility","hidden")');page.screenshot(path=f'{OUT}/{name}_{kind}_{label}.png')
    page.evaluate('rcyUI()');shot('settings')
    page.get_by_role('button',name='精良',exact=True).click();assert page.evaluate('S.rcy.q[3]')==1
    page.get_by_role('button',name='精良',exact=True).click();assert page.evaluate('S.rcy.q[3]')==0
    page.get_by_label('需求等级',exact=True).select_option('10');assert page.evaluate('S.rcy.levelBelow')==10
    page.get_by_label('需求等级',exact=True).select_option('0')
    page.locator('#modal .mb').evaluate('e=>e.scrollTop=e.scrollHeight');shot('settings_bottom')
    assert not re.search('词缀|抗性|凹槽|符文|暗金|缩颅|Necro',page.locator('#modal').inner_text())
    assert page.locator('.rcy button').evaluate_all('(es)=>es.every(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.width>=44&&getComputedStyle(e).whiteSpace==="nowrap"})')
    assert page.evaluate('document.documentElement.scrollWidth<=390')
    page.mouse.click(3,200);page.wait_for_timeout(200);assert page.locator('#modal').evaluate('e=>e.classList.contains("hide")')
    shot('before')
    count=page.evaluate('S.bag.filter(x=>!x.k).length');page.evaluate('recycleNow()');shot('after')
    assert page.evaluate('S.bag.filter(x=>!x.k).length')==count-8, page.evaluate('({count:S.bag.filter(x=>!x.k).length,r:S.rcy,items:S.bag.filter(x=>!x.k).map(it=>({b:it.b,q:it.q,lk:it.lk,set:it.set,blk:it.blk,anc:it.anc,why:rcyReject(it)}))})')
    assert page.evaluate('matCount("ess")>0&&S.bag.filter(x=>!x.k).length===5&&S.bag.some(x=>x.lk)')
    page.wait_for_function('CL.ready&&!CL_BUSY');assert page.evaluate('flushNow()')=='up'
    page.reload();page.wait_for_timeout(6500)
    assert page.evaluate('S.bag.some(x=>x.lk)&&S.bag.filter(x=>!x.k&&S.recycleQAIds.includes(x.uid)).length===5&&matCount("ess")>=8')
    results.append({'browser':name,'save':kind,'recycled':8,'protected':5,'passed':True});context.close()
   browser.close()
finally:
 srv.shutdown()
 with open(OUT+'/report.json','w') as f:json.dump(results,f,ensure_ascii=False,indent=2)
print(json.dumps(results,ensure_ascii=False))
