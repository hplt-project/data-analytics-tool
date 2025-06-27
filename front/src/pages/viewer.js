import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";
import { languagePairName, multipleFilter } from "../../hooks/hooks";

import "react-widgets/styles.css";

import styles from "@/styles/Home.module.css";

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
          <DropdownList
            data={fileNames}
            textField="originalName"
            placeholder="fao_Latn.yaml"
            onChange={(e) => setSelected(e.originalName)}
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
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const axios = require("axios");

  const api = "http://dat-webapp:8000/"

  const apiList = await axios.get(`${api}list`);

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
