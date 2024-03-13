import styles from "@/styles/Home.module.css";
import DataAnalyticsReport from "../../components/DataAnalyticsReport";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";

export default function Home({ fileNames }) {
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (selected) {
      router.push(`/viewer/${selected}`);
    }
  }, [selected]);

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <div className={styles.flex}>
          <select
            className={styles["form-select"]}
            defaultValue=""
            onChange={(e) => setSelected(e.target.value)}
          >
            {" "}
            <option value="" disabled>
              Select your option
            </option>
            {fileNames.map((file, idx) => {
              return (
                <option value={file} key={idx}>
                  {file}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className={styles.docContainer}>
        {report && <DataAnalyticsReport reportData={report} date={date} />}
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/list");

  const list = apiList.data;
  if (list.length) {
    list.pop();
  }

  const listNames = list.length ? list.map((a) => a.replace(".yaml", "")) : "";

  return {
    props: { fileNames: listNames },
  };
}
