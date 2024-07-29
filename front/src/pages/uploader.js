import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Footer from "../../components/Footer";
import { CheckSquare2, Copy, XCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import { languagePairName } from "../../hooks/hooks";
import CopyToClipboard from "react-copy-to-clipboard";
import { DropdownList } from "react-widgets/cjs";
import { ColorRing } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";

import styles from "@/styles/Uploader.module.css";
import "react-widgets/styles.css";

export default function Uploader({ languageList }) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		reset,
	} = useForm();

	const [upload, setUpload] = useState(false);

	const [status, setStatus] = useState(false);

	const [docs, setDocs] = useState(false);

	const [cmd, setCmd] = useState("");

	const [failedCMD, setFailedCMD] = useState("");

	const [uploadStatus, setUploadStatus] = useState("");

	const [cmdStatus, setCmdStatus] = useState("");
	const [missingFile, setMissingFile] = useState(false);

	const toastMessage = (alert) => {
		setTimeout(() => {
			if (alert === "upload") {
				setUpload(false);
			}
			if (alert === "file") {
				setMissingFile(false);
			}
			if (alert === "cmd") {
				setFailedCMD(false);
			}
		}, 3000);
	};

	async function onSubmitForm(data) {
		if (Object.entries(data)[1][1][0]) {
			setUploadStatus("UPLOADING");
			const formdata = new FormData();

			Object.entries(data).forEach(([key, value]) => {
				if (key === "corpus") {
					formdata.set(key, value[0]);
				} else {
					formdata.set(key, value);
				}
			});

			if (!data.trglang) {
				formdata.set("trglang", "-");
			}
			let config = {
				method: "POST",
				url: "/api/upload/upload",
				data: formdata,
				headers: { "Content-Type": "multipart/form-data" },
			};

			try {
				const res = await axios(config);
				if (res.status === 200) {
					setUploadStatus("");
					setUpload(true);
					toastMessage("upload");
					reset();
					setStatus(false);
				}
			} catch (err) {
				console.error(err, "Request failed ");
			}
		} else {
			setMissingFile(true);
			toastMessage("file");
		}
	}
	async function getCmd(data) {
		const formdata = new FormData();

		setCmdStatus("UPLOADING");

		Object.entries(data).forEach(([key, value]) => {
			if (key === "corpus" && value) {
				formdata.set(key, value[0]);
			} else {
				formdata.set(key, value);
			}
		});

		if (!data.trglang) {
			formdata.set("trglang", "-");
		}

		let config = {
			method: "POST",
			url: "/api/getcmd/cmd",
			data: formdata,
			headers: { "Content-Type": "multipart/form-data" },
		};

		try {
			const res = await axios(config);
			if (res.status === 200) {
				setCmd(res.data);
				setCmdStatus("");
			}
		} catch (err) {
			setFailedCMD(true);
			setCmdStatus("");
			toastMessage("cmd");
			console.error(err, "Request failed ");
		}
	}

	return (
		<div className={styles["main-container"]}>
			{missingFile && (
				<div className={styles.toaster}>
					Please select a file to upload.{" "}
					<XCircle strokeWidth={1.5} width={26} className={styles.xCircle} />
				</div>
			)}
			{failedCMD && (
				<div className={styles.toaster}>
					Something went wrong getting CMD{" "}
					<XCircle strokeWidth={1.5} width={26} className={styles.xCircle} />
				</div>
			)}
			<Navbar />
			{upload && (
				<div className={styles.uploadToast}>
					<h2>
						Your dataset was successfully uploaded!
						<CheckSquare2
							className={styles.partyIcon}
							size={24}
							strokeWidth={1.5}
						/>
					</h2>
					<p>Have some patience. Processing might take some time.</p>
				</div>
			)}
			{cmd && (
				<div className={styles.cmd}>
					<button className={styles.closeCmd} onClick={() => setCmd("")}>
						Close <XCircle strokeWidth={1.5} className={styles.closeIcon} />
					</button>
					<div className={styles.cmdContainer}>
						<p>{cmd}</p>
					</div>
					<CopyToClipboard text={cmd}>
						<button onClick={() => toast.success("CMD Copied to clipboard!")}>
							Copy CMD
							<Copy className={styles.copyIcon} strokeWidth={1.3} />
						</button>
					</CopyToClipboard>
					<Toaster />
				</div>
			)}

			{uploadStatus === "UPLOADING" && (
				<div className={styles.loaderContainer}>
					<div className={styles.loader}>
						<h1>Your dataset is being uploaded...</h1>
						<ColorRing
							visible={true}
							height="100"
							width="100"
							color="#4fa94d"
							ariaLabel="oval-loading"
							wrapperStyle={{}}
							wrapperClass=""
						/>
					</div>
				</div>
			)}
				{cmdStatus === "UPLOADING" && (
				<div className={styles.loaderContainer}>
					<div className={styles.loader}>
						<h1>Processing file and generating CMD...</h1>
						<ColorRing
							visible={true}
							height="100"
							width="100"
							color="#4fa94d"
							ariaLabel="oval-loading"
							wrapperStyle={{}}
							wrapperClass=""
						/>
					</div>
				</div>
			)}
			<form id="upload-form" encType="multipart/form-data">
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
								{...register("corpus")}
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
								defaultChecked
								onClick={(e) => {
									if (e.target.checked) {
										setStatus(false);
										setDocs(false);
									}
								}}
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
								onClick={(e) => {
									if (e.target.checked) {
										setStatus(false);
										setDocs(false);
									}
								}}
								{...register("corpus-format")}
							/>
							<label
								className={styles["form-check-label"]}
								htmlFor="corpus-format-tmx"
							>
								TMX
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
								value="docs"
								onClick={(e) => {
									if (e.target.checked) {
										setStatus(true);
										setDocs(true);
									}
								}}
								{...register("corpus-format")}
							/>
							<label
								className={styles["form-check-label"]}
								htmlFor="corpus-format-tmx"
							>
								Documents
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
								onClick={(e) => {
									e.target.checked ? setStatus(true) : "";
								}}
								{...register("lang-format")}
							/>
							<label
								className={styles["form-check-label"]}
								htmlFor="lang-format-mono"
							>
								Mono
							</label>
						</div>
						{!docs && (
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
									onClick={(e) => {
										e.target.checked ? setStatus(false) : "";
									}}
									defaultChecked
									{...register("lang-format")}
								/>

								<label
									className={styles["form-check-label"]}
									htmlFor="lang-format-parallel"
								>
									Parallel
								</label>
							</div>
						)}
					</div>
					<div className={styles["lang-inputs"]}>
						<div className={styles["dropdown-cont"]}>
							<label className={styles["form-label"]} htmlFor="srclang">
								Source language
							</label>
							<DropdownList
								name="srclang"
								placeholder="Polish (pl)"
								id="srclang"
								data={languageList}
								dataKey="value"
								textField="label"
								onChange={(value) => setValue("srclang", value.value)}
								style={
									uploadStatus === "UPLOADING" ? { position: "static" } : {}
								}
							/>
						</div>
						{!status && (
							<div className={styles["dropdown-cont"]}>
								<label className={styles["form-label"]} htmlFor="trglang">
									Target language
								</label>
								<DropdownList
									name="trglang"
									placeholder="Bosnian (bs)"
									id="trglang"
									data={languageList}
									dataKey="value"
									textField="label"
									onChange={(value) => setValue("trglang", value.value)}
									style={
										cmdStatus === "UPLOADING" ? { position: "static" } : {}
									}
								/>
							</div>
						)}
					</div>
				</div>

				<div className={styles["uploader-buttons"]}>
					<button
						id="submit-button"
						className={styles["button-26"]}
						type="button"
						form="upload-form"
						onClick={handleSubmit(onSubmitForm)}
					>
						Upload
					</button>
					<button
						id="getcmd-button"
						className={styles["button-27"]}
						type="button"
						form="upload-form"
						onClick={handleSubmit(getCmd)}
					>
						Get cmd
					</button>
					<a className={styles["button-28"]} href="/viewer">
						Go to viewer
					</a>
				</div>
			</form>
			<Footer />
		</div>
	);
}

export async function getServerSideProps() {
	const axios = require("axios");

	const apiList = await axios.get("http://dat-webapp:8000/opus_langs");

	const list = apiList.data;

	const index = list.languages.indexOf("v1");
	if (index > -1) {
		list.languages.splice(index, 1);
	}

	const languageListing = languagePairName(
		list.languages.filter((el) => el.length === 2)
	);

	return {
		props: { languageList: languageListing },
	};
}
