#!/usr/bin/env python3
"""老羊传奇 基线回归（Playwright，Python）。不改游戏代码；云端（Supabase）全部用 route 拦截模拟，不连真实后端写数据。

用法（仓库根目录）：
  python3 tests/pw_baseline.py                       # WebKit+Chromium × 390x844/375x667
  python3 tests/pw_baseline.py --browsers webkit --viewports 390x844
  python3 tests/pw_baseline.py --ref bc1ae07          # 测指定提交的干净快照（工作区有他人未提交改动时用）
产物：test-artifacts/<ref|worktree>/<browser>_<vw>x<vh>/*.png 与 test-artifacts/<ref|worktree>/report.json；退出码 0=无新问题，1=有新问题。
"""
import argparse, json, os, re, socket, subprocess, sys, time, threading, functools, http.server
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = REPO  # 被测站点根目录；--ref 时为 git archive 导出的干净快照
ART = os.path.join(REPO, 'test-artifacts')
VERSION = 'cq-20261021a'  # 默认值；main() 会改为被测快照 sw.js 里的 V
# 已知缺失素材（M0 基线 17 张）
KNOWN_404 = sorted([
 'assets/bg/moor.png','assets/bg/cave.png','assets/bg/graveyard.png','assets/bg/forest.png','assets/bg/ruined_village.png',
 'assets/bg/tower.png','assets/bg/monastery.png','assets/bg/jail.png','assets/bg/cathedral.png','assets/bg/catacomb.png',
 'assets/icon/skills_summon.png','assets/icon/skills_bone.png','assets/icon/skills_curse.png','assets/icon/items_sheet.png',
 'assets/icon/runes_gems_sheet.png','assets/ui/stone_panel.png','assets/ui/gold_frame.png'])
TABS = ['fight','hero','skill','bag','shop','map']
D2_TERMS = r'野蛮人|亡灵术士|亡灵|德鲁伊|亚马逊|荒野射手|圣骑士|刺客|符文|缩颅|法球|卡萨尔|赫拉迪克|炼金匣|战吼|暗金|\bD2\b|\b(bar|sor|nec|ama|dru|pal|ass)\b|\bb(bash|ww|mast|shout|howl)\b'

# ---------------- 本地静态服务 ----------------
def start_server():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    class Q(h.func):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f'http://127.0.0.1:{port}'

# ---------------- Supabase 模拟 ----------------
UID = '00000000-0000-4000-8000-00000000c0de'
def fake_session():
    now = int(time.time())
    import base64
    b = lambda o: base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
    tok = b({'alg':'HS256','typ':'JWT'})+'.'+b({'sub':UID,'exp':now+86400,'role':'authenticated','aud':'authenticated','email':'qa@laoyang-game.local'})+'.sig'
    user = {'id':UID,'aud':'authenticated','role':'authenticated','email':'u7161746573743031@laoyang-game.local','user_metadata':{'nickname':'测试员'},'app_metadata':{},'created_at':'2026-10-21T00:00:00Z'}
    return {'access_token':tok,'refresh_token':'rt','token_type':'bearer','expires_in':86400,'expires_at':now+86400,'user':user}

