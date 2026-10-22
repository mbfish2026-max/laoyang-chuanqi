"""Hero M1: local-only new/legacy saves, iPhone viewport, both engines."""
import json, os
from playwright.sync_api import sync_playwright
import pw_baseline as base
OUT='/workspace/design/laoyang_m1_shots/codex_hero'
def main():
 os.makedirs(OUT,exist_ok=True);srv,url=base.start_server();results=[]
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for kind in ['new','legacy_merc']:
    ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
    ctx.route('https://*.supabase.co/**',base.Cloud('ok').handle)
    ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(base.fake_session()))+')')
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    p.on('console',lambda m:errors.append(m.text) if m.type=='error' and not any(x in m.text for x in ['404','Service Worker registration blocked']) else None)
    p.goto(url+'/index.html');p.wait_for_timeout(7500)
    p.evaluate("""()=>{CQSys.createChar('英雄实测','fs');closeM();S.lvl=22;if(window.CQ&&CQ.heroCore)CQ.heroCore().reload();save()}""")
    if kind=='legacy_merc':
     p.evaluate("""()=>{S.hero=null;S.v=2;S.merc={_v:2,t:'mage',v:0,nm:'旧佣兵',lvl:1,xp:0,eq:{},prev:{},auto:1,ar:1};S.mercU=1;GS.setItem(KEY,JSON.stringify(S));GS.setItem(CH_PRE+ACCT.cur,JSON.stringify(S))}""")
     p.reload();p.wait_for_timeout(3000)
    p.evaluate('closeM()')
    assert p.evaluate("S.v===3 && !S.merc"),kind
    if kind=='new':
     p.evaluate("S.lvl=21;TAB='hero';render()")
     p.locator('.cqsubnav button[data-st=merc]').click()
     assert p.get_by_text('Lv.22 解锁',exact=True).count()
     p.evaluate("S.lvl=22;render()")
    p.evaluate("TAB='merc';render()")
    p.wait_for_timeout(500)
    if kind=='new':
     assert p.get_by_text('首次自由选择',exact=True).count()
     p.evaluate("cqHeroPage.select('ds');cqHeroPage.create('ds')")
    assert p.evaluate("!!S.hero.cls"),kind
    p.evaluate("S.hero.lvl=22;heroSkInit();save()")
    layouts={}
    for tab,page in [('merc','hero'),('fight','battle')]:
     p.evaluate("""t=>{TAB=t;closeM();render()}""",tab);p.wait_for_timeout(1200)
     p.locator('#panel').evaluate('(e)=>e.scrollTop=0')
     p.screenshot(path=f'{OUT}/{engine}_{kind}_{page}.png')
     lay=p.evaluate(base.JS_LAYOUT)
     wraps=p.evaluate("""()=>[...document.querySelectorAll('button')].filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).whiteSpace!=='nowrap'&&e.scrollHeight>e.clientHeight+2}).map(e=>e.innerText)""")
     layouts[page]={'offscreen':lay['offscreen'],'wrapRows':lay['wrapRows'],'buttonOverflow':wraps,'documentWidth':lay['docScrollW']}
    for cls in ['zs','fs','ds']:
     # Independent fresh character for each class; only creation API mutates profession.
     p.evaluate("""c=>{CQSys.createChar('界面'+c,'fs');closeM();S.lvl=22;CQSys.heroCreate(c);S.hero.lvl=22;heroSkInit();TAB='merc';render();save()}""",cls)
     for state in ['on','off']:
      p.evaluate("""state=>{for(const id of heroSkList())CQSys.hero.skToggle(id,state==='on');CQSys.hero.skToggle('heji',state==='on');render()}""",state)
      p.wait_for_timeout(800)
      p.locator('.hptoggle').first.click()
      p.locator('.hptoggle').first.click()
      p.locator('#panel').evaluate('(e)=>e.scrollTop=0')
      p.wait_for_timeout(2200)
      p.screenshot(path=f'{OUT}/{engine}_{kind}_hero_{cls}_{state}.png')
      p.locator('#panel').evaluate('(e)=>e.scrollTop=e.scrollHeight')
      p.screenshot(path=f'{OUT}/{engine}_{kind}_hero_{cls}_{state}_skills.png')
      assert p.locator('.hptoggle[aria-checked="'+str(state=='on').lower()+'"]').count()==len(p.evaluate('heroSkList()'))+1
      assert p.evaluate('document.documentElement.scrollWidth')<=390
      assert p.evaluate("""()=>[...document.querySelectorAll('#panel button')].filter(e=>e.getBoundingClientRect().width>0).every(e=>getComputedStyle(e).whiteSpace==='nowrap')""")
     p.evaluate("cqHeroPage.mode('recall')")
     p.wait_for_timeout(400)
     p.mouse.click(4,800)
     assert p.locator('#modal').evaluate("e=>e.classList.contains('hide')")
     p.evaluate("async()=>{save();if(typeof flushNow==='function')await flushNow()}")
     p.reload();p.wait_for_function("typeof CL!=='undefined'&&CL.ready",timeout=20000);p.wait_for_timeout(500);p.evaluate("closeM();TAB='merc';render()")
     assert p.evaluate("CQSys.hero.skState().heji===1"),(engine,kind,cls,'toggle persistence',p.evaluate('JSON.stringify(S.hero)'))
    noise=[e for e in errors if 'supabase.co' in e and 'access control' in e]
    errors=[e for e in errors if e not in noise]
    results.append({'beaconNoise':noise,'browser':engine,'save':kind,'errors':errors,'layouts':layouts,'heroPage':'p9 英雄页；三职业与开关状态实测'})
    ctx.close()
   browser.close()
 srv.shutdown()
 with open(OUT+'/browser_report.json','w') as f:json.dump(results,f,ensure_ascii=False,indent=2)
 for r in results:
  assert not r['errors'],r
  for v in r['layouts'].values():assert not v['offscreen'] and not v['wrapRows'] and not v['buttonOverflow'] and v['documentWidth']<=391,r
 print('hero_m1: chromium/webkit × new/legacy_merc passed; 56 screenshots')
if __name__=='__main__':main()
