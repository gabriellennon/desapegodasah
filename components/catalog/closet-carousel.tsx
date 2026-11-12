"use client"

import Image from "next/image"
import { Pause, Play } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import styles from "./closet-carousel.module.css"

const MIN_FRAMES = 6

export function ClosetCarousel({ photos }: { photos: string[] }) {
  const [paused, setPaused] = useState(false)

  if (!photos.length) return null

  // Each copy of the track must fill the viewport, even for a small drop.
  const frameCount = Math.max(MIN_FRAMES, photos.length)
  const frames = Array.from(
    { length: frameCount },
    (_, index) => photos[index % photos.length]
  )

  return (
    <div className={styles.carousel} data-paused={paused}>
      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <div className={styles.sequence} key={copy}>
              {frames.map((src, index) => (
                <div className={styles.frame} key={`${src}-${index}`}>
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 353px) 92px, (max-width: 953px) 26vw, 248px"
                    loading={copy === 0 && index < 4 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={`container ${styles.controls}`}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-full bg-background"
          aria-label={
            paused ? "Retomar carrossel de fotos" : "Pausar carrossel de fotos"
          }
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </Button>
      </div>
    </div>
  )
}