class Cloud:
    """mode: missing = cq_saves 表不存在（PGRST205）；ok = 内存表"""
    def __init__(self, mode): self.mode=mode; self.row=None; self.calls=[]
    def handle(self, route):
        req = route.request; u = urlparse(req.url); path = u.path; m = req.method
        self.calls.append(f'{m} {path}')
        J = lambda st, body, hd=None: route.fulfill(status=st, content_type='application/json', headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*',**(hd or {})}, body=json.dumps(body))
        if m == 'OPTIONS': return J(200, {})
        if path.startswith('/auth/v1/user'): return J(200, fake_session()['user'])
        if path.startswith('/auth/v1/token'): return J(200, fake_session())
        if path.startswith('/auth/v1/logout'): return route.fulfill(status=204, body='')
        obj = 'vnd.pgrst.object' in (req.headers.get('accept') or '')
        if path.endswith('/profiles'):
            r = {'nickname':'测试员','created_at':'2026-10-21T00:00:00Z'}
            return J(200, r if obj else [r])
        if path.endswith('/cq_saves'):
            if self.mode == 'missing':
                return J(404, {'code':'PGRST205','details':None,'hint':None,'message':"Could not find the table 'public.cq_saves' in the schema cache"})
            if m == 'GET':
                if self.row is None: return J(406, {'code':'PGRST116','message':'0 rows'}) if obj else J(200, [])
                return J(200, self.row if obj else [self.row])
            body = json.loads(req.post_data or '{}')
            at = body.get('updated_at') or time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
            self.row = {'data':body.get('data', (self.row or {}).get('data')),'updated_at':at,'version':body.get('version',1)}
            return J(201 if m=='POST' else 200, [{'updated_at':at,'version':self.row['version']}])
        return J(200, [])

# ---------------- 页面内检查 ----------------
JS_LAYOUT = r"""() => {
 const vw = innerWidth, vh = innerHeight, out = {vw, vh, docScrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, hscroll: [], offscreen: [], wrapRows: [], tinyText: []};
 const vis = e => { const s = getComputedStyle(e); if (s.display==='none'||s.visibility==='hidden'||+s.opacity===0) return false; const r = e.getBoundingClientRect(); return r.width>0&&r.height>0 };
 const path = e => { const p=[]; for (let n=e; n&&n!==document.body&&p.length<4; n=n.parentElement) p.unshift(n.tagName.toLowerCase()+(n.id?'#'+n.id:'')+(n.classList.length?'.'+[...n.classList].slice(0,2).join('.'):'')); return p.join('>') };
 const clipped = e => { for (let n=e.parentElement; n&&n!==document.documentElement; n=n.parentElement) { const s=getComputedStyle(n); if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) { const r=n.getBoundingClientRect(); if (r.left>=-1&&r.right<=vw+1) return true } } return false };
 if (out.docScrollW > vw + 1) out.hscroll.push({el:'document', scrollW: out.docScrollW});
 for (const e of document.querySelectorAll('body *')) {
  if (!vis(e)) continue; const s = getComputedStyle(e);
  if (/(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 2 && e.tagName!=='CANVAS') out.hscroll.push({el: path(e), scrollW: e.scrollWidth, clientW: e.clientWidth});
  const r = e.getBoundingClientRect();
  if ((r.right > vw + 1 || r.left < -1) && s.position!=='fixed' && !clipped(e) && e.tagName!=='CANVAS') out.offscreen.push({el: path(e), left: Math.round(r.left), right: Math.round(r.right), text: (e.innerText||'').trim().slice(0,30)});
  if (/\b(btns|stabs)\b/.test(e.className) || e.id==='tabs' || e.id==='pots') {
   const bs = [...e.children].filter(c => c.tagName==='BUTTON' && vis(c)); const tops = new Set(bs.map(b => Math.round(b.getBoundingClientRect().top)));
   if (tops.size > 1) out.wrapRows.push({el: path(e), rows: tops.size, buttons: bs.map(b=>b.innerText.trim().slice(0,8))});
   for (const b of bs) if (b.scrollHeight > b.clientHeight + 2 || (getComputedStyle(b).whiteSpace!=='nowrap' && b.getClientRects().length && b.innerText.includes('\n'))) {}
  }
  const own = [...e.childNodes].some(n => n.nodeType===3 && n.textContent.trim());
  if (own) { const fs = parseFloat(s.fontSize); if (fs > 0 && fs < 11) out.tinyText.push({el: path(e), fontSize: fs, text: [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').slice(0,24)}) }
 }
 const dedup = a => { const m = new Map(); for (const x of a) { const k = x.el+'|'+(x.fontSize||''); if (!m.has(k)) m.set(k, {...x, n:1}); else m.get(k).n++ } return [...m.values()] };
 out.offscreen = dedup(out.offscreen).slice(0,40); out.tinyText = dedup(out.tinyText).slice(0,60); out.hscroll = dedup(out.hscroll);
 return out }"""

JS_BACKDROP = r"""() => { const m = document.querySelector('#modal'); if (!m || m.classList.contains('hide')) return null;
 for (let y = 2; y < innerHeight; y += 6) for (const x of [2, innerWidth/2, innerWidth-3]) { const e = document.elementFromPoint(x, y); if (e && e.id === 'modal') return [x, y] } return 'none' }"""

def classes_d2_scan():
    hits = []
    with open(os.path.join(ROOT, 'classes.js'), encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            ms = sorted(set(m.group(0) for m in re.finditer(D2_TERMS, line)))
            if ms: hits.append({'line': i, 'terms': ms, 'text': line.strip()[:160]})
    return hits

# ---------------- 单个 浏览器×视口 ----------------
def run_combo(pw, bname, vw, vh, base):
    tag = f'{bname}_{vw}x{vh}'; d = os.path.join(ART, tag); os.makedirs(d, exist_ok=True)
    res = {'combo': tag, 'scenarios': {}}
    browser = getattr(pw, bname).launch()
    def ctx_page(cloud, seed=None):
        ctx = browser.new_context(viewport={'width':vw,'height':vh}, device_scale_factor=2, is_mobile=(bname=='chromium'), has_touch=True, locale='zh-CN', service_workers='block')
        if cloud: ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'), cloud.handle)
        if seed: ctx.add_init_script('(()=>{if(sessionStorage.getItem("__seeded"))return;sessionStorage.setItem("__seeded","1");const s=%s;for(const k in s)localStorage.setItem(k,s[k])})()' % json.dumps(seed))
        pg = ctx.new_page(); log = {'console': [], 'pageerror': [], 'http4xx': [], 'reqfail': []}
        pg.on('console', lambda m: m.type in ('error','warning') and log['console'].append(f'[{m.type}] {m.text[:300]}'))
        pg.on('pageerror', lambda e: log['pageerror'].append(str(e)[:400]))
        pg.on('response', lambda r: r.status >= 400 and 'supabase.co' not in r.url and log['http4xx'].append([r.status, r.url.replace(base+'/', '').split('?')[0]]))
        pg.on('requestfailed', lambda r: log['reqfail'].append([r.url[:160], r.failure]))
        return ctx, pg, log
    def finish(name, ctx, log, extra):
        log['console'] = [c for c in log['console'] if '404 (File not found)' not in c and 'Service Worker registration blocked by Playwright' not in c]
        if name == 'S2_cloud_table_missing':  # 已知：云表未建，supabase 404 不算新 bug
            log['knownCloud404'] = [c for c in log['console'] if '404 (Not Found)' in c]; log['console'] = [c for c in log['console'] if '404 (Not Found)' not in c]
        # 刷新时 pagehide 信标 fetch(keepalive) 被 WebKit 的 route 拦截判为跨域失败：测试桩噪声，单独记录
        log['beaconNoise'] = [e for e in log['pageerror'] if 'supabase.co' in e and 'access control' in e]
        log['pageerror'] = [e for e in log['pageerror'] if e not in log['beaconNoise']]
        res['scenarios'][name] = {**log, **extra}; ctx.close()
    sess = json.dumps(fake_session())

    # S1 冷启动未登录：加载、404、登录框是否可被空白处关闭（设计上不可关）
    ctx, pg, log = ctx_page(Cloud('ok'))
    pg.goto(base + '/index.html', wait_until='load'); pg.wait_for_timeout(3500)
    ex = {'title': pg.title(), 'modal': pg.evaluate("document.querySelector('#modal .mtitle')?.innerText||''"),
          'assetVersion': pg.evaluate("[...document.querySelectorAll('script[src],link[href]')].map(e=>(e.src||e.href)).filter(u=>u.includes(location.host)&&!u.includes('v=%s')&&/\\.(js|css)/.test(u)).map(u=>u.split('/').pop())" % VERSION)}
    pg.screenshot(path=f'{d}/01_cold_login.png')
    bd = pg.evaluate(JS_BACKDROP)
    if isinstance(bd, list): pg.mouse.click(*bd); pg.wait_for_timeout(300)
    ex['loginStillOpenAfterBackdrop'] = pg.evaluate("!document.querySelector('#modal').classList.contains('hide')")
    ex['layout'] = pg.evaluate(JS_LAYOUT)
    finish('S1_cold_load', ctx, log, ex)

    # S2 已登录但云存档表不存在：是否报错 / 卡死
    cl = Cloud('missing'); ctx, pg, log = ctx_page(cl, {'cq_sb_auth': sess})
    pg.goto(base + '/index.html'); pg.wait_for_timeout(9000)
    ex = {'modal': pg.evaluate("document.querySelector('#modal:not(.hide)')?.innerText.slice(0,200)||''"), 'CL_ERR': pg.evaluate('typeof CL_ERR!=="undefined"?CL_ERR:null'),
          'clReady': pg.evaluate('!!CL.ready'), 'saveCalls': [c for c in cl.calls if 'cq_saves' in c]}
    t0 = time.time(); pg.evaluate('1+1'); ex['mainThreadMs'] = round((time.time()-t0)*1000)
    ex['retryBtn'] = pg.locator('#modal button:has-text("立即重试")').count()
    pg.screenshot(path=f'{d}/02_cloud_table_missing.png')
    finish('S2_cloud_table_missing', ctx, log, ex)

    # S3 已登录 + 模拟云表正常 + 旧 localStorage 存档（cq_ 前缀）迁移 + 各页签界面检查
    cl = Cloud('ok')
    legacy = {'cq_sb_auth': sess, 'cq_pwr': json.dumps({'eco':1,'m':1}), 'cq_bonus_open': '1',
              'cq_acct': json.dumps({'v':1,'cur':1,'nid':2,'suid':1e9,'chars':[{'id':1,'name':'老羊QA','cls':'战士','lvl':7,'t':0}],'shared':[]}),
              'cq_ch_1': None, 'cq-wrong-prefix': 'x'}
    ctx, pg, log = ctx_page(cl, None)
    # 先拿一份游戏自己导出的角色存档结构作为旧存档内容
    pg.goto(base + '/index.html'); pg.wait_for_timeout(4000)
    chraw = pg.evaluate("(()=>{try{save()}catch(e){};return GS.getItem(CH_PRE+(ACCT&&ACCT.cur||1))})()")
    ex = {'nsBeforeLogin': pg.evaluate("typeof CH_PRE!=='undefined'?CH_PRE:null")}
    if chraw:
        o = json.loads(chraw); o['lvl'] = 7; o['name'] = '老羊QA'; legacy['cq_ch_1'] = json.dumps(o)
    else: legacy.pop('cq_ch_1')
    ctx.close()
    ctx, pg, log = ctx_page(cl, legacy)
    pg.goto(base + '/index.html'); pg.wait_for_timeout(7000)
    ex.update({'clReady': pg.evaluate('!!CL.ready'), 'modalAfterBoot': pg.evaluate("document.querySelector('#modal:not(.hide)')?.innerText.slice(0,120)||''"),
               'charAfterMigrate': pg.evaluate("ACCT?ACCT.chars.map(c=>c.name+':'+c.cls+':Lv'+(S&&S.lvl)):null"),
               'lsKeysAfterBoot': pg.evaluate('Object.keys(localStorage)'), 'cloudRowSaved': cl.row is not None})
    pg.screenshot(path=f'{d}/03_after_login_migrate.png')
    # 关闭可能存在的弹窗（离线收益等）
    if pg.evaluate("!document.querySelector('#modal').classList.contains('hide')"):
        bd = pg.evaluate(JS_BACKDROP); ex['bootModalBackdrop'] = bd
        if isinstance(bd, list): pg.mouse.click(*bd); pg.wait_for_timeout(300)
        if pg.evaluate("!document.querySelector('#modal').classList.contains('hide')"): pg.evaluate('closeM()')
    # 写 localStorage → 刷新 → 读回
    pg.evaluate("localStorage.setItem('cq_qa_probe','v1')")
    lvl_before = pg.evaluate('S.lvl'); gold_before = pg.evaluate('S.gold=12345,save(),S.gold')
    pg.evaluate('flushNow&&flushNow()'); pg.wait_for_timeout(1500)
    pg.reload(); pg.wait_for_timeout(7000)
    ex['persist'] = {'lsProbe': pg.evaluate("localStorage.getItem('cq_qa_probe')"), 'cq_pwr': pg.evaluate("localStorage.getItem('cq_pwr')"),
                     'cq_sb_auth_present': pg.evaluate("!!localStorage.getItem('cq_sb_auth')"), 'goldBefore': gold_before,
                     'goldAfterReload': pg.evaluate('S&&S.gold'), 'lvlBefore': lvl_before, 'lvlAfter': pg.evaluate('S&&S.lvl'),
                     'lsKeys': pg.evaluate('Object.keys(localStorage)')}
    ex['persist']['nonCqKeys'] = [k for k in ex['persist']['lsKeys'] if not k.startswith('cq_') and k != 'cq-wrong-prefix']  # cq-wrong-prefix 为测试哨兵
    ex['persist']['hyphenCqKeys'] = [k for k in ex['persist']['lsKeys'] if k.startswith('cq-')]
    if pg.evaluate("!document.querySelector('#modal').classList.contains('hide')"): pg.evaluate('closeM()')
    ex['swVersion'] = open(os.path.join(ROOT,'sw.js'),encoding='utf-8').read().count(VERSION)
    tabs = {}
    for t in TABS:
        b = pg.locator(f'#tabs button[data-t="{t}"]')
        if not b.count(): tabs[t] = {'missing': True}; continue
        b.click(); pg.wait_for_timeout(700)
        if pg.evaluate("!document.querySelector('#modal').classList.contains('hide')"): pg.evaluate('closeM()')
        pg.screenshot(path=f'{d}/10_tab_{t}.png', full_page=True)
        lay = pg.evaluate(JS_LAYOUT)
        lay['d2Visible'] = sorted(set(m.group(0) for m in re.finditer(D2_TERMS, pg.evaluate("document.querySelector('#app').innerText"))))
        tabs[t] = lay
    ex['tabs'] = tabs
    # 弹窗：点空白处关闭
    modals = {}
    for name, js in [('charUI', 'charUI()'), ('quest', "window.questUI&&questUI()"), ('cube', "typeof cubeUI==='function'&&cubeUI()"), ('settings', "window.setUI?setUI():(window.settingsUI&&settingsUI())"),
                     ('bagItem', "(TAB!=='bag'&&document.querySelector('#tabs [data-t=bag]').click(), setTimeout(()=>document.querySelector('#panel .slot.it, #panel [onclick*=\"Item\"], #panel .cell')?.click(),300))")]:
        try:
            pg.evaluate('closeM()'); pg.evaluate(js); pg.wait_for_timeout(800)
            open_ = pg.evaluate("!document.querySelector('#modal').classList.contains('hide')")
            if not open_: modals[name] = {'opened': False}; continue
            pg.screenshot(path=f'{d}/20_modal_{name}.png')
            lay = pg.evaluate(JS_LAYOUT); bd = pg.evaluate(JS_BACKDROP)
            if isinstance(bd, list): pg.mouse.click(*bd); pg.wait_for_timeout(300)
            modals[name] = {'opened': True, 'backdropPoint': bd, 'closedByBackdrop': pg.evaluate("document.querySelector('#modal').classList.contains('hide')"),
                            'wrapRows': lay['wrapRows'], 'offscreen': lay['offscreen'], 'tinyText': lay['tinyText'][:15]}
        except Exception as e: modals[name] = {'error': str(e)[:200]}
    ex['modals'] = modals
    ex['cloudCalls'] = sorted(set(cl.calls))
    finish('S3_logged_in', ctx, log, ex)
    browser.close()
    return res

def summarize(all_res, d2):
    issues = []
    for r in all_res:
        for sn, s in r['scenarios'].items():
            got = sorted(set(u for st, u in s['http4xx'] if st == 404))
            new = [u for u in got if u not in KNOWN_404]
            if new: issues.append((r['combo'], sn, '新增404', new))
            if s['pageerror']: issues.append((r['combo'], sn, '未捕获异常', s['pageerror']))
            if s['console']: issues.append((r['combo'], sn, '控制台error/warning', s['console'][:10]))
            r.setdefault('known404', {})[sn] = {'count': len(got), 'missingFromKnown': [u for u in KNOWN_404 if u not in got and sn=='S1_cold_load']}
    return issues

def main():
    global ROOT, ART
    ap = argparse.ArgumentParser(); ap.add_argument('--browsers', default='webkit,chromium'); ap.add_argument('--viewports', default='390x844,375x667')
    ap.add_argument('--ref', default='', help='git 提交；为空则测当前工作区')
    a = ap.parse_args(); os.makedirs(ART, exist_ok=True)
    ART = os.path.join(REPO, 'test-artifacts', a.ref or 'worktree'); os.makedirs(ART, exist_ok=True)
    if a.ref:
        import tempfile, tarfile, io
        ROOT = tempfile.mkdtemp(prefix='cq_ref_')
        data = subprocess.run(['git', '-C', REPO, 'archive', a.ref], check=True, capture_output=True).stdout
        tarfile.open(fileobj=io.BytesIO(data)).extractall(ROOT, filter="data")
        pass
    try: VERSION_ = re.search(r"V='(cq-[0-9a-z]+)'", open(os.path.join(ROOT,'sw.js'),encoding='utf-8').read()).group(1); globals()['VERSION'] = VERSION_
    except Exception: pass
    if a.ref:
        print('测试快照', a.ref, subprocess.run(['git','-C',REPO,'rev-parse','--short',a.ref],capture_output=True,text=True).stdout.strip(), '->', ROOT)
    srv, base = start_server(); out = []
    with sync_playwright() as pw:
        for b in a.browsers.split(','):
            for v in a.viewports.split(','):
                w, h = map(int, v.split('x')); print(f'== {b} {w}x{h}', flush=True)
                try: out.append(run_combo(pw, b, w, h, base))
                except Exception as e: out.append({'combo': f'{b}_{w}x{h}', 'fatal': str(e)[:500]}); print('FATAL', e)
    srv.shutdown()
    d2 = classes_d2_scan(); issues = summarize([r for r in out if 'scenarios' in r], d2)
    rep = {'ref': a.ref or 'WORKTREE', 'version': VERSION, 'known404': KNOWN_404, 'classes_d2_residue': d2, 'results': out, 'issues': issues}
    with open(os.path.join(ART, 'report.json'), 'w', encoding='utf-8') as f: json.dump(rep, f, ensure_ascii=False, indent=1)
    print(f'classes.js D2 残留 {len(d2)} 行；问题 {len(issues)} 条；报告 {ART}/report.json')
    for i in issues: print(' -', i[0], i[1], i[2], str(i[3])[:200])
    sys.exit(1 if issues or any('fatal' in r for r in out) else 0)

if __name__ == '__main__': main()
