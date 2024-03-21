import DataAnalyticsReport from "../../../components/DataAnalyticsReport";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import styles from "@/styles/Home.module.css";

import "react-widgets/styles.css";

export default function Home({ fileNames }) {
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");

  const router = useRouter();

  async function getStats() {
    const stats = await axios.get(`/api/getstats/${router.query.file}`);

    const statsData = stats.data;

    setReport(statsData.stats);
    setDate(statsData.date);
  }

  useEffect(() => {
    const file = router.query.file;

    if (file !== "file") {
      getStats();
    }
  }, [router.query]);

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <div className={styles.flex}>
          {/* <select
            className={styles["form-select"]}
            defaultValue=""
            onChange={(e) => router.push(`/viewer/${e.target.value}`)}
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
          </select> */}
          <DropdownList
            data={fileNames}
            placeholder="CCMatrix"
            onChange={(e) => router.push(`/viewer/${e}`)}
          />
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
