#!/usr/bin/env python3
"""Integrated equipment runtime: Chromium/WebKit, new and legacy reloads."""
import os,json,re,sys
sys.path.insert(0,os.path.dirname(__file__))
from pw_baseline import start_server,Cloud,JS_BACKDROP,fake_session
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST=os.environ.get('MIR2_SHOTS','/workspace/design/laoyang_m1_shots/codex_mir2_int2')+'/equipment'
os.makedirs(DEST,exist_ok=True)
report=[]
srv,base=start_server()
def capture(pg,tag):
    pg.evaluate('closeM();TAB="bag";render()');pg.wait_for_timeout(200)
    pg.screenshot(path=f'{DEST}/{tag}_bag.png')
    if 'before' not in tag:
        assert pg.locator('#panel button br').count()==0
        buttons=pg.evaluate("()=>[...document.querySelectorAll('#panel button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().width).map(e=>({text:e.innerText,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))")
        assert all(b['w']>=44 and b['h']>=44 for b in buttons),buttons
    pg.evaluate('TAB="hero";render()');pg.wait_for_timeout(200)
    pg.screenshot(path=f'{DEST}/{tag}_paperdoll.png')
    touch=pg.evaluate("()=>[...document.querySelectorAll('.cqslot')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))")
    if 'before' not in tag:assert all(x['w']>=44 and x['h']>=44 for x in touch),touch
    pg.evaluate('showItem(S.eq.weapon.uid)');pg.wait_for_timeout(300)
    if 'before' not in tag:
        bounds=pg.locator('#modal .mb').bounding_box()
        assert bounds['y']>=0 and bounds['y']+bounds['height']<=845,bounds
    pg.screenshot(path=f'{DEST}/{tag}_detail.png')
    layout=pg.evaluate('''()=>{const m=document.querySelector('#modal');return [...m.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>({text:e.innerText,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,nowrap:getComputedStyle(e).whiteSpace==='nowrap'}))}''')
    backdrop=pg.evaluate(JS_BACKDROP)
    if isinstance(backdrop,list):pg.mouse.click(*backdrop)
    closed=pg.evaluate("document.querySelector('#modal').classList.contains('hide')")
    return dict(buttons=layout,backdrop=backdrop,backdropClosed=closed,handler=pg.evaluate("String(document.querySelector('#modal').onclick)"))
try:
 with sync_playwright()as pw:
  for browsername in ['chromium','webkit']:
   browser=getattr(pw,browsername).launch()
   for mode in ['new','old']:
    ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
    ctx.route('https://*.supabase.co/**',Cloud('ok').handle)
    ctx.add_init_script('window.__NOGATE=1;window.__NOSHOWLOGIN=1;localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+');')
    pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.goto(base+'/index.html');pg.wait_for_function('window.CQSys&&CQSys.createChar');pg.wait_for_function("typeof CU!=='undefined'&&!!CU");pg.wait_for_timeout(500)
    pg.evaluate('''()=>{CQSys.createChar('装备验收','zs');S.lvl=42;S.auto=0;S.autoEq=0;S.bag=[];S.eq={};for(const slot of ['weapon','armor','helm','amulet','shield','gloves','ring','belt','boots']){const b=BASES.find(b=>b.s===slot&&b.cqTier==='molong'&&b.ccls==='zs')||(slot==='weapon'&&BASEM.swdcaijuezhizhang)||BASES.find(b=>b.s===slot);const it=genItem(42,{base:b,q:3});if(slot==='weapon'){it.en=7;if(!window.CQMir2Equip){it.m.edmg=25;it.m.ll=3;it.m.life=20}}S.eq[slot==='ring'?'ring1':slot]=it}for(let i=0;i<12;i++)S.bag.push(genItem(42,{q:i%2?3:4}));calc();closeM();render()}''')
    if mode=='old':
     pg.evaluate('''()=>{for(const it of [...Object.values(S.eq),...S.bag]){for(const k of Object.keys(it))if(k.startsWith('cq'))delete it[k];it.m={edmg:25,life:20,mana:10};}delete S.mir2Mig;calc()}''')
     before=pg.evaluate('({power:CQSys.power(),local:itemLocal(S.eq.weapon),mods:allMods(S.eq.weapon)})')
     capture(pg,browsername+'_old_before')
     pg.evaluate('save()');pg.reload();pg.wait_for_function('window.CQSys&&CQSys.createChar');pg.wait_for_function("typeof CU!=='undefined'&&!!CU");pg.wait_for_timeout(500);pg.evaluate('closeM()')
     assert pg.evaluate('S.mir2Mig.equipment===1&&Object.values(S.eq).every(it=>it.cqMigrated)')
     after=pg.evaluate('({power:CQSys.power(),local:itemLocal(S.eq.weapon),mods:allMods(S.eq.weapon)})')
     assert after['power']>=before['power'],(before,after)
     assert all(after['mods'].get(k,0)>=v for k,v in before['mods'].items())
    else:before=after=None
    checks=capture(pg,browsername+'_'+mode+('_after' if mode=='old' else ''))
    assert checks['backdropClosed'],checks
    assert all(b['w']>=44 and b['h']>=44 and b['nowrap'] for b in checks['buttons']),checks
    errors=[e for e in errors if not ('supabase.co' in e and 'access control' in e)]
    assert not errors,errors
    report.append(dict(browser=browsername,mode=mode,before=before,after=after,checks=checks,errors=errors))
    ctx.close()
   browser.close()
finally:
 srv.shutdown()
 with open(DEST+'/report.json','w')as f:json.dump(report,f,ensure_ascii=False,indent=2)
print(json.dumps(report,ensure_ascii=False))
