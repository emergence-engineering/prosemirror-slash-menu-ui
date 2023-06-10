<script lang="ts">
  import type { EditorView } from "prosemirror-view";
  import type { EditorState } from "prosemirror-state";
  import type { SlashMenuDisplayConfig } from "./types";
  import { onMount, onDestroy } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import {
    dispatchWithMeta,
    SlashMenuKey,
    SlashMetaTypes,
  } from "prosemirror-slash-menu";
  import { getHeightModifier, getElements, getSubMenuLabel } from "./utils.svelte";
  import { getVirtualReference } from "./getVirtualReference.svelte";
  import { createPopperActions, updatePopperInstance } from "./createPopperActions";
  import { handleScroll, handleScrollToTop } from "./handleScroll";

  export let id: string;
  export let name: string;
  export let view: EditorView;
  export let initialState: EditorState;
  export let config: SlashMenuDisplayConfig;

  const state = writable(initialState);
  const menuHeight = writable(config.height);
  const shouldFlip = writable(false);
  const popperElement = writable<any>(null);

  $: menuState = SlashMenuKey.getState($state);
  $: elements = getElements(menuState);
  $: heightModifier = getHeightModifier(
    config,
    menuHeight,
    shouldFlip,
    $menuHeight,
    $shouldFlip
  );
  $: flipModifier = { name: "flip", enabled: $shouldFlip };
  $: virtualReference = getVirtualReference(view, $state);
  $: popperOptions = {
    modifiers: [
      flipModifier,
      heightModifier,
      {
        name: "preventOverflow",
        options: {
          mainAxis: false,
        },
      },
    ],
  }

  let rootRef: HTMLDivElement;
  let outsideClickHandler = (event: MouseEvent) => {
    if (
      rootRef &&
      (!event.target ||
        (event.target instanceof Node && !rootRef.contains(event.target)))
    ) {
      dispatchWithMeta(view, SlashMenuKey, { type: SlashMetaTypes.close });
    }
  };
  onMount(() => {
    document.addEventListener("mousedown", outsideClickHandler);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", outsideClickHandler);
  });
  const eventCb = (event) => {
    console.log({ event });
    state.set(event.detail);
  };
  onMount(() => {
    window.addEventListener(`update-${id}`, eventCb);
  });
  onDestroy(() => {
    window.removeEventListener(`update-${id}`, eventCb);
  });

  const [popperRef, popperContent, getPopperInstance] = createPopperActions(popperOptions);
  popperRef(virtualReference);
  $: updatePopperInstance(getPopperInstance, popperOptions)
  $: filteredElements = menuState.filteredElements;
  $: handleScroll(menuState, rootRef);
  $: handleScrollToTop(rootRef, filteredElements);
  $: subMenuLabel = getSubMenuLabel(menuState);
</script>

<main>
  {$state && JSON.stringify($state.toJSON(), null, 2)}
  <h1>Hello {name}!</h1>
  <p>
    Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
    how to build Svelte apps.
  </p>
  <div use:popperContent>
    Tooltip
    <div bind:this={rootRef}>rootRef</div>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    background-color: green;
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
