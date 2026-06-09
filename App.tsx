import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/admin.tsx";
import PageLayout_0 from "./pages/admin.pageLayout.tsx";
import Page_1 from "./pages/login.tsx";
import PageLayout_1 from "./pages/login.pageLayout.tsx";
import Page_2 from "./pages/_index.tsx";
import PageLayout_2 from "./pages/_index.pageLayout.tsx";
import Page_3 from "./pages/photos.tsx";
import PageLayout_3 from "./pages/photos.pageLayout.tsx";
import Page_4 from "./pages/en.home.tsx";
import PageLayout_4 from "./pages/en.home.pageLayout.tsx";
import Page_5 from "./pages/stories.tsx";
import PageLayout_5 from "./pages/stories.pageLayout.tsx";
import Page_6 from "./pages/tributes.tsx";
import PageLayout_6 from "./pages/tributes.pageLayout.tsx";
import Page_7 from "./pages/biography.tsx";
import PageLayout_7 from "./pages/biography.pageLayout.tsx";
import Page_8 from "./pages/en.photos.tsx";
import PageLayout_8 from "./pages/en.photos.pageLayout.tsx";
import Page_9 from "./pages/en.stories.tsx";
import PageLayout_9 from "./pages/en.stories.pageLayout.tsx";
import Page_10 from "./pages/en.biography.tsx";
import PageLayout_10 from "./pages/en.biography.pageLayout.tsx";
import Page_11 from "./pages/commemoration.tsx";
import PageLayout_11 from "./pages/commemoration.pageLayout.tsx";
import Page_12 from "./pages/acknowledgments.tsx";
import PageLayout_12 from "./pages/acknowledgments.pageLayout.tsx";
import Page_13 from "./pages/en.acknowledgments.tsx";
import PageLayout_13 from "./pages/en.acknowledgments.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/admin.tsx","/admin"],["./pages/login.tsx","/login"],["./pages/_index.tsx","/"],["./pages/photos.tsx","/photos"],["./pages/en.home.tsx","/en/home"],["./pages/stories.tsx","/stories"],["./pages/tributes.tsx","/tributes"],["./pages/biography.tsx","/biography"],["./pages/en.photos.tsx","/en/photos"],["./pages/en.stories.tsx","/en/stories"],["./pages/en.biography.tsx","/en/biography"],["./pages/commemoration.tsx","/commemoration"],["./pages/acknowledgments.tsx","/acknowledgments"],["./pages/en.acknowledgments.tsx","/en/acknowledgments"]]);
const fileNameToComponent = new Map([
    ["./pages/admin.tsx", Page_0],
["./pages/login.tsx", Page_1],
["./pages/_index.tsx", Page_2],
["./pages/photos.tsx", Page_3],
["./pages/en.home.tsx", Page_4],
["./pages/stories.tsx", Page_5],
["./pages/tributes.tsx", Page_6],
["./pages/biography.tsx", Page_7],
["./pages/en.photos.tsx", Page_8],
["./pages/en.stories.tsx", Page_9],
["./pages/en.biography.tsx", Page_10],
["./pages/commemoration.tsx", Page_11],
["./pages/acknowledgments.tsx", Page_12],
["./pages/en.acknowledgments.tsx", Page_13],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  const navType = useNavigationType(); // "PUSH" | "REPLACE" | "POP"

  useEffect(() => {
    // Back/forward: keep browser-like behavior
    if (navType === "POP") return;

    // Hash links: let the browser scroll to the anchor
    if (hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search, hash, navType]);

  return null;
}

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <ScrollManager />
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/admin.tsx": PageLayout_0,
"./pages/login.tsx": PageLayout_1,
"./pages/_index.tsx": PageLayout_2,
"./pages/photos.tsx": PageLayout_3,
"./pages/en.home.tsx": PageLayout_4,
"./pages/stories.tsx": PageLayout_5,
"./pages/tributes.tsx": PageLayout_6,
"./pages/biography.tsx": PageLayout_7,
"./pages/en.photos.tsx": PageLayout_8,
"./pages/en.stories.tsx": PageLayout_9,
"./pages/en.biography.tsx": PageLayout_10,
"./pages/commemoration.tsx": PageLayout_11,
"./pages/acknowledgments.tsx": PageLayout_12,
"./pages/en.acknowledgments.tsx": PageLayout_13,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
