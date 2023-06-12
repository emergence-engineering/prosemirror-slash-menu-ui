<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { SlashMenuState } from "prosemirror-slash-menu";

  export let currentSelected: string;
  export let id: string;
  // TODO: Maybe the function is not necessary
  export let Icon: (() => HTMLElement) | undefined;
  export let label: string;

  $: selected = currentSelected === id;
  $: console.log({currentSelected, id})
  $: iconElement = Icon?.() as HTMLElement | undefined
  let iconContainer: HTMLDivElement;

  onMount(() => {
    if (Icon) {
      iconContainer.appendChild(iconElement);
    }
  });

  onDestroy(() => {
    if (Icon) {
      iconContainer.innerHTML = "";
    }
  });
</script>

<div
  class="menu-element-wrapper"
  style="background-color: {selected ? '#f1f1f1' : 'white'};"
  {id}
>
  {#if Icon}
    <div class="menu-element-icon" bind:this={iconContainer} />
  {/if}

  <div class="menu-element">{label}</div>
</div>
