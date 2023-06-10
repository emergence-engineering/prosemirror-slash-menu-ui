<script context="module" lang="ts">
  import type { ModifierArguments, Options } from "@popperjs/core";
  import { detectOverflow } from "@popperjs/core"; // Update with the correct import path
  import type { SlashMenuState } from "prosemirror-slash-menu";
  import { getElementById } from "prosemirror-slash-menu";
  import type { Writable } from "svelte/store";
  import type { SlashMenuDisplayConfig } from "./types";

  export const getElements = (state: SlashMenuState) => {
    const { subMenuId, filteredElements } = state;
    if (!subMenuId) {
      return filteredElements;
    }
    const subMenu = getElementById(subMenuId, state);
    if (subMenu && subMenu.type === "submenu") {
      return subMenu.elements;
    }
  };

  export const getSubMenuLabel = (menuState: SlashMenuState) => {
    if (menuState?.subMenuId) {
      return getElementById(menuState.subMenuId, menuState)?.label;
    }
  }

  export const getHeightModifier = (
    config: SlashMenuDisplayConfig,
    menuHeightWriteable: Writable<number>,
    shouldFlipWriteable: Writable<boolean>,
    menuHeight: number,
    shouldFlip: boolean
  ) => ({
    name: "heightModifier",
    enabled: true,
    phase: "main",
    requiresIfExists: ["offset"],
    fn(props: ModifierArguments<Options>) {
      const { state } = props;
      const overflow = detectOverflow(state);
      if (menuHeight < config.minHeight) {
        shouldFlipWriteable.set(true);
        menuHeightWriteable.set(config.height);
        return;
      }
      if (overflow.bottom + config.overflowPadding > 0 && !shouldFlip) {
        const newMenuHeight =
          config.height - config.overflowPadding - overflow.bottom;
        menuHeightWriteable.set(newMenuHeight);
        return;
      }
      if (menuHeight < config.height) {
        menuHeightWriteable.set(config.height);
        return;
      }
      if (overflow.bottom < -config.minHeight) {
        shouldFlipWriteable.set(false);
        menuHeightWriteable.set(config.height);
        return;
      }
      return;
    },
  });
</script>
