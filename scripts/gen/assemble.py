"""One-off: assemble content/*.json from the extraction plus the hand-built
reference locations. Not part of the build.
"""
import json, re, copy

SCRATCH = '/tmp/claude-0/-home-user-PYWebsite/2a8abcf2-4802-52ee-8cf6-e1da1b1baf08/scratchpad/extracted.json'
d = json.load(open(SCRATCH, encoding='utf-8'))

# The brief forbids em dashes in Dutch copy. The source texts use them as an
# aside marker; a comma carries the same pause.
def dedash(v):
    if isinstance(v, str):
        v = re.sub(r'\s*[—–]\s*', ', ', v)
        v = re.sub(r',\s*,', ',', v)
        v = re.sub(r'\s+([,.])', r'\1', v)
        return v
    if isinstance(v, list):
        return [dedash(x) for x in v]
    if isinstance(v, dict):
        return {k: dedash(x) for k, x in v.items()}
    return v

CITY_INTRO = {
    'amsterdam': 'In Amsterdam staat ParkingYou vooral in Oost, op het Cruquius-eiland en de Zeeburgerkade, en in West aan het Bos en Lommerplantsoen. Je zet de auto hier neer en gaat met het openbaar vervoer verder de stad in.',
    'rotterdam': 'De garages van ParkingYou in Rotterdam liggen op loopafstand van de binnenstad. Op verschillende locaties geldt in het weekend en ’s nachts een lager maximumtarief.',
    'eindhoven': 'Eindhoven is de thuisbasis van ParkingYou. De garages liggen rond het centrum, op Strijp en in het stadiongebied, met op drukke dagen aparte locaties voor wedstrijden en evenementen.',
    'utrecht': 'In Utrecht staat ParkingYou aan de Vliegend Hertlaan, net buiten het centrum. Je reserveert online op kenteken en rijdt zo door.',
    'tilburg': 'In Tilburg parkeer je bij ParkingYou aan de zuidkant van het centrum, op loopafstand van de winkels.',
    'almere': 'In Almere heeft ParkingYou twee overdekte garages bij het WTC, op een paar minuten lopen van het centrum.',
    'den-haag': 'In Den Haag staat ParkingYou aan de Stationsweg in Ypenburg, handig als je de auto wilt neerzetten en met het openbaar vervoer verder wilt.',
    'dordrecht': 'In Dordrecht parkeer je bij ParkingYou in garage De Holland, op loopafstand van de historische binnenstad.',
    'ede': 'In Ede staat ParkingYou bij Pathé, handig voor een filmbezoek of een avond in het centrum.',
    'heerhugowaard': 'In Heerhugowaard heeft ParkingYou twee locaties bij Middenwaard, op loopafstand van de winkels.',
    'nijmegen': 'In Nijmegen parkeer je bij ParkingYou aan de Lentse Plas, aan de noordkant van de stad.',
    'rijswijk': 'In Rijswijk staat ParkingYou bij At the Park, op loopafstand van de kantoren in de omgeving.',
    'schiedam': 'In Schiedam heeft ParkingYou een P+R bij Schiedam Centrum: je zet de auto neer en reist met de metro door naar Rotterdam.',
    'zoetermeer': 'Zoetermeer is de stad met de meeste ParkingYou-locaties buiten Eindhoven. De garages liggen verspreid rond het Stadshart en het Woonhart.',
}

# Standard public city-centre coordinates. Used only to centre a map, never as
# business data; a location's own coordinates come from Aeroparker in Phase 3.
CITY_POINT = {
    'amsterdam': (52.3676, 4.9041), 'rotterdam': (51.9225, 4.4792),
    'eindhoven': (51.4416, 5.4697), 'utrecht': (52.0907, 5.1214),
    'tilburg': (51.5555, 5.0913), 'almere': (52.3508, 5.2647),
    'den-haag': (52.0705, 4.3007), 'dordrecht': (51.8133, 4.6901),
    'ede': (52.0402, 5.6649), 'heerhugowaard': (52.6700, 4.8300),
    'nijmegen': (51.8126, 5.8372), 'rijswijk': (52.0365, 4.3247),
    'schiedam': (51.9194, 4.3889), 'zoetermeer': (52.0575, 4.4931),
}

