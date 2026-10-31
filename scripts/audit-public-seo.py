"""Audit actual raw HTML files; no browser, customer data or network required."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals, self.meta, self.schemas, self.headings = [], {}, [], []
        self.schema = None
        self.h1 = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and a.get('rel') == 'canonical': self.canonicals.append(a.get('href'))
        if tag == 'meta': self.meta[a.get('property', a.get('name'))] = a.get('content')
        if tag == 'script' and a.get('type') == 'application/ld+json': self.schema = ''
        if tag == 'h1': self.h1 = ''
    def handle_data(self, data):
        if self.schema is not None: self.schema += data
        if self.h1 is not None: self.h1 += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.schema is not None:
            self.schemas.append(json.loads(self.schema)); self.schema = None
        if tag == 'h1' and self.h1 is not None:
            self.headings.append(self.h1); self.h1 = None

def audit(file, route):
    p = Page(); p.feed(Path(file).read_text())
    expected = 'https://www.taocreativelabs.com' + ('' if route == '/' else route)
    errors = []
    if p.canonicals != [expected]: errors.append('canonical must identify this canonical www page')
    if p.meta.get('og:url') != expected: errors.append('OG URL must identify this page')
    if not p.meta.get('description'): errors.append('missing description')
    if len(p.headings) != 1 or not p.headings[0].strip(): errors.append('require one descriptive H1')
    for group in p.schemas:
        for node in group if isinstance(group, list) else [group]:
            if node.get('@type') == 'ItemList' and node.get('numberOfItems') != len(node.get('itemListElement', [])):
                errors.append('structured catalogue count contradicts its entries')
    return {'file': str(file), 'route': route, 'errors': errors}

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('file'); ap.add_argument('--route', default='/')
    args = ap.parse_args(); result = audit(args.file, args.route)
    print(json.dumps(result, indent=2)); raise SystemExit(bool(result['errors']))
