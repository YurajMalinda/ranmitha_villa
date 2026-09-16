'use client'

import { useState } from 'react';

type EffectKind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

function effectKind(code: number): EffectKind {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2 || code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if (code === 95 || code === 96 || code === 99) return 'storm';
    return 'rain'; // drizzle, rain, showers — everything else in the WMO set we use
}

/**
 * Purely decorative, animated weather layered onto the hero photo. Only
 * mounts once live weather has loaded (see HeroSection), so the randomized
 * drop/flake positions generated here never exist during SSR or the first
 * client render — there is nothing for hydration to compare them against.
 */
export function WeatherEffects({ code }: { code: number }) {
    const kind = effectKind(code);

    // One-off randomness belongs in a lazy useState initializer, not useMemo —
    // React may discard and recompute a memo at will, which would reshuffle
    // drop positions on a re-render; a lazy initial state runs exactly once.
    const [drops] = useState(() =>
        Array.from({ length: 45 }, () => {
            // A depth factor gives the rain a sense of near/far instead of every
            // drop looking identical: nearer drops fall faster, thicker, more
            // opaque and longer; farther ones are thinner, fainter, slower.
            const depth = Math.random();
            return {
                left: Math.random() * 100,
                duration: 1.3 - depth * 0.8,
                delay: -Math.random() * 1.3,
                height: 30 + depth * 70,
                opacity: 0.25 + depth * 0.55,
                width: 0.5 + depth * 1.5,
            };
        })
    );

    const [flakes] = useState(() =>
        Array.from({ length: 30 }, () => ({
            left: Math.random() * 100,
            duration: 6 + Math.random() * 5,
            delay: -Math.random() * 10,
            size: 3 + Math.random() * 4,
        }))
    );

    if (kind === 'clear') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Ambient warm wash */}
                <div
                    className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,214,143,0.5) 0%, rgba(255,214,143,0) 70%)',
                        animation: 'weather-sun-glow 4s ease-in-out infinite alternate',
                    }}
                />
                {/* The sun itself — a blown-out camera highlight, not a drawn
                    icon: a small hot-white core, a soft warm falloff, and a
                    faint horizontal lens-flare streak. Real sunlight in a
                    photo reads as bloom, not defined ray lines. */}
                <div className="absolute top-10 right-10 sm:top-14 sm:right-20 w-20 h-20 sm:w-28 sm:h-28">
                    <div
                        className="absolute top-1/2 left-1/2 w-[500%] h-px -translate-x-1/2 -translate-y-1/2 blur-sm"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,244,214,0.35) 45%, rgba(255,244,214,0.35) 55%, transparent)' }}
                    />
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle, rgba(255,255,250,1) 0%, rgba(255,244,214,0.9) 25%, rgba(255,224,153,0.5) 50%, rgba(255,214,143,0) 75%)',
                            boxShadow: '0 0 90px 40px rgba(255,214,143,0.3)',
                            animation: 'weather-sun-glow 4s ease-in-out infinite alternate',
                        }}
                    />
                </div>
            </div>
        );
    }

    if (kind === 'fog') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[8, 38, 68].map((topPct, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full blur-2xl bg-white/40"
                        style={{
                            top: `${topPct}%`,
                            left: '-25%',
                            width: '80%',
                            height: '16%',
                            animation: `weather-fog-drift ${10 + i * 4}s ease-in-out infinite alternate`,
                        }}
                    />
                ))}
            </div>
        );
    }

    if (kind === 'cloudy') {
        // Each "cloud" is a cluster of overlapping blurred circles of varying
        // size, not one flat bar — reads as an irregular cumulus silhouette
        // instead of a smear, and the whole cluster drifts together.
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[6, 40, 70].map((topPct, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            top: `${topPct}%`,
                            left: '-25%',
                            width: '80%',
                            height: '30%',
                            animation: `weather-cloud-drift ${10 + i * 4}s ease-in-out infinite alternate`,
                        }}
                    >
                        <div className="absolute rounded-full blur-2xl bg-white/30" style={{ left: '8%', top: '15%', width: '50%', height: '90%' }} />
                        <div className="absolute rounded-full blur-2xl bg-white/25" style={{ left: '0%', top: '40%', width: '35%', height: '60%' }} />
                        <div className="absolute rounded-full blur-2xl bg-white/30" style={{ left: '42%', top: '5%', width: '48%', height: '85%' }} />
                        <div className="absolute rounded-full blur-2xl bg-white/20" style={{ left: '65%', top: '35%', width: '30%', height: '55%' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (kind === 'snow') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {flakes.map((f, i) => (
                    <div
                        key={i}
                        className="absolute top-0 rounded-full bg-white/80"
                        style={{
                            left: `${f.left}%`,
                            width: f.size,
                            height: f.size,
                            animation: `weather-snowfall ${f.duration}s linear infinite`,
                            animationDelay: `${f.delay}s`,
                        }}
                    />
                ))}
            </div>
        );
    }

    // rain or storm
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {drops.map((d, i) => (
                <div
                    key={i}
                    className="absolute top-0 bg-gradient-to-b from-white/0 via-white to-white/0"
                    style={{
                        left: `${d.left}%`,
                        width: d.width,
                        height: d.height,
                        opacity: d.opacity,
                        animation: `weather-rainfall ${d.duration}s linear infinite`,
                        animationDelay: `${d.delay}s`,
                    }}
                />
            ))}
            {kind === 'storm' && (
                <div
                    className="absolute inset-0 bg-white"
                    style={{ animation: 'weather-lightning 7s ease-in-out infinite' }}
                />
            )}
        </div>
    );
}
