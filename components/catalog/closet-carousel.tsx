import Image from "next/image"
import styles from "./closet-carousel.module.css"

const MIN_FRAMES = 6

export function ClosetCarousel({ photos }: { photos: string[] }) {
  if (!photos.length) return null

  // Each copy of the track must fill the viewport, even for a small drop.
  const frameCount = Math.max(MIN_FRAMES, photos.length)
  const frames = Array.from(
    { length: frameCount },
    (_, index) => photos[index % photos.length]
  )

  return (
    <div className={styles.carousel}>
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
    </div>
  )
}
