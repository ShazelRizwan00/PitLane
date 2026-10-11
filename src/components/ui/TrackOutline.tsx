interface TrackOutlineProps {
  circuitId?: string;
  className?: string;
}

/**
 * Authentic clean SVG circuit track outlines for Formula 1 venues.
 * Static vectors with no heavy raster filters or infinite CPU animation loops.
 */
export function TrackOutline({ circuitId, className = 'w-full h-full' }: TrackOutlineProps) {
  switch (circuitId) {
    case 'sepang':
      return (
        <svg
          viewBox="0 0 500 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M 100,120 L 400,120 C 425,120 435,145 420,165 L 330,240 C 315,255 295,245 290,225 L 275,170 C 270,155 255,150 240,160 L 210,180 C 195,190 175,185 170,170 L 150,120 L 100,280 C 85,300 65,280 75,255 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'americas':
      return (
        <svg
          viewBox="0 0 500 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M 80,240 L 120,80 C 125,60 145,65 155,80 L 180,120 C 190,135 210,135 220,120 L 245,85 C 255,70 275,70 285,85 L 410,130 C 425,135 435,155 425,170 L 360,250 C 350,265 330,265 320,250 L 290,210 C 280,195 260,195 250,210 L 220,250 C 205,270 175,270 160,250 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'monaco':
      return (
        <svg
          viewBox="0 0 500 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M 320,270 L 420,230 C 435,225 440,205 430,190 L 360,80 C 350,65 330,65 320,80 L 270,140 C 265,150 250,150 245,140 L 230,110 C 220,95 200,95 190,110 L 120,210 C 110,225 115,245 130,255 L 210,290 C 225,295 245,285 250,270 L 270,220 C 275,205 295,205 300,220 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'silverstone':
      return (
        <svg
          viewBox="0 0 500 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M 120,240 L 180,260 C 200,265 220,250 225,230 L 245,150 C 250,130 270,120 290,130 L 370,170 C 390,180 415,170 420,150 L 430,90 C 435,70 415,55 395,65 L 280,110 C 260,120 240,110 230,90 L 190,60 C 170,45 145,55 140,75 L 100,190 C 95,210 105,235 120,240 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'marina_bay':
    default:
      // Marina Bay Street Circuit (Singapore)
      return (
        <svg
          viewBox="0 0 500 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M 410,230 L 415,260 C 416,275 405,285 390,285 L 310,285 C 295,285 285,275 285,260 L 285,245 C 285,235 275,230 265,230 L 205,230 C 195,230 190,220 190,210 L 190,175 C 190,165 180,160 170,165 L 125,190 C 115,195 105,190 100,180 L 75,120 C 70,110 75,98 85,92 L 140,65 C 150,60 162,65 168,75 L 195,120 C 200,130 212,135 222,130 L 290,95 C 300,90 312,95 318,105 L 345,150 C 350,158 360,162 370,160 L 435,145 C 445,143 455,150 458,160 L 465,190 C 468,205 458,220 442,225 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="410"
            y1="225"
            x2="410"
            y2="235"
            stroke="var(--color-primary)"
            strokeWidth="4"
            strokeLinecap="square"
          />
        </svg>
      );
  }
}
