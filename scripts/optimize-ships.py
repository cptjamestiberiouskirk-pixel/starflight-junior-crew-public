"""Create exact-pixel runtime derivatives; never modify approved PNG masters.

Requires Python 3 and Pillow with WebP support. Outputs are an ignored build cache.
"""
import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, features

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'artifacts/ship-runtime'
SOURCE = ROOT / 'assets/ships/configurations'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def optimize(path):
    raw = path.read_bytes()
    original = Image.open(io.BytesIO(raw)).convert('RGBA')
    target = OUT / path.with_suffix('.webp').name
    if target.exists():
        encoded = target.read_bytes()
    else:
        buffer = io.BytesIO()
        original.save(buffer, 'WEBP', lossless=True, quality=100, method=4, exact=True)
        encoded = buffer.getvalue()
    decoded = Image.open(io.BytesIO(encoded)).convert('RGBA')
    if original.size != decoded.size or original.tobytes() != decoded.tobytes():
        raise RuntimeError(f'Pixel mismatch: {path.name}')
    smaller = len(encoded) < len(raw)
    if smaller:
        target.write_bytes(encoded)
    return dict(source=path.name, sourceSha256=sha(raw), file=target.name if smaller else path.name,
                sha256=sha(encoded if smaller else raw), sourceBytes=len(raw),
                bytes=len(encoded if smaller else raw), rgbaSha256=sha(original.tobytes()))

if __name__ == '__main__':
    if not features.check('webp'):
        raise RuntimeError('Pillow must support WebP')
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(SOURCE.glob('*.png'))
    if len(files) != 3672:
        raise RuntimeError(f'Expected 3672 approved configurations, found {len(files)}')
    rows = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for row in pool.map(optimize, files):
            rows.append(row)
            if len(rows) % 200 == 0:
                print(f'Pixel verified {len(rows)}/{len(files)}', flush=True)
    manifest = dict(version=1, algorithm='lossless-webp-exact-rgba-or-smaller-original', images=rows,
                    sourceBytes=sum(r['sourceBytes'] for r in rows), bytes=sum(r['bytes'] for r in rows))
    temporary = OUT / 'manifest.tmp'
    temporary.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    temporary.replace(OUT / 'manifest.json')
    print(json.dumps({k:v for k,v in manifest.items() if k != 'images'}), flush=True)
