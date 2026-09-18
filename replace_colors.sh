#!/bin/bash
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/stone-50/bg/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/stone-950/ink/g'

# Backgrounds
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-stone-900/bg-ink/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-stone-800/bg-ink/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-stone-100/bg-ink-faint/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-stone-200/bg-ink-faint/g'

# Texts
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-900/text-ink/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-800/text-ink/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-100/text-bg/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-200/text-bg/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-300/text-ink-muted/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-400/text-ink-muted/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-500/text-ink-muted/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-600/text-ink-muted/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-stone-700/text-ink-muted/g'

# Borders
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-stone-800/border-ink-faint/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-stone-900/border-ink/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-stone-100/border-ink-faint/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-stone-200/border-ink-faint/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-stone-300/border-ink-faint/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-stone-700/border-ink-faint/g'

# Muted Backgrounds
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-white\/85/bg-bg/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-white/bg-bg/g'

# Stroke and fills
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/stone/ink/g'

# Update rounding and borders
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/rounded-sm/rounded-none/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border /border-[1.5px] /g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-b /border-b-[1.5px] /g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-t /border-t-[1.5px] /g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-l /border-l-[1.5px] /g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-r /border-r-[1.5px] /g'

