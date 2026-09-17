"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ExperienceDetailsOverlay } from "@/components/ui/ExperienceDetailsOverlay";
import { timelineItems } from "@/data/experiences";
import { TimelineItem } from "@/types";
import { useOverlayHistory } from "@/hooks/useOverlayHistory";

export function DetailedAboutSection() {

    const timelineItem = timelineItems;
    const [activeExperience, setActiveExperience] = useState<TimelineItem | null>(null);

    const { handleCloseOverlay } = useOverlayHistory({
        activeItem: activeExperience,
        setActiveItem: setActiveExperience,
        paramName: "experience",
    });

	return (
		<AnimatedSection id="detailed-about" className="bg-[var(--color-bg-secondary)]">
			<div className="container-width grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
				<div>
					<SectionHeader
						label="about"
						title="About Gerald"
					/>

					<div className="space-y-5 text-sm text-[var(--color-text-secondary)] lg:text-base">
						<p>
							Hi, I am Gerald. I am an Informatics student at President
							University and a Google Student Ambassador dedicated to
							engineering full-stack applications that are resilient by design.
							I approach system architecture through the lens of adversarial
							thinking, ensuring that every feature I ship is not just
							functional, but hardened against exploitation.
						</p>
						<p>
							Whether I am building AI-driven compliance platforms or secure
							messaging protocols, my focus remains on bridging the gap between
							rapid product development and rigorous security standards. Beyond
							the code, I thrive on solving complex problems where performance,
							scalability, and security intersect.
						</p>
                        <p>
                            My experience in many events
							has taught me how to lead cross-functional teams and manage
							technical debt in high-pressure environments. I am committed to
							building production-ready systems that users can trust, leveraging
							a modern stack and a security-first mindset to deliver software
							that stays up and stays secure.
                        </p>
					</div>
				</div>

				<div className="flex items-start justify-center lg:justify-end">
					<div className="relative w-full max-w-[18rem] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] sm:max-w-[20rem] lg:max-w-none">
						<div className="relative aspect-[9/10] w-full">
							<Image
								src="/assets/gerald.webp"
								alt="Gerald portrait"
								fill
								sizes="(min-width: 1024px) 30vw, (min-width: 768px) 20rem, 18rem"
								className="object-cover object-top"
								priority
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="container-width mt-12">
				<div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
					<SectionHeader 
                        label="experience timeline"
                        title="Community and Leadership Impact"
                        description="Driving technical excellence and community growth through organizational leadership. A timeline of bridging the gap between engineering rigor and large-scale project execution."
                    />
					<div className="relative mt-10">
						<div
							className="absolute left-3 top-0 h-full w-px bg-[var(--color-border)] lg:left-0 lg:top-6 lg:h-px lg:w-full"
							aria-hidden="true"
						/>
						<div className="space-y-8 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0">
							{timelineItem.map((item) => (
								<div key={item.id} className="relative pl-10 lg:flex lg:h-full lg:flex-col lg:pl-0 lg:pt-12">
									<span
										className="absolute left-[6px] top-1.5 h-3 w-3 rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent)] lg:left-1/2 lg:top-6 lg:-translate-x-1/2 lg:-translate-y-1/2"
										aria-hidden="true"
									/>
									<div className="glass flex flex-1 flex-col rounded-2xl p-4 transition-transform duration-200 hover:scale-[1.02] hover:border-[var(--color-border-hover)]">
										<button
											type="button"
											onClick={() => setActiveExperience(item)}
											className="flex w-full flex-1 flex-col rounded-xl text-left outline-none focus:outline-none focus-visible:outline-none"
											aria-label={`View details for ${item.title}`}
										>
											<p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
												{item.period}
											</p>
											<h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
												{item.title}
											</h3>
											<p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
												{item.org}
											</p>
											<ul className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
												{item.highlights.slice(0, 2).map((highlight, index) => (
													<li key={`${item.id}-${index}`} className="flex gap-2">
														<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
														<span className="line-clamp-2">{highlight}</span>
													</li>
												))}
											</ul>
											{item.highlights.length > 2 ? (
												<p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
													+{item.highlights.length - 2} more
												</p>
											) : null}
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<ExperienceDetailsOverlay experience={activeExperience} onClose={handleCloseOverlay} />
		</AnimatedSection>
	);
}
