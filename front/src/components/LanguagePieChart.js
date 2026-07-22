import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { randDarkColor, languagePairName, numberFormatter } from "../lib/helpers";
import useIsMobile from "@/lib/useIsMobile";

import styles from "@/styles/LanguagePieChart.module.css";

const getPercentage = (value, total) => {
    const numericValue = Number(value);
    const numericTotal = Number(total);

    if (!Number.isFinite(numericValue) || !Number.isFinite(numericTotal) || numericTotal === 0) {
        return "0.0";
    }

    return ((numericValue * 100) / numericTotal).toFixed(1);
};

const CustomTooltip = ({ active, payload, label, total }) => {
    if (active && payload && payload.length) {
        const freq = payload[0].value;

        const percentage = getPercentage(freq, total);
        return (
            <div className={styles.tooltipPie}>
                <p className={styles.pieLabel}>{`${payload[0].name.includes("Others") ? "Others" : payload[0].payload.lang}`}</p>
                {freq && (
                    <p
                        className={styles.perc}
                    >{`${freq.toLocaleString("en-US")} segments`}{" "}<span style={{ fontWeight: 600 }}>{freq ? `(${percentage}%)` : ""}</span></p>
                )}
            </div>
        );
    }

    return null;
};

const CustomLegend = ({ data, total }) => {
    return (
        <ul className={styles.legendList}>
            {data.map((entry) => (
                <li className={styles.legendItem} key={entry.name}>
                    <span
                        className={styles.legendIcon}
                        style={{ backgroundColor: entry.fill }}
                        aria-hidden="true"
                    />
                    <span className={styles.legendText}>
                        {entry.name}{" "}
                        <span style={{ fontWeight: 600 }}>({getPercentage(entry.val, total)}%)</span>
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default function LanguagePieChart({
    langs,
    warning,
    warningLang,
}) {
    const isMobile = useIsMobile();

    const values = langs.reduce((acc, item) => {

        const readableLanguageName = languagePairName([item[0]]);
        const langName = readableLanguageName[0].label;
        const name = `${readableLanguageName[0].label} - ${numberFormatter(item[1])}`

        const processedItem = {
            lang: langName,
            val: Number(item[1]),
            name: name,
            fill: randDarkColor()
        };
        acc.processedItems.push(processedItem);

        acc.totalValue += Number(item[1]);

        return acc;
    }, {
        totalValue: 0,
        processedItems: []
    });

    const { totalValue } = values;
    const processedItems = [...values.processedItems].sort((a, b) => b.val - a.val);


    let graphValues;
    if (langs.length > 10) {
        const others = processedItems.slice(10, langs.length);

        const othersLength = others.length;

        const final = others.reduce((a, b) => {
            return a + +b.val;
        }, 0);

        graphValues = processedItems.toSpliced(10);

        graphValues.push({
            name: `${othersLength} Others - ${numberFormatter(final)}`,
            lang: "Others",
            val: final,
            fill: "grey"
        });

    } else {
        graphValues = processedItems;
    }

    return (
        <div className={styles.languagePieChartContainer}>
            {warning && (
                <p className={styles.warning}>
                    *{warningLang} identification might be inaccurate because it is not
                    supported by FastSpell.
                </p>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        dataKey="val"
                        isAnimationActive={false}
                        legendType="circle"
                        data={graphValues}
                        cx={isMobile ? "50%" : "35%"}
                        cy={isMobile ? "38%" : "45%"}
                        outerRadius={isMobile ? "52%" : "85%"}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign={isMobile ? "bottom" : "top"}
                        align={isMobile ? "center" : "right"}
                        content={<CustomLegend data={graphValues} total={totalValue} />}
                    />
                    <Tooltip content={<CustomTooltip total={totalValue} />} />
                </PieChart>
            </ResponsiveContainer>
        </div >
    );
}
