import re

path = r"d:\AI_Interview3.0\frontend\app\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import for motion from framer-motion if not present
if 'import { motion } from "framer-motion";' not in content:
    content = content.replace(
        'import { useState, useEffect } from "react";',
        'import { useState, useEffect } from "react";\nimport { motion } from "framer-motion";'
    )

# 2. Hero Section Left (Slide in from Left)
content = content.replace(
    '<div className="lg:col-span-5 flex flex-col gap-6">',
    '<motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="lg:col-span-5 flex flex-col gap-6">'
)

# 3. Hero Section Right Visual (Slide in from Right with Scale)
content = content.replace(
    '<div className="lg:col-span-7 relative">',
    '<motion.div initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="lg:col-span-7 relative">'
)

# Close motion.div for Hero Left & Right
# Let's check matching divs or replace the section wrapper

# 4. 5-Stage System Cards (Slide from Bottom & Hover scale effect)
# Find the stage cards map
old_stage_card = '''              <div 
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between"
              >'''

new_stage_card = '''              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between cursor-pointer"
              >'''

content = content.replace(old_stage_card, new_stage_card)
content = content.replace('            ))} \n          </div>', '            ))} \n          </div>')

# Change closing </div> of stage card map loop
old_stage_card_close = '''                <Link href="/login" className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-extrabold text-[#FF6B00]">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>'''

new_stage_card_close = '''                <Link href="/login" className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-extrabold text-[#FF6B00]">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>'''

content = content.replace(old_stage_card_close, new_stage_card_close)

# 5. 30-Day Roadmap Week Cards (Alternating Left / Right entrance on Scroll + Hover Lift)
weeks = [
    ("WEEK 1", "-40px"),
    ("WEEK 2", "0px"),
    ("WEEK 3", "0px"),
    ("WEEK 4", "40px")
]

old_week_1 = '''            {/* Week 1 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all">'''

new_week_1 = '''            {/* Week 1 Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer"
            >'''

old_week_2 = '''            {/* Week 2 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all">'''

new_week_2 = '''            {/* Week 2 Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all cursor-pointer"
            >'''

old_week_3 = '''            {/* Week 3 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all">'''

new_week_3 = '''            {/* Week 3 Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all cursor-pointer"
            >'''

old_week_4 = '''            {/* Week 4 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all">'''

new_week_4 = '''            {/* Week 4 Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer"
            >'''

content = content.replace(old_week_1, new_week_1)
content = content.replace(old_week_2, new_week_2)
content = content.replace(old_week_3, new_week_3)
content = content.replace(old_week_4, new_week_4)

# Replace closing </div> for week cards to </motion.div>
# Note: all week cards end with:
#               </div>
#             </div>
#             
#             {/* Week X Card */}
content = content.replace('            </div>\n\n            {/* Week 2 Card */}', '            </motion.div>\n\n            {/* Week 2 Card */}')
content = content.replace('            </div>\n\n            {/* Week 3 Card */}', '            </motion.div>\n\n            {/* Week 3 Card */}')
content = content.replace('            </div>\n\n            {/* Week 4 Card */}', '            </motion.div>\n\n            {/* Week 4 Card */}')
content = content.replace('            </div>\n\n          </div>\n\n          {/* Bottom Feature Bar (Screenshot Roadmap) */}', '            </motion.div>\n\n          </div>\n\n          {/* Bottom Feature Bar (Screenshot Roadmap) */}')

# 6. Pre-Footer Banner (Scale in on scroll)
old_cta = '''          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">'''
new_cta = '''          <motion.div initial={{ opacity: 0, scale: 0.93, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">'''
content = content.replace(old_cta, new_cta)
content = content.replace('            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />\n          </div>', '            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />\n          </motion.div>')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied framer-motion animations successfully.")
