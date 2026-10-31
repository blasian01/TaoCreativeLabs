"""Check the completed public build; run after npm run build."""
from pathlib import Path
import subprocess
import sys
import json
import xml.etree.ElementTree as ET

routes = ['/', '/products', '/solutions', '/consulting', '/about', '/contact', '/privacy', '/terms']
for route in routes:
    file = Path('.next/server/app') / ('index.html' if route == '/' else route[1:] + '.html')
    subprocess.run([sys.executable, 'scripts/audit-public-seo.py', str(file), '--route', route], check=True)
subprocess.run([sys.executable, 'scripts/audit-public-claims.py'], check=True)
sitemap = Path('.next/server/app/sitemap.xml.body').read_text()
urls = [x.text for x in ET.fromstring(sitemap).iter() if x.tag.endswith('}loc')]
assert len(urls) == len(routes) and all(x.startswith('https://www.taocreativelabs.com') for x in urls)
assert '<lastmod>' not in sitemap
for file in ['public/llms.txt', 'public/llms-full.txt']:
    text = Path(file).read_text()
    assert 'Shared authentication, billing' not in text and 'https://www.luciddreamz.app' not in text
    assert 'availability are being reviewed' in text and 'Previews do not guarantee sizing or fit.' in text
print(json.dumps({'publicPages': len(routes), 'sitemapCanonicalURLs': len(urls), 'claimsAndOptionalText': 'pass'}))
