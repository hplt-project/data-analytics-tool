import { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "@/styles/Sample.module.css";

function Sample({ srclang, sample, setShowSample }) {
  const [currentSample, setCurrentSample] = useState(1);
  return (
    <div className={styles.blur}>
      <div className={styles.sampleModal}>
        <div className={styles.modalHead}>
          <h2>Random samples from the {srclang && srclang[0].label} dataset</h2>
          <button
            className={styles.closeSampleBtn}
            onClick={() => setShowSample(false)}
          >
            <X />
          </button>
        </div>
        <div
          className={styles.sampleContent}
          dangerouslySetInnerHTML={{
            __html: sample[1][currentSample - 1].replaceAll("\n", "<br/>"),
          }}
        ></div>
        <div className={styles.sampleButtons}>
          {currentSample > 1 && (
            <button
              onClick={() =>
                setCurrentSample((currentSample) =>
                  currentSample > 1 ? currentSample - 1 : currentSample
                )
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
              onClick={() =>
                setCurrentSample((currentSample) =>
                  currentSample < sample[1].length
                    ? currentSample + 1
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

export default Sample;
