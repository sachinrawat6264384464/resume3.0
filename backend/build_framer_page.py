import re

path = r"d:\AI_Interview3.0\frontend\app\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines):
    # Add import
    if line.strip() == 'import { useState, useEffect } from "react";':
        out.append(line)
        out.append('import { motion } from "framer-motion";\n')
        continue

    # Hero left col
    if '<div className="lg:col-span-5 flex flex-col gap-6">' in line:
        out.append(line.replace('<div className="lg:col-span-5 flex flex-col gap-6">', '<motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="lg:col-span-5 flex flex-col gap-6">'))
        continue

    # Hero right col
    if '<div className="lg:col-span-7 relative">' in line:
        out.append(line.replace('<div className="lg:col-span-7 relative">', '<motion.div initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="lg:col-span-7 relative">'))
        continue

    # Hero feature cards
    if '<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-2">' in line:
        out.append(line.replace('<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-2">', '<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-2">'))
        continue

    # Hero Trust banner
    if '<div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">' in line:
        out.append(line.replace('<div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">', '<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">'))
        continue

    # Voice AI left col
    if '<div className="lg:col-span-6 flex flex-col gap-6">' in line and 'SPOKEN TECHNICAL' in "".join(lines[i:i+10]):
        out.append(line.replace('<div className="lg:col-span-6 flex flex-col gap-6">', '<motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="lg:col-span-6 flex flex-col gap-6">'))
        continue

    # Voice AI right col
    if '<div className="lg:col-span-6">' in line and 'Live Voice Stream' in "".join(lines[i:i+10]):
        out.append(line.replace('<div className="lg:col-span-6">', '<motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="lg:col-span-6">'))
        continue

    # 5 Stage title
    if '<div className="text-center max-w-3xl mx-auto mb-14">' in line:
        out.append(line.replace('<div className="text-center max-w-3xl mx-auto mb-14">', '<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-14">'))
        continue

    # 5 Stage Cards
    if 'key={idx}' in line and 'rounded-3xl bg-white dark:bg-slate-900' in line:
        out.append('''              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between cursor-pointer"
              >\n''')
        continue

    # ATS left col
    if '<div className="lg:col-span-6">' in line and 'STAR Formula Bullet Point' in "".join(lines[i:i+10]):
        out.append(line.replace('<div className="lg:col-span-6">', '<motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="lg:col-span-6">'))
        continue

    # ATS right col
    if '<div className="lg:col-span-6 flex flex-col gap-6">' in line and 'SCAN YOUR RESUME' in "".join(lines[i:i+10]):
        out.append(line.replace('<div className="lg:col-span-6 flex flex-col gap-6">', '<motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="lg:col-span-6 flex flex-col gap-6">'))
        continue

    # Roadmap Header
    if '<div className="text-center max-w-3xl mx-auto mb-16">' in line:
        out.append(line.replace('<div className="text-center max-w-3xl mx-auto mb-16">', '<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">'))
        continue

    # Roadmap week 1
    if '{/* Week 1 Card */}' in line:
        out.append(line)
        out.append('''            <motion.div 
              initial={{ opacity: 0, x: -60, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer"
            >\n''')
        continue

    if 'className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all"' in line:
        continue # replaced above

    # Roadmap week 2
    if '{/* Week 2 Card */}' in line:
        out.append(line)
        out.append('''            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all cursor-pointer"
            >\n''')
        continue

    if 'className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all"' in line:
        continue

    # Roadmap week 3
    if '{/* Week 3 Card */}' in line:
        out.append(line)
        out.append('''            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all cursor-pointer"
            >\n''')
        continue

    if 'className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all"' in line:
        continue

    # Roadmap week 4
    if '{/* Week 4 Card */}' in line:
        out.append(line)
        out.append('''            <motion.div 
              initial={{ opacity: 0, x: 60, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer"
            >\n''')
        continue

    # Pre-footer CTA
    if 'className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"' in line:
        out.append(line.replace('<div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">', '<motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">'))
        continue

    # Standard div output
    out.append(line)

# Match motion.div closings
full_text = "".join(out)
# Fix matching closing tags
full_text = full_text.replace('</div>\n              </div>\n\n            </div>\n\n            {/* Hero Right Column', '</motion.div>\n\n            {/* Hero Right Column')
full_text = full_text.replace('</div>\n            </div>\n\n          </div>\n        </div>\n\n        {/* TRUST BANNER', '</motion.div>\n          </div>\n        </div>\n\n        {/* TRUST BANNER')

with open(path, "w", encoding="utf-8") as f:
    f.write(full_text)

print("Generated clean motion-enabled page.tsx")
