import typescript from "rollup-plugin-typescript2";
import external from "rollup-plugin-peer-deps-external";

import pkg from "./package.json";

export default [
  {
    input: "./src/index.tsx",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
    ],
    external: ["react", "@reachsh/stdlib", "@doubco/logbook"],
    plugins: [
      external(),
      typescript({
        clean: true,
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
];
