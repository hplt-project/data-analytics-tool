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
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}

export function languagePairName(languagesArray) {
  let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

  let codeToLang = languagesArray.map((lang, idx) => {
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
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}

////// Dark Color Generator function

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
    return (number / 1000).toString() + "K";
  } else {
    return number.toString();
  }
};

export const percFormatter = (number) => {
  return number.toString() + "%";
};
