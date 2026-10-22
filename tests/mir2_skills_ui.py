"""Temporary integration only: never write shared runtime files."""
import json,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright
import pw_baseline as base
OUT='/workspace/design/laoyang_m1_shots/codex_mir2_skill'
ROOT=Path(__file__).resolve().parents[1]
# These replacements are the reviewable shared-file wiring in docs/mir2_wire_skill.md.
def wired(rel,src):
 if rel=='cq/pages_cq.js':
  src=src.replace('s.cls===c&&skOfCls(s)','skOfCls(s)')
  src=src.replace("const btn=lk?", "const btn=b>=SKMX()?'<button class=\"cqbtn xs dis\" disabled>满级</button>':lk?")
  src=src.replace('${UI}sk/ic_sk_${n}.png','${SKM[id]&&SKM[id].mir2?n:UI+"sk/ic_sk_"+n+".png"}')
 if rel=='cq_bridge.js':src=src.replace("return SK_ICON[id] ?","return G('SKM')[id]&&G('SKM')[id].mir2 ? 'assets/cq/icon/sk_'+id+'.png' : SK_ICON[id] ?")
 if rel=='cq/hero_page.js':src=src.replace('${U}sk/ic_sk_${ic}.png','${SKM[s.id].mir2?ic:U+"sk/ic_sk_"+ic+".png"}')
 return src

