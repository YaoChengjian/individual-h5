<template>
	<div v-if="isExternalIcon" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-bind="$attrs" />
	<svg v-else :class="svgClass" aria-hidden="true" v-bind="$attrs">
		<use :xlink:href="iconName" />
	</svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isExternal } from "/@/utils/validate";

interface SvgIconProps {
	name: string;
	className?: string;
}
const props = withDefaults(defineProps<SvgIconProps>(), {
	name: "",
	className: "",
});

const isExternalIcon = computed(() => isExternal(props.name));
const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => (props.className ? "svg-icon " + props.className : "svg-icon"));
// 外链 icon
const styleExternalIcon = computed(() => {
	return {
		mask: `url(${props.name}) no-repeat 50% 50%`,
		"-webkit-mask": `url(${props.name}) no-repeat 50% 50%`,
	};
});
</script>

<style scoped>
.svg-icon {
	width: 1em;
	height: 1em;
	vertical-align: -0.15em;
	fill: currentColor;
	overflow: hidden;
}

.svg-external-icon {
	background-color: currentColor;
	mask-size: cover !important;
	display: inline-block;
}
</style>
