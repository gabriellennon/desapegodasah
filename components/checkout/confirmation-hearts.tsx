import { Heart } from "lucide-react"
import type { CSSProperties } from "react"

const hearts = [
  { left: 14, size: 21, drift: -32, delay: 0.15 },
  { left: 86, size: 25, drift: 38, delay: 0.4 },
  { left: 22, size: 34, drift: 49, delay: 0.7 },
  { left: 76, size: 19, drift: -38, delay: 0.95 },
  { left: 9, size: 17, drift: 44, delay: 1.35 },
  { left: 90, size: 33, drift: -47, delay: 1.6 },
  { left: 25, size: 25, drift: -36, delay: 2 },
  { left: 82, size: 21, drift: 46, delay: 2.25 },
  { left: 18, size: 30, drift: 32, delay: 2.65 },
  { left: 72, size: 26, drift: -33, delay: 2.9 },
]

export function ConfirmationHearts() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden text-secondary motion-reduce:hidden"
    >
      {hearts.map(({ left, size, drift, delay }) => (
        <Heart
          key={delay}
          className="absolute bottom-0 animate-checkout-heart fill-current opacity-0"
          style={
            {
              left: left + "%",
              width: size,
              height: size,
              animationDelay: delay + "s",
              "--heart-drift": drift + "px",
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
