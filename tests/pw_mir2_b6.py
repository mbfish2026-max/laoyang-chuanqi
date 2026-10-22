#!/usr/bin/env python3
"""一次脚本：两浏览器×新旧档，390×844，云服务使用内存桩。"""
import json, os, re, argparse
from playwright.sync_api import sync_playwright
from pw_baseline import start_server, Cloud, fake_session, JS_BACKDROP
OUT='/workspace/design/laoyang_m1_shots/codex_mir2_b6'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server()
args=argparse.ArgumentParser();args.add_argument('--case');case=args.parse_args().case
report=[]
with sync_playwright() as pw:
    for name in ['chromium','webkit']:
        browser=getattr(pw,name).launch()
        for old in [False,True]:
            label=name+('_old' if old else '_new')
            if case and case!=label:continue
            ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,service_workers='block')
            ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),Cloud('ok').handle)
            ctx.add_init_script("localStorage.setItem('cq_sb_auth',%s)" % json.dumps(json.dumps(fake_session())))
            pg=ctx.new_page(); errors=[]
            pg.on('pageerror',lambda e:errors.append(str(e)))
            pg.goto(base+'/index.html',wait_until='load')
            pg.wait_for_function("typeof CQSys!=='undefined'&&typeof cqPg!=='undefined'&&typeof CQB6!=='undefined'")
            pg.wait_for_function("typeof CU!=='undefined'&&CU&&CL_GATE===0")
            pg.evaluate("""() => {CQSys.createChar('六块验收','zs');closeM();S.gold=1e8;S.lvl=40;S.refineMat=100;addMat('ess',1000);calc();H.life=ST.life;S.auto=0;
             for(let i=0;i<3;i++){const it=makeBase(BASEM.swd1,20);it.q=3;it.name='木剑';S.bag.push(it)};save() }""")
            if old:
                pg.evaluate("""() => {delete S.slotRefine;delete S.refineMat;delete S.redDragon;save();load();calc();closeM()}""")
                pg.reload(wait_until='load')
                pg.wait_for_function("typeof cqPg!=='undefined'&&typeof CQB6!=='undefined'")
                pg.evaluate('closeM();S.auto=0;calc()')
            checks=[]
            def shot(kind):
                pg.wait_for_timeout(100)
                pg.screenshot(path=f'{OUT}/{label}_{kind}.png')
                result=pg.evaluate("""() => {const panel=document.querySelector('#modal:not(.hide)');if(!panel)return [];return [...panel.querySelectorAll('.b6panel button,.b6bless button')].map(e=>{const r=e.getBoundingClientRect();return {text:e.innerText,w:r.width,h:r.height,nowrap:getComputedStyle(e).whiteSpace,right:r.right}})}""")
                assert all(x['w']>=44 and x['h']>=44 and x['nowrap']=='nowrap' and x['right']<=391 for x in result),result
                assert pg.evaluate('document.documentElement.scrollWidth<=390'),'水平溢出'
                checks.append(kind)
            pg.evaluate("TAB='hero';render()")
            pg.get_by_role('button',name='部位淬炼',exact=True).click()
            shot('refine')
            pg.wait_for_timeout(350);back=pg.evaluate(JS_BACKDROP);assert isinstance(back,list),back
            pg.mouse.click(*back);pg.wait_for_timeout(350);assert pg.locator('#modal').evaluate("e=>e.classList.contains('hide')"),pg.evaluate("({handler:String(document.querySelector('#modal').onclick),gate:CL_GATE,lf:LF,cu:!!CU})")
            pg.evaluate("TAB='bag';render()")
            pg.get_by_role('button',name='三合一融合',exact=True).click();shot('fusion')
            pg.evaluate("closeM();var buid=S.bag.find(x=>x.name==='木剑').uid;rfBlessRoll(buid);rfMain(buid)")
            pg.locator('.b6bless').scroll_into_view_if_needed();shot('blessing')
            pg.evaluate("closeM();TAB='map';render()")
            pg.get_by_role('button',name='红龙圣地',exact=True).click();shot('dungeon_entry')
            pg.get_by_role('button',name='开始挑战',exact=True).click()
            pg.evaluate('S.auto=1;CQB6.tick(2)');pg.wait_for_timeout(1100);shot('dungeon_battle')
            pg.evaluate('CQB6.finish("retreat");save()')
            noise=[e for e in errors if 'supabase.co' in e and 'access control' in e]
            errors=[e for e in errors if e not in noise]
            assert not errors,errors
            report.append({'case':label,'checks':checks,'errors':errors,'knownBeaconNoise':noise})
            ctx.close()
        browser.close()
srv.shutdown()
if case and os.path.exists(OUT+'/report.json'):
    previous=json.load(open(OUT+'/report.json'));report=[r for r in previous if r['case']!=case]+report
with open(OUT+'/report.json','w') as f:json.dump(report,f,ensure_ascii=False,indent=2)
print(json.dumps(report,ensure_ascii=False))
