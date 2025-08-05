import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { randDarkColor, languagePairName, numberFormatter } from "../lib/helpers";

import styles from "@/styles/LanguagePieChart.module.css";

const CustomTooltip = ({ active, payload, label, total }) => {
    if (active && payload && payload.length) {
        const freq = payload[0].value;

        const percentage = parseFloat((freq * 100) / total).toFixed(2)
        return (
            <div className={styles.tooltipPie}>
                <p className={styles.pieLabel}>{`${payload[0].name.includes("Others") ? "Others" : payload[0].payload.lang}`}</p>
                {freq && (
                    <p
                        className={styles.perc}
                    >{`Segments:  ${freq.toLocaleString("en-US")} `}{" "}<span style={{ fontWeight: 600 }}>{freq ? `(${percentage}%)` : ""}</span></p>
                )}
            </div>
        );
    }

    return null;
};

export default function LanguagePieChart({
    langs,
    warning,
    warningLang,
}) {

    const values = langs.reduce((acc, item) => {

        const readableLanguageName = languagePairName([item[0]]);
        const langName = readableLanguageName[0].label;
        const name = `${readableLanguageName[0].label} - ${numberFormatter(item[1])}`

        const processedItem = {
            lang: langName,
            val: item[1],
            name: name,
            fill: randDarkColor()
        };
        acc.processedItems.push(processedItem);

        acc.totalValue += item[1];

        return acc;
    }, {
        totalValue: 0,
        processedItems: []
    });

    const { processedItems, totalValue } = values;


    let graphValues;
    if (langs.length > 10) {
        const others = processedItems.slice(10, langs.length);

        const othersLength = others.length;

        const final = others.reduce((a, b) => {
            return a + +b.val;
        }, 0);

        graphValues = processedItems.toSpliced(10);

        graphValues.push({ name: `${othersLength} - Others - ${numberFormatter(final)}`, val: final, fill: "grey" });

    } else {
        graphValues = processedItems;
    }

    return (
        <div className={styles.languagePieChartContainer}>
            {warning && (
                <p className={styles.warning}>
                    {`*${warningLang} identification might be inaccurate because it is not
          supported by FastSpell`}
                </p>
            )}
            <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
                <PieChart width={570} height={400}>
                    <Pie
                        dataKey="val"
                        isAnimationActive={false}
                        data={graphValues}
                        cx="40%"
                        cy="40%"
                        outerRadius="70%"
                        strokeWidth={0.7}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="top"
                        align="right"
                        formatter={(value, entry, index) => <span className={styles.legendText}>{entry.payload.name}</span>
                        }
                    />
                    <Tooltip content={<CustomTooltip total={totalValue} />} />
                </PieChart>
            </ResponsiveContainer>
        </div >
    );
}
