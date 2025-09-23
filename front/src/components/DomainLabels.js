import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from "recharts";
import styles from "@/styles/DomainLabels.module.css";
import { DataFormatter, numberFormatter } from "@/lib/helpers";
import { Info } from "lucide-react";
import { Tooltip as InfoTooltip } from "react-tooltip";
import JSON5 from "json5";

function DomainLabels({ labels, footNote }) {
  if (typeof labels === "string") {
    labels = JSON5.parse(labels);
  }

  // Short name mapping for legend and bar axis
  const shortMap = {
    "Adult": "ADL",
    "Arts_and_Entertainment": "ART",
    "Autos_and_Vehicles": "AUT",
    "Beauty_and_Fitness": "BEA",
    "Books_and_Literature": "LIT",
    "Business_and_Industrial": "BIZ",
    "Computers_and_Electronics": "TEC",
    "Finance": "FIN",
    "Food_and_Drink": "FNB",            // F&B = Food & Beverage
    "Games": "GAM",
    "Health": "HLT",
    "Hobbies_and_Leisure": "HOB",
    "Home_and_Garden": "HOM",
    "Internet_and_Telecom": "ICT",
    "Jobs_and_Education": "EDU",
    "Law_and_Government": "LAW",
    "News": "NWS",
    "Online_Communities": "ONC",
    "People_and_Society": "SOC",
    "Pets_and_Animals": "PET",
    "Real_Estate": "EST",
    "Science": "SCI",
    "Sensitive_Subjects": "SEN",
    "Shopping": "SHP",
    "Sports": "SPT",
    "Travel_and_Transportation": "TRV",
    "UNK": "UNK",
    "Other": "OTH"
  };

  const shortName = (name) => {
    if (!name) return "";
    if (shortMap[name]) return shortMap[name];
    const acronym = name.replaceAll("_", " ").split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase();
    return (acronym || name.replaceAll("_", "")).slice(0, 3).toUpperCase();
  };

  // Sort and keep Top-11, aggregate the rest under "Other"
  const entriesSorted = Object.entries(labels)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const top11 = entriesSorted.slice(0, 11);
  const otherValue = entriesSorted.slice(11).reduce((sum, { value }) => sum + value, 0);
  let entries = otherValue > 0 ? [...top11, { name: "Other", value: otherValue }] : top11;

  // Keep UNK as the very last bar if present (data otherwise sorted by value desc)
  const unkIdx = entries.findIndex((e) => e.name === "UNK");
  if (unkIdx !== -1) {
    const [unk] = entries.splice(unkIdx, 1);
    entries = [...entries, unk];
  }

  const total = entries.reduce((sum, { value }) => sum + value, 0) || 1;

  // Deterministic palette
  const palette = [
    "#5B8FF9", "#61DDAA", "#65789B", "#F6BD16", "#7262fd",
    "#78D3F8", "#9661BC", "#F6903D", "#008685", "#F08BB4",
    "#1E9493", "#D3F261", "#D62728", "#2CA02C", "#9467BD",
    "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF",
  ];
  const withColors = entries.map((item, idx) => ({
    ...item,
    shortName: shortName(item.name),
    fill: item.name === "Other" ? "#B0B3B8" : palette[idx % palette.length],
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const fullName = payload[0]?.payload?.name || label;
      return (
        <div className={styles.tooltip}>
          <p className={styles.label}>{fullName}</p>
          {payload.map((item, idx) => (
            <div style={{ marginTop: "4px", marginBottom: "4px" }} key={`domain-tooltip--${idx}`}>
              <p
                className={styles.desc}
                style={{ color: "#222222", display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    height: "12px",
                    width: "12px",
                    backgroundColor:
                      // Robustly resolve color both for Pie and Bar tooltips
                      item.fill || item.color || item.payload?.fill || item.payload?.payload?.fill || "#8884d8",
                    marginRight: "4px",
                    borderRadius: "2px",
                  }}
                ></div>
                {`${numberFormatter(item.value)} documents`}{" "} (<span style={{ fontWeight: 600 }}>{((item.value / total) * 100).toFixed(1)}%</span>)
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => {
    const items = withColors;
    const splitIndex = Math.ceil(items.length / 2);
    // const firstColumn = items.slice(0, splitIndex);
    // const secondColumn = items.slice(splitIndex);
    const LegendList = ({ items }) => (
      <ul className={styles.legendListStacked}>
        {items.map((entry, index) => (
          <li key={`item-${index}`} style={{ display: "flex", alignItems: "center", color: "#1c1d2cff" }}>
            <div style={{ backgroundColor: entry.fill, width: "12px", height: "12px", marginRight: "4px", borderRadius: "2px" }}></div>
            {`${shortName(entry.name)} - ${((entry.value / total) * 100).toFixed(1)}%`}
          </li>
        ))}
      </ul>
    );
    return (
      <div className={styles.labellist}>
        <div>
          <LegendList items={items} />
          {/* <LegendList items={secondColumn} /> */}
        </div>
      </div>
    );
  };

  return (
    <>
      {withColors && (
        <div >
          <div className={styles.title}>
            <h2>Domain labels</h2>
            <a className="domain-labels-graph">
              {!footNote && (
                <Info className={[styles.helpCircle, styles.desktopData].join(" ")} strokeWidth={2} color="#022831" width={18} />
              )}
            </a>
            <InfoTooltip
              anchorSelect=".domain-labels-graph"
              place="top"
              clickable
              style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}
            >
              <p className={styles.tooltipText}>
                Obtained with{" "}
                <a className={styles.tooltipLink} href={"https://huggingface.co/nvidia/multilingual-domain-classifier"} target="_blank">
                  https://huggingface.co/nvidia/multilingual-domain-classifier
                </a>
              </p>
            </InfoTooltip>
          </div>
          <div className={styles["domain-labels"]} style={{ marginBottom: "50px" }}>

            <div className={styles["graph-cont-bars"]}>
              <ResponsiveContainer width={"85%"} height={"100%"}>
                <BarChart
                  data={withColors}
                  margin={{ top: 42, right: 20, left: 10, bottom: 25 }}
                  legendType="circle"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortName" />
                  <YAxis tickFormatter={DataFormatter} label={{ value: "Documents", angle: 0, position: "top", offset: 22, fontSize: 14 }} />
                  <RechartsTooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />
                  <Bar dataKey="value">
                    {withColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  {/* <LabelList
                    dataKey={(val) =>
                      console.log(val)
                    }
                    fill="#244446ff"
                    position="top"
                    fontWeight={800}
                    fontSize={11}
                  /> */}
                </BarChart>

              </ResponsiveContainer>
              {renderLegend()}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DomainLabels;
