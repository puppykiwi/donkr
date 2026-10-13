import os

AVATAR_DIR = "/opt/donkr/public/assets/avatars"
ICON_DIR = "/opt/donkr/public/assets/icons"
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(ICON_DIR, exist_ok=True)

# Helper to generate SVG Donkey Portrait
def generate_donkey_svg(
    filename,
    bg_color,
    coat_color,
    snout_color,
    mane_color,
    ear_inner_color,
    accessory_type="none",
    ear_tilt=0,
    expression="smile",
    special_texture=None
):
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg_color[0]}" />
      <stop offset="100%" stop-color="{bg_color[1]}" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="earInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{ear_inner_color}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="{ear_inner_color}" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Background Circle / Card -->
  <rect width="400" height="400" fill="url(#bgGrad)" />
  <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="6"/>

  <!-- Neck and Shoulders -->
  <path d="M120 400 C120 300 130 250 160 220 L240 220 C270 250 280 300 280 400 Z" fill="{coat_color}" />
  <path d="M185 240 L215 240 L220 400 L180 400 Z" fill="{snout_color}" opacity="0.6"/>

  <!-- Left Ear -->
  <g transform="rotate({-15 + ear_tilt}, 145, 140)">
    <path d="M145 150 C125 110 90 20 135 15 C175 12 170 100 160 150 Z" fill="{coat_color}" filter="url(#shadow)"/>
    <path d="M145 130 C132 100 110 35 137 30 C162 26 158 90 152 130 Z" fill="url(#earInnerGrad)"/>
    <!-- Tufts inside ear -->
    <path d="M136 60 Q142 65 140 75 M134 85 Q143 88 138 98" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Right Ear -->
  <g transform="rotate({15 - ear_tilt}, 255, 140)">
    <path d="M255 150 C275 110 310 20 265 15 C225 12 230 100 240 150 Z" fill="{coat_color}" filter="url(#shadow)"/>
    <path d="M255 130 C268 100 290 35 263 30 C238 26 242 90 248 130 Z" fill="url(#earInnerGrad)"/>
    <!-- Tufts inside ear -->
    <path d="M264 60 Q258 65 260 75 M266 85 Q257 88 262 98" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Mane / Hairstyle -->
  <path d="M175 130 Q200 100 225 130 Q215 170 200 160 Q185 170 175 130 Z" fill="{mane_color}"/>
  <path d="M190 95 L200 140 L210 95 L205 135 Z" fill="{mane_color}"/>
"""

    # Poitou shaggy dreadlocks
    if special_texture == "dreads":
        svg += f"""
  <!-- Dreadlocks -->
  <g fill="{mane_color}" stroke="#3E2723" stroke-width="2">
    <path d="M165 105 C155 150 145 190 155 220 C160 190 175 160 175 115 Z"/>
    <path d="M235 105 C245 150 255 190 245 220 C240 190 225 160 225 115 Z"/>
    <path d="M185 90 C180 140 170 180 180 210 C190 180 195 140 190 90 Z"/>
    <path d="M215 90 C220 140 230 180 220 210 C210 180 205 140 215 90 Z"/>
    <path d="M195 80 C195 130 198 170 202 215 C205 170 205 130 195 80 Z"/>
  </g>
"""

    svg += f"""
  <!-- Donkey Head Base -->
  <path d="M150 170 C140 200 140 260 160 280 C170 290 230 290 240 280 C260 260 260 200 250 170 C240 130 160 130 150 170 Z" fill="{coat_color}" filter="url(#shadow)"/>
  
  <!-- Forehead highlight / star -->
  <circle cx="200" cy="165" r="8" fill="rgba(255,255,255,0.3)" />

  <!-- Eyes -->
"""
    if expression == "wink":
        svg += """
  <!-- Left Eye open, Right Eye wink -->
  <ellipse cx="165" cy="180" rx="10" ry="12" fill="#212121"/>
  <circle cx="163" cy="177" r="4" fill="#FFFFFF"/>
  <path d="M225 182 Q235 174 245 182" stroke="#212121" stroke-width="4" stroke-linecap="round" fill="none"/>
