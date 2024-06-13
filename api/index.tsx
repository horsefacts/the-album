import { Button, Frog, TextInput, parseEther } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/vercel";
import { abi } from "../lib/abi.js";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.transaction("/buy", (c) => {
  const { address } = c;
  return c.contract({
    abi,
    chainId: "eip155:8453",
    functionName: "purchase",
    args: [1n, address as `0x${string}`],
    to: "0x0615cfa29ab591299f52211c1df7a89526c9f36a",
    value: parseEther("0.00028"),
    attribution: true
  });
});

app.frame("/", (c) => {
  return c.res({
    image: "https://thealbum.com/og-image.png",
    intents: [<Button.Transaction target="/buy" action="/complete">Buy Album</Button.Transaction>],
  });
});

app.frame("/complete", (c) => {
  const { transactionId } = c;
  const explorerUrl = `https://basescan.org/tx/${transactionId}`;
  return c.res({
    image: "https://thealbum.com/og-image.png",
    intents: [<Button.Link href={explorerUrl}>View on Basescan</Button.Link>,
      <Button.Link href="https://www.thealbum.com/leaderboard">Leaderboard</Button.Link>
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
