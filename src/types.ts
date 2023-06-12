import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

export interface SlashMenuDisplayConfig {
  height: number;
  minHeight: number;
  overflowPadding: number;
}

export interface SlashMenuProps {
  editorState: EditorState;
  editorView: EditorView;
  config: SlashMenuDisplayConfig;
  icons?: {
    [key: string]: () => Node;
  };
}

export type IconConfig = Record<string, ()=> HTMLElement>