import { getEnglishName } from "all-iso-language-codes";

export function codeToLangTransformer(languagesArray) {
  let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

  let duplicateLanguages = [
    "Akan",
    "Amharic",
    "Arabic",
    "Aymara",
    "Bhojpuri",
    "Bambara",
    "Tibetan",
    "Buriat",
    "Catalan",
    "Chuvash",
    "Dinka",
    "Fula",
    "Hausa",
    "Haida",
    "Armenian",
    "Igbo",
    "Inuktitut",
    "Kikuyu",
    "Kanuri",
    "Kongo",
    "Kanuri",
    "Kurdish",
    "Komi",
    "Central Dusun",
    "Lingala",
    "Malagasy",
    "Nepali",
    "Nyanja",
    "Oromo",
    "Punjabi",
    "Persian",
    "Malagasy",
    "Dari",
    "Quechua",
    "Romanian",
    "Romany",
    "Rundi",
    "Kinyarwanda",
    "Croatian",
    "Shona",
    "Somali",
    "Serbian",
    "Southern Sotho",
    "Swahili",
    "Tigrinya",
    "Filipino",
    "Akan",
    "Wolof",
    "Xhosa",
    "Yoruba",
    "Chinese",
    "Chinese (China)",
    "Malay",
    "Zulu",
    "Zaza",
  ];

  let codeToLang = languagesArray.map((lang, idx) => {
    let correctCode = lang.replace("_", "-");
    if (!lang) return false;
    try {
      return {
        value: correctCode,
        label:
          getEnglishName(correctCode) === null &&
            duplicateLanguages.includes(languageNames.of(correctCode))
            ? `${languageNames.of(correctCode)} (${correctCode})`
            : getEnglishName(correctCode) !== null &&
              duplicateLanguages.includes(getEnglishName(correctCode))
              ? `${getEnglishName(correctCode)} (${correctCode})`
              : getEnglishName(correctCode) === null &&
                !duplicateLanguages.includes(languageNames.of(correctCode))
                ? `${languageNames.of(correctCode)}`
                : `${getEnglishName(correctCode)}`,
        id: idx,
      };
    } catch (error) {
      if (!correctCode) return false;
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}

export function languagePairName(languagesArray) {
  let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

  let codeToLang = languagesArray.map((lang, idx) => {
    if (!lang) return false;
    let correctCode = lang.replace("_", "-");
    try {
      return {
        value: correctCode,
        label:
          getEnglishName(correctCode) === null
            ? `${languageNames.of(correctCode)} (${correctCode})`
            : `${getEnglishName(correctCode)} (${correctCode})`,
        id: idx,
      };
    } catch (error) {
      if (!correctCode) return false;
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}


export function randDarkColor() {
  var lum = -0.25;
  var hex = String(
    "#" + Math.random().toString(16).slice(2, 8).toUpperCase()
  ).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var rgb = "#",
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}

export function unEscape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  htmlStr = htmlStr.replace(/&nbsp;/g, " ");
  htmlStr = htmlStr.replace(/&cent;/g, "¢");
  htmlStr = htmlStr.replace(/&pound;/g, "£");
  htmlStr = htmlStr.replace(/&yen;/g, "¥");
  htmlStr = htmlStr.replace(/&euro;/g, "€");
  htmlStr = htmlStr.replace(/&copy;/g, "©");
  htmlStr = htmlStr.replace(/&reg;/g, "®");
  htmlStr = htmlStr.replace(/&apos;/g, "'");
  return htmlStr;
}

export const DataFormatter = (number) => {
  if (typeof number !== "number") {
    return number;
  }
  if (number > 1000000000) {
    return (number / 1000000000).toString() + "B";
  } else if (number > 1000000) {
    return (number / 1000000).toString() + "M";
  } else if (number > 1000) {
    return (number / 1000).toString() + "k";
  } else {
    return number.toString();
  }
};

export function convertSize(sizeBytes) {
  if (sizeBytes === 0) return "0B";

  const sizeName = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(sizeBytes) / Math.log(1024));
  const p = Math.pow(1024, i);
  const s = Number((sizeBytes / p).toFixed(2));

  return `${s} ${sizeName[i]}`;
}

export const percFormatter = (number) => {
  return number.toString() + "%";
};

export const numberFormatter = (num) => {
  const formatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(num);
  return formatted;
};

import axios from "axios";

export const handleDownload = async (filename) => {
  try {
    const response = await axios.get(`/api/download/${filename}`);

    if (response.status !== 200) {
      console.error(response.status, response.statusText);
    }
    const blob = response.data;
    const test = new File([blob], `${filename}.yaml`);
    const url = window.URL.createObjectURL(test);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}`;
    link.click();
  } catch (error) {
    console.log(error, "Something went wrong with the download.");
  }
};

export function multipleFilter(item, value) {
  const name = item.originalName.toLowerCase();

  let search = value.toLowerCase();

  return (
    name.includes(search) || name.startsWith(search)

  );
}



export function replaceStringsCaseInsensitive(text, stringsToReplace) {
  let result = text;
  for (const oldString of stringsToReplace) {
    const regex = new RegExp(oldString, "gi");
    result = result.replace(regex, "");
  }
  return result;
}

export const colors = {
  LY: "#161515",
  LY_other: "#3C3A3A",
  SP: "#009C5B",
  SP_it: "#008E63",
  SP_other: "#1E7555",
  ID: "#6FB750",
  ID_other: "#74A455",
  NA: "#cfd306ff",
  NA_nb: "#D7CD4C",
  NA_ne: "#AFA545",
  NA_other: "#959042",
  NA_sr: "#808043",
  HI: "#E9A13E",
  HI_other: "#B38442",
  HI_re: "#A17D48",
  IP: "#00A19C",
  IP_ds: "#00938F",
  IP_ed: "#027575",
  IP_other: "#006A67",
  IN: "#D7373D",
  IN_dtp: "#E46564",
  IN_en: "#E57A72",
  IN_fi: "#BC444B",
  IN_lt: "#953F41",
  IN_other: "#803132",
  IN_ra: "#732F2E",
  OP: "#583B7C",
  OP_av: "#6E4D89",
  OP_ob: "#5C4473",
  OP_other: "#493A5B",
  OP_rs: "#3C2E4D",
  OP_rv: "#392B45",
  MIX: "#933D81",
  UNK: "#F1683A",
};


export const labelEquivalences = {
  MT: "Machine-translated",
  LY: "Lyrical",
  SP: "Spoken",
  SP_it: "Interview",
  ID: "Interactive discussion",
  NA: "Narrative",
  NA_ne: "News report",
  NA_sr: "Sports report",
  NA_nb: "Narrative blog",
  HI: "How-to or instructions",
  HI_re: "Recipe",
  IP: "Informational persuasion",
  IP_ds: "Description with intent to sell",
  IP_ed: "News & opinion blog or editorial",
  IN: "Informational description",
  IN_en: "Encyclopedia article",
  IN_ra: "Research article",
  IN_dtp: "Description of a thing or person",
  IN_fi: "FAQ",
  IN_lt: "Legal terms & conditions",
  OP: "Opinion",
  OP_rv: "Review",
  OP_ob: "Opinion blog",
  OP_rs: "Denominational  religious blog or sermon",
  OP_av: "Advice",
  UNK: "Not identified",
  MIX: "Mixed",
};

export function correctNoiseTag(value) {
  return value === "not_too_long"
    ? "Too long"
    : value === "not_too_short"
      ? "Too short"
      : value === "no_urls"
        ? "URLs"
        : value === "no_bad_encoding"
          ? "Bad encoding"
          : value === "length_ratio"
            ? "Length ratio"
            : value === "pii"
              ? "Contains PII"
              : value === "no_porn"
                ? "No porn"
                : "";
}

export const rtlLanguages = [
  "ar",
  "ar-AE",
  "ar-BH",
  "ar-DJ",
  "ar-DZ",
  "ar-EG",
  "ar-IQ",
  "ar-JO",
  "ar-KW",
  "ar-LB",
  "ar-LY",
  "ar-MA",
  "ar-OM",
  "ar-QA",
  "ar-SA",
  "ar-SD",
  "ar-SY",
  "ar-TN",
  "ar-YE",
  "fa-AF",
  "fa-IR",
  "fa",
  "he",
  "he-IL",
  "iw",
  "kd",
  "pk-PK",
  "ps",
  "ug",
  "ur",
  "ur-IN",
  "ur-PK",
  "yi",
  "yi-US",
  "ara",
  "pes",
  "fas",
  "heb",
  "pus",
  "pbt",
  "uig",
  "urd",
  "ydd",
];


export const removalWords = [
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