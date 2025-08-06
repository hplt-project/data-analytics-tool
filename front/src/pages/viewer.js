import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";
import { DropdownList } from "react-widgets";
import { languagePairName, multipleFilter, removalWords } from "@/lib/helpers";

import pillStyles from "@/styles/NGramsTable.module.css";

import "react-widgets/styles.css";

import styles from "@/styles/Home.module.css";

export default function Home({ fileNames }) {
  const [selected, setSelected] = useState("");

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
