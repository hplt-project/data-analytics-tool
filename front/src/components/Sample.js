import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { rtlLanguages } from "../lib/helpers";
import styles from "@/styles/Sample.module.css";

function Sample({ src, trg, sample, setShowSample }) {
  const [currentSample, setCurrentSample] = useState(0);

  const isDoc = sample[0].src ? false : true;

  const currentSet = sample.slice(
    currentSample,
    isDoc ? currentSample + 1 : currentSample + 10
  );

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
          >
            <X />
          </button>
        </div>
        <div className={styles.sampleSentenceContainer}>
          {currentSet.map((sent) => {
            return (
              <div className={styles.singleSentence}>
                <div className={styles.srcSentence}>
                  {sent.trg && (
                    <div className={styles.srcTag}>{src[0].value}</div>
                  )}
                  <div
                    className={
                      src && rtlLanguages.some((el) => el === src[0].value)
                        ? styles.sampleContentRTL
                        : styles.sampleContent
                    }
                    dangerouslySetInnerHTML={{
                      __html: !sent.src
                        ? sent.startsWith(`"`) ? JSON.parse(sent.replaceAll("\\n", "<br/>").replaceAll("\n", "<br/>")) : sent.replaceAll("\\n", "<br/>").replaceAll("\n", "<br/>")
                        : sent.src.replaceAll("\\n", "<br/>").replaceAll("\n", "<br/>"),
                    }}
                  ></div>
                </div>
                {sent.trg && (
                  <div className={styles.trgSentence}>
                    <div className={styles.trgTag}>{trg[0].value}</div>
                    <div
                      className={
                        src && rtlLanguages.some((el) => el === trg[0].value)
                          ? styles.sampleContentRTL
                          : styles.sampleContent
                      }
                      dangerouslySetInnerHTML={{
                        __html: sent.trg.replaceAll("\\n", "<br/>").replaceAll("\n", "<br/>"),
                      }}
                    ></div>
                  </div>
                )}
                <hr className={styles.stripe}></hr>
              </div>
            );
          })}
        </div>

        {sample[0].src ? (
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
              Currently showing sentences {currentSample + 1}-{currentSample + 10}{" "}
              out of {sample.length}
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
        ) : (
          <div className={styles.sampleButtons}>
            {currentSample + 1 > 1 && (
              <button
                onClick={() =>
                  setCurrentSample((currentSample) =>
                    currentSample + 1 > 1 ? currentSample - 1 : currentSample
                  )
                }
              >
                <ArrowLeft />
              </button>
            )}
            <p>
              Currently showing document {currentSample + 1} out of {sample.length}
            </p>
            {currentSample + 1 < sample.length && (
              <button
                onClick={() =>
                  setCurrentSample((currentSample) =>
                    currentSample < sample.length
                      ? currentSample + 1
                      : currentSample
                  )
                }
              >
                <ArrowRight />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sample;
