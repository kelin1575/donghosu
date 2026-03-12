"use client";

import { useState, useEffect } from "react";

const skills = [
  {
    icon: "🏗️",
    label: "기획 / 분석 / 설계",
    summary: "비즈니스 요구사항 → 시스템 아키텍처 전환",
    detail:
      "이해관계자 인터뷰부터 AS-IS/TO-BE 프로세스 정의, 기능 명세서 작성, 화면설계서(Wireframe) 제작까지 프로젝트 초기 단계 전반을 주도합니다. ERD 설계와 API 인터페이스 정의서 작성을 통해 개발팀과의 명확한 커뮤니케이션을 보장합니다.",
    tags: ["요구사항 정의", "IA 설계", "ERD", "API 명세", "Wireframe"],
    stack: ["Confluence", "Jira", "Figma", "draw.io", "Notion"],
  },
  {
    icon: "💻",
    label: "개발 / 테스트",
    summary: "TA 기반 풀스택 개발 및 품질 보증",
    detail:
      "Technical Architect 경험을 바탕으로 백엔드(Spring Boot/Java)와 프론트엔드(React/TypeScript) 양쪽을 이해하고 직접 개발합니다. 단위·통합·성능 테스트 시나리오를 설계하고 품질 기준을 수립합니다. 코드 리뷰 문화 정착과 기술 부채 관리를 통해 장기적으로 유지보수 가능한 코드베이스를 만들어갑니다.",
    tags: ["Spring Boot", "React", "TypeScript", "REST API", "JUnit"],
    stack: ["Java", "Spring Boot", "React", "TypeScript", "Selenium", "JUnit"],
  },
  {
    icon: "⚙️",
    label: "PM / 운영 관리",
    summary: "일정·인적자원 관리 및 품질진단 (PMP 보유)",
    detail:
      "PMP 자격증을 보유한 프로젝트 관리 전문가로, WBS 기반 일정 관리와 리소스 최적화를 통해 프로젝트를 성공적으로 완수합니다. 애자일/스크럼 방법론을 적용하여 스프린트 단위 개발을 주도하고, KPI 기반 품질 지표를 수립·모니터링합니다. 이해관계자 보고 및 리스크 조기 식별·대응 체계를 구축합니다.",
    tags: ["PMP", "WBS", "애자일/스크럼", "KPI", "리스크 관리"],
    stack: ["Jira", "Confluence", "MS Project", "Slack", "GitHub"],
  },
  {
    icon: "☁️",
    label: "Google Cloud Platform",
    summary: "다년간 GCP 구축·운영 (GCA 라이선스 보유)",
    detail:
      "Google Cloud Architect 자격증을 보유하고 다년간 GCP 기반 인프라를 구축·운영했습니다. GKE를 활용한 컨테이너 오케스트레이션, Cloud Run으로 서버리스 배포, BigQuery를 통한 대용량 데이터 분석 환경을 구성한 경험이 있습니다. CloudWatch/Datadog 연동으로 통합 모니터링 체계를 구축하고 비용 최적화를 지속 수행합니다.",
    tags: ["GKE", "Cloud Run", "BigQuery", "Cloud SQL", "Pub/Sub"],
    stack: ["GKE", "Cloud Run", "BigQuery", "Cloud SQL", "Pub/Sub", "Datadog"],
  },
  {
    icon: "🔗",
    label: "MSA / DevSecOps",
    summary: "마이크로서비스 아키텍처 설계 및 CI/CD 파이프라인",
    detail:
      "모놀리식 시스템을 MSA로 전환하는 마이그레이션 프로젝트를 주도한 경험이 있습니다. 도메인 경계 설계(DDD), API Gateway 구성, 서비스 간 비동기 통신(Kafka/Pub/Sub)을 구현했습니다. GitHub Actions / Jenkins 기반 CI/CD 파이프라인을 구축하고, SAST/DAST 보안 검사를 파이프라인에 통합한 DevSecOps 체계를 운영합니다.",
    tags: ["MSA", "DDD", "API Gateway", "Kafka", "CI/CD"],
    stack: ["Docker", "Kubernetes", "GitHub Actions", "Jenkins", "Kafka", "Nginx"],
  },
  {
    icon: "🛒",
    label: "커머스 플랫폼",
    summary: "이커머스 전 도메인 엔드투엔드 설계·운영",
    detail:
      "커머스 플랫폼의 전 도메인(회원·전시·상품·이벤트·기획전·주문·배송·클레임·정산)을 설계하고 운영한 경험을 보유합니다. PG사 결제 연동, 물류사 API 연계, 글로벌 서비스를 위한 다국어·다통화 처리까지 구현했습니다. ISMS-P 인증 및 PCI-DSS v4.0 준수를 위한 보안 아키텍처도 담당하고 있습니다.",
    tags: ["주문/결제", "PG 연동", "물류 API", "ISMS-P", "PCI-DSS"],
    stack: ["Redis", "ElastiCache", "PG연동", "물류API", "ISMS-P", "PCI-DSS"],
  },
];