"""
    elif expression == "sunglasses":
        svg += """
  <!-- Cool Aviator Sunglasses -->
  <g filter="url(#shadow)">
    <path d="M142 170 C142 165 190 165 190 175 C190 195 150 200 145 190 Z" fill="#1A237E" stroke="#FFD700" stroke-width="3"/>
    <path d="M210 175 C210 165 258 165 258 170 C255 200 210 195 210 175 Z" fill="#1A237E" stroke="#FFD700" stroke-width="3"/>
    <line x1="190" y1="172" x2="210" y2="172" stroke="#FFD700" stroke-width="4"/>
    <line x1="142" y1="172" x2="135" y2="170" stroke="#FFD700" stroke-width="3"/>
    <line x1="258" y1="172" x2="265" y2="170" stroke="#FFD700" stroke-width="3"/>
    <path d="M150 172 L160 190" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
    <path d="M220 172 L230 190" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
  </g>
"""
    elif expression == "flirty":
        svg += """
  <!-- Flirty eyelashes -->
  <ellipse cx="165" cy="180" rx="11" ry="13" fill="#2C1810"/>
  <circle cx="162" cy="176" r="4.5" fill="#FFFFFF"/>
  <path d="M152 173 L145 168 M155 170 L150 164 M160 168 L158 161" stroke="#2C1810" stroke-width="2.5" stroke-linecap="round"/>
  
  <ellipse cx="235" cy="180" rx="11" ry="13" fill="#2C1810"/>
  <circle cx="232" cy="176" r="4.5" fill="#FFFFFF"/>
  <path d="M248 173 L255 168 M245 170 L250 164 M240 168 L242 161" stroke="#2C1810" stroke-width="2.5" stroke-linecap="round"/>
  
  <!-- Blush -->
  <ellipse cx="150" cy="205" rx="12" ry="6" fill="#FF80AB" opacity="0.6"/>
  <ellipse cx="250" cy="205" rx="12" ry="6" fill="#FF80AB" opacity="0.6"/>
"""
    else:
        svg += """
  <!-- Big Warm Donkey Eyes -->
  <ellipse cx="165" cy="180" rx="10" ry="12" fill="#212121"/>
  <circle cx="163" cy="176" r="4" fill="#FFFFFF"/>
  <ellipse cx="235" cy="180" rx="10" ry="12" fill="#212121"/>
  <circle cx="233" cy="176" r="4" fill="#FFFFFF"/>
  <!-- Eyebrows -->
  <path d="M155 165 Q165 160 175 165" stroke="#3E2723" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M225 165 Q235 160 245 165" stroke="#3E2723" stroke-width="3" stroke-linecap="round" fill="none"/>
"""

    svg += f"""
  <!-- Donkey Muzzle (White/Light soft velvet nose) -->
  <path d="M152 230 C150 210 250 210 248 230 C255 265 240 310 200 310 C160 310 145 265 152 230 Z" fill="{snout_color}" filter="url(#shadow)"/>
  
  <!-- Nostrils -->
  <ellipse cx="178" cy="265" rx="7" ry="11" transform="rotate(-15, 178, 265)" fill="#3E2723"/>
  <ellipse cx="222" cy="265" rx="7" ry="11" transform="rotate(15, 222, 265)" fill="#3E2723"/>
  
  <!-- Cute smile -->
  <path d="M185 285 Q200 295 215 285" stroke="#3E2723" stroke-width="4" stroke-linecap="round" fill="none"/>
  <!-- Gentle chin cleft -->
  <path d="M198 298 Q200 304 202 298" stroke="rgba(0,0,0,0.15)" stroke-width="3" stroke-linecap="round"/>
"""

    # Accessories
    if accessory_type == "flower":
        svg += """
  <!-- Daisy flower behind ear -->
  <g transform="translate(140, 110)">
    <circle cx="0" cy="-12" r="7" fill="#FFFFFF"/>
    <circle cx="11" cy="-4" r="7" fill="#FFFFFF"/>
    <circle cx="7" cy="10" r="7" fill="#FFFFFF"/>
    <circle cx="-7" cy="10" r="7" fill="#FFFFFF"/>
    <circle cx="-11" cy="-4" r="7" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="7" fill="#FFD600"/>
  </g>
"""
    elif accessory_type == "rose":
        svg += """
  <!-- Red Rose in mouth / collar -->
  <g transform="translate(215, 280) rotate(-10)">
    <path d="M0 0 C20 10 30 -5 45 5" stroke="#2E7D32" stroke-width="4" fill="none"/>
    <circle cx="45" cy="5" r="12" fill="#D32F2F"/>
    <circle cx="43" cy="3" r="8" fill="#E53935"/>
    <circle cx="41" cy="2" r="4" fill="#FFCDD2"/>
  </g>
