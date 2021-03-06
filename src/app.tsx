import { QueryClient, QueryClientProvider } from "react-query";
import { useMemo, useState } from "preact/hooks";
import { useThrottle } from "react-use";
import {
  isNotFoundError,
  usePkgExports,
  usePkgJson,
  usePkgType,
} from "./pkg-json";

function IsEsmPkgAnswer({
  isEsm,
  pkgExports,
}: {
  isEsm: boolean;
  pkgExports: string | undefined;
}) {
  return (
    <div>
      <div class="mb-10">
        {isEsm ? (
          <p class="text-red-500">YES</p>
        ) : (
          <p class="text-blue-500">NO</p>
        )}
      </div>
      {typeof pkgExports === "string" ? (
        <div class="text-base">
          <p class="mb-5">
            <span class="bg-slate-100 font-mono">exports</span> in{" "}
            <span class="bg-slate-100 font-mono">package.json</span>:
          </p>
          <pre class="bg-slate-100 p-5 font-mono">
            <code>{pkgExports}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function IsEsmPkgForm() {
  const [packageName, setPackageName] = useState("");
  const [currentPackageName, setCurrentPackageName] = useState("");

  const pkgJson = usePkgJson(currentPackageName);

  const pkgType = usePkgType(pkgJson);
  const pkgExports = usePkgExports(pkgJson);

  const isEsm = useMemo(() => pkgType === "module", [pkgType]);

  const shouldShownAnswer = useMemo(() => {
    if (currentPackageName === "" || pkgJson.isLoading || pkgJson.isError) {
      return false;
    }
    return true;
  }, [pkgJson]);
  const shouldShownNotFound = useMemo(() => {
    if (pkgJson.isError && isNotFoundError(pkgJson.error)) {
      return true;
    }
    return false;
  }, [pkgJson]);
  return (
    <>
      <div class="my-10 flex">
        <p class="text-3xl">
          Is
          <span class="px-3">
            <input
              type="text"
              placeholder="package name"
              class="border"
              value={packageName}
              onInput={(e) => {
                setPackageName(
                  // @ts-ignore
                  e.target?.value ?? ""
                );
              }}
            />
          </span>
          an ESM package?
        </p>
        <div class="ml-3">
          <button
            class="cursor-pointer rounded bg-blue-500 py-2 px-5 text-white hover:bg-blue-600"
            onClick={() => {
              setCurrentPackageName(packageName);
            }}
          >
            submit
          </button>
        </div>
      </div>
      <div class="text-3xl">
        {pkgJson.isLoading ? <p>...fetching</p> : null}
        {shouldShownAnswer ? (
          <IsEsmPkgAnswer isEsm={isEsm} pkgExports={pkgExports} />
        ) : null}
        {shouldShownNotFound ? (
          <p class="text-red-500">{currentPackageName} not found.</p>
        ) : null}
      </div>
    </>
  );
}

const queryClient = new QueryClient();
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div class="container mx-auto">
        <header class="my-10">
          <h1 class="text-5xl font-bold">is-esm-pkg</h1>
        </header>
        <div class="my-10">
          <p class="text-base">
            is-esm-pkg is a website to check if a npm package is an{" "}
            <a
              href="https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c"
              target="_blank"
              class="font-bold text-blue-500 hover:underline"
            >
              ESM package.
            </a>
          </p>
        </div>
        <main>
          <IsEsmPkgForm />
        </main>
      </div>
    </QueryClientProvider>
  );
}
