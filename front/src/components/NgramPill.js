import { copyTextToClipboard } from "@/lib/clipboard";
import { unEscape } from "@/lib/helpers";
import { useToast } from "./ToastProvider";

import styles from "@/styles/NGramsTable.module.css";

function NgramPill({ n, i, color }) {
    const toast = useToast();
    const text = unEscape(n[0].join(""));
    const handleCopy = async () => {
        try {
            await copyTextToClipboard(text);
            toast.success("N-Gram copied to clipboard!");
        } catch {
            toast.error("Couldn't copy N-Gram");
        }
    };

    return (
        <button
            className={[styles.pill, styles[`pill-${color}`]].join(" ")}
            key={i}
            onClick={handleCopy}
            type="button"
        >
            {text} | {n[1].toLocaleString("en-US")}
        </button>
    )
}

export default NgramPill
