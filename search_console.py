import json
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SITE_URL = 'https://agatha-mistery.com/'

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(SCRIPT_DIR, 'token.json')
CLIENT_SECRET_FILE = os.path.join(SCRIPT_DIR, 'client_secret.json')

if os.path.exists(TOKEN_FILE):
    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
else:
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
    creds = flow.run_local_server(port=0)
    with open(TOKEN_FILE, 'w') as f:
        f.write(creds.to_json())

service = build('searchconsole', 'v1', credentials=creds)

START = '2026-01-01'
END   = '2026-03-31'

# 1. Данные по датам (для линейного графика)
r_dates = service.searchanalytics().query(siteUrl=SITE_URL, body={
    'startDate': START, 'endDate': END,
    'dimensions': ['date'], 'rowLimit': 90
}).execute()

# 2. Страны
r_countries = service.searchanalytics().query(siteUrl=SITE_URL, body={
    'startDate': START, 'endDate': END,
    'dimensions': ['country'], 'rowLimit': 20
}).execute()

# 3. Запросы
r_queries = service.searchanalytics().query(siteUrl=SITE_URL, body={
    'startDate': START, 'endDate': END,
    'dimensions': ['query'], 'rowLimit': 10
}).execute()

# Суммарные метрики
total_clicks = sum(r['clicks'] for r in r_dates.get('rows', []))
total_impressions = sum(r['impressions'] for r in r_dates.get('rows', []))
avg_ctr = (total_clicks / total_impressions * 100) if total_impressions else 0
avg_pos = (sum(r['position'] for r in r_dates.get('rows', [])) / len(r_dates.get('rows', [1]))) if r_dates.get('rows') else 0

# Данные для графика
date_rows = r_dates.get('rows', [])
dates_js   = json.dumps([r['keys'][0] for r in date_rows])
clicks_js  = json.dumps([r['clicks'] for r in date_rows])
impress_js = json.dumps([r['impressions'] for r in date_rows])

# Страны
FLAG_MAP = {
    'rus':'🇷🇺','ukr':'🇺🇦','srb':'🇷🇸','blr':'🇧🇾','bra':'🇧🇷',
    'can':'🇨🇦','deu':'🇩🇪','egy':'🇪🇬','fin':'🇫🇮','gbr':'🇬🇧',
    'hun':'🇭🇺','kaz':'🇰🇿','nld':'🇳🇱','tcd':'🇹🇩','usa':'🇺🇸',
    'fra':'🇫🇷','ita':'🇮🇹','esp':'🇪🇸','pol':'🇵🇱','cze':'🇨🇿',
}
NAME_MAP = {
    'rus':'Россия','ukr':'Украина','srb':'Сербия','blr':'Беларусь','bra':'Бразилия',
    'can':'Канада','deu':'Германия','egy':'Египет','fin':'Финляндия','gbr':'Великобритания',
    'hun':'Венгрия','kaz':'Казахстан','nld':'Нидерланды','tcd':'Чад','usa':'США',
    'fra':'Франция','ita':'Италия','esp':'Испания','pol':'Польша','cze':'Чехия',
}

country_rows = sorted(r_countries.get('rows', []), key=lambda x: x['impressions'], reverse=True)
max_imp = max((r['impressions'] for r in country_rows), default=1)

country_html = ''
for r in country_rows:
    code = r['keys'][0].lower()
    name = NAME_MAP.get(code, code.upper())
    flag = FLAG_MAP.get(code, '🌍')
    imp = r['impressions']
    clk = r['clicks']
    pct = int(imp / max_imp * 100)
    country_html += f'''
    <tr>
      <td><span class="flag">{flag}</span> {name}</td>
      <td>{clk}</td>
      <td>
        <div class="mini-bar-wrap"><div class="mini-bar" style="width:{pct}%"></div></div>
      </td>
      <td>{imp}</td>
    </tr>'''

# Запросы
query_rows = r_queries.get('rows', [])
query_html = ''
for r in query_rows:
    query_html += f'''
    <tr>
      <td>{r['keys'][0]}</td>
      <td>{r['clicks']}</td>
      <td>{r['impressions']}</td>
      <td>{r['ctr']*100:.1f}%</td>
      <td>{r['position']:.1f}</td>
    </tr>'''

