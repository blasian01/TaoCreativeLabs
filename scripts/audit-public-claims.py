"""Review actual portfolio HTML against bounded public-claims controls."""
from html.parser import HTMLParser
from pathlib import Path
import json

class VisiblePage(HTMLParser):
    def __init__(self):
        super().__init__(); self.hidden = 0; self.text = []; self.links = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
        if tag == 'a': self.links.append(dict(attrs).get('href', ''))
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hidden -= 1
    def handle_data(self, data):
        if not self.hidden: self.text.append(data)

results = []
for name in ['index', 'products']:
    p = VisiblePage(); p.feed((Path('.next/server/app') / (name + '.html')).read_text())
    text = ' '.join(' '.join(p.text).split()); errors = []
    for forbidden in ['nutritional analysis', 'weekly meal planning', 'weather-aware recommendations',
                      'body model generation', 'Run language models entirely on-device',
                      'fully managed, premium AI platforms', 'Shared authentication, billing']:
        if forbidden in text: errors.append('unsupported claim: ' + forbidden)
    for needed in ['Previews do not guarantee sizing or fit.', 'Processing depends on the selected mode',
                   'LucidDreamz', 'availability are being reviewed', 'Glyph by Fortaify']:
        if needed not in text: errors.append('missing qualifier: ' + needed)
    if any('luciddreamz.app' in url for url in p.links): errors.append('unavailable destination still has launch link')
    if not any(url == 'https://www.agenticmedia.app/' for url in p.links): errors.append('web product link missing')
    results.append({'page': name, 'errors': errors})
print(json.dumps(results, indent=2)); raise SystemExit(any(r['errors'] for r in results))
