#!/bin/bash
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/slate-/stone-/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/rounded-2xl/rounded-none/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/rounded-xl/rounded-sm/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/rounded-lg/rounded-sm/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/shadow-lg/shadow-none/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/shadow-md/shadow-none/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/shadow-sm/shadow-none/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/shadow-xs/shadow-none/g'

# Blue replacements (Brand color -> Monochrome)
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-blue-600/bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-blue-700/hover:bg-stone-800 dark:hover:bg-stone-200/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-600/text-stone-900 dark:text-stone-100/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-500/text-stone-900 dark:text-stone-100/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-blue-50/bg-stone-100 dark:bg-stone-900/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-blue-100/bg-stone-200 dark:bg-stone-800/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-blue-200\/50/border-stone-300 dark:border-stone-700/g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-blue-200/border-stone-300 dark:border-stone-700/g'

# Remove background gradients and generic SaaS stuff if any
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gradient-to-br//g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from-slate-50//g'
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/to-slate-100//g'
