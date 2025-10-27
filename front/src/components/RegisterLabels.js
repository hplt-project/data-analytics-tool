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
import { Info } from "lucide-react";
import { Tooltip as InfoTooltip } from "react-tooltip";
import JSON5 from "json5";

function RegisterLabels({ labels, footNote }) {
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
                <div style={{ display: "flex" }}>
                    <ul className={styles.legendListStacked}>
                        {firstColumn.map((entry, index) => {
                            const color = entry.color;

                            return (
                                <li
                                    key={`item-${index}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "#1c1d2cff"
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: color,
                                            width: "12px",
                                            height: "12px",
                                            marginRight: "4px",
                                            borderRadius: "2px",

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
                                <li
                                    key={`item-${index}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "#1c1d2cff"
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: color,
                                            width: "12px",
                                            height: "12px",
                                            marginRight: "4px",
                                            borderRadius: "2px",
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
                            <div style={{ marginTop: "4px", marginBottom: "4px" }} key={`custom-tooltip--${idx}`}>
                                <p
                                    key={idx}
                                    className={styles.desc}
                                    style={{
                                        color: "#222222",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "12px",
                                            width: "12px",
                                            backgroundColor: item.fill,
                                            marginRight: "4px",
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
                            <div style={{ marginTop: "4px", marginBottom: "4px" }} key={`group-tooltip--${idx}`}>
                                <p
                                    key={idx}
                                    className={styles.desc}
                                    style={{
                                        color: "#222222",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "20px",
                                            display: "inline-block",
                                            width: "20px",
                                            backgroundColor: item.payload.fill,
                                            marginRight: "4px",
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
                        <a className="register-labels-graph">
                            {!footNote && (
                                <Info
                                    className={[styles.helpCircle, styles.desktopData].join(
                                        " "
                                    )}
                                    strokeWidth={2}
                                    color="#022831"
                                    width={18}
                                />
                            )}
                        </a>
                        <InfoTooltip anchorSelect=".register-labels-graph" place="top" clickable style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}>
                            <p className={styles.tooltipText}>  Obtained with{" "}
                                <a className={styles.tooltipLink} href={"https://huggingface.co/TurkuNLP/web-register-classification-multilingual"} target="_blank">
                                    https://huggingface.co/TurkuNLP/web-register-classification-multilingual
                                </a></p>

                        </InfoTooltip>
                    </div>
                    <div
                        style={{
                            marginBottom: "50px",
                        }}
                    >
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
                                            outerRadius={115}
                                        />
                                        <Tooltip content={<CustomTooltipGroup />} />
                                        <Legend
                                            layout="vertical"
                                            verticalAlign="middle"
                                            width={40}
                                            align="right"
                                            formatter={(value, entry, index) => {
                                                return (
                                                    <span
                                                        className={styles.legendText}
                                                        style={{
                                                            marginBottom: "4px",
                                                            marginTop: "4px",
                                                            marginLeft: "5px",
                                                            display: "inline-block",
                                                            color: "#1e1f2cff",
                                                        }}
                                                    >{`${value} - ${(entry.payload.percent * 100).toFixed(
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
                                            top: 42,
                                            right: 20,
                                            left: 10,
                                            bottom: 25,
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
                            <div
                                className={styles.mtInfo}
                                style={{ display: "flex", alignItems: "center" }}
                            >
                                <span style={{ marginTop: "-5px" }}>🤖{" "}</span>
                                <span style={{ fontWeight: "bolder", marginLeft: "5px", color: "#1e1f2cff" }}> MT </span>
                                :{" "}<p style={{ color: "#1e1f2cff" }}>{" "}{((mtLabels[0][1][0].value / groupedLabelsSum) * 100).toFixed(1)}%{" "}</p>
                                <span
                                    style={{
                                        display: "inline-block",
                                        fontWeight: "800",
                                        marginLeft: "5px",
                                        marginRight: "5px",
                                        color: "#1e1f2cff"
                                    }}
                                >
                                    |
                                </span>
                                <p style={{ color: "#1e1f2cff" }}>{numberFormatter(mtLabels[0][1][0].value)} Documents</p>
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
