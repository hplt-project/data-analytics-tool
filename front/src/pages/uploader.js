import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Footer from "../../components/Footer";

import Navbar from "../../components/Navbar";
import { languagePairName } from "../../hooks/hooks";

import styles from "@/styles/Uploader.module.css";

let messageSent = false;

export default function Uploader({ languageList }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  async function onSubmitForm(data) {
    const formdata = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "corpus") {
        formdata.set(key, value[0]);
      } else {
        formdata.set(key, value);
      }
    });

    console.log(formdata, "did I mess up?");

    let config = {
      method: "POST",
      url: "/api/upload",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    };

    try {
      const res = await axios(config);
      if (res.status === 200) {
        console.log("Dataset uploaded Successfully");
        messageSent = true;
        reset();
      }
    } catch (err) {
      console.error(err, "Request failed ");
    }
  }

  return (
    <div className={styles["main-container"]}>
      <Navbar />
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        id="upload-form"
        encType="multipart/form-data"
      >
        <div className={styles["form-group"]}>
          <div className={styles["input-group"]}>
            <div className={styles["name-cont"]}>
              <label className={styles["form-label"]} htmlFor="corpusname">
                Name
              </label>
              <input
                className={styles["form-control"]}
                id="corpusname"
                type="text"
                name="corpusname"
                placeholder="Dataset name"
                {...register("corpusname", {
                  required: { value: true, message: "Please add a name" },
                })}
              ></input>
            </div>
            <div className={styles["file-cont"]}>
              <label className={styles["form-label"]} htmlFor="file">
                File
              </label>
              <input
                className={[styles["form-control"], styles["file-input"]].join(
                  " "
                )}
                id="corpus"
                name="corpus"
                type="file"
                multiple
                {...register("corpus", {
                  required: {
                    value: true,
                    message: "Your dataset is required",
                  },
                })}
              />
            </div>
          </div>
          <div className={styles["inputs"]}>
            <div className={styles["form-check-inline"]}>
              <label className={styles["form-label"]} htmlFor="corpus-format">
                Corpus format
              </label>
            </div>
            <div className={styles["input-cont"]}>
              <input
                className={styles["form-check-input"]}
                type="radio"
                name="corpus-format"
                id="corpus-format-tsv"
                value="tsv"
                checked
                {...register("corpus-format")}
              />
              <label
                className={styles["form-check-label"]}
                htmlFor="corpus-format-tsv"
              >
                TSV
              </label>
            </div>
            <div
              className={[
                styles["form-check"],
                styles["form-check-inline"],
              ].join(" ")}
            >
              <input
                className={styles["form-check-input"]}
                type="radio"
                name="corpus-format"
                id="corpus-format-tmx"
                value="tmx"
                {...register("corpus-format")}
              />
              <label
                className={styles["form-check-label"]}
                htmlFor="corpus-format-tmx"
              >
                TMX
              </label>
            </div>
          </div>

          <div className={styles["inputs"]}>
            <div className={styles["form-check-inline"]}>
              <label className={styles["form-label"]} htmlFor="lang-format">
                Language
              </label>
            </div>
            <div className={styles["input-cont"]}>
              <input
                className={styles["form-check-input"]}
                type="radio"
                name="lang-format"
                id="lang-format-mono"
                value="mono"
                {...register("lang-format")}
              />

              <label
                className={styles["form-check-label"]}
                htmlFor="lang-format-mono"
              >
                Mono
              </label>
            </div>
            <div
              className={[
                styles["form-check"],
                styles["form-check-inline"],
              ].join(" ")}
            >
              <input
                className={styles["form-check-input"]}
                type="radio"
                name="lang-format"
                id="lang-format-parallel"
                value="parallel"
                checked
                {...register("lang-format")}
              />
              <label
                className={styles["form-check-label"]}
                htmlFor="lang-format-parallel"
              >
                Parallel
              </label>
            </div>
          </div>
          <div className={styles["lang-inputs"]}>
            <div className={styles["dropdown-cont"]}>
              <label className={styles["form-label"]} htmlFor="srclang">
                Source language
              </label>
              <select
                name="srclang"
                id="srclang"
                className={styles["form-select"]}
                required
                {...register("srclang")}
              >
                {languageList.map((lang, idx) => {
                  const { value, label } = lang;
                  return (
                    <option value={value} className="option" key={idx}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles["dropdown-cont"]}>
              <label className={styles["form-label"]} htmlFor="trglang">
                Target language
              </label>
              <select
                name="trglang"
                id="trglang"
                className={styles["form-select"]}
                {...register("trglang")}
              >
                {languageList.map((lang, idx) => {
                  const { value, label } = lang;
                  return (
                    <option value={value} className="option" key={idx}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className={styles["uploader-buttons"]}>
          <button
            className={styles["button-26"]}
            type="submit"
            form="upload-form"
          >
            Upload
          </button>
          <button
            id="getcmd-button"
            className={styles["button-27"]}
            type="button"
            form="upload-form"
          >
            Get cmd
          </button>
          <a className={styles["button-28"]} href="/viewer/name">
            Go to viewer
          </a>
        </div>
      </form>
      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const axios = require("axios");

  const apiList = await axios.get("http://dat-webapp:8000/opus_langs");

  const list = apiList.data;

  const languageListing = languagePairName(list.languages);

  return {
    props: { languageList: languageListing },
  };
}