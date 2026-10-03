import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import useMobileMotion from './useMobileMotion';

// Animate the native scroll position, not a transform, so swipe and autoplay
// always operate on the same track and cannot fight one another.
const AutoScrollMarquee = ({ children, label, speed = 50 }) => {
    const viewportRef = useRef(null);
    const groupRef = useRef(null);
    const interaction = useRef({ pointer: false, focus: false, until: 0 });
    const lastAutoPosition = useRef(null);
    const reducedMotion = useReducedMotion();
    const mobile = useMobileMotion();

    const pauseTemporarily = () => {
        interaction.current.until = performance.now() + 1100;
    };

    useEffect(() => {
        const viewport = viewportRef.current;
        const group = groupRef.current;
        if (!viewport || !group || reducedMotion) return;

        let frame;
        let previousTime = 0;
        let visible = false;
        let menuOpen = document.documentElement.dataset.mobileMenuOpen === 'true';
        let position = viewport.scrollLeft;
        let cycleWidth = group.getBoundingClientRect().width;
        // Prioritize the user's vertical scroll over secondary autoplay work.
        const onPageScroll = () => {
            interaction.current.until = Math.max(interaction.current.until, performance.now() + 180);
        };
        if (mobile) window.addEventListener('scroll', onPageScroll, { passive: true });
        const sizeObserver = new ResizeObserver(() => {
            cycleWidth = group.getBoundingClientRect().width;
        });
        sizeObserver.observe(group);

        const tick = (time) => {
            const delta = previousTime ? Math.min(time - previousTime, 50) : 0;
            previousTime = time;
            const state = interaction.current;
            if (visible && !document.hidden && !state.pointer && !state.focus && time > state.until && cycleWidth > 0) {
                // Retain subpixel progress even when the browser rounds scrollLeft.
                position = (position + speed * delta / 1000) % cycleWidth;
                viewport.scrollLeft = position;
                lastAutoPosition.current = viewport.scrollLeft;
            } else {
                position = viewport.scrollLeft;
            }
            frame = requestAnimationFrame(tick);
        };

        const visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            syncAnimation();
        });
        const syncAnimation = () => {
            previousTime = 0;
            if (visible && !menuOpen && !document.hidden && !frame) frame = requestAnimationFrame(tick);
            if ((!visible || menuOpen || document.hidden) && frame) {
                cancelAnimationFrame(frame);
                frame = undefined;
            }
        };
        const onMenuActivity = () => {
            menuOpen = document.documentElement.dataset.mobileMenuOpen === 'true';
            syncAnimation();
        };
        document.addEventListener('mobile-menu-activity', onMenuActivity);
        document.addEventListener('visibilitychange', syncAnimation);
        visibilityObserver.observe(viewport);

        return () => {
            cancelAnimationFrame(frame);
            sizeObserver.disconnect();
            visibilityObserver.disconnect();
            document.removeEventListener('mobile-menu-activity', onMenuActivity);
            document.removeEventListener('visibilitychange', syncAnimation);
            if (mobile) window.removeEventListener('scroll', onPageScroll);
        };
    }, [reducedMotion, speed, mobile]);

    return (
        <div>
            <div
                ref={viewportRef}
                role="region"
                aria-label={label}
                tabIndex={0}
                className="overflow-x-auto no-scrollbar overscroll-x-contain py-5 focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:-outline-offset-2"
                onPointerLeave={() => {
                    if (interaction.current.pointer) {
                        interaction.current.pointer = false;
                        pauseTemporarily();
                    }
                }}
                onPointerDown={() => {
                    interaction.current.pointer = true;
                    interaction.current.focus = false;
                    pauseTemporarily();
                }}
                onPointerUp={() => { interaction.current.pointer = false; pauseTemporarily(); }}
                onPointerCancel={() => { interaction.current.pointer = false; pauseTemporarily(); }}
                onWheel={(event) => {
                    if (event.deltaX !== 0 || event.shiftKey) pauseTemporarily();
                }}
                onKeyDown={pauseTemporarily}
                onFocusCapture={(event) => {
                    // Touch browsers focus links too; only keyboard focus should
                    // hold the animation indefinitely after the finger lifts.
                    if (event.target.matches(':focus-visible')) interaction.current.focus = true;
                }}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) interaction.current.focus = false;
                }}
                onScroll={() => {
                    if (lastAutoPosition.current === null || Math.abs(viewportRef.current.scrollLeft - lastAutoPosition.current) > 1) {
                        pauseTemporarily();
                    }
                }}
            >
                <div className="flex w-max items-stretch">
                    <div ref={groupRef} className="flex shrink-0 items-stretch gap-4 pl-4 md:gap-6 md:pl-6">
                        {children}
                    </div>
                    {!reducedMotion && (
                        <div className="flex shrink-0 items-stretch gap-4 pl-4 md:gap-6 md:pl-6">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoScrollMarquee;