"""One-off: generate labelled placeholder photography for every location.

Every image says PLAATSHOUDER and carries a TODO marker, so a placeholder can
never be mistaken for real photography of a car park.
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1600, 1000
BLUE = (0x20, 0x3D, 0x8B)
DEEP = (0x0F, 0x21, 0x53)
CYAN = (0x79, 0xC9, 0xDC)

def font(size):
    for path in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                 '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()

def wrap(draw, text, f, width):
    lines, line = [], ''
    for word in text.split():
        probe = f'{line} {word}'.strip()
        if draw.textlength(probe, font=f) > width:
            lines.append(line)
            line = word
        else:
            line = probe
    if line:
        lines.append(line)
    return lines

os.makedirs('public/images/locations', exist_ok=True)
made = 0
for loc in json.load(open('content/locations.json', encoding='utf-8')):
    for photo in loc['photos']:
        image = Image.new('RGB', (W, H))
        draw = ImageDraw.Draw(image)
        for y in range(H):
            t = y / H
            draw.line([(0, y), (W, y)],
                      fill=tuple(int(BLUE[i] + (DEEP[i] - BLUE[i]) * t) for i in range(3)))
        draw.rectangle([0, H - 14, W, H], fill=CYAN)
        draw.text((70, 70), 'PLAATSHOUDER', font=font(34), fill=CYAN)

        title_font = font(72)
        y = 130
        for line in wrap(draw, loc['name'], title_font, W - 140):
            draw.text((70, y), line, font=title_font, fill=(255, 255, 255))
            y += 84

        alt_font = font(36)
        y += 24
        for line in wrap(draw, photo['alt'], alt_font, W - 140):
            draw.text((70, y), line, font=alt_font, fill=(210, 218, 240))
            y += 52

        draw.text((70, H - 110), '{{TODO-NL: echte foto aanleveren}}', font=font(34), fill=CYAN)
        image.save('public' + photo['src'], 'JPEG', quality=68, optimize=True)
        made += 1

print(f'wrote {made} placeholder images')
