import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type WelcomeBannerSlide = {
    image_url: string;
    alt: string;
    caption: string | null;
};

type WelcomeBannerSliderProps = {
    slides: WelcomeBannerSlide[];
    className?: string;
    autoPlayMs?: number;
};

export function WelcomeBannerSlider({
    slides,
    className,
    autoPlayMs = 6000,
}: WelcomeBannerSliderProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const count = slides.length;

    const goTo = useCallback(
        (index: number) => {
            if (count === 0) {
                return;
            }

            setActiveIndex(((index % count) + count) % count);
        },
        [count],
    );

    const goNext = useCallback(
        () => goTo(activeIndex + 1),
        [activeIndex, goTo],
    );
    const goPrev = useCallback(
        () => goTo(activeIndex - 1),
        [activeIndex, goTo],
    );

    useEffect(() => {
        if (count <= 1) {
            return;
        }

        const timer = window.setInterval(goNext, autoPlayMs);

        return () => window.clearInterval(timer);
    }, [count, autoPlayMs, goNext]);

    if (count === 0) {
        return null;
    }

    const activeSlide = slides[activeIndex];

    return (
        <section
            className={cn('relative w-full overflow-hidden', className)}
            aria-roledescription="carousel"
            aria-label="Welcome highlights"
        >
            <div className="relative aspect-[21/8] min-h-[220px] w-full md:min-h-[300px]">
                {slides.map((slide, index) => (
                    <div
                        key={`${slide.image_url}-${index}`}
                        className={cn(
                            'absolute inset-0 transition-opacity duration-700 ease-in-out',
                            index === activeIndex
                                ? 'opacity-100'
                                : 'pointer-events-none opacity-0',
                        )}
                        aria-hidden={index !== activeIndex}
                    >
                        <img
                            src={slide.image_url}
                            alt={slide.alt}
                            className="size-full object-cover"
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061612]/80 via-[#061612]/20 to-transparent" />
                        {slide.caption && (
                            <p className="absolute right-4 bottom-4 left-4 max-w-xl text-sm font-medium text-white sm:bottom-6 sm:left-6 sm:text-base md:text-lg">
                                {slide.caption}
                            </p>
                        )}
                    </div>
                ))}

                {count > 1 && (
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute top-1/2 left-4 z-10 size-9 -translate-y-1/2 rounded-none border-0 bg-white/90 text-[#12201B] shadow-none hover:bg-white sm:left-6"
                            onClick={goPrev}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute top-1/2 right-4 z-10 size-9 -translate-y-1/2 rounded-none border-0 bg-white/90 text-[#12201B] shadow-none hover:bg-white sm:right-6"
                            onClick={goNext}
                            aria-label="Next slide"
                        >
                            <ChevronRight className="size-5" />
                        </Button>

                        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-4">
                            {slides.map((_, index) => (
                                <button
                                    key={`dot-${index}`}
                                    type="button"
                                    className={cn(
                                        'h-1.5 transition-all',
                                        index === activeIndex
                                            ? 'w-6 bg-[#A8D5C4]'
                                            : 'w-1.5 bg-white/40 hover:bg-white/70',
                                    )}
                                    onClick={() => goTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={
                                        index === activeIndex
                                            ? 'true'
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <p className="sr-only" aria-live="polite">
                Slide {activeIndex + 1} of {count}: {activeSlide.alt}
            </p>
        </section>
    );
}
