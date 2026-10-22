#!/usr/bin/env python3
"""390×844 行囊交互回归；云请求用基线 mock，不写真实后端。"""
import json, os, re
from playwright.sync_api import sync_playwright
from pw_baseline import start_server, Cloud, fake_session
OUT=os.environ.get('MIR2_SHOTS','/workspace/design/laoyang_m1_shots/codex_mir2_int2')+'/bag'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server()
results=[]
try:
 with sync_playwright() as pw:
  for browser_name in ['chromium','webkit']:
   browser=getattr(pw,browser_name).launch()
   for kind in ['new','old']:
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,device_scale_factor=2,service_workers='block')
    cloud=Cloud('ok');context.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),cloud.handle)
    context.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+')')
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+'/index.html');page.wait_for_timeout(6500)
    page.evaluate("""() => {closeM();CQSys.createChar('行囊QA','zs');closeM();window.step=()=>{};S.auto=0;S.autoEq=0;S.autoSk=0;S.autoAt=0;S.rcy.on=0;
    S.bag=[];for(let i=0;i<85;i++)S.bag.push(genItem(10,{base:BASEM[['swd1','wand1','wand2','swd8','arm7','rin3','glv2'][i%7]],q:3}));
    S.bag[0].lk=1;S.eq.weapon=genItem(5,{base:BASEM.swd1,q:3});S.gold=1e8;addMat('ckq',10);
    S.pst=mkPages(2);ACCT.shared=mkPages(2);S.pstN=2;ACCT.shN=2;
    for(let i=0;i<55;i++){const it=genItem(10,{base:BASEM[['swd1','wand1','wand2','swd8'][i%4]],q:3});it.uid=ACCT.suid++;ACCT.shared[Math.floor(i/48)].push(it)}
    S.pst[0].push(genItem(10,{base:BASEM.swd1,q:3}));save();acctSave();TAB='bag';STV='bag';render();} """)
    if kind=='old':
     page.evaluate("""() => {S.lvl=48;S.pst=mkPages(20);for(let i=0;i<110;i++)S.pst[15+Math.floor(i/48)].push(genItem(10,{base:BASEM.swd1,q:3}));S.pstN=2;save();acctSave()}""")
     page.reload();page.wait_for_timeout(6500)
     page.evaluate("closeM();window.step=()=>{};S.auto=0;TAB='bag';STV='bag';render()")
     assert page.evaluate('S.lvl===48&&S.pst.flat().length===110&&S.pst.length===3')
    def shot(name):
     page.wait_for_timeout(350);page.evaluate('document.querySelector("#toast")?.classList.remove("on")');page.screenshot(path=f'{OUT}/{browser_name}_{kind}_{name}.png')
    def grid(count):
     page.wait_for_timeout(300)
     if not page.locator('.cqbag').count():
      print(page.evaluate('({tab:TAB,render:renderBag.toString().slice(0,200),html:document.querySelector("#panel").innerHTML.slice(0,400)})'),errors,flush=True)
     assert page.locator('.cqb-grid > .cell').count()==count, page.evaluate('({count:document.querySelectorAll(".cqb-grid > .cell").length,tab:TAB})')
     assert page.evaluate("getComputedStyle(document.querySelector('.cqb-grid')).gridTemplateColumns.split(' ').length") == 8
     assert page.evaluate("document.documentElement.scrollWidth<=390")
     assert page.evaluate("[...document.querySelectorAll('.cqbag button')].every(b=>b.getBoundingClientRect().height>=44&&getComputedStyle(b).whiteSpace==='nowrap')")
    grid(40);shot('bag')
    first=page.evaluate('S.bag.find(x=>x.lk).uid');page.evaluate('BGP=Math.floor(groups(S.bag).findIndex(g=>g.it.uid==='+str(first)+')/40);render()');page.locator(f'.cqb-grid [onclick="cqbTap({first})"]').click();page.wait_for_timeout(400)
    assert page.locator('.cqb-detail-actions button').all_text_contents()==['穿戴','对比','解锁','回收'],page.locator('.cqb-detail-actions button').all_text_contents()
    assert all(t in page.locator('#modal .ipanel').inner_text() for t in ['攻击：','需求等级：','持久：','挂机不磨损'])
    assert page.locator('#modal button').evaluate_all('(es)=>es.filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&getComputedStyle(e).whiteSpace==="nowrap"})')
    assert page.locator('.cmpw').count()==0
    shot('detail');page.get_by_role('button',name='对比',exact=True).click();assert page.locator('.cmpw').count()==1;assert page.locator('.cmpw .ipanel').count()==2;assert page.locator('.cmpd').count()==1;shot('compare');page.wait_for_timeout(400);page.mouse.click(4,200);page.wait_for_timeout(350);assert page.locator('#modal').evaluate("e=>e.classList.contains('hide')")
    page.evaluate('BGP=0;render()');page.get_by_role('button',name='下一页',exact=True).click();assert page.evaluate('BGP')==1;grid(40)
    page.get_by_role('button',name='武器',exact=True).click();grid(40)
    assert page.evaluate("[...document.querySelectorAll('.cqb-grid .cell:not(.void)')].length>0")
    page.get_by_role('button',name='全部',exact=True).click();page.evaluate('BGP=0;render()')
    page.get_by_role('button',name='个人仓库',exact=True).click();grid(48);shot('personal')
    page.once('dialog',lambda d:d.accept());page.get_by_role('button',name='扩容仓库',exact=True).click();assert page.evaluate('S.pst.length')==(4 if kind=='old' else 3)
    page.get_by_role('button',name='共享仓库',exact=True).click();grid(48);shot('shared');assert page.locator('.cqb-class').count()>0
    page.get_by_role('button',name='法师',exact=True).click();grid(48);assert page.locator('.cqb-grid .cell:not(.void)').count()==28;shot('chips')
    page.locator('.cqb-grid .cell:not(.void)').first.click();page.wait_for_timeout(400);assert page.locator('.cqb-transfer').inner_text().find('取回背包')>=0
    page.mouse.click(4,200);page.wait_for_timeout(350)
    page.get_by_role('button',name='全部',exact=True).first.click();page.once('dialog',lambda d:d.accept());page.get_by_role('button',name='扩容仓库',exact=True).click();assert page.evaluate('ACCT.shared.length')==3
    # 真实存取、锁定与单件回收，不仅检查截图。
    page.locator('.cqb-grid .cell:not(.void)').first.click();page.wait_for_timeout(400)
    before=page.evaluate('ACCT.shared.flat().length');page.get_by_role('button',name='取回背包',exact=True).click()
    assert page.evaluate('ACCT.shared.flat().length')==before-1
    page.locator('.cqb-tabs').get_by_role('button',name='背包',exact=True).click()
    page.get_by_role('button',name='锁定',exact=True).click();lock_uid=page.evaluate('S.bag[0].uid');was=page.evaluate('!!S.bag[0].lk');page.locator('.cqb-grid .cell:not(.void)').first.click()
    assert page.evaluate('!!S.bag.find(x=>x.uid==='+str(lock_uid)+').lk')!=was
    page.evaluate('delete S.bag.find(x=>x.uid==='+str(lock_uid)+').lk')
    page.get_by_role('button',name='完成锁定',exact=True).click()
    page.locator('.cqb-grid .cell:not(.void)').first.click();page.wait_for_timeout(400)
    before=page.evaluate('S.bag.filter(x=>!x.k).length');page.once('dialog',lambda d:d.accept())
    page.locator('.cqb-detail-actions').get_by_role('button',name='回收',exact=True).click()
    assert page.evaluate('S.bag.filter(x=>!x.k).length')==before-1
    page.get_by_role('button',name='排序',exact=True).click();grid(40)
    wear_uid=page.evaluate("S.bag.find(it=>!it.k&&!it.lk&&BASEM[it.b].s==='weapon'&&canEquip(it)).uid")
    page.evaluate('showItem('+str(wear_uid)+')');page.get_by_role('button',name='穿戴',exact=True).click()
    assert page.evaluate('S.eq.weapon.uid')==wear_uid

    # WebKit reload 的 pagehide keepalive 被 mock route 判为跨域，与基线同样单列。
    noise=[e for e in errors if 'supabase.co' in e and 'access control' in e]
    assert not [e for e in errors if e not in noise],errors
    results.append({'browser':browser_name,'save':kind,'passed':True,'mockBeaconNoise':noise})
    context.close()
   browser.close()
finally:
 srv.shutdown()
 with open(OUT+'/report.json','w') as f:json.dump(results,f,ensure_ascii=False,indent=2)
print(json.dumps(results,ensure_ascii=False))
