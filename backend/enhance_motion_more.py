import re

path = r"d:\AI_Interview3.0\frontend\app\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Rubric Cards in Voice AI Section: Add hover lift effect
old_rubric_1 = '''                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2 transition-colors duration-300">'''
new_rubric_1 = '''                <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.2 }} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2 transition-colors duration-300 cursor-pointer">'''

content = content.replace(old_rubric_1, new_rubric_1)
# Replace matching closing </div>
content = content.replace('                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">System internals & architectural edge cases</span>\n                </div>', '                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">System internals & architectural edge cases</span>\n                </motion.div>')
content = content.replace('                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Correctness of AWS & Linux commands</span>\n                </div>', '                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Correctness of AWS & Linux commands</span>\n                </motion.div>')

# 2. Bottom 3 Feature Strips under Voice AI Section (Staggered Entrance on Scroll)
old_voice_strips = '''          {/* Bottom Strip (Screenshot 2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">'''

new_voice_strips = '''          {/* Bottom Strip (Screenshot 2) */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">'''

content = content.replace(old_voice_strips, new_voice_strips)
content = content.replace('            </div>\n          </div>\n\n        </div>\n      </section>\n\n      {/* 4. 5-STAGE SYSTEM SECTION', '            </div>\n          </motion.div>\n\n        </div>\n      </section>\n\n      {/* 4. 5-STAGE SYSTEM SECTION')

# 3. Bottom 3 Feature Strips under 5-Stage System Section
old_stage_strips = '''          {/* Bottom Strip (Screenshot 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">'''

new_stage_strips = '''          {/* Bottom Strip (Screenshot 3) */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">'''

content = content.replace(old_stage_strips, new_stage_strips)
content = content.replace('            </div>\n\n          </div>\n\n        </div>\n      </section>\n\n      {/* 5. ATS RESUME ANALYZER', '            </div>\n\n          </motion.div>\n\n        </div>\n      </section>\n\n      {/* 5. ATS RESUME ANALYZER')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Enhanced cards motion successfully.")
