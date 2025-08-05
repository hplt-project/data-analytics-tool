import Report from "@/components/Report";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Oval } from "react-loader-spinner";
import { languagePairName, multipleFilter, replaceStringsCaseInsensitive, removalWords } from "@/lib/helpers";

import pillStyles from "@/styles/NGramsTable.module.css";

import styles from "@/styles/Home.module.css";

import "react-widgets/styles.css";

export default function Home({ fileNames }) {
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");

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

      setReport(statsData.report);
      setDate(statsData.date);
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
                    : item.originalName.replace(".yaml", "")}{" "}
                </strong>
                {item.originalName.includes("v1.1")
                  ? <span className={styles.v1dot1}>Version 1.1</span>
                  : item.originalName.includes("v1.2")
                    ? <span className={styles.v1dot2}>Version 1.2</span>
                    : item.originalName.includes("v2")
                      ? <span className={styles.v2}>Version 2</span>
                      : item.originalName.includes("v3") ? <span className={styles.v3}>Version 3</span> : ""}

                <div className={styles.tagsContainer}>
                  <span
                    className={
                      item.collection === "fineweb"
                        ? [pillStyles.pill, pillStyles[`pill-teal`]].join(
                          " "
                        )
                        : item.collection === "hplt"
                          ? [pillStyles.pill, pillStyles[`pill-red`], pillStyles.hplt].join(
                            " "
                          )
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
        {status !== "LOADING" && (
          <Report date={date} report={report} />
        )}
      </div>
      <Footer />
    </div>
  );
}
export async function getServerSideProps() {
  const axios = require("axios");

  const apiBase = process.env.API_URL;

  const apiList = await axios.get(`${apiBase}list`);

  const list = await apiList.data;


  const datasetList = list.map((el) => {

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
