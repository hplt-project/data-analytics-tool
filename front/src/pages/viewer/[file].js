import DataAnalyticsReport from "@/components/DataAnalyticsReport";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Oval } from "react-loader-spinner";
import Report from "@/components/Report";

import { languagePairName, multipleFilter } from "../../../hooks/hooks";

import styles from "@/styles/Home.module.css";

import "react-widgets/styles.css";

export default function Home({ fileNames }) {
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");
  const [testReport, setTestReport] = useState(null);

  const [status, setStatus] = useState("IDLE");

  const [fileName, setFileName] = useState("");

  const router = useRouter();

  async function getStats() {
    setStatus("LOADING");
    try {
      const stats = await axios.get(`/api/getstats/${router.query.file}`);

      const statsData = stats.data;
      if (!statsData) {
        setStatus("FAILED");
      }
      if (statsData) {
        setStatus("IDLE");
      }

      setReport(statsData.stats);
      setDate(statsData.date);
      setTestReport(statsData.report);
    } catch (error) {
      setStatus("FAILED");
      console.log(error);
    }
  }

  useEffect(() => {
    const file = router.query.file;

    if (file !== "file") {
      getStats();
      setFileName(file);
    }
  }, [router.query]);

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <div className={styles.dropdownContainer}>
        <p>Select a file</p>
        <div className={styles.flex}>
          <DropdownList
            data={fileNames}
            textField="originalName"
            value={fileName}
            placeholder="fao_Latn.yaml"
            onChange={(e) => router.push(`/viewer/${e.originalName}`)}
            renderListItem={({ item }) => (
              <p className={styles.listItem}>
                <strong>
                  {Array.isArray(item.language) && item.language.length > 1
                    ? `${item.language[0].label} - ${item.language[1].label}`
                    : item.originalName}{" "}
                </strong>
                <span className={styles.version}>
                  {item.originalName.includes("v1.1")
                    ? "Version 1.1"
                    : item.originalName.includes("v1.2")
                      ? "Version 1.2"
                      : item.originalName.includes("v2")
                        ? "Version 2"
                        : ""}
                </span>
                <div className={styles.tagsContainer}>

                  <span
                    className={
                      item.collection === "fineweb"
                        ? styles.finewebPill
                        : item.collection === "hplt"
                          ? styles.hpltPill
                          : ""
                    }
                  >
                    {item.collection}
                  </span>
                </div>
              </p>
            )}
            filter={multipleFilter}
          />
        </div>
      </div>
      <div className={styles.docContainer}>
        {status === "LOADING" && (
          <div className={styles.loader}>
            <h1>Loading stats...</h1>
            <Oval
              visible={true}
              height="100"
              width="100"
              color="#4fa94d"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        )}
        {status === "FAILED" && (
          <div className={styles.failedWarning}>
            Something went wrong with the requested file, please try again.
          </div>
        )}
        {report && status !== "LOADING" && (
          <DataAnalyticsReport reportData={report} date={date} />
        )}
      </div>

      {report && status !== "LOADING" && (
        <Report reportData={report} date={date} testReport={testReport} />
      )}
      <Footer />
    </div>
  );
}
export async function getServerSideProps() {
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/list");

  const list = await apiList.data;

  const removalWords = [
    ".yaml",
    ".lite",
    "fineweb2-",
    ".tsv",
    ".tmx",
    "fineweb100b-",
    "hplt-v2-",
    "hplt-v1.2-",
    "hplt_v1.2_",
    "hplt-v2.",
    "hplt-v1.1.",
    "hplt-v1.2.",
    "hplt_v2_",
    "hplt100b-",
  ];

  const datasetList = list.map((el) => {
    function replaceStringsCaseInsensitive(text, stringsToReplace) {
      let result = text;
      for (const oldString of stringsToReplace) {
        const regex = new RegExp(oldString, "gi");
        result = result.replace(regex, "");
      }
      return result;
    }

    const cleanName = replaceStringsCaseInsensitive(el, removalWords);

    const languageName = cleanName.split("-").length > 2 ? cleanName : languagePairName(cleanName.split("-"));

    const collectionName = el.toLowerCase().includes("fineweb")
      ? "fineweb"
      : el.toLowerCase().includes("hplt")
        ? "hplt"
        : "";



    return {
      originalName: el,
      language: languageName,
      collection: collectionName,
    };
  });

  return {
    props: { fileNames: datasetList },
  };
}
