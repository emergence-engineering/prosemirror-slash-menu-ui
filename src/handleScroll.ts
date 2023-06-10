import type { MenuElement, SlashMenuState } from "prosemirror-slash-menu";

export const handleScroll = (menuState: SlashMenuState, rootRef: HTMLDivElement)=> {
    if (!menuState) return;
    const element = document.getElementById(menuState.selected);

    if (!element || !rootRef) return;
    const isTopElement =
      menuState.selected === menuState.filteredElements[0].id;
    if (isTopElement) {
      rootRef.scrollTop = 0;
      return;
    }
    const height =
      element.clientHeight +
      parseInt(
        window.getComputedStyle(element).getPropertyValue("margin-top"),
      ) +
      parseInt(
        window.getComputedStyle(element).getPropertyValue("margin-bottom"),
      ) +
      parseInt(
        window.getComputedStyle(element).getPropertyValue("padding-top"),
      ) +
      parseInt(
        window.getComputedStyle(element).getPropertyValue("padding-bottom"),
      );

    const { bottom, top } = element.getBoundingClientRect();
    const containerRect = rootRef.getBoundingClientRect();
    const scrollUp = top - height < containerRect.top;
    const visible = scrollUp
      ? top - containerRect.top > height
      : !(bottom > containerRect.bottom);
    if (!visible) {
      if (scrollUp) {
        rootRef.scrollTop = element.offsetTop - height / 2;
      } else {
        rootRef.scrollTop =
          element.offsetTop - containerRect.height + height + height / 4;
      }
    }
  }

  export const handleScrollToTop = (rootRef: HTMLDivElement, filteredElements: MenuElement[])=> {
    rootRef.scrollTop = 0;
  }