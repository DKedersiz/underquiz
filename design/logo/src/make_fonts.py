"""Download the variable fonts from google/fonts (OFL) and cut the static instances build.js uses.

Usage:  python make_fonts.py            (writes into ./fonts next to this file)
Needs:  pip install -r requirements.txt
"""
import os, sys, urllib.request
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
CACHE = os.path.join(FONTS, "_variable")
BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
SOURCES = {
    "EBGaramond[wght].ttf": BASE + "ebgaramond/EBGaramond%5Bwght%5D.ttf",
    "Fraunces[SOFT,WONK,opsz,wght].ttf": BASE + "fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf",
}
FR = {"opsz": 72, "SOFT": 50, "WONK": 1}
INSTANCES = [  # (source, axis location, output file)
    ("EBGaramond[wght].ttf", {"wght": 600}, "EB-600.ttf"),
    ("Fraunces[SOFT,WONK,opsz,wght].ttf", {**FR, "wght": 400}, "Fr-400.ttf"),
    ("Fraunces[SOFT,WONK,opsz,wght].ttf", {**FR, "wght": 600}, "Fr-600.ttf"),
    ("Fraunces[SOFT,WONK,opsz,wght].ttf", {**FR, "wght": 800}, "Fr-800.ttf"),
]

def main():
    force = "--force" in sys.argv
    os.makedirs(CACHE, exist_ok=True)
    for src, loc, out in INSTANCES:
        dst = os.path.join(FONTS, out)
        if os.path.exists(dst) and not force:
            print("ok (exists)", out); continue
        var = os.path.join(CACHE, src)
        if not os.path.exists(var):
            print("download", SOURCES[src]); urllib.request.urlretrieve(SOURCES[src], var)
        f = TTFont(var)
        instantiateVariableFont(f, loc, inplace=True, updateFontNames=False)
        f.save(dst); print("wrote", out, loc)

if __name__ == "__main__":
    main()
