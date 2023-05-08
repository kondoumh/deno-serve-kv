import { serve } from "server";

const BOOK_ROUTE = new URLPattern({ pathname: "/books/:isbn" });

const kv = await Deno.openKv();

await kv.set(["books", "978-1-09-123456-2"], { title: "The Great Gatsby", author: "F. Scott Fitzgerald" });
await kv.set(["books", "978-1-09-123456-3"], { title: "The Grapes of Wrath", author: "John Steinbeck" });
await kv.set(["books", "978-1-09-123456-4"], { title: "Nineteen Eighty-Four", author: "George Orwell" }); 

async function handler(req: Request): Promise<Response> {
  const match = BOOK_ROUTE.exec(req.url);
  if (match) {
    const isbn = match.pathname.groups.isbn;
    console.log(isbn);
    const res = await kv.get(["books", isbn]);
    if (res.value) {
      return new Response(JSON.stringify(res.value), { status: 200 });
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response("Not found", { status: 404 });
}

console.log("Listening on http://localhost:8000");
serve(handler);
