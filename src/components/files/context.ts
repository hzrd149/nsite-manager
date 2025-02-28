import { createContext, useContext } from "react";

export const FilesCwdContext = createContext({
  path: "/",
  change: (_path: string) => {},
  link: (_path: string): string => {
    return "/";
  },
});

export function useFolderCwd() {
  const ctx = useContext(FilesCwdContext);
  if (!ctx) throw new Error("Missing folder cwd context");
  return ctx;
}

export type FilesSelectionContextType = {
  selected: string[];
  replace: (paths: string[]) => void;
  toggle: (path: string) => void;
};

export const FilesSelectionContext = createContext<
  FilesSelectionContextType | undefined
>(undefined);
