"""Run with python3 check.py. No third-party test dependencies."""
from pathlib import Path
from html.parser import HTMLParser
import json, re
root = Path(__file__).parent
class Check(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            assert attrs.get('src') == '/app.js', 'Unexpected executable source'
        for key in ('src', 'poster'):
            value = attrs.get(key, '')
            if value and not value.startswith('data:'):
                assert value.startswith('/assets/') or value == '/app.js', value
                assert (root / value.lstrip('/')).exists(), value
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            assert (root / attrs['href'].lstrip('/')).exists(), attrs['href']
for route in json.loads((root / 'routes.json').read_text()):
    path = root / route.lstrip('/') / 'index.html'
    html = path.read_text()
    if route in ('/pods', '/slotz'):
        assert 'class="workspace-blank"' in html, f'Missing blank section: {route}'
    else:
        assert '<h1' in html, f'Missing heading: {route}'
    assert 'Content-Security-Policy' in html, f'Missing network guard: {route}'
    Check().feed(html)
states = json.loads((root / 'states.json').read_text())
for label, expected in {'QR Join':'Point a phone', 'Slotz':'Share your hours', 'Polls & Insights':'Run the poll', 'Pods':'Keep the work', 'Word Clouds':'Visualise ideas', 'Presentations':'Run multi-slide'}.items():
    assert expected in states[label], f'Wrong demo content: {label}'
assert 'Versatile for every use case' not in states['hero:results']
for path in (root / 'assets').glob('*.css'):
    for url in re.findall(r'(?:url\([\'"]?|@import[\'"])([^\)\'"\s]+)', path.read_text()):
        if url.startswith(('data:', '#', '%23')): continue
        assert url.startswith('/assets/'), f'Remote CSS dependency: {url}'
        assert (root / url.lstrip('/')).exists(), url
print(f'PASS: {len(json.loads((root / "routes.json").read_text()))} pages, local assets, safe scripts, CSS dependencies and six demo panels.')

app = (root / 'app.js').read_text()
for label in ('Host', 'Home', 'Saved', 'Templates', 'Messages', 'Settings', 'Account menu'):
    assert f'aria-label="{label}"' in app, f'Missing accessible shell control: {label}'
for route in ('home', 'engage', 'intelligence-hub', 'pods', 'slotz'):
    assert (root / route / 'index.html').exists(), f'Missing section: {route}'
assert 'aria-current="page"' in app
print('PASS: workspace sections, blank placeholders, and accessible navigation controls.')

assert (root / "search/index.html").exists()
assert 'aria-label="Mobile navigation"' in app
assert 'aria-label="Profile"' in app
print("PASS: mobile navigation and search page.")