GENERAL_FAQS = [
    {'id': 'faq-reserveren-kenteken',
     'question': 'Hoe werkt reserveren op kenteken?',
     'answer': 'Je reserveert online en vult je kenteken in. Bij aankomst herkent de camera je kenteken en gaat de slagboom open. Je hoeft geen ticket te trekken en niets uit te printen.',
     'category': 'reserveren', 'showOnGeneralFaq': True, 'published': True},
    {'id': 'faq-goedkoper-reserveren',
     'question': 'Is reserveren goedkoper dan betalen bij de slagboom?',
     'answer': 'Ja. Op vrijwel al onze locaties is een gereserveerde dagkaart goedkoper dan het losse dagtarief, en wie ruim vooraf boekt betaalt het minst.',
     'category': 'betalen', 'showOnGeneralFaq': True, 'published': True},
    {'id': 'faq-annuleren',
     'question': 'Kan ik mijn reservering annuleren?',
     'answer': '{{TODO-NL: annuleringsvoorwaarden opvragen bij de klantenservice. De oude site verwijst hiervoor naar Zendesk en noemt geen termijn.}}',
     'category': 'reserveren', 'showOnGeneralFaq': True, 'published': True},
    {'id': 'faq-abonnement-opzeggen',
     'question': 'Hoe lang loopt een parkeerabonnement?',
     'answer': 'Een abonnement loopt minimaal drie maanden. Daarna zeg je op met een opzegtermijn van één kalendermaand.',
     'category': 'abonnementen', 'showOnGeneralFaq': True, 'published': True},
    {'id': 'faq-parkingpass',
     'question': 'Wat is een ParkingPass?',
     'answer': 'Met een ParkingPass koop je tien of vijfentwintig parkeersessies vooruit tegen een lager tarief. Handig als je regelmatig op dezelfde locatie staat, maar niet elke dag.',
     'category': 'parkingpass', 'showOnGeneralFaq': True, 'published': True},
]

# Keep the hand-built structured facts for the three reference locations.
existing = {l['id']: l for l in json.load(open('content/locations.json', encoding='utf-8'))}
RICH_FIELDS = ['address', 'coordinates', 'coordinatesSource', 'routeDescription',
               'entryInstructions', 'exitInstructions', 'openingHours', 'accessibility',
               'capacity', 'walkingDistanceToCenterMinutes', 'features', 'tariffs',
               'body', 'shortDescription', 'sync', 'photos']
# faqIds is deliberately not carried over: the generated FAQ records come from
# the same source column, so keeping one set avoids two ids for one question.

cities = []
for cid, c in sorted(d['cities'].items(), key=lambda kv: kv[1]['name']):
    lat, lng = CITY_POINT[c['slug']]
    cities.append({
        'id': cid, 'name': c['name'], 'slug': c['slug'],
        'intro': CITY_INTRO[c['slug']],
        'centerPoint': {'lat': lat, 'lng': lng},
        'seo': {
            'title': f'Parkeren in {c["name"]} | ParkingYou',
            'description': (f'{c["count"]} parkeerlocatie' + ('s' if c['count'] > 1 else '') +
                            f' van ParkingYou in {c["name"]}. Reserveer online op kenteken en rijd zo door.'),
        },
        'faqIds': ['faq-reserveren-kenteken', 'faq-goedkoper-reserveren'],
        'published': True,
    })

locations = []
for loc in d['locations']:
    control = loc.pop('_control')
    loc = dedash(loc)
    if control and control != '—':
        loc['editorialNote'] = dedash(control)
    if loc['id'] in existing:
        for field in RICH_FIELDS:
            if field in existing[loc['id']]:
                loc[field] = existing[loc['id']][field]
    locations.append(loc)

faqs = GENERAL_FAQS + [dedash(f) for f in d['faqs']]
# The three reference locations keep their hand-written FAQ ids; drop the
# generated duplicates for those so nothing is orphaned or doubled.
kept = {f for l in locations for f in l['faqIds']}
faqs = [f for f in faqs if f['id'] in kept or f['showOnGeneralFaq']]

for name, data in [('cities', cities), ('locations', locations), ('faqs', faqs)]:
    with open(f'content/{name}.json', 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print(f'{name}: {len(data)}')

print('em dashes remaining:', len(re.findall(r'[—–]', json.dumps(locations, ensure_ascii=False))))
print('locations with editorial notes:', sum(1 for l in locations if 'editorialNote' in l))
print('locations with tariffs:', sum(1 for l in locations if l.get('tariffs')))
