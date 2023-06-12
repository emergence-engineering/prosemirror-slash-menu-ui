<script lang="ts">
  import type { EditorView } from "prosemirror-view";
  import type { EditorState } from "prosemirror-state";
  import type { IconConfig, SlashMenuDisplayConfig } from "./types";
  import { onMount, onDestroy } from "svelte";
  import { get, writable } from "svelte/store";
  import {
    dispatchWithMeta,
    SlashMenuKey,
    SlashMetaTypes,
  } from "prosemirror-slash-menu";
  import {
    getHeightModifier,
    getElements,
    getSubMenuLabel,
  } from "./utils.svelte";
  import { getVirtualReference } from "./getVirtualReference.svelte";
  import {
    createPopperActions,
    updatePopperInstance,
  } from "./createPopperActions";
  import { handleScroll, handleScrollToTop } from "./handleScroll";
  import ListItem from "./ListItem.svelte";

  export let icons: IconConfig;
  export let id: string;
  export let view: EditorView;
  export let config: SlashMenuDisplayConfig;

  let editorState = view.state;
  const menuHeight = writable(config.height);
  const shouldFlip = writable(false);

  $: menuState = SlashMenuKey.getState(editorState);
  $: {
    console.log({ menuState });
  }
  $: elements = getElements(menuState);
  $: heightModifier = getHeightModifier(
    config,
    menuHeight,
    shouldFlip,
    $menuHeight,
    $shouldFlip
  );
  $: flipModifier = { name: "flip", enabled: $shouldFlip };
  $: virtualReference = getVirtualReference(view, editorState);
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
  };

  let rootRef: HTMLDivElement | undefined;

  const outsideClickHandler = (event: MouseEvent) => {
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
    editorState = event.detail;
  };
  onMount(() => {
    window.addEventListener(`update-${id}`, eventCb);
  });
  onDestroy(() => {
    window.removeEventListener(`update-${id}`, eventCb);
  });

  const [popperRef, popperContent, getPopperInstance] =
    createPopperActions(popperOptions);
    console.log("v7")
  $: virtualReference && popperRef(virtualReference)
  $: {
    const popperInstance = getPopperInstance();
    popperInstance && updatePopperInstance(popperInstance, popperOptions);
  }
  $: filteredElements = menuState.filteredElements;
  $: handleScroll(menuState, rootRef);
  $: handleScrollToTop(filteredElements, rootRef);
  $: subMenuLabel = getSubMenuLabel(menuState);
  $: currentSelected = menuState.selected;
  $: console.log({currentSelected})
</script>

<main>
  <!-- {$state && JSON.stringify($state.toJSON(), null, 2)} -->
  <!-- <h1>Hello {name}!</h1>
  <p>
    Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
    how to build Svelte apps.
  </p> -->
  {#if menuState.open}
    <div use:popperContent style="height: ${config.height}; padding: 0.5rem;">
      {#if menuState.filter}
        <div class="menu-filter-wrapper">
          <div id="menu-filter" class="menu-filter">
            {menuState.filter}
          </div>
        </div>
      {/if}

      <div
        id="slashDisplay"
        bind:this={rootRef}
        class="menu-display-root"
        style="height: {menuHeight}"
      >
        {#if menuState.subMenuId}
          <div class="menu-element-wrapper">
            <div class="menu-element-icon">
              <!-- TODO -->
              <!-- <ArrowLeft /> -->
              l
            </div>
            <div class="submenu-label">{subMenuLabel}</div>
          </div>
        {/if}

        {#each elements as el, idx (el.id)}
          <ListItem
            {currentSelected}
            id={el.id}
            Icon={icons?.[el.id]}
            label={el.label}
          />
        {/each}

        {#if elements.length === 0}
          <div class="menu-placeholder">No Matching items</div>
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  .menu-display-root {
    position: absolute;
    display: flex;
    flex-direction: column;
    height: 500px;
    width: 300px;
    z-index: 100;
    overflow: scroll;
    border-radius: 0.3rem;
    background-color: #fafafa;
    border: 2px solid #dddddd;
  }

  .menu-element-wrapper {
    display: flex;
    border-radius: 0.3rem;
    padding: 0.2rem 0.5rem;
  }

  .menu-element-icon {
    width: 23px;
    height: auto;
    display: flex;
    align-items: center;
  }

  .menu-element {
    color: black;
    display: flex;
    align-items: center;
  }

  .menu-placeholder {
    color: #aaaaaa;
    text-align: center;
    padding-top: 1rem;
  }

  .menu-filter-wrapper {
    display: flex;
    background-color: transparent;
    padding: 0.2rem 0.5rem;
    position: absolute;
    top: -1rem;
  }

  .menu-filter {
    color: #aaaaaa;
    font-style: italic;
  }

  .menu-backarrow {
    width: 17px;
    height: auto;
    margin: 0.5rem 0 0.2rem 0.5rem;
  }

  .submenu-label {
    margin-left: 0.5rem;
  }
</style>
