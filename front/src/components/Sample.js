import { useState, useRef } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "@/styles/Sample.module.css";

function Sample({ srclang, sample, setShowSample }) {
  const [currentSample, setCurrentSample] = useState(1);

  const rtlLanguages = [
    "ar",
    "ar-AE",
    "ar-BH",
    "ar-DJ",
    "ar-DZ",
    "ar-EG",
    "ar-IQ",
    "ar-JO",
    "ar-KW",
    "ar-LB",
    "ar-LY",
    "ar-MA",
    "ar-OM",
    "ar-QA",
    "ar-SA",
    "ar-SD",
    "ar-SY",
    "ar-TN",
    "ar-YE",
    "fa-AF",
    "fa-IR",
    "fa",
    "he",
    "he-IL",
    "iw",
    "kd",
    "pk-PK",
    "ps",
    "ug",
    "ur",
    "ur-IN",
    "ur-PK",
    "yi",
    "yi-US",
    "ara",
    "pes",
    "fas",
    "heb",
    "pus",
    "pbt",
    "uig",
    "urd",
    "ydd",
  ];
  const containerRef = useRef(null);

  const scrollToTop = () => {
    containerRef.current.scrollTop = 0;
  };

  return (
    <div className={styles.blur}>
      <div className={styles.sampleModal}>
        <div className={styles.modalHead}>
          <h2>Random samples from the {srclang && srclang[0].label} dataset</h2>
          <button
            className={styles.closeSampleBtn}
            onClick={() => {
              setShowSample(false)
            }}
          >
            <X />
          </button>
        </div>
        <div
          className={
            srclang && rtlLanguages.some((el) => el === srclang[0].value)
              ? styles.sampleContentRTL
              : styles.sampleContent
          }
          ref={containerRef}
          dangerouslySetInnerHTML={{
            __html: sample[1][currentSample - 1].replaceAll("\n", "<br/>"),
          }}
        ></div>
        <div className={styles.sampleButtons}>
          {currentSample > 1 && (
            <button
              onClick={() => {
                scrollToTop()
                setCurrentSample((currentSample) =>
                  currentSample > 1 ? currentSample - 1 : currentSample
                )
              }
              }
            >
              <ArrowLeft />
            </button>
          )}
          <p>
            Currently showing doc number {currentSample} out of{" "}
            {sample[1].length}
          </p>
          {currentSample < sample[1].length && (
            <button
              onClick={() => {
                scrollToTop()
                setCurrentSample((currentSample) =>
                  currentSample < sample[1].length
                    ? currentSample + 1
                    : currentSample
                )
              }
              }
            >
              <ArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sample;
