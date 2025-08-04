import styles from "@/styles/SampleButton.module.css";
import buttonStyles from "@/styles/Uploader.module.css";

function SampleButton({ setShowSample, dName }) {

  return (
    <>
      <div className={styles.sampleBtnCont}>
        <button
          className={buttonStyles["button-32"]}
          onClick={() => {
            setShowSample((sample) => !sample)
          }}
        >
          See dataset sample
        </button>{" "}
      </div>
    </>
  );
}

export default SampleButton;
