#!/usr/bin/env python3
"""M1 逐项 UI 验证（390x844，Chromium+WebKit，云端用 pw_baseline 的模拟）。用法：python3 tests/pw_m1_verify.py [--ref <commit>]"""
import sys, os, json, re, argparse, subprocess, tempfile, tarfile, io
sys.path.insert(0, os.path.dirname(__file__))
import pw_baseline as B
from playwright.sync_api import sync_playwright
TINY = r"""(()=>{const out=[];for(const e of document.querySelectorAll('#app *, #modal *, body > *')){const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')continue;
 const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const t=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');if(!t)continue;
 let p=e,hid=false;while(p&&p!==document.body){const q=getComputedStyle(p);if(q.display==='none'||q.visibility==='hidden'||+q.opacity===0){hid=true;break}p=p.parentElement}if(hid)continue;
 const fs=parseFloat(s.fontSize);if(fs<11)out.push((e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+[...e.classList].join('.'))+' '+fs+'px「'+t.slice(0,12)+'」')}return [...new Set(out)]})()"""
ROWS = r"""(sel)=>[...document.querySelectorAll(sel)].map(r=>{const t=new Set([...r.querySelectorAll(':scope>button')].filter(b=>b.offsetParent).map(b=>Math.round(b.getBoundingClientRect().top)));return {n:r.querySelectorAll(':scope>button').length,rows:t.size,txt:r.innerText.replace(/\s+/g,' ').slice(0,60)}})"""
def run(pw, bname, base):
    res = {}; br = getattr(pw, bname).launch()
    def ctx_page(seed=None):
        ctx = br.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=(bname=='chromium'), has_touch=True, locale='zh-CN', service_workers='block')
        cl = B.Cloud('ok'); ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'), cl.handle)
        if seed: ctx.add_init_script('(()=>{const s=%s;for(const k in s)localStorage.setItem(k,s[k])})()' % json.dumps(seed))
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); return ctx, pg, errs
    sess = json.dumps(B.fake_session())
    seed = {'cq_sb_auth': sess, 'cq_pwr': json.dumps({'eco':1,'m':1}), 'cq_bonus_open':'1',
            'cq_acct': json.dumps({'v':1,'cur':1,'nid':2,'suid':1e9,'chars':[{'id':1,'name':'老羊QA','cls':'战士','cid':'zs','lvl':7,'t':0}],'shared':[]})}
    ctx, pg, errs = ctx_page(); pg.goto(base+'/index.html'); pg.wait_for_timeout(3000)
    raw = pg.evaluate("(()=>{try{save()}catch(e){};return GS.getItem(CH_PRE+(ACCT&&ACCT.cur||1))})()"); ctx.close()
    if raw: o = json.loads(raw); o['lvl'] = 7; o['name'] = '老羊QA'; seed['cq_ch_1'] = json.dumps(o)
    ctx, pg, errs = ctx_page(seed); pg.goto(base+'/index.html'); pg.wait_for_timeout(7000)
    pg.evaluate("closeM&&closeM()")
    tab = lambda t: (pg.click(f'#tabs button[data-t="{t}"]'), pg.wait_for_timeout(800), pg.evaluate("!document.querySelector('#modal').classList.contains('hide')&&closeM()"))
    # 战斗页
    tab('fight'); pg.wait_for_timeout(1500)
    res['fight'] = pg.evaluate(r"""(()=>{const b=document.getElementById('dsbtn'),top=document.querySelector('#cqStage .cqb .top'),v=document.getElementById('cqver');
      const br=b&&b.getBoundingClientRect();const sk=[...document.querySelectorAll('#cqStage .cqb [class*=sk], #cqStage .cqb [data-a^=sk]')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect());
      const ov=br?sk.filter(r=>!(r.right<=br.left||r.left>=br.right||r.bottom<=br.top||r.top>=br.bottom)).length:-1;
      return {dsInTop:!!(b&&top&&top.contains(b)),dsRect:br?[Math.round(br.left),Math.round(br.top),Math.round(br.width)]:null,overlapSkills:ov,cqverVisible:!!(v&&getComputedStyle(v).display!=='none'),phV:[...document.querySelectorAll('.cq-ph-v')].some(e=>getComputedStyle(e).display!=='none')}})()""")
    res['fight']['tiny'] = pg.evaluate(TINY); pg.screenshot(path=f'{B.ART}/v_{bname}_fight.png')
    # 背包 / 技能 / 其他页
    for t in ['hero','skill','bag','shop','map']:
        tab(t); txt = pg.evaluate("document.querySelector('#panel').innerText")
        res[t] = {'d2': sorted(set(re.findall(r'炼金匣|符文图鉴|符文 ?\d|符文|缩颅|法球', txt))), 'tiny': pg.evaluate(TINY)}
        if t=='bag': res[t]['potPanel'] = pg.evaluate("!!document.querySelector('#panel .cqpot')")
        if t=='map': res[t]['questPanel'] = pg.evaluate("!!document.querySelector('#panel .cqmq')")
        pg.screenshot(path=f'{B.ART}/v_{bname}_{t}.png', full_page=True)
    # 设置弹窗
    pg.evaluate("closeM();setUI()"); pg.wait_for_timeout(800)
    res['settings'] = {'rows': pg.evaluate(ROWS, '#setM .btns'), 'ver': pg.evaluate("(document.querySelector('#setM .cqverrow')||{}).innerText||''"), 'tiny': pg.evaluate(TINY)}
    pg.screenshot(path=f'{B.ART}/v_{bname}_settings.png')
    # 装备详情（已穿武器）
    pg.evaluate("closeM();showItem(S.eq.weapon.uid,'eq')"); pg.wait_for_timeout(600)
    res['itemDetail'] = {'rows': pg.evaluate(ROWS, '#modal .ipanel .btns'), 'tiny': pg.evaluate(TINY),
       'cqverOverEnh': pg.evaluate("(()=>{const v=document.getElementById('cqver');const b=[...document.querySelectorAll('#modal button')].find(x=>/强化/.test(x.textContent));if(!v||!b||getComputedStyle(v).display==='none')return false;const a=v.getBoundingClientRect(),c=b.getBoundingClientRect();return !(a.right<=c.left||a.left>=c.right||a.bottom<=c.top||a.top>=c.bottom)})()")}
    pg.screenshot(path=f'{B.ART}/v_{bname}_item.png')
    res['pageerror'] = errs; ctx.close(); br.close(); return res
def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ref', default=''); ap.add_argument('--browsers', default='chromium,webkit'); a = ap.parse_args()
    B.ART = os.path.join(B.REPO, 'test-artifacts', (a.ref or 'worktree') + '_m1v'); os.makedirs(B.ART, exist_ok=True)
    if a.ref:
        B.ROOT = tempfile.mkdtemp(prefix='cq_v_'); data = subprocess.run(['git','-C',B.REPO,'archive',a.ref],check=True,capture_output=True).stdout
        tarfile.open(fileobj=io.BytesIO(data)).extractall(B.ROOT, filter='data')
    srv, base = B.start_server(); out = {}
    with sync_playwright() as pw:
        for b in a.browsers.split(','): out[b] = run(pw, b, base)
    srv.shutdown(); p = os.path.join(B.ART, 'verify_'+a.browsers.replace(',','_')+'.json'); json.dump(out, open(p,'w'), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False, indent=1)); print('->', p)
if __name__ == '__main__': main()