"""
    elif accessory_type == "straw_hat":
        svg += """
  <!-- Rustic Straw Hat -->
  <g transform="translate(200, 105)">
    <!-- Hat Brim -->
    <ellipse cx="0" cy="15" rx="85" ry="22" fill="#FFE082" stroke="#FFB300" stroke-width="4" filter="url(#shadow)"/>
    <!-- Hat Crown -->
    <path d="M-40 12 C-38 -30 38 -30 40 12 Z" fill="#FFCA28" stroke="#FFB300" stroke-width="3"/>
    <!-- Red ribbon -->
    <path d="M-41 8 Q0 15 41 8 Q38 2 0 8 Q-38 2 -41 8 Z" fill="#E53935"/>
  </g>
"""
    elif accessory_type == "beret":
        svg += """
  <!-- French Beret -->
  <g transform="translate(195, 95) rotate(-12)">
    <ellipse cx="0" cy="10" rx="65" ry="24" fill="#263238" filter="url(#shadow)"/>
    <path d="M-45 10 C-30 -15 30 -15 45 10 Z" fill="#37474F"/>
    <circle cx="0" cy="-12" r="4" fill="#263238"/>
  </g>
"""
    elif accessory_type == "bandana":
        svg += """
  <!-- Red Paisley Bandana -->
  <path d="M140 310 Q200 340 260 310 L200 375 Z" fill="#D32F2F" filter="url(#shadow)"/>
  <circle cx="200" cy="335" r="4" fill="#FFFFFF"/>
  <circle cx="180" cy="325" r="3" fill="#FFFFFF"/>
  <circle cx="220" cy="325" r="3" fill="#FFFFFF"/>
  <circle cx="190" cy="350" r="3" fill="#FFFFFF"/>
  <circle cx="210" cy="350" r="3" fill="#FFFFFF"/>
"""
    elif accessory_type == "bowtie":
        svg += """
  <!-- Dapper Bowtie -->
  <g transform="translate(200, 325)">
    <path d="M0 0 L-25 -14 L-25 14 Z" fill="#1565C0" filter="url(#shadow)"/>
    <path d="M0 0 L25 -14 L25 14 Z" fill="#1565C0" filter="url(#shadow)"/>
    <circle cx="0" cy="0" r="7" fill="#0D47A1"/>
  </g>
"""
    elif accessory_type == "monocle":
        svg += """
  <!-- Dapper Monocle -->
  <g transform="translate(235, 180)">
    <circle cx="0" cy="0" r="16" fill="rgba(255,255,255,0.4)" stroke="#FFD700" stroke-width="3"/>
    <path d="M14 8 C25 25 30 50 25 80" stroke="#FFD700" stroke-width="2" fill="none"/>
  </g>
"""
    elif accessory_type == "edelweiss":
        svg += """
  <!-- Alpine Edelweiss & Cowbell -->
  <g transform="translate(200, 335)">
    <!-- Bell collar -->
    <path d="M-50 -10 Q0 5 50 -10 Q45 0 0 15 Q-45 0 -50 -10 Z" fill="#8D6E63"/>
    <rect x="-10" y="5" width="20" height="22" rx="4" fill="#FFD54F" stroke="#FFA000" stroke-width="2"/>
    <circle cx="0" cy="22" r="3" fill="#6D4C41"/>
  </g>
