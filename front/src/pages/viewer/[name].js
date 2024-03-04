import styles from "@/styles/Home.module.css";
import DataAnalyticsReport from "../../../components/DataAnalyticsReport";
import { useState } from "react";
import { useRouter } from "next/router";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function Home({ fileNames, doc, date }) {
  const router = useRouter();

  const [selected, setSelected] = useState("");

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <div className={styles.flex}>
          <select
            className={styles["form-select"]}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {fileNames.map((file, idx) => {
              return (
                <option value={file} key={idx}>
                  {file}
                </option>
              );
            })}
          </select>

          <button
            className={styles.loadStatsBtn}
            onClick={() => {
              if (selected)
                router.push(
                  {
                    pathname: `/viewer/${selected}`,
                  },
                  undefined
                );
            }}
          >
            Load dataset stats
          </button>
        </div>
      </div>
      <div className={styles.docContainer}>
        {doc && <DataAnalyticsReport reportData={doc} date={date} />}
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const yaml = require("js-yaml");
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/list");

  const list = apiList.data;
  if (list.length) {
    list.pop();
  }

  const listNames = list.length ? list.map((a) => a.replace(".yaml", "")) : "";

  let doc = "";

  if (context.query.name != "name") {
    const stats = await axios.get(
      `http://dat-webapp:8000/file/${context.query.name}.yaml`
    );

    const statsData = stats.data;

    doc = yaml.load(statsData);
  }

  // DATE

  let d;
  if (context.query.name !== "name") {
    if ("timestamp" in doc) {
      const timestamp_ms = doc["timestamp"];
      const timestamp_secs = timestamp_ms * 1000;
      d = new Date(timestamp_secs).toLocaleString();
    } else {
      d = "n/a;";
    }
  }

  return {
    props: { fileNames: listNames, doc: doc, date: d ? d : "" },
  };
}
