"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Insight = { name: string; count: number; kind: "positive" | "negative" | "neutral" };
type Analysis = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  themes: Insight[];
  scenes: string[];
  pains: string[];
  sellingPoints: string[];
  titles: string[];
  content: string;
  script: string;
};

const sampleReviews = [
  "杯子很轻，带到办公室特别方便，早上两分钟就能喝到果汁。",
  "颜值很高，奶油白很好看，放在工位上完全不突兀。",
  "动力不错，香蕉和草莓打得很细，健身后做蛋白饮很方便。",
  "清洗比想象中简单，冲一下基本就干净了。",
  "续航一般，连续用了三次就需要充电，希望电量更耐用。",
  "声音有一点大，早上在宿舍用会担心吵到室友。",
  "体积小，出差放行李箱不占位置，随时都能做果汁。",
  "价格稍微贵了一点，但做工和设计确实不错。",
  "杯底容易藏果渣，清洗的时候需要多冲几遍。",
  "操作非常简单，双击就能启动，第一次用也没有学习成本。",
  "密封性不错，放在包里没有漏水，通勤携带很安心。",
  "容量偏小，如果能再大一点就更适合两个人使用。",
];

const dimensions = [
  { name: "便携性", words: ["轻", "便携", "携带", "体积小", "不占", "出差", "通勤"] },
  { name: "清洁体验", words: ["清洗", "果渣", "冲", "干净"] },
  { name: "性能效果", words: ["动力", "细", "效果", "速度", "两分钟"] },
  { name: "外观设计", words: ["颜值", "好看", "设计", "做工"] },
  { name: "续航能力", words: ["续航", "充电", "电量"] },
  { name: "声音体验", words: ["声音", "噪音", "吵"] },
  { name: "价格价值", words: ["价格", "贵", "性价比"] },
  { name: "操作体验", words: ["操作", "双击", "简单", "学习成本"] },
  { name: "密封防漏", words: ["密封", "防漏", "漏水", "不漏"] },
  { name: "饮用体验", words: ["吸管", "杯口", "双饮", "直饮", "圆润"] },
  { name: "容量空间", words: ["容量", "大容量", "装得多", "容纳"] },
  { name: "保温保冷", words: ["保温", "保冷", "冰水", "温度"] },
];

const positiveWords = ["方便", "不错", "很好", "简单", "干净", "安心", "喜欢", "好看", "很细", "高", "快"];
const negativeWords = ["一般", "贵", "声音大", "体积大", "太大", "吵", "藏", "需要", "偏小", "漏", "麻烦", "不足", "问题"];
const sceneMap = [
  { name: "办公室轻食", words: ["办公室", "工位", "上班"] },
  { name: "健身营养补给", words: ["健身", "蛋白", "运动"] },
  { name: "宿舍日常", words: ["宿舍", "室友", "学生"] },
  { name: "通勤与差旅", words: ["通勤", "出差", "行李箱", "包里"] },
  { name: "居家早餐", words: ["早上", "早餐", "家里"] },
];

function scoreText(text: string) {
  const positive = positiveWords.filter((word) => text.includes(word)).length;
  const negative = negativeWords.filter((word) => text.includes(word)).length;
  return positive > negative ? "positive" : negative > positive ? "negative" : "neutral";
}

