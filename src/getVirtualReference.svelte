<script context="module" lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

export const getVirtualReference = (editorView: EditorView, editorState: EditorState)=> {
    const domNode = editorView.domAtPos(editorState.selection.to)?.node;
    if (!(domNode instanceof HTMLElement)) return;
    const { top, left, height } = domNode.getBoundingClientRect();
    return {
      getBoundingClientRect() {
        return {
          top: top,
          right: left,
          bottom: top,
          left: left,
          width: 0,
          height: height,
          x: left,
          y: top,
          // TODO missing toJSON causes type error do we really need this?
          toJSON: () =>
            JSON.stringify({
              top: top,
              right: left,
              bottom: top,
              left: left,
              width: 0,
              height: height,
              x: left,
              y: top,
            }),
        };
      },
    };
  }
  </script>
  