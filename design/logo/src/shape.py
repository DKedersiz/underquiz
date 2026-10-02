# usage: shape.py font.ttf text size -> JSON [{ch,x,d,bb}] in y-down coords, baseline 0
import sys, json, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
fp, text, size = sys.argv[1], sys.argv[2], float(sys.argv[3])
tt = TTFont(fp); gs = tt.getGlyphSet(); upm = tt['head'].unitsPerEm; s = size/upm
blob = hb.Blob.from_file_path(fp); face = hb.Face(blob); font = hb.Font(face)
buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
hb.shape(font, buf, {"kern": True, "liga": False})
order = tt.getGlyphOrder(); x = 0; out = []
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]
    pen = SVGPathPen(gs, lambda v: f"{round(v,2):g}")
    tp = TransformPen(pen, (s, 0, 0, -s, (x + pos.x_offset) * s, -pos.y_offset * s))
    gs[name].draw(tp)
    bp = BoundsPen(gs); gs[name].draw(bp)
    b = bp.bounds or (0,0,0,0)
    bb = [ (x+pos.x_offset+b[0])*s, -b[3]*s, (x+pos.x_offset+b[2])*s, -b[1]*s ]
    out.append({"ch": text[info.cluster], "x": x*s, "d": pen.getCommands(), "bb": bb, "adv": pos.x_advance*s})
    x += pos.x_advance
os2 = tt['OS/2']
print(json.dumps({"glyphs": out, "xh": os2.sxHeight*s, "cap": os2.sCapHeight*s, "width": x*s}))
