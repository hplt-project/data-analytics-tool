import Spinner from "./Spinner";
import styles from "@/styles/Loader.module.css";

function Loader() {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayText}>
        <h1>Please wait. Your report is being generated</h1>{" "}
        <Spinner light label="Generating report" />
      </div>
    </div>
  );
}

export default Loader;
