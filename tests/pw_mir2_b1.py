"""Mir2 block 1: six combos, new/legacy saves, Chromium/WebKit at 390×844."""
import json, os
from playwright.sync_api import sync_playwright
import pw_baseline as base
OUT='/workspace/design/laoyang_m1_shots/codex_mir2_b1'
COMBOS=[('zs','zs','破魂斩','pohunzhan'),('zs','fs','雷霆一击','leitingyiji'),('zs','ds','劈星斩','pixingzhan'),('fs','fs','火龙气焰','huolongqiyan'),('fs','ds','末日审判','morishenpan'),('ds','ds','噬魂沟泽','shihunzhaoze')]
def main():
 os.makedirs(OUT,exist_ok=True);srv,url=base.start_server();report=[]
 try:
  with sync_playwright() as pw:
   for engine in ['chromium','webkit']:
    browser=getattr(pw,engine).launch()
    for kind in ['new','legacy']:
     ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
     ctx.route('https://*.supabase.co/**',base.Cloud('ok').handle)
     ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(base.fake_session()))+')')
     p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     p.goto(url+'/index.html');p.wait_for_function("typeof CL!=='undefined'&&CL.ready",timeout=20000);p.wait_for_timeout(600)
     for cls,hero,name,fx in COMBOS:
      tag=f'{engine}_{kind}_{cls}_{hero}'
      p.evaluate("""([c,h])=>{CQSys.createChar('合击验证',c);closeM();S.lvl=30;S.autoSk=0;CQSys.heroCreate(h);S.hero.lvl=30;heroSkInit();save()}""",[cls,hero])
      if kind=='legacy':
       p.evaluate("""()=>{delete S.battleSkills;delete S.battleSkillsCls;S.v=2;addMat('book_ds_sds',1);addMat('book_ds_zhkl',1);const raw=JSON.stringify(S);GS.setItem(KEY,raw);GS.setItem(CH_PRE+ACCT.cur,raw)}""")
       p.reload();p.wait_for_function("typeof CL!=='undefined'&&CL.ready",timeout=20000);p.wait_for_timeout(400)
       assert p.evaluate("CQSys.bookCount('ds_sds')===1&&CQSys.bookCount('ds_zhkl')===1")
      p.evaluate("()=>{window.step=()=>{};CQ.heroCore().reload();closeM();TAB='merc';render()}");p.wait_for_timeout(250)
      assert p.locator('.hpcombo b').inner_text()==name
      assert p.locator('.hpcombo img').get_attribute('src').endswith('heji_'+fx+'.png')
      def shot(page):
       p.wait_for_timeout(250)
       assert p.evaluate('document.documentElement.scrollWidth<=390')
       p.screenshot(path=f'{OUT}/{tag}_{page}.png')
      p.locator('.hpcombo').evaluate('(e)=>e.scrollIntoView({block:"center"})')
      shot('hero')
      # 强制覆盖英雄已恢复、之后才挂载战场的旧档启动顺序。
      # 挂载须同步初始化图标，不能依赖后续 hero 事件或角色变化。
      if kind=='legacy':
       p.evaluate("()=>{const stage=CQ.Scene.state().stage;CQ.Scene.unmount();CQ.Scene.mount(stage)}")
       assert p.locator('.heji img').get_attribute('src').endswith('heji_'+fx+'.png'),tag
      p.evaluate("TAB='fight';render()");p.wait_for_timeout(500)
      p.wait_for_function("fx=>document.querySelector('.heji img')?.getAttribute('src').endsWith('heji_'+fx+'.png')",arg=fx)
      shot('battle')
      p.evaluate("TAB='skill';cqPg.sk('bar');cqPg.barPick(0)")
      choices=p.locator('.cqbarchoices button[onclick*="barSet"]')
      states=choices.evaluate_all("es=>es.filter(e=>e.querySelector('small')).map(e=>({id:e.getAttribute('onclick').split(\"'\")[1],label:e.querySelector('small').textContent}))")
      assert any(x['label']=='未学' for x in states)
      for x in states:
       lv=p.evaluate('id=>bl(id)',x['id']);assert x['label']==('Lv.'+str(lv) if lv else '未学'),x
      assert choices.evaluate_all('(es)=>es.every(e=>{let r=e.getBoundingClientRect();return r.height>=44&&r.width>=44&&e.scrollHeight<=e.clientHeight+2})')
      shot('skillbar_picker')
      bd=p.evaluate(base.JS_BACKDROP);assert isinstance(bd,list);p.mouse.click(*bd)
      assert p.locator('#modal').evaluate("e=>e.classList.contains('hide')")
      report.append({'browser':engine,'save':kind,'combo':cls+'+'+hero,'name':name,'passed':True})
     errors=[e for e in errors if not ('supabase.co' in e and 'access control' in e)]
     assert not errors,errors
     print(engine,kind,'six combos PASS',flush=True);ctx.close()
    browser.close()
 finally:srv.shutdown()
 with open(OUT+'/report.json','w') as f:json.dump(report,f,ensure_ascii=False,indent=2)
 print('24 scenarios passed; 72 screenshots')
if __name__=='__main__':main()
