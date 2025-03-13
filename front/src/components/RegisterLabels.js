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
import { DataFormatter, numberFormatter } from "../../hooks/hooks";

export default function RegisterLabels({ labels }) {
  const colors = {
    LY: "#161515",
    LY_other: "#3C3A3A",
    SP: "#009C5B",
    SP_it: "#008E63",
    SP_other: "#1E7555",
    ID: "#6FB750",
    ID_other: "#74A455",
    NA: "#FEF12D",
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

  const groupedLabels = Object.entries(labels).reduce((acc, [name, value]) => {
    const langCode = name.split("_")[0];
    if (!acc[langCode]) {
      acc[langCode] = [];
    }

    acc[langCode].push({ name, value });

    return acc;
  }, {});

  const groupedLabelsTotal = Object.entries(groupedLabels)
    .filter((el) => el[0] !== "MT")
    .map((el, idx) => {
      const summedValues = el[1].reduce((acc, cur) => acc + cur.value, 0);

      return { name: el[0], value: summedValues, fill: colors[el[0]] };
    });

  groupedLabelsTotal.sort(function (a, b) {
    var textA = a.name.toUpperCase();
    var textB = b.name.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  const mtLabels = Object.entries(groupedLabels).filter(
    (el) => el[0].toLowerCase() === "mt"
  );

  const cleanTotalLabels = groupedLabelsTotal.filter(
    (el) => !el.name.toLowerCase().includes("mt")
  );

  const groupedLabelsSum = cleanTotalLabels.reduce((a, b) => a + b.value, 0);

  /// BAR CHART WITH SUBDIVISION

  const groupedLabelsTotalBarChart = Object.entries(groupedLabels)
    .filter((el) => el[0] !== "MT")
    .map((el, idx) => {
      let result = { name: el[0] };

      el[1].forEach((item, idx) =>
        !result[item.name] ? (result[item.name] = item.value) : ""
      );

      return result;
    });

  groupedLabelsTotalBarChart.sort(function (a, b) {
    var textA = a.name.toUpperCase();
    var textB = b.name.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  let barsArrayTest = [];

  groupedLabelsTotalBarChart.forEach((date) => {
    Object.entries(date)
      .filter((item) => {
        return item[0] != "name";
      })
      .map(([key, value]) => {
        barsArrayTest.push({
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
    );
  };

  const labelEquivalences = {
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.label}>{labelEquivalences[label]}</p>
          {payload.map((item, idx) => {
            return (
              <div style={{ marginTop: "4px", marginBottom: "4px" }}>
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
                  {`${
                    item.name.includes("other")
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
              <div style={{ marginTop: "4px", marginBottom: "4px" }}>
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
                  {`${
                    item.name.includes("other")
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
    <div
      style={{
        marginBottom: "50px",
      }}
    >
      <h2>Register labels</h2>
      <div
        style={{
          width: "100%",
          height: "405px",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <ResponsiveContainer width={820} height={380}>
          <PieChart>
            <Pie
              data={groupedLabelsTotal}
              dataKey="value"
              nameKey="name"
              fill="#8884d8"
              legendType="circle"
              paddingAngle={1}
              minAngle={1}
              cx={"33%"}
              outerRadius={200}
            />
            <Tooltip content={<CustomTooltipGroup />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              margin={{ top: 12, left: 60, right: 0, bottom: 12 }}
              formatter={(value, entry, index) => {
                return (
                  <span
                    className={styles.legendText}
                    style={{
                      marginBottom: "4px",
                      marginTop: "4px",
                      display: "inline-block",
                      color: "#404376",
                    }}
                  >{`${value} - ${(entry.payload.percent * 100).toFixed(
                    1
                  )}%`}</span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <ResponsiveContainer width={"100%"} height={380}>
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
            {barsArrayTest
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
      <p>
        {mtLabels.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "-45px",
            }}
          >
            🤖{" "}
            <span style={{ fontWeight: "bolder", marginLeft: "5px" }}> MT</span>
            :{((mtLabels[0][1][0].value / groupedLabelsSum) * 100).toFixed(1)}%{" "}
            <span
              style={{
                display: "inline-block",
                fontWeight: "800",
                marginLeft: "5px",
                marginRight: "5px",
              }}
            >
              |
            </span>
            {numberFormatter(mtLabels[0][1][0].value)} Documents
          </div>
        )}
      </p>
    </div>
  );
}