def main():
 os.makedirs(OUT,exist_ok=True);srv,url=base.start_server();rows=[]
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for kind in ['new','legacy']:
    for cls,newsk in [('fs','lxhy'),('ds','sxs'),('zs','zrjf')]:
     ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
     ctx.route('https://*.supabase.co/**',base.Cloud('ok').handle)
     for rel in ['cq/pages_cq.js','cq/hero_page.js','cq_bridge.js']:
      body=wired(rel,(ROOT/rel).read_text())
      ctx.route('**/'+rel+'*',lambda route,request,body=body:route.fulfill(content_type='application/javascript',body=body))
     ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(base.fake_session()))+')')
     p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     p.goto(url+'/index.html');p.wait_for_function("typeof CL!=='undefined'&&CL.ready",timeout=30000);p.wait_for_timeout(900)
     p.evaluate("c=>{CQSys.createChar('技能验收'+c,c);closeM();S.autoSk=0;save()}",cls)
     if kind=='legacy':
      p.evaluate("()=>{S.lvl=48;S.sk9=1;S.skx={};addMat('book_dhq',2);S.hero={cls:'fs',name:'旧英雄',lvl:45,eq:{},sk:{hqs:{lv:9,exp:42}},skOff:{hqs:1},mode:'attack'};save();load()}")
     p.add_script_tag(url=url+'/cq/mir2_skills.js')
     p.evaluate("()=>{mir2SkillsWire();window.step=()=>{};S.lvl=60;S.autoSk=0;for(const s of CLS_SKILLS)if(skOfCls(s))S.sk[s.id]=9;S.hero=CQSys.hero();S.hero.cls=S.cls;S.hero.lvl=60;S.hero.sk={};for(const id of heroSkList())S.hero.sk[id]={lv:9,exp:0};calc();H.life=ST.life;H.mana=ST.mana;closeM()}")
     tag=f'{engine}_{kind}_{cls}'
     def shot(name):
      p.wait_for_timeout(200);p.evaluate("document.querySelector('#toast')?.classList.remove('on')");assert p.locator('img[src*="assets/cq/icon/sk_"]').evaluate_all('(es)=>es.every(e=>e.complete&&e.naturalWidth>0)');p.screenshot(path=f'{OUT}/{tag}_{name}.png');assert p.evaluate('document.documentElement.scrollWidth<=390')
     p.evaluate("TAB='skill';render();cqPg.sk('list')");shot('skill')
     assert p.locator('.sk2 button').evaluate_all('(es)=>es.every(e=>e.textContent==="满级"&&e.disabled&&!e.hasAttribute("onclick")&&e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().width>=44&&e.scrollHeight<=e.clientHeight+2)')
     assert '本游戏设计值' not in p.locator('#panel').inner_text()
     assert p.locator('.sk2').count()>=(9 if cls=='zs' else 10)
     p.locator('.sk2').filter(has_text={'fs':'流星火雨','ds':'噬血术','zs':'逐日剑法'}[cls]).scroll_into_view_if_needed();shot('skill_new')
     p.locator('.ord').first.scroll_into_view_if_needed();shot('auto_order')
     assert p.locator('.ord .ar').evaluate_all('(es)=>es.every(e=>e.getBoundingClientRect().width>=44&&e.getBoundingClientRect().height>=44)')
     # Visible capsule stays 38×20; transparent ::before owns the 44×44 hit area.
     assert p.locator('.ord .sw').evaluate_all("""es=>es.every(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),hit=getComputedStyle(e,'::before'),knob=getComputedStyle(e,'::after');return r.width===38&&r.height===20&&s.borderRadius==='10px'&&hit.top==='-12px'&&hit.left==='-3px'&&knob.width==='16px'&&knob.height==='16px'&&knob.top==='2px'})""")
     toggle=p.locator('.ord .sw').first
     toggle.scroll_into_view_if_needed();box=toggle.bounding_box();was=toggle.get_attribute('class')
     p.mouse.click(box['x']+box['width']/2,box['y']-10)
     assert p.locator('.ord .sw').first.get_attribute('class')!=was
     shot('auto_order_off')
     toggle=p.locator('.ord .sw').first;box=toggle.bounding_box()
     p.mouse.click(box['x']+box['width']/2,box['y']+box['height']+10)
     assert p.locator('.ord .sw').first.get_attribute('class')==was
     if cls=='ds':
      assert p.evaluate("acSmartTxt('zys').includes('生命低于')&&acSmartTxt('zhkl').includes('无召唤物')&&acSmartTxt('zhss').includes('无召唤物')&&acSmartTxt('sds').includes('未中毒')&&acSmartTxt('lhhf').includes('攻击技能')")
     p.evaluate("cqPg.sk('bar');cqPg.barPick(0)");shot('battle_picker')
     assert p.locator('.cqbarchoices button').evaluate_all('(es)=>es.every(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.width>=44&&e.scrollHeight<=e.clientHeight+2})')
     bd=p.evaluate(base.JS_BACKDROP);p.wait_for_timeout(350);p.mouse.click(*bd);assert p.locator('#modal').evaluate("e=>e.classList.contains('hide')")
     p.evaluate("TAB='merc';render()");p.locator('.hpskill').last.scroll_into_view_if_needed();shot('hero_skills')
     p.locator('.hpskill').filter(has_text={'fs':'分身术','ds':'召唤月灵','zs':'开天斩'}[cls]).scroll_into_view_if_needed();shot('hero_exclusive')
     assert p.locator('.hptoggle').evaluate_all('(es)=>es.every(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.width>=44&&e.scrollHeight<=e.clientHeight+2})')
     assert p.locator('.hpsw').evaluate_all("es=>es.every(e=>{const r=e.getBoundingClientRect();return r.width===38&&r.height===20})")
     p.evaluate("id=>{TAB='fight';CQSys.setBattleSkill(0,id);MON=[mkMon(ACTS[0].zones[1].mons[0],60)];MON[0].hp=MON[0].max=1e9;H.mana=ST.mana;H.castT=0;for(const k in ACT)delete ACT[k];render()}",newsk)
     p.wait_for_timeout(400);p.locator('.cqb .csk[data-sk="0"]').click();shot('battle_cast')
     assert p.locator('.cqb .csk').evaluate_all('es=>es.every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44})')
     assert p.evaluate('id=>clsCdLeft(id)>0',newsk)
     assert not errors,errors
     rows.append({'browser':engine,'save':kind,'class':cls,'passed':True});print(tag,'PASS',flush=True);ctx.close()
   browser.close()
 srv.shutdown();Path(OUT+'/ui_report.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
