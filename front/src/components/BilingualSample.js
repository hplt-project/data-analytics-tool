import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import styles from "@/styles/BilingualSample.module.css";

function BilingualSample({ srclang, trglang, sample, setShowSample }) {
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

  const currentSet = sample.slice(currentSample, currentSample + 10);

  return (
    <div className={styles.blur}>
      <div className={styles.sampleModal}>
        <div className={styles.modalHead}>
          <h2>
            Random samples from the {srclang[0].label} - {trglang[0].label}{" "}
            dataset
          </h2>
          <button
            className={styles.closeSampleBtn}
            onClick={() => setShowSample(false)}
          >
            <X />
          </button>
        </div>
        <div className={styles.sampleSentenceContainer}>
          {currentSet.map((sent) => {
            return (
              <div className={styles.singleSentence}>
                <div className={styles.srcSentence}>
                  <div className={styles.srcTag}>{srclang[0].value}</div>
                  <div
                    className={
                      srclang &&
                      rtlLanguages.some((el) => el.includes(srclang[0].value))
                        ? styles.sampleContentRTL
                        : styles.sampleContent
                    }
                    dangerouslySetInnerHTML={{
                      __html: sent.src.replaceAll("\n", "<br/>"),
                    }}
                  ></div>
                </div>
                <div className={styles.trgSentence}>
                  <div className={styles.trgTag}>{trglang[0].value}</div>
                  <div
                    className={
                      srclang &&
                      rtlLanguages.some((el) => el.includes(trglang[0].value))
                        ? styles.sampleContentRTL
                        : styles.sampleContent
                    }
                    dangerouslySetInnerHTML={{
                      __html: sent.trg.replaceAll("\n", "<br/>"),
                    }}
                  ></div>
                </div>
                <hr className={styles.stripe}></hr>
              </div>
            );
          })}
        </div>

        <div className={styles.sampleButtons}>
          {currentSample > 1 && (
            <button
              onClick={() =>
                setCurrentSample((currentSample) =>
                  currentSample > 1 ? currentSample - 10 : currentSample
                )
              }
            >
              <ArrowLeft />
            </button>
          )}
          <p>
            Currently showing sentences {currentSample}-{currentSample + 9} out
            of {sample.length}
          </p>
          {currentSample + 10 < sample.length && (
            <button
              onClick={() =>
                setCurrentSample((currentSample) =>
                  currentSample < sample.length
                    ? currentSample + 10
                    : currentSample
                )
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

export default BilingualSample;
