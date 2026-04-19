<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="p-5 md:p-8">
    <div class="max-w-2xl mx-auto">
      <SettingsSectionHeader icon="mdi:calculator-variant-outline" title="Results &amp; Display" description="Precision, formatting, and inline result behaviour" />
      <UiListMenu label="Precision" preset="settings">
        <UiListMenuItem icon="mdi:decimal" :select-ref="selectPrecisionMode">
          Precision Mode
          <template #suffix>
            <UiSelect ref="selectPrecisionMode" :model-value="preferences.precisionMode" :options="precisionModeOptions" @update:model-value="preferences.precisionMode = $event; onSettingChange()" />
          </template>
        </UiListMenuItem>
        <UiListMenuItem v-if="preferences.precisionMode !== 'auto'" icon="mdi:decimal-decrease" :select-ref="selectRoundingMode">
          Rounding Mode
          <template #suffix>
            <UiSelect ref="selectRoundingMode" :model-value="preferences.roundingMode" :options="[{ value: 'round', label: 'Round' }, { value: 'truncate', label: 'Truncate' }]" @update:model-value="preferences.roundingMode = $event; onSettingChange()" />
          </template>
        </UiListMenuItem>
        <div v-if="preferences.precisionMode === 'decimals'" class="px-4 py-3 border-t border-gray-100 dark:border-gray-700/40">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2"><Icon name="mdi:decimal-increase" class="w-4 h-4 text-gray-400 dark:text-gray-500" /><label class="text-sm text-gray-800 dark:text-gray-300">Decimal Places</label></div>
            <span class="text-sm font-medium text-primary-600 dark:text-primary-400 tabular-nums">{{ preferences.decimalPlaces }}</span>
          </div>
          <UiSlider v-model="preferences.decimalPlaces" min="0" max="15" step="1" @input="onSettingChange" />
          <div class="flex justify-between text-[11px] text-gray-400 mt-1"><span>0</span><span>15</span></div>
        </div>
        <div v-if="preferences.precisionMode === 'significant'" class="px-4 py-3 border-t border-gray-100 dark:border-gray-700/40">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2"><Icon name="mdi:sigma" class="w-4 h-4 text-gray-400 dark:text-gray-500" /><label class="text-sm text-gray-800 dark:text-gray-300">Significant Figures</label></div>
            <span class="text-sm font-medium text-primary-600 dark:text-primary-400 tabular-nums">{{ preferences.significantFigures }}</span>
          </div>
          <UiSlider v-model="preferences.significantFigures" min="1" max="15" step="1" @input="onSettingChange" />
          <div class="flex justify-between text-[11px] text-gray-400 mt-1"><span>1</span><span>15</span></div>
        </div>
      </UiListMenu>
      <UiListMenu label="Output" preset="settings" class="mt-5">
        <UiListMenuItem icon="mdi:content-copy" hint="Copy result to clipboard when clicked" :toggle="preferences.autoCopyResult" @update:toggle="preferences.autoCopyResult = $event; onSettingChange()">
          Auto-copy Results
          <template #suffix><UiToggle :model-value="preferences.autoCopyResult" readonly /></template>
        </UiListMenuItem>
        <UiListMenuItem icon="mdi:code-tags" hint="Evaluate and display results inside fenced code blocks" :toggle="preferences.showResultsInCodeBlocks" @update:toggle="preferences.showResultsInCodeBlocks = $event; onSettingChange()">
          Results in Code Blocks
          <template #suffix><UiToggle :model-value="preferences.showResultsInCodeBlocks" readonly /></template>
        </UiListMenuItem>
        <UiListMenuItem v-if="preferences.autoCopyResult" icon="mdi:animation-outline" :select-ref="selectCopyAnimation">
          Copy Animation
          <template #suffix>
            <UiSelect ref="selectCopyAnimation" :model-value="preferences.copyAnimationStyle" :options="copyAnimationOptions" @update:model-value="preferences.copyAnimationStyle = $event; onSettingChange()" />
          </template>
        </UiListMenuItem>
      </UiListMenu>
    </div>
  </div>
</template>

<script setup>
defineProps({
  preferences: { type: Object, required: true },
  onSettingChange: { type: Function, required: true },
})

const selectPrecisionMode = ref(null)
const selectRoundingMode = ref(null)
const selectCopyAnimation = ref(null)

const precisionModeOptions = [
  { value: 'auto', label: 'Auto (smart)' },
  { value: 'decimals', label: 'Fixed decimals' },
  { value: 'significant', label: 'Significant figures' },
]

const copyAnimationOptions = [
  { value: 'float-up', label: 'Float up' },
  { value: 'fade', label: 'Fade' },
  { value: 'scale-pop', label: 'Scale pop' },
  { value: 'slide-right', label: 'Slide' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'glow', label: 'Glow' },
  { value: 'none', label: 'None' },
]
</script>
