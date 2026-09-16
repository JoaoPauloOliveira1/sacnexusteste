type Rgb = readonly [number, number, number]

interface AvcbDocumentTheme {
  colors: {
    ink: Rgb
    muted: Rgb
    border: Rgb
    surface: Rgb
    navy: Rgb
    red: Rgb
    yellow: Rgb
    blue: Rgb
    success: Rgb
    successSurface: Rgb
    watermark: Rgb
  }
  page: {
    margin: number
    width: number
    height: number
  }
}

/**
 * Print-specific component tokens for the presentation AVCB.
 *
 * The document intentionally avoids copying protected government artwork.
 * Its semantic hierarchy follows an official administrative document while
 * the watermark keeps the presentation boundary unmistakable.
 */
export const avcbDocumentTheme: AvcbDocumentTheme = {
  colors: {
    ink: [22, 31, 43],
    muted: [83, 94, 108],
    border: [190, 198, 208],
    surface: [246, 248, 250],
    navy: [20, 49, 83],
    red: [196, 34, 54],
    yellow: [244, 190, 43],
    blue: [38, 99, 167],
    success: [20, 97, 46],
    successSurface: [219, 245, 227],
    watermark: [235, 238, 242],
  },
  page: {
    margin: 16,
    width: 210,
    height: 297,
  },
}
