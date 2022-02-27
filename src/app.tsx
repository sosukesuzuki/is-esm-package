import { QueryClient, QueryClientProvider } from "react-query";
import { useMemo, useState } from "preact/hooks";
import { useThrottle } from "react-use";
import {
  isNotFoundError,
  usePkgExports,
  usePkgJson,
  usePkgType,
} from "./use-pkg-type";

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
  const throttledPackageName = useThrottle(packageName, 1000);

  const pkgJson = usePkgJson(throttledPackageName);
  const pkgType = usePkgType(pkgJson);
  const pkgExports = usePkgExports(pkgJson);

  const isEsm = useMemo(() => pkgType === "module", [pkgType]);

  const shouldShownAnswer = useMemo(() => {
    if (throttledPackageName === "" || pkgJson.isLoading || pkgJson.isError) {
      return false;
    }
    return true;
  }, [pkgJson]);
  const shouldShownNotFound = useMemo(() => {
    if (pkgJson.isError && isNotFoundError(pkgJson.error)) {
      return true;
    }
    return false;
  }, [pkgType]);
  return (
    <>
      <form class="my-10">
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
      </form>
      <div class="text-3xl">
        {shouldShownAnswer ? (
          <IsEsmPkgAnswer isEsm={isEsm} pkgExports={pkgExports} />
        ) : null}
        {shouldShownNotFound ? (
          <p class="text-red-500">{throttledPackageName} not found.</p>
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