"""

    svg += "\n</svg>"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Generated {filename}")

# Generate Avatars
generate_donkey_svg(
    f"{AVATAR_DIR}/barnaby.svg",
    bg_color=("#8E24AA", "#4A148C"),
    coat_color="#4E342E",
    snout_color="#D7CCC8",
    mane_color="#271810",
    ear_inner_color="#BCAAA4",
    accessory_type="beret",
    expression="normal",
    special_texture="dreads"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/penelope.svg",
    bg_color=("#EC407A", "#880E4F"),
    coat_color="#8D6E63",
    snout_color="#FFF8E1",
    mane_color="#4E342E",
    ear_inner_color="#F8BBD0",
    accessory_type="flower",
    expression="flirty"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/fernando.svg",
    bg_color=("#E53935", "#B71C1C"),
    coat_color="#757575",
    snout_color="#EEEEEE",
    mane_color="#212121",
    ear_inner_color="#B0BEC5",
    accessory_type="rose",
    expression="wink"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/daisy.svg",
    bg_color=("#43A047", "#1B5E20"),
    coat_color="#A1887F",
    snout_color="#FFF9C4",
    mane_color="#5D4037",
    ear_inner_color="#FFCDD2",
    accessory_type="straw_hat",
    expression="smile"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/jasper.svg",
    bg_color=("#039BE5", "#01579B"),
    coat_color="#3E2723",
    snout_color="#CFD8DC",
    mane_color="#1A0C08",
    ear_inner_color="#8D6E63",
    accessory_type="none",
    ear_tilt=6,
    expression="sunglasses"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/clementine.svg",
    bg_color=("#FB8C00", "#E65100"),
    coat_color="#Bcaaa4",
    snout_color="#FFFFFF",
    mane_color="#6D4C41",
    ear_inner_color="#FFAB91",
    accessory_type="bandana",
    expression="wink"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/ziggy.svg",
    bg_color=("#00ACC1", "#006064"),
    coat_color="#546E7A",
    snout_color="#ECEFF1",
    mane_color="#263238",
    ear_inner_color="#90A4AE",
    accessory_type="none",
    expression="wink"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/bella.svg",
    bg_color=("#D81B60", "#4A148C"),
    coat_color="#9E9E9E",
    snout_color="#FFFFFF",
    mane_color="#424242",
    ear_inner_color="#F48FB1",
    accessory_type="flower",
    expression="flirty"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/rusty.svg",
    bg_color=("#558B2F", "#2E7D32"),
    coat_color="#8D6E63",
    snout_color="#EFEBE9",
    mane_color="#3E2723",
    ear_inner_color="#D7CCC8",
    accessory_type="none",
    expression="smile"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/winston.svg",
    bg_color=("#1E88E5", "#0D47A1"),
    coat_color="#616161",
    snout_color="#F5F5F5",
    mane_color="#212121",
    ear_inner_color="#E0E0E0",
    accessory_type="monocle",
    expression="normal"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/gretel.svg",
    bg_color=("#26A69A", "#004D40"),
    coat_color="#795548",
    snout_color="#FFF3E0",
    mane_color="#3E2723",
    ear_inner_color="#FFE0B2",
    accessory_type="edelweiss",
    expression="smile"
)

generate_donkey_svg(
    f"{AVATAR_DIR}/bartholomew.svg",
    bg_color=("#546E7A", "#263238"),
    coat_color="#78909C",
    snout_color="#ECEFF1",
    mane_color="#37474F",
    ear_inner_color="#B0BEC5",
    accessory_type="none",
    expression="normal"
)

# User default donkey profile
generate_donkey_svg(
    f"{AVATAR_DIR}/user-default.svg",
    bg_color=("#FF7043", "#D84315"),
    coat_color="#8D6E63",
    snout_color="#FFF9C4",
    mane_color="#4E342E",
    ear_inner_color="#FFCCBC",
    accessory_type="bowtie",
    expression="smile"
)

# App Logo: Flame shaped silhouette with Donkey Ears
with open("/opt/donkr/public/assets/logo.svg", "w", encoding="utf-8") as f:
    f.write('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF512F" />
      <stop offset="50%" stop-color="#FF7043" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#FF512F" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Flame Base -->
  <path d="M50 5 C60 25 78 40 78 62 C78 78 65 92 50 92 C35 92 22 78 22 62 C22 45 35 30 45 18 C46 28 52 35 55 35 C58 35 56 25 50 5 Z" fill="url(#flameGrad)" filter="url(#glow)"/>
  <!-- Donkey Ear Silhouette Cuts inside flame -->
  <path d="M42 45 C38 32 30 18 36 15 C42 12 45 28 46 42 Z" fill="#FFFFFF" opacity="0.95"/>
  <path d="M58 45 C62 32 70 18 64 15 C58 12 55 28 54 42 Z" fill="#FFFFFF" opacity="0.95"/>
  <!-- Cute little donkey nose curve -->
  <circle cx="50" cy="72" r="5" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="48" cy="72" rx="1" ry="1.5" fill="#FF512F"/>
  <ellipse cx="52" cy="72" rx="1" ry="1.5" fill="#FF512F"/>
</svg>''')

print("All visual assets created successfully!")
