"use client";

import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Star, Plus, Trash2, Download, Eye, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────────────────── */
interface Experience {
  id: number; company: string; role: string; duration: string; desc: string;
}
interface Education {
  id: number; institution: string; degree: string; year: string; grade: string;
}

/* ── Helpers ────────────────────────────────────────────────────────── */
let seq = 100;
const uid = () => ++seq;

const Field = ({
  label, value, onChange, placeholder, icon: Icon, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: React.FC<{ size?: number; className?: string }>; type?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600",
          "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100",
          "py-2 pr-3 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors",
          Icon ? "pl-9" : "pl-3"
        )}
      />
    </div>
  </div>
);

const TextArea = ({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 px-3 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors resize-none"
    />
  </div>
);

/* ── Resume Preview ─────────────────────────────────────────────────── */
function ResumePreview({
  name, email, phone, location, summary, skills,
  experience, education, previewRef,
}: {
  name: string; email: string; phone: string; location: string;
  summary: string; skills: string;
  experience: Experience[]; education: Education[];
  previewRef: React.RefObject<HTMLDivElement>;
}) {
  const skillList = skills.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div
      ref={previewRef}
      id="resume-preview"
      className="bg-white text-slate-900 w-full rounded-xl shadow-xl overflow-hidden"
      style={{ fontFamily: "Georgia, serif", minHeight: 900 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-7 text-white">
        <h1 className="text-3xl font-bold tracking-wide">{name || "Your Name"}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-blue-100">
          {email    && <span>✉ {email}</span>}
          {phone    && <span>📞 {phone}</span>}
          {location && <span>📍 {location}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Summary */}
        {summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.some(e => e.company) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1 mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.filter(e => e.company).map(exp => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{exp.role || "Role"}</p>
                      <p className="text-xs text-blue-700 font-semibold">{exp.company}</p>
                    </div>
                    {exp.duration && (
                      <span className="text-xs text-slate-500 whitespace-nowrap mt-0.5">{exp.duration}</span>
                    )}
                  </div>
                  {exp.desc && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.some(e => e.institution) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {education.filter(e => e.institution).map(edu => (
                <div key={edu.id} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{edu.degree || "Degree"}</p>
                    <p className="text-xs text-blue-700 font-semibold">{edu.institution}</p>
                    {edu.grade && <p className="text-xs text-slate-500">{edu.grade}</p>}
                  </div>
                  {edu.year && <span className="text-xs text-slate-500 whitespace-nowrap mt-0.5">{edu.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skillList.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillList.map((s, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function ResumePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  /* Personal */
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState("");
  const [summary,  setSummary]  = useState("");
  const [skills,   setSkills]   = useState("");

  /* Experience */
  const [experience, setExperience] = useState<Experience[]>([
    { id: uid(), company: "", role: "", duration: "", desc: "" },
  ]);

  /* Education */
  const [education, setEducation] = useState<Education[]>([
    { id: uid(), institution: "", degree: "", year: "", grade: "" },
  ]);

  const previewRef = useRef<HTMLDivElement>(null!);

  /* Sections expand */
  const [openExp, setOpenExp] = useState(true);
  const [openEdu, setOpenEdu] = useState(true);

  /* ── Experience helpers ── */
  const addExp = () =>
    setExperience(p => [...p, { id: uid(), company: "", role: "", duration: "", desc: "" }]);
  const removeExp = (id: number) => setExperience(p => p.filter(e => e.id !== id));
  const updateExp = (id: number, k: keyof Experience, v: string) =>
    setExperience(p => p.map(e => (e.id === id ? { ...e, [k]: v } : e)));

  /* ── Education helpers ── */
  const addEdu = () =>
    setEducation(p => [...p, { id: uid(), institution: "", degree: "", year: "", grade: "" }]);
  const removeEdu = (id: number) => setEducation(p => p.filter(e => e.id !== id));
  const updateEdu = (id: number, k: keyof Education, v: string) =>
    setEducation(p => p.map(e => (e.id === id ? { ...e, [k]: v } : e)));

  /* ── Download as PDF ── */
  const handleDownload = async () => {
    const jsPDF = (await import("jspdf")).default;
    const html2canvas = (await import("html2canvas")).default;

    const el = document.getElementById("resume-preview");
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 2, useCORS: true, backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.97);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pW = 210, pH = 297;
    const ratio = Math.min(pW / canvas.width, pH / canvas.height);
    const iW = canvas.width * ratio, iH = canvas.height * ratio;
    pdf.addImage(imgData, "JPEG", (pW - iW) / 2, 0, iW, iH);
    pdf.save(`${name || "Resume"}.pdf`);
  };

  /* ── Section block ── */
  const Section = ({
    title, icon: Icon, open, toggle, children,
  }: {
    title: string; icon: React.FC<{ size?: number; className?: string }>; open: boolean; toggle: () => void; children: React.ReactNode;
  }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
      <button onClick={toggle}
        className="w-full flex items-center justify-between p-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-blue-500" />
          {title}
        </div>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Resume Builder</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Fill in your details · Preview · Download PDF</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  {(["edit", "preview"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                        activeTab === tab
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      )}>
                      {tab === "edit" ? "✏️ Edit" : "👁 Preview"}
                    </button>
                  ))}
                </div>
                <button onClick={handleDownload}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 transition-colors">
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </motion.div>

            {/* Two-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT — Form */}
              <AnimatePresence mode="wait">
                {activeTab === "edit" && (
                  <motion.div key="edit" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }} className="space-y-4">

                    {/* Personal Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-3">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <User size={15} className="text-blue-500" /> Personal Information
                      </p>
                      <Field label="Full Name" value={name} onChange={setName} placeholder="Aditya Singh" icon={User} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" icon={Mail} />
                        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" icon={Phone} />
                      </div>
                      <Field label="Location" value={location} onChange={setLocation} placeholder="Mumbai, India" icon={MapPin} />
                      <TextArea label="Professional Summary" value={summary} onChange={setSummary}
                        placeholder="Brief description about yourself and your goals..." rows={3} />
                    </div>

                    {/* Experience */}
                    <Section title="Work Experience" icon={Briefcase} open={openExp} toggle={() => setOpenExp(p => !p)}>
                      {experience.map((exp, i) => (
                        <div key={exp.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 space-y-2 relative">
                          {experience.length > 1 && (
                            <button onClick={() => removeExp(exp.id)}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                          )}
                          <p className="text-xs font-bold text-slate-500">Experience {i + 1}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Company" value={exp.company} onChange={v => updateExp(exp.id, "company", v)} placeholder="Google" />
                            <Field label="Role" value={exp.role} onChange={v => updateExp(exp.id, "role", v)} placeholder="Software Engineer" />
                          </div>
                          <Field label="Duration" value={exp.duration} onChange={v => updateExp(exp.id, "duration", v)} placeholder="Jan 2022 – Present" />
                          <TextArea label="Description" value={exp.desc} onChange={v => updateExp(exp.id, "desc", v)}
                            placeholder="Key responsibilities and achievements..." rows={2} />
                        </div>
                      ))}
                      <button onClick={addExp}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                        <Plus size={13} /> Add Experience
                      </button>
                    </Section>

                    {/* Education */}
                    <Section title="Education" icon={GraduationCap} open={openEdu} toggle={() => setOpenEdu(p => !p)}>
                      {education.map((edu, i) => (
                        <div key={edu.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 space-y-2 relative">
                          {education.length > 1 && (
                            <button onClick={() => removeEdu(edu.id)}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                          )}
                          <p className="text-xs font-bold text-slate-500">Education {i + 1}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Institution" value={edu.institution} onChange={v => updateEdu(edu.id, "institution", v)} placeholder="IIT Bombay" />
                            <Field label="Degree" value={edu.degree} onChange={v => updateEdu(edu.id, "degree", v)} placeholder="B.Tech CSE" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Year" value={edu.year} onChange={v => updateEdu(edu.id, "year", v)} placeholder="2018 – 2022" />
                            <Field label="Grade / CGPA" value={edu.grade} onChange={v => updateEdu(edu.id, "grade", v)} placeholder="8.5 CGPA" />
                          </div>
                        </div>
                      ))}
                      <button onClick={addEdu}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                        <Plus size={13} /> Add Education
                      </button>
                    </Section>

                    {/* Skills */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-3">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Star size={15} className="text-blue-500" /> Skills
                      </p>
                      <TextArea label="Skills (comma separated)" value={skills} onChange={setSkills}
                        placeholder="React, Node.js, TypeScript, Figma, SQL..." rows={2} />
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* RIGHT — Preview (always visible on lg, tab-switched on mobile) */}
              <div className={cn(
                "lg:block",
                activeTab === "preview" ? "block" : "hidden lg:block"
              )}>
                <div className="sticky top-0">
                  <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Eye size={13} /> Live Preview
                  </p>
                  <ResumePreview
                    name={name} email={email} phone={phone} location={location}
                    summary={summary} skills={skills}
                    experience={experience} education={education}
                    previewRef={previewRef}
                  />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
