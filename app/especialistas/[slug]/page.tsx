import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpecialistCard } from "@/components/specialist-card";
import { getSpecialistBySlug, SPECIALISTS } from "@/lib/consorcio";

export function generateStaticParams() {
  return SPECIALISTS.map((specialist) => ({ slug: specialist.slug }));
}

export default async function SpecialistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const specialist = getSpecialistBySlug(slug);
  if (!specialist) notFound();

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0b1d36]">
      <SiteHeader />
      <section className="pt-[116px]">
        <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
          <span className="text-xs font-extrabold tracking-[.18em] text-[#b57708]">ESPECIALISTA</span>
          <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">{specialist.name}</h1>
          <div className="mt-10">
            <SpecialistCard specialist={specialist} />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
