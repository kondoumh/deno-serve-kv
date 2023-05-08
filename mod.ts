import { serve } from "server";

const BOOKS = new URLPattern({ pathname: "/books" });
const BOOKS_ISBN = new URLPattern({ pathname: "/books/:isbn" });

const kv = await Deno.openKv();

await kv.set(["books", "978-1-09-123456-2"], { title: "The Great Gatsby", author: "F. Scott Fitzgerald" });
await kv.set(["books", "978-1-09-123456-3"], { title: "The Grapes of Wrath", author: "John Steinbeck" });
await kv.set(["books", "978-1-09-123456-4"], { title: "Nineteen Eighty-Four", author: "George Orwell" }); 

async function handler(req: Request): Promise<Response> {
  const machIsbn = BOOKS_ISBN.exec(req.url);
  const matchBooks = BOOKS.exec(req.url);

  if (machIsbn) {
    const isbn = machIsbn.pathname.groups.isbn;
    const res = await kv.get(["books", isbn]);
    if (res.value) {
      return new Response(JSON.stringify(res.value), { status: 200 });
    }
    return new Response("Not found", { status: 404 });
  } else if (matchBooks) {
    if (req.method === "POST") {
      const body = await req.json();
      const res = await kv.set(["books", body.isbn], { title: body.title, author: body.author });
      return new Response(res.versionstamp, { status: 201 });
    } else if (req.method === "GET") {
      const iter = await kv.list({ prefix: ["books"] }, { limit: 100 });
      const books = [];
      for await (const res of iter) {
        books.push(res.value);
      }
      return new Response(JSON.stringify(books), { status: 200 });
    }
  }

  return new Response("Not found", { status: 404 });
}

console.log("Listening on http://localhost:8000");
serve(handler);