const techStack = [
  { name: "Backend",      color: "#00d2ff", items: ["Java", "Spring Boot", "Node.js", "REST API", "GraphQL"] },
  { name: "Frontend",     color: "#7b6fff", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { name: "Cloud / Infra",color: "#ff6fb0", items: ["GCP", "GKE", "Cloud Run", "Docker", "Kubernetes"] },
  { name: "DevOps",       color: "#00ffb3", items: ["GitHub Actions", "Jenkins", "Datadog", "ElastiCache"] },
  { name: "Data / DB",    color: "#ffd166", items: ["BigQuery", "Cloud SQL", "Redis", "MySQL", "Kafka"] },
  { name: "협업 / 관리",  color: "#a8dadc", items: ["Jira", "Confluence", "Figma", "Notion", "Slack"] },
];

const certs = [
  { short: "PMP", name: "PMP 라이선스", desc: "Project Management Professional" },
  { short: "GCA", name: "GCA 라이선스", desc: "Google Cloud Architect" },
];

const summary = [
  "TA 업무를 기반으로 전체 프로젝트 구축 및 운영 역량을 갖춘 PM",
  "기획 / 분석 / 설계 / 개발 / 테스트 / 운영 전체 관리",
  "일정 및 인적 자원관리, 품질진단 경험 (PMP 라이선스 보유)",
  "최신 트렌드에 맞춘 MSA 관점 구축 / 운영",
  "Google Cloud 다년간 구축 및 운영 경험 (GCA 라이선스 보유)",
  "커머스 플랫폼 전체 커버 (회원·전시·상품·이벤트·기획전·주문·배송·클레임·정산)",
  "다양한 외부 연계 솔루션 인터페이스 구축 경험",
  "최신 트렌드를 적용한 CI/CD 및 MSA 적용",
];

const careers = [
  {
    company: "LG CNS",
    dept: "커머스기술혁신TF",
    role: "책임",
    period: "2008.08 – 현재",
    duration: "17년 8개월",
    current: true,
    works: [
      "임직원몰 차세대 커머스플랫폼 프로젝트 구축 PL(TA)",
      "Google Cloud 내 플랫폼 전체 구축 및 운영관리 (TA)",
      "그룹사 임직원몰 커머스플랫폼 구축 및 운영관리 (PM)",
      "커머스플랫폼 보안솔루션 구축 및 운영",
      "ISMS 진단 및 수검관리",
      "LG전자 한국영업본부 온라인사이트 운영 PM",
      "커머스기술혁신TF 리딩",
    ],
  },
];

const domains = ["회원", "전시", "상품", "이벤트", "기획전", "주문", "배송", "클레임", "정산"];

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  if (!mounted) return null;

  return (
    <main style={{
      minHeight: "100vh",
      background: "#080d1a",
      fontFamily: "'Noto Sans KR', sans-serif",
      color: "#e2e8f0",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade { animation: fadeUp 0.6s ease both; }
        .d0 { animation-delay: 0.05s; }
        .d1 { animation-delay: 0.15s; }
        .d2 { animation-delay: 0.25s; }
        .d3 { animation-delay: 0.35s; }
        .d4 { animation-delay: 0.45s; }
        .d5 { animation-delay: 0.55s; }
        .d6 { animation-delay: 0.65s; }

        @keyframes blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.3; transform:scale(.6); }
        }
        .blink { animation: blink 2s infinite; }

        .skill-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .skill-body.open {
          max-height: 500px;
          opacity: 1;
        }

        .chevron {
          width: 18px;
          height: 18px;
          border-right: 2px solid rgba(0,210,255,.5);
          border-bottom: 2px solid rgba(0,210,255,.5);
          transform: rotate(45deg);
          transition: transform 0.3s ease;
          flex-shrink: 0;
          margin-left: auto;
        }
        .chevron.open {
          transform: rotate(-135deg);
        }

        .skill-row {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.06);
          background: rgba(255,255,255,.02);
          margin-bottom: 10px;
          overflow: hidden;
          transition: border-color .2s;
          cursor: pointer;
        }
        .skill-row:hover { border-color: rgba(0,210,255,.25); }
        .skill-row.open  { border-color: rgba(0,210,255,.4); background: rgba(0,210,255,.04); }

        .tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(0,210,255,.1);
          border: 1px solid rgba(0,210,255,.2);
          color: #00d2ff;
        }

        .stack-tag {
          display: inline-block;
          padding: 5px 13px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(123,111,255,.12);
          border: 1px solid rgba(123,111,255,.25);
          color: #a89fff;
        }

        .domain-tag {
          display: inline-block;
          padding: 7px 18px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(123,111,255,.1);
          border: 1px solid rgba(123,111,255,.22);
          color: #9d94ff;
          cursor: default;
          transition: all .15s;
        }
        .domain-tag:hover {
          background: rgba(123,111,255,.22);
          transform: translateY(-2px);
        }

        .tech-card {
          border-radius: 12px;
          padding: 20px;
          background: rgba(255,255,255,.02);
          border: 1px solid rgba(255,255,255,.06);
        }

        .tech-item {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          cursor: default;
          transition: transform .15s;
        }
        .tech-item:hover { transform: translateY(-2px); }

        .label {
          font-size: 10px;
          letter-spacing: 3px;
          color: #4a5470;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 18px;
        }
      `}</style>

      {/* BG grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,210,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,255,.022) 1px,transparent 1px)",
        backgroundSize: "64px 64px",
      }} />
      <div style={{ position:"fixed", top:"-15%", right:"-8%", width:600, height:600, background:"radial-gradient(circle,rgba(0,190,255,.07) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-10%", left:"-10%", width:500, height:500, background:"radial-gradient(circle,rgba(100,80,255,.06) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:860, margin:"0 auto", padding:"64px 20px 96px" }}>

        {/* ── HEADER ── */}
        <header className="fade d0" style={{ paddingBottom:40, marginBottom:48, borderBottom:"1px solid rgba(0,210,255,.1)" }}>
          {/* badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8, marginBottom:24,
            background:"rgba(0,210,255,.07)", border:"1px solid rgba(0,210,255,.2)",
            borderRadius:4, padding:"5px 14px",
            fontSize:11, letterSpacing:3, color:"#00d2ff", textTransform:"uppercase",
          }}>
            <span className="blink" style={{ width:6, height:6, borderRadius:"50%", background:"#00d2ff", boxShadow:"0 0 6px #00d2ff" }} />
            Full-Stack PM · 20+ Years
          </div>

          {/* title */}
          <h1 style={{ fontSize:"clamp(28px,5vw,50px)", fontWeight:800, lineHeight:1.2, letterSpacing:"-0.5px", marginBottom:20 }}>
            <span style={{ color:"#f0f4ff" }}>기술과 관리를 잇는</span><br />
            <span style={{ background:"linear-gradient(100deg,#00d2ff,#7b6fff 55%,#ff6fb0)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Technical PM
            </span>
          </h1>

          {/* desc */}
          <p style={{ fontSize:15, lineHeight:1.9, color:"#8892a8", maxWidth:600 }}>
            TA 업무를 기반으로 <strong style={{ color:"#c8d4ec" }}>기획 · 분석 · 설계 · 개발 · 테스트 · 운영</strong> 전체를 직접 이끄는 PM입니다.
            커머스 플랫폼 전 도메인 경험과 GCP, MSA, DevSecOps 역량으로 비즈니스와 기술을 연결합니다.
          </p>

          {/* certs */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginTop:28 }}>
            {certs.map((c, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                background:"rgba(255,255,255,.03)", border:"1px solid rgba(0,210,255,.15)",
                borderRadius:12, padding:"14px 20px",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:"linear-gradient(135deg,rgba(0,210,255,.2),rgba(123,111,255,.2))",
                  border:"1px solid rgba(0,210,255,.3)", fontSize:11, fontWeight:800, color:"#00d2ff",
                }}>{c.short}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{c.name}</div>
                  <div style={{ fontSize:11, color:"#5a6478", marginTop:2 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* ── SUMMARY ── */}
        <section className="fade d1" style={{ marginBottom:56 }}>
          <div className="label">About Me</div>
          <div style={{
            borderRadius:16, padding:28,
            background:"rgba(255,255,255,.018)", border:"1px solid rgba(255,255,255,.06)",
          }}>
            <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:12 }}>
              {summary.map((item, i) => (
                <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, fontSize:14, color:"#b0bcd0", lineHeight:1.7 }}>
                  <span style={{ flexShrink:0, marginTop:6, width:6, height:6, borderRadius:"50%", background:"#00d2ff", boxShadow:"0 0 6px rgba(0,210,255,.6)" }} />
                  {i === 0
                    ? <strong style={{ color:"#e2e8f0", fontWeight:700 }}>{item}</strong>
                    : item
                  }
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── SKILLS (펼치기) ── */}
        <section className="fade d2" style={{ marginBottom:56 }}>
          <div className="label">Core Competencies — 항목을 클릭하면 상세 내용을 볼 수 있습니다</div>

          {skills.map((s, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`skill-row ${isOpen ? "open" : ""}`} onClick={() => toggle(i)}>

                {/* 헤더 */}
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 22px" }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{s.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color: isOpen ? "#00d2ff" : "#d0d8ec", marginBottom:4, transition:"color .2s" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize:12, color:"#5a6478" }}>{s.summary}</div>
                  </div>
                  {/* 접혔을 때 태그 미리보기 */}
                  {!isOpen && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, maxWidth:280 }}>
                      {s.tags.slice(0, 3).map((tag, j) => (
                        <span key={j} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <span className={`chevron ${isOpen ? "open" : ""}`} />
                </div>

                {/* 펼친 내용 */}
                <div className={`skill-body ${isOpen ? "open" : ""}`}>
                  <div style={{ padding:"0 22px 24px" }}>
                    <p style={{ fontSize:13, lineHeight:1.9, color:"#8892a8", marginBottom:16 }}>
                      {s.detail}
                    </p>

                    {/* 태그 전체 */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                      {s.tags.map((tag, j) => (
                        <span key={j} className="tag">{tag}</span>
                      ))}
                    </div>

                    {/* 사용 기술 */}
                    <div style={{ fontSize:10, letterSpacing:2, color:"#4a5470", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>
                      주요 사용 기술
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {s.stack.map((tech, j) => (
                        <span key={j} className="stack-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </section>

        {/* ── CAREER ── */}
        <section className="fade d2" style={{ marginBottom:56 }}>
          <div className="label">Experience</div>
          {careers.map((c, i) => (
            <div key={i} style={{
              borderRadius:16, padding:28,
              background:"rgba(255,255,255,.018)", border:"1px solid rgba(255,255,255,.06)",
            }}>
              {/* 회사 헤더 */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span style={{ fontSize:18, fontWeight:800, color:"#f0f4ff" }}>{c.company}</span>
                    {c.current && (
                      <span style={{
                        fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4,
                        background:"rgba(0,210,255,.15)", border:"1px solid rgba(0,210,255,.3)", color:"#00d2ff", letterSpacing:1,
                      }}>재직중</span>
                    )}
                  </div>
                  <div style={{ fontSize:13, color:"#7b6fff", fontWeight:600 }}>{c.dept} · {c.role}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, color:"#8892a8" }}>{c.period}</div>
                  <div style={{ fontSize:11, color:"#4a5470", marginTop:3 }}>{c.duration}</div>
                </div>
              </div>

              {/* 구분선 */}
              <div style={{ height:1, background:"rgba(255,255,255,.06)", marginBottom:18 }} />

              {/* 업무 목록 */}
              <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:10 }}>
                {c.works.map((w, j) => (
                  <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:12, fontSize:13, color:"#8892a8", lineHeight:1.7 }}>
                    <span style={{ flexShrink:0, marginTop:7, width:5, height:5, borderRadius:"50%", background:"rgba(123,111,255,.7)" }} />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ── TECH STACK ── */}
        <section className="fade d4" style={{ marginBottom:56 }}>
          <div className="label">Tech Stack</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14 }}>
            {techStack.map((cat, i) => (
              <div key={i} className="tech-card">
                <div style={{ height:3, borderRadius:2, background:`linear-gradient(90deg,${cat.color},transparent)`, marginBottom:14 }} />
                <div style={{ fontSize:11, fontWeight:700, color:cat.color, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:12 }}>
                  {cat.name}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {cat.items.map((item, j) => (
                    <span key={j} className="tech-item" style={{
                      background:`${cat.color}18`,
                      border:`1px solid ${cat.color}35`,
                      color: cat.color,
                    }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMMERCE DOMAINS ── */}
        <section className="fade d5" style={{
          borderRadius:16, padding:28, marginBottom:56,
          background:"rgba(255,255,255,.018)", border:"1px solid rgba(255,255,255,.06)",
        }}>
          <div className="label">Commerce Platform · Full Domain Coverage</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
            {domains.map((d, i) => (
              <span key={i} className="domain-tag">{d}</span>
            ))}
          </div>
          <p style={{ fontSize:13, color:"#4a5470", lineHeight:1.8, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.05)" }}>
            PG사·물류사·마케팅툴 외부 연계 솔루션 인터페이스 구축 &nbsp;·&nbsp; ISMS-P / PCI-DSS v4.0 보안 아키텍처 &nbsp;·&nbsp; 한국·글로벌 커머스 동시 운영
          </p>
        </section>

        {/* ── FOOTER ── */}
        <div className="fade d6" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, paddingTop:24, borderTop:"1px solid rgba(255,255,255,.04)" }}>
          <span style={{ fontSize:11, color:"#3a4258", letterSpacing:1 }}>
            Google Cloud · MSA · CI/CD · PMP · E-Commerce · ISMS-P
          </span>
          <span className="blink" style={{ width:8, height:8, borderRadius:"50%", background:"#00d2ff", boxShadow:"0 0 10px #00d2ff", display:"inline-block" }} />
        </div>

      </div>
    </main>
  );
}