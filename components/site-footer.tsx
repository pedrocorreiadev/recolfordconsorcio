export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#06162e] py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f5b942] font-black text-[#09234a]">RF</span>
            <strong>Recol Ford Consórcio</strong>
          </div>
          <p className="mt-4 max-w-lg text-xs leading-6 text-white/45">
            Protótipo front-end arquivado. As simulações são ilustrativas, não salvam dados e não representam proposta comercial ativa.
          </p>
        </div>
        <div className="text-sm text-white/50">
          <p>Proposta descontinuada</p>
          <p className="mt-2">Rio Branco, Acre</p>
        </div>
      </div>
    </footer>
  );
}
