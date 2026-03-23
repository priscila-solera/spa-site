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

/** One booked line: main service + optional add-ons */
type CartLine = {
  serviceId: string;
  addonIds: string[];
};

type Step = "service" | "addons" | "review" | "calendar";

interface Props {
  defaultCalLink?: string;
  services?: Service[];
}

function getServiceById(services: Service[], id: string) {
  return services.find((s) => s.id === id) || null;
}

/**
 * Cal.com (@calcom/embed-react) espera: usuario/evento (sin dominio).
 * Aceptamos URL completa (recomendado en Sanity), path con/sin / inicial, o solo usuario/evento.
 */
function toCalEmbedCalLink(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^https?:\/\/(www\.)?(cal\.com|app\.cal\.com)\//i, "");
  const qi = t.indexOf("?");
  const pathOnly = qi === -1 ? t : t.slice(0, qi);
  const query = qi === -1 ? "" : t.slice(qi);
  const path = pathOnly.replace(/^\/+/, "").trim();
  return path ? `${path}${query}` : t;
}

export default function CalBookingOverlay({
  defaultCalLink = "daniel-torres-calvo",
  services = [],
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [calLink, setCalLink] = useState(() => toCalEmbedCalLink(defaultCalLink));
  const [step, setStep] = useState<Step>("service");
  const [cart, setCart] = useState<CartLine[]>([]);
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

  /** Evita scroll de la página detrás del modal; el scroll queda dentro del panel */
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ calLink?: string; serviceId?: string }>) => {
      const linkRaw = e.detail?.calLink?.trim() || defaultCalLink;
      /** Mismo path que https://cal.com/… pero sin dominio ni / inicial */
      const link = toCalEmbedCalLink(linkRaw);
      const serviceId = e.detail?.serviceId || null;

      setCalLink(link);
      setSelectedServiceId(serviceId);
      setSelectedAddons([]);
      setCart([]);

      if (serviceId && link.includes("/")) {
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
    setCart([]);
    setSelectedServiceId(null);
    setSelectedAddons([]);
  };

  const selectedService = selectedServiceId
    ? getServiceById(services, selectedServiceId)
    : null;

  const availableAddons = selectedService?.addons || [];

  const toggleAddon = (id: string) => {
    setSelectedAddons((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  /** After add-ons: save this service to the cart and go to review (summary) */
  const continueToReview = () => {
    if (!selectedServiceId) return;
    setCart((c) => [...c, { serviceId: selectedServiceId, addonIds: [...selectedAddons] }]);
    setSelectedServiceId(null);
    setSelectedAddons([]);
    setStep("review");
  };

  const addAnotherService = () => {
    setStep("service");
  };

  const removeCartLine = (index: number) => {
    setCart((c) => c.filter((_, i) => i !== index));
  };

  /** Si en resumen quitas todos los servicios, volver al paso 1 */
  useEffect(() => {
    if (!isOpen) return;
    if (step === "review" && cart.length === 0) {
      setStep("service");
      setSelectedServiceId(null);
      setSelectedAddons([]);
    }
  }, [isOpen, step, cart.length]);

  const handleBack = () => {
    if (step === "calendar") {
      if (cart.length > 0) {
        setStep("review");
      } else {
        setStep("service");
        setCalLink(toCalEmbedCalLink(defaultCalLink));
      }
      return;
    }
    if (step === "review") {
      if (cart.length === 0) {
        setStep("service");
        return;
      }
      const last = cart[cart.length - 1];
      setCart((c) => c.slice(0, -1));
      setSelectedServiceId(last.serviceId);
      setSelectedAddons([...last.addonIds]);
      setStep("addons");
      return;
    }
    if (step === "addons") {
      setStep("service");
      setSelectedServiceId(null);
      setSelectedAddons([]);
      return;
    }
    if (step === "service" && cart.length > 0) {
      setStep("review");
    }
  };

  const showHeaderBack =
    step === "calendar" ||
    step === "review" ||
    step === "addons" ||
    (step === "service" && cart.length > 0);

  const goToCalendar = () => {
    if (cart.length === 0) return;

    const parts = cart.map((line) => {
      const svc = getServiceById(services, line.serviceId);
      if (!svc) return "";
      const addons = (svc.addons || []).filter((a) => line.addonIds.includes(a.id));
      const addonBit =
        addons.length > 0
          ? ` + Add-ons: ${addons.map((a) => `${a.title} (${a.price})`).join(", ")}`
          : "";
      return `${svc.title}${addonBit}`;
    }).filter(Boolean);

    const finalNote = `[Appointment includes: ${parts.join(" | ")}]`;
    const firstSvc = getServiceById(services, cart[0].serviceId);
    const rawBase = (firstSvc?.calLink || defaultCalLink).trim().split("?")[0];
    const basePath = toCalEmbedCalLink(rawBase);
    const nextLink = `${basePath}?notes=${encodeURIComponent(finalNote)}`;

    setCalLink(nextLink);
    setStep("calendar");
  };

  const embedPath = toCalEmbedCalLink(calLink).split("?")[0];
  const calConfig = embedPath.includes("/")
    ? { layout: "month_view" as const, useSlotsViewOnSmallScreen: "true" as const }
    : { layout: "column_view" as const, useSlotsViewOnSmallScreen: "false" as const };

  const stepNumber =
    step === "service" ? "1" : step === "addons" ? "2" : step === "review" ? "3" : "3";

  const stepTitle =
    step === "service"
      ? cart.length > 0
        ? "Add another service"
        : "Choose your main service"
      : step === "addons"
        ? "Add extra pampering"
        : step === "review"
          ? "Review your appointment"
          : "";

  const renderLineBlock = (line: CartLine, index: number) => {
    const svc = getServiceById(services, line.serviceId);
    if (!svc) return null;
    const addons = (svc.addons || []).filter((a) => line.addonIds.includes(a.id));
    return (
      <div
        key={`${line.serviceId}-${index}`}
        className="mb-4 border-b border-beige-200/80 pb-4 last:mb-0 last:border-0 last:pb-0"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-secondary">{svc.title}</p>
        </div>
        <p className="mt-1 text-xs text-beige-500">With any staff member · Tamarindo</p>
        <div className="mt-2 space-y-1 text-xs">
          {svc.duration && (
            <p>
              <span className="font-semibold text-secondary">Duration:</span> {svc.duration}
            </p>
          )}
          {svc.price && (
            <p>
              <span className="font-semibold text-secondary">Price:</span> {svc.price}
            </p>
          )}
        </div>
        {addons.length > 0 && (
          <div className="mt-3 border-t border-beige-200/60 pt-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-beige-500">
              Add-ons
            </p>
            <ul className="mt-1 space-y-1 text-xs">
              {addons.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <span>{a.title}</span>
                  <span className="font-semibold">{a.price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/40 p-3 backdrop-blur-md sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Reservar cita"
    >
      <div className="absolute inset-0" onClick={close} aria-hidden="true" />
      <div className="relative z-10 my-auto flex min-h-0 w-full max-w-5xl max-h-[min(90dvh,90vh)] flex-col overflow-hidden rounded-2xl border border-beige-200/90 bg-cream-50 shadow-2xl ring-1 ring-black/[0.06] sm:max-w-6xl">
        {/* Cabecera */}
        <div className="flex shrink-0 items-center gap-2 border-b border-beige-200/70 bg-gradient-to-r from-cream-100 to-beige-100/40 px-3 py-3 sm:px-5 sm:py-3.5">
          <div className="flex w-10 shrink-0 justify-start sm:w-11">
            {showHeaderBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full p-2 text-beige-600 transition-colors hover:bg-beige-200/60 hover:text-beige-800 focus:outline-none focus:ring-2 focus:ring-[#b8956e]/40"
                aria-label="Back · Atrás"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
          </div>
          <span className="min-w-0 flex-1 text-center font-serif text-base font-medium tracking-tight text-beige-700 sm:text-left sm:text-lg">
            {step === "calendar" ? "Select Date & Time" : "Schedule Your Appointment"}
          </span>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-full p-2 text-beige-600 transition-colors hover:bg-beige-200/60 hover:text-beige-800 focus:outline-none focus:ring-2 focus:ring-[#b8956e]/40"
            aria-label="Close · Cerrar"
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
              key={toCalEmbedCalLink(calLink)}
              namespace={NAMESPACE}
              calLink={toCalEmbedCalLink(calLink)}
              style={{ width: "100%", overflow: "hidden" }}
              config={calConfig}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-beige-100/80 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              {/* Columna izquierda */}
              <div className="flex min-h-0 flex-col overflow-hidden bg-white max-md:max-h-[50vh]">
                <div className="border-b border-beige-200/80 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-beige-500">
                    Step {stepNumber} of 3
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight text-secondary">{stepTitle}</h2>
                </div>

                {step === "service" && (
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
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
                              {service.description && (
                                <p className="mt-1 line-clamp-2 text-sm text-beige-500">{service.description}</p>
                              )}
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-beige-500">
                                {service.duration && <span>{service.duration}</span>}
                                {service.price && (
                                  <span className="font-semibold text-secondary">{service.price}</span>
                                )}
                              </div>
                            </div>
                            <span
                              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-beige-300 text-xs text-secondary"
                              aria-hidden="true"
                            >
                              &gt;
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {step === "addons" && (
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
                    {availableAddons.length > 0 ? (
                      <>
                        <p className="mb-3 text-sm text-beige-500">
                          Enhance your experience with any of these add-ons:
                        </p>
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
                                    <span
                                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.65rem] ${isActive ? "border-secondary bg-secondary text-primary" : "border-beige-300 text-beige-500"}`}
                                      aria-hidden="true"
                                    >
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
                      <button
                        type="button"
                        onClick={() => setStep("service")}
                        className="text-xs font-medium text-beige-500 underline-offset-2 hover:underline"
                      >
                        Back to services
                      </button>
                      <button
                        type="button"
                        onClick={continueToReview}
                        disabled={!selectedServiceId}
                        className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-secondary/90 disabled:opacity-50"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
                      <p className="mb-4 text-sm text-beige-600">
                        You can add more services before choosing your time. Everything will be sent in one booking
                        request.
                      </p>
                      <ul className="space-y-3">
                        {cart.map((line, i) => {
                          const svc = getServiceById(services, line.serviceId);
                          if (!svc) return null;
                          return (
                            <li
                              key={`${line.serviceId}-${i}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-beige-200/90 bg-cream-50/50 px-4 py-3 text-sm"
                            >
                              <div>
                                <p className="font-medium text-secondary">{svc.title}</p>
                                {line.addonIds.length > 0 && (
                                  <p className="mt-0.5 text-xs text-beige-500">
                                    {line.addonIds.length} add-on{line.addonIds.length > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCartLine(i)}
                                className="shrink-0 text-xs font-medium text-beige-500 underline-offset-2 hover:text-secondary hover:underline"
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna derecha: resumen */}
              <div className="flex min-h-0 flex-col overflow-hidden bg-cream-50/80 max-md:max-h-[40vh]">
                <div className="border-b border-beige-200/70 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-beige-500">
                    Appointment Summary
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 text-sm text-beige-600 [-webkit-overflow-scrolling:touch]">
                  {cart.length === 0 && !selectedService && (
                    <p className="text-xs text-beige-500">
                      Select a service on the left to see your appointment summary here.
                    </p>
                  )}
                  {cart.map((line, i) => renderLineBlock(line, i))}
                  {step === "addons" && selectedService && (
                    <div className="mt-2 rounded-xl border border-dashed border-[#b8956e]/50 bg-white/60 p-3">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#b8956e]">
                        Adding now
                      </p>
                      <p className="mt-1 font-medium text-secondary">{selectedService.title}</p>
                      <div className="mt-2 space-y-1 text-xs">
                        {selectedService.duration && (
                          <p>
                            <span className="font-semibold text-secondary">Duration:</span>{" "}
                            {selectedService.duration}
                          </p>
                        )}
                        {selectedService.price && (
                          <p>
                            <span className="font-semibold text-secondary">Base price:</span>{" "}
                            {selectedService.price}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 border-t border-beige-200/80 pt-2">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-beige-500">
                          Add-ons
                        </p>
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
                    </div>
                  )}
                </div>
                <div className="shrink-0 border-t border-beige-200/80 px-5 py-3">
                  {step === "review" ? (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={addAnotherService}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-secondary px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5"
                      >
                        <span className="text-lg leading-none" aria-hidden="true">
                          +
                        </span>
                        Add another service
                      </button>
                      <button
                        type="button"
                        onClick={goToCalendar}
                        disabled={cart.length === 0}
                        className="inline-flex w-full items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-secondary/90 disabled:opacity-50"
                      >
                        Schedule appointment
                      </button>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-beige-500">
                      Continue to review, then add more services or pick your time.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
