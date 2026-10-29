# Logo EcoLink

- `ecolink-logo-original.png`: salinan gambar asli yang diberikan pengguna, tanpa perubahan.
- `ecolink-mark.png`: simbol daun-rantai dengan latar transparan untuk favicon dan komponen `BrandMark`. Wordmark tetap memakai teks EcoLink yang ada di antarmuka.

Simbol disiapkan menggunakan skill imagegen dalam mode built-in, dengan gambar asli sebagai edit target. Pemeriksaan alpha memastikan latar transparan tersedia. Berkas keluaran disalin ke proyek tanpa menghapus sumbernya.

Prompt yang digunakan:

> Use case: background-extraction. Edit target: the supplied EcoLink Leaf Link Logo PNG. Produce an extracted icon asset for a website navbar and favicon. Isolate ONLY the existing paired green leaves joined by the white chain-link symbol above the EcoLink text. Remove the EcoLink lettering and all white page background. Preserve the exact original leaf silhouettes, chain shape, diagonal orientation (bottom left to top right), green gradient colors, folds, and proportions. Keep the intentional white chain-link stroke white and opaque; the exterior background and empty areas outside the logo must be genuinely transparent alpha. Do not redesign, reinterpret, add elements, add a border, add a shadow, add a glow, or change the symbol. Tight square framing with the symbol centered and filling about 90% of the square; roughly 5% transparent padding per side. High quality clean edges, transparent PNG, one isolated mark, no text.
