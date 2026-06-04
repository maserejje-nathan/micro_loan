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

    const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
    const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

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
            className={cn(
                'relative w-full border-b border-chart-2/15',
                className,
            )}
            aria-roledescription="carousel"
            aria-label="Welcome highlights"
        >
            <div className="relative w-full overflow-hidden">
                <div className="relative aspect-[21/7] w-full min-h-[180px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[320px]">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                                {slide.caption && (
                                    <p className="absolute bottom-4 left-4 right-4 max-w-xl text-sm font-medium text-foreground sm:bottom-6 sm:left-8 sm:text-base md:text-lg">
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
                                className="absolute left-4 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur-sm hover:bg-background sm:left-6"
                                onClick={goPrev}
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="size-5" />
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute right-4 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur-sm hover:bg-background sm:right-6"
                                onClick={goNext}
                                aria-label="Next slide"
                            >
                                <ChevronRight className="size-5" />
                            </Button>

                            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-4">
                                {slides.map((slide, index) => (
                                    <button
                                        key={`dot-${index}`}
                                        type="button"
                                        className={cn(
                                            'size-2 rounded-full transition-all',
                                            index === activeIndex
                                                ? 'w-6 bg-chart-2'
                                                : 'bg-foreground/40 hover:bg-foreground/60',
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
            </div>
        </section>
    );
}
