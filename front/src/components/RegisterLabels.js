import {
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import styles from "@/styles/RegisterLabels.module.css";
import { DataFormatter, numberFormatter, colors, labelEquivalences } from "@/lib/helpers";
import InfoTooltip from "./InfoTooltip";
import JSON5 from "json5";
import useIsMobile from "@/lib/useIsMobile";

function RegisterLabels({ labels, footNote }) {
    const isMobile = useIsMobile();
    if (typeof labels === "string") {
        labels = JSON5.parse(labels)
    }
    const groupedLabels = Object.entries(labels).reduce((acc, [name, value]) => {
        const langCode = name.split("_")[0];
        if (!acc[langCode]) {
            acc[langCode] = [];
        }

        acc[langCode].push({ name, value });

        return acc;
    }, {});

    const [groupedLabelsTotal, mtLabels] = Object.entries(groupedLabels)
        .reduce(([total, mt], [code, items]) => {
            if (code.toLowerCase() === "mt") {
                return [[...total], [...mt, [code, items]]];
            }
            return [
                [...total, {
                    name: code,
                    value: items.reduce((acc, cur) => acc + cur.value, 0),
                    fill: colors[code]
                }],
                mt
            ];
        }, [[], []])
        .map((arr, idx) => idx === 0
            ? arr.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()))
            : arr);

    const cleanTotalLabels = groupedLabelsTotal.filter(
        (el) => !el.name.toLowerCase().includes("mt")
    );

    const groupedLabelsSum = cleanTotalLabels.reduce((a, b) => a + b.value, 0);

    /// BAR CHART WITH SUBDIVISION
    let barsArray = [];

    const groupedLabelsTotalBarChart = Object.entries(groupedLabels)
        .filter((el) => el[0] !== "MT")
        .map((el) => {
            const result = { name: el[0] };
            el[1].forEach((item) => {
                if (!result[item.name]) {
                    result[item.name] = item.value;
                }
            });
            return result;
        })
        .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));


    groupedLabelsTotalBarChart.forEach((date) => {
        Object.entries(date)
            .filter((item) => {
                return item[0] != "name";
            })
            .map(([key, value]) => {
                barsArray.push({
                    key: key,
                    value: (value / groupedLabelsSum) * 100,
                    fill: colors[key],
                });
            });
    });



    const renderBar = (item) => (
        <Bar
            dataKey={`${item.key}`}
            percent={item.value}
            stackId="a"
            fill={item.fill}
        />
    );

    const renderLegend = (props) => {
        const { payload } = props;

        const firstColumn = payload.slice(0, payload.length / 2);
        const secondColumn = payload.slice(payload.length / 2, payload.length);

        return (
            <div className={styles.labellist}>
                <div className={styles.legendColumns}>
                    <ul className={styles.legendListStacked}>
                        {firstColumn.map((entry, index) => {
                            const color = entry.color;

                            return (
                                <li key={`item-${index}`} className={styles.legendItem}>
                                    <div
                                        className={styles.legendSwatch}
                                        style={{
                                            backgroundColor: color,
                                        }}
                                    ></div>
                                    {`${entry.value} - ${entry.payload.percent.toFixed(1)}%`}
                                </li>
                            );
                        })}
                    </ul>
                    <ul className={styles.legendListStacked}>
                        {secondColumn.map((entry, index) => {
                            const color = entry.color;

                            return (
                                <li key={`item-${index}`} className={styles.legendItem}>
                                    <div
                                        className={styles.legendSwatch}
                                        style={{
                                            backgroundColor: color,
                                        }}
                                    ></div>
                                    {`${entry.value} - ${entry.payload.percent.toFixed(1)}%`}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    };
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.label}>{labelEquivalences[label]}</p>
                    {payload.map((item, idx) => {
                        return (
                            <div className={styles.tooltipRow} key={`custom-tooltip--${idx}`}>
                                <p key={idx} className={[styles.desc, styles.tooltipMetric].join(" ")}>
                                    <div
                                        className={styles.tooltipSwatch}
                                        style={{
                                            backgroundColor: item.fill,
                                        }}
                                    ></div>
                                    {`${item.name.includes("other")
                                        ? "Other"
                                        : labelEquivalences[item.name]
                                        }:  ${numberFormatter(item.value)}`}
                                </p>
                            </div>
                        );
                    })}
                </div>
            );
        }
    };
    const CustomTooltipGroup = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.label}>{labelEquivalences[label]}</p>
                    {payload.map((item, idx) => {
                        return (
                            <div className={styles.tooltipRow} key={`group-tooltip--${idx}`}>
                                <p key={idx} className={[styles.desc, styles.tooltipMetric].join(" ")}>
                                    <div
                                        className={styles.tooltipSwatchLarge}
                                        style={{
                                            backgroundColor: item.payload.fill,
                                        }}
                                    ></div>
                                    {`${item.name.includes("other")
                                        ? "Other"
                                        : labelEquivalences[item.name]
                                        }:  ${numberFormatter(item.value)} | `}
                                    {((item.value / groupedLabelsSum) * 100).toFixed(2)}%
                                </p>
                            </div>
                        );
                    })}
                </div>
            );
        }
    };

    return (
        <>
            {labels && (
                <div className="custom-chart">
                    <div className={styles.title}>
                        <h2>Register labels</h2>
                        {!footNote && (
                            <InfoTooltip>
                                <p>Obtained with{" "}
                                <a href="https://huggingface.co/TurkuNLP/web-register-classification-multilingual" target="_blank">
                                    https://huggingface.co/TurkuNLP/web-register-classification-multilingual
                                </a></p>
                            </InfoTooltip>
                        )}
                    </div>
                    <div className={styles.registerLabelsBlock}>
                        <div
                            className={styles["register-labels"]}
                        >
                            <div className={styles["graph-cont"]}>
                                <ResponsiveContainer width={"100%"} height={"100%"}>
                                    <PieChart>
                                        <Pie
                                            data={groupedLabelsTotal}
                                            dataKey="value"
                                            nameKey="name"
                                            legendType="circle"
                                            paddingAngle={1}
                                            minAngle={1}
                                            cx={"50%"}
                                            outerRadius={isMobile ? 88 : 115}
                                        />
                                        <Tooltip content={<CustomTooltipGroup />} />
                                        <Legend
                                            layout="vertical"
                                            verticalAlign="middle"
                                            width={40}
                                            align="right"
                                            formatter={(value, entry, index) => {
                                                return (
                                                    <span className={styles.legendText}>{`${value} - ${(entry.payload.percent * 100).toFixed(
                                                        1
                                                    )}%`}</span>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={styles["graph-cont-bars"]}>
                                <ResponsiveContainer width={"100%"} height={"100%"} >
                                    <BarChart
                                        data={groupedLabelsTotalBarChart}
                                        margin={{
                                            top: isMobile ? 24 : 42,
                                            right: isMobile ? 8 : 20,
                                            left: isMobile ? 0 : 10,
                                            bottom: isMobile ? 18 : 25,
                                        }}
                                        legendType="circle"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis
                                            tickFormatter={DataFormatter}
                                            label={{
                                                value: "Documents",
                                                angle: 0,
                                                position: "top",
                                                offset: 22,
                                                fontSize: 14,
                                            }}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            wrapperStyle={{ outline: "none" }}
                                        />
                                        <Legend
                                            content={renderLegend}
                                            layout="vertical"
                                            verticalAlign="middle"
                                            align="right"
                                        />
                                        {barsArray
                                            .sort(function (a, b) {
                                                var textA = a.key.toUpperCase();
                                                var textB = b.key.toUpperCase();
                                                return textA < textB ? -1 : textA > textB ? 1 : 0;
                                            })
                                            .map((key) => {
                                                return renderBar(key);
                                            })}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {mtLabels.length > 0 && (
                            <div className={styles.mtInfo}>
                                <span className={styles.mtIcon}>🤖{" "}</span>
                                <span className={styles.mtLabel}> MT </span>
                                :{" "}<p>{" "}{((mtLabels[0][1][0].value / groupedLabelsSum) * 100).toFixed(1)}%{" "}</p>
                                <span className={styles.mtDivider}>
                                    |
                                </span>
                                <p>{numberFormatter(mtLabels[0][1][0].value)} Documents</p>
                            </div>
                        )}
                    </div>
                </div >
            )
            }
        </>
    )
}

export default RegisterLabels
