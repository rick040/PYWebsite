"""One-off: turn the Aug 2026 SEO export into content/*.json.

Not part of the build. Kept so the extraction is reproducible and reviewable.
"""
import csv, json, re, sys, unicodedata

SRC = 'docs/data/locations-live-2026-08.csv'

CITY_SLUG = {
    'Almere': 'almere', 'Amsterdam': 'amsterdam', 'Den Haag': 'den-haag',
    'Dordrecht': 'dordrecht', 'Ede': 'ede', 'Eindhoven': 'eindhoven',
    'Heerhugowaard': 'heerhugowaard', 'Nijmegen': 'nijmegen', 'Rijswijk': 'rijswijk',
    'Rotterdam': 'rotterdam', 'Schiedam': 'schiedam', 'Tilburg': 'tilburg',
    'Utrecht': 'utrecht', 'Zoetermeer': 'zoetermeer',
}

OVERRIDE = {
    'parkingyou-p-r-schiedam-centrum': 'p-r-centrum',
    'parkingyou-pathe-ede-': 'pathe',
    'parkingyou-stationsweg-ypenburg': 'stationsweg-ypenburg',
    'parking-heerhugowaard-p1-zuidtangent-': 'p1-zuidtangent',
    'parking-dll-garage-centrum': 'dll-garage',
    'parking-dll-parkeerdek-centrum': 'dll-parkeerdek',
    'amsterdam-parking-b2': 'b-amsterdam-b2',
    'parking-b-amsterdam-b1': 'b-amsterdam-b1',
}

def new_slug(live):
    if live in OVERRIDE:
        return OVERRIDE[live]
    return re.sub(r'^parking-', '', re.sub(r'^parkingyou-', '', live)).strip('-')

def slugify(v):
    v = unicodedata.normalize('NFD', v.lower())
    v = ''.join(c for c in v if unicodedata.category(c) != 'Mn')
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', v))

def common_prefix(a, b):
    n = 0
    while n < len(a) and n < len(b) and a[n] == b[n]:
        n += 1
    return a[:n]

def sections(body, h2s):
    """Recover the H2 sections.

    The Drive export flattened newlines, so section breaks are unreliable. What
    is reliable: the H2 column holds the headings concatenated in order, and
    every heading appears verbatim in the body. So walk both together, taking at
    each step the longest prefix of the remaining H2 string that still occurs in
    the body after the cursor. A longer prefix would have to span into the next
    heading, which cannot appear in the body without its section text first.
    """
    body = body.strip()
    rest = h2s.strip()
    marks = []          # (start, end) of each heading inside body
    cursor = 0
    while rest:
        words = rest.split(' ')
        found = None
        for n in range(len(words), 0, -1):
            candidate = ' '.join(words[:n])
            at = body.find(candidate, cursor)
            if at != -1:
                found = (candidate, at)
                break
        if found is None:
            break
        candidate, at = found
        marks.append((at, at + len(candidate), candidate))
        cursor = at + len(candidate)
        rest = rest[len(candidate):].strip()

    out = []
    for i, (start, end, heading) in enumerate(marks):
        stop = marks[i + 1][0] if i + 1 < len(marks) else len(body)
        text = body[end:stop].strip()
        paragraphs = [p.strip() for p in re.split(r'\s{2,}', text) if p.strip()] or [text]
        tone = 'warning' if heading.lower().startswith('let op') else 'default'
        out.append({'heading': heading, 'tone': tone, 'paragraphs': paragraphs})
    return out, rest

def faqs(cell):
    pairs = re.findall(r'V:\s*(.*?)\s*A:\s*(.*?)(?=\s{2,}V:|\s*$)', cell, re.S)
    return [(q.strip(), a.strip()) for q, a in pairs if q.strip() and a.strip()]

rows = list(csv.DictReader(open(SRC, encoding='utf-8')))
assert len(rows) == 46, len(rows)

cities, locations, faq_records = {}, [], []
leftovers = []

for r in rows:
    stad = r['Stad']
    city_slug = CITY_SLUG[stad]
    city_id = 'city-' + city_slug
    cities.setdefault(city_id, {'name': stad, 'slug': city_slug, 'count': 0})
    cities[city_id]['count'] += 1

    live = r['URL'].rsplit('/', 2)[-2]
    slug = new_slug(live)
    loc_id = 'loc-' + slug
    body, rest = sections(r['Bodytekst ( = H2)'], r['H2-structuur'])
    if rest:
        leftovers.append((r['Locatie'], rest[:70]))

    ids = []
    for i, (q, a) in enumerate(faqs(r["FAQ's (voor FAQPage-schema)"]), 1):
        fid = f'faq-{slug}-{i}'
        faq_records.append({
            'id': fid, 'question': q, 'answer': a,
            'category': 'overig', 'showOnGeneralFaq': False, 'published': True,
        })
        ids.append(fid)

    alt1 = r['Alt-tekst foto 1'].strip() or f'Parkeergarage {r["Locatie"]}'
    alt2 = r['Alt-tekst foto 2'].strip() or alt1
    control = r['Let op / te controleren'].strip()

    locations.append({
        'id': loc_id,
        'name': r['Locatie'],
        'slug': slug,
        'cityId': city_id,
        'h1': r['Nieuwe H1'].strip(),
        'shortDescription': r['Nieuwe meta description'].strip(),
        'body': body,
        'address': {
            'street': '{{TODO-NL: straatnaam overnemen van de oude locatiepagina}}',
            'houseNumber': '{{TODO-NL: huisnummer}}',
            'postalCode': '{{TODO-NL: postcode}}',
            'city': stad,
        },
        'photos': [
            {'src': f'/images/locations/{slug}-1.jpg', 'alt': alt1,
             'width': 1600, 'height': 1000, 'placeholder': True},
            {'src': f'/images/locations/{slug}-2.jpg', 'alt': alt2,
             'width': 1600, 'height': 1000, 'placeholder': True},
        ],
        'tariffs': [],
        'bookingUrl': 'https://reserveren.parkingyou.nl/',
        'subscriptionOnly': False,
        'faqIds': ids,
        'seo': {
            'title': r['Nieuwe title tag'].strip(),
            'description': r['Nieuwe meta description'].strip(),
        },
        'published': True,
        'aeroparkerCarParkId': int(r['ID']),
        'sync': {
            'status': 'ok',
            'syncedAt': '2026-09-12T03:00:00.000Z',
            'lowestPriceCents': None,
        },
        '_control': control,
    })

json.dump({'cities': cities, 'locations': locations, 'faqs': faq_records},
          open('/tmp/claude-0/-home-user-PYWebsite/2a8abcf2-4802-52ee-8cf6-e1da1b1baf08/scratchpad/extracted.json', 'w'),
          ensure_ascii=False, indent=1)

print('cities', len(cities), 'locations', len(locations), 'faqs', len(faq_records))
print('sections per location: min %d max %d' % (min(len(l['body']) for l in locations),
                                                max(len(l['body']) for l in locations)))
print('locations with 0 sections:', [l['name'] for l in locations if not l['body']])
print('unconsumed H2 leftovers:', len(leftovers))
for n, t in leftovers[:5]:
    print('   ', n, '->', t)
