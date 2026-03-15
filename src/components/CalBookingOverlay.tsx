import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const EVENT_OPEN = "open-cal-booking";
const NAMESPACE = "booking";

type Addon = {
  id: string;
  title: string;
  slug: string;
  price: string;
  description?: string;
};

type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  order: number;
  calLink?: string;
  ctaLabel?: string;
  price?: string;
  duration?: string;
  addons?: Addon[];
};

type Step = "service" | "addons" | "summary" | "calendar";

interface Props {
  defaultCalLink?: string;
  services?: Service[];
}

export default function CalBookingOverlay({
  defaultCalLink = "daniel-torres-calvo",
  services = [],
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [calLink, setCalLink] = useState(defaultCalLink);
  const [step, setStep] = useState<Step>("service");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    (async function () {
      try {
        const api = await getCalApi({ namespace: NAMESPACE });
        if (api) {
          api("ui", {
            hideEventTypeDetails: false,
            theme: "auto",
            styles: { branding: { brandColor: "#b8956e" } },
          });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<{ calLink?: string; serviceId?: string }>) => {
      const link = e.detail?.calLink?.trim() || defaultCalLink;
      const serviceId = e.detail?.serviceId || null;

      setCalLink(link);
      setSelectedServiceId(serviceId);
      setSelectedAddons([]);

      if (serviceId && link.includes('/')) {
        setStep("calendar");
      } else {
        setStep("service");
      }

      setIsOpen(true);
    };
    window.addEventListener(EVENT_OPEN, handler as EventListener);
    return () => window.removeEventListener(EVENT_OPEN, handler as EventListener);
  }, [defaultCalLink]);

  const close = () => {
    setIsOpen(false);
    setStep("service");
    setSelectedServiceId(null);
    setSelectedAddons([]);
  };

  const selectedService = selectedServiceId
    ? services.find((s) => s.id === selectedServiceId) || null
    : null;

  const availableAddons = selectedService?.addons || [];

  const toggleAddon = (id: string) => {
    setSelectedAddons((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const goToSummary = () => {
    if (!selectedService && services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
    setStep("summary");
  };

  const goToCalendar = () => {
    let nextLink = selectedService?.calLink || defaultCalLink;

    if (selectedAddons.length > 0) {
      const selectedAddonObjects = availableAddons.filter(addon =>
        selectedAddons.includes(addon.id)
      );
      const notesText = selectedAddonObjects
        .map(addon => `${addon.title} (${addon.price})`)
        .join(', ');

      const finalNote = `[Selected Add-ons: ${notesText}]`;
      const separator = nextLink.includes('?') ? '&' : '?';
      nextLink = `${nextLink}${separator}notes=${encodeURIComponent(finalNote)}`;
    }

    setCalLink(nextLink);
    setStep("calendar");
  };

  const calConfig = calLink.includes('/')
    ? { layout: "month_view", useSlotsViewOnSmallScreen: "true" }
    : { layout: "column_view" };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/40 p-3 backdrop-blur-md sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Reservar cita"
    >
      <div className="absolute inset-0" onClick={close} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-beige-200/90 bg-cream-50 shadow-2xl ring-1 ring-black/[0.06] max-h-[90vh] sm:max-w-6xl">
        {/* Cabecera */}
        <div className="flex shrink-0 items-center justify-between border-b border-beige-200/70 bg-gradient-to-r from-cream-100 to-beige-100/40 px-5 py-3.5">
          <span className="font-serif text-lg font-medium tracking-tight text-beige-700">
            {step === "calendar" ? "Select Date & Time" : "Schedule Your Appointment"}
          </span>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-beige-600 transition-colors hover:bg-beige-200/60 hover:text-beige-800 focus:outline-none focus:ring-2 focus:ring-[#b8956e]/40"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="h-[2px] shrink-0 bg-gradient-to-r from-transparent via-[#b8956e]/60 to-transparent" aria-hidden="true" />

        {/* Contenido principal */}
        {step === "calendar" ? (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
            <Cal
              namespace={NAMESPACE}
              calLink={calLink}
              style={{ width: "100%", overflow: "hidden" }}
              config={calConfig}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 bg-white">
            <div className="grid h-full gap-px bg-beige-100/80 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              {/* Columna izquierda */}
              <div className="flex flex-col bg-white">
                <div className="border-b border-beige-200/80 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-beige-500">
                    Step {step === "service" ? "1" : "2"} of 3
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight text-secondary">
                    {step === "service" ? "Choose your main service" : "Add extra pampering"}
                  </h2>
                </div>

                {step === "service" && (
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <ul className="divide-y divide-beige-200/80">
                      {services.map((service) => (
                        <li key={service.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(service.id);
                              setStep("addons");
                            }}
                            className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-cream-50"
                          >
                            <div>
                              <p className="font-medium text-secondary">{service.title}</p>
                              {service.description && <p className="mt-1 text-sm text-beige-500 line-clamp-2">{service.description}</p>}
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-beige-500">
                                {service.duration && <span>{service.duration}</span>}
                                {service.price && <span className="font-semibold text-secondary">{service.price}</span>}
                              </div>
                            </div>
                            <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-beige-300 text-xs text-secondary" aria-hidden="true">&gt;</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {step === "addons" && (
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {availableAddons.length > 0 ? (
                      <>
                        <p className="mb-3 text-sm text-beige-500">Enhance your experience with any of these add-ons:</p>
                        <ul className="space-y-2">
                          {availableAddons.map((addon) => {
                            const isActive = selectedAddons.includes(addon.id);
                            return (
                              <li key={addon.id}>
                                <button
                                  type="button"
                                  onClick={() => toggleAddon(addon.id)}
                                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${isActive ? "border-secondary bg-secondary/5 text-secondary" : "border-beige-200 bg-white text-secondary"}`}
                                >
                                  <span>{addon.title}</span>
                                  <span className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-secondary">{addon.price}</span>
                                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.65rem] ${isActive ? "border-secondary bg-secondary text-primary" : "border-beige-300 text-beige-500"}`} aria-hidden="true">
                                      {isActive ? "✓" : "+"}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : (
                      <p className="text-sm text-beige-500">No add-ons available for this service.</p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <button type="button" onClick={() => setStep("service")} className="text-xs font-medium text-beige-500 underline-offset-2 hover:underline">Back to services</button>
                      <button type="button" onClick={goToSummary} className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-secondary/90">Continue</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna derecha: resumen */}
              <div className="flex flex-col bg-cream-50/80">
                <div className="border-b border-beige-200/70 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-beige-500">Appointment Summary</p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-beige-600">
                  {selectedService ? (
                    <>
                      <p className="font-medium text-secondary">{selectedService.title}</p>
                      <p className="mt-1 text-xs text-beige-500">With any staff member · Tamarindo Spa</p>
                      <div className="mt-3 space-y-1 text-xs">
                        {selectedService.duration && <p><span className="font-semibold text-secondary">Duration:</span> {selectedService.duration}</p>}
                        {selectedService.price && <p><span className="font-semibold text-secondary">Base price:</span> {selectedService.price}</p>}
                      </div>
                      <div className="mt-4 border-t border-beige-200/80 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-beige-500">Add-ons</p>
                        {selectedAddons.length === 0 ? (
                          <p className="mt-1 text-xs text-beige-500">None selected yet.</p>
                        ) : (
                          <ul className="mt-1 space-y-1 text-xs">
                            {selectedAddons.map((id) => {
                              const addon = availableAddons.find((a) => a.id === id);
                              if (!addon) return null;
                              return (
                                <li key={id} className="flex items-center justify-between">
                                  <span>{addon.title}</span>
                                  <span className="font-semibold">{addon.price}</span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-beige-500">Select a service on the left to see your appointment summary here.</p>
                  )}
                </div>
                <div className="border-t border-beige-200/80 px-5 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" className="text-xs font-medium text-beige-500 underline-offset-2 hover:underline">Add another service</button>
                    <button type="button" onClick={goToCalendar} className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-secondary shadow-sm transition-colors hover:bg-accent/90 disabled:opacity-60" disabled={!selectedService}>Schedule Appointment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
