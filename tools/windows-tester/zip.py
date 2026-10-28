"""Build and fully verify the private tester ZIP; Python is build-time only."""
from pathlib import Path
import hashlib, json, zipfile, time, os

root=Path(__file__).resolve().parents[2]
evidence=(root/os.environ.get('JUNIOR_TESTER_EVIDENCE_DIR','artifacts/windows-tester-20261026')).resolve()
if not evidence.is_relative_to(root/'artifacts'):
    raise SystemExit('Tester output must remain inside project artifacts.')
package=evidence/'package'/'Starflight Junior Crew'
archive=evidence/'Starflight-Junior-Crew-Windows-x64-20261026-security.zip'
if archive.exists():
    raise SystemExit('Archive already exists; preserve it rather than overwriting.')
files=sorted(p for p in package.rglob('*') if p.is_file())
started=time.time()
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
    for i,p in enumerate(files,1):
        z.write(p,p.relative_to(package.parent).as_posix())
        if i%500==0: print(f'Archived {i}/{len(files)} files',flush=True)
print('Verifying every ZIP entry CRC...',flush=True)
with zipfile.ZipFile(archive) as z:
    bad=z.testzip()
    if bad: raise RuntimeError('ZIP CRC failure: '+bad)
    assert len(z.infolist())==len(files)
digest=hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()
receipt={'archive':str(archive),'files':len(files),'bytes':archive.stat().st_size,'sha256':digest,'crc':'all entries passed','seconds':round(time.time()-started,2)}
(evidence/'zip.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8')
(evidence/(archive.name+'.sha256')).write_text(digest+'  '+archive.name+'\n',encoding='ascii')
print(json.dumps(receipt,indent=2),flush=True)
