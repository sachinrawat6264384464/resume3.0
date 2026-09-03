import re

path = r"d:\AI_Interview3.0\frontend\app\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import and helper components
helpers = '''import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function MotionLeft({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MotionRight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MotionUp({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MotionCard({ children, className = "", delay = 0, xOffset = 0 }: { children: React.ReactNode; className?: string; delay?: number; xOffset?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 45, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
'''

content = content.replace('import { useState, useEffect } from "react";', helpers)

# 2. Hero Left
content = content.replace(
    '<div className="lg:col-span-5 flex flex-col gap-6">',
    '<MotionLeft className="lg:col-span-5 flex flex-col gap-6">'
)

# 3. Hero Right
content = content.replace(
    '<div className="lg:col-span-7 relative">',
    '<MotionRight className="lg:col-span-7 relative">'
)

# Replace closing divs for Hero Left & Right
# In Hero section:
#               </div>
#             </div>
#
#             {/* Hero Right Column
content = content.replace('              </div>\n\n            {/* Hero Right Column', '              </MotionLeft>\n\n            {/* Hero Right Column')
content = content.replace('            </div>\n\n          </div>\n        </div>\n\n        {/* TRUST BANNER', '            </MotionRight>\n\n          </div>\n        </div>\n\n        {/* TRUST BANNER')

# 4. Hero Trust Banner
content = content.replace(
    '<div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">',
    '<MotionUp className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">'
)
content = content.replace('          </div>\n        </div>\n      </section>\n\n      {/* 3. VOICE AI', '          </MotionUp>\n        </div>\n      </section>\n\n      {/* 3. VOICE AI')

# 5. Voice AI Section Left (Title & Rubric Cards)
content = content.replace(
    '<div className="lg:col-span-6 flex flex-col gap-6">',
    '<MotionLeft className="lg:col-span-6 flex flex-col gap-6">'
)
content = content.replace('            </div>\n\n            {/* Right Dark Audio Stream', '            </MotionLeft>\n\n            {/* Right Dark Audio Stream')

# 6. Voice AI Section Right (Live Stream Chamber Mock)
content = content.replace(
    '<div className="lg:col-span-6">',
    '<MotionRight className="lg:col-span-6">'
)
content = content.replace('            </div>\n\n          </div>\n\n          {/* Bottom Strip (Screenshot 2)', '            </MotionRight>\n\n          </div>\n\n          {/* Bottom Strip (Screenshot 2)')

# 7. 5-Stage System Cards (MotionCard)
old_stage_card = '''              <div 
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between"
              >'''

new_stage_card = '''              <MotionCard 
                key={idx}
                delay={idx * 0.1}
                xOffset={idx % 2 === 0 ? -30 : 30}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between cursor-pointer"
              >'''

content = content.replace(old_stage_card, new_stage_card)

old_stage_close = '''                <Link href="/login" className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-extrabold text-[#FF6B00]">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>'''

new_stage_close = '''                <Link href="/login" className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-extrabold text-[#FF6B00]">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MotionCard>'''

content = content.replace(old_stage_close, new_stage_close)

# 8. ATS Resume Left (STAR Rewriter)
content = content.replace(
    '<div className="lg:col-span-6">\n              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">',
    '<MotionLeft className="lg:col-span-6">\n              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">'
)
content = content.replace('            </div>\n\n            {/* Right Column: Title & 5 Features', '            </MotionLeft>\n\n            {/* Right Column: Title & 5 Features')

# 9. ATS Resume Right (Title & 5 Features)
content = content.replace(
    '<div className="lg:col-span-6 flex flex-col gap-6">',
    '<MotionRight className="lg:col-span-6 flex flex-col gap-6">'
)
content = content.replace('            </div>\n\n          </div>\n        </div>\n      </section>\n\n      {/* 6. 30-DAY GUIDED', '            </MotionRight>\n\n          </div>\n        </div>\n      </section>\n\n      {/* 6. 30-DAY GUIDED')

# 10. 30-Day Roadmap Week Cards
old_w1 = '<div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all">'
new_w1 = '<MotionCard delay={0.1} xOffset={-40} className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer">'

old_w2 = '<div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all">'
new_w2 = '<MotionCard delay={0.2} xOffset={0} className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all cursor-pointer">'

old_w3 = '<div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all">'
new_w3 = '<MotionCard delay={0.3} xOffset={0} className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all cursor-pointer">'

old_w4 = '<div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all">'
new_w4 = '<MotionCard delay={0.4} xOffset={40} className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer">'

content = content.replace(old_w1, new_w1)
content = content.replace(old_w2, new_w2)
content = content.replace(old_w3, new_w3)
content = content.replace(old_w4, new_w4)

content = content.replace('            </div>\n\n            {/* Week 2 Card */}', '            </MotionCard>\n\n            {/* Week 2 Card */}')
content = content.replace('            </div>\n\n            {/* Week 3 Card */}', '            </MotionCard>\n\n            {/* Week 3 Card */}')
content = content.replace('            </div>\n\n            {/* Week 4 Card */}', '            </MotionCard>\n\n            {/* Week 4 Card */}')
content = content.replace('            </div>\n\n          </div>\n\n          {/* Bottom Feature Bar (Screenshot Roadmap)', '            </MotionCard>\n\n          </div>\n\n          {/* Bottom Feature Bar (Screenshot Roadmap)')

# 11. Pre-Footer Banner
old_prefooter = '<div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">'
new_prefooter = '<MotionUp className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">'

content = content.replace(old_prefooter, new_prefooter)
content = content.replace('            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />\n          </div>', '            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />\n          </MotionUp>')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Motion wrapper components cleanly.")
