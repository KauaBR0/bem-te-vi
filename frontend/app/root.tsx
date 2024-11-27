import {
  Links,
  Meta,
  Outlet,
  Scripts,
  Link
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen">
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
