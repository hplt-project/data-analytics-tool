import NewLangDocs from "./LangDocs";
import { languagePairName } from "@/lib/helpers";

export default function Report({ reportData, date, report }) {

  const footNote = false;

  const srclang = reportData.srclang
    ? languagePairName([reportData.srclang])
    : "";


  return (
    <>
    </>
  );
}
