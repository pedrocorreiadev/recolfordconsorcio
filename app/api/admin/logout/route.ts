export function POST() {
  return Response.json(
    {
      archived: true,
      error: "A sessão administrativa foi desativada porque o projeto ficou somente no front.",
    },
    { status: 410 },
  );
}
