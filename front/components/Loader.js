import { Oval } from "react-loader-spinner";
import styles from "@/styles/Loader.module.css";

function Loader() {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayText}>
        <h1>Please wait. Your report is being generated</h1>{" "}
        <Oval
          visible={true}
          height="46"
          width="46"
          color="#ffffff"
          ariaLabel="oval-loading"
          wrapperStyle={{}}
          wrapperClass="wrapper"
          secondaryColor="white"
          strokeWidth={4}
          strokeWidthSecondary={4}
        />
      </div>
    </div>
  );
}

export default Loader;
