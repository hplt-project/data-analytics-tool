import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { rtlLanguages } from "../lib/helpers";
import styles from "@/styles/Sample.module.css";

const PAGE_SIZE = 10;

function decodeSampleText(value) {
  if (typeof value !== "string") return "";

  if (value.startsWith(`"`)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value.replaceAll("\\n", "\n");
}

function SampleText({ value, lang }) {
  const isRtl = rtlLanguages.some((rtlLang) => rtlLang === lang);

  return (
    <div className={isRtl ? styles.sampleContentRTL : styles.sampleContent}>
      {decodeSampleText(value)}
    </div>
  );
}

function Sample({ src, trg, sample, setShowSample }) {
  const [currentSample, setCurrentSample] = useState(0);

  const isDoc = !sample[0].src;
  const step = isDoc ? 1 : PAGE_SIZE;
  const lastSample = Math.max(sample.length - step, 0);

  const currentSet = sample.slice(currentSample, currentSample + step);
  const canGoBack = currentSample > 0;
  const canGoForward = currentSample + step < sample.length;

  const showPrevious = () => {
    setCurrentSample((previous) => Math.max(previous - step, 0));
  };

  const showNext = () => {
    setCurrentSample((previous) => Math.min(previous + step, lastSample));
  };

  return (
    <div className={styles.blur}>
      <div className={styles.sampleModal}>
        <div className={styles.modalHead}>
          <h2>
            Random samples from the {src[0].label}{" "}
            {trg?.[0] ? `- ${trg[0].label}` : ""} dataset
          </h2>
          <button
            className={styles.closeSampleBtn}
            onClick={() => setShowSample(false)}
            type="button"
            aria-label="Close samples"
          >
            <X />
          </button>
        </div>
        <div className={styles.sampleSentenceContainer}>
          {currentSet.map((sent, index) => {
            const key = `sample-${currentSample + index}`;

            return (
              <div className={styles.singleSentence} key={key}>
                <div className={styles.srcSentence}>
                  {sent.trg && (
                    <div className={styles.srcTag}>{src[0].value}</div>
                  )}
                  <SampleText value={sent.src || sent} lang={src?.[0]?.value} />
                </div>
                {sent.trg && (
                  <div className={styles.trgSentence}>
                    <div className={styles.trgTag}>{trg[0].value}</div>
                    <SampleText value={sent.trg} lang={trg?.[0]?.value} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.sampleButtons}>
          <button
            onClick={showPrevious}
            type="button"
            disabled={!canGoBack}
            aria-label={isDoc ? "Previous document" : "Previous sentences"}
          >
            <ArrowLeft size={18} />
          </button>
          <p>
            {isDoc
              ? `Document ${currentSample + 1} of ${sample.length}`
              : `Sentences ${currentSample + 1}-${Math.min(
                currentSample + PAGE_SIZE,
                sample.length
              )} of ${sample.length}`}
          </p>
          <button
            onClick={showNext}
            type="button"
            disabled={!canGoForward}
            aria-label={isDoc ? "Next document" : "Next sentences"}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sample;
