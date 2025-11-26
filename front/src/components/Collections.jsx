// components/Collections.jsx (pages router friendly)
import { useEffect, useMemo, useRef, useState } from "react";
import Copy from "@/components/icons/Copy";
import s from "@/styles/Collections.module.css";

export default function Collections({ collections = [], setPopup, total = 0 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPopup(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPopup]);

  const { main, othersList } = useMemo(() => {
    const carrier = collections.find((el) => Array.isArray(el?.others));
    const othersList = carrier?.others ?? [];
    const main = collections.filter((el) => !Array.isArray(el?.others));
    return { main, othersList };
  }, [collections]);

  const hasMain = main.length > 0;
  const hasOthers = othersList.length > 0;
  const titleForOthers = hasMain ? "Others breakdown" : "Collections";

  const pct = (n) => (total ? ((n * 100) / total).toFixed(2) : "0.00");

  // no-deps toast
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 1600);
  };

  const copyText = async (txt) => {
    try {
      await (navigator.clipboard?.writeText(txt) ?? Promise.reject());
      showToast("Copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast("Copied!");
      } catch {
        showToast("Copy failed");
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const oneLine = (el) =>
    `${el.token} - ${el.freq.toLocaleString("en-US")} | ${pct(el.freq)}%`;

  const copyAll = () => {
    const names = [
      ...main.map((m) => m.token),
      ...othersList.map((o) => o.token),
    ];
    copyText(JSON.stringify(names));
  };

  const empty = !hasMain && !hasOthers;

  return (
    <>
      <div
        className={`${s.toast} ${toast ? s.toastShow : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>

      <div className={s.backdrop} onClick={() => setPopup(false)}>
        <div
          className={s.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="collections-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className={s.header}>
            <div className={s.headerLeft}>
              <h2 id="collections-title" className={s.title}>
                Document collections
              </h2>
              <p className={s.subtitle}>
                Total: <strong>{total.toLocaleString("en-US")}</strong>
              </p>
            </div>

            <div className={s.headerActions}>
              {!empty && (
                <button
                  type="button"
                  className={s.copyAll}
                  onClick={copyAll}
                  title="Copy all names"
                >
                  <Copy size={18} />
                  <span>Copy all</span>
                </button>
              )}
              <button
                type="button"
                className={s.close}
                aria-label="Close modal"
                onClick={() => setPopup(false)}
                title="Close"
              >
                ×
              </button>
            </div>
          </header>

          <div className={s.body}>
            {empty && (
              <div className={s.empty}>
                <p>No collections to display.</p>
              </div>
            )}

            {hasMain && (
              <section className={s.section}>
                <h3 className={s.sectionTitle}>Top collections</h3>
                <div className={s.grid}>
                  {main.map((el, i) => (
                    <span
                      key={`main-${el.token}-${i}`}
                      className={`${s.pill} ${s.pillMain}`}
                      title={oneLine(el)}
                    >
                      <span className={s.token}>{el.token}</span>
                      <span className={s.meta}>
                        <button
                          type="button"
                          className={s.copyBtn}
                          onClick={() => copyText(oneLine(el))}
                          aria-label={`Copy ${el.token} line`}
                          title="Copy line"
                        >
                          <Copy size={15} />
                        </button>
                        <span className={s.freq}>
                          <strong>{el.freq.toLocaleString("en-US")}</strong>
                          <span className={s.sep}>•</span>
                          {pct(el.freq)}%
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </section>
            )}

            {hasOthers && (
              <section className={s.section}>
                <h3 className={`${s.sectionTitle} ${s.othersTitle}`}>
                  {titleForOthers}{" "}
                  <span className={s.count}>({othersList.length})</span>
                </h3>
                <div className={s.grid}>
                  {othersList.map((el, i) => (
                    <span
                      key={`other-${el.token}-${i}`}
                      className={`${s.pill} ${s.pillOther}`}
                      title={oneLine(el)}
                    >
                      <span className={s.token}>{el.token}</span>
                      <span className={s.meta}>
                        <button
                          type="button"
                          className={s.copyBtn}
                          onClick={() => copyText(oneLine(el))}
                          aria-label={`Copy ${el.token} line`}
                          title="Copy line"
                        >
                          <Copy size={15} />
                        </button>
                        <span className={s.freq}>
                          <strong>{el.freq.toLocaleString("en-US")}</strong>
                          <span className={s.sep}>•</span>
                          {pct(el.freq)}%
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
