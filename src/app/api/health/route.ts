export async function GET() {
  return Response.json({
    status: "ok",
    service: "nabda-ai",
    time: new Date().toISOString(),
  });
}
