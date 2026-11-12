import Image from "next/image"

const MIN_FRAMES = 6

export function ClosetCarousel({ photos }: { photos: string[] }) {
  if (!photos.length) return null

  // The remaining two copies cover the viewport after one copy scrolls past.
  const frameCount = Math.max(MIN_FRAMES, photos.length)
  const frames = Array.from(
    { length: frameCount },
    (_, index) => photos[index % photos.length]
  )

  return (
    <div className="w-full pb-6 [--frame-gap:clamp(7px,1.4vw,14px)] [--frame-width:clamp(92px,26vw,max(248px,8.5vw))]">
      <div className="overflow-hidden" aria-hidden="true">
        <div className="flex w-max motion-safe:animate-closet-scroll">
          {[0, 1, 2].map((copy) => (
            <div
              className="flex w-max gap-(--frame-gap) pe-(--frame-gap)"
              key={copy}
            >
              {frames.map((src, index) => (
                <div
                  className="relative aspect-[5/8] w-(--frame-width) overflow-hidden bg-surface"
                  key={`${src}-${index}`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 353px) 92px, (max-width: 953px) 26vw, max(248px, 8.5vw)"
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
