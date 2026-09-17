// Her karakter ayni viewBox (0 0 150 180) ve ayni iskelet id'lerini kullanir:
// #leg-left, #leg-right, #arm-left (yurume animasyonu), .flipfix (ayna yazilar)
window.KITZO_CHARACTERS = [
  {
    id: 'kitzo',
    name: 'Kitzo',
    emoji: '🐱',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#3a2a5a;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#3a2a5a;stroke-width:16;stroke-linecap:round;fill:none}
.lf{stroke:#b9a7f0;stroke-width:12;stroke-linecap:round;fill:none}
.txt{font-family:Arial,Helvetica,sans-serif;font-weight:800;text-anchor:middle}
</style>
<ellipse cx="75" cy="175" rx="32" ry="5" fill="#000" opacity="0.25"/>
<path d="M58 134 C30 132 24 102 44 96" stroke="#3a2a5a" stroke-width="14" stroke-linecap="round" fill="none"/>
<path d="M58 134 C30 132 24 102 44 96" stroke="#b9a7f0" stroke-width="10" stroke-linecap="round" fill="none"/>
<circle cx="44" cy="96" r="11" fill="#4de3ff" opacity="0.3"/>
<circle cx="44" cy="96" r="6" fill="#4de3ff" class="o"/>
<circle cx="42" cy="94" r="1.8" fill="#fff"/>
<g id="arm-left"><path d="M52 112 L44 136" class="lo"/><path d="M52 112 L44 136" class="lf"/><circle cx="44" cy="137" r="8" fill="#b9a7f0" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 146 V160" class="lo"/><path d="M63 146 V160" class="lf"/><ellipse cx="63" cy="166" rx="12" ry="7" fill="#b9a7f0" class="o"/><path d="M58 168 V171 M63 168 V172 M68 168 V171" stroke="#3a2a5a" stroke-width="1.5" stroke-linecap="round"/></g>
<g id="leg-right" class="leg"><path d="M87 146 V160" class="lo"/><path d="M87 146 V160" class="lf"/><ellipse cx="87" cy="166" rx="12" ry="7" fill="#b9a7f0" class="o"/><path d="M82 168 V171 M87 168 V172 M92 168 V171" stroke="#3a2a5a" stroke-width="1.5" stroke-linecap="round"/></g>
<path d="M50 130 H100 V146 Q100 152 94 152 H82 L75 145 L68 152 H56 Q50 152 50 146 Z" fill="#1e9ad6" class="o"/>
<g class="flipfix"><text x="62" y="144" font-size="7" fill="#fff" class="txt">XRP</text></g>
<ellipse cx="75" cy="118" rx="31" ry="28" fill="#f7931a" class="o"/>
<rect x="42" y="108" width="16" height="15" rx="7" fill="#f7931a" class="o"/>
<circle cx="75" cy="122" r="11" fill="#fff" class="o"/>
<g class="flipfix"><text x="75" y="128" font-size="15" fill="#f7931a" class="txt" transform="rotate(14 75 122)">฿</text></g>
<g id="arm-right"><path d="M98 112 L106 136" class="lo"/><path d="M98 112 L106 136" class="lf"/><circle cx="106" cy="137" r="8" fill="#b9a7f0" class="o"/><path d="M101 141 V144 M106 142 V145 M111 141 V144" stroke="#3a2a5a" stroke-width="1.5" stroke-linecap="round"/><rect x="92" y="108" width="16" height="15" rx="7" fill="#f7931a" class="o"/></g>
<path d="M46 44 L36 6 L70 30 Z" fill="#b9a7f0" class="o"/><path d="M49 40 L42 15 L64 30 Z" fill="#ff9ac2"/>
<path d="M104 44 L114 6 L80 30 Z" fill="#b9a7f0" class="o"/><path d="M101 40 L108 15 L86 30 Z" fill="#ff9ac2"/>
<circle cx="37" cy="8" r="4" fill="#4de3ff" class="o"/><circle cx="113" cy="8" r="4" fill="#4de3ff" class="o"/>
<circle cx="75" cy="92" r="9" fill="#b9a7f0" class="o"/>
<circle cx="75" cy="58" r="33" fill="#b9a7f0" class="o"/>
<path d="M45 62 L33 60 L45 72 Z" fill="#b9a7f0" class="o"/><path d="M105 62 L117 60 L105 72 Z" fill="#b9a7f0" class="o"/>
<ellipse cx="55" cy="80" rx="5" ry="3" fill="#ff9ac2" opacity="0.6"/><ellipse cx="95" cy="80" rx="5" ry="3" fill="#ff9ac2" opacity="0.6"/>
<path d="M53 63 Q61 58 69 62" fill="none" stroke="#3a2a5a" stroke-width="2.5" stroke-linecap="round"/>
<path d="M84 64 Q91 62 98 64" fill="none" stroke="#3a2a5a" stroke-width="2.5" stroke-linecap="round"/>
<g class="eye-open"><circle cx="62" cy="70" r="11" fill="#4de3ff" opacity="0.18"/><ellipse cx="62" cy="70" rx="8" ry="9" fill="#fff" class="o"/><circle cx="63" cy="71" r="5.5" fill="#4de3ff"/><circle cx="63.5" cy="72" r="3" fill="#1a1a2e"/><circle cx="60" cy="67" r="2" fill="#fff"/></g>
<path class="eye-closed" d="M54 70 Q62 64 70 70" fill="none" stroke="#3a2a5a" stroke-width="3" stroke-linecap="round"/>
<g class="eye-open wink-eye"><circle cx="90" cy="70" r="11" fill="#4de3ff" opacity="0.18"/><ellipse cx="90" cy="70" rx="8" ry="9" fill="#fff" class="o"/><circle cx="89" cy="71" r="5.5" fill="#4de3ff"/><circle cx="88.5" cy="72" r="3" fill="#1a1a2e"/><circle cx="92" cy="67" r="2" fill="#fff"/></g>
<path class="eye-closed wink-eye" d="M82 70 Q90 64 98 70" fill="none" stroke="#3a2a5a" stroke-width="3" stroke-linecap="round"/>
<path d="M72 78 L78 78 L75 81 Z" fill="#ff9ac2" class="o"/>
<path d="M66 84 Q72 90 76 84 Q80 89 86 82" fill="none" stroke="#3a2a5a" stroke-width="2" stroke-linecap="round"/>
<path d="M80 84 L84 84 L82 88 Z" fill="#fff" stroke="#3a2a5a" stroke-width="1"/>
<path d="M40 76 L54 78 M40 84 L54 82 M110 76 L96 78 M110 84 L96 82" stroke="#3a2a5a" stroke-width="1.5" stroke-linecap="round"/>
<path d="M50 40 Q54 14 75 12 Q96 14 100 40 Z" fill="#2f3660" class="o"/>
<path d="M50 40 Q75 34 100 40 L100 46 Q75 40 50 46 Z" fill="#1c2033" class="o"/>
<path d="M46 46 Q75 56 104 46 L106 51 Q75 64 44 51 Z" fill="#1c2033" class="o"/>
<polygon points="75,16 82,25 75,29 68,25" fill="#c3c6ff"/><polygon points="75,31 82,27 75,35 68,27" fill="#8c93f5"/>
</svg>`,
  },
  {
    id: 'zumi',
    name: 'Zumi',
    emoji: '💧',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#1e6b60;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#1e6b60;stroke-width:14;stroke-linecap:round;fill:none}
.lf{stroke:#5fe0c8;stroke-width:10;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="34" ry="5" fill="#000" opacity="0.25"/>
<g id="arm-left"><path d="M50 118 L40 138" class="lo"/><path d="M50 118 L40 138" class="lf"/><circle cx="40" cy="139" r="7" fill="#5fe0c8" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 150 V160" class="lo"/><path d="M63 150 V160" class="lf"/><ellipse cx="63" cy="166" rx="11" ry="6" fill="#5fe0c8" class="o"/></g>
<g id="leg-right" class="leg"><path d="M87 150 V160" class="lo"/><path d="M87 150 V160" class="lf"/><ellipse cx="87" cy="166" rx="11" ry="6" fill="#5fe0c8" class="o"/></g>
<path d="M36 156 C30 96 56 62 75 60 C94 62 120 96 114 156 Q75 172 36 156 Z" fill="#5fe0c8" class="o"/>
<path d="M48 122 C46 98 58 80 70 74" stroke="#bff5ea" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
<circle cx="58" cy="140" r="4" fill="#3ec2aa" opacity="0.7"/><circle cx="96" cy="130" r="3" fill="#3ec2aa" opacity="0.7"/><circle cx="88" cy="150" r="2.5" fill="#3ec2aa" opacity="0.7"/>
<g id="arm-right"><path d="M100 118 L110 138" class="lo"/><path d="M100 118 L110 138" class="lf"/><circle cx="110" cy="139" r="7" fill="#5fe0c8" class="o"/></g>
<g class="eye-open"><ellipse cx="62" cy="104" rx="8" ry="10" fill="#fff" class="o"/><circle cx="63" cy="106" r="4.5" fill="#1a1a2e"/><circle cx="60" cy="101" r="2" fill="#fff"/></g>
<path class="eye-closed" d="M54 104 Q62 98 70 104" fill="none" stroke="#1e6b60" stroke-width="3" stroke-linecap="round"/>
<g class="eye-open wink-eye"><ellipse cx="90" cy="104" rx="8" ry="10" fill="#fff" class="o"/><circle cx="91" cy="106" r="4.5" fill="#1a1a2e"/><circle cx="88" cy="101" r="2" fill="#fff"/></g>
<path class="eye-closed wink-eye" d="M82 104 Q90 98 98 104" fill="none" stroke="#1e6b60" stroke-width="3" stroke-linecap="round"/>
<path d="M64 124 Q75 138 86 124 Z" fill="#1e6b60"/><path d="M70 128 Q75 135 80 128 Z" fill="#ff7b9c"/>
<ellipse cx="50" cy="118" rx="5" ry="3" fill="#ff7b9c" opacity="0.5"/><ellipse cx="102" cy="118" rx="5" ry="3" fill="#ff7b9c" opacity="0.5"/>
<path d="M54 68 Q75 42 96 68 Z" fill="#ff5c5c" class="o"/>
<path d="M66 56 L63 68 M84 56 L87 68" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>
<path d="M75 46 V38" stroke="#1e6b60" stroke-width="2.5" stroke-linecap="round"/>
<path d="M58 38 Q75 31 92 38 Q75 45 58 38 Z" fill="#ffd23f" class="o"/><circle cx="75" cy="38" r="2.5" fill="#1e6b60"/>
</svg>`,
  },
  {
    id: 'byto',
    name: 'Byto',
    emoji: '🤖',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#2b3247;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#2b3247;stroke-width:15;stroke-linecap:round;fill:none}
.lf{stroke:#8fa3c7;stroke-width:11;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="32" ry="5" fill="#000" opacity="0.25"/>
<g id="arm-left"><path d="M52 112 L44 136" class="lo"/><path d="M52 112 L44 136" class="lf"/><circle cx="44" cy="138" r="8" fill="#cfd8e8" class="o"/><path d="M40 141 L44 145 L48 141" fill="none" stroke="#2b3247" stroke-width="2"/></g>
<g id="leg-left" class="leg"><path d="M63 146 V160" class="lo"/><path d="M63 146 V160" class="lf"/><rect x="51" y="160" width="24" height="12" rx="4" fill="#cfd8e8" class="o"/></g>
<g id="leg-right" class="leg"><path d="M87 146 V160" class="lo"/><path d="M87 146 V160" class="lf"/><rect x="75" y="160" width="24" height="12" rx="4" fill="#cfd8e8" class="o"/></g>
<rect x="50" y="94" width="50" height="54" rx="10" fill="#8fa3c7" class="o"/>
<rect x="58" y="102" width="34" height="24" rx="4" fill="#1a2233" class="o"/>
<path d="M75 122 L68 115 Q65 110 70 108 Q75 107 75 112 Q75 107 80 108 Q85 110 82 115 Z" fill="#ff5c8a"/>
<circle cx="62" cy="138" r="3" fill="#ff5c5c" class="o"/><circle cx="71" cy="138" r="3" fill="#ffd23f" class="o"/><circle cx="80" cy="138" r="3" fill="#3ddc84" class="o"/>
<path d="M87 134 H95 M87 139 H95" stroke="#2b3247" stroke-width="2" stroke-linecap="round"/>
<g id="arm-right"><path d="M98 112 L106 136" class="lo"/><path d="M98 112 L106 136" class="lf"/><circle cx="106" cy="138" r="8" fill="#cfd8e8" class="o"/><path d="M102 141 L106 145 L110 141" fill="none" stroke="#2b3247" stroke-width="2"/></g>
<rect x="67" y="82" width="16" height="14" fill="#5f7096" class="o"/>
<path d="M75 30 V16" stroke="#2b3247" stroke-width="3" stroke-linecap="round"/><circle cx="75" cy="13" r="5" fill="#ff5c5c" class="o"/>
<rect x="48" y="30" width="54" height="52" rx="14" fill="#cfd8e8" class="o"/>
<circle cx="46" cy="56" r="6" fill="#8fa3c7" class="o"/><circle cx="104" cy="56" r="6" fill="#8fa3c7" class="o"/>
<rect x="55" y="44" width="40" height="20" rx="8" fill="#1a2233" class="o"/>
<rect class="eye-open" x="61" y="50" width="9" height="8" rx="2" fill="#4de3ff"/><rect class="eye-closed" x="61" y="53" width="9" height="3" rx="1.5" fill="#4de3ff"/>
<rect class="eye-open wink-eye" x="80" y="50" width="9" height="8" rx="2" fill="#4de3ff"/><rect class="eye-closed wink-eye" x="80" y="53" width="9" height="3" rx="1.5" fill="#4de3ff"/>
<path d="M64 71 H86 M66 75 H84" stroke="#2b3247" stroke-width="2" stroke-linecap="round"/>
<path d="M60 40 H90" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
</svg>`,
  },
  {
    id: 'fyra',
    name: 'Fyra',
    emoji: '🦊',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#5a2a0a;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#5a2a0a;stroke-width:16;stroke-linecap:round;fill:none}
.lf{stroke:#ff8c42;stroke-width:12;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="32" ry="5" fill="#000" opacity="0.25"/>
<path d="M60 136 C28 140 22 108 40 100" stroke="#5a2a0a" stroke-width="16" stroke-linecap="round" fill="none"/>
<path d="M60 136 C28 140 22 108 40 100" stroke="#ff8c42" stroke-width="12" stroke-linecap="round" fill="none"/>
<circle cx="40" cy="100" r="8" fill="#ffe8cc" class="o"/>
<g id="arm-left"><path d="M52 112 L44 136" class="lo"/><path d="M52 112 L44 136" class="lf"/><circle cx="44" cy="137" r="8" fill="#ff8c42" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 146 V160" class="lo"/><path d="M63 146 V160" class="lf"/><ellipse cx="63" cy="166" rx="12" ry="7" fill="#6b3b1a" class="o"/></g>
<g id="leg-right" class="leg"><path d="M87 146 V160" class="lo"/><path d="M87 146 V160" class="lf"/><ellipse cx="87" cy="166" rx="12" ry="7" fill="#6b3b1a" class="o"/></g>
<path d="M44 88 Q75 60 106 88 Q75 100 44 88 Z" fill="#22a865" class="o"/>
<path d="M50 100 Q50 92 60 92 H90 Q100 92 100 100 V142 Q100 150 92 150 H58 Q50 150 50 142 Z" fill="#3ddc84" class="o"/>
<path d="M60 130 H90 V144 H60 Z" fill="#22a865" class="o"/>
<path d="M70 96 V112 M80 96 V112" stroke="#f5f5f5" stroke-width="2" stroke-linecap="round"/>
<g id="arm-right"><path d="M98 112 L106 136" class="lo"/><path d="M98 112 L106 136" class="lf"/><circle cx="106" cy="137" r="8" fill="#ff8c42" class="o"/></g>
<path d="M48 46 L40 8 L72 30 Z" fill="#ff8c42" class="o"/><path d="M51 42 L45 17 L66 30 Z" fill="#5a2a0a"/>
<path d="M102 46 L110 8 L78 30 Z" fill="#ff8c42" class="o"/><path d="M99 42 L105 17 L84 30 Z" fill="#5a2a0a"/>
<circle cx="75" cy="60" r="32" fill="#ff8c42" class="o"/>
<path d="M44 66 L30 62 L44 78 Z" fill="#ffe8cc" class="o"/><path d="M106 66 L120 62 L106 78 Z" fill="#ffe8cc" class="o"/>
<ellipse cx="75" cy="76" rx="17" ry="12" fill="#ffe8cc" class="o"/>
<ellipse cx="75" cy="70" rx="4" ry="3" fill="#5a2a0a"/>
<path d="M64 78 Q75 90 86 78" fill="none" stroke="#5a2a0a" stroke-width="2.5" stroke-linecap="round"/>
<g class="eye-open"><circle cx="62" cy="58" r="5.5" fill="#fff" class="o"/><circle cx="63" cy="59" r="3.2" fill="#1a1a2e"/><circle cx="61" cy="56.5" r="1.2" fill="#fff"/></g>
<path class="eye-closed" d="M56 60 Q62 52 68 60" fill="none" stroke="#5a2a0a" stroke-width="3" stroke-linecap="round"/>
<g class="eye-open wink-eye"><circle cx="88" cy="58" r="5.5" fill="#fff" class="o"/><circle cx="89" cy="59" r="3.2" fill="#1a1a2e"/><circle cx="87" cy="56.5" r="1.2" fill="#fff"/></g>
<path class="eye-closed wink-eye" d="M82 60 Q88 52 94 60" fill="none" stroke="#5a2a0a" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="54" cy="72" rx="5" ry="3" fill="#ff5c8a" opacity="0.4"/><ellipse cx="96" cy="72" rx="5" ry="3" fill="#ff5c8a" opacity="0.4"/>
</svg>`,
  },
  {
    id: 'nocto',
    name: 'Nocto',
    emoji: '🦉',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#1a2040;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#1a2040;stroke-width:14;stroke-linecap:round;fill:none}
.lf{stroke:#3b4a8a;stroke-width:10;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="34" ry="5" fill="#000" opacity="0.25"/>
<g id="arm-left"><path d="M50 104 Q30 124 46 142 Q56 130 58 106 Z" fill="#2c3a70" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 150 V160" class="lo"/><path d="M63 150 V160" class="lf"/><path d="M52 168 L63 160 L74 168 M63 160 V171" stroke="#1a2040" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M52 168 L63 160 L74 168 M63 160 V171" stroke="#f4b942" stroke-width="4" stroke-linecap="round" fill="none"/></g>
<g id="leg-right" class="leg"><path d="M87 150 V160" class="lo"/><path d="M87 150 V160" class="lf"/><path d="M76 168 L87 160 L98 168 M87 160 V171" stroke="#1a2040" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M76 168 L87 160 L98 168 M87 160 V171" stroke="#f4b942" stroke-width="4" stroke-linecap="round" fill="none"/></g>
<path d="M46 70 L40 44 L62 60 Z" fill="#3b4a8a" class="o"/><path d="M104 70 L110 44 L88 60 Z" fill="#3b4a8a" class="o"/>
<ellipse cx="75" cy="106" rx="38" ry="48" fill="#3b4a8a" class="o"/>
<ellipse cx="75" cy="122" rx="24" ry="26" fill="#8fa0e0" class="o"/>
<path d="M60 116 Q66 122 72 116 M78 116 Q84 122 90 116 M66 130 Q72 136 78 130 M62 142 Q68 148 74 142 M76 142 Q82 148 88 142" stroke="#3b4a8a" stroke-width="2" fill="none" stroke-linecap="round"/>
<g id="arm-right"><path d="M100 104 Q120 124 104 142 Q94 130 92 106 Z" fill="#2c3a70" class="o"/><rect x="100" y="132" width="16" height="16" rx="3" fill="#f5f5f5" class="o"/><path d="M100 138 H116" stroke="#8b5a2b" stroke-width="3"/><path d="M116 136 Q123 140 116 145" fill="none" class="o"/><path d="M106 128 Q109 124 106 120" stroke="#aaa" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>
<circle cx="61" cy="84" r="14" fill="#fff" class="o"/><circle cx="89" cy="84" r="14" fill="#fff" class="o"/>
<g class="eye-open"><circle cx="62" cy="86" r="6" fill="#1a2040"/><circle cx="60" cy="83" r="2" fill="#fff"/></g>
<path class="eye-closed" d="M53 86 Q61 80 69 86" fill="none" stroke="#1a2040" stroke-width="3" stroke-linecap="round"/>
<g class="eye-open wink-eye"><circle cx="90" cy="86" r="6" fill="#1a2040"/><circle cx="88" cy="83" r="2" fill="#fff"/></g>
<path class="eye-closed wink-eye" d="M81 86 Q89 80 97 86" fill="none" stroke="#1a2040" stroke-width="3" stroke-linecap="round"/>
<circle cx="61" cy="84" r="14" fill="none" stroke="#d4a24c" stroke-width="4"/><circle cx="89" cy="84" r="14" fill="none" stroke="#d4a24c" stroke-width="4"/>
<rect x="72" y="81" width="6" height="6" fill="#d4a24c" class="o"/>
<path d="M47 82 Q40 78 44 70 M103 82 Q110 78 106 70" stroke="#6b4f1d" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M50 66 Q60 60 70 66" fill="none" stroke="#1a2040" stroke-width="2.5" stroke-linecap="round"/>
<path d="M69 98 L81 98 L75 108 Z" fill="#f4b942" class="o"/>
<ellipse cx="50" cy="100" rx="5" ry="3" fill="#ff8a80" opacity="0.5"/><ellipse cx="100" cy="100" rx="5" ry="3" fill="#ff8a80" opacity="0.5"/>
</svg>`,
  },
  {
    id: 'wispa',
    name: 'Wispa',
    emoji: '👻',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#6c5d99;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#6c5d99;stroke-width:15;stroke-linecap:round;fill:none}
.lf{stroke:#f4f1ff;stroke-width:11;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="30" ry="5" fill="#000" opacity="0.18"/>
<g id="arm-left"><path d="M50 116 L42 138" class="lo"/><path d="M50 116 L42 138" class="lf"/><circle cx="42" cy="139" r="7" fill="#f4f1ff" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 148 V160" class="lo"/><path d="M63 148 V160" class="lf"/><rect x="52" y="160" width="22" height="13" rx="6" fill="#ff7bac" class="o"/><path d="M55 169 H71" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
<g id="leg-right" class="leg"><path d="M87 148 V160" class="lo"/><path d="M87 148 V160" class="lf"/><rect x="76" y="160" width="22" height="13" rx="6" fill="#ff7bac" class="o"/><path d="M79 169 H95" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
<path d="M42 150 Q36 70 75 60 Q114 70 108 150 Q100 142 92 154 Q84 144 75 154 Q66 144 58 154 Q50 142 42 150 Z" fill="#f4f1ff" class="o"/>
<path d="M58 140 Q75 150 92 140" stroke="#d9d2f5" stroke-width="4" fill="none" stroke-linecap="round"/>
<g id="arm-right"><path d="M100 116 L108 138" class="lo"/><path d="M100 116 L108 138" class="lf"/><circle cx="108" cy="139" r="7" fill="#f4f1ff" class="o"/></g>
<g class="eye-open"><ellipse cx="63" cy="98" rx="5" ry="8" fill="#1a1a2e"/><circle cx="61" cy="94" r="1.6" fill="#fff"/></g>
<path class="eye-closed" d="M58 98 Q63 94 68 98" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
<g class="eye-open wink-eye"><ellipse cx="87" cy="98" rx="5" ry="8" fill="#1a1a2e"/><circle cx="85" cy="94" r="1.6" fill="#fff"/></g>
<path class="eye-closed wink-eye" d="M82 98 Q87 94 92 98" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="75" cy="116" rx="6" ry="7" fill="#1a1a2e"/>
<ellipse cx="52" cy="110" rx="5" ry="3" fill="#ff7bac" opacity="0.5"/><ellipse cx="98" cy="110" rx="5" ry="3" fill="#ff7bac" opacity="0.5"/>
<path d="M60 62 L75 22 L90 62 Z" fill="#ff7bac" class="o"/>
<path d="M66 46 L84 46 M62 56 L88 56" stroke="#ffd23f" stroke-width="4"/>
<circle cx="75" cy="22" r="5" fill="#ffd23f" class="o"/>
<path d="M112 50 L114 56 L120 58 L114 60 L112 66 L110 60 L104 58 L110 56 Z" fill="#ffd23f" class="o"/>
</svg>`,
  },
  {
    id: 'drayko',
    name: 'Drayko',
    emoji: '🐉',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#1f4d1f;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#1f4d1f;stroke-width:16;stroke-linecap:round;fill:none}
.lf{stroke:#6cc46a;stroke-width:12;stroke-linecap:round;fill:none}
.txt{font-family:Arial,Helvetica,sans-serif;font-weight:800;text-anchor:middle}
</style>
<ellipse cx="75" cy="175" rx="32" ry="5" fill="#000" opacity="0.25"/>
<path d="M52 100 Q20 80 26 112 Q40 106 52 118 Z" fill="#3f8f3f" class="o"/><path d="M98 100 Q130 80 124 112 Q110 106 98 118 Z" fill="#3f8f3f" class="o"/>
<path d="M60 140 C30 146 20 118 34 108" stroke="#1f4d1f" stroke-width="14" stroke-linecap="round" fill="none"/>
<path d="M60 140 C30 146 20 118 34 108" stroke="#6cc46a" stroke-width="10" stroke-linecap="round" fill="none"/>
<path d="M34 108 L26 98 L40 96 Z" fill="#6cc46a" class="o"/>
<g id="arm-left"><path d="M52 114 L44 138" class="lo"/><path d="M52 114 L44 138" class="lf"/><circle cx="44" cy="139" r="8" fill="#6cc46a" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 146 V160" class="lo"/><path d="M63 146 V160" class="lf"/><ellipse cx="63" cy="166" rx="12" ry="7" fill="#6cc46a" class="o"/><path d="M55 170 L53 175 M63 171 L63 176 M71 170 L73 175" stroke="#f5e6b3" stroke-width="2.5" stroke-linecap="round"/></g>
<g id="leg-right" class="leg"><path d="M87 146 V160" class="lo"/><path d="M87 146 V160" class="lf"/><ellipse cx="87" cy="166" rx="12" ry="7" fill="#6cc46a" class="o"/><path d="M79 170 L77 175 M87 171 L87 176 M95 170 L97 175" stroke="#f5e6b3" stroke-width="2.5" stroke-linecap="round"/></g>
<ellipse cx="75" cy="120" rx="31" ry="30" fill="#6cc46a" class="o"/>
<ellipse cx="75" cy="126" rx="19" ry="21" fill="#f5e6b3" class="o"/>
<path d="M60 118 H90 M58 128 H92 M62 138 H88" stroke="#1f4d1f" stroke-width="1.5" opacity="0.5"/>
<path d="M55 104 Q75 124 95 104" stroke="#ffd23f" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="75" cy="114" r="6" fill="#ffd23f" class="o"/><g class="flipfix"><text x="75" y="117" font-size="8" fill="#1f4d1f" class="txt">$</text></g>
<g id="arm-right"><path d="M98 114 L106 138" class="lo"/><path d="M98 114 L106 138" class="lf"/><circle cx="106" cy="139" r="8" fill="#6cc46a" class="o"/></g>
<path d="M64 30 L66 20 L70 29 Z M72 27 L75 17 L78 27 Z M80 29 L84 20 L86 30 Z" fill="#3f8f3f" class="o"/>
<circle cx="75" cy="58" r="32" fill="#6cc46a" class="o"/>
<path d="M52 40 L44 14 L62 32 Z" fill="#f5e6b3" class="o"/><path d="M98 40 L106 14 L88 32 Z" fill="#f5e6b3" class="o"/>
<ellipse cx="75" cy="74" rx="18" ry="11" fill="#8fd98d" class="o"/>
<circle cx="69" cy="72" r="2" fill="#1f4d1f"/><circle cx="81" cy="72" r="2" fill="#1f4d1f"/>
<path d="M64 82 Q72 90 86 80" fill="none" stroke="#1f4d1f" stroke-width="2.5" stroke-linecap="round"/>
<path d="M69 82 L71 88 L74 82 Z" fill="#fff" stroke="#1f4d1f" stroke-width="1"/>
<rect x="50" y="50" width="22" height="14" rx="5" fill="#111" class="o"/><rect x="78" y="50" width="22" height="14" rx="5" fill="#111" class="o"/>
<path d="M72 56 H78" stroke="#111" stroke-width="3"/>
<path d="M54 54 L60 53 M82 54 L88 53" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
</svg>`,
  },
  {
    id: 'nubi',
    name: 'Nubi',
    emoji: '🐧',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#14162b;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#14162b;stroke-width:14;stroke-linecap:round;fill:none}
.lf{stroke:#2b2d42;stroke-width:10;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="34" ry="5" fill="#000" opacity="0.25"/>
<g id="arm-left"><path d="M50 104 Q34 122 44 142 Q54 132 56 106 Z" fill="#2b2d42" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 150 V160" class="lo"/><path d="M63 150 V160" class="lf"/><path d="M50 166 Q63 158 76 166 Q63 174 50 166 Z" fill="#ff9f43" class="o"/></g>
<g id="leg-right" class="leg"><path d="M87 150 V160" class="lo"/><path d="M87 150 V160" class="lf"/><path d="M74 166 Q87 158 100 166 Q87 174 74 166 Z" fill="#ff9f43" class="o"/></g>
<ellipse cx="75" cy="112" rx="36" ry="44" fill="#2b2d42" class="o"/>
<ellipse cx="75" cy="120" rx="24" ry="30" fill="#f7f7fb" class="o"/>
<g id="arm-right"><path d="M100 104 Q116 122 106 142 Q94 132 94 106 Z" fill="#2b2d42" class="o"/></g>
<path d="M48 92 Q75 106 102 92 Q75 116 48 92 Z" fill="#e63946" class="o"/>
<path d="M92 100 L104 120 L92 118 Z" fill="#e63946" class="o"/>
<circle cx="75" cy="56" r="32" fill="#2b2d42" class="o"/>
<path d="M50 60 Q56 34 75 36 Q94 34 100 60 Q88 80 75 78 Q62 80 50 60 Z" fill="#f7f7fb" class="o"/>
<g class="eye-open"><circle cx="63" cy="58" r="6" fill="#fff" class="o"/><circle cx="64" cy="59" r="3.5" fill="#14162b"/><circle cx="62" cy="57" r="1.3" fill="#fff"/></g>
<path class="eye-closed" d="M57 58 Q63 53 69 58" fill="none" stroke="#14162b" stroke-width="3" stroke-linecap="round"/>
<g class="eye-open wink-eye"><circle cx="87" cy="58" r="6" fill="#fff" class="o"/><circle cx="88" cy="59" r="3.5" fill="#14162b"/><circle cx="86" cy="57" r="1.3" fill="#fff"/></g>
<path class="eye-closed wink-eye" d="M82 58 Q88 53 94 58" fill="none" stroke="#14162b" stroke-width="3" stroke-linecap="round"/>
<path d="M67 66 L83 66 L75 76 Z" fill="#ff9f43" class="o"/>
<ellipse cx="54" cy="68" rx="5" ry="3" fill="#ff8a80" opacity="0.5"/><ellipse cx="96" cy="68" rx="5" ry="3" fill="#ff8a80" opacity="0.5"/>
<path d="M44 56 Q44 20 75 20 Q106 20 106 56" stroke="#14162b" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M44 56 Q44 20 75 20 Q106 20 106 56" stroke="#4de3ff" stroke-width="4" fill="none" stroke-linecap="round"/>
<rect x="36" y="46" width="14" height="22" rx="6" fill="#4de3ff" class="o"/><rect x="100" y="46" width="14" height="22" rx="6" fill="#4de3ff" class="o"/>
</svg>`,
  },
  {
    id: 'ozgezo',
    name: 'Özgezo',
    emoji: '👧',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#3d2412;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#3d2412;stroke-width:16;stroke-linecap:round;fill:none}
.lf{stroke:#d9a066;stroke-width:12;stroke-linecap:round;fill:none}
.lp{stroke:#3b3f7a;stroke-width:12;stroke-linecap:round;fill:none}
.txt{font-family:'Segoe UI Symbol',Arial,sans-serif;font-weight:800;text-anchor:middle}
</style>
<ellipse cx="75" cy="175" rx="32" ry="5" fill="#000" opacity="0.25"/>
<g id="arm-left"><path d="M52 100 L44 132" class="lo"/><path d="M52 100 L44 132" class="lf"/><circle cx="44" cy="133" r="8" fill="#d9a066" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 144 V162" class="lo"/><path d="M63 144 V162" class="lp"/><rect x="51" y="160" width="26" height="14" rx="6" fill="#f5f5f5" class="o"/><path d="M55 169 H73" stroke="#c8a2ff" stroke-width="3" stroke-linecap="round"/></g>
<g id="leg-right" class="leg"><path d="M87 144 V162" class="lo"/><path d="M87 144 V162" class="lp"/><rect x="73" y="160" width="26" height="14" rx="6" fill="#f5f5f5" class="o"/><path d="M77 169 H95" stroke="#c8a2ff" stroke-width="3" stroke-linecap="round"/></g>
<rect x="53" y="122" width="44" height="26" rx="6" fill="#3b3f7a" class="o"/>
<path d="M75 124 V146" stroke="#2a2d5c" stroke-width="2"/>
<rect x="52" y="88" width="46" height="40" rx="10" fill="#c8a2ff" class="o"/>
<path d="M44 90 Q75 66 106 90 Q75 102 44 90 Z" fill="#a67cf5" class="o"/>
<rect x="40" y="88" width="18" height="17" rx="7" fill="#c8a2ff" class="o"/>
<g class="flipfix"><text x="75" y="118" font-size="16" fill="#ffffff" class="txt">★</text></g>
<g id="arm-right"><path d="M98 100 L106 132" class="lo"/><path d="M98 100 L106 132" class="lf"/><circle cx="106" cy="133" r="8" fill="#d9a066" class="o"/><rect x="92" y="88" width="18" height="17" rx="7" fill="#c8a2ff" class="o"/></g>
<rect x="69" y="72" width="12" height="16" fill="#d9a066" class="o"/>
<path d="M50 62 C42 78 44 92 50 102 L75 108 L100 102 C106 92 108 78 100 62 Z" fill="#f4a6c0" class="o"/>
<circle cx="75" cy="50" r="28" fill="#d9a066" class="o"/>
<ellipse cx="57" cy="66" rx="5" ry="3" fill="#ff8a80" opacity="0.55"/><ellipse cx="93" cy="66" rx="5" ry="3" fill="#ff8a80" opacity="0.55"/>
<path d="M56 46 Q63 42 69 46" fill="none" stroke="#3d2412" stroke-width="2" stroke-linecap="round"/>
<path d="M82 46 Q88 42 94 46" fill="none" stroke="#3d2412" stroke-width="2" stroke-linecap="round"/>
<g class="eye-open"><ellipse cx="63" cy="56" rx="6" ry="7" fill="#ffffff" class="o"/><circle cx="64" cy="57" r="4" fill="#7b61ff"/><circle cx="64.5" cy="57.5" r="2.2" fill="#1a1a2e"/><circle cx="62" cy="54" r="1.4" fill="#ffffff"/></g>
<path class="eye-closed" d="M57 56 Q63 51 69 56" fill="none" stroke="#3d2412" stroke-width="2.5" stroke-linecap="round"/>
<path d="M57 50 L54 47 M59 48 L57 44" stroke="#3d2412" stroke-width="1.5" stroke-linecap="round"/>
<g class="eye-open wink-eye"><ellipse cx="87" cy="56" rx="6" ry="7" fill="#ffffff" class="o"/><circle cx="86" cy="57" r="4" fill="#7b61ff"/><circle cx="85.5" cy="57.5" r="2.2" fill="#1a1a2e"/><circle cx="88" cy="54" r="1.4" fill="#ffffff"/></g>
<path class="eye-closed wink-eye" d="M83 56 Q88 51 93 56" fill="none" stroke="#3d2412" stroke-width="2.5" stroke-linecap="round"/>
<path d="M93 50 L96 47 M91 48 L93 44" stroke="#3d2412" stroke-width="1.5" stroke-linecap="round"/>
<path d="M68 68 Q75 76 82 68" fill="none" stroke="#7a3b1e" stroke-width="2.2" stroke-linecap="round"/>
<path fill-rule="evenodd" d="M75 12 C44 12 34 44 38 68 C40 80 46 88 50 98 L100 98 C104 88 110 80 112 68 C116 44 106 12 75 12 Z M75 30 C60 30 53 44 53 60 C53 75 62 86 75 88 C88 86 97 75 97 60 C97 44 90 30 75 30 Z" fill="#f4a6c0" class="o"/>
<path d="M48 40 C56 30 66 26 75 26 C84 26 94 30 102 40" stroke="#e07fa4" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.9"/>
<circle cx="98" cy="88" r="3.2" fill="#ffd23f" class="o"/>
</svg>`,
  },
  {
    id: 'barkinzo',
    name: 'Barkınzo',
    emoji: '👦',
    svg: `<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg">
<style>
.o{stroke:#2b1a10;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lo{stroke:#2b1a10;stroke-width:16;stroke-linecap:round;fill:none}
.lf{stroke:#d9a066;stroke-width:12;stroke-linecap:round;fill:none}
.lp{stroke:#2b3a55;stroke-width:12;stroke-linecap:round;fill:none}
</style>
<ellipse cx="75" cy="175" rx="32" ry="5" fill="#000" opacity="0.25"/>
<g id="arm-left"><path d="M52 98 L45 130" class="lo"/><path d="M52 98 L45 130" class="lf"/><circle cx="45" cy="131" r="8" fill="#d9a066" class="o"/></g>
<g id="leg-left" class="leg"><path d="M63 142 V162" class="lo"/><path d="M63 142 V162" class="lp"/><rect x="51" y="160" width="26" height="14" rx="6" fill="#e63946" class="o"/><path d="M55 169 H73" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></g>
<g id="leg-right" class="leg"><path d="M87 142 V162" class="lo"/><path d="M87 142 V162" class="lp"/><rect x="73" y="160" width="26" height="14" rx="6" fill="#e63946" class="o"/><path d="M77 169 H95" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></g>
<rect x="53" y="122" width="44" height="26" rx="6" fill="#2b3a55" class="o"/>
<path d="M75 124 V146" stroke="#1a2438" stroke-width="2"/>
<rect x="52" y="86" width="46" height="42" rx="10" fill="#2ec4b6" class="o"/>
<path d="M75 90 V126" stroke="#1b7f76" stroke-width="2"/>
<polygon points="66,96 58,110 64,110 61,122 71,106 65,106" fill="#ffd23f" class="o"/>
<rect x="40" y="86" width="18" height="17" rx="7" fill="#2ec4b6" class="o"/>
<g id="arm-right"><path d="M98 98 L106 130" class="lo"/><path d="M98 98 L106 130" class="lf"/><circle cx="106" cy="131" r="8" fill="#d9a066" class="o"/><rect x="92" y="86" width="18" height="17" rx="7" fill="#2ec4b6" class="o"/></g>
<rect x="69" y="72" width="12" height="16" fill="#d9a066" class="o"/>
<path d="M56 82 Q75 100 94 82" stroke="#1a1a2e" stroke-width="4" fill="none" stroke-linecap="round"/>
<rect x="50" y="76" width="10" height="14" rx="4" fill="#ff5c5c" class="o"/><rect x="90" y="76" width="10" height="14" rx="4" fill="#ff5c5c" class="o"/>
<circle cx="75" cy="50" r="28" fill="#d9a066" class="o"/>
<circle cx="48" cy="52" r="6" fill="#d9a066" class="o"/><circle cx="102" cy="52" r="6" fill="#d9a066" class="o"/>
<ellipse cx="57" cy="64" rx="5" ry="3" fill="#ff8a80" opacity="0.5"/>
<path d="M55 40 Q62 34 69 39" fill="none" stroke="#2b1a10" stroke-width="2.5" stroke-linecap="round"/>
<path d="M82 42 Q88 40 94 42" fill="none" stroke="#2b1a10" stroke-width="2.5" stroke-linecap="round"/>
<g class="eye-open"><circle cx="63" cy="53" r="5.5" fill="#ffffff" class="o"/><circle cx="65" cy="54" r="3" fill="#1a1a2e"/><circle cx="66" cy="52.5" r="1.1" fill="#ffffff"/></g>
<path class="eye-closed" d="M57 53 Q63 49 69 53" fill="none" stroke="#2b1a10" stroke-width="2.5" stroke-linecap="round"/>
<g class="eye-open wink-eye"><circle cx="87" cy="53" r="5.5" fill="#ffffff" class="o"/><circle cx="89" cy="54" r="3" fill="#1a1a2e"/><circle cx="90" cy="52.5" r="1.1" fill="#ffffff"/></g>
<path class="eye-closed wink-eye" d="M81 53 Q87 49 93 53" fill="none" stroke="#2b1a10" stroke-width="2.5" stroke-linecap="round"/>
<rect x="88" y="62" width="12" height="5" rx="2" fill="#f4d3a0" class="o" transform="rotate(-25 94 64)"/>
<path d="M62 66 Q75 80 88 66 Z" fill="#7a3b1e" class="o"/><rect x="66" y="66" width="18" height="4" fill="#ffffff"/>
<path d="M47 46 Q46 30 54 24 L56 48 Z" fill="#1c100a" class="o"/>
<path d="M103 46 Q104 30 96 24 L94 48 Z" fill="#1c100a" class="o"/>
<path d="M48 46 Q50 26 60 22 Q64 12 74 16 Q80 8 90 14 Q98 12 102 24 Q106 34 102 46 Q94 36 84 40 Q80 30 72 38 Q64 32 58 42 Q52 38 48 46 Z" fill="#2b1a10" class="o"/>
<path d="M60 26 Q72 18 88 20" stroke="#5a3a24" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85"/>
<!-- Hacker yetenegi sirasinda gorunur (renderer/antics.js: ability-hacker sinifi) -->
<g class="hacker-gear">
<path d="M40 44 Q36 6 75 2 Q114 6 110 44 Q108 50 100 46 Q102 16 75 12 Q48 16 50 46 Q42 50 40 44 Z" fill="#1c1f26" class="o"/>
<rect x="53" y="48" width="44" height="13" rx="6" fill="#0d0f14" class="o"/>
<rect x="72" y="50" width="6" height="7" fill="#0d0f14"/>
<ellipse cx="63" cy="54" rx="5" ry="2.4" fill="#4fd1ff" opacity="0.55"/>
<ellipse cx="87" cy="54" rx="5" ry="2.4" fill="#4fd1ff" opacity="0.55"/>
</g>
</svg>`,
  },
];
