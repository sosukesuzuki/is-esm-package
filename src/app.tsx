import { QueryClient, QueryClientProvider } from "react-query";
import { useMemo, useState } from "preact/hooks";
import { useThrottle } from "react-use";
import { isNotFoundError, usePkgType } from "./use-pkg-type";

function IsEsmPkgForm() {
  const [packageName, setPackageName] = useState("");
  const throttledPackageName = useThrottle(packageName);
  const pkgType = usePkgType(throttledPackageName);
  const isEsm = useMemo(() => pkgType.data === "module", [pkgType]);
  const shouldShownAnswer = useMemo(() => {
    if (throttledPackageName === "" || pkgType.isLoading || pkgType.isError) {
      return false;
    }
    return true;
  }, [throttledPackageName, pkgType]);
  const shouldShownNotFound = useMemo(() => {
    if (pkgType.isError && isNotFoundError(pkgType.error)) {
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
          isEsm ? (
            <p class="text-red-500">YES</p>
          ) : (
            <p class="text-blue-500">NO</p>
          )
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
