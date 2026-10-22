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
    p.evaluate("""()=>{CQSys.createChar('英雄实测','fs');closeM();CQSys.heroCreate('zs');if(window.CQ&&CQ.heroCore)CQ.heroCore().reload();save()}""")
    if kind=='legacy_merc':
     p.evaluate("""()=>{S.merc={_v:2,t:'mage',v:0,nm:'旧佣兵',lvl:1,xp:0,eq:{},prev:{},auto:1,ar:1};S.mercU=1;save()}""")
     p.reload();p.wait_for_timeout(3000)
    p.evaluate('closeM()')
    layouts={}
    for tab,page in [('hero','hero'),('fight','battle')]:
     p.evaluate("""t=>{TAB=t;closeM();render()}""",tab);p.wait_for_timeout(1200)
     p.screenshot(path=f'{OUT}/{engine}_{kind}_{page}.png')
     lay=p.evaluate(base.JS_LAYOUT)
     wraps=p.evaluate("""()=>[...document.querySelectorAll('button')].filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).whiteSpace!=='nowrap'&&e.scrollHeight>e.clientHeight+2}).map(e=>e.innerText)""")
     layouts[page]={'offscreen':lay['offscreen'],'wrapRows':lay['wrapRows'],'buttonOverflow':wraps,'documentWidth':lay['docScrollW']}
    noise=[e for e in errors if 'supabase.co' in e and 'access control' in e]
    errors=[e for e in errors if e not in noise]
    results.append({'beaconNoise':noise,'browser':engine,'save':kind,'errors':errors,'layouts':layouts,'heroPage':'master 角色页；专用英雄页尚未实现，保留现状'})
    ctx.close()
   browser.close()
 srv.shutdown()
 with open(OUT+'/browser_report.json','w') as f:json.dump(results,f,ensure_ascii=False,indent=2)
 for r in results:
  assert not r['errors'],r
  for v in r['layouts'].values():assert not v['offscreen'] and not v['wrapRows'] and not v['buttonOverflow'] and v['documentWidth']<=391,r
 print('hero_m1: chromium/webkit × new/legacy_merc passed; 8 screenshots')
if __name__=='__main__':main()