html = f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Agatha — Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Google Sans', 'Segoe UI', sans-serif; background: #1a1f36; color: #e2e8f0; }}

  .header {{ background: #1e2440; padding: 16px 32px; border-bottom: 1px solid #2d3561; display: flex; align-items: center; gap: 12px; }}
  .header-logo {{ width: 32px; height: 32px; background: linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius: 8px; }}
  .header h1 {{ font-size: 18px; color: #f1f5f9; font-weight: 500; }}
  .header span {{ font-size: 13px; color: #64748b; margin-left: 8px; }}

  .content {{ padding: 28px 32px; }}
  .page-title {{ font-size: 22px; color: #f1f5f9; margin-bottom: 20px; font-weight: 400; }}

  .metric-cards {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-bottom: 24px; border: 1px solid #2d3561; border-radius: 12px; overflow: hidden; }}
  .metric-card {{ padding: 20px 24px; background: #1e2440; border-right: 1px solid #2d3561; cursor: pointer; transition: background 0.2s; }}
  .metric-card:last-child {{ border-right: none; }}
  .metric-card.active {{ background: #252d50; border-bottom: 3px solid #3b82f6; }}
  .metric-card .label {{ font-size: 12px; color: #94a3b8; margin-bottom: 8px; display: flex; align-items: center; gap-6px; }}
  .metric-card .label input {{ margin-right: 6px; accent-color: #3b82f6; }}
  .metric-card .value {{ font-size: 28px; font-weight: 600; }}
  .metric-card:nth-child(1) .value {{ color: #60a5fa; }}
  .metric-card:nth-child(2) .value {{ color: #a78bfa; }}
  .metric-card:nth-child(3) .value {{ color: #94a3b8; }}
  .metric-card:nth-child(4) .value {{ color: #94a3b8; }}

  .chart-card {{ background: #1e2440; border: 1px solid #2d3561; border-radius: 12px; padding: 24px; margin-bottom: 24px; }}
  .chart-wrap {{ height: 220px; }}

  .tabs {{ display: flex; gap: 0; border-bottom: 1px solid #2d3561; margin-bottom: 0; }}
  .tab {{ padding: 12px 20px; font-size: 13px; color: #94a3b8; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; }}
  .tab.active {{ color: #60a5fa; border-bottom-color: #3b82f6; }}
  .tab:hover {{ color: #e2e8f0; }}

  .table-card {{ background: #1e2440; border: 1px solid #2d3561; border-radius: 12px; overflow: hidden; }}
  .tab-panel {{ display: none; }}
  .tab-panel.active {{ display: block; }}

  table {{ width: 100%; border-collapse: collapse; }}
  th {{ padding: 12px 16px; text-align: left; font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #2d3561; }}
  td {{ padding: 12px 16px; font-size: 14px; color: #cbd5e1; border-bottom: 1px solid #1a1f36; }}
  tr:last-child td {{ border-bottom: none; }}
  tr:hover td {{ background: #252d50; }}

  .flag {{ font-size: 18px; }}
  .mini-bar-wrap {{ background: #1a1f36; border-radius: 4px; height: 8px; width: 120px; }}
  .mini-bar {{ background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; border-radius: 4px; }}
</style>
</head>
<body>

<div class="header">
  <div class="header-logo"></div>
  <h1>Agatha Mystery <span>— Search Console Analytics</span></h1>
</div>

<div class="content">
  <div class="page-title">Эффективность &nbsp;<span style="font-size:14px;color:#64748b">{START} — {END}</span></div>

  <div class="metric-cards">
    <div class="metric-card active">
      <div class="label"><input type="checkbox" checked> Всего кликов</div>
      <div class="value">{total_clicks}</div>
    </div>
    <div class="metric-card active">
      <div class="label"><input type="checkbox" checked> Всего показов</div>
      <div class="value">{total_impressions}</div>
    </div>
    <div class="metric-card">
      <div class="label"><input type="checkbox"> Средний CTR</div>
      <div class="value">{avg_ctr:.1f}%</div>
    </div>
    <div class="metric-card">
      <div class="label"><input type="checkbox"> Средняя позиция</div>
      <div class="value">{avg_pos:.1f}</div>
    </div>
  </div>

  <div class="chart-card">
    <div class="chart-wrap">
      <canvas id="lineChart"></canvas>
    </div>
  </div>

  <div class="table-card">
    <div class="tabs">
      <div class="tab active" onclick="switchTab('queries',this)">Запросы</div>
      <div class="tab" onclick="switchTab('countries',this)">Страны</div>
    </div>

    <div id="tab-queries" class="tab-panel active">
      <table>
        <thead><tr><th>Запрос</th><th>Клики</th><th>Показы</th><th>CTR</th><th>Позиция</th></tr></thead>
        <tbody>{query_html if query_html else '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:24px">Нет данных</td></tr>'}</tbody>
      </table>
    </div>

    <div id="tab-countries" class="tab-panel">
      <table>
        <thead><tr><th>Страна</th><th>Клики</th><th>Показы</th><th></th></tr></thead>
        <tbody>{country_html}</tbody>
      </table>
    </div>
  </div>
</div>

<script>
const dates = {dates_js};
const clicks = {clicks_js};
const impressions = {impress_js};

const ctx = document.getElementById('lineChart').getContext('2d');
new Chart(ctx, {{
  type: 'line',
  data: {{
    labels: dates,
    datasets: [
      {{
        label: 'Клики',
        data: clicks,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
        fill: true,
        yAxisID: 'y'
      }},
      {{
        label: 'Показы',
        data: impressions,
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167,139,250,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
        fill: true,
        yAxisID: 'y1'
      }}
    ]
  }},
  options: {{
    responsive: true,
    maintainAspectRatio: false,
    interaction: {{ mode: 'index', intersect: false }},
    plugins: {{ legend: {{ labels: {{ color: '#94a3b8', font: {{ size: 12 }} }} }} }},
    scales: {{
      x: {{ ticks: {{ color: '#64748b', maxTicksLimit: 12, font: {{ size: 11 }} }}, grid: {{ color: '#2d3561' }} }},
      y: {{ position: 'left', ticks: {{ color: '#60a5fa', font: {{ size: 11 }} }}, grid: {{ color: '#2d3561' }} }},
      y1: {{ position: 'right', ticks: {{ color: '#a78bfa', font: {{ size: 11 }} }}, grid: {{ drawOnChartArea: false }} }}
    }}
  }}
}});

function switchTab(name, el) {{
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
}}
</script>
</body>
</html>'''

out = os.path.join(SCRIPT_DIR, 'analytics.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Клики: {total_clicks} | Показы: {total_impressions} | CTR: {avg_ctr:.1f}% | Позиция: {avg_pos:.1f}')
print(f'График сохранён: {out}')