function analyzeReviews(reviews: string[], product: string, platform: string, tone: string): Analysis {
  const valid = reviews.map((item) => item.trim()).filter(Boolean);
  const sentiment = valid.map(scoreText);
  const count = (kind: string) => sentiment.filter((item) => item === kind).length;

  const themes = dimensions
    .map((dimension) => ({
      name: dimension.name,
      count: valid.filter((review) => dimension.words.some((word) => review.includes(word))).length,
      kind: "neutral" as const,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const scenes = sceneMap
    .map((scene) => ({ ...scene, count: valid.filter((review) => scene.words.some((word) => review.includes(word))).length }))
    .filter((scene) => scene.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((scene) => scene.name)
    .slice(0, 4);

  const pains = dimensions
    .map((dimension) => ({
      name: dimension.name,
      count: valid.filter((review) => scoreText(review) === "negative" && dimension.words.some((word) => review.includes(word))).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((item) => `${item.name}是高频顾虑，建议在内容中主动回应并给出使用证明`);

  const sellingPoints = dimensions
    .map((dimension) => ({
      name: dimension.name,
      count: valid.filter((review) => scoreText(review) === "positive" && dimension.words.some((word) => review.includes(word))).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((item) => `${item.name}获得用户正向反馈，可作为核心传播证据`);

  const primaryScene = scenes[0] || "日常生活";
  const primaryValue = sellingPoints[0]?.split("获")[0] || "轻松体验";
  const productName = product.trim() || "这款产品";
  const toneLead = tone === "专业可信" ? "实测" : tone === "温暖治愈" ? "把生活过得更轻松" : tone === "轻松幽默" ? "懒人也能轻松拿捏" : "年轻人的效率搭子";
  const titles = [
    `${toneLead}｜${productName}真实评论里藏着的惊喜`,
    `${primaryScene}新搭子：用户为什么反复提到${primaryValue}？`,
    `看完${valid.length}条真实评价，我找到了${productName}的核心卖点`,
  ];

  const content = `【真实用户洞察】\n我们分析了 ${valid.length} 条用户评论，大家最常提到的不是复杂参数，而是“${primaryScene}”里的真实体验。${sellingPoints[0] || "产品的便捷体验受到关注"}。\n\n如果你也想让日常生活少一点手忙脚乱，${productName}值得加入清单。使用前也别忽略：${pains[0] || "请结合自己的使用需求选择"}。\n\n#真实测评 #${productName.replace(/\s/g, "")} #${platform}`;
  const script = `0-3秒｜镜头：快速切换${primaryScene}画面\n口播：“一款产品值不值得买，真实评论最有发言权。”\n\n3-10秒｜镜头：展示产品核心使用动作\n口播：“我们分析了 ${valid.length} 条评价，用户最认可的是${primaryValue}。”\n\n10-18秒｜镜头：展示细节与真实反馈关键词\n口播：“它特别适合${primaryScene}，但也要注意${pains[0]?.split("，")[0] || "按需选择"}。”\n\n18-25秒｜镜头：回到完整产品画面\n口播：“不是堆参数，而是把真实体验讲清楚。这就是${productName}。”`;

  return {
    total: valid.length,
    positive: count("positive"),
    neutral: count("neutral"),
    negative: count("negative"),
    themes,
    scenes,
    pains: pains.length ? pains : ["目前未发现明显集中痛点，建议增加更多评论后再验证"],
    sellingPoints: sellingPoints.length ? sellingPoints : ["评论量较少，暂未形成稳定卖点"],
    titles,
    content,
    script,
  };
}

function parseCsvRow(line: string) {
  const fields: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }

  fields.push(field);
  return fields;
}

function parseFileText(text: string) {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .slice(0, 501)
    .map((line) => parseCsvRow(line).at(-1)?.trim() || "")
    .filter((line, index) => index > 0 || !/评论|内容|review|comment/i.test(line));
}

export default function Home() {
  const [product, setProduct] = useState("轻氧便携榨汁杯");
  const [platform, setPlatform] = useState("小红书");
  const [tone, setTone] = useState("年轻活力");
  const [reviews, setReviews] = useState<string[]>(sampleReviews);
  const [fileName, setFileName] = useState("示例评论.csv");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState<"note" | "script">("note");
  const [copied, setCopied] = useState(false);

  const previewCount = useMemo(() => reviews.filter(Boolean).length, [reviews]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseFileText(text);
    setReviews(parsed);
    setFileName(file.name);
    setAnalysis(null);
  }

  function runAnalysis() {
    setAnalysis(analyzeReviews(reviews, product, platform, tone));
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function loadSample() {
    setReviews(sampleReviews);
    setFileName("示例评论.csv");
    setAnalysis(null);
  }

  async function copyOutput() {
    if (!analysis) return;
    await navigator.clipboard.writeText(activeTab === "note" ? analysis.content : analysis.script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadReport() {
    if (!analysis) return;
    const text = `Voice2Campaign 洞察报告\n产品：${product}\n评论数：${analysis.total}\n\n核心卖点\n- ${analysis.sellingPoints.join("\n- ")}\n\n用户痛点\n- ${analysis.pains.join("\n- ")}\n\n营销标题\n- ${analysis.titles.join("\n- ")}\n\n社媒文案\n${analysis.content}\n\n短视频脚本\n${analysis.script}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product || "产品"}-消费者洞察报告.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const maxTheme = analysis ? Math.max(...analysis.themes.map((item) => item.count), 1) : 1;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Voice2Campaign 首页">
          <span className="brand-mark">V2C</span>
          <span>Voice2Campaign</span>
        </a>
        <span className="prototype-pill"><i /> Portfolio Prototype</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">SOCIAL INSIGHT, MADE ACTIONABLE</div>
        <h1>让每一条用户评论，<br /><span>都成为营销灵感。</span></h1>
        <p>上传社媒或电商评论，一键提取消费场景、用户痛点与产品卖点，并快速生成可用的社媒内容。</p>
        <div className="hero-flow" aria-label="工具工作流程">
          <span>01 评论输入</span><b>→</b><span>02 消费洞察</span><b>→</b><span>03 内容生成</span>
        </div>
      </section>

      <section className="workspace" aria-label="分析工作台">
        <div className="panel input-panel">
          <div className="panel-heading"><span className="step">01</span><div><h2>设置分析任务</h2><p>输入产品信息并上传评论文件</p></div></div>
          <label>产品名称<input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="例如：便携榨汁杯" /></label>
          <div className="select-grid">
            <label>内容平台<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option>小红书</option><option>抖音</option><option>微博</option><option>公众号</option></select></label>
            <label>品牌调性<select value={tone} onChange={(event) => setTone(event.target.value)}><option>年轻活力</option><option>专业可信</option><option>温暖治愈</option><option>轻松幽默</option></select></label>
          </div>
          <label className="upload-box">
            <input type="file" accept=".csv,.txt" onChange={handleFile} />
            <span className="upload-icon">＋</span>
            <strong>上传 CSV / TXT 评论文件</strong>
            <small>建议第一列为序号、最后一列为评论内容，最多读取500条</small>
          </label>
          <div className="file-row"><span><i>✓</i>{fileName}</span><em>{previewCount} 条评论</em></div>
          <div className="action-row"><button className="ghost-button" onClick={loadSample}>恢复示例</button><button className="primary-button" onClick={runAnalysis}>开始智能分析 <span>↗</span></button></div>
        </div>

        <aside className="panel preview-panel">
          <div className="panel-heading compact"><span className="step">DATA</span><div><h2>评论预览</h2><p>系统将识别情绪、场景与消费诉求</p></div></div>
          <div className="review-list">
            {reviews.slice(0, 5).map((review, index) => <div className="review" key={`${review}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{review}</p></div>)}
          </div>
          {reviews.length > 5 && <p className="more-reviews">还有 {reviews.length - 5} 条评论等待分析</p>}
        </aside>
      </section>

      {analysis ? (
        <section className="results" id="results">
          <div className="results-title"><div><span className="section-kicker">ANALYSIS COMPLETE</span><h2>消费者洞察报告</h2></div><button className="export-button" onClick={downloadReport}>导出报告 ↓</button></div>

          <div className="metrics">
            <div className="metric"><span>样本量</span><strong>{analysis.total}</strong><small>条有效评论</small></div>
            <div className="metric positive"><span>正向反馈</span><strong>{Math.round((analysis.positive / analysis.total) * 100)}%</strong><small>{analysis.positive} 条评论</small></div>
            <div className="metric neutral"><span>中性反馈</span><strong>{Math.round((analysis.neutral / analysis.total) * 100)}%</strong><small>{analysis.neutral} 条评论</small></div>
            <div className="metric negative"><span>负向反馈</span><strong>{Math.round((analysis.negative / analysis.total) * 100)}%</strong><small>{analysis.negative} 条评论</small></div>
          </div>

          <div className="insight-grid">
            <article className="result-card themes-card"><div className="card-label">高频关注维度</div>{analysis.themes.map((theme) => <div className="theme-row" key={theme.name}><div><span>{theme.name}</span><b>{theme.count} 次</b></div><div className="bar"><i style={{ width: `${(theme.count / maxTheme) * 100}%` }} /></div></div>)}</article>
            <article className="result-card"><div className="card-label">核心使用场景</div><div className="scene-cloud">{analysis.scenes.map((scene, index) => <span key={scene}><b>0{index + 1}</b>{scene}</span>)}</div><p className="card-note">营销内容应优先还原具体场景，让卖点从“参数”转化为可感知的生活体验。</p></article>
            <article className="result-card"><div className="card-label green">可放大的产品卖点</div><ul className="insight-list selling">{analysis.sellingPoints.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="result-card"><div className="card-label coral">需要回应的用户痛点</div><ul className="insight-list pain">{analysis.pains.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>

          <div className="content-studio">
            <div className="studio-copy"><span className="section-kicker">CONTENT STUDIO</span><h2>把洞察变成内容</h2><p>根据真实评论中的场景、卖点与顾虑，生成更有依据的传播表达。</p><div className="title-list">{analysis.titles.map((title, index) => <div key={title}><span>0{index + 1}</span><p>{title}</p></div>)}</div></div>
            <div className="generated-content"><div className="tabs"><button className={activeTab === "note" ? "active" : ""} onClick={() => setActiveTab("note")}>社媒文案</button><button className={activeTab === "script" ? "active" : ""} onClick={() => setActiveTab("script")}>短视频脚本</button><button className="copy-button" onClick={copyOutput}>{copied ? "已复制 ✓" : "复制内容"}</button></div><pre>{activeTab === "note" ? analysis.content : analysis.script}</pre></div>
          </div>
        </section>
      ) : (
        <section className="empty-results"><span>↓</span><p>完成设置后点击“开始智能分析”</p><small>约 3 秒生成消费者洞察与内容建议</small></section>
      )}

      <footer><span>Voice2Campaign · AI Marketing Portfolio</span><p>数据仅在当前浏览器中处理，不会上传或保存。</p></footer>
    </main>
  );
}
